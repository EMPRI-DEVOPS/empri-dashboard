import { createApp } from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import router from './router'

createApp({})
.use(router)
.use(VueAxios, axios)
.mount('#app')
