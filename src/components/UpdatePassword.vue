<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <h5 class="card-title mb-3">Update password</h5>
      <form
        @submit.prevent="updatePassword"
        class="needs-validation"
        novalidate
      >
        <div v-show="successBanner" class="alert alert-success alert-dismissible">
          Password changed successfully!
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="successBanner = false"
          />
        </div>
        <div v-for="(error, index) in errors.non_field_errors" :key="index">
          {{ error }}
        </div>
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
              :class="{ 'is-invalid': errors.old_password }"
              required
            />
            <div class="invalid-feedback">
              <span v-for="(error, index) in errors.old_password" :key="index"
                >{{ error }}
              </span>
            </div>
          </div>
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
              :class="{ 'is-invalid': errors.new_password1 }"
              required
            />
            <div class="invalid-feedback">
              <span v-for="(error, index) in errors.new_password1" :key="index"
                >{{ error }}
              </span>
            </div>
          </div>
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
              :class="{ 'is-invalid': errors.new_password2 }"
              required
            />
            <div class="invalid-feedback">
              <span v-for="(error, index) in errors.new_password2" :key="index"
                >{{ error }}
              </span>
            </div>
          </div>
        </div>
        <button class="btn btn-outline-secondary" type="submit">Submit</button>
      </form>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { changePassword } from "../api/auth";

export default defineComponent({
  setup() {
    const old_password = ref("");
    const password1 = ref("");
    const password2 = ref("");
    const errors = ref({});
    const successBanner = ref(false);
    const updatePassword = () => {
      changePassword(old_password.value, password1.value, password2.value)
        .then(() => {
          errors.value = {};
          old_password.value = "";
          password1.value = "";
          password2.value = "";
          successBanner.value = true;
        })
        .catch((error) => (errors.value = error.response.data));
    };
    return {
      old_password,
      password1,
      password2,
      errors,
      updatePassword,
      successBanner,
    };
  },
});
</script>
