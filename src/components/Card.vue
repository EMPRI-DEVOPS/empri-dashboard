<template>
  <div class="card shadow-sm account-list-item">
    <div class="card-header text-center">
      <h5 v-if="title" class="card-title">{{ title }}</h5>
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div class="card-footer text-center">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ["title"],
};
</script>