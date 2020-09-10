<template>
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
          <router-link :to="{ name: 'docs-home' }">返回首页</router-link>
        </div>
      </div>
    </div>
  </header> 
</template>

<script>
export default {
  name: 'docs-header',
  props: {
    sidebarVisible: Boolean,
  },
  data() {
    return {
      siteName: window.__auth_info__.__auth_node_name__ || '',
      homePageVisible: true,
      docsName: ''
    }
  },
  watch: {
    $route(to, from) {
      // 对路由变化作出响应...
      if (to.name === 'docs-home') {
        this.homePageVisible = true
        this.docsName = ''
      } else {
        this.homePageVisible = false
        this.docsName = to.params.docsName
      }
    }
  },
  methods: {
		toggleSidebar() {
      this.$emit('update:sidebarVisible', !this.sidebarVisible)
		}
  },
  mounted() {
    this.homePageVisible = this.$route.name === 'docs-home'
    if (!this.homePageVisible) {
      this.docsName = this.$route.params.docsName
    }
    
  },
}
</script>

<style lang="less">
  
</style>
