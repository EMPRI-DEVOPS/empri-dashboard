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
        <tbody>
          <tr v-for="(pair, index) in pairs" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ pair[0] }}:00</td>
            <td>{{ pair[1] }}:00</td>
          </tr>
        </tbody>
      </table>
      <div class="row mb-3">
        <div class="col-12">
          <button
            :disabled="user.day_time_ranges == handles"
            class="btn btn-outline-secondary"
            @click="save"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { create } from "nouislider";
import { ref, toRefs, defineComponent, onMounted, computed } from "vue";
import "nouislider/dist/nouislider.css";

export default defineComponent({
  props: ["user"],
  emits: ["update:user"],
  setup(props) {
    const { user } = toRefs(props);
    const handles = ref(user.value.day_time_ranges);

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

    return { handles, pairs, removeHandle, addHandle };
  },
  methods: {
    save() {
      const user = this.user;
      user.day_time_ranges = this.handles;
      this.$emit("update:user", user);
    },
  },
});
</script>

<style scoped>
</style>