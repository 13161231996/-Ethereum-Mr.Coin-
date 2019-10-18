<template>
  <b-card>
    <template slot="header">
      以太坊账户
      <el-button
        style="margin-left:5rem"
        v-if="!ethAccount.privateKey"
        @click="$emit('unlockAccounts')"
      >解锁</el-button>
      <span v-if="ethAccount.privateKey" style="color:green; margin-left:40%">已解锁</span>
    </template>
    <b-card-body>
    <span style="margin-left:-5px">{{ ethAccount.address }}</span>
    <!-- 币种及其个数提现显示   -->
    <div>
      <!-- <span >{{ ethAccount.address }}</span>   -->
      <div class="pri" v-for="tws in filteredTrustedWalletSummaries" :key="tws.id">
        <div>{{ tws.tokenCode }}</div>
        <div class="curr">{{ tws.receivedValueDisplay }}</div>
        <el-button
          :value="true"
          style="background-color: white;"
          class="btn"
          v-on:click="withdrawals(tws)"
        >
          <div class="spa">提现</div>
        </el-button>
      </div>
      <div
        style="border-top: 1px solid gray; margin-top: 10px; padding: 10px"
        v-if="ethAccount.channelPartnerEthAccount"
        v-loading="action != ''"
        :element-loading-text="action"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      >
        关联商户:
        <label
          :title="channelPartnerEthAccount.address"
        >{{ channelPartnerEthAccount.userName }}</label>
        <el-button :value="true" v-on:click="doQuickCreateChannel">建立通道</el-button>
      </div>
    </div>
    </b-card-body>
  </b-card>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
export default {
  props: ["ethAccount"],
  data: function() {
    return {
      action: ""
    };
  },
  computed: {
    ...mapState(["trustedWalletSummaries"]),
    filteredTrustedWalletSummaries: function() {
      if (!this.trustedWalletSummaries) {
        return [];
      }
      return this.trustedWalletSummaries.filter(
        tws => tws.address === this.ethAccount.address
      );
    },
    channelPartnerEthAccount: function() {
      return this.ethAccount ? this.ethAccount.channelPartnerEthAccount : {};
    }
  },
  methods: {
    ...mapMutations(["setWithdrawData"]),
    ...mapActions(["quickCreateChannel"]),

    withdrawals: function(tws) {
      this.setWithdrawData({
        active: true,
        ethAddress: this.ethAccount.address,
        trustedWalletSummary: tws
      });
    },
    doQuickCreateChannel: async function() {
      this.action = "正在创建通道...";
      try {
        await this.quickCreateChannel({
          senderEthAccount: this.ethAccount,
          receiverEthAccount: this.channelPartnerEthAccount
        });
      } catch (error) {
        this.$alert(error);
      }
      this.action = "";
    }
  }
};
</script>

<style scoped>
.spa {
  margin-top: -5px;
  margin-left: -5px;
}
.btn {
  margin-left: 100px;
  margin-top: -5px;
  width: 60px;
  height: 23px;
}
.btn1 {
  width: 60px;
  height: 23px;
  border-radius: 5px;
  outline: none;
  margin-left: 205px;
  margin-top: -5px;
  background-color: white;
}
.curr {
  margin-left: 4%;
  width: 100px;
}
.pri {
  display: flex;
  flex-direction: row;
  width: 400px;
  margin-left: 5%;
  margin-top: 3.2%;
}
.pri2 {
  display: flex;
  flex-direction: row;
  width: 400px;
  height: 250px;
  margin-left: 5%;
  margin-top: 5%;
}
.el-card {
  display: inline-block;
  margin: 0.5em;
}
</style>
