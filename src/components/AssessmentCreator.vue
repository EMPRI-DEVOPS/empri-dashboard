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
        <div
          class="d-flex align-items-center mt-4"
          v-if="creatingAssessment"
        >
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
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { DateTime } from "luxon";
import GithubAccount from "../api/github-account";
import PlayIcon from "./icons/PlayIcon";

export default {
  components: { PlayIcon },
  emits: ["creatingAssessment", "createdAssessment"],
  setup() {
    const store = useStore();
    store.dispatch("loadUser");
    store.dispatch("loadAccounts");

    const creatingAssessment = ref(false);
    const githubAccount = computed(() => store.getters.githubAccount);
    const now = DateTime.fromObject({ zone: store.getters.timeZone });
    const from = ref(now.minus({ year: 1 }).toISODate());
    const to = ref(now.toISODate());
    const githubUsername = ref("");
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
      });

      for await (const loaded of githubApiAccount.loadRepositoriesContributedTo()) {
        store.commit(
          "assessment/SET_STATUS",
          `Found ${loaded.loadedCount}/${loaded.totalCount} repos where ${githubUsername.value} has contributed to..`
        );
      }
      for await (const found of githubApiAccount.userIssues()) {
        store.commit(
          "assessment/SET_STATUS",
          `Loaded ${found.loadedCount}/${found.totalCount} published issues`
        );
      }
      for await (const found of githubApiAccount.pullRequests()) {
        store.commit(
          "assessment/SET_STATUS",
          `Loaded ${found.loadedCount}/${found.totalCount} pull requests`
        );
      }
      /*
      for await (const found of githubApiAccount.issueComments()) {
        store.commit(
          "assessment/SET_STATUS",
          `Loaded ${found.loadedCount}/${found.totalCount} comments`
        );
      }
      */
      for await (const found of githubApiAccount.loadCommits()) {
        store.commit(
          "assessment/SET_STATUS",
          `Found ${found.foundCount} commits in ${found.repo}`
        );
      }
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
      creatingAssessment,
      start,
    };
  },
};
</script>