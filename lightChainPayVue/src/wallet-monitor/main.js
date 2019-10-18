import Vue from 'vue'
import '../plugins/element.js'
import BootstrapVue from 'bootstrap-vue'

import App from './app.vue'
import store from './store'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');
