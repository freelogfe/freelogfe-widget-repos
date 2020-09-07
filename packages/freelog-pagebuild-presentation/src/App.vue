<template>
  <div class="freelog-pagebuild-presentation-app">
    <header class="f-pb-p__header" v-if="headerVisible">
      <div class="f-pb-p-site-name">
        <div class="f-pb-p-spinner">
          <a href="https://console.freelog.com" target="_blank" class="">F</a>
        </div>
        <h2>Page Build Presentation</h2>
      </div>
    </header>
    <main id="f-pb-p__main-content" :class="{ pdTop80: headerVisible }">
      <div class="f-pb-p-tags-box" v-if="pbTags.length">
        <el-button type="text" size="small" :class="{'selected': selectedTag.length === 0}" @click="emptySelectedTag">全部</el-button>
        <el-button
          size="small"
          type="text"
          v-for="tag in pbTags" :key="tag"
          :class="{'selected': selectedTag.indexOf(tag) !== -1}"
          @click="tapFilterTag(tag)">{{ tag }}
        </el-button>
      </div>
      <div class="f-pb-p-list">
        <el-card class="f-pb-p-item" 
          :body-style="{  }" 
          v-for="(pb, index) in pbMdList" 
          :key="'pb' + index" 
          v-show="targetPbMdList.indexOf(pb.presentableId) > -1"
          v-loading="pb.isRenderedUsageMdMarkdown === 0"
          element-loading-spinner="el-icon-loading" 
        >
          <el-image class="f-pb-p-img" :src="pb.previewImgUrl" :preview-src-list="pb.previewImages || pb.releaseInfo.previewImages || []" fit="contain"></el-image>
          <div class="f-pb-p-info">
            <div class="f-pb-p-i-name">{{pb.presentableName}}</div>
            <div class="f-pb-p-i-tags">
              <el-tag v-for="tag in pb.userDefinedTags" :key="tag" type="s" effect="plain" size="small">
                {{ tag }}
              </el-tag>
            </div>
            <div class="f-pb-i-intro">
              {{pb.releaseInfo && pb.releaseInfo.intro !== '' ? pb.releaseInfo.intro : '暂无详细描述...'}}
            </div>
            <div class="f-pb-p-i-btn-group">
              <!-- <el-button class="i-m-nem-key-copy" type="primary" size="mini" round>复制节点地址</el-button> -->
              <div class="f-pb-p-i-demo-btn" :class="{'disabled': !pb.demoSite}" >
                <a :href="pb.demoSite" target="_blank"><i class="el-icon-caret-right"></i>Demo预览</a>
              </div>
            </div>
            
            <div class="f-pb-p-i-footer">
              <el-button type="text" size="mini" class="f-pb-p-i-auth-btn" v-if="pb.pbReleaseDetailPageUrl">
                <a :href="pb.pbReleaseDetailPageUrl" target="_blank">马上使用该主题</a>
              </el-button>
              <div class="f-pb-p-usage-btn"
                @click="tapViewUsageBtn(index)">
                {{pb.mdBoxVisible ? '收起' : '查看使用方法'}} 
                <i class="el-icon-caret-bottom" :class="{'rotate180': pb.mdBoxVisible}"></i>
              </div>
            </div>
          </div>

          <div class="f-pb-p-usage">
            <div class="f-pb-p-usage-content" :class="{'visible': pb.mdBoxVisible}" :style="{ height: pb.usageMdBoxheight }">
              <div class="f-pb-p-u-md-box" :ref="pb.pbMdBoxRef"></div>
            </div>
          </div>
        </el-card>
      </div>
      <el-backtop></el-backtop>
    </main>
  </div>
</template>

<script>
import MarkdownParser from '@freelog/freelog-markdown-parser'
const refPbUsagePrefix = 'pbUsage'
export default {
  name: 'freelog-pagebuild-presentation',
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
}
</script>
