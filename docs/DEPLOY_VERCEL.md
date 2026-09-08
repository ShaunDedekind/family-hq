# Deploy to Vercel

Deploy the web version so you and your wife can use Family in a browser (no Expo Go, no shared Wi‑Fi).

## Prerequisites

- Database schema applied in Supabase (SQL Editor)
- GitHub repo (private recommended)
- Supabase redirect URLs configured (see below)

## 1. Supabase redirect URLs

**Authentication → URL configuration → Redirect URLs**, add:

```
http://localhost:8081/**
https://YOUR-APP.vercel.app/**
```

Replace `YOUR-APP` with your actual Vercel project URL after the first deploy.

Keep existing mobile URLs if you use Expo Go later: `family://**`, `exp://**`.

## 2. Push to GitHub

```bash
git add .
git commit -m "Family V0 web + Vercel"
git remote add origin https://github.com/YOU/FamilyApp.git
git push -u origin main
```

`.env` is gitignored — never commit secrets.

## 3. Vercel project

1. [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
2. Framework: **Other** (uses [`vercel.json`](../vercel.json))
3. **Environment variables** (Production):

   | Name | Value |
   |---|---|
   | `EXPO_PUBLIC_SUPABASE_URL` | `https://hqkfjbnhxyoweqfpyjyc.supabase.co` |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | your publishable key |

   Do **not** add `SUPABASE_SERVICE_ROLE_KEY`.

4. **Deploy**

## 4. After first deploy

1. Copy your URL (e.g. `https://family-app-xyz.vercel.app`)
2. Add to Supabase redirect URLs: `https://family-app-xyz.vercel.app/**`
3. Optional: set **Site URL** in Supabase Auth to the same Vercel URL
4. Test magic link sign-in on the live URL

## 5. Local web dev (browser)

```bash
npm run web
```

Opens `http://localhost:8081`. Use Chrome DevTools → device toolbar (Cmd+Shift+M) for phone width.

Add `http://localhost:8081/**` to Supabase redirects before testing magic links locally.

## Verify

- [ ] Login page loads on Vercel
- [ ] Magic link → signed in on Vercel URL
- [ ] Create family, log feed, Today updates
- [ ] Incognito / second browser → join with invite code → sync works

## Redeploy

Vercel redeploys automatically on push to `main`. Env var changes require a manual redeploy from the Vercel dashboard.
