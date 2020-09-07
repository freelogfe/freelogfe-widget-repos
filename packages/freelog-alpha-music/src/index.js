

import 'amfe-flexible/index.js'
import VueRouter from 'vue-router'
import Vue from 'vue'
import { Carousel, CarouselItem, Image, Tag, Slider, Progress, Button, TableColumn, Table } from 'element-ui'
import App from './pages/app.vue'
import Home from './pages/home.vue'
import PlayList from './pages/play-list.vue'
import FreelogAuthToast from './components/freelog-auth-toast/auth-toast.js'

var template = require('./index.html')

class FreelogAlphaMusic extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.innerHTML = template
    this.initApp()
  }

  async initApp() {
    Vue.use(VueRouter)
    Vue.use(FreelogAuthToast)
    Vue.component(Carousel.name, Carousel)
    Vue.component(CarouselItem.name, CarouselItem)
    Vue.component(Image.name, Image)
    Vue.component(Tag.name, Tag)
    Vue.component(Table.name, Table)
    Vue.component(TableColumn.name, TableColumn)
    Vue.component(Slider.name, Slider)
    Vue.component(Progress.name, Progress)
    Vue.component(Button.name, Button)
    new Vue({
      el: this.querySelector('.freelog-alpha-music-app'),
      router: this.getRouter(),
      render: h => h(App)
    })
    
  }

  getRouter() {
    const routes = [{
      path: '/',
      component: Home, 
    }, {
      path: '/play-list/:songsMenuId/:songsMenuName',
      component: PlayList
    }]
    
    return new VueRouter({
      scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
          return savedPosition
        } else {
          return {x: 0, y: 0}
        }
      },
      routes
    });
  }
}


customElements.define('freelog-alpha-music', FreelogAlphaMusic);
