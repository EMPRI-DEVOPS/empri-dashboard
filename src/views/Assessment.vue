<template>
  <h3>Accounts</h3>

  <span v-if="loading">Loading..</span>
  <span v-if="error">Error!</span>

  <div class="row row-cols-1 g-3 justify-content-md-center text-center">
    <span>{{ githubAccounts.length }} activated github accounts</span>
    <div v-for="account in githubAccounts" class="col-md-7" :key="account.id">
      <div class="card shadow-sm text-center">
        <div class="card-body">
          <h5 class="card-title">{{ account.tool }}</h5>
        </div>
        <div class="card-body">
          <button @click="getData" class="btn btn-outline-secondary">Get Data</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  name: "Assessment",
  data() {
    return {
      loading: true,
      data: [],
      error: false,
    };
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  computed: {
    githubAccounts: function () {
      return this.data.filter(
        (account) => account.tool === "Github" && account.credentials
      );
    },
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      //this.loading = true;
      this.$http({
        url: "api/account",
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