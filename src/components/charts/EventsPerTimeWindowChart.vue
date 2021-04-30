<template>
  <div ref="div">
    <card :title="title">
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
    </card>
  </div>
</template>

<script>
import * as d3 from "d3";
import Card from "../Card.vue";

export default {
  components: { Card },
  props: ["events"],
  data() {
    return {
      width: 700,
      height: 400,
      margin: {
        top: 10,
        bottom: 30,
        left: 40,
        right: 22,
      },
      title: "User interactions per time window",
      timeWindows: ["0-6", "6-9", "9-12", "12-15", "15-18", "18-0"],
    };
  },
  watch: {
    commits() {
      this.updateChart();
    },
  },
  mounted() {
    this.width = this.$refs.div.offsetWidth;
    this.updateChart();
  },
  computed: {
    processedData() {
      let eventsPerTimeWindow = this.timeWindows.map((timeWindow) => ({
        timeWindow: timeWindow,
        events: 0,
      }));
      for (let i = 0; i < this.events.length; i++) {
        const event = this.events[i];
        const date = new Date(event.timestamp);
        const timeWindow = this.getTimeWindowOfDate(date);
        const timeWindowObj = eventsPerTimeWindow.filter(
          (e) => e.timeWindow === timeWindow
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
        .domain(this.processedData.map((w) => w.timeWindow))
        .padding(0.3);
    },
  },
  methods: {
    /**
     * @param {Date} date
     */
    getTimeWindowOfDate(date) {
      const hours = date.getHours();
      if (hours < 6) {
        return "0-6";
      }
      if (hours < 9) {
        return "6-9";
      }
      if (hours < 12) {
        return "9-12";
      }
      if (hours < 15) {
        return "12-15";
      }
      if (hours < 18) {
        return "15-18";
      }
      return "18-0";
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