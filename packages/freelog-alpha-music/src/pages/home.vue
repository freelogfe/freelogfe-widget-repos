<template>
  <div class="home">
    <div class="song-header">
      <div class="content">
        <div class="play-song-float-box" v-if="activeSongPresentableId !== ''">
          <div class="play-song-btn" @click="tapFloatSongBtn">
            <el-progress 
              type="circle" 
              :width="36"
              :stroke-width="2"
              :percentage="activeSongPercentage" 
              :show-text="false"></el-progress>
            <img :class="{ 'paused': !isPlayingSong  }" src="http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/console/public/img/resource.jpg" style="object-fit: fill;">
            <div class="p-s-play-icon" v-if="isPlayingSong">
              <span></span><span></span>
            </div>
            <i class="el-icon-caret-right" v-else></i>
          </div>
        </div>
      </div>
    </div>
    <div class="song-content">
      <div class="song-list-wrapper" v-if="songsMenuList.length">
        <h2>- 全部歌单 -</h2>
        <el-carousel arrow="never" height="304px" :interval="carouselDuration" :indicator-position="songsMenuCarouselArray.length === 1 ? 'none' : 'outside'" v-if="!isMobile">
          <el-carousel-item v-for="(songsMenuList, index) in songsMenuCarouselArray" :key="index">
            <div class="song-list-box">
              <songs-list-item 
                class="song-list-item"
                v-for="p in songsMenuList" 
                :key="p.presentableId" 
                :presentable="p" 
                @show-play-list="tapSongListItem">
              </songs-list-item>
              <div class="song-list-item"></div>
              <div class="song-list-item"></div>
              <div class="song-list-item"></div>
            </div>
          </el-carousel-item>
        </el-carousel>
        <songs-list-item 
          class="song-list-item"
          v-else
          v-for="p in songsMenuList" 
          :key="p.presentableId" 
          :presentable="p" 
          @show-play-list="tapSongListItem">
        </songs-list-item>
      </div>
      <div class="new-song-wrapper" v-if="newSongsList.length">
        <h2>- 新歌 -</h2>
        <el-carousel arrow="never" height="242px" :interval="carouselDuration" :indicator-position="newSongsCarouselArray.length === 1 ? 'none' : 'outside'" v-if="!isMobile">
          <el-carousel-item v-for="(songsList, index) in newSongsCarouselArray" :key="index">
            <div class="new-song">
              <new-song-item 
                class="song-item"
                v-for="songPresentable in songsList" 
                :key="songPresentable.releaseName" 
                :songPresentable="songPresentable" 
                @play-song="tapNewSongItem">
              </new-song-item>
              <div class="song-item"></div>
              <div class="song-item"></div>
            </div>  
          </el-carousel-item>
        </el-carousel>
        <new-song-item 
          v-else
          class="song-item"
          v-for="songPresentable in newSongsList" 
          :key="songPresentable.releaseName" 
          :songPresentable="songPresentable" 
          @play-song="tapNewSongItem">
        </new-song-item>
      </div>
    </div>
  </div>
</template>

