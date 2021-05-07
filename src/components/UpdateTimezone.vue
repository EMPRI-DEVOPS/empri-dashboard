<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <h5 class="card-title mb-3">Timezone</h5>
      <table class="table table-borderless table-hover">
        <tbody>
          <tr>
            <th style="width:40%">Current time zone</th>
            <td>{{ timeZone.name }}</td>
          </tr>
          <tr>
            <th>Alternative name</th>
            <td>{{ timeZone.alternativeName }}</td>
          </tr>
          <tr>
            <th>Country</th>
            <td>{{ timeZone.countryName }}</td>
          </tr>
        </tbody>
      </table>

      <div class="row mb-3">
        <label for="continent" class="col-sm-3 col-form-label">Continent</label>
        <div class="col-sm-9">
          <select
            name="continent"
            v-model="selectedContinent"
            class="form-select"
            aria-label="Select continent"
          >
            <option :value="null" disabled>Select a continent</option>
            <option v-for="(continent, index) in continents" :key="index">
              {{ continent }}
            </option>
          </select>
        </div>
      </div>
      <div class="row mb-3">
        <label for="timezone" class="col-sm-3 col-form-label">Timezone</label>
        <div class="col-sm-9">
          <select
            name="timezone"
            class="form-select"
            aria-label="Select time zone"
            v-model="newTimeZone"
            :disabled="!selectedContinent"
          >
            <option :value="null" disabled>Select a time zone</option>
            <option
              v-for="(timeZone, index) in continentTimeZones"
              :key="index"
            >
              {{ timeZone.name }}
            </option>
          </select>
        </div>
      </div>
      <button
        :disabled="!newTimeZone"
        @click="updateTimeZone"
        class="btn btn-outline-secondary"
      >
        Change
      </button>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, ref, toRefs } from "vue";
import { rawTimeZones } from "@vvo/tzdb";
import { patchUser } from "../api/user";

export default defineComponent({
  props: {
    time_zone: {
      type: String,
      required: true,
    },
  },
  emits: ["update:time_zone"],
  setup(props, { emit }) {
    const { time_zone } = toRefs(props);
    const timeZone = computed(
      () => rawTimeZones.filter((tz) => tz.name === time_zone.value)[0]
    );

    const selectedContinent = ref(null);
    const timeZonesByContinent = rawTimeZones.reduce((r, tZ) => {
      r[tZ.continentName] = [...(r[tZ.continentName] || []), tZ];
      return r;
    }, {});
    const continents = Object.keys(timeZonesByContinent);
    continents.sort();
    const continentTimeZones = computed(() => {
      const ctz = timeZonesByContinent[selectedContinent.value];
      if (!ctz) {
        return [];
      }
      ctz.sort((a, b) => a.name.localeCompare(b.name));
      return ctz;
    });
    const newTimeZone = ref("");
    const updateTimeZone = () => {
      patchUser({ time_zone: newTimeZone.value }).then(() => {
        emit("update:time_zone", newTimeZone.value)
        selectedContinent.value = null;
        newTimeZone.value = null;
      });
    };
    return {
      continents,
      timeZone,
      selectedContinent,
      continentTimeZones,
      newTimeZone,
      updateTimeZone,
    };
  },
});
</script>
