import type { APIRoute } from 'astro'
import { BRAND } from '@/lib/brand'
import { getPublishedNews } from '@/lib/directus'

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
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/cases', priority: '0.8', changefreq: 'monthly' },
  { url: '/news', priority: '0.8', changefreq: 'daily' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
]

const today = new Date().toISOString().split('T')[0]

export const GET: APIRoute = async () => {
  const newsArticles = await getPublishedNews(100, 1)

  const staticEntries = STATIC_PAGES.map(
    ({ url, priority, changefreq }) =>
      `  <url>
    <loc>${BRAND.url}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join('\n')

  const newsEntries = newsArticles
    .map(
      (a) =>
        `  <url>
    <loc>${BRAND.url}/news/${a.slug}</loc>
    <lastmod>${a.date_updated ? a.date_updated.split('T')[0] : a.published_at.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <news:news>
      <news:publication>
        <news:name>${BRAND.name}</news:name>
        <news:language>zh-Hans</news:language>
      </news:publication>
      <news:publication_date>${a.published_at}</news:publication_date>
      <news:title>${a.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
    </news:news>
  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
>
${staticEntries}
${newsEntries}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
