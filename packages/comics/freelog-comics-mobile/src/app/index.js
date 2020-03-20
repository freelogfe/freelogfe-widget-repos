import Vue from 'vue'
import router from './router'
import 'amfe-flexible/index.js'
import './index.less'
import App from './pages/app'
import { format } from 'date-fns'

Vue.filter('fmtDate', (value, frm) => {
  if (!value) return ''
  const date = new Date(value)
  frm = frm || 'YYYY-MM-DD'
  return format(date, frm)
})
var template = require('./index.html');

class FreelogComicsMobile extends HTMLElement {
  constructor() {
    super()
  }

  initApp() {
    var app = new Vue({
      el: this.querySelector('.freelog-comics-mobile-app'),
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


customElements.define('freelog-comics-mobile', FreelogComicsMobile);
