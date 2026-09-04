"use client";

import { useState } from "react";
import { enableAlarmAudio } from "@/lib/alarm";

export default function PushSetup() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function enable() {
    if (busy) return;

    setBusy(true);
    setStatus("");

    try {
      // Unlock browser audio first.
      const audioReady = await enableAlarmAudio();

      if (!audioReady) {
        setStatus(
          "Sound could not be enabled. Check your browser sound settings."
        );
      }

      // Check browser notification support.
      if (!("Notification" in window)) {
        setStatus(
          audioReady
            ? "✅ Sound enabled. Browser notifications are not supported."
            : "Notifications are not supported on this browser."
        );
        return;
      }

      if (!("serviceWorker" in navigator)) {
        setStatus(
          audioReady
            ? "✅ Sound enabled. Service workers are not supported."
            : "Service workers are not supported here."
        );
        return;
      }

      if (!("PushManager" in window)) {
        setStatus(
          audioReady
            ? "✅ Sound enabled. Push notifications are not supported."
            : "Push notifications are not supported here."
        );
        return;
      }

      const vapidKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        setStatus(
          audioReady
            ? "✅ Sound enabled. Push is not configured."
            : "Push is not configured."
        );
        return;
      }

      let permission = Notification.permission;

      if (permission !== "granted") {
        permission =
          await Notification.requestPermission();
      }

      if (permission !== "granted") {
        setStatus(
          audioReady
            ? "✅ Sound enabled. Notifications are blocked."
            : "Notifications are blocked."
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
        throw new Error(
          "Could not create a valid push subscription."
        );
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

      setStatus(
        "✅ Alerts + sound enabled"
      );
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
          : "🔔 Enable alerts & sound"}
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