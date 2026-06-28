// Generates public/og-image.png (1200×630) for OG / Twitter cards.
//
// Re-runnable and dependency-light: rasterizes a brand SVG with sharp (already
// a dependency via Astro). Run with: `node scripts/generate-og.mjs`.
// Mirrors the Hero: dark surface, bolt glow, bolt→current gradient wordmark.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og-image.png');

const W = 1200;
const H = 630;

// bolt.fill glyph (24×24 viewBox), shared with favicon.svg / Wordmark.astro.
const BOLT = 'M13 2L4 14h7l-1 8 9-12h-7l1-8z';

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3D7BFF"/>
      <stop offset="100%" stop-color="#5BE2F7"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="0%" r="75%">
      <stop offset="0%" stop-color="#3D7BFF" stop-opacity="0.22"/>
      <stop offset="70%" stop-color="#121212" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="#121212"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="0" fill="none" stroke="#ffffff" stroke-opacity="0.06"/>

  <!-- Wordmark: bolt glyph + Minch -->
  <g transform="translate(${W / 2 - 96}, 150)">
    <g transform="scale(2.4)">
      <path d="${BOLT}" fill="url(#bolt)"/>
    </g>
    <text x="72" y="46" font-family="${FONT}" font-size="48" font-weight="700"
          letter-spacing="-1" fill="#ffffff">Minch</text>
  </g>

  <!-- Headline -->
  <text x="${W / 2}" y="330" text-anchor="middle" font-family="${FONT}"
        font-size="72" font-weight="700" letter-spacing="-2" fill="#ffffff">Your downloads,</text>
  <text x="${W / 2}" y="412" text-anchor="middle" font-family="${FONT}"
        font-size="72" font-weight="700" letter-spacing="-2" fill="url(#bolt)">at the speed of light.</text>

  <!-- Subtext -->
  <text x="${W / 2}" y="492" text-anchor="middle" font-family="${FONT}"
        font-size="30" font-weight="500" fill="#a3a3a3">A keyboard-first macOS client for TorBox · Free</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log(`Wrote ${OUT} (${W}x${H})`);
