import Vue from 'vue'
import App from './cart.vue'

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()