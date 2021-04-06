<template>
  <div id="app">
    <div>
      <label for="number-of-days"
        >Number of days:
        <input
          name="number-of-days"
          id="number-of-days"
          type="number"
          v-model="days"
        />
      </label>
    </div>
    <form action="#" @submit.prevent="getIssues">
      <div class="form-group">
        <label>
          Github Repo:
          <input
            type="text"
            v-model="repository"
          />
        </label>
      </div>
      <button type="submit">Create graph</button>
    </form>
    <div class="alert alert-info" v-show="loading">Loading...</div>
    <div class="alert alert-danger" v-show="errored">An error occured</div>
    <issue-chart :issues="issues" :days="days" />
  </div>
</template>

<script>
import * as d3 from "d3";
import axios from "axios";
import IssueChart from "@/components/IssueChart.vue";

export default {
  name: "Issues",
  components: {
    IssueChart,
  },
  data() {
    return {
      loading: false,
      errored: false,
      issues: [],
      repository: "",
      now: new Date(),
      days: 6,
    };
  },
  computed: {
    dateRange() {
      return d3.timeDay.range(this.startDate, this.now);
    },
    startDate: function () {
      const date = new Date();
      date.setDate(this.now.getDate() - this.days);
      return date;
    },
  },
  mounted() {},
  methods: {
    getIssues() {
      this.loading = true;
      this.errored = false;
      const created = this.startDate.toISOString().split("T")[0];
      axios
        .get(
          `https://api.github.com/search/issues?q=repo:${this.repository}+is:issue+is:open+created:>=${created}`,
          { params: { per_page: 100 } }
        )
        .then((response) => {
          const payload = this.dateRange.map(function (date) {
            return { day: date.toLocaleDateString(), issues: 0 };
          });
          response.data.items.forEach((item) => {
            const date = new Date(item.created_at);
            const key = date.toLocaleDateString();
            const obj = payload.filter((o) => o.day === key)[0];
            if (obj) {
              obj.issues += 1;
            }
          });
          console.log(payload);

          this.issues = payload;
        })
        .catch((error) => {
          console.error(error);
          this.errored = true;
        })
        .finally(() => (this.loading = false));
    },
  },
};
</script>

<style>
.bar {
  fill: #319bbe;
}
</style>
