import {
  createRouter,
  createWebHistory
} from 'vue-router'

const routes = [
  {
    path: '/accounts',
    name: 'Accounts',
    component: () => import('../views/Accounts.vue')
  },
  {
    path: '/accounts/:id',
    name: 'Account',
    component: () => import('../views/Account.vue'),
    props: true
  },
  {
    path: '/',
    name: 'Assessment',
    component: () => import('../views/Assessment.vue'),
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import( /* webpackChunkName: "about" */ '../views/About.vue')
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