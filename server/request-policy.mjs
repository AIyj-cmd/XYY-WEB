const LEGACY_PATH_REDIRECTS = new Map([
  ['/index.html', '/'],
  ['/about.html', '/about'],
])

function normalizeOriginRelativePath(path) {
  const pathWithoutLeadingSeparators = path.replace(/^[\\/]+/, '')
  const originRelativePath = `/${pathWithoutLeadingSeparators}`

  return originRelativePath !== '/' && originRelativePath.endsWith('/')
    ? originRelativePath.slice(0, -1)
    : originRelativePath
}

export function createCanonicalRedirect(config) {
  return (req, res, next) => {
    const requestHost = req.hostname.toLowerCase()
    const forwardedProto = (req.get('x-forwarded-proto') || req.protocol)
      .split(',')[0]
      .trim()
      .toLowerCase()
    const query = req.originalUrl.includes('?')
      ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
      : ''
    const mappedPath = LEGACY_PATH_REDIRECTS.get(req.path) || req.path
    const normalizedPath = normalizeOriginRelativePath(mappedPath)

    const isFormalHost =
      requestHost === config.formalHost || requestHost === `www.${config.formalHost}`
    const isLegacyHost = config.legacyHosts.has(requestHost)
    const needsFormalOrigin =
      (isFormalHost && (requestHost !== config.formalHost || forwardedProto !== 'https')) ||
      (config.enableDomainRedirects && isLegacyHost)

    if (needsFormalOrigin) {
      return res.redirect(301, `${config.formalOrigin}${normalizedPath}${query}`)
    }
    if (normalizedPath !== req.path) return res.redirect(301, `${normalizedPath}${query}`)
    next()
  }
}

export function createSecurityHeaders(config) {
  return (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    if (!config.isProductionDomain) res.setHeader('X-Robots-Tag', 'noindex, nofollow')
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
        `connect-src 'self' ${config.publicSiteOrigin || config.formalOrigin}`,
      ].join('; ')
    )
    next()
  }
}
