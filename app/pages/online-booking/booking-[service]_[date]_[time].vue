<template>
  <section class="booking-shell page-container pb-24 pt-32 sm:pt-36">
    <p class="eyebrow">{{ t("nav.onlineBooking") }}</p>
    <h1 class="section-heading mt-4 text-3xl text-white sm:text-4xl">{{ t("bookingFlow.customer.heading") }}</h1>
    <p class="muted-copy mt-3 text-sm">
      {{ t("bookingFlow.customer.appointmentLine", { date: formattedDate, time: time }) }}
    </p>

    <p v-if="errorMessage" class="mt-4 border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <form class="mt-8 grid max-w-2xl gap-4" @submit.prevent="submitBooking">
      <input
        v-model.trim="form.firstName"
        :placeholder="t('bookingFlow.customer.firstName')"
        class="rounded-sm border px-3 py-2.5 text-sm"
        required
      />
      <input
        v-model.trim="form.lastName"
        :placeholder="t('bookingFlow.customer.lastName')"
        class="rounded-sm border px-3 py-2.5 text-sm"
        required
      />
      <input
        v-model.trim="form.email"
        type="email"
        :placeholder="t('bookingFlow.customer.email')"
        class="rounded-sm border px-3 py-2.5 text-sm"
        required
      />
      <div class="grid grid-cols-[6.5rem_1fr] gap-2">
        <input
          v-model.trim="form.countryCode"
          :placeholder="t('bookingFlow.customer.countryCode')"
          class="rounded-sm border px-3 py-2.5 text-sm"
          required
        />
        <input
          v-model.trim="form.phone"
          :placeholder="t('bookingFlow.customer.phone')"
          class="rounded-sm border px-3 py-2.5 text-sm"
          required
        />
      </div>
      <input v-model.trim="form.birthday" type="date" class="rounded-sm border px-3 py-2.5 text-sm" />
      <input
        v-model.trim="form.instagram"
        :placeholder="t('bookingFlow.customer.instagram')"
        class="rounded-sm border px-3 py-2.5 text-sm"
      />
      <textarea
        v-model.trim="form.notes"
        rows="4"
        :placeholder="t('bookingFlow.customer.notes')"
        class="rounded-sm border px-3 py-2.5 text-sm"
      />

      <div class="mt-2 border border-[#C0C0C0]/12 bg-[#1A1A1A]/40 p-5">
        <h3 class="text-[10px] uppercase tracking-[0.22em] text-[#C0C0C0]/50">
          {{ t("bookingFlow.customer.checkoutTitle") }}
        </h3>
        <ul v-if="checkoutItems.length" class="mt-4 space-y-2 text-sm text-white/70">
          <li
            v-for="(item, index) in checkoutItems"
            :key="`${item.id ?? 'line'}-${index}`"
            class="flex justify-between gap-3"
            :class="item.price < 0 ? 'text-green-200/90' : ''"
          >
            <span>{{ item.name }}</span>
            <span v-if="item.price < 0">{{ formatPrice(item.price) }}</span>
            <PriceDisplay
              v-else
              :price="item.price"
              :old-price="item.old_price ?? null"
              :locale="locale"
              price-class="text-sm text-white/70"
              compare-class="text-xs"
            />
          </li>
        </ul>
        <p v-else-if="checkoutLoading" class="mt-4 text-sm text-white/50">{{ t("bookingFlow.customer.checkoutLoading") }}</p>

        <div class="mt-5 border-t border-[#C0C0C0]/12 pt-4">
          <p class="text-xs text-white/60 mb-2">{{ t("bookingFlow.customer.voucherLabel") }}</p>
          <div class="flex flex-wrap gap-2">
            <input
              v-model.trim="voucherCodeInput"
              type="text"
              class="min-w-0 flex-1 rounded-sm border border-[#C0C0C0]/20 bg-transparent px-3 py-2 text-sm uppercase text-white"
              :placeholder="t('bookingFlow.customer.voucherCodePlaceholder')"
            />
            <button
              type="button"
              class="border border-[#C0C0C0]/25 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white/90 hover:border-[#C0C0C0]/45 disabled:opacity-50"
              :disabled="voucherApplying || !voucherCodeInput"
              @click="applyVoucher"
            >
              {{ voucherApplying ? t("bookingFlow.customer.voucherApplying") : t("bookingFlow.customer.voucherApply") }}
            </button>
          </div>
          <p v-if="voucherMessage" class="mt-2 text-xs" :class="voucherValid ? 'text-green-200/90' : 'text-red-200/90'">
            {{ voucherMessage }}
          </p>
          <button
            v-if="appliedVoucherCode"
            type="button"
            class="mt-2 text-xs text-[#C0C0C0]/70 underline"
            @click="clearVoucher"
          >
            {{ t("bookingFlow.customer.voucherRemove") }}
          </button>
        </div>

        <div v-if="checkoutSubtotal != null" class="mt-4 space-y-1 text-sm text-white/80">
          <p class="flex justify-between">
            <span>{{ t("bookingFlow.customer.checkoutSubtotal") }}</span>
            <span>{{ formatPrice(checkoutSubtotal) }}</span>
          </p>
          <p v-if="checkoutDiscount > 0" class="flex justify-between text-green-200/90">
            <span>{{ t("bookingFlow.customer.checkoutDiscount") }}</span>
            <span>−{{ formatPrice(checkoutDiscount) }}</span>
          </p>
          <p class="flex justify-between font-medium text-white">
            <span>{{ t("bookingFlow.customer.checkoutTotal") }}</span>
            <span>{{ formatPrice(checkoutTotal) }}</span>
          </p>
        </div>
      </div>

      <label class="mt-2 flex items-start gap-2 text-sm text-white/75">
        <input v-model="form.acceptedLegal" type="checkbox" class="mt-1 h-4 w-4 accent-white" />
        <span>{{ t("bookingFlow.customer.legalCheckbox") }}</span>
      </label>

      <button
        type="submit"
        class="mt-4 min-h-11 border border-transparent bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] duration-500 hover:bg-[#C0C0C0] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? t("bookingFlow.customer.submitting") : t("bookingFlow.customer.submit") }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { CheckoutItem } from "~/types/booking";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { isApiError, parseCsvNumbers } from "~/utils/api";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const api = useBookingApi();
