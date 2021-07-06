<template>
  <div class="col-xl-6">
    <div ref="div" class="card">
      <div class="card-body chart-card">
        <table class="table table-hover">
          <h6 v-if="title" class="card-title"><info-icon /> {{ title }}</h6>

          <tbody>
            <tr>
              <th>Started at</th>
              <td>{{ startedAt }}</td>
            </tr>
            <tr>
              <th>Completed at</th>
              <td>{{ completedAt }}</td>
            </tr>
            <tr>
              <th>Time took</th>
              <td>{{ duration }} seconds</td>
            </tr>
            <tr>
              <th>Observation period</th>
              <td>{{ fromDate }} to {{ toDate }} - {{observationDays}} days</td>
            </tr>
            <tr>
              <th>Timezone used</th>
              <td>{{ timeZone }}</td>
            </tr>
            <tr>
              <th>Github interaction types pulled</th>
              <td>{{ githubEventTypes }}</td>
            </tr>
            <tr>
              <th>Total interactions</th>
              <td>{{totalCount}}</td>
            </tr>
            <tr>
              <th>Interactions per day avg.</th>
              <td>{{interactionsPerDay}}</td>
            </tr>
            <tr>
              <th>Days with no Interactions</th>
              <td>{{idleDays}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { DateTime } from "luxon";
import InfoIcon from "../icons/InfoIcon.vue";

export default defineComponent({
  components: {
    InfoIcon,
  },
  setup() {
    const store = useStore();
    const startedAt = DateTime.fromISO(store.state.assessment.startedAt, {
      zone: store.getters.timeZone,
    }).toLocaleString(DateTime.DATETIME_MED);
    const completedAt = DateTime.fromISO(store.state.assessment.completedAt)
      .setZone(store.getters.timeZone)
      .toLocaleString(DateTime.DATETIME_MED);

    const interval = store.getters['assessment/interval'];

    const duration = store.getters["assessment/duration"];
    const fromDate = interval.start.toLocaleString(DateTime.DATE_MED);
    const toDate = interval.end.minus({days : 1}).toLocaleString(DateTime.DATE_MED);
    const observationDays = interval.length('days');
    const totalCount = computed(
      () => store.getters["assessment/events/totalCount"]
    );
    const interactionsPerDay = computed(() => (totalCount.value / observationDays).toPrecision(4) );
    const idleDays = computed(() => {
      const days = store.getters["assessment/observedDays"];
      for (const event of store.getters["assessment/events/filtered"]) {
        const eventDay = DateTime.fromISO(event.timestamp, {
          zone: store.getters.timeZone,
        }).toISODate();
        const index = days.indexOf(eventDay);
        if (index > -1) {
          days.splice(index, 1);
        }
      }
      return days.length;
    })
    const timeZone = store.getters.timeZone;
    const githubEventTypes = store.state.assessment.githubEventTypes.join(", ");
    return {
      title: "Assessment",
      startedAt,
      completedAt,
      duration,
      fromDate,
      toDate,
      timeZone,
      githubEventTypes,
      observationDays,
      totalCount,
      interactionsPerDay,
      idleDays
    };
  },
});
</script>
