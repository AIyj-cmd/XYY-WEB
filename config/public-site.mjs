/* global URL */

export const DEFAULT_PUBLIC_SITE_ORIGIN = 'https://56xyy.com'
export const PUBLIC_SITE_ORIGIN_MANIFEST = 'public-site-origin.json'

const RELEASE_ENVIRONMENTS = new Set(['staging', 'production'])

export class PublicSiteConfigError extends Error {
  constructor(message) {
    super(message)
    this.name = 'PublicSiteConfigError'
  }
}

export function resolveViteMode(argv) {
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument.startsWith('--mode=')) return argument.slice('--mode='.length)
    if (argument === '--mode' && argv[index + 1]) return argv[index + 1]
  }

  return argv.includes('dev') ? 'development' : 'production'
}

function normalizeDeploymentEnvironment(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function isNonPublicHost(hostname) {
  const host = hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '')
  if (host === 'localhost' || host.endsWith('.localhost')) return true

  if (host.includes(':')) {
    return (
      host === '::' ||
      host === '::1' ||
      host === '0:0:0:0:0:0:0:1' ||
      host.startsWith('::ffff:') ||
      host.startsWith('fc') ||
      host.startsWith('fd') ||
      host.startsWith('fe80:')
    )
  }

  if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) return false
  const [first, second] = host.split('.').map(Number)
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19))
  )
}

function parsePublicSiteOrigin(value, { requirePublicHttps }) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new PublicSiteConfigError('PUBLIC_SITE_URL must be a non-empty absolute origin')
  }

  let url
  try {
    url = new URL(value.trim())
  } catch {
    throw new PublicSiteConfigError('PUBLIC_SITE_URL must be a valid absolute origin')
  }

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new PublicSiteConfigError(
      'PUBLIC_SITE_URL must be an HTTP(S) origin without credentials, path, query, or fragment'
    )
  }

  if (requirePublicHttps && (url.protocol !== 'https:' || isNonPublicHost(url.hostname))) {
    throw new PublicSiteConfigError(
      'PUBLIC_SITE_URL must be a publicly routable HTTPS origin for staging and production'
    )
  }

  return url.origin
}

export function resolvePublicSiteConfig(env = process.env) {
  const deploymentEnvironment = normalizeDeploymentEnvironment(env.DEPLOY_ENVIRONMENT)
  const isReleaseEnvironment = RELEASE_ENVIRONMENTS.has(deploymentEnvironment)
  const configuredOrigin = env.PUBLIC_SITE_URL

  if (isReleaseEnvironment && !configuredOrigin?.trim()) {
    throw new PublicSiteConfigError(
      'PUBLIC_SITE_URL is required when DEPLOY_ENVIRONMENT is staging or production'
    )
  }

  const origin = parsePublicSiteOrigin(configuredOrigin || DEFAULT_PUBLIC_SITE_ORIGIN, {
    requirePublicHttps: isReleaseEnvironment,
  })

  return {
    deploymentEnvironment,
    isReleaseEnvironment,
    origin,
    host: new URL(origin).hostname.toLowerCase(),
  }
}

export function createPublicSiteOriginManifestPlugin(origin) {
  let isSsrBuild = false

  return {
    name: 'xyy:public-site-origin-manifest',
    apply: 'build',
    configResolved(config) {
      isSsrBuild = Boolean(config.build.ssr)
    },
    generateBundle() {
      if (!isSsrBuild) return
      this.emitFile({
        type: 'asset',
        fileName: PUBLIC_SITE_ORIGIN_MANIFEST,
        source: `${JSON.stringify({ origin })}\n`,
      })
    },
  }
}

export function assertBuildPublicSiteOrigin({ manifest, runtimeOrigin, required }) {
  if (!manifest) {
    if (required) {
      throw new PublicSiteConfigError(
        `Missing build public-origin manifest: ${PUBLIC_SITE_ORIGIN_MANIFEST}`
      )
    }
    return
  }

  let buildOrigin
  try {
    const parsed = JSON.parse(manifest)
    buildOrigin = parsePublicSiteOrigin(parsed.origin, { requirePublicHttps: required })
  } catch (error) {
    if (error instanceof PublicSiteConfigError) throw error
    throw new PublicSiteConfigError(`Invalid build public-origin manifest: ${error.message}`)
  }

  if (buildOrigin !== runtimeOrigin) {
    throw new PublicSiteConfigError(
      `PUBLIC_SITE_URL differs between build (${buildOrigin}) and runtime (${runtimeOrigin})`
    )
  }
}
