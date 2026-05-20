<template>
  <div class="my-4 flex flex-col bg-neutral-800 rounded p-4 gap-4">
    <label class="flex flex-col text-neutral-200 text-sm">
      Code
      <input
        v-model="form.code"
        type="text"
        class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2 uppercase"
        placeholder="z. B. NOIR20"
      />
    </label>
    <label class="flex flex-col text-neutral-200 text-sm">
      Bezeichnung (intern)
      <input
        v-model="form.name"
        type="text"
        class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
      />
    </label>
    <label class="flex flex-col text-neutral-200 text-sm">
      Typ
      <select v-model="form.type" class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2">
        <option value="percent">Prozent</option>
        <option value="fixed">Fixbetrag (CHF)</option>
      </select>
    </label>
    <label class="flex flex-col text-neutral-200 text-sm">
      Wert
      <input
        v-model.number="form.value"
        type="number"
        min="0"
        step="0.01"
        class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
      />
    </label>
    <label v-if="form.type === 'percent'" class="flex flex-col text-neutral-200 text-sm">
      Max. Rabatt (CHF, optional)
      <input
        v-model.number="form.max_discount"
        type="number"
        min="0"
        class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
      />
    </label>
    <label class="flex flex-col text-neutral-200 text-sm">
      Mindestwarenkorb (CHF, optional)
      <input
        v-model.number="form.min_cart_total"
        type="number"
        min="0"
        class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
      />
    </label>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label class="flex flex-col text-neutral-200 text-sm">
        Gültig ab
        <input
          v-model="form.valid_from"
          type="date"
          class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
        />
      </label>
      <label class="flex flex-col text-neutral-200 text-sm">
        Gültig bis
        <input
          v-model="form.valid_until"
          type="date"
          class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
        />
      </label>
    </div>
    <label class="flex flex-col text-neutral-200 text-sm">
      Max. Einlösungen gesamt (optional)
      <input
        v-model.number="form.max_redemptions_total"
        type="number"
        min="1"
        class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
      />
    </label>
    <label class="flex flex-col text-neutral-200 text-sm">
      Max. Einlösungen pro Kunde (optional)
      <input
        v-model.number="form.max_redemptions_per_customer"
        type="number"
        min="1"
        class="border bg-neutral-800 border-neutral-700 rounded p-2 mt-2"
      />
    </label>
    <div class="flex flex-col text-neutral-200 text-sm">
      <span class="mb-2">Nur für Leistungen (leer = alle)</span>
      <div class="max-h-40 overflow-y-auto flex flex-col gap-1">
        <label
          v-for="service in services"
          :key="service.id"
          class="flex items-center gap-2 text-xs cursor-pointer"
        >
          <input
            type="checkbox"
            :value="service.id"
            :checked="form.service_ids.includes(service.id)"
            @change="toggleService(service.id)"
          />
          {{ service.name }}
        </label>
      </div>
    </div>
    <label class="flex items-center gap-2 text-neutral-200 text-sm">
      <input v-model="form.is_active" type="checkbox" class="h-4 w-4" />
      Aktiv
    </label>
    <button
      class="bg-gold-600 text-white px-4 py-2 block w-full rounded mt-2 text-xs"
      :disabled="saving"
      @click="save"
    >
      {{ saving ? "Speichern…" : "Speichern" }}
    </button>
  </div>
</template>

<script setup>
import { isApiError } from "~/utils/api";

const props = defineProps({
  initial: { type: Object, default: null },
});
const emit = defineEmits(["saved"]);

const api = useBookingApi();
const saving = ref(false);
const services = ref([]);

const emptyForm = () => ({
  code: "",
  name: "",
  type: "percent",
  value: 10,
  min_cart_total: null,
  max_discount: null,
  valid_from: "",
  valid_until: "",
  max_redemptions_total: null,
  max_redemptions_per_customer: null,
  service_ids: [],
  is_active: true,
});

const form = ref(emptyForm());

const applyInitial = (v) => {
  if (!v) {
    form.value = emptyForm();
    return;
  }
  form.value = {
    code: v.code ?? "",
    name: v.name ?? "",
    type: v.type ?? "percent",
    value: Number(v.value) ?? 0,
    min_cart_total: v.min_cart_total ?? null,
    max_discount: v.max_discount ?? null,
    valid_from: v.valid_from ? String(v.valid_from).slice(0, 10) : "",
    valid_until: v.valid_until ? String(v.valid_until).slice(0, 10) : "",
    max_redemptions_total: v.max_redemptions_total ?? null,
    max_redemptions_per_customer: v.max_redemptions_per_customer ?? null,
    service_ids: Array.isArray(v.service_ids) ? [...v.service_ids] : [],
    is_active: v.is_active !== false,
  };
};

watch(
  () => props.initial,
  (v) => applyInitial(v),
  { immediate: true },
);

const toggleService = (id) => {
  const ids = form.value.service_ids;
  const idx = ids.indexOf(id);
  if (idx >= 0) {
    ids.splice(idx, 1);
  } else {
    ids.push(id);
  }
};

const toNullableNumber = (value) => {
  if (value === "" || value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }
  return Number(value);
};

const buildPayload = () => ({
  code: String(form.value.code || "").trim(),
  name: String(form.value.name || "").trim(),
  type: form.value.type,
  value: Number(form.value.value) || 0,
  min_cart_total: toNullableNumber(form.value.min_cart_total),
  max_discount: form.value.type === "percent" ? toNullableNumber(form.value.max_discount) : null,
  valid_from: form.value.valid_from || null,
  valid_until: form.value.valid_until || null,
  max_redemptions_total: toNullableNumber(form.value.max_redemptions_total),
  max_redemptions_per_customer: toNullableNumber(form.value.max_redemptions_per_customer),
  service_ids: form.value.service_ids?.length ? [...form.value.service_ids] : null,
  is_active: Boolean(form.value.is_active),
});

const save = async () => {
  if (!form.value.code?.trim() || !form.value.name?.trim()) {
    alert("Bitte Code und Bezeichnung ausfüllen.");
    return;
  }
  saving.value = true;
  try {
    const payload = buildPayload();
    if (props.initial?.id) {
      await api.updateVoucher(props.initial.id, payload);
    } else {
      await api.createVoucher(payload);
    }
    emit("saved");
  } catch (error) {
    const message = isApiError(error) ? error.message : "Gutschein konnte nicht gespeichert werden";
    alert(message);
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  services.value = await api.getServices(true);
});
</script>
