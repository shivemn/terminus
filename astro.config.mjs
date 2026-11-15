// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Where the site is served, for canonical links, share previews and the sitemap. The Cloudflare
  // Pages project is "terminus-317"; change this if it moves or gets a custom domain.
  site: 'https://terminus-317.pages.dev',
  integrations: [react(), sitemap({ filter: (page) => !page.endsWith('/404/') })],
});
