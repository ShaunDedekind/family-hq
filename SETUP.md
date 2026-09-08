# Family App — Setup

One-time steps **you** do outside the repo. After this, migrations and app code live in git.

## 1. Supabase cloud project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a **free** project.
2. Choose a region close to NZ (e.g. Sydney) and a strong database password (save it).
3. When the project is ready, open **Project Settings → API** and copy:
   - **Project URL**
   - **anon** `public` key (safe in the mobile app)
   - **service_role** key (server/admin only — never commit or ship in the app)

4. Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is for local CLI/scripts only; Expo uses the `EXPO_PUBLIC_*` vars.

## 2. Supabase CLI link

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

`YOUR_PROJECT_REF` is the subdomain in your project URL (e.g. `abcdefghij` from `https://abcdefghij.supabase.co`).

Push schema from the repo:

```bash
npm run db:push
```

## 3. Database schema

**Option A — SQL Editor (recommended if CLI has network issues):**

1. Open **SQL Editor** in the Family-HQ dashboard
2. Paste and run the full file: `supabase/migrations/20260303000000_initial_schema.sql`
3. Confirm tables appear in **Table Editor**

**Option B — CLI:**

```bash
npm run db:push
```

## 4. Auth (dashboard) — required for magic links

**Authentication → Providers → Email:** enabled.

**Authentication → URL configuration → Redirect URLs**, add:

- `family://**`
- `exp://**`
- `exp://127.0.0.1:8081/**`
- `http://localhost:8081/**` (local web dev)
- `https://YOUR-APP.vercel.app/**` (after Vercel deploy — see [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md))

When running Expo, check the terminal for your LAN URL (e.g. `exp://192.168.1.x:8081/**`) and add it if links fail on device.

**Site URL** can stay `http://localhost:3000` for development.

See [docs/V0_GO_LIVE.md](docs/V0_GO_LIVE.md) for the full smoke-test checklist.

## 5. Security — access tokens

Never paste Supabase access tokens or secret keys in chat.

If a token was exposed: [Account → Access Tokens](https://supabase.com/dashboard/account/tokens) → **Revoke** → create a new one only if needed for CLI.

## 6. Realtime

Migrations enable Realtime on core tables. If events do not sync live, check **Database → Replication** and confirm `family_events` and `care_sessions` are in the publication.

## 7. Run the app

### Web browser (recommended at the office)

```bash
npm install
npm run web
```

Opens `http://localhost:8081`. Optional: Chrome DevTools → **Cmd+Shift+M** → pick iPhone for mobile width.

See [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md) to deploy the same build to Vercel.

### Expo Go (phones)

```bash
npx expo start
```

Scan the QR code with **Expo Go** on both phones (same Wi‑Fi as the Mac).

### Different Wi‑Fi / office phone restrictions

**`localhost` does not work on a physical phone** — the phone cannot reach your laptop that way.

**Option A — Tunnel (physical phone, any network):**

```bash
npx expo start --tunnel
```

Uses Expo’s relay so the phone only needs internet (not the same Wi‑Fi). First run may ask to install `@expo/ngrok`. Slightly slower than LAN, fine for testing.

**Option B — Simulator on your Mac (localhost):**

```bash
npx expo start
```

Then press **`i`** (iOS Simulator) or **`a`** (Android emulator) in the terminal. No phone or Wi‑Fi needed.

**Option C — Phone hotspot:** Connect the laptop to your phone’s hotspot so both devices share one network, then use normal `npx expo start` + QR scan.

**First parent:** sign in → Create family → add child name/DOB → note the **invite code**.

**Second parent:** sign in → Join family → enter invite code.

## 8. Optional: Supabase MCP in Cursor

Lets the agent run queries and inspect API/auth logs from chat.

1. [Supabase account → Access tokens](https://supabase.com/dashboard/account/tokens) → create a personal access token.
2. In Cursor: add the Supabase MCP server with your project URL and token (see Cursor MCP docs).

## 9. Not needed for V0

- Apple Developer / Play Console
- EAS paid builds (Expo Go is enough)
- Custom SMTP (default Supabase email is fine; check spam)
- Storage buckets (no photos in V0)
- Edge Functions

## 10. Optional later

- **Docker Desktop** + `npx supabase start` for local Postgres (still push to cloud for phones)
- **EAS Build** when you want TestFlight / Play internal testing without Expo Go

## Troubleshooting

| Issue | Fix |
|---|---|
| Magic link opens browser but not app | Add redirect URLs; on web, use `http://localhost:8081/**` or Vercel URL |
| Phone can't join office Wi‑Fi | Use `npm run web` in browser, or `npx expo start --tunnel`, or simulator |
| RLS errors after sign-in | User must complete onboarding (family membership) |
| Realtime not updating | Check Replication; both phones on same Supabase project |
| `db:push` fails | Run `npx supabase login` and `npx supabase link` again |
