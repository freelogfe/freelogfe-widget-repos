
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './pages/App.vue'
import Home from './pages/Home.vue'
import Content from './pages/Content.vue'
 
Vue.use(VueRouter)
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
			name: 'docs-home',
			path: '/',
			component: Home,
		},
		{
			name: 'docs-content',
			path: '/:presentableId/:docsName',
			component: Content,
		},
		{
			path: '/:presentableId/:docsName/:contentTitle',
			component: Content,
		},
	]
})
new Vue({
	el: '#freelog-app',
	router,
	render: h => h(App),
})