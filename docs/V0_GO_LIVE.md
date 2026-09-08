# V0 go-live checklist

Use this after the database migration has run successfully in Supabase SQL Editor.

## Dashboard — do these once (Family-HQ)

### Auth redirect URLs

**Authentication → URL configuration → Redirect URLs** — add each line:

```
family://**
exp://**
exp://127.0.0.1:8081/**
http://localhost:8081/**
https://YOUR-APP.vercel.app/**
```

When Expo starts, it may show a dev URL like `exp://192.168.x.x:8081` — add that too if magic links fail on device:

```
exp://192.168.*.*:8081/**
```

(Or add the exact URL shown in the Expo terminal.)

**Site URL:** `http://localhost:3000` is fine for development.

**Providers → Email:** enabled.

### Realtime (if sync between phones fails)

**Database → Replication** — confirm these are enabled for `supabase_realtime`:

- `family_events`
- `care_sessions`
- `calendar_events`
- `tasks`
- `list_items`
- `measurements`
- `immunisation_records`

### Security — revoke leaked CLI token

If you pasted a Supabase access token in chat:

1. [Account → Access Tokens](https://supabase.com/dashboard/account/tokens)
2. Revoke the exposed token
3. Create a new one only if you need CLI later

---

## Web browser (no phone)

```bash
npm run web
```

Open `http://localhost:8081`. Chrome DevTools → **Cmd+Shift+M** → iPhone preset.

Magic link opens in the same browser tab — click the email link on the machine running the app.

Deploy to production: [docs/DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)

---

## Terminal — Expo Go (optional)

```bash
cd /Users/sdedekind001/Documents/_dev/FamilyApp
npm install
npm run verify
npx expo start
```

Scan QR with **Expo Go** (phone on same Wi‑Fi as Mac).

---

## Smoke test — parent 1 (~10 min)

- [ ] Login → enter email → open magic link on **same phone**
- [ ] Lands back in app (not stuck in browser)
- [ ] Create family → your name + baby name + DOB
- [ ] See invite code on success screen
- [ ] **+** → log a feed
- [ ] **Today** shows last feed
- [ ] **Timeline** shows the event
- [ ] **Health** shows immunisation due dates (if DOB set)
- [ ] **Family** tab shows invite code

---

## Smoke test — parent 2 (~10 min)

Use a second browser profile, incognito window, or your wife's laptop on the Vercel URL.

- [ ] Different email → magic link sign-in
- [ ] Join family with invite code from parent 1
- [ ] Parent 1 logs nappy → parent 2 **Today** updates within a few seconds
- [ ] Parent 1 **Start sleep** → parent 2 sees sleeping on Today
- [ ] Parent 2 **End sleep** → both see sleep event on Timeline

If all checked: **V0 is dogfood-ready.**

---

## Common fixes

| Problem | Fix |
|---|---|
| Magic link opens browser only | Add redirect URLs above; restart Expo |
| `Not configured` on login | Check `.env`; restart Expo |
| Permission denied after login | Finish onboarding (create or join family) |
| No live sync | Replication tab; same Supabase project on both phones |
| Transport error on CLI | Use SQL Editor for migrations; CLI optional |
