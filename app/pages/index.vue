<template>
  <div id="home" ref="pageRoot" class="pb-24 pt-32 sm:pt-36">
    <section class="page-container motion-section" aria-labelledby="hero-heading">
      <div class="grid gap-16 xl:grid-cols-[1fr_0.92fr] xl:items-stretch xl:gap-20">
        <div class="motion-hero-copy flex flex-col justify-center px-1 py-6 text-center xl:px-4 xl:text-left">
          <p class="eyebrow text-[#C0C0C0]">{{ t("hero.eyebrow") }}</p>
          <h1
            id="hero-heading"
            class="section-heading mx-auto mt-6 max-w-4xl text-4xl font-medium leading-[1.08] text-white sm:text-5xl lg:text-6xl xl:mx-0 xl:max-w-none"
          >
            {{ t("hero.title") }}
          </h1>
          <p class="muted-copy mx-auto mt-8 max-w-md text-base leading-relaxed sm:text-lg xl:mx-0">
            {{ t("hero.description") }}
          </p>

          <div class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center xl:justify-start">
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

        <figure class="motion-hero-image relative min-h-[340px] overflow-hidden bg-[#1A1A1A] sm:min-h-[440px] xl:min-h-full">
          <img
            :src="heroImage.src"
            :alt="t('hero.imageAlt')"
            width="1200"
            height="1500"
            class="absolute inset-0 h-full w-full object-cover object-[center_22%] grayscale contrast-[0.95] transition duration-[1.4s] ease-out hover:scale-[1.02]"
            fetchpriority="high"
            decoding="async"
          />
          <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0A0A0A]/55 via-transparent to-[#0A0A0A]/25" />
        </figure>
      </div>
    </section>

    <section id="services" class="page-container motion-section mt-28 sm:mt-36" aria-labelledby="services-heading">
      <div class="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-20">
        <header>
          <p class="eyebrow">{{ t("services.eyebrow") }}</p>
          <h2 id="services-heading" class="section-heading mt-5 text-3xl text-white sm:text-4xl lg:text-5xl">
            {{ t("services.title") }}
          </h2>
          <p class="muted-copy mt-6 max-w-md text-base leading-relaxed">
            {{ t("services.description") }}
          </p>
        </header>

        <div class="grid gap-px bg-[#C0C0C0]/12 sm:grid-cols-2">
          <article
            v-for="key in homeServiceKeys"
            :key="key"
            class="motion-card group bg-[#0A0A0A] p-8 sm:p-10"
          >
            <p class="text-[10px] uppercase tracking-[0.28em] text-[#C0C0C0]/55">
              {{ t(`services.items.${key}.kicker`) }}
            </p>
            <div class="mt-10 flex flex-wrap items-end justify-between gap-4">
              <h3 class="section-heading text-2xl text-white sm:text-[1.65rem]">
                {{ t(`services.items.${key}.title`) }}
              </h3>
              <span class="whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-[#C0C0C0]/45">
                {{ t(`services.items.${key}.duration`) }}
              </span>
            </div>
            <p class="mt-5 text-sm leading-relaxed text-white/58">
              {{ t(`services.items.${key}.copy`) }}
            </p>
            <p class="mt-10 text-xs uppercase tracking-[0.24em] text-[#C0C0C0] duration-500 group-hover:text-white">
              {{ t(`services.items.${key}.price`) }}
            </p>
          </article>
        </div>

        <div class="lg:col-start-2">
          <NuxtLink
            :to="localePath('/services')"
            class="inline-flex min-h-10 items-center justify-center border border-[#C0C0C0]/25 px-6 py-2.5 text-[10px] uppercase tracking-[0.24em] text-[#C0C0C0] duration-500 hover:border-[#C0C0C0]/45 hover:text-white"
          >
            {{ t("hero.secondaryCta") }}
          </NuxtLink>
        </div>
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

      <div class="mt-14 grid gap-2 sm:gap-3 lg:grid-cols-12 lg:grid-rows-2 lg:gap-3">
        <figure class="motion-gallery-cell relative aspect-[4/5] overflow-hidden bg-[#1A1A1A] sm:aspect-[5/4] lg:col-span-7 lg:row-span-2 lg:aspect-auto lg:min-h-[min(72vh,640px)]">
          <img
            :src="galleryImages[0].src"
            :alt="t(galleryImages[0].altKey)"
            width="900"
            height="1125"
            class="h-full w-full object-cover object-center grayscale contrast-[0.92] transition duration-[1.4s] ease-out hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <figure class="motion-gallery-cell relative aspect-[4/3] overflow-hidden bg-[#1A1A1A] lg:col-span-5 lg:aspect-auto lg:min-h-0">
          <img
            :src="galleryImages[1].src"
            :alt="t(galleryImages[1].altKey)"
            width="800"
            height="600"
            class="h-full min-h-[220px] w-full object-cover object-[center_30%] grayscale contrast-[0.92] transition duration-[1.4s] ease-out hover:scale-[1.02] lg:min-h-[calc((min(72vh,640px)-0.375rem)/2)]"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <figure class="motion-gallery-cell relative aspect-[4/3] overflow-hidden bg-[#1A1A1A] lg:col-span-5 lg:aspect-auto">
          <img
            :src="galleryImages[2].src"
            :alt="t(galleryImages[2].altKey)"
            width="800"
            height="600"
            class="h-full min-h-[220px] w-full object-cover object-[center_55%] grayscale contrast-[0.92] transition duration-[1.4s] ease-out hover:scale-[1.02] lg:min-h-[calc((min(72vh,640px)-0.375rem)/2)]"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <figure class="motion-gallery-cell relative col-span-full aspect-[21/9] overflow-hidden bg-[#1A1A1A] lg:col-span-12 lg:aspect-[21/6]">
          <img
            :src="galleryImages[3].src"
            :alt="t(galleryImages[3].altKey)"
            width="1600"
            height="457"
            class="h-full w-full object-cover object-[center_40%] grayscale contrast-[0.92] transition duration-[1.4s] ease-out hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </section>

    <section id="about" class="page-container motion-section mt-28 sm:mt-36" aria-labelledby="about-heading">
      <div class="grid gap-16 border-y border-[#C0C0C0]/10 py-16 lg:grid-cols-3 lg:gap-12 lg:py-20">
        <header>
          <p class="eyebrow">{{ t("about.eyebrow") }}</p>
          <h2 id="about-heading" class="section-heading mt-5 text-3xl text-white sm:text-4xl">
            {{ t("about.title") }}
          </h2>
        </header>
        <div class="lg:col-span-2 grid gap-12 sm:grid-cols-3 sm:gap-8">
          <div>
            <p class="font-heading text-sm text-[#C0C0C0]/40">01</p>
            <p class="mt-4 text-sm leading-relaxed text-white/65">{{ t("about.pointOne") }}</p>
          </div>
          <div>
            <p class="font-heading text-sm text-[#C0C0C0]/40">02</p>
            <p class="mt-4 text-sm leading-relaxed text-white/65">{{ t("about.pointTwo") }}</p>
          </div>
          <div>
            <p class="font-heading text-sm text-[#C0C0C0]/40">03</p>
            <p class="mt-4 text-sm leading-relaxed text-white/65">{{ t("about.pointThree") }}</p>
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
              href="tel:+41610000000"
              class="inline-flex min-h-11 items-center justify-center border border-[#C0C0C0]/30 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white duration-500 hover:border-white/50"
            >
              {{ t("booking.callCta") }}
            </a>
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

const { t, locale } = useI18n();
const localePath = useLocalePath();
const pageRoot = ref(null);

const homeServiceKeys = ["essential", "signature", "color", "consultation"];

/** Platzhalter aus `public/images/` — durch finale Assets ersetzbar. */
const cutting = "/images/cutting.jpeg";
const chillLounge = "/images/chill-lounge.jpeg";
const publicHomeImages = {
  hero: cutting,
  gallery: [cutting, chillLounge, cutting, chillLounge],
};

const heroImage = { src: publicHomeImages.hero };

const galleryAltKeys = ["gallery.alt1", "gallery.alt2", "gallery.alt3", "gallery.alt4"];

const galleryImages = publicHomeImages.gallery.map((src, index) => ({
  src,
  altKey: galleryAltKeys[index],
}));

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

    gsap.from(".motion-hero-image", {
      y: 24,
      opacity: 0,
      scale: 1.03,
      duration: 1.45,
      ease: "power3.out",
      delay: 0.25,
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

    gsap.utils.toArray(".motion-card").forEach((card, index) => {
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

    gsap.utils.toArray(".motion-gallery-cell").forEach((cell, index) => {
      gsap.from(cell, {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: index * 0.06,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cell,
          start: "top 92%",
        },
      });
    });
  }, pageRoot.value);
});

useHead(() => ({
  title: t("seo.title"),
  htmlAttrs: {
    lang: locale.value === "de" ? "de-CH" : "en-CH",
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
