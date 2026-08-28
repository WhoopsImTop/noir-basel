<template>
  <div>
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
        <img src="/arrow-right.svg" alt="next" />
      </div>
    </div>

    <div v-if="isAdmin" class="mt-3 flex gap-2">
      <button
        type="button"
        class="flex-1 rounded border px-2 py-1.5 text-xs"
        :class="scope === 'all' ? 'border-gold-600 bg-gold-600 text-white' : 'border-neutral-600 text-neutral-300'"
        @click="setScope('all')"
      >
        Alle
      </button>
      <button
        type="button"
        class="flex-1 rounded border px-2 py-1.5 text-xs"
        :class="scope === 'mine' ? 'border-gold-600 bg-gold-600 text-white' : 'border-neutral-600 text-neutral-300'"
        @click="setScope('mine')"
      >
        Nur ich
      </button>
    </div>

    <div class="grid grid-cols-7 mt-4">
      <div
        v-for="day in weekDays"
        :key="day"
        class="flex items-center justify-center border-b border-neutral-700"
      >
        <div class="text-sm text-neutral-400">{{ day }}</div>
      </div>
      <template v-for="day in firstDay" :key="`pad-start-${day}`">
        <div></div>
      </template>
      <div
        v-for="day in days"
        :key="day"
        :data-date="getFullDate(day)"
        class="flex flex-col items-center border-b border-neutral-700 py-2 cursor-pointer"
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
      <template v-for="day in lastDay" :key="`pad-end-${day}`">
        <div></div>
      </template>
    </div>

    <div class="mt-4 flex items-center justify-between gap-2">
      <p class="text-sm font-medium text-neutral-200">{{ formattedSelectedDate }}</p>
      <div class="flex gap-2">
        <button
          type="button"
          class="rounded border px-3 py-1.5 text-xs"
          :class="dayDisplayMode === 'list' ? 'border-gold-600 bg-gold-600 text-white' : 'border-neutral-600 text-neutral-300'"
          @click="dayDisplayMode = 'list'"
        >
          Liste
        </button>
        <button
          type="button"
          class="rounded border px-3 py-1.5 text-xs"
          :class="dayDisplayMode === 'timeline' ? 'border-gold-600 bg-gold-600 text-white' : 'border-neutral-600 text-neutral-300'"
          @click="dayDisplayMode = 'timeline'"
        >
          Timeline
        </button>
      </div>
    </div>

    <!-- Liste -->
    <div v-if="dayDisplayMode === 'list'">
      <div
        v-if="dayEntries.length > 0"
        class="relative flex flex-col mt-2"
      >
        <template v-for="appointment in dayEntries" :key="appointment.type === 'pause' ? `pause-${appointment.id}-${appointment.instance ?? 0}` : `appointment-${appointment.id}`">
          <div
            v-if="appointment.type === 'appointment'"
            class="flex items-center justify-between border-b border-neutral-700 py-2"
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
                  :class="appointmentInThePast(appointment) ? 'text-neutral-500' : 'text-neutral-200'"
                >
                  {{ appointment.customer?.name }}
                  {{ appointment.cancelled ? "(Storniert)" : "" }}
                  <span
                    v-if="appointment.employee"
                    class="rounded px-1 py-0.5 text-[10px] uppercase tracking-wide bg-neutral-700 text-neutral-300"
                  >{{ appointment.employee.display_name || appointment.employee.name }}</span>
                  <img
                    v-if="customerIsNew(appointment)"
                    src="/person_add.svg"
                    alt="Neuer Kunde"
                    class="w-6"
                  />
                  <span
                    v-if="customerIsLoyal(appointment)"
                    class="rounded px-1 py-0.5 text-[10px] uppercase tracking-wide bg-gold-600/30 text-gold-400"
                  >Stamm</span>
                </h3>
                <p
                  class="text-xs"
                  :class="appointmentInThePast(appointment) ? 'text-neutral-500' : 'text-neutral-400'"
                >
                  {{
                    !appointment.cancelled
                      ? appointment.services?.map((service) => service.name).join(", ")
                      : "Storniert am " + new Date(appointment.cancelled_at!).toLocaleString("de-DE")
                  }}
                </p>
              </div>
            </nuxt-link>
            <div class="flex items-center">
              <div
                v-if="appointment.customer?.comment"
                class="flex items-center"
                @click="displayComment(appointment.customer.comment)"
              >
                <img src="/commentnotice.svg" alt="comment" class="w-6 h-6 mr-4" />
              </div>
              <div
                v-if="appointment.isPayed || !appointmentInThePast(appointment) || appointment.cancelled"
                class="flex flex-col text-sm items-end"
                :class="appointmentInThePast(appointment) ? 'text-neutral-500' : 'text-neutral-200'"
              >
                <span>{{ appointment.time }}</span>
                <span>{{ calculateEndTime(appointment) }}</span>
              </div>
              <div
                v-else-if="!appointment.isPayed && appointmentInThePast(appointment) && !appointment.cancelled"
                class="flex items-center"
              >
                <button
                  class="bg-gold-600 text-white px-2 py-1 rounded text-xs"
                  @click="startPayment(appointment)"
                >
                  {{ appointment.loading ? "Lade..." : "Bezahlt" }}
                </button>
              </div>
            </div>
          </div>
          <div
            v-else
            class="flex items-center justify-between border-b border-neutral-700 py-2"
          >
            <nuxt-link
              class="flex items-start"
              :to="'/admin/pause-times/' + appointment.id"
            >
              <div class="w-1 rounded-lg py-5 mr-2 bg-blue-500"></div>
              <div class="flex flex-col">
                <h3
                  class="text-md"
                  :class="appointmentInThePast(appointment) ? 'text-neutral-500' : 'text-neutral-200'"
                >
                  {{ appointment.name ?? "Pause" }}
                </h3>
              </div>
            </nuxt-link>
            <div
              class="flex flex-col text-sm items-end"
              :class="appointmentInThePast(appointment) ? 'text-neutral-500' : 'text-neutral-200'"
            >
              <span>{{ appointment.start_time.split(":")[0] + ":" + appointment.start_time.split(":")[1] }}</span>
              <span>{{ calculateEndTime(appointment) }}</span>
            </div>
          </div>
        </template>
      </div>
      <div v-else class="flex items-center justify-center mt-4">
        <p class="text-neutral-400">Noch keine Buchungen</p>
      </div>
    </div>

    <!-- Timeline -->
    <div v-else class="mt-2">
      <div v-if="timelineEvents.length === 0" class="rounded-lg border border-neutral-700 bg-neutral-800/60 py-10 text-center">
        <p class="text-sm text-neutral-400">Keine Termine an diesem Tag.</p>
      </div>

      <div v-else class="overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900/40">
        <!-- Lane headers -->
        <div
          class="flex border-b border-neutral-700 bg-neutral-800/80"
          :style="{ paddingLeft: `${TIMELINE_LEFT_GUTTER}px` }"
        >
          <div
            v-for="lane in timelineLanes"
            :key="lane.id"
            class="min-w-[110px] flex-1 truncate px-2 py-2.5 text-center text-[11px] font-medium text-neutral-200"
          >
            <span
              class="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
              :style="{ backgroundColor: lane.color }"
            />
            {{ lane.label }}
          </div>
        </div>

        <div class="timeline-scroll max-h-[65vh] overflow-auto">
          <div
            class="timeline relative"
            :style="{ height: `${timelineRange.heightPx}px`, minWidth: `${timelineMinWidth}px` }"
          >
            <!-- Hour & half-hour grid -->
            <div
              v-for="mark in timelineGridMarks"
              :key="mark.key"
              class="pointer-events-none absolute left-0 right-0 border-t"
              :class="mark.isHour ? 'border-neutral-700/90' : 'border-neutral-800/60 border-dashed'"
              :style="{ top: `${mark.topPx}px` }"
            >
              <span
                v-if="mark.isHour"
                class="absolute -top-2.5 left-1 w-11 text-right text-[10px] tabular-nums text-neutral-500"
              >
                {{ mark.label }}
              </span>
            </div>

            <!-- Now indicator -->
            <div
              v-if="nowIndicatorTop !== null"
              class="pointer-events-none absolute left-0 right-0 z-20 border-t-2 border-red-500"
              :style="{ top: `${nowIndicatorTop}px` }"
            >
              <span class="absolute -top-2 left-1 rounded bg-red-500 px-1 py-0.5 text-[9px] text-white">Jetzt</span>
            </div>

            <!-- Lane separators -->
            <div
              v-for="(lane, laneIndex) in timelineLanes"
              :key="`sep-${lane.id}`"
              class="pointer-events-none absolute bottom-0 top-0 border-l border-neutral-800/80"
              :style="{ left: laneSeparatorLeft(laneIndex) }"
            />

            <!-- Events -->
            <button
              v-for="event in timelineEvents"
              :key="event.key"
              type="button"
              class="timeline-event absolute z-10 overflow-hidden rounded-md border border-neutral-700/50 text-left shadow-sm transition-all hover:z-20 hover:brightness-110"
              :class="event.cancelled ? 'opacity-50' : ''"
              :style="timelineEventStyle(event)"
              @click="openTimelineEvent(event.raw)"
            >
              <p class="truncate text-[11px] font-semibold tabular-nums text-neutral-100">
                {{ event.timeLabel }}
              </p>
              <p class="mt-0.5 truncate text-xs font-medium text-neutral-100">{{ event.title }}</p>
              <p v-if="event.layout.height >= 52" class="mt-0.5 line-clamp-2 text-[10px] leading-snug text-neutral-400">
                {{ event.subtitle }}
              </p>
              <p
                v-if="event.isPause && event.layout.height >= 68"
                class="mt-1 text-[9px] uppercase tracking-wide text-blue-300"
              >
                Pause
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="appointmentPayedModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
        @click="appointmentPayedModal = false"
      >
        <div class="mx-4 my-10 max-w-[600px] rounded-lg bg-neutral-800 p-4" @click.stop>
          <h3 class="text-lg font-medium text-neutral-200">Termin bezahlen</h3>
          <p class="mt-2 text-sm text-neutral-400">Betrag den der Kunden bezahlt hat (anpassbar)</p>
          <div class="relative">
            <input
              v-model="amount"
              type="number"
              class="w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-neutral-200"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 transform text-neutral-500">CHF</span>
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
        <div class="mx-4 my-10 max-w-[600px] rounded-lg bg-neutral-800 p-4" @click.stop>
          <h3 class="text-lg font-medium text-neutral-200">Hinterlegter Kommentar</h3>
          <p class="mt-2 text-sm text-neutral-400">{{ commentToShow }}</p>
          <div class="mt-4 flex items-center justify-end">
            <button class="rounded bg-gold-600 px-4 py-2 text-white" @click="commentToShow = ''">
              Schließen
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Appointment, PauseTime } from "~/types/booking";
import { isLoyalCustomer, isNewCustomer } from "~/utils/customer";

