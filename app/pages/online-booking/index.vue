<template>
  <section class="page-container pb-16 pt-32 text-white">
    <h1 class="text-3xl font-semibold uppercase tracking-[0.1em]">Online-Buchung: Serviceauswahl</h1>
    <p class="mt-3 text-white/70">Wähle einen oder mehrere Services und fahre mit der Terminwahl fort.</p>

    <p v-if="priceHint" class="mt-4 rounded-sm border border-white/15 bg-white/5 p-3 text-sm text-white/80">
      {{ priceHint }}
    </p>

    <p v-if="errorMessage" class="mt-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <div class="mt-8 grid gap-3">
      <label
        v-for="service in services"
        :key="service.id"
        class="flex cursor-pointer items-start justify-between rounded-sm border border-white/12 p-4 hover:border-white/25"
      >
        <span>
          <span class="block text-lg">{{ service.name }}</span>
          <span class="mt-1 block text-sm text-white/65">{{ service.description }}</span>
          <span class="mt-1 block text-xs uppercase text-white/45">{{ service.step || "?" }} min</span>
        </span>
        <span class="ml-4 flex items-center gap-4">
          <span class="text-sm">{{ formatPrice(service.price) }}</span>
          <input v-model="selectedServiceIds" :value="service.id" type="checkbox" class="h-4 w-4 accent-white" />
        </span>
      </label>
    </div>

    <button
      type="button"
      class="mt-8 rounded-sm bg-white px-5 py-3 text-sm font-medium uppercase tracking-[0.15em] text-black disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="selectedServiceIds.length === 0"
      @click="goToDateSelection"
    >
      Weiter zur Terminauswahl
    </button>
  </section>
</template>

<script setup lang="ts">
import type { Service } from "~/types/booking";
import { isApiError, toCsv } from "~/utils/api";

const api = useBookingApi();
const router = useRouter();

const services = ref<Service[]>([]);
const selectedServiceIds = ref<number[]>([]);
const errorMessage = ref("");
const priceHint = ref("");

const formatPrice = (price: number) =>
  new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(price);

const loadData = async () => {
  errorMessage.value = "";
  try {
    const [serviceRows, settings] = await Promise.all([
      api.getServices(),
      api.getSettings(["early_bird_time", "late_booker_time"]),
    ]);
    services.value = serviceRows;
    const early = settings.early_bird_time;
    const late = settings.late_booker_time;
    if (early || late) {
      priceHint.value = `Mögliche Preisaufschläge ausserhalb der Kernzeiten (${early || "?"} - ${late || "?"}).`;
    }
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Services konnten nicht geladen werden.";
  }
};

const goToDateSelection = async () => {
  await router.push(`/online-booking/date-${toCsv(selectedServiceIds.value)}`);
};

onMounted(loadData);
</script>
