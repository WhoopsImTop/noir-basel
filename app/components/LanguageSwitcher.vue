<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 border border-[#C0C0C0]/15 duration-500 hover:border-[#C0C0C0]/30"
      :class="[
        variant === 'mobile' ? 'w-full justify-between px-4 py-2.5' : 'px-3 py-1.5',
      ]"
      :aria-label="t('common.language')"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="flex items-center gap-2">
        <img
          src="/globe.svg"
          alt=""
          aria-hidden="true"
          class="shrink-0 opacity-80"
          :class="variant === 'mobile' ? 'h-4 w-4' : 'h-3.5 w-3.5'"
        />
        <span
          class="tracking-[0.22em] text-[#C0C0C0]/80"
          :class="variant === 'mobile' ? 'text-xs' : 'text-[10px]'"
        >
          {{ activeLabel }}
        </span>
      </span>
      <span
        class="shrink-0 text-[10px] text-neutral-500 transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
        aria-hidden="true"
      >
        ▼
      </span>
    </button>

    <transition :name="variant === 'mobile' ? 'lang-inline' : 'lang-dropdown'">
      <ul
        v-if="isOpen"
        role="listbox"
        :aria-label="t('common.language')"
        class="border border-[#C0C0C0]/15 bg-[#0A0A0A] shadow-lg"
        :class="
          variant === 'mobile'
            ? 'mt-2 flex flex-col'
            : 'absolute right-0 top-full z-50 mt-1 min-w-full'
        "
      >
        <li
          v-for="option in languageOptions"
          :key="option.code"
          role="option"
          :aria-selected="locale === option.code"
        >
          <button
            type="button"
            class="w-full px-4 py-2 text-left tracking-[0.18em] duration-500"
            :class="[
              variant === 'mobile' ? 'text-xs' : 'text-[10px]',
              locale === option.code
                ? 'bg-white text-[#0A0A0A]'
                : 'text-[#C0C0C0]/80 hover:bg-[#1A1A1A] hover:text-white',
            ]"
            @click="switchLanguage(option.code)"
          >
            {{ option.label }}
          </button>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: "compact",
  },
});

const { locale, locales, setLocale, t } = useI18n();

const isOpen = ref(false);
const rootRef = ref(null);

const languageOptions = computed(() =>
  locales.value.map((entry) => ({
    code: entry.code,
    label: entry.code.toUpperCase(),
  })),
);

const activeLabel = computed(
  () => languageOptions.value.find((option) => option.code === locale.value)?.label ?? locale.value.toUpperCase(),
);

const switchLanguage = async (code) => {
  if (locale.value === code) {
    isOpen.value = false;
    return;
  }
  await setLocale(code);
  isOpen.value = false;
};

const onDocumentClick = (event) => {
  if (!rootRef.value?.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
});

watch(
  () => locale.value,
  () => {
    isOpen.value = false;
  },
);
</script>

<style scoped>
.lang-dropdown-enter-active,
.lang-dropdown-leave-active,
.lang-inline-enter-active,
.lang-inline-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.lang-dropdown-enter-from,
.lang-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.lang-inline-enter-from,
.lang-inline-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
