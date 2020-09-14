<template>
  <div>
    <aside id="docs-sidebar" :class="{ 'visible': sidebarVisible }">
      <ul class="sidebar-links">
        <sidebar-item 
          v-for="(item, index) in catalogTreeData" 
          :key="'item-'+(index+1)" 
          :sidebarData="item"></sidebar-item>
      </ul>
    </aside>
  </div>
</template>

<script>
import SidebarItem from './sidebar-item.vue'
export default {
  name: 'docs-sidebar',
  components: { SidebarItem },
  props: {
    sidebarVisible: {
      type: Boolean,
      default: false
    },
    catalogTreeData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isMobileClient: /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)
    }
  },
  methods: {
		async addTouchEventListener() {
      if(!this.isMobileClient) return
      await new Promise(resolve => this.$nextTick(resolve))
			const $app = document.querySelector('.freelog-widget-docs-app')
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
          this.$emit('update:sidebarVisible', false)
				}
			}, false)
    },
  },
  mounted() {
    this.addTouchEventListener()
  },
}
</script>
