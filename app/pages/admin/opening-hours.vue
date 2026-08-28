<template>
  <div class="admin-page px-4 pb-10">
    <Teleport to="body">
      <div
        v-if="showConflictDialog"
        class="fixed inset-2 z-[100] overflow-auto rounded-md bg-neutral-800 p-4"
      >
        <div class="mb-2 flex items-center justify-between border-b border-neutral-700 pb-2">
          <h2 class="text-sm font-medium text-neutral-200">Terminkonflikte mit deinem Urlaub</h2>
          <button type="button" class="p-1" @click="conflictingAppointments = null">
            <img src="/close.svg" alt="Schliessen" class="w-4" />
          </button>
        </div>
        <div class="mb-2 grid gap-2">
          <label
            v-for="appointment in conflictingAppointments"
            :key="appointment.id"
            class="flex items-center gap-3 rounded-md bg-neutral-700 p-2"
            :for="'select-' + appointment.id"
          >
            <input
              :id="'select-' + appointment.id"
              v-model="appointment.selected"
              type="checkbox"
              class="h-4 w-4 accent-gold-500"
            />
            <div class="flex flex-col">
              <span class="text-sm text-neutral-200">
                {{ formatDay(appointment.date) }} um {{ appointment.time }} Uhr
              </span>
              <span class="text-xs text-neutral-200">{{ appointment.customer?.name }}</span>
            </div>
          </label>
        </div>
        <button
          type="button"
          class="w-full rounded-md bg-red-800 px-2 py-2 text-xs text-neutral-200"
          @click="cancelSelectedAppointments"
        >
          Ausgewählte Termine Stornieren
          {{ cancelledAppointments ? `(${cancelledAppointments} Storniert)` : "" }}
        </button>
      </div>
    </Teleport>

    <template v-if="isAdmin">
      <h2 class="text-sm font-medium text-neutral-200">Öffnungszeiten</h2>
      <hr class="my-2 border-neutral-600" />
      <div v-if="openingHours.length > 0" class="my-4 flex flex-col rounded bg-neutral-800 p-4">
        <div
          v-for="openingHour in openingHours"
          :key="openingHour.id"
          class="mb-4 flex w-full items-center justify-between"
        >
          <div class="flex w-full flex-col">
            <div class="text-sm text-neutral-200">{{ openingHour.day }}</div>
            <div class="grid grid-cols-2 gap-4 text-sm text-neutral-400">
              <input
                v-model="openingHour.from"
                type="time"
                class="rounded border border-neutral-700 bg-neutral-800 p-2"
              />
              <input
                v-model="openingHour.to"
                type="time"
                class="rounded border border-neutral-700 bg-neutral-800 p-2"
              />
            </div>
            <label class="mt-2 inline-flex cursor-pointer items-center">
              <input v-model="openingHour.off_day" type="checkbox" class="peer sr-only" />
              <div
                class="relative h-6 w-11 rounded-full bg-neutral-700 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-gold-500 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 rtl:peer-checked:after:-translate-x-full"
              />
              <span class="ms-3 text-sm font-medium text-neutral-300">Geschlossen</span>
            </label>
          </div>
        </div>
      </div>
      <button
        type="button"
        class="mt-4 block w-full rounded bg-gold-600 px-4 py-2 text-xs text-white"
        @click="saveOpeningHours"
      >
        Speichern
      </button>
      <hr class="my-12 border-neutral-600" />
    </template>

    <h2 class="text-sm font-medium text-neutral-200">
      {{ isAdmin ? "Urlaub" : "Mein Urlaub" }}
    </h2>
    <p class="mt-1 text-xs text-neutral-400">
      {{
        isAdmin
          ? "Urlaubstage eintragen oder Anträge freigeben."
          : "Tippe im Kalender auf Von- und Bis-Tag, dann Antrag absenden."
      }}
    </p>
    <hr class="my-2 border-neutral-600" />

    <div class="rounded bg-neutral-800 p-4">
      <div v-if="isAdmin" class="mb-3">
        <label class="flex flex-col text-xs text-neutral-200" for="holiday-employee-filter">
          Mitarbeiter
          <select
            id="holiday-employee-filter"
            v-model="filterEmployeeId"
            class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2 text-sm text-neutral-100"
            @change="onFilterChange"
          >
            <option value="">Alle Mitarbeiter</option>
            <option v-for="employee in employees" :key="employee.id" :value="String(employee.id)">
              {{ employee.staff_name || employee.display_name || employee.name }}
            </option>
          </select>
        </label>
      </div>

      <div class="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          class="rounded bg-neutral-700 px-3 py-1.5 text-xs text-neutral-200"
          @click="shiftCalendarMonth(-1)"
        >
          ←
        </button>
        <h3 class="text-sm font-medium text-neutral-100">
          {{ calendarMonthLabel }}
        </h3>
        <button
          type="button"
          class="rounded bg-neutral-700 px-3 py-1.5 text-xs text-neutral-200"
          @click="shiftCalendarMonth(1)"
        >
          →
        </button>
      </div>

      <div class="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] uppercase text-neutral-500">
        <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="(cell, index) in calendarCells"
          :key="`${cell.iso || 'empty'}-${index}`"
          type="button"
          class="aspect-square rounded text-xs transition-colors"
          :class="dayCellClass(cell)"
          :disabled="!cell.iso"
          @click="cell.iso && onCalendarDayClick(cell.iso)"
        >
          <span v-if="cell.iso">{{ cell.day }}</span>
        </button>
      </div>

      <div class="mt-3 flex flex-wrap gap-3 text-[10px] text-neutral-400">
        <span class="inline-flex items-center gap-1">
          <span class="h-2.5 w-2.5 rounded-sm bg-yellow-500/70" /> Ausstehend
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="h-2.5 w-2.5 rounded-sm bg-green-500/70" /> Genehmigt
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="h-2.5 w-2.5 rounded-sm bg-red-500/70" /> Abgelehnt
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="h-2.5 w-2.5 rounded-sm bg-gold-600/80" /> Auswahl
        </span>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label class="flex flex-col text-xs text-neutral-200">
          Von
          <input
            v-model="from_date"
            type="date"
            class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2 text-neutral-200"
          />
        </label>
        <label class="flex flex-col text-xs text-neutral-200">
          Bis
          <input
            v-model="to_date"
            type="date"
            class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2 text-neutral-200"
          />
        </label>
        <button
          type="button"
          class="rounded bg-gold-600 px-4 py-2 text-sm text-white disabled:opacity-50 md:self-end"
          :disabled="!from_date || (isAdmin && !filterEmployeeId && employees.length > 1)"
          @click="saveHoliday"
        >
          {{ isAdmin ? "Urlaub speichern" : "Antrag senden" }}
        </button>
      </div>
      <p v-if="isAdmin && !filterEmployeeId && employees.length > 1" class="mt-2 text-[11px] text-neutral-500">
        Zum Eintragen bitte einen Mitarbeiter im Filter wählen.
      </p>
      <button
        v-if="from_date"
        type="button"
        class="mt-2 text-xs text-neutral-400 underline"
        @click="clearHolidaySelection"
      >
        Auswahl zurücksetzen
      </button>
    </div>

    <div v-if="actionHolidays.length > 0" class="mt-4 flex flex-col rounded bg-neutral-800 p-4">
      <h3 class="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
        {{ isAdmin ? "Offene Anträge & kommende Tage" : "Meine Anträge" }}
      </h3>
      <div
        v-for="holiday in actionHolidays"
        :key="holiday.id"
        class="mb-4 flex w-full items-center justify-between last:mb-0"
      >
        <div class="text-sm text-neutral-200">
          {{ formatDay(holiday.date) }}
          <span
            v-if="holiday.status"
            class="ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase"
            :class="statusBadgeClass(holiday.status)"
          >{{ statusLabel(holiday.status) }}</span>
          <span v-if="isAdmin && holiday.user" class="ml-2 text-xs text-neutral-400">
            {{ holiday.user.display_name || holiday.user.name }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="isAdmin && holiday.status === 'pending'"
            type="button"
            class="rounded bg-green-800 px-2 py-1 text-[10px] text-white"
            @click="approveHoliday(holiday.id)"
          >
            OK
          </button>
          <button
            v-if="isAdmin && holiday.status === 'pending'"
            type="button"
            class="rounded bg-red-900 px-2 py-1 text-[10px] text-white"
            @click="rejectHoliday(holiday.id)"
          >
            Nein
          </button>
          <button type="button" @click="deleteHoliday(holiday.id)">
            <img src="/delete.svg" class="h-6 w-6" alt="Löschen" />
          </button>
        </div>
      </div>
    </div>
    <div
      v-else
      class="mt-4 flex flex-col items-center justify-center rounded bg-neutral-800 py-6 text-center"
    >
      <p class="text-neutral-400">Keine offenen oder kommenden Urlaubstage in dieser Ansicht.</p>
    </div>
  </div>
</template>

<script setup>
const api = useBookingApi();
const notificationStore = useNotificationStore();
const { isAdmin } = useAuth();

const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const monthNames = [
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
];

const calendarCursor = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

const openingHours = ref([]);
const employees = ref([]);
const filterEmployeeId = ref("");
const holidays = ref([]);
const conflictingAppointments = ref(null);
const cancelledAppointments = ref(null);
const from_date = ref("");
const to_date = ref("");

const showConflictDialog = computed(
  () => Array.isArray(conflictingAppointments.value) && conflictingAppointments.value.length > 0,
);

const calendarMonthLabel = computed(() => {
  const d = calendarCursor.value;
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
});

const holidayByDate = computed(() => {
  const map = new Map();
  for (const holiday of holidays.value) {
    const key = String(holiday.date ?? "").slice(0, 10);
    if (!key) continue;
    const existing = map.get(key);
    if (!existing || holiday.status === "approved" || existing.status === "rejected") {
      map.set(key, holiday);
    }
  }
  return map;
});

/** Liste: kommende Tage + alle offenen Anträge (auch vergangen, falls noch pending) */
const actionHolidays = computed(() => {
  const today = toIsoDate(new Date());
  return holidays.value
    .filter((holiday) => {
      const date = toIsoDate(holiday.date ?? holiday.from_date);
      if (!date) return false;
      if (holiday.status === "pending") return true;
      return date >= today;
    })
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
});

const calendarCells = computed(() => {
  const year = calendarCursor.value.getFullYear();
  const month = calendarCursor.value.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPad = (first.getDay() + 6) % 7;
  const cells = [];

  for (let i = 0; i < startPad; i++) {
    cells.push({ iso: null, day: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ iso, day });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ iso: null, day: null });
  }
  return cells;
});

