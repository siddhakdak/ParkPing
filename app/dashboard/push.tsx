"use client";

import { useEffect, useRef } from "react";
import { enableAlarmAudio } from "@/lib/alarm";

export default function PushSetup() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;

    started.current = true;

    void setupPush();

    /*
     * Try to unlock/resume alarm audio automatically.
     * Browsers may allow this if audio was previously unlocked.
     */
    void enableAlarmAudio();

    /*
     * If the browser requires a user gesture,
     * silently try again on the first interaction.
     *
     * No button is shown to the user.
     */
    const unlockAudio = () => {
      void enableAlarmAudio();
    };

    window.addEventListener(
      "pointerdown",
      unlockAudio,
      { once: true }
    );

    window.addEventListener(
      "keydown",
      unlockAudio,
      { once: true }
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        unlockAudio
      );

      window.removeEventListener(
        "keydown",
        unlockAudio
      );
    };
  }, []);

  return null;
}

async function setupPush() {
  try {
    if (typeof window === "undefined") {
      return;
    }

    if (!("Notification" in window)) {
      console.log(
        "ParkPing: Notifications not supported."
      );
      return;
    }

    if (!("serviceWorker" in navigator)) {
      console.log(
        "ParkPing: Service workers not supported."
      );
      return;
    }

    if (!("PushManager" in window)) {
      console.log(
        "ParkPing: Push notifications not supported."
      );
      return;
    }

    const vapidKey =
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidKey) {
      console.error(
        "ParkPing: VAPID public key is missing."
      );
      return;
    }

    let permission =
      Notification.permission;

    /*
     * Only request permission if it has never
     * been decided before.
     */
    if (permission === "default") {
      permission =
        await Notification.requestPermission();
    }

    /*
     * User denied notifications.
     * Don't repeatedly ask.
     */
    if (permission !== "granted") {
      console.log(
        "ParkPing: Notification permission not granted."
      );
      return;
    }

    /*
     * Register service worker.
     */
    const registration =
      await navigator.serviceWorker.register(
        "/sw.js"
      );

    await navigator.serviceWorker.ready;

    /*
     * Reuse existing subscription whenever possible.
     */
    let subscription =
      await registration.pushManager.getSubscription();

    /*
     * Create subscription only if necessary.
     */
    if (!subscription) {
      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            urlBase64ToArrayBuffer(
              vapidKey
            ),
        });
    }

    const json =
      subscription.toJSON();

    if (
      !json.endpoint ||
      !json.keys?.p256dh ||
      !json.keys?.auth
    ) {
      throw new Error(
        "Invalid push subscription."
      );
    }

    /*
     * Save/update subscription in Supabase.
     */
    const response =
      await fetch(
        "/api/push/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            endpoint:
              json.endpoint,
            p256dh:
              json.keys.p256dh,
            auth:
              json.keys.auth,
          }),
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          "Failed to save push subscription."
      );
    }

    console.log(
      "ParkPing: Alerts automatically enabled."
    );
  } catch (error) {
    console.error(
      "ParkPing automatic alert setup failed:",
      error
    );
  }
}

function urlBase64ToArrayBuffer(
  base64String: string
): ArrayBuffer {
  const padding =
    "=".repeat(
      (4 -
        (base64String.length % 4)) %
        4
    );

  const base64 =
    base64String + padding;

  const normalized =
    base64
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    atob(normalized);

  const bytes =
    new Uint8Array(
      rawData.length
    );

  for (
    let i = 0;
    i < rawData.length;
    i++
  ) {
    bytes[i] =
      rawData.charCodeAt(i);
  }

  return bytes.buffer;
}