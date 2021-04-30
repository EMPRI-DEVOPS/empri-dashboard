<template>
  <div class="container">
    <span v-if="loading">Loading..</span>
    <div class="row row-cols-1 g-4">
      <h5>User Account Settings</h5>
      <div v-for="account in accounts" :key="account.id" class="col-lg-7">
        <account-list-item
          v-bind="account"
          @deleted="fetchAccounts"
          @authenticated="fetchAccounts"
        />
      </div>
      <div class="col-lg-7">
        <account-create @created="fetchAccounts" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import AccountListItem from "../components/AccountListItem.vue";
import AccountCreate from "../components/AccountCreate.vue";
import { getAccounts } from "../api/accounts";
export default {
  components: { AccountListItem, AccountCreate },
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