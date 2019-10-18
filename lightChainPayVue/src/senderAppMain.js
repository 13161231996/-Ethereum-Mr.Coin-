import Vue from 'vue'
import App from './SenderApp.vue'
import store from './senderStore'
import './plugins/element.js'
import * as signalR from '@aspnet/signalr'
import { mapMutations } from 'vuex'
// import * as CryptoHelper from './CryptoHelper'
// import axios from 'axios'
// import * as DataTransfer from './DataTransfer'

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
  methods: {
    ...mapMutations(['setSignalrConnectState'])
  },
  mounted: function () {
    var self = this;
    var connection = new signalR.HubConnectionBuilder().withUrl("/channelHub").build();

    async function start() {
      try {
        await connection.start();
        self.setSignalrConnectState(true);
        setTimeout(() => reportChannelsOnline(), 3000);
      } catch {
        self.setSignalrConnectState(false);
        setTimeout(() => start(), 5000);
      }
    }

    async function reportChannelsOnline() {
      if (!self.$store.state.accountsUnlocked) {
        setTimeout(() => reportChannelsOnline(), 3000);
        return;
      }

      var channelStates = [];
      var channels = self.$store.state.channels;
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

      setTimeout(() => reportChannelsOnline(), 3000);
    }

    connection.onclose(async () => {
      self.setSignalrConnectState(false);
      await start();
    });

    connection.on('ChannelRequestChanged', (channelRequest) => {
      self.$store.commit('addOrReplaceChannelRequest', channelRequest);
    });

    connection.on('ChannelChanged', async (channel) => {
      // let state = self.$store.state;
      let inAction = false;
      // for (const i in channel.payments) {
      //   let payment = channel.payments[i];
      //   if (payment.status == "Waiting") {
      //     let accounts = state.ethAccounts.filter(
      //       ea => ea.address == channel.senderAddress && ea.privateKey != null);
      //     if (accounts.length < 1) {
      //       break;
      //     }
      //     inAction = true;

      //     channel = DataTransfer.toClientChannelData(channel);            
      //     channel.totalEscrowed = channel.totalEscrowed.plus(payment.amount);
      //     let signature = CryptoHelper.signSenderProof(channel, accounts[0].privateKey);

      //     let formData = new FormData();
      //     formData.append('paymentId', payment.id);
      //     formData.append('signature', signature);

      //     let url = "/api/Channels/MakeEscrow";
      //     if (payment.payInterface == "PaysApi") {
      //       url = "/api/Channels/MakeEscrowPaysApi"
      //       let paysApiParams = null;
      //       if (state.paysApiAccounts.length > 0) {
      //         let uid = state.paysApiAccounts[0].uid;
      //         let token = state.paysApiAccounts[0].token;
      //         paysApiParams = CryptoHelper.signPaysApi(payment, uid, token);
      //       }
      //       if (!paysApiParams) {
      //         return Promise.reject("未找到法币收款账户，请导入PaysAPI账户。");
      //       }
      //       formData.append('payUserId', paysApiParams.uid);
      //       formData.append('notifyUrl', paysApiParams.notifyUrl);
      //       formData.append('returnUrl', paysApiParams.returnUrl);
      //       formData.append('paysApiSignature', paysApiParams.signature);
      //     }

      //     await axios({
      //       method: 'post',
      //       url: url,
      //       data: formData,
      //       config: { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      //     });
      //   }
      // }

      if (!inAction) {
        self.$store.commit('addOrReplaceChannel', channel);
      }
    });

    start();
  }
}).$mount('#app');

store.commit('setSenderData', window.senderData);


