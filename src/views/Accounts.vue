<template>
  <div class="container">
    <h5>
      <router-link to="/" class="btn btn-outline-secondary"><arrow-left /></router-link>
      User Account Settings<span v-if="loading"> Loading..</span>
    </h5>
    <div class="row g-4 mb-5">
      <div class="col-xl-7 row g-4">
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
      <div class="col-xl-5 row g-4">
        <div class="col">
          <update-password />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import AccountListItem from "../components/AccountListItem.vue";
import AccountCreate from "../components/AccountCreate.vue";
import UpdatePassword from "../components/UpdatePassword";
import { getAccounts } from "../api/accounts";
import ArrowLeft from "../components/icons/ArrowLeft.vue";
export default {
  components: { AccountListItem, AccountCreate, UpdatePassword, ArrowLeft },
  name: "Accounts",

  setup() {
    const accounts = ref();
    const loading = ref(false);
    const setAccounts = (val) => (accounts.value = val);
    const fetchAccounts = () => {
      loading.value = true;
      getAccounts()
        .then((fetchedAccounts) => {
          setAccounts(fetchedAccounts);
        })
        .catch(() => {
          window.location.replace("/auth/login/");
        })
        .finally(() => (loading.value = false));
    };
    return {
      accounts,
      setAccounts,
      loading,
      fetchAccounts,
    };
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