<template>
  <div ref="div" class="card">
    <div class="card-body">
      <h6 class="card-title">{{ title }}</h6>
      <svg width="100%" :height="height" :viewbox="`0 0 ${width} ${height}`">
        <g
          id="events-per-weekday-chart"
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
import { ref, computed } from "vue";
import * as d3 from "d3";
import { DateTime } from "luxon";

export default {
  setup() {
    const width = ref(700);
    const height = 200;
    const margin = {
      top: 10,
      right: 50,
      left: 70,
      bottom: 30,
    };
    return {
      title: "User interactions per weekday",
      width,
      height,
      margin,
      boundedHeight: height - margin.top - margin.bottom,
      boundedWidth: computed(() => width.value - margin.left - margin.right),
      weekdays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    };
  },
  mounted() {
    this.width = this.$refs.div.offsetWidth;
    this.updateChart();
  },
  watch: {
    eventsPerWeekday() {
      this.updateChart();
    },
  },
  computed: {
    eventsPerWeekday() {
      const eventsPerWeekday = Array(7).fill(0);
      for (const event of this.$store.state.userInteractions.all) {
        const weekday = DateTime.fromISO(event.timestamp).setZone(
          this.$store.getters.timeZone
        ).weekday;
        eventsPerWeekday[weekday - 1]++;
      }
      return eventsPerWeekday;
    },
    xScale() {
      return d3
        .scaleLinear()
        .domain([0, d3.max(this.eventsPerWeekday)])
        .range([0, this.boundedWidth]);
    },
    yScale() {
      return d3
        .scaleBand()
        .range([0, this.boundedHeight])
        .domain(this.weekdays)
        .padding(0.2);
    },
  },
  methods: {
    updateChart() {
      const chart = d3.select("#events-per-weekday-chart");
      chart
        .select(".yAxis")
        .call(d3.axisLeft(this.yScale).ticks(10))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove());

      chart
        .select(".xAxis")
        .call(d3.axisBottom(this.xScale))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove());

      const rects = chart.selectAll("rect").data(this.eventsPerWeekday);

      // Bars
      rects
        .enter()
        .append("rect")
        .merge(rects)
        .attr("x", this.xScale(0))
        .attr("y", (e, idx) => this.yScale(this.weekdays[idx]))
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("width", (e) => this.xScale(e))
        .attr("height", this.yScale.bandwidth())
        .attr("fill", "#69b3a2");

      rects.exit().remove();
    },
  },
};
</script>