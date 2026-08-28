<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] overflow-y-auto bg-black/90 p-6"
    >
    <div class="flex flex-col p-4 rounded-lg bg-neutral-800">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-neutral-100">
          {{ pauseOnly || appointmentType === "pause" ? "Pause hinzufügen" : appointmentType === "termin" ? "Termin hinzufügen" : "Hinzufügen" }}
        </h2>
        <button @click="closeModal">
          <img src="/close.svg" alt="close" />
        </button>
      </div>

      <div v-if="!pauseOnly && appointmentType == ''" class="flex flex-col gap-2 mt-4">
        <button
          @click="appointmentType = 'pause'"
          class="bg-neutral-700 text-neutral-200 px-4 py-2 rounded-lg inline-flex items-center justify-center"
        >
          <img src="/pausetime.svg" alt="pause" title="pause" class="mr-2" />
          Pause hinzufügen
        </button>
        <button
          v-if="isAdmin"
          @click="appointmentType = 'termin'"
          class="bg-neutral-700 text-neutral-200 px-4 py-2 rounded-lg inline-flex items-center justify-center"
        >
          <img
            src="/calendar_new_event.svg"
            alt="Termin"
            title="Termin"
            class="mr-2"
          />
          Termin hinzufügen
        </button>
      </div>

      <span
        v-if="!pauseOnly && appointmentType != ''"
        class="text-neutral-200 mt-4 inline-flex items-center cursor-pointer"
        @click="appointmentType = ''"
        ><img src="/arrow-left.svg" />Zurück</span
      >
      <div v-if="appointmentType === 'pause' || pauseOnly">
        <div class="mt-4">
          <label for="date" class="text-neutral-100">Datum</label>
          <input
            type="date"
            id="date"
            v-model="date"
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
          />
        </div>
        <div class="mt-4">
          <label for="startTime" class="text-neutral-100">Startzeit</label>
          <input
            type="time"
            id="startTime"
            v-model="startTime"
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
          />
        </div>
        <div class="mt-4">
          <label for="endTime" class="text-neutral-100">Endzeit</label>
          <input
            type="time"
            id="endTime"
            v-model="endTime"
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
          />
          <div class="flex items center gap-2 mt-2">
            <div
              v-for="option in endTimeOptions"
              :key="option.value"
              class="bg-neutral-700 text-neutral-200 px-2 py-1 rounded-lg cursor-pointer text-xs"
              @click="setEndTime(option.value)"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
        <div class="mt-4">
          <label for="pauseName" class="text-neutral-100"
            >Name für die Pause</label
          >
          <input
            type="text"
            id="pauseName"
            v-model="pauseName"
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
          />
        </div>
        <div class="mt-4">
          <label for="dauer" class="text-neutral-100"
            >Ereignis wiederholen lassen?</label
          >
          <select
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
            v-model="recurring_type"
          >
            <option value="">Nein</option>
            <option value="daily">Täglich</option>
            <option value="weekly">Wöchentlich</option>
          </select>
        </div>
        <div class="mt-4">
          <label for="dauer" class="text-neutral-100"
            >Ende der Wiederholung</label
          >
          <input
            type="date"
            id="dauer"
            v-model="recurring_end_date"
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
          />
        </div>
        <div class="mt-4">
          <button
            @click="saveFreeTime"
            class="bg-gold-600 text-white px-4 py-2 rounded-lg"
          >
            Speichern
          </button>
        </div>
      </div>

      <div v-if="appointmentType === 'termin'">
        <div class="mt-4">
          <label for="date" class="text-neutral-100">Leistung</label>
          <select
            v-model="appointmentBooking.service_ids"
            @change="onServicesChanged"
            multiple
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
          >
            <option
              v-for="service in services"
              :key="service.id"
              :value="service.id"
            >
              {{ service.name }}
            </option>
          </select>
        </div>
        <div v-if="staffEmployees.length > 0" class="mt-4">
          <label for="employee" class="text-neutral-100">Mitarbeiter</label>
          <select
            id="employee"
            v-model="appointmentBooking.employee_id"
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
            @change="getAvailableTimes"
          >
            <option
              v-for="employee in staffEmployees"
              :key="employee.id"
              :value="employee.id"
            >
              {{ employee.staff_name || employee.display_name || employee.name
              }}{{ suggestedEmployeeId === employee.id ? " (Vorschlag)" : "" }}
            </option>
          </select>
        </div>
        <div
          class="flex items-center justify-between text-sm text-neutral-200 border-b border-neutral-200 mt-4"
        >
          <label
            :class="createForOwnCustomer ? 'text-gold-500' : ''"
            @click="createForOwnCustomer = true"
            >Kunde erstellen</label
          >
          <label
            :class="!createForOwnCustomer ? 'text-gold-500' : ''"
            @click="createForOwnCustomer = false"
            >Kunde auswählen</label
          >
        </div>
        <div v-if="!createForOwnCustomer" class="mt-4">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Name oder E-Mail (mind. 2 Zeichen)"
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100 mb-4"
          />

          <ul
            class="space-y-2 max-h-32 overflow-y-scroll"
            v-if="appointmentBooking.customer_id === null"
          >
            <li
              v-if="customerSearchLoading"
              class="p-2 text-sm text-neutral-400"
            >
              Suche…
            </li>
            <li
              v-for="customer in searchResults"
              :key="customer.id"
              @click="selectCustomer(customer)"
              class="p-2 rounded-lg bg-neutral-700 text-neutral-100 cursor-pointer"
            >
              {{ customer.name }} <br />
              {{ customer.email }} <br />
              {{ customer.customer_details?.phone }}
            </li>
          </ul>
          <div
            v-if="appointmentBooking.customer_id !== null"
            class="p-2 rounded-lg bg-neutral-700 text-neutral-100 cursor-pointer flex items-center justify-between"
          >
            <span class="text-neutral-100"
              >Ausgewählter Kunde: {{ selectedCustomerLabel }}</span
            >
            <button
              @click="clearSelectedCustomer"
              class="text-neutral-100"
            >
              <img src="/close.svg" alt="close" />
            </button>
          </div>
        </div>
        <div v-if="createForOwnCustomer">
          <div class="mt-4">
            <label for="name" class="text-neutral-100">Name</label>
            <input
              type="text"
              id="name"
              v-model="appointmentBooking.name"
              class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
            />
          </div>
          <div class="mt-4">
            <label for="date" class="text-neutral-100">Email</label>
            <input
              type="text"
              id="date"
              v-model="appointmentBooking.email"
              class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
            />
          </div>
          <div class="mt-4">
            <label for="date" class="text-neutral-100">Telefon</label>
            <input
              type="text"
              id="date"
              v-model="appointmentBooking.phone"
              class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
            />
          </div>
        </div>
        <div class="mt-4">
          <label for="date" class="text-neutral-100">Datum</label>
          <input
            type="date"
            id="date"
            v-model="appointmentBooking.date"
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
            @change="getAvailableTimes"
          />
        </div>
        <div class="mt-4">
          <label for="startTime" class="text-neutral-100">Startzeit</label>
          <div class="flex items-center overflow-scroll flex-nowrap">
            <div
              v-for="time in availableTimes"
              :key="time"
              class="bg-neutral-700 px-3 py-1 mr-1 rounded-full text-neutral-200"
              @click="appointmentBooking.time = time"
            >
              {{ time }}
            </div>
          </div>
          <span class="text-neutral-200 text-xs">oder</span>
          <input
            type="time"
            id="startTime"
            v-model="appointmentBooking.time"
            step="900"
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
          />
        </div>
        <div
          v-if="appointmentBooking.service_ids.length && appointmentBooking.date && appointmentBooking.time"
          class="mt-4 border-t border-neutral-600 pt-4"
        >
          <p class="text-neutral-300 text-sm mb-2">Preisübersicht</p>
          <ul class="space-y-1 text-sm text-neutral-200 mb-3">
            <li
              v-for="(item, index) in checkoutItems"
              :key="`${item.id ?? 'x'}-${index}`"
              class="flex justify-between gap-2"
            >
              <span>{{ item.name }}</span>
              <span>{{ formatChf(item.price) }}</span>
            </li>
          </ul>
          <p v-if="checkoutSubtotal != null" class="flex justify-between text-xs text-neutral-400">
            <span>Zwischensumme</span>
            <span>{{ formatChf(checkoutSubtotal) }}</span>
          </p>
          <p
            v-if="checkoutDiscount > 0"
            class="flex justify-between text-xs text-green-400 mt-1"
          >
            <span>Rabatt</span>
            <span>−{{ formatChf(checkoutDiscount) }}</span>
          </p>
          <p class="flex justify-between text-sm font-medium text-neutral-100 mt-2">
            <span>Total</span>
            <span>{{ formatChf(checkoutTotal) }}</span>
          </p>
          <div class="mt-3 flex gap-2">
            <input
              v-model.trim="voucherCodeInput"
              type="text"
              placeholder="Gutscheincode"
              class="flex-1 p-2 rounded-lg bg-neutral-700 text-neutral-100 uppercase text-sm"
            />
            <button
              type="button"
              class="bg-neutral-600 text-white px-3 py-2 rounded-lg text-xs shrink-0"
              :disabled="voucherApplying || !voucherCodeInput"
              @click="applyAdminVoucher"
            >
              Einlösen
            </button>
          </div>
          <p v-if="voucherMessage" class="text-xs mt-2" :class="voucherOk ? 'text-green-400' : 'text-red-400'">
            {{ voucherMessage }}
          </p>
          <button
            v-if="appliedVoucherCode"
            type="button"
            class="text-xs text-neutral-400 underline mt-1"
            @click="clearAdminVoucher"
          >
            Gutschein entfernen
          </button>
        </div>
        <div class="mt-4">
          <label for="dauer" class="text-neutral-100"
            >Eigene Dauer festlegen</label
          >
          <input
            type="number"
            id="dauer"
            v-model="appointmentBooking.edited_duration"
            class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
          />
        </div>
        <div class="mt-4">
          <button
            @click="bookAnAppointment"
            class="bg-gold-600 text-white px-4 py-2 rounded-lg"
          >
            Termin Buchen
          </button>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref } from "vue";
