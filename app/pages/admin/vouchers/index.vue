<template>
  <div class="container mx-auto p-4 min-h-screen mb-16">
    <div class="flex justify-between items-center">
      <h2 class="text-sm font-medium text-neutral-200">Gutscheine</h2>
      <div class="flex gap-2">
        <nuxt-link
          to="/admin/services"
          class="bg-neutral-700 text-white px-4 py-2 rounded text-xs"
          >Leistungen</nuxt-link
        >
        <nuxt-link
          to="/admin/vouchers/new"
          class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
          >Neuer Gutschein</nuxt-link
        >
      </div>
    </div>
    <hr class="my-2 border-neutral-600" />

    <div v-if="pending" class="my-8 text-center text-sm text-neutral-400">Wird geladen…</div>

    <div v-else-if="vouchers.length" class="my-4 flex flex-col gap-2">
      <div
        v-for="voucher in vouchers"
        :key="voucher.id"
        class="flex items-center justify-between bg-neutral-800 rounded p-4"
      >
        <div class="min-w-0">
          <div class="font-bold text-sm text-neutral-200">{{ voucher.code }}</div>
          <div class="text-neutral-400 text-xs truncate">{{ voucher.name }}</div>
          <div class="text-neutral-500 text-xs mt-1">
            {{ voucher.type === "percent" ? `${voucher.value}%` : `${voucher.value} CHF` }}
            · {{ voucher.redemptions_count ?? 0 }}
            <template v-if="voucher.max_redemptions_total">
              / {{ voucher.max_redemptions_total }}</template
            >
            Einlösungen
            <span
              class="ml-2"
              :class="voucher.is_active ? 'text-green-500' : 'text-red-400'"
              >{{ voucher.is_active ? "aktiv" : "inaktiv" }}</span
            >
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <nuxt-link :to="`/admin/vouchers/${voucher.id}/edit`" class="px-2 rounded">
            <img src="/edit.svg" alt="Bearbeiten" />
          </nuxt-link>
          <button class="px-2 rounded" @click="removeVoucher(voucher.id)">
            <img src="/delete.svg" alt="Löschen" />
          </button>
        </div>
      </div>
    </div>

    <p v-else class="my-8 text-center text-sm text-neutral-400">Noch keine Gutscheine angelegt.</p>
  </div>
  <icon-navigation-component />
</template>

<script setup>
const api = useBookingApi();

const { data, pending, refresh } = await useAsyncData("admin-vouchers", () => api.getVouchers());

const vouchers = computed(() => data.value ?? []);

const removeVoucher = async (id) => {
  if (!confirm("Gutschein wirklich löschen?")) return;
  try {
    await api.deleteVoucher(id);
    await refresh();
  } catch {
    alert("Gutschein konnte nicht gelöscht werden");
  }
};
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
