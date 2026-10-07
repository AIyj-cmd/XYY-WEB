import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const vendorDir = resolve(root, 'scripts/vendor/http-cache-semantics')
const require = createRequire(import.meta.url)

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const [packageText, source, lockText] = await Promise.all([
  readFile(resolve(vendorDir, 'package.json'), 'utf8'),
  readFile(resolve(vendorDir, 'index.js')),
  readFile(resolve(root, 'package-lock.json'), 'utf8'),
])
const manifest = JSON.parse(packageText)
const lock = JSON.parse(lockText)
const resolved = require.resolve('http-cache-semantics')

assert(manifest.version === '4.2.0-xyy.1', 'local_patch_version_mismatch')
assert(
  manifest.xyyLocalPatch?.upstreamIndexSha256 ===
    '01b7d66c854b2fe53ac05c98feb6e0d64722ab8898a778e2d2426a8b468d178f',
  'local_patch_upstream_provenance_mismatch'
)
assert(
  sha256(source) === '60318d6615aa1c7cbce1df85909ba67ac632f761dec33cea64ca3e32083c11a3',
  'local_patch_source_hash_mismatch'
)
assert(
  lock.packages?.['node_modules/http-cache-semantics']?.resolved ===
    'scripts/vendor/http-cache-semantics',
  'lockfile_does_not_resolve_local_patch'
)
assert(resolved === resolve(vendorDir, 'index.js'), 'runtime_does_not_resolve_local_patch')

const CachePolicy = require('http-cache-semantics')
const policy = new CachePolicy(
  { method: 'GET', url: 'https://cache.test/image.png', headers: { host: 'cache.test' } },
  {
    status: 200,
    headers: {
      date: new Date().toUTCString(),
      'cache-control': 'max-age=1, stale-while-revalidate=120',
      'set-cookie': 'private=1',
    },
  }
)
policy.now = () => policy._responseTime + 2_000
assert(policy.timeToLive() === 0, 'local_patch_behavior_mismatch')

const remote = await import(
  pathToFileURL(resolve(root, 'node_modules/astro/dist/assets/build/remote.js')).href
)
const image = await remote.loadRemoteImage(
  'https://images.test/synthetic.png',
  async () =>
    new Response('image', {
      headers: {
        date: new Date().toUTCString(),
        'cache-control': 'max-age=1, stale-while-revalidate=120',
        'set-cookie': 'private=1',
      },
    })
)
assert(image.expires <= Date.now() + 100, 'astro_does_not_observe_local_patch')
console.log(JSON.stringify({ status: 'ok', sourceSha256: sha256(source), resolved }))
