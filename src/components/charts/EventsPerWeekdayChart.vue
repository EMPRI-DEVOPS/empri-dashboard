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

export default {
  props: ["events"],
  setup() {
    const width = ref(700);
    const height = 400;
    const margin = {
      top: 10,
      right: 50,
      left: 70,
      bottom: 20,
    };
    return {
      title: "User interactions per weekday",
      width,
      height,
      margin,
      boundedHeight: height - margin.top - margin.bottom,
      boundedWidth: computed(() => width.value - margin.left - margin.right),
      weekdays: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    };
  },
  mounted() {
    this.width = this.$refs.div.offsetWidth;
    this.updateChart();
  },
  computed: {
    processedData() {
      let eventsPerWeekday = this.weekdays.map((weekday) => ({
        weekday: weekday,
        events: 0,
      }));
      for (let i = 0; i < this.events.length; i++) {
        const event = this.events[i];
        const date = new Date(event.timestamp);
        const weekday = this.weekdays[date.getDay()];
        const weekdayObj = eventsPerWeekday.find(
          (e) => e.weekday === weekday
        );
        weekdayObj.events++;
      }
      return eventsPerWeekday;
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
        .domain(this.processedData.map((w) => w.weekday))
        .padding(0.3);
    },
  },
  methods: {
    updateChart() {
      const chart = d3.select("#events-per-weekday-chart");
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
        .attr("y", (e) => this.yScale(e.weekday))
        .attr("width", (e) => this.xScale(e.events))
        .attr("height", this.yScale.bandwidth())
        .attr("fill", "#69b3a2");

      rects.exit().remove();
    },
  },
};
</script>