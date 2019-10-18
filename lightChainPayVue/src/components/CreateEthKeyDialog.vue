<template>
  <el-dialog
    :visible="visible"
    @close="$emit('update:visible', false)"
    @open="errorMessage=''"
    width="30%"
    title="设置资金密码"
    v-loading="loading"
  >
    <span>请输入资金密码</span>
    <el-input id="ethKeyPasswordInput" type="password" v-model="ethKeyPassword" placeholder="密码"></el-input>
    <span slot="footer" class="dialog-footer">
      <span class="error">{{ errorMessage }}</span>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="createEthKeyClick">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapMutations, mapActions } from "vuex";

export default {
  props: ["visible"],
  data: function() {
    return {
      loading: false,
      ethKeyPassword: "",
      errorMessage: ""
    };
  },
  methods: {
    ...mapMutations(["setErrorMessage"]),
    ...mapActions(["createEthKey"]),

    createEthKeyClick: function() {
      let password = this.ethKeyPassword;
      if (!password || password.length < 6) {
        this.errorMessage = "密码长度不足";
        return;
      }

      this.loading = true;
      let self = this;
      let encKey = null;
      setTimeout(async () => {
        try {
          encKey = await self.createEthKey(password);
        } catch (error) {
          self.setErrorMessage(error);
        }

        self.loading = false;
        this.$emit("update:visible", false);

        if (encKey) {
          this.$emit("eth-key-created", encKey);
        }
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
