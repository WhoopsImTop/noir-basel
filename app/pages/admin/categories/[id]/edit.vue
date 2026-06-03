<template>
  <div class="admin-page px-4">
    <div class="flex justify-between items-center">
      <h2 class="text-sm font-medium text-neutral-200">Kategorie bearbeiten</h2>
      <nuxt-link
        to="/admin/categories"
        class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
        >Abbrechen</nuxt-link
      >
    </div>
    <hr class="my-2 border-neutral-600" />
    <div v-if="form" class="my-4 flex flex-col bg-neutral-800 rounded p-4">
      <label class="flex flex-col text-neutral-200 text-sm">
        Name
        <input
          v-model="form.name"
          type="text"
          class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
        />
      </label>
      <label class="flex flex-col mt-4 text-neutral-200 text-sm">
        Reihenfolge
        <input
          v-model.number="form.sort_order"
          type="number"
          min="0"
          class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
        />
      </label>
      <button
        class="bg-gold-600 text-white px-4 py-2 block w-full rounded mt-4 text-xs"
        @click="saveCategory"
      >
        Aktualisieren
      </button>
    </div>
  </div>
</template>

<script setup>
const api = useBookingApi();
const route = useRoute();
const router = useRouter();

const form = ref(null);

const { data } = await useAsyncData(`category-${route.params.id}`, async () => {
  const categories = await api.getServiceCategories();
  return categories.find((item) => String(item.id) === String(route.params.id));
});

watchEffect(() => {
  if (data.value) {
    form.value = {
      name: data.value.name,
      sort_order: data.value.sort_order ?? 0,
    };
  }
});

const saveCategory = async () => {
  if (!form.value) {
    return;
  }
  try {
    await api.updateServiceCategory(route.params.id, form.value);
    await router.push("/admin/categories");
  } catch {
    alert("Kategorie konnte nicht aktualisiert werden");
  }
};
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
