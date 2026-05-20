<template>
  <div class="container mx-auto p-4 min-h-screen mb-16">
    <div class="w-full">
      <div class="flex items-center justify-between">
        <h2 class="text-md font-medium text-neutral-200">
          Deine nächsten Termine
        </h2>

        <button
          @click="openModal"
          class="bg-gold-600 text-white px-2 py-2 rounded text-xs flex items-center"
        >
          <img src="/add.svg" class="w-4 h-4" />
          Hinzufügen
        </button>
      </div>
      <hr class="my-2 border-neutral-600" />
      <div class="flex justify-center mb-4">
        <div
          class="mx-auto inline-flex items-center justify-center p-1 rounded bg-neutral-800"
        >
          <div
            @click="calendarView = 'new'"
            class="rounded text-neutral-200 text-xs py-1 px-2 cursor-pointer"
            :class="calendarView === 'new' ? 'bg-gold-600' : 'bg-neutral-800'"
          >
            Neue Ansicht
          </div>
          <div
            @click="calendarView = 'old'"
            class="cursor-pointer ml-2 rounded text-neutral-200 text-xs py-1 px-2"
            :class="calendarView === 'old' ? 'bg-gold-600' : 'bg-neutral-800'"
          >
            Alte Ansicht
          </div>
        </div>
      </div>
      <calendar-component
        v-if="calendarView === 'new'"
        :appointments-updated="appointmentsUpdated"
      />
      <booking-calendar-component v-else />
      <booking-modal
        v-if="showModal"
        @closeModal="closeModal"
        @fetchAppointments="handleFetchAppointments"
      />
    </div>
    <icon-navigation-component />
  </div>
</template>

<script setup>
import { ref } from "vue";

const showModal = ref(false);
const calendarView = ref("new");

const openModal = () => {
  showModal.value = true;
};

const appointmentsUpdated = ref(false);
function handleFetchAppointments() {
  // Hier kannst du weitere Logik hinzufügen, wie das Abrufen von Terminen
  appointmentsUpdated.value = !appointmentsUpdated.value;
  setTimeout(() => {
    appointmentsUpdated.value = !appointmentsUpdated.value;
  }, 1000);
}

const closeModal = () => {
  showModal.value = false;
};
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
