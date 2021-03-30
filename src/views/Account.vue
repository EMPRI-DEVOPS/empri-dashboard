<template>
  <div class="row row-cols-1 g-4 justify-content-md-center">
    <div class="col-md-7">
      <div class="card shadow-sm account-list-item">
        <div class="card-header text-center">
          <h5 class="card-title">{{ tool }} Account</h5>
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
        <div class="card-body">
          <span v-if="loading">Loading..</span>
          <taiga-login
            v-if="tool === 'Taiga' && !credentials"
            :id="id"
            @authenticated="fetchData"
          />

          <span v-if="error">{{ error }}</span>
        </div>
        <div class="card-footer text-center">
          <div class="btn-group">
            <router-link
              class="btn btn-sm btn-outline-secondary"
              :to="{ name: 'Accounts' }"
              >Back to overview</router-link
            >
            <a
              v-if="authLinkUrl && !credentials"
              class="btn btn-sm btn-outline-primary"
              :href="authLinkUrl"
              >Github Login</a
            >

            <button
              v-if="credentials"
              class="btn btn-sm btn-outline-warning"
              @click="deleteCredentials"
            >
              Delete credentials
            </button>

            <button
              class="btn btn-sm btn-outline-danger"
              v-if="!error"
              @click.prevent="deleteAccount"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-7">
      <github-data-tester v-if="tool === 'Github' && credentials" :account="account" />
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import TaigaLogin from "../components/TaigaLogin.vue";
import GithubDataTester from "../components/GithubDataTester.vue";

export default {
  name: "Account",
  components: { TaigaLogin, GithubDataTester },
  props: ["id"],
  data() {
    GithubDataTester;
    return {
      loading: true,
      account: null,
      error: "",
      authLinkUrl: null,
    };
  },
  computed: {
    tool() {
      if (this.account) {
        return this.account.tool;
      }
      return "Account " + this.id;
    },
    credentials() {
      return this.account ? this.account.credentials : "";
    },
    username() {
      return this.account ? this.account.username ?? "" : "";
    },
    instanceUrl() {
      return this.account ? this.account.instance_url ?? "" : "";
    },
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.$http({
        url: "/api/account/" + this.id,
      })
        .then((response) => {
          this.account = response.data;
          if (response.data.github_auth_link) {
            this.authLinkUrl = response.data.github_auth_link;
          }
          this.loading = false;
        })
        .catch((error) => {
          //falls ein auth error kommt den nutzer zur loginseite umleiten
          if (error.response) {
            if (error.response.status == 404) {
              this.error = "Not found!";
            }
          }
          if (!this.error) {
            this.error = "Unknown error!";
          }
          this.loading = false;
        });
    },
    deleteCredentials() {
      const csrftoken = Cookies.get("csrftoken");
      this.loading = true;

      this.$http({
        url: "/api/account/" + this.id,
        method: "PATCH",
        headers: { "X-CSRFToken": csrftoken },
        data: {
          credentials: null,
          username: "",
          instance_url: "",
        },
      })
        .then((response) => {
          this.account = response.data;
          if (response.data.github_auth_link) {
            this.authLinkUrl = response.data.github_auth_link;
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .then(() => (this.loading = false));
    },
    deleteAccount() {
      const csrftoken = Cookies.get("csrftoken");

      this.$http({
        url: "/api/account/" + this.id,
        method: "DELETE",
        headers: { "X-CSRFToken": csrftoken },
      })
        .then(() => {
          this.$router.push({ name: "Accounts" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>