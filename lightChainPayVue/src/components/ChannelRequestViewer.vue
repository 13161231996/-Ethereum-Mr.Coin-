 <template>
  <el-card
    v-loading="loadingText != ''"
    :element-loading-text="loadingText"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <template slot="header">
      通道创建请求
      <template v-if="role=='sender' && channelRequest.status=='Waiting'">
        <template v-if="accountsUnlocked">
          <el-button style="float: right; padding: 0.5em" @click="rejectClick">拒绝</el-button>
          <el-button
            style="float: right; padding: 0.5em; margin: 0 1em"
            @click="createChannelClick"
          >同意</el-button>
        </template>
        <span v-if="!accountsUnlocked" style="float: right; color: darkgoldenrod">请先解锁以太坊账户</span>
      </template>
      <span
        v-if="role=='receiver' && channelRequest.status=='Waiting'"
        style="float: right; color: darkgoldenrod"
      >等待同意或拒绝</span>
      <span v-if="channelRequest.status=='Created'" style="float: right; color: darkgoldenrod">通道已创建</span>
      <span v-if="channelRequest.status=='Rejected'" style="float: right; color: darkgoldenrod">已被拒绝</span>
    </template>
    <span>
      {{ channelRequest.receiverAddress }}发起了通道创建请求，金额为
      {{ channelRequest.amountDisplay }},
    </span>
    <br>
    <span>需由账户{{ channelRequest.senderAddress }}回应。</span>
  </el-card>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  props: ["role", "channelRequest"],
  data: function() {
    return {
      errorMessage: "",
      action: ""
    };
  },
  computed: {
    ...mapState(["accountsUnlocked"]),
    loadingText: function() {
      if (this.action != "") {
        return this.action;
      }
      if (this.channelRequest.status == "WaitingEthTx") {
        return (
          "正在等待以太坊执行交易，TX:" +
          this.channelRequest.createChannelEthTxId
        );
      }
      return "";
    }
  },
  methods: {
    ...mapMutations(["setErrorMessage"]),
    ...mapActions([
      "createChannel",
      "rejectChannelRequest",
      "getTokenBalanceAndAllowance",
      "withDraw"
    ]),
    rejectClick: async function() {
      this.action = "正在拒绝请求...";
      try {
        await this.rejectChannelRequest(this.channelRequest.id);
      } catch (error) {
        this.$alert(error);
      }
      this.action = "";
    },
    createChannelClick: async function() {
      this.action = "正在创建通道...";
      try {
        await this.createChannel(this.channelRequest);
      } catch (error) {
        this.$alert(error);
      }
      this.action = "";
    }
  }
};
</script>

<style scoped>
.el-card {
  height: 200px;
  display: inline-block;
  margin: 0.5em;
}
</style>
