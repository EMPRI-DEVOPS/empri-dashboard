import {
  createRouter,
  createWebHistory
} from 'vue-router'

const routes = [{
    path: '/accounts',
    name: 'Accounts',
    component: () => import( /* webpackChunkName: "accounts" */ '../views/Accounts.vue')
  },
  {
    path: '/',
    name: 'Assessment',
    component: () => import( /* webpackChunkName: "assessment" */ '../views/Assessment.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Page not found',
    component: () => import('../views/PageNotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(''),
  linkActiveClass: 'active',
  routes
})

export default router