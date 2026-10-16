import { describe, expect, it } from 'vitest'

import { PublicSiteConfigError } from '../../config/public-site.mjs'
import { getRuntimeConfig } from '../../server/runtime-config.mjs'

describe('runtime public site configuration', () => {
  it('keeps domain migration and production-indexing policy independent from public origin', () => {
    expect(
      getRuntimeConfig({
        DEPLOY_ENVIRONMENT: 'production',
        PUBLIC_SITE_URL: 'https://8.138.148.179',
      })
    ).toMatchObject({
      formalOrigin: 'https://56xyy.com',
      formalHost: '56xyy.com',
      publicSiteOrigin: 'https://8.138.148.179',
      isProductionDomain: false,
    })
  })

  it('does not treat the internal Directus endpoint as a public origin input', () => {
    expect(
      getRuntimeConfig({
        DEPLOY_ENVIRONMENT: 'ci',
        PUBLIC_SITE_URL: 'http://127.0.0.1:4399',
        PUBLIC_DIRECTUS_URL: 'http://127.0.0.1:18055',
      }).publicSiteOrigin
    ).toBe('http://127.0.0.1:4399')
  })

  it('fails before startup when a staging release is configured with loopback', () => {
    expect(() =>
      getRuntimeConfig({
        DEPLOY_ENVIRONMENT: 'staging',
        PUBLIC_SITE_URL: 'http://127.0.0.1:18080',
      })
    ).toThrow(PublicSiteConfigError)
  })
})
