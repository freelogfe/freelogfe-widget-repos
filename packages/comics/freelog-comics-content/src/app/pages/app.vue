<template>
  <div class="comics-content" >
    <ul class="list" >
      <li
        class="list-item"
        v-for="(item, index) in cPresentableList"
        :key="'item-'+index"
      >
        <a href="javascript:;" @click="showComicsDisplayBox(index)" :title="item.presentableName">{{item.presentableName}}</a>
      </li>
    </ul>
    <div class="comics-display-box" v-if="isShowComics">
      <div class="comics-db-header">{{activePresentableName}}</div>
      <div class="comics-db-close" @click="closeComicsDisplayBox">&times;</div>
      <div id="comics-content">
        <img
          v-for="(url, index) in activeComicsUrls"
          :key="'img-' + index"
          :src="url" alt=""
        >
      </div>
      <div class="comics-db-footer">
        <div class="comics-toolbar" v-if="cPresentableList.length !== 1">
          <div
            id="comics-prev-btn"
            class="comics-toolbar-item"
            v-if="activeChapterIndex !== 0"
            @click="showPrevComics"
          >上一话</div>
          <div
            id="comics-next-btn"
            class="comics-toolbar-item"
            v-if="(cPresentableList.length - 1) !== activeChapterIndex"
            @click="showNextComics"
          >下一话</div>
          <!-- <div class="comics-toolbar-item">目 录</div> -->
        </div>
      </div>
      <div class="comics-backtotop">
        TOP
      </div>
    </div>
    <Loading :show="isShowLoading" />
  </div>
</template>

<script>
  import Loading from '../components/loading.vue'
  export default {
    name: 'app',
    components: {
      Loading
    },
    data() {
      return {
        activeChapterIndex: 0,
        isShowLoading: false,
        cPresentableList: [],
        presentableAuthInfoMap: {},
        activeComicsUrls: [],
        isShowComics: false,
      }
    },
    computed: {
      $QI() {
        return window.FreelogApp.QI
      },
      nodeId() {
        return window.__auth_info__.__auth_node_id__
      },
      activePresentableName() {
        return this.cPresentableList[this.activeChapterIndex].presentableName
      },
      isShowNextBtn() {
        return (this.activeComicsUrls.length - 1) !== this.activeChapterIndex
      },
    },
    methods: {
      getComicsPresentableList() {
        return this.$QI.fetchPresentablesList({ online: 1, resourceType: 'json', tags: 'chapter' })
          .then(res => {
            if(res.errcode === 0) {
              const cPresentableList = res.data.dataList
              if(cPresentableList.length) {
                this.cPresentableList = cPresentableList
                const pids = cPresentableList.map(p => p.presentableId)
                this.getComicsPresentablesAuth({ pids })
              }
            }else {
              this.showErrorMsg(res.msg)
            }
          })
          .catch(this.showErrorMsg)
      },
      getComicsPresentablesAuth({pids}) {
        return this.$QI.fetch('/v1/presentables/auth.json', {
          data: { pids, nodeId: this.nodeId }
        })
          .then(res => res.json())
          .then(res => {
            if(res.errcode === 0) {
              this.presentableAuthInfoMap = Object.assign(this.presentableAuthInfoMap, res.data)
            }
            return Promise.resolve()
          })
      },
      showErrorMsg(msg) {
        window.FreelogApp.trigger('NOTIFY_NODE', { msg })
      },
      showComicsDisplayBox(index) {
        var lastActiveChapterIndex = this.activeChapterIndex
        this.activeChapterIndex = index

        const { presentableId } = this.cPresentableList[index]
        this.isShowLoading = true

        this.getPresentableAuthInfo(presentableId)
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
            this.activeChapterIndex = lastActiveChapterIndex
            this.showErrorMsg(e)
          })

      },
      closeComicsDisplayBox() {
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
                return Promise.reject()
              }
            })
        }
      },
      showPrevComics(){
        var index = this.activeChapterIndex
        index -= 1
        index = index < 0 ? 0 : index
        this.showComicsDisplayBox(index)
      },
      showNextComics(){
        var index = this.activeChapterIndex
        index += 1
        index = index >= this.activeComicsUrls.length ? this.activeComicsUrls.length - 1 : index
        this.showComicsDisplayBox(index)
      },
    },
    created() {
      this.getComicsPresentableList()
    },
    mounted() {},
  }
</script>

<style lang="less" scoped>
  .comics-content {
    box-sizing: border-box; overflow: hidden;
    width: 1200px; margin: 0 auto; padding: 0 30px;
    background-color: #fff;
  }

  .list {
    overflow: hidden; min-height: 365px; padding: 20px 0;
  }

  .list-item {
    box-sizing: border-box;
    float: left; width: 275px;
    position: relative; margin: 5px 5px 10px 5px; padding-left: 10px;
    font-size: 14px; line-height: 36px; background: #f6f6f6;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;

    &:hover {
      background-color: #ffeef1;
    }

    a {
      display: block; color: #252525;
      &:hover {
        color: #e90930; font-size: 14px;
      }
    }
  }

  .comics-display-box{
    overflow: scroll;
    position: fixed; top: 0; left: 0; bottom: 0; right: 0; z-index: 10;
    background-color: rgba(0,0,0,.6);
  }

  .comics-db-header{
    padding: 20px 0;
    font-size: 28px; text-align: center; color: #fff;
  }

  .comics-db-close {
    position: fixed; top: 30px; right: 50px; z-index: 10;
    width: 32px; height: 32px; line-height: 30px; border-radius: 50%;
    background-color: #fff; cursor: pointer; text-align: center;
  }

  #comics-content{
    overflow: hidden;
    width: 900px; margin: 0 auto 20px; border-radius: 6px;
    background-color: #fff;
  }

  .comics-db-footer{
    width: 100%;
    background-color: rgba(255, 255, 255, .6)
  }

  .comics-toolbar{
    width: 900px; margin: 0 auto;
    background-color: #fff; text-align: center;
  }

  .comics-toolbar-item{
    display: inline-block;
    width: 100px; height: 50px; padding: 0 80px;
    line-height: 50px; cursor: pointer;
    &:hover { background-color: #F8F8F8; }
  }

  .comics-toolbar-item.hidden{
    display: none;
  }

  .comics-backtotop{
    position: fixed; bottom: 70px; left: 50%; transform: translateX(480px);
    width: 48px; height: 48px; border-radius: 50%;
    background-color: #fff; line-height: 48px; text-align: center;
    font-size: 16px; cursor: pointer; opacity: 0; pointer-events: none;
    transition: all .3s ease-out;
  }

  .comics-backtotop.showed{
    opacity: 1; pointer-events: auto;
  }
</style>
