<template>
  <section class="page-container pb-16 pt-32 text-white">
    <h1 class="text-3xl font-semibold uppercase tracking-[0.1em]">Online-Buchung: Kundendaten</h1>
    <p class="mt-3 text-white/70">Termin: {{ formattedDate }} um {{ time }}</p>

    <p v-if="errorMessage" class="mt-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>

    <form class="mt-8 grid max-w-2xl gap-4" @submit.prevent="submitBooking">
      <input v-model.trim="form.firstName" placeholder="Vorname*" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" required />
      <input v-model.trim="form.lastName" placeholder="Nachname*" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" required />
      <input v-model.trim="form.email" type="email" placeholder="E-Mail*" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" required />
      <div class="grid grid-cols-[7rem_1fr] gap-2">
        <input v-model.trim="form.countryCode" placeholder="+41" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" required />
        <input v-model.trim="form.phone" placeholder="Mobilnummer*" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" required />
      </div>
      <input v-model.trim="form.birthday" type="date" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" />
      <input v-model.trim="form.instagram" placeholder="Instagram (optional)" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" />
      <textarea v-model.trim="form.notes" rows="4" placeholder="Nachricht (optional)" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" />

      <label class="mt-2 flex items-start gap-2 text-sm text-white/80">
        <input v-model="form.acceptedLegal" type="checkbox" class="mt-1 h-4 w-4 accent-white" />
        <span>Ich akzeptiere AGB und Datenschutzerklärung.</span>
      </label>

      <button
        type="submit"
        class="mt-4 rounded-sm bg-white px-5 py-3 text-sm font-medium uppercase tracking-[0.15em] text-black disabled:cursor-not-allowed disabled:opacity-65"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Buchung läuft..." : "Verbindlich buchen" }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { isApiError, parseCsvNumbers } from "~/utils/api";

const api = useBookingApi();
const router = useRouter();
const route = useRoute();

const serviceIds = computed(() => parseCsvNumbers(String(route.params.service || "")));
const date = computed(() => String(route.params.date || ""));
const time = computed(() => String(route.params.time || ""));
const formattedDate = computed(() => {
  const value = date.value;
  if (!value) return "-";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("de-CH", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
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
    errorMessage.value = "Bitte AGB/Datenschutz akzeptieren.";
    return;
  }
  if (!isEmailValid(form.email)) {
    errorMessage.value = "Bitte gültige E-Mail angeben.";
    return;
  }
  const normalizedPhone = validateMobilePhone();
  if (!normalizedPhone) {
    errorMessage.value = "Bitte eine gültige Mobilnummer angeben.";
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
    await router.push("/online-booking/success");
  } catch (error) {
    if (isApiError(error) && error.status === 422) {
      errorMessage.value = error.message;
      await router.push(`/online-booking/date-${route.params.service}`);
      return;
    }
    errorMessage.value = isApiError(error) ? error.message : "Buchung fehlgeschlagen.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>
