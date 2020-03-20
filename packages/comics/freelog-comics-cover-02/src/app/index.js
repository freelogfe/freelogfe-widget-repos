var cssStr = require('./index.less')
var htmlStr = require('./index.html')

class FreelogComicsCover02 extends HTMLElement {
  constructor() {
    super()
    let self = this;
    let shadowRoot = self.attachShadow({mode: 'open'});
    shadowRoot.innerHTML = `<style>${cssStr}</style>` + htmlStr
    self.root = shadowRoot
  }

  connectedCallback (){
    this.init()
  }

  init() {
    this.$app = this.root.querySelector('.freelog-comics-cover-02-app')
    this.$coverBg = this.$app.querySelector('.cover-bg')
    this.$cover = this.$app.querySelector('.cover')
    this.$infoBox = this.$app.querySelector('.info-box')
    this.getComicsCover()
  }

  getComicsCover() {
    return window.FreelogApp.QI.fetchPresentablesList({ isOnline: 1, tags: 'cover' })
      .then(res => {
        if(res.errcode === 0) {
          const { dataList = [] } = res.data
          if(dataList.length !== 0) {
            const { resourceInfo: { meta }, presentableId } = dataList[0]
            this.renderCover(meta)
            this.getComicsCoverAuthInfo(presentableId)
          }else {
            window.FreelogApp.trigger('NOTIFY_NODE', { msg: '未找到漫画封面的节点资源（即未找到标签为cover的节点资源）' })
          }
        }else {
          window.FreelogApp.trigger('NOTIFY_NODE', { msg: res.msg })
        }
      })
      .catch(e => console.log(e))
  }

  renderCover(meta) {
    var { name, author, tags, introduction } = meta
    tags = tags.replace(/\s+/g, ' ').split(' ').filter(i => i !== '')
    var tagsStr = tags.map(t => `<span class="tag">${t}</span>`).join('')

    var str = `
      <p class="name">${name}</p>
      <p class="author"><span>作者：</span><span>${author}</span></p>
      <p class="cont">${introduction}</p>
      <p class="tags"><span>标签：</span>${tagsStr}</p>
    `
    this.$infoBox.innerHTML = str
  }

  getComicsCoverAuthInfo(presentableId) {
    return window.FreelogApp.QI.resolveResourceUrl({ presentableId})
      .then(coverUrl => {
        this.$coverBg.innerHTML = `<img src="${coverUrl}" />`
        this.$cover.innerHTML = `<img src="${coverUrl}" height="280" width="210" />`
      })
  }
}


customElements.define('freelog-comics-cover-02', FreelogComicsCover02);
