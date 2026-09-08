#!/usr/bin/env node
/**
 * Pre-flight checks before running the app.
 * Does not call Supabase (no secrets sent over network).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');

let ok = true;

function pass(msg) {
  console.log(`✓ ${msg}`);
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  ok = false;
}

console.log('Family V0 — setup verification\n');

if (!fs.existsSync(envPath)) {
  fail('.env missing — run: cp .env.example .env');
} else {
  const env = fs.readFileSync(envPath, 'utf8');
  if (!env.includes('EXPO_PUBLIC_SUPABASE_URL=') || env.includes('YOUR_PROJECT')) {
    fail('EXPO_PUBLIC_SUPABASE_URL not set in .env');
  } else {
    pass('EXPO_PUBLIC_SUPABASE_URL is set');
  }
  if (!env.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY=') || env.includes('your-anon-key')) {
    fail('EXPO_PUBLIC_SUPABASE_ANON_KEY not set in .env');
  } else {
    pass('EXPO_PUBLIC_SUPABASE_ANON_KEY is set');
  }
}

const migration = path.join(root, 'supabase/migrations/20260303000000_initial_schema.sql');
if (fs.existsSync(migration)) {
  pass('Migration file present');
} else {
  fail('Migration file missing');
}

console.log('\nDashboard checklist (manual):');
console.log('  → Authentication → Redirect URLs: family://** , exp://** , http://localhost:8081/**');
console.log('  → After Vercel deploy: https://YOUR-APP.vercel.app/**');
console.log('  → See docs/V0_GO_LIVE.md and docs/DEPLOY_VERCEL.md');

try {
  execSync('npm run typecheck', { cwd: root, stdio: 'inherit' });
  pass('TypeScript check passed');
} catch {
  fail('TypeScript check failed');
}

if (!ok) {
  process.exit(1);
}

console.log('\nReady. Run: npx expo start\n');
