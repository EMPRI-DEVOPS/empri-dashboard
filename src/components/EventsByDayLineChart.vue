<template>
  <div class="row py-4 justify-content-center">
    <div ref="div" class="col-md-10">
      <card :title="title">
        <svg width="100%" :height="height" :viewbox="`0 0 ${width} ${height}`">
          <g
            id="events-by-day-line-chart"
            :transform="`translate(${margin}, ${margin})`"
          >
            <g class="yAxis" fill="none" text-anchor="end"></g>
            <g
              class="xAxis"
              :transform="`translate(0, ${boundedHeight})`"
              fill="none"
              text-anchor="middle"
            ></g>
            <path
              class="line"
              fill="none"
              stroke="steelblue"
              stroke-width="1.5"
            ></path>
          </g>
        </svg>
      </card>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import Card from "./Card.vue";

export default {
  components: { Card },
  props: ["events"],
  data() {
    return {
      width: 700,
      height: 400,
      margin: 60,
      title: "User interactions by day",
      dateParser: d3.timeParse("%d.%m.%Y"),
      xAccessor: (d) => this.dateParser(d.day),
      yAccessor: (d) => d.events,
    };
  },
  watch: {
    events() {
      this.updateChart();
    },
  },
  mounted() {
    this.width = this.$refs.div.offsetWidth;
  },
  computed: {
    boundedWidth() {
      return this.width - 2 * this.margin;
    },
    boundedHeight() {
      return this.height - 2 * this.margin;
    },
    xScale() {
      return d3
        .scaleTime()
        .domain(d3.extent(this.events, this.xAccessor))
        .range([0, this.boundedWidth])
        .nice();
    },
    yScale() {
      return d3
        .scaleLinear()
        .range([this.boundedHeight, 0])
        .domain([0, d3.max(this.events, this.yAccessor)]);
    },
  },
  methods: {
    updateChart() {
      const chart = d3.select("#events-by-day-line-chart");
      chart
        .select(".yAxis")
        .transition()
        .duration(3000)
        .call(d3.axisLeft(this.yScale).ticks(10));

      chart
        .select(".xAxis")
        .transition()
        .duration(3000)
        .call(d3.axisBottom(this.xScale));

      chart
        .select(".line")
        .datum(this.events)
        .transition()
        .duration(3000)
        .attr(
          "d",
          d3
            .line()
            .x((e) => this.xScale(this.xAccessor(e)))
            .y((e) => this.yScale(this.yAccessor(e)))
        );
    },
  },
};
</script>