<template>
	<div class="song-player-bar clearfix" v-if="songPresentable != null">
		<div class="content clearfix">
			<div class="left-box">
				<div class="btn-prev" :class="{ 'disabled': activeSongIndex == 0 }" @click="playPrevSong">
					<span></span>
				</div>
				<div class="btn-play" :class="{ 'paused': !songPresentable.isPlaying, }" @click="togglePlayBtn">
					<span></span>
				</div>
				<div class="btn-next" :class="{ 'disabled': activeSongIndex === (songsCount - 1) }" @click="playNextSong"
					><span></span>
				</div>
			</div>
			<div class="center-box">
				<template v-if="songPresentable.songInfo != null">
					<el-slider v-model="progressNumber" :max="progressMax" :show-tooltip="false" @change="changeProgress"></el-slider>
					<div class="name-box">
						<span class="song-name">{{songPresentable.songInfo.songName}}</span>
						-
						<span class="singer-name">{{songPresentable.songInfo.singer}}</span>
					</div>
					<div class="remain-time" >
						<span class="play-time">{{playedTime}}</span>
						/
						<span class="total-time">{{songPresentable.songInfo.duration}}</span>
					</div>
				</template>
				
			</div>
			<div class="right-box">
				<div 
					v-for="(item, index) in playModeList" 
					:key="index" 
					:class="[{'play-type': true, 'visible': item.type == playMode }, 'btn-play-'+item.type]" 
					:title="item.name" 
					@click="exchangePlayMode(index)">
					<span></span>
				</div>
				<div class="play-volume">
					<span :class="{ 'disabled': volumeDisabled }" @click="exchangeVolumeMuted"></span>
				</div>
				<el-slider v-model="volumeNumber" max="100" :show-tooltip="false" @input="changeVolume"></el-slider>
			</div>
		</div> 
	</div>
</template>

<script>
	export default {
		name: "song-player-bar",
		props: {
			songPresentable: Object,
			songPresentableAuthInfo: Object,
			songsList: Array,
		},
		data (){
			const localPlayMode = localStorage.getItem('f-music-play-mode')
			return {
				playModeList: [
					{ name: '列表循环播放', type: 'list-loop', },
					{ name: '列表顺序播放', type: 'list', },
					{ name: '随机播放', type: 'random',  },
					{ name: '单曲循环播放', type: 'single-loop',  }
				],
				songList: [],
				playMode: localPlayMode!= null ? localPlayMode : 'random',
				progressNumber: 0,
				volumeNumber: 0, 
				volumeInitial: false,
				volumeDisabled: false,
			}
		},
		computed :{
			progressMax() {
				if(this.songPresentable != null && this.songPresentable.songInfo != null) {
					var [ minute, second ] = this.songPresentable.songInfo.duration.split(':')
					return (+minute) * 60 + (+second)
				}else {
					return 100
				}
			},
			playedTime() {
				if(this.progressNumber === 0) {
					return '00:00'
				}else {
					const munite = '0' + Math.floor(this.progressNumber / 60)
					const second = '0' + this.progressNumber % 60
					return munite.slice(-2) + ":" + second.slice(-2)
				}
			},
			$audio() {
				return this.$root.$children[0].$refs['audio']
			},
			songsCount() {
				return this.songsList.length
			},
			activeSongIndex() {
				return this.songPresentable != null ? this.songPresentable.activeSongIndex : -1
			}
		},
		methods: {
			resetData() {
				if(this.songPresentable == null) return 
				const { songInfo, presentableId } = this.songPresentable
				this.$audio.src = window.FreelogApp.QI.resolvePresentableDataUrl(presentableId)
				this.$audio.setAttribute('data-presentableId', presentableId)
				if(!this.volumeInitial) {
					this.volumeNumber = this.$audio.volume * 100
					this.volumeInitial = true
				}
				this.$audio.loop = this.playMode === 'single-loop'
			},
			changeProgress(val) {
				this.progressNumber = val
				this.$audio.currentTime = val
			},
			// 改变 “音量”
			changeVolume(val) {
				if(this.volumeInitial) {
					this.volumeNumber = val
					this.$audio.volume = (val / 100).toFixed(1)
				}
			},
			// 切换 “静音模式”
			exchangeVolumeMuted() {
				this.volumeDisabled = !this.volumeDisabled
				this.$audio.muted = this.volumeDisabled
			},
			// 切换 "播放模式"
			exchangePlayMode(index) {
				const leng = this.playModeList.length
				const targetIndex = (index + 1) % leng
				this.playMode = this.playModeList[targetIndex].type
				localStorage.setItem('f-music-play-mode', this.playMode)
				this.$audio.loop = this.playMode === 'single-loop'
			},
			togglePlayBtn() {
				if(this.songPresentable.isPlaying) {
					this.$audio.pause()
				}else {
					this.$audio.play()
				}
			},
			playHandler(e) {
				console.log('play ---')
				this.songPresentable.isPlaying = true
			},
			pauseHandler(e) {
				console.log('pause ---')
				this.songPresentable.isPlaying = false
			},
			playPrevSong() {
				this.exchangeSongIndex(-1)
			},
			playNextSong() {
				this.exchangeSongIndex(1)
			},
			exchangeSongIndex(step) {
				const { activeSongIndex: currentSongIndex, playMode } = this
				this.$emit('exchange-song', { currentSongIndex, step, playMode })
			},
			timeupdateHandler(e) {
				this.progressNumber = Math.floor(e.target.currentTime)
			},
			endedHandler(e) {
				console.log('ended ----')
				this.exchangeSongIndex(1)
			},
			bindEvent() {
				this.$audio.addEventListener('play', this.playHandler)
				this.$audio.addEventListener('timeupdate', this.timeupdateHandler)
        this.$audio.addEventListener('pause', this.pauseHandler)
				this.$audio.addEventListener('ended', this.endedHandler)
			},
		},
		watch: {
			songPresentable() {
				this.resetData()
			}
		},
		mounted() {
			this.resetData()
			this.bindEvent()
		},
		destroyed (){
			this.$audio.removeEventListener('play', this.playHandler)
			this.$audio.removeEventListener('timeupdate', this.timeupdateHandler)
			this.$audio.removeEventListener('pause', this.pauseHandler)
			this.$audio.removeEventListener('ended', this.endedHandler)
		}
	}
