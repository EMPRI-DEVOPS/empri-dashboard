<template>
  <div>
    <div class="container mb-3">
      <div
        v-if="!enabledGithubAccounts.length"
        class="row justify-content-center"
      >
        <div v-if="!enabledGithubAccounts.length" class="card col-lg-5">
          <div class="card-body">
            <router-link to="accounts"
              >Connect your Github account to get started..
            </router-link>
          </div>
        </div>
      </div>
      <div v-else class="card shadow-sm">
        <div class="card-body">
          <form @submit.prevent="start">
            <div class="row g-4">
              <div class="col-12">
                <div class="row mb-3">
                  <label for="username" class="col-sm-5 col-form-label"
                    >Github Username
                  </label>
                  <div class="col-sm-7">
                    <input
                      name="username"
                      v-model="githubUsername"
                      :disabled="pullingData"
                      class="form-control"
                    />
                  </div>
                </div>
                <div class="row mb-3">
                  <label for="from" class="col-sm-5 col-form-label">From</label>
                  <div class="col-sm-7">
                    <input
                      name="from"
                      type="date"
                      class="form-control"
                      v-model="from"
                      :disabled="pullingData"
                      :max="to"
                    />
                  </div>
                </div>
                <div class="row">
                  <label for="to" class="col-sm-5 col-form-label">To</label>
                  <div class="col-sm-7">
                    <input
                      name="to"
                      type="date"
                      class="form-control"
                      v-model="to"
                      :disabled="pullingData"
                      :max="today"
                      :min="from"
                    />
                  </div>
                </div>
              </div>
              <div class="col-12 align-self-center">
                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-lg btn-outline-secondary"
                    :disabled="pullingData"
                  >
                    <span v-if="pullingData">
                      <span
                        class="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      >
                      </span>
                      Pulling data..</span
                    ><span v-else><play-icon /> Start</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="container-fluid" v-if="pullingData">
      <div class="row justify-content-center">
        <div class="col-md-7 col-xl-5">
          <div class="card">
            <div class="card-body m-2 p-4">
              <div class="d-flex align-items-center">
                <samp>{{ statusMessage }}</samp>
                <div
                  class="spinner-border ms-auto"
                  role="status"
                  aria-hidden="true"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-fluid" v-if="createdAssessment">
      <div id="assessment" class="row g-2">
        <transition-group name="chart-list">
          <div
            v-for="chart in charts"
            :key="chart + assessmentKey"
            class="col-xl-6"
          >
            <component
              :is="chart"
              :from="from"
              :to="to"
              :githubUsername="githubUsername"
            ></component>
          </div>
        </transition-group>
      </div>
      <div class="row my-2">
        <div class="col">
          <button
            @click="pdf"
            type="submit"
            class="btn btn-lg btn-outline-secondary"
            :disabled="creatingPdf"
          >
            <span v-if="creatingPdf">
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              >
              </span>
              Rendering PDF..</span
            ><span v-else> Export to PDF</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, defineAsyncComponent } from "vue";
import { useStore } from "vuex";
import { DateTime } from "luxon";
import { jsPDF } from "jspdf";
import * as html2canvas from "html2canvas";
import PlayIcon from "../components/icons/PlayIcon";
import GithubAccount from "../api/github-account";
import ChartLoader from "../components/charts/ChartLoader";

