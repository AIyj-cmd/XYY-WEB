import { createHash } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { basename, extname, join, resolve } from 'node:path'
import sharp from 'sharp'
import { renderShareCard } from './lib/share-card-template.mjs'

const root = resolve(import.meta.dirname, '..')
const output = '/media/seo-v1'
const checkOnly = process.argv.includes('--check')
const hash = (data) => createHash('sha256').update(data).digest('hex')
const assets = [
  { source: '/logo.png', widths: [192, 384, 768], lossless: true },
  { source: '/index.webp', widths: [768, 1280, 1920], quality: 60 },
  { source: '/w-apparel-home.webp', widths: [640, 960, 1448], quality: 60 },
  { source: '/w-home-return-inspection.webp', widths: [640, 960, 1448], quality: 72 },
  { source: '/w-fulfill-system-dashboard.png', widths: [640, 979], quality: 90 },
  ...[
    '/yundao-logistics-list.png',
    '/yundao-order-list.png',
    '/yundao-alerts.png',
    '/yundao-report.png',
  ].map((source) => ({ source, widths: [480, 960], quality: 90 })),
  ...['ur', 'maxrieny', 'xingmian', 'meiyi', 'romi-studio', 'inman'].map((name) => ({
    source: `/images/cases/${name}.webp`,
    widths: [480, 800, 960, 1200],
    quality: 84,
  })),
  { source: '/images/social/wechat-official-account.jpg', widths: [258], lossless: true },
]

async function save(path, data) {
  if (checkOnly) {
    const actual = await readFile(path)
    if (!actual.equals(data)) throw new Error(`Generated image differs: ${path}`)
  } else {
    await mkdir(resolve(path, '..'), { recursive: true })
    await writeFile(path, data)
  }
}

async function saveImage(name, buffer, extension) {
  const sha256 = hash(buffer)
  const src = `${output}/${name}-${sha256.slice(0, 12)}.${extension}`
  await save(join(root, 'public', src), buffer)
  const { width, height } = await sharp(buffer).metadata()
  return { src, width, height, bytes: buffer.length, sha256 }
}

async function main() {
  const images = {}
  for (const asset of assets) {
    const original = await readFile(join(root, 'public', asset.source))
    const { width, height } = await sharp(original).metadata()
    const widths = [...new Set(asset.widths.map((size) => Math.min(size, width)))]
    const variants = []
    for (const size of widths) {
      const encoded = await sharp(original)
        .resize({ width: size, withoutEnlargement: true })
        .webp({ quality: asset.quality ?? 100, lossless: asset.lossless ?? false, effort: 6 })
        .toBuffer()
      const name = `${basename(asset.source, extname(asset.source))}-w${size}`
      variants.push(await saveImage(name, encoded, 'webp'))
    }
    images[asset.source] = {
      width,
      height,
      originalBytes: original.length,
      originalSha256: hash(original),
      variants,
    }
  }
  const shareCards = {}
  for (const locale of ['zh-CN', 'en']) {
    shareCards[locale] = await saveImage(
      `share-${locale}`,
      await renderShareCard(root, locale),
      'png'
    )
  }
  const manifest = { sharpVersion: sharp.versions.sharp, images, shareCards }
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`
  await save(join(root, 'src/data/site-images.json'), Buffer.from(serialized))
  console.log(
    `${checkOnly ? 'Verified' : 'Generated'} ${assets.length} image families and 2 share cards`
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
