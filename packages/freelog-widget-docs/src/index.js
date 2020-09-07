import Vue from 'vue'
import App from './App.vue'
import SidebarItem from './sidebar.vue'
import './index.less'

import { Tag, Image, Card, Backtop, Button } from 'element-ui'

var historyStateHandler = null
class FreelogWidgetDocs extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback (){
    this.getDom()
    this.init()
  }

  disconnectedCallback() {
    window.removeEventListener('popstate', historyStateHandler)
  }

  getDom() {
    this.$sidebarItemTpl = this.querySelector('#docs-sidebar-item')
  }

  init() {
    this.registerComponents()
    this.render()
  }

  render() {
    const self = this
    Vue.component(Tag.name, Tag)
    Vue.component(Image.name, Image)
    Vue.component(Card.name, Card)
    Vue.component(Backtop.name, Backtop)
    Vue.component(Button.name, Button)
    new Vue({
      el: '#freelog-app-docs',
      render: (h) => h(App)
    })
  }

  registerComponents() {
    const self = this
    Vue.component('sidebar-item', SidebarItem)
  }
}

customElements.define('freelog-widget-docs', FreelogWidgetDocs)

// export async function bootstrap() {}
// export async function mount() {}
// export async function unmount() {}

