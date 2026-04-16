<template>
  <header class="fixed inset-x-0 top-0 z-50 px-4 pt-4">
    <div
      class="page-container flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-black/75 px-4 py-3 backdrop-blur-md md:px-6"
    >
      <NuxtLink
        to="/"
        class="shrink-0 text-sm font-semibold tracking-[0.38em] text-white sm:text-base"
        aria-label="Noir Basel Startseite"
      >
        NOIR BASEL
      </NuxtLink>

      <nav class="hidden items-center gap-8 lg:flex" aria-label="Hauptnavigation">
        <a
          v-for="item in navigationItems"
          :key="item.href"
          :href="localizedHashLink(item.href)"
          class="text-sm uppercase tracking-[0.22em] text-white/64 hover:text-white"
        >
          {{ t(item.label) }}
        </a>
      </nav>

      <div class="hidden items-center gap-3 lg:flex">
        <div
          class="flex items-center rounded-xl border border-white/10 bg-white/5 p-1"
          :aria-label="t('language.label')"
        >
          <NuxtLink
            v-for="option in languageOptions"
            :key="option.code"
            :to="switchLocalePath(option.code)"
            :aria-current="locale === option.code ? 'page' : undefined"
            class="rounded-lg px-3 py-1 text-xs tracking-[0.22em]"
            :class="
              locale === option.code
                ? 'bg-white text-black'
                : 'text-white/64 hover:text-white'
            "
          >
            {{ option.label }}
          </NuxtLink>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-white lg:hidden"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-navigation"
        :aria-label="isMenuOpen ? 'Menü schliessen' : 'Menü öffnen'"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span class="sr-only">Navigation</span>
        <div class="flex flex-col gap-1.5">
          <span
            class="block h-px w-5 bg-current transition-transform duration-200"
            :class="isMenuOpen ? 'translate-y-[7px] rotate-45' : ''"
          />
          <span
            class="block h-px w-5 bg-current transition-opacity duration-200"
            :class="isMenuOpen ? 'opacity-0' : 'opacity-100'"
          />
          <span
            class="block h-px w-5 bg-current transition-transform duration-200"
            :class="isMenuOpen ? '-translate-y-[7px] -rotate-45' : ''"
          />
        </div>
      </button>
    </div>

    <transition name="menu-fade">
      <div
        v-if="isMenuOpen"
        id="mobile-navigation"
        class="page-container mt-3 rounded-2xl border border-white/10 bg-neutral-950/96 p-6 backdrop-blur-xl lg:hidden"
      >
        <nav class="flex flex-col gap-2" aria-label="Mobile Navigation">
          <a
            v-for="item in navigationItems"
            :key="item.href"
            :href="localizedHashLink(item.href)"
            class="rounded-xl border border-white/8 px-4 py-4 text-lg uppercase tracking-[0.18em] text-white/88 hover:border-white/25 hover:text-white"
            @click="isMenuOpen = false"
          >
            {{ t(item.label) }}
          </a>
        </nav>

        <div class="mt-8 grid gap-5 border-t border-white/10 pt-6">
          <div>
            <p class="mb-3 text-xs uppercase tracking-[0.24em] text-white/40">
              {{ t("language.label") }}
            </p>
            <div class="flex gap-2">
              <NuxtLink
                v-for="option in languageOptions"
                :key="option.code"
                :to="switchLocalePath(option.code)"
                class="rounded-lg border px-4 py-2 text-sm tracking-[0.18em]"
                :class="
                  locale === option.code
                    ? 'border-white bg-white text-black'
                    : 'border-white/12 text-white/70'
                "
              >
                {{ option.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
const navigationItems = [
  { label: "nav.home", href: "/#home" },
  { label: "nav.services", href: "/#services" },
  { label: "nav.academy", href: "/#academy" },
  { label: "nav.about", href: "/#about" },
  { label: "nav.book", href: "/#book" },
];

const { t, locale } = useI18n();
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();
const isMenuOpen = ref(false);
const languageOptions = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
];

const route = useRoute();

const localizedHashLink = (hash) => `${localePath("/")}${hash}`;

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false;
  },
);
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
