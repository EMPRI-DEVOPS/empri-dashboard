<template>
  <label class="form-label p-2">Event type filters:</label>
  <div
    v-for="eventType of eventTypes"
    class="form-check form-check-inline"
    :key="eventType.type"
  >
    <input
      class="form-check-input"
      type="checkbox"
      :id="`p`+eventType.type"
      :checked="eventTypeFilters.find((type) => type.type === eventType.type)"
      @change="toggleFilter(eventType.type)"
    />
    <label class="form-check-label" :for="`p`+eventType.type">{{
      formatTypeName(eventType.type)
    }}</label>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
export default {
  setup() {
    const store = useStore();
    const eventTypeFilters = computed(
      () => store.state.assessment.events.filters
    );
    const githubEventTypes = require("../common").githubEventTypes;
    const formatTypeName = (type) => githubEventTypes.find((eventType) => eventType.type === type).name;

    const eventTypes = computed(() =>
      store.getters["assessment/events/types"].map((type) => ({ type }))
    );
    const toggleFilter = (type) =>
      store.commit("assessment/events/TOGGLE_TYPE_FILTER", type);

    return {
      eventTypes,
      toggleFilter,
      eventTypeFilters,
      formatTypeName
    };
  },
};
</script>