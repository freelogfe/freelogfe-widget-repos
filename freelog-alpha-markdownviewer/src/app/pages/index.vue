<template>
  <div class="freelog-alpha-markdownviewer-index">
    <div class="wrapper js-wrapper md-error-wrap">
      <div class="md-titles">
        <ul class="js-md-titles">
          <li class="md-title"
              @click="setCurrentPresentable(presentable)"
              :class="{selected: current.presentableId === presentable.presentableId}"
              v-for="(presentable, index) in presentables"
              :key="index">
            {{presentable.mdTitle}}
          </li>
        </ul>
      </div>
      <div class="md-viewer-wrap article-item">
        <div class="js-md-title">
          <div class="article-title" v-if="current.presentableId">
            <time :datetime="current.date">{{current.date}}</time>
            <h2>{{current.mdTitle}}</h2>
          </div>
        </div>
        <div class="md-content-viewer article-content">
          <template v-if="presentables.length === 0">
            没有找到文章...
          </template>
          <template v-else-if="current.errorInfo">
            <span class="error-tip">{{current.errorInfo.desc}}</span>
            <button class="action-btn" @click="errorHandler(current)">{{current.errorInfo.tip}}</button>
          </template>
          <div ref="viewer" v-show="current.presentableId && !current.errorInfo">
            <img src="//visuals.oss-cn-shenzhen.aliyuncs.com/loading.gif" class="loading-img" alt="">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MarkdownParser from '@freelog/freelog-markdown-parser'

function createLoader(loader) {
  var handler
  var loading = false
  var done = false
  return function (fn) {
    handler = fn
    if (done) {
      handler()
    } else if (!loading) {
      loading = true
      loader(function (v) {
        done = true
        if (handler) {
          handler()
        }
      })
    }
  }
}

export default {
  name: 'home-page',

  data() {
    return {
      presentables: [],
      presentablesMap: {},
      presentableSubReleases: {},
      activePresentableName: '',
      current: {}
    }
  },

  mounted() {
    const { presentableName } = this.$route.params
    this.activePresentableName = presentableName
    console.log('mounted ---')
    this.init()
  },

  methods: {
    init() {
      this.loadPresentables()
        .then(list => {
          if (list && list.length) {
            list.forEach(presentable => {
              presentable.date = (new Date(presentable.createDate)).toLocaleDateString()
              this.presentablesMap[presentable.presentableId] = presentable
            })
            var activePresentable = this.presentables[0]
            this.presentables = list.map(p => {
              const arr = p.presentableName.split('/')
              p.mdTitle = arr[1] || arr[0]
              if(p.mdTitle === this.activePresentableName) {
                activePresentable = p
              }
              return p
            })
            this.setCurrentPresentable(activePresentable)
          }
        })
        .catch(function (err) {
          console.warn(err)
        })
    },
    setCurrentPresentable(presentable) {
      this.current = presentable
      this.activePresentableName = presentable.mdTitle
      this.$router.push(`/${this.activePresentableName}`)

      if (!presentable._cachedResponse) {
        this.loadPresentable(presentable.presentableId)
          .then(data => {
            this.renderPresentable(presentable, data)
          })
      } else if (!presentable.errorInfo) {
        this.renderMarkdown(presentable)
      }
    },
    loadPresentables() {
      return window.FreelogApp.QI.fetch(`/v1/presentables?nodeId=${window.__auth_info__.__auth_node_id__}&resourceType=markdown&pageSize=100&isLoadingResourceInfo=1`).then(function (res) {
        return res.json()
      }).then(function (res) {
        return (res.data && res.data.dataList) || []
      })
    },
    loadPresentable(presentableId) {
      return window.FreelogApp.QI.fetchPresentableResourceData(presentableId).then((res) => {
        var isError = !res.headers.get('freelog-resource-type')
        var subReleasesText = res.headers.get('freelog-sub-releases')
        try {
          const subReleases = subReleasesText == null ? [] : JSON.parse(atob(subReleasesText))
          this.presentableSubReleases[presentableId] = subReleases
        }catch(e) {
          console.error(e)
        }
          
        return isError ? res.json() : res.text()
      })
    },
    renderPresentable(presentable, data) {
      this.$set(presentable, '_cachedResponse', data)
      if (typeof data === 'string') {
        if (presentable.errorInfo) {
          this.$set(presentable, 'errorInfo', '')
        }
        this.renderMarkdown(presentable)
      } else {
        this.$set(presentable, 'errorInfo', this.resolveErrorInfo(presentable._cachedResponse))
      }
    },
    renderMarkdown(presentable) {
      this.$refs.viewer.innerHTML = ''
      const { errorInfo, _cachedResponse, presentableId } = presentable
      if (errorInfo) return

      var markdownParser = new MarkdownParser({
        container: this.$refs.viewer,
        presentableId,
        subReleases: this.presentableSubReleases[presentableId],
        renderImageError($el, data) {
          if ($el) {
            $el.src = ''
            //todo
            if (typeof data === 'string') {
              $el.src = ''
            } else {

            }
          }
          console.log('renderImageError', arguments)
        }
      })
      markdownParser.render(_cachedResponse)
    },
    resolveErrorInfo(resp) {
      var App = window.FreelogApp
      var errInfo = App.getErrorInfo(resp)
      return errInfo
    },

    errorHandler(presentable) {
      var self = this
      window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE', {
        response: presentable._cachedResponse,
        callback: function () {
          self.loadPresentable(presentable.presentableId).then(data => {
            this.renderPresentable(presentable, data)
          })
        }
      })
    },
    changeMarkdownView() {

    },
  }
}
</script>


