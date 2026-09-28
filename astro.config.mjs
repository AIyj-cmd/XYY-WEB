import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'middleware' }),
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  integrations: [],
  site: process.env.PUBLIC_SITE_URL ?? 'https://56xyy.com',
  server: { port: 4321, host: '0.0.0.0' },
  vite: {
    plugins: [tailwindcss()],
  },
})
