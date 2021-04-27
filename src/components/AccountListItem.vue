<template>
  <card>
    <h5 class="card-title d-flex justify-content-between mb-3">
      {{ `${account.tool} Account` }}
      <span v-if="account.credentials" class="badge rounded-pill bg-success">
        Activated
      </span>
    </h5>
    <table class="table table-borderless table-hover">
      <tbody>
        <tr v-if="account.username">
          <th style="width: 20%">Username</th>
          <td>{{ account.username }}</td>
        </tr>
        <tr v-if="account.instance_url">
          <th>URL</th>
          <td>{{ account.instance_url }}</td>
        </tr>
      </tbody>
    </table>
    <template v-slot:footer>
      <div class="btn-group">
        <router-link
          class="btn btn-outline-secondary"
          :to="{ name: 'Account', params: { id: account.id } }"
          >Detail</router-link
        >
        <button class="btn btn-outline-danger" @click="deleteAccount">
          Delete
        </button>
      </div>
    </template>
  </card>
</template>

<script>
import Card from "./Card.vue";
import { deleteAccount } from "../api/accounts";

export default {
  components: { Card },
  name: "AccountListItem",
  props: ["account"],
  methods: {
    deleteAccount() {
      deleteAccount(this.account.id)
        .then(() => {
          this.$emit("deleted");
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>