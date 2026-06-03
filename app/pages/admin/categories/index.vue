<template>
  <div class="admin-page px-4">
    <div class="flex justify-between items-center">
      <h2 class="text-sm font-medium text-neutral-200">Kategorien</h2>
      <div class="flex gap-2">
        <nuxt-link
          to="/admin/services"
          class="bg-neutral-700 text-white px-4 py-2 rounded text-xs"
          >Leistungen</nuxt-link
        >
        <nuxt-link
          to="/admin/categories/new"
          class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
          >Neue Kategorie</nuxt-link
        >
      </div>
    </div>
    <hr class="my-2 border-neutral-600" />

    <div v-if="pending" class="my-8 text-center text-sm text-neutral-400">
      Kategorien werden geladen…
    </div>

    <div v-else-if="categories.length > 0" class="my-4 flex flex-col">
      <div
        v-for="category in categories"
        :key="category.id"
        class="flex items-center justify-between w-full bg-neutral-800 rounded p-4 mb-2"
      >
        <div>
          <div class="font-bold text-sm text-neutral-200">{{ category.name }}</div>
          <div class="text-neutral-400 text-xs">Reihenfolge: {{ category.sort_order }}</div>
        </div>
        <div class="flex items-center gap-2">
          <nuxt-link
            :to="`/admin/categories/${category.id}/edit`"
            class="px-2 rounded"
          >
            <img src="/edit.svg" alt="Bearbeiten" />
          </nuxt-link>
          <button class="px-2 rounded" @click="removeCategory(category.id)">
            <img src="/delete.svg" alt="Löschen" />
          </button>
        </div>
      </div>
    </div>

    <p v-else class="my-8 text-center text-sm text-neutral-400">
      Noch keine Kategorien angelegt.
    </p>
  </div>
</template>

<script setup>
const api = useBookingApi();

const { data, pending, refresh } = await useAsyncData("service-categories", () =>
  api.getServiceCategories(),
);

const categories = computed(() => data.value ?? []);

const removeCategory = async (id) => {
  if (!confirm("Kategorie wirklich löschen?")) {
    return;
  }
  try {
    await api.deleteServiceCategory(id);
    await refresh();
  } catch {
    alert("Kategorie konnte nicht gelöscht werden");
  }
};
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
