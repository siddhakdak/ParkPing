import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

type PushPayload = {
  title: string;
  body: string;
  url: string;
};

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error("VAPID environment variables are not configured.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function sendOwnerPush(
  ownerId: string,
  payload: PushPayload
) {
  configureWebPush();

  const db = createAdminClient();

  const { data: subscriptions, error } = await db
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", ownerId);

  if (error) {
    console.error("Failed to load push subscriptions:", error);
    return;
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("No push subscriptions found for owner:", ownerId);
    return;
  }

  const notification = JSON.stringify(payload);

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        notification
      );
    } catch (error: any) {
      console.error(
        "Push notification failed:",
        error?.statusCode,
        error?.body || error
      );

      // Remove expired/invalid subscriptions.
      if (
        error?.statusCode === 404 ||
        error?.statusCode === 410
      ) {
        await db
          .from("push_subscriptions")
          .delete()
          .eq("id", subscription.id);
      }
    }
  }
}