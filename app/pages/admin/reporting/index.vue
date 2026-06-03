<template>
  <div class="admin-page px-4">
    <div class="flex justify-between items-center">
      <h2 class="text-sm font-medium text-neutral-200">Reporting</h2>
      <div class="flex gap-2">
        <nuxt-link
          to="/admin/reporting/statistics"
          class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
          >Umsatz & Top-Services</nuxt-link
        >
        <nuxt-link
          to="/admin/reporting/new"
          class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
          >Neuer Kunde</nuxt-link
        >
      </div>
    </div>
    <hr class="my-2 border-neutral-600" />
    <input
      v-model="search"
      class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100 mt-4"
      placeholder="Kunde suchen (Name oder E-Mail)"
    />

    <div v-if="loading" class="my-8 text-center text-sm text-neutral-400">
      Kunden werden geladen…
    </div>

    <div v-else-if="error" class="my-8 text-center text-sm text-red-400">
      Kunden konnten nicht geladen werden.
    </div>

    <div v-else-if="customers.length > 0 || total > 0" class="my-4 flex flex-col">
      <div
        class="flex items-center justify-between w-full bg-neutral-800 rounded py-2 px-4 mb-2"
      >
        <span class="font-bold text-sm text-neutral-200">{{ total }} Kunden</span>
        <span v-if="lastPage > 1" class="text-xs text-neutral-400">
          Seite {{ page }} von {{ lastPage }}
        </span>
      </div>
      <nuxt-link
        v-for="customer in customers"
        :key="customer.id"
        :to="'/admin/reporting/customer/' + customer.id"
        class="flex items-center justify-between w-full bg-neutral-800 rounded p-4 mb-2"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="font-bold text-sm text-neutral-200 truncate">
            {{ customer.name }}
          </span>
          <span
            v-if="isNewCustomer(customer.created_at)"
            class="shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide bg-neutral-600 text-neutral-200"
            >Neu</span
          >
          <span
            v-if="isLoyalCustomer(customer)"
            class="shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide bg-gold-600/30 text-gold-400"
            >Stamm</span
          >
        </div>
      </nuxt-link>

      <div
        v-if="lastPage > 1"
        class="flex items-center justify-between gap-2 mt-2"
      >
        <button
          type="button"
          class="bg-neutral-700 text-neutral-200 px-4 py-2 rounded text-xs disabled:opacity-40"
          :disabled="page <= 1 || loading"
          @click="goToPage(page - 1)"
        >
          Zurück
        </button>
        <button
          type="button"
          class="bg-neutral-700 text-neutral-200 px-4 py-2 rounded text-xs disabled:opacity-40"
          :disabled="page >= lastPage || loading"
          @click="goToPage(page + 1)"
        >
          Weiter
        </button>
      </div>
    </div>

    <div
      v-else-if="search.trim().length >= 2"
      class="my-8 text-center text-sm text-neutral-400"
    >
      Keine Kunden gefunden.
    </div>
  </div>
</template>

<script setup>
import { isLoyalCustomer, isNewCustomer } from "~/utils/customer";

const api = useBookingApi();
const search = ref("");
const customers = ref([]);
const page = ref(1);
const lastPage = ref(1);
const total = ref(0);
const loading = ref(false);
const error = ref(false);

const applyPaginatedResponse = (response) => {
  customers.value = response.data;
  page.value = response.current_page;
  lastPage.value = response.last_page;
  total.value = response.total;
};

const loadCustomers = async (targetPage = 1) => {
  loading.value = true;
  error.value = false;
  try {
    const term = search.value.trim();
    const response =
      term.length >= 2
        ? await api.searchCustomers({ q: term, page: targetPage, lite: true })
        : await api.getCustomers({ lite: true, page: targetPage });
    applyPaginatedResponse(response);
  } catch {
    error.value = true;
    customers.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const goToPage = (targetPage) => {
  if (targetPage < 1 || targetPage > lastPage.value) return;
  loadCustomers(targetPage);
};

let searchDebounceTimer = null;
watch(search, () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    loadCustomers(1);
  }, 300);
});

await loadCustomers(1);
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
