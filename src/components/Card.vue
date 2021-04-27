<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <h6 v-if="title" class="card-title">{{ title }}</h6>
      <slot name="header"></slot>
      <slot />
    </div>
    <div class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
  },
};
</script>