const notificationStore = useNotificationStore();
const calendarStore = useCalendarStore();
const api = useBookingApi();
const router = useRouter();

const props = defineProps({
  appointmentsUpdated: Boolean,
});

const EMPLOYEE_COLORS = [
  "#8f6c3f",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#ef4444",
];

const TIMELINE_START_HOUR = 7;
const TIMELINE_END_HOUR = 21;
const TIMELINE_LEFT_GUTTER = 48;
const TIMELINE_PX_PER_MINUTE = 1.6;
const TIMELINE_MIN_LANE_WIDTH = 118;
const TIMELINE_MIN_EVENT_HEIGHT = 44;
const TIMELINE_LANE_GAP = 6;
const TIMELINE_EVENT_INSET = 3;

type TimelineLane = {
  id: string;
  label: string;
  color: string;
};

type TimelineEntry = {
  key: string;
  raw: Appointment | PauseTime;
  title: string;
  subtitle: string;
  timeLabel: string;
  laneId: string;
  accentColor: string;
  isPause: boolean;
  cancelled: boolean;
  layout: {
    top: number;
    height: number;
    left: string;
    width: string;
  };
};

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

const dayDisplayMode = ref<"list" | "timeline">("list");
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const daysInMonth = ref(
  new Date(currentYear.value, currentMonth.value + 1, 0).getDate(),
);
const firstDay = ref(
  (new Date(currentYear.value, currentMonth.value, 1).getDay() || 7) - 1,
);