const toIsoDate = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatDay = (value) => {
  const iso = toIsoDate(value);
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("de-DE");
};

const statusLabel = (status) => {
  if (status === "pending") return "Ausstehend";
  if (status === "approved") return "Genehmigt";
  if (status === "rejected") return "Abgelehnt";
  return status;
};

const statusBadgeClass = (status) => {
  if (status === "pending") return "bg-yellow-900/40 text-yellow-300";
  if (status === "approved") return "bg-green-900/40 text-green-300";
  if (status === "rejected") return "bg-red-900/40 text-red-300";
  return "bg-neutral-700 text-neutral-300";
};

const isInSelection = (iso) => {
  if (!from_date.value || !iso) return false;
  const from = from_date.value;
  const to = to_date.value || from_date.value;
  return iso >= from && iso <= to;
};

const dayCellClass = (cell) => {
  if (!cell.iso) return "pointer-events-none opacity-0";

  const holiday = holidayByDate.value.get(cell.iso);
  const selected = isInSelection(cell.iso);
  const today = toIsoDate(new Date());

  if (selected) {
    return "bg-gold-600 text-white font-medium";
  }
  if (holiday?.status === "approved") {
    return "bg-green-900/50 text-green-200";
  }
  if (holiday?.status === "pending") {
    return "bg-yellow-900/40 text-yellow-200";
  }
  if (holiday?.status === "rejected") {
    return "bg-red-900/40 text-red-200";
  }
  if (cell.iso === today) {
    return "bg-neutral-700 text-neutral-100 ring-1 ring-gold-600/50";
  }
  return "bg-neutral-900/60 text-neutral-300 hover:bg-neutral-700";
};

