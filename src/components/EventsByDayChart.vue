<template>
  <div id="events-by-day-bar-chart">
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  props: ["events"],
  data() {
    return {
      chart: null,
      width: 1000,
      height: 600,
      margin: 60,
      svg: null,
    };
  },
  watch: {
    events(val) {
      if (this.chart != null) {
        this.chart.remove();
      }
      this.renderChart(val);
    },
  },
  computed: {
    boundedWidth() {
      return this.width - 2 * this.margin;
    },
    boundedHeight() {
      return this.height - 2 * this.margin;
    },
  },
  mounted() {
    this.svg = d3
      .select("#events-by-day-bar-chart")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
  },
  methods: {
    renderTitle() {
      let title = this.svg.select(".title");
      if (title.empty()) {
        title = this.svg
          .append("text")
          .attr("class", "title")
          .attr("x", this.boundedWidth / 2 + this.margin)
          .attr("y", 40)
          .attr("text-anchor", "middle");
      }
      title.text("User interactions by day");
    },
    renderChart(eventsByDay) {
      this.chart = this.svg
        .append("g")
        .attr("transform", `translate(${this.margin}, ${this.margin})`);

      const yAccessor = (d) => d.events;

      const yScale = d3
        .scaleLinear()
        .range([this.boundedHeight, 0])
        .domain([0, d3.max(eventsByDay, yAccessor)]);

      this.chart
        .append("g")
        .call(d3.axisLeft(yScale).ticks(10));

      const xScale = d3
        .scaleBand()
        .range([0, this.boundedWidth])
        .domain(eventsByDay.map((s) => s.day))
        .padding(0.2);

      this.chart
        .append("g")
        .attr("transform", `translate(0, ${this.boundedHeight})`)
        .call(d3.axisBottom(xScale));

      const barGroups = this.chart.selectAll("rect").data(eventsByDay).enter();

      //const svg = this.svg;
      const chart = this.chart;
      barGroups
        .append("rect")
        .attr("class", "bar")
        .attr("x", (g) => xScale(g.day))
        .attr("y", (g) => yScale(g.events))
        .attr("height", (g) => this.boundedHeight - yScale(g.events))
        .attr("width", xScale.bandwidth())
        .on("mouseenter", function (event, i) {
          d3.select(this).attr("opacity", 0.3);
          d3.select(this)
            .transition()
            .duration(300)
            .attr("opacity", 0.6)
            .attr("x", (a) => xScale(a.day) - 5)
            .attr("width", xScale.bandwidth() + 10);
          chart
            .append("text")
            .attr("class", "value")
            .attr("id", "v" + i.day.replace(/\./g, ""))
            .attr("x", xScale(i.day) + xScale.bandwidth() / 2)
            .attr("y", yScale(i.events) - 10)
            .attr("text-anchor", "middle")
            .text(`${i.events} events`);
        })
        .on("mouseleave", function (event, i) {
          d3.selectAll(".issues").attr("opacity", 1);

          d3.select(this)
            .transition()
            .duration(300)
            .attr("opacity", 1)
            .attr("x", (a) => xScale(a.day))
            .attr("width", xScale.bandwidth());

          chart.select("#v" + i.day.replace(/\./g, "")).remove();
          //svg.selectAll(".value").remove();
        });

      this.renderTitle();
      if (this.svg.selectAll(".label").empty()) {
        this.svg
          .append("text")
          .attr("class", "label")
          .attr("x", -(this.boundedHeight / 2) - this.margin)
          .attr("y", this.margin / 2.4)
          .attr("transform", "rotate(-90)")
          .attr("text-anchor", "middle")
          .text("Events");

        this.svg
          .append("text")
          .attr("class", "label")
          .attr("x", this.boundedWidth / 2 + this.margin)
          .attr("y", this.boundedHeight + this.margin * 1.7)
          .attr("text-anchor", "middle")
          .text("Days");
      }
    },
  },
};
</script>