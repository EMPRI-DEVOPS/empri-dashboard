<template>
  <div class="accounts">
    <h1>Accounts</h1>

    <span v-if="loading">Loading..</span>
    <span v-if="error">Error!</span>
    <div class="container">
      <account-list-item
        v-for="account in data"
        :id="account.id"
        :tool="account.tool"
        :key="account.id"
      />
    </div>

    <pre v-if="!loading">{{ data }}</pre>
  </div>
</template>

<script>
import AccountListItem from "../components/AccountListItem.vue";
export default {
  components: { AccountListItem },
  name: "Accounts",
  data() {
    return {
      loading: true,
      data: null,
      error: false,
    };
  },
  mounted() {
    const axios = require("axios");

    axios({
      url: "api/account/",
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
};
</script>