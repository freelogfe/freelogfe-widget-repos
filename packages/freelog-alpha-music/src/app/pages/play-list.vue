<template>
  <div v-if="songsMenuPresentable">
    <div class="play-list-content">
      <play-list-info 
        :songsMenuPresentable="songsMenuPresentable"
        :songsMenuInfo="songsMenuInfo"
        :songPresentable="targetSongPresentable"
        @toggle-play="tapPlayAllSongBtn"
      ></play-list-info>

      <el-table :data="targetSongsList" style="width: 100%" v-if="!isMobile">
        <el-table-column type="index" width="60"></el-table-column> 
        <el-table-column label="歌曲">
          <template slot-scope="scope">
            <div class="pl-c-song-name">
              {{scope.row.songInfo.songName}}
              <img class="pl-c-song-wave" src="../../images/wave.gif" alt="" v-show="targetSongPresentable && targetSongPresentable.presentableId === scope.row.presentableId && scope.row.isPlaying">
              <div class="pl-c-song-play-btn" :class="{ 'paused': !(targetSongPresentable && targetSongPresentable.presentableId === scope.row.presentableId && scope.row.isPlaying) }" @click="tapPlaySongBtn(scope.row)"></div>
              <div class="pl-c-song-lock" v-if="!scope.row.authResult.isAuth">
                <i class="el-icon-lock"></i>
              </div>
            </div>
          </template>
        </el-table-column> 
        <el-table-column prop="songInfo.singer" label="歌手" width="120"></el-table-column> 
        <el-table-column prop="songInfo.album" label="专辑" width="180"></el-table-column>
        <el-table-column prop="songInfo.duration" label="时长" width="80"></el-table-column>
      </el-table>
      <div class="song-list-box" v-else>
        <h2>歌单 共{{targetSongsList.length}}首</h2>
        <div v-for="p in targetSongsList" :key="p.presentableId" style="position: relative;">
          <song-item :songPresentable="p" @play-song="tapPlaySongBtn"></song-item>
          <div class="lock-mask-box" v-if="!p.authResult.isAuth">
            <i class="el-icon-lock"></i>
          </div>
        </div>
      </div>
      <song-player-bar 
        :song-presentable="targetSongPresentable"
        :songsList="targetSongsList"
        @exchange-song="exchangeSong"></song-player-bar>
    </div>
    <div class="play-list-bg" :style="{ backgroundImage: `url(${songsMenuPresentable.songsMenuCoverUrl})`}"></div>
    <div class="play-list-mask"></div>
  </div>
</template>

