
import Vue from 'vue'
import { Tag, Image, Card, Backtop, Button, Icon, Message, Loading } from 'element-ui'
import App from './App.vue'
import './index.less'

Vue.component(Tag.name, Tag)
Vue.component(Image.name, Image)
Vue.component(Card.name, Card)
Vue.component(Backtop.name, Backtop)
Vue.component(Button.name, Button)
Vue.component(Icon.name, Icon)
Vue.use(Loading.directive)
Vue.prototype.$message = Message
Vue.prototype.$loading = Loading.service

var app = new Vue({
  el: '#f-pb-presentation',
  render: (h) => h(App)
})

export async function bootstrap() {
  console.log('[Widget]: bootstrap')
}

export async function mount() {
  console.log('[Widget]: mount')
}
export async function unmount() {
  console.log('[Widget]: unmount')
}
