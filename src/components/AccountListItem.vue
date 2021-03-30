<template>
  <div class="col-md-7">
    <div class="card shadow-sm text-center account-list-item">
      <div class="card-body">
        <h5 class="card-title">{{ tool }}</h5>
        <span v-if="credentials" class="badge rounded-pill bg-success"
          >Activated</span
        >
      </div>
      <div v-if="data" class="card-body">
        <p v-if="username">Username: {{username}}</p>
        <p v-for="repo in repos" :key=repo.id>Repo: {{repo.name}}</p> 
      </div>
      <div class="card-body">
        <div class="btn-group">
          <button
            v-if="credentials"
            @click="getData"
            class="btn btn-sm btn-outline-secondary"
          >
            Get Data
          </button>

          <router-link
            class="btn btn-sm btn-outline-secondary"
            :to="{ name: 'Account', params: { id: id } }"
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
  props: ["tool", "credentials", "id"],
  data() {
    return {
      data: null,
      username: null,
      repos: null,
    };
  },
  methods: {
    getData() {
      this.$http({
        url: "https://api.github.com/user",
        headers: {
          Authorization: `token ${this.credentials.access_token}`,
        },
      }).then((response) => {
        this.data = response.data;
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