<script>
  import { loadPresentablesList, loadPresentableResourceData, batchLoadPresentablesList, MENU_TAGS } from '../data-loader'
  import NewSongItem from '../components/song-item.vue'
  import SongsListItem from '../components/songs-list-item.vue'

  export default {
    name: 'home-page',
    components: { NewSongItem, SongsListItem },
    props: {
      songsPresentablesMap: Object,
      songsMenuListMap: Object,
    },
    data() {
      return {
        isPlayingSong: false,
        activeSongPresentableId: '',
        activeSongPercentage: 0,
        carouselDuration: 5000,
        songsMenuList: [],
        newSongsList: [],
        newSongsMenuPresentable: null,
      }
    },
    computed: {
      isMobile() {
        return window.FreelogApp.Env.isMobile
      },
      $audio() {
        return this.$parent.$refs['audio']
      },
      songsMenuCarouselArray() {
        return this.getCarouseArray(this.songsMenuList)
      },
      newSongsCarouselArray() {
        return this.getCarouseArray(this.newSongsList)
      }
    },
    watch: {
      songsMenuList() {
        window.FreelogApp.$loading.hide()
      },
      async newSongsMenuPresentable() {
        const newSongsMenuPresentable = this.newSongsMenuPresentable
        try {
          const data = await loadPresentableResourceData(newSongsMenuPresentable.presentableId)
          if(data != null) {
            newSongsMenuPresentable.songsMenuInfo = data
            await this.fetchNewSongsMenuPresentablesList(newSongsMenuPresentable)
          }
        } catch (e) {
          console.error(e)
        }
      }
    },
    methods: {
      init() {
        this.fetchSongsMenuPresentablesList()
      },
      // 歌单集合
      async fetchSongsMenuPresentablesList() {
        window.FreelogApp.$loading.show()
        try {
          const data = await loadPresentablesList({ tags: MENU_TAGS.join(','), resourceType: 'json', pageSize: 50 })
          window.FreelogApp.$loading.hide()
          if(data != null) {
            data.dataList.forEach(async (p) => {
              p.songsMenuInfo = await loadPresentableResourceData(p.presentableId)
              if (p.userDefinedTags.indexOf(MENU_TAGS[0]) > -1) {
                this.songsMenuList.push(p)
              }
              if (p.userDefinedTags.indexOf(MENU_TAGS[1]) > -1) {
                this.newSongsMenuPresentable = p
                this.$emit('update:songsMenuListMap', Object.assign(this.songsMenuListMap, {
                  [p.presentableId]: p
                }))
              }
            })
          }
        } catch(e) {
          console.error(e)
        }
      },
      // 新歌集合
      async fetchNewSongsMenuPresentablesList(newSongsMenuPresentable) {
        try {
          const newSongsInfoList = newSongsMenuPresentable.songsMenuInfo.songsList
          const releaseNames = newSongsInfoList.map(item => item.releaseName)
          const data = await batchLoadPresentablesList({ releaseNames })
          if(data != null) {
            const songInfoMap = {}, tempMap = {}
            newSongsInfoList.forEach(songInfo => {
              songInfoMap[songInfo.releaseName] = songInfo
            })
            this.newSongsList = data.dataList.map(p => {
              const { presentableId, releaseInfo: { releaseName }  } = p
              p.songInfo = songInfoMap[releaseName]
              tempMap[releaseName] = p
              return p
            })
            this.$emit('update:songsPresentablesMap', Object.assign(this.songsPresentablesMap, {
              [newSongsMenuPresentable.presentableId]: tempMap
            }))

          }
        } catch(e) {
          console.error(e)
        }
      },
      getCarouseArray(list) {
        const leng = list.length
        const count = Math.ceil(leng / 4)
        const arr = []
        for(let i = 0; i < count; i++) {
          const start = i * 4
          const end = (i * 4 + 4) < leng ? (i * 4 + 4) : leng
          const tmpArr = list.slice(start, end)
          arr.push(tmpArr)
        }
        return arr
      },
      tapSongListItem(presentable) {
        var { presentableId, presentableName } = presentable
        presentableName = encodeURIComponent(presentableName)
        this.$router.push(`/play-list/${presentableId}/${presentableName}`)
      },
      tapNewSongItem(presentable) {
        var { presentableId: songsMenuPresentableId, presentableName: songsMenuPresentableName } = this.newSongsMenuPresentable
        var { presentableId: songPresentableId, } = presentable
        var songName = presentable.songInfo.songName
        songsMenuPresentableName = encodeURIComponent(songsMenuPresentableName)
        songName = encodeURIComponent(songName)
        this.$router.push({ 
          path: `/play-list/${songsMenuPresentableId}/${songsMenuPresentableName}`, 
          query: {
            songId: songPresentableId,
            songName
          } 
        })
      },
      tapFloatSongBtn() {
        this.isPlayingSong = !this.isPlayingSong
        if(this.isPlayingSong) {
          this.$audio.play()
        }else {
          this.$audio.pause()
        }
      },
      timeupdateHandler(e) {
        const $audio = e.target
        this.activeSongPercentage = Math.floor($audio.currentTime / $audio.duration * 100)
        this.isPlayingSong = !$audio.paused
      },
      endedHandler(e) {
        const $audio = e.target
        this.isPlayingSong = !$audio.paused
      }
    },
    created() {
      this.init()
    },
    mounted() {
      if(this.$audio) {
        this.activeSongPresentableId = this.$audio.getAttribute('data-presentableId') || ''
        this.$audio.addEventListener('timeupdate', this.timeupdateHandler)
        this.$audio.addEventListener('ended', this.endedHandler)
      }
    },
    destroyed() {
      if(this.$audio) {
        this.$audio.removeEventListener('timeupdate', this.timeupdateHandler)
        this.$audio.removeEventListener('ended', this.endedHandler)
      }
    },
  }
