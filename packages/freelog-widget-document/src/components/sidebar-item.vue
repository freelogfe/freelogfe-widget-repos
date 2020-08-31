<template>
  <div>
    <li class="sidebar-item">
      <a  
        class="sidebar-link"
        v-if="sidebarData.id"
        :href="'#/' + docsName + '/' + sidebarData.title" 
        :class="{ 'active': activeCatalogId === sidebarData.id }"
        @click="tapSidebarItem(sidebarData)">{{sidebarData.title}}</a>
      <p class="sidebar-title" v-else><span>{{sidebarData.title}}</span></p>
      <ul class="sub-list" v-if="sidebarData.children">
        <sidebar-item 
          v-for="(subItem, subIndex) in sidebarData.children" 
          :docs-name="docsName"
          :key="'sub-item-'+(subIndex+1)" 
          :activeCatalogId="activeCatalogId"
          :sidebarData="subItem"></sidebar-item>
      </ul>
    </li>
  </div>
</template>

<script>
export default {
  name: 'sidebar-item',
  props: {
    docsName: String,
    activeCatalogId: String,
    sidebarData: Object
  },
  methods: {
    tapSidebarItem(data) {}
  },
}
</script>