import { isApiError } from "~/utils/api";

const emit = defineEmits(["closeModal", "fetchAppointments"]);
const props = defineProps({
  pauseOnly: {
    type: Boolean,
    default: false,
  },
});
const customerStore = useCustomerStore();
const calendarStore = useCalendarStore();
const notificationStore = useNotificationStore();
const api = useBookingApi();
const { user, isAdmin } = useAuth();

const roundToNextQuarterHour = (date) => {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;

  // Wenn gerundete Minuten 60 ergeben, erhöhe die Stunde um 1
  if (roundedMinutes === 60) {
    date.setHours(date.getHours() + 1);
    date.setMinutes(0);
  } else {
    date.setMinutes(roundedMinutes);
  }

  return date;
};

// Funktion zum Formatieren der Zeit als "HH:MM"
const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Aktuelle Zeit auf das nächste Viertelstundensegment runden
const currentRoundedTime = roundToNextQuarterHour(new Date());

// gib dem Nutzer schnell aktionen für die Endzeit damit er pausen für 15, 30, 45 oder 60 oder 120 minuten erstellen kann
const endTimeOptions = [
  { label: "15 Min", value: 15 },
  { label: "30 Min", value: 30 },
  { label: "45 Min", value: 45 },
  { label: "60 Min", value: 60 },
  { label: "120 Min", value: 120 },
];

