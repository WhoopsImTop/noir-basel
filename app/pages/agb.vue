<template>
  <article class="legal-page page-container pb-20 pt-32 sm:pt-36">
    <h1 class="section-heading max-w-4xl text-3xl text-white sm:text-4xl">{{ t("pages.agb.title") }}</h1>
    <section v-for="(sec, idx) in sections" :key="idx" class="mt-14 first:mt-10">
      <h2 class="font-heading text-lg text-white">{{ sec.title }}</h2>
      <p class="muted-copy mt-4 max-w-3xl text-sm leading-relaxed">{{ sec.body }}</p>
    </section>
    <LegalFooter />
  </article>
</template>

<script setup>
const { t, tm, locale } = useI18n();

const sections = computed(() => {
  const raw = tm("pages.agb.sections");
  return Array.isArray(raw) ? raw : [];
});

useHead(() => ({
  title: t("pages.agb.seoTitle"),
  htmlAttrs: {
    lang: locale.value === "de" ? "de-CH" : "en-CH",
  },
  meta: [
    { name: "description", content: t("pages.agb.seoDescription") },
    { property: "og:title", content: t("pages.agb.seoTitle") },
    { property: "og:description", content: t("pages.agb.seoDescription") },
  ],
}));
</script>
