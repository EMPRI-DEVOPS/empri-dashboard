<template>
  <div ref="div" class="card">
    <div class="card-body chart-card">
      <table class="table table-borderless table-hover">
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
            <th>Time range used</th>
            <td>{{ fromDate }} - {{ toDate }}</td>
          </tr>
          <tr>
            <th>Timezone used</th>
            <td>{{ timeZone }}</td>
          </tr>
          <tr>
            <th>Github username used</th>
            <td>{{ username }}</td>
          </tr>
          <tr v-for="type in userInteractionsByType" :key="type.type">
            <th>Interactions of type: {{ type.type }}</th>
            <td>{{ type.count }}</td>
          </tr>
          <tr>
            <th>Total user interactions found</th>
            <td>{{ totalEventCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
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
    const duration = store.getters["assessment/duration"];
    console.log(duration);
    const fromDate = DateTime.fromISO(store.state.assessment.fromDate)
      .setZone(store.getters.timeZone)
      .toLocaleString(DateTime.DATE_MED);
    const toDate = DateTime.fromISO(store.state.assessment.toDate)
      .setZone(store.getters.timeZone)
      .toLocaleString(DateTime.DATE_MED);
    const timeZone = store.getters.timeZone;
    const totalEventCount = store.getters["assessment/events/totalCount"];
    const username = store.state.assessment.githubUsername;
    const userInteractionsByType = store.getters["assessment/events/types"].map(
      (type) => ({
        type,
        count: store.getters["assessment/events/byType"](type).length,
      })
    );
    return {
      title: "Assessment",
      startedAt,
      completedAt,
      duration,
      fromDate,
      toDate,
      timeZone,
      totalEventCount,
      username,
      userInteractionsByType,
    };
  },
});
</script>
