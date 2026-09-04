self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};

  try {
    data = event.data.json();
  } catch {
    data = {
      title: "ParkPing",
      body: event.data.text(),
    };
  }

  const title =
    data.title || "🚨 ParkPing Alert";

  const options = {
    body:
      data.body ||
      "Someone wants you to move your vehicle.",

    icon: "/icon.svg",
    badge: "/icon.svg",

    tag: "parkping-message",

    requireInteraction: true,

    silent: false,

    vibrate: [
      300,
      100,
      300,
      100,
      600,
      100,
      600,
    ],

    data: {
      url:
        data.url ||
        "/dashboard",
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification.data?.url ||
      "/dashboard";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          for (const client of clientList) {
            if ("focus" in client) {
              client.navigate(url);
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
);