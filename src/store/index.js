import { createStore } from 'vuex'
import user from './modules/user';
import accounts from './modules/accounts'
import assessment from './modules/assessment';

const debug = process.env.NODE_ENV !== 'production'

export default createStore({
    modules: {
        user, accounts, assessment
    },
    strict: debug
})