const router = useRouter();
const route = useRoute();

const serviceIds = computed(() => parseCsvNumbers(String(route.params.service || "")));
const date = computed(() => String(route.params.date || ""));
const time = computed(() => String(route.params.time || ""));
const formattedDate = computed(() => {
  const value = date.value;
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  const loc = locale.value === "de" ? "de-CH" : "en-CH";
  return new Intl.DateTimeFormat(loc, { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
});

const isSubmitting = ref(false);
const errorMessage = ref("");
const checkoutLoading = ref(true);
const checkoutItems = ref<CheckoutItem[]>([]);
const checkoutSubtotal = ref<number | null>(null);
const checkoutDiscount = ref(0);
const checkoutTotal = ref(0);
const voucherCodeInput = ref("");
const appliedVoucherCode = ref("");
const voucherApplying = ref(false);
const voucherMessage = ref("");
const voucherValid = ref(false);

const numberLocale = computed(() => (locale.value === "de" ? "de-CH" : "en-CH"));

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+41",
  phone: "",
  birthday: "",
  instagram: "",
  notes: "",
  acceptedLegal: false,
});

const formatPrice = (price: number) =>
  new Intl.NumberFormat(numberLocale.value, { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(price);

const applyCheckoutResponse = (response: {
  items: CheckoutItem[];
  subtotal?: number;
  discount?: number;
  total?: number;
}) => {
  checkoutItems.value = response.items ?? [];
  checkoutSubtotal.value =
    response.subtotal ??
    checkoutItems.value.filter((i) => (i.price ?? 0) >= 0).reduce((s, i) => s + (i.price || 0), 0);
  checkoutDiscount.value = response.discount ?? 0;
  checkoutTotal.value =
    response.total ?? checkoutItems.value.reduce((sum, item) => sum + (item.price || 0), 0);
};

const loadCheckout = async () => {
  checkoutLoading.value = true;
  try {
    const response = await api.getCheckout(serviceIds.value, date.value, time.value, {
      voucherCode: appliedVoucherCode.value || undefined,
      email: form.email || undefined,
    });
    applyCheckoutResponse(response);
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : t("bookingFlow.customer.errorCheckout");
  } finally {
    checkoutLoading.value = false;
  }
};

const applyVoucher = async () => {
  if (!isEmailValid(form.email)) {
    voucherMessage.value = t("bookingFlow.customer.voucherNeedEmail");
    voucherValid.value = false;
    return;
  }
  voucherApplying.value = true;
  voucherMessage.value = "";
  voucherValid.value = false;
  try {
    const result = await api.validateVoucher({
      code: voucherCodeInput.value,
      email: form.email,
      service_ids: serviceIds.value,
      date: date.value,
      time: time.value,
    });
    appliedVoucherCode.value = result.code;
    voucherCodeInput.value = result.code;
    voucherValid.value = true;
    voucherMessage.value = t("bookingFlow.customer.voucherSuccess", { name: result.voucher_name });
    applyCheckoutResponse(result);
  } catch (error) {
    appliedVoucherCode.value = "";
    voucherMessage.value = isApiError(error) ? error.message : t("bookingFlow.customer.voucherInvalid");
    await loadCheckout();
  } finally {
    voucherApplying.value = false;
  }
};

const clearVoucher = async () => {
  appliedVoucherCode.value = "";
  voucherCodeInput.value = "";
  voucherMessage.value = "";
  voucherValid.value = false;
  await loadCheckout();
};

const isEmailValid = (email: string) => email.includes("@") && email.includes(".");

const validateMobilePhone = () => {
  const parsed = parsePhoneNumberFromString(`${form.countryCode}${form.phone}`.replace(/\s+/g, ""));
  if (!parsed?.isValid() || parsed.getType() !== "MOBILE") return null;
  return parsed.number;
};

const submitBooking = async () => {
  errorMessage.value = "";
  if (!form.acceptedLegal) {
    errorMessage.value = t("bookingFlow.customer.errorLegal");
    return;
  }
  if (!isEmailValid(form.email)) {
    errorMessage.value = t("bookingFlow.customer.errorEmail");
    return;
  }
  const normalizedPhone = validateMobilePhone();
  if (!normalizedPhone) {
    errorMessage.value = t("bookingFlow.customer.errorPhone");
    return;
  }

  isSubmitting.value = true;
  try {
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const booking = await api.createAppointment({
      service_ids: serviceIds.value,
      date: date.value,
      time: time.value,
      phone: normalizedPhone,
      email: form.email,
      name: fullName,
      instagram: form.instagram || undefined,
      birthday: form.birthday || undefined,
      notes: form.notes || undefined,
      voucher_code: appliedVoucherCode.value || undefined,
    });
    const bookingForSuccess = {
      ...booking,
      name: booking?.name || booking?.customer?.name || fullName,
      date: booking?.date || date.value,
      time: booking?.time || time.value,
    };
    localStorage.setItem("booking", JSON.stringify(bookingForSuccess));
    await router.push(localePath("/online-booking/success"));
  } catch (error) {
    if (isApiError(error) && error.status === 422) {
      errorMessage.value = error.message;
      return;
    }
    errorMessage.value = isApiError(error) ? error.message : t("bookingFlow.customer.errorBooking");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(loadCheckout);

useHead(() => ({
  title: t("bookingFlow.customer.seoTitle"),
  htmlAttrs: {
    lang: locale.value === "de" ? "de-CH" : "en-CH",
  },
  meta: [
    { name: "description", content: t("bookingFlow.customer.seoDescription") },
    { property: "og:title", content: t("bookingFlow.customer.seoTitle") },
    { property: "og:description", content: t("bookingFlow.customer.seoDescription") },
  ],
}));
</script>