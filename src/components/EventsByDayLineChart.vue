<template>
  <div ref="div">
    <card :title="title">
      <svg width="100%" :height="height" :viewbox="`0 0 ${width} ${height}`">
        <g
          id="events-by-day-line-chart"
          :transform="`translate(${margin}, ${margin})`"
        >
          <g class="yAxis" fill="none" text-anchor="end"></g>
          <g
            class="xAxis"
            :transform="`translate(0, ${boundedHeight})`"
            fill="none"
            text-anchor="middle"
          ></g>
          <path
            class="line"
            fill="none"
            stroke="steelblue"
            stroke-width="2.5"
          ></path>
        </g>
      </svg>
    </card>
  </div>
</template>

<script>
import * as d3 from "d3";
import Card from "./Card.vue";
import { computed, ref, onMounted } from "vue";

export default {
  components: { Card },
  props: ["events"],
  watch: {
    width() {
      this.updateChart();
    },
    events() {
      this.updateChart();
    },
  },
  mounted() {
    this.updateChart();
  },
  setup(props) {
    const title = "User interactions per day";

    let width = ref(700);
    const height = 400;
    const margin = 32;

    const boundedWidth = computed(() => width.value - 2 * margin);
    const boundedHeight = height - 2 * margin;

    const div = ref(null);

    onMounted(() => {
      width.value = div.value.offsetWidth;
      window.addEventListener("resize", () => {
        if (div.value !== null) {
          width.value = div.value.offsetWidth;
        }
      });
    });

    const dateParser = d3.timeParse("%d.%m.%Y");

    const preparedData = computed(() => {
      let eventsByDay = [];

      for (let i = 0; i < props.events.length; i++) {
        const event = props.events[i];
        const date = new Date(event.timestamp);
        const day = d3.timeFormat("%d.%m.%Y")(date);
        const obj = eventsByDay.filter((o) => o.day === day)[0];
        if (obj) {
          obj.events += 1;
        } else {
          eventsByDay.unshift({
            day: day,
            events: 1,
          });
        }
      }

      const timeExtent = d3.extent(eventsByDay, (d) => dateParser(d.day));
      const allDays = d3.timeDay.range(timeExtent[0], timeExtent[1]);
      return allDays.map((day) => {
        const dayData = eventsByDay.find((ed) => {
          return dateParser(ed.day).toString() === day.toString();
        });
        return { events: dayData ? dayData.events : 0, day: day };
      });
    });

    const xBand = computed(() =>
      d3
        .scaleBand()
        .domain(preparedData.value.map((d) => d.day))
        .range([0, boundedWidth.value])
        .padding(0.1)
    );

    const xScale = computed(() =>
      d3
        .scaleTime()
        .domain(d3.extent(preparedData.value, (d) => d.day))
        .range([0, boundedWidth.value])
    );

    const yScale = d3
      .scaleLinear()
      .range([boundedHeight, 0])
      .domain([0, d3.max(preparedData.value, (d) => d.events)]);

    return {
      div,
      title,
      width,
      height,
      margin,
      boundedWidth,
      boundedHeight,
      yScale,
      xScale,
      xBand,
      preparedData,
      dateParser,
    };
  },
  methods: {
    updateChart() {
      const chart = d3.select("#events-by-day-line-chart");
      const transitionDuration = 2000;
      chart
        .select(".yAxis")
        .transition()
        .duration(3000)
        .call(d3.axisLeft(this.yScale).ticks(10));

      chart
        .select(".xAxis")
        .transition()
        .duration(transitionDuration)
        .call(d3.axisBottom(this.xScale));

      let rects = chart.selectAll("rect").data(this.preparedData);

      // Bars
      rects
        .enter()
        .append("rect")
        .merge(rects)
        .transition()
        .duration(transitionDuration)
        .attr("x", (e) => this.xBand(e.day))
        .attr("y", (e) => this.yScale(e.events))
        .attr("width", this.xBand.bandwidth())
        .attr("height", (e) => this.boundedHeight - this.yScale(e.events))
        .attr("fill", "#69b3a2");

      rects.exit().remove();

      chart
        .select(".line")
        .raise() // nach vorne bringen
        .datum(this.preparedData)
        .transition()
        .duration(transitionDuration)
        .attr(
          "d",
          d3
            .line()
            .x((e) => this.xBand(e.day) + this.xBand.bandwidth() / 2)
            .y((e) => this.yScale(e.events))
            .curve(d3.curveMonotoneX)
        );
    },
  },
};
</script>