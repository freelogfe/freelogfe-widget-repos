import MarkdownParser from '@freelog/freelog-markdown-parser'
import './index.less'
var htmlStr = require('./index.html')

class FreelogPagebuildPresentation extends HTMLElement {
  constructor() {
    super()
    this.innerHTML = htmlStr
  }

  connectedCallback (){
    this.init()
  }

  init() {
    const Vue = window.f_common_lib.Vue
    new Vue({
      el: '#f-pb-p__main',
      data() {
        return {
          fetchPbMdTags: 'pb-md',
          refPbUsagePrefix: 'pbUsage',
          pbMdList: [],
          pbMdDataMap: {},
          pbDemoPreviewSiteMap: {},
          pbTagsSet: new Set(),
          pbTags: [],
          selectedTag: []
        }
      },
      computed: {
        targetPbMdList() {
          return this.pbMdList.filter(p => {
            const leng1 = this.selectedTag.length
            if(leng1 === 0) return true
            const leng2 = p.userDefinedTags.length
            const size = new Set([...p.userDefinedTags, ...this.selectedTag]).size
            if(size === (leng1 + leng2)) {
              return false
            }else {
              return true
            }
          })
        }
      },
      created() {
        this.fetchPbMarkdownList()
        this.fetchDemoPreviewSiteData()
      },
      mounted() {
        
      },
      methods: {
        fetchPbMarkdownList() {
          const tag = 'pb-md'
          const refPbUsagePrefix = 'pbUsage'
          return window.FreelogApp.QI.fetchPresentablesList({ tags: tag, isLoadingResourceInfo: 1 })
            .then(res => {
              if(res.errcode === 0) {
                this.pbMdList = res.data.dataList.map((p, index) => {
                  const { userDefinedTags, releaseInfo: { previewImages, releaseId, version }, resourceInfo } = p
                  p.userDefinedTags = userDefinedTags.filter(item => {
                    if(item !== tag) {
                      this.pbTagsSet.add(item)
                      return true
                    }else {
                      return false
                    }
                  })
                  
                  p.previewImgUrl = previewImages[0] || 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/console/public/img/resource.jpg'
                  p.usageMdBoxheight = 0
                  p.mdBoxVisible = false
                  p.pbMdBoxRef = refPbUsagePrefix + index
                  p.pbDemoSite = resourceInfo.meta.pbDemoSite || ''
                  p.pbReleaseDetailPageUrl = `http://console.testfreelog.com/release/detail/${releaseId}?version=${version}`
                  this.renderPbMarkdown(p)

                  this.fetchPresentableDetail(p.presentableId)
                    .then(res => {
                      if(res.errcode === 0) {
                        p.releaseInfo = res.data.releaseInfo
                      }
                    })
                  return p
                })
                
                this.pbTags = [...this.pbTagsSet]
              }
            })
          
        },
        renderPbMarkdown(presentable) {
          const { presentableId, pbMdBoxRef } = presentable
          return this.loadMarkdownData(presentableId)
            .then(() => {
              const markdownData = this.pbMdDataMap[presentableId]
              const container = this.$refs[pbMdBoxRef] ?this.$refs[pbMdBoxRef][0] : null
              
              if(!markdownData || container == null) return 
              var markdownParser = new MarkdownParser({
                showToc: false,
                container,
                presentableId,
                subReleases: [],
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
              markdownParser.render(markdownData)
            })
            .catch(e => console.log(e))
            .finally(() => {
              this.loadingVisible = false
              window.scrollTo({ top: 0, behavior: "instant" })
            })
        },
        fetchPresentableDetail(presentableId) {
          return window.FreelogApp.QI.fetchPresentableInfo(presentableId)
        },
        fetchDemoPreviewSiteData() {
          return window.FreelogApp.QI.fetchPresentablesList({ resourceType: 'json', tags: 'demo-site' })
            .then(res => {
              var target = null
              if(res.errcode === 0) {
                target = res.data.dataList[0]
              }else {
                this.$message.error(res.msg)
              }
              return target
            })
            .then(p => {
              if(p != null) {
                return this.loadPresentableData(p.presentableId)
              }else {
                return Promise.reject()
              }
            })
            .then(res => {
              if(res.errcode != null) {
                // 授权错误
              }else {
                try {
                  const map = JSON.parse(res)
                  this.pbDemoPreviewSiteMap = map
                }catch(e) {
                  console.warning('fetchDemoPreviewSiteData', e)
                }
              }
            })
        },
        loadMarkdownData(presentableId) {
          if(this.pbMdDataMap[presentableId]) {
            return Promise.resolve(this.pbMdDataMap[presentableId])
          }else {
            return this.loadPresentableData(presentableId)
              .then((markdownData) => {
                if(typeof markdownData === 'string') {
                  this.pbMdDataMap[presentableId] = markdownData
                }else {
                  // markdown发行 授权未通过
                }
              })
          }
        },
        loadPresentableData(presentableId) {
          return window.FreelogApp.QI.fetchPresentableResourceData(presentableId).then(resp => {
            var isError = !resp.headers.get('freelog-resource-type')
            return isError ? resp.json() : resp.text()
          })
        },
        tapViewUsageBtn(index) {
          const pb = this.pbMdList[index]
          pb.mdBoxVisible = !pb.mdBoxVisible
          if(pb.mdBoxVisible) {
            const ref = this.refPbUsagePrefix + index
            if(this.$refs[ref].length) {
              const $dom = this.$refs[ref][0]
              pb.usageMdBoxheight = $dom.offsetHeight + 'px'
            }
          }else {
            pb.usageMdBoxheight = 0
          }
        },
        tapFilterTag(tag) {
          const index = this.selectedTag.indexOf(tag)
          if(index !== -1) {
            this.selectedTag.splice(index, 1)
          }else {
            this.selectedTag.push(tag)
          }
        },
        emptySelectedTag() {
          this.selectedTag = []
        },
        tapDemoPreviewBtn(url) {
          window.open(url)
        }
      },
    })
  }
}


customElements.define('freelog-pagebuild-presentation', FreelogPagebuildPresentation);
