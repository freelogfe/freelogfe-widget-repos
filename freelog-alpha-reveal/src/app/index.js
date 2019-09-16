import './index.less'
import "reveal.js/css/reveal.css"
import "reveal.js/css/theme/black.css"
import "reveal.js/lib/css/monokai.css"
import './reveal.js'
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
    const presentableId = this.dataset.presentableId
    this.innerHTML = htmlStr
    this.presentableId = presentableId
    this.presentableSubReleases = []
    this.presentableSubReleasesMap = {}
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
            $app.innerHTML = this.resolveFreelogImg(res)
            // $app.innerHTML = res
            return Promise.resolve()
          }else {
            $app.innerHTML = `<div class="auth-box center">授权未通过！</div>`
            return Promise.reject()
          }
        })
        .then(() => {
          this.renderReveal()
        })
        .catch(e => console.log(e))
    }
  }

  loadPresentableData(presentableId) {
    return window.FreelogApp.QI.fetchPresentableResourceData(presentableId).then((res) => {
      var isError = !res.headers.get('freelog-resource-type')
      var subReleasesText = res.headers.get('freelog-sub-releases')
        try {
          const subReleases = subReleasesText == null ? [] : JSON.parse(atob(subReleasesText))
          this.presentableSubReleases = subReleases.map(subR => {
            const { v: version, id: subReleaseId, n: releaseName } = subR
            this.presentableSubReleasesMap[subReleaseId] = { version, subReleaseId, releaseName }
            this.presentableSubReleasesMap[releaseName] = { version, subReleaseId, releaseName }
            return subR
          })
        }catch(e) {
          console.error(e)
        }
      return isError ? res.json() : res.text()
    })
  }

  resolveFreelogImg(_html) {
    this.$ = cheerio.load(_html)
    
    const $revealDom = this.$('.reveal')
    const $imgDoms = $revealDom.find('img[data-freelog-resource]')
    const leng = $imgDoms.length
    for(let i = 0; i < leng; i++) {
      const $tmpImg = $imgDoms.eq(i)
      const releaseName = $tmpImg.attr('data-release-name')
      const tmpR = this.presentableSubReleasesMap[releaseName]
      if(tmpR) {
        const url = window.FreelogApp.QI.resolveSubResourceDataUrl({
          presentableId: this.presentableId,
          subReleaseId: tmpR.subReleaseId,
          version: tmpR.version
        })
        $tmpImg.attr('src', url)
      }
    }
    return  `<div class="reveal">` + $revealDom.html() + '</div>'
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
        center: true,dependencies: [
          // Interpret Markdown in <section> elements
          { src: 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/static/plugins/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
          { src: 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/static/plugins/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
          // Syntax highlight for <code> elements
          { src: 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/static/plugins/highlight.js', async: true },
        ]
      })
    })
  }
}


customElements.define('freelog-alpha-reveal', FreelogAlphaReveal);
