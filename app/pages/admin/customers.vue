<template>
  <section class="page-container py-4 sm:py-6">
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl font-semibold uppercase tracking-[0.08em] sm:text-2xl">Kundenverwaltung</h1>
      <button class="w-full rounded-sm border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.12em] sm:w-auto" @click="loadCustomers">Neu laden</button>
    </div>

    <p v-if="errorMessage" class="mb-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{{ errorMessage }}</p>

    <article class="rounded-sm border border-white/12 bg-white/3 p-4">
      <h2 class="text-sm uppercase tracking-[0.12em] text-white/70">Loyalitätsranking</h2>
      <ul class="mt-3 space-y-2 text-sm">
        <li v-for="(customer, idx) in rankedCustomers.slice(0, 10)" :key="customer.id || idx" class="rounded-sm border border-white/10 p-3">
          <div class="flex items-center justify-between gap-2">
            <span>#{{ idx + 1 }} {{ customer.name || "-" }}</span>
            <span class="text-white/70">{{ appointmentCount(customer) }} Buchungen</span>
          </div>
        </li>
      </ul>
    </article>

    <article class="mt-4 rounded-sm border border-white/12 bg-white/3 p-4">
      <h2 class="text-sm uppercase tracking-[0.12em] text-white/70">Alle Kunden</h2>
      <div class="mt-3 hidden overflow-x-auto md:block">
        <table class="w-full min-w-[640px] text-left text-sm">
          <thead class="text-white/60">
            <tr>
              <th class="pb-2">Name</th>
              <th class="pb-2">E-Mail</th>
              <th class="pb-2">Telefon</th>
              <th class="pb-2">Buchungen</th>
              <th class="pb-2 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.id" class="border-t border-white/10">
              <td class="py-2">{{ customer.name || "-" }}</td>
              <td class="py-2">{{ customer.email || "-" }}</td>
              <td class="py-2">{{ customer.phone || "-" }}</td>
              <td class="py-2">{{ appointmentCount(customer) }}</td>
              <td class="py-2 text-right">
                <div class="inline-flex gap-2">
                  <button class="rounded-sm border border-white/20 px-2 py-1 text-xs" @click="openEdit(customer)">Bearbeiten</button>
                  <button class="rounded-sm border border-amber-300/40 px-2 py-1 text-xs text-amber-200" @click="block(customer.id)">Blockieren</button>
                  <button class="rounded-sm border border-red-400/40 px-2 py-1 text-xs text-red-100" @click="remove(customer.id)">Löschen</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-3 space-y-2 md:hidden">
        <article v-for="customer in customers" :key="customer.id" class="rounded-sm border border-white/10 p-3">
          <p class="text-sm font-medium">{{ customer.name || "-" }}</p>
          <p class="mt-1 text-xs text-white/70">{{ customer.email || "-" }}</p>
          <p class="text-xs text-white/70">{{ customer.phone || "-" }}</p>
          <p class="mt-1 text-xs text-white/60">{{ appointmentCount(customer) }} Buchungen</p>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <button class="rounded-sm border border-white/20 px-2 py-2 text-[11px] uppercase tracking-[0.08em]" @click="openEdit(customer)">Bearbeiten</button>
            <button class="rounded-sm border border-amber-300/40 px-2 py-2 text-[11px] uppercase tracking-[0.08em] text-amber-200" @click="block(customer.id)">Block</button>
            <button class="rounded-sm border border-red-400/40 px-2 py-2 text-[11px] uppercase tracking-[0.08em] text-red-100" @click="remove(customer.id)">Löschen</button>
          </div>
        </article>
      </div>
    </article>

    <article v-if="editCustomer.id" class="mt-4 hidden rounded-sm border border-white/12 bg-white/3 p-4 md:block">
      <h2 class="text-sm uppercase tracking-[0.12em] text-white/70">Kunde bearbeiten</h2>
      <form class="mt-3 grid gap-2 md:grid-cols-3" @submit.prevent="saveCustomer">
        <input v-model="editCustomer.name" placeholder="Name" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" />
        <input v-model="editCustomer.email" placeholder="E-Mail" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" />
        <input v-model="editCustomer.phone" placeholder="Telefon" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" />
        <div class="md:col-span-3 flex gap-2">
          <button class="rounded-sm bg-white px-3 py-2 text-xs uppercase tracking-[0.12em] text-black">Speichern</button>
          <button type="button" class="rounded-sm border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.12em]" @click="closeEdit">Schliessen</button>
        </div>
      </form>
    </article>

    <div v-if="editCustomer.id" class="fixed inset-0 z-60 bg-black/70 p-3 md:hidden">
      <div class="mt-8 rounded-sm border border-white/12 bg-black p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm uppercase tracking-[0.12em] text-white/70">Kunde bearbeiten</h2>
          <button class="rounded-sm border border-white/20 px-2 py-1 text-xs" @click="closeEdit">Schliessen</button>
        </div>
        <form class="grid gap-2" @submit.prevent="saveCustomer">
          <input v-model="editCustomer.name" placeholder="Name" class="rounded-sm border border-white/20 bg-transparent px-2 py-2 text-sm" />
          <input v-model="editCustomer.email" placeholder="E-Mail" class="rounded-sm border border-white/20 bg-transparent px-2 py-2 text-sm" />
          <input v-model="editCustomer.phone" placeholder="Telefon" class="rounded-sm border border-white/20 bg-transparent px-2 py-2 text-sm" />
          <button class="mt-1 w-full rounded-sm bg-white px-3 py-2 text-xs uppercase tracking-[0.12em] text-black">Speichern</button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Customer } from "~/types/booking";
import { isApiError } from "~/utils/api";

definePageMeta({ middleware: "auth", layout: "admin" });

const api = useBookingApi();
const router = useRouter();
const errorMessage = ref("");
const customers = ref<Customer[]>([]);
const editCustomer = reactive<Partial<Customer>>({});

const appointmentCount = (customer: Customer) =>
  Number(customer.appointments_count ?? customer.total_appointments ?? 0);

const rankedCustomers = computed(() =>
  [...customers.value].sort((a, b) => appointmentCount(b) - appointmentCount(a)),
);

const withAuthHandling = async (action: () => Promise<void>) => {
  try {
    errorMessage.value = "";
    await action();
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      localStorage.removeItem("access_token");
      await router.push("/admin/auth/login");
      return;
    }
    errorMessage.value = isApiError(error) ? error.message : "Aktion fehlgeschlagen.";
  }
};

const loadCustomers = () =>
  withAuthHandling(async () => {
    customers.value = await api.getCustomers();
  });

const openEdit = (customer: Customer) => {
  editCustomer.id = customer.id;
  editCustomer.name = customer.name;
  editCustomer.email = customer.email;
  editCustomer.phone = customer.phone;
};

const closeEdit = () => {
  editCustomer.id = undefined;
  editCustomer.name = "";
  editCustomer.email = "";
  editCustomer.phone = "";
};

const saveCustomer = () =>
  withAuthHandling(async () => {
    if (!editCustomer.id) return;
    await api.updateCustomer(editCustomer.id, {
      name: editCustomer.name,
      email: editCustomer.email,
      phone: editCustomer.phone,
    });
    await loadCustomers();
    closeEdit();
  });

const block = (id?: number) =>
  withAuthHandling(async () => {
    if (!id) return;
    await api.blockCustomer(id);
    await loadCustomers();
  });

const remove = (id?: number) =>
  withAuthHandling(async () => {
    if (!id) return;
    await api.deleteCustomer(id);
    await loadCustomers();
  });

onMounted(loadCustomers);
</script>
