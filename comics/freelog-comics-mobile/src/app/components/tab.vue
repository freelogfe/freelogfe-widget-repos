<template>
  <div>
    <div class="tab-bar">
      <div
        class="tab-item"
        v-for="(tab, index) in tabs"
        :key="'tab-'+index"
        @click="exchangeTab(tab)"
      >
        <a :class="{'active': tab === activeTabName}" href="javascript:;">{{tab}}</a>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'comics-tab',
    props: {
      // tabs: Array
      activeTabName: String,
    },
    data() {
      return {
        tabs: []
      }
    },
    methods:  {
      init() {
        this.tabs = this.$slots.default.filter(instance => instance.tag).map(VNode => VNode.data.attrs.label)
      },
      exchangeTab(tab) {
        this.$emit('update:activeTabName', tab)
      },
    },
    mounted() {
      this.init()
    },
  }
</script>

<style lang="less" scoped>
  .tab-bar {
    display: flex; border-bottom: 1px solid #ccc;

    .tab-item{
      flex: 1; padding: 0 .6rem;

      a {
        display: block; color: #555; line-height: 1.2rem; font-size: .426667rem; text-align: center;
        &.active {
          border-bottom: 2px solid #0088cc;
        }
      }
    }

  }
</style>
