<template>
  <div class="admin-page px-4 pb-10">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-medium text-neutral-200">Mitarbeiter</h2>
      <nuxt-link to="/admin/employees" class="rounded bg-neutral-700 px-4 py-2 text-xs text-white">
        Zurück
      </nuxt-link>
    </div>
    <hr class="my-2 border-neutral-600" />
    <div v-if="loading" class="py-8 text-center text-sm text-neutral-400">Lade…</div>
    <template v-else-if="employee">
      <div class="mb-6 rounded bg-neutral-800 p-4">
        <h3 class="mb-3 text-sm font-medium text-neutral-200">Team-Foto</h3>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div class="h-36 w-28 overflow-hidden rounded bg-neutral-900">
            <img
              v-if="employee.photo_url"
              :src="employee.photo_url"
              :alt="employee.staff_name || employee.name"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center text-xs text-neutral-500">
              Kein Foto
            </div>
          </div>
          <div class="flex flex-1 flex-col gap-2">
            <input
              ref="photoInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="block w-full text-xs text-neutral-300 file:mr-3 file:rounded file:border-0 file:bg-neutral-700 file:px-3 file:py-2 file:text-xs file:text-white"
              @change="onPhotoSelected"
            />
            <div class="flex gap-2">
              <button
                type="button"
                class="rounded bg-gold-600 px-3 py-2 text-xs text-white disabled:opacity-50"
                :disabled="!pendingPhoto || photoUploading"
                @click="uploadPhoto"
              >
                {{ photoUploading ? "Lädt…" : "Foto hochladen" }}
              </button>
              <button
                v-if="employee.photo_url"
                type="button"
                class="rounded border border-neutral-600 px-3 py-2 text-xs text-neutral-300"
                :disabled="photoUploading"
                @click="removePhoto"
              >
                Entfernen
              </button>
            </div>
            <p class="text-[11px] text-neutral-500">JPEG, PNG oder WebP · max. 5 MB</p>
          </div>
        </div>
      </div>

      <form class="mb-6 flex flex-col gap-3 rounded bg-neutral-800 p-4" @submit.prevent="saveProfile">
        <label class="text-sm text-neutral-200">
          Name
          <input v-model="form.name" class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2" />
        </label>
        <label class="text-sm text-neutral-200">
          Anzeigename
          <input v-model="form.display_name" class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2" />
        </label>
        <label class="text-sm text-neutral-200">
          E-Mail
          <input v-model="form.email" type="email" class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2" />
        </label>
        <label class="text-sm text-neutral-200">
          Neues Passwort (optional)
          <input v-model="form.password" type="password" minlength="8" class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2" />
        </label>
        <label v-if="isAdmin" class="flex items-center gap-2 text-sm text-neutral-200">
          <input v-model="form.is_active" type="checkbox" />
          Aktiv / buchbar
        </label>
        <fieldset v-if="isAdmin" class="text-sm text-neutral-200">
          <legend class="mb-2">Terminrechte</legend>
          <label class="mb-1 flex items-center gap-2">
            <input v-model="form.can_edit_appointments" type="checkbox" />
            Eigene Termine bearbeiten
          </label>
          <label class="mb-1 flex items-center gap-2">
            <input v-model="form.can_cancel_appointments" type="checkbox" />
            Eigene Termine stornieren
          </label>
        </fieldset>
        <fieldset v-if="isAdmin" class="text-sm text-neutral-200">
          <legend class="mb-2">Leistungen</legend>
          <label v-for="service in services" :key="service.id" class="mb-1 flex items-center gap-2">
            <input v-model="form.service_ids" type="checkbox" :value="service.id" />
            {{ service.name }}
          </label>
        </fieldset>
        <p v-if="message" class="text-sm text-green-400">{{ message }}</p>
        <p v-if="errorMessage" class="text-sm text-red-400">{{ errorMessage }}</p>
        <button type="submit" class="rounded bg-gold-600 px-4 py-2 text-xs text-white">Speichern</button>
      </form>

      <h3 class="mb-2 text-sm font-medium text-neutral-200">Arbeitszeiten</h3>
      <div class="mb-4 rounded bg-neutral-800 p-4">
        <div v-for="hour in hours" :key="hour.day" class="mb-3">
          <p class="text-sm text-neutral-200">{{ hour.day }}</p>
          <template v-if="isAdmin">
            <div class="mt-1 grid grid-cols-2 gap-2">
              <input v-model="hour.from" type="time" class="rounded border border-neutral-700 bg-neutral-900 p-2 text-sm text-neutral-200" />
              <input v-model="hour.to" type="time" class="rounded border border-neutral-700 bg-neutral-900 p-2 text-sm text-neutral-200" />
            </div>
            <label class="mt-1 flex items-center gap-2 text-xs text-neutral-300">
              <input v-model="hour.off_day" type="checkbox" />
              Frei
            </label>
          </template>
          <p v-else class="mt-1 text-xs text-neutral-400">
            {{ hour.off_day ? "Frei" : `${hour.from || "—"} – ${hour.to || "—"}` }}
          </p>
        </div>
        <button
          v-if="isAdmin"
          type="button"
          class="mt-2 w-full rounded bg-gold-600 px-4 py-2 text-xs text-white"
          @click="saveHours"
        >
          Zeiten speichern
        </button>
        <p v-else class="mt-2 text-xs text-neutral-500">
          Arbeitszeiten kann nur der Admin ändern. Urlaub trägst du unter „Urlaub“ ein.
        </p>
      </div>

      <button
        v-if="isAdmin && employee.is_active"
        type="button"
        class="w-full rounded bg-red-900 px-4 py-2 text-xs text-white"
        @click="deactivate"
      >
        Deaktivieren
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { EmployeeBusinessHour, Service, StaffEmployee } from "~/types/booking";
import { isApiError } from "~/utils/api";

