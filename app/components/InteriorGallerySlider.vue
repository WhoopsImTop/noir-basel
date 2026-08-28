<template>
  <div
    ref="root"
    tabindex="0"
    class="motion-gallery-slider outline-none focus-visible:ring-1 focus-visible:ring-[#C0C0C0]/40"
    role="region"
    :aria-label="t('gallery.sliderAria')"
    @keydown.left.prevent="goPrev"
    @keydown.right.prevent="goNext"
  >
    <div
      ref="viewport"
      class="gallery-viewport -mx-1 flex h-[min(58vh,480px)] snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:h-[min(64vh,540px)] sm:gap-4 [&::-webkit-scrollbar]:hidden"
      @scroll.passive="onScroll"
    >
      <figure
        v-for="(slide, index) in slides"
        :key="slide.src"
        :ref="(el) => setSlideRef(el, index)"
        class="gallery-slide relative h-full shrink-0 snap-start overflow-hidden bg-[#141414]"
        :style="{ width: slideSlotWidth }"
      >
        <img
          :src="slide.src"
          :alt="t(slide.altKey)"
          class="absolute inset-0 h-full w-full object-cover grayscale contrast-[0.92]"
          :style="{ objectPosition: slide.objectPosition ?? 'center center' }"
          :loading="index < 2 ? 'eager' : 'lazy'"
          decoding="async"
        />
      </figure>
    </div>

    <div class="mt-6 flex flex-col gap-5 border-t border-[#C0C0C0]/10 pt-6 sm:flex-row sm:items-end sm:justify-between">
      <p class="max-w-lg text-[10px] uppercase tracking-[0.24em] text-white/55">
        <span class="text-white/85">{{ slideCounter }}</span>
        <span class="mx-2 text-white/25">/</span>
        {{ t(slides[activeIndex]?.altKey ?? slides[0].altKey) }}
      </p>

      <div class="flex items-center justify-between gap-6 sm:justify-end">
        <div
          class="flex gap-1.5"
          role="tablist"
          :aria-label="t('gallery.dotsAria')"
        >
          <button
            v-for="page in pageCount"
            :key="page"
            type="button"
            role="tab"
            class="h-px transition-all duration-500"
            :class="
              page - 1 === activeIndex
                ? 'w-8 bg-white'
                : 'w-4 bg-[#C0C0C0]/35 hover:bg-[#C0C0C0]/60'
            "
            :aria-selected="page - 1 === activeIndex"
            :aria-label="t('gallery.goToSlide', { n: page })"
            @click="goTo(page - 1)"
          />
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center border border-[#C0C0C0]/25 text-[#C0C0C0] duration-500 hover:border-white/40 hover:text-white"
            :aria-label="t('gallery.prev')"
            @click="goPrev"
          >
            <img src="/arrow-left.svg" alt="" width="14" height="14" class="opacity-80" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center border border-[#C0C0C0]/25 text-[#C0C0C0] duration-500 hover:border-white/40 hover:text-white"
            :aria-label="t('gallery.next')"
            @click="goNext"
          >
            <img src="/arrow-right.svg" alt="" width="14" height="14" class="opacity-80" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const GAP = 12;
const LG_BREAKPOINT = 1024;

const props = defineProps({
  slides: {
    type: Array,
    required: true,
  },
});

const { t } = useI18n();
const root = ref(null);
const viewport = ref(null);
const activeIndex = ref(0);
const slidesPerView = ref(1.5);
const slideElements = ref([]);
let autoplayTimer = null;
let scrollRaf = null;

const slideCount = computed(() => props.slides.length);

const gapCount = computed(() => Math.max(0, Math.ceil(slidesPerView.value) - 1));

const slideSlotWidth = computed(() => {
  const gaps = gapCount.value * GAP;
  return `calc((100% - ${gaps}px) / ${slidesPerView.value})`;
});

const maxIndex = computed(() => Math.max(0, Math.ceil(slideCount.value - slidesPerView.value)));

const pageCount = computed(() => maxIndex.value + 1);

const slideCounter = computed(() => {
  const current = String(activeIndex.value + 1).padStart(2, "0");
  const total = String(pageCount.value).padStart(2, "0");
  return `${current} · ${total}`;
});

const setSlideRef = (el, index) => {
  if (el) {
    slideElements.value[index] = el;
  }
};

const updateSlidesPerView = () => {
  if (typeof window === "undefined") {
    return;
  }
  slidesPerView.value = window.innerWidth >= LG_BREAKPOINT ? 2 : 1.5;
};

const getScrollStep = () => {
  const el = viewport.value;
  const slide = slideElements.value[0];
  if (!el || !slide) {
    return 0;
  }
  return slide.offsetWidth + GAP;
};

const scrollToIndex = (index, behavior = "smooth") => {
  const el = viewport.value;
  if (!el) {
    return;
  }
  const clamped = Math.min(Math.max(0, index), maxIndex.value);
  activeIndex.value = clamped;
  el.scrollTo({
    left: clamped * getScrollStep(),
    behavior: prefersReducedMotion() ? "auto" : behavior,
  });
};

const syncIndexFromScroll = () => {
  const el = viewport.value;
  const step = getScrollStep();
  if (!el || !step) {
    return;
  }
  const index = Math.round(el.scrollLeft / step);
  activeIndex.value = Math.min(Math.max(0, index), maxIndex.value);
};

const onScroll = () => {
  if (scrollRaf) {
    cancelAnimationFrame(scrollRaf);
  }
  scrollRaf = requestAnimationFrame(syncIndexFromScroll);
};

const goTo = (index) => {
  scrollToIndex(index);
};

const goNext = () => {
  if (activeIndex.value >= maxIndex.value) {
    scrollToIndex(0);
  } else {
    scrollToIndex(activeIndex.value + 1);
  }
};

const goPrev = () => {
  if (activeIndex.value <= 0) {
    scrollToIndex(maxIndex.value);
  } else {
    scrollToIndex(activeIndex.value - 1);
  }
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
};

const startAutoplay = () => {
  stopAutoplay();
  if (prefersReducedMotion() || pageCount.value < 2) {
    return;
  }
  autoplayTimer = setInterval(goNext, 7000);
};

const onResize = () => {
  updateSlidesPerView();
  nextTick(() => scrollToIndex(activeIndex.value, "auto"));
};

onMounted(() => {
  updateSlidesPerView();
  window.addEventListener("resize", onResize, { passive: true });
  startAutoplay();
  root.value?.addEventListener("mouseenter", stopAutoplay);
  root.value?.addEventListener("mouseleave", startAutoplay);
});

onBeforeUnmount(() => {
  stopAutoplay();
  if (scrollRaf) {
    cancelAnimationFrame(scrollRaf);
  }
  window.removeEventListener("resize", onResize);
  root.value?.removeEventListener("mouseenter", stopAutoplay);
  root.value?.removeEventListener("mouseleave", startAutoplay);
});

watch(maxIndex, (limit) => {
  if (activeIndex.value > limit) {
    scrollToIndex(limit, "auto");
  }
});
</script>
