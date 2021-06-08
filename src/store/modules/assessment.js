import events from "./events"
import { DateTime, Interval } from "luxon";

const state = () => ({
    fromDate: '',
    toDate: '',
    githubUsername: '',
    startedAt: '',
    statusMessage: '',
    completedAt: '',
})

const mutations = {
    NEW(state, payload) {
        state.fromDate = payload.fromDate;
        state.toDate = payload.toDate;
        state.githubUsername = payload.githubUsername;
        state.startedAt = new Date().toISOString();
        state.completedAt = '';
    },
    COMPLETE(state) {
        state.completedAt = new Date().toISOString();
    },
    SET_STATUS(state, msg) {
        state.statusMessage = msg;
    }
}

const actions = {
    new({ commit }, payload) {
        commit('NEW', payload);
        commit('events/START_NEW');
    }
}

const getters = {
    done(state) { return !!state.completedAt },
    interval(state, getters, rootState, rootGetters) {
        return Interval.fromDateTimes(
            DateTime.fromISO(state.fromDate, { zone: rootGetters['timeZone'] }),
            DateTime.fromISO(state.toDate, { zone: rootGetters['timeZone'] })
        );
    },
    duration(state) {
        return Interval.fromISO(state.startedAt + '/' + state.completedAt).count('seconds');
    }
}

export default {
    namespaced: true, state, mutations, actions, getters, modules: { events }
}