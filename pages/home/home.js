import Vue from 'vue'
import App from './home.vue'

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()