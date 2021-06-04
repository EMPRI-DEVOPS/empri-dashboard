<template>
  <div v-for="tool in accountTypes" class="col-sm-4" :key="tool.id">
    <add-account-button
      :tool="tool.name"
      @click="add(tool.name)"
      :unavailable="toolIsPending(tool.name)"
    />
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import AddAccountButton from "../components/AddAccountButton";
import {accountTypes} from '../const'

export default {
  components: { AddAccountButton },
  setup() {
    const store = useStore();
    const error = ref("");
    const pendingAccountTypes = computed(
      () => store.getters.pendingAccountTypes
    );
    return {
      accountTypes,
      error,
      add: (name) => {
        store.dispatch("createAccount", name);
      },
      toolIsPending: (toolName) => pendingAccountTypes.value.includes(toolName),
    };
  },
};
</script>