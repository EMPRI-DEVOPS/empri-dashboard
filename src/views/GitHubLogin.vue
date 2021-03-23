<template>
  <p><b>ClientId:</b> {{ clientId }}</p>
  <p>
    <b>State parameter:</b> {{ stateParameter }}
    <button @click="generateStateParameter()">Generate</button>
  </p>
  <a :href="this.linkUrl"><h3>Login</h3></a>
</template>

<script>
export default {
  name: "GitHubLogin",
  data() {
    return {
      clientId: "5a76ef3307c83a98e0b4",
      clientSecret: "59aac7f9a7157f1d626db653f20547b3c99a6cfe",
      stateParameter: null,
    };
  },
  mounted() {
    if (sessionStorage.getItem("stateParameter")) {
      this.stateParameter = sessionStorage.getItem("stateParameter");
    } else {
      this.generateStateParameter();
    }
  },
  computed: {
    linkUrl() {
      const params = new URLSearchParams({
        client_id: this.clientId,
        state: this.stateParameter,
        allow_signup: false
      });
      return "https://github.com/login/oauth/authorize?" + params.toString();
    },
  },
  methods: {
    generateStateParameter() {
      // https://medium.com/@dazcyril/generating-cryptographic-random-state-in-javascript-in-the-browser-c538b3daae50
      let text = "";
      let possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (let i = 0; i < 40; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      sessionStorage.setItem("stateParameter", text);
      this.stateParameter = text;
    },
  },
};
</script>