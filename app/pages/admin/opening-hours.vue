<template>
  <div class="container mx-auto p-4 min-h-screen mb-16">
    <Teleport to="body">
      <div
        v-if="conflictingAppointments"
        class="fixed inset-2 z-[100] rounded-md bg-neutral-800 p-4"
      >
      <div
        class="flex items-center justify-between pb-2 border-b border-neutral-700 mb-2"
      >
        <h2 class="text-sm font-medium text-neutral-200">
          Terminkonflikte mit deinem Urlaub
        </h2>
        <img
          src="/close.svg"
          alt="close"
          title="close"
          class="w-4"
          @click="conflictingAppointments = null"
        />
      </div>
      <div class="grid gap-2 mb-2">
        <label
          v-for="appointment in conflictingAppointments"
          :key="appointment.id"
          class="flex items-center gap-3 p-2 bg-neutral-700 rounded-md"
          :for="'select-' + appointment.id"
        >
          <input
            type="checkbox"
            v-model="appointment.selected"
            :name="'select-' + appointment.id"
            class="w-4 h-4 accent-gold-500"
          />
          <div class="flex flex-col">
            <span class="text-sm text-neutral-200"
              >{{ new Date(appointment.date).toLocaleDateString("de-DE") }} um
              {{ appointment.time }} Uhr</span
            >
            <span class="text-xs text-neutral-200">{{
              appointment.customer.name
            }}</span>
          </div>
        </label>
      </div>
      <button
        class="text-xs text-neutral-200 bg-red-800 rounded-md w-full py-2 px-2"
        @click="cancelSelectedAppointments"
      >
        Ausgewählte Termine Stornieren
        {{
          cancelledAppointments
            ? "(" + cancelledAppointments + " Storniert)"
            : ""
        }}
      </button>
      </div>
    </Teleport>
    <h2 class="text-sm font-medium text-neutral-200">Öffnungszeiten</h2>
    <hr class="my-2 border-neutral-600" />
    <div
      v-if="openingHours.length > 0"
      class="my-4 flex flex-col bg-neutral-800 rounded p-4"
    >
      <div
        v-for="openingHour in openingHours"
        :key="openingHour.id"
        class="flex items-center justify-between w-full"
      >
        <div class="flex flex-col w-full mb-4">
          <div class="text-neutral-200 text-sm">
            {{ openingHour.day }}
          </div>
          <div class="text-sm grid gap-4 grid-cols-2 text-neutral-400">
            <input
              type="time"
              v-model="openingHour.from"
              class="border bg-neutral-800 border-neutral-700 rounded p-2"
            />
            <input
              type="time"
              v-model="openingHour.to"
              class="border bg-neutral-800 border-neutral-700 rounded p-2"
            />
          </div>
          <label class="mt-2 text-neutral-200 text-sm">
            <label class="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                v-model="openingHour.off_day"
              />
              <div
                class="relative w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"
              ></div>
              <span class="ms-3 text-sm font-medium text-neutral-300">
                Geschlossen</span
              >
            </label>
          </label>
        </div>
      </div>
    </div>
    <button
      class="bg-gold-600 text-white px-4 py-2 block w-full rounded mt-4 text-xs"
      @click="saveOpeningHours"
    >
      Speichern
    </button>

    <hr class="my-12 border-neutral-600" />

    <h2 class="text-md font-medium text-neutral-200">Urlaub</h2>
    <hr class="my-2 border-neutral-600" />
    <div class="bg-neutral-800 p-4 rounded">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label class="flex flex-col text-neutral-200 text-xs mb-1">
          Von:
          <input
            type="date"
            v-model="from_date"
            class="border bg-neutral-800 border-neutral-700 rounded p-2 w-full text-neutral-200"
        /></label>
        <label class="flex flex-col text-neutral-200 text-xs mb-1">
          Bis:
          <input
            type="date"
            v-model="to_date"
            class="border bg-neutral-800 border-neutral-700 rounded p-2 w-full text-neutral-200"
        /></label>
        <button
          class="bg-gold-600 text-white px-4 py-2 block rounded w-full text-sm"
          @click="saveHoliday"
        >
          Speichern
        </button>
      </div>
      <div
        v-if="upcomingHolidays.length > 0"
        class="my-4 flex flex-col bg-neutral-800 rounded p-4"
      >
        <div class="mb-4">
          <div
            class="flex items-center justify-between bg-neutral-700 rounded-md py-2 px-3"
            @click="showPastHolidays = !showPastHolidays"
          >
            <span class="text-sm text-neutral-200 font-bold"
              >Vergangener Urlaub</span
            >
            <img src="/dots.svg" />
          </div>
          <div
            v-if="showPastHolidays"
            class="py-2 px-3 border border-neutral-700"
          >
            <div
              v-for="holiday in pastHolidays"
              :key="holiday.id"
              class="flex items-center justify-between w-full"
            >
              <div class="flex items-center justify-between w-full mb-4">
                <div class="text-neutral-200 text-sm">
                  {{ new Date(holiday.date).toLocaleDateString("de-DE") }}
                </div>
                <div
                  class="flex items-center justify-center"
                  @click="deleteHoliday(holiday.id)"
                >
                  <img src="/delete.svg" class="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-for="holiday in upcomingHolidays"
          :key="holiday.id"
          class="flex items-center justify-between w-full"
        >
          <div class="flex items-center justify-between w-full mb-4">
            <div class="text-neutral-200 text-sm">
              {{ new Date(holiday.date).toLocaleDateString("de-DE") }}
            </div>
            <div
              class="flex items-center justify-center"
              @click="deleteHoliday(holiday.id)"
            >
              <img src="/delete.svg" class="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="text-center py-4 mt-4 flex items-center flex-col justify-center"
      >
        <p class="text-neutral-400 mt-4">Keine Urlaube gefunden...</p>
      </div>
    </div>
  </div>
  <icon-navigation-component />
