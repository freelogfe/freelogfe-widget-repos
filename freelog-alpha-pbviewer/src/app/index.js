import './index.less'
var htmlStr = require('./index.html')

class FreelogAlphaPbviewer extends HTMLElement {
  constructor() {
    super()
    this.innerHTML = htmlStr
  }

  connectedCallback (){
    const FreelogApp = window.FreelogApp
    var Profile = window.f_common_lib.Vue.extend({
      data: function () {
        return {
          pbList: [],
          activeIndex: [],
          loadingVisible: false
        }
      },
      methods: {
        init() {
          this.loadFetchPBList()
        },
        loadFetchPBList() {
          return FreelogApp.QI.fetchPresentablesList({ resourceType: "page_build", isOnline: 0 })
            .then(res => {
              if(res.errcode === 0) {
                this.pbList = res.data.dataList
              }
            })
        }
      },
      created() {
        this.init()
      },
      mounted() {
        console.log('mounted ---')
      },
    })
    // 创建 Profile 实例，并挂载到一个元素上。
    new Profile().$mount('#pb-viewer')
  }
}


customElements.define('freelog-alpha-pbviewer', FreelogAlphaPbviewer);
