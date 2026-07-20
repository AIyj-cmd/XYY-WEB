import { config } from 'dotenv'
config()

import express from 'express'
import compression from 'compression'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { handler as ssrHandler } from './dist/server/entry.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientDir = join(__dirname, 'dist/client')
const PORT = process.env.PORT || 4321
const HOST = process.env.HOST || '0.0.0.0'

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)

const IS_PRODUCTION_DOMAIN = (process.env.PUBLIC_SITE_URL ?? '').includes('56xyy.com')

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (!IS_PRODUCTION_DOMAIN) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  }
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "media-src 'self'",
      `connect-src 'self' ${process.env.PUBLIC_SITE_URL ?? 'https://wz.tomatopia.top'}`,
    ].join('; ')
  )
  next()
})

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Global trailing-slash redirect — keeps canonical URLs consistent across all pages
app.use((req, res, next) => {
  if (req.path !== '/' && req.path.endsWith('/')) {
    const qs = req.url.slice(req.path.length)
    return res.redirect(301, req.path.slice(0, -1) + qs)
  }
  next()
})

// Serve prerendered contact page at the canonical no-slash URL
app.get('/contact', (_req, res) => res.sendFile(join(clientDir, 'contact/index.html')))

// Gzip/deflate/br compress all responses
app.use(compression({ threshold: 512 }))

// Static assets with immutable long cache (content-hashed by Astro build)
app.use(
  express.static(clientDir, {
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

// Astro SSR for all dynamic/server-rendered routes
app.use(ssrHandler)

app.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}`)
})
