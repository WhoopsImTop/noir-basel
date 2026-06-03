<template>
  <div class="px-4">
    <div class="admin-page px-4">
      <div v-if="!loadingData" class="w-full">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-neutral-200">
            Termin zum
            {{ appointment?.services[0]?.name }}
          </h2>
          <button
            @click="router.push('/admin')"
            class="bg-neutral-700 p-1.5 rounded-full"
          >
            <img src="/arrow-left.svg" alt="prev" />
          </button>
        </div>
        <hr class="my-2 border-neutral-600" />
        <div class="flex justify-end items-center">
          <nuxt-link
            class="bg-gold-600 text-white px-4 py-2 block rounded text-xs"
            :to="'/admin/bookees/edit-' + appointment.id"
          >
            Buchung bearbeiten
          </nuxt-link>
        </div>
        <div class="my-4 flex flex-col bg-neutral-800 rounded p-4">
          <div
            v-if="appointment.cancelled"
            class="bg-red-900 rounded py-1 px-2 text-xs text-white mb-4"
          >
            {{ appointment.cancellationNotice }} am
            {{ new Date(appointment.cancelled_at).toLocaleString("de-DE") }}
          </div>
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col w-full mb-4">
              <div class="mb-4">
                <span class="font-bold text-neutral-200">Name:</span>
                <br />
                <nuxt-link
                  class="text-md text-neutral-200 underline"
                  :to="'/admin/reporting/customer/' + appointment.customer.id"
                >
                  {{ appointment.customer.name }}
                </nuxt-link>
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200">Datum:</span>
                <br />
                <span class="text-md text-neutral-200">
                  {{
                    new Date(appointment.date).toLocaleDateString("de-DE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }}
                  um {{ appointment.time }}
                </span>
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200">Email:</span>
                <br />
                <span class="text-md text-neutral-200">{{
                  appointment.customer.email
                }}</span>
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200">Telefon:</span>
                <br />
                <a
                  v-if="appointment.customer.customer_details?.phone"
                  :href="'tel:' + appointment.customer.customer_details.phone"
                  class="text-md text-gold-400 underline"
                >
                  {{ appointment.customer.customer_details.phone }}
                </a>
                <a
                  v-if="appointment.customer.customer_details?.phone"
                  :href="whatsappLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ml-3 text-xs text-neutral-400 underline"
                >
                  WhatsApp
                </a>
              </div>

              <div class="mb-4" v-if="appointment.notes">
                <span class="font-bold text-neutral-200">Notiz:</span>
                <br />
                <span class="text-md text-neutral-200">{{
                  appointment.customer.customer_details.notes
                }}</span>
              </div>

              <div class="mb-4" v-if="appointment.instagram">
                <span class="font-bold text-neutral-200">Instagram:</span>
                <br />
                <span class="text-md text-neutral-200">
                  {{ appointment.customer.customer_details.instagram }}
                </span>
              </div>

              <div class="mb-4" v-if="appointment.birthday">
                <span class="font-bold text-neutral-200">Geburtstag:</span>
                <br />
                <span class="text-md text-neutral-200">
                  {{ appointment.customer.customer_details.birthday }}
                </span>
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200"
                  >Gebuchte Leistung:</span
                >
                <br />
                <div
                  v-for="service in appointment.services"
                  :key="service.id"
                  class="flex justify-between items-center"
                >
                  <span class="text-md text-neutral-200">{{
                    service.name
                  }}</span>
                  <span class="text-md text-neutral-200"
                    >{{ service.price }} CHF</span
                  >
                </div>
                <br />
                <span
                  class="text-md text-neutral-200"
                  :class="appointment.edited_duration ? 'line-through' : ''"
                >
                  {{
                    appointment.services
                      ?.map((service) => service.step)
                      .reduce((a, b) => a + b)
                  }}
                  Minuten
                </span>
                <br />
                <span
                  class="text-md text-neutral-200"
                  v-if="appointment.edited_duration"
                >
                  {{ appointment.edited_duration }} Minuten
                </span>
                <div class="mt-4">
                  <span class="font-bold text-neutral-200"
                    >Gesamtpreis beim Buchen:</span
                  ><br />
                  <span class="text-xs text-neutral-200"
                    >Bspw. Buchungen vor einer Preisanpassung</span
                  >
                  <br />
                  <p class="text-md text-neutral-200 mt-2">
                    {{ appointment.amount }} € / CHF
                  </p>
                </div>
              </div>

              <button
                class="bg-gold-600 text-white px-4 py-2 block w-full rounded mt-4 text-xs"
                @click="cancelAppointment(appointment.id)"
              >
                Termin stornieren
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

const loadingData = ref(true);
const appointment = ref({});

const whatsappLink = computed(() => {
  const phone = appointment.value?.customer?.customer_details?.phone;
  if (!phone) {
    return "";
  }
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
});

const fetchAppointment = async () => {
  appointment.value = await api.getAppointment(route.params.id);
  loadingData.value = false;
};
fetchAppointment();

const cancelAppointment = async (id) => {
  if (!confirm("Willst du diese Buchung wirklich stornieren?")) {
    return;
  }
  try {
    await api.cancelAppointmentAdmin(id);
    window.alert("Buchung wurde storniert");
    router.push("/admin");
  } catch (error) {
    const message = isApiError(error) ? error.message : "Stornierung fehlgeschlagen";
    window.alert(message);
  }
};
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
