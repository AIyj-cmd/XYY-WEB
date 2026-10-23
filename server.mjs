import { config } from 'dotenv'
config()

import express from 'express'
import compression from 'compression'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'
import { handler as ssrHandler } from './dist/server/entry.mjs'
import { healthHandler } from './server/health.mjs'
import { createVersionHandler } from './server/release-info.mjs'
import {
  createCanonicalRedirect,
  createSecurityHeaders,
  resolveRequestProtocol,
} from './server/request-policy.mjs'
import { getRuntimeConfig } from './server/runtime-config.mjs'
import { createStaticAssetCacheHeaders } from './server/static-asset-cache.mjs'
import { assertBuildPublicSiteOrigin, PUBLIC_SITE_ORIGIN_MANIFEST } from './config/public-site.mjs'
import {
  ForwardedAddressError,
  parseTrustedProxyCidrs,
  resolveTrustedClientAddress,
} from './server/trusted-proxy.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientDir = join(__dirname, 'dist/client')
const runtime = getRuntimeConfig()
const publicSiteManifestPath = join(__dirname, 'dist/server', PUBLIC_SITE_ORIGIN_MANIFEST)
let publicSiteManifest = null
try {
  publicSiteManifest = readFileSync(publicSiteManifestPath, 'utf8')
} catch (error) {
  if (error?.code !== 'ENOENT') throw error
}
assertBuildPublicSiteOrigin({
  manifest: publicSiteManifest,
  runtimeOrigin: runtime.publicSiteOrigin,
  required: runtime.isReleaseEnvironment,
})
const trustedProxyCidrs = parseTrustedProxyCidrs(process.env.TRUSTED_PROXY_CIDRS)

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', false)

app.use((req, res, next) => {
  try {
    const requester = resolveTrustedClientAddress({
      socketAddress: req.socket.remoteAddress,
      forwardedFor: req.get('x-forwarded-for') || undefined,
      trustedProxyCidrs,
    })
    res.locals.requesterIp = requester.clientAddress
    res.locals.requestProtocol = resolveRequestProtocol({
      socketEncrypted: Boolean(req.socket.encrypted),
      trustedPeer: requester.trustedPeer,
      forwardedProto: requester.trustedPeer ? req.get('x-forwarded-proto') || undefined : undefined,
    })
    next()
  } catch (error) {
    if (error instanceof ForwardedAddressError) {
      res.status(400).type('text/plain').send('Bad Request')
      return
    }
    next(error)
  }
})

app.use(createCanonicalRedirect(runtime))
app.use(createSecurityHeaders(runtime))
app.get('/healthz', healthHandler)
app.get(
  '/version',
  createVersionHandler({
    manifestPath: process.env.RELEASE_MANIFEST_PATH || join(__dirname, 'release-manifest.json'),
  })
)

app.get('/privacy', (_req, res) => res.sendFile(join(clientDir, 'privacy/index.html')))

// Gzip/deflate/br compress all responses
app.use(compression({ threshold: 512 }))

// Long cache only for Astro assets and verified content-hashed generated images.
app.use(
  express.static(clientDir, {
    redirect: false,
    setHeaders: createStaticAssetCacheHeaders(clientDir),
  })
)

// Dynamic CMS-backed HTML must be re-rendered on every request.
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})

// Astro SSR for all dynamic/server-rendered routes
app.use((req, res, next) => ssrHandler(req, res, next, { requesterIp: res.locals.requesterIp }))

// Astro's middleware delegates unknown paths to Express; serve the branded 404.
app.use((_req, res) => {
  res.status(404).sendFile(join(clientDir, '404.html'))
})

app.listen(runtime.port, runtime.host, () => {
  console.log(`Server started on http://${runtime.host}:${runtime.port}`)
})
