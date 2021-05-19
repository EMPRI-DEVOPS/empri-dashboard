<template>
  <div ref="div" class="card">
    <div class="card-body">
      <h6 v-if="title" class="card-title"><activity-icon /> {{ title }}</h6>
      <svg :width="width" :height="height" :viewbox="`0 0 ${width} ${height}`">
        <g
          id="day-hour-heatmap"
          :transform="`translate(${margin.left}, ${margin.top})`"
        >
          <g class="yAxis" text-anchor="end"></g>
          <g
            class="xAxis"
            :transform="`translate(0, ${boundedHeight})`"
            fill="none"
            text-anchor="middle"
          ></g>
        </g>
      </svg>
      <div class="chart-tooltip" id="dh-chart-tooltip"></div>
    </div>
  </div>
</template>

<script>
import ActivityIcon from "../icons/ActivityIcon";
import * as d3 from "d3";
import { computed } from "vue";
import { useStore } from "vuex";
import { DateTime } from "luxon";
import useResponsiveWidth from "../../composables/useResponsiveWidth";

export default {
  components: { ActivityIcon },
  setup() {
    const store = useStore();
    const events = computed(() => store.state.userInteractions.all);
    const { width, div } = useResponsiveWidth();
    const margin = {
      top: 10,
      right: 70,
      left: 80,
      bottom: 40,
    };
    const boundedWidth = computed(
      () => width.value - margin.left - margin.right
    );
    const height = 200;
    const boundedHeight = height - margin.top - margin.bottom;
    const weekdays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const heatmapData = computed(() => {
      const dayHourMap = [];
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
          dayHourMap.push({ d, h, e: 0 });
        }
      }
      for (const event of events.value) {
        const timestamp = DateTime.fromISO(event.timestamp).setZone(
          store.getters.timeZone
        );
        const dayObj = dayHourMap.find((dh) => {
          return dh.d === timestamp.weekday - 1 && dh.h === timestamp.hour;
        });
        dayObj.e++;
      }
      return dayHourMap;
    });

    const xBand = computed(() =>
      d3
        .scaleBand()
        .domain([...Array(24).keys()])
        .range([0, boundedWidth.value])
    );

    const yBand = computed(() =>
      d3.scaleBand().domain(weekdays).range([0, boundedHeight])
    );

    const colorScale = computed(() =>
      d3
        .scaleLinear()
        .range(["#cde6e0", "#69b3a2"])
        .domain(d3.extent(heatmapData.value, (e) => e.e))
    );

    return {
      title: "Day/hour heatmap",
      width,
      div,
      height,
      margin,
      boundedHeight,
      boundedWidth,
      xBand,
      yBand,
      colorScale,
      heatmapData,
      weekdays,
    };
  },
  mounted() {
    this.updateChart();
  },
  watch: {
    width() {
      this.updateChart();
    },
  },
  methods: {
    updateChart() {
      const chart = d3.select("#day-hour-heatmap");
      chart
        .select(".yAxis")
        .call(d3.axisLeft(this.yBand))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove());

      chart
        .select(".xAxis")
        .call(d3.axisBottom(this.xBand))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove());

      const tooltip = d3.select("#dh-chart-tooltip");

      // Three function that change the tooltip when user hover / move / leave a cell
      const mouseover = () => tooltip.style("opacity", 0.7);
      const mousemove = (event, d) => {
        tooltip
          .html(`${d.e} event(s)`)
          .style("left", d3.pointer(event)[0] + 20 + "px")
          .style("top", d3.pointer(event)[1] + "px");
      };
      const mouseleave = () => tooltip.style("opacity", 0);

      let rects = chart.selectAll("rect").data(this.heatmapData);

      // Bars
      rects
        .enter()
        .append("rect")
        .merge(rects)
        .attr("x", (dh) => this.xBand(dh.h))
        .attr("y", (dh) => this.yBand(this.weekdays[dh.d]))
        //.attr("rx", 2)
        //.attr("ry", 2)
        .attr("width", this.xBand.bandwidth())
        .attr("height", this.yBand.bandwidth())
        .attr("fill", (d) => (d.e > 0 ? this.colorScale(d.e) : "#f8f8f8"))
        .attr("stroke", "#c8c8c8")
        .attr("stroke-width", 0.5)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    },
  },
};
</script>

<style scoped>
.chart-tooltip {
  opacity: 0;
  position: absolute;
  background-color: white;
  border: 2px solid #c8c8c8;
  border-radius: 5px;
  padding: 5px;
  left: 452px;
  top: 264.017px;
  z-index: 1000;
}
.tick line {
  visibility: hidden;
}
</style>