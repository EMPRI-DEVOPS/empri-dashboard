<template>
  <div ref="div" class="card">
    <div class="card-body chart-card">
      <h6 class="card-title"><github-icon /> {{ title }}</h6>
      <svg :width="width" :height="height" :viewbox="`0 0 ${width} ${height}`">
        <g
          id="commits-per-repo-chart"
          :transform="`translate(${margin.left}, ${margin.top})`"
        ></g>
      </svg>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import useResponsiveWidth from "../../composables/useResponsiveWidth";
import { computed } from "vue";
import { useStore } from "vuex";
import GithubIcon from "../icons/GithubIcon.vue";

export default {
  components: { GithubIcon },
  setup() {
    const store = useStore();
    const { div, width } = useResponsiveWidth();
    const boundedWidth = computed(
      () => width.value - margin.left - margin.right
    );
    const barHeight = 25;
    const labelHeight = 15;
    const height = computed(
      () =>
        (barHeight + labelHeight + 12) * eventsPerRepo.value.length + margin.top
    );
    const margin = {
      top: 10,
      right: 10,
      left: 0,
      bottom: 10,
    };

    const eventsPerRepo = computed(() => {
      let repos = [];
      for (const event of store.getters['assessment/events/githubEvents']) {
        const repo = repos.filter((r) => r.repo === event.repo)[0];
        if (repo) {
          repo.commits++;
          continue;
        }
        repos.unshift({
          repo: event.repo,
          commits: 1,
        });
      }
      repos.sort((a, b) => b.commits - a.commits);
      if (repos.length > 7) {
        repos = [
          ...repos.slice(0, 7),
          {
            repo: "other",
            commits: repos
              .slice(7)
              .reduce((acc, curr) => (acc += curr.commits), 0),
          },
        ];
        repos.push();
      }
      return repos;
    });

    const xScale = computed(() =>
      d3
        .scaleLinear()
        .range([0, boundedWidth.value - 40])
        .domain([0, d3.max(eventsPerRepo.value, (d) => d.commits)])
    );

    return {
      div,
      width,
      boundedWidth,
      barHeight,
      labelHeight,
      height,
      margin,
      title: "Github interactions per repo",
      eventsPerRepo,
      xScale,
    };
  },
  watch: {
    width() {
      this.updateChart();
    },
  },
  mounted() {
    this.updateChart();
  },
  methods: {
    updateChart() {
      const chart = d3.select("#commits-per-repo-chart");

      chart.selectAll(".bar").remove();

      const gHeight = this.barHeight + this.labelHeight + 12;

      // Bars
      const rects = chart
        .selectAll("bar")
        .data(this.eventsPerRepo)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", (d, i) => {
          return "translate(0," + gHeight * i + ")";
        });

      rects
        .append("text")
        .attr("x", 0)
        .attr("y", 11)
        .style("fill", "black")

        .attr("font-size", 15)
        .text((e) => e.repo);

      rects
        .append("rect")
        .attr("class", "bar")
        .attr("y", this.labelHeight)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", (e) => this.xScale(e.commits))
        .attr("height", this.barHeight)
        .attr("fill", "#69b3a2")
        .on("mouseover", function () {
          d3.select(this).attr("opacity", 0.7);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("opacity", 1);
        });

      rects
        .append("text")
        .attr("x", (e) => this.xScale(e.commits) + 4)
        .attr("y", this.labelHeight + this.barHeight / 2)
        .attr("dy", ".35em")
        .attr("font-size", 12)
        .attr("font-weight", "bold")

        .style("fill", "#585858")
        .text((e) => e.commits);
    },
  },
};
</script>