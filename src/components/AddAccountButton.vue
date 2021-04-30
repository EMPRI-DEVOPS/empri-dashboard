<template>
  <div class="card">
    <div class="card-body text-center">
      <h6 class="card-title">{{ tool }}</h6>
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
export default {
  props: {
    tool: {
      type: String,
      default: "",
      required: true,
    },
  },
};
</script>