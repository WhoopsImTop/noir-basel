<template>
  <div id="home" ref="pageRoot" class="pb-20 pt-28 sm:pt-32">
    <section class="page-container motion-section">
      <div class="grid gap-10 xl:grid-cols-[1fr_0.9fr] xl:items-stretch">
        <div class="motion-hero-copy px-2 py-8 text-center xl:flex xl:flex-col xl:justify-center xl:px-8 xl:text-left">
          <h1
            class="section-heading mx-auto max-w-4xl text-5xl font-semibold uppercase text-white sm:text-7xl lg:text-[6rem] xl:mx-0 xl:max-w-3xl"
          >
            {{ t("hero.title") }}
          </h1>
          <p class="muted-copy mx-auto mt-6 max-w-xl text-base leading-8 sm:text-lg xl:mx-0">
            {{ t("hero.description") }}
          </p>

          <div class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center xl:justify-start">
            <NuxtLink
              :to="localePath('/online-booking')"
              class="inline-flex items-center justify-center rounded-sm bg-white px-6 py-3 text-sm font-medium uppercase tracking-[0.2em] text-black hover:-translate-y-0.5"
            >
              {{ t("hero.primaryCta") }}
            </NuxtLink>
            <a
              :href="localePath('/services')"
              class="inline-flex items-center justify-center rounded-sm border border-white/14 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white hover:border-white/28 hover:bg-white/5"
            >
              {{ t("hero.secondaryCta") }}
            </a>
          </div>
        </div>

        <aside class="motion-hero-image premium-panel relative min-h-[320px] overflow-hidden rounded-sm border border-white/10 bg-neutral-900 sm:min-h-[420px] xl:min-h-full xl:translate-x-8">
          <img
            src="/chill-lounge.jpeg"
            :alt="t('hero.imageAlt')"
            class="absolute inset-0 h-full w-full object-cover object-[42%_center] grayscale transition duration-500 hover:scale-[1.02]"
          />
          <div class="absolute inset-0 bg-linear-to-r from-black/12 via-transparent to-black/22" />
        </aside>
      </div>
    </section>

    <section id="services" class="page-container motion-section mt-24">
      <div class="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p class="eyebrow">{{ t("services.eyebrow") }}</p>
          <h2 class="section-heading mt-4 text-4xl uppercase text-white sm:text-6xl">
            {{ t("services.title") }}
          </h2>
          <p class="muted-copy mt-5 max-w-xl text-base leading-8">
            {{ t("services.description") }}
          </p>
        </div>

        <div v-if="servicesPending" class="rounded-sm border border-white/10 bg-white/3 p-6 text-sm text-white/60">
          {{ t("servicesPage.loading") }}
        </div>

        <div v-else-if="servicesError" class="rounded-sm border border-white/10 bg-white/3 p-6 text-sm text-white/70">
          {{ t("servicesPage.error") }}
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2">
          <article
            v-for="service in services"
            :key="service.id"
            class="motion-card premium-panel group rounded-sm border border-white/10 bg-white/3 p-6"
          >
            <p class="text-xs uppercase tracking-[0.22em] text-white/38">{{ t("services.eyebrow") }}</p>
            <div class="mt-8 flex items-end justify-between gap-4">
              <h3 class="text-2xl uppercase text-white">{{ service.name }}</h3>
              <span class="text-sm uppercase tracking-[0.18em] text-white/48">
                {{ service.durationMinutes ? `${service.durationMinutes} min` : "—" }}
              </span>
            </div>
            <p class="mt-4 text-sm leading-7 text-white/64">{{ service.description }}</p>
            <p class="mt-8 text-sm uppercase tracking-[0.22em] text-white/80 group-hover:text-white">
              {{ formatPrice(service.price) }}
            </p>
          </article>
        </div>

        <div class="lg:col-start-2">
          <a
            :href="localePath('/services')"
            class="mt-2 inline-flex items-center justify-center rounded-sm border border-white/16 px-5 py-3 text-xs uppercase tracking-[0.2em] text-white hover:border-white/30 hover:bg-white/6"
          >
            {{ t("hero.secondaryCta") }}
          </a>
        </div>
      </div>
    </section>

    <section id="academy" class="page-container motion-section mt-24">
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="premium-panel overflow-hidden rounded-sm border border-white/10">
          <img src="/chill-lounge.jpeg" :alt="t('academy.imageAlt')" class="h-full min-h-[320px] w-full object-cover grayscale" />
        </div>
        <div class="premium-panel rounded-sm border border-white/10 bg-white/3 px-6 py-8 sm:px-8 sm:py-10">
          <p class="eyebrow">{{ t("academy.eyebrow") }}</p>
          <h2 class="section-heading mt-4 text-4xl uppercase text-white sm:text-5xl">
            {{ t("academy.title") }}
          </h2>
          <p class="muted-copy mt-6 max-w-xl text-base leading-8">
            {{ t("academy.description") }}
          </p>
          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <div class="rounded-sm border border-white/10 bg-black/20 p-5">
              <p class="text-xs uppercase tracking-[0.22em] text-white/38">Module 01</p>
              <p class="mt-3 text-lg text-white">{{ t("academy.moduleOne") }}</p>
            </div>
            <div class="rounded-sm border border-white/10 bg-black/20 p-5">
              <p class="text-xs uppercase tracking-[0.22em] text-white/38">Module 02</p>
              <p class="mt-3 text-lg text-white">{{ t("academy.moduleTwo") }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="about" class="page-container motion-section mt-24">
      <div class="grid gap-10 border-y border-white/10 py-14 lg:grid-cols-3">
        <div>
          <p class="eyebrow">{{ t("about.eyebrow") }}</p>
          <h2 class="section-heading mt-4 text-4xl uppercase text-white sm:text-5xl">
            {{ t("about.title") }}
          </h2>
        </div>
        <div class="lg:col-span-2 grid gap-6 md:grid-cols-3">
          <div>
            <p class="text-sm uppercase tracking-[0.22em] text-white/36">01</p>
            <p class="mt-4 text-base leading-8 text-white/72">{{ t("about.pointOne") }}</p>
          </div>
          <div>
            <p class="text-sm uppercase tracking-[0.22em] text-white/36">02</p>
            <p class="mt-4 text-base leading-8 text-white/72">{{ t("about.pointTwo") }}</p>
          </div>
          <div>
            <p class="text-sm uppercase tracking-[0.22em] text-white/36">03</p>
            <p class="mt-4 text-base leading-8 text-white/72">{{ t("about.pointThree") }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="book" class="page-container motion-section mt-24">
      <div class="premium-panel rounded-sm border border-white/10 bg-white px-6 py-10 text-black sm:px-10 sm:py-12">
        <div class="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-black/45">{{ t("booking.eyebrow") }}</p>
            <h2 class="section-heading mt-4 text-4xl uppercase sm:text-6xl">
              {{ t("booking.title") }}
            </h2>
            <p class="mt-5 max-w-2xl text-base leading-8 text-black/70">
              {{ t("booking.description") }}
            </p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <NuxtLink
              :to="localePath('/online-booking')"
              class="inline-flex items-center justify-center rounded-sm bg-black px-6 py-3 text-sm uppercase tracking-[0.18em] text-white hover:opacity-90"
            >
              {{ t("booking.onlineCta") }}
            </NuxtLink>
            <a
              href="tel:+41610000000"
              class="inline-flex items-center justify-center rounded-sm border border-black/10 px-6 py-3 text-sm uppercase tracking-[0.18em] text-black hover:bg-black hover:text-white"
            >
              {{ t("booking.callCta") }}
            </a>
            <a
              href="mailto:hello@noirbasel.ch"
              class="inline-flex items-center justify-center rounded-sm border border-black/10 px-6 py-3 text-sm uppercase tracking-[0.18em] text-black hover:bg-black/5"
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

const { t } = useI18n();
const localePath = useLocalePath();
const pageRoot = ref(null);

const { data: servicesData, pending: servicesPending, error: servicesError } = useFetch(
  "https://barber-mo.com/api/service",
);

const services = computed(() =>
  (servicesData.value || [])
    .filter((item) => item?.name && typeof item?.price === "number")
    .sort((a, b) => a.price - b.price)
    .slice(0, 4)
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
    gsap.from(".motion-hero-copy > *", {
      y: 26,
      opacity: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: "power3.out",
    });

    gsap.from(".motion-hero-image", {
      y: 20,
      opacity: 0,
      scale: 1.02,
      duration: 1,
      ease: "power3.out",
      delay: 0.2,
    });

    gsap.utils.toArray(".motion-section").forEach((section) => {
      gsap.from(section, {
        y: 30,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
        },
      });
    });

    gsap.utils.toArray(".motion-card").forEach((card, index) => {
      gsap.from(card, {
        y: 18,
        opacity: 0,
        duration: 0.55,
        delay: index * 0.06,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
        },
      });
    });
  }, pageRoot.value);
});

useHead({
  title: "Noir Basel",
  meta: [
    {
      name: "description",
      content:
        "Noir Basel ist ein minimalistisches Premium-Friseurkonzept zwischen Editorial-Ästhetik, Hair Architecture und klarer Conversion.",
    },
  ],
});
</script>
