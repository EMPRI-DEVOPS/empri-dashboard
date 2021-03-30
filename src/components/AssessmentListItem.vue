<template>
  <div class="col-md-7">
    <div class="card shadow-sm text-center">
      <div class="card-body">
        <h5 class="card-title">{{ tool }}</h5>
      </div>
      <div class="card-body">
        <router-link
          class="btn btn-sm btn-outline-secondary"
          :to="{ name: 'Account', params: { id: id } }"
          >See</router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AccountListItem",
  props: ["tool", "id"],
};
</script>