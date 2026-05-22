import Vue from 'vue'
import App from './search.vue'

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()