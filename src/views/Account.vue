<template>
  <h3>Account {{ id }}</h3>

  <div v-if="authLinkUrl">
    <a class="btn btn-primary" :href="authLinkUrl">Login</a>
    <br /><br />
  </div>

  <button class="btn btn-danger" v-if="!error" @click.prevent="deleteAccount">
    Delete
  </button>
  <br />
  <span v-if="loading">Loading..</span>
  <br />
  <span v-if="error">{{ error }}</span>

  <pre v-if="!loading">{{ data }}</pre>
</template>

<script>
import Cookies from "js-cookie";

export default {
  name: "Account",
  props: ["id"],
  data() {
    return {
      loading: true,
      data: null,
      error: "",
      authLinkUrl: null,
    };
  },
  mounted() {
    this.$http({
      url: "/api/account/" + this.id + "/",
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
  methods: {
    deleteAccount() {
      const csrftoken = Cookies.get("csrftoken");

      this.$http({
        url: "/api/account/" + this.id + "/",
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