<script>

  import { loadPresentableInfo, loadPresentablesList, loadPresentableResourceData, batchLoadPresentablesList, MENU_TAGS } from '../data-loader'
  import SongItem from '../components/song-item.vue'
  import SongPlayerBar from '../components/player-bar.vue'
  import PlayListInfo from '../components/play-list-info.vue'

  export default {
    name: 'home-page',
    components: { SongItem, SongPlayerBar, PlayListInfo },
    props: {
      songsPresentablesMap: Object,
      songsMenuListMap: Object,
    },
    data() {
      return {
        songsMenuPresentable: null,
        songsMenuInfo: null,
        targetSongsList: [],
        targetSongPresentable: null,
      }
    },
    computed: {
      isMobile() {
        return window.FreelogApp.Env.isMobile
      },
      songsMenuPresentableId() {
        return this.$route.params.songsMenuId
      },
      songsMenuPresentableName() {
        return decodeURIComponent(this.$route.params.songsMenuName)
      },
      songPresentableId() {
        return this.$route.query.songId
      },
      songPresentableName() {
        return decodeURIComponent(this.$route.query.songName)
      },
      $audio() {
        return this.$parent.$refs['audio']
      }
    },
    watch: {
      songsMenuListMap() {
        const presentable = this.songsMenuListMap[this.songsMenuPresentableId]
        this.resetData(presentable)
      },
      songsMenuPresentable: {
        handler: function (val, oldVal) {
          this.resetData(val)
        },
        deep: true
      },
      async songsMenuInfo() {
        try {
          const { songsList } = this.songsMenuInfo
          const releaseNames = songsList.map(s => s.releaseName)
          const data = await batchLoadPresentablesList({ releaseNames })
          if(data != null) {
            const songInfoMap = {}, tempMap = {}
            songsList.forEach(songInfo => {
              songInfoMap[songInfo.releaseName] = songInfo
            })
            this.targetSongsList = data.dataList.map((p, index) => {
              const { presentableId, releaseInfo: { releaseName }  } = p
              p.songInfo = songInfoMap[releaseName]
              tempMap[releaseName] = p
              p.isPlaying = false
              p.activeSongIndex = index
              return p
            })
          }
          window.FreelogApp.$loading.hide()
        } catch (error) {
          console.error(error)
        }
      },
      targetSongsList() {
        if(this.songPresentableId) {
          const leng = this.targetSongsList.length
          for(let i = 0; i < leng; i++) {
            const tmp = this.targetSongsList[i]
            if(tmp.presentableId === this.songPresentableId) {
              if(tmp.authResult.isAuth) {
                this.targetSongPresentable = tmp
              }else {
                this.$fAuthBox({
                  presentable: tmp,
                  showClose: true,
                  duration: 5000,
                  afterRsolvedAuth(data) {},
                })
              }
            }
          }
        }
      }
    },
    methods: {
      async init() {
        const tmpPID = this.songsMenuPresentableId
        if (this.songsMenuListMap[tmpPID]) {
          this.songsMenuPresentable = this.songsMenuListMap[tmpPID]
        } else {
          const [ info, songsMenuInfo ] = await Promise.all([
            loadPresentableInfo(tmpPID), 
            loadPresentableResourceData(tmpPID)
          ])
          if(info != null) {
            this.songsMenuInfo = info.songsMenuInfo = songsMenuInfo
            this.songsMenuPresentable = info
            
            this.$emit('update:songsMenuListMap', Object.assign(this.songsMenuListMap, {
              [tmpPID]: this.songsMenuPresentable
            }))
          }
        }
      },
      resetData(presentable) {
        if(presentable) {
          this.songsMenuPresentable = presentable
          if(presentable.songsMenuInfo != null && presentable.songsMenuInfo.songsList) {
            this.songsMenuInfo = presentable.songsMenuInfo
          }
        }
      },
      formatSongsList(songsList, songsMap) {
        return songsList.filter(songInfo => {
          return songsMap[songInfo.releaseName] != null
        }).map((songInfo, index) => {
          const presentable = songsMap[songInfo.releaseName]
          presentable.songInfo = songInfo
          presentable.isPlaying = false
          presentable.activeSongIndex = index
          return presentable
        })
      },
      tapPlaySongBtn(presentable) {
        if(!presentable.authResult.isAuth) {
          // 存在授权问题
          this.$fAuthBox({
            presentable,
            showClose: true,
            afterRsolvedAuth(data) {},
          })
        }else {
          const currentSongPresentable = this.targetSongPresentable
          if(currentSongPresentable == null) {
            this.targetSongPresentable = presentable
          }else {
            if(currentSongPresentable.presentableId !== presentable.presentableId) {
              if(currentSongPresentable !== null) {
                currentSongPresentable.isPlaying = false
              }
              this.targetSongPresentable = presentable
            }else {
              if(presentable.isPlaying) {
                this.$audio.pause()
              }else {
                this.$audio.play()
              }
            }
          }
        }
      },
      tapPlayAllSongBtn() {
        const tPresentable = this.targetSongPresentable
        if(tPresentable == null) {
          this.targetSongPresentable = this.targetSongsList[0]
        }else {
          if(tPresentable.isPlaying) {
            this.$audio.pause()
          }else {
            this.$audio.play()
          }
        }
      },
      goToHome() {
        this.$router.push('/')
      },
      exchangeSong({currentSongIndex, step, playMode}) {
        switch(playMode) {
					case 'single-loop': {}
					case 'list': {}
					case 'list-loop': {
						currentSongIndex += step
						if(currentSongIndex < 0) {
							currentSongIndex = 0
						}
						if(currentSongIndex >= this.songsCount) {
							currentSongIndex = this.songsCount - 1
						}
						break
					}
					case 'random': {
            currentSongIndex = Math.floor(Math.random() * this.targetSongsList.length)
						break
					}
					default: {}
        }
        const songPresentable = this.targetSongsList[currentSongIndex]
        if(this.targetSongPresentable.presentableId !== songPresentable.presentableId && songPresentable.authResult.isAuth) {
          this.targetSongPresentable = this.targetSongsList[currentSongIndex]
        } else {
          this.exchangeSong({ currentSongIndex, step, playMode })
        }
      },
    },
    created() {
      this.init()
    },
  }
