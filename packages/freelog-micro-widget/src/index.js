import Vue from 'vue';
import { Tag, Image, Card, Backtop, Button } from 'element-ui'
import vueCustomElement from 'vue-custom-element'
import App from './components/App.vue'
import './index.less'
Vue.use(vueCustomElement)

Vue.component(Tag.name, Tag)
Vue.component(Image.name, Image)
Vue.component(Card.name, Card)
Vue.component(Backtop.name, Backtop)
Vue.component(Button.name, Button)
// Vue.customElement('freelog-micro-widget', App, {
// 	shadow: false,
// 	// shadowCss,
// });
new Vue({
	el: '.freelog-widget-docs-app',
	render: h => h(App)
})

export async function bootstrap() {
	console.log('[vue] vue app bootstraped');
}

export async function mount(props) {
	console.log('[vue] props from main framework', props);
	// render(props);
}

export async function unmount() {
	console.log('[vue] unmount!');
}