<template>
  <el-dialog
    :visible="visible"
    @close="$emit('update:visible', false)"
    @open="errorMessage=''"
    width="21rem"
    title="解锁以太坊账户"
    v-loading="loading"
  >
    <span>请输入资金密码</span>
    <el-input id="ethKeyPasswordInput" type="password" v-model="ethKeyPassword" placeholder="密码"></el-input>
    <span slot="footer" class="dialog-footer">
      <span class="error">{{ errorMessage }}</span>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="unlockEthKeyClick">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState } from "vuex";
import * as CryptoHelper from "../CryptoHelper";

export default {
  props: ["visible"],
  data: function() {
    return {
      loading: false,
      ethKeyPassword: "",
      errorMessage: ""
    };
  },
  computed: mapState(["userName", "ethKey"]),
  methods: {
    unlockEthKeyClick: function() {
      let password = this.ethKeyPassword;
      let self = this;

      this.loading = true;
      this.errorMessage = "";

      setTimeout(() => {
        let encKey;
        try {
          encKey = CryptoHelper.recoverEthKey(self.ethKey, password);
        } catch {
          self.errorMessage = "资金密码错误";
          self.loading = false;
          return;
        }

        self.loading = false;
        this.$emit("update:visible", false);
        this.$emit("eth-key-unlocked", encKey);
      }, 100);
    }
  }
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
