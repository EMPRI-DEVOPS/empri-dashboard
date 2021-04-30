<template>
  <card>
    <h5 class="card-title d-flex justify-content-between mb-3">
      {{ `${tool} Account` }}
      <span v-if="credentials" class="badge rounded-pill bg-success">
        Activated
      </span>
    </h5>
    <table class="table table-borderless table-hover">
      <tbody>
        <tr v-if="username">
          <th style="width: 20%">Username</th>
          <td>{{ username }}</td>
        </tr>
        <tr v-if="instance_url">
          <th>URL</th>
          <td>{{ instance_url }}</td>
        </tr>
      </tbody>
    </table>
    <taiga-login
      v-if="tool === 'Taiga' && !credentials"
      :id="id"
      @authenticated="$emit('authenticated')"
    />
    <template v-slot:footer>
      <div class="btn-group">
        <router-link
          class="btn btn-outline-secondary"
          :to="{ name: 'Account', params: { id: id } }"
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
import TaigaLogin from "../components/TaigaLogin.vue";
import { deleteAccount } from "../api/accounts";

export default {
  components: { Card, TaigaLogin },
  name: "AccountListItem",
  props: ["id", "tool", "credentials", "username", "instance_url"],
  methods: {
    deleteAccount() {
      deleteAccount(this.id)
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