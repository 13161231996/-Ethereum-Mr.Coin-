<template>
  <div id="app" v-loading="!signalrConnected" element-loading-text="正在与服务器建立实时连接，请稍后...">     
        <el-alert v-for="errMsg in errorMessages" :title="errMsg" :key="errMsg" type="warning"></el-alert>
          <b-navbar class="top" style="height:6rem">      
        <div style="width:70%;font-size:1.2rem;color:white">Welcome, {{ userName }}</div>
        <div class="wod">
         <el-dropdown trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            我的<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="a">{{accountNumber}}</el-dropdown-item>
            <el-dropdown-item command="b">{{MyChannel}}</el-dropdown-item>
            <el-dropdown-item command="c">{{MytradingRecord}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!-- <a><div style="color:white" @click="AccountOrChannel()">我的账号</div></a>
        <a><div style="color:white" @click="AccountOrChannel()">我的通道</div></a>     -->
        </div>        
    </b-navbar>
    <b-container>
      <b-row class="body-r">
      <!-- @click="AccountOrChannel()" -->
        <b-col v-show="Acountshow" class="login-container" cols="12" md="6">
          <EthAccountPanel />
        </b-col>  
      <b-col v-show="Chanshow" class="login-container" cols="12" md="8"> 
          <div>
            <el-button @click="requestChannelDialogVisible=true">请求新的通道</el-button>
          </div>
           
          <ChannelRequestViewer
            v-for="cr in channelRequests"
            :channelRequest="cr"
            :key="'cr' + cr.id"
            role="receiver"
          ></ChannelRequestViewer>
          <ChannelViewer
            v-for="channel in channels"
            :channel="channel"
            :key="channel.id"
            role="receiver"
          ></ChannelViewer>
      </b-col>
      <b-col v-show="Recordshow" class="login-container" cols="12" md="8">           
          <ChannelRequestViewer
            v-for="cr in channelRequests"
            :channelRequest="cr"
            :key="'cr' + cr.id"
            role="receiver"
          ></ChannelRequestViewer>
        <div role="tablist">
          <TradingRecordViewer
              :channel="sortchanels"
              :key="sortchanels.id"
              role="receiver"
          ></TradingRecordViewer>
        </div>
      </b-col>
      <RequestChannelDialog :visible.sync="requestChannelDialogVisible"></RequestChannelDialog>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import EthAccountPanel from "../components/EthAccountPanel.vue";
import ChannelRequestViewer from "../components/ChannelRequestViewer.vue";
import ChannelViewer from "../components/ChannelViewer.vue";
import RequestChannelDialog from "../components/RequestChannelDialog.vue";
import TradingRecordViewer from "../components/TradingRecordViewer.vue";
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  name: "receiver-page",
  data: function() {
    return {
      requestChannelDialogVisible: false,
      errorMessages: [],
      activeName: '1',
      Acountshow:true,
      Chanshow:false,
      Recordshow:false,

      accountNumber:"我的账号",
      MytradingRecord:"交易记录",
      MyChannel:"我的通道",
      channersList:[],


    };
  },
  computed: mapState({
    userName: "userName",
    signalrConnected: "signalrConnected",
    channelRequests: "receiverChannelRequests",
    channels: "receiverChannels",
    sortchanels:"AfterSortedChanners"
  }),
  components: {
    EthAccountPanel,
    ChannelRequestViewer,
    ChannelViewer,
    TradingRecordViewer,
    RequestChannelDialog,
  },
  methods: {
    ...mapMutations([]),
    ...mapActions(["logout"]),
    logoutClickHandler: async function() {
      try {
        await this.logout();
        location.reload(true);
      } catch (error) {
        this.$alert(error);
      }
    },
      handleCommand(val) {
        if (val=="a"){
            this.Acountshow=true;
            this.Chanshow=false;
           this. Recordshow=false;
        }else if(val=="b"){
             this.Acountshow=false;
            this.Chanshow=true;
           this. Recordshow=false;
        }else if(val=="c"){
            this.Acountshow=false;
            this.Chanshow=false;
            this. Recordshow=true;
        }
      },
    AccountOrChannel(){
      if(this.chanstatus==true){
        this.chanstatus=false
      }else{
        this.chanstatus=true
      }
      
    }
  },
  created: function() {
    this.$store.subscribe((mutation, state) => {
      let self = this;
      if (mutation.type == "setErrorMessage") {
        self.errorMessages.push(state.errorMessage);
      }
    });
  }
};
</script>
<style>
.wod{
      display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    width: 10rem;
}
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
.login-container {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.body-r{
    margin: 0 auto;
  display: flex;
  justify-content: center;
}
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  height: auto;
  padding: 0.3em;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
}
</style>
