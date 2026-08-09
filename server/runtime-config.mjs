const FORMAL_ORIGIN = 'https://56xyy.com'
const FORMAL_HOST = '56xyy.com'

export function getRuntimeConfig(env = process.env) {
  const publicSiteOrigin = (env.PUBLIC_SITE_URL ?? '').replace(/\/+$/, '')
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
    publicSiteOrigin,
    legacyHosts,
    enableDomainRedirects: env.ENABLE_DOMAIN_REDIRECTS === 'true',
    isProductionDomain: publicSiteOrigin === FORMAL_ORIGIN,
  }
}
