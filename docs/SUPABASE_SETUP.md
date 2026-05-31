# Supabase setup for ThreadLens auth

1. Create a project at [supabase.com](https://supabase.com) named **threadlens** (free tier is fine).
2. In **Project Settings → API**, create a **new API key** named `threadlens` (or use the default anon + service_role keys).
3. Run `supabase/schema.sql` in the SQL editor.
4. In **Authentication → URL configuration**, set:
   - Site URL: `https://threadlens.vercel.app`
   - Redirect URLs: `https://threadlens.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
5. Enable **Email** provider. Confirm email if you want verification on signup.
6. Add Vercel environment variables:

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API (server only, never expose to client) |
| `XAI_API_KEY` | xAI console (primary AI) |
| `PREMIUM_EMAILS` | Comma-separated emails to auto-enable premium, e.g. `vbajaj56@gmail.com` |
| `PREMIUM_CONTACT_EMAIL` | Inbox for premium requests (also set `NEXT_PUBLIC_PREMIUM_CONTACT_EMAIL` for client mailto links) |

## Enable premium for a user

**Option A:** Add their email to `PREMIUM_EMAILS` in Vercel and redeploy (or wait for next request to `/api/me`).

**Option B:** In Supabase table editor, set `profiles.is_premium = true` for their user id.

Users can also tap **Request Premium** in the app — rows land in `premium_requests`.

## Forgot password

Uses Supabase `resetPasswordForEmail` → link opens `/auth/callback` → user sets password on `/account`.

## Tier limits (in app code)

| | Free | Premium |
|---|------|---------|
| Import cap | Last 35k messages | Full thread |
| AI questions / day | 30 (signed in) | 150 default (`PREMIUM_AI_DAILY_CAP` on Vercel) |
| AI context sent | Last 350 msgs, 280 chars each, ~28k chars | Last 500 msgs, ~48k chars |
| Upload file size | 100 MB | ~512 MB (device RAM is the real limit) |

Premium upload is not capped at 200 MB anymore — that was an arbitrary guardrail. Parsing runs in the browser, so very large `.txt` files depend on phone/laptop memory, not Supabase.

### Public deploy — token abuse guards

- `/api/chat` requires sign-in when Supabase + `XAI_API_KEY` are set.
- Per-user daily caps: 30 (free), 150 premium default — set `PREMIUM_AI_DAILY_CAP=500` on Vercel if you need more for your own account.
- Context to the model is capped (message count, per-message length, total characters) so one request cannot send a full 35k-message export to xAI.
- Request body max 2 MB; `max_tokens` 500 (free) / 800 (premium) per answer.

## Cursor Supabase MCP

If the agent should create the project for you: complete **Supabase MCP** auth when Cursor prompts (Settings → MCP → Supabase → authenticate). Until that finishes, only `mcp_auth` is available and dashboard automation is blocked.
