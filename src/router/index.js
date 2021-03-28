import {
  createRouter,
  createWebHistory
} from 'vue-router'
import Home from '../views/Home.vue'

const routes = [{
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/accounts/',
    name: 'Accounts',
    component: () => import('../views/Accounts.vue')
  },
  {
    path: '/accounts/create',
    name: 'Create Account',
    component: () => import('../views/AccountCreate.vue')
  },
  {
    path: '/accounts/:id',
    name: 'Account',
    component: () => import('../views/Account.vue'),
    props: true
  },
  {
    path: '/issues',
    name: 'GitHub Issue Graph',
    component: () => import('../views/Issues.vue')
  },
  {
    path: '/github-login',
    name: 'GitHub Login',
    component: () => import('../views/GitHubLogin.vue')
  },
  {
    path: '/github-auth',
    name: 'GitHub Auth',
    component: () => import('../views/GitHubAuth.vue'),
    props: route => ({
      returnedState: route.query.state,
      authCode: route.query.code
    })
  },
  {
    path: '/taiga-login',
    name: 'Taiga Login',
    component: () => import('../views/TaigaLogin.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import( /* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(''),
  linkActiveClass: 'active',
  routes
})

export default router