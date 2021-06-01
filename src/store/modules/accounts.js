import api from '../../api/accounts';

const state = {
    all: [],
    /** accountTypes should be a constant and not reactive */
    accountTypes: [
        {
            id: 1,
            name: "Taiga",
        },
        {
            id: 2,
            name: "Github",
        },
        {
            id: 3,
            name: "Mattermost",
        },
    ]
}

const getters = {
    enabledGithubAccounts(state) {
        return state.all
            .filter((account) => account.tool == "Github")
            .filter((account) => account.credentials)
    },
    githubAccount(state) {
        return state.all
            .find((account) => account.tool == "Github" && account.credentials)
    },
    pendingAccountTypes(state) {
        return state.all
            .filter((account) => !account.credentials)
            .map((account) => account.tool);
    },
}

const mutations = {
    setAccounts(state, accounts) {
        state.all = accounts
    },
    addAccount(state, account) {
        state.all.push(account)
    },
    removeAccount(state, id) {
        const idx = state.all.findIndex((acc) => acc.id == id);
        state.all.splice(idx, 1);
    }
}

const actions = {
    async loadAccounts({ commit }) {
        return api.getAccounts().then((accounts) => {
            commit('setAccounts', accounts)
        })
    },
    async createAccount({ commit }, tool) {
        return api.createAccount(tool).then((account) => commit('addAccount', account))
    },
    async deleteAccount({ commit }, id) {
        return api.deleteAccount(id).then(() => commit('removeAccount', id))
    }
}

export default {
    state, mutations, actions, getters
}