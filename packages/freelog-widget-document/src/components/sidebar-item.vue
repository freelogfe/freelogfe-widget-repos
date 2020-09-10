<template>
  <div>
    <li class="sidebar-item">
      <router-link 
        class="sidebar-link"
        v-if="sidebarData.id"
        :class="{ 'active': docsMDPageTitle === sidebarData.title }"
        :to="{ path: targetPath }">
        {{sidebarData.title}}
      </router-link>
      <p class="sidebar-title" v-else><span>{{sidebarData.title}}</span></p>
      <ul class="sub-list" v-if="sidebarData.children">
        <sidebar-item 
          v-for="(subItem, subIndex) in sidebarData.children" 
          :key="'sub-item-'+(subIndex+1)" 
          :sidebarData="subItem"></sidebar-item>
      </ul>
    </li>
  </div>
</template>

<script>
export default {
  name: 'sidebar-item',
  props: {
    activeCatalogId: String,
    sidebarData: Object
  },
  data() {
    return {
    }
  },
  computed: {
    docsName() {
      return this.$route.params.docsName
    },
    docsPresentableId() {
      return this.$route.params.presentableId
    },
    docsMDPageTitle() {
      return this.$route.params.contentTitle || ''
    },
    targetPath() {
      return `/${this.docsPresentableId}/${this.docsName}/${this.sidebarData.title}`
    },
  },
  methods: {
  },
  mounted() {
  },
}
</script>

