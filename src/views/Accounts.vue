<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <h5>
          <router-link to="/" class="btn btn-outline-secondary m-1"
            ><arrow-left
          /></router-link>
          <span class="m-1">User Account Settings</span
          ><span class="m-1" v-if="loadingAccounts"> Loading..</span>
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
              />
            </div>
          </transition-group>
          <account-create />
        </div>
      </div>
      <div class="col-xl-5">
        <div class="row g-4">
          <div>
            <update-day-time-ranges v-if="settingsLoaded" />
          </div>
          <div>
            <update-password />
          </div>
          <div>
            <update-timezone />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { ref, computed } from "vue";
import AccountListItem from "../components/AccountListItem.vue";
import AccountCreate from "../components/AccountCreate.vue";
import UpdatePassword from "../components/UpdatePassword";
import UpdateTimezone from "../components/UpdateTimezone";
import UpdateDayTimeRanges from "../components/UpdateDayTimeRanges";
import ArrowLeft from "../components/icons/ArrowLeft.vue";

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
    const settingsLoaded = ref(false);
    const loadingAccounts = ref(true);
    const accounts = computed(() => store.state.accounts.all);
    store.dispatch("loadUser").then(() => (settingsLoaded.value = true));
    store.dispatch("loadAccounts").then(() => (loadingAccounts.value = false));
    return { accounts, loadingAccounts, settingsLoaded };
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