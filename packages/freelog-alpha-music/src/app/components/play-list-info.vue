<template>
  <div class="song-menu-box">
    <el-image :src="songsMenuCoverUrl" fit="contain"></el-image>
    <div class="song-menu-info" v-if="songsMenuInfo">
      <p class="song-m-i-name">{{songsMenuPresentable.presentableName}}</p>
      <p class="song-m-i-author">
        <i class="el-icon-user"></i>
        {{songsMenuInfo.author}}
      </p>
      <p class="song-m-i-tags">
        <span class="song-m-i-t-label">标签：</span><el-tag size="mini" v-for="tag in songsMenuInfo.tags" :key="tag">{{tag}}</el-tag>
      </p>
      <p class="song-m-i-intro">
        {{songsMenuInfo.intro}}
      </p>
      <p class="song-m-i-btns">
        <el-button type="success" plain @click="tapPlayAllSongBtn"> 
          <template v-if="songPresentable == null">
            <i class="el-icon-video-play"></i> 播放全部
          </template>
          <template v-else>
            <i class="el-icon-video-pause" v-if="songPresentable.isPlaying"></i>
            <i class="el-icon-video-play" v-else></i> 
            {{ !songPresentable.isPlaying ? '开始播放' : '暂停播放'}}
          </template>
        </el-button>
      </p>
      <div class="song-m-i-back" @click="goToHome">
        <i class="el-icon-s-home"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'play-list-info',
  props: {
    songsMenuPresentable: Object,
    songsMenuInfo: Object,
    songPresentable: Object,
  },
  computed: {
    isMobile() {
      return window.FreelogApp.Env.isMobile
    },
    songsMenuCoverUrl() {
      const p = this.songsMenuPresentable
      let url = 'http://test-frcdn.oss-cn-shenzhen.aliyuncs.com/console/public/img/resource.jpg'
      if (p != null) {
        const { previewImages, releaseInfo } = p
        if(previewImages && previewImages[0]) {
          url = previewImages[0]
        } else if (releaseInfo.previewImages && releaseInfo.previewImages[0]) {
          url = releaseInfo.previewImages[0]
        }
      }
      return url
    }
  },
  methods: {
    tapPlayAllSongBtn() {
      this.$emit('toggle-play')
    },
    goToHome() {
      this.$router.push('/')
    }
  },
}
</script>

<style lang="less" scoped>
  .song-menu-box {
    overflow: hidden;
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
  
</style>

<style lang="less">
  @media screen and (max-width: 768px){
    .freelog-music-app {
      .song-menu-box {
        text-align: center;
        .el-image {
          display: block;
          float: none; width: 6rem; height: 6rem; margin: auto; border-radius: .4rem;
        }
        .song-menu-info {
          padding-top: .4rem; padding-left: 0;
          p { line-height: 1.2; }
          .song-m-i-name { font-size: .6rem; }
          .song-m-i-author {
            .el-icon-user { display: none; }
          }
          .song-m-i-author, .song-m-i-tags { display: inline-block; }
          .song-m-i-intro, .song-m-i-t-label, .song-m-i-back {
            display: none;
          }
          .song-m-i-btns {
            margin-top: .2rem;
            .el-button {
              width: 4.8rem; padding: 0; border-color: #22d59c; border-radius: 1.4rem;
              line-height: 1.12rem; background-color: #22d59c; color: #fff;
              box-shadow: 0 6px 32px rgba(24,213,156,.5);
              .el-icon-video-play, .el-icon-video-pause {
                position: relative; top: .1rem;
                font-size: .6rem;
              }
            }
          }
        }
      }
    }
  }
</style>