</template>

<script setup>
const api = useBookingApi();
const notificationStore = useNotificationStore();
const showPastHolidays = ref(false);

const openingHours = ref([
  {
    id: 1,
    day: "Montag",
    from: "09:00:00",
    to: "17:00:00",
    off_day: 0,
    created_at: "2024-06-16T19:57:44.000000Z",
    updated_at: "2024-08-16T11:29:04.000000Z",
  },
  {
    id: 2,
    day: "Dienstag",
    from: "09:00:00",
    to: "21:30:00",
    off_day: 0,
    created_at: "2024-06-16T19:57:44.000000Z",
    updated_at: "2024-08-16T11:29:04.000000Z",
  },
  {
    id: 3,
    day: "Mittwoch",
    from: "11:00:00",
    to: "21:30:00",
    off_day: 0,
    created_at: "2024-06-16T19:57:44.000000Z",
    updated_at: "2024-08-16T11:29:04.000000Z",
  },
  {
    id: 4,
    day: "Donnerstag",
    from: "09:00:00",
    to: "22:30:00",
    off_day: 0,
    created_at: "2024-06-16T19:57:44.000000Z",
    updated_at: "2024-09-12T07:23:59.000000Z",
  },
  {
    id: 5,
    day: "Freitag",
    from: "09:00:00",
    to: "22:30:00",
    off_day: 0,
    created_at: "2024-06-16T19:57:44.000000Z",
    updated_at: "2024-09-12T07:23:59.000000Z",
  },
  {
    id: 6,
    day: "Samstag",
    from: "09:00:00",
    to: "22:30:00",
    off_day: 0,
    created_at: "2024-06-16T19:57:44.000000Z",
    updated_at: "2024-09-16T07:14:33.000000Z",
  },
  {
    id: 7,
    day: "Sonntag",
    from: "09:00:00",
    to: "18:00:00",
    off_day: 1,
    created_at: "2024-06-16T19:57:44.000000Z",
    updated_at: "2024-08-18T09:19:22.000000Z",
  },
]);
const fetchOpeningHours = async () => {
  const data = await api.getBusinessHours();
  data.forEach((item) => {
    item.off_day = Boolean(item.off_day);
  });
  if (data.length > 0) {
    openingHours.value = data;
  }
};
fetchOpeningHours();

const saveOpeningHours = async () => {
  openingHours.value.forEach((item) => {
    item.off_day = Number(item.off_day);
  });

  try {
    const data = await api.saveBusinessHours(openingHours.value);
    notificationStore.showNotification("Erfolg", "Öffnungszeiten gespeichert");
    data.forEach((item) => {
      item.off_day = Boolean(item.off_day);
    });
    openingHours.value = data;
  } catch {
    notificationStore.showNotification("Fehler", "Öffnungszeiten konnten nicht gespeichert werden");
  }
  setTimeout(() => {
    notificationStore.hideNotification();
  }, 3000);
};

const pastHolidays = ref([]);
const upcomingHolidays = ref([]);
const conflictingAppointments = ref(null);
const holidays = ref([]);

const fetchHolidays = async () => {
  try {
    const data = await api.getHolidays();
    holidays.value = data;
    const today = new Date();
    data.forEach((holiday) => {
      const holidayDate = new Date(holiday.date ?? holiday.from_date);
      if (today > holidayDate) {
        pastHolidays.value.push(holiday);
      } else {
        upcomingHolidays.value.push(holiday);
      }
    });
  } catch {
    notificationStore.showNotification("Fehler", "Fehler beim Laden der Urlaube");
    setTimeout(() => {
      notificationStore.hideNotification();
    }, 3000);
  }
};
fetchHolidays();

const from_date = ref(null);
const to_date = ref(null);

const saveHoliday = async () => {
  try {
    const data = await api.createHoliday(from_date.value, to_date.value);
    notificationStore.showNotification("Erfolg", "Urlaub gespeichert");
    if (data.holidays) {
      holidays.value.push(...data.holidays);
    }
    conflictingAppointments.value = data.conflicting_appointments ?? null;
    conflictingAppointments.value?.forEach((appointment) => {
      appointment.selected = true;
    });
  } catch {
    notificationStore.showNotification("Fehler", "Urlaub konnte nicht gespeichert werden");
  }
  setTimeout(() => {
    notificationStore.hideNotification();
  }, 3000);
};

const cancelledAppointments = ref(null);
const cancelSelectedAppointments = async () => {
  if (!confirm("Willst du diese Buchung wirklich stornieren?")) {
    return;
  }
  for (let i = 0; i < conflictingAppointments.value.length; i++) {
    const currentID = conflictingAppointments.value[i].id;
    try {
      await api.cancelAppointmentAdmin(currentID);
      cancelledAppointments.value = (cancelledAppointments.value ?? 0) + 1;
    } catch {
      // Einzelfehler überspringen, Rest weiter verarbeiten
    }
  }
  conflictingAppointments.value = null;
};

const deleteHoliday = async (id) => {
  if (!confirm("Bist du sicher das du den Tag urlaub löschen möchtest ?")) {
    return;
  }
  try {
    await api.deleteHoliday(id);
    notificationStore.showNotification("Erfolg", "Urlaub gelöscht");
    holidays.value = holidays.value.filter((holiday) => holiday.id !== id);
  } catch {
    notificationStore.showNotification("Fehler", "Urlaub konnte nicht gelöscht werden");
  }
  setTimeout(() => {
    notificationStore.hideNotification();
  }, 3000);
};
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
