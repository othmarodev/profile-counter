#!/usr/bin/env node
/**
 * scripts/render-preview.js
 *
 * Dumps sample SVGs to docs/preview/*.svg so you can eyeball the badge styles
 * without spinning up Vercel. No Redis needed — uses dummy counts.
 *
 * Usage:
 *   node scripts/render-preview.js
 *
 * Output:
 *   docs/preview/flat-default.svg
 *   docs/preview/flat-blueviolet.svg
 *   docs/preview/flat-square-blue.svg
 *   ...
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'docs', 'preview');

// ─── Inline copy of the renderer (keeps the script standalone) ───────────────

function approxTextWidth(text, fontSize = 11) {
  return Math.ceil(text.length * fontSize * 0.58);
}

function renderFlat({ label, value, leftColor, rightColor }) {
  const padding = 12;
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

function renderFlatSquare({ label, value, leftColor, rightColor }) {
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

// ─── Variants ────────────────────────────────────────────────────────────────

const variants = [
  { file: 'flat-default.svg', renderer: renderFlat, opts: { label: 'Profile views', value: '624', leftColor: '#555', rightColor: '#4c1' } },
  { file: 'flat-blueviolet.svg', renderer: renderFlat, opts: { label: 'Profile views', value: '1337', leftColor: '#555', rightColor: '#8a2be2' } },
  { file: 'flat-blue.svg', renderer: renderFlat, opts: { label: 'Visitors', value: '9999', leftColor: '#555', rightColor: '#007ec6' } },
  { file: 'flat-orange.svg', renderer: renderFlat, opts: { label: 'Page views', value: '420', leftColor: '#1F2937', rightColor: '#FF6B35' } },
  { file: 'flat-square-blue.svg', renderer: renderFlatSquare, opts: { label: 'Profile views', value: '624', leftColor: '#555', rightColor: '#007ec6' } },
  { file: 'flat-square-orange.svg', renderer: renderFlatSquare, opts: { label: 'Visitors', value: '888', leftColor: '#1F2937', rightColor: '#FF6B35' } },
];

mkdirSync(OUT, { recursive: true });
for (const v of variants) {
  const svg = v.renderer(v.opts);
  writeFileSync(resolve(OUT, v.file), svg);
  process.stdout.write(`  → docs/preview/${v.file}\n`);
}
process.stdout.write(`\n✓ Wrote ${variants.length} preview SVGs to docs/preview/\n`);
