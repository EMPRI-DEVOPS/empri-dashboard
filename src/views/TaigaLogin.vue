<template>
  <div v-show="authenticated">
    <p>Authentifiziert!</p>
    <button @click="deleteToken">Token löschen</button>
    <pre v-show="response">{{ response }}</pre>
  </div>
  <div v-show="!authenticated">
    <form @submit.prevent="processForm">
      <p v-show="errors.request">Auth error: {{ errors.request }}</p>
      <div class="form-group">
        <label for="url"> Url: </label>
        <input type="url" list="servers" name="url" id="url" v-model="url" />
        <datalist id="servers">
          <option v-for="server in taigaServers" :key="server">
            {{ server }}
          </option>
        </datalist>
        <p v-show="errors.url">Invalid URL</p>
      </div>
      <div class="form-group">
        <label for="username"> Username: </label>
        <input id="username" name="username" v-model="username" />
        <p v-show="errors.username">Please enter a username</p>
      </div>
      <div class="form-group">
        <label for="password"> Password: </label>
        <input
          id="password"
          type="password"
          name="password"
          v-model="password"
        />
        <p v-show="errors.password">Please enter a password</p>
      </div>
      <div class="form-group">
        <button type="submit">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: "TaigaLogin",
  data() {
    return {
      taigaServers: ["https://svs-dashboard.informatik.uni-hamburg.de"],
      url: "",
      username: "",
      password: "",
      errors: {
        url: false,
        username: false,
        password: false,
        request: "",
      },
      response: "",
      authenticated: true,
    };
  },
  mounted() {
    this.authenticated = sessionStorage.getItem("taigaAuthToken")
      ? true
      : false;
  },
  methods: {
    deleteToken() {
      sessionStorage.removeItem("taigaAuthToken");
      this.authenticated = false;
      this.response = "";
    },
    isValidUrl(string) {
      let url;
      try {
        url = new URL(string);
      } catch (_) {
        return false;
      }
      return url.protocol === "http:" || url.protocol === "https:";
    },
    processForm() {
      this.errors.url = !this.isValidUrl(this.url);
      this.errors.username = !this.username;
      this.errors.password = !this.password;
      this.errors.request = "";
      if (!Object.keys(this.errors).every((k) => !this.errors[k])) {
        return;
      }
      const axios = require("axios");

      axios({
        url: this.url + "/api/v1/auth",
        method: "post",
        data: {
          username: this.username,
          password: this.password,
          type: "normal",
        },
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          //this.response =  JSON.stringify(JSON.parse(response.data), null, 2);
          this.response = response.data;
          sessionStorage.setItem("taigaAuthToken", response.data.auth_token);
          this.authenticated = true;
          //JSON.stringify(JSON.parse(value), null, 2);
        })
        .catch((error) => {
          if (error.response) {
            this.errors.request = error.response.data._error_message;
          }
        });
    },
  },
};
</script>

<style scoped>
.form-group {
  padding: 1em;
}
form {
  /* Center the form on the page */
  margin: 0 auto;
  width: 800px;
  /* Form outline */
  padding: 1em;
  border: 1px solid #ccc;
  border-radius: 1em;
}
label {
  /* Uniform size & alignment */
  display: inline-block;
  width: 90px;
  text-align: right;
  padding-right: 5px;
}
input {
  width: 400px;
}
</style>