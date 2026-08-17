// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://quiicast.com',
  output: 'static',
  // sitemap.xml is hand-generated at src/pages/sitemap.xml.ts instead of via
  // @astrojs/sitemap, so the output is a single file at the conventional
  // /sitemap.xml path rather than a sitemap-index.xml + sitemap-0.xml pair.
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});