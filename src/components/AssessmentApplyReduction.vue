<template>
  <label class="form-label p-2">Apply timestamp reduction:</label>
  <div class="btn-group">
    <button
      class="btn btn-outline-secondary"
      :disabled="reductionApplied >= 3 || loading"
      @click="applyReduction(3)"
    >
      Months
    </button>
    <button
      class="btn btn-outline-secondary"
      :disabled="reductionApplied >= 2 || loading"
      @click="applyReduction(2)"
    >
      Weeks
    </button>
    <button
      class="btn btn-outline-secondary"
      :disabled="reductionApplied >= 1 || loading"
      @click="applyReduction(1)"
    >
      Days
    </button>
    <button
      class="btn btn-outline-secondary"
      v-if="reductionApplied > 0 || loading"
      @click="applyReduction(0)"
    >
      Reset
    </button>
  </div>
  <span v-show="loading">
    <span class="p-2">Applying...</span>
    <span
      class="spinner-border spinner-border-sm"
      role="status"
      aria-hidden="true"
    >
    </span>
  </span>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";
export default {
  setup() {
    const store = useStore();
    const loading = ref(false);
    const reductionApplied = computed(
      () => store.state.assessment.events.reductionLevel
    );
    const applyReduction = async (level) => {
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 20));
      await store.dispatch("assessment/events/applyReduction", level);
      loading.value = false;
    };

    return {
      loading,
      reductionApplied,
      applyReduction,
    };
  },
};
</script>