const convertTimeToDate = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0); // Setze die Stunden und Minuten
  return date;
};

// Beispiel: Klicke auf eine Option und füge Minuten zu der startTime hinzu
const setEndTime = (optionValue) => {
  const startTimeDate = convertTimeToDate(startTime.value);
  const newEndTime = new Date(startTimeDate.getTime() + optionValue * 60000);
  // Setze nur die Zeit im Format "HH:MM", um den Time-Input zu versorgen
  endTime.value = formatTime(newEndTime);
};

const date = ref(calendarStore.currentDate ?? new Date());
const startTime = ref(formatTime(currentRoundedTime));
const endTime = ref(formatTime(currentRoundedTime));
const appointmentType = ref(props.pauseOnly ? "pause" : "");
const services = ref([]);
const pauseName = ref(null);
const recurring_type = ref(null);
const recurring_end_date = ref(null);

const searchQuery = ref("");
const searchResults = ref([]);
const customerSearchLoading = ref(false);
let customerSearchDebounceTimer = null;
const appointmentBooking = ref({
  service_ids: [],
  name: "",
  email: "",
  phone: "",
  date: calendarStore.currentDate ?? new Date().toISOString().split("T")[0],
  time: "09:00",
  edited_duration: "",
  customer_id: null,
  employee_id: null,
});

