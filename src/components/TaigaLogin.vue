<template>
  <div v-show="authenticated">
    <p>Authentifiziert!</p>
    <button @click="deleteToken">Token löschen</button>
  </div>
  <div v-show="!authenticated">
    <form @submit.prevent="processForm" class="needs-validation" novalidate>
      <p v-show="errors.request">Auth error: {{ errors.request }}</p>
      <div class="row mb-3">
        <label for="url" class="col-sm-3 col-form-label">Url</label>
        <div class="col-sm-9">
          <input
            class="form-control"
            type="url"
            list="servers"
            name="url"
            id="url"
            v-model="url"
            :class="{ 'is-invalid': errors.url }"
            required
          />
          <datalist id="servers">
            <option v-for="server in taigaServers" :key="server">
              {{ server }}
            </option>
          </datalist>
          <div class="invalid-feedback">Invalid URL</div>
        </div>
      </div>
      <div class="row mb-3">
        <label for="username" class="col-sm-3 col-form-label">Username</label>
        <div class="col-sm-9">
          <input
            id="username"
            name="username"
            v-model="username"
            class="form-control"
            :class="{ 'is-invalid': errors.username }"
            required
          />
          <div class="invalid-feedback">Please enter a username</div>
        </div>
      </div>
      <div class="row mb-3">
        <label for="password" class="col-sm-3 col-form-label">
          Password:
        </label>
        <div class="col-sm-9">
          <input
            id="password"
            type="password"
            name="password"
            v-model="password"
            class="form-control"
            :class="{ 'is-invalid': errors.password }"
            required
          />
          <div class="invalid-feedback">Please enter a password</div>
        </div>
      </div>
      <div class="form-group">
        <button class="btn btn-outline-secondary" type="submit">Submit</button>
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
      authenticated: false,
    };
  },
  methods: {
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
</style>