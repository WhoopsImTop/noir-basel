<template>
  <footer class="mt-16 border-t border-[#C0C0C0]/10 pt-10">
    <h2 class="font-heading text-lg text-white">{{ t("pages.legalFooter.contactTitle") }}</h2>
    <p class="muted-copy mt-2 max-w-xl text-sm leading-relaxed">{{ t("pages.legalFooter.contactIntro") }}</p>
    <p class="mt-6 text-sm leading-relaxed text-white/65">
      {{ t("pages.legalFooter.addressLine1") }}<br />
      {{ t("pages.legalFooter.addressLine2") }}<br />
      {{ t("pages.legalFooter.addressLine3") }}
    </p>
    <p class="mt-4">
      <a href="mailto:hello@noirbasel.ch" class="text-sm text-[#C0C0C0] duration-500 hover:text-white">hello@noirbasel.ch</a>
    </p>

    <nav class="mt-10 flex flex-wrap gap-8 text-[11px] uppercase tracking-[0.22em] text-[#C0C0C0]/55" :aria-label="t('pages.legalFooter.navAria')">
      <NuxtLink :to="localePath('/impressum')" class="duration-500 hover:text-white">{{ t("legal.impressumTitle") }}</NuxtLink>
      <NuxtLink :to="localePath('/datenschutzerklaerung')" class="duration-500 hover:text-white">{{ t("legal.datenschutzTitle") }}</NuxtLink>
      <NuxtLink :to="localePath('/agb')" class="duration-500 hover:text-white">{{ t("legal.agbTitle") }}</NuxtLink>
      <NuxtLink :to="localePath('/')" class="duration-500 hover:text-white">{{ t("nav.home") }}</NuxtLink>
    </nav>
  </footer>
</template>

<script setup>
const { t } = useI18n();
const localePath = useLocalePath();
</script>
