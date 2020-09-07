<template>
  <li class="sidebar-item">
    <a  
      class="sidebar-link"
      v-if="data.releaseId"
      :href="'#/' + docsName + '/' + data.title" 
      :class="{ 'active': $root.activeReleaseId === data.releaseId }"
      @click="tapSidebarItem(data)">{{data.title}}</a>
    <p class="sidebar-title" v-else><span>{{data.title}}</span></p>
    <ul class="sub-list" v-if="data.children">
      <sidebar-item 
        v-for="(subItem, subIndex) in data.children" 
        :docs-name="docsName"
        :key="'sub-item-'+(subIndex+1)" 
        :index="subIndex"
        :data="subItem"></sidebar-item>
    </ul>
  </li>
</template>

<script>
export default {
  name: 'sidebar-item',
  props: ['data', 'index', 'docsName'],
  methods: {
    tapSidebarItem(data) {
      this.$root.activeReleaseId = data.releaseId
      this.$root.activeTitle = data.title
    }
  },
}
</script>