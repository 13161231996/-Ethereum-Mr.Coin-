import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import * as signalR from '@aspnet/signalr'

Vue.use(Vuex)

// function asyncSleep(ms) {
//     return new Promise((resolve) => {
//         setTimeout(() => resolve(), ms);
//     });
// }

export default new Vuex.Store({
    state: {
        userName: "",

        depositRequests: [],

        signalrConnection: null,
        signalrConnected: false,
        errorMessage: "",
    },
    mutations: {
        setDepositRequests(state, depositRequests) {
            state.depositRequests = depositRequests;
        },
        updateDepositRequest(state, depositRequest) {
            let index = state.depositRequests
                .findIndex(dr => dr.id == depositRequest.id);
            if (index == -1) {
                state.depositRequests.unshift(depositRequest);
            }
            else {
                state.depositRequests.splice(index, 1, depositRequest);
            }
        },
        setSignalrConnection(state, connection) {
            state.signalrConnection = connection;
        },
        setSignalrConnectState(state, connected) {
            state.signalrConnected = connected;
        }
    },
    actions: {
        connectSignalR: async function (context) {
            if (context.state.signalrConnection) {
                return;
            }

            var connection = new signalR.HubConnectionBuilder().withUrl("/channelHub").build();

            async function start() {
                try {
                    context.commit('setSignalrConnection', connection);
                    await connection.start();
                    context.commit('setSignalrConnectState', true);
                    context.dispatch('getWaitingDepositRequests');
                } catch {
                    context.commit('setSignalrConnectState', false);
                    setTimeout(() => start(), 5000);
                }
            }

            connection.onclose(async () => {
                context.commit('setSignalrConnectState', false);
                await start();
            });

            connection.on('TrustedWalletDepositRequestChanged', (depositRequest) => {
                context.commit('updateDepositRequest', depositRequest);                
            });

            start();
        },
        getWaitingDepositRequests: async function (context) {
            try {
                let url = '/api/TrustedWallet/GetWaitingDepositRequests';
                let depositRequests = (await axios(url)).data;

                context.commit('setDepositRequests', depositRequests);

                return Promise.resolve();
            }
            catch {
                return Promise.reject();
            }
        }
    }
})
