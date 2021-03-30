<template>
  <div class="col-md-7">
    <div class="card shadow-sm text-center account-list-item">
      <div class="card-body">
        <h5 class="card-title">{{ data.tool }} Account</h5>
        <span v-if="credentials" class="badge rounded-pill bg-success"
          >Activated</span
        ><br>
        <span v-if="username">Username: {{username}}</span>
        <br>
        <span v-if="instanceUrl">URL: {{instanceUrl}}</span>
      </div>
      <div v-if="pulledData" class="card-body">
        <p v-if="username">Username: {{ username }}</p>
        <p v-for="repo in repos" :key="repo.id">Repo: {{ repo.name }}</p>
      </div>
      <div class="card-body">
        <div class="btn-group">

          <router-link
            class="btn btn-sm btn-outline-secondary"
            :to="{ name: 'Account', params: { id: data.id } }"
            >Detail</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AccountListItem",
  props: ["data"],
  data() {
    return {
      repos: null,
    };
  },
  computed: {
    username() {
      return this.data.username;
    },
    instanceUrl() {
      return this.data.instance_url ?? '';
    },
    credentials() {
      return this.data.credentials;
    }
  },
  methods: {
    getData() {
      this.$http({
        url: "https://api.github.com/user",
        headers: {
          Authorization: `token ${this.credentials.access_token}`,
        },
      }).then((response) => {
        this.pulledData = response.data;
        this.username = response.data.login;
        this.$http({
          url: `https://api.github.com/users/${this.username}/repos`,
          headers: {
            Authorization: `token ${this.credentials.access_token}`,
          },
        }).then((response) => {
          this.repos = response.data;
        });
      });
    },
  },
};
</script>