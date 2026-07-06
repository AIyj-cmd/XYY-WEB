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

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
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
      "connect-src 'self' https://wz.tomatopia.top",
    ].join('; ')
  )
  next()
})

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

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
