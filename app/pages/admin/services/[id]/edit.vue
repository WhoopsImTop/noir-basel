<template>
  <div class="admin-page px-4">
    <div class="flex justify-between items-center">
      <h2 class="text-sm font-medium text-neutral-200">Leistung bearbeiten</h2>
      <nuxt-link
        to="/admin/services"
        class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
        >Abbrechen</nuxt-link
      >
    </div>
    <hr class="my-2 border-neutral-600" />
    <div class="my-4 flex flex-col bg-neutral-800 rounded p-4">
      <div class="flex flex-col w-full mb-4 gap-4">
        <label class="flex flex-col text-neutral-200 text-sm">
          Name der Leistung
          <input
            type="text"
            v-model="serviceData.name"
            class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
            placeholder="Name"
          />
        </label>
        <label class="flex flex-col text-neutral-200 text-sm">
          Beschreibung der Leistung
          <textarea
            v-model="serviceData.description"
            class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
            placeholder="Beschreibung"
          />
        </label>
        <label class="flex flex-col text-neutral-200 text-sm">
          Dauer der Leistung
          <input
            type="number"
            v-model="serviceData.step"
            class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
            placeholder="Dauer in Minuten"
          />
        </label>
        <label class="flex flex-col text-neutral-200 text-sm">
          Preis der Leistung (Listenpreis)
          <input
            type="number"
            v-model="serviceData.price"
            class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
            placeholder="Preis in CHF"
          />
        </label>
        <p
          v-if="activeSalePreview"
          class="text-sm text-neutral-400"
        >
          Aktuell auf der Website:
          <span class="line-through text-neutral-500">{{ serviceData.price }} CHF</span>
          <span class="text-gold-400 ml-1">{{ activeSalePreview.price }} CHF</span>
          <span class="text-neutral-500 text-xs block mt-1">
            (gültig {{ activeSalePreview.start_date }}
            <template v-if="activeSalePreview.end_date">
              – {{ activeSalePreview.end_date }}</template
            >)
          </span>
        </p>
        <label class="flex flex-col text-neutral-200 text-sm">
          Kategorie
          <select
            v-model="serviceData.category_id"
            class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2 text-neutral-200"
          >
            <option :value="null">Keine Kategorie</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </label>
        <fieldset class="flex flex-col text-neutral-200 text-sm">
          <legend class="mb-2">Mitarbeiter die diese Leistung anbieten</legend>
          <label
            v-for="employee in employees"
            :key="employee.id"
            class="mb-1 flex items-center gap-2"
          >
            <input v-model="selectedEmployeeIds" type="checkbox" :value="employee.id" />
            {{ employee.staff_name || employee.display_name || employee.name }}
          </label>
        </fieldset>
      </div>
      <button
        class="bg-gold-600 text-white px-4 py-2 block w-full rounded mt-4 text-xs"
        @click="updateService"
      >
        Aktualisieren
      </button>
    </div>

    <hr class="my-2 border-neutral-600" />
    <div class="my-4 flex flex-col bg-neutral-800 rounded p-4">
      <h2 class="text-md font-medium text-neutral-200 mb-3">
        Gespeicherte Preisanpassungen
      </h2>
      <p v-if="allPriceAdjustments.length === 0" class="text-sm text-neutral-500">
        Noch keine zeitliche Preisanpassung für diese Leistung.
      </p>
      <div
        v-for="adjustment in allPriceAdjustments"
        :key="adjustment.id"
        class="flex justify-between w-full mb-3 border border-neutral-700 rounded px-3 py-2"
      >
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <p class="text-neutral-200 text-sm">
            {{ adjustment.start_date }} –
            {{ adjustment.end_date ?? "unbegrenzt" }}
          </p>
          <p class="text-neutral-200 text-sm">
            <span
              v-if="Number(adjustment.price) < Number(serviceData.price)"
              class="line-through text-neutral-500 mr-1"
              >{{ serviceData.price }} CHF</span
            >
            <span class="text-gold-400">{{ adjustment.price }} CHF</span>
          </p>
        </div>
        <button
          class="bg-red-900 text-white px-3 py-2 rounded text-xs shrink-0"
          @click="deletePriceAdjustment(adjustment.id)"
        >
          <img src="/delete.svg" alt="Löschen" />
        </button>
      </div>
    </div>

    <hr class="my-2 border-neutral-600" />
    <div class="my-4 flex flex-col bg-neutral-800 rounded p-4">
      <h2 class="text-md font-medium text-neutral-200">Preisanpassung hinterlegen</h2>
      <p class="text-neutral-500 text-xs mt-1 mb-2">
        Temporärer Preis für einen Zeitraum (z. B. Aktionspreis mit Streichpreis, wenn
        niedriger als der Listenpreis).
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="flex flex-col text-neutral-200 text-sm">
          Startdatum
          <input
            type="date"
            v-model="priceAdjustment.start"
            class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
          />
        </label>
        <label class="flex flex-col text-neutral-200 text-sm">
          Enddatum (optional)
          <input
            type="date"
            v-model="priceAdjustment.end"
            class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
          />
        </label>
      </div>
      <label class="flex flex-col mt-4 text-neutral-200 text-sm">
        Neuer Preis
        <input
          type="number"
          v-model="priceAdjustment.price"
          class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
          placeholder="Preis in CHF"
        />
      </label>
      <button
        class="bg-gold-600 text-white px-4 py-2 block w-full rounded mt-4 text-xs"
        @click="setPriceAdjustment"
      >
        Preisanpassung speichern
      </button>
    </div>
  </div>
