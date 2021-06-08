import { DateTime } from "luxon";

const state = {
    all: [],
    filters: [],
    backup: [],
    reductionLevel: 0 // 1: days, 2: weeks, 3: months
}

const mutations = {
    ADD(state, userInteractions) {
        state.all.push(...userInteractions);
    },
    START_NEW(state) {
        state.all = [];
        state.filters = [];
        state.backup = [];
        state.reductionLevel = 0;
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
    SET_REDUCTION_LEVEL(state, level) {
        state.reductionLevel = level;
    },
    BACKUP_EVENTS(state) {
        state.backup = state.all;
    },
    LOAD_BACKUP_EVENTS(state) {
        state.all = state.backup;
    }

}

const actions = {
    applyReduction({ state, commit }, level) {
        if (state.reductionLevel === 0) {
            commit('BACKUP_EVENTS');
        }
        const currentEvents = state.all;
        commit('RESET');
        switch (level) {
            case 0:
                commit('LOAD_BACKUP_EVENTS');
                commit('SET_REDUCTION_LEVEL', level);
                break;
            case 1:
                for (const event of currentEvents) {
                    const timestamp = DateTime.fromISO(event.timestamp).startOf("day").toISO();
                    const newEvent = Object.freeze(Object.assign({}, event, { timestamp }));
                    commit("ADD", [newEvent]);
                }
                commit('SET_REDUCTION_LEVEL', level);
                break;
            case 2:
                for (const event of currentEvents) {
                    const timestamp = DateTime.fromISO(event.timestamp).startOf("week").toISO();
                    const newEvent = Object.freeze(Object.assign({}, event, { timestamp }));
                    commit("ADD", [newEvent]);
                }
                commit('SET_REDUCTION_LEVEL', level);
                break;
            case 3:
                for (const event of currentEvents) {
                    const timestamp = DateTime.fromISO(event.timestamp).startOf("month").toISO();
                    const newEvent = Object.freeze(Object.assign({}, event, { timestamp }));
                    commit("ADD", [newEvent]);
                }
                commit('SET_REDUCTION_LEVEL', level);
                break;
            default:
                break;
        }
    }
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
        if (state.filters.length === 0) {
            return state.all;
        }
        return state.all.filter((event) => state.filters.findIndex((filter) => filter.type === event.type) !== -1)
    },
    getPaginated: (state, getters) => (begin, end) => {
        const filteredEvents = [...getters.filtered];
        filteredEvents.sort((a, b) => a.timestamp < b.timestamp ? -1 : ((a.timestamp > b.timestamp) ? 1 : 0))
        return filteredEvents.slice(begin, end)
    }
    ,
    totalCount(state, getters) {
        return getters.filtered.length;
    }
}

export default {
    namespaced: true, state, mutations, actions, getters
}