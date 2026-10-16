import { resolvePublicSiteConfig } from '../../config/public-site.mjs'

export const SITE_URL = resolvePublicSiteConfig({
  PUBLIC_SITE_URL: import.meta.env.PUBLIC_SITE_URL as string | undefined,
}).origin
