import {
    ref,
    computed
} from "vue";
import {
    getAccounts
} from "../api/accounts";

export default function useAccounts() {
    const accounts = ref([]);
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
        enabledGithubAccounts: computed(() => {
            return accounts.value
                .filter((account) => account.tool == "Github")
                .filter((account) => account.credentials)
        }),
    };
}