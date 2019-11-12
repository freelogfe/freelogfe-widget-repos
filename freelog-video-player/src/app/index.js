import Vue from 'vue'
import router from './router'
import './index.less'
import App from './pages/app'

var template = require('./index.html');

class FreelogVideoPlayer extends HTMLElement {
  constructor() {
    super()
  }


  initApp() {
    var app = new Vue({
      el: this.querySelector('.freelog-video-player-app'),
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


customElements.define('freelog-video-player', FreelogVideoPlayer);
