<template>
  <b-card
    v-loading="action != ''"
    :element-loading-text="action"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    :class="{ settled:channel.status == 'Settled'}"
  >
      <div class="request_lock">               
        <div
              v-if="!accountsUnlocked && channel.status != 'Settled'"
              style=" float: left;clear: left; color: darkgoldenrod"
              @click="$emit('unlockAccounts')"
            >请先解锁账户</div>

        <div>
          <span v-if="channel.status == 'Settled'" style="float: right; color: darkgoldenrod">通道已完成结算</span>
          <span
            v-if="accountsUnlocked && channel.status != 'Settled'"
            style="float: right; color: darkgoldenrod"
          >
            <template v-if="role=='sender'">
              <el-button
                v-if="channel.closingRequired && !channel.senderClosingSignature && accountsUnlocked"
                @click="setClosingSignatureClick"
              >同意结算</el-button>
              <span v-if="channel.senderClosingSignature">等待对方结算</span>
            </template>
            <template v-if="role=='receiver'">
              <el-button v-if="accountsUnlocked" @click="receiverSettleClick">链上结算</el-button>
            </template>
          </span>
          <div style="clear: both"></div>
        </div>
        <div v-if="accountsUnlocked && channel.status == 'Active'">
                      托管请求:
          <el-button
            v-if="role=='receiver'"
            type="primary"
            icon="el-icon-circle-plus-outline"
            @click="requestEscrowDialogVisible=true"
          ></el-button>
          <RequestEscrowDialog :visible.sync="requestEscrowDialogVisible" :channel="channel"></RequestEscrowDialog>
        </div>
    </div>
    <b-card no-body class="mb-1">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button style="background-color:white;color:black;border-style:none;" block href="#" v-b-toggle="'accordion'+channel.id" variant="info">
      <div style="text-align:left">连接状态:{{ isChannelOnline ? "(在线)": "(离线)"}}</div>
      <div style="text-align:left">账户:{{ channel.senderUserName }}</div>
      <div style="text-align:left;"><div>通道:</div>{{ channel.senderAddress }}</div>
      <div style="text-align:left" ><div>接收方地址:</div>{{ channel.receiverAddress }}</div>
      <div style="text-align:left">总金额:{{ channel.depositDisplay }}</div>
              <div style="text-align:left">已托管:{{ channel.totalEscrowedDisplay }}</div>
        <div style="text-align:left">已释放:{{ channel.totalReleasedDisplay }}</div>
                <span
          class="signature"
          v-if="channel.senderSignature && channel.status != 3"
        >当前签名: {{ senderSignature }}</span>
      </b-button>
      </b-card-header>
       <div class="escrow-request" v-if="accountsUnlocked && channel.status == 'Active'">
      <b-collapse :id="'accordion'+channel.id"  accordion="my-accordion" role="tabpanel" style="padding:0">
      <b-card-body >
      

        <ul style="padding-left:1rem;">
          <li style="text-align: left"  v-for="p in channel.payments" :key="'p' + p.id">
            <hr>
            <div class="request_lock">
              <div>{{ p.id }}@{{ p.createTime.substring(11,19) }}</div>
              <div>商品:{{ p.commodityName }} </div>
            </div>
            <div class="request_lock">
            <div>应收款:{{ p.currencyToCharge }}</div>
            <div>已收款: {{ p.currencyPaid }}</div>
            </div>
            <div style="text-align: right">
            <span
              v-if="p.status == 'Waiting'"
            >(等待托管)</span>
            <span v-if="p.status=='Escrowed'">(已托管)</span>
            <span v-if="p.status=='Released'">(已释放)</span>
            <span v-if="p.status=='Cancelled'">(已取消)</span>
            <span v-if="p.status=='EscrowCancelled'">(托管已取消)</span>
            </div>
            
            <template v-if="role=='receiver'">
              <a
                v-if="p.status=='Escrowed' && p.payInterface=='LightChainPayRobot'"
                target="_blank"
                :href="'/Channels/PaymentRedirect?paymentId=' + p.id"
              >支付页</a>
              <a
                v-if="p.status=='Escrowed' && p.payInterface=='PaysApi'"
                target="_blank"
                :href="'/Channels/PaysApiRedirect?paymentId=' + p.id"
              >支付页</a>
            </template>
            <template v-if="role=='sender'">
              <el-button v-if="p.status=='Waiting'" @click="makeEscrowClick(p)">托管</el-button>
              <el-button v-if="p.status=='Escrowed'" @click="releaseEscrowClick(p)">释放</el-button>
            </template>
            
          </li>
        </ul>
        <br />
      
      </b-card-body>
      </b-collapse>
      </div>

    </b-card>
  </b-card>
  
</template>

<script>
import RequestEscrowDialog from "./RequestEscrowDialog.vue";
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  props: ["role", "channel"],
  data: function() {
    return {
      requestEscrowDialogVisible: false,
      activeName: '1',
      errorMessage: "",
      action: "",
      channelUser:""
    };
  },
  computed: {
    ...mapState(["accountsUnlocked"]),
    isChannelOnline: function() {
      return this.$store.getters.isChannelOnline(this.channel.id);
    },
    senderSignature: function() {
      return this.channel.senderSignature
        ? this.channel.senderSignature.substr(0, 30) + "..."
        : "";
    }
  },
  mounted(){   
  },
  methods: {
    ...mapMutations(["setErrorMessage"]),
    ...mapActions([
      "makeEscrow",
      "releaseEscrow",
      "receiverRequireSettle",
      "receiverSettle",
      "setClosingSignature"
    ]),
    makeEscrowClick: async function(payment) {
      this.$confirm("此操作将会进行托管, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        this.action = "正在进行托管...";
        try {
          await this.makeEscrow(payment);
        } catch (error) {
          this.$alert(error);
        }
        this.action = "";
      });
    },
    releaseEscrowClick: async function(payment) {
      this.$confirm("此操作将会执行释放, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        this.action = "正在释放托管...";
        try {
          await this.releaseEscrow(payment);
        } catch (error) {
          this.$alert(error);
        }
        this.action = "";
      });
    },
    receiverRequireSettleClick: async function() {
      this.action = "正在请求结算...";
      try {
        await this.receiverRequireSettle(this.channel.id);
      } catch (error) {
        this.$alert(error);
      }
      this.action = "";
    },
    receiverSettleClick: async function() {
      this.action = "正在结算...";
      try {
        //await this.setClosingSignature(this.channel);
        await this.receiverSettle(this.channel);
      } catch (error) {
        this.$alert(error);
      }
      this.action = "";
    },
    setClosingSignatureClick: async function() {
      this.action = "正在进行结算签名...";
      try {
        await this.setClosingSignature(this.channel);
      } catch (error) {
        this.$alert(error);
      }
      this.action = "";
    }
  },
  components: {
    RequestEscrowDialog
  }
};
</script>

<style scoped>
body {     -webkit-text-size-adjust : 100% ;     -moz-text-size-adjust : 100% ;     -ms-text-size-adjust : 100% ;  text-size-adjust : 100%; }
.request_lock{
     display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: row;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
}
.el-card {
  height: auto;
  display: inline-block;
  margin: 0.5em;
}

.escrow-request {
}

.signature {
  color: darkgreen;
}

.settled {
  color: gray;
}
</style>
