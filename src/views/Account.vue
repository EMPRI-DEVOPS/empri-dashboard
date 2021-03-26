<template>
  <div class="account">
    <h1>Account {{ id }}</h1>

    <span v-if="loading">Loading..</span>
    <span v-if="error">Error!</span>

    <pre v-if="!loading">{{ data }}</pre>
  </div>
</template>

<script>
export default {
  name: "Account",
  props: ['id'],
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
      url: "/api/account/"+this.id+"/",
    })
      .then((response) => {
        this.data = response.data;
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