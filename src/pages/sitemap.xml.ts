import type { APIRoute } from 'astro'
import { BRAND } from '@/lib/brand'

const STATIC_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/product', priority: '0.9', changefreq: 'monthly' },
  { url: '/xiefu-yuncang', priority: '0.85', changefreq: 'monthly' },
  { url: '/huadong-xiefu-yuncang', priority: '0.85', changefreq: 'monthly' },
  { url: '/tuihuo-zhijian', priority: '0.85', changefreq: 'monthly' },
  { url: '/houzheng-xiufu', priority: '0.85', changefreq: 'monthly' },
  { url: '/kuajing-yuncang', priority: '0.85', changefreq: 'monthly' },
  { url: '/zhibo-cangpei', priority: '0.85', changefreq: 'monthly' },
  { url: '/huanan-xiefu-yuncang', priority: '0.85', changefreq: 'monthly' },
  { url: '/guangzhou-xiefu-yuncang', priority: '0.85', changefreq: 'monthly' },
  { url: '/b2b-mendian-cangpei', priority: '0.85', changefreq: 'monthly' },
  { url: '/fuzhuang-yuncang', priority: '0.8', changefreq: 'monthly' },
  { url: '/weipinhui-jit-jitx', priority: '0.8', changefreq: 'monthly' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/cases', priority: '0.8', changefreq: 'monthly' },
  { url: '/news', priority: '0.6', changefreq: 'monthly' },
  { url: '/senlinqikan', priority: '0.75', changefreq: 'monthly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
]

// Update this only when the static-page content is materially revised.
const STATIC_CONTENT_LASTMOD = '2026-07-29'

export const GET: APIRoute = async () => {
  const staticEntries = STATIC_PAGES.map(
    ({ url, priority, changefreq }) =>
      `  <url>
    <loc>${BRAND.url}${url}</loc>
    <lastmod>${STATIC_CONTENT_LASTMOD}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
