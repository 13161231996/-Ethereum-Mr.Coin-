<template>
  <div>
    <b-navbar class="top" toggleable="md">
      <h3 class="title">Mr.Coin闪速钱包-平台监控</h3>
    </b-navbar>
    <div v-loading="!signalrConnected" element-loading-text="正在与服务器建立实时连接，请稍后...">
      <template v-for="dr in depositRequests">
        <div :key="dr.id" style="padding: 10px; border: 1px solid">
          {{ dr.userName }}: {{ dr.currencyAmount }}
          <el-button
            type="primary"
            v-show="dr.status=='WaitingPayConfirmation'"
            @click="confirmBankDepositButtonClick(dr.id)"
          >已收款</el-button>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import { mapState, mapActions } from "vuex";

export default {
  computed: mapState(["userName", "depositRequests", "signalrConnected"]),
  methods: {
    ...mapActions(["connectSignalR", "updateDepositRequest"]),
    confirmBankDepositButtonClick: async function(depositRequestId) {
      let formData = new FormData();
      formData.append("depositRequestId", depositRequestId);

      try {
        let result = (await axios({
          method: "post",
          url: "/api/TrustedWallet/ConfirmBankDeposit",
          data: formData,
          config: {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          }
        })).data;

        this.updateDepositRequest(result);
      } catch (e) {
        this.$alert("服务器端发生了错误.");
      }
    }
  },
  mounted: function() {
    this.connectSignalR();
  }
};
</script>

<style>
.top {
  background-image: linear-gradient(-180deg, #505480 0%, #605080 100%);
  border-bottom: 5px solid rgba(255, 255, 255, 0.3);
  box-sizing: border-box;
  margin-bottom: 50px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.01);
}

.title {
  margin-top: 0;
  margin-bottom: 0;
  padding-left: 30px;
  padding-top: 30px;
  padding-bottom: 80px;
  background-position: bottom 45px center;
  background-size: 150px auto;
  color: white;
  font-size: 28px;
}

.input-wrapper {
  position: relative;
  margin-bottom: 16px;
}

h1 {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 20px 0;
}

h3 {
  font-weight: 700;
  font-size: 22px;
  color: #3f3f3f;
  margin-top: 0;
  margin-bottom: 10px;
}

label {
  display: block;
  color: #26294a;
  font-weight: 600;
  margin-bottom: 6px;
}

hr {
  display: block;
  height: 1px;
  border: 0;
  border-top: 1px solid #c5c7d6;
  margin: 25px 0;
  padding: 0;
}
</style>

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