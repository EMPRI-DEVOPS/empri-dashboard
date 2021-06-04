<template>
  <div ref="div" class="card">
    <div class="card-body chart-card">
      <h6 v-if="title" class="card-title"><activity-icon /> {{ title }}</h6>
      <svg :width="width" :height="height" :viewbox="`0 0 ${width} ${height}`">
        <g
          id="weekday-heatmap"
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
      <div id="wd-tooltip" class="chart-tooltip"></div>
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
import {colors} from "../../common";

export default {
  components: { ActivityIcon },
  setup() {
    const store = useStore();
    const interval = store.getters['assessment/interval'];
    const events = computed(() => store.state.assessment.events.all);
    const margin = {
      top: 10,
      right: 10,
      left: 80,
      bottom: 40,
    };
    const { width, div } = useResponsiveWidth();
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
      function* days(interval) {
        let cursor = interval.start.startOf("day").setLocale("en-US");
        while (cursor <= interval.end) {
          yield cursor;
          cursor = cursor.plus({ days: 1 });
        }
      }

      const weekmap = Array.from(days(interval)).map((day) => ({
        weekYear: day.weekYear,
        weekNumber: day.weekNumber,
        week: `${day.weekYear} ${day.weekNumber}`,
        weekday: day.weekday,
        isoDate: day.toISODate(),
        events: 0,
      }));

      for (const event of events.value) {
        const timestamp = DateTime.fromISO(event.timestamp).setZone(
          store.getters.timeZone
        );
        const dayObj = weekmap.find((day) => {
          return day.isoDate === timestamp.toISODate();
        });
        dayObj.events++;
      }

      return weekmap;
    });

    const xBand = computed(
      () =>
        d3
          .scaleBand()
          .domain(heatmapData.value.map((d) => `${d.weekYear} ${d.weekNumber}`))
          .range([0, boundedWidth.value])
      //.padding(0.1)
    );

    const xTimeScale = computed(() =>
      d3
        .scaleTime()
        .domain([interval.start.toJSDate(), interval.end.toJSDate()])
        .range([0, boundedWidth.value])
    );

    const yBand = computed(
      () => d3.scaleBand().domain(weekdays).range([0, boundedHeight]) //.padding(0.05)
    );

    const colorScale = computed(() =>
      d3
        .scaleLinear()
        .range(["#d8eaeb", colors[0]])
        .domain(d3.extent(heatmapData.value, (e) => e.events))
    );

    return {
      width,
      div,
      title: "Weekday heatmap",
      height,
      margin,
      boundedHeight,
      boundedWidth,
      xBand,
      xTimeScale,
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
      const chart = d3.select("#weekday-heatmap");
      chart
        .select(".yAxis")
        .call(d3.axisLeft(this.yBand))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove());

      chart
        .select(".xAxis")
        .call(d3.axisBottom(this.xTimeScale).ticks(this.boundedWidth / 80))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove());

      const tooltip = d3.select("#wd-tooltip");

      // Three function that change the tooltip when user hover / move / leave a cell
      const mouseover = function () {
        d3.select(this).attr("stroke-width", 3);
        tooltip.style("opacity", 0.7);
      };
      const mousemove = (event, d) => {
        const xLimit = this.boundedWidth - 70;
        const x = d3.min([d3.pointer(event)[0], xLimit]);
        tooltip
          //.html(`${d.events} commits on ${d.isoDate}`)
          .html(`${d.isoDate} - ${d.events} events`)
          .style("left", x + "px")
          .style("top", d3.pointer(event)[1] + "px");
      };
      const mouseleave = function () {
        d3.select(this).attr("stroke-width", 0.5);
        tooltip.style("opacity", 0);
      };

      let rects = chart.selectAll("rect").data(this.heatmapData);

      // Bars
      rects
        .enter()
        .append("rect")
        .merge(rects)
        .attr("x", (d) => this.xBand(`${d.weekYear} ${d.weekNumber}`))
        .attr("y", (d) => this.yBand(this.weekdays[d.weekday - 1]))
        //.attr("rx", 2)
        //.attr("ry", 2)
        .attr("width", d3.min([this.xBand.bandwidth(), this.yBand.bandwidth()]))
        .attr("height", this.yBand.bandwidth())
        .attr("fill", (d) =>
          d.events > 0 ? this.colorScale(d.events) : "#f8f8f8"
        )
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
.tick line {
  visibility: hidden;
}
</style>