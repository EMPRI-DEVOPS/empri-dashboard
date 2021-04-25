<template>
  <div class="col-md-7">
    <card :title="`${account.tool} Acount`">
      <template v-slot:header>
        <span v-if="credentials" class="badge rounded-pill bg-success">
          Activated
        </span>
      </template>
      <table class="table table-borderless table-hover">
        <tbody>
          <tr v-if="username">
            <th style="width: 20%">Username</th>
            <td>{{ username }}</td>
          </tr>
          <tr v-if="instanceUrl">
            <th>URL</th>
            <td>{{ instanceUrl }}</td>
          </tr>
        </tbody>
      </table>
      <template v-slot:footer>
        <div class="btn-group">
          <router-link
            class="btn btn-sm btn-outline-secondary"
            :to="{ name: 'Account', params: { id: account.id } }"
            >Detail</router-link
          >
        </div>
      </template>
    </card>
  </div>
</template>

<script>
import Card from "./Card.vue";
export default {
  components: { Card },
  name: "AccountListItem",
  props: ["account"],
  computed: {
    username() {
      return this.account.username;
    },
    instanceUrl() {
      return this.account.instance_url ?? "";
    },
    credentials() {
      return this.account.credentials;
    },
  }
};
</script>