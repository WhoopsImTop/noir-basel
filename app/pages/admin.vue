<template>
  <NuxtPage />
</template>

<script setup lang="ts">
defineI18nRoute(false);

definePageMeta({
  layout: "admin",
  middleware: "auth",
});
</script>
