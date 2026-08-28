<template>
  <section class="booking-shell px-4 mx-auto max-w-[700px] pb-16 pt-32 sm:pt-36 md:pb-20 md:pt-40">
    <p v-if="errorMessage" class="mb-4 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <div class="border border-neutral-800 bg-[#0A0A0A]/85 p-4">
      <h2 class="text-lg font-semibold text-neutral-200">{{ t("bookingFlow.selectBarber.heading") }}</h2>
      <p class="mt-2 text-sm text-neutral-400">{{ t("bookingFlow.selectBarber.intro") }}</p>
      <hr class="mt-3 mb-4 border-neutral-800" />

      <div v-if="loading" class="flex flex-col items-center justify-center py-10 text-center">
        <img src="/loading.svg" alt="" class="h-8 w-8 animate-spin" width="32" height="32" />
        <p class="mt-4 text-sm text-neutral-400">{{ t("bookingFlow.selectBarber.loading") }}</p>
      </div>

      <ul v-else-if="employees.length" class="flex flex-col gap-2">
        <li v-for="employee in employees" :key="employee.id">
          <button
            type="button"
            class="flex w-full items-center gap-4 border border-neutral-800 bg-[#0A0A0A]/60 px-3 py-3 text-left transition-colors hover:border-neutral-600 hover:bg-neutral-900/80"
            @click="goWithEmployee(employee.id)"
          >
            <div class="aspect-[3/4] h-16 w-12 shrink-0 overflow-hidden bg-neutral-900">
              <img
                v-if="employee.photo_url"
                :src="employee.photo_url"
                :alt="displayName(employee)"
                class="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.16em] text-neutral-500"
              >
                {{ t("bookingFlow.selectBarber.noPhoto") }}
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-base font-semibold text-neutral-100">{{ displayName(employee) }}</p>
            </div>
            <span class="shrink-0 text-xs uppercase tracking-[0.14em] text-gold-500">
              {{ t("bookingFlow.selectBarber.choose") }}
            </span>
          </button>
        </li>
      </ul>

      <p v-else class="py-8 text-center text-sm text-neutral-400">
        {{ t("bookingFlow.selectBarber.empty") }}
      </p>

      <template v-if="!loading && employees.length > 1">
        <hr class="my-4 border-neutral-800" />
        <button
          type="button"
          class="block w-full border border-neutral-500 bg-transparent px-4 py-2.5 text-sm font-medium text-neutral-100 hover:border-neutral-300 hover:bg-neutral-900/50"
          @click="goRandom"
        >
          {{ t("bookingFlow.selectBarber.randomCta") }}
        </button>
        <p class="mt-2 text-center text-xs text-neutral-500">
          {{ t("bookingFlow.selectBarber.randomHint") }}
        </p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { StaffEmployee } from "~/types/booking";
import { isApiError, parseCsvNumbers, toCsv } from "~/utils/api";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const api = useBookingApi();
const route = useRoute();
const router = useRouter();

const serviceIds = computed(() => parseCsvNumbers(String(route.params.service || "")));
const employees = ref<StaffEmployee[]>([]);
const loading = ref(true);
const errorMessage = ref("");
const navigating = ref(false);

const employeeIdFromQuery = computed(() => {
  const raw = Number(route.query.employee);
  return Number.isFinite(raw) && raw > 0 ? raw : null;
});

const displayName = (employee: StaffEmployee) =>
  employee.staff_name || employee.display_name || employee.name || "";

const datePath = () =>
  localePath(`/online-booking/date-${toCsv(serviceIds.value)}`);

const goWithEmployee = async (employeeId: number) => {
  if (navigating.value || !serviceIds.value.length) return;
  navigating.value = true;
  await router.replace({
    path: datePath(),
    query: { employee: String(employeeId) },
  });
};

const goRandom = async () => {
  if (!employees.value.length) return;
  const pick = employees.value[Math.floor(Math.random() * employees.value.length)];
  if (pick) await goWithEmployee(pick.id);
};

const loadAndMaybeSkip = async () => {
  if (!serviceIds.value.length) {
    errorMessage.value = t("bookingFlow.selectBarber.errorNoServices");
    loading.value = false;
    return;
  }

  if (employeeIdFromQuery.value) {
    await goWithEmployee(employeeIdFromQuery.value);
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  try {
    const response = await api.getPublicEmployees(serviceIds.value);
    employees.value = response.employees || [];

    if (employees.value.length <= 1) {
      const only = employees.value[0];
      if (only) {
        await goWithEmployee(only.id);
        return;
      }
      // No eligible staff: still allow date step (backend will suggest / error)
      await router.replace({
        path: localePath(`/online-booking/date-${toCsv(serviceIds.value)}`),
      });
      return;
    }
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : t("bookingFlow.selectBarber.errorLoad");
    employees.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadAndMaybeSkip);

useHead(() => ({
  title: t("bookingFlow.selectBarber.seoTitle"),
  htmlAttrs: {
    lang: toBcp47Locale(locale.value),
  },
  meta: [
    { name: "description", content: t("bookingFlow.selectBarber.seoDescription") },
    { property: "og:title", content: t("bookingFlow.selectBarber.seoTitle") },
    { property: "og:description", content: t("bookingFlow.selectBarber.seoDescription") },
  ],
}));
</script>
