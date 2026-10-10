import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CMS_SEEDS } from '../../scripts/data/cms-seed-config.mjs'
import { SERVICE_PAGE_CONFIG } from '@/data/service-pages/config'
import { ENGLISH_SERVICE_SOURCES } from '@/i18n/service-source-catalog'
import { translateReviewedService } from '@/i18n/service-sources'
import { ENGLISH_PRODUCT_VIDEO_COPY } from '@/i18n/product'
import {
  ENGLISH_SERVICE_LINKS,
  chinesePathFor,
  englishPathFor,
  isNavigationActive,
} from '@/i18n/routes'
import { __setDirectusRequesterForTests, getFaqs, getServicePageContent } from '@/lib/directus'

const pairs = [
  ['kuajing-yuncang', '/en/cross-border-fulfillment', 'crossborder'],
  ['huanan-xiefu-yuncang', '/en/south-china-fulfillment', 'south'],
  ['huadong-xiefu-yuncang', '/en/east-china-fulfillment', 'east'],
  ['zhibo-cangpei', '/en/livestream-fulfillment', 'live'],
] as const

beforeEach(() => {
  __setDirectusRequesterForTests(null)
  vi.stubEnv('DIRECTUS_URL', 'https://cms.service-test.invalid')
  vi.stubEnv('DIRECTUS_CONTENT_TOKEN', 'synthetic-service-token')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  __setDirectusRequesterForTests(null)
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

function useCms(slug: string, mode: 'seed' | 'empty' | 'changed' | 'unavailable') {
  const seed = CMS_SEEDS.service_pages.find((row) => row.slug === slug)!
  const pages =
    mode === 'empty'
      ? []
      : [{ id: 1, ...seed, ...(mode === 'changed' ? { hero_desc: '运营人员修改的内容' } : {}) }]
  const faqs =
    mode === 'empty'
      ? []
      : CMS_SEEDS.faqs
          .filter((faq) => faq.faqPageKey === slug)
          .map((faq, index) => ({
            id: index + 1,
            sort: index + 1,
            question: faq.question,
            answer: mode === 'changed' && index === 0 ? '运营人员修改的回答' : faq.answer,
          }))
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async (input) => {
      const url = new URL(String(input))
      const filter = JSON.parse(url.searchParams.get('filter') || '{}')
      expect(filter.status).toEqual({ _eq: 'published' })
      if (mode === 'unavailable') return Response.json({ errors: [] }, { status: 503 })
      if (url.pathname === '/items/service_pages') {
        expect(filter.slug).toEqual({ _eq: slug })
        return Response.json({ data: pages })
      }
      expect(url.pathname).toBe('/items/faqs')
      expect(filter.faq_page).toEqual({ key: { _eq: slug } })
      return Response.json({ data: faqs })
    })
  )
}

async function readService(slug: string) {
  const {
    slug: _slug,
    variant: _variant,
    presentation: _presentation,
    faqs,
    ...fallback
  } = SERVICE_PAGE_CONFIG[slug]
  void _slug
  void _variant
  void _presentation
  const [content, faqRows] = await Promise.all([
    getServicePageContent(slug, fallback),
    getFaqs(
      slug,
      faqs.map(({ q, a }) => ({ q, a }))
    ),
  ])
  return { content, faqs: faqRows }
}

describe('four reviewed English service details', () => {
  it.each(pairs)(
    'binds %s to real initial CMS mapping and complete reviewed English',
    async (slug) => {
      useCms(slug, 'seed')
      const catalog = ENGLISH_SERVICE_SOURCES[slug]
      const read = await readService(slug)
      expect(read.content).toEqual(catalog.source)
      expect(read.faqs).toEqual(catalog.sourceFaqs)
      const result = translateReviewedService(catalog, read.content, read.faqs)
      expect(result.content).toEqual(catalog.english)
      expect(result.content.h1).not.toBe('')
      expect(result.content.features).toHaveLength(6)
      expect(result.content.stats).toHaveLength(4)
      expect(result.faqs).toEqual(catalog.englishFaqs)
      expect(result.faqs).toHaveLength(5)
      expect(JSON.stringify(result)).not.toMatch(/[\u3400-\u9fff]|\{\{/)
    }
  )

  it.each(pairs)(
    'accepts only the matching frozen fallback for %s when CMS is unavailable',
    async (slug) => {
      useCms(slug, 'unavailable')
      const catalog = ENGLISH_SERVICE_SOURCES[slug]
      const read = await readService(slug)
      expect(read.content).toEqual(catalog.source)
      expect(read.faqs).toEqual(catalog.sourceFaqs)
      expect(translateReviewedService(catalog, read.content, read.faqs).content).toEqual(
        catalog.english
      )
    }
  )

  it.each(pairs)('keeps successful empty CMS content empty for %s', async (slug) => {
    useCms(slug, 'empty')
    const read = await readService(slug)
    const result = translateReviewedService(ENGLISH_SERVICE_SOURCES[slug], read.content, read.faqs)
    expect(result.content.h1).toBe('')
    expect(result.content.features).toEqual([])
    expect(result.faqs).toEqual([])
  })

  it.each(pairs)('rejects changed CMS text and stale FAQ translation for %s', async (slug) => {
    useCms(slug, 'changed')
    const catalog = ENGLISH_SERVICE_SOURCES[slug]
    const read = await readService(slug)
    const result = translateReviewedService(catalog, read.content, read.faqs)
    expect(result.content.h1).toBe('')
    expect(result.faqs).toEqual(catalog.englishFaqs.slice(1))
  })

  it('links all eight overview and footer services to distinct English details', () => {
    const paths = ENGLISH_PRODUCT_VIDEO_COPY.map(({ href }) => href)
    expect(new Set(paths).size).toBe(8)
    expect(paths.every((path) => !path.includes('#'))).toBe(true)
    expect(ENGLISH_SERVICE_LINKS.map(({ href }) => href)).toEqual(paths)
  })

  it.each(pairs)(
    'registers %s across route pairs, detail identity and discovery',
    (slug, path, presentation) => {
      expect(englishPathFor(`/${slug}`)).toBe(path)
      expect(chinesePathFor(path)).toBe(`/${slug}`)
      expect(isNavigationActive('/en/services', path, 'en')).toBe(true)
      const page = readFileSync(`src/pages${path}.astro`, 'utf8')
      expect(page).toContain(`slug="${slug}"`)
      expect(page).toContain(`presentation="${presentation}"`)
      expect(page).toContain('locale="en"')
      for (const file of [
        'src/pages/en/services.astro',
        'src/pages/sitemap.xml.ts',
        'src/pages/llms.txt.ts',
      ]) {
        expect(readFileSync(file, 'utf8')).toContain(path)
      }
    }
  )
})
