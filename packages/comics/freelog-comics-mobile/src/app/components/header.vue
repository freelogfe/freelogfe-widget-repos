<template>
  <div>
    <div class="comics-cover">
      <img :src="coverUrl" alt="" v-if="coverUrl !== ''">
      <div class="comics-decription" v-if="description">
        <h1>{{description.name}}</h1>
        <ul>
          <li v-for="(tag, index) in tags" :key="'tag-'+index">{{tag}}</li>
        </ul>
        <div class="bg-mask"></div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'comics-header',
    props: {
      coverUrl: String,
      description: Object
    },
    computed: {
      tags() {
        return this.description ? this.description.tags.split(' ') : []
      }
    }
  }
</script>

<style lang="less" scoped>
  .comics-cover {
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
        font-size: .32rem;
      }

      .bg-mask {
        position: absolute; left: 0; top: 0; z-index: -1;
        width: 100%; height: 100%;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, .5));
      }
    }
  }
</style>
