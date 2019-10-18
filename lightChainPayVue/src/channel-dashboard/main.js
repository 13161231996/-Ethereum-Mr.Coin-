import Vue from 'vue'
import VueRouter from 'vue-router'
import BootstrapVue from 'bootstrap-vue'
import VueClipboard from 'vue-clipboard2'
import '../plugins/element.js'

import store from './store'
import App from './app.vue'
import MainPage from './main-page.vue'
import LoginPage from '../shared-components/login-page.vue'
import Register from '../shared-components/register-page.vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(VueClipboard)
Vue.use(VueRouter)
Vue.use(BootstrapVue)
Vue.config.productionTip = false

const routes = [
  { path: '/home', component: MainPage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: Register }
]

const router = new VueRouter({
  routes
})

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app');

if (window.clientData) {
  store.commit('setClientData', window.clientData);
}


