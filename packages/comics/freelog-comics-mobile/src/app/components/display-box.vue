<template>
  <div class="wrapper">
    <header>
      <div class="back-btn" @click="hide">back</div>
      <h3>{{comicsName}}</h3>
    </header>
    <div class="comics-img-box">
      <img
        v-for="(imgUrl, index) in comicsUrls"
        :src="imgUrl"
        :key="'img-'+index"
        alt="" />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'display-box',
    props: {
      comicsUrls: Array,
      comicsName: String,
    },
    data() {
      return {

      }
    },
    computed: {

    },
    methods: {
      hide() {
        this.$emit('hide-comics')
      },
    },
    watch: {
      comicsUrls() {
        console.log(comicsUrls)
      }
    },
    mounted() {

    }
  }
</script>

<style lang="less" scoped>
  .wrapper {
    overflow: auto;
    position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 10;
    background-color: rgba(0,0,0,.6);

    header {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 1.28rem;; border-bottom: 1px solid #ccc;
      background-color: #fff;

      h3 { padding-left: 1.1rem; line-height: 1.28rem; font-size: .4236667rem; color: #333; text-align: center; }

      .back-btn {
        position: absolute; top: 0; left: .12rem; z-index: 1;
        width: .8rem; height: 100%;
        font-size: .266667rem; line-height: 1.28rem; text-align: center; color: #555;
      }
    }

    .comics-img-box {
      padding-top: 1.28rem;

      img{ display: block; width: 100%; }
    }
  }
</style>
