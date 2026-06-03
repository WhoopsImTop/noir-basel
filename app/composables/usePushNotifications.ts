import { ApiError, isApiError } from "~/utils/api";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const normalized = base64String.trim();
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const base64 = (normalized + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function isIosDevice(): boolean {
  if (!import.meta.client) {
    return false;
  }
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandaloneDisplay(): boolean {
  if (!import.meta.client) {
    return false;
  }
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function formatApiError(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 503) {
      return "Push ist auf dem Server nicht konfiguriert (VAPID-Keys in .env fehlen).";
    }
    if (error.status === 401) {
      return "Nicht angemeldet — bitte erneut einloggen.";
    }
    if (error.status === 403) {
      return "Keine Berechtigung — Admin-Account verwenden.";
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unbekannter Fehler.";
}

async function waitForServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("Service Worker Timeout")), 15000),
      ),
    ]);

    return (
      (await navigator.serviceWorker.getRegistration("/")) ??
      (await navigator.serviceWorker.getRegistration())
    );
  } catch {
    return null;
  }
}

/** Push funktioniert nur, wenn ein SW die Seite kontrolliert (oft erst nach einem Reload). */
export function serviceWorkerControlsPage(): boolean {
  return import.meta.client && Boolean(navigator.serviceWorker?.controller);
}

export const usePushNotifications = () => {
  const api = useBookingApi();

  const canNotify = computed(
    () => import.meta.client && typeof window !== "undefined" && "Notification" in window,
  );

  const canWebPush = computed(
    () => canNotify.value && "serviceWorker" in navigator && "PushManager" in window,
  );

  const permission = useState<NotificationPermission>("admin-push-permission", () => "default");
  const isSubscribed = useState("admin-push-subscribed", () => false);
  const isLoading = useState("admin-push-loading", () => false);
  const lastError = useState<string | null>("admin-push-last-error", () => null);
  const needsReload = useState("admin-push-needs-reload", () => false);
  const debugStatus = useState("admin-push-debug", () => "");

  const updateDebugStatus = () => {
    const parts = [
      `Notification: ${canNotify.value ? Notification.permission : "n/a"}`,
      `PushManager: ${"PushManager" in window ? "ja" : "nein"}`,
      `SW-Controller: ${navigator.serviceWorker?.controller ? "ja" : "nein"}`,
      `iOS-PWA: ${isIosDevice() ? (isStandaloneDisplay() ? "ja" : "nein — Home-Bildschirm nötig") : "n/a"}`,
    ];
    debugStatus.value = parts.join(" · ");
  };

  const syncPermission = () => {
    if (canNotify.value) {
      permission.value = Notification.permission;
    }
    updateDebugStatus();
  };

  const syncSubscriptionState = async () => {
    syncPermission();
    needsReload.value = canWebPush.value && !serviceWorkerControlsPage();

    if (!canWebPush.value) {
      isSubscribed.value = false;
      return;
    }

    const registration = await waitForServiceWorker();
    if (!registration?.active) {
      isSubscribed.value = false;
      needsReload.value = true;
      return;
    }

    try {
      const subscription = await registration.pushManager.getSubscription();
      isSubscribed.value = Boolean(subscription);
    } catch {
      isSubscribed.value = false;
    }

    updateDebugStatus();
  };

  const finishSubscription = async (): Promise<boolean> => {
    lastError.value = null;
    isLoading.value = true;

    try {
      if (!navigator.serviceWorker.controller) {
        lastError.value =
          "App noch nicht bereit. Seite einmal neu laden (F5), dann Glocke erneut tippen.";
        needsReload.value = true;
        return false;
      }

      const registration = await waitForServiceWorker();
      if (!registration) {
        lastError.value = "Service Worker konnte nicht gestartet werden.";
        return false;
      }

      const { public_key: publicKey } = await api.getPushVapidPublicKey();
      if (!publicKey?.trim()) {
        lastError.value = "VAPID-Schlüssel vom Server leer.";
        return false;
      }

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        lastError.value = "Push-Subscription unvollständig.";
        return false;
      }

      await api.subscribePush({
        endpoint: json.endpoint,
        public_key: json.keys.p256dh,
        auth_token: json.keys.auth,
        content_encoding: "aesgcm",
      });

      isSubscribed.value = true;
      needsReload.value = false;
      return true;
    } catch (error) {
      lastError.value = formatApiError(error);
      return false;
    } finally {
      isLoading.value = false;
      updateDebugStatus();
    }
  };

  /**
   * @param permissionResult Ergebnis von Notification.requestPermission() — aus dem Klick-Handler
   */
  const activateAfterPermission = async (
    permissionResult: NotificationPermission,
  ): Promise<{ ok: boolean; message: string }> => {
    lastError.value = null;
    permission.value = permissionResult;
    updateDebugStatus();

    if (!canNotify.value) {
      return { ok: false, message: "Dieser Browser unterstützt keine Benachrichtigungen." };
    }

    if (isSubscribed.value) {
      isLoading.value = true;
      try {
        await unsubscribe();
        return { ok: true, message: "Benachrichtigungen deaktiviert." };
      } finally {
        isLoading.value = false;
      }
    }

    if (isIosDevice() && !isStandaloneDisplay()) {
      return {
        ok: false,
        message:
          "iPhone/iPad: In Safari „Teilen“ → „Zum Home-Bildschirm“, App öffnen, dann Glocke erneut tippen.",
      };
    }

    if (!canWebPush.value) {
      return {
        ok: false,
        message: "Web-Push nicht verfügbar. Chrome/Edge/Firefox oder installierte PWA nutzen.",
      };
    }

    if (permissionResult === "denied") {
      return {
        ok: false,
        message: "Benachrichtigungen blockiert — in den Website-Einstellungen des Browsers erlauben.",
      };
    }

    if (permissionResult !== "granted") {
      return { ok: false, message: "Benachrichtigungen wurden nicht erlaubt." };
    }

    const ok = await finishSubscription();
    return {
      ok,
      message: ok
        ? "Benachrichtigungen sind aktiv."
        : lastError.value || "Registrierung fehlgeschlagen.",
    };
  };

  const unsubscribe = async (): Promise<void> => {
    if (!canWebPush.value) {
      isSubscribed.value = false;
      return;
    }

    const registration = await waitForServiceWorker();
    const subscription = registration ? await registration.pushManager.getSubscription() : null;

    if (!subscription) {
      isSubscribed.value = false;
      return;
    }

    try {
      await api.unsubscribePush({ endpoint: subscription.endpoint });
    } catch {
      // Stale subscription on server is acceptable.
    }

    await subscription.unsubscribe();
    isSubscribed.value = false;
    syncPermission();
  };

  return {
    canNotify,
    canWebPush,
    isSupported: canWebPush,
    permission,
    isSubscribed,
    isLoading,
    lastError,
    needsReload,
    debugStatus,
    syncPermission,
    syncSubscriptionState,
    activateAfterPermission,
    unsubscribe,
    isIosDevice,
    isStandaloneDisplay,
  };
};
