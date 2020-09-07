import Vue from 'vue'
import router from './router'
import './index.less'
import App from './pages/app.vue'

var html = require('./index.html')

class FreelogAlphaVideo extends HTMLElement {
  constructor() {
    super()
  }

  initApp() {
    var app = new Vue({
      el: this.querySelector('.alpha-video-app'),
      router,
      render: (h) => h(App)
    });
  }

  connectedCallback() {
    this.innerHTML = html
    this.initApp()
  }
}

customElements.define('freelog-alpha-video', FreelogAlphaVideo);
