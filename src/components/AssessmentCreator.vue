<template>
  <div class="container mb-3">
    <div v-if="!githubAccount" class="row justify-content-center">
      <div class="card col-lg-5">
        <div class="card-body">
          <router-link to="accounts"
            >Connect your Github account to get started..
          </router-link>
        </div>
      </div>
    </div>
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <form @submit.prevent="start">
          <div class="row g-4">
            <div class="col-12">
              <div class="row mb-3">
                <label for="username" class="col-sm-5 col-form-label"
                  >Github Username
                </label>
                <div class="col-sm-7">
                  <input
                    name="username"
                    v-model="githubUsername"
                    :disabled="creatingAssessment"
                    class="form-control"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <label class="col-sm-5 col-form-label"
                  >Github interaction types</label
                >
                <div class="col-sm-7">
                  <div
                    v-for="eventType of githubEventTypes"
                    class="form-check form-check-inline"
                    :key="eventType.type"
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="eventType.type"
                      :value="eventType.type"
                      v-model="selectedGithubEventTypes"
                    />
                    <label class="form-check-label" :for="eventType.type">{{
                      eventType.name
                    }}</label>
                  </div>
                </div>
              </div>
              <div class="row mb-3">
                <label for="from" class="col-sm-5 col-form-label">From</label>
                <div class="col-sm-7">
                  <input
                    name="from"
                    type="date"
                    class="form-control"
                    v-model="from"
                    :disabled="creatingAssessment"
                    :max="to"
                  />
                </div>
              </div>
              <div class="row">
                <label for="to" class="col-sm-5 col-form-label">To</label>
                <div class="col-sm-7">
                  <input
                    name="to"
                    type="date"
                    class="form-control"
                    v-model="to"
                    :disabled="creatingAssessment"
                    :max="today"
                    :min="from"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 align-self-center">
              <div class="d-grid">
                <button
                  type="submit"
                  class="btn btn-lg btn-outline-secondary"
                  :disabled="creatingAssessment"
                >
                  <span v-if="creatingAssessment">
                    <span
                      class="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    >
                    </span>
                    Pulling data..</span
                  ><span v-else><play-icon /> Start</span>
                </button>
              </div>
            </div>
          </div>
        </form>
        <div v-if="creatingAssessment" class="mt-4">
          <div v-for="msg of persistentMessages" :key="msg">
            <samp>{{ msg }}</samp>
          </div>
          <div class="d-flex align-items-center">
            <samp>{{ statusMessage }}</samp>
            <div
              class="spinner-border ms-auto"
              role="status"
              aria-hidden="true"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, unref } from "vue";
import { useStore } from "vuex";
import { DateTime } from "luxon";
import GithubAccount from "../api/github-account";
import PlayIcon from "./icons/PlayIcon";

export default {
  components: { PlayIcon },
  setup() {
    const store = useStore();
    store.dispatch("loadUser");
    store.dispatch("loadAccounts");

    const githubEventTypes = require("../common").githubEventTypes;
    const creatingAssessment = ref(false);
    const githubAccount = computed(() => store.getters.githubAccount);
    const now = DateTime.fromObject({ zone: store.getters.timeZone });
    const from = ref(now.minus({ year: 1 }).toISODate());
    const to = ref(now.toISODate());
    const githubUsername = ref("");
    const selectedGithubEventTypes = ref([]);
    selectedGithubEventTypes.value.push("commit", "issue", "pullRequest");
    const persistentMessages = computed(
      () => store.state.assessment.persistentMessages
    );
    const statusMessage = computed(() => store.state.assessment.statusMessage);
    const start = async () => {
      creatingAssessment.value = true;
      const githubApiAccount = new GithubAccount(githubAccount.value);
      githubApiAccount.username = githubUsername.value =
        githubUsername.value || githubApiAccount.username;
      store.dispatch("assessment/new", {
        fromDate: from.value,
        toDate: to.value,
        githubUsername: githubUsername.value,
        githubEventTypes: unref(selectedGithubEventTypes),
      });

      await githubApiAccount.start();

      store.commit("assessment/COMPLETE");
      creatingAssessment.value = false;
    };

    return {
      githubAccount,
      from,
      today: now.toISODate(),
      to,
      githubUsername,
      statusMessage,
      persistentMessages,
      creatingAssessment,
      githubEventTypes,
      selectedGithubEventTypes,
      start,
    };
  },
};
</script>