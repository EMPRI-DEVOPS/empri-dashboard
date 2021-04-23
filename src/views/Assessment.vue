<template>
  <span v-if="loading">Loading..</span>
  <span v-if="error">Error!</span>

  <div class="row row-cols-1 g-3 justify-content-md-center text-center">
    <span>{{ githubAccounts.length }} github access token(s)</span>

    <div class="row py-4 justify-content-center">
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
                class="col-md-7 form-control"
              />
            </div>
          </div>
          <button
            type="submit"
            class="col-md-12 btn btn-lg btn-outline-secondary"
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

  <events-by-day-line-chart
    v-if="userInteractions.length"
    :events="userInteractions"
  />
</template>

<script>
import EventsByDayLineChart from "../components/EventsByDayLineChart.vue";
import { GithubAccount } from "../modules/github-account";

export default {
  components: { EventsByDayLineChart },
  name: "Assessment",
  data() {
    return {
      loading: true,
      data: [],
      error: false,
      githubUsername: "",
      statusMessage: "",
      userInteractions: [],
    };
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchAccounts",
  },
  computed: {
    githubAccounts: function () {
      return this.data.filter(
        (account) => account.tool === "Github" && account.credentials
      );
    },
  },
  created() {
    this.fetchAccounts();
  },
  methods: {
    fetchAccounts() {
      this.$http({
        url: "api/account",
      })
        .then((response) => {
          this.data = response.data.results;
          this.loading = false;
        })
        .catch((error) => {
          //falls ein auth error kommt den nutzer zur loginseite umleiten
          this.loading = false;
          this.error = true;
          console.log(error);
        });
    },
    async start() {
      this.repos = null;

      this.githubAccounts.forEach(async (githubAccount) => {
        let account1 = new GithubAccount(githubAccount);

        if (this.githubUsername) {
          account1.username = this.githubUsername;
        } else {
          this.githubUsername = account1.username;
        }
        this.statusMessage = `Pulling data for ${this.githubUsername}...`;

        const { userId, repos } = await this.pullRepos(account1);

        let commits = [];
        const since = new Date(
          new Date().setFullYear(new Date().getFullYear() - 1)
        );

        for (let i = 0; i < repos.length; i++) {
          let repo = repos[i];
          for await (const repoCommitsPage of account1.repoCommits(
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

        this.userInteractions = [...this.userInteractions, ...commits];

        this.statusMessage = "";
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
  },
};
</script>