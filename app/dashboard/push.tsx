"use client";

import { useState } from "react";

export default function PushSetup() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function enable() {
    if (busy) return;

    setBusy(true);
    setStatus("");

    try {
      if (!("Notification" in window)) {
        setStatus("Notifications are not supported on this browser.");
        return;
      }

      if (!("serviceWorker" in navigator)) {
        setStatus("Service workers are not supported here.");
        return;
      }

      if (!("PushManager" in window)) {
        setStatus("Push notifications are not supported here.");
        return;
      }

      const vapidKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        setStatus(
          "Push is not configured. Check the VAPID public key."
        );
        return;
      }

      let permission = Notification.permission;

      if (permission !== "granted") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        setStatus(
          "Notifications are blocked. Enable them in browser settings."
        );
        return;
      }

      const registration =
        await navigator.serviceWorker.register("/sw.js");

      await navigator.serviceWorker.ready;

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(vapidKey),
          });
      }

      const json = subscription.toJSON();

      if (
        !json.endpoint ||
        !json.keys?.p256dh ||
        !json.keys?.auth
      ) {
        setStatus(
          "Could not create a valid push subscription."
        );
        return;
      }

      const response = await fetch(
        "/api/push/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to save push subscription."
        );
      }

      setStatus("✅ Push alerts enabled.");
    } catch (error) {
      console.error("Push setup error:", error);

      setStatus(
        error instanceof Error
          ? error.message
          : "Could not enable notifications."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        className="btn btn-light"
        onClick={enable}
        disabled={busy}
      >
        {busy
          ? "Enabling…"
          : "🔔 Enable alerts"}
      </button>

      {status && (
        <div
          className="muted"
          style={{
            fontSize: 12,
            marginTop: 6,
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(
  base64String: string
) {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 = (
    base64String + padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);

  return Uint8Array.from(
    Array.from(rawData).map((char) =>
      char.charCodeAt(0)
    )
  );
}