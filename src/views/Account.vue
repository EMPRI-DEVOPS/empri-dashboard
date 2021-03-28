<template>
  <div class="account">
    <div class="container">
      <h1>Account {{ id }}</h1>

      <button
        class="btn btn-danger"
        v-if="!error"
        @click.prevent="deleteAccount"
      >
        Delete
      </button>
      <br />
      <span v-if="loading">Loading..</span>
      <br />
      <span v-if="error">{{ error }}</span>

      <pre v-if="!loading">{{ data }}</pre>
    </div>
  </div>
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
    };
  },
  mounted() {
    this.$http({
      url: "/api/account/" + this.id + "/",
    })
      .then((response) => {
        this.data = response.data;
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