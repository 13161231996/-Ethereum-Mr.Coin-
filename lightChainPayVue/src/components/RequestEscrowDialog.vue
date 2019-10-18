<template>
  <el-dialog
    :visible="visible"
    @close="$emit('update:visible', false)"
    @open="errorMessage=''"
    width="21rem"
    title="发起新的支付"
    v-loading="loading"
  > 
    <div>
    <el-select v-model="payMethod" placeholder="支付方式">
      <el-option label="支付宝转卡" value="BankTransferViaAlipay"></el-option>
      <el-option label="支付宝" value="Alipay"></el-option>
      <el-option label="支付宝个码" value="AlipayPersonal"></el-option>
      <el-option label="微信" value="WechatPay"></el-option>       
    </el-select>
    </div>
    <br />
    <div>
    <el-select v-model="payInterface" placeholder="支付界面">
      <el-option label="PaysApi" value="PaysApi"></el-option>
      <el-option label="LightChainPayRobot" value="LightChainPayRobot"></el-option>
    </el-select> 
    </div>
    <br />
    <div style="width:15.8rem;margin:0 auto">
      <div class="form_req">
      <div style="line-height:3rem">订单号:</div><div><el-input v-model="orderNumber"></el-input></div>
      </div>
      <br>
      <div class="form_req">
      <div style="line-height:3rem">客户ID:</div><div><el-input v-model="customerId"></el-input></div>
      </div>
      <br>
      <div class="form_req">
      <div style="line-height:3rem">商品名称:</div><div><el-input v-model="commodityName"></el-input></div>
      </div>
      <br>
      <div class="form_req">
      <div style="line-height:3rem">法币价格:</div><div><el-input v-model="currencyPrice" placeholder="法币价格"></el-input></div>
      </div>
    </div>   
    <span slot="footer" class="dialog-footer">
      <span class="error">{{ errorMessage }}</span>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="requestEscrowClick">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
//import BigNumber from "bignumber.js";

export default {
  props: ["visible", "channel"],
  data: function() {
    return {
      loading: false,
      errorMessage: "",

      orderNumber: new Date().getTime(),
      customerId: "18812345678",
      commodityName: "100点卡",
      currencyPrice: 2,
      payInterface: "LightChainPayRobot",
      payMethod: "BankTransferViaAlipay"
    };
  },
  computed: {
    ...mapState(["tokenDecimals"])
  },
  methods: {
    ...mapMutations(["setErrorMessage"]),
    ...mapActions(["createPayment"]),

    requestEscrowClick: function() {
      let price = parseFloat(this.currencyPrice);
      if (!(price > 0)) {
        this.errorMessage = "金额必须大于0";
        return;
      }
      this.loading = true;
      let self = this;
      setTimeout(async () => {
        try {
          await self.createPayment({
            channelId: self.channel.id,
            orderNumber: self.orderNumber,
            customerId: self.customerId,
            commodityName: self.commodityName,
            payMethod: self.payMethod,
            payInterface: self.payInterface,
            currencyPrice: price
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
.form_req{
      display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: row;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    height: 3rem;
}
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
