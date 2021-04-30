<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title mb-3">Update password</h5>
      <form method="post" @submit.prevent="updatePassword">
        <div class="row mb-3">
          <label for="old_password" class="col-sm-3 col-form-label"
            >Old Password</label
          >
          <div class="col-sm-9">
            <input
              name="old_password"
              type="password"
              class="form-control"
              id="old_password"
              v-model="old_password"
              required
            />
          </div>
          {{ errors.old_password }}
        </div>
        <div class="row mb-3">
          <label for="password1" class="col-sm-3 col-form-label"
            >Password</label
          >
          <div class="col-sm-9">
            <input
              name="password1"
              type="password"
              class="form-control"
              id="password1"
              v-model="password1"
              required
            />
          </div>
          {{ errors.password1 }}
        </div>
        <div class="row mb-4">
          <label for="password2" class="col-sm-3 col-form-label"
            >Password confirmation</label
          >
          <div class="col-sm-9">
            <input
              name="password2"
              type="password"
              class="form-control"
              id="password2"
              v-model="password2"
              required
            />
          </div>
          {{ errors.password2 }}
        </div>
        <button class="btn btn-outline-secondary" type="submit">Submit</button>
      </form>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    return {
      old_password: ref(""),
      password1: ref(""),
      password2: ref(""),
      errors: ref([]),
    };
  },
});
</script>
