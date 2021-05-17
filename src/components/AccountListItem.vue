<template>
  <div class="card shadow-sm">
    <div class="card-body">
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
      <a
        v-if="github_auth_link && !credentials"
        class="btn btn-outline-primary"
        :href="github_auth_link"
        >Github Login
      </a>
    </div>
    <div class="card-footer d-flex flex-row-reverse">
      <transition name="fade" mode="out-in">
        <div v-if="!confirmDelete">
          <span class="text-muted p-2">Created at: {{ createdAt }}</span>
          <button class="btn btn-outline-danger" @click="confirmDelete = true">
            Delete
          </button>
        </div>
        <div v-else>
          <span class="text-muted p-2">Are you sure?</span>
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
      </transition>
    </div>
  </div>
</template>

<script>
import { toRef, ref } from "vue";
import { useStore } from "vuex";
import TaigaLogin from "./TaigaLogin.vue";
import TaigaLogo from "./icons/TaigaLogo";
import GithubIcon from "./icons/GithubIcon";
import MattermostLogo from "./icons/MattermostLogo";

export default {
  components: { TaigaLogin, GithubIcon, TaigaLogo, MattermostLogo },
  name: "AccountListItem",
  props: [
    "id",
    "tool",
    "credentials",
    "username",
    "instance_url",
    "github_auth_link",
    "created_at",
  ],
  setup(props) {
    const store = useStore();
    const dateProp = toRef(props, "created_at");
    const id = toRef(props, "id").value;
    const dateObj = new Date(dateProp.value);
    const createdAt = dateObj.toLocaleString("en-US");

    const deleteAccount = () => {
      store.dispatch("deleteAccount", id);
    };

    return {
      createdAt,
      deleteAccount,
      confirmDelete: ref(false),
    };
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>