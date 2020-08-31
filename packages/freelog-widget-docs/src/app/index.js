import Vue from 'vue'
import MarkdownParser from '@freelog/freelog-markdown-parser'
import catalogParser from './catalog-parser'
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
      el: '.freelog-widget-docs-app',
      data() {
        return {
          siteName: window.__auth_info__.__auth_node_name__ || '',
          catalogErrorText: '',
          homePageVisible: false,
          docsList: [],
          docsName: '',
          docsTags: null,
          actIndex: 0,
          activeDocsPresentableId: '',
          activeReleaseId: '',
          activeMdPageId: '',
          activeTitle: '',
          catalogList: [],
          catalogTreeData: [],
          catalogMap: {},
          mdPresentablesList: [],
          mdPresentablesMap: {},
          markdownDataMap: {},
          entityNidMap: {},
          presentableSubReleasesMap: {},
          activeMdData: '',
          prevItem: null,
          nextItem: null,
          loadingVisible: false,
          sidebarVisible: window.innerWidth > 768,
          isMobileClient: /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)
        }
      },
      computed: {
        QI() {
          return window.FreelogApp.QI
        },
      },
      watch: {
        activeReleaseId() {
          if(this.activeReleaseId === '') return 
          this.loadingVisible = true
          this.loadMDPresentablesList()
            .then(() => {
              const presentable = this.mdPresentablesMap[this.activeReleaseId]
              if(presentable) {
                this.activeMdPageId = presentable.presentableId
                return this.showMarkdown()
              }else {
                this.activeMdData = null
                this.loadingVisible = false
              }
            })
        },
        activeTitle() {
          const item = this.catalogMap[this.activeTitle]
          
          if(item) {
            this.actIndex = item.index
            this.prevItem = this.catalogList[item.index - 1]
            this.nextItem = this.catalogList[item.index + 1]
          }
        },
        activeDocsPresentableId() {
          if(this.activeDocsPresentableId !== '') {
            this.showDocsPage()
          }
        }
      },
      mounted() {
        this.loadCatalogPresentableList()
          .then((docsList) => {
            window.FreelogApp.$loading.hide()
            this.docsList = docsList.map(item => {
              const { resourceInfo, updateDate, previewImages } = item
              const d = new Date(updateDate)
              var year = d.getFullYear(), month = d.getMonth() + 1, date = d.getDate()
              month = month > 9 ? month : '0' + month
              item.updateDate = `${year}-${month}-${date}`
              item.previewUrl = 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/console/public/img/resource.jpg'
              if (previewImages && previewImages[0]) {
                item.previewUrl = previewImages[0]
              } else if(resourceInfo && resourceInfo.previewImages[0]) {
                item.previewUrl = resourceInfo && resourceInfo.previewImages[0]
              }
              return item 
            })
            
            if(this.docsList.length === 1) {
              this.activeDocsPresentableId = this.docsList[0].presentableId
              this.docsName = this.docsList[0].presentableName
              this.docsTags = this.docsList[0].userDefinedTags.join(',')
              this.homePageVisible = false
            }else {
              this.resolvelocationHash()
            }
            return this.docsList
          })
        this.addHistoryStateListener()
        this.addTouchEventListener()
      },
      methods: {
        loadMDPresentablesList() {
          const docsTags = this.docsTags
          if(this.mdPresentablesList.length === 0) {
            return this.QI.pagingGetPresentables({ 
                resourceType: "markdown", 
                isLoadingResourceInfo: 1, 
                tags: docsTags,
                pageSize: 100
              })
              .then(res => {
                if(res.errcode === 0) {
                  this.mdPresentablesList = res.data.dataList.map(p => {
                    const { releaseInfo } = p
                    this.mdPresentablesMap[releaseInfo.releaseId] = p
                    this.mdPresentablesMap[releaseInfo.releaseName] = p
                    return p
                  })
                }
              })
          }else {
            return Promise.resolve()
          }
        },
        loadCatalogPresentableList() {
          return window.FreelogApp.QI.pagingGetPresentables({ 
              resourceType: "catalog",
              isLoadingResourceInfo: 1, 
              pageSize: 100
            })
            .then(res => {
              if(res.errcode === 0) {
                const arr = res.data.dataList.sort((p1, p2) => {
                  const t1 = +new Date(p1.updateDate)
                  const t2 = +new Date(p2.updateDate)
                  return t2 > t1 ? 1 : t1 === t2 ? 0 : -1
                })
                if(arr.length) {
                  return arr
                }else {
                  this.catalogErrorText = '该节点未上线目录文件！'
                  return Promise.reject([])
                }
              }else {
                this.catalogErrorText = res.msg
                return Promise.reject([])
              }
            })
        },
        showDocsPage() {
          const catalogPresentableId = this.activeDocsPresentableId
          Promise.all([
            this.loadMDPresentablesList(),
            this.loadCatalogData(catalogPresentableId)
          ])
          .then(() => {
            this.getActiveMdPage()
          })
        },
        loadCatalogData(pId) {
          return this.loadPresentableData(pId)
            .then(res => {
              if(res.errcode == null) {
                this.resolveCatalogData(res)
              }else {
                // 授权出错
              }
            })
            .catch(e => {
              if(e != null) {
                this.catalogErrorText = `出错喇！！！<br/>${e}` 
              }
              console.error(e)
            }) 
        },
        loadPresentableData(presentableId) {
          return window.FreelogApp.QI.getPresentableData(presentableId).then(resp => {
            var isError = !resp.headers.get('freelog-resource-type')
            var subReleasesText = resp.headers.get('freelog-sub-dependencies')
            this.entityNidMap[presentableId] = resp.headers.get('freelog-entity-nid')
            try {
              let subReleases = Buffer.from(subReleasesText,'base64').toString('utf-8')
              subReleases = JSON.parse(subReleases) 
              this.presentableSubReleasesMap[presentableId] = subReleases
            }catch(e) {
              console.error(e)
            }
            return isError ? resp.json() : resp.text()
          })
        },
        resolveCatalogData(data) {
          const { catalogTreeData, catalogList } = catalogParser(data)
          
          this.catalogList = catalogList.map((item, index) => {
            const { releaseId, title } = item
            this.catalogMap[title] = { index, releaseId, title }
            return item
          })
          this.catalogTreeData = catalogTreeData
        },
        loadMarkdownData() {
          const presentableId = this.activeMdPageId
          if(this.markdownDataMap[presentableId]) {
            return Promise.resolve(this.markdownDataMap[presentableId])
          }else {
            return this.loadPresentableData(presentableId)
              .then((markdownData) => {
                if(typeof markdownData === 'string') {
                  this.markdownDataMap[presentableId] = markdownData
                }else {
                  // markdown发行 授权未通过
                }
              })
          }
        },
        showMarkdown() {
          return this.loadMarkdownData()
            .then(() => {
              const presentableId = this.activeMdPageId
              const markdownData = this.markdownDataMap[presentableId]
              if(!markdownData) return 
              var markdownParser = new MarkdownParser({
                showToc: false,
                container: this.$refs.mdViewer,
                presentableId,
                entityNid: this.entityNidMap[presentableId],
                subReleases: this.presentableSubReleasesMap[presentableId] || [],
                renderImageError($el, data) {
                  if ($el) {
                    $el.src = ''
                    //todo
                    if (typeof data === 'string') {
                      $el.src = ''
                    } else {
      
                    }
                  }
                  console.log('renderImageError', arguments)
                }
              })
              this.activeMdData = markdownData
              markdownParser.render(markdownData)
            })
            .catch(e => console.log(e))
            .finally(() => {
              this.loadingVisible = false
              window.scrollTo({ top: 0, behavior: "instant" })
            })
        },
        addHistoryStateListener() {
          var self = this
          historyStateHandler = function () {
            self.resolvelocationHash()
          }
          window.addEventListener('popstate', historyStateHandler)
        },
        resolvelocationHash() {
          this.getActiveDocsPage()
          this.getActiveMdPage()
        },
        getActiveDocsPage() {
          const list = this.docsList
          if(list.length === 1) {
            this.docsName = list[0].presentableName
            this.docsTags = list[0].userDefinedTags.join(',')
            this.homePageVisible = false
          }else {
            const hash = decodeURIComponent(window.location.hash)
            const arr = list.filter(p => {
              const regE = new RegExp(p.presentableName)
              return regE.test(hash)
            })

            if(arr.length) {
              this.activeDocsPresentableId = arr[0].presentableId
              this.docsName = arr[0].presentableName
              this.docsTags = arr[0].userDefinedTags.join(',')
              this.homePageVisible = false
            }else {
              this.homePageVisible = true
              this.docsName = ''
              this.activeDocsPresentableId = ''
              this.activeReleaseId = ''
              // window.location.hash = ''
            }
          }
        },
        getActiveMdPage() {
          if(this.docsName === '' || this.catalogList.length === 0) return 
          const regE = new RegExp(`#/${this.docsName}/`, 'i')
          var _title = decodeURIComponent(window.location.hash).replace(regE, '')
          
          if(this.catalogMap[_title]) {
            this.activeReleaseId = this.catalogMap[_title].releaseId
          }else {
            const { releaseId, title } = this.catalogList[0]
            this.activeReleaseId = releaseId
            _title = title
            window.location.hash = `/${this.docsName}/${_title}`
          }
          this.activeTitle = _title
        },
        addTouchEventListener() {
          if(!this.isMobileClient) return
          const $app = self.querySelector('.freelog-widget-docs-app')
          var sPageX, ePageX
          $app.addEventListener('touchstart', (e) => {
            sPageX = e.targetTouches[0].pageX
          }, false)
          $app.addEventListener('touchmove', (e) => {
            ePageX = e.targetTouches[0].pageX
          }, false)
          
          $app.addEventListener('touchend', (e) => {
            const distance = Math.abs(ePageX - sPageX)
            if(distance > 20) {
              this.sidebarVisible = false
            }
          }, false)
        },
        toggleSidebar() {
          this.sidebarVisible = !this.sidebarVisible
        }
      }
    })
  }

  registerComponents() {
    const self = this
    Vue.component('sidebar-item', {
      template: self.$sidebarItemTpl.innerHTML,
      props: ['data', 'index', 'docsName'],
      methods: {
        tapSidebarItem(data) {
          this.$root.activeReleaseId = data.releaseId
          this.$root.activeTitle = data.title
        }
      },
    })
  }
}

customElements.define('freelog-widget-docs', FreelogWidgetDocs)

// export async function bootstrap() {}
// export async function mount() {}
// export async function unmount() {}

