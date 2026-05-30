# Supabase setup for ThreadLens auth

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Run `supabase/schema.sql` in the SQL editor.
3. In **Authentication → URL configuration**, set:
   - Site URL: `https://threadlens.vercel.app`
   - Redirect URLs: `https://threadlens.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
4. Enable **Email** provider. Confirm email if you want verification on signup.
5. Add Vercel environment variables:

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API (server only, never expose to client) |
| `XAI_API_KEY` | xAI console (primary AI) |
| `PREMIUM_EMAILS` | Comma-separated emails to auto-enable premium, e.g. `you@startup.com` |
| `PREMIUM_CONTACT_EMAIL` | Inbox for premium requests (also set `NEXT_PUBLIC_PREMIUM_CONTACT_EMAIL` for client mailto links) |

## Enable premium for a user

**Option A:** Add their email to `PREMIUM_EMAILS` in Vercel and redeploy (or wait for next request to `/api/me`).

**Option B:** In Supabase table editor, set `profiles.is_premium = true` for their user id.

Users can also tap **Request Premium** in the app — rows land in `premium_requests`.

## Forgot password

Uses Supabase `resetPasswordForEmail` → link opens `/auth/callback` → user sets password on `/account`.
