<template>
  <div class="container mx-auto p-4 min-h-screen mb-16">
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
      placeholder="Kunde suchen"
    />

    <div v-if="pending" class="my-8 text-center text-sm text-neutral-400">
      Kunden werden geladen…
    </div>

    <div v-else-if="error" class="my-8 text-center text-sm text-red-400">
      Kunden konnten nicht geladen werden.
    </div>

    <div v-else-if="customers.length > 0" class="my-4 flex flex-col">
      <div
        class="flex items-center justify-between w-full bg-neutral-800 rounded py-2 px-4 mb-2"
      >
        <span class="font-bold text-sm text-neutral-200"
          >{{ customers.length }} Kunden</span
        >
      </div>
      <nuxt-link
        v-for="customer in searchedCustomers"
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
    </div>
  </div>
  <icon-navigation-component />
</template>

<script setup>
import { isLoyalCustomer, isNewCustomer } from "~/utils/customer";

const customerStore = useCustomerStore();
const search = ref("");

const { pending, error } = await useAsyncData("reporting-customers", async () => {
  if (!customerStore.customers.length) {
    await customerStore.fetch();
  }
});

const customers = computed(() => customerStore.customers);

const searchedCustomers = computed(() => {
  const term = search.value.toLowerCase();
  if (!term) {
    return customers.value;
  }
  return customers.value.filter((customer) => {
    const phone = customer.customer_details?.phone?.toLowerCase() ?? "";
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      phone.includes(term)
    );
  });
});
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
