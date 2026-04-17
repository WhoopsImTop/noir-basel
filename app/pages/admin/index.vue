<template>
  <section class="page-container py-4 sm:py-6">
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl font-semibold uppercase tracking-[0.08em] sm:text-2xl">Kalender & Tagessteuerung</h1>
      <button class="w-full rounded-sm border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.12em] sm:w-auto" @click="loadData">Neu laden</button>
    </div>

    <p v-if="errorMessage" class="mb-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{{ errorMessage }}</p>

    <AdminBookingCalendar :appointments="appointments" :pauses="pauses" @refreshed="loadData" @error="setError" />

    <div class="mt-5 grid gap-4 lg:grid-cols-2">
      <article class="rounded-sm border border-white/12 bg-white/3 p-4">
        <h2 class="text-sm uppercase tracking-[0.12em] text-white/70">Schnellanlage Termin</h2>
        <form class="mt-3 grid gap-2" @submit.prevent="createAdminAppointment">
          <input v-model="appointmentForm.serviceCsv" placeholder="Service IDs (z. B. 1,3)" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" required />
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input v-model="appointmentForm.date" type="date" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" required />
            <input v-model="appointmentForm.time" type="time" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" required />
          </div>
          <input v-model="appointmentForm.name" placeholder="Name" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" />
          <input v-model="appointmentForm.email" type="email" placeholder="E-Mail" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" />
          <input v-model="appointmentForm.phone" placeholder="Telefon" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" />
          <button class="w-full rounded-sm bg-white px-3 py-2 text-xs uppercase tracking-[0.12em] text-black">Termin speichern</button>
        </form>
      </article>

      <article class="rounded-sm border border-white/12 bg-white/3 p-4">
        <h2 class="text-sm uppercase tracking-[0.12em] text-white/70">Heutige Termine</h2>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="appointment in todayAppointments" :key="appointment.id" class="rounded-sm border border-white/10 p-3">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <NuxtLink :to="`/admin/bookees/${appointment.id}`" class="underline">
                {{ appointment.time }} - {{ appointment.name || appointment.customer?.name || "Termin" }}
              </NuxtLink>
              <button class="w-full rounded-sm border border-white/20 px-2 py-1 text-xs sm:w-auto" @click="markPaid(appointment.id)">
                Bezahlt
              </button>
            </div>
          </li>
          <li v-if="todayAppointments.length === 0" class="text-white/60">Keine Termine für heute.</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Appointment, PauseTime } from "~/types/booking";
import { isApiError, parseCsvNumbers } from "~/utils/api";

definePageMeta({ middleware: "auth", layout: "admin" });

const api = useBookingApi();
const router = useRouter();
const errorMessage = ref("");
const appointments = ref<Appointment[]>([]);
const pauses = ref<PauseTime[]>([]);
const today = new Date().toISOString().slice(0, 10);

const appointmentForm = reactive({
  serviceCsv: "",
  date: today,
  time: "10:00",
  name: "",
  email: "",
  phone: "",
});

const todayAppointments = computed(() =>
  appointments.value
    .filter((item) => item.date === today)
    .sort((a, b) => (a.time || "").localeCompare(b.time || "")),
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
    errorMessage.value = isApiError(error) ? error.message : "Admin-Aktion fehlgeschlagen.";
  }
};

const monthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { first, last };
};

const loadData = () =>
  withAuthHandling(async () => {
    const { first, last } = monthRange();
    appointments.value = await api.getBookees(first, last);
    pauses.value = await api.getPauseTimes();
  });

const setError = (message: string) => {
  errorMessage.value = message;
};

const createAdminAppointment = () =>
  withAuthHandling(async () => {
    await api.createAdminAppointment({
      service_ids: parseCsvNumbers(appointmentForm.serviceCsv),
      date: appointmentForm.date,
      time: appointmentForm.time,
      name: appointmentForm.name || undefined,
      email: appointmentForm.email || undefined,
      phone: appointmentForm.phone || undefined,
    });
    await loadData();
  });

const markPaid = (id: number) =>
  withAuthHandling(async () => {
    await api.markAsPaid(id, 0);
    await loadData();
  });

onMounted(loadData);
</script>