const lastDay = ref(
  new Date(currentYear.value, currentMonth.value, daysInMonth.value).getDay(),
);
const today = ref(new Date().toISOString().split("T")[0]);
const days = ref<number[]>([]);
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

const selectDay = (day: number) => {
  selectedDate.value = getFullDate(day);
  calendarStore.setCurrentDate(selectedDate.value);
};

const getDays = () => {
  days.value = [];
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.value.push(i);
  }
};

const nextMonth = async () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  daysInMonth.value = new Date(
    currentYear.value,
    currentMonth.value + 1,
    0,
  ).getDate();
  firstDay.value = (new Date(currentYear.value, currentMonth.value, 1).getDay() || 7) - 1;
  lastDay.value = new Date(
    currentYear.value,
    currentMonth.value,
    daysInMonth.value,
  ).getDay();
  getDays();
  await getAppointments(getFullDate(1), getFullDate(daysInMonth.value));
};

const prevMonth = async () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  daysInMonth.value = new Date(
    currentYear.value,
    currentMonth.value + 1,
    0,
  ).getDate();
  firstDay.value = (new Date(currentYear.value, currentMonth.value, 1).getDay() || 7) - 1;
  lastDay.value = new Date(
    currentYear.value,
    currentMonth.value,
    daysInMonth.value,
  ).getDay();
  getDays();
  await getAppointments(getFullDate(1), getFullDate(daysInMonth.value));
};

