<template>
  <div id="home" ref="pageRoot" class="pb-24">
    <section
      class="hero-fullscreen relative flex min-h-dvh w-full items-end"
      aria-labelledby="hero-heading"
    >
      <div class="motion-hero-bg pointer-events-none absolute inset-0 overflow-hidden bg-[#0A0A0A]">
        <div
          class="hero-media-breathe absolute inset-0 origin-center will-change-transform"
          aria-hidden="true"
        >
          <img
            :src="heroImage.src"
            :alt="t('hero.imageAlt')"
            width="1920"
            height="1080"
            class="absolute inset-0 h-full w-full object-cover grayscale contrast-[0.94]"
            :style="{ objectPosition: heroImage.objectPosition }"
            fetchpriority="high"
            decoding="async"
          />
        </div>
        <div class="absolute inset-0 bg-[#0A0A0A]/45" />
        <div class="absolute inset-0 bg-linear-to-b from-[#0A0A0A]/70 via-[#0A0A0A]/25 to-[#0A0A0A]/88" />
        <div class="absolute inset-0 bg-linear-to-r from-[#0A0A0A]/50 via-transparent to-[#0A0A0A]/35" />
      </div>

      <div class="page-container relative z-10 w-full pb-14 pt-28 sm:pb-20 sm:pt-32 lg:pb-24">
        <div class="motion-hero-copy mx-auto flex max-w-3xl flex-col items-center px-1 text-center lg:max-w-4xl">
          <p class="eyebrow text-[#C0C0C0]">{{ t("hero.eyebrow") }}</p>
          <h1
            id="hero-heading"
            class="section-heading mt-6 text-4xl font-medium leading-[1.08] text-white sm:text-5xl lg:text-6xl"
          >
            {{ t("hero.title") }}
          </h1>
          <p class="muted-copy mt-8 max-w-md text-base leading-relaxed sm:text-lg">
            {{ t("hero.description") }}
          </p>

          <div class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <NuxtLink
              :to="localePath('/online-booking')"
              class="inline-flex min-h-11 min-w-[11rem] items-center justify-center bg-white px-8 py-3 text-xs font-medium tracking-[0.22em] text-[#0A0A0A] duration-500 ease-out hover:bg-[#C0C0C0]"
            >
              {{ t("hero.primaryCta") }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/services')"
              class="inline-flex min-h-11 min-w-[11rem] items-center justify-center border border-[#C0C0C0]/35 px-8 py-3 text-xs tracking-[0.22em] text-[#C0C0C0] duration-500 ease-out hover:border-[#C0C0C0]/55 hover:text-white"
            >
              {{ t("hero.secondaryCta") }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section id="services" class="page-container motion-section mt-28 sm:mt-36" aria-labelledby="services-heading">
      <div class="flex flex-col gap-8 border-b border-[#C0C0C0]/10 pb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-12 sm:pb-12">
        <header class="max-w-xl">
          <p class="eyebrow">{{ t("services.eyebrow") }}</p>
          <h2 id="services-heading" class="section-heading mt-5 text-3xl text-white sm:text-4xl lg:text-5xl">
            {{ t("services.title") }}
          </h2>
          <p class="muted-copy mt-6 text-base leading-relaxed">
            {{ t("services.description") }}
          </p>
        </header>

        <NuxtLink
          :to="localePath('/services')"
          class="inline-flex shrink-0 min-h-10 items-center justify-center gap-2 border border-[#C0C0C0]/25 px-6 py-2.5 text-[10px] uppercase tracking-[0.24em] text-[#C0C0C0] duration-500 hover:border-[#C0C0C0]/45 hover:text-white sm:mb-1"
        >
          {{ t("hero.secondaryCta") }}
          <img src="/arrow-right.svg" alt="" width="12" height="12" class="opacity-60" aria-hidden="true" />
        </NuxtLink>
      </div>

      <div
        v-if="topSellersPending"
        class="mt-12 border border-[#C0C0C0]/12 bg-[#0A0A0A]/55 px-8 py-16 text-center text-sm text-white/55 sm:px-10"
      >
        {{ t("services.loading") }}
      </div>

      <div
        v-else-if="topSellersError"
        class="mt-12 border border-[#C0C0C0]/12 bg-[#0A0A0A]/55 px-8 py-16 text-center text-sm text-white/70 sm:px-10"
      >
        {{ t("services.error") }}
      </div>

      <div
        v-else
        class="motion-services-grid mt-12 overflow-hidden border border-[#C0C0C0]/12 bg-[#0A0A0A]/40 shadow-[0_32px_80px_-28px_rgba(0,0,0,0.7)]"
      >
        <article
          v-for="(service, index) in topSellerCards"
          :key="service.id"
          class="motion-card group relative grid gap-6 border-t border-[#C0C0C0]/[0.08] px-6 py-8 transition-[background-color,border-color] duration-500 first:border-t-0 sm:px-8 sm:py-9 lg:grid-cols-[3.5rem_minmax(0,1fr)_auto] lg:items-center lg:gap-x-10 lg:px-10 lg:py-8 hover:bg-[#121212]/85 hover:border-[#C0C0C0]/14"
        >
          <span
            class="font-heading text-3xl leading-none tabular-nums text-[#C0C0C0]/18 transition-colors duration-500 group-hover:text-[#C0C0C0]/32 sm:text-4xl lg:text-[2.75rem]"
            aria-hidden="true"
          >
            {{ String(index + 1).padStart(2, "0") }}
          </span>

          <div class="min-w-0 lg:pr-4">
            <p class="text-[10px] uppercase tracking-[0.28em] text-[#C0C0C0]/50">
              {{ service.categoryName ?? t("servicesPage.uncategorized") }}
            </p>
            <h3 class="font-heading mt-3 text-xl font-medium tracking-[0.02em] text-white sm:text-2xl">
              {{ service.name }}
            </h3>
            <p
              v-if="service.description"
              class="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:mt-4 sm:text-[0.9375rem] sm:leading-7"
            >
              {{ service.description }}
            </p>
          </div>

          <div
            class="flex flex-wrap items-center justify-between gap-4 border-t border-[#C0C0C0]/[0.06] pt-5 sm:gap-6 lg:flex-col lg:items-end lg:justify-center lg:border-t-0 lg:pt-0 lg:text-right"
          >
            <span
              v-if="service.durationMinutes"
              class="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#C0C0C0]/45"
            >
              <span class="h-px w-6 bg-[#C0C0C0]/25 lg:hidden" aria-hidden="true" />
              {{ service.durationMinutes }} {{ t("bookingFlow.common.minutes") }}
            </span>
            <PriceDisplay
              class="font-heading text-lg tracking-wide text-[#C0C0C0] transition-colors duration-500 group-hover:text-white sm:text-xl"
              :price="service.price"
              :old-price="service.oldPrice"
              :locale="locale"
              wrapper-class="justify-end"
            />
          </div>

          <div
            class="pointer-events-none absolute inset-y-0 left-0 w-px scale-y-0 bg-linear-to-b from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:scale-y-100"
            aria-hidden="true"
          />
        </article>
      </div>

      <div class="mt-10 flex justify-center sm:justify-end">
        <NuxtLink
          :to="localePath('/online-booking')"
          class="inline-flex min-h-11 items-center justify-center bg-white px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0]"
        >
          {{ t("hero.primaryCta") }}
        </NuxtLink>
      </div>
    </section>

    <section id="gallery" class="page-container motion-section mt-28 sm:mt-36" aria-labelledby="gallery-heading">
      <header class="max-w-2xl">
        <p class="eyebrow">{{ t("gallery.eyebrow") }}</p>
        <h2 id="gallery-heading" class="section-heading mt-5 text-3xl text-white sm:text-4xl lg:text-5xl">
          {{ t("gallery.title") }}
        </h2>
        <p class="muted-copy mt-6 text-base leading-relaxed">
          {{ t("gallery.description") }}
        </p>
      </header>

      <InteriorGallerySlider class="mt-14" :slides="galleryImages" />
    </section>

    <section id="about" class="page-container motion-section mt-28 sm:mt-36" aria-labelledby="about-heading">
      <div class="grid gap-14 border-y border-[#C0C0C0]/10 py-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-20 lg:py-20">
        <figure class="relative aspect-[4/5] overflow-hidden bg-[#1A1A1A] sm:max-w-md lg:max-w-none">
          <img
            src="/images/mo.png"
            :alt="t('about.imageAlt')"
            width="900"
            height="1125"
            class="h-full w-full object-cover object-center grayscale contrast-[0.95] transition duration-[1.4s] ease-out hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div>
          <header>
            <p class="eyebrow">{{ t("about.eyebrow") }}</p>
            <h2 id="about-heading" class="section-heading mt-5 text-3xl text-white sm:text-4xl">
              {{ t("about.title") }}
            </h2>
          </header>
          <div class="mt-10 space-y-6">
            <p
              v-for="(paragraph, index) in aboutParagraphs"
              :key="index"
              class="text-sm leading-relaxed text-white/65 sm:text-[0.9375rem]"
            >
              {{ paragraph }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="book" class="page-container motion-section mt-28 sm:mt-36" aria-labelledby="book-heading">
      <div class="border border-[#C0C0C0]/12 bg-[#1A1A1A]/40 px-8 py-12 sm:px-12 sm:py-14">
        <div class="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <header>
            <p class="text-[10px] uppercase tracking-[0.28em] text-[#C0C0C0]/45">{{ t("booking.eyebrow") }}</p>
            <h2 id="book-heading" class="section-heading mt-5 text-3xl text-white sm:text-4xl lg:text-5xl">
              {{ t("booking.title") }}
            </h2>
            <p class="muted-copy mt-6 max-w-xl text-base leading-relaxed">
              {{ t("booking.description") }}
            </p>
          </header>
          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-col xl:flex-row">
            <NuxtLink
              :to="localePath('/online-booking')"
              class="inline-flex min-h-11 items-center justify-center bg-white px-6 py-3 text-xs uppercase tracking-[0.2em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0]"
            >
              {{ t("booking.onlineCta") }}
            </NuxtLink>
            <a
              href="mailto:hello@noirbasel.ch"
              class="inline-flex min-h-11 items-center justify-center border border-[#C0C0C0]/30 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white duration-500 hover:border-white/50"
            >
              {{ t("booking.requestCta") }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const { t, locale, tm, rt } = useI18n();
const localePath = useLocalePath();
const pageRoot = ref(null);

const api = useBookingApi();
const {
  data: topSellersData,
  pending: topSellersPending,
  error: topSellersError,
} = useAsyncData("home-top-sellers", () => api.getTopSellerServices(4));

const mapTopSellerCard = (item) => ({
  id: item.id,
  name: item.name,
  description: item.description || "",
  price: item.price,
  oldPrice: item.old_price ?? item.oldPrice ?? null,
  durationMinutes: item.step || null,
  categoryName: item.category?.name ?? null,
});

const topSellerCards = computed(() =>
  (topSellersData.value || [])
    .filter((item) => item?.name && typeof item?.price === "number")
    .map(mapTopSellerCard),
);

const interiorBase = "/noir-basel-interieur";

const heroImage = {
  src: `${interiorBase}.jpeg`,
  objectPosition: "center 38%",
};

const galleryImages = [
  { src: `${interiorBase}.jpeg`, altKey: "gallery.alt4", objectPosition: "center 38%" },
  { src: `${interiorBase}-2.jpeg`, altKey: "gallery.alt1", objectPosition: "center 42%" },
  { src: `${interiorBase}-3.jpeg`, altKey: "gallery.alt2", objectPosition: "center 35%" },
  { src: `${interiorBase}-4.jpeg`, altKey: "gallery.alt3", objectPosition: "center 48%" },
];

const aboutParagraphs = computed(() => resolveI18nList(tm("about.paragraphs"), rt));

onMounted(async () => {
  await nextTick();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.context(() => {
    gsap.from(".motion-hero-copy > *", {
      y: 28,
      opacity: 0,
      duration: 1.25,
      stagger: 0.14,
      ease: "power3.out",
    });

    gsap.from(".motion-hero-bg", {
      opacity: 0,
      duration: 1.6,
      ease: "power3.out",
    });

    gsap.utils.toArray(".motion-section").forEach((section) => {
      gsap.from(section, {
        y: 36,
        opacity: 0,
        duration: 1.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 84%",
        },
      });
    });

    let homeCardsAnimated = false;
    const animateCards = () => {
      if (homeCardsAnimated) {
        return;
      }
      const cards = gsap.utils.toArray(".motion-card", pageRoot.value);
      if (!cards.length) {
        return;
      }
      homeCardsAnimated = true;
      cards.forEach((card, index) => {
        gsap.from(card, {
          y: 22,
          opacity: 0,
          duration: 0.75,
          delay: index * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
          },
        });
      });
    };

    watch(
      topSellerCards,
      (cards) => {
        if (cards.length) {
          nextTick(animateCards);
        }
      },
      { immediate: true },
    );

    const gallerySlider = pageRoot.value?.querySelector(".motion-gallery-slider");
    if (gallerySlider) {
      gsap.from(gallerySlider, {
        y: 24,
        opacity: 0,
        duration: 1.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: gallerySlider,
          start: "top 90%",
        },
      });
    }
  }, pageRoot.value);
});

useHead(() => ({
  title: t("seo.title"),
  htmlAttrs: {
    lang: toBcp47Locale(locale.value),
  },
  meta: [
    {
      name: "description",
      content: t("seo.description"),
    },
    {
      property: "og:title",
      content: t("seo.title"),
    },
    {
      property: "og:description",
      content: t("seo.description"),
    },
  ],
}));
</script>

<style scoped>
@keyframes hero-media-breathe {
  0%,
  100% {
    transform: scale(1.03);
  }
  50% {
    transform: scale(1.08);
  }
}

.hero-media-breathe {
  animation: hero-media-breathe 22s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hero-media-breathe {
    animation: none;
    transform: scale(1.04);
  }
}
</style>
