import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'
import {
  createPublicSiteOriginManifestPlugin,
  resolvePublicSiteConfig,
  resolveViteMode,
} from './config/public-site.mjs'
import { writeWhitepaperPdfMetadata } from './scripts/whitepapers/pdf-metadata.mjs'

const mode = resolveViteMode(process.argv)
const fileEnv = loadEnv(mode, process.cwd(), ['PUBLIC_SITE_URL', 'DEPLOY_ENVIRONMENT'])
const publicSite = resolvePublicSiteConfig({
  PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL ?? fileEnv.PUBLIC_SITE_URL,
  DEPLOY_ENVIRONMENT: process.env.DEPLOY_ENVIRONMENT ?? fileEnv.DEPLOY_ENVIRONMENT,
})

export const shouldInlineStylesheet = (filePath, content) =>
  filePath.endsWith('.css') && content.byteLength <= 8 * 1024

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'middleware' }),
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  integrations: [
    {
      name: 'whitepaper-pdf-metadata',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          await writeWhitepaperPdfMetadata({ clientOutputDirectory: fileURLToPath(dir) })
        },
      },
    },
  ],
  site: publicSite.origin,
  server: { port: 4321, host: '0.0.0.0' },
  vite: {
    plugins: [tailwindcss(), createPublicSiteOriginManifestPlugin(publicSite.origin)],
    define: {
      // Keep client/SSR metadata on the same checked origin used to create the build manifest.
      'import.meta.env.PUBLIC_SITE_URL': JSON.stringify(publicSite.origin),
    },
    build: {
      // Inline small stylesheets to remove blocking requests. Executable scripts stay external
      // so the existing same-origin script CSP remains unchanged.
      assetsInlineLimit: shouldInlineStylesheet,
    },
  },
})
