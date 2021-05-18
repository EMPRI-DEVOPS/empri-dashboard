<template>
  <div ref="div" class="card shadow-sm">
    <div class="card-body">
      <h6 v-if="title" class="card-title"><activity-icon /> {{ title }}</h6>
      <svg width="100%" :height="height" :viewbox="`0 0 ${width} ${height}`">
        <g
          id="events-by-day-line-chart"
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
import { Interval, DateTime } from "luxon";
import { computed, ref, onMounted, defineComponent } from "vue";
import ActivityIcon from "../icons/ActivityIcon";

export default defineComponent({
  components: { ActivityIcon },
  props: ["from", "to"],
  watch: {
    width() {
      this.updateChart();
    },
    events() {
      this.updateChart();
    },
  },
  mounted() {
    this.updateChart();
  },
  setup(props) {
    const title = "User interactions per day";

    const width = ref(700);
    const height = 400;
    const margin = {
      top: 10,
      right: 50,
      left: 30,
      bottom: 20,
    };

    const store = useStore();
    const events = computed(() => store.state.userInteractions.all);

    const boundedWidth = computed(
      () => width.value - margin.left - margin.right
    );
    const boundedHeight = height - margin.top - margin.bottom;

    const div = ref(null);

    onMounted(() => {
      width.value = div.value.offsetWidth;
      window.addEventListener("resize", () => {
        if (div.value !== null) {
          width.value = div.value.offsetWidth;
        }
      });
    });

    const preparedData = computed(() => {
      function* days(interval) {
        let cursor = interval.start.startOf("day");
        while (cursor < interval.end) {
          yield cursor;
          cursor = cursor.plus({ days: 1 });
        }
      }

      let interval = Interval.fromDateTimes(
        DateTime.fromISO(props.from).setZone(store.getters.timeZone),
        DateTime.fromISO(props.to).setZone(store.getters.timeZone)
      );
      const allDays = Array.from(days(interval));

      const eventsByDay = allDays.map((day) => {
        return { events: 0, day: day };
      });
      for (let i = 0; i < events.value.length; i++) {
        const event = events.value[i];
        const timestamp = DateTime.fromISO(event.timestamp).setZone(store.getters.timeZone);
        const dayObj = eventsByDay.find((o) => {
          return o.day.hasSame(timestamp, 'day');
        });
        dayObj.events++;
      }
      return eventsByDay;
    });

    const xBand = computed(() =>
      d3
        .scaleBand()
        .domain(preparedData.value.map((d) => d.day.toJSDate()))
        .range([0, boundedWidth.value])
        .padding(0.1)
    );

    const xScale = computed(() =>
      d3
        .scaleTime()
        .domain(d3.extent(preparedData.value, (d) => d.day.toJSDate()))
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
      events: computed(() => store.state.userInteractions.all),
    };
  },
  methods: {
    updateChart() {
      const chart = d3.select("#events-by-day-line-chart");
      const transitionDuration = 2000;
      chart
        .select(".yAxis")
        .transition()
        .duration(3000)
        .call(d3.axisLeft(this.yScale).ticks(10));

      chart
        .select(".xAxis")
        .transition()
        .duration(transitionDuration)
        .call(d3.axisBottom(this.xScale).ticks(this.boundedWidth / 80));

      chart
        .select(".area")
        .datum(this.preparedData)
        .transition()
        .duration(transitionDuration)
        .attr(
          "d",
          d3
            .area()
            .x((e) => this.xBand(e.day.toJSDate()) + this.xBand.bandwidth() / 2)
            .y0(() => this.yScale(0))
            .y1((e) => this.yScale(e.events))
            .curve(d3.curveMonotoneX)
        );
    },
  },
});
</script>