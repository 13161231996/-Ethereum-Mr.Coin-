<template>
  <router-view></router-view>
</template>
<script>
import { mapState, mapActions } from "vuex";

export default {
  computed: mapState(["userName", "ethKey"]),
  methods: mapActions(["connectSignalR"]),
  mounted: function() {
    this.$store.subscribe(mutation => {
      if (mutation.type == "setClientData") {
        if (!this.userName || this.userName == "") {
          this.$router.replace("/login");
        }
        // 如果 this.ethKey==null  跳转 资金密码设置页面
        else {
          this.connectSignalR();
          if (this.ethKey == null) {
            this.$router.replace("/set-ethkey");
          } else {
            this.$router.replace("/home");
          }
        }
      }
    });
  }
};
</script>

<style>
.top {
  background-image: linear-gradient(-180deg, #505480 0%, #605080 100%);
  border-bottom: 5px solid rgba(255, 255, 255, 0.3);
  box-sizing: border-box;
  margin-bottom: 50px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.01);
}

.title {
  margin-top: 0;
  margin-bottom: 0;
  padding-left: 30px;
  padding-top: 30px;
  padding-bottom: 80px;
  background-position: bottom 45px center;
  background-size: 150px auto;
  color: white;
  font-size: 28px;
}

.input-wrapper {
  position: relative;
  margin-bottom: 16px;
}

h1 {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 20px 0;
}

h3 {
  font-weight: 700;
  font-size: 22px;
  color: #3f3f3f;
  margin-top: 0;
  margin-bottom: 10px;
}

label {
  display: block;
  color: #26294a;
  font-weight: 600;
  margin-bottom: 6px;
}

hr {
  display: block;
  height: 1px;
  border: 0;
  border-top: 1px solid #c5c7d6;
  margin: 25px 0;
  padding: 0;
}
</style>
