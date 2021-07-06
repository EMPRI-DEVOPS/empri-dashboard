import events from "./events"
import { DateTime, Interval } from "luxon";

const state = () => ({
    fromDate: '',
    toDate: '',
    githubUsername: '',
    githubEventTypes: [],
    startedAt: '',
    persistentMessages: [],
    statusMessage: '',
    completedAt: '',
})

const mutations = {
    NEW(state) {
        state.persistentMessages = [];
        state.completedAt = '';
    },
    START(state, payload) {
        state.fromDate = payload.fromDate;
        state.toDate = payload.toDate;
        state.githubUsername = payload.githubUsername;
        state.githubEventTypes = payload.githubEventTypes;
        state.startedAt = new Date().toISOString();
    },
    COMPLETE(state) {
        state.completedAt = new Date().toISOString();
    },
    ADD_PERSISTENT_MESSAGE(state, msg) {
        state.persistentMessages.push(msg);
    },
    SET_STATUS(state, msg) {
        state.statusMessage = msg;
    }
}

const actions = {
    new({ commit }, payload) {
        commit('START', payload);
        commit('events/START_NEW');
    }
}

const getters = {
    done(state) { return !!state.completedAt },
    interval(state, getters, rootState, rootGetters) {
        return Interval.fromDateTimes(
            DateTime.fromISO(state.fromDate, { zone: rootGetters['timeZone'] }),
            DateTime.fromISO(state.toDate, { zone: rootGetters['timeZone'] }).plus({days: 1})
        );
    },
    observedDays(state, getters) {
        let interval = getters['interval'];
        function* days(interval) {
            let cursor = interval.start.startOf("day");
            while (cursor < interval.end) {
              yield cursor.toISODate();
              cursor = cursor.plus({ days: 1 });
            }
          }
        return Array.from(days(interval));
    },
    observedWeeks(state, getters) {
        let interval = getters['interval'];
        function* weeks(interval) {
            let cursor = interval.start.startOf("week");
            while (cursor < interval.end) {
              yield cursor.toISODate();
              cursor = cursor.plus({ week: 1 });
            }
          }
        return Array.from(weeks(interval));
    },
    duration(state) {
        return Interval.fromISO(state.startedAt + '/' + state.completedAt).count('seconds');
    },
    githubEventTypes(state) { return state.githubEventTypes }
}

export default {
    namespaced: true, state, mutations, actions, getters, modules: { events }
}