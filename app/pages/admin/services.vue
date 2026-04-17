<template>
  <section class="page-container py-4 sm:py-6">
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl font-semibold uppercase tracking-[0.08em] sm:text-2xl">Services</h1>
      <button class="w-full rounded-sm border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.12em] sm:w-auto" @click="loadServices">Neu laden</button>
    </div>

    <p v-if="errorMessage" class="mb-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{{ errorMessage }}</p>

    <article class="rounded-sm border border-white/12 bg-white/3 p-4">
      <h2 class="text-sm uppercase tracking-[0.12em] text-white/70">Service erstellen / bearbeiten</h2>
      <form class="mt-3 grid gap-2 md:grid-cols-2" @submit.prevent="saveService">
        <input v-model="form.name" placeholder="Name" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" required />
        <input v-model.number="form.price" type="number" min="0" step="1" placeholder="Preis" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" required />
        <input v-model.number="form.step" type="number" min="5" step="5" placeholder="Dauer (Minuten)" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm" />
        <input v-model="form.description" placeholder="Beschreibung" class="rounded-sm border border-white/20 bg-transparent px-2 py-1 text-sm md:col-span-2" />
        <div class="md:col-span-2 flex flex-col gap-2 sm:flex-row">
          <button class="w-full rounded-sm bg-white px-3 py-2 text-xs uppercase tracking-[0.12em] text-black sm:w-auto">{{ form.id ? "Service aktualisieren" : "Service erstellen" }}</button>
          <button v-if="form.id" type="button" class="w-full rounded-sm border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.12em] sm:w-auto" @click="resetForm">Abbrechen</button>
        </div>
      </form>
    </article>

    <article class="mt-4 rounded-sm border border-white/12 bg-white/3 p-4">
      <h2 class="text-sm uppercase tracking-[0.12em] text-white/70">Service-Liste</h2>
      <ul class="mt-3 space-y-2">
        <li v-for="service in services" :key="service.id" class="rounded-sm border border-white/10 p-3">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="font-medium">{{ service.name }}</p>
              <p class="text-xs text-white/60">{{ service.description || "-" }}</p>
              <p class="text-xs text-white/70">Dauer: {{ service.step || "-" }} Min | Preis: {{ service.price }} CHF</p>
            </div>
            <div class="grid grid-cols-2 gap-2 sm:flex">
              <button class="rounded-sm border border-white/20 px-2 py-2 text-xs" @click="editService(service)">Bearbeiten</button>
              <button class="rounded-sm border border-red-400/40 px-2 py-2 text-xs text-red-100" @click="removeService(service.id)">Löschen</button>
            </div>
          </div>
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { Service } from "~/types/booking";
import { isApiError } from "~/utils/api";

definePageMeta({ middleware: "auth", layout: "admin" });

const api = useBookingApi();
const router = useRouter();
const errorMessage = ref("");
const services = ref<Service[]>([]);

const form = reactive<Partial<Service>>({
  id: undefined,
  name: "",
  description: "",
  price: 0,
  step: 30,
});

const withAuthHandling = async (action: () => Promise<void>) => {
  try {
    errorMessage.value = "";
    await action();
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      localStorage.removeItem("access_token");
      await router.push("/admin/auth/login");
      return;
    }
    errorMessage.value = isApiError(error) ? error.message : "Aktion fehlgeschlagen.";
  }
};

const loadServices = () =>
  withAuthHandling(async () => {
    services.value = await api.getServices();
  });

const resetForm = () => {
  form.id = undefined;
  form.name = "";
  form.description = "";
  form.price = 0;
  form.step = 30;
};

const editService = (service: Service) => {
  form.id = service.id;
  form.name = service.name;
  form.description = service.description;
  form.price = service.price;
  form.step = service.step || 30;
};

const saveService = () =>
  withAuthHandling(async () => {
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price || 0),
      step: Number(form.step || 30),
    };
    if (form.id) {
      await api.updateService(form.id, payload);
    } else {
      await api.createService(payload);
    }
    resetForm();
    await loadServices();
  });

const removeService = (id: number) =>
  withAuthHandling(async () => {
    await api.deleteService(id);
    await loadServices();
  });

onMounted(loadServices);
</script>
