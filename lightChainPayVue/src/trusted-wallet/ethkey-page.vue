<template>
  <div>
    <b-navbar class="top">
      <h3 class="title2" style="width: 100% ">Mr.Coin是以太坊稳定币的闪速钱包</h3>
    </b-navbar>
    <b-row class="login-body">
      <b-col cols="11" md="1"></b-col>
      <b-col class="login-container" cols="11" md="5">
        <div class="p">
          <!-- 标题 -->
          <div class="title v-1px-b">
            <span style="color:black;text-align:center;">设置资金密码</span>
          </div>
          <!--输入的密码-->
          <div>
            <div class="pas-box v-1px">
              <div v-for="(pas,i) in pasDigits" :key="i" :class="{'v-1px-l':i>0}">
                <input type="password" :value="val[i]" disabled>
              </div>
            </div>
            <div class="vadat">
              <span class="vali" v-if="status">{{prompt}}</span>
              <span class="validation" v-if="status2">两次密码输入有误，请重新输入</span>
            </div>
          </div>
          <!--keyboard-->
          <div class="key-box">
            <div class="item v-1px-t" v-for="(item, i) in keyList" :key="i">
              <div
                class="key"
                v-for="(val, key) in item"
                :key="key"
                v-on:click="inputStart(val, $event)"
                :class="{'v-1px-l':key!=0}"
              >{{val}}</div>
            </div>
            <div class="item v-1px-t">
              <div class="key" v-on:click="empty()" :style="{'pointer-events':isbut}">确认</div>
              <div class="key v-1px-l" v-on:click="inputStart(0, $event)">0</div>
              <div class="key v-1px-l" style="background: #e8e8e8" v-on:click="del($event)">del</div>
            </div>
          </div>
        </div>
      </b-col>
      <b-col cols="11" lg="1"></b-col>
      <b-col class="login-text" cols="11" md="5">
        <br>
        <h3>注意，您的资产账户不在任何服务器上</h3>
        <p>
          您的数字资产账户私钥代表着您对钱包中数字资产的控制权。该私钥是由您的资金密码在本机进行加密和解密的，
          私钥的原始数据不会被发送给任何第三方，以保证您本人对账户的绝对控制权。这意味着，如果您遗忘了该资金密码，
          包括Mr.Coin钱包平台在内，没有任何人可以帮您恢复对钱包账户的控制，钱包内的数字资产将永远无法被任何人使用。
        </p>
        <h3>因此，请勿遗忘您的资金密码</h3>
      </b-col>
    </b-row>
    <!-- </transition> -->
  </div>
