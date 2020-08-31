import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import MdPage from './md-page.vue'
import { Message, MessageBox, Loading } from 'element-ui'

/**
 * 期望功能：
 * 1. 响应式布局
 * 2. 左侧栏-文件目录
 * 3. markdown(.md格式)文件渲染
 * 4. 右侧栏-markdown文件标题定位
 * 5. 向后滚动一段距离，头部隐藏
 * 6. 左右侧栏滚动悬浮
 */
Vue.use(VueRouter)
Vue.use(Loading.directive)
Vue.prototype.$loading = Loading.service
Vue.prototype.$message = Message
Vue.prototype.$msgbox = MessageBox

const scrollBehavior = (to, from, savedPosition) => {
	if (savedPosition) {
		return savedPosition
	}
	const position = {}
	if (to.hash) {
		position.selector = to.hash
	}

	if (to.meta.scrollToTop !== false) {
		position.x = 0
		position.y = 0
	}
	return position
}
const router = new VueRouter({
	mode: 'history',
	scrollBehavior,
	routes: [
		{
			path: '/',
			component: MdPage
		},
		{
			path: '/acticles/:presentableId/:presentableName',
			component: MdPage
		}
	]
})


new Vue({
	router,
	el: '#freelog-widget-document',
	render: (h) => h(App)
})