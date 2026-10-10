import type { APIRoute } from 'astro'
import { BRAND } from '@/lib/brand'
import { CASE_FALLBACKS } from '@/data/cases'
import { getWhitepapers } from '@/data/whitepapers'
import { getCases, getPublishedEnglishNews, getPublishedNews } from '@/lib/directus'
import { translateCases } from '@/i18n/cases'
import { localizedCasePath } from '@/i18n/case-routes'

const STATIC_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/product', priority: '0.9', changefreq: 'monthly' },
  { url: '/xiefu-yuncang', priority: '0.85', changefreq: 'monthly' },
  { url: '/huadong-xiefu-yuncang', priority: '0.85', changefreq: 'monthly' },
  { url: '/tuihuo-zhijian', priority: '0.85', changefreq: 'monthly' },
  { url: '/houzheng-xiufu', priority: '0.85', changefreq: 'monthly' },
  { url: '/wuliu-shuzihua', priority: '0.8', changefreq: 'monthly' },
  { url: '/yundao-zhineng-jijian', priority: '0.8', changefreq: 'monthly' },
  { url: '/kuajing-yuncang', priority: '0.85', changefreq: 'monthly' },
  { url: '/zhibo-cangpei', priority: '0.85', changefreq: 'monthly' },
  { url: '/huanan-xiefu-yuncang', priority: '0.85', changefreq: 'monthly' },
  { url: '/b2b-mendian-cangpei', priority: '0.85', changefreq: 'monthly' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/cases', priority: '0.8', changefreq: 'monthly' },
  { url: '/news', priority: '0.6', changefreq: 'monthly' },
  { url: '/supply-chain-whitepapers/', priority: '0.75', changefreq: 'monthly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
]

const ENGLISH_STATIC_PAGES = [
  '/en',
  '/en/services',
  '/en/apparel-fulfillment',
  '/en/cross-border-fulfillment',
  '/en/south-china-fulfillment',
  '/en/east-china-fulfillment',
  '/en/livestream-fulfillment',
  '/en/returns-inspection',
  '/en/garment-care',
  '/en/retail-distribution',
  '/en/digital-operations',
  '/en/smart-shipping',
  '/en/about',
  '/en/cases',
  '/en/news',
  '/en/supply-chain-whitepapers',
  '/en/contact',
  '/en/privacy',
].map((url) => ({ url, priority: url === '/en' ? '0.8' : '0.6', changefreq: 'monthly' }))

// Update this only when the static-page content is materially revised.
const STATIC_CONTENT_LASTMOD = '2026-08-08'

export const GET: APIRoute = async () => {
  const staticEntries = [...STATIC_PAGES, ...ENGLISH_STATIC_PAGES]
    .map(
      ({ url, priority, changefreq }) =>
        `  <url>
    <loc>${BRAND.url}${url}</loc>
    <lastmod>${STATIC_CONTENT_LASTMOD}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('\n')

  const [cases, news, englishNews] = await Promise.all([
    getCases(CASE_FALLBACKS),
    getPublishedNews(500, 1),
    getPublishedEnglishNews(500, 1),
  ])
  const caseEntries = cases
    .filter((item) => item.slug)
    .map(
      (item) => `  <url>
    <loc>${BRAND.url}/cases/${encodeURIComponent(item.slug!)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>`
    )
    .join('\n')
  const englishCaseEntries = translateCases(cases, 'cases')
    .flatMap((item) => {
      const path = localizedCasePath(item, 'en')
      return path
        ? [
            `  <url>
    <loc>${BRAND.url}${path}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
          ]
        : []
    })
    .join('\n')

  const newsEntries = news
    .map(
      (article) => `  <url>
    <loc>${BRAND.url}/news/${encodeURIComponent(article.slug)}</loc>
    <lastmod>${article.published_at.slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('\n')
  const englishNewsEntries = englishNews
    .map(
      (article) => `  <url>
    <loc>${BRAND.url}/en/news/${encodeURIComponent(article.slug)}</loc>
    <lastmod>${article.published_at.slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('\n')
  const whitepaperEntries = getWhitepapers()
    .map(
      (article) => `  <url>
    <loc>${BRAND.url}/supply-chain-whitepapers/${encodeURIComponent(article.issue)}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${caseEntries}
${englishCaseEntries}
${newsEntries}
${englishNewsEntries}
${whitepaperEntries}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