const shiftCalendarMonth = (delta) => {
  const d = calendarCursor.value;
  calendarCursor.value = new Date(d.getFullYear(), d.getMonth() + delta, 1);
};

const onCalendarDayClick = (iso) => {
  if (!from_date.value || (from_date.value && to_date.value)) {
    from_date.value = iso;
    to_date.value = "";
    return;
  }
  if (iso < from_date.value) {
    to_date.value = from_date.value;
    from_date.value = iso;
    return;
  }
  to_date.value = iso;
};

const clearHolidaySelection = () => {
  from_date.value = "";
  to_date.value = "";
};

const notify = (title, message) => {
  notificationStore.showNotification(title, message);
  setTimeout(() => notificationStore.hideNotification(), 3000);
};

const fetchOpeningHours = async () => {
  if (!isAdmin.value) return;
  try {
    const data = await api.getBusinessHours();
    data.forEach((item) => {
      item.off_day = Boolean(item.off_day);
    });
    if (data.length > 0) {
      openingHours.value = data;
    }
  } catch {
    // Admin-Seite bleibt nutzbar ohne Shop-Zeiten
  }
};

const saveOpeningHours = async () => {
  openingHours.value.forEach((item) => {
    item.off_day = Number(item.off_day);
  });

  try {
    const data = await api.saveBusinessHours(openingHours.value);
    notify("Erfolg", "Öffnungszeiten gespeichert");
    data.forEach((item) => {
      item.off_day = Boolean(item.off_day);
    });
    openingHours.value = data;
  } catch {
    notify("Fehler", "Öffnungszeiten konnten nicht gespeichert werden");
  }
};

