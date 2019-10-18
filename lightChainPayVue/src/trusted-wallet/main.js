import Vue from 'vue'
import VueRouter from 'vue-router'
import BootstrapVue from 'bootstrap-vue'
import VueClipboard from 'vue-clipboard2'
import '../plugins/element.js'

import store from './store'
import App from './app.vue'
import MainPage from './main-page.vue'
import LoginPage from '../shared-components/login-page.vue'
import RegisterPage from '../shared-components/register-page.vue'
import EthKeyPage from './ethkey-page.vue'
import Record from './record-page.vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(VueClipboard)
Vue.use(VueRouter)
Vue.use(BootstrapVue)
Vue.config.productionTip = false

const routes = [
  { path: '/home', component: MainPage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/set-ethkey', component: EthKeyPage },
  { path: '/record', component: Record}
]

const router = new VueRouter({
  routes
})

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app');

if (!window.clientData) {
  var clientData = {
    "userName": null,
    "chainId": 42,
    "tokenConfigurations": [],
    "exchangeRates": null,
    "ethKey": null,
    "ethAccounts": [],
    "trustedWalletSummaries": [],
    "transaction": null,
    "waitingDepositRequestCount": 0
  };
  store.commit('setClientData', clientData);
}
else {
  store.commit('setClientData', window.clientData);
}


