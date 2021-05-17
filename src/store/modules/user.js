import api from '../../api/user';

const state = {
    settings: {}
}

const mutations = {
    setUser(state, settings) {
        state.settings = settings
    }
}

const actions = {
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
}

export default {
    state, mutations, actions
}