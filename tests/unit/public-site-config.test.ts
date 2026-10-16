import { describe, expect, it } from 'vitest'

import {
  assertBuildPublicSiteOrigin,
  PublicSiteConfigError,
  resolvePublicSiteConfig,
  resolveViteMode,
} from '../../config/public-site.mjs'

describe('public site origin configuration', () => {
  it.each([
    [['node', 'astro', 'build', '--mode', 'development'], 'development'],
    [['node', 'astro', 'build', '--mode=development'], 'development'],
    [['node', 'astro', 'dev'], 'development'],
    [['node', 'astro', 'build'], 'production'],
  ])('uses the Astro CLI mode when resolving build environment files', (argv, expectedMode) => {
    expect(resolveViteMode(argv)).toBe(expectedMode)
  })

  it('accepts the configured public HTTPS origin for a release build', () => {
    expect(
      resolvePublicSiteConfig({
        DEPLOY_ENVIRONMENT: 'production',
        PUBLIC_SITE_URL: 'https://8.138.148.179/',
      })
    ).toMatchObject({
      origin: 'https://8.138.148.179',
      host: '8.138.148.179',
      isReleaseEnvironment: true,
    })
  })

  it.each([
    {},
    { PUBLIC_SITE_URL: 'http://8.138.148.179' },
    { PUBLIC_SITE_URL: 'https://127.0.0.1:4399' },
    { PUBLIC_SITE_URL: 'https://localhost.:4399' },
    { PUBLIC_SITE_URL: 'https://foo.localhost.:4399' },
    { PUBLIC_SITE_URL: 'https://[::ffff:127.0.0.1]' },
    { PUBLIC_SITE_URL: 'https://0.0.0.0' },
    { PUBLIC_SITE_URL: 'https://[::]' },
    { PUBLIC_SITE_URL: 'https://8.138.148.179/with-a-path' },
  ])('rejects an invalid staging public origin: %o', (extra) => {
    expect(() => resolvePublicSiteConfig({ DEPLOY_ENVIRONMENT: 'staging', ...extra })).toThrow(
      PublicSiteConfigError
    )
  })

  it('allows explicit loopback origins for local and CI builds only', () => {
    for (const deploymentEnvironment of ['ci', '']) {
      expect(
        resolvePublicSiteConfig({
          DEPLOY_ENVIRONMENT: deploymentEnvironment,
          PUBLIC_SITE_URL: 'http://127.0.0.1:4399',
        }).origin
      ).toBe('http://127.0.0.1:4399')
    }
  })

  it('does not reject ordinary public-looking hostnames that start with fc or fd', () => {
    for (const hostname of ['fcdn.example', 'fdn.example', '127foo.example']) {
      expect(
        resolvePublicSiteConfig({
          DEPLOY_ENVIRONMENT: 'production',
          PUBLIC_SITE_URL: `https://${hostname}`,
        }).origin
      ).toBe(`https://${hostname}`)
    }
  })

  it('rejects missing and mismatched release build manifests', () => {
    expect(() =>
      assertBuildPublicSiteOrigin({
        manifest: null,
        runtimeOrigin: 'https://8.138.148.179',
        required: true,
      })
    ).toThrow('Missing build public-origin manifest')
    expect(() =>
      assertBuildPublicSiteOrigin({
        manifest: '{"origin":"https://56xyy.com"}',
        runtimeOrigin: 'https://8.138.148.179',
        required: true,
      })
    ).toThrow('PUBLIC_SITE_URL differs between build')
  })

  it('accepts a matching validated build manifest', () => {
    expect(() =>
      assertBuildPublicSiteOrigin({
        manifest: '{"origin":"https://8.138.148.179"}',
        runtimeOrigin: 'https://8.138.148.179',
        required: true,
      })
    ).not.toThrow()
  })
})
