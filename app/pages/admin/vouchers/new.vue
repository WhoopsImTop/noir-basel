<template>
  <div class="container mx-auto p-4 min-h-screen mb-16">
    <div class="flex justify-between items-center">
      <h2 class="text-sm font-medium text-neutral-200">Gutschein hinzufügen</h2>
      <nuxt-link to="/admin/vouchers" class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
        >Abbrechen</nuxt-link
      >
    </div>
    <hr class="my-2 border-neutral-600" />
    <AdminVoucherForm @saved="router.push('/admin/vouchers')" />
  </div>
  <icon-navigation-component />
</template>

<script setup>
const router = useRouter();
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
