<template>
  <section class="booking-shell px-4 mx-auto max-w-[700px] pb-16 pt-32 sm:pt-36 md:pb-20 md:pt-40">
    <h1 class="section-heading text-3xl text-white sm:text-4xl">{{ t("bookingFlow.cancellation.heading") }}</h1>

    <p v-if="missingKey" class="mt-4 border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {{ t("bookingFlow.cancellation.missingKey") }}
    </p>

    <template v-else>
      <p class="muted-copy mt-3 max-w-xl text-sm leading-relaxed">{{ t("bookingFlow.cancellation.intro") }}</p>

      <div class="mt-8 border border-neutral-800 bg-[#0A0A0A]/85 p-4">
        <h2 class="text-base font-semibold text-neutral-200">
          {{ t("bookingFlow.cancellation.appointmentCardTitle") }}
        </h2>
        <hr class="my-4 border-neutral-800" />

        <dl class="space-y-2 text-sm text-neutral-400">
          <div class="flex flex-wrap gap-2">
            <dt class="text-neutral-500">{{ t("bookingFlow.success.labelDate") }}</dt>
            <dd class="text-neutral-200">{{ formattedDate }}</dd>
          </div>
          <div class="flex flex-wrap gap-2">
            <dt class="text-neutral-500">{{ t("bookingFlow.success.labelTime") }}</dt>
            <dd class="text-neutral-200">{{ formattedTime }}</dd>
          </div>
        </dl>

        <div v-if="serviceList.length" class="mt-4 border-t border-neutral-800 pt-4">
          <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">
            {{ t("bookingFlow.cancellation.labelServices") }}
          </p>
          <ul class="mt-2 space-y-1 text-sm text-neutral-300">
            <li v-for="service in serviceList" :key="service">{{ service }}</li>
          </ul>
        </div>
      </div>

      <div class="mt-6 border border-neutral-800 bg-[#0A0A0A]/85 p-4">
        <h2 class="text-base font-semibold text-neutral-200">
          {{ t("bookingFlow.cancellation.confirmSectionTitle") }}
        </h2>
        <hr class="my-4 border-neutral-800" />

        <p v-if="errorMessage" class="mb-4 border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {{ errorMessage }}
        </p>

        <label class="flex max-w-xl items-start gap-2 text-sm text-white/75">
          <input v-model="confirmed" type="checkbox" class="mt-1 h-4 w-4 accent-white" />
          <span>{{ t("bookingFlow.cancellation.confirmLabel") }}</span>
        </label>

        <button
          type="button"
          class="mt-6 min-h-11 w-full border border-transparent bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          :disabled="!confirmed || !keyValue || isSubmitting"
          @click="cancel"
        >
          {{ isSubmitting ? t("bookingFlow.cancellation.submitting") : t("bookingFlow.cancellation.submit") }}
        </button>
      </div>
    </template>

    <NuxtLink
      v-if="missingKey"
      :to="localePath('/online-booking')"
      class="mt-8 inline-flex min-h-11 items-center border border-transparent bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0]"
    >
      {{ t("bookingFlow.change.backToBooking") }}
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
import { ApiError, isApiError } from "~/utils/api";
import { formatBookingDate, formatBookingTime } from "~/utils/booking-datetime";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const api = useBookingApi();
const router = useRouter();
const route = useRoute();

const numberLocale = computed(() => (locale.value === "de" ? "de-CH" : "en-CH"));

const keyValue = computed(() => String(route.query.key || ""));
const missingKey = computed(() => !keyValue.value);
const date = computed(() => String(route.query.date || ""));
const time = computed(() => String(route.query.time || ""));
const servicesQuery = computed(() => String(route.query.services || ""));
const formattedDate = computed(() => (date.value ? formatBookingDate(date.value, numberLocale.value) : "—"));
const formattedTime = computed(() => (time.value ? formatBookingTime(time.value, numberLocale.value) : "—"));
const serviceList = computed(() =>
  servicesQuery.value
    .split(",")
    .map((service) => service.trim())
    .filter(Boolean),
);

const confirmed = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");

const mapCancelError = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return t("bookingFlow.cancellation.error");
  }
  const message = error.message.toLowerCase();
  if (error.status === 404) return t("bookingFlow.cancellation.invalidKey");
  if (error.status === 409 && message.includes("already been cancelled")) {
    return t("bookingFlow.cancellation.alreadyCancelled");
  }
  if (isApiError(error) && error.message.trim()) return error.message;
  return t("bookingFlow.cancellation.error");
};

const cancel = async () => {
  isSubmitting.value = true;
  errorMessage.value = "";
  try {
    await api.cancelAppointmentByKey(keyValue.value);
    await router.push(localePath("/online-booking/cancelled"));
  } catch (error) {
    errorMessage.value = mapCancelError(error);
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
