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
    component: () => import('../views/TreeView.vue'),
    meta: { hideFooter: true }
  },
  {
    path: '/book',
    name: 'BookView',
    component: () => import('../views/BookView.vue'),
    meta: { hideFooter: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../views/News.vue')
  },
  {
    path: '/donation',
    name: 'Donation',
    component: () => import('../views/Donation.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  },
  {
    path: '/worship',
    name: 'Worship',
    component: () => import('../views/Worship.vue')
  },
  {
    path: '/mutual-aid',
    name: 'MutualAid',
    component: () => import('../views/MutualAid.vue')
  },
  {
    path: '/branch',
    name: 'BranchManagement',
    component: () => import('../views/BranchManagement.vue')
  },
  {
    path: '/privacy',
    name: 'UserPrivacy',
    component: () => import('../views/UserPrivacy.vue')
  },
  {
    path: '/branch-merge',
    name: 'BranchMerge',
    component: () => import('../views/BranchMerge.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
