<template>
  <label class="form-label p-2">Apply timestamp reduction:</label>
  <div class="btn-group">
    <button
      class="btn btn-outline-secondary"
      :disabled="reductionApplied >= 3"
      @click="applyReduction(3)"
    >
      Months
    </button>
    <button
      class="btn btn-outline-secondary"
      :disabled="reductionApplied >= 2"
      @click="applyReduction(2)"
    >
      Weeks
    </button>
    <button
      class="btn btn-outline-secondary"
      :disabled="reductionApplied >= 1"
      @click="applyReduction(1)"
    >
      Days
    </button>
    <button
      class="btn btn-outline-secondary"
      v-if="reductionApplied > 0"
      @click="applyReduction(0)"
    >
      Reset
    </button>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
export default {
  setup() {
    const store = useStore();
    const reductionApplied = computed(
      () => store.state.assessment.events.reductionLevel
    );
    const applyReduction = (level) =>
      store.dispatch("assessment/events/applyReduction", level);

    return {
      reductionApplied,
      applyReduction,
    };
  },
};
</script>