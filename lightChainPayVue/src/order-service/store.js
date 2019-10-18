import Vue from 'vue'
import Vuex from 'vuex'
import qs from 'qs'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import ethereumjsUtil from 'ethereumjs-util'
import * as signalR from '@aspnet/signalr'
import * as CryptoUtil from '../CryptoUtil'
import * as CryptoHelper from '../CryptoHelper'
import { tokenFunctions, channelFunctions } from '../ethFunctions'
import * as DataTransfer from '../DataTransfer'
import { stat } from 'fs';

Vue.use(Vuex)

// function asyncSleep(ms) {
//     return new Promise((resolve) => {
//         setTimeout(() => resolve(), ms);
//     });
// }

export default new Vuex.Store({
    state: {
        bearerToken: "",
        userName: "",

        chainId: 1,
        tokenConfigurations: [],

        ethKey: null,
        ethAccounts: [],

        senderChannelRequests: [],
        senderChannels: [],

        receiverChannelRequests: [],
        receiverChannels: [],
        BeforeSortedChanners:[],
        AfterSortedChanners:[],


        channelStates: [],

        signalrConnection: false,
        signalrConnected: false,
        accountsUnlocked: false,

        errorMessage: "",
        userProfileData: [],
        appAlipayAccount: [],
        userData:"",
        orderDatas:[],
        only:1,
        logTableData:[],
        totalLogNumber:"",
        logTableVisible:false,
        totalPage:1,
        currentPage:1,
        totalnumber:0,
        paginationData:[],
        recode:1
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
        },
        isChannelOnline: (state) => (channelId) => {
            let channelStates = state.channelStates.filter(
                cs =>cs.channelId == channelId);
            if (channelStates.length < 1) {
                return false;
            }
    

            return channelStates[0].isOnline;
        },
    },
    mutations: {
        setBearerToken(state, bearerToken) {
            state.bearerToken = bearerToken;
        },
        setClientData(state, clientData) {
            state.userName = clientData.userName;
            state.chainId = clientData.chainId;

            if (!clientData.userName) {
                return;
            }

            state.tokenConfigurations = clientData.tokenConfigurations;

            state.ethKey = clientData.ethKey;
            clientData.ethAccounts.forEach(ea => ea.privateKey = null);
            state.ethAccounts = clientData.ethAccounts;
            state.exchangeRates = clientData.exchangeRates;

            clientData.senderChannelRequests.forEach(cr =>
                state.senderChannelRequests.push(
                    DataTransfer.toClientChannelRequestData(cr)));

            clientData.senderChannels.forEach(c =>
                state.senderChannels.push(DataTransfer.toClientChannelData(c)));

            clientData.receiverChannelRequests.forEach(cr =>
                state.receiverChannelRequests.push(
                    DataTransfer.toClientChannelRequestData(cr)));

            clientData.receiverChannels.forEach(c =>
                state.receiverChannels.push(DataTransfer.toClientChannelData(c)));
            state.BeforeSortedChanners=state.receiverChannels
            
            for(let i of state.BeforeSortedChanners){
                for(let j of i.payments){
                    j["adminPaused"]=i.adminPaused
                    j["senderUserName"]=i.senderUserName
                    j["senderUserId"]=i.senderUserId
                    j["senderAddress"]=i.senderAddress
                    j["receiverAddress"]=i.receiverAddress
                    j["depositDisplay"]=i.depositDisplay
                    j["recestatus"]=i.status
                    j["totalEscrowedDisplay"]=i.totalEscrowedDisplay
                    j["totalReleasedDisplay"]=i.totalReleasedDisplay
                    state.AfterSortedChanners.push(j)
                }
                
                
            }
            state.AfterSortedChanners.sort((a,b)=>b.createTime.localeCompare(a.createTime));
            var userData=  state.userData;
            for (let i of state.AfterSortedChanners){
                i["payRobots"]=userData.filter(ud=>ud.userName==i.senderUserName&&ud.status=="Running"&&ud.suspended==false)
            }
            for (let i of state.AfterSortedChanners){
                i["userProfile"]=state.userProfileData.filter(it=>it.userName==i.senderUserName)
            }
           this.commit("pagination");
        },
        pagination(state){
            // 总条数
            state.totalnumber=state.AfterSortedChanners.length;
            var countpage = Math.ceil(state.totalnumber/20);
            if(state.currentPage<1){
                state.currentPage=1;
            }else if(state.currentPage>=1&&state.currentPage<countpage){                
                var page = state.currentPage;
                state.orderDatas=[];
                for (var i=(page-1)*20;i<page*20;i++){
                    state.orderDatas.push(state.AfterSortedChanners[i])
                }
            }else if(state.currentPage>=countpage){
                state.currentPage=countpage-1;
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
            let isSenderChannel = state.ethAccounts.filter(
                ea => ea.address == channel.senderAddress).length > 0;
            let isReceiverChannel = state.ethAccounts.filter(
                ea => ea.address == channel.receiverAddress).length > 0;

            channel = DataTransfer.toClientChannelData(channel);

            let stateChannels = isSenderChannel ? state.senderChannels : [];
            stateChannels = isReceiverChannel ? state.receiverChannels : stateChannels;
            let index = stateChannels.findIndex(c => c.id == channel.id);
            if (index == -1) {
                if (isSenderChannel) {
                    state.senderChannels.unshift(channel);
                }
                if (isReceiverChannel) {
                    state.receiverChannels.unshift(channel);

                }
            }
            else {
                let origChannel = stateChannels[index];
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
                if (isSenderChannel) {
                    state.senderChannels.splice(index, 1, channel);
                }
                if (isReceiverChannel) {
                    state.receiverChannels.splice(index, 1, channel);
                }
            }
            state.BeforeSortedChanners=state.receiverChannels;
            state.AfterSortedChanners=[];
            for(let i of state.BeforeSortedChanners){
                for(let j of i.payments){
                    j["adminPaused"]=i.adminPaused
                    j["senderUserName"]=i.senderUserName
                    j["senderUserId"]=i.senderUserId
                    j["senderAddress"]=i.senderAddress
                    j["receiverAddress"]=i.receiverAddress
                    j["depositDisplay"]=i.depositDisplay
                    j["recestatus"]=i.status
                    j["totalEscrowedDisplay"]=i.totalEscrowedDisplay
                    j["totalReleasedDisplay"]=i.totalReleasedDisplay
                    state.AfterSortedChanners.push(j)
                }    
            }
            state.AfterSortedChanners.sort((a,b)=>b.createTime.localeCompare(a.createTime));
            var userData=  state.userData;
            for (let i of state.AfterSortedChanners){
                i["payRobots"]=userData.filter(ud=>ud.userName==i.senderUserName&&ud.status=="Running"&&ud.suspended==false)
            }
            for (let i of state.AfterSortedChanners){
                i["userProfile"]=state.userProfileData.filter(it=>it.userName==i.senderUserName)
            }
            this.commit("pagination");
        },
        addOrReplaceChannelState(state, channelState) {
            let index = state.channelStates
                .findIndex(cs => cs.channelId == channelState.channelId);
            if (index == -1) {
                state.channelStates.unshift(channelState);
            }
            else {
                state.channelStates.splice(index, 1, channelState);
            }
        },
        setSignalrConnection(state, connection) {
            state.signalrConnection = connection;
        },
        setSignalrConnectState(state, connected) {
            state.signalrConnected = connected;
        },
        //通过userid获取的二维码及其上级UserId
        setUserProfile(state,userData){
  
            state.userProfileData=userData;
        },
        setDate(state,data){
            state.userData=data;
        },
        setBankTransferLogs(state,data){
            state.logTableData=data.bankTransferLogs;
            state.totalLogNumber = data.totalNumber;
            
        },
        requestCode(state,data){
            
            state.recode=data;
        },
        setPaymentDetailByFilter(state,data){
            var dict={"b":1};
            state.paginationData=[]
            dict["createTime"]=data.payments[0].createTime;
            dict["id"]=data.payments[0].id
            dict["currencyToCharge"]=data.payments[0].currencyToCharge;
            dict["currencyPaid"]=data.payments[0].currencyPaid;
            dict["senderUserId"]=data.payments[0].userId;
            dict["orderNumber"]=data.payments[0].orderNumber;
            if(data.payments[0].status==3){
                dict["status"]="EscrowCancelled"
            }else if(data.payments[0].status==2){
                dict["status"]="Escrowed"
            }else if(data.payments[0].status==1){
                dict["status"]="Cancelled"
            }else if(data.payments[0].status==4){
                dict["status"]="Released"
            }else if(data.payments[0].status==0){
                dict["status"]="Waiting"
            }
            dict["senderUserName"]=data.payments[0].userName;
            dict["payRobots"]=[];
            var Accountname={"a":1};
            Accountname["name"]=data.payments[0].payRobotAccountName;
            dict["payRobots"].splice(0,1,Accountname);
            state.paginationData.splice(0,1,dict);
            state.only=0;
        },
    },
    actions: {
        GetPaymentDetailByFilter: async function (context,orderId) {
            let formData = new FormData();
            formData.append("merchantId", "");
            formData.append("payMethod", "");
            formData.append("startTime", "");
            formData.append("endTime", "");
            formData.append("OrderNumber", orderId);
            formData.append("receivedUserName", "");
            formData.append("receivedAccountName", "");
            formData.append("paymentStatus", "");
            formData.append("pageNumber", 1);
            formData.append("pageSize", 40);
            let result = (await axios({
                method: "post",
                url: "api/Channels/GetPaymentDetailByFilter",
                data: formData,
                config: {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                },
            })).data
            context.commit("setPaymentDetailByFilter",result);
        },
        releaseButton: async function (context,val) {
            let formData = new FormData();
            formData.append("paymentId", val);
            await axios({
                method: "post",
                url: "api/Channels/ReleaseEscrow",
                data: formData,
                config: {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                },
            })
        },
        // 暂停
        ChPasued:async function(context,val){
            let formData = new FormData();
            formData.append("pasuedType", "Admin");
            formData.append("channelId",val)
            let result = (await axios({
                method: "post",
                url: "api/Channels/ChannelPasued",
                data: formData,
                config: {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                },
            })).status;
            context.commit("requestCode",result);
        },      
        // 恢复
        ChResume:async function(context,val){
            let formData = new FormData();
            formData.append("pasuedType", "Admin");
            formData.append("channelId",val)
           let result=(await axios({
                method: "post",
                url: "api/Channels/ChannelResume",
                data: formData,
                config: {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                },
            })).status;
            context.commit("requestCode",result);
        },
        ShowBankTransferLogs: async function (context,val) {
            this.currentPage = 1;
            let formData = new FormData();
            formData.append("receiverAccountNumber", val);
            formData.append("pageNumber", 1);
            formData.append("pageSize", 20);
            let result = (await axios({
                method: "post",
                url: "api/Channels/GetBankTransferLogs",
                data: formData,
                config: {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                },
            })).data  
            context.commit("setBankTransferLogs",result);
          },
        doSetCurrencyPaid: async function (context,payment) {
            let formData = new FormData();
            formData.append("paymentId", payment.id);
            formData.append("currencyPaid", payment.currencyPaid);
            await axios({
                method: "post",
                url: "api/Channels/ManuallySetCurrencyPaid",
                data: formData,
                config: {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                },
            })
        },
        // 个人资料
        PersonalData:async function(context){
            let result = (await axios({
                method:"post",
                url:"api/Channels/GetPayRobots",
                config:{
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                }
            })).data
            context.commit("setDate",result);

        },
        getUserProfile:async function(context){
            let result = (await axios({
                method:"post",
                url:"api/Channels/GetUserProfiles",
                config:{
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                }
            })).data
            context.commit("setUserProfile",result);
            
        },
        //根据userId查询二维码及其上级userid
        // GetUserProfileByUserId: async function(context,userId){
        //     let formData = new FormData();
        //     formData.append("userId",userId);
        //     let result = (await axios({
        //         method:"post",
        //         url:"api/Identity/GetUserProfileByUserId",
        //         data:formData,
        //         config:{
        //             headers: { "Content-Type": "application/x-www-form-urlencoded" }
        //         },
        //     })).data
            
        //     context.commit('setUserProfile', result);
        // },
        login: async function (context, payload) {
            let formData = {
                'username': payload.username,
                'password': payload.password
            };
            formData = qs.stringify(formData);

            try {
                let result = (await axios({
                    method: "post",
                    url: "/api/Identity/TokenLogin",
                    data: formData,
                    config: {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" }
                    }
                })).data;
                if (result["tokenType"] == "Bearer") {
                    context.commit('setBearerToken', result["accessToken"]);
                    axios.defaults.headers.common['Authorization']
                        = "Bearer " + result["accessToken"];
                        await context.dispatch('getUserProfile');
                        await context.dispatch('PersonalData');
                    await context.dispatch('loadClientData');
                    
                    return Promise.resolve();
                } else {
                    return Promise.reject("登录失败.");
                }
            } catch (e) {
                return Promise.reject("登录失败.");
            }
        },
        loadClientData: async function (context) {
            try {
                let url = "/api/Channels/GetChannelDashboardClientData";
                let result = (await axios.get(url)).data;
                context.commit('setClientData', result);
            } catch (e) {
                return Promise.reject("加载数据失败.");
            }
        },
        connectSignalR: async function (context) {
            if (context.state.signalrConnection) {
                return;
            }

            let connection = new signalR.HubConnectionBuilder()
                .withUrl("/channelHub", {
                    accessTokenFactory: () => context.state.bearerToken
                }).build();

            let reportTimeoutId = null;

            function connectionStartedHandler() {
                context.commit('setSignalrConnectState', true);
                reportTimeoutId = setTimeout(
                    () => reportChannelsOnline(), 3000);
                let channelIds = context.state.receiverChannels
                    .reduce((acc, val) => {
                        acc.push(val.id);
                        return acc;
                    }, []);
                connection.invoke("RenotifyChannelStates", channelIds);
            }
            async function start() {
                try {
                    context.commit('setSignalrConnection', connection);
                    if (!window.clientData) {
                        return;
                    }

                    connection.start().then(connectionStartedHandler,
                        () => setTimeout(start, 3000));
                } catch {
                    context.commit('setSignalrConnectState', false);
                    setTimeout(() => start(), 5000);
                }
            }

            async function reportChannelsOnline() {
                if (!context.state.accountsUnlocked) {
                    reportTimeoutId = setTimeout(
                        () => reportChannelsOnline(), 3000);
                    return;
                }

                var channelStates = [];
                var channels = context.state.senderChannels;
                for (var i in channels) {
                    if (channels[i].status == "Active") {
                        channelStates.push({
                            channelId: channels[i].id,
                            receiverAddress: channels[i].receiverAddress
                        });
                    }
                }

                if (channelStates.length > 0) {
                    await connection.invoke("ReportChannelsOnline", channelStates);
                }

                reportTimeoutId = setTimeout(() => reportChannelsOnline(), 3000);
            }

            connection.onclose(async () => {
                context.commit('setSignalrConnectState', false);
                clearTimeout(reportTimeoutId);
                await start();
            });

            connection.on('ChannelRequestChanged', (channelRequest) => {
                context.commit('addOrReplaceChannelRequest', channelRequest);
            });

            connection.on('ChannelChanged', (channel) => {
                //console.log(channel);
                context.commit('addOrReplaceChannel', channel);
            });

            connection.on('ChannelStateChanged', (channelState) => {
                context.commit('addOrReplaceChannelState', channelState);
            });

            start();
        },
        createEthKey: async function (context, ethKeyPassword) {
            let iterations = 2000 + Math.ceil(Math.random() * 1000);
            let salt = CryptoUtil.generateIV();
            let key = CryptoUtil.stretchPassword(ethKeyPassword,
                salt, iterations);
            let signature = ethereumjsUtil.keccak(key, 256);

            let formData = {
                Salt: salt.toString('hex'),
                Pbkdf2Iterations: iterations,
                Signature: signature.toString('hex')
            };
            formData = qs.stringify(formData);

            try {
                let ethKey = (await axios({
                    method: 'post',
                    url: '/api/EthAccounts/CreateEthKey',
                    data: formData,
                    config: {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" }
                    }
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

            var formData = {
                Address: address,
                PrivateKeyCipherText: privateKeyCipherText.toString('hex'),
                InitialVector: iv.toString('hex')
            };
            formData = qs.stringify(formData);

            try {
                let ethAccount = (await axios({
                    method: 'post',
                    url: '/api/EthAccounts/CreateEthAccount',
                    data: formData,
                    config: {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" }
                    }
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

            let formData = new FormData();
            formData.append('uid', payload.uid);
            formData.append('tokenCipherText', tokenCipherText.toString('hex'));
            formData.append('initialVector', iv.toString('hex'));

            try {
                var paysApiAccount = (await axios({
                    method: 'post',
                    url: '/api/EthAccounts/CreatePaysApiAccount',
                    data: formData,
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
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
        receiverSettle: async function (context, channel) {
            let accounts = context.state.ethAccounts.filter(
                ea => ea.address == channel.receiverAddress && ea.privateKey != null);
            if (accounts.length < 1) {
                return Promise.reject("没有匹配的已解锁账户。");
            }

            let privateKey = accounts[0].privateKey;

            let formData = {
                'channelId': channel.id
            };
            formData = qs.stringify(formData);

            try {
                let result = (await axios({
                    method: 'post',
                    url: '/api/channels/ReceiverRequireSettle',
                    data: formData,
                    config: {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" }
                    }
                })).data;

                channel.receiverClosingSignature = result.signature;

                let nonceAndGasPrice = (await axios.get(
                    '/api/EthAccounts/GetNonceAndGasPrice?address='
                    + channel.receiverAddress)).data;

                let serializedTx = channelFunctions.getCooperativeCloseTx(
                    privateKey, nonceAndGasPrice.nonce,
                    nonceAndGasPrice.gasPrice, channel);

                formData = {
                    'channelId': channel.id,
                    'rawTransaction': serializedTx
                };
                formData = qs.stringify(formData);

                await axios({
                    method: 'post',
                    url: '/api/Channels/ReceiverSettle',
                    data: formData,
                    config: {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" }
                    }
                });
                return Promise.resolve();
            }
            catch {
                return Promise.reject("服务器发生错误。");
            }
        }
    }
})
