<template>
  <section class="page-container py-4 text-white sm:py-6">
    <h1 class="text-xl font-semibold uppercase tracking-[0.08em] sm:text-2xl">Öffnungszeiten</h1>
    <p v-if="errorMessage" class="mt-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{{ errorMessage }}</p>

    <article class="mt-4 rounded-sm border border-white/12 bg-white/3 p-4">
      <div class="space-y-4">
        <div v-for="row in businessHours" :key="row.day" class="rounded-sm border border-white/10 bg-white/3 p-3">
          <p class="mb-2 text-base">{{ weekdayLabels[row.day] || `Tag ${row.day}` }}</p>
          <div class="grid grid-cols-2 gap-2">
            <input v-model="row.from" type="time" class="rounded-sm border border-white/20 bg-transparent px-2 py-2" :disabled="row.off_day === 1" />
            <input v-model="row.to" type="time" class="rounded-sm border border-white/20 bg-transparent px-2 py-2" :disabled="row.off_day === 1" />
          </div>
          <label class="mt-3 flex items-center gap-2 text-sm">
            <input v-model.number="row.off_day" :true-value="1" :false-value="0" type="checkbox" class="h-5 w-5 accent-white" />
            <span>Geschlossen</span>
          </label>
        </div>
      </div>
      <button class="mt-4 w-full rounded-sm bg-[#b88a45] px-4 py-2 text-sm text-white" @click="saveHours">Speichern</button>
    </article>

    <article class="mt-6 rounded-sm border border-white/12 bg-white/3 p-4">
      <h2 class="text-lg">Urlaub</h2>
      <form class="mt-3 grid gap-2" @submit.prevent="addHoliday">
        <label class="text-sm text-white/70">Von:</label>
        <input v-model="newHoliday.from_date" type="date" class="rounded-sm border border-white/20 bg-transparent px-2 py-2 text-sm" required />
        <label class="mt-1 text-sm text-white/70">Bis:</label>
        <input v-model="newHoliday.to_date" type="date" class="rounded-sm border border-white/20 bg-transparent px-2 py-2 text-sm" required />
        <button class="mt-2 w-full rounded-sm bg-[#b88a45] px-4 py-2 text-sm text-white">Speichern</button>
      </form>

      <div v-if="conflictingAppointments.length" class="mt-4 rounded-sm border border-amber-300/30 bg-amber-300/10 p-3 text-sm">
        <p class="font-medium">Konflikttermine erkannt:</p>
        <ul class="mt-2 space-y-1">
          <li v-for="item in conflictingAppointments" :key="item.id" class="flex items-center justify-between gap-2">
            <span>{{ formatDate(item.date) }} {{ item.time }} - {{ item.name || item.customer?.name || "Termin" }}</span>
            <button class="rounded-sm border border-red-400/40 px-2 py-1 text-xs text-red-100" @click="cancelConflict(item.id)">Stornieren</button>
          </li>
        </ul>
      </div>

      <ul class="mt-4 space-y-2 text-sm">
        <li v-for="holiday in holidays" :key="holiday.id" class="flex items-center justify-between rounded-sm border border-white/10 p-3">
          <span>{{ formatDate(holiday.from_date) }} bis {{ formatDate(holiday.to_date) }}</span>
          <button class="rounded-sm border border-red-400/40 px-2 py-1 text-xs text-red-100" @click="removeHoliday(holiday.id)">Löschen</button>
        </li>
        <li v-if="holidays.length === 0" class="rounded-sm border border-white/10 p-3 text-center text-white/55">Keine Urlaube gefunden...</li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { Appointment, BusinessHour, Holiday } from "~/types/booking";
import { isApiError } from "~/utils/api";

definePageMeta({ middleware: "auth", layout: "admin" });

const api = useBookingApi();
const router = useRouter();

const businessHours = ref<BusinessHour[]>([]);
const holidays = ref<Holiday[]>([]);
const conflictingAppointments = ref<Appointment[]>([]);
const errorMessage = ref("");
const newHoliday = reactive({ from_date: "", to_date: "" });
const weekdayLabels = ["So", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("de-CH", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
};

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

const load = () =>
  withAuthHandling(async () => {
    businessHours.value = await api.getBusinessHours(true);
    holidays.value = await api.getHolidays();
  });

const saveHours = () =>
  withAuthHandling(async () => {
    await api.saveBusinessHours(businessHours.value);
  });

const addHoliday = () =>
  withAuthHandling(async () => {
    const holiday = await api.createHoliday(newHoliday.from_date, newHoliday.to_date);
    conflictingAppointments.value = holiday.conflicting_appointments || [];
    await load();
  });

const cancelConflict = (id: number) =>
  withAuthHandling(async () => {
    await api.cancelAppointmentAdmin(id);
    conflictingAppointments.value = conflictingAppointments.value.filter((item) => item.id !== id);
  });

const removeHoliday = (id: number) =>
  withAuthHandling(async () => {
    await api.deleteHoliday(id);
    await load();
  });

onMounted(load);
</script>
