<template>
  <el-card width="10%">
    <template slot="header">PaysApi账户
      <el-button
        style="float: right; padding: 0.5em"
        v-if="!paysApiAccount.token"
        @click="$emit('unlockAccounts')"
      >解锁</el-button>
      <span v-if="paysApiAccount.token" style="color:green; float: right;">已解锁</span>
    </template>
    <span>{{ paysApiAccount.uid }}</span>    
  </el-card>
</template>

<script>

export default {
  props: ["paysApiAccount"]
};
</script>

<style scoped>
.el-card {
  height: 200px;
  display: inline-block;
  margin: 0.5em;
}
</style>
