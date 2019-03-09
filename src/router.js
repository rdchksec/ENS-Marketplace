import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/domain/:name',
      component: () => import('./layouts/default.vue'),
      children: [
        { path: '/', component: () => import('@/views/DomainDetails.vue') }
      ]
    }
  ]
})
