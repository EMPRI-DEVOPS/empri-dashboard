<template>
  <form @submit.prevent="processForm" class="needs-validation" novalidate>
    <div v-show="errors.request" class="alert alert-warning alert-dismissible">
      {{ errors.request }}
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        @click="hideError"
      />
    </div>
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
        <div class="invalid-feedback">{{ errors.url }}</div>
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
      <label for="password" class="col-sm-3 col-form-label"> Password: </label>
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
</template>

<script>
import Cookies from "js-cookie";

export default {
  name: "TaigaLogin",
  props: ["id"],
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
    hideError() {
      this.errors.request = "";
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
      this.errors.url = this.isValidUrl(this.url) ? "" : "Not a valid URL";
      this.errors.username = !this.username;
      this.errors.password = !this.password;
      this.errors.request = "";
      if (!Object.keys(this.errors).every((k) => !this.errors[k])) {
        return;
      }
      const csrftoken = Cookies.get("csrftoken");

      this.$http({
        url: "/api/account/" + this.id + "/taiga_auth",
        method: "post",
        headers: { "X-CSRFToken": csrftoken },
        data: {
          url: this.url,
          username: this.username,
          password: this.password,
        },
      })
        .then(() => {
          this.$emit("authenticated");
          //this.response =  JSON.stringify(JSON.parse(response.data), null, 2);
          //JSON.stringify(JSON.parse(value), null, 2);
        })
        .catch((error) => {
          console.log(error);
          if (error.response.data.url) {
            this.errors.url = error.response.data.url;
          }
          const message = error.response.data[0];
          this.errors.request = message;
        });
    },
  },
};
</script>

<style scoped>
</style>