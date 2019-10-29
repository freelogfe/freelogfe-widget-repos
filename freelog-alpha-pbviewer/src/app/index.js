import './index.less'
var htmlStr = require('./index.html')

class FreelogAlphaPbviewer extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.innerHTML = htmlStr
  }

  connectedCallback (){
    const FreelogApp = window.FreelogApp
    const Vue = window.f_common_lib.Vue
    new Vue({
      el: '#pb-viewer',
      data: function () {
        return {
          pbList: [],
          activeIndex: [],
          loadingVisible: false,
          pbDemoVisible: false,
          pbAsideVisible: true,
          pbDemoHTML: '',
          pbDemoMap: {},
        }
      },
      methods: {
        init() {
          this.loadingVisible = true
          this.fetchPBList()
            .finally(() => {
              this.loadingVisible = false
            })
        },
        bindEvent() {
          this.$refs.pbDemoWrapper.addEventListener('mousemove', (e) => {
            if((window.innerWidth - e.pageX) < 12) {
              this.pbAsideVisible = true
            }else {
              this.pbAsideVisible = false
            }
          })
        },
        fetchPBList() {
          return FreelogApp.QI.fetchPresentablesList({ tags: "page_build" })
            .then(res => {
              if(res.errcode === 0) {
                this.pbList = res.data.dataList.map(pbPresentable => {
                  const { releaseInfo: { releaseId, releaseName, previewImages } } = pbPresentable
                  this.pbDemoMap[releaseName] = pbPresentable
                  this.pbDemoMap[releaseId] = pbPresentable
                  pbPresentable.previewImgUrl = previewImages.length ? previewImages[0] : 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/console/public/img/resource.jpg'
                  return pbPresentable
                })
              
                this.showPbDemo('ww-zh/HTML-PB-Widget-Docs')
              }
            })
        },
        loadHmtlPbData(presentable) {
          return FreelogApp.QI.fetchPresentableResourceData(presentable.presentableId)
        },
        showPbDemo(releaseName) {
          const presentable = this.pbDemoMap[releaseName]
          return this.loadHmtlPbData(presentable)
            .then(resp => {
              var isError = !resp.headers.get('freelog-resource-type')
              return isError ? resp.json() : resp.text()
            })
            .then(res => {
              this.pbAsideVisible = false
              this.pbDemoHTML = res
            })
        },   
        tapPbCard(pbPresentable) {
          const { releaseInfo: { releaseName } } = pbPresentable
          window.location.hash = ''
          this.showPbDemo(releaseName)
        } 
      },
      created() {
        this.init()
      },
      mounted() {
        this.bindEvent()
      }
    })
  }
}

customElements.define('freelog-alpha-pbviewer', FreelogAlphaPbviewer);
