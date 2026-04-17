<template>
  <header class="fixed inset-x-0 top-0 z-50 px-4 pt-4">
    <div
      class="page-container flex items-center justify-between rounded-sm border border-white/12 bg-black/78 px-4 py-3 backdrop-blur-md md:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-4"
    >
      <NuxtLink
        to="/"
        class="shrink-0 text-white"
        aria-label="Noir Basel Startseite"
      >
        <noir-logo class="h-4.5 w-auto md:h-5" />
      </NuxtLink>

      <nav class="mx-auto hidden items-center gap-10 lg:flex" aria-label="Hauptnavigation">
        <a
          v-for="item in navigationItems"
          :key="item.href"
          :href="item.href"
          class="relative text-xs uppercase tracking-[0.24em] text-white/64 hover:text-white"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="hidden items-center justify-end gap-3 lg:flex">
        <div
          class="flex items-center rounded-sm border border-white/10 bg-white/4 p-1"
          :aria-label="t('common.language')"
        >
          <button
            v-for="option in languageOptions"
            :key="option.code"
            type="button"
            :aria-pressed="locale === option.code"
            class="rounded-sm px-3 py-1 text-xs tracking-[0.22em]"
            :class="
              locale === option.code
                ? 'bg-white text-black'
                : 'text-white/64 hover:text-white'
            "
            @click="switchLanguage(option.code)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-sm border border-white/10 px-2 text-white lg:hidden"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-navigation"
        :aria-label="isMenuOpen ? 'Menü schliessen' : 'Menü öffnen'"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span class="text-[10px] tracking-[0.18em] text-white/72">MENU</span>
        <div class="flex flex-col gap-1">
          <span
            class="block h-px w-4 bg-current transition-transform duration-200"
            :class="isMenuOpen ? 'translate-y-[5px] rotate-45' : ''"
          />
          <span
            class="block h-px w-4 bg-current transition-opacity duration-200"
            :class="isMenuOpen ? 'opacity-0' : 'opacity-100'"
          />
          <span
            class="block h-px w-4 bg-current transition-transform duration-200"
            :class="isMenuOpen ? '-translate-y-[5px] -rotate-45' : ''"
          />
        </div>
      </button>
    </div>

    <transition name="menu-fade">
      <div
        v-if="isMenuOpen"
        id="mobile-navigation"
        class="page-container fixed inset-x-4 top-4 bottom-4 z-70 flex flex-col rounded-sm border border-white/10 bg-neutral-950/96 p-6 backdrop-blur-xl lg:hidden"
      >
        <div class="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <noir-logo class="h-4.5 w-auto text-white" />
          <button
            type="button"
            class="rounded-sm border border-white/12 px-3 py-2 text-[10px] tracking-[0.18em] text-white/72"
            @click="isMenuOpen = false"
          >
            CLOSE
          </button>
        </div>

        <nav class="flex flex-1 flex-col justify-center gap-2" aria-label="Mobile Navigation">
          <a
            v-for="item in navigationItems"
            :key="item.href"
            :href="item.href"
            class="rounded-sm border border-white/8 px-4 py-4 text-2xl uppercase tracking-[0.16em] text-white/88 hover:border-white/25 hover:text-white"
            @click="isMenuOpen = false"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="mt-8 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2">
          <div>
            <p class="mb-3 text-xs uppercase tracking-[0.24em] text-white/40">{{ t("common.language") }}</p>
            <div class="flex gap-2">
              <button
                v-for="option in languageOptions"
                :key="option.code"
                type="button"
                class="rounded-sm border px-4 py-2 text-sm tracking-[0.18em]"
                :class="
                  locale === option.code
                    ? 'border-white bg-white text-black'
                    : 'border-white/12 text-white/70'
                "
                @click="switchLanguage(option.code)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
const { locale, setLocale, t } = useI18n();
const localePath = useLocalePath();

const navigationItems = computed(() => [
  { label: t("nav.home"), href: `${localePath("/")}#home` },
  { label: t("nav.services"), href: localePath("/services") },
  { label: t("nav.onlineBooking"), href: localePath("/online-booking") },
  { label: t("nav.academy"), href: `${localePath("/")}#academy` },
  { label: t("nav.about"), href: `${localePath("/")}#about` },
  { label: t("nav.book"), href: `${localePath("/")}#book` },
]);

const languageOptions = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
];

const isMenuOpen = ref(false);

const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false;
  },
);

watch(isMenuOpen, (open) => {
  if (typeof document === "undefined") {
    return;
  }
  document.body.style.overflow = open ? "hidden" : "";
});

onBeforeUnmount(() => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
  }
});

const switchLanguage = async (code) => {
  if (locale.value === code) {
    return;
  }
  await setLocale(code);
  isMenuOpen.value = false;
};
</script>

<style scoped>
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
