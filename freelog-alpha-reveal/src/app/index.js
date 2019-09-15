import './index.less'
import "reveal.js/css/reveal.css"
import "reveal.js/css/theme/black.css"
import "reveal.js/lib/css/monokai.css"
import './reveal.js'
import './markdown-github-theme.css'

import highlightjs from 'highlightjs'
import Marked from 'marked'
import cheerio from 'cheerio'
 
var htmlStr = require('./index.html')
var decode = function(str) {
  return str.replace(/&#x(\w+);/g, function(match, s) {
    return String.fromCharCode(parseInt(s,16))
  })
}

class FreelogAlphaReveal extends HTMLElement {
  constructor() {
    super()
    this.innerHTML = htmlStr
    this.presentableId = this.dataset.presentableId
    this.$ = cheerio.load(htmlStr)
    console.log(Array.from(this.$('.slides').find('[data-markdown]')))
    Marked.setOptions({
      renderer: new Marked.Renderer(),
      highlight: function (code) {
        return highlightjs.highlightAuto(code).value;
      },
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false
    })
    Array.from(this.$('.slides').find('[data-markdown]')).forEach($dom => {
      console.log('---', $dom)
    });
    // Marked(md, {
    //   renderer: renderer
    // })
  }

  connectedCallback (){
    this.init()
  }

  init() {
    if(this.presentableId) {
      this.loadPresentableData(this.presentableId)
        .then(res => {
          const $app = this.querySelector('.freelog-alpha-reveal-app')
          if(res.errcode == null) {
            $app.innerHTML = res
            return Promise.resolve()
          }else {
            $app.innerHTML = `<div class="auth-box center">授权未通过！</div>`
            return Promise.reject()
          }
        })
        .then(() => {
          this.renderReveal()
        })
        .catch(e => {})
    }
  }

  loadPresentableData(presentableId) {
    return window.FreelogApp.QI.fetchPresentableResourceData(presentableId).then(function (res) {
      var isError = !res.headers.get('freelog-resource-type')
      return isError ? res.json() : res.text()
    })
  }

  renderReveal() {
    if (typeof initReveal === 'undefined') {
      return
    }

    initReveal()

    setTimeout(function () {
      Reveal.initialize({
        width: "90%",
        height: "100%",
        controls: true,
        progress: true,
        history: false,
        center: true,
      })
    })
  }
}


customElements.define('freelog-alpha-reveal', FreelogAlphaReveal);
