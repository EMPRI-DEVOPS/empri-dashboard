<template>
  <div id="chart" />
</template>

<script>
import * as d3 from "d3";
import * as importedData from "../assets/data.json";

export default {
  name: "Charts",
  data() {
    return {
      width: 750,
      height: 400,
      margin: {
        top: 50,
        right: 50,
        left: 50,
        bottom: 50,
      },
      dataset: importedData.default
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const boundedWidth = this.width - this.margin.left - this.margin.right;
      const boundedHeight = this.height - this.margin.top - this.margin.bottom;

      //We are accessing the div with the id chart using d3's select method and appending svg
      const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
        .style(
          "transform",
          `translate(${this.margin.left}px, ${this.margin.top}px)`
        );
      const yAccessor = (d) => parseInt(d.COVID); //Converting string into a number
      const dateParser = d3.timeParse("%Y-%m-%d");
      const xAccessor = (d) => dateParser(d.Tag);
      const yScale = d3.scaleLinear().domain([40, 100]).range([boundedHeight, 0]);

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(this.dataset, xAccessor))
        .range([0, boundedWidth]);

      const line = d3.line()
        .x((d) => xScale(xAccessor(d)))
        .y((d) => yScale(yAccessor(d)));

      svg
        .append("path")
        .attr("d", line(this.dataset))
        .attr("fill", "none")
        .attr("stroke", "rgb(34 150 243)")
        .attr("stroke-width", 3);

      const yAxisGenerator = d3
        .axisLeft()
        .scale(yScale)
        .ticks(5)
        .tickValues(d3.range(25, 100 + 25, 25));

      svg.append("g").call(yAxisGenerator);

      const xAxisGenerator = d3.axisBottom().scale(xScale).ticks(5);

      svg
        .append("g")
        .call(xAxisGenerator)
        .style("transform", `translateY(${boundedHeight}px)`);
    },
  },
};
</script>