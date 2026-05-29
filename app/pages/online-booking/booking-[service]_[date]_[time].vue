<template>
  <section class="booking-shell px-4 mx-auto max-w-[700px] pb-16 pt-32 sm:pt-36 md:pb-20 md:pt-40">
    <p v-if="errorMessage" class="mb-4 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <div class="border border-neutral-800 bg-[#0A0A0A]/85 p-4">
      <div class="flex w-full flex-row items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-lg font-semibold text-neutral-100">{{ t("bookingFlow.customer.stepCardTitle") }}</h2>
          <p class="mt-1 text-sm text-neutral-400">
            {{ t("bookingFlow.customer.appointmentLine", { date: formattedDate, time: time }) }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 -full bg-neutral-700 p-1.5 hover:bg-neutral-600"
          :aria-label="t('bookingFlow.customer.backToDate')"
          @click="goBackToDate"
        >
          <img src="/arrow-left.svg" alt="" width="18" height="18" />
        </button>
      </div>

      <hr class="my-3 border-neutral-800" />

      <form class="grid grid-cols-1 gap-4" @submit.prevent="submitBooking">
        <div class="flex flex-col items-stretch gap-4 md:flex-row">
          <label class="w-full md:w-1/2" for="booking-first-name">
            <span class="text-sm text-neutral-100">{{ t("bookingFlow.customer.firstName") }}</span>
            <input
              id="booking-first-name"
              v-model.trim="form.firstName"
              type="text"
              name="given-name"
              autocomplete="given-name"
              class="mt-1 w-full  border border-neutral-800 bg-[#0A0A0A]/85 p-2 text-sm text-neutral-100"
              required
            />
          </label>
          <label class="w-full md:w-1/2" for="booking-last-name">
            <span class="text-sm text-neutral-100">{{ t("bookingFlow.customer.lastName") }}</span>
            <input
              id="booking-last-name"
              v-model.trim="form.lastName"
              type="text"
              name="family-name"
              autocomplete="family-name"
              class="mt-1 w-full  border border-neutral-800 bg-[#0A0A0A]/85 p-2 text-sm text-neutral-100"
              required
            />
          </label>
        </div>

        <div class="flex flex-col items-stretch gap-4 md:flex-row">
          <label class="w-full md:w-1/2" for="booking-email">
            <span class="text-sm text-neutral-100">{{ t("bookingFlow.customer.email") }}</span>
            <input
              id="booking-email"
              v-model.trim="form.email"
              type="email"
              name="email"
              autocomplete="email"
              class="mt-1 w-full  border border-neutral-800 bg-[#0A0A0A]/85 p-2 text-sm text-neutral-100"
              required
            />
            <span
              v-if="form.email && !isEmailValid(form.email)"
              class="mt-1 inline-block  bg-red-900/80 px-2 py-1 text-xs text-red-200"
            >
              {{ t("bookingFlow.customer.emailInvalidHint") }}
            </span>
          </label>
          <div class="w-full md:w-1/2">
            <span class="text-sm text-neutral-100">{{ t("bookingFlow.customer.phone") }}</span>
            <div class="mt-1 grid grid-cols-8 gap-2">
              <select
                v-model="form.countryCode"
                class="col-span-2  border border-neutral-800 bg-[#0A0A0A]/85 p-2 text-sm text-neutral-100"
              >
                <option value="+41">+41</option>
                <option value="+49">+49</option>
                <option value="+33">+33</option>
                <option value="+43">+43</option>
              </select>
              <input
                v-model.trim="form.phone"
                type="tel"
                name="phone"
                autocomplete="tel-national"
                class="col-span-6 w-full  border border-neutral-800 bg-[#0A0A0A]/85 p-2 text-sm text-neutral-100"
                required
              />
            </div>
            <span
              v-if="form.phone && !normalizedPhonePreview"
              class="mt-1 inline-block  bg-red-900/80 px-2 py-1 text-xs text-red-200"
            >
              {{ t("bookingFlow.customer.phoneInvalidHint") }}
            </span>
          </div>
        </div>

        <div class="flex flex-col items-stretch gap-4 md:flex-row">
          <label class="w-full md:w-1/2" for="booking-birthday">
            <span class="text-sm text-neutral-100">{{ t("bookingFlow.customer.birthday") }}</span>
            <input
              id="booking-birthday"
              v-model.trim="form.birthday"
              type="date"
              class="mt-1 w-full  border border-neutral-800 bg-[#0A0A0A]/85 p-2 text-sm text-neutral-100"
            />
          </label>
          <label class="w-full md:w-1/2" for="booking-instagram">
            <span class="text-sm text-neutral-100">{{ t("bookingFlow.customer.instagram") }}</span>
            <input
              id="booking-instagram"
              v-model.trim="form.instagram"
              type="text"
              class="mt-1 w-full  border border-neutral-800 bg-[#0A0A0A]/85 p-2 text-sm text-neutral-100"
            />
          </label>
        </div>

        <label for="booking-notes">
          <span class="text-sm text-neutral-100">{{ t("bookingFlow.customer.notes") }}</span>
          <textarea
            id="booking-notes"
            v-model.trim="form.notes"
            rows="4"
            class="mt-1 w-full  border border-neutral-800 bg-[#0A0A0A]/85 p-2 text-sm text-neutral-100"
          />
        </label>

        <div class=" border border-neutral-800 bg-neutral-900/40 p-4">
          <h3 class="text-sm font-semibold text-neutral-200">{{ t("bookingFlow.customer.checkoutTitle") }}</h3>
          <ul v-if="checkoutItems.length && !checkoutLoading" class="mt-3 flex flex-col gap-2">
            <li
              v-for="(item, index) in checkoutItems"
              :key="`${item.id ?? 'line'}-${index}`"
              class="flex justify-between gap-3 text-xs text-neutral-200"
              :class="item.price < 0 ? 'text-green-300' : ''"
            >
              <span class="min-w-0 flex-1">{{ item.name }}</span>
              <span v-if="item.price < 0" class="shrink-0">{{ formatPrice(item.price) }}</span>
              <PriceDisplay
                v-else
                :price="item.price"
                :old-price="item.old_price ?? undefined"
                :locale="locale"
                price-class="text-xs text-neutral-200"
                compare-class="text-[10px] text-neutral-400"
              />
            </li>
          </ul>
          <p v-else-if="checkoutLoading" class="mt-3 text-sm text-neutral-400">{{ t("bookingFlow.customer.checkoutLoading") }}</p>

          <div class="mt-4 border-t border-neutral-800 pt-4">
            <p class="mb-2 text-xs text-neutral-400">{{ t("bookingFlow.customer.voucherLabel") }}</p>
            <div class="flex flex-wrap gap-2">
              <input
                v-model.trim="voucherCodeInput"
                type="text"
                class="min-w-0 flex-1  border border-neutral-800 bg-[#0A0A0A]/85 px-3 py-2 text-sm uppercase text-neutral-100"
                :placeholder="t('bookingFlow.customer.voucherCodePlaceholder')"
              />
              <button
                type="button"
                class=" border border-neutral-500 px-4 py-2 text-xs font-medium uppercase tracking-wide text-neutral-100 hover:bg-neutral-700 disabled:opacity-50"
                :disabled="voucherApplying || !voucherCodeInput"
                @click="applyVoucher"
              >
                {{ voucherApplying ? t("bookingFlow.customer.voucherApplying") : t("bookingFlow.customer.voucherApply") }}
              </button>
            </div>
            <p v-if="voucherMessage" class="mt-2 text-xs" :class="voucherValid ? 'text-green-300' : 'text-red-300'">
              {{ voucherMessage }}
            </p>
            <button
              v-if="appliedVoucherCode"
              type="button"
              class="mt-2 text-xs text-neutral-400 underline hover:text-neutral-200"
              @click="clearVoucher"
            >
              {{ t("bookingFlow.customer.voucherRemove") }}
            </button>
          </div>

          <div v-if="checkoutSubtotal != null && !checkoutLoading" class="mt-4 space-y-1 text-sm text-neutral-200">
            <p class="flex justify-between">
              <span>{{ t("bookingFlow.customer.checkoutSubtotal") }}</span>
              <span>{{ formatPrice(checkoutSubtotal) }}</span>
            </p>
            <p v-if="checkoutDiscount > 0" class="flex justify-between text-green-300">
              <span>{{ t("bookingFlow.customer.checkoutDiscount") }}</span>
              <span>−{{ formatPrice(checkoutDiscount) }}</span>
            </p>
            <p class="flex justify-between font-medium text-neutral-50">
              <span>{{ t("bookingFlow.customer.checkoutTotal") }}</span>
              <span>{{ formatPrice(checkoutTotal) }}</span>
            </p>
          </div>
        </div>

        <label class="flex items-start gap-2" for="booking-legal">
          <input id="booking-legal" v-model="form.acceptedLegal" type="checkbox" class="mt-1 border-neutral-800 accent-gold-600" />
          <span class="text-xs text-neutral-400">{{ t("bookingFlow.customer.legalCheckbox") }}</span>
        </label>

        <p class="text-xs text-neutral-500">* {{ t("bookingFlow.customer.requiredFieldsNote") }}</p>
        <p class="text-sm text-neutral-400">{{ t("bookingFlow.customer.disclaimer") }}</p>

        <hr class="border-neutral-800" />

        <button
          type="submit"
          class="block w-full  bg-gold-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? t("bookingFlow.customer.submitting") : t("bookingFlow.customer.submit") }}
        </button>
      </form>
    </div>
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

const normalizedPhonePreview = computed(() => {
  const parsed = parsePhoneNumberFromString(`${form.countryCode}${form.phone}`.replace(/\s+/g, ""));
  if (!parsed?.isValid() || parsed.getType() !== "MOBILE") return null;
  return parsed.number;
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

const goBackToDate = async () => {
  await router.push(localePath(`/online-booking/date-${route.params.service}`));
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

onMounted(() => {
  const country = typeof localStorage !== "undefined" ? localStorage.getItem("country") : null;
  if (country === "ch") form.countryCode = "+41";
  else if (country === "de") form.countryCode = "+49";
  loadCheckout();
});

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
