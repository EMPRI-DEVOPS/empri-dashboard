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