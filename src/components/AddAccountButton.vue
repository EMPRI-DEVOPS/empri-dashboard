<template>
  <div class="card shadow-sm">
    <div class="card-body text-center">
      <h6 class="card-title">
        <span class="icon p-1">
          <github-icon v-if="tool == 'Github'" />
          <taiga-logo v-if="tool == 'Taiga'" />
          <mattermost-logo v-if="tool == 'Mattermost'" />
        </span>
        <span class="p-1">
          {{ tool }}
        </span>
      </h6>
      <button
        class="btn btn-outline-secondary stretched-link"
        @click="$emit('added')"
      >
        Add Account
      </button>
    </div>
  </div>
</template>

<script>
import GithubIcon from "./icons/GithubIcon.vue";
import TaigaLogo from "./icons/TaigaLogo.vue";
import MattermostLogo from "./icons/MattermostLogo.vue";

export default {
  components: { GithubIcon, TaigaLogo, MattermostLogo },
  props: {
    tool: {
      type: String,
      default: "",
      required: true,
    },
  },
};
</script>