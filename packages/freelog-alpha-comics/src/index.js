import Vue from 'vue'
import VueRouter from 'vue-router'
import { Image, Tag } from 'element-ui'
import router from './router'
import 'amfe-flexible'
import './index.less'
import App from './pages/app.vue'
var template = require('./index.html');

class FreelogAlphaComics extends HTMLElement {
  static get observedAttributes() {return ['active-index', 'visible']; }
  constructor() {
    super()
  }

  initApp() {
    
    Vue.filter('fmtDate', (value, frm) => {
      if (!value) return ''
      const oDate = new Date(value)
      const year = oDate.getFullYear()
      var month = oDate.getMonth()
      month = ("00" + (month + 1)).slice(-2)
      const date = oDate.getDate()

      return `${year}-${month}-${date}`
    })
    Vue.use(VueRouter)
    Vue.use(Image)
    Vue.use(Tag)
    var app = new Vue({
      el: this.querySelector('.freelog-alpha-comics-app'),
      router: new VueRouter(router),
      render: (h) => h(App)
    })
  }

  connectedCallback() {
    this.innerHTML = template
    this.initApp()
  }
}


customElements.define('freelog-alpha-comics', FreelogAlphaComics);