getDays();

const selectedDate = ref(today.value);

const formattedSelectedDate = computed(() =>
  new Date(`${selectedDate.value}T12:00:00`).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
);

const generateStyles = (day: number) => {
  const fullDate = getFullDate(day);
  if (selectedDate.value === fullDate) {
    return "bg-gold-600 text-white rounded-full w-5 h-5 flex items-center justify-center pt-1";
  }
  if (fullDate === today.value) {
    return "font-bold";
  }
  return "";
};

const getFullDate = (day: number) => {
  const month = currentMonth.value + 1;
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  return `${currentYear.value}-${monthStr}-${dayStr}`;
};

const appointments = ref<Appointment[]>([]);
const pauseTimes = ref<PauseTime[]>([]);
const scope = ref<"all" | "mine">("all");
const { isAdmin, getUser, clearSession } = useAuth();

const setScope = async (value: "all" | "mine") => {
  scope.value = value;
  await getAppointments(getFullDate(1), getFullDate(daysInMonth.value));
};

const getAppointments = async (start: string, end: string) => {
  try {
    appointments.value = await api.getBookees(start, end, {
      scope: isAdmin.value ? scope.value : "mine",
    });
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      clearSession();
      await navigateTo("/admin/auth/login");
    }
  }
};

const getPauseTimes = async () => {
  try {
    const user = getUser();
    pauseTimes.value = await api.getPauseTimes(
      isAdmin.value && scope.value === "mine" && user?.id ? user.id : undefined,
    );
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      clearSession();
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

const parseTimeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + (minutes || 0);
};

const formatMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const employeeColor = (employeeId?: number | null) => {
  if (!employeeId) return "#737373";
  return EMPLOYEE_COLORS[employeeId % EMPLOYEE_COLORS.length];
};

const employeeLabel = (employee?: Appointment["employee"], employeeId?: number | null) =>
  employee?.display_name || employee?.staff_name || employee?.name || `Barber #${employeeId ?? "?"}`;

const getAppointmentDuration = (appointment: Appointment) => {
  if (appointment.edited_duration) return appointment.edited_duration;
  return (appointment.services || []).reduce((acc, service) => acc + (service.step || 0), 0) || 30;
};

const calculateEndTime = (entry: Appointment | PauseTime) => {
  if (entry.type === "pause") {
    const endTime = entry.end_time.split(":");
    return `${endTime[0]}:${endTime[1]}`;
  }
  const appointment = entry as Appointment;
  const serviceTime = getAppointmentDuration(appointment);
  const startMinutes = parseTimeToMinutes(appointment.time);
  return formatMinutes(startMinutes + serviceTime);
};

const dayEntries = computed(() => {
  const appointmentsForDate = appointments.value.filter(
    (appointment) => appointment.date === selectedDate.value,
  );
  const pauseTimesForDate = pauseTimes.value.filter(
    (pause) => pause.date === selectedDate.value,
  );
  return [...appointmentsForDate, ...pauseTimesForDate].sort((a, b) => {
    const aTime = a.type === "pause" ? a.start_time : a.time;
    const bTime = b.type === "pause" ? b.start_time : b.time;
    return String(aTime).localeCompare(String(bTime));
  });
});

const getLaneId = (entry: Appointment | PauseTime) => {
  if (entry.type === "pause") {
    return entry.user_id ? String(entry.user_id) : "pause-general";
  }
  const appointment = entry as Appointment;
  return String(appointment.employee?.id ?? appointment.employee_id ?? "unknown");
};

const timelineLanes = computed<TimelineLane[]>(() => {
  const laneMap = new Map<string, TimelineLane>();

  for (const entry of dayEntries.value) {
    const laneId = getLaneId(entry);
    if (laneMap.has(laneId)) continue;

    if (entry.type === "pause") {
      if (entry.user_id) {
        const employee = appointments.value.find(
          (a) => (a.employee?.id ?? a.employee_id) === entry.user_id,
        )?.employee;
        laneMap.set(laneId, {
          id: laneId,
          label: employee ? employeeLabel(employee, entry.user_id) : `Barber #${entry.user_id}`,
          color: employeeColor(entry.user_id),
        });
      } else {
        laneMap.set(laneId, { id: laneId, label: "Pause", color: "#2563eb" });
      }
      continue;
    }

    const appointment = entry as Appointment;
    const employeeId = appointment.employee?.id ?? appointment.employee_id;
    laneMap.set(laneId, {
      id: laneId,
      label: employeeLabel(appointment.employee, employeeId),
      color: employeeColor(employeeId),
    });
  }

  return [...laneMap.values()].sort((a, b) => a.label.localeCompare(b.label, "de"));
});

const timelineRange = computed(() => {
  const startMinutes = TIMELINE_START_HOUR * 60;
  const endMinutes = TIMELINE_END_HOUR * 60;
  return {
    startMinutes,
    endMinutes,
    heightPx: (endMinutes - startMinutes) * TIMELINE_PX_PER_MINUTE,
  };
});

const timelineMinWidth = computed(
  () => TIMELINE_LEFT_GUTTER + timelineLanes.value.length * TIMELINE_MIN_LANE_WIDTH,
);

const minutesToTopPx = (minutes: number) =>
  (minutes - timelineRange.value.startMinutes) * TIMELINE_PX_PER_MINUTE;

const timelineGridMarks = computed(() => {
  const marks: Array<{ key: string; topPx: number; label: string; isHour: boolean }> = [];
  const { startMinutes, endMinutes } = timelineRange.value;

  for (let minute = startMinutes; minute <= endMinutes; minute += 30) {
    const isHour = minute % 60 === 0;
    marks.push({
      key: String(minute),
      topPx: minutesToTopPx(minute),
      label: isHour ? formatMinutes(minute) : "",
      isHour,
    });
  }
  return marks;
});

const nowIndicatorTop = computed(() => {
  if (selectedDate.value !== today.value) return null;
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < timelineRange.value.startMinutes || minutes > timelineRange.value.endMinutes) {
    return null;
  }
  return minutesToTopPx(minutes);
});

