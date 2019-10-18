<template>
  <el-dialog
    title="导入以太坊账户私钥"
    :visible="visible"
    @close="$emit('update:visible', false)"
    @open="errorMessage=''"
    width="21rem"
    v-loading="loading"
  >
    <span>请输入资金密码</span>
    <el-input class="input_size" id="ethKeyPasswordInput" type="password" v-model="ethKeyPassword" placeholder="密码"></el-input>
    <br>
    <span>请粘贴以太坊账号私钥</span>
    <el-input class="input_size"
      id="ethPrivateKeyInput"
      type="textarea"
      v-model="ethPrivateKey"
      placeholder="private key"
    ></el-input>
    <span slot="footer" class="dialog-footer">
      <span class="error">{{ errorMessage }}</span>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="importPrivateKeyClick">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import * as CryptoUtil from "../CryptoUtil";
import * as CryptoHelper from "../CryptoHelper";

export default {
  props: ["visible"],
  data: function() {
    return {
      loading: false,
      ethKeyPassword: "",
      ethPrivateKey: "",
      errorMessage: ""
    };
  },
  computed: mapState(["userName", "ethKey"]),
  methods: {
    ...mapMutations(['setErrorMessage']),
    ...mapActions(["importPrivateKey"]),
    importPrivateKeyClick() {
      let password = this.ethKeyPassword;
      let privateKey = this.ethPrivateKey;
      let self = this;

      this.loading = true;
      this.errorMessage = "";

      setTimeout(async () => {
        let encKey;
        try {
          encKey = CryptoHelper.recoverEthKey(self.ethKey, password);
        } catch {
          self.errorMessage = "资金密码错误";
        }
        try {
          privateKey = CryptoUtil.hexToBuffer(privateKey);
          if (privateKey.length != 32) {
            throw "Wrong private key length.";
          }
        } catch {
          self.errorMessage = "私钥格式错误";
        }

        if (self.errorMessage != "") {
          self.loading = false;
          return;
        }

        try {
          await self.importPrivateKey({ encKey, privateKey });
        } catch (error) {
          self.setErrorMessage(error);
        }

        self.loading = false;
        this.$emit("update:visible", false);
      }, 100);
    }
  }
};
</script>

<style scoped>
.input_size{
  width:16rem;
}
.error {
  color: red;
}
</style>
