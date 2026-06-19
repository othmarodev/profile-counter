/**
 * profile-counter — Edge Function
 *
 * Increments a Redis counter on each request and returns an SVG badge.
 * The SVG is rendered from scratch (no shields.io dependency), styled to
 * match the shields.io "flat" badge that GitHub READMEs are used to.
 *
 * Query parameters (all optional):
 *   id          — bucket key. Default "default". Use this to track multiple
 *                 pages from the same deployment (e.g., ?id=othmarodev,
 *                 ?id=my-project, etc.). Counts are independent per id.
 *   label       — text on the left side. Default "Profile views".
 *   leftColor   — left background color. Default "#555".
 *   rightColor  — right background color. Default "#4c1".
 *   style       — "flat" (default) or "flat-square".
 *
 * Examples:
 *   /api/views
 *   /api/views?id=othmarodev&label=Profile%20views&rightColor=blueviolet
 *   /api/views?id=my-readme&label=Visitors&style=flat-square
 *
 * Storage:
 *   Each id maps to one Redis key: "profile-counter:{id}".
 *   We use INCR which is atomic, so concurrent requests don't lose increments.
 */

import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

// ─── Setup ───────────────────────────────────────────────────────────────────

const redis = Redis.fromEnv();

// Sanitize user-provided color input. Accepts:
//   - 3-digit hex:   abc           → #abc
//   - 6-digit hex:   1f6feb        → #1f6feb
//   - named colors:  blue, red, green, lightgrey, ...
// Falls back to a safe default on anything weird.
function sanitizeColor(input, fallback) {
  if (!input || typeof input !== 'string') return fallback;
  const trimmed = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) return '#' + trimmed;
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return '#' + trimmed;
  // Allow well-known shields.io named colors verbatim
  if (/^[a-zA-Z]+$/.test(trimmed) && trimmed.length <= 16) {
    return mapNamedColor(trimmed.toLowerCase());
  }
  return fallback;
}

// Map shields.io-style named colors to hex. Keeps the badge familiar to devs
// who are migrating from komarev (`color=blueviolet` etc).
function mapNamedColor(name) {
  const palette = {
    brightgreen: '#4c1',
    green: '#97ca00',
    yellowgreen: '#a4a61d',
    yellow: '#dfb317',
    orange: '#fe7d37',
    red: '#e05d44',
    blue: '#007ec6',
    lightgrey: '#9f9f9f',
    grey: '#555',
    gray: '#555',
    blueviolet: '#8a2be2',
    purple: '#8b5cf6',
    pink: '#ff69b4',
    cyan: '#00ffff',
    teal: '#008080',
    white: '#fff',
    black: '#000',
  };
  return palette[name] || '#555';
}

// Sanitize the bucket id so it can't be used to access unrelated Redis keys.
// Allow only alphanumerics, dashes, underscores, dots — max 64 chars.
function sanitizeId(input) {
  if (!input || typeof input !== 'string') return 'default';
  const cleaned = input.trim().slice(0, 64).replace(/[^a-zA-Z0-9._-]/g, '');
  return cleaned || 'default';
}

// Trim and escape XML for the label. Max 40 chars.
function sanitizeLabel(input, fallback) {
  if (!input || typeof input !== 'string') return fallback;
  return xmlEscape(input.trim().slice(0, 40)) || fallback;
}

function xmlEscape(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── SVG rendering ───────────────────────────────────────────────────────────

/**
 * Approximate text width for the Verdana-ish font shields.io uses.
 * Used to compute badge geometry so labels of varying lengths don't overflow.
 * Empirically tuned to match shields.io within ~1px for typical strings.
 */
function approxTextWidth(text, fontSize = 11) {
  // Average character width ≈ 0.58 of font size for Verdana 11px
  return Math.ceil(text.length * fontSize * 0.58);
}

/**
 * Render a "flat" badge that mimics shields.io's output.
 * Two pills side-by-side with rounded corners and a subtle gradient overlay.
 */
function renderFlatBadge({ label, value, leftColor, rightColor }) {
  const padding = 12; // px on each side of the text within a pill
  const height = 20;
  const labelWidth = approxTextWidth(label) + padding;
  const valueWidth = approxTextWidth(value) + padding;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="${height}" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${height}" fill="${leftColor}"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${rightColor}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="14" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="13">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${labelWidth + valueWidth / 2}" y="13">${value}</text>
  </g>
</svg>`;
}

/**
 * Render a "flat-square" badge — no gradient, no rounded corners.
 */
function renderFlatSquareBadge({ label, value, leftColor, rightColor }) {
  const padding = 12;
  const height = 20;
  const labelWidth = approxTextWidth(label) + padding;
  const valueWidth = approxTextWidth(value) + padding;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <g shape-rendering="crispEdges">
    <rect width="${labelWidth}" height="${height}" fill="${leftColor}"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${rightColor}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const id = sanitizeId(params.get('id'));
  const label = sanitizeLabel(params.get('label'), 'Profile views');
  const leftColor = sanitizeColor(params.get('leftColor'), '#555');
  const rightColor = sanitizeColor(params.get('rightColor'), '#4c1');
  const style = (params.get('style') || 'flat').toLowerCase();

  let count;
  try {
    count = await redis.incr(`profile-counter:${id}`);
  } catch (err) {
    // Storage is unavailable — render the badge with an error indicator
    // instead of failing the request (so the README image still loads).
    console.error('Redis INCR failed:', err);
    count = '?';
  }

  const renderer = style === 'flat-square' ? renderFlatSquareBadge : renderFlatBadge;
  const svg = renderer({
    label,
    value: String(count),
    leftColor,
    rightColor,
  });

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // GitHub's image proxy (camo) caches images. We send no-cache so any
      // proxy that respects it re-fetches; camo has its own TTL we can't control.
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      // Be CORS-friendly so the badge can be embedded anywhere
      'Access-Control-Allow-Origin': '*',
    },
  });
}
