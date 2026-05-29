<template>
  <section class="booking-shell px-4 mx-auto max-w-[700px] pb-16 pt-32 sm:pt-36 md:pb-20 md:pt-40">
    <p v-if="errorMessage" class="mb-4  border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <div class="border border-neutral-800 bg-[#0A0A0A]/85 p-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold text-neutral-200">{{ t("bookingFlow.selectService.heading") }}</h2>
      </div>
      <p class="mt-2 text-sm text-neutral-400">{{ t("bookingFlow.selectService.intro") }}</p>
      <hr class="mt-3 mb-4 border-neutral-800" />

      <div v-if="services.length > 0" class="mt-2 flex flex-col gap-2">
        <details v-for="group in serviceGroups" :key="group.key" class=" border border-neutral-800 bg-[#0A0A0A]/85/35">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-neutral-200 marker:content-none">
            <span>{{ group.label }}</span>
            <span class="tabular-nums text-[11px] text-neutral-500">{{ group.services.length }}</span>
          </summary>
          <div class="border-t border-neutral-800 px-2 pb-2">
            <div v-for="(service, index) in group.services" :key="service.id" class="flex flex-col" :class="index !== 0 ? 'border-t border-neutral-800/80 py-4' : 'pb-3 pt-1'">
              <label class="flex cursor-pointer items-center justify-between gap-3 px-2 py-3 hover:bg-[#0A0A0A]/85/80">
                <div class="flex min-w-0 flex-1 items-start gap-4">
                  <input v-model="selectedServiceIds" type="checkbox" class="mt-1 h-4 w-4 shrink-0 accent-gold-600" :value="service.id" />
                  <div class="min-w-0">
                    <h3 class="text-base font-semibold text-neutral-100">{{ service.name }}</h3>
                    <p class="text-sm text-neutral-400">{{ service.description }}</p>
                    <span class="mt-1 block text-xs text-neutral-500">
                      {{ service.step || "?" }} {{ t("bookingFlow.common.minutes") }}
                    </span>
                  </div>
                </div>
                <div class="flex shrink-0 flex-col items-end gap-1">
                  <PriceDisplay :price="service.price" :old-price="service.old_price ?? undefined" :locale="locale" price-class="text-sm text-neutral-200" compare-class="text-xs text-neutral-400" />
                </div>
              </label>
            </div>
          </div>
        </details>
      </div>
      <div v-else class="mt-4 flex flex-col items-center justify-center py-8 text-center">
        <img src="/loading.svg" alt="" class="h-8 w-8 animate-spin" width="32" height="32" />
        <p class="mt-4 text-sm text-neutral-400">{{ t("bookingFlow.selectService.loadingData") }}</p>
      </div>

      <hr class="my-4 border-neutral-800" />
      <p v-if="priceHint" class="text-sm text-neutral-400">{{ priceHint }}</p>
      <p class="text-sm text-neutral-400" :class="priceHint ? 'mt-3' : ''">{{ t("bookingFlow.selectService.disclaimer") }}</p>
      <button type="button" id="booking-step1-next" :disabled="selectedServiceIds.length === 0" :class="selectedServiceIds.length === 0
          ? 'mt-4 block w-full cursor-not-allowed  bg-neutral-600 px-4 py-2.5 text-sm font-medium text-neutral-200'
          : 'mt-4 block w-full  bg-gold-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-500'
        " @click="goToDateSelection">
        {{ t("bookingFlow.selectService.nextCta") }}
      </button>
    </div>

    <div class="mt-4  border border-neutral-800 bg-[#0A0A0A]/85 p-4">
      <h2 class="text-lg font-semibold text-neutral-200">{{ t("bookingFlow.selectService.infoTitle") }}</h2>
      <hr class="mt-2 mb-4 border-neutral-800" />
      <p class="text-sm text-neutral-400">{{ t("bookingFlow.selectService.infoText") }}</p>
    </div>
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
    } else {
      priceHint.value = "";
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
details>summary {
  list-style: none;
}

details summary::-webkit-details-marker {
  display: none;
}
</style>
