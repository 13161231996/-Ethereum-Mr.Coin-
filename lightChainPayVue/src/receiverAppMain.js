import Vue from 'vue'
import App from './ReceiverApp.vue'
import store from './receiverStore'
import './plugins/element.js'
import * as signalR from '@aspnet/signalr'
import { mapMutations } from 'vuex'

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
      } catch {
        self.setSignalrConnectState(false);
        setTimeout(() => start(), 5000);
      }
    }

    connection.onclose(async () => {
      self.setSignalrConnectState(false);
      await start();
    });

    connection.on('ChannelRequestChanged', (channelRequest) => {
      self.$store.commit('addOrReplaceChannelRequest', channelRequest);
    });

    connection.on('ChannelChanged', (channel) => {
      //console.log(channel);
      self.$store.commit('addOrReplaceChannel', channel);
    });

    connection.on('ChannelWithdrawTxChanged',
      (channelWithdrawTx) => {
        if (!channelWithdrawTx.rawTransaction
          && channelWithdrawTx.channel) {
          self.$store.dispatch('fillChannelWithdrawRawTransaction',
            channelWithdrawTx);
        }
      });

    start();

    this.$store.subscribe((mutation) => {
      if (mutation.type == "addEthAccount") {
        connection.invoke('UpdateSenderGroups');
      }
    });
  }
}).$mount('#app')

store.commit('setReceiverData', window.receiverData);


