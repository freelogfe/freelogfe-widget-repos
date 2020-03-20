<template>
  <div class="auth-box" @click="handleAuth" v-if="authInfo && authInfo.isAuth === false">
    <div class="lock"></div>
  </div>
</template>

<script>
  export default {
    name: 'auth-box',
    props: {
      presentableAuthInfoMap: Object,
      presentableId: String,
    },
    computed: {
      authInfo() {
        return this.presentableAuthInfoMap[this.presentableId] || {}
      },
      authErrMsg() {
        return this.authInfo.errors.join(',')
      }
    },
    methods: {
      handleAuth() {
        const self = this
        window.FreelogApp.trigger(
          'HANDLE_INVALID_RESPONSE',
          { response: this.authInfo },
          function(data) {
            self.$emit('update-p-auth-info', data)
          }
        )
      }
    }
  }
</script>

<style lang="less" scoped>
  .auth-box {
    display: flex; justify-content: center;
    position: absolute; top: 0; left: 0; z-index: 10;
    width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, .3); text-align: center; cursor: pointer;

    .lock{
      align-self: center;
      width: 20px; height: 18px;
      background-image: data-uri('../images/icon_sprite@2x.png');
      background-repeat: no-repeat; background-position: -70px -162px; background-size: 180px;
    }
  }
</style>
