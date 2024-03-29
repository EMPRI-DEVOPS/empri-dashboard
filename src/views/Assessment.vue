<template>
  <div>
    <assessment-creator v-show="!createdAssessment" />
    <div class="container-fluid" v-if="createdAssessment">
      <div class="row">
        <div class="col-lg-6">
          <assessment-post-filters />
        </div>
        <div class="col-lg-6">
          <assessment-apply-reduction />
        </div>
      </div>
      <div id="assessment" class="row g-2">
        <transition-group name="chart-list">
          <component
            v-for="chart in charts"
            :key="chart"
            :is="chart"
          ></component>
        </transition-group>
      </div>
      <div class="d-flex flex-row justify-content-between my-2">
        <pdf-creator />
        <button @click="startNew" class="btn btn-lg btn-outline-secondary">
          <icon-repeat />
          Start new
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, defineAsyncComponent, computed, watch } from "vue";
import { useStore } from "vuex";

import ChartLoader from "../components/charts/ChartLoader";
import AssessmentCreator from "../components/AssessmentCreator";
import AssessmentPostFilters from "../components/AssessmentPostFilters.vue";
import AssessmentApplyReduction from "../components/AssessmentApplyReduction.vue";
import IconRepeat from "../components/icons/IconRepeat.vue";

export default {
  components: {
    AssessmentCreator,
    IconRepeat,
    AssessmentPostFilters,
    AssessmentApplyReduction,
    PdfCreator: defineAsyncComponent({
      loader: () => import("../components/AssessmentPdfCreator.vue"),
    }),
    RawData: defineAsyncComponent({
      loadingComponent: ChartLoader,
      loader: () => import("../components/charts/ChartRawData.vue"),
      delay: 0,
    }),
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
    /*
    TimeWindow: defineAsyncComponent({
      loader: () => import("../components/charts/ChartEventsPerTimeWindow.vue"),
      loadingComponent: ChartLoader,
      delay: 0,
    }),
    */
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
    const startNew = () => store.commit("assessment/NEW");
    const createdAssessment = computed(() => store.getters["assessment/done"]);
    const graphs = [
      "TypeDonut",
      "GithubRepos",
      "DayHourHeatmap",
      "WeekdayHeatmap",
      "RawData",
      "EventsOverTime",
      "WeekdayChart",
      //"TimeWindow",
      "Metrics",
    ];
    watch(createdAssessment, async () => {
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
      startNew,
      charts,
    };
  },
};
</script>