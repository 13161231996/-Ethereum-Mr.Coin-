<template>
  <div>
    <b-navbar class="top">      
        <h3 class="title" style="width: 100% ">Mr.Coin是以太坊稳定币的闪速钱包</h3>      
    </b-navbar>
    <b-container>
      <b-row class="login-body">
        <b-col class="login-container" cols="11" md="5">
          <el-form
            v-loading="action != ''"
            :element-loading-text="action"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
          >
            <h3>登录</h3>
            <el-form-item label="用户名" prop="username">
              <el-input id="userNameInput" v-model="userName"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="emain">
              <el-input v-model="password" type="password"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loginButtonClick" style="width: 100%;">登录</el-button>
            </el-form-item>
            <el-form-item class="extra-text">
              <a href="javascript:;" class="forget-pwd" title="找回密码">忘记密码?</a>
              还没有Mr.Coin账号？
              <router-link :to="{path: '/register'}" title="立即注册">请立即注册</router-link>
            </el-form-item>
          </el-form>
        </b-col>
        <b-col cols="0" md="1"></b-col>
        <b-col class="login-text" cols="11" md="5">
          <h3>快速</h3>
          <p>基于离链签名技术，完成支付仅需数秒。支持OTC一键快速充值。</p>
          <h3>友好</h3>
          <p>交易界面适合所有用户使用。不受审查和监管。</p>
          <h3>安全</h3>
          <p>基于端对端加密技术和智能合约资金托管，您的数字资产完全由您控制。</p>
        </b-col>
      </b-row>
    </b-container>    
  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  data: function() {
    return {
      userName: "twtest03",
      password: "abcd-zxcv",

      action: ""
    };
  },
  computed: mapState(["transaction"]),
  methods: {
    ...mapMutations(["setClientData"]),
    ...mapActions(["login"]),
    loginButtonClick: async function() {
      
      if (!window.clientData) {
         
        var clientData = {
          userName: "twtest1",
          chainId: 42,
          tokenConfigurations: [
            {
              id: 1,
              chainId: 42,
              code: "WPC",
              name: "World Pay Coin",
              decimals: 6,
              channelManagerAddress:
                "0x45868042fbf60a1c47e5167bcb4d2caebe8aec57",
              walletManagerAddress:
                "0x988e7a81702d4f7546fd92d11a6a674cb0d8d8b0",
              address: "0x4256489258e63fc4b579126b9cba0c7d3a86570b"
            },
            {
              id: 2,
              chainId: 42,
              code: "LCC",
              name: "Light Chain Coin",
              decimals: 3,
              channelManagerAddress:
                "0xff2930e56c0ed280f13bddb24ad3de668c6f585b",
              walletManagerAddress:
                "0xab09ee54690efb5c9354f1c409c403e608066a55",
              address: "0x29c15ef1c9a65f97c6f1c6a5c904bdb55f925c25"
            }
          ],
          ethKey: {
            id: 7,
            userName: "twtest1",
            salt:
              "383ec78cbc33b47c0db33adec25a7030521df033724daf46d090d43c5849c9d0",
            pbkdf2Iterations: 756,
            signature:
              "0x5340fbe3015ddd258babdb48ebaf6387a6aab6307711dc0c277b5ba0e3cc8d364284f17a9e11bd6ccf0008da4c1dd7aed2b4356b649e5c4e4537436daa1433ac1b"
          },
          ethAccounts: [
            {
              id: 3,
              userId: "a7fbe47a-6a38-42f6-a9c7-9cf2db3aa0ad",
              userName: "twtest1",
              address: "0xe4ccd6df40340159962d54537b7c99d1e33578bf",
              privateKeyCipherText:
                "039bad850687f0960f08cfc0c134695da295a9a7d11081470d8aa26d49016bd9",
              initialVector: "45cbfcfd9d1650efdc1f8ac6e66e79c7"
            }
          ],
          trustedWalletSummaries: [
            {
              id: 2,
              userName: "twtest1",
              networkId: 42,
              address: "0xe4ccd6df40340159962d54537b7c99d1e33578bf",
              tokenCode: "WPC",
              decimals: 6,
              depositText: "32000000",
              sentValueText: "30300000",
              receivedValueText: "0",
              receiverWithdrawnText: "0",
              receiverBalanceProofSignature: null,
              deposit: "[object BigNumber]",
              depositDisplay: "32",
              sentValue: "[object BigNumber]",
              sentValueDisplay: "30.3",
              senderBalance: "[object BigNumber]",
              senderBalanceDisplay: "1.7",
              receivedValue: "[object BigNumber]",
              receivedValueDisplay: "0",
              receiverWithdrawn: "[object BigNumber]",
              receiverWithdrawnDisplay: "0"
            }
          ],
          transaction: null,
          waitingDepositRequestCount: 0,
          signalrConnected: true,
          errorMessage: ""
        };
       
        this.setClientData(clientData);
        return;
      }

      this.action = "正在登录...";
      
      try {
        // this.PersonalData();
        await this.login({
          username: this.userName,
          password: this.password          
        });
      } catch (e) {
        this.$alert("登录失败.");
      }

      this.action = "";
    }
  }
};
</script>
<style scoped>
.login-body {
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.extra-text {
  margin-bottom: 0;
  padding-left: 2px;
}

.extra-text a:hover {
  color: #29e;
}

.extra-text .reg-text {
  top: 4px;
  right: 2px;
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

.login-container .title {
  margin: 0px auto 20px auto;
  text-align: center;
  color: #505458;
}

.login-text {
  padding: 45px 15px 45px 15px;
}
</style>