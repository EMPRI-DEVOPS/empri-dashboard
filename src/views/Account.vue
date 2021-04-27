<template>
  <div v-if="account" class="container">
    <div class="row row-cols-1 g-4">
      <div class="col-lg-7">
        <card :title="`${account.tool} Account`">
          <template v-slot:header>
            <span
              v-if="account.credentials"
              class="badge rounded-pill bg-success"
            >
              Activated
            </span>
          </template>
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
          <taiga-login
            v-if="tool === 'Taiga' && !credentials"
            :id="id"
            @authenticated="fetchData"
          />
          <span v-if="error">{{ error }}</span>

          <template v-slot:footer>
            <div class="btn-group">
              <div class="btn-group">
                <router-link
                  class="btn btn-outline-secondary"
                  :to="{ name: 'Accounts' }"
                  >Back to overview</router-link
                >
                <a
                  v-if="account.github_auth_link && !credentials"
                  class="btn btn-outline-primary"
                  :href="account.github_auth_link"
                  >Github Login</a
                >

                <button
                  v-if="credentials"
                  class="btn btn-outline-warning"
                  @click="deleteCredentials"
                >
                  Delete credentials
                </button>

                <button
                  class="btn btn-outline-danger"
                  v-if="!error"
                  @click.prevent="deleteAccount"
                >
                  Delete
                </button>
              </div>
            </div>
          </template>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import TaigaLogin from "../components/TaigaLogin.vue";

import { getAccount } from "../api/accounts";
import Card from "../components/Card.vue";

export default {
  name: "Account",
  components: { TaigaLogin, Card },
  props: ["id"],
  data() {
    return {
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
  beforeRouteEnter(to, from, next) {
    getAccount(to.params.id).then((account) => {
      next((vm) => vm.setAccount(account));
    });
  },
  methods: {
    setAccount(account) {
      this.account = account;
    },
    fetchData() {
      getAccount(this.account.id).then((account) => this.setAccount(account));
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