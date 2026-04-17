<template>
  <section class="page-container pb-16 pt-32 text-white">
    <h1 class="text-3xl font-semibold uppercase tracking-[0.1em]">Termin bearbeiten</h1>
    <p v-if="errorMessage" class="mt-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{{ errorMessage }}</p>
    <form v-if="loaded" class="mt-8 grid max-w-xl gap-3" @submit.prevent="save">
      <input v-model="form.date" type="date" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" required />
      <input v-model="form.time" type="time" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" required />
      <input v-model="form.name" placeholder="Name" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" />
      <input v-model="form.email" type="email" placeholder="E-Mail" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" />
      <input v-model="form.phone" placeholder="Telefon" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" />
      <input v-model.number="form.edited_duration" type="number" min="0" placeholder="Dauer (Min)" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" />
      <textarea v-model="form.notes" rows="3" placeholder="Notizen" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" />
      <button class="rounded-sm bg-white px-4 py-2 text-sm uppercase tracking-[0.12em] text-black">Speichern</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { isApiError } from "~/utils/api";

definePageMeta({ middleware: "auth", layout: "admin" });

const api = useBookingApi();
const route = useRoute();
const router = useRouter();

const loaded = ref(false);
const errorMessage = ref("");
const form = reactive({
  date: "",
  time: "",
  name: "",
  email: "",
  phone: "",
  notes: "",
  edited_duration: 0,
});

const withAuthHandling = async (action: () => Promise<void>) => {
  try {
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

const load = () =>
  withAuthHandling(async () => {
    const appointment = await api.getAppointment(String(route.params.id));
    form.date = appointment.date;
    form.time = appointment.time;
    form.name = appointment.name || appointment.customer?.name || "";
    form.email = appointment.email || appointment.customer?.email || "";
    form.phone = appointment.phone || appointment.customer?.phone || "";
    form.notes = appointment.notes || "";
    form.edited_duration = appointment.edited_duration || 0;
    loaded.value = true;
  });

const save = () =>
  withAuthHandling(async () => {
    await api.updateAppointment(String(route.params.id), {
      date: form.date,
      time: form.time,
      edited_duration: form.edited_duration || undefined,
      name: form.name || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      notes: form.notes || undefined,
    });
    await router.push(`/admin/bookees/${route.params.id}`);
  });

onMounted(load);
</script>