definePageMeta({ layout: "admin", middleware: "auth" });
defineI18nRoute(false);

const route = useRoute();
const api = useBookingApi();
const { isAdmin, getUser } = useAuth();

const employee = ref<StaffEmployee | null>(null);
const services = ref<Service[]>([]);
const hours = ref<EmployeeBusinessHour[]>([]);
const loading = ref(true);
const message = ref("");
const errorMessage = ref("");
const pendingPhoto = ref<File | null>(null);
const photoUploading = ref(false);
const photoInput = ref<HTMLInputElement | null>(null);
const form = reactive({
  name: "",
  display_name: "",
  email: "",
  password: "",
  is_active: true,
  can_edit_appointments: false,
  can_cancel_appointments: false,
  service_ids: [] as number[],
});

const load = async () => {
  loading.value = true;
  try {
    const id = String(route.params.id);
    const me = getUser();
    if (!isAdmin.value && me && String(me.id) !== id) {
      await navigateTo(`/admin/employees/${me.id}`);
      return;
    }
    employee.value = await api.getEmployee(id);
    form.name = employee.value.name;
    form.display_name = employee.value.display_name || "";
    form.email = employee.value.email || "";
    form.is_active = !!employee.value.is_active;
    form.can_edit_appointments = !!employee.value.can_edit_appointments;
    form.can_cancel_appointments = !!employee.value.can_cancel_appointments;
    form.service_ids = (employee.value.services || []).map((s) => s.id);
    hours.value = (await api.getEmployeeBusinessHours(id)).map((h) => ({
      ...h,
      from: h.from ? String(h.from).slice(0, 5) : "",
      to: h.to ? String(h.to).slice(0, 5) : "",
      off_day: !!h.off_day,
    }));
    if (isAdmin.value) {
      services.value = await api.getServices(true);
    }
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Laden fehlgeschlagen";
  } finally {
    loading.value = false;
  }
};

const saveProfile = async () => {
  message.value = "";
  errorMessage.value = "";
  try {
    const payload: Record<string, unknown> = {
      name: form.name,
      display_name: form.display_name || null,
      email: form.email,
    };
    if (form.password) payload.password = form.password;
    if (isAdmin.value) {
      payload.is_active = form.is_active;
      payload.service_ids = form.service_ids;
      payload.can_edit_appointments = form.can_edit_appointments;
      payload.can_cancel_appointments = form.can_cancel_appointments;
    }
    employee.value = await api.updateEmployee(String(route.params.id), payload);
    message.value = "Gespeichert";
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Speichern fehlgeschlagen";
  }
};

const saveHours = async () => {
  message.value = "";
  errorMessage.value = "";
  try {
    hours.value = await api.syncEmployeeBusinessHours(
      String(route.params.id),
      hours.value.map((h) => ({
        day: h.day,
        from: h.from || null,
        to: h.to || null,
        off_day: !!h.off_day,
      })),
    );
    message.value = "Zeiten gespeichert";
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Zeiten speichern fehlgeschlagen";
  }
};

const onPhotoSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  pendingPhoto.value = input.files?.[0] ?? null;
};

const uploadPhoto = async () => {
  if (!pendingPhoto.value) return;
  photoUploading.value = true;
  message.value = "";
  errorMessage.value = "";
  try {
    employee.value = await api.uploadEmployeePhoto(String(route.params.id), pendingPhoto.value);
    pendingPhoto.value = null;
    if (photoInput.value) photoInput.value.value = "";
    message.value = "Foto gespeichert";
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Foto-Upload fehlgeschlagen";
  } finally {
    photoUploading.value = false;
  }
};

const removePhoto = async () => {
  if (!confirm("Foto wirklich entfernen?")) return;
  photoUploading.value = true;
  errorMessage.value = "";
  try {
    employee.value = await api.deleteEmployeePhoto(String(route.params.id));
    message.value = "Foto entfernt";
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Foto konnte nicht entfernt werden";
  } finally {
    photoUploading.value = false;
  }
};

const deactivate = async () => {
  await api.deactivateEmployee(String(route.params.id));
  await navigateTo("/admin/employees");
};

onMounted(load);
</script>
