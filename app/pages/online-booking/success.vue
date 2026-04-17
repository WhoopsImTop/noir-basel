<template>
  <section class="page-container pb-16 pt-32 text-white">
    <h1 class="text-3xl font-semibold uppercase tracking-[0.1em]">Buchung erfolgreich</h1>
    <p class="mt-4 text-white/75">Vielen Dank. Dein Termin wurde gespeichert.</p>

    <div v-if="booking" class="mt-6 rounded-sm border border-white/12 p-4">
      <p><strong>Name:</strong> {{ displayName }}</p>
      <p><strong>Datum:</strong> {{ displayDate }}</p>
      <p><strong>Zeit:</strong> {{ displayTime }}</p>
      <p><strong>Standort:</strong> Noir Basel</p>
    </div>

    <NuxtLink to="/" class="mt-8 inline-block rounded-sm bg-white px-5 py-3 text-sm uppercase tracking-[0.12em] text-black">
      Zur Startseite
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
import type { Appointment } from "~/types/booking";

const booking = ref<Appointment | null>(null);
const displayName = computed(() => booking.value?.name || booking.value?.customer?.name || "-");
const displayDate = computed(() => {
  const value = booking.value?.date;
  if (!value) return "-";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("de-CH", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
});
const displayTime = computed(() => booking.value?.time || "-");

onMounted(() => {
  const raw = localStorage.getItem("booking");
  if (raw) booking.value = JSON.parse(raw);
});

onBeforeUnmount(() => {
  localStorage.removeItem("booking");
});
</script>
