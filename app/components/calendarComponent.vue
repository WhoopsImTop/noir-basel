<template>
  <div>
    <Teleport to="body">
            <div
        v-if="appointmentPayedModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
        @click="appointmentPayedModal = false"
      >
        <div
          class="mx-4 my-10 max-w-[600px] rounded-lg bg-neutral-800 p-4"
          @click.stop
        >
          <h3 class="text-lg font-medium text-neutral-200">Termin bezahlen</h3>
          <p class="mt-2 text-sm text-neutral-400">
            Betrag den der Kunden bezahlt hat (anpassbar)
          </p>
          <div class="relative">
            <input
              v-model="amount"
              type="number"
              class="w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-neutral-200"
            />
            <span
              class="absolute right-4 top-1/2 -translate-y-1/2 transform text-neutral-500"
            >
              CHF
            </span>
          </div>
          <div class="mt-4 flex items-center justify-end">
            <button
              class="rounded bg-gold-600 px-4 py-2 text-white"
              @click="setAppointmentToPayed(appointmentToBePayed, amount)"
            >
              Bezahlen
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="commentToShow !== ''"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
        @click="commentToShow = ''"
      >
        <div
          class="mx-4 my-10 max-w-[600px] rounded-lg bg-neutral-800 p-4"
          @click.stop
        >
          <h3 class="text-lg font-medium text-neutral-200">Hinterlegter Kommentar</h3>
          <p class="mt-2 text-sm text-neutral-400">{{ commentToShow }}</p>
          <div class="mt-4 flex items-center justify-end">
            <button
              class="rounded bg-gold-600 px-4 py-2 text-white"
              @click="commentToShow = ''"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </Teleport>
