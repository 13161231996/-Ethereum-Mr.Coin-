<template>
  <el-container>
    <el-main
      v-loading="action != ''"
      :element-loading-text="action"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <template v-if="transaction">
        <h1>订单 {{ transaction.orderNumber }}</h1>
        <div class="row">
          <div class="col-xs-3">收款人</div>
          <div class="col-xs-3">{{ transaction.receiverUserName }}</div>
        </div>
        <div class="row">
          <div class="col-xs-3">支付金额</div>
          <div class="col-xs-3">{{ transaction.currencyPrice }}元</div>
        </div>
        <hr>
        <template v-if="transaction.status == 'Paid'">该订单已完成支付。</template>
        <template v-else>
          <template v-if="payableTokenSummaries.length > 0">
            <div>可使用以下加密币快速通道中的余额支付:</div>
            <div v-for="tokenSummary in payableTokenSummaries" :key="tokenSummary.id">
              {{ tokenSummary.tokenCode }}
              <el-button @click="payByTokenButtonClick(tokenSummary)">支付</el-button>
            </div>
          </template>
          <template v-else>
              您的钱包内余额不足，可先充值后再支付。          
          </template>
        </template>
      </template>
      <el-alert v-for="errMsg in errorMessages" :title="errMsg" :key="errMsg" type="warning"></el-alert>
    </el-main>
    <!-- <CreateEthKeyDialog :visible="ethKey == null" @eth-key-created="ethKeyCreatedHandler"></CreateEthKeyDialog> -->
    <UnlockEthKeyDialog
      :visible.sync="unlockEthKeyDialogVisible"
      @eth-key-unlocked="ethKeyUnlockedHandler"
    ></UnlockEthKeyDialog>
  </el-container>
</template>
<script>
import BigNumber from "bignumber.js";
import { mapState, mapActions, mapGetters } from "vuex";
// import CreateEthKeyDialog from ".././components/CreateEthKeyDialog.vue";
import UnlockEthKeyDialog from ".././components/UnlockEthKeyDialog.vue";

export default {
  data: function() {
    return {
      tokenConfiguration: {},
      unlockEthKeyDialogVisible: false,
      selectedTokenSummary: null,

      errorMessages: [],
      action: ""
    };
  },
  computed: {
    ...mapState([
      "userName",
      "tokenConfigurations",
      "ethKey",
      "ethAccounts",
      "trustedWalletSummaries",
      "transaction",
      "waitingDepositRequestCount"
    ]),
    ...mapGetters(["getTokenConfiguration", "getEthAccountByAddress"]),
    payableTokenSummaries: function() {
      let payableTokenSummaries = [];
      if (!this.transaction) {
        return payableTokenSummaries;
      }
      for (let i in this.trustedWalletSummaries) {
        let tws = this.trustedWalletSummaries[i];
        let senderBalance = new BigNumber(tws.senderBalanceDisplay);
        if (senderBalance.gt(this.transaction.currencyPrice)) {
          payableTokenSummaries.push(tws);
        }
      }

      return payableTokenSummaries;
    }
  },
  // components: { CreateEthKeyDialog, UnlockEthKeyDialog },
  components: { UnlockEthKeyDialog },
  methods: {
    ...mapActions([
      "generateEthAccount",
      "walletPay",
      "updateTrustedWalletData"
    ]),
    ethKeyCreatedHandler: async function(encKey) {
      this.action = "正在为您生成以太坊账户...";
      try {
        await this.generateEthAccount(encKey);
      } catch (error) {
        this.$alert(error);
      }
      this.action = "";
    },
    ethKeyUnlockedHandler: async function(encKey) {
      this.action = "正在使用区块链快速通道支付...";
      try {
        let transaction = await this.walletPay({
          transaction: this.transaction,
          tokenSummary: this.selectedTokenSummary,
          encKey: encKey
        });

        window.location.href = transaction.returnUrl;
      } catch (error) {
        this.$alert(error);
      }
      this.action = "";
    },
    payByTokenButtonClick: async function(tokenSummary) {
      this.selectedTokenSummary = tokenSummary;
      this.unlockEthKeyDialogVisible = true;
    }
  },
  updated: function() {
    if (!this.tokenConfiguration.code && this.tokenConfigurations.length > 0) {
      this.tokenConfiguration = this.tokenConfigurations[0];
    }
  },
  mounted: function() {
    // let self = this;
    // setTimeout(function timeoutHandler() {
    //   if (self.waitingDepositRequestCount > 0) {
    //     self.updateTrustedWalletData();
    //   }
    //   setTimeout(timeoutHandler, 2000);
    // }, 2000);
  }
};
</script>
