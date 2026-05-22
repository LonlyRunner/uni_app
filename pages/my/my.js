import Vue from 'vue'
import App from './my.vue'

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()