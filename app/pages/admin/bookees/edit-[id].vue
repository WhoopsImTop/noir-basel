<template>
  <div class="px-4">
    <div class="admin-page px-4">
      <div v-if="!loadingData" class="w-full">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-neutral-200">
            Termin zum {{ appointment.services[0].name }}
          </h2>
          <button
            @click="router.push('/admin/bookees/' + appointment.id)"
            class="bg-neutral-700 p-1.5 rounded-full"
          >
            <img src="/arrow-left.svg" alt="prev" />
          </button>
        </div>
        <hr class="my-2 border-neutral-600" />
        <div class="my-4 flex flex-col bg-neutral-800 rounded p-4">
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col w-full mb-4">
              <div class="mb-4">
                <span class="font-bold text-neutral-200">Name:</span>
                <br />
                <input
                  type="text"
                  class="bg-neutral-700 text-neutral-200 p-2 rounded w-full"
                  v-model="appointment.customer.name"
                />
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200">Datum:</span>
                <br />
                <div class="grid grid-cols-2 gap-4 w-full">
                  <input
                    type="date"
                    class="bg-neutral-700 text-neutral-200 p-2 rounded mr-2 w-full"
                    v-model="appointment.date"
                  />
                  <input
                    type="time"
                    class="bg-neutral-700 text-neutral-200 p-2 rounded w-full"
                    v-model="appointment.time"
                  />
                </div>
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200">Email:</span>
                <br />
                <input
                  type="email"
                  class="bg-neutral-700 text-neutral-200 p-2 rounded w-full"
                  v-model="appointment.customer.email"
                />
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200">Telefon:</span>
                <br />
                <input
                  type="tel"
                  class="bg-neutral-700 text-neutral-200 p-2 rounded w-full"
                  v-model="appointment.customer.customer_details.phone"
                />
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200">Notiz:</span>
                <br />
                <textarea
                  class="bg-neutral-700 text-neutral-200 p-2 rounded w-full"
                  v-model="appointment.customer.customer_details.notes"
                ></textarea>
              </div>

              <div class="mb-4" v-if="appointment.instagram">
                <span class="font-bold text-neutral-200">Instagram:</span>
                <br />
                <input
                  type="text"
                  class="bg-neutral-700 text-neutral-200 p-2 rounded w-full"
                  v-model="appointment.customer.customer_details.instagram"
                />
              </div>

              <div class="mb-4" v-if="appointment.birthday">
                <span class="font-bold text-neutral-200">Geburtstag:</span>
                <br />
                <input
                  type="date"
                  class="bg-neutral-700 text-neutral-200 p-2 rounded w-full"
                  v-model="appointment.customer.customer_details.birthday"
                />
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200"
                  >Gebuchte Leistung:</span
                >
                <br />
                <select
                  class="bg-neutral-700 text-neutral-200 p-2 rounded w-full"
                  v-model="bookedServices"
                  multiple
                >
                  <option
                    v-for="service in services"
                    :key="service.id"
                    :value="service.id"
                  >
                    {{ service.name }} | {{ service.step }} Minuten
                  </option>
                </select>
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200"
                  >Eigene Dauer der Leistung festlegen:</span
                >
                <br />
                <input
                  type="number"
                  class="mt-2 bg-neutral-700 text-neutral-200 p-2 rounded w-full"
                  placeholder="Dauer in Minuten"
                  v-model="appointment.edited_duration"
                />
              </div>
              <button
                class="bg-gold-600 text-white px-4 py-2 block rounded mt-4 text-xs"
                @click="editAppointment(appointment.id)"
              >
                Buchung bearbeiten
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="loadingData"
        class="text-center py-4 mt-4 flex items-center flex-col justify-center"
      >
        <img src="/loading.svg" alt="loading" class="animate-spin h-8 w-8" />
        <p class="text-neutral-400 mt-4">Lade Buchung...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { isApiError } from "~/utils/api";

const route = useRoute();
const router = useRouter();
const api = useBookingApi();
const { isAdmin, canEditAppointments, getUser } = useAuth();

const loadingData = ref(true);
const appointment = ref({});
const bookedServices = ref([]);
const showEditDuration = ref(false);

const fetchAppointment = async () => {
  appointment.value = await api.getAppointment(route.params.id);

  const me = getUser();
  const isOwn =
    me && appointment.value?.employee_id != null
      ? Number(appointment.value.employee_id) === Number(me.id)
      : false;
  if (!isAdmin.value && !(canEditAppointments.value && isOwn)) {
    await router.replace("/admin/bookees/" + route.params.id);
    return;
  }

  bookedServices.value = appointment.value.services.map((service) => service.id);
  loadingData.value = false;
};
fetchAppointment();

const services = ref([]);
const fetchServices = async () => {
  services.value = await api.getServices(true);
};
fetchServices();

const editAppointment = async (id) => {
  const requestBody = {
    service_ids: bookedServices.value,
    date: appointment.value.date,
    time: appointment.value.time,
    edited_duration: appointment.value.edited_duration,
    name: appointment.value.customer.name,
    email: appointment.value.customer.email,
    phone: appointment.value.customer.customer_details.phone,
    notes: appointment.value.customer.customer_details.notes,
    instagram: appointment.value.customer.customer_details.instagram,
    birthday: appointment.value.customer.customer_details.birthday,
    user_id: appointment.value.user_id,
  };

  try {
    await api.updateAppointment(id, requestBody);
    window.alert("Buchung wurde geändert");
    showEditDuration.value = false;
    fetchAppointment();
  } catch (error) {
    const message = isApiError(error) ? error.message : "Änderung fehlgeschlagen";
    window.alert(message);
  }
};
</script>

<style>
#usercentrics-root {
  display: none;
}</style>
