<template>
  <el-dialog
    title="导入以太坊账户私钥"
    :visible="visible"
    @close="$emit('update:visible', false)"
    @open="errorMessage=''"
    width="21rem"
    v-loading="loading"
  >
    请输入资金密码:
    <el-input style="width:16rem;" id="ethKeyPasswordInput" type="password" v-model="ethKeyPassword" placeholder="密码"></el-input>
    <br>PaysApi商户号:
    <el-input style="width:16rem;"  v-model="paysApiUid" placeholder="商户号"></el-input>
    <br>PaysApi秘钥:
    <el-input style="width:16rem;"  v-model="paysApiToken" placeholder="秘钥"></el-input>
    <span slot="footer" class="dialog-footer">
      <span class="error">{{ errorMessage }}</span>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="importPaysApiAccountClick">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import * as CryptoHelper from "../CryptoHelper";

export default {
  props: ["visible"],
  data: function() {
    return {
      loading: false,
      ethKeyPassword: "",
      paysApiUid: "",
      paysApiToken: "",
      errorMessage: ""
    };
  },
  computed: mapState(["userName", "ethKey"]),
  methods: {
    ...mapMutations(["setErrorMessage"]),
    ...mapActions(["importPaysApiAccount"]),
    importPaysApiAccountClick() {
      let password = this.ethKeyPassword;
      let uid = this.paysApiUid;
      let token = this.paysApiToken;
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
          if (uid.length < 10 || token < 10) {
            throw "Wrong input.";
          }
        } catch {
          self.errorMessage = "输入错误";
        }

        if (self.errorMessage != "") {
          self.loading = false;
          return;
        }

        try {
          await self.importPaysApiAccount({ encKey, uid, token });
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
  
}
.error {
  color: red;
}

.el-input {
  width: 25em;
}
</style>
