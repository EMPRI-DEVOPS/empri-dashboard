import { ref, onMounted } from "vue";

export default function useResponsiveWidth() {
    const width = ref(700);
    const div = ref(null);
    onMounted(() => {
        width.value = div.value.offsetWidth;
        window.addEventListener("resize", () => {
            if (div.value !== null) {
                width.value = div.value.offsetWidth;
            }
        });
    });
    return {
        div, width
    }
}