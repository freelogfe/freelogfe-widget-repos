import './index.less'
import 'element-ui/lib/theme-chalk/index.css'

import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import App from './pages/app'
import Home from './pages/index'

var template = require('./index.html');

Vue.use(ElementUI)
Vue.use(VueRouter)
const router = new VueRouter({
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {x: 0, y: 0}
    }
  },
  routes: [{
    path: '/',
    component: Home,
  }]
})

var app = new Vue({
  el: '#freelog-i18n-management-app',
  router,
  render: (h) => h(App)
})
