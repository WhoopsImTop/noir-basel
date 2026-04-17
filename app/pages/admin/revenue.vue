<template>
  <section class="page-container py-4 sm:py-6">
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl font-semibold uppercase tracking-[0.08em] sm:text-2xl">Reporting</h1>
      <div class="grid w-full grid-cols-[1fr_auto] items-center gap-2 sm:w-auto sm:flex">
        <input v-model.number="month" type="number" min="1" max="12" class="w-full rounded-sm border border-white/20 bg-transparent px-2 py-2 text-sm sm:w-20 sm:py-1" />
        <button class="rounded-sm border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.12em]" @click="loadRevenue">Laden</button>
      </div>
    </div>
    <NuxtLink to="/admin" class="mb-4 inline-flex rounded-sm border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.12em] text-white/80">
      Zurück
    </NuxtLink>

    <p v-if="errorMessage" class="mb-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{{ errorMessage }}</p>

    <div class="grid gap-4 md:grid-cols-3">
      <article class="rounded-sm border border-white/12 bg-white/3 p-4">
        <p class="text-xs uppercase text-white/60">Gesamtumsatz</p>
        <p class="mt-2 text-2xl font-semibold">{{ formatCurrency(totalRevenue) }}</p>
      </article>
      <article class="rounded-sm border border-white/12 bg-white/3 p-4">
        <p class="text-xs uppercase text-white/60">Buchungen</p>
        <p class="mt-2 text-2xl font-semibold">{{ entries.length }}</p>
      </article>
      <article class="rounded-sm border border-white/12 bg-white/3 p-4">
        <p class="text-xs uppercase text-white/60">Ø Umsatz/Buchung</p>
        <p class="mt-2 text-2xl font-semibold">{{ formatCurrency(avgRevenue) }}</p>
      </article>
    </div>

    <article class="mt-4 rounded-sm border border-white/12 bg-white/3 p-4">
      <h2 class="text-sm uppercase tracking-[0.12em] text-white/70">Umsatz nach Leistung</h2>
      <ul class="mt-3 space-y-2 text-sm">
        <li v-for="item in revenueByService" :key="item.name" class="flex items-center justify-between gap-3 rounded-sm border border-white/10 p-3">
          <span>{{ item.name }}</span>
          <span>{{ formatCurrency(item.amount) }}</span>
        </li>
      </ul>
    </article>
    <article class="mt-4 rounded-sm border border-white/12 bg-white/3 p-4">
      <h2 class="text-sm uppercase tracking-[0.12em] text-white/70">Wochenverlauf</h2>
      <div class="mt-3 grid grid-cols-4 items-end gap-2">
        <div v-for="item in weeklyPreview" :key="item.label" class="space-y-2">
          <div class="h-24 rounded-sm bg-black/35 p-1">
            <div class="w-full rounded-sm bg-[#b88a45]/80" :style="{ height: `${item.height}%` }" />
          </div>
          <p class="text-center text-xs text-white/60">{{ item.label }}</p>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { RevenueEntry } from "~/types/booking";
import { isApiError } from "~/utils/api";

definePageMeta({ middleware: "auth", layout: "admin" });

const api = useBookingApi();
const router = useRouter();

const now = new Date();
const month = ref(now.getMonth() + 1);
const entries = ref<RevenueEntry[]>([]);
const errorMessage = ref("");

const totalRevenue = computed(() =>
  entries.value.reduce((sum, item) => sum + Number(item.amount || 0), 0),
);

const avgRevenue = computed(() => (entries.value.length ? totalRevenue.value / entries.value.length : 0));

const revenueByService = computed(() => {
  const map = new Map<string, number>();
  for (const entry of entries.value) {
    const name = entry.service_name || entry.service || "Unbekannt";
    map.set(name, (map.get(name) || 0) + Number(entry.amount || 0));
  }
  return [...map.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
});

const weeklyPreview = computed(() => {
  const total = totalRevenue.value || 1;
  return [
    { label: "W1", height: Math.max(10, Math.round((total * 0.15) / total * 100)) },
    { label: "W2", height: Math.max(10, Math.round((total * 0.4) / total * 100)) },
    { label: "W3", height: Math.max(10, Math.round((total * 0.3) / total * 100)) },
    { label: "W4", height: Math.max(10, Math.round((total * 0.15) / total * 100)) },
  ];
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(amount);

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
    errorMessage.value = isApiError(error) ? error.message : "Umsatzdaten konnten nicht geladen werden.";
  }
};

const loadRevenue = () =>
  withAuthHandling(async () => {
    entries.value = await api.getRevenue(month.value);
  });

onMounted(loadRevenue);
</script>
