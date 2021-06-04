<template>
  <div ref="div" class="card">
    <div class="card-body chart-card">
      <h6 v-if="title" class="card-title"><activity-icon /> {{ title }}</h6>
      <button class="btn btn-outline-secondary" @click="toggleWeeksOrDays">
        {{ weeksOrDays }}
      </button>
      <svg :width="width" :height="height" :viewbox="`0 0 ${width} ${height}`">
        <g
          id="events-over-time-chart"
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
import { useStore } from "vuex";
import { DateTime } from "luxon";
import { computed, defineComponent, watch, ref } from "vue";
import ActivityIcon from "../icons/ActivityIcon";
import useResponsiveWidth from "../../composables/useResponsiveWidth";
import { eventTypeColor } from "../../common";

export default defineComponent({
  components: { ActivityIcon },
  setup() {
    const title = "User interactions over time";
    const { div, width } = useResponsiveWidth();

    const height = 400;
    const margin = {
      top: 10,
      right: 10,
      left: 30,
      bottom: 20,
    };

    const weeksOrDays = ref("Weeks");
    const toggleWeeksOrDays = () => {
      if (weeksOrDays.value === "Weeks") {
        weeksOrDays.value = "Days";
      } else {
        weeksOrDays.value = "Weeks";
      }
    };

    const store = useStore();
    const events = computed(() => store.state.assessment.events.all);

    const boundedWidth = computed(
      () => width.value - margin.left - margin.right
    );
    const boundedHeight = height - margin.top - margin.bottom;

    function* days(interval) {
      let cursor = interval.start.startOf("day");
      while (cursor <= interval.end) {
        yield cursor.toISODate();
        cursor = cursor.plus({ days: 1 });
      }
    }

    function* weeks(interval) {
      let cursor = interval.start.startOf("week");
      while (cursor <= interval.end) {
        yield cursor.toISODate();
        cursor = cursor.plus({ week: 1 });
      }
    }

    const eventTypes = store.getters["assessment/events/types"];

    const interval = store.getters["assessment/interval"];
    const preparedData = computed(() => {
      const createDateObj = (date) => {
        const dateObj = { date, total: 0 };
        eventTypes.forEach((et) => (dateObj[et] = 0));
        return dateObj;
      };
      const dates =
        weeksOrDays.value === "Weeks"
          ? Array.from(weeks(interval)).map((date) => createDateObj(date))
          : Array.from(days(interval)).map((date) => createDateObj(date));
      for (const event of events.value) {
        const eventDt = DateTime.fromISO(event.timestamp, {
          zone: store.getters.timeZone,
        });
        const dateObj = dates.find((o) => {
          if (weeksOrDays.value === "Weeks") {
            return o.date === eventDt.startOf("week").toISODate();
          }
          return o.date === eventDt.toISODate();
        });
        dateObj[event.type]++;
        dateObj.total++;
      }
      return dates;
    });

    const xBand = computed(() =>
      d3
        .scaleBand()
        .domain(preparedData.value.map((d) => new Date(d.date)))
        .range([0, boundedWidth.value])
        .padding(0.1)
    );

    const xScale = computed(() =>
      d3
        .scaleTime()
        .domain([interval.start.toJSDate(), interval.end.toJSDate()])
        .range([0, boundedWidth.value])
    );

    const yScale = computed(() =>
      d3
        .scaleLinear()
        .range([boundedHeight, 0])
        .domain([0, d3.max(preparedData.value, (d) => d.total)])
    );

    watch([preparedData, width], () => {
      const chart = d3.select("#events-over-time-chart");
      //const transitionDuration = 2000;
      const t = d3.transition().duration(2000);
      const stackedData = d3.stack().keys(eventTypes)(preparedData.value);
      chart
        .select(".yAxis")
        .transition(t)
        .call(d3.axisLeft(yScale.value).ticks(10));

      chart
        .select(".xAxis")
        .transition(t)
        .call(d3.axisBottom(xScale.value).ticks(boundedWidth.value / 80))
        .call((g) => g.selectAll(".tick line").remove());

      /*
      chart
        .select(".area")
        .datum(preparedData.value)
        .transition()
        .duration(transitionDuration)
        .attr(
          "d",
          d3
            .area()
            .x(
              (e) => xBand.value(new Date(e.date)) + xBand.value.bandwidth() / 2
            )
            .y0(() => yScale.value(0))
            .y1((e) => yScale.value(e.events))
            .curve(d3.curveMonotoneX)
        );
        */
      chart
        .selectAll(".area")
        .data(stackedData)
        .join("path")
        .attr("class", "area")
        .attr(
          "d",
          d3
            .area()
            .x(() => boundedWidth.value)
            .y0(() => yScale.value(0))
            .y1(() => yScale.value(0))
        )
        .transition(t)
        .attr(
          "d",
          d3
            .area()
            .x(
              (d) =>
                xBand.value(new Date(d.data.date)) + xBand.value.bandwidth() / 2
            )
            .y0((d) => yScale.value(d[0]))
            .y1((d) => yScale.value(d[1]))
            .curve(d3.curveMonotoneX)
        )
        .style("fill", (d) => eventTypeColor(d.key));
    });

    return {
      div,
      title,
      width,
      height,
      margin,
      boundedWidth,
      boundedHeight,
      weeksOrDays,
      toggleWeeksOrDays,
    };
  },
});
</script>