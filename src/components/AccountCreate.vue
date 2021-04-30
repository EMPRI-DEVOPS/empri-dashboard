<template>
  <div v-for="tool in tools" class="col-sm-4" :key="tool.id">
    <add-account-button :tool="tool.name" @click="add(tool.name)" />
  </div>
</template>

<script>
import { ref } from "vue";
import { createAccount } from "../api/accounts";
import AddAccountButton from "../components/AddAccountButton";

export default {
  name: "AccountCreate",
  components: { AddAccountButton },
  emits: ["account-added"],
  setup(props, { emit }) {
    const selectedTool = ref("");
    const error = ref("");
    const tools = [
      {
        id: 1,
        name: "Taiga",
      },
      {
        id: 2,
        name: "Github",
      },
      {
        id: 3,
        name: "Mattermost",
      },
    ];
    const add = (name) => {
      createAccount(name)
        .then(() => {
          emit("account-added");
        })
        .catch(() => (error.value = "Error"));
    };
    return { tools, selectedTool, error, add };
  },
};
</script>