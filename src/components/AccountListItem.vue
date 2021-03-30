<template>
  <div class="col-md-7">
    <div class="card shadow-sm account-list-item">
      <div class="card-header text-center">
        <h5 class="card-title">{{ account.tool }} Account</h5>
        <span v-if="credentials" class="badge rounded-pill bg-success"
          >Activated</span
        >
      </div>
      <div class="card-body">
        <table class="table table-borderless table-hover">
          <tbody>
            <tr v-if="username">
              <th style="width: 20%">Username</th>
              <td>{{ username }}</td>
            </tr>
            <tr v-if="instanceUrl">
              <th>URL</th>
              <td>{{ instanceUrl }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer text-center">
        <div class="btn-group">
          <router-link
            class="btn btn-sm btn-outline-secondary"
            :to="{ name: 'Account', params: { id: account.id } }"
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
  props: ["account"],
  computed: {
    username() {
      return this.account.username;
    },
    instanceUrl() {
      return this.account.instance_url ?? "";
    },
    credentials() {
      return this.account.credentials;
    },
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