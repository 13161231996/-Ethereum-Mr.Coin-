import Vue from 'vue'
import '../plugins/element.js'
import VueRouter from 'vue-router'
import BootstrapVue from 'bootstrap-vue'
import App from './app.vue'
import LoginPage from '../trusted-wallet/login-page.vue'
import Transfer from './TransferRecord.vue'
import Withdrawal from './WithdrawalRecord.vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(VueRouter)
Vue.use(BootstrapVue)
Vue.config.productionTip = false

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/transfer', component: Transfer},
  { path: '/withdrawal', component: Withdrawal}
]

const router = new VueRouter({
  routes
})

new Vue({
  router,
  render: h => h(App),
  methods: {
  }
}).$mount('#app');

