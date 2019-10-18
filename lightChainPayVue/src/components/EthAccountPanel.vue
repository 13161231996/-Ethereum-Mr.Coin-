<template>
<div>
  <b-container>
    <b-row>
      <div class="title_h" >
      我的账号
      </div>
      <b-col cols="12" md="12">
        <div v-if="!ethKey" class="eth-key">
          您尚未设置资金密码,请设置资金密码以便导入账户。
          <el-button @click="createEthKeyDialogVisible=true">设置</el-button>
        </div>
        <div v-if="ethKey" class="eth-key">
          <div style="font-size:0.9rem;margin-bottom:1rem;">您已经设置了资金密码,可以导入账户。</div>
          <div class="main_dr">
            <el-button  @click="importPrivateKeyDialogVisible=true">导入以太坊账户</el-button>
            <el-button  @click="importPaysApiAccountDialogVisible=true">导入PaysApi账户</el-button>
          </div>
        </div>
        <EthAccountViewer
          v-for="ethAccount in ethAccounts"
          :ethAccount="ethAccount"
          :key="'EA' + ethAccount.id"
          @unlockAccounts="unlockEthKeyDialogVisible=true"
        ></EthAccountViewer>
        <pays-api-account-viewer
          v-for="paysApiAccount in paysApiAccounts"
          :paysApiAccount="paysApiAccount"
          :key="'PAA' + paysApiAccount.id"
          @unlockAccounts="unlockEthKeyDialogVisible=true"
        ></pays-api-account-viewer>
      </b-col>
    

      <CreateEthKeyDialog :visible.sync="createEthKeyDialogVisible"></CreateEthKeyDialog>
      <ImportPrivateKeyDialog :visible.sync="importPrivateKeyDialogVisible"></ImportPrivateKeyDialog>
      <ImportPaysApiAccountDialog :visible.sync="importPaysApiAccountDialogVisible"></ImportPaysApiAccountDialog>
      <UnlockEthKeyDialog
        :visible.sync="unlockEthKeyDialogVisible"
        @eth-key-unlocked="ethKeyUnlockedHandler"
      ></UnlockEthKeyDialog>
    </b-row>
  </b-container>
  </div>
</template>

<script>
import CreateEthKeyDialog from "./CreateEthKeyDialog.vue";
import ImportPrivateKeyDialog from "./ImportPrivateKeyDialog.vue";
import ImportPaysApiAccountDialog from "./ImportPaysApiAccountDialog.vue";
import UnlockEthKeyDialog from "./UnlockEthKeyDialog.vue";
import EthAccountViewer from "./EthAccountViewer.vue";
import PaysApiAccountViewer from "./PaysApiAccountViewer.vue";
import { mapState, mapMutations } from "vuex";

export default {
  data: function() {
    return {
      ethKeyPassword: "",
      ethPrivateKey: "",
      createEthKeyDialogVisible: false,
      importPrivateKeyDialogVisible: false,
      importPaysApiAccountDialogVisible: false,
      unlockEthKeyDialogVisible: false,

    };
  },

  computed: { ...mapState(["ethKey", "ethAccounts", "paysApiAccounts"]) },
  components: {
    CreateEthKeyDialog,
    ImportPrivateKeyDialog,
    ImportPaysApiAccountDialog,
    UnlockEthKeyDialog,
    EthAccountViewer,
    PaysApiAccountViewer
  },
  methods: {
    ...mapMutations(["unlockAccounts"]),
    ethKeyUnlockedHandler: function(encKey) {
      this.unlockAccounts(encKey);
    },
  }
  
};
</script>

<style scoped>
.main_dr{
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: row;
    flex-direction: row;
    width: 100%;
    margin: 0 auto;
}
.title_h{
  width: 100%;
  height: 2rem;
  background-color: #515380;
  color:white;
}
.eth-key {
  margin-top:1rem;
}
.body-r{
    margin: 0 auto;
  display: flex;
  justify-content: center;
}

.el-header,
.el-footer {
  background-color: #b3d1b3;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-main {
  background-color: #e9f3ec;
  color: #333;
  text-align: center;
}
</style>