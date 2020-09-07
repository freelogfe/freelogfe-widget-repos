import Vue from 'vue'
import router from './router'
import './index.less'
import App from './pages/app.vue'

var template = require('./index.html');

class FreelogAlphaReader extends HTMLElement {
  constructor() {
    super()
  }


  initApp() {
    var app = new Vue({
      el: '#freelog-alpha-reader-app',
      router,
      render: (h) => h(App),
    })
  }

  connectedCallback() {
    this.innerHTML = template
    this.initApp()
  }
}


customElements.define('freelog-alpha-reader', FreelogAlphaReader);