</script>

<style lang="less" scoped>
	.song-player-bar {
		position: fixed; bottom: 0; left: 0; z-index: 100;
		width: 100%;
		// background-color: rgba(255, 255, 255, .3);

		.content {
			width: 990px; height: 60px; margin: auto;
			background-color: rgba(0, 0, 0, .5);

			.left-box, .center-box, .right-box { position: relative; float: left;}
			.btn-prev, .btn-play, .btn-next, .play-type, .play-volume {
					margin: 0 20px;
					span {
						position: relative; display: block; cursor: pointer;
						background: data-uri('../../images/music-player.png');
					}
					&.disabled {
						span { opacity: .5; }
					}
				}
			.left-box {
				display: flex; flex-flow: row; justify-content: center; align-items: center;
				width: 240px; margin-top: 15px;

				.btn-prev span{ 
					width: 19px; height: 20px; 
					background-position: 0 -30px; 
				}
				.btn-play {
					span {
						width: 19px; height: 30px; 
						background-position: -30px 0;
					}
					&.paused {
						span {
							background-position: 0 0; 
						}
					}
				} 
				.btn-next span{ 
					width: 19px; height: 20px; 
					background-position: 0 -52px; 
				}
			}
			
			.center-box {
				width: 478px; 
				font-size: 12px; color: #e1e1e1cc;
				.progress {
					overflow: inherit; 
					width: 480px; height: 4px; margin-top: 40px; border-radius: 6px; 
					background-color: #fff;
					.progress-bar{ position: relative; border-radius: 6px; height: 100%; background-color: #31c27c; }
					.progress-bar::after{ 
							display: block; content: ''; cursor: grab;
							position: absolute; right: -6px; top: -3px; z-index: 10;
							width: 10px; height: 10px; border-radius: 50%; background-color: #fff;
					}
				}
				.el-slider { margin-top: 25px; }
				.name-box {
					position: absolute; top: 15px; left: 0;
				}
				.remain-time {
					position: absolute; top: 15px; right: 0;
				}
				
			}
			.right-box {
				height: 60px; margin-left: 15px;
				display: flex; flex-flow: row; justify-content: center; align-items: center;

				.play-type{ 
					display: none; 
					&.visible {
						display: block;
					}
				}

				span { position: relative;  }
				.btn-play-list-loop span{ width: 26px; height: 25px; background-position: 0 -205px;}
				.btn-play-list span{ width: 23px; height: 20px; background-position: 0 -260px;}
				.btn-play-random span{ width: 25px; height: 19px; background-position: 0 -74px; } 
				.btn-play-single-loop span{ width: 26px; height: 25px; background-position: 0 -232px;}
				.play-volume {
					margin: 0 8px;
					span{
						width: 26px; height: 21px; background-position: 0 -144px;
						&.disabled { background-position: 0 -182px; }
					}
				} 
				.el-slider { width: 60px; margin-left: 2px; }
			}
		}
	}
</style>

<style lang="less">
	.song-player-bar  {
		.content {
			.el-slider {
				.el-slider__button-wrapper { top: -9px; width: 8px; height: 8px; }
				.el-slider__runway { height: 2px; margin: 16px 0 10px; background-color: #8c8c8c; }
				.el-slider__bar { height: 2px; }
				.el-slider__button {
					width: 8px; height: 8px; border-width: 1px;
				}
			}

		}
		.right-box {
			.el-slider {
				.el-slider__button-wrapper { top: -18px;  }
				.el-slider__runway { margin: 0; }
			}
			
		}
	}
	@media screen and (max-width: 768px){
		.freelog-music-app {
			.song-player-bar {
				.content {
					.left-box { 
						width: 1.6rem; 
						.btn-prev, .btn-next { display: none; }
					}
					.center-box { width: 5.8rem; }
					.right-box {
						.play-type { 
							margin: 0;
						}
						.play-volume { margin-left: .4rem; }
						.el-slider { display: none; }
					}
					.left-box .btn-play, .right-box .play-type, .right-box .play-volume{
						span { transform: scale(.75); }
					}
				}
			}
		}
	}
</style>