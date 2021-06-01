<template>
  <div ref="div" class="card">
    <div class="card-body chart-card">
      <h6 v-if="title" class="card-title"><activity-icon /> {{ title }}</h6>
      <svg :width="width" :height="height" :viewbox="`0 0 ${width} ${height}`">
        <g
          id="events-by-week-chart"
          :transform="`translate(${margin.left}, ${margin.top})`"
        >
          <g class="yAxis" fill="none" text-anchor="end"></g>
          <g
            class="xAxis"
            :transform="`translate(0, ${boundedHeight})`"
            fill="none"
            text-anchor="middle"
          ></g>
          <path
            class="area"
            fill="#69b3a2"
            stroke="steelblue"
            stroke-width="0"
          ></path>
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import { useStore } from "vuex";
import { DateTime } from "luxon";
import { computed, defineComponent } from "vue";
import ActivityIcon from "../icons/ActivityIcon";
import useResponsiveWidth from "../../composables/useResponsiveWidth";

export default defineComponent({
  components: { ActivityIcon },
  props: ["from", "to"],
  watch: {
    width() {
      this.updateChart();
    },
  },
  mounted() {
    //this.updateChart();
  },
  setup() {
    const title = "User interactions per week";
    const { div, width } = useResponsiveWidth();

    const height = 400;
    const margin = {
      top: 10,
      right: 10,
      left: 30,
      bottom: 20,
    };

    const store = useStore();
    const events = computed(() => store.state.assessment.events.all);

    const boundedWidth = computed(
      () => width.value - margin.left - margin.right
    );
    const boundedHeight = height - margin.top - margin.bottom;

    function* weeks(interval) {
      let cursor = interval.start.startOf("week");
      while (cursor <= interval.end) {
        yield cursor.toISODate();
        cursor = cursor.plus({ week: 1 });
      }
    }

    const interval = store.getters['assessment/interval'];
    const preparedData = computed(() => {
      const eventsByWeek = Array.from(weeks(interval)).map((week) => {
        return { events: 0, week };
      });
      for (const event of events.value) {
        const eventWeek = DateTime.fromISO(event.timestamp, {
          zone: store.getters.timeZone,
        }).startOf("week").toISODate();
        const weekObj = eventsByWeek.find((o) => {
          return o.week === eventWeek;
        });
        weekObj.events++;
      }
      return eventsByWeek;
    });

    const xBand = computed(() =>
      d3
        .scaleBand()
        .domain(preparedData.value.map((d) => new Date(d.week)))
        .range([0, boundedWidth.value])
        .padding(0.1)
    );

    const xScale = computed(() =>
      d3
        .scaleTime()
        .domain([interval.start.toJSDate(), interval.end.toJSDate()])
        .range([0, boundedWidth.value])
    );

    const yScale = d3
      .scaleLinear()
      .range([boundedHeight, 0])
      .domain([0, d3.max(preparedData.value, (d) => d.events)]);

    return {
      div,
      title,
      width,
      height,
      margin,
      boundedWidth,
      boundedHeight,
      yScale,
      xScale,
      xBand,
      preparedData,
    };
  },
  methods: {
    updateChart() {
      const chart = d3.select("#events-by-week-chart");
      //const transitionDuration = 2000;
      chart
        .select(".yAxis")
        //.transition()
        //.duration(3000)
        .call(d3.axisLeft(this.yScale).ticks(10));

      chart
        .select(".xAxis")
        //.transition()
        //.duration(transitionDuration)
        .call(d3.axisBottom(this.xScale).ticks(this.boundedWidth / 80))
        .call((g) => g.selectAll(".tick line").remove());

      chart
        .select(".area")
        .datum(this.preparedData)
        //.transition()
        //.duration(transitionDuration)
        .attr(
          "d",
          d3
            .area()
            .x((e) => this.xBand(new Date(e.week)) + this.xBand.bandwidth() / 2)
            .y0(() => this.yScale(0))
            .y1((e) => this.yScale(e.events))
            .curve(d3.curveMonotoneX)
        );
    },
  },
});
</script>