<template>
  <div ref="div" class="card">
    <div class="card-body">
      <h6 class="card-title">{{ title }}</h6>
      <svg width="100%" :height="height" :viewbox="`0 0 ${width} ${height}`">
        <g
          id="events-per-time-window-chart"
          :transform="`translate(${margin.left}, ${margin.top})`"
        >
          <g class="yAxis" fill="none" text-anchor="end"></g>
          <g
            class="xAxis"
            :transform="`translate(0, ${boundedHeight})`"
            fill="none"
            text-anchor="middle"
          ></g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import * as d3 from "d3";
import { computed, ref } from "vue";

export default {
  props: ["events"],
  setup() {
    const width = ref(700);
    const height = 400;
    const margin = {
      top: 10,
      bottom: 30,
      left: 80,
      right: 50,
    };

    const store = useStore();
    const dayTimeRanges = computed(() => store.getters.dayTimeRanges);
    return {
      title: "User interactions per time window",
      width,
      height,
      margin,
      dayTimeRanges,
    };
  },
  watch: {
    commits() {
      this.updateChart();
    },
    dayTimeRanges() {
      this.updateChart();
    },
  },
  mounted() {
    this.width = this.$refs.div.offsetWidth;
    this.updateChart();
  },
  computed: {
    timeWindows() {
      let result = [];
      for (let i = 0; i < this.dayTimeRanges.length; i++) {
        let to = i + 1 == this.dayTimeRanges.length ? 0 : i + 1;
        result.push({
          from: this.dayTimeRanges[i],
          to: this.dayTimeRanges[to],
          name: `${this.dayTimeRanges[i]}:00 - ${this.dayTimeRanges[to]}:00`,
        });
      }
      return result;
    },
    processedData() {
      let eventsPerTimeWindow = this.timeWindows.map((timeWindow) => ({
        timeWindow: timeWindow.name,
        events: 0,
      }));
      for (let i = 0; i < this.events.length; i++) {
        const event = this.events[i];
        const timeWindow = this.getTimeWindowOfDate(event.timestamp);
        const timeWindowObj = eventsPerTimeWindow.filter(
          (e) => e.timeWindow === timeWindow.name
        )[0];
        if (timeWindowObj) {
          timeWindowObj.events++;
          continue;
        }
        eventsPerTimeWindow.unshift({
          timeWindow: timeWindow,
          events: 1,
        });
      }
      return eventsPerTimeWindow;
    },
    boundedWidth() {
      return this.width - this.margin.left - this.margin.right;
    },
    boundedHeight() {
      return this.height - this.margin.top - this.margin.bottom;
    },
    xScale() {
      return d3
        .scaleLinear()
        .domain([0, d3.max(this.processedData, (w) => w.events)])
        .range([0, this.boundedWidth]);
    },
    yScale() {
      return d3
        .scaleBand()
        .range([0, this.boundedHeight])
        .domain(this.timeWindows.map((timeWidnow) => timeWidnow.name))
        .padding(0.3);
    },
  },
  methods: {
    /**
     * @param {DateTime} date
     */
    getTimeWindowOfDate(date) {
      for (let i = 0; i < this.timeWindows.length - 1; i++) {
        let timeWindow = this.timeWindows[i];
        if (date.hour >= timeWindow.from && date.hour < timeWindow.to) {
          return timeWindow;
        }
      }
      return this.timeWindows[this.timeWindows.length - 1];
    },
    updateChart() {
      const chart = d3.select("#events-per-time-window-chart");
      chart.select(".yAxis").call(d3.axisLeft(this.yScale).ticks(10));

      chart
        .select(".xAxis")
        .call(d3.axisBottom(this.xScale))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      let rects = chart.selectAll("rect").data(this.processedData);

      // Bars
      rects
        .enter()
        .append("rect")
        .merge(rects)
        .attr("x", this.xScale(0))
        .attr("y", (e) => this.yScale(e.timeWindow))
        .attr("width", (e) => this.xScale(e.events))
        .attr("height", this.yScale.bandwidth())
        .attr("fill", "#69b3a2");

      rects.exit().remove();
    },
  },
};
</script>