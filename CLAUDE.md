# CLAUDE.md

Repository guidance for coding agents working on this Astro site.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
npm run test:e2e
npm run audit
npm start
```

Production uses PM2:

```bash
pm2 restart xyy-web
pm2 restart xyy-cms
pm2 logs xyy-web
pm2 logs xyy-cms
```

## Architecture

- Astro 7 SSR with `@astrojs/node` in middleware mode.
- `server.mjs` is the production Express wrapper. It serves `dist/client`, applies compression, security headers, and `/healthz`, then delegates to Astro SSR.
- Tailwind CSS 4 is wired through `@tailwindcss/vite`; theme tokens live in `src/styles/global.css`.
- Directus 12 runs separately on port `8055` and is exposed publicly under `https://wz.tomatopia.top/cms/`.

## Key Files

- `src/lib/brand.ts`: static company data, navigation, stats, service definitions, case details.
- `src/lib/directus.ts`: Directus SDK wrapper, in-process cache, public asset URL helpers.
- `src/lib/sanitize.ts`: CMS rich text sanitizer used before `set:html`.
- `src/pages/api/contact.ts`: contact form API with body limit, honeypot, rate limit, Directus persistence.
- `ecosystem.config.cjs`: PM2 config for `xyy-web` using `/opt/node-v22/bin/node`.
- `scripts/deploy.sh`: local verify, packaging, remote install, PM2 reload, health check.
- `scripts/health-check.mjs`: checks homepage, `/healthz`, and `/cms/server/health`.

## Rendering Notes

- Contact and estimate pages are prerendered.
- News pages and case/product data fetch through Directus at request time.
- Article rich text must be sanitized before use with `set:html`.
- Directus media URLs in pages should use `getDirectusAssetUrl()`, not `DIRECTUS_URL`.

## Assets

- About hero video uses `/introduce-720p.mp4` with `/introduce-poster.jpg`.
- The original 4K video is intentionally outside `public` at `resources/original-media/introduce-original.mp4`.
- Font loading uses `/fonts/puhuiti-900.woff2` and `/fonts/puhuiti-400/result.css`; unused font originals are outside `public`.

## Deployment Facts

- Site URL: `https://wz.tomatopia.top`
- CMS admin: `https://wz.tomatopia.top/cms/admin/`
- Web app directory on server: `/var/www/xyy-web`
- CMS directory on server: `/var/www/xyy-cms`
- PM2 processes: `xyy-web`, `xyy-cms`
