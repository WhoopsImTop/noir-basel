<template>
  <footer class="border-t border-white/10 bg-black/40">
    <div class="page-container px-0 py-14 sm:py-18">
      <div class="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
        <section>
          <p class="text-sm font-semibold tracking-[0.34em] text-white">NOIR BASEL</p>
          <p class="mt-4 max-w-xs text-sm leading-7 text-white/62">
            {{ t("footer.brandClaim") }}
          </p>
        </section>

        <section>
          <p class="text-xs uppercase tracking-[0.26em] text-white/40">{{ t("footer.navigation") }}</p>
          <ul class="mt-4 space-y-3 text-sm text-white/70">
            <li v-for="item in navigationItems" :key="item.href">
              <a :href="item.href" class="hover:text-white">{{ item.label }}</a>
            </li>
          </ul>
        </section>

        <section>
          <p class="text-xs uppercase tracking-[0.26em] text-white/40">{{ t("footer.contact") }}</p>
          <div class="mt-4 space-y-3 text-sm leading-7 text-white/70">
            <p>NOIR BASEL<br />Aeschenvorstadt 00<br />4051 Basel</p>
            <a href="tel:+41610000000" class="block hover:text-white">+41 61 000 00 00</a>
            <p>Di - Fr 09:00 - 19:00<br />Sa 09:00 - 16:00</p>
          </div>
        </section>

        <section>
          <p class="text-xs uppercase tracking-[0.26em] text-white/40">{{ t("common.socialAndLegal") }}</p>
          <div class="mt-4 space-y-3 text-sm text-white/70">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              class="block hover:text-white"
            >
              {{ t("footer.social") }}
            </a>
            <NuxtLink :to="localePath('/impressum')" class="block hover:text-white">{{ t("legal.impressumTitle") }}</NuxtLink>
            <NuxtLink :to="localePath('/datenschutzerklaerung')" class="block hover:text-white">
              {{ t("legal.datenschutzTitle") }}
            </NuxtLink>
          </div>
        </section>
      </div>

      <div
        class="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.22em] text-white/36 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>Noir Basel</p>
        <p>{{ t("footer.tagline") }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const { t } = useI18n();
const localePath = useLocalePath();

const navigationItems = computed(() => [
  { label: t("nav.home"), href: `${localePath("/")}#home` },
  { label: t("nav.services"), href: localePath("/services") },
  { label: t("nav.onlineBooking"), href: localePath("/online-booking") },
  { label: t("nav.academy"), href: `${localePath("/")}#academy` },
  { label: t("nav.about"), href: `${localePath("/")}#about` },
  { label: t("nav.book"), href: `${localePath("/")}#book` },
]);
</script>
