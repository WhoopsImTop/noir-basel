<template>
  <section class="booking-shell page-container pb-24 pt-32 sm:pt-36 md:pt-40">
    <h1 class="section-heading text-3xl text-white sm:text-4xl">{{ t("bookingFlow.cancelled.heading") }}</h1>
    <p class="muted-copy mt-4 max-w-xl text-sm leading-relaxed">{{ t("bookingFlow.cancelled.intro") }}</p>
    <NuxtLink
      :to="localePath('/online-booking')"
      class="mt-10 inline-flex min-h-11 items-center border border-transparent bg-white px-6 py-3 text-xs uppercase tracking-[0.18em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0]"
    >
      {{ t("bookingFlow.cancelled.againCta") }}
    </NuxtLink>
  </section>
</template>

<script setup>
const { t, locale } = useI18n();
const localePath = useLocalePath();

useHead(() => ({
  title: t("bookingFlow.cancelled.seoTitle"),
  htmlAttrs: {
    lang: toBcp47Locale(locale.value),
  },
  meta: [
    { name: "description", content: t("bookingFlow.cancelled.seoDescription") },
    { property: "og:title", content: t("bookingFlow.cancelled.seoTitle") },
    { property: "og:description", content: t("bookingFlow.cancelled.seoDescription") },
  ],
}));
</script>