<div class="flex items-center justify-between">
      <div
        @click="prevMonth"
        class="min-w-6 min-h-6 flex items-center justify-center bg-neutral-700 rounded-full"
      >
        <img src="/arrow-left.svg" alt="prev" />
      </div>
      <h2 class="text-md font-medium text-neutral-400">
        {{ months[currentMonth] }} {{ currentYear }}
      </h2>
      <div
        @click="nextMonth"
        class="min-w-6 min-h-6 flex items-center justify-center bg-neutral-700 rounded-full"
      >
        <img src="/arrow-right.svg" alt="prev" />
      </div>
    </div>
    <div class="grid grid-cols-7 mt-4">
      <div
        v-for="day in weekDays"
        :key="day"
        class="flex items-center justify-center border-b border-neutral-700"
      >
        <div class="text-sm text-neutral-400">{{ day }}</div>
      </div>
      <template v-for="day in firstDay" :key="day">
        <div></div>
      </template>
      <div
        v-for="day in days"
        :key="day"
        :data-date="getFullDate(day)"
        class="flex flex-col items-center border-b border-neutral-700 py-2"
        @click="selectDay(day)"
      >
        <div class="text-sm text-neutral-200" :class="generateStyles(day)">
          {{ day }}
        </div>
        <div
          v-if="hasAppointment(day)"
          class="bg-neutral-700 w-1.5 h-1.5 rounded-full flex items-center justify-center mt-1"
        ></div>
        <div v-else class="mt-1"></div>
      </div>
      <template v-for="day in lastDay" :key="day">
        <div></div>
      </template>
    </div>
    <div
      v-if="AppointmentsForSelectedDate.length > 0"
      class="relative flex flex-col mt-4"
    >
      <template v-for="appointment in AppointmentsForSelectedDate">
        <div
          class="flex items-center justify-between border-b border-neutral-700 py-2"
          :key="appointment.id"
          v-if="appointment.type === 'appointment'"
        >
          <nuxt-link
            class="flex items-start"
            :to="'/admin/bookees/' + appointment.id"
          >
            <div
              class="w-1 rounded-lg py-5 mr-2"
              :class="generateStatusStyle(appointment)"
            ></div>
            <div class="flex flex-col">
              <h3
                class="text-md flex items-center gap-2"
                :class="
                  appointmentInThePast(appointment)
                    ? 'text-neutral-500'
                    : 'text-neutral-200'
                "
              >
                {{ appointment.customer.name }}
                {{ appointment.cancelled ? "(Storniert)" : "" }}

                <img
                  v-if="customerIsNew(appointment)"
                  src="/person_add.svg"
                  alt="Neuer Kunde"
                  class="w-6"
                />
                <span
                  v-if="customerIsLoyal(appointment)"
                  class="rounded px-1 py-0.5 text-[10px] uppercase tracking-wide bg-gold-600/30 text-gold-400"
                  >Stamm</span
                >
              </h3>
              <p
                class="text-xs"
                :class="
                  appointmentInThePast(appointment)
                    ? 'text-neutral-500'
                    : 'text-neutral-400'
                "
              >
                {{
                  !appointment.cancelled
                    ? appointment.services
                        .map((service) => service.name)
                        .join(", ")
                    : "Stroniert am " +
                      new Date(appointment.cancelled_at).toLocaleString("de-DE")
                }}
              </p>
            </div>
          </nuxt-link>
          <div class="flex items-center">
            <div
              class="flex items-center"
              v-if="appointment.customer.comment"
              @click="displayComment(appointment.customer.comment)"
            >
              <img
                src="/commentnotice.svg"
                alt="comment"
                class="w-6 h-6 mr-4"
              />
            </div>
            <!-- Zeigt die Zeiten an, wenn der Termin bezahlt ist -->
            <div
              class="flex flex-col text-sm items-end"
              v-if="
                appointment.isPayed ||
                !appointmentInThePast(appointment) ||
                appointment.cancelled
              "
              :class="
                appointmentInThePast(appointment)
                  ? 'text-neutral-500'
                  : 'text-neutral-200'
              "
            >
              <span>{{ appointment.time }}</span>
              <span>{{ calculateEndTime(appointment) }}</span>
            </div>
            <!-- Zeigt den Button an, wenn der Termin in der Vergangenheit ist und nicht bezahlt ist -->
            <div
              class="flex items-center"
              v-else-if="
                !appointment.isPayed &&
                appointmentInThePast(appointment) &&
                !appointment.cancelled
              "
            >
              <button
                class="bg-gold-600 text-white px-2 py-1 rounded text-xs"
                :key="appointment.id"
                @click="startPayment(appointment)"
              >
                {{ appointment.loading ? "Lade..." : "Bezahlt" }}
              </button>
            </div>
          </div>
        </div>
        <div
          class="flex items-center justify-between border-b border-neutral-700 py-2"
          :key="appointment.id + (appointment.instance ?? 0)"
          v-if="appointment.type === 'pause'"
        >
          <nuxt-link
            class="flex items-start"
            :to="'/admin/pause-times/' + appointment.id"
          >
            <div class="w-1 rounded-lg py-5 mr-2 bg-blue-500"></div>
            <div class="flex flex-col">
              <h3
                class="text-md"
                :class="
                  appointmentInThePast(appointment)
                    ? 'text-neutral-500'
                    : 'text-neutral-200'
                "
              >
                {{ appointment.name ?? "Pause" }}
              </h3>
            </div>
          </nuxt-link>
          <!-- Zeigt die Zeiten an, wenn der Termin bezahlt ist -->
          <div
            class="flex flex-col text-sm items-end"
            :class="
              appointmentInThePast(appointment)
                ? 'text-neutral-500'
                : 'text-neutral-200'
            "
          >
            <span>{{
              appointment.start_time.split(":")[0] +
              ":" +
              appointment.start_time.split(":")[1]
            }}</span>
            <span>{{ calculateEndTime(appointment) }}</span>
          </div>
        </div>
      </template>
    </div>
    <div v-else class="flex items-center justify-center mt-4">
      <p class="text-neutral-400">Noch keine Buchungen</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isLoyalCustomer, isNewCustomer } from "~/utils/customer";

const notificationStore = useNotificationStore();
const calendarStore = useCalendarStore();
const api = useBookingApi();

