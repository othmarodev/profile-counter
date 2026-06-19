#!/usr/bin/env node
/**
 * scripts/seed.js
 *
 * Seed the counter to a specific value. Useful when migrating from another
 * counter service (komarev.com/ghpvc/, visitor-badge.laobi.icu, etc.) and you
 * want to preserve your historical view count.
 *
 * Usage:
 *   # Set the default bucket to 624 (what komarev had before it broke)
 *   node scripts/seed.js 624
 *
 *   # Set a specific bucket id
 *   node scripts/seed.js --id=othmarodev 624
 *
 *   # Inspect the current value without changing it
 *   node scripts/seed.js --get
 *   node scripts/seed.js --id=my-readme --get
 *
 * Requirements:
 *   - .env file (or environment) with UPSTASH_REDIS_REST_URL and
 *     UPSTASH_REDIS_REST_TOKEN. Copy from .env.example to .env and fill in.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Redis } from '@upstash/redis';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── .env loader (no extra dep) ──────────────────────────────────────────────

function loadDotEnv() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

// ─── Argv parsing ────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { id: 'default', mode: 'set', value: null };
  const remaining = [];
  for (const arg of argv) {
    if (arg === '--get' || arg === '-g') {
      out.mode = 'get';
    } else if (arg === '--help' || arg === '-h') {
      out.mode = 'help';
    } else if (arg.startsWith('--id=')) {
      out.id = arg.slice('--id='.length);
    } else if (arg === '--id') {
      // handled in remaining loop below
      remaining.push(arg);
    } else {
      remaining.push(arg);
    }
  }
  // Handle `--id <value>` form
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i] === '--id' && remaining[i + 1]) {
      out.id = remaining[i + 1];
      remaining.splice(i, 2);
      i--;
    }
  }
  // First remaining positional is the seed value (for --set mode)
  if (out.mode === 'set' && remaining.length > 0) {
    out.value = remaining[0];
  }
  return out;
}

function printHelp() {
  process.stdout.write(`
profile-counter — seed / inspect the counter

Usage:
  node scripts/seed.js [--id=<id>] <value>     Set counter to <value>
  node scripts/seed.js [--id=<id>] --get       Print current value
  node scripts/seed.js --help                  This message

Options:
  --id <id>     Counter bucket. Default "default". Use this if you track
                multiple pages with the same deployment.
  --get, -g     Read mode — don't modify anything.

Examples:
  # Migrate from komarev (you had 623 views there before it broke)
  node scripts/seed.js 623

  # Seed a separate bucket for your project README
  node scripts/seed.js --id=my-project 42

  # Check the current value
  node scripts/seed.js --get
`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  loadDotEnv();

  const args = parseArgs(process.argv.slice(2));
  if (args.mode === 'help') {
    printHelp();
    return;
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error(
      '✗ Missing UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN.\n' +
      '  Copy .env.example to .env and fill in the values from your Upstash dashboard.',
    );
    process.exit(1);
  }

  const redis = Redis.fromEnv();
  const key = `profile-counter:${args.id}`;

  if (args.mode === 'get') {
    const current = await redis.get(key);
    process.stdout.write(`${current ?? 0}\n`);
    return;
  }

  if (args.value === null || args.value === undefined) {
    console.error('✗ No value provided. Use `node scripts/seed.js <value>` or `--help`.');
    process.exit(1);
  }

  const parsed = Number(args.value);
  if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
    console.error(`✗ Invalid seed value: "${args.value}". Must be a non-negative integer.`);
    process.exit(1);
  }

  await redis.set(key, parsed);
  const verified = await redis.get(key);

  process.stdout.write(`✓ Seeded "${key}" to ${verified}\n`);
}

main().catch((err) => {
  console.error('✗ Unexpected error:', err.message || err);
  process.exit(1);
});