const laneAreaWidthExpr = "100% - " + TIMELINE_LEFT_GUTTER + "px";

const laneLeft = (laneIndex: number, subColumn = 0, subColumns = 1) => {
  const lanePart = `calc(${TIMELINE_LEFT_GUTTER}px + (${laneAreaWidthExpr}) * ${laneIndex / Math.max(timelineLanes.value.length, 1)})`;
  if (subColumns <= 1) {
    return `calc(${lanePart} + ${TIMELINE_EVENT_INSET}px)`;
  }
  const innerWidth = `calc((${laneAreaWidthExpr}) / ${Math.max(timelineLanes.value.length, 1)} - ${TIMELINE_LANE_GAP}px)`;
  const colWidth = `calc(${innerWidth} / ${subColumns} - 2px)`;
  const colLeft = `calc(${lanePart} + ${TIMELINE_EVENT_INSET}px + (${innerWidth} / ${subColumns}) * ${subColumn})`;
  return colLeft;
};

const laneSeparatorLeft = (laneIndex: number) => {
  if (laneIndex === 0) return `${TIMELINE_LEFT_GUTTER}px`;
  return `calc(${TIMELINE_LEFT_GUTTER}px + (${laneAreaWidthExpr}) * ${laneIndex / Math.max(timelineLanes.value.length, 1)})`;
};

