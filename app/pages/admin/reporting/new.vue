<template>
  <div class="admin-page px-4">
    <div class="flex justify-between items-center">
      <h2 class="text-md font-medium text-neutral-200 text-sm">
        Kunde hinzufügen
      </h2>
      <nuxt-link
        to="/admin/reporting"
        class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
        >Abbrechen</nuxt-link
      >
    </div>
    <hr class="my-2 border-neutral-600" />
    <div class="my-4 flex flex-col bg-neutral-800 rounded p-4">
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col w-full mb-4">
          <label class="flex flex-col text-neutral-200 text-sm">
            Name des Kunden
            <input
              type="text"
              v-model="customerData.name"
              class="border bg-neutral-800 border-neutral-700 rounded p-2"
              placeholder="Name"
          /></label>
          <label class="flex flex-col mt-4 text-neutral-200 text-sm">
            Email des Kunden
            <input
              v-model="customerData.email"
              type="email"
              class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
              placeholder="Beschreibung"
            />
          </label>
          <label class="flex flex-col mt-4 text-neutral-200 text-sm">
            Telefonnummer des Kunden
            <input
              type="text"
              v-model="customerData.phone"
              class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
              placeholder="Dauer in Minuten"
            />
          </label>
        </div>
      </div>
      <button
        class="bg-gold-600 text-white px-4 py-2 block w-full rounded mt-4 text-xs"
        @click="saveCustomer"
      >
        Speichern
      </button>
    </div>
  </div>
</template>

<script setup>
const api = useBookingApi();

const customerData = ref({
  name: "",
  email: "",
  phone: "",
});

const saveCustomer = async () => {
  if (!customerData.value.name || !customerData.value.email || !customerData.value.phone) {
    alert("Bitte fülle alle Felder aus");
    return;
  }

  try {
    await api.createCustomer({
      name: customerData.value.name,
      email: customerData.value.email,
      phone: customerData.value.phone,
    });
    alert("Kunde wurde erfolgreich erstellt");
    customerData.value = { name: "", email: "", phone: "" };
  } catch {
    alert("Fehler beim Erstellen des Kunden");
  }
};
</script>

<style>
#usercentrics-root {
  display: none;
}</style>
