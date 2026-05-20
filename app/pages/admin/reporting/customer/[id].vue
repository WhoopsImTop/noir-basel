<template>
  <div class="container mx-auto p-4 min-h-screen mb-16">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-medium text-neutral-200">Kundendetails</h2>
        <span
          v-if="customerData && isLoyalCustomer(customerData)"
          class="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide bg-gold-600/30 text-gold-400"
          >Stamm</span
        >
      </div>
      <nuxt-link
        to="/admin/reporting"
        class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
        >Abbrechen</nuxt-link
      >
    </div>
    <hr class="my-2 border-neutral-600" />
    <div
      class="my-4 flex flex-col bg-neutral-800 rounded p-4"
      v-if="customerData"
    >
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col w-full mb-4">
          <label class="flex flex-col text-neutral-200 text-sm">
            Name
            <input
              type="text"
              v-model="customerData.name"
              class="border bg-neutral-800 border-neutral-700 rounded p-2"
              placeholder="Name"
          /></label>
          <label class="flex flex-col mt-4 text-neutral-200 text-sm">
            Telefon
            <input
              type="text"
              v-model="customerData.customer_details.phone"
              class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
            />
          </label>
          <label class="flex flex-col mt-4 text-neutral-200 text-sm">
            Email
            <input
              type="text"
              v-model="customerData.email"
              class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
              placeholder="Dauer in Minuten"
            />
          </label>
        </div>
      </div>
      <p
        class="text-neutral-200 text-sm"
        v-if="customerData.customer_details.birthday"
      >
        Geburtstag: {{ customerData.customer_details.birthday }}
      </p>
      <p
        class="text-neutral-200 text-sm"
        v-if="customerData.customer_details.instagram"
      >
        Instagram:
        <a
          class="underline"
          :href="
            'https://instagram.com/' + customerData.customer_details.instagram
          "
          target="_blank"
          >{{ customerData.customer_details.instagram }}</a
        >
      </p>
      <label class="flex flex-col mt-4 text-neutral-200 text-sm">
        Kommentar (intern)
        <textarea
          v-model="customerData.comment"
          class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
          placeholder="Kommentar"
        ></textarea>
      </label>
      <button
        class="bg-gold-600 text-white px-4 py-2 block w-full rounded mt-4 text-xs"
        @click="updateCustomerDetails"
      >
        Aktualiseren
      </button>
    </div>

    <div
      class="my-4 flex flex-col bg-neutral-800 rounded p-4"
      v-if="customerData"
    >
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col w-full mb-4">
          <div class="flex items-center justify-between mb-2">
            <label class="flex flex-col text-neutral-200 text-sm">
              Gebuchte Termine: {{ bookedAppointments.length }}
            </label>
            <label class="flex flex-col text-neutral-200 text-sm"
              >Umsatz: {{ calculateIncome(customerData) }} CHF</label
            >
          </div>
          <div class="flex flex-col">
            <div
              class="flex items-center justify-between py-2 border-b border-neutral-700"
              v-for="appointment in bookedAppointments"
              :key="appointment.id"
            >
              <div class="text-neutral-400 text-sm flex items-center">
                <img
                  src="/booked_out.svg"
                  alt="calendar"
                  class="w-4 h-4 mr-2 mb-1"
                />{{ new Date(appointment.date).toLocaleDateString("DE-de") }}
                {{ appointment.time }} |
                {{ appointment.services[0].name }}
              </div>
              <div class="text-neutral-400 text-sm">
                <img
                  src="/dots.svg"
                  key="dots"
                  alt="dots"
                  class="w-6 h-6"
                  @click="goToDetails(appointment.id)"
                />
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between mt-6 mb-2">
            <label class="flex flex-col text-neutral-200 text-sm">
              Stornierte Termine: {{ cancelledAppointments.length }}
            </label>
          </div>
          <div class="flex flex-col">
            <div
              class="flex items-center justify-between py-2 border-b border-neutral-700"
              v-for="appointment in cancelledAppointments"
              :key="appointment.id"
            >
              <div class="text-neutral-400 text-sm flex items-center">
                <img
                  src="/booked_out.svg"
                  alt="calendar"
                  class="w-4 h-4 mr-2 mb-1"
                />{{ new Date(appointment.date).toLocaleDateString("DE-de") }}
                {{ appointment.time }}
              </div>
              <div class="text-neutral-400 text-sm">
                {{ appointment.services[0].name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="my-4 flex flex-col bg-neutral-800 rounded p-4"
      v-if="customerData"
    >
      <p class="text-neutral-200 text-sm">Blockieren</p>
      <button
        @click="handleBlockCustomer(customerData)"
        class="bg-red-900 text-white px-4 py-2 block w-full rounded mt-4 text-xs"
      >
        {{ customerData.isBlocked ? "Blockierung aufheben" : "Blockieren" }}
      </button>
    </div>
  </div>
  <icon-navigation-component />
</template>

<script setup>
import { isLoyalCustomer } from "~/utils/customer";

const route = useRoute();
const router = useRouter();
const api = useBookingApi();

const customerData = ref(null);

const fetchCustomer = async () => {
  customerData.value = await api.getCustomer(route.params.id);
};
fetchCustomer();

const updateCustomerDetails = async () => {
  try {
    customerData.value = await api.updateCustomer(route.params.id, {
      name: customerData.value.name,
      email: customerData.value.email,
      comment: customerData.value.comment,
    });
    alert("Kunde wurde erfolgreich aktualisiert");
  } catch {
    alert("Fehler beim Aktualiseren des Kundens");
  }
};

const calculateIncome = (customer) => {
  let income = 0;
  customer.appointments.forEach((appointment) => {
    if (appointment.cancelled) return;
    appointment.services.forEach((service) => {
      income += service.price;
    });
  });
  return income;
};

const handleBlockCustomer = async (customer) => {
  if (
    !window.confirm(
      "Möchten Sie den Kunden wirklich blockieren oder die Blockierung aufheben?",
    )
  ) {
    return;
  }

  try {
    customerData.value = customer.isBlocked
      ? await api.unblockCustomer(customer.id)
      : await api.blockCustomer(customer.id);
    alert(customer.isBlocked ? "Kunde wurde erfolgreich entsperrt" : "Kunde wurde erfolgreich blockiert");
  } catch {
    alert("Aktion fehlgeschlagen");
  }
};

const bookedAppointments = computed(() => {
  if (customerData.value) {
    return customerData.value.appointments.filter(
      (appointment) => !appointment.cancelled
    );
  }
});

const cancelledAppointments = computed(() => {
  if (customerData.value) {
    return customerData.value.appointments.filter(
      (appointment) => appointment.cancelled
    );
  }
});

const goToDetails = (appointmentId) => {
  if (!confirm("Möchtest du in die Detailansicht gehen ?")) return;
  router.push("/admin/bookees/" + appointmentId);
};
</script>

<style></style>