const fetchEmployees = async () => {
  if (!isAdmin.value) return;
  try {
    employees.value = await api.getEmployees();
  } catch {
    employees.value = [];
  }
};

const fetchHolidays = async () => {
  try {
    const options = {};
    if (isAdmin.value && filterEmployeeId.value) {
      options.user_id = Number(filterEmployeeId.value);
    }
    holidays.value = await api.getHolidays(options);
  } catch {
    notify("Fehler", "Fehler beim Laden der Urlaube");
  }
};

const onFilterChange = async () => {
  clearHolidaySelection();
  await fetchHolidays();
};

const saveHoliday = async () => {
  if (!from_date.value) return;
  if (isAdmin.value && !filterEmployeeId.value && employees.value.length > 1) {
    notify("Hinweis", "Bitte zuerst einen Mitarbeiter wählen");
    return;
  }
  try {
    const options =
      isAdmin.value && filterEmployeeId.value
        ? { user_id: Number(filterEmployeeId.value) }
        : undefined;
    const data = await api.createHoliday(
      from_date.value,
      to_date.value || from_date.value,
      options,
    );
    notify("Erfolg", isAdmin.value ? "Urlaub gespeichert" : "Urlaubsantrag eingereicht");
    clearHolidaySelection();
    await fetchHolidays();
    const conflicts = Array.isArray(data?.conflicting_appointments)
      ? data.conflicting_appointments.filter((appointment) => appointment?.id != null)
      : [];
    conflictingAppointments.value = conflicts.length > 0 ? conflicts : null;
    if (conflicts.length > 0) {
      conflicts.forEach((appointment) => {
        appointment.selected = true;
      });
    }
  } catch {
    notify("Fehler", "Urlaub konnte nicht gespeichert werden");
  }
};

const approveHoliday = async (id) => {
  try {
    await api.approveHoliday(id);
    await fetchHolidays();
    notify("Erfolg", "Urlaub genehmigt");
  } catch {
    notify("Fehler", "Freigabe fehlgeschlagen");
  }
};

const rejectHoliday = async (id) => {
  try {
    await api.rejectHoliday(id);
    await fetchHolidays();
    notify("Erfolg", "Urlaub abgelehnt");
  } catch {
    notify("Fehler", "Ablehnung fehlgeschlagen");
  }
};

const cancelSelectedAppointments = async () => {
  const selected = (conflictingAppointments.value ?? []).filter((appointment) => appointment.selected);
  if (selected.length === 0) return;
  if (!confirm("Willst du diese Buchung wirklich stornieren?")) return;
  for (const appointment of selected) {
    try {
      await api.cancelAppointmentAdmin(appointment.id);
      cancelledAppointments.value = (cancelledAppointments.value ?? 0) + 1;
    } catch {
      // weiter
    }
  }
  conflictingAppointments.value = null;
};

const deleteHoliday = async (id) => {
  if (!confirm("Bist du sicher, dass du diesen Urlaubstag löschen möchtest?")) return;
  try {
    await api.deleteHoliday(id);
    notify("Erfolg", "Urlaub gelöscht");
    await fetchHolidays();
  } catch {
    notify("Fehler", "Urlaub konnte nicht gelöscht werden");
  }
};

onMounted(async () => {
  await Promise.all([fetchOpeningHours(), fetchEmployees(), fetchHolidays()]);
});
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