</script>

<style lang="less" scoped>
  .play-list-content {
    position: relative; z-index: 100;
    width: 990px; margin: auto; padding: 50px 30px;
    background-color: transparent;
    .song-menu-box {
      overflow: hidden;
      padding-bottom: 40px; 
      .el-image {
        float: left;
        width: 250px; height: 250px;
      }
      .song-menu-info {
        position: relative;
        padding-top: 12px; padding-left: 280px;
        p { line-height: 2; font-size: 14px; color: #000; }
        .song-m-i-name {
          font-size: 24px; 
        }
        .song-m-i-author {
          .el-icon-user { margin-right: 5px; font-size: 16px; font-weight: 500; color: #fff; }
        }
        .song-m-i-tags {
          .el-tag { transform: scale(.8); }
        }
        .song-m-i-intro {
          display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 3;
          margin: 15px 50px 10px 0;
        }
        .song-m-i-btns {
          .el-button{ border-radius: 2px; }
          .el-icon-video-play {
            font-size: 14px;
          }
        }
        .song-m-i-back {
          position: absolute; top: 20px; right: 2px;
          padding: 5px 8px; border-radius: 2px;
          background-color: rgba(255, 255, 255, .3); color: #000; cursor: pointer;
        }
      }
    }
    .song-list-box {
      .lock-mask-box {
        display: flex; justify-content: center; align-items: center;
        position: absolute; top: .1rem; right: .2rem; bottom: .1rem; left: .2rem; z-index: 10;
        background-color: rgba(0, 0, 0, .25); color: #ff5073;
      }
    }
      
    .el-table {
      .pl-c-song-name {
        position: relative;
        img.pl-c-song-wave {
          margin-left: 6px; 
        }
        .pl-c-song-play-btn {
          display: none; cursor: pointer;
          position: absolute; top: 0; right: 0;
          width: 36px; height: 36px;
          background-image: url(../../images/icon_list_menu@2x.png); background-repeat: no-repeat; 
          background-size: 500% 700%; background-position: -36px -180px;
          &.paused {
            background-position: -36px 0;
          }
        }
        .pl-c-song-lock {
          display: inline-block;
          font-size: 20px; color: #ff5073;
          // width: 20px; height: 20px;
          // background-image: url(../../images/icon_sprite@2x.png); background-repeat: no-repeat; 
          // background-size: 200px 340px; background-position: -80px -200px;
          transform: translateY(3px) scale(.8);
        }
      }
      .el-table__body {
        .el-table__row {
          &:hover {
            .pl-c-song-play-btn { display: block; }
          }
        }
      }
      
    }
  }
  .play-list-bg, .play-list-mask {
    position: absolute; top: 0; left: 0; z-index: 10;
    width: 100%; height: 100%;
    pointer-events: none;
  }
  .play-list-bg {
    background-repeat: no-repeat; background-size: cover; background-position: 50%;
    -webkit-filter: blur(65px); filter: blur(65px); opacity: .6; 
    -webkit-transform: translateZ(0);transform: translateZ(0);
  }
  .play-list-mask {
    background-color: rgba(0,0,0,.25);
    z-index: 2;
  }
</style>

<style lang="less">
  .play-list-content {
    .el-table__header  {
      thead {
        th {
          font-weight: 500; color: #000;
        }
      }
    }
    .el-table {
      background-color: transparent;
      &:before { height: 0; }
      tr, th { background-color: transparent; }
      
      td {
        position: relative;
        border-width: 0; font-weight: 400; 
      }
      
      .el-table__row {
        // .el-table_1_column_1 { color: #d8d8d8; }
        .cell {
            line-height: 36px;
          }
        td { padding: 8px 0; color: #000; }
      }
    }
  }

  @media screen and (max-width: 768px){
    .freelog-music-app {
      .play-list-content {
        width: 100%; padding: 1.334rem 0;
        .song-list-box {
          h2 { 
            padding: .2rem .4rem;
            font-size: .36rem; color: #e8e8e8; font-weight: 500;
          }
          .song-item { margin: 0 .2rem; }
        }
      }
    }
    
  }
</style>


