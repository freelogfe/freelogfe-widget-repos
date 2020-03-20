<template>
  <div class="comics-header">
    <div class="comics-cover-mobile">
      <img :src="coverUrl" alt="" v-show="coverUrl !== ''" />
      <div class="comics-decription" v-if="comicsInfo">
        <h1>{{comicsInfo.name}}</h1>
        <ul>
          <li v-for="(tag, index) in tags" :key="'tag-'+index">{{tag}}</li>
        </ul>
        <div class="bg-mask"></div>
      </div>
    </div>

    <div class="comics-cover">
      <div class="c-cover-bg"><img :src="coverUrl" alt="" /></div>
      <div class="c-cover-introduction">
        <div class="c-cover-left-box">
          <div class="c-cover">
            <img :src="coverUrl" height="280" width="210" v-show="coverUrl !== ''" />
          </div>
          <div class="c-cover-shadow"></div>
        </div>
        <div class="c-cover-info-box" v-if="comicsInfo">
          <p class="name">{{comicsInfo.name}}</p>
          <p class="author"><span>作者：</span><span>{{comicsInfo.author}}</span></p>
          <p class="lang"><span>语言：</span><span>{{comicsInfo.language}}</span></p>
          <p class="cont">{{comicsInfo.intro}}</p>
          <p class="tags">
            <span>标签：</span>
            <span class="tag" v-for="(tag, index) in tags" :key="'tag-'+index">{{tag}}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'comics-header',
    props: {
      coverUrl: String,
      comicsInfo: Object
    },
    data() {
      return {
        isMobile: window.FreelogApp.Env.isMobile
      }
    },
    computed: {
      tags() {
        return this.comicsInfo && this.comicsInfo.tags ? this.comicsInfo.tags.split(' ') : []
      }
    },
    watch: {
      comicsInfo() {
        
      }
    },
  }
</script>

<style lang="less" scoped>
  .comics-header { overflow: hidden; }
  .comics-cover-mobile {
    overflow: hidden;
    position: relative; min-height: 4rem; max-height: 4.8rem;
    img{ z-index: 9; display: block; width: 100%; }

    .comics-decription {
      box-sizing: border-box; z-index: 10;
      position: absolute; bottom: 0; left: 0; z-index: 1;
      width: 100%; padding: .2rem; color: #fff;

      h1 { margin-bottom: 5px; font-size: .6rem; font-weight: 400; }
      ul{ overflow: hidden; }
      li{
        float: left;
        padding: 0.02rem .2rem; margin-right: .2rem; border: 1px solid #fff; border-radius: .5rem;
        font-size: .32rem; list-style-type: none;
      }

      .bg-mask {
        position: absolute; left: 0; top: 0; z-index: -1;
        width: 100%; height: 100%;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, .5));
      }
    }
  }

  .comics-cover {
    display: none;
    position: relative; box-sizing: border-box;
    padding-top: 100px; border: 1px solid #cec7bd;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);

    &:before {
      content: " ";
      position: absolute; top: 0; left: 0; z-index: 1;
      width: 100%; height: 100%;
      background-color: rgba(0,0,0,.4);
    }

    .c-cover-bg {
      overflow: hidden;
      position: absolute; top: 0; right: 0; bottom: 0;
      width: 100%; height: 100%;

      img {
        width: 100%;
        filter: blur(10px);
        background-size: 100% 400%;
      }
    }

    .c-cover-introduction {
      position: relative; top: 1px; z-index: 1;
      min-height: 355px; width: 990px; margin: 0 auto; border-top-left-radius: 8px; border-top-right-radius: 8px;
      border-bottom: 1px dashed #999;
      background-color: #fff;

      .c-cover-left-box {
        overflow: hidden;
        position: absolute; top: 34px; left: 20px; z-index: 1;
        width: 250px; height: 308px;
        background-image: url('https://ac.gtimg.com/media/images/page_works_sprite.png');
        background-position: 1px 0;
        background-repeat: no-repeat;
      }

      .c-cover {
        width: 100%; height: 100%;

        img{ display: block; margin: 2px 0 0 20px; }

      }

      .c-cover-shadow{
        position: absolute; left: 20px; top: 2px;
        width: 36px; height: 280px;
        background-image: url('https://ac.gtimg.com/media/images/page_works_sprite.png');
        background-position: -281px 0;
        background-repeat: no-repeat;
      }

      .c-cover-info-box{
        overflow: hidden;
        width: 690px;
        margin-left: 280px; padding-left: 20px; padding-bottom: 10px;

        .name{ 
          margin-top: 35px; 
          font-size: 32px; line-height: 32px; color: #252525; 
        }
        .author, .lang{
          margin-top: 10px; 
          font-size: 13px; color: #666; 
        }
        .tags{
          margin-top: 20px; 
          font-size: 13px; color: #252525;
          span.tag {
            margin-left: 10px; padding: 0 10px; margin-right: 5px;
            border: 1px solid #efddd3; border-radius: 18px;
            line-height: 18px; color: #666;
          }
        }
        .cont{
          display: -webkit-box;
          position: relative; overflow: hidden; text-overflow: ellipsis;
          margin-top: 10px; margin-right: 60px; padding-bottom: 20px; border-bottom: 1px dashed #999;
          line-height: 20px; font-size: 13px; color: #666;
        }
      }
    }
  }
  @media screen and (min-width: 768px){
    .comics-cover-mobile{ display: none; }
    .comics-cover { display: block; }
  }
</style>
