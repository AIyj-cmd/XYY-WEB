import { createServer, type Server, type ServerResponse } from 'node:http'
import { once } from 'node:events'
import { startEnglishNewsFixtureApp } from './english-news-fixture-app'

const imageIds = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555',
  '66666666-6666-4666-8666-666666666666',
] as const
const draftId = '77777777-7777-4777-8777-777777777777'
const futureId = '88888888-8888-4888-8888-888888888888'
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL2ZQAAAABJRU5ErkJggg==',
  'base64'
)

type NewsRecord = {
  id: number
  status: 'published' | 'draft'
  slug: string
  title: string
  summary: string
  content: string
  category: string
  published_at: string
}

function articleImage(id: string, index = -1) {
  if (index === 0) {
    return `<img src="https://cdn.example.test/fallback.png" srcset="http://127.0.0.1:4399/assets/${id}.png?access_token=discarded 1x" alt="正文图片">`
  }
  if (index === 1) {
    return `<img srcset="https://cdn.example.test/fallback.png 1x, http://127.0.0.1:4399/assets/${id}.png?token=discarded 2x" alt="正文图片">`
  }
  return `<img src="http://127.0.0.1:4399/assets/${id}.png?width=1080&height=810" alt="正文图片">`
}

function responseJson(response: ServerResponse, data: unknown) {
  response.statusCode = 200
  response.setHeader('content-type', 'application/json')
  response.end(JSON.stringify({ data }))
}

function selectedFields(url: URL) {
  return url.searchParams.get('fields')?.split(',') ?? []
}

function projectFields(record: NewsRecord, fields: string[]) {
  if (!fields.length || fields.includes('*')) return record
  return Object.fromEntries(
    fields
      .filter((field) => field in record)
      .map((field) => [field, record[field as keyof NewsRecord]])
  )
}

async function listen(server: Server) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('fixture server did not expose a port')
  return address.port
}

export async function startNewsImageFixture() {
  const now = Date.now()
  const news: NewsRecord[] = [
    {
      id: 1,
      status: 'published',
      slug: 'inline-image-fixture',
      title: '正文图片代理测试',
      summary: '用于验证公开正文图片通过受控代理交付。',
      content: imageIds.map(articleImage).join(''),
      category: '行业资讯',
      published_at: new Date(now - 60_000).toISOString(),
    },
    {
      id: 2,
      status: 'draft',
      slug: 'draft-inline-image',
      title: '草稿图片',
      summary: '草稿不可公开。',
      content: articleImage(draftId),
      category: '行业资讯',
      published_at: new Date(now - 60_000).toISOString(),
    },
    {
      id: 3,
      status: 'published',
      slug: 'future-inline-image',
      title: '未来图片',
      summary: '未来文章不可公开。',
      content: articleImage(futureId),
      category: '行业资讯',
      published_at: new Date(now + 86_400_000).toISOString(),
    },
  ]
  const upstreamAssetRequests: string[] = []
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1')
    if (request.method === 'GET' && url.pathname.startsWith('/items/')) {
      const collection = url.pathname.split('/')[2]
      const fields = selectedFields(url)
      return responseJson(
        response,
        collection === 'news' ? news.map((record) => projectFields(record, fields)) : []
      )
    }
    if (request.method === 'GET' && url.pathname.startsWith('/assets/')) {
      const id = url.pathname.slice('/assets/'.length)
      if (request.headers.authorization !== 'Bearer english-news-fixture-token') {
        response.statusCode = 403
        response.end('forbidden')
        return
      }
      upstreamAssetRequests.push(id)
      if (!imageIds.includes(id as (typeof imageIds)[number])) {
        response.statusCode = 404
        response.end('not found')
        return
      }
      response.statusCode = 200
      response.setHeader('content-type', 'image/png')
      response.end(png)
      return
    }
    response.statusCode = 404
    response.end('not found')
  })
  const port = await listen(server)
  const cmsUrl = `http://127.0.0.1:${port}`
  const app = await startEnglishNewsFixtureApp(cmsUrl)
  return {
    app,
    cmsUrl,
    imageIds,
    draftId,
    futureId,
    upstreamAssetRequests,
    async close() {
      await app.close()
      server.close()
      await once(server, 'close')
    },
  }
}
