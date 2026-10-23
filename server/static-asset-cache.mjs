import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'

const immutableCache = 'public, max-age=31536000, immutable'
const generatedImageName =
  /^(?:[a-z0-9-]+-w[1-9]\d*|share-(?:zh-CN|en))-([a-f0-9]{12})\.(?:webp|png)$/

export function createStaticAssetCacheHeaders(clientDirectory) {
  const generatedDirectory = resolve(clientDirectory, 'media/seo-v1')
  const verifiedVersions = new Map()

  function isVerifiedGeneratedImage(filePath, stat) {
    if (dirname(filePath) !== generatedDirectory) return false
    const match = basename(filePath).match(generatedImageName)
    if (!match) return false

    // Express already supplies this stat. Read/hash only a candidate's first request or change.
    const version = `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`
    const cached = verifiedVersions.get(filePath)
    if (cached?.version === version) return cached.verified
    let verified = false
    try {
      const hash = createHash('sha256').update(readFileSync(filePath)).digest('hex')
      verified = hash.startsWith(match[1])
    } catch {
      // A concurrently removed/unreadable file must never receive immutable caching.
    }
    verifiedVersions.set(filePath, { version, verified })
    return verified
  }

  return (res, filePath, stat) => {
    const absolutePath = resolve(filePath)
    if (/_astro\//.test(filePath) || isVerifiedGeneratedImage(absolutePath, stat)) {
      res.setHeader('Cache-Control', immutableCache)
    } else if (/\.(woff2?|ttf|otf|eot)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000')
    } else if (/\.(png|jpg|jpeg|webp|avif|svg|gif|ico|mp4|webm)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800')
    }
  }
}
