
var cssStr = require('./index.css')
var template = require('./index.html')
import '../lib/reveal/reveal.js'

class FreelogAlphaSlide extends HTMLElement {
  constructor() {
    super()
    let self = this;
    // let shadowRoot = self.attachShadow({mode: 'open'});
    self.innerHTML = `<style>${cssStr}</style>` + template
    // self.root = shadowRoot
    window.FreelogApp.$loading.show()
  }

  connectedCallback (){
    let self = this
    self.$app = self.querySelector('.freelog-alpha-reveal-app')
    self.$content = self.querySelector('.js-reveal-content')
    self.$menu = self.querySelector('.js-menu')
    self.$wrapper = self.querySelector('.js-wrapper')
    
    self.loadData()
      .then(function (reveals) {
        window.FreelogApp.$loading.hide()
        self.reveals = reveals
        self.renderMenu()
        self.$menuItems = self.querySelectorAll('.js-menu-item')
        self.bindEvent()
        if (self.$menuItems.length) {
          self.$menuItems[0].click()
        }

        if (!localStorage.getItem('SHOWED_FULLSCREEN_TIP')) {
          self.showFullScreenTip()
        }
      })
      .catch(window.FreelogApp.$loading.hide)
  }

  loadData() {
    var self = this;
    return window.FreelogApp.QI.fetchPresentablesList({
      resourceType: 'reveal_slide',
      // tags: 'show',
      isLoadingResourceInfo: 1
    }).then(function (res) {
      var result = []
      var presentableList = res.data.dataList || []
      var promises = presentableList.map(function (presentable) {
        return self.loadPresentable(presentable.presentableId)
          .then(data => {
            result.push({ detail: presentable, content: data })
          })
      })

      return Promise.all(promises).then(function () {
        return result
      })
    })
  }

  loadPresentable(presentableId) {
    return window.FreelogApp.QI.fetchPresentableResourceData(presentableId).then(function (res) {
      var isError = !res.headers.get('freelog-resource-type')
      return isError ? res.json() : res.text()
    })
  }

  renderMenu() {
    var html = '';
    var self = this;
    //资源名称为title
    self.reveals.forEach(function (reveal, index) {
      const presentableNameArr = reveal.detail.presentableName.split('/')
      var name = presentableNameArr[1] || presentableNameArr[0]
      html += `<li class="js-menu-item active" data-index="${index}" title="${name}"><span class="serial">${index + 1}. </span> ${name}</li>`
    })

    this.querySelector('.js-menu').innerHTML = html
  }

  bindEvent() {
    var self = this

    self.querySelector('.js-wrapper').addEventListener('click', function (ev) {
      var target = ev.target
      var classList = target.classList
      if (classList.contains('js-menu-item')) {
        self.changeContentHandler(ev)
        
        Array.from(document.querySelectorAll('.js-menu-item')).forEach($node => {
          const set = new Set($node.classList)
          set.delete('active')
          if(target === $node){
            set.add('active')
          }
          $node.className = [...set].join(' ')
        })
      } else if (classList.contains('js-to-do')) {
        self.errorHandler(ev)
      }
    }, false)

    const fullscreenArr = ['webkitfullscreenchange', 'mozfullscreenchange', 'fullscreenchange', 'MSFullscreenChange']
    fullscreenArr.forEach(function (name) {
      document.addEventListener(name, self.screenChangeHandler.bind(self), false)
    })
  }

  showFullScreenTip() {
    var $tip = this.querySelector('.js-mode-tip')
    $tip.classList.add('show-tip')

    setTimeout(function () {
      $tip.classList.remove('show-tip')
    }, 4e3)
    localStorage.setItem('SHOWED_FULLSCREEN_TIP', true)
  }

  renderError(reveal, index) {
    var App = window.FreelogApp
    var name = reveal.detail.presentableName
    var errInfo = App.getErrorInfo(reveal.content)
    var html = `<div class="error-wrap fadeIn">
                  <div class="error-content">
                    <div class="article-title"><h3>${name}</h3></div>
                    <div class="article-content"><span class="error-tip">${errInfo.desc}</span>
                      <button class="action-btn js-to-do" data-index="${index}">${errInfo.tip}</button></div>
                      </div>
                </div>
              `
    return html
  }

  errorHandler(ev) {
    var self = this
    var target = ev.target
    var index = target.dataset.index
    var App = window.FreelogApp
    var data = self.reveals[index]

    App.trigger('HANDLE_INVALID_RESPONSE', {
      response: data.content,
      callback: function () {
        self.loadPresentable(data.detail.presentableId).then(function (data) {
          self.reveals[index].content = data
          self.setContent(index)
        })
      }
    })
  }

  setContent(index) {
    var self = this
    var data = self.reveals[index]
    var content = data.content
    if (typeof content === 'string') {
      self.content = content
    } else {
      this.$content.innerHTML = self.renderError(data, index)
    }
  }

  changeContentHandler(ev) {
    var self = this
    var index = parseInt(ev.target.dataset.index)
    self.setContent(index)
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

  static get observedAttributes() {
    return ['content']
  }

  //直接赋值
  set content(value) {
    this.$content.innerHTML = value
    this.renderReveal()
  }

  get content() {
    return this.$content.innerHTML
  }

  //setAttribute or dom init
  attributeChangedCallback(attrName, oldVal, newVal) {
    this[attrName] = newVal
  }

  //press f enter fullscreen mode
  screenChangeHandler() {
    if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement !== undefined) {
      this.classList.add('fullscreen')
      this.$wrapper.classList.add('fullscreen')
    } else {
      this.classList.remove('fullscreen')
      this.$wrapper.classList.remove('fullscreen')
    }
  }
}

customElements.define('freelog-alpha-slide', FreelogAlphaSlide)
