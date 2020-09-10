<template>
	<div class="freelog-widget-docs-app">
		<docs-header :sidebarVisible.sync="sidebarVisible"></docs-header>
    <router-view></router-view>
  </div>
</template>

<script>
import DocsHeader from '../components/header.vue'
export default {
	name: 'App',
	components: { DocsHeader },
	data() {
		return {
      sidebarVisible: window.innerWidth > 768,
		}
	},
	watch: {},
	mounted() {
		
	},
	methods: {
	}
}
</script>

<style lang="less">
	@import '../index.less';
</style>

