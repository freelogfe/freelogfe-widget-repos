<template>
  <div class="song-item" style="overflow: hidden;">
    <div class="song-img-box" @click="tapNewSongItem">
      <el-image :src="presentable.songCoverUrl" fit="contain"></el-image>
      <i class="el-icon-video-play"></i>
    </div>
    <div class="song-info">
      <p class="song-i-name" @click="tapNewSongItem">{{presentable.songInfo.songName}}</p>
      <p class="song-i-singer">
        <span>{{presentable.songInfo.singer}}</span>
      </p>
      <p class="song-i-duration"> {{presentable.songInfo.duration}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'new-song-item',
  props: {
    presentable: Object
  },
  methods: {
    tapNewSongItem() {
      this.$emit('play-song', this.presentable)
    }
  },
}
</script>

<style lang="less" scoped>
  @imgWidth: 86px; @imgHeight: 86px;
  .song-img-box {
    float: left;
    .el-image {
      width: @imgWidth; height: @imgHeight;
    }
    
    .el-icon-video-play {
      margin-top: -8px; margin-left: -8px;
      font-size: 16px; color: #fff;
    }
  }
  .song-info {
    position: relative;
    padding: 20px 40px 20px @imgWidth + 14px; 
    font-size: 14px;
    .song-i-name {
      color: #000; cursor: pointer;
      &:hover { color: #31c27c; }
    }
    .song-i-singer {
      color: #999; 
    }
    .song-i-duration {
      position: absolute; top: 50%; right: 12px; z-index: 10; 
      transform: translateY(-50%); color: #999;
    }
  }
</style>

<style lang="less">
  @media screen and (max-width: 768px){
    .freelog-music-app {
      .song-item {
        .song-info { 
          padding: .56rem 1.12rem .56rem 2.667rem;
          font-size: .3734rem; line-height: 1.6;
          .song-i-singer { font-size: .32rem; color: #000; }
          .song-i-duration { font-size: .32rem; color: #e8e8e8; }
        }
        .song-img-box {
          width: 2.294rem; height: 2.294rem; margin: .1rem;
          box-shadow: 0px 0px 2px rgba(0, 0, 0, .3);
        }
      }
    }
    
  }
</style>