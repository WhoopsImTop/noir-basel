<template>
  <header
    class="fixed inset-x-0 top-0 z-10000 border-b transition-[background-color,border-color,backdrop-filter] duration-500"
    :class="headerSurfaceClass"
  >
    <div
      class="page-container flex items-center justify-between px-4 py-4 md:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-8"
    >
      <NuxtLink
        :to="localePath('/')"
        class="shrink-0 text-white"
        :aria-label="t('header.homeAria')"
      >
        <noir-logo class="h-4.5 w-auto md:h-5" />
      </NuxtLink>

      <nav class="mx-auto hidden items-center gap-12 lg:flex" :aria-label="t('header.navAria')">
        <a
          v-for="item in navigationItems"
          :key="item.href"
          :href="item.href"
          class="text-[10px] uppercase tracking-[0.28em] text-[#C0C0C0]/55 duration-500 hover:text-white"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="hidden items-center justify-end gap-3 lg:flex z-10">
        <LanguageSwitcher />
      </div>

      <button
        type="button"
        class="inline-flex h-10 min-w-10 items-center justify-center gap-2 border border-[#C0C0C0]/15 px-2 text-white lg:hidden"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-navigation"
        :aria-label="isMenuOpen ? t('header.menuClose') : t('header.menuOpen')"
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
        class="fixed inset-0 z-10001 flex h-dvh w-screen flex-col bg-[#0A0A0A] px-9 pb-4 pt-4 lg:hidden"
      >
        <div class="mb-10 flex items-center justify-between border-b border-[#C0C0C0]/10 pb-5">
          <noir-logo class="h-4.5 w-auto text-white" />
          <button
            type="button"
            class="border border-[#C0C0C0]/20 px-3 py-2 text-[10px] tracking-[0.2em] text-[#C0C0C0]"
            @click="isMenuOpen = false"
          >
            {{ t("header.close") }}
          </button>
        </div>

        <nav class="flex flex-1 flex-col justify-center gap-1 bg-[#0A0A0A]" :aria-label="t('header.mobileNavAria')">
          <a
            v-for="item in navigationItems"
            :key="item.href"
            :href="item.href"
            class="border-b border-transparent px-1 py-4 font-heading text-2xl tracking-wide text-white/90 duration-500 hover:border-[#C0C0C0]/20"
            @click="isMenuOpen = false"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="mt-8 border-t border-[#C0C0C0]/10 pt-6">
          <p class="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#C0C0C0]/45">{{ t("common.language") }}</p>
          <LanguageSwitcher variant="mobile" />
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
const { t } = useI18n();
const localePath = useLocalePath();

const navigationItems = computed(() => [
  { label: t("nav.home"), href: `${localePath("/")}#home` },
  { label: t("nav.services"), href: localePath("/services") },
  { label: t("nav.team"), href: localePath("/team") },
  { label: t("nav.about"), href: `${localePath("/")}#about` },
  { label: t("nav.onlineBooking"), href: localePath("/online-booking") },
]);
const isMenuOpen = ref(false);

const route = useRoute();

const homePaths = ["/", "/en", "/fr", "/it"];

const isHomePage = computed(() => {
  const normalized = route.path.replace(/\/$/, "") || "/";
  return homePaths.includes(normalized);
});

const isScrolledPastHero = ref(false);

const headerSurfaceClass = computed(() => {
  if (isHomePage.value && !isScrolledPastHero.value && !isMenuOpen.value) {
    return "border-transparent bg-transparent";
  }
  return "border-[#C0C0C0]/10 bg-[#0A0A0A]/85 backdrop-blur-md";
});

const updateHeaderOnScroll = () => {
  if (typeof window === "undefined") {
    return;
  }
  isScrolledPastHero.value = window.scrollY > window.innerHeight * 0.55;
};

onMounted(() => {
  updateHeaderOnScroll();
  window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
});

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false;
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  },
);

watch(isMenuOpen, (open) => {
  if (typeof document === "undefined") {
    return;
  }
  document.body.style.overflow = open ? "hidden" : "";
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("scroll", updateHeaderOnScroll);
  }
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
  }
});
</script>

<style scoped>
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    opacity 360ms ease,
    transform 360ms ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
