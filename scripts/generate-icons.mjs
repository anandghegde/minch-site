// Generates public/apple-touch-icon.png (180×180) for iOS home-screen / Safari.
//
// Re-runnable and dependency-light: rasterizes the brand bolt glyph on a solid
// dark square (iOS applies its own rounding) with sharp. Run with:
// `node scripts/generate-icons.mjs`. Shares the glyph with favicon.svg.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'apple-touch-icon.png');

const S = 180;
// bolt.fill glyph (24×24 viewBox), shared with favicon.svg / Wordmark.astro.
const BOLT = 'M13 2L4 14h7l-1 8 9-12h-7l1-8z';

const svg = `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3D7BFF"/>
      <stop offset="100%" stop-color="#5BE2F7"/>
    </linearGradient>
  </defs>
  <rect width="${S}" height="${S}" fill="#121212"/>
  <g transform="translate(${S / 2}, ${S / 2}) scale(4.5) translate(-12, -12)">
    <path d="${BOLT}" fill="url(#bolt)"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log(`Wrote ${OUT} (${S}x${S})`);
