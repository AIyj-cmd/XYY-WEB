import { resolvePublicSiteConfig } from '../config/public-site.mjs'

const FORMAL_ORIGIN = 'https://56xyy.com'
const FORMAL_HOST = '56xyy.com'

export function getRuntimeConfig(env = process.env) {
  const publicSite = resolvePublicSiteConfig(env)
  const legacyHosts = new Set(
    (env.LEGACY_DOMAINS || 'wz.tomatopia.top')
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean)
  )

  return {
    port: env.PORT || 4321,
    host: env.HOST || '0.0.0.0',
    formalOrigin: FORMAL_ORIGIN,
    formalHost: FORMAL_HOST,
    publicSiteOrigin: publicSite.origin,
    legacyHosts,
    enableDomainRedirects: env.ENABLE_DOMAIN_REDIRECTS === 'true',
    isReleaseEnvironment: publicSite.isReleaseEnvironment,
    isProductionDomain: publicSite.origin === FORMAL_ORIGIN,
  }
}
