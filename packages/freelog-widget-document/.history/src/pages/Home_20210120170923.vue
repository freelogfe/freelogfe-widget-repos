<template>
	<div>
		<div class="docs-list-page">
			<div class="docs" v-for="docs in docsList" :key="docs.presentableName">
				<router-link :to="{ name: 'docs-content', params: { presentableId: docs.presentableId, docsName: docs.presentableName }}">
					<img :src="docs.previewUrl" class="image">
					<div style="padding: 14px;">
						<span>{{docs.presentableName}}</span>
						<div class="bottom clearfix">
							<time class="time">{{docs.updateDate}}</time>
						</div>
					</div>
				</router-link>
			</div>
			<div class="docs-placeholder"></div>
			<div class="docs-placeholder"></div>
			<div class="docs-placeholder"></div>
			<div class="docs-placeholder"></div>
		</div>

		<div class="docs-error-box" v-if="docsList.length === 0">
			<p class="" v-html="catalogErrorText"></p>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Docs-home',
	data() {
		return {
			loadingVisible: false,
			catalogErrorText: '',
			docsList: [],
		}
	},
	computed: {
		QI() {
			return window.FreelogApp.QI
		},
	},
	watch: {},
	mounted() {
		this.loadingVisible = true
		this.loadCatalogPresentableList()
			.then((docsList) => {
				window.FreelogApp.$loading.hide()
				this.docsList = docsList.map(item => {
					const { resourceInfo, updateDate, coverImages } = item
					const d = new Date(updateDate)
					var year = d.getFullYear(), month = d.getMonth() + 1, date = d.getDate()
					month = month > 9 ? month : '0' + month
					item.updateDate = `${year}-${month}-${date}`
					item.previewUrl = 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/console/public/img/resource.jpg'
					if (coverImages && coverImages[0]) {
						item.previewUrl = coverImages[0]
					} else if(resourceInfo.coverImages && resourceInfo.coverImages[0]) {
						item.previewUrl = resourceInfo.coverImages && resourceInfo.coverImages[0]
					}
					return item 
				})
				return this.docsList
			})
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
	}
}
</script>

<style lang="less">
	@import '../index.less';
</style>

