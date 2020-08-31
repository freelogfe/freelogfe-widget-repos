import './index.less'
import Vue from 'vue'
import App from './pages/app.vue'

var template = require('./index.html');

class FreelogAlphaMarkdownviewer extends HTMLElement {
  constructor() {
    super()
    this.presentableId = this.dataset.presentableId
  }

  initApp() {
    const { presentableId = '', presentableName = '' } = this.dataset
    const mixin = {
      data: function () {
        return {
          presentableName, presentableId
        }
      }
    }
    const app = new Vue({
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

