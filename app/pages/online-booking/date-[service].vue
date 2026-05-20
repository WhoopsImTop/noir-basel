<template>
  <section class="booking-shell page-container pb-24 pt-32 sm:pt-36">
    <p class="eyebrow">{{ t("nav.onlineBooking") }}</p>
    <h1 class="section-heading mt-4 text-3xl text-white sm:text-4xl">{{ t("bookingFlow.selectDate.heading") }}</h1>
    <p class="muted-copy mt-3 text-sm">{{ t("bookingFlow.selectDate.weekLine", { n: appointmentWeek + 1 }) }}</p>

    <div class="mt-6 flex flex-wrap gap-2">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        type="button"
        class="border px-3 py-2 text-[10px] uppercase tracking-[0.2em] duration-500"
        :class="
          timeFilter === option.value
            ? 'border-white bg-white text-[#0A0A0A]'
            : 'border-[#C0C0C0]/20 text-[#C0C0C0]/75 hover:border-[#C0C0C0]/40'
        "
        @click="timeFilter = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <p v-if="errorMessage" class="mt-4 border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <div class="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        class="border border-[#C0C0C0]/20 px-4 py-2 text-xs duration-500 hover:border-[#C0C0C0]/40 disabled:opacity-40"
        :disabled="appointmentWeek <= 0"
        @click="appointmentWeek--"
      >
        {{ t("bookingFlow.selectDate.prevWeek") }}
      </button>
      <button
        type="button"
        class="border border-[#C0C0C0]/20 px-4 py-2 text-xs duration-500 hover:border-[#C0C0C0]/40"
        @click="appointmentWeek++"
      >
        {{ t("bookingFlow.selectDate.nextWeek") }}
      </button>
    </div>

    <div class="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="day in availability" :key="day.date" class="border border-[#C0C0C0]/12 bg-[#0A0A0A]/50 p-5">
        <h2 class="font-heading text-lg text-white">{{ formatDate(day.date) }}</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="timeSlot in filteredTimes(day.times)"
            :key="`${day.date}-${timeSlot}`"
            type="button"
            class="border px-2.5 py-1.5 text-sm duration-500"
            :class="isSelected(day.date, timeSlot) ? 'border-white bg-white text-[#0A0A0A]' : slotClass(timeSlot)"
            @click="selectSlot(day.date, timeSlot)"
          >
            {{ timeSlot }}
          </button>
        </div>
      </article>
    </div>

    <div v-if="selectedDate && selectedTime" class="mt-10 border border-[#C0C0C0]/12 bg-[#1A1A1A]/40 p-6">
      <h3 class="text-[10px] uppercase tracking-[0.26em] text-[#C0C0C0]/50">{{ t("bookingFlow.selectDate.checkoutTitle") }}</h3>
      <p class="muted-copy mt-2 text-sm">{{ formatDateLong(selectedDate) }} {{ selectedTime }}</p>
      <ul class="mt-4 space-y-2 text-sm text-white/70">
        <li v-for="(item, index) in checkoutItems" :key="`${item.id ?? 'line'}-${index}`" class="flex justify-between gap-3">
          <span>{{ item.name }}</span>
          <PriceDisplay
            :price="item.price"
            :old-price="item.old_price ?? null"
            :locale="locale"
            price-class="text-sm text-white/70"
            compare-class="text-xs"
          />
        </li>
      </ul>
      <p class="mt-4 text-sm font-medium text-white">
        {{ t("bookingFlow.selectDate.checkoutTotal") }}: {{ formatPrice(checkoutTotal) }}
      </p>
      <p class="mt-2 text-xs text-[#C0C0C0]/55">{{ t("bookingFlow.selectDate.voucherHint") }}</p>
      <NuxtLink
        class="mt-6 inline-flex min-h-10 items-center border border-transparent bg-white px-6 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0]"
        :to="localePath(`/online-booking/booking-${route.params.service}_${selectedDate}_${selectedTime}`)"
      >
        {{ t("bookingFlow.selectDate.nextCustomer") }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AvailabilityDay, CheckoutItem } from "~/types/booking";
import { isApiError, parseCsvNumbers } from "~/utils/api";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const api = useBookingApi();
const route = useRoute();

const serviceIds = computed(() => parseCsvNumbers(String(route.params.service || "")));
const appointmentWeek = ref(0);
const availability = ref<AvailabilityDay[]>([]);
const checkoutItems = ref<CheckoutItem[]>([]);
const checkoutTotal = ref(0);
const selectedDate = ref("");
const selectedTime = ref("");
const errorMessage = ref("");
const timeFilter = ref("all");

const numberLocale = computed(() => (locale.value === "de" ? "de-CH" : "en-CH"));

const filterOptions = computed(() => [
  { value: "all", label: t("bookingFlow.selectDate.filterAll") },
  { value: "12", label: t("bookingFlow.selectDate.filter12") },
  { value: "15", label: t("bookingFlow.selectDate.filter15") },
  { value: "18", label: t("bookingFlow.selectDate.filter18") },
]);

const formatPrice = (price: number) =>
  new Intl.NumberFormat(numberLocale.value, { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(price);

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(numberLocale.value, { weekday: "long", day: "2-digit", month: "2-digit" });

const formatDateLong = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(numberLocale.value, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const filteredTimes = (times: string[]) => {
  const threshold = Number(timeFilter.value);
  if (!Number.isFinite(threshold)) return times;
  return times.filter((time) => Number(time.split(":")[0]) >= threshold);
};

const slotClass = (time: string) => {
  const hour = Number(time.split(":")[0]);
  if (hour < 10 || hour >= 19) return "border-amber-200/40 text-amber-100/90";
  return "border-[#C0C0C0]/22 text-white/88 hover:border-[#C0C0C0]/35";
};

const isSelected = (date: string, time: string) => selectedDate.value === date && selectedTime.value === time;

const loadAvailability = async () => {
  if (!serviceIds.value.length) {
    errorMessage.value = t("bookingFlow.selectDate.errorNoServiceIds");
    return;
  }
  errorMessage.value = "";
  try {
    const response = await api.getAvailability(serviceIds.value, appointmentWeek.value);
    availability.value = response.dates || [];
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : t("bookingFlow.selectDate.errorLoadSlots");
  }
};

const selectSlot = async (date: string, time: string) => {
  selectedDate.value = date;
  selectedTime.value = time;
  try {
    const response = await api.getCheckout(serviceIds.value, date, time);
    checkoutItems.value = response.items ?? [];
    checkoutTotal.value =
      response.total ?? checkoutItems.value.reduce((sum, item) => sum + (item.price || 0), 0);
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : t("bookingFlow.selectDate.errorCheckout");
  }
};

watch(appointmentWeek, loadAvailability);
onMounted(loadAvailability);

useHead(() => ({
  title: t("bookingFlow.selectDate.seoTitle"),
  htmlAttrs: {
    lang: locale.value === "de" ? "de-CH" : "en-CH",
  },
  meta: [
    { name: "description", content: t("bookingFlow.selectDate.seoDescription") },
    { property: "og:title", content: t("bookingFlow.selectDate.seoTitle") },
    { property: "og:description", content: t("bookingFlow.selectDate.seoDescription") },
  ],
}));
</script>