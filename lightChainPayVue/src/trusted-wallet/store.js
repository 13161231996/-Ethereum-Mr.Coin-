import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import FormData from 'form-data'
import * as signalR from '@aspnet/signalr'
import * as CryptoUtil from '../CryptoUtil'
import * as CryptoHelper from '../CryptoHelper'
import * as DataTransfer from '../DataTransfer'
import ethereumjsUtil from 'ethereumjs-util'

Vue.use(Vuex)

// function asyncSleep(ms) {
//     return new Promise((resolve) => {
//         setTimeout(() => resolve(), ms);
//     });
// }

export default new Vuex.Store({
    state: {
        userName: "",

        chainId: 1,
        tokenConfigurations: [],

        ethKey: null,
        ethAccounts: [],

        exchangeRates: [],
        trustedWalletSummaries: [],
        transaction: null,

        currentDepositRequest: null,

        depositGateway: "",
        recentDepositRequests: [],
        waitingDepositRequestCount: 0,
        depositMessage: "",

        signalrConnection: null,
        signalrConnected: false,
        errorMessage: "",
    },
    getters: {
        getEthAccountByAddress: (state) => (ethAddress) => {
            let ethAccounts = state.ethAccounts.filter(ea => ea.address == ethAddress);
            if (ethAccounts.length > 0) {
                return ethAccounts[0];
            }
            return null;
        },
        getTokenConfiguration: (state) => (tokenCode) => {
            let tokenConfigurations = state.tokenConfigurations.filter(tc =>
                tc.code == tokenCode);
            if (tokenConfigurations.length > 0) {
                return tokenConfigurations[0];
            }
            return null;
        },
        getSenderBalance: (state) => (tokenCode) => {
            let trustedWalletSummaries = state.trustedWalletSummaries.filter(tws =>
                tws.tokenCode == tokenCode);
            if (trustedWalletSummaries.length > 0) {
                return trustedWalletSummaries[0].senderBalanceDisplay;
            }
            return '0';
        },
        getSenderCurrencyBalance: (state) => (tokenCode) => {
            let trustedWalletSummaries = state.trustedWalletSummaries.filter(tws =>
                tws.tokenCode == tokenCode);
            if (trustedWalletSummaries.length > 0) {
                return trustedWalletSummaries[0].senderCurrencyBalance;
            }
            return '0';
        }
    },
    mutations: {
        setClientData(state, clientData) {
            state.userName = clientData.userName;
            state.chainId = clientData.chainId;
            state.tokenConfigurations = clientData.tokenConfigurations;

            state.ethKey = clientData.ethKey;
            state.ethAccounts = clientData.ethAccounts;

            state.exchangeRates = clientData.exchangeRates;

            clientData.trustedWalletSummaries.forEach(tws =>
                state.trustedWalletSummaries.push(DataTransfer
                    .toClientTrustedWalletSummaryData(tws, state.exchangeRates))
            );

            state.transaction = clientData.transaction;

            state.depositGateway = clientData.depositGateway;
            state.recentDepositRequests = clientData.recentDepositRequests;
            state.waitingDepositRequestCount = clientData.waitingDepositRequestCount;
        },
        updateClientData(state, clientData) {
            state.trustedWalletSummaries = [];

            clientData.trustedWalletSummaries.forEach(tws =>
                state.trustedWalletSummaries.push(DataTransfer
                    .toClientTrustedWalletSummaryData(tws, state.exchangeRates))
            );

            state.recentDepositRequests = clientData.recentDepositRequests;
            state.waitingDepositRequestCount = clientData.waitingDepositRequestCount;
        },
        setCurrentDepositRequest(state, depositRequest) {
            state.depositMessage = "";
            state.currentDepositRequest = depositRequest;
        },
        updateDepositRequest(state, depositRequest) {
            if (state.currentDepositRequest
                && state.currentDepositRequest.id == depositRequest.id) {
                if (depositRequest.status == "Paid") {
                    state.depositMessage = "您的充值已经成功。";
                    state.currentDepositRequest = null;
                }
                else {
                    state.currentDepositRequest = depositRequest;
                }
            }
        },
        setEthKey(state, ethKey) {
            state.ethKey = ethKey;
        },
        setErrorMessage(state, errMsg) {
            state.errorMessage = errMsg;
        },
        addEthAccount(state, ethAccount) {
            state.ethAccounts.push(ethAccount);
        },
        unlockAccounts(state, encKey) {
            for (let i in state.ethAccounts) {
                let ea = state.ethAccounts[i];
                let payload = CryptoUtil.hexToBuffer(ea.privateKeyCipherText);
                let iv = CryptoUtil.hexToBuffer(ea.initialVector);
                let privateKey = CryptoUtil.decryptAES(
                    payload, encKey, iv);

                state.ethAccounts[i].privateKey = privateKey;
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
                    if (window.clientData) {
                        await connection.start();
                    }
                    context.commit('setSignalrConnectState', true);
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
                // console.log("Deposit finished.");
                // console.log(depositRequest);
                context.commit('updateDepositRequest', depositRequest);
                context.dispatch('updateTrustedWalletData');
            });

            start();
        },
        createEthKey: async function (context, ethKeyPassword) {
            let iterations = 2000 + Math.ceil(Math.random() * 1000);
            let salt = CryptoUtil.generateIV();
            let key = CryptoUtil.stretchPassword(ethKeyPassword,
                salt, iterations);
            let signature = ethereumjsUtil.keccak(key, 256);

            try {
                let ethKey = (await axios.post('/api/EthAccounts/CreateEthKey', {
                    Salt: salt.toString('hex'),
                    Pbkdf2Iterations: iterations,
                    Signature: signature.toString('hex')
                })).data;
                context.commit('setEthKey', ethKey);
                return Promise.resolve(ethKey);
            }
            catch {
                return Promise.reject("设置资金密码时出错.");
            }
        },
        generateEthAccount: async function (context, encKey) {
            let iv = CryptoUtil.generateIV();
            let privateKey = CryptoUtil.generateECPrivateKey();
            let privateKeyCipherText = CryptoUtil.encryptAES(privateKey, encKey, iv);
            let address = CryptoUtil.privateKeyToAddress(privateKey);

            try {
                let ethAccount = (await axios.post('/api/EthAccounts/CreateEthAccount', {
                    Address: address,
                    PrivateKeyCipherText: privateKeyCipherText.toString('hex'),
                    InitialVector: iv.toString('hex')
                })).data;
                ethAccount.privateKey = privateKey;
                context.commit('addEthAccount', ethAccount);
                return Promise.resolve(ethAccount);
            }
            catch {
                return Promise.reject("导入账户时服务器出错.");
            }
        },
        walletPay: async function (context, payload) {
            let tokenSummary = payload.tokenSummary;
            let ethAccount = context.getters.getEthAccountByAddress(tokenSummary.address);

            let cipherKey = CryptoUtil.hexToBuffer(ethAccount.privateKeyCipherText);
            let iv = CryptoUtil.hexToBuffer(ethAccount.initialVector);
            let privateKey = CryptoUtil.decryptAES(cipherKey, payload.encKey, iv);

            let tokenConfiguration = context.getters.getTokenConfiguration(tokenSummary.tokenCode);
            let transaction = { ...payload.transaction };
            transaction.walletAddress = tokenConfiguration.walletManagerAddress;
            let signature = CryptoHelper.signWalletPay(transaction, privateKey);

            let formData = new FormData();
            formData.append('transactionId', payload.transaction.id);
            formData.append('summaryId', tokenSummary.id);
            formData.append('signature', signature);

            try {
                let transaction = (await axios({
                    method: 'post',
                    url: '/api/TrustedWallet/Pay',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                })).data;
                return Promise.resolve(transaction);
            }
            catch {
                return Promise.reject("支付失败.");
            }
        },
        updateTrustedWalletData: async function (context) {
            try {
                let url = '/api/TrustedWallet/GetTrustedWalletData';
                url = url + '?chainId=' + context.state.chainId;
                let clientData = (await axios(url)).data;

                context.commit('updateClientData', clientData);

                return Promise.resolve();
            }
            catch {
                return Promise.reject();
            }
        },
        login: async function (context, payload) {
            let formData = new FormData();
            formData.append("userName", payload.userName);
            formData.append("password", payload.password);
            formData.append("transactionId", payload.transactionId);

            try {
                let result = (await axios({
                    method: "post",
                    url: "/api/Identity/TrustedWalletLogin",
                    data: formData,
                    config: {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" }
                    }
                })).data;
                if (result.succeeded) {
                    context.commit('setClientData', result.clientData);
                    return Promise.resolve();
                } else {
                    return Promise.reject("登录失败.");
                }
            } catch (e) {
                return Promise.reject("登录失败.");
            }
        },
        register: async function (context, payload) {
            let formData = new FormData();
            formData.append('userName', payload.userName);
            formData.append('email', payload.email);
            formData.append('password', payload.password);
            formData.append('transactionId', payload.transactionId);
            try {
                let result = (await axios({
                    method: 'post',
                    url: '/api/Identity/TrustedWalletRegister',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                })).data;
                if (result.succeeded) {
                    context.commit('setClientData', result.clientData);
                    return Promise.resolve();
                } else {
                    return Promise.reject(result.errors);
                }
            }
            catch {
                return Promise.reject("服务器出现问题，注册失败.");
            }
        },
        logout: async function () {
            try {
                await axios({
                    method: 'post',
                    url: '/api/Identity/Logout'
                });

                return Promise.resolve();
            }
            catch {
                return Promise.reject("服务器端出现错误.");
            }
        }
    }
})
