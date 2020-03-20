import Vue from 'vue'
import router from './router'
import './index.less'
import App from './pages/app.vue'

var template = require('./index.html');

class FreelogMusicplayer extends HTMLElement {
  constructor() {
    super()
    this.innerHTML = template
  }


  initApp() {
    var app = new Vue({
      el: '#freelog-music-player-app',
      router,
      template: '<App/>',
      components: {App}
    })
  }

  connectedCallback() {
    this.initApp()
  }
}


customElements.define('freelog-music-player', FreelogMusicplayer);
