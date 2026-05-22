import Vue from 'vue'
import App from './cate.vue'

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()