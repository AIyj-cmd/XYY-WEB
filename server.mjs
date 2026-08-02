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
const FORMAL_ORIGIN = 'https://56xyy.com'
const FORMAL_HOST = '56xyy.com'
const LEGACY_HOSTS = new Set(
  (process.env.LEGACY_DOMAINS || 'wz.tomatopia.top')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)
)
const ENABLE_DOMAIN_REDIRECTS = process.env.ENABLE_DOMAIN_REDIRECTS === 'true'
const LEGACY_PATH_REDIRECTS = new Map([
  ['/index.html', '/'],
  ['/about.html', '/about'],
])

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)

const IS_PRODUCTION_DOMAIN = (process.env.PUBLIC_SITE_URL ?? '') === FORMAL_ORIGIN

// Collapse protocol, host, legacy-path and trailing-slash normalization into one 301.
app.use((req, res, next) => {
  const requestHost = req.hostname.toLowerCase()
  const forwardedProto = (req.get('x-forwarded-proto') || req.protocol)
    .split(',')[0]
    .trim()
    .toLowerCase()
  const query = req.originalUrl.includes('?')
    ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
    : ''
  const mappedPath = LEGACY_PATH_REDIRECTS.get(req.path) || req.path
  const normalizedPath =
    mappedPath !== '/' && mappedPath.endsWith('/') ? mappedPath.slice(0, -1) : mappedPath

  const isFormalHost = requestHost === FORMAL_HOST || requestHost === `www.${FORMAL_HOST}`
  const isLegacyHost = LEGACY_HOSTS.has(requestHost)
  const needsFormalOrigin =
    (isFormalHost && (requestHost !== FORMAL_HOST || forwardedProto !== 'https')) ||
    (ENABLE_DOMAIN_REDIRECTS && isLegacyHost)
  const needsPathRedirect = normalizedPath !== req.path

  if (needsFormalOrigin) {
    return res.redirect(301, `${FORMAL_ORIGIN}${normalizedPath}${query}`)
  }
  if (needsPathRedirect) {
    return res.redirect(301, `${normalizedPath}${query}`)
  }
  next()
})

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
      `connect-src 'self' ${process.env.PUBLIC_SITE_URL ?? FORMAL_ORIGIN}`,
    ].join('; ')
  )
  next()
})

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

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

app.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}`)
})
