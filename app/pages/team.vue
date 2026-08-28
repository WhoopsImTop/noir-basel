<template>
  <div ref="pageRoot" class="pb-24 pt-32 sm:pt-36">
    <section class="page-container motion-section">
      <div class="border-b border-[#C0C0C0]/10 pb-10 sm:pb-14">
        <p class="eyebrow">{{ t("teamPage.eyebrow") }}</p>
        <h1 class="section-heading mt-6 max-w-4xl text-4xl text-white sm:text-5xl lg:text-6xl">
          {{ t("teamPage.title") }}
        </h1>
        <p class="muted-copy mt-6 max-w-2xl text-base leading-8 sm:text-lg">
          {{ t("teamPage.description") }}
        </p>
      </div>
    </section>

    <section class="page-container motion-section mt-12" aria-labelledby="team-list-heading">
      <h2 id="team-list-heading" class="sr-only">{{ t("teamPage.listHeading") }}</h2>

      <div v-if="pending" class="border border-[#C0C0C0]/12 px-8 py-16 text-center text-sm text-white/55">
        {{ t("teamPage.loading") }}
      </div>

      <div
        v-else-if="errorMessage"
        class="border border-[#C0C0C0]/12 px-8 py-16 text-center text-sm text-white/70"
      >
        {{ errorMessage }}
      </div>

      <div
        v-else-if="!employees.length"
        class="border border-[#C0C0C0]/12 px-8 py-16 text-center text-sm text-white/55"
      >
        {{ t("teamPage.empty") }}
      </div>

      <ul v-else class="overflow-hidden border border-[#C0C0C0]/12 bg-[#0A0A0A]/40">
        <li
          v-for="employee in employees"
          :key="employee.id"
          class="grid gap-6 border-t border-[#C0C0C0]/[0.08] px-6 py-8 first:border-t-0 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-10 sm:px-8 lg:px-10"
        >
          <div class="aspect-[3/4] w-full max-w-[8.5rem] overflow-hidden bg-[#121212]">
            <img
              v-if="employee.photo_url"
              :src="employee.photo_url"
              :alt="displayName(employee)"
              class="h-full w-full object-cover grayscale contrast-[0.96]"
              loading="lazy"
              decoding="async"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-[#C0C0C0]/35"
            >
              {{ t("teamPage.noPhoto") }}
            </div>
          </div>

          <div class="min-w-0">
            <h3 class="font-heading text-2xl font-medium tracking-[0.02em] text-white sm:text-3xl">
              {{ displayName(employee) }}
            </h3>
            <p v-if="serviceLine(employee)" class="mt-3 text-sm leading-relaxed text-white/55">
              {{ serviceLine(employee) }}
            </p>
          </div>

          <NuxtLink
            :to="bookPath(employee.id)"
            class="inline-flex min-h-11 items-center justify-center bg-white px-6 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0] sm:justify-self-end"
          >
            {{ t("teamPage.bookCta", { name: displayName(employee) }) }}
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { StaffEmployee } from "~/types/booking";
import { isApiError } from "~/utils/api";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const api = useBookingApi();

const employees = ref<StaffEmployee[]>([]);
const pending = ref(true);
const errorMessage = ref("");

const displayName = (employee: StaffEmployee) =>
  employee.staff_name || employee.display_name || employee.name || "";

const serviceLine = (employee: StaffEmployee) =>
  (employee.services || [])
    .map((service) => service.name)
    .filter(Boolean)
    .slice(0, 4)
    .join(" · ");

const bookPath = (employeeId: number) =>
  localePath({
    path: "/online-booking",
    query: { employee: String(employeeId) },
  });

onMounted(async () => {
  pending.value = true;
  errorMessage.value = "";
  try {
    const response = await api.getTeamEmployees();
    employees.value = response.employees || [];
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : t("teamPage.error");
  } finally {
    pending.value = false;
  }
});

useHead(() => ({
  title: t("teamPage.seoTitle"),
  htmlAttrs: {
    lang: toBcp47Locale(locale.value),
  },
  meta: [
    { name: "description", content: t("teamPage.seoDescription") },
    { property: "og:title", content: t("teamPage.seoTitle") },
    { property: "og:description", content: t("teamPage.seoDescription") },
  ],
}));
</script>
