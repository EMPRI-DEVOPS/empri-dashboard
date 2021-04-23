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
              stroke-width="2.5"
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
      title: "User interactions per day",
      dateParser: d3.timeParse("%d.%m.%Y"),
      preparedData: [],
    };
  },
  watch: {
    events() {
      this.prepareData();
      this.updateChart();
    },
  },
  mounted() {
    this.width = this.$refs.div.offsetWidth;
    this.prepareData();
    this.updateChart();
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
        .domain(d3.extent(this.preparedData, (d) => d.day))
        .range([0, this.boundedWidth]);
    },
    xBand() {
      return d3
        .scaleBand()
        .domain(this.preparedData.map((d) => d.day))
        .range([0, this.boundedWidth])
        .padding(0.1);
    },
    yScale() {
      return d3
        .scaleLinear()
        .range([this.boundedHeight, 0])
        .domain([0, d3.max(this.preparedData, (d) => d.events)]);
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

      let rects = chart.selectAll("rect").data(this.preparedData);

      // Bars
      rects
        .enter()
        .append("rect")
        .merge(rects)
        .attr("x", (e) => this.xBand(e.day))
        .attr("y", (e) => this.yScale(e.events))
        .attr("width", this.xBand.bandwidth())
        .attr("height", (e) => this.boundedHeight - this.yScale(e.events))
        .attr("fill", "#69b3a2");

      rects.exit().remove();

      chart
        .select(".line")
        .raise() // nach vorne bringen
        .datum(this.preparedData)
        .transition()
        .duration(3000)
        .attr(
          "d",
          d3
            .line()
            .x((e) => this.xBand(e.day) + this.xBand.bandwidth() / 2)
            .y((e) => this.yScale(e.events))
            .curve(d3.curveMonotoneX)
        );
    },
    prepareData() {
      this.preparedData = [];
      const timeExtent = d3.extent(this.events, (d) => this.dateParser(d.day));
      const allDays = d3.timeDay.range(timeExtent[0], timeExtent[1]);
      this.preparedData = allDays.map((day) => {
        const dayData = this.events.find((ed) => {
          return this.dateParser(ed.day).toString() === day.toString();
        });
        return { events: dayData ? dayData.events : 0, day: day };
      });
    },
  },
};
</script>