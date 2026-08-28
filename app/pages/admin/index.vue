<template>
  <div class="admin-page px-4">
    <div class="w-full">
      <div class="flex items-center justify-between">
        <h2 class="text-md font-medium text-neutral-200">Kalender</h2>

        <button
          @click="openModal"
          class="bg-gold-600 text-white px-2 py-2 rounded text-xs flex items-center"
        >
          <img src="/add.svg" class="w-4 h-4" alt="" />
          {{ isAdmin ? "Hinzufügen" : "Pause hinzufügen" }}
        </button>
      </div>
      <hr class="my-2 border-neutral-600" />

      <calendar-component :appointments-updated="appointmentsUpdated" />

      <booking-modal
        v-if="showModal"
        :pause-only="!isAdmin"
        @closeModal="closeModal"
        @fetchAppointments="handleFetchAppointments"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const calendarStore = useCalendarStore();
const { isAdmin } = useAuth();

const showModal = ref(false);
const appointmentsUpdated = ref(false);

const openModal = () => {
  showModal.value = true;
};

function handleFetchAppointments() {
  appointmentsUpdated.value = !appointmentsUpdated.value;
  calendarStore.triggerRefresh();
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
