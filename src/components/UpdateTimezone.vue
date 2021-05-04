<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <h5 class="card-title mb-3">Update timezone</h5>
      <pre>{{ time_zone }}</pre>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: ["username", "time_zone", "date_joined"],
  setup() {},
});
</script>