const availableTimes = ref([]);
const staffEmployees = ref([]);
const suggestedEmployeeId = ref(null);
const createForOwnCustomer = ref(true);
const checkoutItems = ref([]);
const checkoutSubtotal = ref(null);
const checkoutDiscount = ref(0);
const checkoutTotal = ref(0);
const voucherCodeInput = ref("");
const appliedVoucherCode = ref("");
const voucherApplying = ref(false);
const voucherMessage = ref("");
const voucherOk = ref(false);

const formatChf = (value) => {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(n);
};

const selectedCustomerLabel = computed(() => {
  const customer = customerStore.selectedCustomer;
  if (customer?.name) return customer.name;
  const id = appointmentBooking.value.customer_id;
  return id ? `ID ${id}` : "";
});

const bookingEmail = () => {
  if (createForOwnCustomer.value) {
    return appointmentBooking.value.email || "";
  }
  const id = appointmentBooking.value.customer_id;
  if (!id) return "";
  if (customerStore.selectedCustomer?.id === id) {
    return customerStore.selectedCustomer.email ?? "";
  }
  const fromResults = searchResults.value.find((c) => c.id === id);
  return fromResults?.email ?? "";
};

const applyCheckoutResponse = (response) => {
  checkoutItems.value = response.items ?? [];
  checkoutSubtotal.value =
    response.subtotal ??
    checkoutItems.value.filter((i) => (i.price ?? 0) >= 0).reduce((s, i) => s + (i.price || 0), 0);
  checkoutDiscount.value = response.discount ?? 0;
  checkoutTotal.value =
    response.total ?? checkoutItems.value.reduce((sum, item) => sum + (item.price || 0), 0);
};

const loadAdminCheckout = async () => {
  const ids = appointmentBooking.value.service_ids;
  if (!ids?.length || !appointmentBooking.value.date || !appointmentBooking.value.time) {
    checkoutItems.value = [];
    checkoutSubtotal.value = null;
    checkoutDiscount.value = 0;
    checkoutTotal.value = 0;
    return;
  }
  try {
    const response = await api.getCheckout(
      Array.isArray(ids) ? ids.map(Number) : [Number(ids)],
      appointmentBooking.value.date,
      appointmentBooking.value.time,
      {
        voucherCode: appliedVoucherCode.value || undefined,
        email: bookingEmail() || undefined,
      },
    );
    applyCheckoutResponse(response);
  } catch {
    checkoutItems.value = [];
  }
};

const applyAdminVoucher = async () => {
  const ids = appointmentBooking.value.service_ids;
  if (!ids?.length || !appointmentBooking.value.date || !appointmentBooking.value.time) return;
  voucherApplying.value = true;
  voucherMessage.value = "";
  voucherOk.value = false;
  try {
    const result = await api.validateVoucher({
      code: voucherCodeInput.value,
      email: bookingEmail() || undefined,
      service_ids: Array.isArray(ids) ? ids.map(Number) : [Number(ids)],
      date: appointmentBooking.value.date,
      time: appointmentBooking.value.time,
    });
    appliedVoucherCode.value = result.code;
    voucherCodeInput.value = result.code;
    voucherOk.value = true;
    voucherMessage.value = `Gutschein «${result.voucher_name}» angewendet`;
    applyCheckoutResponse(result);
  } catch (error) {
    appliedVoucherCode.value = "";
    voucherMessage.value = isApiError(error) ? error.message : "Gutschein ungültig";
  } finally {
    voucherApplying.value = false;
  }
};

const clearAdminVoucher = async () => {
  appliedVoucherCode.value = "";
  voucherCodeInput.value = "";
  voucherMessage.value = "";
  voucherOk.value = false;
  await loadAdminCheckout();
};

const runCustomerSearch = async () => {
  const term = searchQuery.value.trim();
  if (term.length < 2) {
    searchResults.value = [];
    customerStore.setSearchResults([]);
    return;
  }
  customerSearchLoading.value = true;
  try {
    const response = await api.searchCustomers({ q: term, lite: true, per_page: 20 });
    searchResults.value = response.data;
    customerStore.setSearchResults(response.data);
  } catch {
    searchResults.value = [];
    customerStore.setSearchResults([]);
  } finally {
    customerSearchLoading.value = false;
  }
};

watch(searchQuery, () => {
  if (customerSearchDebounceTimer) clearTimeout(customerSearchDebounceTimer);
  customerSearchDebounceTimer = setTimeout(() => {
    runCustomerSearch();
  }, 300);
});

const selectCustomer = (customer) => {
  appointmentBooking.value.customer_id = customer.id;
  customerStore.setSelectedCustomer(customer);
};

