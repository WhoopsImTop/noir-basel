<template>
  <div class="admin-page px-4">
    <div class="flex justify-between items-center">
      <h2 class="text-sm font-medium text-neutral-200">Leistungen</h2>
      <div class="flex gap-2">
        <nuxt-link
          to="/admin/categories"
          class="bg-neutral-700 text-white px-4 py-2 rounded text-xs"
          >Kategorien</nuxt-link
        >
        <nuxt-link
          to="/admin/vouchers"
          class="bg-neutral-700 text-white px-4 py-2 rounded text-xs"
          >Gutscheine</nuxt-link
        >
        <nuxt-link
          to="/admin/services/new"
          class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
          >Neue Leistung</nuxt-link
        >
      </div>
    </div>
    <hr class="my-2 border-neutral-600" />
    <p class="text-neutral-400 text-xs mt-4 mb-2">
      Buchungszeit-Preisanpassungen (gelten für alle Leistungen bei Online-Buchung)
    </p>
    <div class="my-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex flex-col bg-neutral-800 p-4 rounded-lg">
        <label class="text-neutral-200 text-sm">Early Bird Preis</label>
        <input
          v-model="earlyBirdTime"
          type="time"
          class="border bg-neutral-800 border-neutral-700 rounded p-2 text-neutral-200 mb-2"
          @change="updatePrice('early_bird_time', earlyBirdTime)"
        />
        <div class="relative">
          <input
            v-model="earlyBirdPrice"
            type="number"
            class="w-full border bg-neutral-800 border-neutral-700 rounded p-2 text-neutral-200"
            @change="updatePrice('early_bird_price', earlyBirdPrice)"
          />
          <span
            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500"
          >
            CHF
          </span>
        </div>
      </div>
      <div class="flex flex-col bg-neutral-800 p-4 rounded-lg">
        <label class="text-neutral-200 text-sm">ab 18 Uhr Preis</label>
        <input
          v-model="afterSixTime"
          type="time"
          class="border bg-neutral-800 border-neutral-700 rounded p-2 text-neutral-200 mb-2"
          @change="updatePrice('late_booker_time', afterSixTime)"
        />
        <div class="relative">
          <input
            v-model="afterSixPrice"
            type="number"
            class="w-full border bg-neutral-800 border-neutral-700 rounded p-2 text-neutral-200"
            @change="updatePrice('late_booker_price', afterSixPrice)"
          />
          <span
            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500"
          >
            CHF
          </span>
        </div>
      </div>
      <div class="flex flex-col bg-neutral-800 p-4 rounded-lg">
        <label class="text-neutral-200 text-sm">ab 21 Uhr Preis</label>
        <input
          v-model="lateNightTime"
          type="time"
          class="border bg-neutral-800 border-neutral-700 rounded p-2 text-neutral-200 mb-2"
          @change="updatePrice('late_night_time', lateNightTime)"
        />
        <div class="relative">
          <input
            v-model="lateNightPrice"
            type="number"
            class="w-full border bg-neutral-800 border-neutral-700 rounded p-2 text-neutral-200"
            @change="updatePrice('late_night_price', lateNightPrice)"
          />
          <span
            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500"
          >
            CHF
          </span>
        </div>
      </div>
    </div>
    <div v-if="services.length > 0" class="my-4 flex flex-col">
      <div
        v-for="service in services"
        :key="service.id"
        class="flex items-center justify-between w-full bg-neutral-800 rounded p-4 mb-4"
      >
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 w-full">
          <div>
            <div class="font-bold text-sm text-neutral-200">
              {{ service.name }}
            </div>
            <div v-if="service.category" class="text-neutral-400 text-xs">
              {{ service.category.name }}
            </div>
          </div>
          <div>
            <div class="text-sm text-neutral-200">
              Dauer {{ service.step }} Min
            </div>
            <div class="text-neutral-400 text-sm">
              Preis {{ service.price }} €
            </div>
          </div>
          <div
            class="border-t border-neutral-600 md:border-0 mt-2 md:mt-0 pt-2 md:pt-0 col-span-2 md:col-span-1 flex justify-end items-center"
          >
            <nuxt-link
              :to="'/admin/services/' + service.id + '/edit'"
              class="px-2 rounded"
              ><img src="/edit.svg" alt="arrow"
            /></nuxt-link>
            <button class="px-2 rounded" @click="deleteService(service.id)">
              <img src="/delete.svg" alt="arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useBookingApi();
const notificationStore = useNotificationStore();

const earlyBirdTime = ref(0);
const afterSixTime = ref(0);
const earlyBirdPrice = ref(0);
const afterSixPrice = ref(0);
const lateNightTime = ref(0);
const lateNightPrice = ref(0);

const settingsKeys = [
  "early_bird_price",
  "late_booker_price",
  "early_bird_time",
  "late_booker_time",
  "late_night_time",
  "late_night_price",
];

const loadSettings = async () => {
  const data = await api.getSettings(settingsKeys, true);
  earlyBirdPrice.value = Number(data.early_bird_price ?? 0);
  afterSixPrice.value = Number(data.late_booker_price ?? 0);
  lateNightPrice.value = Number(data.late_night_price ?? 0);
  earlyBirdTime.value = String(data.early_bird_time ?? "");
  afterSixTime.value = String(data.late_booker_time ?? "");
  lateNightTime.value = String(data.late_night_time ?? "");
};
loadSettings();

const services = ref([]);
const fetchServices = async () => {
  services.value = await api.getServices(true);
};
fetchServices();

const deleteService = async (id) => {
  if (!confirm("Willst du die Leistung wirklich löschen?")) {
    return;
  }
  try {
    await api.deleteService(id);
    notificationStore.addNotification({
      type: "Erfolg",
      message: "Leistung wurde gelöscht!",
    });
    fetchServices();
  } catch {
    notificationStore.addNotification({
      type: "Fehler",
      message: "Leistung konnte nicht gelöscht werden!",
    });
  }
};

const updatePrice = async (type, value) => {
  try {
    await api.updateSetting(type, value);
    notificationStore.showNotification("Erfolg", "Wert wurde aktualisiert!");
  } catch {
    notificationStore.showNotification("Fehler", "Wert konnte nicht aktualisiert werden!");
  }
};
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