const props = defineProps({
  appointmentsUpdated: Boolean,
});

const refreshCalendarData = async () => {
  await getAppointments(getFullDate(1), getFullDate(daysInMonth.value));
  await getPauseTimes();
};

watch(
  () => props.appointmentsUpdated,
  () => {
    if (props.appointmentsUpdated) {
      refreshCalendarData();
    }
  },
);

watch(
  () => calendarStore.refreshTick,
  () => {
    refreshCalendarData();
  },
);

const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const daysInMonth = ref(
  new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
);
const firstDay = ref(
  (new Date(currentYear.value, currentMonth.value, 1).getDay() || 7) - 1
);

const lastDay = ref(
  new Date(currentYear.value, currentMonth.value, daysInMonth.value).getDay()
);
const today = ref(new Date().toISOString().split("T")[0]);
const days = ref([]);
const months = ref([
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
]);
const weekDays = ref(["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]);

const selectDay = (day) => {
  selectedDate.value = getFullDate(day);
  calendarStore.setCurrentDate(selectedDate.value);
};

const getDays = () => {
  days.value = [];
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.value.push(i);
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  daysInMonth.value = new Date(
    currentYear.value,
    currentMonth.value + 1,
    0
  ).getDate();
  firstDay.value = (new Date(currentYear.value, currentMonth.value, 1).getDay() || 7) - 1;
  lastDay.value = new Date(
    currentYear.value,
    currentMonth.value,
    daysInMonth.value
  ).getDay();
  getDays();
  getAppointments(getFullDate(1), getFullDate(daysInMonth.value));
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  daysInMonth.value = new Date(
    currentYear.value,
    currentMonth.value + 1,
    0
  ).getDate();
  firstDay.value = (new Date(currentYear.value, currentMonth.value, 1).getDay() || 7) - 1;
  lastDay.value = new Date(
    currentYear.value,
    currentMonth.value,
    daysInMonth.value
  ).getDay();
  getDays();
  getAppointments(getFullDate(1), getFullDate(daysInMonth.value));
};

getDays();

const selectedDate = ref(today.value);

const generateStyles = (day) => {
  day = getFullDate(day);
  if (selectedDate.value === day) {
    return "bg-gold-600 text-white rounded-full w-5 h-5 flex items-center justify-center pt-1";
  }
  if (day === today.value) {
    return "font-bold";
  }
};

// Hier wird das vollständige Datum berechnet
const getFullDate = (day) => {
  const month = currentMonth.value + 1; // Monat in JavaScript ist 0-basiert
  const dayStr = day < 10 ? `0${day}` : day;
  const monthStr = month < 10 ? `0${month}` : month;
  return `${currentYear.value}-${monthStr}-${dayStr}`;
};

const appointments = ref([]);
const pauseTimes = ref([]);
const getAppointments = async (start, end) => {
  try {
    appointments.value = await api.getBookees(start, end);
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      localStorage.removeItem("access_token");
      await navigateTo("/admin/auth/login");
    }
  }
};

const getPauseTimes = async () => {
  try {
    pauseTimes.value = await api.getPauseTimes();
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      localStorage.removeItem("access_token");
      await navigateTo("/admin/auth/login");
    }
  }
};

onMounted(async () => {
  await refreshCalendarData();
  document.addEventListener("visibilitychange", onVisibilityChange);
  refreshInterval = setInterval(() => {
    if (document.visibilityState === "visible") {
      refreshCalendarData();
    }
  }, 60000);
});

const onVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    refreshCalendarData();
  }
};

let refreshInterval: ReturnType<typeof setInterval> | null = null;

