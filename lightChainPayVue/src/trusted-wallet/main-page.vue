<template>
  <div>
    <b-navbar class="top" toggleable="md">
      <h3 class="title">Mr.Coin闪速钱包</h3>
      <b-navbar-toggle target="nav_collapse"/>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav>
          <b-nav-item href="#">
            <span class="bnit">资产</span>
          </b-nav-item>
          <b-nav-item href="#">
            <router-link :to="{path: '/record'}">
              <span class="bnit">充值记录</span>
            </router-link>
          </b-nav-item>
          <b-nav-item href="#">
            <span class="bnit">交易</span>
          </b-nav-item>
          <b-nav-item href="#">
            <span class="bnit">账号</span>
          </b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item @click="logoutClickHandler">
            <span class="bnit">欢迎，{{userName}}！&nbsp; 登出</span>
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-container v-loading="!signalrConnected" element-loading-text="正在与服务器建立实时连接，请稍后...">
      <transaction-view></transaction-view>
      <hr>
      <b-row>
        <b-col cols="11" lg="6" style="border-right: 1px solid #c5c7d6;">
          <h3>我的资产</h3>
          <el-alert
            :title="depositMessage"
            type="success"
            center
            show-icon
            v-show="depositMessage!=''"
          ></el-alert>
          <template v-for="tc in tokenConfigurations">
            <hr :key="'t_hr' + tc.id">
            <b-row :key="'t' + tc.id" style="padding-left: 1em;">
              <b-col cols="4" class="token-code">{{ tc.code }}</b-col>
              <b-col cols="8" class="token-amount" style="text-align: center">
                <div>{{ getSenderBalance(tc.code) }}(≈{{ getSenderCurrencyBalance(tc.code) }}元)</div>
                <div style="margin: 1em">
                  <el-button
                    @click="selectDepositTokenButtonClick(tc)"
                    v-show="selectedTokenCode!=tc.code && !currentDepositRequest"
                  >充值</el-button>
                </div>
              </b-col>
              <div class="w-100"></div>
              <b-col cols="12" style="margin: 15px;" v-show="!currentDepositRequest">
                <transition name="el-fade-in">
                  <el-radio-group
                    v-model="depositAmount"
                    v-show="selectedTokenCode==tc.code"
                    style="float:right;"
                  >
                    <el-radio-button label="20">20元</el-radio-button>
                    <el-radio-button label="50">50元</el-radio-button>
                    <el-radio-button label="100">100元</el-radio-button>
                    <el-radio-button label="200">200元</el-radio-button>
                  </el-radio-group>
                </transition>
                <div style="clear: both;"></div>
                <div style="float:right;">
                  <el-button
                    type="primary"
                    class="deposit-button"
                    v-show="selectedTokenCode==tc.code"
                    @click="requireDepositButtonClick(tc, 'BankTransfer')"
                  >银行转账</el-button>

                  <el-button
                    type="primary"
                    class="deposit-button"
                    v-show="selectedTokenCode==tc.code"
                    @click="requireDepositAlipay(tc,'BankTransferViaAlipay')"
                  >支付宝转卡</el-button>
                  
                <el-button
                    type="primary"
                    class="deposit-button"
                    v-show="selectedTokenCode==tc.code"
                    @click="requireDepositAlipay(tc,'Alipay')"
                    style=" margin: 1em 1em 1em 1em;"
                  >支付宝</el-button>
                  
                <!--
                  <el-button
                    type="primary"
                    class="deposit-button"
                    v-show="selectedTokenCode==tc.code && depositGateway=='EasyPay'"
                    @click="requireDepositButtonClick(tc, 'Alipay')"
                  >支付宝充值</el-button>
                  <input type="hidden" name="t" :value="transaction? transaction.uid : ''">
                  <input type="hidden" name="tokenConfigurationId" :value="tc.id">
                  <input type="hidden" name="amount" :value="parseFloat(depositAmount)">
                  <el-button
                    type="primary"
                    class="deposit-button"
                    v-show="selectedTokenCode==tc.code && depositGateway=='PaysApi'"
                    @click="requireDepositPaysApiButtonClick(tc)"
                    style="margin: 1em; float: right;"
                  >支付宝充值</el-button>
                  -->
                </div>
              </b-col>
              <div class="w-100"></div>
              <b-col
                cols="12"
                v-show="selectedTokenCode==tc.code && currentDepositRequest 
                  && currentDepositRequest.payMethod == 'Alipay'
                  && currentDepositRequest.status == 'Waiting'"
              >
               <p style="margin: 3px; ">
                  <span style="color: darkgray; margin-right: 10px">您正在充值 金额:</span>
                  <span style="color:red"><b>{{ depositRequestAmount}}</b></span>
                  <el-button
                    style="float:right;padding:6px;font-size:13px"
                    v-clipboard:copy="depositRequestAmount"
                  >复制</el-button>
                </p>
                <!--<p>您正在充值{{ depositAmount }}元。</p>-->
                <p>请用支付宝扫描下方的二维码进行充值,完成后系统确认需要一小段时间，请耐心等待。</p>
                <img
                  id="show_qrcode"
                  :src="qrCodeImage"
                  title="本二维码仅可支付一次,请勿重复使用."
                  style="display: block; max-width: 250px; margin: auto;"
                >
                <p style="margin: 5px">
                  手机用户可以
                  <a :href="alipayUri" target="_blank">点击此处调起支付宝app</a>，注意要自行输入正确金额。
                </p>
              </b-col>
                 <b-col
                cols="12"
                v-show="selectedTokenCode==tc.code && currentDepositRequest 
                  && currentDepositRequest.payMethod == 'BankTransferViaAlipay'
                  && currentDepositRequest.status == 'Waiting'"
              >
               <p style="margin: 3px; ">
                  <span style="color: darkgray; margin-right: 10px">您正在充值 金额:</span>
                  <span style="color:red"><b>{{ depositRequestAmount}}</b></span>
                  <el-button
                    style="float:right;padding:6px;font-size:13px"
                    v-clipboard:copy="depositRequestAmount"
                  >复制</el-button>
                </p>
                <!--<p>您正在充值{{ depositAmount }}元。</p>-->
                <p>请用支付宝扫描下方的二维码进行充值,完成后系统确认需要一小段时间，请耐心等待。</p>
                <img
                  id="show_qrcode"
                  :src="qrCodeImage"
                  title="本二维码仅可支付一次,请勿重复使用."
                  style="display: block; max-width: 250px; margin: auto;"
                >
                <p style="margin: 5px">
                  手机用户可以
                  <a :href="alipayUri" target="_blank">点击此处调起支付宝app</a>，注意要自行输入正确金额。
                </p>
              </b-col>
              <b-col
                cols="12"
                v-show="selectedTokenCode==tc.code && currentDepositRequest 
                  && currentDepositRequest.payMethod == 'BankTransfer'
                  && currentDepositRequest.status == 'Waiting'"
              >
                <p
                  style="margin: 15px 2px 10px 2px; color: darkblue; font-weight: bold;"
                >请向以下银行账户转账{{ depositRequestAmount }}元，完成后点击“我已付款”按钮：</p>
                <p style="margin: 3px; ">
                  <span style="color: darkgray; margin-right: 10px">金额:</span>
                  <span>{{ depositRequestAmount}}</span>
                  <el-button
                    style="float:right;padding:6px;font-size:13px"
                    v-clipboard:copy="depositAmount"
                  >复制</el-button>
                </p>
                <p style="margin: 3px; ">
                  <span style="color: darkgray; margin-right: 10px">持卡人:</span>
                  <span>{{ depositRequestBank.accountName }}</span>
                  <el-button
                    style="float:right;padding:6px;font-size:13px"
                    v-clipboard:copy="depositRequestBank.accountName"
                  >复制</el-button>
                </p>
                <p style="margin: 3px; ">
                  <span style="color: darkgray; margin-right: 10px">银行卡:</span>
                  <span style="font-size:x-small">{{ depositRequestBank.accountNumber }}</span>
                  <el-button
                    style="float:right;padding:6px;font-size:13px"
                    v-clipboard:copy="depositRequestBank.accountNumber"
                  >复制</el-button>
                </p>
                <p style="margin: 3px; ">
                  <span style="color: darkgray; margin-right: 10px">开卡行:</span>
                  <span>{{ depositRequestBank.bankName }}</span>
                  <el-button
                    style="float:right;padding:6px;font-size:13px"
                    v-clipboard:copy="depositRequestBank.bankName"
                  >复制</el-button>
                </p>
                <p style="margin: 3px; ">
                  <span style="color: darkgray; margin-right: 10px">数字识别码:</span>
                  <span style="color:red;">
                    <b>{{ depositRequestBankTag }}</b>
                  </span>
                  <el-button
                    style="float:right;padding:6px;font-size:13px"
                    v-clipboard:copy="depositRequestBankTag"
                  >复制</el-button>
                </p>
                <p style="margin: 3px; padding: 10px;">
                  <span style="color: darkred">转账时请备注此4位数字识别码"</span>
                  <span style="color: red; font-weight: bold">{{ depositRequestBankTag }}</span>
                  <span style="color: darkred">
                    "，以便系统能自动识别您的汇款。
                    如果您没有备注或者备注错误，将转入人工处理流程，需要等待较长时间。
                  </span>
                </p>
                   <b-col
                cols="11"
                v-show="selectedTokenCode==tc.code && currentDepositRequest 
                  && currentDepositRequest.payMethod == 'BankTransfer'
                  && currentDepositRequest.status == 'Waiting'"
              >
                <p>请用银联云闪付扫描下方的二维码进行充值,完成后系统确认需要一小段时间，请耐心等待。</p>
                <img
                  id="show_qrcode"
                  width="300"
                  :src="qrCodeImage"
                  title="本二维码仅可支付一次,请勿重复使用,本二维码仅可支付一次,请勿重复使用,本二维码仅可支付一次,请勿重复使用,本二维码仅可支付一次,请勿重复使用"
                  style="display: block;"
                >
              </b-col>
                <div style="text-align: center;">
                  <el-button type="primary" @click="depositPaidButtonClick">我已付款</el-button>
                </div>
              </b-col>
              <b-col
                cols="12"
                v-show="selectedTokenCode==tc.code && currentDepositRequest 
                  && currentDepositRequest.status == 'Waiting'"
              >
                <el-button
                  type="primary"
                  class="deposit-button"
                  v-show="selectedTokenCode==tc.code && depositGateway=='PaysApi'"
                  @click="setCurrentDepositRequest(null)"
                  style="margin: 1em; float: right;"
                >取消充值</el-button>
              </b-col>
              <b-col
                cols="12"
                v-show="selectedTokenCode==tc.code && currentDepositRequest 
                  && currentDepositRequest.payMethod == 'BankTransfer'
                  && currentDepositRequest.status == 'WaitingPayConfirmation'"
              >
                <p
                  style="margin: 15px 2px 10px 2px; color: darkblue; font-weight: bold;"
                >我们正在确认您的付款到账情况，一旦到账，您的数字资产余额会自动更新。</p>
                <p style="margin: 5px; color: darkgray;">如果长时间没有确认，您可以联系我们的客服，提交转账凭证，帮您人工处理。</p>
              </b-col>
            </b-row>
          </template>
        </b-col>
        <b-col cols="1"></b-col>
        <b-col cols="11" lg="5">
          <h3>充值记录</h3>
          <el-alert
            v-if="waitingDepositRequestCount>0"
          >您有{{waitingDepositRequestCount}}个正在确认的充值支付，确认后会为您自动刷新余额。</el-alert>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>
