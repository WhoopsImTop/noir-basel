<template>
  <div class="container mx-auto p-4 min-h-screen mb-16">
    <div class="flex justify-between items-center">
      <h2 class="text-sm font-medium text-neutral-200">Gutschein bearbeiten</h2>
      <nuxt-link to="/admin/vouchers" class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
        >Abbrechen</nuxt-link
      >
    </div>
    <hr class="my-2 border-neutral-600" />
    <div v-if="pending" class="my-8 text-center text-sm text-neutral-400">Wird geladen…</div>
    <AdminVoucherForm v-else-if="voucher" :initial="voucher" @saved="router.push('/admin/vouchers')" />
    <p v-else class="my-8 text-center text-sm text-red-400">Gutschein nicht gefunden.</p>
  </div>
  <icon-navigation-component />
</template>

<script setup>
const api = useBookingApi();
const router = useRouter();
const route = useRoute();

const { data: voucher, pending } = await useAsyncData(`admin-voucher-${route.params.id}`, () =>
  api.getVoucher(route.params.id),
);
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
