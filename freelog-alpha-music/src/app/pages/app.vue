<template>
  <div class="freelog-music-app">
    <router-view 
      :songsMenuList="songsMenuList" 
      :newSongsList="newSongsList"
      :songsMenuListMap="songsMenuListMap"
      :songsPresentablesMap="songsPresentablesMap"
      :newSongsMenuPresentable="newSongsMenuPresentable"></router-view>
    <audio ref="audio" v-show="false" controls="controls" autoplay></audio>    
  </div>
</template>

<script>
  import { loadPresentablesList, loadPresentableResourceData, MENU_TAGS } from '../data-loader'
  export default {
    name: 'app',
    data() {
      return {
        songsMenuList: [],
        newSongsList: [],
        newSongsMenuPresentable: null,
        songsMenuListMap: null,
        songsPresentablesMap: {},
      }
    },
    computed: {
      $audio() {
        return this.$refs['audio']
      }
    },
    methods: {
      init() {
        this.fetchSongsMenuPresentablesList()
        this.fetchNewSongsMenuPresentablesList()
      },
      bindEvent() {
        
      },
      // 歌单集合
      fetchSongsMenuPresentablesList() {
        return loadPresentablesList({ tags: MENU_TAGS[0], pageSize: 50 })
          .then(data => {
            if(data != null) {
              this.songsMenuListMap = Object.assign({}, this.songsMenuListMap)
              this.songsMenuList = data.dataList.map(p => {
                p.songsMenuCoverUrl = p.releaseInfo.previewImages[0] ? p.releaseInfo.previewImages[0] : 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/console/public/img/resource.jpg'
                p.songsMenuInfo = {}
                this.songsMenuListMap[p.presentableId] = p
                
                loadPresentableResourceData(p.presentableId)
                  .then((data => {
                    p.songsMenuInfo = data
                  }))
                return p
              })
            }
          })
      },
      // 新歌集合
      fetchNewSongsMenuPresentablesList() {
        const tag = MENU_TAGS[1]
        return loadPresentablesList({ tags: MENU_TAGS[1], pageSize: 50 })
          .then(data => {
            if(data != null) {
              var newSongsMenuPresentable

              this.songsPresentablesMap = {
                [tag]: {}
              }
              data.dataList.forEach(p => {
                const { presentableId, releaseInfo: { previewImages, resourceType, releaseName } } = p
                const coverUrl = previewImages[0] ? previewImages[0] : 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/console/public/img/resource.jpg'
                if(resourceType === 'json') {
                  p.songsMenuCoverUrl = coverUrl
                  newSongsMenuPresentable = p
                  p.songsMenuInfo = {}
                  this.songsMenuListMap = Object.assign({}, this.songsMenuListMap, {
                    [presentableId]: p
                  })
                }else if(resourceType === 'audio'){
                  p.songCoverUrl = coverUrl
                  p.songInfo = {}
                  this.songsPresentablesMap[tag][releaseName] = p 
                }
              })
              this.fetchNewSongsMenuSourceData(newSongsMenuPresentable)
            }
          })
      },
      fetchNewSongsMenuSourceData(newSongsMenuPresentable) {
        if(newSongsMenuPresentable != null) {
          loadPresentableResourceData(newSongsMenuPresentable.presentableId)
            .then((data => {
              if(data != null) {
                const tag = MENU_TAGS[1]
                newSongsMenuPresentable.songsMenuInfo = data
                this.newSongsMenuPresentable = newSongsMenuPresentable

                this.newSongsList = data.songsList.filter(songInfo => {
                  return this.songsPresentablesMap[tag][songInfo.releaseName] != null
                }).map(songInfo => {
                  const presentable = this.songsPresentablesMap[tag][songInfo.releaseName]
                  presentable.songInfo = songInfo
                  presentable.isPlaying = false
                  return presentable
                })
              }
            }))
            .catch(e => {
              console.log(e)
            })
        }
      }
    },
    created() {
      this.init()
    },
    mounted() {
      this.bindEvent()
    },
  }
</script>

<style lang="less">
.freelog-music-app {
  .song-content {
    width: 990px; margin: auto;
  }
  .song-img-box {
    position: relative; cursor: pointer; overflow: hidden; z-index: 10;
    
    &:hover {
      .el-image { transform: scale(1.1) translateZ(0); }
      .el-icon-video-play { transform: scale(2) translateZ(0); opacity: 1; }
    }
    .el-image { 
      transition: transform .75s; 
      // width: 100%; 
      .el-image__inner { display: block;} 
    }
    
    .el-icon-video-play {
      transition: all .75s; opacity: 0;
      position: absolute; top: 50%; left: 50%; z-index: 10;
    }
  }
  .song-info {
    .song-i-name, .song-i-singer, .song-i-author {
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-size: 14px; line-height: 22px; 
    }
    .song-i-name {
      color: #000; cursor: pointer;
      &:hover { color: #31c27c; }
    }
    .song-i-singer {
      color: #999; 
    }
  }
}

</style>
