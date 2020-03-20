
import AuthBox from './auth-toast.vue'

export default {
  install(Vue) {
    let FreelogAuthBoxConstructor = Vue.extend(AuthBox)

    let instance
    let instances = []
    let seed = 1

    const FreelogAuthBox = function(options) {
      if (Vue.prototype.$isServer) return
      options = options || {}
      if (typeof options === 'string') {
        options = {
          message: options
        }
      }
      let userOnClose = options.onClose
      let id = 'message_' + seed++

      options.onClose = function() {
        FreelogAuthBox.close(id, userOnClose)
      }
      instance = new FreelogAuthBoxConstructor({
        data: options
      })
      instance.id = id
      instance.$mount()
      document.body.appendChild(instance.$el)
      let verticalOffset = options.offset || 20
      instances.forEach(item => {
        verticalOffset += item.$el.offsetHeight + 16
      })
      instance.verticalOffset = verticalOffset
      instance.visible = true
      instances.push(instance)
      return instance
    }

    FreelogAuthBox.close = function(id, userOnClose) {
      let len = instances.length
      let index = -1
      for (let i = 0; i < len; i++) {
        if (id === instances[i].id) {
          index = i
          if (typeof userOnClose === 'function') {
            userOnClose(instances[i])
          }
          instances.splice(i, 1)
          break
        }
      }
      if (len <= 1 || index === -1 || index > instances.length - 1) return
      const removedHeight = instances[index].$el.offsetHeight
      for (let i = index; i < len - 1 ; i++) {
        let dom = instances[i].$el
        dom.style['top'] = parseInt(dom.style['top'], 10) - removedHeight - 16 + 'px'
      }
    }

    FreelogAuthBox.closeAll = function() {
      for (let i = instances.length - 1; i >= 0; i--) {
        instances[i].close()
      }
    }
    Vue.component('freelog-auth-box', FreelogAuthBox)
    Vue.prototype.$fAuthBox = FreelogAuthBox
  }
}


