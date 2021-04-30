<template>
  <div ref="div" class="justify-contents-center">
    <card :title="title">
      <svg width="100%" :height="height" :viewbox="`0 0 ${width} ${height}`">
        <g
          id="commits-per-repo-chart"
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
  props: ["commits"],
  data() {
    return {
      width: 700,
      height: 400,
      margin: {
        top: 10,
        bottom: 120,
        left: 50,
        right: 15
      },
      title: "Github commits per repo",
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
      let repos = [];
      for (let i = 0; i < this.commits.length; i++) {
        const commit = this.commits[i];
        const repo = repos.filter((r) => r.repo === commit.repo)[0];
        if (repo) {
          repo.commits++;
          continue;
        }
        repos.unshift({
          repo: commit.repo,
          commits: 1,
        });
      }
      repos.sort((a, b) => b.commits - a.commits);
      repos = repos.slice(0, 5);
      return repos;
    },
    boundedWidth() {
      return this.width - this.margin.left - this.margin.right;
    },
    boundedHeight() {
      return this.height - this.margin.top - this.margin.bottom;
    },
    xBand() {
      return d3
        .scaleBand()
        .domain(this.processedData.map((d) => d.repo))
        .range([0, this.boundedWidth])
        .padding(0.1);
    },
    yScale() {
      return d3
        .scaleLinear()
        .range([this.boundedHeight, 0])
        .domain([0, d3.max(this.processedData, (d) => d.commits)]);
    },
  },
  methods: {
    updateChart() {
      const chart = d3.select("#commits-per-repo-chart");
      chart.select(".yAxis").call(d3.axisLeft(this.yScale).ticks(10));

      chart
        .select(".xAxis")
        .call(d3.axisBottom(this.xBand))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      let rects = chart.selectAll("rect").data(this.processedData);

      // Bars
      rects
        .enter()
        .append("rect")
        .merge(rects)
        .attr("x", (e) => this.xBand(e.repo))
        .attr("y", (e) => this.yScale(e.commits))
        .attr("width", this.xBand.bandwidth())
        .attr("height", (e) => this.boundedHeight - this.yScale(e.commits))
        .attr("fill", "#69b3a2");

      rects.exit().remove();
    },
  },
};
</script>