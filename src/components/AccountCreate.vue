<template>
  <form @submit.prevent="onSubmit">
    <card>
      <h6 class="card-title d-flex justify-content-between align-items center">
        New Account
        <button
          type="button"
          class="btn-close pull-right"
          aria-label="Close"
          @click="$emit('closed')"
        ></button>
      </h6>
      <span v-if="error">{{ error }}</span>

      <div class="row mb-3">
        <label for="tool" class="col-sm-3 col-form-label">Tool</label>
        <div class="col-sm-9">
          <select
            id="tool"
            name="tool"
            v-model="selectedTool"
            class="form-control"
            :class="{ 'is-invalid': error }"
            required
          >
            <option disabled value="">Select a Tool</option>
            <option v-for="tool in tools" :key="tool.id">
              {{ tool.name }}
            </option>
          </select>
          <div class="invalid-feedback">Please select a tool</div>
        </div>
      </div>

      <template v-slot:footer>
        <div class="btn-group">
          <button
            :disabled="!selectedTool"
            class="btn btn-outline-secondary"
            title="Add Account"
            data-original-title="Add Account"
          >
            Add
          </button>
        </div>
      </template>
    </card>
  </form>
</template>

<script>
import Cookies from "js-cookie";
import Card from "../components/Card.vue";
import { ref } from "vue";

export default {
  name: "AccountCreate",
  components: { Card },

  setup() {
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
    return { tools, selectedTool, error };
  },
  methods: {
    onSubmit() {
      const csrftoken = Cookies.get("csrftoken");
      this.$http({
        url: "/api/account",
        method: "POST",
        headers: { "X-CSRFToken": csrftoken },

        data: {
          tool: this.selectedTool,
        },
      })
        .then((response) => {
          if (response.data.id) {
            this.$emit("created");
          }
        })
        .catch((error) => {
          this.error = error.response.data.detail;
        });
    },
  },
};
</script>