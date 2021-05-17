<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <h5>
          <router-link to="/" class="btn btn-outline-secondary m-1"
            ><arrow-left
          /></router-link>
          <span class="m-1">User Account Settings</span
          ><span class="m-1" v-if="loading"> Loading..</span>
        </h5>
      </div>
    </div>
    <div class="row mb-5 g-4 pt-0 mt-0">
      <div class="col-xl-7">
        <div class="row g-4">
          <transition-group name="list">
            <div v-for="account in accounts" :key="account.id">
              <account-list-item
                v-bind="account"
                @deleted="fetchAccounts"
                @authenticated="fetchAccounts"
              />
            </div>
          </transition-group>
          <account-create @account-added="fetchAccounts" />
        </div>
      </div>
      <div class="col-xl-5">
        <div class="row g-4">
          <div>
            <update-day-time-ranges v-if="user.day_time_ranges" />
          </div>
          <div>
            <update-password />
          </div>
          <div>
            <update-timezone v-if="user.time_zone" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";
import AccountListItem from "../components/AccountListItem.vue";
import AccountCreate from "../components/AccountCreate.vue";
import UpdatePassword from "../components/UpdatePassword";
import UpdateTimezone from "../components/UpdateTimezone";
import UpdateDayTimeRanges from "../components/UpdateDayTimeRanges";
import { getAccounts } from "../api/accounts";
import ArrowLeft from "../components/icons/ArrowLeft.vue";
import useAccounts from "../composables/useAccounts";

export default {
  components: {
    AccountListItem,
    AccountCreate,
    UpdatePassword,
    UpdateTimezone,
    UpdateDayTimeRanges,
    ArrowLeft,
  },
  setup() {
    const store = useStore();
    store.dispatch("loadUser");
    return { ...useAccounts(), user: computed(() => store.state.user.settings) };
  },
  beforeRouteEnter(to, from, next) {
    getAccounts(to.params.id)
      .then((accounts) => {
        next((vm) => vm.setAccounts(accounts));
      })
      .catch(() => window.location.replace("/auth/login/"));
  },
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(200px);
}
</style>