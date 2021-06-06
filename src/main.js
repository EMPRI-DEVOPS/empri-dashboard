import {
    createApp
} from 'vue'
import router from './router'
import store from './store'
import "bootstrap/dist/css/bootstrap.min.css";
import Collapse from "bootstrap/js/dist/collapse"
import "./assets/app.css";
import "nouislider/dist/nouislider.css";

createApp({})
    .use(router)
    .use(store)
    .mount('#app')

Array.from(document.querySelectorAll('.collapse'))
    .forEach(collapse => new Collapse(collapse))