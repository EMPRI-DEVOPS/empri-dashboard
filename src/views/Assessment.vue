<template>
  <div>
    <assessment-creator />
    <div class="container-fluid" v-if="createdAssessment">
      <div class="row">
        <div class="col">
          <label class="form-label p-2">Event type filters:</label>
          <div
            v-for="eventType of eventTypes"
            class="form-check form-check-inline"
            :key="eventType.type"
          >
            <input
              class="form-check-input"
              type="checkbox"
              id="eventType.type"
              value="eventType.type"
              :checked="
                eventTypeFilters.find((type) => type.type === eventType.type)
              "
              @change="toggleFilter(eventType.type)"
            />
            <label class="form-check-label" for="inlineCheckbox1">{{
              eventType.type
            }}</label>
          </div>
        </div>
      </div>
      <div id="assessment" class="row g-2">
        <transition-group name="chart-list">
          <div v-for="chart in charts" :key="chart" class="col-xl-6">
            <component :is="chart"></component>
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
import { ref, defineAsyncComponent, computed, watchEffect } from "vue";
import { useStore } from "vuex";
import { DateTime } from "luxon";
import { jsPDF } from "jspdf";
import * as html2canvas from "html2canvas";
import Multiselect from "vue-multiselect";
import ChartLoader from "../components/charts/ChartLoader";
import AssessmentCreator from "../components/AssessmentCreator";

export default {
  components: {
    AssessmentCreator,
    Multiselect,
    TypeDonut: defineAsyncComponent({
      loadingComponent: ChartLoader,
      loader: () => import("../components/charts/ChartTypeDonut"),
      delay: 0,
    }),
    Metrics: defineAsyncComponent({
      loadingComponent: ChartLoader,
      loader: () => import("../components/charts/ChartMetrics"),
      delay: 0,
    }),
    EventsOverTime: defineAsyncComponent({
      loadingComponent: ChartLoader,
      loader: () => import("../components/charts/ChartEventsOverTime.vue"),
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
  },
  name: "Assessment",
  setup() {
    const store = useStore();
    const charts = ref([]);
    const creatingPdf = ref(false);
    const createdAssessment = computed(() => store.getters["assessment/done"]);
    const eventTypeFilters = computed(
      () => store.state.assessment.events.filters
    );
    const eventTypes = computed(() =>
      store.getters["assessment/events/types"].map((type) => ({ type }))
    );
    const toggleFilter = (type) =>
      store.commit("assessment/events/TOGGLE_TYPE_FILTER", type);
    const graphs = [
      "TypeDonut",
      "GithubRepos",
      "DayHourHeatmap",
      "WeekdayHeatmap",
      "EventsOverTime",
      "WeekdayChart",
      "TimeWindow",
      "Metrics",
    ];
    watchEffect(async () => {
      if (createdAssessment.value) {
        for (const graphName of graphs) {
          charts.value.push(graphName);
          await new Promise((res) => setTimeout(res, 500));
        }
      } else {
        charts.value = [];
      }
    });

    return {
      createdAssessment,
      charts,
      creatingPdf,
      eventTypes,
      eventTypeFilters,
      toggleFilter,
    };
  },
  methods: {
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