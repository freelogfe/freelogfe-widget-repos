<template>
  <div class="article-viewer" :class="{'has-toc-view': hasToc}">
    <header>
      <div class="article-title">{{data.presentableName}}</div>
      <article-tags :tags="data.tags" class="article-tags"></article-tags>
    </header>
    <div class="article-content js-article-content">
      <div v-if="data.error && data.errorInfo" class="resource-error">
        <label>{{data.errorInfo.desc}}</label>
        <span class="resource-error-btn" @click="errorHandler(data)">{{data.errorInfo.tip}}</span>
      </div>
      <div class="loading" v-if="loading"></div>
      <div class="markdown-body"></div>
    </div>
  </div>
</template>


<script>
  import MarkdownParser from '@freelog/freelog-markdown-parser'
  import ArticleTags from '../tags/index.vue'
  

  export default {
    name: 'blog-article-viewer',
    data() {
      return {
        loading: true,
        hasToc: false
      }
    },

    components: {ArticleTags},
    props: {
      data: {
        type: Object,
        default() {
          return {
            tags: [],
            content: null
          }
        }
      },
      showToc: {
        type: Boolean,
        default: true
      }
    },
    watch: {
      'data.content'() {
        this.render()
      }
    },
    mounted() {
      const { presentableId, entityNid, subReleases = [] } = this.data
      this.parser = new MarkdownParser({
        container: this.$el.querySelector('.js-article-content .markdown-body'),
        presentableId,
        subReleases,
        entityNid,
        showToc: this.showToc,
        afterRender: (config) => {
          this.hasToc =  this.showToc ? !!config.tocs.length : this.showToc;
        }
      });

      this.render()
    },
    methods: {
      render() {
        this.loading = false

        if (!this.data || (!this.data.error && !this.data.content)) {
          return;
        }

        if (this.data.error) {
          this.data.errorInfo = window.FreelogApp.getErrorInfo(this.data.error);
        } else {
          this.parser.render(this.data.content);
        }
      },
      errorHandler(data) {
        var presentable = data.error.data.data
        var contract = data.error.data.data.contract;
        var contractState = contract && contract.status
        window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE', {
          response: data.error,
          callback: () => {
            this.$emit('reload', presentable)
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "index.less";
</style>

<style>
  @import "markdown-github-style.css";
  .article-viewer .alpha-markdown-toc {
    top: 30px;
    right: 15px;
    padding-left: 0;

  }
  .article-viewer .alpha-markdown-toc li a {padding-left: 5px; }
</style>
