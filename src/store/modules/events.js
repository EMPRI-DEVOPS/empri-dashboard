const state = {
    all: [],
    filters: []
}

const mutations = {
    ADD(state, userInteractions) {
        state.all.push(...userInteractions);
    },
    RESET(state) {
        state.all = [];
    },
    TOGGLE_TYPE_FILTER(state, type) {
        const idx = state.filters.findIndex((filter) => filter.type === type);
        if (idx === -1) {
            state.filters.push({ type })
        } else {
            state.filters.splice(idx, 1);
        }
    },
}

const getters = {
    githubEvents(state, getters) {
        return getters.filtered
            .filter(
                (userInteraction) =>
                    userInteraction.tool == 'Github'
            );
    },
    types: (state) => {
        let types = []; state.all.forEach(uI => {
            let i = types.findIndex(type => type === uI.type);
            if (i <= -1) {
                types.push(uI.type);
            }
        }); return types
    },
    byType: (state, getters) => (type) => getters.filtered
        .filter((userInteraction) => userInteraction.type == type)
    ,
    filtered(state) {
        if (state.filters.length === 0 ) {
            return state.all;
        }
        return state.all.filter((event) => state.filters.findIndex((filter) => filter.type === event.type) !== -1)
    },
    totalCount(state, getters) {
        return getters.filtered.length;
    }
}

export default {
    namespaced: true, state, mutations, getters
}