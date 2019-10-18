<template>
  <div>
    <b-navbar class="top" >      
        <h2 class="title" >OrderCustomerService</h2>      
    </b-navbar>
    <audio src="./video/comePayment.mp3"></audio>
    <div>
        <!-- <div class="flex-container">
            <div>总金额: {{totalCurrencyPrice}}; </div>
            <div>成功金额: {{totalCurrencyPaid}}; </div>
            <div>成功金额率: {{(paidCurrencyPercentage*100).toFixed(1)}}%; </div>
        </div>
        <div class="flex-container">

            <div>总笔数: {{totalNumber}}; </div>
            <div>成功笔数:{{paidNumber}}; </div>
            <div>笔数成功率:{{(paidNumberPercentage*100).toFixed(1)}}%; </div>
        </div> -->
        <br>
          <el-dialog title="个人信息" :visible.sync="visible" style="width:40%;margin:0 auto">
                <div>上级ID:<el-button type="text" slot="reference" @click="ShowRelation(userProfile.parentUserId)">{{userProfile.parentUserId}}</el-button></div>
                <div>姓名:{{userProfile.realName}}</div>
                <div>{{userProfile.userName}}</div>
            </el-dialog>
        <div>
          <div>
                        <el-dialog title="交易记录" :visible.sync="logTableVisible" :modal="false" @open="handleOpen">
                <div slot="footer"><div id="qrcode"></div></div>
                <el-table :data="logTableData">
                    <el-table-column property="amount" label="应收金额" width="150"></el-table-column>
                    <el-table-column property="receiverAccountNumber" label="收款账号" width="200"></el-table-column>
                    <el-table-column property="status" label="状态" width="150"></el-table-column>
                    <el-table-column width="300" label="时间">
                        <template slot-scope="scope">
                            {{scope.row.transactionTime.substring(0,10)}}   {{scope.row.transactionTime.substring(11,19)}}
                        </template>
                    </el-table-column>
                </el-table>
                
            </el-dialog>
          </div>
          <div>
              <!-- 订单 -->
              <el-select style="margin-left:10px;" v-model="orderStatus" @change="OnQueryAccountNumber(orderStatus,datatime,receivedUserName,receivedAccountName)" placeholder="请选择订单状态">
                        <el-option v-for="item in orderStatuss"
                                   :key="item.value"
                                   :label="item.label"
                                   :value="item.value">
                        </el-option>
              </el-select>
              <!-- 时间选择 -->

                  <el-date-picker
                    v-model="datatime"
                    style="margin-left:10px;"
                    @change="OnQueryAccountNumber(orderStatus,datatime,receivedUserName,receivedAccountName)"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
                  </el-date-picker>              
                    <el-input style="width: 10rem;margin-left:10px;" v-model="orderId" @blur="GetPaymentDetailByFilter(orderId)" clearable placeholder="请输入订单号"></el-input>
                    <el-input style="width: 10rem;margin-left:10px;" clearable v-model="receivedUserName" @blur="OnQueryAccountNumber(orderStatus,datatime,receivedUserName,receivedAccountName)" placeholder="请输入收款手机号"></el-input>
                    <el-input style="width: 10rem;margin-left:10px;" clearable v-model="receivedAccountName" @blur="OnQueryAccountNumber(orderStatus,datatime,receivedUserName,receivedAccountName)" placeholder="请输入收款账号"></el-input>
                    <!-- <el-button style="" @click="OnQueryNumber()">搜索</el-button> -->
                    <el-button style="padding:10px;" @click="handEmpty()">清空选项</el-button>
          </div>

        </div>
        <!-- only?querydata:paginationData -->
        <el-table :data="only?querydata:paginationData"
                          stripe
                          border
                          style="width: 100%">
                    <el-table-column prop="id"
                                     width="80"
                                     label="ID">
                    </el-table-column>
                    <el-table-column prop="orderNumber"
                                     width="180"
                                     label="订单号">
                    </el-table-column>
                    <!-- <el-table-column prop="merchantName"
                                     label="商户">
                    </el-table-column> -->

                    <el-table-column prop="currencyToCharge"
                                     label="应支付金额">
                    </el-table-column>
                    <el-table-column prop="currencyPaid"
                                     label="已支付金额">
                    </el-table-column>
                    <el-table-column label="支付状态">
                        <template slot-scope="scope">

                            <div :style="{color:(scope.row.status!='Released'?(scope.row.status=='EscrowCancelled'?'red':'black'):'green')}">{{scope.row.status}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="收款手机号">
                        <template slot-scope="scope">
                            <el-button type="text" slot="reference" @click="ShowRelation(scope.row.userProfile[0].userId);">{{scope.row.senderUserName}}</el-button>
                        </template>
                    </el-table-column>
                        <el-table-column fixed="right" label="channel操作">
                        <template slot-scope="scope">

                            <el-button style="padding:10px;" @click="scope.row.adminPaused?ChannelResume(scope.row.channelId):ChannelPasued(scope.row.channelId)"  >{{scope.row.adminPaused?"恢复":"暂停"}}</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="payRobotAccountName"
                                     label="收款账号">
                        <template slot-scope="scope">
                            <el-button type="text" slot="reference" @click="ShowTransferLogs(scope.row.payRobots[0].name);">{{scope.row.payRobots[0].name}}</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTime"
                                     label="订单创建时间">
                        <template slot-scope="scope">
                            {{scope.row.createTime.substring(0,10)}} {{scope.row.createTime.substring(11,19)}}
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.currencyPaid" placeholder="支付金额"></el-input>
                            <el-button @click="setCurrencyPaid(scope.row)" type="text">设置支付金额</el-button>
                            <el-button v-if="scope.row.status=='Escrowed'" @click="handleClick(scope.row.id,scope.row.currencyToCharge,scope.row.orderNumber)" type="text">释放</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-button style="padding:10px;" v-if="only" @click="previousPage()">上一页</el-button><el-button style="padding:10px;" v-if="only" @click="nextPage()">下一页</el-button>

    </div>
  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";
import QRCode from 'qrcodejs2'
import axios from'axios'
import jq from 'jquery'
export default {
  data: function() {
    return {
      totalCurrencyPrice:1,
      totalCurrencyPaid:1,
      paidCurrencyPercentage:1,
      totalNumber:1,
      paidNumber:1,
      paidNumberPercentage:1,
      visible: false,
      orderStatus:"",
      orderStatuss: [{ value: "Escrowed", label: "等待支付" }, { value: "EscrowCancelled", label: "取消支付" }, { value: "Released", label: "支付成功" }],
      startTime:"",
      endTime:"",
      // 订单号
      orderId:"",
      // 收款手机号
      receivedUserName:"",
      //收款账号
      receivedAccountName:"",
      datatime:["2019-09-01 00:00:00",""],
      logTableVisible:false,
      currentPage:0,
      userProfile:{"realName":"","userName":"","parentUserId":""}


    }
  },
  mounted() {
  //  this.PersonalData();
  //  this.getUserProfile();
  },

  components: {QRCode},
  computed: mapState({
    userName: "userName",
    signalrConnected: "signalrConnected",
    channelRequests: "receiverChannelRequests",
    channels: "receiverChannels",
    sortchanels:"AfterSortedChanners",
    querydata:"orderDatas",
    userProfileData:"userProfileData",
    appAlipayAccount:"appAlipayAccount",
    only:"only",
    logTableData:"logTableData",
    tolnumber:"tolnumber",
    totalPage:"totalPage",
    counts:"counts",
    paginationData:"paginationData",
    recode:"recode"

  }),
  methods:{
    ...mapActions(["GetUserProfileByUserId","getUserProfile","PersonalData",
                    "releaseButton","doSetCurrencyPaid","handleNextChange",
                    "ShowBankTransferLogs","GetPaymentDetailByFilter",
                    "ChPasued","ChResume"]),
    ...mapMutations(["setBankTransferLogs","pagination"]),
    previousPage(){
      this.$store.state.currentPage-=1;
      this.pagination();
    },
    nextPage(){
      this.$store.state.currentPage+=1;
      this.pagination();
    },
    qrcodeScan (val) {//生成二维码
      this.$nextTick(function() {
        // document.getElementById("qrcode").innerHTML = "";
        jq("#qrcode").empty();
        let qrcode = new QRCode("qrcode", {
          width: 132,
          height: 132,
          text: val, // 二维码内容 也可以放url
        });
        });
      },
    ShowRelation:function(val){   
      var upd=this.sortchanels.filter(it=>it.userProfile[0].userId==val);
      this.userProfile.realName=upd[0].userProfile[0].realName;
      this.userProfile.userName=upd[0].userProfile[0].userName;
      this.userProfile.parentUserId=upd[0].userProfile[0].parentUserId;
      this.visible = true
    },
    handleOpen(){
      setTimeout(console.log, 0, "open: "+jq("#qrcode").html())
    },
    handEmpty(){
      this.$store.state.only=1;
      this.orderId=""
      // 收款手机号
      this.receivedUserName="";
      //收款账号
      this.receivedAccountName="";
      this.orderStatus="";
    },
  handleClick(row, amount, orderNumber) {
      this.$confirm('此操作将进行释放,请确认,金额,单号是否正确!!', "金额:" + amount + "元," + "订单号:" + orderNumber, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).then(() => {
          //释放操作
          this.releaseButton(row);
          this.handEmpty();
          this.$message({
              type: 'success',
              message: '释放成功!'
          });
      }).catch(() => {
          this.$message({
              type: 'info',
              message: '已取消释放'
          });
      });
    },
    ChannelResume:async function(val){
            this.$confirm('此操作将进行恢复操作', '是否继续', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).then(async () => {
         let formData = new FormData();
            formData.append("pasuedType", "Admin");
            formData.append("channelId",val);
      let result = (await axios({
                method: "post",
                url: "api/Channels/ChannelResume",
                data: formData,
                config: {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                },
            })).status;
          if(result==200){
            this.$message({
              type: 'success',
              message: '恢复成功!'
          });
          }else{
              this.$message({
              type: 'info',
              message: '恢复失败!'
          });
          };
      }).catch(() => {
          this.$message({
              type: 'info',
              message: '已取消'
          });
      });
    },
    ChannelPasued:async function(val){
          this.$confirm('此操作将进行暂停操作', '是否继续', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).then( async() => {
            let formData = new FormData();
            formData.append("pasuedType", "Admin");
            formData.append("channelId",val)
            let result = (await axios({
                method: "post",
                url: "api/Channels/ChannelPasued",
                data: formData,
                config: {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                },
            })).status;
          if(result==200){
            this.$message({
              type: 'success',
              message: '暂停成功!'
          });
          }else{
              this.$message({
              type: 'info',
              message: '暂停失败!'
          });
          }

      }).catch(() => {
          this.$message({
              type: 'info',
              message: '已取消'
          });
      });
    },
      ShowTransferLogs(val,userId){
        this.ShowBankTransferLogs(val);
        var qrcode = this.sortchanels.filter(it=>it.payRobots[0].name==val);
        // 调用生成二维码方法,传入图片网址;
        this.qrcodeScan(qrcode[0].payRobots[0].appAlipayAccount.imageTags[0].tagImage); 
        this.logTableVisible = true;    
      },
    setCurrencyPaid(row) {
    this.$confirm('此操作将进行设置支付金额,请确认。', "金额:" + row.currencyPaid + "元," + "订单号:"
        + row.orderNumber, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            this.doSetCurrencyPaid(row);
            this.handEmpty();
            this.$message({
                type: 'success',
                message: '释放成功!'
            });
        }).catch(() => {
            this.$message({
                type: 'info',
                message: '已取消释放'
            });
        });
        },
    isEmpty(obj){
        if (obj==""){
            return true
        }else{
            return false
        }
    },
    OnQueryAccountNumber(orderStatus,datatime,receivedUserName,receivedAccountName){
              this.$store.state.paginationData= this.$store.state.AfterSortedChanners.filter(it=>(this.isEmpty(receivedAccountName)||it.payRobots[0].name==receivedAccountName)
                                            &&(this.isEmpty(datatime[0])||it.createTime.substring(0,10)+" "+it.createTime.substring(11,19)>datatime[0])
                                            &&(this.isEmpty(datatime[1])||it.createTime.substring(0,10)+" "+it.createTime.substring(11,19)<datatime[1])
                                            &&(this.isEmpty(receivedUserName)||it.senderUserName==receivedUserName)
                                            &&(this.isEmpty(orderStatus)||it.status==orderStatus)
                                            )
            this.$store.state.only=0;
            console.log(this.$store.state.paginationData);
        }

  }
};
</script>
<style scoped>
    .title{
      margin: 0 auto;
    }
        .flex-container {
        display: -webkit-flex;
        display: flex;
        -webkit-flex-direction: row;
        flex-direction: row;
    }
    * {
        margin: 0;
        padding: 0;
    }
    
    body {
        text-align: center
    }
</style>