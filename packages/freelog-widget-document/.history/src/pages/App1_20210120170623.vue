<template>
	<div class="freelog-widget-docs-app">
    <header class="nav-bar">
			<div class="main-content">
				<div class="site-name" :class="{'visible': siteName}">
					<div class="f-loading-spinner">
						<a href="https://console.freelog.com" target="_blank" class="">F</a>
					</div>
					<div class="sidebar-toggle-btn" :class="{'open': sidebarVisible}" v-if="!homePageVisible" @click="toggleSidebar">
						<span></span>
						<span></span>
						<span></span>
					</div>
					<h2>{{docsName || siteName}}</h2>
				</div>
				<div class="header-right-box">
					<div class="docs-menu-btn" :class="{ 'visible': !homePageVisible }" >
						<a href="#">返回首页</a>
					</div>
				</div>
			</div>
    </header> 

		<div class="docs-list-page" v-if="homePageVisible">
			<div class="docs" v-for="docs in docsList" :key="docs.presentableName">
				<a :href="'#/' + docs.presentableName + '/'">
					<img :src="docs.previewUrl" class="image">
					<div style="padding: 14px;">
						<span>{{docs.presentableName}}</span>
						<div class="bottom clearfix">
							<time class="time">{{docs.updateDate}}</time>
						</div>
					</div>
				</a>
			</div>
			<div class="docs-placeholder"></div>
			<div class="docs-placeholder"></div>
			<div class="docs-placeholder"></div>
			<div class="docs-placeholder"></div>
		</div>
    
    <div class="main-content" v-if="catalogTreeData.length && !homePageVisible">
      <aside :class="{ 'visible': sidebarVisible }" id="docs-sidebar">
        <ul class="sidebar-links">
          <sidebar-item 
            :docs-name="docsName"
            v-for="(item, index) in catalogTreeData" 
            :key="'item-'+(index+1)" 
						:activeCatalogId="activeCatalogId"
            :sidebarData="item"></sidebar-item>
        </ul>
      </aside>
      <main @click="sidebarVisible = false">
        <div class="content" ref="mdViewer" v-show="activeMdData != null"></div>
        <div class="empty-content" v-show="activeMdData == null">markdown文件未上线...</div>
        <div class="page-nav" :class="{ 'visible': activeCatalogId !== '' }" v-show="!loadingVisible && activeMdData != null">
          <p class="inner">
            <a class="prev" :href="'#/' + docsName + '/' + prevItem.title" v-if="prevItem">
              上一页
              <span>{{prevItem.title}}</span>
            </a>
            <a class="next" :href="'#/' + docsName + '/' + nextItem.title" v-if="nextItem">
              <span>{{nextItem.title}}</span>
              下一页
            </a>
          </p>
        </div>
        <div class="f-loading" :class="{'visible': loadingVisible}" >
          <div class="f-loading-inner">
            <!-- <div class="f-loading-spinner">F</div> -->
            <p class="f-loading-message">Loading...</p>
          </div>
        </div>
      </main>
    </div>

    <div class="docs-error-box" v-if="catalogTreeData.length === 0 && !homePageVisible">
			<p class="" v-html="catalogErrorText"></p>
		</div>
  </div>
</template>

<script>
import MarkdownParser from '@freelog/freelog-markdown-parser'
import catalogParser from '../catalog-parser'
import SidebarItem from './sidebar-item.vue'
var historyStateHandler = null
export default {
	name: 'App',
	components: { SidebarItem },
	data() {
		return {
			siteName: window.__auth_info__.__auth_node_name__ || '',
			catalogErrorText: '',
			docsList: [],
			docsName: '',
			docsTags: null,
			actIndex: 0,
			activeDocsPresentableId: '',
			activeCatalogId: '',
			activeMdPresentableId: '',
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
			homePageVisible: false,
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
		activeCatalogId() {
			if(this.activeCatalogId === '') return 
			this.loadingVisible = true
			this.loadMDPresentablesList()
				.then(() => {
					const presentable = this.mdPresentablesMap[this.activeCatalogId]
					if(presentable) {
						this.activeMdPresentableId = presentable.presentableId
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
		this.loadingVisible = true
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
								const { resourceInfo } = p
								this.mdPresentablesMap[resourceInfo.resourceId] = p
								this.mdPresentablesMap[resourceInfo.resourceName] = p
								return p
							})
							return this.mdPresentablesList
						}
					})
			}else {
				return Promise.resolve(null)
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
			this.loadMDPresentablesList()
				.then(res => {
					if (res != null) {
						this.getActiveMdPage()
					}
				})
			this.loadCatalogData(catalogPresentableId)
			
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
				const { id, title } = item
				this.catalogMap[title] = { index, id, title }
				return item
			})
			this.catalogTreeData = catalogTreeData
		},
		loadMarkdownData() {
			const presentableId = this.activeMdPresentableId
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
					const presentableId = this.activeMdPresentableId
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
					this.activeCatalogId = ''
					// window.location.hash = ''
				}
			}
		},
		getActiveMdPage() {
			if(this.docsName === '' || this.catalogList.length === 0) return 
			const regE = new RegExp(`#/${this.docsName}/`, 'i')
			var _title = decodeURIComponent(window.location.hash).replace(regE, '')
			if(this.catalogMap[_title]) {
				this.activeCatalogId = this.catalogMap[_title].id
			}else {
				const { id, title } = this.catalogList[0]
				console.log('getActiveMdPage -', id, title)
				this.activeCatalogId = id
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
}
</script>

<style lang="less">
	@import '../index.less';
</style>