</template>
<script>
import { mapMutations, mapActions } from "vuex";
export default {
  name: "vue-pay-keyboard",
  props: {
    pasDigits: {
      // 密码位数
      type: Number,
      default: 6
    }
  },
  data() {
    return {
      prompt: "请再次输入密码",
      isbut: "none",
      isdisabledFn: false,
      paySuc: true,
      val: [],
      keydic: {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        48: 0,
        49: 1,
        50: 2,
        51: 3,
        52: 4,
        53: 5,
        54: 6,
        55: 7,
        56: 8,
        57: 9
      },
      hereval: undefined,
      status: false,
      status2: false,
      keyList: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
      encKey: null
    };
  },
  watch: {},
  created: function() {
    var self = this;
    document.onkeydown = function() {
      let keyCode = window.event.keyCode;
      if (keyCode >= 48 && keyCode <= 57) {
        self.inputStart(keyCode);
      }
    };
  },
  computed: {},
  methods: {
    ...mapMutations(["setErrorMessage"]),
    ...mapActions(["createEthKey", "generateEthAccount"]),
    // 键盘输入事件
    inputStart(val) {
      if (this.val.length < this.pasDigits) {
        this.val.push(this.keydic[val]);
        this.status2 = false;
        if (this.val.length >= 6) {
          this.isbut = "auto";
        }
        if (this.val.length === this.pasDigits && this.status === false) {
          // 密码输入完毕,待添加功能，1，再次输入 2.比对如果错误重新输入
          this.hereval = this.val;
          this.status = true;
          this.val = [];
        } else if (this.val.length === this.pasDigits && this.status === true) {
          if (this.val.join("") === this.hereval.join("")) {
            this.status = false;
            // 页面跳转，api
            let self = this;
            try {
              self.encKey = self.createEthKey(this.val.join(""));
            } catch (error) {
              self.setErrorMessage(error);
            }
            this.val = [];
            if (self.encKey) {
              setTimeout(async () => {
                try {
                  this.action = "正在为您生成以太坊账户...";
                  try {
                    await self.generateEthAccount(self.encKey);

                    this.$router.push({ path: "/home" });
                  } catch (error) {
                    this.$alert(error);
                  }
                  this.action = "";
                } catch (error) {
                  self.setErrorMessage(error);
                }
              }, 100);
            }
          } else {
            this.status = false;
            this.status2 = true;
            this.val = [];
          }
        }
      } else {
        this.$emit("pas-end", this.val.join(""));
      }
    },
    // 删除输入
    del() {
      this.status2 = false;
      if (this.val.length > 0) {
        this.val.pop();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.login-body {
  margin: 0 auto;
  display: flex;
  justify-content: center;
}
.login-container {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}

div,
span,
input {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -o-box-sizing: border-box;
  -ms-box-sizing: border-box;
  box-sizing: border-box;
}
.v-title {
  width: 100%;
  height: 150px;
  border: 1px solid red;
}
.pay-box {
  width: 500px;
  height: 300px;
  margin-left: 100px;
}
input {
  background: none;
  outline: none;
  border: none;
  background-color: transparent;
  border-color: transparent;
  -webkit-appearance: none;
}
.vadat {
  margin-left: 10px;
  height: 50px;
  margin-top: 10px;
}
.vali {
  // position: absolute;
  // left: 44px;
  // top: 240px;
  margin-top: 20px;
  color: #778899;
}
.validation {
  color: red;
}
.title2 {
  height: 117px;
  line-height: 50px;
  margin-bottom: 25px;
  position: relative;
  color: white;
  margin-left: 1.5%;
  margin-top: 1%;
}

.title {
  margin-bottom: 25px;
  height: 0px;
  padding-top: 10px;
  padding-bottom: 70px;
  text-align: center;
}
.v-1px-t,
.v-1px-l,
.v-1px-b,
.v-1px {
  position: relative;
}
.v-1px-b:after {
  content: " ";
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 1px;
  border-bottom: 1px solid #c7c7c7;
  color: #c7c7c7;
  transform-origin: 0 100%;
  transform: scaleY(0.5);
}
.v-1px-t:before {
  z-index: 112;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 1px;
  content: "";
  border-top: 1px solid #c7c7c7;
  transform: scaleY(0.5);
  color: #c7c7c7;
  transform-origin: 0 0;
}
.v-1px-l:before {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  content: "";
  border-left: 1px solid #c7c7c7;
  transform: scaleX(0.5);
  color: #c7c7c7;
  transform-origin: 0 0;
}
.v-1px:before {
  position: absolute;
  left: 0;
  top: 0;
  width: 200%;
  height: 200%;
  content: "";
  border: 1px solid #c7c7c7;
  transform: scale(0.5);
  color: #c7c7c7;
  transform-origin: left top;
  z-index: 1000;
}
/*键盘盒子*/
.key-box {
  bottom: 0 auto;
  width: 100%;
  font-size: 16px;
  color: #363636;
  .item {
    display: flex;
    text-align: center;
    line-height: 50px;
    height: 50px;
  }
  .key {
    cursor: pointer;
    width: 100%;
    height: 100%;
    flex: 1;
  }
}
/*输入密码框*/
.pas-box {
  width: 70%;
  margin: 0 auto;
  height: 35%;
  display: flex;
  line-height: 45px;
  > div {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    > input {
      width: 100%;
      font-size: 18px;
      text-align: center;
      height: 100%;
      display: block;
    }
  }
}
</style>