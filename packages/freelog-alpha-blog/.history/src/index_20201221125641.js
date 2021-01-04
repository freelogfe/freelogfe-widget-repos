import './index.less'
import 'highlight.js/styles/github.css'
import Vue from 'vue'
import App from './pages/app'
import VueRouter from 'vue-router'
import Layout from './pages/layout/index.vue'
import Archives from './pages/archives/index.vue'
import Article from './pages/article/index.vue'
import AboutMe from './pages/aboutme/index.vue'
import TagsArticles from './pages/tags-articles/index.vue'
import Home from './pages/home/index.vue'

var template = require('./index.html')

class FreelogAlphaBlog extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.innerHTML = template
    this.initApp()
  }

  initApp() {
    Vue.use(VueRouter)  
    const router = this.getRouter()
    new Vue({
      el: '#freelog-alpha-blog-app',
      router,
      render: (h) => h(App)
    })
  }

  getRouter() {
    return new VueRouter({
      scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
          return savedPosition
        } else {
          return {x: 0, y: 0}
        }
      },
      routes: [{
        path: '/',
        component: Layout,
        children: [
          {
            path: '',
            component: Home
          },
          {
            path: 'archives',
            component: Archives
          },
          {
            path: 'tags/:tag',
            component: TagsArticles
          },
          {
            path: 'article/:articleId',
            component: Article
          },
          {
            path: 'about',
            component: AboutMe
          }
        ]
      }]
    })
  }

}


customElements.define('freelog-alpha-blog', FreelogAlphaBlog)
