import VueRouter from 'vue-router'
import router from './router'
import 'amfe-flexible/index.js'
import './index.less'
import App from './pages/app'
var template = require('./index.html');

class FreelogAlphaComics extends HTMLElement {
  static get observedAttributes() {return ['active-index', 'visible']; }
  constructor() {
    super()
  }

  initApp() {
    const Vue = window.f_common_lib.Vue
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
    
    var app = new Vue({
      el: this.querySelector('.freelog-alpha-comics-app'),
      router: new VueRouter(router),
      template: '<App/>',
      components: {App}
    })
  }

  connectedCallback() {
    this.innerHTML = template
    this.initApp()
  }
}


customElements.define('freelog-alpha-comics', FreelogAlphaComics);
