<template>
  <div class="freelog-music-app">
    <router-view 
      :songsMenuListMap.sync="songsMenuListMap"
      :songsPresentablesMap.sync="songsPresentablesMap"></router-view>
    <audio ref="audio" v-show="false" controls="controls" autoplay></audio>    
  </div>
</template>

<script>
  import { loadPresentablesList, loadPresentableResourceData, batchLoadPresentablesList, MENU_TAGS } from '../data-loader'
  export default {
    name: 'app',
    data() {
      return {
        songsMenuListMap: {},
        songsPresentablesMap: {},
      }
    },
    computed: {
      $audio() {
        return this.$refs['audio']
      }
    },
    methods: {
    },
    created() {
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
