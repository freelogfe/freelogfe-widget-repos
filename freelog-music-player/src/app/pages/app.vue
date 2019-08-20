<template>
  <div id="app">
    <div class="w-head mp-info-cont" v-if="playerIntro">
      <h1 class="music-name" :title="playerIntro.title">{{playerIntro.title}}</h1>
      <div class="music-singer">
        <i class="icon_singer sprite"></i>
        <span>{{playerIntro.singer}}</span>
      </div>
      <ul class="music-info clearfix">
        <li class="music-info-item">流派：{{playerIntro.genre}}</li>
        <li class="music-info-item music-info-item-even">语种：{{playerIntro.lang}}</li>
        <li class="music-info-item">发行时间：{{playerIntro.publishDate}}</li>
        <li class="music-info-item music-info-item-even">发行公司：{{playerIntro.company}}</li>
        <li class="music-info-item">类型：{{playerIntro.type }}</li>
      </ul>
    </div>
    <div class="w-cont">
      <music-list
        :initOneSong="initOneSong"
        :activeSongIndex.sync="activeSongIndex"
        :isPlayingMusic.sync="isPlayingMusic"
        :isCanPlayMusic.sync="isCanPlayMusic"
        :isShowPlayerBar.sync="isShowPlayerBar"
        :songList="songList"
        :songPresentableAuthInfos="songPresentableAuthInfos"
      />
      <music-player-bar
        ref="playBar"
        :activeSongIndex.sync="activeSongIndex"
        :isPlayingMusic.sync="isPlayingMusic"
        :isCanPlayMusic.sync="isCanPlayMusic"
        :isShowPlayerBar.sync="isShowPlayerBar"
        :songList="songList"
        :songPresentableList="songPresentableList"
        :songPresentableAuthInfos="songPresentableAuthInfos"
        :fetchNodeResourceDetail="fetchNodeResourceDetail"
        :initOneSong="initOneSong"
      />
      <music-error-box
        :songPresentableAuthInfos.sync="songPresentableAuthInfos"
        :songPresentableList="songPresentableList"
        :actPresentable="songPresentableList[activeSongIndex]"
        :presentableErrorResp="presentableErrorResp"
        :errorCount="errorCount"
        :songName="songName"
      />
    </div>
  </div>
</template>

<script>
  import musicList from '../components/music-list/music-list.vue'
  import musicPlayerBar from '../components/music-player/music-player-bar.vue'
  import musicErrorBox from '../components/music-error-box/music-error-box.vue'

  export default {
    name: 'app',
    components: {
      musicList,
      musicPlayerBar,
      musicErrorBox
    },
    data (){
      return {
        playerIntro: null,
        activeSongIndex: -1,
        isCanPlayMusic: true,
        isPlayingMusic: false,
        isShowPlayerBar: false,
        songList: [],
				songPresentableList: [],
        songPresentableAuthInfos: [],
        presentableErrorResp: null,
        errorCount: 0,
        songName: ''
      }
    },
    computed : {
      $audio(){
        return this.$refs.playBar.$refs.audio
      },
      targSongSrc (){
        const authInfo = this.songPresentableAuthInfos[this.activeSongIndex]
        if(this.songPresentableList.length  && this.songPresentableList[this.activeSongIndex]){
          const { presentableId, nodeId, resourceId }  = this.songPresentableList[this.activeSongIndex]
          return `${window.FreelogApp.Env.qiOrigin}/v1/auths/presentables/${presentableId}.file`
        }
        return ''
      },
    },
    mounted (){
      this.fethchResourcesList('audio')
      .then(res => {
        if(res.errcode == 0){
          this.songPresentableList = res.data.dataList.slice()

          console.log('songPresentableList --', this.songPresentableList)
          this.songList = this.songPresentableList.map(item => item.resourceInfo.meta)
          this.fetchSongAuthInfo()
        }else {
          window.FreelogApp.trigger('NOTIFY_NODE', { msg: res.msg })
        }
      })

      this.fethchResourcesList('json')
      .then(res => {
        if(res.errcode == 0) {
          this.playerIntro = res.data.dataList.length > 0 ? res.data.dataList[0].resourceInfo.meta : {}
        }else {
          window.FreelogApp.trigger('NOTIFY_NODE', { msg: res.msg })
        }
      })

    },
    methods : {
      fethchResourcesList (type, tags = ''){
        var resourceType = type !== '' ? `&resourceType=${type}`: ''
        tags = tags !== '' ? `&tags=${tags}`: ''
				return window.FreelogApp.QI.fetch(`/v1/presentables?nodeId=${window.__auth_info__.__auth_node_id__}&isOnline=1${resourceType}${tags}&isLoadingResourceInfo=1`)
				.then(resp => resp.json())
			},
			fetchNodeResourceDetail (presentableId){
				return window.FreelogApp.QI.fetch(`/v1/auths/presentables/${presentableId}.info`)
								.then(resp => resp.json())
			},
			fetchSongAuthInfo (){
        var count = 0

				this.songPresentableList.forEach((item, index) => {
					const { presentableId, resourceId } = item
					this.fetchNodeResourceDetail(presentableId, resourceId)
						.then(authInfo => {
						  authInfo.presentableId = this.songPresentableList[index].presentableId
							this.songPresentableAuthInfos[index] = authInfo
              count++
              if(count == this.songPresentableList.length){
                this.songPresentableAuthInfos = this.songPresentableAuthInfos.slice()
                this.setFirstSong ()
              }
						})
				})
      },
      setFirstSong (){
        var pAuthInfos = this.songPresentableAuthInfos
        var targIndex = this.activeSongIndex

        for(let i = 0; i < pAuthInfos.length; i++){
          if(pAuthInfos[i].errcode !== 0){
            continue
          }else{
            targIndex = i
            break
          }
        }
        if(targIndex !== pAuthInfos.length){
          this.activeSongIndex = targIndex
          this.$emit('update:activeSongIndex', targIndex)
        }

      },
      initOneSong (){

        const authInfo = this.songPresentableAuthInfos[this.activeSongIndex]

				if(authInfo.errcode === 0){
				  this.isCanPlayMusic = true
          this.$audio.src = this.targSongSrc
          // if(this.isPlayingMusic){
          //   this.$audio.play()
          // }

				}else{
					this.$audio.src = ''
          this.isCanPlayMusic = false
					const { presentableId, resourceId }  = this.songPresentableList[this.activeSongIndex]
					this.fetchNodeResourceDetail(presentableId, resourceId)
						.then(res => {
							if(res.errcode == 0){
                this.isCanPlayMusic = true
								this.songPresentableAuthInfos.splice(this.activeSongIndex, 1, res)
								this.$audio.src = this.targSongSrc
                // if(this.isPlayingMusic){
                //   this.$audio.play()
                // }
							}else{

							  this.isCanPlayMusic = false
								this.isPlayingMusic = false
								this.presentableErrorResp = authInfo
                this.errorCount = this.errorCount + 1
                this.isShowErrorBox = true

                this.songName = this.songList[this.activeSongIndex].name
							}
						})
            .catch(e => {
              console.log('initOneSong ', e)
            })
				}
      }
    }
  }
</script>

<style lang="less">

</style>
