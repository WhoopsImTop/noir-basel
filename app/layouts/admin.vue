<template>
  <div class="admin-app">
    <div
      v-if="notification.show"
      class="fixed right-4 top-4 z-[110] max-w-[min(20rem,calc(100vw-2rem))] cursor-pointer rounded bg-gold-600 p-4 shadow-lg"
      :style="{ top: `calc(1rem + env(safe-area-inset-top, 0px))` }"
      @click="hideNotification"
    >
      <p class="font-bold text-neutral-100">{{ notification.status }}</p>
      <p class="text-sm text-neutral-100">{{ notification.message }}</p>
    </div>

    <Teleport to="body">
      <div
        v-if="isAdmin && holidayRequestPopup"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"
        @click.self="holidayRequestPopup = null"
      >
        <div class="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-5 shadow-xl">
          <h2 class="text-base font-semibold text-neutral-100">{{ holidayRequestPopup.title }}</h2>
          <p class="mt-2 text-sm text-neutral-300">{{ holidayRequestPopup.body }}</p>
          <div class="mt-5 flex justify-end gap-2">
            <button
              type="button"
              class="rounded border border-neutral-600 px-3 py-2 text-xs uppercase text-neutral-300"
              @click="holidayRequestPopup = null"
            >
              Später
            </button>
            <button
              type="button"
              class="rounded bg-gold-600 px-3 py-2 text-xs uppercase text-white"
              @click="openHolidayRequest"
            >
              Ansehen
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <div v-if="showInstallBanner" class="admin-app__banner border-b border-neutral-700 bg-neutral-800 px-4 py-3">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <p class="text-xs text-neutral-300">NOIR Admin als App installieren für schnelleren Zugriff.</p>
        <div class="flex shrink-0 gap-2">
          <button type="button" class="border border-neutral-600 px-2 py-1 text-[10px] uppercase text-neutral-400" @click="dismissInstallBanner">
            Später
          </button>
          <button type="button" class="bg-gold-600 px-2 py-1 text-[10px] uppercase text-white" @click="installPwa">
            Installieren
          </button>
        </div>
      </div>
    </div>

    <div v-if="needsReload" class="admin-app__banner border-b border-amber-600/50 bg-amber-950/40 px-4 py-3">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <p class="text-xs text-neutral-200">
          App wird vorbereitet — einmal Seite neu laden, dann Benachrichtigungen aktivieren.
        </p>
        <button
          type="button"
          class="shrink-0 bg-gold-600 px-2 py-1 text-[10px] uppercase text-white"
          @click="reloadForPush"
        >
          Neu laden
        </button>
      </div>
    </div>

    <div v-if="showPushBanner" class="admin-app__banner border-b border-gold-600/40 bg-gold-600/10 px-4 py-3">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <p class="text-xs text-neutral-200">
          Push für Buchungen, Stornos, Umbuchungen und Urlaubsanträge aktivieren.
        </p>
        <div class="flex shrink-0 gap-2">
          <button type="button" class="border border-neutral-600 px-2 py-1 text-[10px] uppercase text-neutral-400" @click="dismissPushBanner">
            Später
          </button>
          <button
            type="button"
            class="bg-gold-600 px-2 py-1 text-[10px] uppercase text-white disabled:opacity-50"
            :disabled="isLoading"
            @click="onPushButtonClick"
          >
            {{ isLoading ? "…" : "Aktivieren" }}
          </button>
        </div>
      </div>
    </div>

    <header class="admin-app__header">
      <div class="admin-app__header-inner">
        <div class="admin-app__header-actions">
          <button
            v-if="canNotify"
            type="button"
            class="admin-app__icon-btn"
            :class="{ 'admin-app__icon-btn--active': isSubscribed }"
            :title="pushButtonTitle"
            :aria-label="pushButtonTitle"
            :disabled="isLoading"
            @click="onPushButtonClick"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4a2 2 0 0 0 .3-1.1V11a6 6 0 1 0-12 0v3.5c0 .4.1.8.3 1.1L7 17h5m4 0v1a3 3 0 0 1-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button
            v-if="canInstall"
            type="button"
            class="admin-app__icon-btn"
            title="App installieren"
            aria-label="App installieren"
            @click="installPwa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
            </svg>
          </button>
        </div>

        <NuxtLink to="/admin" class="font-heading text-xl leading-none tracking-[0.12em] text-white sm:text-2xl">
          NOIR BASEL
        </NuxtLink>

        <div class="flex justify-end">
          <button
            type="button"
            class="border border-neutral-600 px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] text-neutral-200"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="admin-app__main">
      <NuxtPage />
    </main>

    <div class="admin-app__nav">
      <IconNavigationComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconNavigationComponent from "~/components/iconNavigationComponent.vue";

const router = useRouter();
const notification = useNotificationStore();
const calendarStore = useCalendarStore();
const { isAdmin, clearSession, hydrateFromStorage } = useAuth();

