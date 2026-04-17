<template>
  <section class="page-container pb-16 pt-32 text-white">
    <h1 class="text-3xl font-semibold uppercase tracking-[0.1em]">Termin-Detail</h1>
    <p v-if="errorMessage" class="mt-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{{ errorMessage }}</p>
    <div v-if="appointment" class="mt-6 rounded-sm border border-white/12 p-4 text-sm">
      <p><strong>ID:</strong> {{ appointment.id }}</p>
      <p><strong>Name:</strong> {{ appointment.name || appointment.customer?.name || "-" }}</p>
      <p><strong>E-Mail:</strong> {{ appointment.email || appointment.customer?.email || "-" }}</p>
      <p><strong>Telefon:</strong> {{ appointment.phone || appointment.customer?.phone || "-" }}</p>
      <p><strong>Datum:</strong> {{ formatDate(appointment.date) }} {{ appointment.time }}</p>
      <div class="mt-4 flex gap-3">
        <NuxtLink :to="`/admin/bookees/edit-${appointment.id}`" class="rounded-sm border border-white/20 px-3 py-2 text-xs uppercase">Bearbeiten</NuxtLink>
        <button class="rounded-sm border border-red-400/40 px-3 py-2 text-xs uppercase text-red-100" @click="cancel">Termin stornieren</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Appointment } from "~/types/booking";
import { isApiError } from "~/utils/api";

definePageMeta({ middleware: "auth", layout: "admin" });

const api = useBookingApi();
const route = useRoute();
const router = useRouter();
const appointment = ref<Appointment | null>(null);
const errorMessage = ref("");
const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("de-CH", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
};

const withAuthHandling = async (action: () => Promise<void>) => {
  try {
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
    appointment.value = await api.getAppointment(String(route.params.id));
  });

const cancel = () =>
  withAuthHandling(async () => {
    await api.cancelAppointmentAdmin(String(route.params.id));
    await router.push("/admin");
  });

onMounted(load);
</script>
