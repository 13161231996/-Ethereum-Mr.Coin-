<template>
  <b-card
    v-loading="action != ''"
    :element-loading-text="action"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    :class="{ settled:channel.status == 'Settled'}"
  >
      <div class="request_lock">               
        <div
              v-if="!accountsUnlocked && channel.status != 'Settled'"
              style=" margin:0 auto;color: darkgoldenrod"
            >请先解锁账户</div>
    </div>
      <br />
      <!-- v-if="accountsUnlocked && channel[0].recestatus == 'Active'" -->
      <div class="escrow-request" v-if="accountsUnlocked && channel[0].recestatus == 'Active'" >
          
        <ul style="padding-left:0rem;">
           
          <li style="text-align: left;list-style-type:none;"  v-for="p in channel" :key="'p' + p.id">

        <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
            <b-button style="background-color:white;color:black;border-style:none;" block href="#" v-b-toggle="'accordion'+p.id" variant="info">  
            <div class="request_lock">          
                <div>{{p.id}}@{{p.createTime.substring(0,10)}} {{ p.createTime.substring(11,19) }}</div>
                
            </div>
            <div class="request_lock">
                <div>应收款:{{ p.currencyToCharge }}</div>
                <div>已收款: {{ p.currencyPaid }}</div>
            </div>
            <div class="request_lock">
                <div>总数量:{{ p.depositDisplay }}</div>
                <div>已释放:{{ p.totalReleasedDisplay }}</div>
            </div>
            <div class="request_lock">
            <div>{{p.commodityName}}</div>
            <div>({{p.status|CurrStatus}})</div>
            </div>
                </b-button>
      </b-card-header>
      <b-collapse :id="'accordion'+p.id"  accordion="my-accordion" role="tabpanel" style="padding:0">
        <b-card-body >

            <div>通道:</div>
            <div>{{ p.senderAddress }}</div>
            
            <div>接收方地址:</div>
            <div>{{ p.receiverAddress }}</div> 
            <div>已托管: {{ p.totalEscrowedDisplay }}</div>
            <div>账号: {{ p.senderUserName }}</div>


            <!-- <div style="text-align: right">
                <span
                v-if="p.status == 'Waiting'"
                >(等待托管)</span>
                <span v-if="p.status=='Escrowed'">(已托管)</span>
                <span v-if="p.status=='Released'">(已释放)</span>
                <span v-if="p.status=='Cancelled'">(已取消)</span>
                <span v-if="p.status=='EscrowCancelled'">(托管已取消)</span>
            </div> -->
            
            <template v-if="role=='receiver'">
              <a
                v-if="p.status=='Escrowed' && p.payInterface=='LightChainPayRobot'"
                target="_blank"
                :href="'/Channels/PaymentRedirect?paymentId=' + p.id"
              >支付页</a>
              <a
                v-if="p.status=='Escrowed' && p.payInterface=='PaysApi'"
                target="_blank"
                :href="'/Channels/PaysApiRedirect?paymentId=' + p.id"
              >支付页</a>
            </template>
            <template v-if="role=='sender'">
              <el-button v-if="p.status=='Waiting'" @click="makeEscrowClick(p)">托管</el-button>
              <el-button v-if="p.status=='Escrowed'" @click="releaseEscrowClick(p)">释放</el-button>
            </template>
                    </b-card-body>
      </b-collapse>
    </b-card>
          </li>
        </ul>
        <br />
      </div>
      
    


    
  </b-card>
</template>

<script>
import RequestEscrowDialog from "./RequestEscrowDialog.vue";
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  props: ["role", "channel"],
  data: function() {
    return {
      requestEscrowDialogVisible: false,
      activeName: '1',
      errorMessage: "",
      action: "",
      channelUser:"",
      prnt:""
    };
  },
  computed: {
    ...mapState(["accountsUnlocked"]),
    // isChannelOnline: function() {
    //   return this.$store.getters.isChannelOnline(this.channel.id);
    // },
    senderSignature: function() {
      return this.channel.senderSignature
        ? this.channel.senderSignature.substr(0, 30) + "..."
        : "";
    }
  },
  filters:{
      CurrStatus:function(val){
          if (val=='Waiting'){
            return "等待托管"
          }else if(val=='Escrowed'){
            return "已托管" 
          }else if (val=='Released'){
            return "已释放"
          }else if (val=='Cancelled'){
            return "已取消"
          }else if (val=='EscrowCancelled'){
            return "托管已取消"
          }
             
      }
  },
  mounted(){
    // this.ChannelUser();
    
  },
  methods: {
    ...mapMutations(["setErrorMessage"]),
    ...mapActions([
      "makeEscrow",
      "releaseEscrow",
      "receiverRequireSettle",
      "receiverSettle",
      "setClosingSignature"
    ]),
    ChannelUser(){
    //   var senderAddress="通道@"+this.channel.senderAddress.substr(0, 8) + '...'
    //   var isChannel =this.isChannelOnline ? "(在线)": "(离线)"
    //   var senderUserName=this.channel.senderUserName
    //   this.channelUser=senderAddress+isChannel+senderUserName;

    },
    makeEscrowClick: async function(payment) {
      this.$confirm("此操作将会进行托管, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        this.action = "正在进行托管...";
        try {
          await this.makeEscrow(payment);
        } catch (error) {
          this.$alert(error);
        }
        this.action = "";
      });
    },
    releaseEscrowClick: async function(payment) {
      this.$confirm("此操作将会执行释放, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        this.action = "正在释放托管...";
        try {
          await this.releaseEscrow(payment);
        } catch (error) {
          this.$alert(error);
        }
        this.action = "";
      });
    },
    // receiverRequireSettleClick: async function() {
    //   this.action = "正在请求结算...";
    //   try {
    //     await this.receiverRequireSettle(this.channel.id);
    //   } catch (error) {
    //     this.$alert(error);
    //   }
    //   this.action = "";
    // },
    receiverSettleClick: async function() {
      this.action = "正在结算...";
      try {
        //await this.setClosingSignature(this.channel);
        await this.receiverSettle(this.channel);
      } catch (error) {
        this.$alert(error);
      }
      this.action = "";
    },
    setClosingSignatureClick: async function() {
      this.action = "正在进行结算签名...";
      try {
        await this.setClosingSignature(this.channel);
      } catch (error) {
        this.$alert(error);
      }
      this.action = "";
    }
  },
  components: {
    RequestEscrowDialog
  }
};
</script>

<style scoped>
.request_lock{
     display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: row;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
}
.el-card {
  height: auto;
  display: inline-block;
}
.card-header {
    background-color: rgba(0,0,0,0)
}
.card-body{
    padding: 0rem;
}

.escrow-request {
}

.signature {
  color: darkgreen;
}

.settled {
  color: gray;
}
</style>
