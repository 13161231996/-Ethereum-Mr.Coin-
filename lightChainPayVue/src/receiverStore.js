import Vue from 'vue'
import Vuex from 'vuex'
import FormData from 'form-data'
import axios from 'axios'
import * as CryptoUtil from './CryptoUtil'
import * as CryptoHelper from './CryptoHelper'
import * as DataTransfer from './DataTransfer'
import { channelFunctions } from './ethFunctions'
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
        senderEthAccounts: [],
        trustedWalletSummaries: [],
        channelRequests: [],
        channels: [],

        signalrConnected: false,
        accountsUnlocked: true,
        errorMessage: "",
    },
    getters: {
        getTokenConfiguration: (state) => (tokenCode) => {
            let tokenConfigurations = state.tokenConfigurations.filter(tc =>
                tc.code == tokenCode);
            if (tokenConfigurations.length > 0) {
                return tokenConfigurations[0];
            }
            return null;
        }
    },
    mutations: {
        setReceiverData(state, receiverData) {
            state.userName = receiverData.userName;
            state.chainId = receiverData.chainId;

            state.tokenConfigurations = receiverData.tokenConfigurations;

            state.ethKey = receiverData.ethKey;
            receiverData.ethAccounts.forEach(ea => ea.privateKey = null);
            state.ethAccounts = receiverData.ethAccounts;
            state.senderEthAccounts = receiverData.senderEthAccounts;

            receiverData.trustedWalletSummaries = [];
            receiverData.trustedWalletSummaries.forEach(tws =>
                state.trustedWalletSummaries.push(
                    DataTransfer.toClientTrustedWalletSummaryData(tws, state.exchangeRates)));

            receiverData.channelRequests.forEach(cr =>
                state.channelRequests.push(DataTransfer.toClientChannelRequestData(cr)));

            receiverData.channels.forEach(c =>
                state.channels.push(DataTransfer.toClientChannelData(c)));
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

            state.accountsUnlocked = true;
        },
        addOrReplaceChannelRequest(state, channelRequest) {
            channelRequest = DataTransfer
                .toClientChannelRequestData(channelRequest);
            let index = state.channelRequests
                .findIndex(cr => cr.id == channelRequest.id);
            if (index == -1) {
                state.channelRequests.unshift(channelRequest);
            }
            else {
                state.channelRequests.splice(index, 1, channelRequest);
            }
        },
        addOrReplaceChannel(state, channel) {
            channel = DataTransfer.toClientChannelData(channel);
            let index = state.channels.findIndex(c => c.id == channel.id);
            if (index == -1) {
                state.channels.unshift(channel);
            }
            else {
                let orgiChannel = state.channels[index];
                if (channel.payments.length == 1) {
                    var newPayment = channel.payments[0];
                    var payments = orgiChannel.payments;
                    var insertIndex = 0;
                    var replaced = false;
                    for (var i in payments) {
                        var p = orgiChannel.payments[i];
                        if (p.id == newPayment.id) {
                            payments.splice(i, 1, newPayment);
                            replaced = true;
                            break;
                        }
                        if (p.id < newPayment.id) {
                            insertIndex++;
                        }
                    }
                    if (!replaced) {
                        payments.splice(insertIndex, 0, newPayment);
                    }
                    channel.payments = payments;
                }
                state.channels.splice(index, 1, channel);
            }
        },
        setChannelReceiverClosingSignature(state, payload) {
            let channels = state.channels.filter(c =>
                c.id == payload.channelId);
            if (channels.length > 0) {
                channels[0].receiverClosingSignature = payload.signature;
            }
        },
        setSignalrConnectState(state, connected) {
            state.signalrConnected = connected;
        }
    },
    actions: {
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
        importPrivateKey: async function (context, payload) {
            let iv = CryptoUtil.generateIV();
            let privateKeyCipherText = CryptoUtil.encryptAES(
                payload.privateKey, payload.encKey, iv);
            let address = CryptoUtil.privateKeyToAddress(payload.privateKey);

            try {
                let ethAccount = (await axios.post('/api/EthAccounts/CreateEthAccount', {
                    Address: address,
                    PrivateKeyCipherText: privateKeyCipherText.toString('hex'),
                    InitialVector: iv.toString('hex')
                })).data;
                ethAccount.privateKey = payload.privateKey;
                context.commit('addEthAccount', ethAccount);
                return Promise.resolve();
            }
            catch {
                return Promise.reject("导入账户时服务器出错.");
            }
        },
        requestChannel: async function (context, payload) {
            let formData = new FormData();
            formData.append('senderEthAccountId', payload.senderEthAccountId);
            formData.append('myEthAccountId', payload.myEthAccountId);
            formData.append('chainId', payload.chainId);
            formData.append('tokenCode', payload.tokenCode);
            formData.append('decimals', payload.decimals);
            formData.append('amountText', payload.amountText);

            try {
                await axios({
                    method: 'post',
                    url: '/api/Channels/RequestChannel',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });
                return Promise.resolve();
            }
            catch {
                return Promise.reject("服务器发生错误。");
            }
        },
        rejectChannelRequest: async function () {
            return Promise.reject("角色错误。");
        },
        createPayment: async function (context, payload) {
            let formData = new FormData();
            formData.append('channelId', payload.channelId);
            formData.append('orderNumber', payload.orderNumber);
            formData.append('customerId', payload.customerId);
            formData.append('commodityName', payload.commodityName);
            formData.append('payMethod', payload.payMethod);
            formData.append('payInterface', payload.payInterface);
            formData.append('currencyPrice', payload.currencyPrice);

            try {
                await axios({
                    method: 'post',
                    url: '/api/Channels/CreatePayment',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });
                return Promise.resolve();
            }
            catch {
                return Promise.reject("服务器发生错误。");
            }
        },
        receiverRequireSettle: async function (context, channelId) {
            let formData = new FormData();
            formData.append('channelId', channelId);

            try {
                await axios({
                    method: 'post',
                    url: '/api/channels/ReceiverRequireSettle',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });
                return Promise.resolve();
            }
            catch {
                return Promise.reject("服务器发生错误。");
            }
        },
        receiverSettle: async function (context, channel) {
            let accounts = context.state.ethAccounts.filter(
                ea => ea.address == channel.receiverAddress && ea.privateKey != null);
            if (accounts.length < 1) {
                return Promise.reject("没有匹配的已解锁账户。");
            }

            let privateKey = accounts[0].privateKey;
            try {
                let nonceAndGasPrice = (await axios.get(
                    '/api/EthAccounts/GetNonceAndGasPrice?address='
                    + channel.receiverAddress)).data;

                let serializedTx = channelFunctions.getCooperativeCloseTx(
                    privateKey, nonceAndGasPrice.nonce,
                    nonceAndGasPrice.gasPrice, channel);

                let formData = new FormData();
                formData.append('channelId', channel.id);
                formData.append('rawTransaction', serializedTx);

                await axios({
                    method: 'post',
                    url: '/api/Channels/ReceiverSettle',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });
                return Promise.resolve();
            }
            catch {
                return Promise.reject("服务器发生错误。");
            }
        },
        setClosingSignature: async function (context, channel) {
            let accounts = context.state.ethAccounts.filter(
                ea => ea.address == channel.receiverAddress && ea.privateKey != null);
            if (accounts.length < 1) {
                return Promise.reject("内部错误。");
            }
            let account = accounts[0];
            let channelId = channel.id;
            let signature = CryptoHelper.signReceiverClosingProof(channel, account.privateKey);

            let formData = new FormData();

            formData.append('channelId', channelId);
            formData.append('signature', signature);

            try {
                await axios({
                    method: 'post',
                    url: '/api/Channels/SetReceiverClosingSignature',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });

                context.commit('setChannelReceiverClosingSignature',
                    { channelId, signature });
                return Promise.resolve();
            }
            catch {
                return Promise.reject("服务器发生错误。");
            }
        },
        fillChannelWithdrawRawTransaction: async function (
            context, channelWithdrawTx) {

            let channel = channelWithdrawTx.channel;
            let accounts = context.state.ethAccounts.filter(
                ea => ea.address == channel.receiverAddress && ea.privateKey != null);
            if (accounts.length < 1) {
                return Promise.reject("No unlocked account.");
            }

            let nonceAndGasPrice = (await axios.get(
                '/api/EthAccounts/GetNonceAndGasPrice?address='
                + channel.receiverAddress)).data;

            let account = accounts[0];
            let rawTransaction = channelFunctions.getWithdrawTx(
                account.privateKey, nonceAndGasPrice.nonce,
                nonceAndGasPrice.gasPrice, channel);

            let formData = new FormData();

            formData.append('channelWithdrawTxId', channelWithdrawTx.id);
            formData.append('rawTransaction', rawTransaction);

            try {
                await axios({
                    method: 'post',
                    url: '/api/Channels/DoChannelWithdrawTx',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });
                return Promise.resolve();
            }
            catch {
                return Promise.reject("服务器发生错误。");
            }
        }
    }
})
