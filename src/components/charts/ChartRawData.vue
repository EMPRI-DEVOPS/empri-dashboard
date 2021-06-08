<template>
  <div class="col-xl-12">
    <div ref="div" class="card">
      <div class="card-body chart-card">
        <h6 v-if="title" class="card-title"><icon-database /> {{ title }}</h6>

        <div class="col-lg-1 col-sm-3 col-xs-5 p-2">
          <select
            v-model="pageLimit"
            class="form-select"
            aria-label="Select pagination size"
          >
            <option
              v-for="pageLimitValue of pageLimitValues"
              :key="pageLimitValue"
            >
              {{ pageLimitValue }}
            </option>
          </select>
        </div>

        <table class="table table-bordered table-sm table-striped">
          <thead>
            <tr>
              <th style="width: 40px">#</th>
              <th style="width: 10%">Tool</th>
              <th style="width: 10%">Type</th>
              <th style="width: 45%">Message Or Title</th>
              <th style="width: 25%">Repo</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(event, index) of eventsPage" :key="index">
              <th>{{ (page - 1) * pageLimit + index + 1 }}</th>
              <td
                nowrap="nowrap"
                style="
                  max-width: 0;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              >
                {{ event.tool }}
              </td>
              <td>{{ event.type }}</td>
              <td
                nowrap="nowrap"
                style="
                  max-width: 0;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              >
                {{ event.title || event.message }}
              </td>
              <td
                nowrap="nowrap"
                style="
                  max-width: 0;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              >
                {{ event.repo }}
              </td>
              <td>{{ event.timestamp }}</td>
            </tr>
          </tbody>
        </table>
        <div class="d-flex flex-row justify-content-between">
          <p class="text">
            {{ beginIdx + 1 }} to {{ Math.min(endIdx + 1, totalCount) }} out of
            {{ totalCount }}
          </p>
          <nav aria-label="Pagination">
            <div
              class="btn-group"
              role="group"
              aria-label="Basic outlined example"
            >
              <button
                type="button"
                :disabled="page === 1"
                @click="page--"
                class="btn btn-outline-secondary"
              >
                <icon-chevron-left />
              </button>
              <button
                type="button"
                :disabled="page >= pageCount"
                @click="page++"
                class="btn btn-outline-secondary"
              >
                <icon-chevron-right />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import IconDatabase from "../icons/IconDatabase.vue";
import IconChevronLeft from "../icons/IconChevronLeft.vue";
import IconChevronRight from "../icons/IconChevronRight.vue";

export default defineComponent({
  components: {
    IconDatabase,
    IconChevronLeft,
    IconChevronRight,
  },
  setup() {
    const store = useStore();
    const pageLimitValues = [5, 10, 25, 50];
    const pageLimit = ref(10);
    const page = ref(1);
    const totalCount = computed(
      () => store.getters["assessment/events/totalCount"]
    );
    const beginIdx = computed(() => (page.value - 1) * pageLimit.value);
    const endIdx = computed(
      () => Math.min(page.value * pageLimit.value - 1),
      totalCount.value
    );
    const pageCount = computed(() =>
      Math.ceil(totalCount.value / pageLimit.value)
    );
    const eventsPage = computed(() =>
      store.getters["assessment/events/getPaginated"](
        beginIdx.value,
        endIdx.value
      )
    );
    watch([totalCount, pageLimit], () => {
      if (page.value * pageLimit.value - 1 > totalCount.value) {
        page.value = pageCount.value;
      }
    });

    return {
      title: "Pulled Data",
      pageLimitValues,
      pageLimit,
      beginIdx,
      endIdx,
      totalCount,
      page,
      pageCount,
      eventsPage,
    };
  },
});
</script>
