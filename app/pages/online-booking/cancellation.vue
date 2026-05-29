<template>
  <section class="booking-shell page-container pb-24 pt-32 sm:pt-36 md:pt-40">
    <h1 class="section-heading text-3xl text-white sm:text-4xl">{{ t("bookingFlow.cancellation.heading") }}</h1>
    <p class="muted-copy mt-3 text-sm">
      {{ t("bookingFlow.cancellation.dateLine", { date: formattedDate, time: formattedTime }) }}
    </p>
    <p v-if="servicesQuery" class="mt-2 text-sm text-white/55">
      {{ t("bookingFlow.cancellation.servicesLine", { services: servicesQuery }) }}
    </p>

    <p v-if="errorMessage" class="mt-4 border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <label class="mt-8 flex max-w-xl items-start gap-2 text-sm text-white/75">
      <input v-model="confirmed" type="checkbox" class="mt-1 h-4 w-4 accent-white" />
      <span>{{ t("bookingFlow.cancellation.confirmLabel") }}</span>
    </label>

    <button
      type="button"
      class="mt-6 min-h-11 border border-transparent bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0] disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="!confirmed || !keyValue || isSubmitting"
      @click="cancel"
    >
      {{ isSubmitting ? t("bookingFlow.cancellation.submitting") : t("bookingFlow.cancellation.submit") }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { isApiError } from "~/utils/api";
import { formatBookingDate, formatBookingTime } from "~/utils/booking-datetime";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const api = useBookingApi();
const router = useRouter();
const route = useRoute();

const numberLocale = computed(() => (locale.value === "de" ? "de-CH" : "en-CH"));

const keyValue = computed(() => String(route.query.key || ""));
const date = computed(() => String(route.query.date || ""));
const time = computed(() => String(route.query.time || ""));
const servicesQuery = computed(() => String(route.query.services || ""));
const formattedDate = computed(() => formatBookingDate(date.value, numberLocale.value));
const formattedTime = computed(() => formatBookingTime(time.value, numberLocale.value));

const confirmed = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");

const cancel = async () => {
  isSubmitting.value = true;
  errorMessage.value = "";
  try {
    await api.cancelAppointmentByKey(keyValue.value);
    await router.push(localePath("/online-booking/cancelled"));
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : t("bookingFlow.cancellation.error");
  } finally {
    isSubmitting.value = false;
  }
};

useHead(() => ({
  title: t("bookingFlow.cancellation.seoTitle"),
  htmlAttrs: {
    lang: locale.value === "de" ? "de-CH" : "en-CH",
  },
  meta: [
    { name: "description", content: t("bookingFlow.cancellation.seoDescription") },
    { property: "og:title", content: t("bookingFlow.cancellation.seoTitle") },
    { property: "og:description", content: t("bookingFlow.cancellation.seoDescription") },
  ],
}));
</script>
