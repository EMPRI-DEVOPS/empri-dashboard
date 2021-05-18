<template>
  <div v-for="tool in tools" class="col-sm-4" :key="tool.id">
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

export default {
  components: { AddAccountButton },
  //emits: ["account-added"],
  setup() {
    const store = useStore();
    const error = ref("");
    const tools = computed(() => store.state.accounts.accountTypes);
    const pendingAccountTypes = computed(
      () => store.getters.pendingAccountTypes
    );
    return {
      tools,
      error,
      add: (name) => {
        store.dispatch("createAccount", name);
      },
      toolIsPending: (toolName) => pendingAccountTypes.value.includes(toolName),
    };
  },
};
</script>