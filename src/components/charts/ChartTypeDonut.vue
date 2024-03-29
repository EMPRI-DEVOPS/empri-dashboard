<template>
  <div class="col-xl-4">
    <div ref="div" class="card">
      <div class="card-body chart-card">
        <h6 v-if="title" class="card-title"><activity-icon /> {{ title }}</h6>
        <svg
          :width="width"
          :height="height"
          :viewbox="`0 0 ${width} ${height}`"
        >
          <g
            id="donut-chart"
            :transform="`translate(${
              (width - margin.left - margin.right) / 2 - radius / 2
            }, ${(height - margin.top - margin.bottom) / 2})`"
          >
            <text
              id="total-events"
              text-anchor="middle"
              dominant-baseline="central"
              font-size="10"
            >
              {{ totalCount }}
            </text>
          </g>
          <g
            id="legend"
            :transform="`translate(${
              (width - margin.left - margin.right) / 2 + radius / 2 + 40
            }, ${(height - margin.top - margin.bottom) / 2})`"
          ></g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, watch } from "vue";
import { useStore } from "vuex";
import { pie, select, arc } from "d3";
import { eventTypeColor } from "../../common";
import useResponsiveWidth from "../../composables/useResponsiveWidth";
import ActivityIcon from "../icons/ActivityIcon";

export default {
  components: { ActivityIcon },
  setup() {
    const store = useStore();
    const { width, div } = useResponsiveWidth();
    const margin = {
      top: 10,
      right: 0,
      left: 0,
      bottom: 0,
    };
    const boundedWidth = computed(
      () => width.value - margin.left - margin.right
    );
    const height = 300;
    const boundedHeight = height - margin.top - margin.bottom;

    const eventTypes = store.getters["assessment/events/types"];
    const userInteractionsByType = computed(() =>
      eventTypes.map((type) => ({
        type,
        count: store.getters["assessment/events/byType"](type).length,
      }))
    );
    const totalCount = computed(
      () => store.getters["assessment/events/totalCount"]
    );

    const radius = computed(() => Math.min(width.value, height) / 2 - 30);

    watch([width, userInteractionsByType, totalCount], () => {
      const chart = select("#donut-chart");
      const d3pie = pie().value((d) => d.count);
      const arcs = d3pie(userInteractionsByType.value);
      const githubEventTypes = require("../../common").githubEventTypes;

      chart
        .selectAll("path")
        .data(arcs)
        .join("path")
        .attr("d", arc().innerRadius(70).outerRadius(40))
        .transition()
        .duration(2000)
        .attr(
          "d",
          arc()
            .innerRadius(90) // This is the size of the donut hole
            .outerRadius(radius.value)
        )
        .attr("fill", function (d) {
          return eventTypeColor(d.data.type);
        })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.9);
      chart
        .select("#total-events")
        .attr("font-size", 10)
        .attr("opacity", 0.3)
        .transition()
        .duration(2000)
        .attr("font-size", 70)
        .attr("opacity", 1);
      const legend = select("#legend").data(userInteractionsByType.value);
      legend
        .selectAll("circle")
        .data(userInteractionsByType.value)
        .join("circle")
        .attr("cy", (d, i) => i * 25)
        .attr("r", 7)
        .style("fill", (d) => eventTypeColor(d.type));
      legend
        .selectAll("text")
        .data(userInteractionsByType.value)
        .join("text")
        .attr("x", 10)
        .attr("y", (d, i) => 5 + i * 25)
        .text((d) => {
          const type = githubEventTypes.find((eventType) => eventType.type === d.type).name;
          return `${type}: ${d.count}`
        });
    });

    return {
      title: "Total user interactions found",
      width,
      div,
      height,
      margin,
      radius,
      boundedHeight,
      boundedWidth,
      totalCount,
    };
  },
};
</script>