const buildTimelineLayout = (entries: Array<Appointment | PauseTime>) => {
  const laneOrder = timelineLanes.value.map((lane) => lane.id);
  const { startMinutes, endMinutes } = timelineRange.value;

  const normalized = entries.map((entry, index) => {
    const isPause = entry.type === "pause";
    const start = isPause
      ? parseTimeToMinutes(entry.start_time)
      : parseTimeToMinutes((entry as Appointment).time);
    const end = isPause
      ? parseTimeToMinutes(entry.end_time)
      : start + getAppointmentDuration(entry as Appointment);
    return { entry, index, start, end, laneId: getLaneId(entry) };
  });

  const layoutByIndex = new Map<number, { column: number; columns: number }>();

  for (const item of normalized) {
    const sameLane = normalized.filter(
      (other) =>
        other.index !== item.index &&
        other.laneId === item.laneId &&
        other.start < item.end &&
        other.end > item.start,
    );
    const usedColumns = new Set<number>();
    for (const other of sameLane) {
      const existing = layoutByIndex.get(other.index);
      if (existing) usedColumns.add(existing.column);
    }
    let column = 0;
    while (usedColumns.has(column)) column++;
    layoutByIndex.set(item.index, { column, columns: Math.max(1, sameLane.length + 1) });
  }

  return normalized.map(({ entry, index, start, end, laneId }) => {
    const laneIndex = Math.max(0, laneOrder.indexOf(laneId));
    const layout = layoutByIndex.get(index) || { column: 0, columns: 1 };
    const clampedStart = Math.max(start, startMinutes);
    const clampedEnd = Math.min(end, endMinutes);
    const top = minutesToTopPx(clampedStart);
    const height = Math.max((clampedEnd - clampedStart) * TIMELINE_PX_PER_MINUTE, TIMELINE_MIN_EVENT_HEIGHT);
    const isPause = entry.type === "pause";
    const appointment = entry as Appointment;
    const employeeId = appointment.employee?.id ?? appointment.employee_id;
    const accentColor = isPause ? "#2563eb" : employeeColor(employeeId);
    const timeStart = isPause ? entry.start_time.slice(0, 5) : appointment.time.slice(0, 5);
    const timeEnd = calculateEndTime(entry);

    const innerWidth = `calc((${laneAreaWidthExpr}) / ${Math.max(timelineLanes.value.length, 1)} - ${TIMELINE_LANE_GAP}px)`;
    const width =
      layout.columns <= 1
        ? `calc(${innerWidth} - ${TIMELINE_EVENT_INSET * 2}px)`
        : `calc((${innerWidth} - ${TIMELINE_EVENT_INSET * 2}px) / ${layout.columns} - 2px)`;

    return {
      key: isPause ? `pause-${entry.id}-${entry.instance ?? 0}` : `appointment-${entry.id}`,
      raw: entry,
      title: isPause
        ? entry.name || "Pause"
        : `${appointment.customer?.name || "Kunde"}${appointment.cancelled ? " · Storniert" : ""}`,
      subtitle: isPause
        ? "Blockierte Zeit"
        : (appointment.services || []).map((service) => service.name).join(", "),
      timeLabel: `${timeStart} – ${timeEnd}`,
      laneId,
      accentColor,
      isPause,
      cancelled: !isPause && !!appointment.cancelled,
      layout: {
        top,
        height,
        left: laneLeft(laneIndex, layout.column, layout.columns),
        width,
      },
    } satisfies TimelineEntry;
  });
};

