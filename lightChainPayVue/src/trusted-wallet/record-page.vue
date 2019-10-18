<template>
  <div>
    <b-navbar class="top">
      <h3 class="title2" style="width: 100% ">Mr.Coin是以太坊稳定币的闪速钱包</h3>
    </b-navbar>
    <el-table v-loading="loading" :data="tableData" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <!-- 
    <el-table-column
      prop="userName"
      label="用户名"
      width="180">
    </el-table-column>
      -->
      <el-table-column prop="tokenCode" label="代币代码" width="180"></el-table-column>
      <el-table-column prop="tokenAmount" label="代币数量" width="180"></el-table-column>
      <el-table-column prop="state" label="付款状态" width="180"></el-table-column>
      <!-- 
    <el-table-column
      prop="payMethod"
      label="支付方式">
    </el-table-column>
      -->
      <el-table-column prop="createTime" :formatter="dateFormat" label="创建时间"></el-table-column>
      <!--
    <el-table-column
      prop="waitingPayConfirmationTime"
      :formatter="dateFormat"
      label="等待确认时间">
    </el-table-column>
      -->
    </el-table>
    <div class="block">
      <el-pagination
        @size-change="tableDataS"
        @current-change="tableDataC"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="10"
        layout="sizes, prev, pager, next"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
//import { mapMutations, mapActions } from "vuex";
import axios from "axios";
import moment from "moment";
export default {
  data() {
    return {
      tableData: undefined,
      loading: true,
      total: undefined,
      pagesize: 10,
      pageindex: 1
    };
  },

  watch: {},
  created: function() {},
  computed: {},
  mounted: function() {
    this.tableDataS(10);
  },
  methods: {
    dateFormat: function(row, column) {
      var date = row[column.property];
      if (date == undefined) {
        return "";
      }
      return moment(date).format("YYYY-MM-DD HH:mm:ss");
    },
    tableDataS: async function(val) {
      this.pagesize = val;
      try {
        let url = "/api/TrustedWallet/GetDepositRequestsByUserName?userName=";
        url +=
          "7654@163.com" + "&pageIndex=" + this.pageindex + "&pageSize=" + val;
        let clientData = (await axios.get(url)).data;
        this.tableData = clientData.trustedWalletDepositRequest;
        this.total = clientData.recordCount;
        this.loading = false;
      } catch (e) {
        console.log(e);
      }
    },
    tableDataC: async function(val) {
      this.pageindex = val;
      let formData = new FormData();
      formData.append("userName", "7654@163.com");
      formData.append("pageIndex", val);
      formData.append("pageSize", 10);
      try {
        let url = "/api/TrustedWallet/GetDepositRequestsByUserName?userName=";
        url +=
          "7654@163.com" + "&pageIndex=" + val + "&pageSize=" + this.pagesize;
        let clientData = (await axios.get(url)).data;
        this.tableData = clientData.trustedWalletDepositRequest;
        this.total = clientData.recordCount;
        this.loading = false;
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.title2 {
  height: 117px;
  line-height: 50px;
  margin-bottom: 25px;
  position: relative;
  color: white;
  margin-left: 1.5%;
  margin-top: 1%;
}
</style>
