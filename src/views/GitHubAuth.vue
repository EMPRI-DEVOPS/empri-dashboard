<template>
  <p><b>Returned state:</b> {{ returnedState }}</p>
  <p><b>State:</b> {{ stateParameter }}</p>
  <p><b>Auth Code:</b> {{ authCode }}</p>
  <p><b>Success:</b> {{ success }}</p>
</template>

<script>
export default {
  name: "GitHubAuth",
  props: {
    returnedState: {
      type: String,
    },
    authCode: {
      type: String,
    },
  },
  computed: {
    success() {
      return this.stateParameter === this.returnedState;
    },
  },
  data() {
    return {
      clientId: "5a76ef3307c83a98e0b4",
      clientSecret: "59aac7f9a7157f1d626db653f20547b3c99a6cfe",
      stateParameter: null,
    };
  },
  mounted() {
    this.stateParameter = sessionStorage.getItem("stateParameter");
    if (this.stateParameter === this.returnedState) {
      const axios = require("axios");
      axios({
        url: "https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token",
        method: 'post',
        data: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: this.authCode,
        },
        headers: {'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded'},
      })
        .then((response) => console.log(response))
        .catch((error) => console.log(error));
    }
  },
};
</script>