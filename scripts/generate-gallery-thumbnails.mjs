import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import sharp from 'sharp'

import { readGalleryCatalog } from './lib/gallery-catalog.mjs'
import { generateGalleryThumbnails } from './lib/gallery-thumbnails.mjs'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))

async function main() {
  const catalog = await readGalleryCatalog(join(projectRoot, 'src/data/about/gallery-catalog.ts'))
  const result = await generateGalleryThumbnails({
    sharp,
    catalog,
    sourceDirectory: join(projectRoot, 'public/about/gallery'),
    outputDirectory: join(projectRoot, 'public/about/gallery-thumbnails'),
  })
  console.log(
    `gallery_thumbnails_ready count=${result.count} bytes=${result.totalBytes} sharp=${result.sharpVersion}`
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
