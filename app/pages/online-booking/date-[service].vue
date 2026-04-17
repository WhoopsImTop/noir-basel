<template>
  <section class="page-container pb-16 pt-32 text-white">
    <h1 class="text-3xl font-semibold uppercase tracking-[0.1em]">Online-Buchung: Zeit wählen</h1>
    <p class="mt-3 text-white/70">Woche {{ appointmentWeek + 1 }} - freie Slots werden vom Backend geladen.</p>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        type="button"
        class="rounded-sm border px-3 py-1 text-xs uppercase tracking-[0.12em]"
        :class="timeFilter === option.value ? 'border-white bg-white text-black' : 'border-white/20 text-white/80'"
        @click="timeFilter = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <p v-if="errorMessage" class="mt-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <div class="mt-6 flex gap-3">
      <button class="rounded-sm border border-white/20 px-3 py-2 text-sm" :disabled="appointmentWeek <= 0" @click="appointmentWeek--">
        Vorherige Woche
      </button>
      <button class="rounded-sm border border-white/20 px-3 py-2 text-sm" @click="appointmentWeek++">Nächste Woche</button>
    </div>

    <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="day in availability" :key="day.date" class="rounded-sm border border-white/12 p-4">
        <h2 class="text-lg">{{ formatDate(day.date) }}</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="time in filteredTimes(day.times)"
            :key="`${day.date}-${time}`"
            type="button"
            class="rounded-sm border px-2 py-1 text-sm"
            :class="isSelected(day.date, time) ? 'border-white bg-white text-black' : slotClass(time)"
            @click="selectSlot(day.date, time)"
          >
            {{ time }}
          </button>
        </div>
      </article>
    </div>

    <div v-if="selectedDate && selectedTime" class="mt-8 rounded-sm border border-white/12 p-4">
      <h3 class="text-lg uppercase">Checkout-Vorschau</h3>
      <p class="mt-2 text-sm text-white/70">{{ formatDateLong(selectedDate) }} {{ selectedTime }}</p>
      <ul class="mt-3 space-y-1 text-sm">
        <li v-for="item in checkoutItems" :key="item.id" class="flex justify-between gap-3">
          <span>{{ item.name }}</span>
          <span>{{ formatPrice(item.price) }}</span>
        </li>
      </ul>
      <p class="mt-3 font-semibold">Gesamt: {{ formatPrice(totalPrice) }}</p>
      <NuxtLink
        class="mt-4 inline-block rounded-sm bg-white px-4 py-2 text-sm font-medium uppercase tracking-[0.12em] text-black"
        :to="`/online-booking/booking-${route.params.service}_${selectedDate}_${selectedTime}`"
      >
        Weiter zu Kundendaten
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AvailabilityDay, CheckoutItem } from "~/types/booking";
import { isApiError, parseCsvNumbers } from "~/utils/api";

const api = useBookingApi();
const route = useRoute();

const serviceIds = computed(() => parseCsvNumbers(String(route.params.service || "")));
const appointmentWeek = ref(0);
const availability = ref<AvailabilityDay[]>([]);
const checkoutItems = ref<CheckoutItem[]>([]);
const selectedDate = ref("");
const selectedTime = ref("");
const errorMessage = ref("");
const timeFilter = ref("all");

const filterOptions = [
  { value: "all", label: "Alle" },
  { value: "12", label: "Ab 12" },
  { value: "15", label: "Ab 15" },
  { value: "18", label: "Ab 18" },
];

const totalPrice = computed(() => checkoutItems.value.reduce((sum, item) => sum + (item.price || 0), 0));

const formatPrice = (price: number) =>
  new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(price);

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("de-CH", { weekday: "long", day: "2-digit", month: "2-digit" });

const formatDateLong = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("de-CH", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

const filteredTimes = (times: string[]) => {
  const threshold = Number(timeFilter.value);
  if (!Number.isFinite(threshold)) return times;
  return times.filter((time) => Number(time.split(":")[0]) >= threshold);
};

const slotClass = (time: string) => {
  const hour = Number(time.split(":")[0]);
  if (hour < 10 || hour >= 19) return "border-amber-200/50 text-amber-100";
  return "border-white/20 text-white/90";
};

const isSelected = (date: string, time: string) => selectedDate.value === date && selectedTime.value === time;

const loadAvailability = async () => {
  if (!serviceIds.value.length) {
    errorMessage.value = "Keine gültigen Service-IDs übergeben.";
    return;
  }
  errorMessage.value = "";
  try {
    const response = await api.getAvailability(serviceIds.value, appointmentWeek.value);
    availability.value = response.dates || [];
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Slots konnten nicht geladen werden.";
  }
};

const selectSlot = async (date: string, time: string) => {
  selectedDate.value = date;
  selectedTime.value = time;
  try {
    checkoutItems.value = await api.getCheckout(serviceIds.value, date, time);
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Checkout-Vorschau fehlgeschlagen.";
  }
};

watch(appointmentWeek, loadAvailability);
onMounted(loadAvailability);
</script>
