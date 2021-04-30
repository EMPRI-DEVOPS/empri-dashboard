<template>
  <card>
    <h5 class="card-title d-flex justify-content-between mb-3">
      <span>
        <github-icon v-if="tool == 'Github'" />
        <taiga-logo v-if="tool == 'Taiga'" />
        <mattermost-logo v-if="tool == 'Mattermost'" />
        {{ `${tool} Account` }}
      </span>
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
      <div v-show="!confirmDelete" class="btn-group">
        <button class="btn btn-outline-danger" @click="confirmDelete = true">
          Delete
        </button>
      </div>
      <div v-show="confirmDelete">
        Are you sure?
        <div class="btn-group">
        <button class="btn btn-outline-danger" @click="deleteAccount">
          Delete
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="confirmDelete = false"
        >
          Cancel
        </button>
        </div>
      </div>
    </template>
  </card>
</template>

<script>
import Card from "./Card.vue";
import TaigaLogin from "./TaigaLogin.vue";
import TaigaLogo from "./icons/TaigaLogo";
import GithubIcon from "./icons/GithubIcon";
import MattermostLogo from "./icons/MattermostLogo";
import { deleteAccount } from "../api/accounts";

export default {
  components: { Card, TaigaLogin, GithubIcon, TaigaLogo, MattermostLogo },
  name: "AccountListItem",
  props: ["id", "tool", "credentials", "username", "instance_url"],
  data() {
    return {
      confirmDelete: false,
    };
  },
  methods: {
    deleteAccount() {
      deleteAccount(this.id).then(() => {
        this.$emit("deleted");
      });
    },
  },
};
</script>