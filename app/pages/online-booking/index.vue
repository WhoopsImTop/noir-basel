<template>
  <section class="booking-shell page-container pb-24 pt-32 sm:pt-36">
    <p class="eyebrow">{{ t("nav.onlineBooking") }}</p>
    <h1 class="section-heading mt-4 text-3xl text-white sm:text-4xl">{{ t("bookingFlow.selectService.heading") }}</h1>
    <p class="muted-copy mt-4 max-w-2xl text-sm leading-relaxed">{{ t("bookingFlow.selectService.intro") }}</p>

    <p
      v-if="priceHint"
      class="mt-6 border border-[#C0C0C0]/15 bg-[#1A1A1A]/45 px-4 py-3 text-sm text-white/75"
    >
      {{ priceHint }}
    </p>

    <p v-if="errorMessage" class="mt-4 border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <div class="mt-10 flex flex-col gap-3">
      <details
        v-for="(group, index) in serviceGroups"
        :key="group.key"
        class="group border border-[#C0C0C0]/12 bg-[#0A0A0A]/60"
      >
        <summary
          class="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white marker:content-none"
        >
          <span>{{ group.label }}</span>
          <span class="text-[#C0C0C0]/50 text-xs">{{ group.services.length }}</span>
        </summary>
        <div class="border-t border-[#C0C0C0]/10 px-2 pb-2">
          <label
            v-for="service in group.services"
            :key="service.id"
            class="flex cursor-pointer items-start justify-between border-t border-[#C0C0C0]/8 px-3 py-4 first:border-t-0 duration-500 hover:bg-[#121212]/80"
          >
            <span>
              <span class="block text-base text-white">{{ service.name }}</span>
              <span class="mt-1 block text-sm text-white/58">{{ service.description }}</span>
              <span class="mt-1 block text-[10px] uppercase tracking-[0.2em] text-[#C0C0C0]/45">
                {{ service.step || "?" }} {{ t("bookingFlow.common.minutes") }}
              </span>
            </span>
            <span class="ml-4 flex items-center gap-4">
              <PriceDisplay
                :price="service.price"
                :old-price="service.old_price ?? null"
                :locale="locale"
                price-class="text-sm text-[#C0C0C0]"
                compare-class="text-xs"
              />
              <input v-model="selectedServiceIds" :value="service.id" type="checkbox" class="h-4 w-4 accent-white" />
            </span>
          </label>
        </div>
      </details>
    </div>

    <button
      type="button"
      class="mt-10 min-h-11 border border-transparent bg-white px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0] disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="selectedServiceIds.length === 0"
      @click="goToDateSelection"
    >
      {{ t("bookingFlow.selectService.nextCta") }}
    </button>
  </section>
</template>

<script setup lang="ts">
import type { Service } from "~/types/booking";
import { isApiError, toCsv } from "~/utils/api";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const api = useBookingApi();
const router = useRouter();

const services = ref<Service[]>([]);
const selectedServiceIds = ref<number[]>([]);
const errorMessage = ref("");
const priceHint = ref("");

const serviceGroups = computed(() => {
  const groups = new Map<string, { key: string; label: string; sortOrder: number; services: Service[] }>();

  for (const service of services.value) {
    const categoryId = service.category?.id ?? service.category_id ?? null;
    const key = categoryId ? `cat-${categoryId}` : "uncategorized";
    const label = service.category?.name ?? t("bookingFlow.selectService.uncategorized");
    const sortOrder = service.category?.sort_order ?? 9999;

    if (!groups.has(key)) {
      groups.set(key, { key, label, sortOrder, services: [] });
    }
    groups.get(key)!.services.push(service);
  }

  return [...groups.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((group) => ({
      ...group,
      services: [...group.services].sort((a, b) => a.price - b.price),
    }));
});

const loadData = async () => {
  errorMessage.value = "";
  try {
    const [serviceRows, settings] = await Promise.all([
      api.getServices(),
      api.getSettings(["early_bird_time", "late_booker_time"]),
    ]);
    services.value = serviceRows;
    const early = settings.early_bird_time;
    const late = settings.late_booker_time;
    if (early || late) {
      priceHint.value = t("bookingFlow.selectService.priceHint", {
        early: early || "—",
        late: late || "—",
      });
    }
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : t("bookingFlow.selectService.errorLoad");
  }
};

const goToDateSelection = async () => {
  await router.push(localePath(`/online-booking/date-${toCsv(selectedServiceIds.value)}`));
};

onMounted(loadData);

useHead(() => ({
  title: t("bookingFlow.selectService.seoTitle"),
  htmlAttrs: {
    lang: locale.value === "de" ? "de-CH" : "en-CH",
  },
  meta: [
    { name: "description", content: t("bookingFlow.selectService.seoDescription") },
    { property: "og:title", content: t("bookingFlow.selectService.seoTitle") },
    { property: "og:description", content: t("bookingFlow.selectService.seoDescription") },
  ],
}));
</script>

<style scoped>
details summary::-webkit-details-marker {
  display: none;
}
</style>