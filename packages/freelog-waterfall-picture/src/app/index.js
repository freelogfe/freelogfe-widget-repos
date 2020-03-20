import Vue from 'vue'
import VueLazyLoad from 'vue-lazyload';
import VueClipboard from 'vue-clipboard2'
import router from './router'
import './index.less'
import App from './pages/app'

var template = require('./index.html');
require('vue-image-lightbox/dist/vue-image-lightbox.min.css');

Vue.use(VueLazyLoad);
Vue.use(VueClipboard);

class FreelogWaterfallPicture extends HTMLElement {
  constructor() {
    super()
  }


  initApp() {
    var app = new Vue({
      el: this.querySelector('.freelog-waterfall-picture-app'),
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


customElements.define('freelog-waterfall-picture', FreelogWaterfallPicture);
