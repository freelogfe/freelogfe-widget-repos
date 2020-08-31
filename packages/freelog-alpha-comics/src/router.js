import Home from './pages/index.vue'

const routes = [{
  path: '*',
  component: Home,
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

