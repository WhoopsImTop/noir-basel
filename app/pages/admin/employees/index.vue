<template>
  <div class="admin-page px-4">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-medium text-neutral-200">Team</h2>
      <nuxt-link
        to="/admin/employees/new"
        class="rounded bg-gold-600 px-4 py-2 text-xs text-white"
      >
        Neu
      </nuxt-link>
    </div>
    <hr class="my-2 border-neutral-600" />
    <p v-if="errorMessage" class="mb-3 text-sm text-red-400">{{ errorMessage }}</p>
    <div v-if="loading" class="py-8 text-center text-sm text-neutral-400">Lade…</div>
    <div v-else class="flex flex-col gap-2">
      <nuxt-link
        v-for="employee in employees"
        :key="employee.id"
        :to="`/admin/employees/${employee.id}`"
        class="flex items-center justify-between gap-3 rounded bg-neutral-800 px-3 py-3"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div class="h-12 w-10 shrink-0 overflow-hidden rounded bg-neutral-900">
            <img
              v-if="employee.photo_url"
              :src="employee.photo_url"
              :alt="employee.staff_name || employee.name"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm text-neutral-100">
              {{ employee.staff_name || employee.display_name || employee.name }}
            </p>
            <p class="truncate text-xs text-neutral-400">{{ employee.email }} · {{ employee.role }}</p>
          </div>
        </div>
        <span
          class="shrink-0 rounded px-2 py-0.5 text-[10px] uppercase"
          :class="employee.is_active ? 'bg-green-900/50 text-green-300' : 'bg-neutral-700 text-neutral-400'"
        >
          {{ employee.is_active ? "Aktiv" : "Inaktiv" }}
        </span>
      </nuxt-link>
      <p v-if="!employees.length" class="py-6 text-center text-sm text-neutral-400">
        Noch keine Mitarbeiter.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StaffEmployee } from "~/types/booking";
import { isApiError } from "~/utils/api";

definePageMeta({ layout: "admin", middleware: "auth" });
defineI18nRoute(false);

const api = useBookingApi();
const { isAdmin } = useAuth();
const router = useRouter();

const employees = ref<StaffEmployee[]>([]);
const loading = ref(true);
const errorMessage = ref("");

onMounted(async () => {
  if (!isAdmin.value) {
    await router.replace("/admin");
    return;
  }
  try {
    employees.value = await api.getEmployees();
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Laden fehlgeschlagen";
  } finally {
    loading.value = false;
  }
});
</script>
