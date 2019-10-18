<template>
  <div>
    <b-navbar class="top">
      <b-container class="bv-example-row" fluid>
        <h3 class="title" style="width: 100% ">Mr.Coin是以太坊稳定币的闪速钱包</h3>
      </b-container>
    </b-navbar>
    <b-container>
      <b-row class="register-body">
        <b-col class="register-container" cols="11" md="5">
          <el-form
            v-loading="action != ''"
            :element-loading-text="action"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
          >
            <h3>注册新用户</h3>
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="userName"></el-input>
            </el-form-item>
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="email"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="password" type="password"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="confirmPassword" type="password"></el-input>
            </el-form-item>
            <el-form-item class="extra-text">
              <router-link :to="{path: '/login'}" class="reg-text" title="返回登录">返回登录</router-link>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="registerButtonClick" style="width: 100%;">注册</el-button>
            </el-form-item>
          </el-form>
        </b-col>
        <b-col cols="0" md="1"></b-col>
        <b-col class="register-text" cols="11" md="5">
          <h3>快速。</h3>
          <p>基于离链签名技术，完成支付仅需数秒。支持OTC一键快速充值。</p>
          <h3>友好。</h3>
          <p>交易界面适合所有用户使用。不受审查和监管。</p>
          <h3>安全。</h3>
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
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",

      action: ""
    };
  },
  computed: mapState(["transaction"]),
  methods: {
    ...mapMutations(["setClientData"]),
    ...mapActions(["register"]),
    registerButtonClick: async function() {
      if (
        this.userName == "" ||
        this.email == "" ||
        this.password == "" ||
        this.confirmPassword == ""
      ) {
        this.$alert("请正确填写注册信息.");
        return;
      }
      if (this.password != this.confirmPassword) {
        this.$alert("密码和确认密码不一致.");
        return;
      }

      this.action = "正在注册用户...";
      let transactionId = this.transaction ? this.transaction.id : 0;

      try {
        await this.register({
          userName: this.userName,
          email: this.email,
          password: this.password,
          transactionId: transactionId
        });
      } catch (e) {
        this.$alert(e);
      }

      this.action = "";
    }
  }
};
</script>

<style scoped>
.register-body {
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.extra-text {
  margin-bottom: 0;
  padding-left: 2px;
}

.extra-text a {
  font-size: 12px;
  color: #aaa;
}

.extra-text a:hover {
  color: #29e;
}

.extra-text .reg-text {
  top: 4px;
  right: 2px;
}

.register-container {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}

.register-container .title {
  margin: 0px auto 20px auto;
  text-align: center;
  color: #505458;
}
.register-text {  
  padding: 45px 15px 45px 15px;
}
</style>