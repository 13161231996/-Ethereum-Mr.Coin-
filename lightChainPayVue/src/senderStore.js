import Vue from 'vue'
import Vuex from 'vuex'
import * as CryptoUtil from './CryptoUtil'
import * as CryptoHelper from './CryptoHelper'
import axios from 'axios'
import qs from 'qs'
import BigNumber from 'bignumber.js'
import { tokenFunctions, channelFunctions, trustedWalletsFunctions } from './ethFunctions'
import * as DataTransfer from './DataTransfer'

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
        paysApiAccounts: [],
        trustedWalletSummaries: [],
        channelRequests: [],
        channels: [],

        withdrawData: {
            active: false,
            ethAddress: "0x0",
            trustedWalletSummary: {}
        },

        signalrConnected: false,
        accountsUnlocked: false,
        errorMessage: "",
        withDialogVisible: ''
    },
    getters: {
        getTokenConfiguration: (state) => (tokenCode) => {
            let tokenConfigurations = state.tokenConfigurations.filter(tc =>
                tc.code == tokenCode);
            if (tokenConfigurations.length > 0) {
                return tokenConfigurations[0];
            }
            return null;
        },
        getChannelAndEthAccountForPayment: (state) => (payment) => {
            let result = { channel: null, account: null };
            let channels = state.channels.filter(
                c => c.id == payment.channelId);
            if (channels.length < 1) {
                return result;
            }

            let channel = channels[0];
            let accounts = state.ethAccounts.filter(
                ea => ea.address == channel.senderAddress && ea.privateKey != null);
            if (accounts.length < 1) {
                return result;
            }

            return { channel: { ...channel }, account: accounts[0] }
        }
    },
    mutations: {
        setSenderData(state, senderData) {
            state.userName = senderData.userName;
            state.chainId = senderData.chainId;
            state.tokenConfigurations = senderData.tokenConfigurations;

            state.ethKey = senderData.ethKey;
            senderData.ethAccounts.forEach(ea => ea.privateKey = null);
            state.ethAccounts = senderData.ethAccounts;
            state.exchangeRates = senderData.exchangeRates;
            //state.trustedWalletSummaries = senderData.trustedWalletSummaries;

            senderData.trustedWalletSummaries.forEach(tws =>
                state.trustedWalletSummaries.push(
                    DataTransfer.toClientTrustedWalletSummaryData(tws, state.exchangeRates)));

            senderData.paysApiAccounts.forEach(paa => paa.token = null);
            state.paysApiAccounts = senderData.paysApiAccounts;

            senderData.channelRequests.forEach(cr =>
                state.channelRequests.push(DataTransfer.toClientChannelRequestData(cr)));

            senderData.channels.forEach(c =>
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
        addPaysApiAccount(state, paysApiAccount) {
            state.paysApiAccounts.push(paysApiAccount);
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
            for (let i in state.paysApiAccounts) {
                let ppa = state.paysApiAccounts[i];
                let payload = CryptoUtil.hexToBuffer(ppa.tokenCipherText);
                let iv = CryptoUtil.hexToBuffer(ppa.initialVector);
                let token = CryptoUtil.decryptAES(
                    payload, encKey, iv);

                state.paysApiAccounts[i].token = CryptoUtil.bufferToString(token);
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
                let origChannel = state.channels[index];
                if (channel.payments.length == 1) {
                    var newPayment = channel.payments[0];
                    var payments = origChannel.payments;
                    var insertIndex = 0;
                    var replaced = false;
                    for (var i in payments) {
                        var p = payments[i];
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
        setWithdrawData(state, withdrawData) {
            //console.log(withdrawData);
            state.withdrawData = withdrawData;
        },
        setSignalrConnectState(state, connected) {
            state.signalrConnected = connected;
        }
    },
    actions: {
        createEthKey: async function (context, ethKeyPassword) {
            let iterations = 5000 + Math.ceil(Math.random() * 10000);
            let salt = CryptoUtil.generateECPrivateKey();
            let key = CryptoUtil.stretchPassword(ethKeyPassword,
                salt, iterations);

            let msg = CryptoUtil.stringToBuffer(context.state.userName);
            let signature = CryptoUtil.hashAndSignMessage(msg, key);

            let formData = {
                'salt': salt.toString('hex'),
                'pbkdf2Iterations':  iterations,
                'signature': signature,
            };

            try {
                let ethKey = (await axios({
                    method: 'post',
                    url: '/api/EthAccounts/CreateEthKey',
                    data: qs.stringify(formData),
                    //config: { headers: { 'Content-Type': 'multipart/form-data' } }
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
        importPaysApiAccount: async function (context, payload) {
            let iv = CryptoUtil.generateIV();
            let token = CryptoUtil.stringToBuffer(payload.token).toString('hex');
            let tokenCipherText = CryptoUtil.encryptAES(
                token, payload.encKey, iv);

            let formData = {
                'uid': payload.uid,
                'tokenCipherText': tokenCipherText.toString('hex'),
                'initialVector': iv.toString('hex'),
            };

            try {
                var paysApiAccount = (await axios({
                    method: 'post',
                    url: '/api/EthAccounts/CreatePaysApiAccount',
                    data: qs.stringify(formData),
                    config: { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                })).data;
                context.commit('addPaysApiAccount', paysApiAccount);
                return Promise.resolve();
            }
            catch {
                return Promise.reject("服务器发生错误。");
            }
        },
        rejectChannelRequest: async function (context, channelRequestId) {
            let formData = new FormData();
            formData.append('channelRequestId', channelRequestId);

            try {
                await axios({
                    method: 'post',
                    url: '/api/Channels/RejectChannelCreatRequest',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });
                return Promise.resolve();
            }
            catch {
                return Promise.reject("服务器发生错误。");
            }
        },
        withDraw: async function (context, withdrawData) {

            let tokenCode = withdrawData.trustedWalletSummary.tokenCode;
            let withdrawValue = withdrawData.withdrawValue;
            let senderAddress = withdrawData.ethAddress;


            let result = null;
            let tokenConfiguration = context.getters.getTokenConfiguration(tokenCode);

            //get balance and sig
            try {
                let url = '/api/TrustedWallet/GetTrustedWalletSignature?address=';
                url += senderAddress + '&tokenCode=' + tokenCode;
                result = (await axios.get(url)).data;
            }
            catch {
                return Promise.reject("创建提现通道时服务器发生错误。");
            }
            //console.log('result', result);

            let sig = result.trustedWalletSummary.receiverBalanceProofSignature;
            let balance = result.trustedWalletSummary.receivedValueText;
            /*
            console.log('tokenCode',tokenCode);
            console.log('senderAddress',senderAddress);
            console.log('withdrawValue',withdrawData.withdrawValue);
            console.log('sig', sig);
            console.log('balance', balance);
            */

            // get nonce
            try {
                let nonceAndGasPrice = (await axios.get(
                    '/api/EthAccounts/GetNonceAndGasPrice?address='
                    + senderAddress)).data;


                let accounts = context.state.ethAccounts.filter(
                    ea => ea.address == senderAddress && ea.privateKey != null);
                if (accounts.length < 1) {
                    return Promise.reject("没有匹配的已解锁账户。");
                }
                let privateKey = accounts[0].privateKey;
                let bWithdrawValue = new BigNumber(withdrawValue.toString());
                bWithdrawValue = bWithdrawValue.shift(+ withdrawData.trustedWalletSummary.decimals).toString();

                let serializedTx = trustedWalletsFunctions.getWithdrawTx(
                    privateKey, nonceAndGasPrice.nonce, nonceAndGasPrice.gasPrice,
                    tokenConfiguration, bWithdrawValue.toString(), balance.toString(), sig);

                //console.log('serializedTx:' + serializedTx);
                let formData = new FormData();

                formData.append('userName', context.state.userName);
                formData.append('tokenCode', tokenCode);
                formData.append('decimals', tokenConfiguration.decimals);
                formData.append('withdrawValue', bWithdrawValue.toString());
                formData.append('balance', balance);
                formData.append('signature', sig);
                formData.append('rawTransaction', serializedTx);

                await axios({
                    method: 'post',
                    url: '/api/TrustedWallet/WithDraw',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });
            }
            catch {
                return Promise.reject("提现时服务器发生错误。");
            }


            return Promise.resolve();

        },
        quickCreateChannel: async function (context, payload) {
            let senderEthAccount = payload.senderEthAccount;
            let receiverEthAccount = payload.receiverEthAccount;
            if (senderEthAccount.privateKey == null) {
                return Promise.reject("请先解锁账户。");
            }

            let result = null;
            var tokenCode = senderEthAccount.autoChannelToken;
            let tokenConfiguration = context.getters.getTokenConfiguration(tokenCode);
            try {
                let url = '/api/EthAccounts/PrepareTransferToManagerContract?sender=';
                url += senderEthAccount.address
                    + '&tokenAddress=' + tokenConfiguration.address
                    + '&managerAddress=' + tokenConfiguration.channelManagerAddress;
                result = (await axios.get(url)).data;
            }
            catch {
                return Promise.reject("创建支付通道时服务器发生错误。");
            }

            let balance = new BigNumber(result.balance);
            let allowance = new BigNumber(result.allowance);
            let tokenAmount = new BigNumber(senderEthAccount.autoChannelValueMax);
            tokenAmount = tokenAmount.shift(tokenConfiguration.decimals);

            if (balance.lt(tokenAmount)) {
                return Promise.reject("账户余额不足。");
            }

            let privateKey = senderEthAccount.privateKey;
            let nonce = result.nonce;
            let gasPrice = result.gasPrice;
            try {
                if (allowance.lt(tokenAmount)) {
                    if (allowance.gt(0)) {
                        let zeroTx = tokenFunctions
                            .getApproveTx(privateKey, nonce, gasPrice, tokenConfiguration, "0");
                        result = (await axios.get('/api/EthAccounts/SendRawTransaction?rawTransaction='
                            + zeroTx)).data;
                        nonce++;
                    }

                    let serializedTx = tokenFunctions.getApproveTx(
                        privateKey, nonce, gasPrice, tokenConfiguration, tokenAmount.toString());
                    result = (await axios.get('/api/EthAccounts/SendRawTransaction?rawTransaction='
                        + serializedTx)).data;
                    nonce++;
                }

                let serializedTx = channelFunctions.getQuickCreateChannelTx(
                    privateKey, nonce, gasPrice, tokenConfiguration,
                    tokenAmount.toString(), receiverEthAccount.address);

                let formData = new FormData();
                formData.append('senderEthAccountId', senderEthAccount.id);
                formData.append('receiverEthAccountId', receiverEthAccount.id);
                formData.append('tokenConfigurationId', tokenConfiguration.id);
                formData.append('amountText', tokenAmount.toString());
                formData.append('rawTransaction', serializedTx);

                await axios({
                    method: 'post',
                    url: '/api/Channels/QuickCreateChannel',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });
            }
            catch {
                return Promise.reject("创建支付通道时服务器发生错误。");
            }
            return Promise.resolve();
        },
        createChannel: async function (context, channelRequest) {
            let result = null;
            let tokenConfiguration = context.getters.getTokenConfiguration(channelRequest.tokenCode);
            try {
                let url = '/api/EthAccounts/PrepareTransferToManagerContract?sender=';
                url += channelRequest.senderAddress
                    + '&tokenAddress=' + tokenConfiguration.address
                    + '&managerAddress=' + tokenConfiguration.channelManagerAddress;
                result = (await axios.get(url)).data;
            }
            catch {
                return Promise.reject("创建支付通道时服务器发生错误。");
            }

            let balance = new BigNumber(result.balance);
            let allowance = new BigNumber(result.allowance);
            let crAmount = new BigNumber(channelRequest.amountText);

            if (balance.lt(crAmount)) {
                return Promise.reject("账户余额不足。");
            }

            let accounts = context.state.ethAccounts.filter(
                ea => ea.address == channelRequest.senderAddress && ea.privateKey != null);
            if (accounts.length < 1) {
                return Promise.reject("没有匹配的已解锁账户。");
            }
            let privateKey = accounts[0].privateKey;

            let nonce = result.nonce;
            let gasPrice = result.gasPrice;
            try {
                if (allowance.lt(crAmount)) {
                    if (allowance.gt(0)) {
                        let zeroTx = tokenFunctions
                            .getApproveTx(privateKey, nonce, gasPrice, tokenConfiguration, "0");
                        result = (await axios.get('/api/EthAccounts/SendRawTransaction?rawTransaction='
                            + zeroTx)).data;
                        nonce++;
                    }

                    let serializedTx = tokenFunctions.getApproveTx(
                        privateKey, nonce, gasPrice, tokenConfiguration, channelRequest.amountText);
                    result = (await axios.get('/api/EthAccounts/SendRawTransaction?rawTransaction='
                        + serializedTx)).data;
                    nonce++;
                }

                let serializedTx = channelFunctions.getCreateChannelTx(
                    privateKey, nonce, gasPrice, tokenConfiguration, channelRequest);
                let formData = new FormData();
                formData.append('channelRequestId', channelRequest.id);
                formData.append('rawTransaction', serializedTx);

                await axios({
                    method: 'post',
                    url: '/api/Channels/CreateChannel',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });
            }
            catch {
                return Promise.reject("创建支付通道时服务器发生错误。");
            }
            return Promise.resolve();
        },
        makeEscrow: async function (context, payment) {
            let { channel, account } = context.getters
                .getChannelAndEthAccountForPayment(payment);
            if (!channel || !account) {
                return Promise.reject("内部错误。");
            }

            channel.totalEscrowed = channel.totalEscrowed.plus(payment.amount);
            let signature = CryptoHelper.signSenderProof(channel, account.privateKey);

            let formData = new FormData();
            formData.append('paymentId', payment.id);
            formData.append('signature', signature);

            let url = "/api/Channels/MakeEscrow";
            if (payment.payInterface == "PaysApi") {
                url = "/api/Channels/MakeEscrowPaysApi"
                let paysApiParams = null;
                if (context.state.paysApiAccounts.length > 0) {
                    let uid = context.state.paysApiAccounts[0].uid;
                    let token = context.state.paysApiAccounts[0].token;
                    paysApiParams = CryptoHelper.signPaysApi(payment, uid, token);
                }
                if (!paysApiParams) {
                    return Promise.reject("未找到法币收款账户，请导入PaysAPI账户。");
                }
                formData.append('payUserId', paysApiParams.uid);
                formData.append('notifyUrl', paysApiParams.notifyUrl);
                formData.append('returnUrl', paysApiParams.returnUrl);
                formData.append('paysApiSignature', paysApiParams.signature);
            }

            try {
                await axios({
                    method: 'post',
                    url: url,
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });
                return Promise.resolve();
            }
            catch {
                return Promise.reject("执行托管时服务器发生错误。");
            }
        },
        releaseEscrow: async function (context, payment) {
            let { channel, account } = context.getters
                .getChannelAndEthAccountForPayment(payment);
            if (!channel || !account) {
                return Promise.reject("内部错误。");
            }

            channel.totalEscrowed = channel.totalEscrowed.minus(payment.amount);
            channel.totalReleased = channel.totalReleased.plus(payment.amount);
            let signature = CryptoHelper.signSenderProof(channel, account.privateKey);

            let formData = new FormData();
            formData.append('paymentId', payment.id);
            formData.append('signature', signature);

            try {
                await axios({
                    method: 'post',
                    url: "/api/Channels/ReleaseEscrow",
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                });
                return Promise.resolve();
            }
            catch {
                return Promise.reject("执行托管时服务器发生错误。");
            }
        },
        receiverRequireSettle: async function () {
            return Promise.reject("角色错误。");
        },
        receiverSettle: async function () {
            return Promise.reject("角色错误。");
        },
        setClosingSignature: async function (context, channel) {
            let accounts = context.state.ethAccounts.filter(
                ea => ea.address == channel.senderAddress && ea.privateKey != null);
            if (accounts.length < 1) {
                return Promise.reject("内部错误。");
            }
            let account = accounts[0];
            let signature = CryptoHelper.signSenderClosingProof(channel, account.privateKey);

            let formData = new FormData();
            formData.append('channelId', channel.id);
            formData.append('signature', signature);

            try {
                await axios({
                    method: 'post',
                    url: "/api/Channels/SetSenderClosingSignature",
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
