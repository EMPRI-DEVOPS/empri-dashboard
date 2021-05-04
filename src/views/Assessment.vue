<template>
  <div>
    <div class="container mb-3">
      <div v-if="!enabledGithubAccounts.length" class="row justify-content-center">
        <div v-if="!enabledGithubAccounts.length" class="card col-lg-5">
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
                      :disabled="pullingData"
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
                    :disabled="pullingData"
                  >
                    <play-icon /> Start
                  </button>
                </div>
              </div>
            </div>
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
import EventsByDayLineChart from "../components/charts/EventsByDayLineChart.vue";
import EventsPerWeekdayChart from "../components/charts/EventsPerWeekdayChart.vue";
import EventsPerTimeWindowChart from "../components/charts/EventsPerTimeWindowChart.vue";
import GithubCommitsPerRepo from "../components/charts/GithubCommitsPerRepo.vue";
import PlayIcon from "../components/icons/PlayIcon";
import { GithubAccount } from "../api/github-account";
import { getAccounts } from "../api/accounts";
import useAccounts from "../composables/useAccounts";

export default {
  components: {
    EventsByDayLineChart,
    GithubCommitsPerRepo,
    EventsPerWeekdayChart,
    EventsPerTimeWindowChart,
    PlayIcon,
  },
  name: "Assessment",
  beforeRouteEnter(to, from, next) {
    getAccounts(to.params.id)
      .then((accounts) => {
        next((vm) => vm.setAccounts(accounts));
      })
      .catch(() => window.location.replace("/auth/login/"));
  },
  setup() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const today = new Date().toISOString().slice(0, 10);
    return {
      ...useAccounts(),
      from: ref(oneYearAgo.toISOString().slice(0, 10)),
      today,
      to: ref(today),
      githubUsername: ref(""),
      statusMessage: ref(""),
      userInteractions: ref([]),
      githubCommits: ref([]),
      accountCreate: ref(false),
      pullingData: ref(false),
    };
  },
  methods: {
    async start() {
      this.userInteractions = [];
      this.pullingData = true;

      this.enabledGithubAccounts.forEach(async (githubAccount) => {
        let account1 = new GithubAccount(githubAccount);

        if (this.githubUsername) {
          account1.username = this.githubUsername;
        } else {
          this.githubUsername = account1.username;
        }
        const { userId, repos } = await this.pullRepos(account1);
        await this.pullCommits(
          account1,
          repos,
          userId,
          new Date(this.from),
          new Date(this.to)
        );
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
    async pullCommits(account, repos, userId, since, until) {
      let commits = [];
      for (let i = 0; i < repos.length; i++) {
        let repo = repos[i];
        for await (const repoCommitsPage of account.repoCommits(
          repo.owner.login,
          repo.name,
          userId,
          since,
          until
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