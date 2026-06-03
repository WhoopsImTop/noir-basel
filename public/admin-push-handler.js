self.addEventListener("push", (event) => {
  let payload = { title: "NOIR Admin", body: "", tag: "admin", data: {} };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    tag: payload.tag,
    data: payload.data || {},
    icon: "/favicon.svg",
    badge: "/favicon.svg",
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title, options),
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "PUSH_RECEIVED", payload });
        });
      }),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/admin";
  const absoluteUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/admin") && "focus" in client) {
          client.postMessage({ type: "NAVIGATE", url });
          return client.focus();
        }
      }
      return self.clients.openWindow(absoluteUrl);
    }),
  );
});
