<template>
  <div class="col-xl-8">
    <div ref="div" class="card">
      <div class="card-body chart-card">
        <h6 class="card-title"><github-icon /> {{ title }}</h6>
        <svg
          :width="width"
          :height="height"
          :viewbox="`0 0 ${width} ${height}`"
        >
          <g
            id="commits-per-repo-chart"
            :transform="`translate(${margin.left}, ${margin.top})`"
          ></g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { select, scaleLinear, max } from "d3";
import useResponsiveWidth from "../../composables/useResponsiveWidth";
import { computed, watch } from "vue";
import { useStore } from "vuex";
import GithubIcon from "../icons/GithubIcon.vue";
import { eventTypeColor } from "../../common";

export default {
  components: { GithubIcon },
  setup() {
    const store = useStore();
    const { div, width } = useResponsiveWidth();
    const boundedWidth = computed(
      () => width.value - margin.left - margin.right
    );
    const barHeight = 25;
    const labelHeight = 18;
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
      //const eventTypes = store.getters['assessment/events/types'];
      for (const event of store.getters["assessment/events/githubEvents"]) {
        let repo = repos.filter((r) => r.repo === event.repo)[0];
        if (!repo) {
          repo = Object.fromEntries(eventTypes.map((key) => [key, 0]));
          repo.repo = event.repo;
          repo.total = 0;
          repos.unshift(repo);
        }
        repo[event.type]++;
        repo.total++;
      }
      repos.sort((a, b) => b.total - a.total);
      if (repos.length > 7) {
        const accumulatorRepo = Object.fromEntries(
          eventTypes.map((key) => [key, 0])
        );
        accumulatorRepo.repo = "other";
        accumulatorRepo.total = 0;
        repos.slice(7).forEach((otherRepo) => {
          eventTypes.forEach(
            (type) => (accumulatorRepo[type] += otherRepo[type])
          );
          accumulatorRepo.total += otherRepo.total;
        });
        repos = [...repos.slice(0, 7), accumulatorRepo];
      }
      return repos;
    });

    const xScale = computed(() =>
      scaleLinear()
        .range([0, boundedWidth.value - 40])
        .domain([0, max(eventsPerRepo.value, (d) => d.total)])
    );

    const eventTypes = store.getters["assessment/events/types"];

    watch([xScale, eventsPerRepo], () => {
      const chart = select("#commits-per-repo-chart");

      chart.selectAll(".bar").remove();

      const gHeight = barHeight + labelHeight + 12;

      // Bars
      const rectContainers = chart
        .selectAll("g")
        .data(eventsPerRepo.value)
        .join("g")
        .attr("class", "bar")
        .attr("transform", (d, i) => {
          return "translate(0," + gHeight * i + ")";
        });

      rectContainers
        .append("text")
        .attr("x", 0)
        .attr("y", 11)
        .style("fill", "black")
        .attr("font-size", 15)
        .text((e) => e.repo);

      const rects = rectContainers
        .selectAll("rect")
        .data((d) => {
          const dataPoint = [];
          let prev = 0;
          for (const type of eventTypes) {
            dataPoint.push({ type, prev: prev, val: prev + d[type] ?? 0 });
            prev += d[type] ?? 0;
          }
          return dataPoint;
        })
        .join("rect")
        .attr("y", labelHeight)
        .attr("x", () => xScale.value(0))
        .attr("height", barHeight);
      rects
        .transition()
        .duration(2000)
        .attr("x", (d) => xScale.value(d.prev))
        .attr("width", (d) => {
          const res = xScale.value(d.val - d.prev);
          return res;
        })
        .attr("fill", (d) => eventTypeColor(d.type))
        .attr("opacity", 0.9);
      rects
        .on("mouseover", function () {
          select(this).attr("opacity", 0.7);
        })
        .on("mouseleave", function () {
          select(this).attr("opacity", 0.9);
        });

      rectContainers
        .append("text")
        .attr("x", (e) => xScale.value(e.total) + 4)
        .attr("y", labelHeight + barHeight / 2)
        .attr("dy", ".35em")
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .style("fill", "#585858")
        .text((e) => e.total);
    });

    return {
      div,
      width,
      boundedWidth,
      barHeight,
      labelHeight,
      height,
      margin,
      title: "Github interactions per repo",
    };
  },
};
</script>