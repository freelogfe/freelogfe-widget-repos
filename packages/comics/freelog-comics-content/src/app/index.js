import Vue from 'vue'
import './index.less'
import App from './pages/app'

var template = require('./index.html');

class FreelogComicsContent extends HTMLElement {
  constructor() {
    super()
  }


  initApp() {
    var app = new Vue({
      el: this.querySelector('.freelog-comics-content-app'),
      template: '<App/>',
      components: {App}
    })
  }

  connectedCallback() {
    this.innerHTML = template
    this.initApp()
  }
}


customElements.define('freelog-comics-content', FreelogComicsContent);
