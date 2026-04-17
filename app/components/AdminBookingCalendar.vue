<template>
  <div class="rounded-sm border border-white/12 bg-white/3 p-3">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-base uppercase tracking-[0.1em]">Terminübersicht</h2>
      <p class="text-xs text-white/60">Drag/Drop, Resize und Pausen per Klick in den Slot</p>
    </div>

    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script setup lang="ts">
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { Appointment, PauseTime } from "~/types/booking";
import { isApiError } from "~/utils/api";

const props = defineProps<{
  appointments: Appointment[];
  pauses: PauseTime[];
}>();

const emit = defineEmits<{
  refreshed: [];
  error: [message: string];
}>();

const api = useBookingApi();
const isMobile = ref(false);

onMounted(() => {
  isMobile.value = window.innerWidth < 768;
});

const toDateTime = (date: string, time: string) => `${date}T${time.length === 5 ? `${time}:00` : time}`;

const minutesToEndTime = (start: string, minutes: number) => {
  const [hour, minute] = start.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const appointmentEvents = computed(() =>
  props.appointments.map((appointment) => {
    const duration = appointment.edited_duration || 30;
    const endTime = minutesToEndTime(appointment.time, duration);
    return {
      id: `appointment-${appointment.id}`,
      title: `${appointment.time} ${appointment.name || appointment.customer?.name || "Termin"}`,
      start: toDateTime(appointment.date, appointment.time),
      end: toDateTime(appointment.date, endTime),
      backgroundColor: appointment.cancelled ? "#4b5563" : "#ffffff",
      textColor: appointment.cancelled ? "#d1d5db" : "#111827",
      extendedProps: { type: "appointment", raw: appointment },
    };
  }),
);

const pauseEvents = computed(() =>
  props.pauses.map((pause) => ({
    id: `pause-${pause.id}`,
    title: pause.name || "Pause",
    start: toDateTime(pause.date, pause.start_time),
    end: toDateTime(pause.date, pause.end_time),
    backgroundColor: "#f59e0b",
    textColor: "#111827",
    extendedProps: { type: "pause", raw: pause },
  })),
);

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: isMobile.value ? "timeGridDay" : "timeGridWeek",
  locale: "de-ch",
  firstDay: 1,
  nowIndicator: true,
  editable: true,
  selectable: true,
  height: isMobile.value ? "75vh" : "auto",
  allDaySlot: false,
  slotMinTime: "08:00:00",
  slotMaxTime: "22:00:00",
  slotDuration: isMobile.value ? "00:30:00" : "00:15:00",
  longPressDelay: 180,
  eventLongPressDelay: 180,
  headerToolbar: {
    left: "prev,next",
    center: "title",
    right: isMobile.value ? "timeGridDay,timeGridWeek" : "dayGridMonth,timeGridWeek,timeGridDay",
  },
  buttonText: {
    today: "Heute",
    month: "Monat",
    week: "Woche",
    day: "Tag",
  },
  dayHeaderFormat: isMobile.value ? { weekday: "short", day: "numeric", month: "2-digit" } : { weekday: "short", day: "numeric" },
  eventTimeFormat: { hour: "2-digit", minute: "2-digit", hour12: false },
  events: [...appointmentEvents.value, ...pauseEvents.value],
  eventDrop: async (info: any) => {
    await handleEventChange(info.event, false);
  },
  eventResize: async (info: any) => {
    await handleEventChange(info.event, true);
  },
  dateClick: async (info: any) => {
    const addPause = window.confirm(`Pause am ${info.dateStr} einzeichnen?`);
    if (!addPause) return;
    const start = window.prompt("Startzeit (HH:mm)", "12:00");
    const end = window.prompt("Endzeit (HH:mm)", "12:30");
    if (!start || !end) return;
    try {
      await api.createPause({
        date: info.dateStr.slice(0, 10),
        start_time: start,
        end_time: end,
        name: "Pause",
        customer_id: null,
      });
      emit("refreshed");
    } catch (error) {
      emit("error", isApiError(error) ? error.message : "Pause konnte nicht erstellt werden.");
    }
  },
}));

const handleEventChange = async (event: any, resized: boolean) => {
  const [kind, id] = String(event.id).split("-");
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;

  const date = start.toISOString().slice(0, 10);
  const time = start.toTimeString().slice(0, 5);
  const editedDuration = end ? Math.max(5, Math.round((end.getTime() - start.getTime()) / 60000)) : 30;

  try {
    if (kind === "appointment") {
      await api.updateAppointmentCalendar(id, {
        date,
        time,
        edited_duration: editedDuration,
      });
    } else if (kind === "pause") {
      const endTime = end ? end.toTimeString().slice(0, 5) : time;
      await api.updatePause(id, {
        date,
        start_time: time,
        end_time: endTime,
      });
    }
    emit("refreshed");
  } catch (error) {
    emit("error", isApiError(error) ? error.message : resized ? "Resize fehlgeschlagen." : "Verschieben fehlgeschlagen.");
  }
};
</script>

<style scoped>
:deep(.fc .fc-toolbar-title) {
  font-size: 1.25rem;
  font-weight: 500;
}

:deep(.fc .fc-button) {
  border-radius: 0.35rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

:deep(.fc .fc-button.fc-button-active),
:deep(.fc .fc-button:hover) {
  background: #b88a45;
  border-color: #b88a45;
  color: #111;
}

:deep(.fc .fc-timegrid-slot) {
  height: 2.25rem;
}

:deep(.fc .fc-event) {
  border: none;
  border-radius: 0.35rem;
  padding: 0.1rem 0.2rem;
}
</style>
