const state = {
    all: []
}

const mutations = {
    addUserInteractions(state, userInteractions) {
        state.all.push(...userInteractions);
    },
    resetUserInteractions(state) {
        state.all = [];
    }
}

const getters = {
    githubCommits(state) {
        return state.all
            .filter(
                (userInteraction) =>
                    userInteraction.tool == 'Github' && userInteraction.type == 'commit'
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
    totalEventCount(state) {
        return state.all.length;
    }
}

export default {
    state, mutations, getters
}