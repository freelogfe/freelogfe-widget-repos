import Vue from 'vue'
import router from './router'
import ElementUI from 'element-ui'
import App from './pages/app'

import './index.less'
import 'element-ui/lib/theme-chalk/index.css'

var template = require('./index.html');

class FreelogI18nManagement extends HTMLElement {
  constructor() {
    super()
  }


  initApp() {
    Vue.use(ElementUI);
    var app = new Vue({
      el: this.querySelector('.freelog-i18n-management-app'),
      router,
      template: '<App/>',
      components: {App}
    })
  }

  connectedCallback() {
    this.innerHTML = template
    this.initApp()
  }
}


customElements.define('freelog-i18n-management', FreelogI18nManagement);
