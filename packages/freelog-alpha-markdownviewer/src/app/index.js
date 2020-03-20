import Vue from 'vue'
import './index.less'
import App from './pages/app.vue'

var template = require('./index.html');

class FreelogAlphaMarkdownviewer extends HTMLElement {
  constructor() {
    super()
    this.presentableId = this.dataset.presentableId
  }

  initApp() {
    const { presentableId = '', presentableName = '' } = this.dataset
    var mixin = {
      data: function () {
        return {
          presentableName, presentableId
        }
      }
    }
    var app = new Vue({
      mixins: [mixin],
      el: '#freelog-alpha-markdownviewer-app',
      render: h => h(App),
    })
  }

  connectedCallback() {
    this.innerHTML = template
    this.initApp()
  }
}


customElements.define('freelog-alpha-markdownviewer', FreelogAlphaMarkdownviewer);

