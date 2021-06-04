<template>
  <div ref="div" class="card">
    <div class="card-body chart-card">
      <h6 class="card-title">{{ title }}</h6>
      <svg :width="width" :height="height" :viewbox="`0 0 ${width} ${height}`">
        <g
          id="events-per-weekday-chart"
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
import { computed, watch } from "vue";
import { useStore } from "vuex";
import * as d3 from "d3";
import { DateTime } from "luxon";
import useResponsiveWidth from "../../composables/useResponsiveWidth";
import { weekdays, eventTypeColor } from "../../common";

export default {
  setup() {
    const store = useStore();
    const height = 200;
    const margin = {
      top: 10,
      right: 10,
      left: 70,
      bottom: 30,
    };
    const boundedHeight = height - margin.top - margin.bottom;
    const boundedWidth = computed(
      () => width.value - margin.left - margin.right
    );
    const { div, width } = useResponsiveWidth();

    const eventTypes = store.getters["assessment/events/types"];

    const eventsPerWeekday = computed(() => {
      const weekdayObjects = weekdays.map((weekday) => {
        const weekdayObject = {
          weekday,
          total: 0,
          idx: weekdays.findIndex((wd) => wd === weekday) + 1,
        };
        eventTypes.forEach((et) => (weekdayObject[et] = 0));
        return weekdayObject;
      });
      for (const event of store.state.assessment.events.all) {
        const weekday = DateTime.fromISO(event.timestamp).setZone(
          store.getters.timeZone
        ).weekday;
        const weekdayObject = weekdayObjects.find((obj) => obj.idx === weekday);
        weekdayObject[event.type]++;
        weekdayObject.total++;
      }
      return weekdayObjects;
    });

    const xScale = computed(() =>
      d3
        .scaleLinear()
        .domain([0, d3.max(eventsPerWeekday.value, (d) => d.total)])
        .range([0, boundedWidth.value])
    );

    const yScale = d3
      .scaleBand()
      .range([0, boundedHeight])
      .domain(weekdays)
      .padding(0.2);

    watch([width, eventsPerWeekday], () => {
      const chart = d3.select("#events-per-weekday-chart");
      chart
        .select(".yAxis")
        .call(d3.axisLeft(yScale))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove());

      chart
        .select(".xAxis")
        .call(d3.axisBottom(xScale.value))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove());

      const stackedEvents = d3.stack().keys(eventTypes)(eventsPerWeekday.value);
      chart.selectAll(".type").remove();

      const rects = chart
        .selectAll(".type")
        .data(stackedEvents, (d) => d)
        .join("g")
        .attr("fill", (d) => eventTypeColor(d.key))
        .attr("class", "type")
        .selectAll("rect")
        .data((d) => d)
        .join("rect")
        .attr("y", (d) => yScale(d.data.weekday))
        .attr("height", () => yScale.bandwidth())
        .attr("x", () => 0);
      rects
        .transition()
        .duration(2000)
        .attr("x", (d) => xScale.value(d[0]))
        .attr("width", (d) => xScale.value(d[1] - d[0]));
      rects
        .on("mouseover", function () {
          d3.select(this).attr("opacity", 0.7);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("opacity", 0.9);
        });
    });

    return {
      div,
      width,
      title: "User interactions per weekday",
      height,
      margin,
      boundedHeight,
      boundedWidth,
    };
  },
};
</script>