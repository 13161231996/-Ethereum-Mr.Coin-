<template>
  <div id="app" v-loading="!signalrConnected" element-loading-text="正在与服务器建立实时连接，请稍后...">
    <el-container>
      <el-header height="auto">
        <h3>Welcome, {{ userName }}.</h3>
      </el-header>
      <el-container>
        <el-aside width="35em">
          <EthAccountPanel/>
        </el-aside>
        <el-main
          v-loading="action != ''"
          :element-loading-text="action"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
        >
          <div>
            <el-checkbox v-model="autoOperate" v-if="accountsUnlocked">自动应答</el-checkbox>
          </div>
          <el-alert v-for="errMsg in errorMessages" :title="errMsg" :key="errMsg" type="warning"></el-alert>
          <ChannelRequestViewer
            v-for="cr in channelRequests"
            :channelRequest="cr"
            :key="'cr' + cr.id"
            role="sender"
          ></ChannelRequestViewer>
          <ChannelViewer
            v-for="channel in channels"
            :channel="channel"
            :key="channel.id"
            role="sender"
          ></ChannelViewer>
        </el-main>
      </el-container>
      <WithdrawDeposit></WithdrawDeposit>
    </el-container>
  </div>
</template>
<script>
import EthAccountPanel from "./components/EthAccountPanel.vue";
import ChannelRequestViewer from "./components/ChannelRequestViewer.vue";
import ChannelViewer from "./components/ChannelViewer.vue";
import { mapState, mapActions } from "vuex";
import WithdrawDeposit from "./components/WithdrawDeposit.vue";

export default {
  name: "app",
  data: function() {
    return {
      autoOperate: true,
      errorMessages: [],
      action: "",
      isShow: true
    };
  },
  computed: mapState([
    "userName",
    "signalrConnected",
    "accountsUnlocked",
    "channelRequests",
    "channels",
    "GET_MSG"
  ]),
  components: {
    EthAccountPanel,
    ChannelRequestViewer,
    ChannelViewer,
    WithdrawDeposit
  },
  methods: mapActions(["makeEscrow", "releaseEscrow", "setClosingSignature"]),

  created: function() {
    this.$store.subscribe(async (mutation, state) => {
      if (mutation.type == "setErrorMessage") {
        this.errorMessages.push(state.errorMessage);
      }
      if (mutation.type == "addOrReplaceChannel") {
        if (!this.autoOperate || !this.accountsUnlocked) {
          return;
        }
        let channels = this.channels.filter(c => c.id == mutation.payload.id);
        if (channels.length == 0) {
          return;
        }
        let channel = channels[0];
        if (channel.eventPaymentId == 0) {
          return;
        }
        let eventPayments = channel.payments.filter(
          p => p.id == channel.eventPaymentId
        );
        if (eventPayments.length == 0) {
          return;
        }
        let payment = eventPayments[0];
        if (payment.status == "Waiting") {
          this.action = "正在进行托管...";
          try {
            await this.makeEscrow(payment);
          } catch (error) {
            this.$alert(error);
          }
          this.action = "";
        }
        if (
          payment.status == "Escrowed" &&
          payment.currencyPaid == payment.currencyToCharge
        ) {
          this.action = "正在释放托管...";
          try {
            await this.releaseEscrow(payment);
          } catch (error) {
            this.$alert(error);
          }
          this.action = "";
        }
      }
    });
  }
};
</script>
<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  height: auto;
  padding: 0.3em;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
}
</style>
