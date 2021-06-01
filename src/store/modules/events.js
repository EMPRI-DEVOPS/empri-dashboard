const state = {
    all: [],
}

const mutations = {
    ADD(state, userInteractions) {
        state.all.push(...userInteractions);
    },
    RESET(state) {
        state.all = [];
    }
}

const getters = {
    githubEvents(state) {
        return state.all
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
    byType: (state) => (type) => state.all
        .filter((userInteraction) => userInteraction.type == type)
    ,
    totalCount(state) {
        return state.all.length;
    }
}

export default {
    namespaced: true, state, mutations, getters
}