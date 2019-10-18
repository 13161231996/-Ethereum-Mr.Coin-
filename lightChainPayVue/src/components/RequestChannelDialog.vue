<template>
  <el-dialog
    :visible="visible"
    @close="$emit('update:visible', false)"
    @open="errorMessage=''"
    width="21rem"
    title="请求新的通道"
    v-loading="loading"
  >
  <div>请先选择您想与之交易的做市商账户:</div>
    <el-select v-model="senderEthAccountId" placeholder="做市商账户">
      <el-option
        v-for="sea in senderEthAccounts"
        :key="sea.id"
        :label="sea.userName + ':' + sea.address"
        :value="sea.id"
      ></el-option>
    </el-select>
    <br>然后选择您想使用的收币账户：
    <el-select v-model="myEthAccountId" placeholder="收币账户">
      <el-option v-for="ea in ethAccounts" :key="ea.id" :label="ea.address" :value="ea.id"></el-option>
    </el-select>
    <br>币种：
    <el-select v-model="tokenConfiguration" value-key="id" placeholder="币种">
      <el-option v-for="tc in tokenConfigurations" :key="tc.id" :label="tc.code" :value="tc"></el-option>
    </el-select>
    <br>
    <div>金额:</div>
    <el-input v-model="amount" width="10em" placeholder="金额"></el-input>
    <span slot="footer" class="dialog-footer">
      <span class="error">{{ errorMessage }}</span>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="requestChannelClick">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import BigNumber from "bignumber.js";

export default {
  props: ["visible"],
  data: function() {
    return {
      loading: false,
      errorMessage: "",

      senderEthAccountId: null,
      myEthAccountId: null,
      tokenConfiguration: {},
      amount: 0
    };
  },
  computed: {
    ...mapState(["tokenConfigurations", "ethAccounts", "senderEthAccounts"])
  },
  methods: {
    ...mapMutations(["setErrorMessage"]),
    ...mapActions(["requestChannel"]),

    requestChannelClick: function() {
      let amount = new BigNumber(this.amount);
      let tokenConfiguration = this.tokenConfiguration;
      amount = amount.shift(tokenConfiguration.decimals);
      if (!amount.gt(0)) {
        this.errorMessage = "金额必须大于0";
        return;
      }
      if (!this.senderEthAccountId || !this.myEthAccountId) {
        this.errorMessage = "请选择账号";
        return;
      }

      this.loading = true;
      let self = this;
      setTimeout(async () => {
        try {
          await self.requestChannel({
            senderEthAccountId: self.senderEthAccountId,
            myEthAccountId: self.myEthAccountId,
            chainId: tokenConfiguration.chainId,
            tokenCode: tokenConfiguration.code,
            decimals: tokenConfiguration.decimals,
            amountText: amount.toString()
          });
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
.error {
  color: red;
}

.el-select {
  width: 18em;
}

.el-input {
  width: 10em;
}
</style>