</script>

<style lang="less" scoped>
  @keyframes turnAround {
    100% {
      -webkit-transform: rotate(1turn);
      transform: rotate(1turn);
    }
  }
  .song-header {
    position: fixed; top: 0; left: 0; z-index: 1000;
    width: 100%;
    .content {
      position: relative;
      width: 990px; margin: auto;
      .play-song-float-box {
        position: absolute; top: 0; right: 0; z-index: 100;
        width: 52px; height: 57px; border: 1px solid #dcdcdc; border-top-width: 0; border-bottom-left-radius: 50%; border-bottom-right-radius: 50%;
        background-color: #fcfcfc; text-align: center;
        .play-song-btn {
          display: inline-block; position: relative;
          margin-top: 16px;
          .el-progress { display: block; }
          img { 
            position: absolute; top: 3px; left: 3px;
            width: 30px; height: 30px; border-radius: 50%;
            animation: turnAround 4s linear infinite;
            &.paused {
              animation-play-state: paused;
            }
          }
          .p-s-play-icon {
            position: absolute; top: 50%; left: 50%; z-index: 10;
            transform: translate(-50%, -50%);
            text-align: center;
            span { 
              display: inline-block;  
              width: 2px; height: 14px; margin: 0 2px;
              background-color: #fff;
            }
          }
          .el-icon-caret-right {
            position: absolute; top: 50%; left: 50%; z-index: 10;
            transform: translate(-50%, -50%);
            font-size: 24px; color: #fff;
          }
        }
      }
    }
  }
  .song-content {
    h2 {
      padding: 30px 0 20px;
      font-size: 20px; color: #555; text-align: center;
    }

    .song-list-box, .new-song {
      display: flex; flex-flow: wrap; justify-content: center; align-items: center;
    }
  }

  .song-list-box, .new-song {
    display: flex; flex-flow: wrap; justify-content: center; align-items: center;
  }
  .song-list-box {
    @itemWidth: 220px; @itemHeight: 220px;
    .song-list-item {
      box-sizing: border-box; 
      width: @itemWidth; margin: 10px;
    }
  }
  .new-song {
    margin-top: 12px;
    .song-item {
      width: 460px; margin: 10px; 
    }
  }
</style>

<style lang="less">
  body { position: relative; }
  .el-carousel {
    .el-carousel__arrow {
      height: 80px; border-radius: 0;
      font-size: 40px;
    }
    .el-carousel__indicator {
      .el-carousel__button {
        width: 36px; height: 3px;
        opacity: .8;
      }
      &.is-active {
        .el-carousel__button { background-color: #409EFF; }
      }
    }
  }

  @media screen and (max-width: 768px){
    .freelog-music-app {
      .home {
        .song-content {
          width: 100%;
          .new-song-wrapper, .song-list-wrapper {
            overflow: hidden; 
            h2 { padding: .2rem; font-size: .4rem; }
          }
          .song-list-item {
            float: left;
            width: 4.8rem; margin: .1rem; 
            .song-img-box {
              display: block; width: 4.8rem; height: 4.8rem;
              box-shadow: 0px 0px 2px rgba(0, 0, 0, .3);
            }
            .song-info {
              padding: .26667rem 0;
              .song-i-name, .song-i-author {
                font-size: .32px;
              }
              .song-i-tag { height: .534rem; transform: scale(0.8); }
            }
          }
          .song-item {
            .song-info { 
              .song-i-duration { font-size: .32rem; color: #000; }
            }
          }
        }
      }
    }
  }
</style>
