import Vue from 'vue'
import App from './my-search.vue'

App.mpType = 'component'

const component = Vue.extend(App)
component.mpType = 'component'
component.$mount()