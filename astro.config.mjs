import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://minch.app',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    // Generates dist/sitemap-index.xml (+ sitemap-0.xml) on build, satisfying
    // the reference in public/robots.txt. `site` above is required for this.
    sitemap(),
  ],
});
