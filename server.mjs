import { config } from 'dotenv'
config()

import express from 'express'
import compression from 'compression'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { handler as ssrHandler } from './dist/server/entry.mjs'
import { healthHandler } from './server/health.mjs'
import { createCanonicalRedirect, createSecurityHeaders } from './server/request-policy.mjs'
import { getRuntimeConfig } from './server/runtime-config.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientDir = join(__dirname, 'dist/client')
const runtime = getRuntimeConfig()

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)

app.use(createCanonicalRedirect(runtime))
app.use(createSecurityHeaders(runtime))
app.get('/healthz', healthHandler)

// Serve prerendered contact page at the canonical no-slash URL
app.get('/contact', (_req, res) => res.sendFile(join(clientDir, 'contact/index.html')))
app.get('/privacy', (_req, res) => res.sendFile(join(clientDir, 'privacy/index.html')))

// Gzip/deflate/br compress all responses
app.use(compression({ threshold: 512 }))

// Static assets with immutable long cache (content-hashed by Astro build)
app.use(
  express.static(clientDir, {
    redirect: false,
    setHeaders(res, filePath) {
      if (/_astro\//.test(filePath)) {
        // Hashed filenames — cache forever
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else if (/\.(woff2?|ttf|otf|eot)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000')
      } else if (/\.(png|jpg|jpeg|webp|avif|svg|gif|ico|mp4|webm)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=604800')
      }
    },
  })
)

// Dynamic CMS-backed HTML must be re-rendered on every request.
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})

// Astro SSR for all dynamic/server-rendered routes
app.use(ssrHandler)

// Astro's middleware delegates unknown paths to Express; serve the branded 404.
app.use((_req, res) => {
  res.status(404).sendFile(join(clientDir, '404.html'))
})

app.listen(runtime.port, runtime.host, () => {
  console.log(`Server started on http://${runtime.host}:${runtime.port}`)
})
