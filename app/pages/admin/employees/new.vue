<template>
  <div class="admin-page px-4">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-medium text-neutral-200">Mitarbeiter anlegen</h2>
      <nuxt-link to="/admin/employees" class="rounded bg-neutral-700 px-4 py-2 text-xs text-white">
        Abbrechen
      </nuxt-link>
    </div>
    <hr class="my-2 border-neutral-600" />
    <form class="flex flex-col gap-3 rounded bg-neutral-800 p-4" @submit.prevent="submit">
      <label class="text-sm text-neutral-200">
        Name
        <input v-model="form.name" required class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2" />
      </label>
      <label class="text-sm text-neutral-200">
        Anzeigename
        <input v-model="form.display_name" class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2" />
      </label>
      <label class="text-sm text-neutral-200">
        E-Mail
        <input v-model="form.email" type="email" required class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2" />
      </label>
      <label class="text-sm text-neutral-200">
        Passwort
        <input v-model="form.password" type="password" required minlength="8" class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2" />
      </label>
      <fieldset class="text-sm text-neutral-200">
        <legend class="mb-2">Leistungen</legend>
        <label v-for="service in services" :key="service.id" class="mb-1 flex items-center gap-2">
          <input v-model="form.service_ids" type="checkbox" :value="service.id" />
          {{ service.name }}
        </label>
      </fieldset>
      <p v-if="errorMessage" class="text-sm text-red-400">{{ errorMessage }}</p>
      <button type="submit" class="rounded bg-gold-600 px-4 py-2 text-xs text-white" :disabled="loading">
        {{ loading ? "Speichern…" : "Anlegen" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Service } from "~/types/booking";
import { isApiError } from "~/utils/api";

definePageMeta({ layout: "admin", middleware: "auth" });
defineI18nRoute(false);

const api = useBookingApi();
const router = useRouter();
const { isAdmin } = useAuth();

const services = ref<Service[]>([]);
const loading = ref(false);
const errorMessage = ref("");
const form = reactive({
  name: "",
  display_name: "",
  email: "",
  password: "",
  service_ids: [] as number[],
});

onMounted(async () => {
  if (!isAdmin.value) {
    await router.replace("/admin");
    return;
  }
  services.value = await api.getServices(true);
});

const submit = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const employee = await api.createEmployee({ ...form });
    await router.push(`/admin/employees/${employee.id}`);
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Anlegen fehlgeschlagen";
  } finally {
    loading.value = false;
  }
};
</script>
