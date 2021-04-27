<template>
  <div>
    <span v-if="loading">Loading..</span>
    <span v-if="error">Error!</span>

    <div class="row row-cols-1 g-3">
      <div class="row py-4">
        <div class="col-md-7">
          <form @submit.prevent="start">
            <div class="row mb-3">
              <label for="username" class="col-sm-3 col-form-label"
                >Github Username</label
              >

              <div class="col-md-7">
                <input
                  name="username"
                  v-model="githubUsername"
                  :disabled="pullingData"
                  class="col-md-7 form-control"
                />
              </div>
            </div>
            <button
              type="submit"
              class="col-md-12 btn btn-lg btn-outline-secondary"
              :disabled="pullingData"
            >
              Start
            </button>
          </form>
        </div>
      </div>
    </div>

    <div v-if="statusMessage" class="row py-4 justify-content-center">
      <div class="col-md-7">
        <div class="card shadow-sm account-list-item">
          <div class="card-header text-center">
            <h5 class="card-title">{{ statusMessage }}</h5>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!pullingData && userInteractions.length">
      <div class="row g-2">
        <div class="col-xl-8" v-if="userInteractions.length">
          <events-by-day-line-chart :events="userInteractions" />
        </div>
        <div class="col-xl-4" v-if="githubCommits.length">
          <github-commits-per-repo :commits="githubCommits" />
        </div>
        <div class="col-xl-6">
          <events-per-weekday-chart :events="userInteractions" />
        </div>
        <div class="col-xl-6">
          <events-per-time-window-chart :events="userInteractions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import EventsByDayLineChart from "../components/EventsByDayLineChart.vue";
import EventsPerWeekdayChart from "../components/EventsPerWeekdayChart.vue";
import EventsPerTimeWindowChart from "../components/EventsPerTimeWindowChart.vue";
import GithubCommitsPerRepo from "../components/GithubCommitsPerRepo.vue";
import { GithubAccount } from "../modules/github-account";
import { getAccounts } from "../api/accounts";

export default {
  components: {
    EventsByDayLineChart,
    GithubCommitsPerRepo,
    EventsPerWeekdayChart,
    EventsPerTimeWindowChart,
  },
  name: "Assessment",
  data() {
    return {
      data: [],
      pullingData: false,
      githubUsername: "",
      statusMessage: "",
      userInteractions: [],
      githubCommits: [],
    };
  },
  beforeRouteEnter(to, from, next) {
    getAccounts(to.params.id)
      .then((accounts) => {
        next((vm) => vm.setAccounts(accounts));
      })
      .catch(() => window.location.replace("/auth/login/"));
  },
  setup() {
    const accounts = ref();
    const setAccounts = (val) => (accounts.value = val);
    return {
      accounts,
      setAccounts,
      loading: ref(false),
      error: ref(false),
      accountCreate: ref(false),
    };
  },
  computed: {
    githubAccounts: function () {
      return this.accounts.filter(
        (account) => account.tool === "Github" && account.credentials
      );
    },
  },
  methods: {
    async start() {
      this.userInteractions = [];
      this.pullingData = true;

      this.githubAccounts.forEach(async (githubAccount) => {
        let account1 = new GithubAccount(githubAccount);

        if (this.githubUsername) {
          account1.username = this.githubUsername;
        } else {
          this.githubUsername = account1.username;
        }
        const { userId, repos } = await this.pullRepos(account1);
        const since = new Date(
          new Date().setFullYear(new Date().getFullYear() - 1)
        );
        await this.pullCommits(account1, repos, userId, since);
        this.statusMessage = "";
        this.pullingData = false;
      });
    },
    async pullRepos(account) {
      let repositoriesContributedTo = [];
      let userId;
      for await (const repoPage of account.repositoriesContributedTo()) {
        userId = repoPage.userId;
        repositoriesContributedTo = [
          ...repositoriesContributedTo,
          ...repoPage.repos,
        ];
        this.statusMessage = `Pulled ${repositoriesContributedTo.length}/${repoPage.totalCount} repos where ${this.githubUsername} has contributed to..`;
      }
      return { userId: userId, repos: repositoriesContributedTo };
    },
    async pullCommits(account, repos, userId, since) {
      let commits = [];
      for (let i = 0; i < repos.length; i++) {
        let repo = repos[i];
        for await (const repoCommitsPage of account.repoCommits(
          repo.owner.login,
          repo.name,
          userId,
          since
        )) {
          commits = [...commits, ...repoCommitsPage];
          this.statusMessage = `Found ${commits.length} commits -- Scanning ${
            repo.nameWithOwner
          } ${i + 1}/${repos.length}`;
        }
      }
      this.githubCommits = commits;
      this.userInteractions = [...this.userInteractions, ...commits];
    },
  },
};
</script>