import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/tree',
    name: 'TreeView',
    component: () => import('../views/TreeView.vue')
  },
  {
    path: '/book',
    name: 'BookView',
    component: () => import('../views/BookView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
