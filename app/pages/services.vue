<template>
  <div ref="pageRoot" class="pb-24 pt-32 sm:pt-36">
    <section class="page-container motion-section">
      <div class="motion-services-hero border-b border-[#C0C0C0]/10 pb-10 sm:pb-14">
        <p class="eyebrow">{{ t("servicesPage.eyebrow") }}</p>
        <h1 class="section-heading mt-6 max-w-4xl text-4xl text-white sm:text-5xl lg:text-6xl">
          {{ t("servicesPage.title") }}
        </h1>
        <p class="muted-copy mt-6 max-w-2xl text-base leading-8 sm:text-lg">
          {{ t("servicesPage.description") }}
        </p>
      </div>
    </section>

    <section class="page-container motion-section mt-12">
      <div
        class="motion-price-shell overflow-hidden border border-[#C0C0C0]/12 bg-[#0A0A0A]/55 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.65)]"
      >
        <div
          class="hidden border-b border-[#C0C0C0]/10 px-6 py-3.5 text-[10px] uppercase tracking-[0.24em] text-[#C0C0C0]/40 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_7.5rem_6.5rem] lg:gap-10 lg:px-10"
        >
          <span>{{ t("servicesPage.columns.service") }}</span>
          <span class="text-right">{{ t("servicesPage.columns.duration") }}</span>
          <span class="text-right">{{ t("servicesPage.columns.price") }}</span>
        </div>

        <div v-if="servicesPending" class="px-6 py-16 text-center text-sm text-white/55 sm:px-8">
          {{ t("servicesPage.loading") }}
        </div>

        <div v-else-if="servicesError" class="px-6 py-16 text-center text-sm text-white/70 sm:px-8">
          {{ t("servicesPage.error") }}
        </div>

        <div v-else class="divide-y divide-[#C0C0C0]/[0.08]">
          <article
            v-for="service in serviceRows"
            :key="service.id"
            class="motion-price-row group grid grid-cols-1 gap-y-6 px-6 py-7 transition-[background-color] duration-500 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_7.5rem_6.5rem] lg:gap-x-10 lg:gap-y-0 lg:items-start lg:px-10 lg:py-7 hover:bg-[#121212]/90"
          >
            <div class="min-w-0">
              <h2 class="font-heading text-xl font-medium tracking-[0.02em] text-white sm:text-2xl">
                {{ service.name }}
              </h2>
              <p
                v-if="service.description"
                class="mt-2 max-w-2xl text-sm leading-relaxed text-white/58 sm:mt-3 sm:text-[0.9375rem] sm:leading-7"
              >
                {{ service.description }}
              </p>
            </div>

            <div
              class="grid grid-cols-2 gap-6 border-t border-[#C0C0C0]/[0.06] pt-5 sm:gap-10 lg:contents lg:border-0 lg:pt-0"
            >
              <div class="min-w-0 lg:text-right">
                <p class="text-[10px] uppercase tracking-[0.22em] text-[#C0C0C0]/42 lg:sr-only">
                  {{ t("servicesPage.columns.duration") }}
                </p>
                <p class="mt-1 text-sm tabular-nums tracking-wide text-white/75 lg:mt-0">
                  {{
                    service.durationMinutes
                      ? `${service.durationMinutes} ${t("bookingFlow.common.minutes")}`
                      : t("bookingFlow.common.emDash")
                  }}
                </p>
              </div>
              <div class="min-w-0 text-right">
                <p class="text-[10px] uppercase tracking-[0.22em] text-[#C0C0C0]/42 lg:sr-only">
                  {{ t("servicesPage.columns.price") }}
                </p>
                <p class="mt-1 font-heading text-lg tabular-nums tracking-wide text-[#C0C0C0] sm:text-xl lg:mt-0">
                  {{ formatPrice(service.price) }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="mt-8 flex flex-wrap justify-end gap-3 sm:mt-10">
        <NuxtLink
          :to="localePath('/online-booking')"
          class="inline-flex min-h-10 items-center justify-center bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0]"
        >
          {{ t("servicesPage.bookNow") }}
        </NuxtLink>
        <a
          :href="`${localePath('/')}#book`"
          class="inline-flex min-h-10 items-center justify-center border border-[#C0C0C0]/25 px-6 py-3 text-xs uppercase tracking-[0.2em] text-[#C0C0C0] duration-500 hover:border-[#C0C0C0]/45 hover:text-white"
        >
          {{ t("servicesPage.alternateContact") }}
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const pageRoot = ref(null);

const { data: servicesData, pending: servicesPending, error: servicesError } = useFetch(
  "https://barber-mo.com/api/service",
);

const serviceRows = computed(() =>
  (servicesData.value || [])
    .filter((item) => item?.name && typeof item?.price === "number")
    .sort((a, b) => a.price - b.price)
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      durationMinutes: item.step || null,
    })),
);

const formatPrice = (price) => {
  if (typeof price !== "number") {
    return "—";
  }
  return new Intl.NumberFormat(locale.value === "de" ? "de-CH" : "en-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(price);
};

onMounted(async () => {
  await nextTick();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.context(() => {
    gsap.from(".motion-services-hero > *", {
      y: 24,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
    });

    gsap.from(".motion-price-shell", {
      y: 24,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".motion-price-shell",
        start: "top 82%",
      },
    });

    gsap.utils.toArray(".motion-price-row").forEach((row, index) => {
      gsap.from(row, {
        y: 16,
        opacity: 0,
        duration: 0.45,
        delay: index * 0.035,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".motion-price-shell",
          start: "top 82%",
        },
      });
    });
  }, pageRoot.value);
});

useHead(() => ({
  title: t("servicesPage.seoTitle"),
  htmlAttrs: {
    lang: locale.value === "de" ? "de-CH" : "en-CH",
  },
  meta: [
    { name: "description", content: t("servicesPage.seoDescription") },
    { property: "og:title", content: t("servicesPage.seoTitle") },
    { property: "og:description", content: t("servicesPage.seoDescription") },
  ],
}));
</script>
