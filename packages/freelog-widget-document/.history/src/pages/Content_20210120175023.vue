<template>
  <div>
    <div class="main-content" v-if="catalogTreeData.length">
      <docs-sidebar 
        :catalogTreeData="catalogTreeData" 
        :sidebarVisible="sidebarVisible"></docs-sidebar>
      <main @click="sidebarVisible = false">
        <template v-if="pageErrorText === ''">
          <div class="content" ref="mdViewer"></div>
          <div class="page-nav" :class="{ 'visible': !loadingVisible }">
            <p class="inner">
              <router-link 
                class="prev"
                v-if="prevItem"
                :to="{ path: `/${docsPresentableId}/${docsName}/${prevItem.title}` }">
                上一页 <span>{{prevItem.title}}</span>
              </router-link>  
              <router-link 
                class="next"
                v-if="nextItem"
                :to="{ path: `/${docsPresentableId}/${docsName}/${nextItem.title}` }">
                下一页 <span>{{nextItem.title}}</span>
              </router-link>  
            </p>
          </div>
        </template>
        <div class="empty-content" v-else>{{pageErrorText}}</div>
        <div class="f-loading" :class="{'visible': loadingVisible}" >
          <div class="f-loading-inner">
            <p class="f-loading-message">Loading...</p>
          </div>
        </div>
      </main>
    </div>
    <div>{{catalogErrorText}}</div>
  </div>
</template>

<script>
import MarkdownParser from '@freelog/freelog-markdown-parser'
import catalogParser from '../catalog-parser'
import DocsSidebar from '../components/sidebar.vue'
import dMixins from '../mixins.js'
export default {
  name: 'docs-content',
  mixins: [ dMixins ],
  components: {
    DocsSidebar,
  },
  data() {
    return {
      pageErrorText: '',
      catalogErrorText: '',
      sidebarVisible: false,
      loadingVisible: false,
      catalogTreeData: [],
      activeMdData: null,
			prevItem: null,
			nextItem: null,
      catalogMap: {},
      mdPagePresentableMap: {}
    }
  },
  computed: {
    activeDocsPageTitle() {
      return this.$route.params.contentTitle || ''
    },
    docsName() {
      return this.$route.params.docsName
    },
    docsPresentableId() {
      return this.$route.params.presentableId
    },
    nodeId() {
      return window.__auth_info__.__auth_node_id__
    },
  },
  watch: {
    $route(to, from) {
      // 对路由变化作出响应...
      this.homePageVisible = to.name === 'docs-home'
      this.showDocsPageContent()
    },
    '$parent.sidebarVisible': function()  {
      this.sidebarVisible = this.$parent.sidebarVisible
    },
    sidebarVisible() {
      this.$parent.sidebarVisible = this.sidebarVisible
    },
  },
  methods: {
    async init() {
      await this.loadCatalogData(this.docsPresentableId)
      await this.showDocsPageContent()
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
		resolveCatalogData(data) {
			const { catalogTreeData, catalogList } = catalogParser(data)
			
			this.catalogList = catalogList.map((item, index) => {
				const { id, title } = item
				this.catalogMap[title] = { index, id, title }
				return item
			})
			this.catalogTreeData = catalogTreeData
    },
    async showDocsPageContent() {
      const list = this.catalogTreeData
      if (list.length === 0) return 
      if (this.activeDocsPageTitle === '') {
        const { title } = list[0]
        this.$router.push(`/${this.docsPresentableId}/${this.docsName}/${title}`)
      } else {
        this.loadingVisible = true
        const { id: resourceName, index } = this.catalogMap[this.activeDocsPageTitle]
        const data = await this.getPresentableByResourceName(resourceName)
        if (data != null) {
          this.$refs['mdViewer'].innerHTML = `<freelog-markdown-parser presentableId="${data.presentableId}"></freelog-markdown-parser>`
          await new Promise(resolve => this.$nextTick(resolve))
          const $mdParser = document.querySelector('.freelog-widget-docs-app freelog-markdown-parser')
          try {
            await $mdParser.mountPromise
            this.pageErrorText = ''
            this.resolvePageNav(index)
          } catch(e) {
            this.pageErrorText = `markdown文件加载出错喇！！！</br>${e}`
          }
        }
        this.loadingVisible = false
      }
    },
    getPresentableByResourceName(resourceName){
      if (this.mdPagePresentableMap[resourceName]) {
        return Promise.resolve(this.mdPagePresentableMap[resourceName])
      } else {
        let err = false
        return window.FreelogApp.QI.fetch(`/v2/auths/presentables/nodes/${this.nodeId}/${resourceName}/fileStream`)
          .then(resp => {err = !resp.headers.get('freelog-resource-type'); return resp.blob()})
          .then(res => {
            if (!err) {
              this.mdPagePresentableMap[resourceName] = res
              this.pageErrorText = ''
              return res
            } else {
              this.pageErrorText = `markdown文件加载出错了！！！</br>${res.msg}`
              return null
            }
          })
      }
      
    },
		loadMarkdownData(resourceName) {
			if(this.markdownDataMap[resourceName]) {
				return Promise.resolve(this.markdownDataMap[resourceName])
			}else {
        return this.loadPresentableDataByName(resourceName)
					.then((markdownData) => {
						if(typeof markdownData === 'string') {
              this.markdownDataMap[resourceName] = markdownData
              return markdownData
						}else {
              // markdown发行 授权未通过
              return null
						}
					})
			}
    },
    resolvePageNav(index) {
      this.prevItem = this.catalogList[index - 1] || null
      this.nextItem = this.catalogList[index + 1] || null
      // console.log(index, '-', this.catalogList[index])
    }
  },
  mounted() {
    this.init()
  },
}
</script>
