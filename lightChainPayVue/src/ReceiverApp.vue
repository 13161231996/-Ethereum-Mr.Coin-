<template>
  <div id="app" v-loading="!signalrConnected" element-loading-text="正在与服务器建立实时连接，请稍后...">
    <el-container>
      <el-header height="auto">
        <h3>Welcome, {{ userName }}.</h3>
        <el-alert v-for="errMsg in errorMessages" :title="errMsg" :key="errMsg" type="warning"></el-alert>
      </el-header>
      <el-container>
        <el-aside width="35em">
          <EthAccountPanel/>
        </el-aside>
        <el-main>
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
        </el-main>
      </el-container>
      <RequestChannelDialog :visible.sync="requestChannelDialogVisible"></RequestChannelDialog>
    </el-container>
  </div>
</template>
<script>
import EthAccountPanel from "./components/EthAccountPanel.vue";
import ChannelRequestViewer from "./components/ChannelRequestViewer.vue";
import ChannelViewer from "./components/ChannelViewer.vue";
import RequestChannelDialog from "./components/RequestChannelDialog.vue";
import { mapState } from "vuex";

export default {
  name: "app",
  data: function() {
    return {
      requestChannelDialogVisible: false,
      errorMessages: []
    };
  },
  computed: mapState([
    "userName",
    "signalrConnected",
    "channelRequests",
    "channels"
  ]),
  components: {
    EthAccountPanel,
    ChannelRequestViewer,
    ChannelViewer,
    RequestChannelDialog
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
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
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
