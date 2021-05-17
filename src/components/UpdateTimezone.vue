<template>
  <div class="card shadow-sm">
    <div class="card-body mb-0 pb-0">
      <h5 class="card-title d-flex justify-content-between">
        <span> <globe-icon /> Timezone </span>
        <span>
          <collapse-button data-bs-target="#collapseTimezone" />
        </span>
      </h5>
    </div>
    <div class="collapse show" id="collapseTimezone">
      <ul class="list-group list-group-flush">
        <li class="list-group-item">
          <table class="table table-borderless table-hover mb-0">
            <tbody>
              <tr>
                <th style="width: 40%">Current time zone</th>
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
        </li>
        <li class="list-group-item">
          <div class="row mb-3">
            <label for="continent" class="col-sm-3 col-form-label"
              >Continent</label
            >
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
            <label for="timezone" class="col-sm-3 col-form-label"
              >Timezone</label
            >
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
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { rawTimeZones } from "@vvo/tzdb";
import GlobeIcon from "./icons/GlobeIcon";
import CollapseButton from "./CollapseButton.vue";

export default defineComponent({
  components: { GlobeIcon, CollapseButton },
  setup() {
    const store = useStore();
    const userSettings = computed(() => store.state.user.settings);
    const time_zone = computed(() => userSettings.value.time_zone);
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
      store
        .dispatch("updateUser", { time_zone: newTimeZone.value })
        .then(() => {
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
