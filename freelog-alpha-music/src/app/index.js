import VueRouter from 'vue-router'
import 'amfe-flexible/index.js'
import router from './router'
import App from './pages/app'
import FreelogAuthToast from './components/freelog-auth-toast/auth-toast.js'

import './index.less'

var template = require('./index.html');

class FreelogAlphaMusic extends HTMLElement {
  constructor() {
    super()
  }


  initApp() {
    const Vue = window.f_common_lib.Vue
    Vue.use(VueRouter)
    Vue.use(FreelogAuthToast)
    var app = new Vue({
      el: this.querySelector('.freelog-alpha-music-app'),
      router: new VueRouter(router),
      render: h => h(App)
    })
  }

  connectedCallback() {
    this.innerHTML = template
    this.initApp()
  }
}


customElements.define('freelog-alpha-music', FreelogAlphaMusic);
