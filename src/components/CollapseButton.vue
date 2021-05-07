<template>
  <button
    class="btn btn-ouline-secondary pt-0 shadow-none"
    data-bs-toggle="collapse"
  >
    <minus-icon />
  </button>
</template>

<script>
import MinusIcon from "./icons/MinusIcon.vue";

export default {
  components: { MinusIcon },
};
</script>