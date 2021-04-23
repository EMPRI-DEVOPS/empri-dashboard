<template>
  <div class="row row-cols-1 g-4 justify-content-md-center">
    <div class="col-md-7">
      <form v-if="!createdId" @submit.prevent="onSubmit">
        <card :title="`New Account`">
          <span v-if="error">{{ error }}</span>

          <pre v-if="data">{{ data }}</pre>

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
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import Card from "../components/Card.vue";

export default {
  name: "AccountCreate",
  components: { Card },

  data() {
    return {
      selectedTool: "",
      tools: [
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
      ],
      createdId: null,
      data: null,
      error: "",
    };
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
          this.createdId = response.data.id;
          if (this.createdId) {
            this.$router.push({
              name: "Account",
              params: { id: this.createdId },
            });
          }
          this.data = response.data;
        })
        .catch((error) => {
          this.error = error.response.data.detail;
          this.data = error.response.data;
        });
    },
  },
  mounted() {},
};
</script>