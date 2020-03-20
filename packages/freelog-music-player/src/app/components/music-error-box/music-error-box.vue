<template>
    <div id="error-toast" v-if="isShowErrorBox">
        <div class="et-close-btn" @click="closeErrorToast">X</div>
        <div id="et-info">{{errorInfo}}</div>
        <div id="et-btn">{{errorBtnText}}</div>
        <div id="et-duration">{{errorDurationText}}</div>
    </div>
</template>

<script>
  export default {
    name: 'music-error-box',
    props: {
      songPresentableAuthInfos: Array,
      songPresentableList: Array,
      actPresentable: Object,
      presentableErrorResp: Object,
      errorCount: Number,
      songName: String
    },
    data (){
      return {
        isShowErrorBox: false,
        errorInfo: '',
        errorBtnText: '',
        errorDurationText: ''
      }
    },
    methods : {
      handlerPresentableErrorCode (resp){
        if(!resp.data.data.presentableInfo) {
          resp.data.data.presentableInfo = this.actPresentable
        }
        // console.log('handlerPresentableErrorCode in', JSON.parse(JSON.stringify(resp)))
        var self = this
        window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE', { response: resp }, function (data){
          // event done
          console.log('callback --', data)
          if(data === null) return
          var leng = self.songPresentableAuthInfos.length
          for(let i = 0; i < leng; i++) {
            const { presentableId } = self.songPresentableAuthInfos[i]
            if(data[presentableId]) {
              data[presentableId].errcode = 0
              self.songPresentableAuthInfos[i] = data[presentableId]
            }
          }

          self.$emit('update:songPresentableAuthInfos', [...self.songPresentableAuthInfos])
        })
      },
      showErrorToast ( info, btnText, second, callback){

        if(info && btnText){
          this.errorInfo = info
          this.errorBtnText = btnText
          this.isShowErrorBox = true

          if(second){
            this.shutdownCountdown = false
            this.closeToastSoon(second, callback)  
          }
        }
      },
      closeToastSoon (second, callback){
        if(this.shutdownCountdown) return 
        this.errorDurationText = `该提示在${second}秒后自动关闭...`
        if(second == 0) {
          this.isShowErrorBox = false
          callback()
          clearTimeout(this.tiemoutTimer)
          this.tiemoutTimer = null
          return 
        }
        second -= 1
        this.tiemoutTimer = setTimeout(() => {
          this.closeToastSoon.call(this, second, callback)
        }, 1000);
      },
      closeErrorToast (){
        this.isShowErrorBox = false
        clearTimeout(this.tiemoutTimer)
        this.tiemoutTimer = null
      },
    },
    computed : {
        
    },
    watch: {
      errorCount (){
        this.handlerPresentableErrorCode(this.presentableErrorResp)
      },
    },
    mounted (){
        
    },
    updated (){
        
    },
  }
</script>

<style lang="less">
  
</style>
