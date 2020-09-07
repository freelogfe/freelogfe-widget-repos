
import Home from './pages/home.vue'
import PlayList from './pages/play-list.vue'
const routes = [{
  path: '/',
  component: Home, 
}, {
  path: '/play-list/:songsMenuId/:songsMenuName',
  component: PlayList
}]

const router = {
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {x: 0, y: 0}
    }
  },
  routes
};


export default router