const clearSelectedCustomer = () => {
  appointmentBooking.value.customer_id = null;
  customerStore.setSelectedCustomer(null);
};

const saveFreeTime = () => {
  // Konvertiere die Start- und Endzeiten in ein Datumsformat, das für den Server geeignet ist
  let start = new Date(`1970-01-01T${startTime.value}:00Z`); // ISO 8601 Format mit Zeitzone UTC
  let end = new Date(`1970-01-01T${endTime.value}:00Z`);

  // Berechne die Dauer in Minuten
  let durationInMinutes = (end - start) / 60000;

  let postBody = {
    date: date.value, // Das Datum sollte im Format YYYY-MM-DD sein
    start_time: start.toISOString().substr(11, 5), // Zeit im Format HH:MM
    end_time: end.toISOString().substr(11, 5), // Zeit im Format HH:MM
    duration: durationInMinutes,
    name: pauseName.value ?? "Pause",
    customer_id: null,
    user_id: user.value?.id ?? undefined,
  };

  if (recurring_type.value) {
    postBody.recurring_type = recurring_type.value;

    // Berechne den Wochentag (0 = Sonntag, 6 = Samstag)
    let dateObject = new Date(date.value);
    let dayOfWeek = dateObject.getUTCDay(); // Verwende UTC, um Konsistenz zu gewährleisten
    postBody.recurring_day = dayOfWeek;
  }

  if (recurring_end_date.value) {
    postBody.recurring_end_date = recurring_end_date.value; // Das Datum sollte im Format YYYY-MM-DD sein
  }

  api
    .createPause(postBody)
    .then(() => {
      notificationStore.showNotification("Erfolg", "Pause erfolgreich hinzugefügt");
      closeModal();
      emit("fetchAppointments");
    })
    .catch(() => {
      notificationStore.showNotification("Fehler", "Pause konnte nicht erstellt werden");
    });
};

const fetchServices = async () => {
  services.value = await api.getServices();
};

const bookAnAppointment = async () => {
  const payload = { ...appointmentBooking.value };
  if (payload.customer_id === null || createForOwnCustomer.value === true) {
    delete payload.customer_id;
  }
  if (appliedVoucherCode.value) {
    payload.voucher_code = appliedVoucherCode.value;
  }
  if (!payload.employee_id) {
    payload.employee_id = user.value?.id || undefined;
  }
  try {
    await api.createAdminAppointment(payload);
    notificationStore.showNotification("Erfolg", "Termin erfolgreich hinzugefügt");
    closeModal();
    emit("fetchAppointments");
  } catch {
    notificationStore.showNotification("Fehler", "Termin konnte nicht erstellt werden");
  }
};

const onServicesChanged = async () => {
  await getAvailableTimes();
};

const getAvailableTimes = async () => {
  if (!appointmentBooking.value.service_ids.length || !appointmentBooking.value.date) {
    availableTimes.value = [];
    staffEmployees.value = [];
    return;
  }

  const times = await api.getAdminTimes(
    appointmentBooking.value.service_ids,
    appointmentBooking.value.date,
    appointmentBooking.value.employee_id,
  );
  const payload = Array.isArray(times) ? { times } : times ?? {};
  availableTimes.value = payload.times ?? [];
  if (Array.isArray(payload.employees) && payload.employees.length) {
    staffEmployees.value = payload.employees;
    suggestedEmployeeId.value = payload.suggested_employee_id ?? payload.employee_id ?? null;
    const stillValid = staffEmployees.value.some(
      (e) => e.id === appointmentBooking.value.employee_id,
    );
    if (!stillValid) {
      appointmentBooking.value.employee_id =
        suggestedEmployeeId.value ??
        (!isAdmin.value && user.value?.id ? user.value.id : null) ??
        staffEmployees.value[0]?.id ??
        null;
    }
  }
  appointmentBooking.value.time = availableTimes.value[0] ?? "";
  await loadAdminCheckout();
};

watch(
  () => [
    appointmentBooking.value.service_ids,
    appointmentBooking.value.date,
    appointmentBooking.value.time,
    appointmentBooking.value.email,
    appointmentBooking.value.customer_id,
  ],
  () => {
    loadAdminCheckout();
  },
  { deep: true },
);

onMounted(() => {
  fetchServices();
});

const closeModal = () => {
  customerStore.clearSearch();
  emit("closeModal");
};
</script>

<style></style>
