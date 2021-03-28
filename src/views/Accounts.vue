<template>
  <h3>Accounts</h3>

  <span v-if="loading">Loading..</span>
  <span v-if="error">Error!</span>
  <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
  <account-list-item
    v-for="account in data"
    :id="account.id"
    :tool="account.tool"
    :key="account.id"
  />
  </div>
  <router-link :to="{ name: 'Create Account' }">Add Account</router-link>
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
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  beforeRouteUpdate() {
    this.data = null;
    this.fetchData();
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.loading = true;
      this.$http({
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
  },
};
</script>