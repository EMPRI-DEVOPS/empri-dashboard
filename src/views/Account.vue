<template>
  <div class="row row-cols-1 g-3 justify-content-md-center">
    <div class="col-md-7 align-items-center">
      <div class="card shadow-sm text-center account-list-item">
        <div class="card-body">
          <h5 class="card-title">{{ tool }}</h5>
          <span v-if="credentials" class="badge rounded-pill bg-success"
            >Activated</span
          ><br />
          <span v-if="username">Username: {{ username }}</span>
          <br />
          <span v-if="instanceUrl">URL: {{ instanceUrl }}</span>
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
        <div class="card-body">
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
  </div>
</template>

<script>
import Cookies from "js-cookie";
import TaigaLogin from "../components/TaigaLogin.vue";

export default {
  name: "Account",
  components: { TaigaLogin },
  props: ["id"],
  data() {
    return {
      loading: true,
      data: null,
      error: "",
      authLinkUrl: null,
    };
  },
  computed: {
    tool() {
      if (this.data) {
        return this.data.tool;
      }
      return "Account " + this.id;
    },
    credentials() {
      return this.data ? this.data.credentials : "";
    },
    username() {
      return this.data ? this.data.username ?? '' : '';
    },
    instanceUrl() {
      return this.data ? this.data.instance_url ?? '' : '';
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
          this.data = response.data;
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
          username: '',
          instance_url: ''
        },
      })
        .then((response) => {
          this.data = response.data;
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