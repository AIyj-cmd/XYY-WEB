import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const REQUEST_TIMEOUT_MS = 5000
const pages = {
  '/': { language: 'zh-Hans', brand: '新亦源' },
  '/en': { language: 'en', brand: 'XINYIYUAN' },
}

function localOrigin(port) {
  return `http://127.0.0.1:${port}`
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function requireType(response, path, type) {
  if (response.status !== 200)
    throw new Error(`local_dev_identity_${path}_status:${response.status}`)
  if (!response.headers.get('content-type')?.toLowerCase().startsWith(type))
    throw new Error(`local_dev_identity_${path}_type`)
}

async function request(origin, path, timeoutMs) {
  return fetch(`${origin}${path}`, {
    redirect: 'manual',
    signal: globalThis.AbortSignal.timeout(timeoutMs),
  })
}

function requirePageIdentity(path, body, expected) {
  if (!body.includes(`<html lang="${expected.language}"`))
    throw new Error(`local_dev_identity_${path}_language`)
  const title = body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim()
  if (!title?.includes(expected.brand)) throw new Error(`local_dev_identity_${path}_title`)
  const heading = body
    .match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    ?.replace(/<[^>]+>/g, '')
    .trim()
  if (!heading) throw new Error(`local_dev_identity_${path}_heading`)
}

function transient(error) {
  if (error?.name === 'TimeoutError' || error instanceof TypeError) return true
  return /_status:5\d\d$/.test(error instanceof Error ? error.message : '')
}

export async function localLogoHash(projectRoot) {
  return sha256(await readFile(join(projectRoot, 'public', 'logo.png')))
}

export async function verifyLocalDevIdentity({
  projectRoot,
  port,
  timeoutMs = REQUEST_TIMEOUT_MS,
}) {
  const origin = localOrigin(port)
  const expectedLogoHash = await localLogoHash(projectRoot)
  const [chinese, english, viteClient, logo] = await Promise.all([
    request(origin, '/', timeoutMs),
    request(origin, '/en', timeoutMs),
    request(origin, '/@vite/client', timeoutMs),
    request(origin, '/logo.png', timeoutMs),
  ])
  requireType(chinese, '/', 'text/html')
  requireType(english, '/en', 'text/html')
  requireType(viteClient, '/@vite/client', 'text/javascript')
  requireType(logo, '/logo.png', 'image/png')

  const [chineseBody, englishBody, viteBody, logoBytes] = await Promise.all([
    chinese.text(),
    english.text(),
    viteClient.text(),
    logo.arrayBuffer(),
  ])
  requirePageIdentity('/', chineseBody, pages['/'])
  requirePageIdentity('/en', englishBody, pages['/en'])
  if (!viteBody.includes('createHotContext') || !viteBody.includes('vite:beforeUpdate'))
    throw new Error('local_dev_identity_vite_client')
  const logoHash = sha256(Buffer.from(logoBytes))
  if (logoHash !== expectedLogoHash) throw new Error('local_dev_identity_logo_hash')

  return { origin, logoHash }
}

export async function waitForLocalDevIdentity({ projectRoot, port, deadlineMs = 60_000 }) {
  const deadline = Date.now() + deadlineMs
  let lastError
  while (Date.now() < deadline) {
    try {
      return await verifyLocalDevIdentity({
        projectRoot,
        port,
        timeoutMs: Math.max(1, Math.min(REQUEST_TIMEOUT_MS, deadline - Date.now())),
      })
    } catch (error) {
      lastError = error
      if (!transient(error)) throw error
      const remaining = deadline - Date.now()
      if (remaining > 0) await delay(Math.min(250, remaining))
    }
  }
  throw lastError ?? new Error('local_dev_identity_timeout')
}
