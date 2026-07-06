import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'middleware' }),
  integrations: [sitemap()],
  site: 'https://wz.tomatopia.top',
  server: { port: 4321, host: '0.0.0.0' },
  vite: {
    plugins: [tailwindcss()],
  },
})