const {
  canNotify,
  isSubscribed,
  isLoading,
  permission,
  needsReload,
  lastError,
  debugStatus,
  syncPermission,
  syncSubscriptionState,
  activateAfterPermission,
  unsubscribe,
} = usePushNotifications();

const hideNotification = () => {
  notification.hideNotification();
};

const showInstallBanner = ref(false);
const showPushBanner = ref(false);
const canInstall = ref(false);
const pushStatusLine = ref("");
const holidayRequestPopup = ref<{ title: string; body: string } | null>(null);

const openHolidayRequest = async () => {
  holidayRequestPopup.value = null;
  await router.push("/admin/opening-hours");
};

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

const pushButtonTitle = computed(() => {
  if (isSubscribed.value) {
    return "Benachrichtigungen aktiv — tippen zum Deaktivieren";
  }
  if (permission.value === "denied") {
    return "Benachrichtigungen blockiert — in Browser-Einstellungen erlauben";
  }
  return "Benachrichtigungen aktivieren";
});

const showPushFeedback = (title: string, message: string) => {
  pushStatusLine.value = message;
  notification.showNotification(title, message);
};

const dismissInstallBanner = () => {
  showInstallBanner.value = false;
  localStorage.setItem("admin_pwa_install_dismissed", "1");
};

const dismissPushBanner = () => {
  showPushBanner.value = false;
  localStorage.setItem("admin_push_dismissed", "1");
};

const installPwa = async () => {
  if (deferredInstallPrompt) {
    await deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    canInstall.value = false;
    showInstallBanner.value = false;
    return;
  }

  showPushFeedback(
    "App installieren",
    "Safari/iOS: Teilen → Zum Home-Bildschirm. Chrome: Menü → App installieren.",
  );
};

const reloadForPush = () => {
  window.location.reload();
};

const onPushButtonClick = async () => {
  try {
    if (!canNotify.value) {
      showPushFeedback("Hinweis", "Benachrichtigungen werden in diesem Browser nicht unterstützt.");
      return;
    }

    if (isSubscribed.value) {
      const { ok, message } = await activateAfterPermission("granted");
      showPushFeedback(ok ? "Push" : "Hinweis", message);
      return;
    }

    if (permission.value === "denied") {
      showPushFeedback(
        "Hinweis",
        "Benachrichtigungen blockiert — in den Website-Einstellungen des Browsers erlauben.",
      );
      return;
    }

    let permissionResult: NotificationPermission = Notification.permission;
    if (permissionResult === "default") {
      permissionResult = await Notification.requestPermission();
    }
    permission.value = permissionResult;

    if (permissionResult === "granted") {
      showPushFeedback("Push", "Berechtigung erteilt — registriere Push…");
    }

    const { ok, message } = await activateAfterPermission(permissionResult);
    showPushFeedback(ok ? "Push" : "Hinweis", message);
    if (ok && isSubscribed.value) {
      showPushBanner.value = false;
    }
    await syncSubscriptionState();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler beim Aktivieren.";
    console.error("[push]", error);
    showPushFeedback("Fehler", message);
  }
};

const handleServiceWorkerMessage = (event: MessageEvent) => {
  if (!event.data || typeof event.data !== "object") {
    return;
  }

  if (event.data.type === "PUSH_RECEIVED") {
    calendarStore.triggerRefresh();
    const payload = event.data.payload;
    const pushType = payload?.data?.type;
    if (payload?.title && payload?.body) {
      notification.showNotification(payload.title, payload.body);
    }
    if (pushType === "holiday_requested" && isAdmin.value && payload?.title && payload?.body) {
      holidayRequestPopup.value = {
        title: payload.title,
        body: payload.body,
      };
    }
  }

  if (event.data.type === "NAVIGATE" && event.data.url) {
    router.push(event.data.url);
  }
};

const logout = async () => {
  await unsubscribe();
  clearSession();
  await router.push("/admin/auth/login");
};

onMounted(async () => {
  if (import.meta.client) {
    document.documentElement.classList.add("admin-shell");
    hydrateFromStorage();
  }

  await syncSubscriptionState();
  syncPermission();
  pushStatusLine.value = debugStatus.value;

  if (
    canNotify.value &&
    !isSubscribed.value &&
    permission.value !== "denied" &&
    !localStorage.getItem("admin_push_dismissed")
  ) {
    showPushBanner.value = true;
  }

  canInstall.value =
    !window.matchMedia("(display-mode: standalone)").matches &&
    !(window.navigator as Navigator & { standalone?: boolean }).standalone;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    canInstall.value = true;
    if (!localStorage.getItem("admin_pwa_install_dismissed")) {
      showInstallBanner.value = true;
    }
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    document.documentElement.classList.remove("admin-shell");
    document.body.style.overflow = "";
  }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
  }
});
</script>

<style src="~/assets/css/admin.css"></style>