</template>

<script setup>
import { isApiError } from "~/utils/api";

const route = useRoute();
const api = useBookingApi();

const { data: categoriesData } = await useAsyncData("categories-for-service-edit", () =>
  api.getServiceCategories(),
);
const categories = computed(() => categoriesData.value ?? []);

const serviceData = ref({
  name: "",
  description: "",
  step: 0,
  price: 0,
  category_id: null,
});

const priceAdjustment = ref({
  start: "",
  end: "",
  price: 0,
  service_id: 0,
});

const allPriceAdjustments = ref([]);
const employees = ref([]);
const selectedEmployeeIds = ref([]);

const todayIso = () => new Date().toISOString().slice(0, 10);

const isAdjustmentActive = (adjustment) => {
  const today = todayIso();
  const started = adjustment.start_date <= today;
  const notEnded =
    !adjustment.end_date || adjustment.end_date >= today;
  return started && notEnded;
};

const activeSalePreview = computed(() => {
  const active = allPriceAdjustments.value.find(isAdjustmentActive);
  if (!active) {
    return null;
  }
  if (Number(active.price) >= Number(serviceData.value.price)) {
    return null;
  }
  return active;
});

onMounted(() => {
  priceAdjustment.value.service_id = Number(route.params.id);
});

const fetchService = async () => {
  serviceData.value = await api.getService(route.params.id);
  selectedEmployeeIds.value = (serviceData.value.employees || []).map((e) => e.id);
};

const loadEmployees = async () => {
  try {
    employees.value = await api.getEmployees();
  } catch {
    employees.value = [];
  }
};

const loadPriceAdjustments = async () => {
  try {
    const data = await api.getPriceAdjustments(route.params.id);
    allPriceAdjustments.value = Array.isArray(data) ? data : data ? [data] : [];
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      allPriceAdjustments.value = [];
      return;
    }
    console.error(error);
    allPriceAdjustments.value = [];
  }
};

await fetchService();
await loadEmployees();
await loadPriceAdjustments();

const updateService = async () => {
  try {
    serviceData.value = await api.updateService(route.params.id, {
      name: serviceData.value.name,
      description: serviceData.value.description,
      step: serviceData.value.step,
      price: serviceData.value.price,
      category_id: serviceData.value.category_id,
    });
    await api.syncServiceEmployees(route.params.id, selectedEmployeeIds.value);
    await fetchService();
    alert("Leistung wurde erfolgreich aktualisiert");
  } catch {
    alert("Fehler beim Aktualisieren der Leistung");
  }
};

const setPriceAdjustment = async () => {
  if (!priceAdjustment.value.start || !priceAdjustment.value.price) {
    alert("Bitte Startdatum und neuen Preis angeben");
    return;
  }
  try {
    await api.createPriceAdjustment({
      start_date: priceAdjustment.value.start,
      end_date: priceAdjustment.value.end || null,
      price: priceAdjustment.value.price,
      services_id: priceAdjustment.value.service_id,
    });
    alert("Preisanpassung wurde erfolgreich hinterlegt");
    priceAdjustment.value.start = "";
    priceAdjustment.value.end = "";
    priceAdjustment.value.price = 0;
    await loadPriceAdjustments();
  } catch {
    alert("Fehler beim Hinterlegen der Preisanpassung");
  }
};

const deletePriceAdjustment = async (id) => {
  if (!confirm("Preisanpassung wirklich löschen?")) {
    return;
  }
  try {
    await api.deletePriceAdjustment(id);
    allPriceAdjustments.value = allPriceAdjustments.value.filter((item) => item.id !== id);
    alert("Preisanpassung wurde gelöscht");
  } catch {
    alert("Fehler beim Löschen der Preisanpassung");
  }
};
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