onUnmounted(() => {
  document.removeEventListener("visibilitychange", onVisibilityChange);
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

const AppointmentsForSelectedDate = computed(() => {
  // Filter appointments and pauseTimes by the selected date
  const appointmentsForDate = appointments.value.filter(
    (appointment) => appointment.date === selectedDate.value
  );
  const pauseTimesForDate = pauseTimes.value.filter(
    (pause) => pause.date === selectedDate.value
  );

  // Combine appointments and pause times
  const appointmentsWithPauseTimes =
    appointmentsForDate.concat(pauseTimesForDate);

  // Order by start_time (assuming 'time' is a string or number representing time)
  appointmentsWithPauseTimes.sort((a, b) => {
    if (a.time < b.time) {
      return -1;
    }
    if (a.time > b.time) {
      return 1;
    }
    return 0;
  });

  console.log(appointmentsWithPauseTimes);
  console.log(pauseTimesForDate);
  return appointmentsWithPauseTimes.length > 0
    ? appointmentsWithPauseTimes
    : pauseTimesForDate; // If no appointments, return only the pauses for that day
});

const calculateEndTime = (appointment) => {
  if (appointment.type === "pause") {
    const endTime = appointment.end_time.split(":");
    const endHour = endTime[0];
    const endMinute = endTime[1];
    return `${endHour}:${endMinute}`;
  }
  const serviceTime = appointment.edited_duration
    ? appointment.edited_duration
    : appointment.services.reduce((acc, service) => acc + service.step, 0);

  const startTime = appointment.time.split(":");
  const startHour = parseInt(startTime[0]);
  const startMinute = parseInt(startTime[1]);

  // Berechnung der Endzeit in Minuten
  let totalMinutes = startHour * 60 + startMinute + serviceTime;

  // Endstunde und -minute berechnen
  let endHour = Math.floor(totalMinutes / 60);
  let endMinute = totalMinutes % 60;

  // Formatierung der Ausgabe
  const endMinuteStr = endMinute < 10 ? `0${endMinute}` : endMinute;
  const endHourStr = endHour < 10 ? `0${endHour}` : endHour;

  return `${endHourStr}:${endMinuteStr}`;
};

const generateStatusStyle = (appointment) => {
  if (appointment.cancelled) {
    return "bg-red-500";
  } else if (appointment.edited_duration) {
    return "bg-green-500";
  } else {
    return "bg-gold-600";
  }
};

const hasAppointment = (day) => {
  //check if the day has an appointment or pause time
  const fullDate = getFullDate(day);
  let entries = appointments.value.concat(pauseTimes.value);
  return entries.some((entry) => entry.date === fullDate);
};

const appointmentInThePast = (appointment) => {
  let dateInPast = new Date(appointment.date) < new Date(today.value);
  let timeInPast =
    new Date(appointment.date + "T" + calculateEndTime(appointment)) <
    new Date();
  return dateInPast || timeInPast;
};

const appointmentPayedModal = ref(false);
const appointmentToBePayed = ref(null);
const amount = ref(0);

const startPayment = (appointment) => {
  appointmentToBePayed.value = appointment;
  appointmentPayedModal.value = true;
  if (appointment.amount) {
    amount.value = appointment.amount;
  } else {
    amount.value = appointment.services.reduce(
      (acc, service) => acc + service.price,
      0
    );
  }
};

const setAppointmentToPayed = async (appointment, amount) => {
  appointment.loading = true;
  try {
    const data = await api.markAsPaid(appointment.id, amount);
    if (data.success !== false) {
      notificationStore.showNotification("Erfolg", "Termin wurde als bezahlt markiert");
      appointment.isPayed = true;
      appointmentPayedModal.value = false;
    } else {
      notificationStore.showNotification("Fehler", "Fehler beim Bezahlen");
    }
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      localStorage.removeItem("access_token");
      await navigateTo("/admin/auth/login");
    } else {
      notificationStore.showNotification("Fehler", "Fehler beim Bezahlen");
    }
  }
  appointment.loading = false;
};

const customerIsNew = (appointment) =>
  isNewCustomer(appointment.customer?.created_at);

const customerIsLoyal = (appointment) =>
  isLoyalCustomer(appointment.customer);

const commentToShow = ref("");
const displayComment = (comment) => {
  commentToShow.value = comment;
};
</script>

<style></style>
