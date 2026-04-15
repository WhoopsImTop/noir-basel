<template>
  <div
    class="fixed top-2 left-1/2 right-1/2 -translate-x-1/2 rounded-full w-full max-w-[1000px] py-4 px-2 bg-neutral-100 border border-neutral-900/10 flex items-center z-20"
  >
    <div class="mx-auto px-4 flex items-center justify-between w-full">
      <nuxt-link :to="'/'" class="block">
        <noir-basel-logo class="text-neutral-700 h-10"/>
      </nuxt-link>
      <div class="lg:hidden" @click="toggleBurgerMenu">
        <img src="/burger-menu.svg" alt="Menu" title="Menu" class="h-6" />
      </div>
      <ul
        :class="
          !burgerState
            ? 'hidden'
            : 'fixed top-16 left-0 w-screen h-[calc(100vh-64px)] right-0 bg-neutral-900 flex flex-col items-center justify-center'
        "
        class="lg:flex items-center gap-8"
      >
        <li>
          <nuxt-link to="/preise" class="text-neutral-800"> Preise </nuxt-link>
        </li>
        <li>
          <nuxt-link
            :to="'/online-booking'"
            class="text-neutral-800 flex items-center bg-gold-600 px-4 py-1.5 rounded-full"
            >Termin anfragen
            <img
              src="/arrow-left-external.svg"
              title="externer Link"
              class="ml-1"
            />
          </nuxt-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { ref, watch } from "vue";

const burgerState = ref(false);

const toggleBurgerMenu = () => {
  burgerState.value = !burgerState.value;
};

//on route change, close burger menu
const route = useRoute();
watch(route, () => {
  burgerState.value = false;
});
</script>

<style></style>
