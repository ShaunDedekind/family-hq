# Family App

Private household OS for two parents — starting with newborn care.

- **[Product Vision](PRODUCT_VISION.md)** — what we're building and why
- **[Setup](SETUP.md)** — Supabase project, env vars, running on phones
- **[V0 go-live checklist](docs/V0_GO_LIVE.md)** — auth redirects, smoke test, two-parent sync
- **[Deploy to Vercel](docs/DEPLOY_VERCEL.md)** — GitHub + Vercel + env vars

## Quick start

```bash
cp .env.example .env
# Fill in Supabase keys (see SETUP.md)

npm install
npm run verify
npm run web          # local browser — http://localhost:8081
# npm run build:web  # static export to dist/ (Vercel uses this)
```

## Stack

- Expo (React Native) + Expo Router
- Supabase (Postgres, Auth, Realtime, RLS)
