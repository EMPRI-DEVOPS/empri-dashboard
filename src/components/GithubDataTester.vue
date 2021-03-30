<template>
  <div class="card shadow-sm">
    <div class="card-header text-center">
      <h5 class="card-title">Pull some data</h5>
    </div>
    <div class="card-header text-center">
      <div class="btn-group">
        <button class="btn btn-sm btn-outline-secondary" @click="pullUser">
          User
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="pullRepos">
          Repos
        </button>
      </div>
    </div>
    <div class="card-body">
      <json-table
        v-if="pulledData && !Array.isArray(pulledData)"
        :json="pulledData"
      />
      <div v-if="pulledData && Array.isArray(pulledData)">
        <json-table v-for="json in pulledData" :json=json :key="json.id" />
      </div>
      <pre v-if="pulledData">
        {{ pulledData }}
    </pre
      >
    </div>
  </div>
</template>

<script>
import axios from "axios";
import JsonTable from "./JsonTable.vue";

export default {
  name: "GithubDataTester",
  components: { JsonTable },
  props: ["account"],
  data() {
    return {
      pulledData: null,
      githubClient: null,
      repos: [],
    };
  },
  created() {
    const accessToken = this.account.credentials.access_token;

    const clientOptions = {
      baseURL: "https://api.github.com/",
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${accessToken}`,
      },
    };
    this.githubClient = axios.create(clientOptions);
  },
  methods: {
    pullUser() {
      this.githubClient(`user`).then((response) => {
        this.pulledData = response.data;
      });
    },
    pullRepos() {
      this.githubClient(`users/${this.account.username}/repos`).then(
        (response) => {
          this.pulledData = response.data;
          this.repos = response.data;
        }
      );
    },
  },
};
</script>