<template>
  <transition name="el-message-fade" @after-leave="handleAfterLeave">
    <div class="auth-toast" 
        v-show="visible"
        :style="positionStyle"
        @mouseenter="clearTimer"
        @mouseleave="startTimer">
      <div class="auth-close-btn" v-if="showClose" @click="close">&times;</div>
      <slot>
        <p v-if="!dangerouslyUseHTMLString" class="auth-message__content">{{ message }}</p>
        <p v-else v-html="message" class="auth-message__content"></p>
      </slot>
      <p class="auth-count-down">
        <el-button type="primary" size="mini" @click="authHandler">
          <span v-if="this.timeoutTimer">{{remainTime}}秒后, </span>
          {{authHandlerText}}</el-button>
      </p>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'f-auth-toast',
  data() {
    return {
      presentable: null,
      visible: false,
      message: '',
      duration: 30000,
      onClose: null,
      showClose: false,
      closed: false,
      timeoutTimer: null,
      intervalTimer: null,
      verticalOffset: 120,
      dangerouslyUseHTMLString: false,
      center: false,
      remainTime: 0,
      authHandlerText: '弹出授权签约窗口'
    }
  },
  computed: {
    positionStyle() {
      return {
        // 'top': `${ this.verticalOffset }px`
      };
    },
    songName() {
      return this.presentable != null ? this.presentable.presentableName : ''
    },
    authResult() {
      return this.presentable != null ? this.presentable.authResult : null
    },
  },
  watch: {
    closed(newVal) {
      if (newVal) {
        this.visible = false
      }
    }
  },
  methods: {
    init() {
      if(this.authResult != null) {
        const { authCode, data } = this.authResult
        let msg = `存在授权问题：「${this.songName}」`
        switch(authCode) {
          // 用户合同未激活
          case 501: {
            msg += '合同未激活；<a></a>'

            break
          }
          // 未找到有效的presentable合约(用户尚未与请求的presentable签约或者合约已废弃)
          case 503: {
            msg += '未签约；'
            break
          }
          // 未登陆用户
          case 505: {}
        }
        this.message = msg 
      }
      
    },
    authHandler() {
      this.close()
      var self = this
      window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE', { response: this.authResult }, function (data){
        if(data == null) return 
        if(typeof this.afterRsolvedAuth === 'function') {
          this.afterRsolvedAuth(data)
        }
      })
    },
    handleAfterLeave() {
      this.$destroy(true)
      this.$el.parentNode.removeChild(this.$el)
    },
    close() {
      this.closed = true
      if (typeof this.onClose === 'function') {
        this.onClose(this)
      }
    },
    clearTimer() {
      clearTimeout(this.timeoutTimer)
      clearInterval(this.intervalTimer)
      this.timeoutTimer = this.intervalTimer = null
    },
    startTimer() {
      if (this.duration > 0) {
        this.timeoutTimer = setTimeout(() => {
          if (!this.closed) {
            this.authHandler()
          }
        }, this.duration)
        let time = +new Date()
        this.intervalTimer = setInterval(() => {
          let consumedTime = Math.floor((+new Date() - time) / 1000)
          this.remainTime = this.duration / 1000 - consumedTime
        }, 100)
      }
    },
    keydown(e) {
      if (e.keyCode === 27) { // esc关闭消息
        if (!this.closed) {
          this.close()
        }
      }
    }
  },
  mounted() {
    this.init()
    this.startTimer()
    document.addEventListener('keydown', this.keydown)
  },
  beforeDestroy() {
    this.clearTimer()
    document.removeEventListener('keydown', this.keydown)
  }
}
</script>

<style lang="less" scoped>
  .auth-toast {
    transform: translateX(-50%) translateY(-50%) translateZ(0);
    position: fixed; top: 50%; left: 50%; z-index: 101;
    width: 78%; max-width: 568px; padding: 10px 20px; border: 1px solid #fde2e2; border-radius: 4px;
    font-size: 16px;
    background-color: #fef0f0; color: #f56c6c; text-align: center;  
    .auth-close-btn {
      position: absolute; top: 2px; right: 10px; z-index: 10;
      cursor: pointer;
    }
  }
  .auth-count-down {
    margin-top: 10px; color: #999; 
    transform: scale(.8);
  }
</style>