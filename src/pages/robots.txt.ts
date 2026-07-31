import type { APIRoute } from 'astro'
import { BRAND } from '@/lib/brand'

export const GET: APIRoute = () => {
  const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /cms/
Disallow: /preview/
Disallow: /search?

User-agent: OAI-SearchBot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /cms/
Disallow: /preview/
Disallow: /search?

User-agent: GPTBot
Disallow: /

# Sitemaps
Sitemap: ${BRAND.url}/sitemap.xml
`
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
