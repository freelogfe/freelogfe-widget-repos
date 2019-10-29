<template>
	<div :class="['music-player-bar', 'clearfix', { 'showed': isShowPlayerBar }]">
		<div class="music-player-b-cont clearfix">
			<div class="mpb-left">
				<a 
					:class="{'mpb-btn-prev': true, 'disabled': activeSongIndex == 0}" 
					href="javascript:;"
					@click="playPrevSong"
				><span></span></a>
				<a :class="{'mpb-btn-play': true, 'paused': isPlayingMusic, 'disabled': songPresentableAuthInfos[activeSongIndex] && songPresentableAuthInfos[activeSongIndex].errcode != 0}" href="javascript:;" @click="togglePlayBtn">
					<span></span>
				</a>
				<a 	:class="{'mpb-btn-next': true, 'disabled': activeSongIndex == (songList.length - 1)}" 
					href="javascript:;"
					@click="playNextSong"
				><span></span></a>
			</div>
			<div class="mpb-center">
				<div class="progress" ref="progressbox" @click="exchangeProgress">
					<div class="progress-bar progress-bar-success" role="progressbar" aria-valuemin="0" aria-valuemax="100"  :style="{width: progressPercent}"></div>
				</div>
				<div class="mpb-title">
					<span class="mpb-music-name">{{targSongName}}</span>
					-
					<span class="mpb-singer-name">{{targSongSinger}}</span>
				</div>
				<div class="mpb-remaintime" >
					<div class="mpb-play-time">{{songPlayedTime}}</div>
					/
					<div class="mpb-total-time">{{songTotalTime}}</div>
				</div>
				<div class="mpb-c-audio-box">
					<audio ref="audio" src="" controls="controls"></audio>
				</div>
			</div>
			<div class="mpb-right">
				<a v-for="(item, index) in playModeList" :key="index" :class="[{'mpb-play-type': true, 'showed': item.type == playMode }, 'mpb-btn-play-'+item.type]" href="javascript:;" :title="item.name" @click="exchangePlayMode(index)"><span></span></a>
			</div>
		</div>
		
	</div>
</template>

