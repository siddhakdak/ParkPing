# ParkPing — production-oriented Vercel + Supabase MVP

This repository is the production-oriented implementation of the privacy-first vehicle QR contact platform.

## What is included

- Next.js App Router + TypeScript
- Supabase SSR authentication with phone OTP
- Secure random QR tokens
- Public QR vehicle profile with masked registration
- Anonymous visitor conversation
- Owner dashboard and inbox
- Owner replies
- Realtime owner message updates
- PWA service worker/manifest
- Web Push subscription/delivery plumbing
- QR PNG generation + print/download
- Abuse/rate limiting foundation
- Reports table/API foundation
- Admin dashboard
- PostgreSQL schema + RLS
- No owner phone/email returned by public APIs

## 1. Install

Node.js 20+ is recommended.

```bash
npm install
npm run dev
```

## 2. Supabase

Create a Supabase project and run `supabase/schema.sql` in SQL Editor.

Current Supabase Next.js SSR guidance uses `@supabase/ssr`, cookie-based sessions and a proxy for session refresh.

Enable **Phone Auth** and configure a production SMS provider. For India, configure your SMS provider and comply with applicable TRAI/DLT requirements.

Use the current Supabase project Connect/API settings to obtain:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key is server-only.

## 3. Vercel environment variables

Copy `.env.example` into Vercel Project Settings → Environment Variables.

Set production:

```text
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

For push notifications generate VAPID keys, then set:

```text
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:hello@your-domain.com
```

## 4. Push notifications

The dashboard registers `/sw.js`.

The remaining production step is to add a small client subscription UI that calls:

`POST /api/push/subscribe`

with the browser PushSubscription endpoint, p256dh and auth values.

The backend already sends Web Push through `web-push` when VAPID credentials are configured.

Browser/OS notification behavior is controlled by the platform. A website cannot guarantee a loud alarm or bypass Do Not Disturb.

## 5. Realtime

Supabase Realtime is enabled for `messages` in the schema. Owner dashboard subscribes to message changes.

For the anonymous visitor, the MVP intentionally uses secure short polling (3 seconds) because an unauthenticated browser should not receive unrestricted Realtime access to private conversation channels. If you later want fully realtime visitor delivery, use private Realtime channels with explicit Realtime RLS authorization.

## 6. Security checklist before public launch

- Set a custom domain and HTTPS.
- Configure Supabase Auth redirect/site URLs.
- Configure phone SMS provider and India DLT requirements.
- Enable CAPTCHA in Supabase Auth for OTP abuse protection.
- Add Cloudflare Turnstile verification to suspicious public message requests.
- Replace the in-memory rate limiter with Vercel KV/Upstash or another shared rate limiter for multi-instance production.
- Add monitoring/error tracking.
- Add privacy policy, terms, deletion/retention policy and abuse policy.
- Test OTP, QR scanning, anonymous session expiry, push permissions and notification delivery on Android/iOS.
- Set your first admin user by updating `users.is_admin=true` in Supabase after their Auth account exists.
- Run `npm run build` before deployment.

## Important

No software can truthfully guarantee that every phone will play a loud alert from a web page. ParkPing uses supported Web Push/PWA behavior and is designed so a future native app can provide stronger urgent-alert behavior.
