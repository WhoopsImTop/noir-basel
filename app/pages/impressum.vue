<template>
  <article class="legal-page page-container pb-20 pt-32 sm:pt-36">
    <h1 class="section-heading text-3xl text-white sm:text-4xl">{{ t("pages.impressum.title") }}</h1>
    <section v-for="(sec, idx) in sections" :key="idx" class="mt-14 first:mt-10">
      <h2 class="font-heading text-lg text-white">{{ sec.title }}</h2>
      <p class="muted-copy mt-4 max-w-3xl whitespace-pre-line text-sm leading-relaxed">{{ sec.body }}</p>
    </section>
    <LegalFooter />
  </article>
</template>

<script setup>
const { t, tm, rt, locale } = useI18n();

const sections = computed(() => resolveI18nSections(tm("pages.impressum.sections"), rt));

useHead(() => ({
  title: t("pages.impressum.seoTitle"),
  htmlAttrs: {
    lang: toBcp47Locale(locale.value),
  },
  meta: [
    { name: "description", content: t("pages.impressum.seoDescription") },
    { property: "og:title", content: t("pages.impressum.seoTitle") },
    { property: "og:description", content: t("pages.impressum.seoDescription") },
  ],
}));
</script>
