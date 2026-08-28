<template>
  <div class="page-shell">
    <GlobalGrainOverlay />
    <SiteHeader />
    <main>
      <NuxtPage />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
onMounted(() => {
  // Falls Admin-PWA-CSS oder Mobile-Menü overflow gesperrt hat
  document.documentElement.classList.remove("admin-shell");
  document.body.style.overflow = "";
});
</script>
