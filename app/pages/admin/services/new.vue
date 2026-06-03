<template>
  <div class="admin-page px-4">
    <div class="flex justify-between items-center">
      <h2 class="text-md font-medium text-neutral-200 text-sm">
        Leistung hinzufügen
      </h2>
      <nuxt-link
        to="/admin/services"
        class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
        >Abbrechen</nuxt-link
      >
    </div>
    <hr class="my-2 border-neutral-600" />
    <div class="my-4 flex flex-col bg-neutral-800 rounded p-4">
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col w-full mb-4">
          <label class="flex flex-col text-neutral-200 text-sm">
            Name der Leistung
            <input
              type="text"
              v-model="serviceData.name"
              class="border bg-neutral-800 border-neutral-700 rounded p-2"
              placeholder="Name"
          /></label>
          <label class="flex flex-col mt-4 text-neutral-200 text-sm">
            Beschreibung der Leistung
            <textarea
              v-model="serviceData.description"
              class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
              placeholder="Beschreibung"
            ></textarea>
          </label>
          <label class="flex flex-col mt-4 text-neutral-200 text-sm">
            Dauer der Leistung
            <input
              type="number"
              v-model="serviceData.step"
              class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
              placeholder="Dauer in Minuten"
            />
          </label>
          <label class="flex flex-col mt-4 text-neutral-200 text-sm">
            Preis der Leistung
            <input
              type="number"
              v-model="serviceData.price"
              class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
              placeholder="Preis in Euro"
            />
          </label>
          <label class="flex flex-col mt-4 text-neutral-200 text-sm">
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
        </div>
      </div>
      <button
        class="bg-gold-600 text-white px-4 py-2 block w-full rounded mt-4 text-xs"
        @click="saveService"
      >
        Speichern
      </button>
    </div>
  </div>
</template>

<script setup>
const api = useBookingApi();

const { data: categoriesData } = await useAsyncData("categories-for-service", () =>
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

const saveService = async () => {
  try {
    await api.createService({
      name: serviceData.value.name,
      description: serviceData.value.description,
      step: serviceData.value.step,
      price: serviceData.value.price,
      category_id: serviceData.value.category_id,
    });
    alert("Leistung wurde erfolgreich erstellt");
    serviceData.value = {
      name: "",
      description: "",
      step: 0,
      price: 0,
    };
  } catch {
    alert("Fehler beim Erstellen der Leistung");
  }
};
</script>

<style>
#usercentrics-root {
  display: none;
}</style>
