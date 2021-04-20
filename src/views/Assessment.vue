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

  <events-by-day-line-chart v-if="eventsByDay.length" :events="eventsByDay" />
</template>

<script>
import { timeFormat } from "d3";
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
      eventsByDay: [],
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

        const repos = await this.pullRepos(account1);

        let commits = [];

        for (var i = 0; i < repos.length; i++) {
          let repo = repos[i];
          let repoCommits = await account1.repoCommits(repo.owner.login, repo.name, this.githubUsername);
          commits = [...commits, ...repoCommits];
          this.statusMessage = `Found ${commits.length} commits -- ${i+1}/${repos.length}`
        }

        console.log(commits);

        let events = [];
        try {
          for await (const eventPage of account1.getEvents()) {
            events = [...events, ...eventPage];
            this.statusMessage = `Pulled ${events.length} events for ${this.githubUsername}..`;
          }
        } catch (e) {
          this.statusMessage = e;
          return;
        }
        if (!events.length) {
          this.statusMessage = `No Events found for ${this.githubUsername}`;
          return;
        }
        this.statusMessage = "Processing..";
        this.eventsByDay = [];
        events.forEach((event) => {
          const date = new Date(event.timestamp);
          const day = timeFormat("%d.%m.%Y")(date);
          const obj = this.eventsByDay.filter((o) => o.day === day)[0];
          if (obj) {
            obj.events += 1;
          } else {
            this.eventsByDay.unshift({
              day: day,
              events: 1,
            });
          }
        });
        this.statusMessage = "";
      });
    },
    async pullRepos(account) {
      let repositoriesContributedTo = [];
      for await (const repoPage of account.repositoriesContributedTo()) {
        repositoriesContributedTo = [
          ...repositoriesContributedTo,
          ...repoPage.repos,
        ];
        this.statusMessage = `Pulled ${repositoriesContributedTo.length}/${repoPage.totalCount} repos where ${this.githubUsername} has contributed to..`;
      }
      return repositoriesContributedTo;
    },
  },
};
</script>