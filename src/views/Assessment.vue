<template>
  <h3>Assessment</h3>

  <span v-if="loading">Loading..</span>
  <span v-if="error">Error!</span>

  <div class="row row-cols-1 g-3 justify-content-md-center text-center">
    <span>{{ githubAccounts.length }} github access token(s)</span>

    <div class="row py-4 justify-content-center">
      <div class="col-md-7">
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
          class="col-md-12 btn btn-lg btn-outline-secondary"
          @click="start"
        >
          Start
        </button>
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

  <events-by-day-line-chart v-if="eventsByDay" :events="eventsByDay" />

  <div v-if="repos" class="row py-4 justify-content-center">
    <div class="col-md-7">
      <div class="card shadow-sm account-list-item">
        <div class="card-header text-center">
          <h5 class="card-title">Github Account Info</h5>
        </div>
        <div class="card-body">
          <table class="table table-borderless table-hover">
            <tbody>
              <tr v-if="githubUsername">
                <th style="width: 20%">Username</th>
                <td>{{ githubUsername }}</td>
              </tr>
            </tbody>
          </table>
          <h5>Repos</h5>
          <table class="table table-borderless table-hover">
            <tbody>
              <tr>
                <th>Name</th>
                <th>Commits</th>
                <th>Issues</th>
              </tr>
              <tr v-for="(repo, repoName) in repos" :key="repoName">
                <td>{{ repoName }}</td>
                <td>{{ repo.commits.length }}</td>
                <td>{{ repo.issues.length }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer text-center">
          <div class="btn-group"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {timeFormat} from "d3";
import EventsByDayLineChart from '../components/EventsByDayLineChart.vue';
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
      repos: null,
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
    start() {
      this.repos = null;
      this.githubAccounts.forEach((githubAccount) => {
        let account1 = new GithubAccount(githubAccount);

        if (this.githubUsername) {
          account1.username = this.githubUsername;
        } else {
          this.githubUsername = account1.username;
        }
        this.statusMessage = `Pulling data for ${this.githubUsername}...`;

        account1.pullData().then((events) => {
          this.statusMessage = "";

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
          this.eventsByDay.sort((a,b) => b.day - a.day);
        });
      });
    },
  },
};
</script>