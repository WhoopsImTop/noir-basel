<template>
  <span class="inline-flex flex-wrap items-baseline justify-end gap-2 tabular-nums" :class="wrapperClass">
    <span
      v-if="showSale"
      class="text-white/40 line-through"
      :class="compareClass"
    >
      {{ formattedCompareAt }}
    </span>
    <span :class="priceClass">{{ formattedPrice }}</span>
  </span>
</template>

<script setup>
import { formatChfPrice, getCompareAtPrice, hasSalePrice } from "~/utils/price";

const props = defineProps({
  price: { type: Number, required: true },
  oldPrice: { type: Number, default: null },
  locale: { type: String, default: "de" },
  wrapperClass: { type: String, default: "" },
  priceClass: { type: String, default: "" },
  compareClass: { type: String, default: "text-sm" },
});

const showSale = computed(() =>
  hasSalePrice({ price: props.price, old_price: props.oldPrice }),
);

const formattedPrice = computed(() => formatChfPrice(props.price, props.locale));

const formattedCompareAt = computed(() => {
  const compareAt = getCompareAtPrice({ old_price: props.oldPrice });
  return compareAt !== null ? formatChfPrice(compareAt, props.locale) : "";
});
</script>
