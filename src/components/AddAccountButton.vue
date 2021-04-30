<template>
  <div class="card">
    <div class="card-body text-center shadow-sm">
      <h6 class="card-title">
        <github-icon v-if="tool == 'Github'" />
        <taiga-logo v-if="tool == 'Taiga'" />
        <mattermost-logo v-if="tool == 'Mattermost'" />
        {{ tool }}
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