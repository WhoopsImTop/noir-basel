<template>
  <section class="booking-shell px-4 mx-auto max-w-[700px] pb-16 pt-32 sm:pt-36 md:pb-20 md:pt-40">
    <div v-if="pageLoading" class="flex flex-col items-center justify-center py-16 text-center">
      <img src="/loading.svg" alt="" class="h-8 w-8 animate-spin" width="32" height="32" />
      <p class="mt-4 text-sm text-neutral-400">{{ t("bookingFlow.change.loading") }}</p>
    </div>

    <template v-else-if="errorMessage">
      <h1 class="section-heading text-3xl text-white sm:text-4xl">{{ t("bookingFlow.change.errorHeading") }}</h1>
      <p class="mt-4 border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        {{ errorMessage }}
      </p>
      <NuxtLink
        :to="localePath('/online-booking')"
        class="mt-8 inline-flex min-h-11 items-center border border-transparent bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0]"
      >
        {{ t("bookingFlow.change.backToBooking") }}
      </NuxtLink>
    </template>

    <template v-else-if="rescheduleSuccess">
      <h1 class="section-heading text-3xl text-white sm:text-4xl">{{ t("bookingFlow.change.successHeading") }}</h1>
      <p class="muted-copy mt-3 max-w-xl text-sm leading-relaxed">{{ t("bookingFlow.change.successIntro") }}</p>

      <div class="mt-8 border border-neutral-800 bg-[#0A0A0A]/85 p-4">
        <h2 class="text-base font-semibold text-neutral-200">{{ t("bookingFlow.change.newAppointment") }}</h2>
        <hr class="my-4 border-neutral-800" />
        <dl class="space-y-2 text-sm text-neutral-400">
          <div class="flex flex-wrap gap-2">
            <dt class="text-neutral-500">{{ t("bookingFlow.success.labelDate") }}</dt>
            <dd class="text-neutral-200">{{ successDate }}</dd>
          </div>
          <div class="flex flex-wrap gap-2">
            <dt class="text-neutral-500">{{ t("bookingFlow.success.labelTime") }}</dt>
            <dd class="text-neutral-200">{{ successTime }}</dd>
          </div>
        </dl>
        <p v-if="serviceNames" class="mt-3 text-sm text-neutral-400">
          {{ t("bookingFlow.change.servicesLine", { services: serviceNames }) }}
        </p>
      </div>

      <div class="mt-8 flex flex-wrap gap-4">
        <NuxtLink
          :to="localePath('/online-booking')"
          class="inline-flex min-h-11 items-center border border-transparent bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0]"
        >
          {{ t("bookingFlow.change.backToBooking") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/')"
          class="inline-flex min-h-11 items-center border border-neutral-600 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-200 duration-500 hover:border-neutral-400"
        >
          {{ t("bookingFlow.change.homeCta") }}
        </NuxtLink>
      </div>
    </template>

    <template v-else>
      <h1 class="section-heading text-3xl text-white sm:text-4xl">{{ t("bookingFlow.change.heading") }}</h1>
      <p class="muted-copy mt-3 max-w-xl text-sm leading-relaxed">{{ t("bookingFlow.change.intro") }}</p>

      <div v-if="appointment" class="mt-8 border border-neutral-800 bg-[#0A0A0A]/85 p-4">
        <h2 class="text-base font-semibold text-neutral-200">{{ t("bookingFlow.change.currentAppointment") }}</h2>
        <hr class="my-4 border-neutral-800" />
        <p class="text-sm text-neutral-300">
          {{ t("bookingFlow.cancellation.dateLine", { date: currentDateLong, time: currentTimeFormatted }) }}
        </p>
        <p v-if="serviceNames" class="mt-2 text-sm text-white/55">
          {{ t("bookingFlow.change.servicesLine", { services: serviceNames }) }}
        </p>
        <p v-if="totalDuration" class="mt-1 text-xs text-neutral-500">
          {{
            t("bookingFlow.change.durationLine", {
              minutes: totalDuration,
              unit: t("bookingFlow.common.minutes"),
            })
          }}
        </p>
      </div>

      <div v-if="employees.length > 1" class="mt-6 border border-neutral-800 bg-[#0A0A0A]/85 p-4">
        <label class="mb-2 block text-xs text-neutral-400" for="change-employee">
          {{ t("bookingFlow.selectDate.employeeLabel") }}
        </label>
        <select
          id="change-employee"
          v-model.number="selectedEmployeeId"
          class="w-full border border-neutral-700 bg-[#0A0A0A] px-3 py-2.5 text-sm text-neutral-100 focus:border-gold-600 focus:outline-none"
          @change="onEmployeeChange"
        >
          <option
            v-for="employee in employees"
            :key="employee.id"
            :value="employee.id"
          >
            {{ employeeDisplayName(employee) }}{{
              suggestedEmployeeId === employee.id
                ? ` (${t("bookingFlow.selectDate.suggestedBadge")})`
                : ""
            }}
          </option>
        </select>
      </div>

      <div class="mt-6 border border-neutral-800 bg-[#0A0A0A]/85 p-4">
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
            <h2 class="text-lg font-semibold text-neutral-100">{{ t("bookingFlow.change.selectNewTime") }}</h2>
            <p class="mt-1 text-xs text-neutral-400">
              {{ t("bookingFlow.selectDate.weekLine", { n: appointmentWeek + 1 }) }}
            </p>
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
                {{ formatDateShort(day.date) }}
              </h3>
              <div class="mt-3 flex w-full flex-col items-stretch gap-2 text-center">
                <button
                  v-for="timeSlot in filteredTimes(day.times)"
                  :key="`${day.date}-${timeSlot}`"
                  type="button"
                  class="px-2 py-1.5 text-xs transition-colors"
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
            class="mt-4 block w-full max-w-sm bg-gold-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-500"
            @click="appointmentWeek++"
          >
            {{ t("bookingFlow.selectDate.nextWeekSuggestion") }}
          </button>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-10 text-center">
          <img src="/loading.svg" alt="" class="h-8 w-8 animate-spin" width="32" height="32" />
          <p class="mt-4 text-sm text-neutral-400">{{ t("bookingFlow.selectDate.loadingSlots") }}</p>
        </div>
      </div>

      <div
        v-if="selectedDate && selectedTime"
        class="mt-6 border border-neutral-800 bg-[#0A0A0A]/85 p-4"
      >
        <h3 class="text-base font-semibold text-neutral-200">{{ t("bookingFlow.change.confirmChange") }}</h3>
        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="border border-red-500/35 bg-red-500/10 p-3">
            <p class="text-xs font-medium uppercase tracking-wide text-red-200/80">
              {{ t("bookingFlow.change.currentTime") }}
            </p>
            <p class="mt-2 text-sm text-red-100">
              {{ t("bookingFlow.cancellation.dateLine", { date: currentDateLong, time: currentTimeFormatted }) }}
            </p>
          </div>
          <div class="border border-neutral-700 bg-neutral-900/40 p-3">
            <p class="text-xs font-medium uppercase tracking-wide text-neutral-400">
              {{ t("bookingFlow.change.newTime") }}
            </p>
            <p class="mt-2 text-sm text-neutral-200">
              {{ t("bookingFlow.cancellation.dateLine", { date: selectedDateLong, time: selectedTimeFormatted }) }}
            </p>
          </div>
        </div>

        <label class="mt-6 flex max-w-xl items-start gap-2 text-sm text-white/75">
          <input v-model="confirmed" type="checkbox" class="mt-1 h-4 w-4 accent-white" />
          <span>{{ t("bookingFlow.change.confirmLabel") }}</span>
        </label>

        <p v-if="submitError" class="mt-4 border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {{ submitError }}
        </p>

        <button
          type="button"
          class="mt-6 min-h-11 w-full border border-transparent bg-gold-600 px-6 py-3 text-sm font-medium text-white duration-500 hover:bg-gold-500 disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:text-neutral-200"
          :disabled="!confirmed || isSubmitting"
          @click="confirmReschedule"
        >
          {{ isSubmitting ? t("bookingFlow.change.processing") : t("bookingFlow.change.confirmButton") }}
        </button>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { AvailabilityDay, ReschedulePreview, StaffEmployee } from "~/types/booking";
import { ApiError, isApiError } from "~/utils/api";
import {
  formatBookingDate,
  formatBookingTime,
  normalizeBookingDateInput,
} from "~/utils/booking-datetime";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const api = useBookingApi();
const route = useRoute();

const keyValue = computed(() => String(route.query.key || ""));
const numberLocale = computed(() => toBcp47Locale(locale.value));

const pageLoading = ref(true);
const errorMessage = ref("");
const submitError = ref("");
const rescheduleSuccess = ref(false);
const isSubmitting = ref(false);
const confirmed = ref(false);

const appointment = ref<ReschedulePreview | null>(null);
const availability = ref<AvailabilityDay[]>([]);
const employees = ref<StaffEmployee[]>([]);
const selectedEmployeeId = ref<number | null>(null);
const suggestedEmployeeId = ref<number | null>(null);
const appointmentWeek = ref(0);
const loadingSlots = ref(false);
const timeFilter = ref("all");
const selectedDate = ref("");
const selectedTime = ref("");
const successDate = ref("—");
const successTime = ref("—");

const earlyBirdBoundary = ref("09:30");
const lateBookerBoundary = ref("19:00");

const filterOptions = computed(() => [
  { value: "all", label: t("bookingFlow.selectDate.filterAll") },
  { value: "12", label: t("bookingFlow.selectDate.filter12") },
  { value: "15", label: t("bookingFlow.selectDate.filter15") },
  { value: "18", label: t("bookingFlow.selectDate.filter18") },
]);

const serviceNames = computed(() =>
  appointment.value?.services?.map((service) => service.name).filter(Boolean).join(", ") || "",
);

const totalDuration = computed(() =>
  appointment.value?.services?.reduce((sum, service) => sum + (service.step || 0), 0) || 0,
);

const hasSlots = computed(() => availability.value.some((day) => day.times.length > 0));

const formatDateLong = (value: string) => formatBookingDate(value, numberLocale.value);

const currentDateLong = computed(() =>
  appointment.value?.date ? formatDateLong(appointment.value.date) : "—",
);

const currentTimeFormatted = computed(() =>
  appointment.value?.time ? formatBookingTime(appointment.value.time, numberLocale.value) : "—",
);

const selectedDateLong = computed(() =>
  selectedDate.value ? formatDateLong(selectedDate.value) : "—",
);

const selectedTimeFormatted = computed(() =>
  selectedTime.value ? formatBookingTime(selectedTime.value, numberLocale.value) : "—",
);

const formatDateShort = (value: string) => {
  const normalized = normalizeBookingDateInput(value);
  if (!normalized) return value;
  const parsed = new Date(`${normalized}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(numberLocale.value, {
    weekday: "short",
    day: "numeric",
    month: "numeric",
  });
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

const isSelected = (date: string, time: string) =>
  selectedDate.value === date && selectedTime.value === time;

const mapAvailableTimes = (availableTimes: Record<string, string[]>) =>
  Object.entries(availableTimes || {})
    .map(([date, times]) => ({ date, times: times || [] }))
    .sort((a, b) => a.date.localeCompare(b.date));

const mapRescheduleError = (error: unknown, context: "load" | "submit"): string => {
  if (!(error instanceof ApiError)) {
    return context === "load" ? t("bookingFlow.change.loadError") : t("bookingFlow.change.rescheduleError");
  }
  const message = error.message.toLowerCase();
  if (error.status === 429) return t("bookingFlow.change.rateLimit");
  if (error.status === 404) return t("bookingFlow.change.invalidKey");
  if (error.status === 409) {
    if (message.includes("cancelled")) return t("bookingFlow.change.cancelledAppointment");
    if (message.includes("not available") || message.includes("nicht verfügbar")) {
      return t("bookingFlow.change.slotUnavailable");
    }
  }
  if (isApiError(error) && error.message.trim()) return error.message;
  return context === "load" ? t("bookingFlow.change.loadError") : t("bookingFlow.change.rescheduleError");
};

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

const loadRescheduleData = async () => {
  if (!keyValue.value) {
    errorMessage.value = t("bookingFlow.change.missingKey");
    pageLoading.value = false;
    return;
  }

  if (!pageLoading.value) {
    loadingSlots.value = true;
  }
  submitError.value = "";

  try {
    const response = await api.getReschedulePreview(
      keyValue.value,
      appointmentWeek.value,
      selectedEmployeeId.value,
    );
    appointment.value = response.appointment;
    availability.value = mapAvailableTimes(response.available_times);
    employees.value = response.employees || [];
    suggestedEmployeeId.value = response.suggested_employee_id ?? null;
    const stillValid =
      selectedEmployeeId.value != null &&
      employees.value.some((e) => e.id === selectedEmployeeId.value);
    if (!stillValid) {
      selectedEmployeeId.value =
        response.employee_id ??
        response.appointment?.employee_id ??
        response.suggested_employee_id ??
        employees.value[0]?.id ??
        null;
    }
    if (!pageLoading.value) {
      selectedDate.value = "";
      selectedTime.value = "";
      confirmed.value = false;
    }
  } catch (error) {
    if (pageLoading.value) {
      errorMessage.value = mapRescheduleError(error, "load");
    } else {
      submitError.value = mapRescheduleError(error, "load");
    }
  } finally {
    pageLoading.value = false;
    loadingSlots.value = false;
  }
};

const employeeDisplayName = (employee: StaffEmployee) =>
  employee.staff_name || employee.display_name || employee.name || "";

const onEmployeeChange = async () => {
  selectedDate.value = "";
  selectedTime.value = "";
  confirmed.value = false;
  await loadRescheduleData();
};

const selectSlot = (date: string, time: string) => {
  selectedDate.value = date;
  selectedTime.value = time;
  submitError.value = "";
  confirmed.value = false;
};

const confirmReschedule = async () => {
  if (!keyValue.value || !selectedDate.value || !selectedTime.value || !confirmed.value) return;

  isSubmitting.value = true;
  submitError.value = "";

  try {
    const result = await api.submitReschedule(keyValue.value, {
      date: selectedDate.value,
      time: selectedTime.value,
      employee_id: selectedEmployeeId.value || undefined,
    });
    successDate.value = formatDateLong(selectedDate.value || result.appointment.date);
    successTime.value = formatBookingTime(selectedTime.value || result.appointment.time, numberLocale.value);
    rescheduleSuccess.value = true;
  } catch (error) {
    submitError.value = mapRescheduleError(error, "submit");
  } finally {
    isSubmitting.value = false;
  }
};

watch(appointmentWeek, () => {
  if (!keyValue.value || errorMessage.value || rescheduleSuccess.value) return;
  loadRescheduleData();
});

onMounted(async () => {
  await loadPricingWindows();
  await loadRescheduleData();
});

useHead(() => ({
  title: t("bookingFlow.change.seoTitle"),
  htmlAttrs: {
    lang: toBcp47Locale(locale.value),
  },
  meta: [
    { name: "description", content: t("bookingFlow.change.seoDescription") },
    { property: "og:title", content: t("bookingFlow.change.seoTitle") },
    { property: "og:description", content: t("bookingFlow.change.seoDescription") },
  ],
}));
</script>
