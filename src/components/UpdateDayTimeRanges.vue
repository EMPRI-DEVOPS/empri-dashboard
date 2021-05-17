<template>
  <div class="card shadow-sm">
    <div class="card-body mb-0 pb-0">
      <h5 class="card-title d-flex justify-content-between mb-3">
        <span>Time Windows</span>
        <span> </span>
      </h5>

      <div class="row mb-2" style="height: 80px">
        <div class="col-12">
          <div id="time-window-handles"></div>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-12">
          <div class="btn-group">
            <button
              class="btn btn-sm btn-outline-secondary"
              :disabled="handles[handles.length - 1] == 23"
              @click="addHandle"
            >
              Add Time Window
            </button>
            <button
              class="btn btn-sm btn-outline-secondary"
              :disabled="handles.length == 2"
              @click="removeHandle"
            >
              Remove Time Window
            </button>
          </div>
        </div>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>From</th>
            <th>To</th>
          </tr>
        </thead>
        <transition-group name="list" tag="tbody">
          <tr v-for="(pair, index) in pairs" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ pair[0] }}:00</td>
            <td>{{ pair[1] }}:00</td>
          </tr>
        </transition-group>
      </table>
      <div class="row mb-3">
        <div class="col-12">
          <div class="btn-group">
            <button
              :disabled="saved"
              class="btn btn-outline-secondary"
              @click="save"
            >
              Save
            </button>
            <button
              v-if="!saved"
              class="btn btn-outline-secondary"
              @click="reset"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { create } from "nouislider";
import { useStore } from "vuex";
import { defineComponent, onMounted, computed, ref } from "vue";

export default defineComponent({
  setup() {
    const store = useStore();
    const userSettings = computed(() => store.state.user.settings);
    const handles = ref(userSettings.value.day_time_ranges);
    const saved = computed(
      () =>
        JSON.stringify(userSettings.value.day_time_ranges) ==
        JSON.stringify(handles.value)
    );

    const destroySlider = () => {
      const slider = document.getElementById("time-window-handles");
      slider.noUiSlider.destroy();
    };
    const createSlider = () => {
      const slider = document.getElementById("time-window-handles");
      create(slider, getSliderConf(handles.value));
      slider.noUiSlider.on("change", (vals) => (handles.value = vals));
    };

    const getSliderConf = (values) => ({
      start: values,
      step: 1,
      margin: 1,
      range: {
        min: 0,
        max: 24,
      },
      padding: [0, 1],
      pips: {
        mode: "steps",
        density: 5,
      },
      format: {
        to: (val) => parseInt(val),
        from: (val) => parseInt(val),
      },
    });

    onMounted(() => {
      createSlider();
    });

    const pairs = computed(() => {
      let result = [];
      for (let i = 0; i < handles.value.length; i++) {
        if (i == handles.value.length - 1) {
          result.push([handles.value[i], handles.value[0]]);
        } else {
          result.push([handles.value[i], handles.value[i + 1]]);
        }
      }
      return result;
    });

    const removeHandle = () => {
      handles.value = handles.value.slice(0, handles.value.length - 1);
      destroySlider();
      createSlider();
    };

    const addHandle = () => {
      handles.value = [
        ...handles.value,
        handles.value[handles.value.length - 1] + 1,
      ];
      destroySlider();
      createSlider();
    };

    const save = () => {
      store.dispatch("updateUser", { day_time_ranges: handles.value });
    };

    const reset = () => {
      handles.value = userSettings.value.day_time_ranges;
      destroySlider();
      createSlider();
    };

    return { handles, pairs, removeHandle, addHandle, save, saved, reset };
  },
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(200px);
}
</style>