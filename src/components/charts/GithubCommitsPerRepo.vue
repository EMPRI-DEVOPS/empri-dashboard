<template>
  <div ref="div" class="card">
    <div class="card-body">
      <h6 class="card-title">{{ title }}</h6>
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
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import { ref } from "vue";

export default {
  setup() {
    const width = ref(700);
    const height = 200;
    const margin = {
      top: 10,
      right: 50,
      left: 250,
      bottom: 30,
    };
    return {
      width,
      height,
      margin,
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
    commits() {
      return this.$store.getters.githubCommits;
    },
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
    xScale() {
      return d3
        .scaleLinear()
        .range([0, this.boundedWidth])
        .domain([0, d3.max(this.processedData, (d) => d.commits)]);
    },
    yScale() {
      return d3
        .scaleBand()
        .domain(this.processedData.map((d) => d.repo))
        .range([0, this.boundedHeight])
        .padding(0.1);
    },
  },
  methods: {
    updateChart() {
      const chart = d3.select("#commits-per-repo-chart");
      chart
        .select(".yAxis")
        .call(d3.axisLeft(this.yScale))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove());

      chart
        .select(".xAxis")
        .call(d3.axisBottom(this.xScale))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove());
      //.selectAll("text")
      //.attr("transform", "translate(-10,0)rotate(-45)")
      //.style("text-anchor", "end");

      let rects = chart.selectAll("rect").data(this.processedData);

      // Bars
      rects
        .enter()
        .append("rect")
        .merge(rects)
        .attr("x", this.xScale(0))
        .attr("y", (e) => this.yScale(e.repo))
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("width", (e) => this.xScale(e.commits))
        .attr("height", this.yScale.bandwidth())
        .attr("fill", "#69b3a2");

      rects.exit().remove();
    },
  },
};
</script>