<template>
  <div>
    <div
      class="chapter-box"
      v-for="(p, index) in cPresentableList"
      :key="'chapter-'+index"
      @click="showContent(index)"
    >
      <div class="img-box" :class="{'noCover': !p.chapterCoverUrl}">
        <img :src="p.chapterCoverUrl || imgPlaceholder" alt="">
      </div>

      <div class="right-box">
        <h3>{{p.presentableName}}</h3>
        <p>{{p.updateDate | fmtDate}}</p>
      </div>
      <auth-box
        :presentableId="p.presentableId"
        :presentableAuthInfoMap="presentableAuthInfoMap"
        @update-p-auth-info="updatePresentableAuthInfoMap"
      ></auth-box>
    </div>
  </div>
</template>

<script>
  import AuthBox from './auth-box.vue'
  export default {
    name: 'comics-list',
    components: { AuthBox },
    props: {
      presentableAuthInfoMap: Object
    },
    data() {
      return {
        cPresentableList: [],
        activeChapterIndex: 0,
        imgPlaceholder: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1552889876485&di=b8c1358fe948f29348bc5af5184613e2&imgtype=0&src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2Fbdaca9a07e1a8947c00c2f826ebf848750927aa24963-cATwbg_fw658'
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
    },
    methods: {
      init() {
        this.getComicsPresentableList()
      },
      getComicsPresentableList() {
        return this.$QI.fetchPresentablesList({ online: 1, tags: 'chapter' })
          .then(res => {
            if(res.errcode === 0) {
              const cPresentableList = res.data.dataList
              if(cPresentableList.length) {
                this.cPresentableList = cPresentableList
                this.sortListByTag()
                const pids = cPresentableList.map(p => p.presentableId)
                this.getComicsPresentablesAuth({ pids })
              }
            }else {
              this.showErrorMsg(res.msg)
            }
          })
          .catch(this.showErrorMsg)
      },
      sortListByTag() {
        this.cPresentableList.sort((p1, p2) => {
          const targTags1 = p1.userDefinedTags.filter(tag => /^\d+$/.test(tag))
          const targTags2 = p2.userDefinedTags.filter(tag => /^\d+$/.test(tag))
          if(targTags1.length && targTags2.length) {
            return +targTags1[0] - (+targTags2[0])
          }else {
            return -1
          }
        })
      },
      getComicsPresentablesAuth({pids}) {
        return this.$QI.fetch('/v1/presentables/auth.json', {
          data: { pids, nodeId: this.nodeId }
        })
          .then(res => res.json())
          .then(res => {
            if(res.errcode === 0) {
              this.updatePresentableAuthInfoMap(res.data)
              this.getChapterCover()
            }
            return Promise.resolve()
          })
      },
      getChapterCover () {
        let pCount = 0, readyPCount = 0
        for(const presentableId in this.presentableAuthInfoMap) {
          const val = this.presentableAuthInfoMap[presentableId]
          if(val.resourceType === 'image') {
            pCount += 1
            FreelogApp.QI.resolveResourceUrl({ presentableId })
              .then(url => {
                val.chapterCoverUrl = url
                readyPCount += 1
                if(readyPCount === pCount) {
                  this.cPresentableList = this.cPresentableList.map(p => {
                    p.chapterCoverUrl = this.presentableAuthInfoMap[p.presentableId].chapterCoverUrl
                    return p
                  })
                }
              })
          }
        }
      },
      showContent(index) {
        this.$emit('show-comics', this.cPresentableList[index])
      },
      updatePresentableAuthInfoMap(data) {
        this.$emit('update-p-auth-info', data)
      },
    },
    mounted() {
      this.init()
    }
  }
</script>

<style lang="less" scoped>
  .chapter-box {
    position: relative; overflow: hidden;
    padding: .2rem .32rem;

    &:hover, &:active{
      background-color: #e8e8e89e;
    }

    .img-box{
      float: left; width: 3rem; height: 2.2rem; box-shadow: 0px 0px 1px rgba(0,0,0,.3);

      img{ display: block; width: 100%; height: 100%; }
      &.noCover{
        box-sizing: border-box;
        padding: 0 .4rem; background-color: #fff;
      }
    }

    .right-box{
      position: relative; box-sizing: border-box;
      height: 2.2rem; margin-left: 3.4rem; padding: .12rem 0;

      h3 { font-weight: 400; font-size: .37333rem; }

      p{
        position: absolute; left: 0; bottom: .12rem;
        font-size: .32rem; color: #666; }
    }

  }
</style>
