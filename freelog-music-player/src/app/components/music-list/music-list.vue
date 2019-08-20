d<template>
	<div class="mp-list">
		<div class="mp-list-head">
			<div class="title">
			歌曲列表 
			<span class="info" v-if="songList.length != 0"><span id="playlist-count">{{songList.length}} </span>首歌</span>
			</div>
			<!-- <div class="right-box">播放：<strong id="play-count" class="s-fc6">363659</strong>次</div> -->
		</div>
		<table class="table">
			<thead>
				<tr>
					<th>#</th>
					<th width="238">歌曲标题</th>
					<th width="40"></th>
					<th width="40">时长</th>
					<th>歌手</th>
					<th>专辑</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(item, index) in songList" :key=" 'table-item-' + index ">
					<td scope="row">
						{{index+1}}
						<div :class="{'lock-tag': true, 'showed': songPresentableAuthInfos[index] && songPresentableAuthInfos[index].errcode != 0}" ></div>
					</td>
					<td class="td-name">
						{{item.name}}
						<div class="play-wave" v-if="activeSongIndex == index && isPlayingMusic"></div>
					</td>
					<td>
						<div :class="{'play-btn': true, 'paused': activeSongIndex == index && isPlayingMusic}" @click="playMusic(index)"></div>
					</td>
					<td>{{item.duration}}</td>
					<td>{{item.singer}}</td>
					<td>{{item.album}}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
<script>
	export default {
		name: 'music-list',
		props: {
      isCanPlayMusic: Boolean,
			initOneSong: Function,
			isShowPlayerBar: Boolean,
			activeSongIndex: Number,
			isPlayingMusic: Boolean,
			songList: Array,
			songPresentableAuthInfos: Array,
		},
		data (){
			return {
				
			}
		},
		methods: {
			playMusic (index){
				if(this.activeSongIndex == index && this.isShowPlayerBar && this.isCanPlayMusic){
					// this.isPlayingMusic = !this.isPlayingMusic
					this.$emit('update:isPlayingMusic', !this.isPlayingMusic)
				}else{
					// this.activeSongIndex = index
					// this.isPlayingMusic = true
					// this.isShowPlayerBar = true
					this.$emit('update:activeSongIndex', index)
					this.initOneSong()
          this.$emit('update:isPlayingMusic', true)
          this.$emit('update:isShowPlayerBar', true)
				}
				
			}
		},
		computed: {
			
		},
		watch : {
      songPresentableAuthInfos() {
        console.log('songPresentableAuthInfos --- updated')
      }
    },
		mounted() {
			
		},
	}
</script>

<style lang="">
	
</style>
