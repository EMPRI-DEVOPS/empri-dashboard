<template>
  <div ref="div" class="card">
    <div class="card-body chart-card">
      <table class="table table-borderless table-hover">
        <h6 v-if="title" class="card-title"><info-icon /> {{ title }}</h6>

        <tbody>
          <tr>
            <th>Created at</th>
            <td>{{ assessmentDate }}</td>
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
  props: ["from", "to", "githubUsername"],
  setup(props) {
    const store = useStore();
    const assessmentDate = DateTime.now()
      .setZone(store.getters.timeZone)
      .toLocaleString(DateTime.DATETIME_MED);
    const fromDate = DateTime.fromISO(props.from)
      .setZone(store.getters.timeZone)
      .toLocaleString(DateTime.DATE_MED);
    const toDate = DateTime.fromISO(props.to)
      .setZone(store.getters.timeZone)
      .toLocaleString(DateTime.DATE_MED);
    const timeZone = store.getters.timeZone;
    const totalEventCount = store.getters.totalEventCount;
    const username = props.githubUsername.trim();
    return {
      title: "Assessment",
      assessmentDate,
      fromDate,
      toDate,
      timeZone,
      totalEventCount,
      username
    };
  },
});
</script>
