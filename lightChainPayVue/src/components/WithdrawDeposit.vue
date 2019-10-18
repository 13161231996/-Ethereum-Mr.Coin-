<template>
  <el-dialog
    :visible="ShowPage()"
    @open="errorMessage=''"
    @close="withdrawData.active=false"
    v-loading="loading"
    width="500px"
  >
    <div>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <div class="p">
        <!-- 标题 -->
        <div>
          <span class="t-ti" style="color:black">提现</span>
        </div>
        <div class="v-bts">
          <div class="t-bs">
            <div class="t-bz">币&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;种</div>
            <div class="t-sr">
              <el-input v-model="tokenCode" placeholder="请输入内容" readonly></el-input>
            </div>
          </div>
          <div class="t-bs">
            <div class="t-bz">提现地址</div>
            <div class="t-sr">
              <el-input style="width:260px;" v-model="address" placeholder="请输入内容" readonly></el-input>
            </div>
          </div>
          <div class="t-bs">
            <div class="t-bz">数&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;量</div>
            <div class="t-sr">
              <el-input v-model="withdrawValue" placeholder="请输入内容"></el-input>
            </div>
            <el-button class="t-btn" v-on:click="Allwithdrawals()">
              <div style="margin-left:-10px;">全部提现</div>
            </el-button>
          </div>
          <div class="t-bs2">
            <div class="t-bzt" style="width:100px;">可提现额度:</div>
            <div style="margin-top:8px;">{{limit}}</div>
          </div>
          <div class="t-bs">
            <div class="t-bz">资金密码</div>
            <div class="t-sr">
              <el-input
                style="width:260px;"
                v-model="ethpassword"
                placeholder="请输入内容"
                show-password
              ></el-input>
            </div>
            <span class="error">{{ errorMessage }}</span>
          </div>
          <div class="t-bs3">
            <el-button class="t-tx" v-on:click="unlockEthKeyClick()">提现</el-button>
            <el-button class="t-tx2" v-on:click="shut()">取消</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";

import * as CryptoHelper from "../CryptoHelper";
export default {
  name: "vue-pay-keyboard",
  props: {},
  data() {
    return {
      prompt: "请在次输入密码",
      isbut: "none",
      loading: false,
      isdisabledFn: false,
      keyShow: true,
      paySuc: true,
      tokenCode: undefined,
      address: undefined,
      withdrawValue: undefined,
      limit: undefined,
      ethpassword: undefined,
      errorMessage: ""
    };
  },
  watch: {
    withdrawValue(val) {
      if (parseFloat(val) > parseFloat(this.limit)) {
        this.withdrawValue = this.limit;
      }
    }
  },
  computed: mapState(["userName", "ethKey", "withdrawData"]),
  mounted: function() {},
  methods: {
    ...mapActions(["withDraw"]),
    ...mapMutations(["unlockAccounts"]),
    unlockEthKeyClick: function() {
      let password;
      //console.log("passwo" + this.ethpassword);
      password = this.ethpassword;
      let self = this;
      self.loading = true;
      self.errorMessage = "";
      let encKey;
      try {
        encKey = CryptoHelper.recoverEthKey(self.ethKey, password);
        self.loading = false;
        self.unlockAccounts(encKey);
        //console.log("encKey", encKey);
        self.WithdrawMoney();
      } catch {
        self.errorMessage = "资金密码错误";
        self.loading = false;
        return;
      }
    },
    WithdrawMoney: async function() {
      try {
        this.withdrawData.withdrawValue = this.withdrawValue;
        await this.withDraw(this.withdrawData);
      } catch (error) {
        this.$alert(error);
      }
    },
    ShowPage() {
      //console.log( this.withdrawData);
      this.address = this.withdrawData.ethAddress;
      this.tokenCode = this.withdrawData.trustedWalletSummary.tokenCode;
      this.limit = this.withdrawData.trustedWalletSummary.receivedValueDisplay;

      return this.withdrawData.active;
    },
    // 关闭提现页面
    shut() {
      this.withdrawData.active = false;
      this.quantity = 0;
    },
    //填写全部币余额
    Allwithdrawals() {
      this.withdrawValue = this.limit;
    }
  }
};
</script>
<style lang="scss" scoped>
.error {
  color: red;
  margin-top: 30px;
  margin-left: 10px;
}
.t-bzt {
  margin-left: 160px;
  margin-top: 8px;
}
.t-tx {
  height: 40px;
  margin-left: 170px;
  margin-top: 50px;
}
.t-tx2 {
  height: 40px;
  margin-left: 80px;
  margin-top: 50px;
}
.t-btn {
  height: 40px;
  margin-top: 20px;
  width: 18%;
}
.t-bs {
  display: flex;
  flex-direction: row;
  height: 60px;
}
.t-bs2 {
  display: flex;
  flex-direction: row;
  height: 25px;
}
.t-bs3 {
  display: flex;
  flex-direction: row;
  height: 100px;
}
.t-bz {
  width: 80px;
  margin-left: 50px;
  margin-top: 30px;
}
.t-sr {
  margin-left: 40px;
  margin-top: 20px;
  width: 160px;
}
.login-body {
  margin: 0 auto;
  display: flex;
  justify-content: center;
}
.login-container {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}

div,
span,
input {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -o-box-sizing: border-box;
  -ms-box-sizing: border-box;
  box-sizing: border-box;
}
.v-title {
  width: 100%;
  height: 150px;
  border: 1px solid red;
}
.pay-box {
  width: 500px;
  height: 300px;
  margin-left: 100px;
}
input {
  background: none;
  outline: none;
  border: none;
  background-color: transparent;
  border-color: transparent;
  -webkit-appearance: none;
}
.vadat {
  margin-left: 27%;
  width: 30%;
  height: 50px;
}
.vali {
  // position: absolute;
  // left: 44px;
  // top: 240px;
  margin-left: 10%;
  color: aqua;
}
.validation {
  margin-left: 10%;
  color: red;
}
.title2 {
  height: 117px;
  line-height: 50px;
  margin-bottom: 25px;
  position: relative;
  color: white;
  margin-left: 1.5%;
  margin-top: 1%;
}

.title {
  text-align: center;
  line-height: 10px;
  margin-bottom: 25px;
  position: relative;
}
.v-1px-t,
.v-1px-l,
.v-1px-b,
.v-1px {
  position: relative;
}
.v-1px-b:after {
  content: " ";
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 1px;
  border-bottom: 1px solid #c7c7c7;
  color: #c7c7c7;
  transform-origin: 0 100%;
  transform: scaleY(0.5);
}
.v-1px-t:before {
  z-index: 112;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 1px;
  content: "";
  border-top: 1px solid #c7c7c7;
  transform: scaleY(0.5);
  color: #c7c7c7;
  transform-origin: 0 0;
}
.v-1px-l:before {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  content: "";
  border-left: 1px solid #c7c7c7;
  transform: scaleX(0.5);
  color: #c7c7c7;
  transform-origin: 0 0;
}
.v-1px:before {
  position: absolute;
  left: 0;
  top: 0;
  width: 200%;
  height: 200%;
  content: "";
  border: 1px solid #c7c7c7;
  transform: scale(0.5);
  color: #c7c7c7;
  transform-origin: left top;
  z-index: 1000;
}
.v-bts {
  height: 400px;
  margin-top: 20px;

  width: 450px;
  margin-left: -19px;
}
</style>