import { createStore } from 'vuex'
import api from '../api/user';

const debug = process.env.NODE_ENV !== 'production'

export default createStore({
    state: {
        user: {}
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        }
    },
    actions: {
        async loadUser({ commit }) {
            return api.getUser().then((user) => {
                commit('setUser', user)
            })
        },
        async updateUser({ commit }, payload) {
            return api.patchUser(payload).then((user) => {
                commit('setUser', user)
            })
        }
    },
    strict: debug
})