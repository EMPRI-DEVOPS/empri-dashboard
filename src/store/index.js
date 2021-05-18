import { createStore } from 'vuex'
import user from './modules/user';
import accounts from './modules/accounts'
import userInteractions from './modules/userInteractions';

const debug = process.env.NODE_ENV !== 'production'

export default createStore({
    modules: {
        user, accounts, userInteractions
    },
    strict: debug
})