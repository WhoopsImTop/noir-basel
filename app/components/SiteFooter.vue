<template>
  <footer class="border-t border-[#C0C0C0]/10 bg-[#0A0A0A]">
    <div class="page-container px-0 py-16 sm:py-20">
      <div class="grid gap-14 md:grid-cols-2 xl:grid-cols-4">
        <section>
          <p class="font-heading text-sm font-medium tracking-[0.2em] text-white">NOIR BASEL</p>
          <p class="mt-5 max-w-xs text-sm leading-relaxed text-white/58">
            {{ t("footer.brandClaim") }}
          </p>
        </section>

        <section>
          <p class="text-[10px] uppercase tracking-[0.28em] text-[#C0C0C0]/45">{{ t("footer.navigation") }}</p>
          <ul class="mt-5 space-y-3 text-sm text-white/58">
            <li v-for="item in navigationItems" :key="item.href">
              <a :href="item.href" class="duration-500 hover:text-white">{{ item.label }}</a>
            </li>
          </ul>
        </section>

        <section>
          <p class="text-[10px] uppercase tracking-[0.28em] text-[#C0C0C0]/45">{{ t("footer.contact") }}</p>
          <div class="mt-5 space-y-3 text-sm leading-relaxed text-white/58">
            <p>NOIR BASEL<br />Jurastrasse 21<br />4053 Basel</p>
            <a href="mailto:hello@noirbasel.ch" class="block hover:text-white">info@noirbasel.ch</a>
          </div>
        </section>

        <section>
          <p class="text-[10px] uppercase tracking-[0.28em] text-[#C0C0C0]/45">{{ t("common.socialAndLegal") }}</p>
          <div class="mt-5 space-y-3 text-sm text-white/58">
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
            <NuxtLink :to="localePath('/agb')" class="block hover:text-white">{{ t("legal.agbTitle") }}</NuxtLink>
          </div>
        </section>
      </div>

      <div
        class="mt-14 flex flex-col gap-3 border-t border-[#C0C0C0]/10 pt-8 text-[10px] uppercase tracking-[0.26em] text-[#C0C0C0]/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>NOIR BASEL</p>
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
  { label: t("nav.about"), href: `${localePath("/")}#about` },
]);
</script>
