<template>
  <div>
    <div class="song-img-box" @click="tapSongListItem">
      <el-image :src="songsMenuCoverUrl" fit="contain"></el-image>
      <i class="el-icon-video-play"></i>
    </div>
    <div class="song-info" >
      <p class="song-i-name" @click="tapSongListItem">{{presentable.presentableName}}</p>
      <p class="song-i-author">
        <span>{{presentable.songsMenuInfo.author}}</span>
      </p>
      <el-tag class="song-i-tag" size="mini">{{presentable.songsMenuInfo.tags && presentable.songsMenuInfo.tags[0]}}</el-tag>
    </div>
  </div>
</template>

<script>
export default {
  name: 'new-song-item',
  props: {
    presentable: Object
  },
  computed: {
    songsMenuCoverUrl() {
      const p = this.presentable
      let url = 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/console/public/img/resource.jpg'
      if (p && p.releaseInfo && p.releaseInfo.previewImages) {
        url = p.releaseInfo.previewImages[0]
      } else if (p.previewImages.length) {
        url = p.previewImages[0]
      }
      return url
    },
  },
  methods: {
    tapSongListItem() {
      this.$emit('show-play-list', this.presentable)
    }
  },
}
</script>

<style lang="less" scoped>
  @itemWidth: 220px; @itemHeight: 220px;
  .song-img-box {
    display: block;
    width: @itemWidth; height: @itemHeight;
    .el-image { width: 100%; }
    .el-icon-video-play {
      margin-top: -14px; margin-left: -14px;
      font-size: 28px; color: #fff;
    }
  }
  .song-info {
    position: relative;
    height: 44px; padding: 10px 0;

    .song-i-author {
      padding-right: 36px; 
    }
    .song-i-tag {
      position: absolute; right: 0; bottom: 11px; z-index: 10;
      transform: scale(.9);
    }
  }
</style>