<script>
	export default {
		name: "music-player-bar",
		props: {
      isCanPlayMusic: Boolean,
			isShowPlayerBar: Boolean,
			isPlayingMusic : Boolean,
			activeSongIndex: Number,
			fetchNodeResourceDetail: Function,
			songList: Array,
			songPresentableList: Array,
			songPresentableAuthInfos: Array,
			initOneSong: Function,
		},
		data (){
			return {
				progressPercent: '0%',
				songPlayedTime: '00:00',
				songTotalTime: '00:00',
				playModeList: [
					{ name: '列表循环播放', type: 'loop', },
					{ name: '列表顺序播放', type: 'list', },
					{ name: '随机播放', type: 'random',  },
					{ name: '单曲循环播放', type: 'single',  }
				],
				playMode: 'random'
			}
		},
		computed :{
			targSongName (){
				if(this.songList.length == 0 || !this.songList[this.activeSongIndex]) return ''
				return this.songList[this.activeSongIndex].name
			},
			targSongSinger (){
				if(this.songList.length == 0 || !this.songList[this.activeSongIndex]) return ''
				return this.songList[this.activeSongIndex].singer
			},
			$audio (){
				return this.$refs.audio
			},
			$progressBox (){
				return this.$refs.progressbox
			}
		},
		methods: {
			togglePlayBtn (){
				this.$emit('update:isPlayingMusic', !this.isPlayingMusic)
				// if(this.isPlayingMusic){
				// 	this.$audio.play()
				// }else{
				// 	this.$audio.pause()
				// }
			},
			playPrevSong (){
				var targIndex = this.activeSongIndex - 1
				targIndex = targIndex <= 0 ? 0 : targIndex
				// this.activeSongIndex = targIndex
				this.$emit('update:activeSongIndex', targIndex)
				this.initOneSong()
			},
			playNextSong (){
				var targIndex = this.activeSongIndex + 1
				targIndex = targIndex >= this.songList.length - 1 ? this.songList.length - 1 : targIndex
				// this.activeSongIndex = targIndex
				this.$emit('update:activeSongIndex', targIndex)
				this.initOneSong()
			},
			exchangeProgress (e){
				if(this.songPresentableAuthInfos[this.activeSongIndex].errcode != 0) return 
				var { x, width } = e.currentTarget.getBoundingClientRect()
      
				var ratio = (e.x - x) / width
				var playTime = Math.floor(ratio * this.$audio.duration)
				
				this.$audio.currentTime = playTime				
				this.progressPercent = +ratio.toFixed(2) * 100  + '%'
				this.gotSongCurrentTime()
			},
			exchangePlayMode (index){
				var targIndex = index + 1 == this.playModeList.length ? 0 : index + 1
				this.playModeList = this.playModeList.map((item, i) => {
					
					if(i == targIndex){
						this.playMode = item.type
						item.isShowed = true
					}else{
						item.isShowed = false
					}
					
					return item
				})
			},
			gotSongCurrentTime (){
				clearTimeout(this.timeoutTimer)
				let { currentTime, duration } = this.$audio
				
				this.songPlayedTime = this.getTimeStr(Math.floor(currentTime || 0))
				this.songTotalTime = this.getTimeStr(Math.floor(duration || 0))
				this.progressPercent = +(currentTime / duration * 100 ).toFixed(2) + '%'
				
				this.timeoutTimer = setTimeout(() => {
					
					if(currentTime == duration ){
						clearTimeout(this.timeoutTimer)
						this.songEndCallback()
					}else{
						this.gotSongCurrentTime()
					}
				}, 1000)
			},
			getTimeStr (time){
				
				if(time == 0 || !/\d+/.test(time) ) return '00:00'
				var hourTime = Math.floor(time/3600) % 60 
				hourTime = hourTime > 9 ? hourTime : (hourTime > 0 ? '0' + hourTime : 0)

				var minuteTime = Math.floor(time/60) % 60 
				minuteTime = minuteTime > 9 ? minuteTime : '0' + minuteTime

				var secondTime = time%60 
				secondTime = secondTime > 9 ? secondTime : '0' + secondTime
				
				var timeStr = hourTime == 0 ? `${minuteTime}:${secondTime}` : `${hourTime}:${minuteTime}:${secondTime}`
				return timeStr
			},
			songEndCallback (){
				// this.showLoading()
				console.log('song end ---',this.playMode)
				switch(this.playMode){
					case 'loop': {
						var targIndex = this.activeSongIndex + 1
						while(this.songPresentableAuthInfos[targIndex].errcode != 0){
						targIndex += 1
						}
						if(targIndex >= this.songList.length ){
						targIndex = 1
						}
						// this.activeSongIndex = targIndex
						this.$emit('update:activeSongIndex', targIndex)
						this.initOneSong()
						break
					}
					case 'list': {
						var targIndex = this.activeSongIndex + 1
						while(this.songPresentableAuthInfos[targIndex].errcode != 0){
							targIndex += 1
						}
						if(targIndex >= (this.songList.length - 1) ){
							this.isPlayingSong = false
						return 
						}
						// this.activeSongIndex = targIndex
						this.$emit('update:activeSongIndex', targIndex)
						this.initOneSong()
						break
					}
					case 'random': {
						var targIndex = Math.floor(Math.random(1) * this.songList.length)
						while(this.songPresentableAuthInfos[targIndex].errcode != 0 || targIndex == this.activeSongIndex){
							targIndex = Math.floor(Math.random(1) * this.songList.length)
						}
						// this.activeSongIndex = targIndex
						this.$emit('update:activeSongIndex', targIndex)
						this.initOneSong()
						break
					}
					case 'single': {
						this.$audio.currentTime = 0
						this.$audio.play()
						break
					}
				}
				this.gotSongCurrentTime()
				return 
			}
		},
		watch: {
			isPlayingMusic (){
				this.gotSongCurrentTime()
				if(!this.isPlayingMusic){
					this.$audio.pause()
					clearTimeout(this.timeoutTimer)
				}else{
          console.log('isCanplaymusic', this.isCanPlayMusic)
          this.isCanPlayMusic && this.$audio && this.$audio.play()
				}
			},
			activeSongIndex (){
			  if(this.isCanPlayMusic && this.isPlayingMusic){
          this.$audio.play()
        }
				// console.log('watch -- ', this.activeSongIndex, this.targSongName, this.$audio)
			}
		
		},
		mounted (){

		},
		destroyed (){
			clearTimeout(this.timeoutTimer)
		}
	}
</script>