export default {
  components: {
    Metrics: defineAsyncComponent({
      loadingComponent: ChartLoader,
      loader: () => import("../components/charts/ChartMetrics"),
      delay: 0,
    }),
    EventsByDay: defineAsyncComponent({
      loadingComponent: ChartLoader,
      loader: () => import("../components/charts/ChartEventsByDayLine.vue"),
      delay: 0,
    }),
    EventsByWeek: defineAsyncComponent({
      loadingComponent: ChartLoader,
      loader: () => import("../components/charts/ChartEventsByWeek"),
      delay: 0,
    }),
    GithubRepos: defineAsyncComponent({
      loader: () =>
        import("../components/charts/ChartGithubCommitsPerRepo.vue"),
      loadingComponent: ChartLoader,
      delay: 0,
    }),
    WeekdayChart: defineAsyncComponent({
      loader: () => import("../components/charts/ChartEventsPerWeekday.vue"),
      loadingComponent: ChartLoader,
      delay: 0,
    }),
    TimeWindow: defineAsyncComponent({
      loader: () => import("../components/charts/ChartEventsPerTimeWindow.vue"),
      loadingComponent: ChartLoader,
      delay: 0,
    }),
    WeekdayHeatmap: defineAsyncComponent({
      loader: () => import("../components/charts/ChartWeekdayHeatmap.vue"),
      loadingComponent: ChartLoader,
      delay: 0,
    }),
    DayHourHeatmap: defineAsyncComponent({
      loader: () => import("../components/charts/ChartDayHourHeatmap.vue"),
      loadingComponent: ChartLoader,
      delay: 0,
    }),
    PlayIcon,
  },
  name: "Assessment",
  setup() {
    const store = useStore();
    store.dispatch("loadUser");
    store.dispatch("loadAccounts");
    const now = DateTime.fromObject({ zone: store.getters.timeZone });
    const charts = ref([]);
    const assessmentKey = ref(0);
    const creatingPdf = ref(false);
    return {
      enabledGithubAccounts: computed(
        () => store.getters.enabledGithubAccounts
      ),
      from: ref(now.minus({ year: 1 }).toISODate()),
      today: now.toISODate(),
      to: ref(now.toISODate()),
      githubUsername: ref(""),
      statusMessage: ref(""),
      pullingData: ref(false),
      createdAssessment: ref(false),
      charts,
      assessmentKey,
      creatingPdf,
    };
  },
  methods: {
    async start() {
      this.charts = [];
      this.assessmentKey++;
      this.$store.commit("resetUserInteractions");
      this.createdAssessment = false;
      this.pullingData = true;

      this.enabledGithubAccounts.forEach(async (githubAccount) => {
        let account = new GithubAccount(githubAccount);
        account.username = this.githubUsername =
          this.githubUsername || account.username;
        for await (const loaded of account.loadRepositoriesContributedTo()) {
          this.statusMessage = `Found ${loaded.loadedCount}/${loaded.totalCount} repos where ${this.githubUsername} has contributed to..`;
        }
        for await (const found of account.userIssues(this.from, this.to)) {
          this.statusMessage = `Loaded ${found.loadedCount}/${found.totalCount} published issues`;
        }
        for await (const found of account.loadCommits(this.from, this.to)) {
          this.statusMessage = `Found ${found.foundCount} commits in ${found.repo}`;
        }
        this.statusMessage = "";
        this.createdAssessment = true;
        this.pullingData = false;
        this.charts.push("Metrics");
        await new Promise((res) => setTimeout(res, 500));
        this.charts.push("GithubRepos");
        await new Promise((res) => setTimeout(res, 500));
        this.charts.push("EventsByDay");
        await new Promise((res) => setTimeout(res, 500));
        this.charts.push("EventsByWeek");
        await new Promise((res) => setTimeout(res, 500));
        this.charts.push("DayHourHeatmap");
        await new Promise((res) => setTimeout(res, 500));
        this.charts.push("WeekdayHeatmap");
        await new Promise((res) => setTimeout(res, 500));
        this.charts.push("WeekdayChart");
        await new Promise((res) => setTimeout(res, 500));
        this.charts.push("TimeWindow");
      });
    },
    async pdf() {
      this.creatingPdf = true;
      await new Promise((res) => setTimeout(res, 50));
      let promises = [];
      for (const chart of document.getElementsByClassName("chart-card")) {
        promises.push(
          html2canvas(chart, {
            scrollX: 0,
            scrollY: -window.scrollY,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
          })
        );
      }
      Promise.all(promises).then((data) => {
        let pdf = new jsPDF();
        let y = 20;
        const margin = 40;
        for (const canvas of data) {
          //let pdfImage = canvas.toDataURL("image/jpeg", 1);
          let pdfImage = canvas.toDataURL("image/jpeg", 1);

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const imgProps = pdf.getImageProperties(pdfImage);
          const ratio = imgProps.height / imgProps.width;
          const targetImgWidth = pdfWidth - margin;
          const targetImgHeight = ratio * pdfWidth - margin * ratio;
          if (y + targetImgHeight + 5 > pdfHeight) {
            pdf.addPage();
            y = 20;
          }
          pdf.addImage(
            pdfImage,
            "JPEG",
            20,
            y,
            targetImgWidth,
            targetImgHeight
          );
          y += targetImgHeight + 5;
        }
        pdf.save(this.githubUsername + DateTime.now().toISO());
        this.creatingPdf = false;
      });
    },
  },
};
</script>