<script>
import axios from "axios";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import TransactionView from "./transaction-view.vue";

export default {
  data: function() {
    return {
      selectedTokenCode: "",
      depositAmount: "20",
      qrCodeImage: "",
      alipayUri: "",

      errorMessages: []
    };
  },
  computed: {
    ...mapState([
      "userName",
      "tokenConfigurations",

      "currentDepositRequest",
      "transaction",

      "depositGateway",
      "waitingDepositRequestCount",
      "depositMessage",

      "signalrConnected"
    ]),
    ...mapGetters(["getSenderBalance", "getSenderCurrencyBalance"]),
    depositRequestAmount: function() {
      if (this.currentDepositRequest) {
        return this.currentDepositRequest.currencyAmount;
      }
      return 0;
    },
    depositRequestBankTag: function() {
      if (this.currentDepositRequest) {
        return this.currentDepositRequest.bankTag;
      }
      return "";
    },
    depositRequestBank: function() {
      if (
        this.currentDepositRequest &&
        this.currentDepositRequest.bankAccount
      ) {
        return this.currentDepositRequest.bankAccount;
      }
      return { bankName: "", accountName: "", accountNumber: "" };
    }
  },
  components: { TransactionView },
  methods: {
    ...mapMutations(["setCurrentDepositRequest"]),
    ...mapActions(["logout"]),
    selectDepositTokenButtonClick: async function(tokenConfiguration) {
      this.selectedTokenCode = tokenConfiguration.code;
    },
    logoutClickHandler: async function() {
      try {
        await this.logout();
        location.reload(true);
      } catch (error) {
        this.$alert(error);
      }
    },
    depositPaidButtonClick: async function() {
      let formData = new FormData();
      formData.append("depositRequestId", this.currentDepositRequest.id);

      try {
        let result = (await axios({
          method: "post",
          url: "/api/TrustedWallet/BankDepositMarkPaid",
          data: formData,
          config: {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          }
        })).data;

        this.setCurrentDepositRequest(result);
      } catch (e) {
        this.$alert("服务器端发生了错误.");
      }
    },
    requireDepositButtonClick: async function(tokenConfiguration, payMethod) {
      let formData = new FormData();
      formData.append("tokenConfigurationId", tokenConfiguration.id);
      formData.append("payMethod", payMethod);
      formData.append("currencyAmount", parseFloat(this.depositAmount));

      try {
        let result = (await axios({
          method: "post",
          url: "/api/TrustedWallet/RequireDeposit",
          data: formData,
          config: {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          }
        })).data;

        this.setCurrentDepositRequest(result.depositRequest);
        this.qrCodeImage = "data:image/png;base64," + result.qrCodeB64;
      } catch (e) {
        this.$alert("服务器端发生了错误.");
      }
    },
    requireDepositPaysApiButtonClick: async function(tokenConfiguration) {
      let formData = new FormData();
      formData.append("tokenConfigurationId", tokenConfiguration.id);
      formData.append("amount", parseFloat(this.depositAmount));
      formData.append("transactionId", "1");

      try {
        let result = (await axios({
          method: "post",
          url: "/api/TrustedWallet/RequireDepositPaysApi",
          data: formData,
          config: {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          }
        })).data;

        this.setCurrentDepositRequest(result.depositRequest);
        this.qrCodeImage = "data:image/png;base64," + result.qrCodeB64;
        //this.qrCodeImage = result.qrCodeB64;
        this.alipayUri = result.alipayUri;
      } catch (e) {
        this.$alert("服务器端发生了错误.");
      }
    },
      requireDepositAlipay: async function(tokenConfiguration,payMethod) {
      let formData = new FormData();
      formData.append("tokenConfigurationId", tokenConfiguration.id);
      formData.append("currencyAmount", parseFloat(this.depositAmount));
      formData.append("transactionId", "1");
      formData.append("payMethod", payMethod);

      try {
        let result = (await axios({
          method: "post",
          url: "/api/TrustedWallet/requireDepositAlipay",
          data: formData,
          config: {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          }
        })).data;

        this.setCurrentDepositRequest(result.depositRequest);
        this.qrCodeImage = "data:image/png;base64," + result.qrCodeB64;
        //this.qrCodeImage = result.qrCodeB64;
        this.alipayUri = result.alipayUri;
      } catch (e) {
        this.$alert("服务器端发生了错误.");
      }
    }
  }
};
</script>

<style scoped>
.bnit {
  color: white;
}
.nav-link {
  color: white;
}

.navbar-nav {
  margin-bottom: 50px;
}

.header-account {
  display: flex;
  text-decoration: none;
  margin-top: 5px;
  padding-top: 10px;
  padding-left: 20px;
  padding-right: 20px;
  position: relative;
  cursor: pointer;
  float: right;
  color: white;
}

.account-svg {
  margin-top: 15px;
  width: 30px;
  height: 30px;
  fill: white;
}

.token-code {
  font-size: 15px;
  font-weight: 600;
}

.token-amount {
  font-size: 17px;
  font-weight: bold;
}

.deposit-button {
  margin: 5px;
  padding: 10px;
}

.nav-text {
  font-size: 30px;
  font-weight: 700;
  position: relative;
  left: 100px;
  color: #ffffff;
}

.nav-list {
  font-size: 16px;
  font-weight: 700;
  margin-left: 50px;
}
.el-menu-item:hover {
  background-color: none;
}
</style>