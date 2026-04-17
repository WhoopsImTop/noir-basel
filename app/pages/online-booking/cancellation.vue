<template>
  <section class="page-container pb-16 pt-32 text-white">
    <h1 class="text-3xl font-semibold uppercase tracking-[0.1em]">Termin stornieren</h1>
    <p class="mt-3 text-white/70">Datum {{ formattedDate }}, Zeit {{ time || "-" }}</p>
    <p v-if="services" class="mt-2 text-sm text-white/60">Services: {{ services }}</p>

    <p v-if="errorMessage" class="mt-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <label class="mt-6 flex max-w-xl items-start gap-2 text-sm">
      <input v-model="confirmed" type="checkbox" class="mt-1 h-4 w-4 accent-white" />
      <span>Ich bestätige, dass ich den Termin verbindlich stornieren möchte.</span>
    </label>

    <button
      type="button"
      class="mt-4 rounded-sm bg-white px-5 py-3 text-sm font-medium uppercase tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="!confirmed || !keyValue || isSubmitting"
      @click="cancel"
    >
      {{ isSubmitting ? "Wird storniert..." : "Termin stornieren" }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { isApiError } from "~/utils/api";

const api = useBookingApi();
const router = useRouter();
const route = useRoute();

const keyValue = computed(() => String(route.query.key || ""));
const date = computed(() => String(route.query.date || ""));
const time = computed(() => String(route.query.time || ""));
const services = computed(() => String(route.query.services || ""));
const formattedDate = computed(() => {
  const value = date.value;
  if (!value) return "-";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("de-CH", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
});

const confirmed = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");

const cancel = async () => {
  isSubmitting.value = true;
  errorMessage.value = "";
  try {
    await api.cancelAppointmentByKey(keyValue.value);
    await router.push("/online-booking/cancelled");
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Storno fehlgeschlagen.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>
