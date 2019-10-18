<template>
    <div>

    <b-navbar class="top">      
        <h3 class="title2" style="width: 100% ">Mr.Coin是以太坊稳定币的闪速钱包</h3>     
        <h3 class="title2" style="width: 100% ">提现记录</h3>      
    </b-navbar>  
 <el-table
    :data="tableData"
    border
     :default-sort = "{prop: 'date', order: 'descending'}"
    style="width: 100%">
    <el-table-column
      prop="date"
      label="日期"
      sortable
      width="180">
    </el-table-column>
    <el-table-column
      prop="name"
      label="提现地址"
      width="180">
    </el-table-column>
        <el-table-column
      prop="name"
      label="提现账号"
      width="180">
    </el-table-column>
        <el-table-column
      prop="name"
      label="金额"
      width="180">
    </el-table-column>
    <el-table-column
      prop="address"
      label="提现识别码">
    </el-table-column>
  </el-table>
    <div class="block">
    <el-pagination
      @size-change="WithdrawDepositTableDataS"
      @current-change="WithdrawDepositTableDataC"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="10"
      layout="sizes, prev, pager, next"
      :total='total'>
    </el-pagination> 
  </div>
    </div>
</template>
<script>
//import { mapMutations, mapActions } from "vuex";
import axios from "axios";
export default {
    data() {
        return {  

             tableData:[{
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
        }, {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
        }, {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }],
             loading:true,
             total:10,
             pagesize:10,
              pageindex:1,
          }
    },
    
    watch:{},
    created: function() {},
    computed: {},
    mounted:function(){
        this.WithdrawDepositTableDataS(10);
    },
    methods: {
      WithdrawDepositTableDataS:async function(val){
            this.pagesize=val
            try {
                 let url = '';
                 let clientData = (await axios.get(url)).data;
                 this.loading=false
               }
               catch(e) {
                   console.log(e)
               }
          
      },
      // 分页请求
    WithdrawDepositTableDataC:async function(val){
      this.pageindex=val
      try {
            let url = '';
            let clientData = (await axios.get(url)).data;
            this.loading=false
          }
          catch(e) {
              console.log(e)
          }
      },
}
}
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
