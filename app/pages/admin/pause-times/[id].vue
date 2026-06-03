<template>
  <div class="px-4">
    <div class="admin-page px-4">
      <div v-if="!loadingData" class="w-full">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-neutral-200">Pause</h2>
          <button
            @click="router.push('/admin')"
            class="bg-neutral-700 p-1.5 rounded-full"
          >
            <img src="/arrow-left.svg" alt="prev" />
          </button>
        </div>
        <hr class="my-2 border-neutral-600" />
        <div class="my-4 flex flex-col bg-neutral-800 rounded p-4">
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col w-full mb-4">
              <div class="mb-4">
                <span class="font-bold text-neutral-200">Name:</span>
                <br />
                <input
                  type="text"
                  class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
                  v-model="pause.name"
                />
              </div>
              <div class="mb-4">
                <span class="font-bold text-neutral-200">Datum:</span>
                <br />
                <input
                  type="date"
                  class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
                  v-model="pause.date"
                />
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200">Startzeit:</span>
                <br />
                <input
                  type="time"
                  class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
                  v-model="pause.start_time"
                />
              </div>

              <div class="mb-4">
                <span class="font-bold text-neutral-200">Endzeit:</span>
                <br />
                <input
                  type="time"
                  class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
                  v-model="pause.end_time"
                />
              </div>
              <div>
                <label for="dauer" class="text-neutral-100"
                  >Ereignis wiederholen lassen?</label
                >
                <select
                  class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
                  v-model="pause.recurring_type"
                >
                  <option value="">Nein</option>
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                </select>
              </div>
              <div class="mt-4">
                <label for="dauer" class="text-neutral-100"
                  >Ende der Wiederholung</label
                >
                <input
                  type="date"
                  id="dauer"
                  v-model="pause.recurring_end_date"
                  class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100"
                />
              </div>
              <button
                class="bg-gold-600 text-white px-4 py-2 block w-full rounded mt-4 text-xs"
                @click="editPause(pause.id)"
              >
                Pause bearbeiten
              </button>

              <button
                class="bg-gold-600 text-white px-4 py-2 block w-full rounded mt-4 text-xs"
                @click="cancelpause(pause.id)"
              >
                Pause löschen
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="loadingData"
        class="text-center py-4 mt-4 flex items-center flex-col justify-center"
      >
        <img src="/loading.svg" alt="loading" class="animate-spin h-8 w-8" />
        <p class="text-neutral-400 mt-4">Lade Pause...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const notificationStore = useNotificationStore();
const route = useRoute();
const router = useRouter();
const api = useBookingApi();

const loadingData = ref(true);
const pause = ref({});

const fetchPause = async () => {
  pause.value = await api.getPauseTime(route.params.id.toString().split("-")[0]);
  loadingData.value = false;
};
fetchPause();

const editPause = async (id) => {
  // Sicherstellen, dass die Zeitangaben korrekt im Format HH:MM:SS sind
  let startTimeString =
    pause.value.start_time.length < 8
      ? `${pause.value.start_time}:00`
      : pause.value.start_time;
  let endTimeString =
    pause.value.end_time.length < 8
      ? `${pause.value.end_time}:00`
      : pause.value.end_time;

  // Konvertiere die Start- und Endzeiten in ISO 8601 Format
  let start = new Date(`1970-01-01T${startTimeString}Z`);
  let end = new Date(`1970-01-01T${endTimeString}Z`);

  // Berechne die Dauer in Minuten
  let durationInMinutes = (end - start) / 60000;

  // Überprüfen, ob die Start- und Endzeiten korrekt formatiert sind
  if (pause.value.start_time.length < 8) {
    pause.value.start_time = startTimeString;
  }
  if (pause.value.end_time.length < 8) {
    pause.value.end_time = endTimeString;
  }

  let postBody = {
    date: pause.value.date, // Das Datum sollte im Format YYYY-MM-DD sein
    start_time: pause.value.start_time, // Zeit im Format HH:MM:SS
    end_time: pause.value.end_time, // Zeit im Format HH:MM:SS
    name: pause.value.name,
    duration: durationInMinutes,
    user_id: 1,
  };

  if (pause.value.recurring_type) {
    postBody.recurring_type = pause.value.recurring_type;

    // Berechne den Wochentag (0 = Sonntag, 6 = Samstag)
    let dateObject = new Date(pause.value.date);
    let dayOfWeek = dateObject.getUTCDay(); // Verwende UTC für Konsistenz
    postBody.recurring_day = dayOfWeek;
  }

  if (pause.value.recurring_end_date) {
    postBody.recurring_end_date = pause.value.recurring_end_date; // Das Datum sollte im Format YYYY-MM-DD sein
  }

  try {
    await api.updatePause(id, postBody);
    notificationStore.status = "Erfolg";
    notificationStore.message = "Pause wurde bearbeitet";
    notificationStore.show = true;
  } catch {
    notificationStore.status = "Fehler";
    notificationStore.message = "Etwas ist schief gelaufen";
    notificationStore.show = true;
  }
};

const cancelpause = async (id) => {
  if (!confirm("Willst du diese Pause wirklich löschen?")) {
    return;
  }
  try {
    await api.deletePause(id);
    window.alert("Pause wurde gelöscht");
    router.push("/admin");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Löschen fehlgeschlagen";
    window.alert(message);
  }
};
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
