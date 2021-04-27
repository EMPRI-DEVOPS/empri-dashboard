<template>
  <div class="container">
    <span v-if="loading">Loading..</span>
    <span v-if="error">Error!</span>
    <div class="row row-cols-1 g-4">
      <h5>User Account Settings</h5>
      <div v-for="account in accounts" :key="account.id" class="col-lg-7">
        <account-list-item :account="account" @deleted="fetchAccounts" />
      </div>
      <div class="col-lg-7" v-show="accountCreate">
        <account-create
          @closed="accountCreate = !accountCreate"
          @created="
            fetchAccounts();
            accountCreate = false;
          "
        />
      </div>
      <button
        v-show="!accountCreate"
        class="col-lg-7 btn bg-white btn-outline-secondary"
        @click="accountCreate = !accountCreate"
      >
        Add Account
      </button>
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
    const setAccounts = (val) => (accounts.value = val);
    return {
      accounts,
      setAccounts,
      loading: ref(false),
      error: ref(false),
      accountCreate: ref(false),
    };
  },
  beforeRouteEnter(to, from, next) {
    getAccounts(to.params.id)
      .then((accounts) => {
        next((vm) => vm.setAccounts(accounts));
      })
      .catch(() => window.location.replace("/auth/login/"));
  },
  methods: {
    fetchAccounts() {
      this.loading = true;
      getAccounts()
        .then((accounts) => {
          this.setAccounts(accounts);
        })
        .catch((error) => {
          //falls ein auth error kommt den nutzer zur loginseite umleiten
          this.error = true;
          console.log(error);
        })
        .finally(() => (this.loading = false));
    },
  },
};
</script>