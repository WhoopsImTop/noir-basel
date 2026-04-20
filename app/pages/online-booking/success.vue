<template>
  <section class="booking-shell page-container pb-24 pt-32 sm:pt-36">
    <h1 class="section-heading text-3xl text-white sm:text-4xl">{{ t("bookingFlow.success.heading") }}</h1>
    <p class="muted-copy mt-4 max-w-xl text-sm leading-relaxed">{{ t("bookingFlow.success.intro") }}</p>

    <div v-if="booking" class="mt-8 border border-[#C0C0C0]/12 bg-[#1A1A1A]/40 px-5 py-6 text-sm text-white/75">
      <p><span class="text-[#C0C0C0]/55">{{ t("bookingFlow.success.labelName") }}:</span> {{ displayName }}</p>
      <p class="mt-2"><span class="text-[#C0C0C0]/55">{{ t("bookingFlow.success.labelDate") }}:</span> {{ displayDate }}</p>
      <p class="mt-2"><span class="text-[#C0C0C0]/55">{{ t("bookingFlow.success.labelTime") }}:</span> {{ displayTime }}</p>
      <p class="mt-2"><span class="text-[#C0C0C0]/55">{{ t("bookingFlow.success.labelLocation") }}:</span> {{ t("bookingFlow.success.locationName") }}</p>
    </div>

    <NuxtLink
      :to="localePath('/')"
      class="mt-10 inline-flex min-h-11 items-center border border-transparent bg-white px-6 py-3 text-xs uppercase tracking-[0.18em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0]"
    >
      {{ t("bookingFlow.success.homeCta") }}
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
import type { Appointment } from "~/types/booking";

const { t, locale } = useI18n();
const localePath = useLocalePath();

const booking = ref<Appointment | null>(null);
const displayName = computed(() => booking.value?.name || booking.value?.customer?.name || "—");
const displayDate = computed(() => {
  const value = booking.value?.date;
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  const loc = locale.value === "de" ? "de-CH" : "en-CH";
  return new Intl.DateTimeFormat(loc, { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
});
const displayTime = computed(() => booking.value?.time || "—");

onMounted(() => {
  const raw = localStorage.getItem("booking");
  if (raw) booking.value = JSON.parse(raw);
});

onBeforeUnmount(() => {
  localStorage.removeItem("booking");
});

useHead(() => ({
  title: t("bookingFlow.success.seoTitle"),
  htmlAttrs: {
    lang: locale.value === "de" ? "de-CH" : "en-CH",
  },
  meta: [
    { name: "description", content: t("bookingFlow.success.seoDescription") },
    { property: "og:title", content: t("bookingFlow.success.seoTitle") },
    { property: "og:description", content: t("bookingFlow.success.seoDescription") },
  ],
}));
</script>
