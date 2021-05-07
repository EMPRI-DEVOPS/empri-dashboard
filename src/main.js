import {
    createApp
} from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import router from './router'
import "bootstrap/dist/css/bootstrap.min.css";
import Collapse from "bootstrap/js/dist/collapse"
import "./assets/app.css";

createApp({})
    .use(router)
    .use(VueAxios, axios)
    .mount('#app')

Array.from(document.querySelectorAll('.collapse'))
    .forEach(collapse => new Collapse(collapse))