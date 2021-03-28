<template>
  <div class="row m-1 p-2">
    <div class="card text-center account-list-item" style="width: 18rem">
      <div class="card-body">
        <h5 class="card-title">{{ tool }}</h5>
      </div>
      <div class="card-body">
        <router-link
          class="card-link"
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
  props: ["tool", "hasCredentials", "id"],
};
</script>