<template>
  <div class="wrapper">
    <header>
      <div class="back-btn" @click="hide"><i class="el-icon-arrow-left"></i></div>
      <h3>{{chapterName}}</h3>
    </header>
    <div class="comics-img-box">
      <el-image v-for="(imgUrl, index) in chapterImageUrls" :src="imgUrl" :key="'img-'+index" alt=""></el-image>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'display-box',
    props: {
      chapterImageUrls: Array,
      chapterName: String,
    },
    data() {
      return {

      }
    },
    computed: {

    },
    methods: {
      hide() {
        this.$emit('hide-chapter')
      },
    },
    watch: {
      chapterImageUrls() {
        console.log(chapterImageUrls)
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
      position: fixed; top: 0; left: 0; z-index: 10;
      width: 100%; height: 1.28rem;; border-bottom: 1px solid #ccc;
      background-color: #fff; line-height: 1.28rem;

      h3 { padding-left: .92rem; font-size: .4236667rem; color: #333; text-align: center; }

      .back-btn {
        position: absolute; top: 0; left: .12rem; z-index: 1;
        width: .8rem; height: 100%; cursor: pointer;
        font-size: .3333rem; text-align: center; color: #555;
        i{ font-weight: 600; }
      }
    }

    .comics-img-box {
      padding-top: 1.28rem;

      .el-image { 
        display: block; width: 100%; 
        .el-image__error { height: 60px; }
      }
      img{ display: block; width: 100%; }
    }
  }
  @media screen and (min-width: 768px){
    .wrapper { 
      header {
        width: 990px; height: 90px; margin-left: 50%;
        transform: translateX(-50%);
        line-height:  90px;
        .back-btn { width: 60px; font-size: 22px; }
        h3 { font-size: 22px; padding-left: 0; }
      }
      .comics-img-box {
        width: 990px; margin: auto; padding-top: 90px;
      }
    }
    
  }
</style>
<style lang="less" >
.comics-img-box {
  .el-image { 
    .el-image__error { height: 60px; }
  }
}
</style>
