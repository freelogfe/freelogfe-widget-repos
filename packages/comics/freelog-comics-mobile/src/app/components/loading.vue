<template>
  <div class="loading-box" v-if="show">
    <div class="box loading-logo">
      <ul>
        <li class="first"><a href="#"></a></li>
        <li class="second"><a href="#"></a></li>
        <li class="third"><a href="#"></a></li>
      </ul>
    </div>
    <div class="loading-mask"></div>
  </div>
</template>

<script>
  export default {
    name: "loading",
    props: {
      show: false
    },
    data (){
      return {

      }
    },
    computed :{

    },
    methods: {
    },
    watch: {


    },
    mounted (){

    },
    destroyed (){

    }
  }
</script>

<style type="text/less" lang="less" scoped>
  .loading-box{
    position: fixed; top: 0; bottom: 0; left: 0; right: 0; z-index: 100;
  }

  .loading-mask {
    position: absolute; left: 0; top: 0; z-index: 2;
    width: 100%; height: 100%; background-color: rgba(0, 0, 0, .1);
  }

  .loading-logo {
    position: absolute; top: 50%; left: 50%; z-index: 2;
    transform: translateX(-50%) translateY(-50%);
    text-align: center;
  }
  .loading-logo.showed{
    display: block;
  }
  .loading-logo ul{ height: 18px;}
  .loading-logo ul > li{ position: relative; display: inline-block; width: 18px; height: 18px; line-height: 18px; text-align: center; }
  .loading-logo ul > li a { position: absolute; display: inline-block; border-radius: 50%; background-color: rgba(0, 0, 0, .7); }
  .loading-logo ul > li.first a{
    animation: myfirst 1.2s linear 0s infinite alternate;
    -moz-animation: myfirst 1.2s linear 0s infinite alternate; /* Firefox: */
    -webkit-animation: myfirst 1.2s linear 0s infinite alternate;
  }

  .loading-logo ul > li.second a{
    animation: myfirst 1.2s linear .3s infinite alternate;
    -moz-animation: myfirst 1.2s linear .3s infinite alternate; /* Firefox: */
    -webkit-animation: myfirst 1.2s linear .3s infinite alternate;
  }

  .loading-logo ul > li.third a{
    animation: myfirst 1.2s linear 0.6s infinite alternate;
    -moz-animation: myfirst 1.2s linear 0.6s infinite alternate; /* Firefox: */
    -webkit-animation: myfirst 1.2s linear 0.6s infinite alternate;
  }

  @keyframes myfirst
  {
    0%{ top: 9px; left: 9px; width: 0px; height: 0px; }
    50%{ top: 0px; left: 0px; width: 18px; height: 18px; }
    100%{ top: 9px; left: 9px; width: 0px; height: 0px; }
  }

  @-moz-keyframes myfirst /* Firefox */
  {
    0%{ top: 9px; left: 9px; width: 0px; height: 0px; }
    50%{ top: 0px; left: 0px; width: 18px; height: 18px; }
    100%{ top: 9px; left: 9px; width: 0px; height: 0px; }
  }

  @-webkit-keyframes myfirst /* Safari 和 Chrome */
  {
    0%{ top: 9px; left: 9px; width: 0px; height: 0px; }
    50%{ top: 0px; left: 0px; width: 18px; height: 18px; }
    100%{ top: 9px; left: 9px; width: 0px; height: 0px; }
  }
</style>
