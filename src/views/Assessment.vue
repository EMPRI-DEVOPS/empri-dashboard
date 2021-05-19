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
                    <play-icon /> Start
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="container-fluid" v-if="statusMessage">
      <div class="row justify-content-center">
        <div class="col-md-7">
          <div class="card shadow-sm account-list-item">
            <div class="card-header text-center">
              <h5 class="card-title">{{ statusMessage }}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-fluid" v-if="createdAssessment">
      <div id="assessment" class="row g-2 justify-content-xl-center">
        <div :ref="setChartRef" class="col-xl-8">
          <events-by-day-line-chart :from="from" :to="to" />
        </div>
        <div :ref="setChartRef" class="col-xl-6">
          <events-per-weekday-chart />
        </div>
        <div :ref="setChartRef" class="col-xl-6">
          <github-commits-per-repo />
        </div>
        <div :ref="setChartRef" class="col-xl-6">
          <weekday-heatmap :from="from" :to="to" />
        </div>
        <div :ref="setChartRef" class="col-xl-6">
          <day-hour-heatmap />
        </div>
        <div :ref="setChartRef" class="col-xl-6">
          <events-per-time-window-chart />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <button class="btn btn-outline-secondary" @click="pdf">
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { DateTime } from "luxon";
import { jsPDF } from "jspdf";
import * as html2canvas from "html2canvas";
import EventsByDayLineChart from "../components/charts/EventsByDayLineChart.vue";
import EventsPerWeekdayChart from "../components/charts/EventsPerWeekdayChart.vue";
import EventsPerTimeWindowChart from "../components/charts/EventsPerTimeWindowChart.vue";
import GithubCommitsPerRepo from "../components/charts/GithubCommitsPerRepo.vue";
import PlayIcon from "../components/icons/PlayIcon";
import GithubAccount from "../api/github-account";
import WeekdayHeatmap from "../components/charts/WeekdayHeatmap.vue";
import DayHourHeatmap from "../components/charts/DayHourHeatmap.vue";

export default {
  components: {
    EventsByDayLineChart,
    GithubCommitsPerRepo,
    EventsPerWeekdayChart,
    EventsPerTimeWindowChart,
    PlayIcon,
    WeekdayHeatmap,
    DayHourHeatmap,
  },
  name: "Assessment",
  setup() {
    const store = useStore();
    store.dispatch("loadUser");
    store.dispatch("loadAccounts");
    const now = DateTime.fromObject({ zone: store.getters.timeZone });
    let chartRefs = [];
    const setChartRef = (el) => {
      if (el) {
        chartRefs.push(el);
      }
    };
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
      chartRefs,
      setChartRef,
    };
  },
  methods: {
    async start() {
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
        for await (const found of account.loadCommits(this.from, this.to)) {
          this.statusMessage = `Found ${found.foundCount} commits in ${found.repo}`;
        }
        this.statusMessage = "";
        this.createdAssessment = true;
        this.pullingData = false;
      });
    },
    pdf() {
      let promises = [];
      for (const chart of this.chartRefs) {
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
        pdf.save();
      });
    },
  },
};
</script>