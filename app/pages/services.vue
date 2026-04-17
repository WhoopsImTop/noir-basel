<template>
  <div ref="pageRoot" class="pb-20 pt-28 sm:pt-32">
    <section class="page-container motion-section">
      <div class="motion-services-hero border-b border-white/10 pb-10 sm:pb-14">
        <p class="eyebrow">{{ t("servicesPage.eyebrow") }}</p>
        <h1 class="section-heading mt-6 max-w-4xl text-5xl uppercase text-white sm:text-7xl">
          {{ t("servicesPage.title") }}
        </h1>
        <p class="muted-copy mt-6 max-w-2xl text-base leading-8 sm:text-lg">
          {{ t("servicesPage.description") }}
        </p>
      </div>
    </section>

    <section class="page-container motion-section mt-12">
      <div class="motion-price-shell overflow-hidden rounded-sm border border-white/10 bg-white/3">
        <div class="grid grid-cols-[1.4fr_2.4fr_0.9fr_0.8fr] border-b border-white/10 px-5 py-4 text-xs uppercase tracking-[0.2em] text-white/45">
          <span>{{ t("servicesPage.columns.service") }}</span>
          <span class="hidden md:block">{{ t("servicesPage.columns.description") }}</span>
          <span class="text-right">{{ t("servicesPage.columns.duration") }}</span>
          <span class="text-right">{{ t("servicesPage.columns.price") }}</span>
        </div>

        <div v-if="servicesPending" class="px-5 py-8 text-sm text-white/60">
          {{ t("servicesPage.loading") }}
        </div>

        <div v-else-if="servicesError" class="px-5 py-8 text-sm text-white/70">
          {{ t("servicesPage.error") }}
        </div>

        <div v-else>
          <div
            v-for="service in serviceRows"
            :key="service.id"
            class="motion-price-row grid grid-cols-[1.4fr_2.4fr_0.9fr_0.8fr] items-start gap-3 border-b border-white/8 px-5 py-4 last:border-b-0"
          >
            <div>
              <p class="text-sm uppercase tracking-[0.12em] text-white">{{ service.name }}</p>
            </div>
            <p class="hidden text-sm leading-7 text-white/64 md:block">{{ service.description }}</p>
            <span class="text-right text-sm text-white/70">
              {{ service.durationMinutes ? `${service.durationMinutes} min` : "—" }}
            </span>
            <span class="text-right text-sm uppercase tracking-[0.08em] text-white/85">
              {{ formatPrice(service.price) }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap justify-end gap-3">
        <NuxtLink
          :to="localePath('/online-booking')"
          class="inline-flex items-center justify-center rounded-sm bg-white px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-black hover:opacity-90"
        >
          {{ t("servicesPage.bookNow") }}
        </NuxtLink>
        <a
          :href="`${localePath('/')}#book`"
          class="inline-flex items-center justify-center rounded-sm border border-white/16 px-5 py-3 text-xs uppercase tracking-[0.2em] text-white hover:border-white/30 hover:bg-white/6"
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

const { t } = useI18n();
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
  return new Intl.NumberFormat("de-CH", {
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

useHead({
  title: "Noir Basel - Services",
});
</script>
