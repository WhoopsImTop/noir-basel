<template>
  <section class="booking-shell px-4 mx-auto max-w-[700px] pb-16 pt-32 sm:pt-36 md:pb-20 md:pt-40">
    <div class="border border-neutral-800 bg-[#0A0A0A]/85 p-4">
      <h2 class="text-lg font-semibold text-neutral-200">{{ t("bookingFlow.success.heading") }}</h2>
      <hr class="my-4 border-neutral-800" />
      <p class="text-base text-neutral-400">{{ t("bookingFlow.success.intro") }}</p>

      <div v-if="booking" class="mt-6">
        <h3 class="text-lg font-semibold text-neutral-200">
          {{ t("bookingFlow.success.greeting", { name: displayName }) }}
        </h3>
        <p class="mt-3 text-base text-neutral-400">
          {{ t("bookingFlow.success.lookingForward", { date: displayDate, time: displayTime }) }}
        </p>

        <div class="mt-6 border-t border-neutral-800 pt-6">
          <h4 class="text-base font-semibold text-neutral-200">{{ t("bookingFlow.success.addressTitle") }}</h4>
          <p class="mt-2 text-sm text-neutral-400">{{ t("bookingFlow.success.addressNotice") }}</p>
          <p class="mt-3 text-sm leading-relaxed text-neutral-300">
            {{ t("pages.legalFooter.addressLine1") }}<br />
            {{ t("pages.legalFooter.addressLine2") }}<br />
            {{ t("pages.legalFooter.addressLine3") }}
          </p>
        </div>

        <hr class="my-6 border-neutral-800" />
        <dl class="space-y-2 text-sm text-neutral-400">
          <div class="flex flex-wrap gap-2">
            <dt class="text-neutral-500">{{ t("bookingFlow.success.labelDate") }}</dt>
            <dd class="text-neutral-200">{{ displayDate }}</dd>
          </div>
          <div class="flex flex-wrap gap-2">
            <dt class="text-neutral-500">{{ t("bookingFlow.success.labelTime") }}</dt>
            <dd class="text-neutral-200">{{ displayTime }}</dd>
          </div>
          <div class="flex flex-wrap gap-2">
            <dt class="text-neutral-500">{{ t("bookingFlow.success.labelLocation") }}</dt>
            <dd class="text-neutral-200">{{ t("bookingFlow.success.locationName") }}</dd>
          </div>
        </dl>
        <p class="mt-6 text-sm text-neutral-500">{{ t("bookingFlow.success.bookingNotice") }}</p>
      </div>
    </div>

    <NuxtLink
      :to="localePath('/')"
      class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold-500 hover:text-gold-400"
    >
      <img src="/arrow-left.svg" alt="" class="h-4 w-4" width="16" height="16" />
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
