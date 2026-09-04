# ParkPing Email Authentication

ParkPing uses email + password authentication. No SMS provider, Twilio, or phone OTP is required.

In Supabase:
1. Authentication → Providers → Email
2. Enable Email.
3. Keep password authentication enabled.
4. Set Site URL to your Vercel/custom-domain URL.
5. Add your development URL to Redirect URLs while testing.

Phone number is optional and is not used for authentication.
