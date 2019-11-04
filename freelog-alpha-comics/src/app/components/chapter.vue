<template>
  <div class="chapter-box" @click="showContent(index)">
    <div class="chapter-content-mobile">
      <div class="img-box" :class="{'noCover': chapterCoverUrl === '' }">
        <img :src="chapterCoverUrl || imgPlaceholder" alt="">
      </div>
      <div class="right-box">
        <h3>{{info.chapterName}}</h3>
        <p v-if="chapterPresentable">{{chapterPresentable.updateDate | fmtDate}}</p>
      </div>
    </div>

    <div class="chapter-content">
      {{info.chapterName}}
    </div>
    
    <div class="auth-box" @click.stop="handleAuth" v-if="chapterAuthResult && chapterAuthResult.isAuth === false">
      <div class="lock"></div>
    </div>
  </div>
</template>

<script>
  import { loadPresentableResourceData } from '../data-loader'
  const chapterAuthResultMap = {}
  export default {
    name: 'comics-list',
    components: {  },
    props: {
      info: Object,
      chapterPresentable: Object,
    },
    data() {
      return {
        activeChapterIndex: 0,
        imgPlaceholder: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1552889876485&di=b8c1358fe948f29348bc5af5184613e2&imgtype=0&src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2Fbdaca9a07e1a8947c00c2f826ebf848750927aa24963-cATwbg_fw658',
        subReleasesMap: {},
      }
    },
    computed: {
      chapterCoverUrl() {
        const p = this.chapterPresentable
        return p && p.releaseInfo && p.releaseInfo.previewImages.length ? p.releaseInfo.previewImages[0] : ''
      },
      chapterAuthResult() {
        return this.chapterPresentable != null ? this.chapterPresentable.authResult : null
      },
      subReleases() {
        if(this.chapterAuthResult != null) {
          const subReleasesArr = this.chapterAuthResult['freelog-sub-releases'] || []
          return subReleasesArr.map(subR => {
                  this.subReleasesMap[subR.n] = subR
                  this.subReleasesMap[subR.id] = subR
                  return subR
                })
        }else {
          return null
        }
      }
    },
    watch: {
      
    },
    methods: {
      // 获取
      getChapterAuthInfo(presentableId) {
        var chapterAuthResult = chapterAuthResultMap[presentableId]
        if(chapterAuthResult != null) {
          return Promise.resolve(chapterAuthResult)
        }else {
          return window.FreelogApp.QI.fetchPresentableAuth(presentableId)
        }
        
      },
      // 显示 章节内容
      showContent() {
        const { imagesList, chapterName } = this.info
        const { presentableId } = this.chapterPresentable
        const imagesUrlList = imagesList.map(imgReleaseName => {
          const subRelease = this.subReleasesMap[imgReleaseName]
          var url = ''
          if(subRelease != null) {
            const { id, n, v } = subRelease
            return window.FreelogApp.QI.resolveSubResourceDataUrl({ presentableId, subReleaseId: id, version: v })
          }else {
            return ''
          }

        }).filter(url => url !== '')
        this.$emit('show-chapter-detail', { imagesUrlList, chapterName })
      },
      // 处理授权问题
      handleAuth() {
        const self = this
        try {
          window.FreelogApp.trigger(
            'HANDLE_INVALID_RESPONSE',
            { response: this.chapterAuthResult },
            function(data) {
              this.chapterAuthResult = data
              chapterAuthResultMap[self.chapterPresentable.presentableId] = data
              self.$emit('update-p-auth-info', data)
            }
          )
        }catch(e) {
          console.log('e --', e)
        }
          
      },
    },
  }
</script>

<style lang="less" scoped>
  .chapter-box {
    position: relative; overflow: hidden; cursor: pointer;
    padding: .2rem .32rem;

    &:hover, &:active{
      background-color: #e8e8e89e;
    }

    .chapter-content-mobile {
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

    .chapter-content {
      display: none;
    }

    .auth-box {
      display: flex; justify-content: center;
      position: absolute; top: 0; left: 0; z-index: 10;
      width: 100%; height: 100%;
      background-color: rgba(0, 0, 0, .3); text-align: center; cursor: pointer;

      .lock{
        align-self: center;
        width: 20px; height: 18px;
        background-image: data-uri('../images/icon_sprite@2x.png');
        background-repeat: no-repeat; background-position: -70px -162px; background-size: 180px;
      }
    }
  }

  @media screen and (min-width: 768px){
    .chapter-box {
      display: inline-block;
      width: 260px; margin: 5px 10px; padding: 5px 10px; border: 1px solid #ccc;
      line-height: 32px; font-size: 14px;

      .chapter-content-mobile{ display: none; }
      .chapter-content { display: block; }
    }
    
  }
</style>
