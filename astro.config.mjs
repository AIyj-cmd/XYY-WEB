import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'middleware' }),
  integrations: [],
  site: process.env.PUBLIC_SITE_URL ?? 'https://wz.tomatopia.top',
  server: { port: 4321, host: '0.0.0.0' },
  vite: {
    plugins: [tailwindcss()],
  },
})