const timelineEvents = computed(() => buildTimelineLayout(dayEntries.value));

const timelineEventStyle = (event: TimelineEntry) => ({
  top: `${event.layout.top}px`,
  height: `${event.layout.height}px`,
  left: event.layout.left,
  width: event.layout.width,
  borderLeftWidth: "3px",
  borderLeftColor: event.accentColor,
  backgroundColor: `${event.accentColor}18`,
  padding: event.layout.height < 52 ? "4px 6px" : "6px 8px",
});

const openTimelineEvent = (entry: Appointment | PauseTime) => {
  if (entry.type === "pause") {
    router.push(`/admin/pause-times/${entry.id}`);
    return;
  }
  router.push(`/admin/bookees/${entry.id}`);
};

const generateStatusStyle = (appointment: Appointment) => {
  if (appointment.cancelled) return "bg-red-500";
  if (appointment.edited_duration) return "bg-green-500";
  return "bg-gold-600";
};

const appointmentInThePast = (entry: Appointment | PauseTime) => {
  const dateInPast = new Date(entry.date) < new Date(today.value);
  const timeInPast =
    new Date(`${entry.date}T${calculateEndTime(entry)}`) < new Date();
  return dateInPast || timeInPast;
};

const appointmentPayedModal = ref(false);
const appointmentToBePayed = ref<Appointment | null>(null);
const amount = ref(0);

const startPayment = (appointment: Appointment) => {
  appointmentToBePayed.value = appointment;
  appointmentPayedModal.value = true;
  amount.value = appointment.amount
    ?? (appointment.services || []).reduce((acc, service) => acc + service.price, 0);
};

const setAppointmentToPayed = async (appointment: Appointment | null, payAmount: number) => {
  if (!appointment) return;
  appointment.loading = true;
  try {
    const data = await api.markAsPaid(appointment.id, payAmount);
    if (data.success !== false) {
      notificationStore.showNotification("Erfolg", "Termin wurde als bezahlt markiert");
      appointment.isPayed = true;
      appointmentPayedModal.value = false;
    } else {
      notificationStore.showNotification("Fehler", "Fehler beim Bezahlen");
    }
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      clearSession();
      await navigateTo("/admin/auth/login");
    } else {
      notificationStore.showNotification("Fehler", "Fehler beim Bezahlen");
    }
  }
  appointment.loading = false;
};

const customerIsNew = (appointment: Appointment) =>
  isNewCustomer(appointment.customer?.created_at);

const customerIsLoyal = (appointment: Appointment) =>
  isLoyalCustomer(appointment.customer);

const commentToShow = ref("");
const displayComment = (comment: string) => {
  commentToShow.value = comment;
};

const hasAppointment = (day: number) => {
  const fullDate = getFullDate(day);
  const entries = appointments.value.concat(pauseTimes.value);
  return entries.some((entry) => entry.date === fullDate);
};
</script>

<style scoped>
.timeline-scroll {
  -webkit-overflow-scrolling: touch;
}

.timeline {
  padding-top: 10px;
  padding-bottom: 12px;
}

.timeline-event {
  box-sizing: border-box;
}
</style>
