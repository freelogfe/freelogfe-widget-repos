import MarkdownParser from '@freelog/freelog-markdown-parser'
import Vue from 'vue'
import { Tag, Image, Card, Backtop, Button, Icon, Message, Loading } from 'element-ui'
import './index.less'

Vue.component(Tag.name, Tag)
Vue.component(Image.name, Image)
Vue.component(Card.name, Card)
Vue.component(Backtop.name, Backtop)
Vue.component(Button.name, Button)
Vue.component(Icon.name, Icon)
Vue.use(Loading.directive)
Vue.prototype.$message = Message
Vue.prototype.$loading = Loading.service

const refPbUsagePrefix = 'pbUsage'
var app = new Vue({
  el: '#f-pb-presentation',
  template: require('./index.html'),
  data() {
    return {
      fetchPbMdTags: 'pb-md',
      refPbUsagePrefix: 'pbUsage',
      pbMdList: [],
      pbMdDataMap: {},
      pbDemoPreviewSiteMap: null,
      pbTagsSet: new Set(),
      pbTags: [],
      selectedTag: []
    }
  },
  computed: {
    headerVisible() {
      return !(/console\.(test)?freelog\.com/.test(location.hostname))
    },
    targetPbMdList() {
      return this.pbMdList.filter(p => {
        const leng1 = this.selectedTag.length
        if (leng1 === 0) return true
        const leng2 = p.userDefinedTags.length
        const size = new Set([...p.userDefinedTags, ...this.selectedTag]).size
        if (size === leng2) {
          return true
        } else {
          return false
        }
      }).map(p => p.presentableId)
    }
  },
  watch: {
    pbDemoPreviewSiteMap() {
      this.pbMdList = this.pbMdList.map(p => {
        const { releaseInfo } = p
        if (releaseInfo && releaseInfo.releaseName) {
          const tmp = this.pbDemoPreviewSiteMap[releaseInfo.releaseName]
          if (tmp) {
            p.PB_releaseName = tmp['PB-releaseName']
            const releaseName = encodeURIComponent(p.PB_releaseName) 
            const host = window.FreelogApp.Env.isTest ? 'console.testfreelog.com' : 'console.freelog.com'
            p.pbReleaseDetailPageUrl = `//${host}/release/detail?releaseName=${releaseName}`
            p.demoSite = tmp['PB-demo-site']
          }
        }
        return p
      })
    }
  },
  created() {},
  mounted() {
    this.fetchPresentablesList()
  },
  methods: {
    fetchPresentablesList() {
      return window.FreelogApp.QI.pagingGetPresentables({ isLoadingResourceInfo: 1 })
        .then(res => {
          if (res.errcode === 0) {
            const dataList = res.data.dataList
            this.resolveMDList(dataList)
            this.resolveDemoSite(dataList)
          }
        })
        .finally(() => window.FreelogApp.$loading.hide())
    },
    resolveMDList(presetnablesList) {
      const TAG = 'pb-md'
      this.pbMdList = presetnablesList.filter(p => p.userDefinedTags.indexOf(TAG) !== -1).map((p, index) => {
        const { userDefinedTags, releaseInfo: { previewImages = [], releaseId, version } } = p
        p.userDefinedTags = userDefinedTags.filter(item => {
          if(item !== TAG) {
            this.pbTagsSet.add(item)
            return true
          }else {
            return false
          }
        })
        p.previewImgUrl = 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/console/public/img/resource.jpg'
        if (previewImages.length) {
          p.previewImgUrl = previewImages[0]
        }
        p.usageMdBoxheight = 0
        p.mdBoxVisible = false
        p.pbMdBoxRef = refPbUsagePrefix + index
        p.isRenderedUsageMdMarkdown = -1
        return p
      })
      this.pbTags = [...this.pbTagsSet]
    },
    async resolveDemoSite(presetnablesList) {
      const DEMO_SITE_TAG = 'demo-site'
      const list = presetnablesList.filter(p => p.userDefinedTags.indexOf(DEMO_SITE_TAG) !== -1)
      if (list.length) {
        const res = await this.loadPresentableData(list[0].presentableId)
        if(res.errcode == null) {
          try {
            const map = JSON.parse(res)
            this.pbDemoPreviewSiteMap = map
          } catch(e) {
            console.warn('fetchDemoPreviewSiteData', e)
          }
        }
      }
      
    },
    renderPbUsageMarkdown(index) {
      const pbPresentable = this.pbMdList[index]
      const { presentableId, pbMdBoxRef } = pbPresentable
      pbPresentable.isRenderedUsageMdMarkdown = 0
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
          pbPresentable.isRenderedUsageMdMarkdown = 1
          this.tapViewUsageBtn(index)
        })
        .catch(e => console.log(e))
    },
    fetchDemoPreviewSiteData() {
      return window.FreelogApp.QI.pagingGetPresentables({ resourceType: 'json', tags: 'demo-site', pageSize: 99 })
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
              console.warn('fetchDemoPreviewSiteData', e)
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
      return window.FreelogApp.QI.getPresentableData(presentableId).then(resp => {
        var isError = !resp.headers.get('freelog-resource-type')
        return isError ? resp.json() : resp.text()
      })
    },
    tapViewUsageBtn(index) {
      const pb = this.pbMdList[index]
      if (pb.isRenderedUsageMdMarkdown === 1) {
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
      } else {
        this.renderPbUsageMarkdown(index)
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

export async function bootstrap() {
  console.log('[Widget]: bootstrap')
}

export async function mount() {
  console.log('[Widget]: mount')
}
export async function unmount() {
  console.log('[Widget]: unmount')
}
