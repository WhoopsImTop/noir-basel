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
      await router.push(localePath(`/online-booking/date-${route.params.service}`));
      return;
    }
    errorMessage.value = isApiError(error) ? error.message : t("bookingFlow.customer.errorBooking");
  } finally {
    isSubmitting.value = false;
  }
};

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
