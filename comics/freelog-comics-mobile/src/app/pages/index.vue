<template>
  <div>
    <comics-header :coverUrl="comicsCoverUrl" :description="comicsDescription"></comics-header>
    <comics-tab :activeTabName.sync="activeTabName">
      <div
        class="comics-description"
        :label="tabLabels[0]"
        v-show="activeTabName === tabLabels[0]"
      >
        <h2>作品简介</h2>
        <p>{{comicsDescription && comicsDescription.introduction}}</p>
        <div><span>作者：</span>{{comicsDescription && comicsDescription.author}}</div>
      </div>
      <div :label="tabLabels[1]" v-show="activeTabName === tabLabels[1]">
        <comics-list
          :presentableAuthInfoMap="presentableAuthInfoMap"
          @show-comics="showComics"
          @update-p-auth-info="updatePresentableAuthInfoMap"
        ></comics-list>
      </div>
    </comics-tab>
    <display-box
      v-if="isShowComics"
      :comicsUrls="activeComicsUrls"
      :comics-name="activeComicsName"
      @hide-comics="hideComics"
    ></display-box>
    <Loading :show="isShowLoading" />
  </div>
</template>

<script>
  import ComicsHeader from '../components/header.vue'
  import ComicsTab from '../components/tab.vue'
  import ComicsList from '../components/list.vue'
  import DisplayBox from '../components/display-box.vue'
  import Loading from '../components/loading.vue'
  export default {
    name: 'home-page',
    components: { ComicsHeader, ComicsTab, ComicsList, DisplayBox, Loading },
    data() {
      const tabLabels = ['详情', '选集']
      return {
        comicsDescription: null,
        comicsCoverUrl: '',
        tabLabels,
        activeTabName: tabLabels[1],
        presentableAuthInfoMap: {},
        activeComicsUrls: [],
        activeComicsName: '',
        isShowComics: false,
        isShowLoading: false
      }
    },
    computed: {
      $QI() {
        return window.FreelogApp.QI
      },
      nodeId() {
        return window.__auth_info__.__auth_node_id__
      },
    },
    methods: {
      init() {
        this.getComicsCover()
      },
      getComicsCover() {
        return window.FreelogApp.QI.fetchPresentablesList({ isOnline: 1, tags: 'cover' })
          .then(res => {
            if(res.errcode === 0) {
              const { dataList = [] } = res.data
              if(dataList.length !== 0) {
                const { resourceInfo: { meta }, presentableId } = dataList[0]
                // this.comicsDescription = meta.description
                this.comicsDescription = meta
                return window.FreelogApp.QI.resolveResourceUrl({ presentableId})
              }else {
                return Promise.reject('未找到漫画封面的节点资源（即未找到标签为cover的节点资源）')
              }
            }else {
              return Promise.reject(res.msg)
            }
          })
          .then(coverUrl => {
            this.comicsCoverUrl = coverUrl
          })
          .catch(e => this.showErrorMsg(e.toString()))
      },
      showComics(p) {
        this.activeComicsName = p.presentableName

        this.getPresentableAuthInfo(p.presentableId)
          .then(authInfo => {
            this.isShowComics = true

            if(authInfo['systemMeta'] && authInfo['systemMeta'].dependencies) {
              const token = authInfo['freelog-sub-resource-auth-token']
              const resourceids = authInfo['systemMeta'].dependencies.sort((v1, v2) => {
                let t1 = v1.resourceName.match(/-(\d+)$/)
                let t2 = v2.resourceName.match(/-(\d+)$/)

                if(t1 === null || t2 === null) {
                  return -1
                }else {
                  return (+t1[1]) - (+t2[1])
                }
              }).map(item => item.resourceId)

              if(token !== '' && resourceids.length) {
                this.activeComicsUrls = resourceids.map(id => {
                  return window.FreelogApp.QI.resolveSubResourceUrl(id, token)
                })
              }
            }

            this.isShowLoading = false
          })
          .catch(e => {
            this.isShowLoading = false
            this.isShowComics = false
            e && this.showErrorMsg(e)
          })
      },
      hideComics() {
        this.isShowComics = false
      },
      getPresentableAuthInfo(presentableId) {
        var authInfo = this.presentableAuthInfoMap[presentableId]
        if(authInfo && typeof authInfo.errcode === 'undefined') {
          return Promise.resolve(authInfo)
        }else {
          return this.getComicsPresentablesAuth({ pids: presentableId })
            .then(() => {
              authInfo = this.presentableAuthInfoMap[presentableId]
              if(authInfo && typeof authInfo.errcode === 'undefined') {
                return Promise.resolve(authInfo)
              }else {
                window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE', { response: authInfo })
                return Promise.reject()
              }
            })
        }
      },
      getComicsPresentablesAuth({pids}) {
        return this.$QI.fetch('/v1/presentables/auth.json', {
          data: { pids, nodeId: this.nodeId }
        })
          .then(res => res.json())
          .then(res => {
            if(res.errcode === 0) {
              this.updatePresentableAuthInfoMap(res.data)
            }
            return Promise.resolve()
          })
      },
      showErrorMsg(msg) {
        window.FreelogApp.trigger('NOTIFY_NODE', { msg })
      },
      updatePresentableAuthInfoMap(data) {
        this.presentableAuthInfoMap = Object.assign({}, this.presentableAuthInfoMap, data)
      },
    },
    mounted() {
      this.init()
    }
  }
</script>

<style lang="less" scoped>
  .comics-description {
    padding: .32rem; font-size: .3733333rem; color: #333;
    h2 {
      font-size: .426667rem; font-weight: 400;
    }
    p{ margin: .32rem 0; text-indent: .64rem; }
    div{ color: #666; }
  }
</style>
