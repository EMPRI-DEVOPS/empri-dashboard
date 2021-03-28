<template>
  <div class="create-account">
    <div class="container">
      <h1>New Account</h1>

      <form v-if="!createdId" @submit.prevent="onSubmit">
        <fieldset>
          <div class="form-group">
            <label class="col-sm-2 control-label"> Tool </label>

            <div class="col-sm-3">
              <select v-model="selectedTool" class="form-control" name="tool">
                <option disabled value="">Select a Tool</option>
                <option v-for="tool in tools" :key="tool.id">
                  {{ tool.name }}
                </option>
              </select>
            </div>
          </div>
          <br />

          <div class="form-actions">
            <button
              :disabled="!selectedTool"
              class="btn btn-primary"
              title=""
              data-original-title="Add Account"
            >
              Add
            </button>
          </div>
        </fieldset>
      </form>

      <h3 v-if="createdId">Success!</h3>
      <span v-if="error">{{ error }}</span>

      <pre v-if="data">{{ data }}</pre>
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";

export default {
  name: "AccountCreate",
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
        url: "/api/account/",
        method: "POST",
        headers: { "X-CSRFToken": csrftoken },

        data: {
          tool: this.selectedTool,
        },
      })
        .then((response) => {
          this.createdId = response.data.id;
          this.$router.push({ name: 'Account', params: { id: this.createdId } });
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