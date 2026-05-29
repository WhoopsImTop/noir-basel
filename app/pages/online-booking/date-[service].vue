<template>
  <section class="booking-shell px-4 mx-auto max-w-[700px] pb-16 pt-32 sm:pt-36 md:pb-20 md:pt-40">
    <p v-if="errorMessage" class="mb-4 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <div class="border border-neutral-800 bg-[#0A0A0A]/85 p-4">
      <div class="flex w-full flex-row items-center justify-between gap-2">
        <button
          type="button"
          class="flex min-h-8 min-w-8 shrink-0 items-center justify-center bg-neutral-700 p-1.5 disabled:pointer-events-none disabled:opacity-40"
          :disabled="appointmentWeek <= 0"
          :aria-label="t('bookingFlow.selectDate.prevWeek')"
          @click="appointmentWeek--"
        >
          <img src="/arrow-left.svg" alt="" width="18" height="18" />
        </button>
        <div class="min-w-0 text-center">
          <h2 class="text-lg font-semibold text-neutral-100">{{ t("bookingFlow.selectDate.heading") }}</h2>
          <p class="mt-1 text-xs text-neutral-400">{{ t("bookingFlow.selectDate.weekLine", { n: appointmentWeek + 1 }) }}</p>
        </div>
        <button
          type="button"
          class="flex min-h-8 min-w-8 shrink-0 items-center justify-center bg-neutral-700 p-1.5"
          :aria-label="t('bookingFlow.selectDate.nextWeek')"
          @click="appointmentWeek++"
        >
          <img src="/arrow-right.svg" alt="" width="18" height="18" />
        </button>
      </div>

      <hr class="my-3 border-neutral-800" />

      <div class="mb-3 mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
        <button
          v-for="option in filterOptions"
          :key="option.value"
          type="button"
          class="border px-4 py-1.5 text-sm transition-colors"
          :class="
            timeFilter === option.value
              ? 'border-gold-600 bg-gold-600 text-white'
              : 'border-neutral-400 text-neutral-200 hover:border-neutral-300'
          "
          @click="timeFilter = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <div v-if="!loadingSlots && hasSlots" class="overflow-x-auto pb-1">
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div v-for="day in availability" :key="day.date" class="w-full p-1">
            <h3 class="text-center text-xs font-semibold text-neutral-100 sm:text-left md:text-sm">
              {{ formatDate(day.date) }}
            </h3>
            <div class="mt-3 flex w-full flex-col items-stretch gap-2 text-center">
              <button
                v-for="timeSlot in filteredTimes(day.times)"
                :key="`${day.date}-${timeSlot}`"
                type="button"
                class=" px-2 py-1.5 text-xs transition-colors"
                :class="isSelected(day.date, timeSlot) ? 'bg-gold-600 text-neutral-100' : slotClass(timeSlot)"
                @click="selectSlot(day.date, timeSlot)"
              >
                {{ timeSlot }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loadingSlots && !hasSlots" class="flex flex-col items-center justify-center py-8 text-center">
        <img src="/booked_out.svg" alt="" class="h-8 w-8" width="32" height="32" />
        <p class="mt-3 text-sm text-neutral-400">{{ t("bookingFlow.selectDate.noSlots") }}</p>
        <button
          type="button"
          class="mt-4 block w-full max-w-sm  bg-gold-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-500"
          @click="appointmentWeek++"
        >
          {{ t("bookingFlow.selectDate.nextWeekSuggestion") }}
        </button>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-10 text-center">
        <img src="/loading.svg" alt="" class="h-8 w-8 animate-spin" width="32" height="32" />
        <p class="mt-4 text-sm text-neutral-400">{{ t("bookingFlow.selectDate.loadingSlots") }}</p>
      </div>

      <hr class="my-4 border-neutral-800" />

      <div v-if="checkoutLoading" class="flex justify-center py-6">
        <img src="/loading.svg" alt="" class="h-8 w-8 animate-spin" width="32" height="32" />
      </div>
      <div v-else>
        <h3 class="text-base font-semibold text-neutral-200">{{ t("bookingFlow.selectDate.checkoutTitle") }}</h3>
        <p v-if="selectedDate && selectedTime" class="mt-1 text-sm text-neutral-400">
          {{ formatDateLong(selectedDate) }} · {{ selectedTime }}
        </p>
        <ul class="mt-3 flex flex-col gap-2">
          <li
            v-for="(item, index) in checkoutItems"
            :key="`${item.id ?? 'line'}-${index}`"
            class="flex items-start justify-between gap-3 text-xs text-neutral-200"
          >
            <span class="min-w-0 flex-1">{{ item.name }}</span>
            <div class="shrink-0 text-right">
              <PriceDisplay
                :price="item.price"
                :old-price="item.old_price ?? undefined"
                :locale="locale"
                price-class="text-xs text-neutral-200"
                compare-class="text-[10px] text-neutral-400"
              />
              <span v-if="item.price_adjustments_since" class="mt-0.5 block text-[10px] text-neutral-400">
                {{ t("bookingFlow.selectDate.priceAdjustmentsSince") }}
                {{ formatAdjustmentDate(item.price_adjustments_since) }}
              </span>
            </div>
          </li>
        </ul>
        <p v-if="checkoutItems.length && selectedDate && selectedTime" class="mt-3 text-sm font-medium text-neutral-100">
          {{ t("bookingFlow.selectDate.checkoutTotal") }}: {{ formatPrice(checkoutTotal) }}
        </p>
        <p class="mt-3 text-sm text-neutral-400">{{ t("bookingFlow.selectDate.voucherHint") }}</p>
        <p class="mt-3 text-sm text-neutral-400">{{ t("bookingFlow.selectService.disclaimer") }}</p>
      </div>

      <hr class="my-4 border-neutral-800" />
      <button
        id="booking-step2-next"
        type="button"
        :disabled="!selectedDate || !selectedTime"
        :class="
          !selectedDate || !selectedTime
            ? 'block w-full cursor-not-allowed  bg-neutral-600 px-4 py-2.5 text-sm font-medium text-neutral-200'
            : 'block w-full  bg-gold-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-500'
        "
        @click="goCustomerStep"
      >
        {{ t("bookingFlow.selectDate.nextCustomer") }} ({{ formatPrice(checkoutTotal) }})
      </button>
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
const router = useRouter();

const serviceIds = computed(() => parseCsvNumbers(String(route.params.service || "")));
const appointmentWeek = ref(0);
const availability = ref<AvailabilityDay[]>([]);
const checkoutItems = ref<CheckoutItem[]>([]);
const checkoutTotal = ref(0);
const selectedDate = ref("");
const selectedTime = ref("");
const errorMessage = ref("");
const timeFilter = ref("all");
const loadingSlots = ref(true);
const checkoutLoading = ref(false);
const earlyBirdBoundary = ref("09:30");
const lateBookerBoundary = ref("19:00");

const numberLocale = computed(() => (locale.value === "de" ? "de-CH" : "en-CH"));

const filterOptions = computed(() => [
  { value: "all", label: t("bookingFlow.selectDate.filterAll") },
  { value: "12", label: t("bookingFlow.selectDate.filter12") },
  { value: "15", label: t("bookingFlow.selectDate.filter15") },
  { value: "18", label: t("bookingFlow.selectDate.filter18") },
]);

const hasSlots = computed(() => availability.value.some((day) => day.times.length > 0));

const formatPrice = (price: number) =>
  new Intl.NumberFormat(numberLocale.value, { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(price);

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(numberLocale.value, { weekday: "short", day: "numeric", month: "numeric" });

const formatDateLong = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(numberLocale.value, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatAdjustmentDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(numberLocale.value, { day: "2-digit", month: "2-digit", year: "numeric" });
};

const filteredTimes = (times: string[]) => {
  const threshold = Number(timeFilter.value);
  if (!Number.isFinite(threshold)) return times;
  return times.filter((time) => Number(time.split(":")[0]) >= threshold);
};

const normalizeTime = (time: string) => (time.length >= 5 ? time.slice(0, 5) : time);

const slotClass = (time: string) => {
  const tNorm = normalizeTime(time);
  if (tNorm && tNorm < earlyBirdBoundary.value) {
    return "border border-neutral-400 bg-[#0A0A0A]/85 text-neutral-200 hover:bg-neutral-700";
  }
  if (tNorm && tNorm > lateBookerBoundary.value) {
    return "border border-neutral-400 bg-[#0A0A0A]/85 text-neutral-200 hover:bg-neutral-700";
  }
  return "bg-neutral-700 text-neutral-200 hover:bg-neutral-600";
};

const isSelected = (date: string, time: string) => selectedDate.value === date && selectedTime.value === time;

const loadPricingWindows = async () => {
  try {
    const settings = await api.getSettings(["early_bird_time", "late_booker_time"]);
    if (settings.early_bird_time) earlyBirdBoundary.value = normalizeTime(String(settings.early_bird_time));
    if (settings.late_booker_time) lateBookerBoundary.value = normalizeTime(String(settings.late_booker_time));
  } catch {
    earlyBirdBoundary.value = "09:30";
    lateBookerBoundary.value = "19:00";
  }
};

const loadAvailability = async () => {
  if (!serviceIds.value.length) {
    errorMessage.value = t("bookingFlow.selectDate.errorNoServiceIds");
    loadingSlots.value = false;
    return;
  }
  errorMessage.value = "";
  loadingSlots.value = true;
  try {
    const response = await api.getAvailability(serviceIds.value, appointmentWeek.value);
    availability.value = response.dates || [];
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : t("bookingFlow.selectDate.errorLoadSlots");
  } finally {
    loadingSlots.value = false;
  }
};

const selectSlot = async (date: string, time: string) => {
  selectedDate.value = date;
  selectedTime.value = time;
  checkoutLoading.value = true;
  try {
    const response = await api.getCheckout(serviceIds.value, date, time);
    checkoutItems.value = response.items ?? [];
    checkoutTotal.value =
      response.total ?? checkoutItems.value.reduce((sum, item) => sum + (item.price || 0), 0);
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : t("bookingFlow.selectDate.errorCheckout");
    checkoutItems.value = [];
    checkoutTotal.value = 0;
  } finally {
    checkoutLoading.value = false;
  }
  await nextTick();
  document.querySelector("#booking-step2-next")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

const goCustomerStep = async () => {
  if (!selectedDate.value || !selectedTime.value) return;
  await router.push(
    localePath(`/online-booking/booking-${route.params.service}_${selectedDate.value}_${selectedTime.value}`),
  );
};

watch(appointmentWeek, loadAvailability);

onMounted(async () => {
  await loadPricingWindows();
  await loadAvailability();
});

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
