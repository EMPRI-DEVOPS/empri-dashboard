import api from '../../api/user';

const state = {
    settings: {}
}

const getters = {
    timeZone(state) { return state.settings.time_zone },
    dayTimeRanges(state) { return state.settings.day_time_ranges ?? [] }
}

const mutations = {
    setUser(state, settings) {
        state.settings = settings
    }
}

const actions = {
    async loadUser({ commit }) {
        return api.getUser()
            .then((user) => commit('setUser', user))
            .catch(() => window.location.replace("/auth/login/"))
    },
    async updateUser({ commit }, payload) {
        return api.patchUser(payload)
            .then((user) => commit('setUser', user))
    }
}

export default {
    state, mutations, actions, getters
}