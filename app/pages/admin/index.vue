<template>
  <div class="admin-page px-4">
    <div class="w-full">
      <section v-if="loadingToday" class="mb-6">
        <p class="text-sm text-neutral-400">Lade heutige Termine…</p>
      </section>

      <section v-else class="mb-6">
        <div class="flex items-center justify-between">
          <h2 class="text-md font-medium text-neutral-200">
            Heute
            <span
              v-if="todayAppointments.length"
              class="ml-2 rounded bg-gold-600/20 px-2 py-0.5 text-xs text-gold-400"
            >
              {{ todayAppointments.length }}
            </span>
          </h2>
          <span
            v-if="unpaidPastCount > 0"
            class="text-xs text-amber-400"
          >
            {{ unpaidPastCount }} offen bezahlt
          </span>
        </div>
        <hr class="my-2 border-neutral-600" />

        <div v-if="todayAppointments.length === 0" class="rounded bg-neutral-800 p-4">
          <p class="text-sm text-neutral-400">Keine Termine für heute.</p>
        </div>

        <div v-else class="grid gap-2">
          <nuxt-link
            v-for="appointment in todayAppointments"
            :key="appointment.id"
            :to="'/admin/bookees/' + appointment.id"
            class="flex items-center justify-between rounded bg-neutral-800 p-3"
          >
            <div>
              <p class="text-sm text-neutral-200">
                {{ appointment.time }}
                <span v-if="appointment.cancelled" class="text-red-400"> (Storniert)</span>
              </p>
              <p class="text-xs text-neutral-400">
                {{ appointment.customer?.name }}
                —
                {{
                  appointment.services?.map((s) => s.name).join(", ")
                }}
              </p>
            </div>
            <span
              v-if="!appointment.cancelled && !appointment.isPayed"
              class="text-[10px] uppercase tracking-wide text-amber-400"
            >
              Offen
            </span>
          </nuxt-link>
        </div>
      </section>

      <div class="flex items-center justify-between">
        <h2 class="text-md font-medium text-neutral-200">Kalender</h2>

        <button
          @click="openModal"
          class="bg-gold-600 text-white px-2 py-2 rounded text-xs flex items-center"
        >
          <img src="/add.svg" class="w-4 h-4" alt="" />
          Hinzufügen
        </button>
      </div>
      <hr class="my-2 border-neutral-600" />

      <calendar-component :appointments-updated="appointmentsUpdated" />

      <booking-modal
        v-if="showModal"
        @closeModal="closeModal"
        @fetchAppointments="handleFetchAppointments"
      />
    </div>
</div>
</template>

<script setup lang="ts">
import type { Appointment } from "~/types/booking";

const api = useBookingApi();
const calendarStore = useCalendarStore();

const showModal = ref(false);
const loadingToday = ref(true);
const todayAppointments = ref<Appointment[]>([]);
const unpaidPastCount = ref(0);

const todayIso = () => new Date().toISOString().split("T")[0];

const fetchTodayAppointments = async () => {
  loadingToday.value = true;
  try {
    const day = todayIso();
    const items = await api.getBookees(day, day);
    todayAppointments.value = items
      .filter((a) => a.type !== "pause")
      .sort((a, b) => String(a.time).localeCompare(String(b.time)));

    const monthStart = day.slice(0, 8) + "01";
    const monthEnd = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    )
      .toISOString()
      .split("T")[0];
    const monthItems = await api.getBookees(monthStart, monthEnd);
    const now = new Date();
    unpaidPastCount.value = monthItems.filter((a) => {
      if (a.type === "pause" || a.cancelled || a.isPayed) {
        return false;
      }
      const appointmentDate = new Date(`${a.date}T${a.time}`);
      return appointmentDate < now;
    }).length;
  } catch {
    todayAppointments.value = [];
  } finally {
    loadingToday.value = false;
  }
};

const openModal = () => {
  showModal.value = true;
};

const appointmentsUpdated = ref(false);

function handleFetchAppointments() {
  appointmentsUpdated.value = !appointmentsUpdated.value;
  calendarStore.triggerRefresh();
  fetchTodayAppointments();
  setTimeout(() => {
    appointmentsUpdated.value = !appointmentsUpdated.value;
  }, 1000);
}

const closeModal = () => {
  showModal.value = false;
};

watch(
  () => calendarStore.refreshTick,
  () => {
    fetchTodayAppointments();
  },
);

onMounted(() => {
  fetchTodayAppointments();
});
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