<style lang="less" scoped>
  .freelog-alpha-markdownviewer-index {
    .wrapper {
      padding: 10px 0 15px 0;
      background: white;
      min-height: 100vh;
    }

    .md-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      line-height: 1.5;
      transition: all .2s;
      margin: 4px 0 8px 0;
      padding: 10px 10px 10px 28px;
      font-size: 14px;
      &.selected {
        border-right: 3px solid #1890ff;
        font-weight: 600;
        color: #1890ff;
        background-color: #e6f7ff;
        span {
          color: #007bff;
        }
      }
    }

    .md-title:hover {
      color: #1890ff;
    }

    .md-titles {
      width: 300px;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      overflow: auto;
      background: #fafafa;
      z-index: 1;
      padding: 10px 0;
      border-right: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 2px;
    }

    .md-viewer-wrap {
      background: #fff;
      margin-left: 320px;
      margin-right: 285px;
      overflow: auto;
    }

    .md-error-wrap {
      // margin-right: 30px;
    }

    .article-title {
      margin-bottom: 10px;
      padding: 9px 12px;
      border-bottom: 1px solid #e2edf9;

      h2 { font-size: 30px; }
    }

    .article-title time {
      font-size: 16px;
      color: #aaa;
      float: right;
      height: 58px;
      line-height: 58px;
      padding-right: 40px;
    }

    .article-item {
      border: 1px solid #ddd;
      border-radius: 3px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    }

    .article-content {
      padding: 12px;
      overflow: auto;
    }

    .error-tip {
      color: #E6A23C;
    }

    .action-btn {
      display: inline-block;
      line-height: 1;
      white-space: nowrap;
      border: 1px solid #b3d8ff;
      text-align: center;
      box-sizing: border-box;
      outline: none;
      padding: 6px 9px;
      font-size: 14px;
      border-radius: 4px;
      color: #409eff;
      background: #ecf5ff;
      cursor: pointer;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }

    .fadeIn {
      -webkit-animation-name: fadeIn;
      animation-name: fadeIn;
      -webkit-animation-duration: 1s;
      animation-duration: 1s;
      -webkit-animation-fill-mode: both;
      animation-fill-mode: both;
    }
  }
</style>
