<template>
  <button
    @click="createPdf"
    type="submit"
    class="btn btn-lg btn-outline-secondary"
    :disabled="creatingPdf"
  >
    <span v-if="creatingPdf">
      <span
        class="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      >
      </span>
      Rendering PDF..</span
    ><span v-else> <icon-download /> Export to PDF</span>
  </button>
</template>

<script>
import { useStore } from "vuex";
import { ref } from "vue";
import { jsPDF } from "jspdf";
import * as html2canvas from "html2canvas";
import { DateTime } from "luxon";
import IconDownload from "./icons/IconDownload.vue";

export default {
  components: { IconDownload },
  setup() {
    const store = useStore();
    const creatingPdf = ref(false);

    const createPdf = async () => {
      creatingPdf.value = true;
      await new Promise((res) => setTimeout(res, 50));
      let promises = [];
      for (const chart of document.getElementsByClassName("chart-card")) {
        promises.push(
          html2canvas(chart, {
            scrollX: 0,
            scrollY: -window.scrollY,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
          })
        );
      }
      Promise.all(promises).then((data) => {
        let pdf = new jsPDF();
        let y = 20;
        const margin = 40;
        for (const canvas of data) {
          let pdfImage = canvas.toDataURL("image/jpeg", 1);

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const imgProps = pdf.getImageProperties(pdfImage);
          const ratio = imgProps.height / imgProps.width;
          const targetImgWidth = pdfWidth - margin;
          const targetImgHeight = ratio * pdfWidth - margin * ratio;
          if (y + targetImgHeight + 5 > pdfHeight) {
            pdf.addPage();
            y = 20;
          }
          pdf.addImage(
            pdfImage,
            "JPEG",
            20,
            y,
            targetImgWidth,
            targetImgHeight
          );
          y += targetImgHeight + 5;
        }
        pdf.save(
          store.state.assessment.githubUsername + DateTime.now().toISO()
        );
        creatingPdf.value = false;
      });
    };
    return {
      creatingPdf,
      createPdf,
    };
  },
};
</script>