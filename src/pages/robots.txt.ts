import type { APIRoute } from 'astro'
import { BRAND } from '@/lib/brand'

export const GET: APIRoute = () => {
  const content = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_astro/

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
