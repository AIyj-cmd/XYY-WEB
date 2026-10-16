import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export const galleryThumbnailProfile = Object.freeze({
  width: 192,
  height: 192,
  fit: 'outside',
  withoutEnlargement: true,
  format: 'webp',
  quality: 78,
  effort: 4,
})

const manifestFile = 'manifest.json'
const manifestSchemaVersion = 1

async function hashFile(path) {
  return createHash('sha256')
    .update(await readFile(path))
    .digest('hex')
}

async function readManifest(path) {
  try {
    const manifest = JSON.parse(await readFile(path, 'utf8'))
    if (manifest?.schemaVersion === manifestSchemaVersion && manifest.entries) return manifest
  } catch {
    // A missing or invalid cache manifest is regenerated from the catalog.
  }
  return { schemaVersion: manifestSchemaVersion, entries: {} }
}

async function writeAtomically(path, contents) {
  const temporary = `${path}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, contents)
    await rename(temporary, path)
  } finally {
    await rm(temporary, { force: true })
  }
}

async function inspectSource(sharp, path, entry) {
  const metadata = await sharp(path).metadata()
  if (
    metadata.format !== 'webp' ||
    metadata.width !== entry.width ||
    metadata.height !== entry.height
  ) {
    throw new Error(`gallery_thumbnail_source_invalid:${entry.filename}`)
  }
  await sharp(path).raw().toBuffer()
}

async function inspectThumbnail(sharp, path, entry) {
  const metadata = await sharp(path).metadata()
  const scale = Math.min(
    1,
    Math.max(
      galleryThumbnailProfile.width / entry.width,
      galleryThumbnailProfile.height / entry.height
    )
  )
  const expectedWidth = Math.round(entry.width * scale)
  const expectedHeight = Math.round(entry.height * scale)
  if (
    metadata.format !== 'webp' ||
    !metadata.width ||
    !metadata.height ||
    metadata.width !== expectedWidth ||
    metadata.height !== expectedHeight
  ) {
    throw new Error(`gallery_thumbnail_invalid:${entry.filename}`)
  }
  await sharp(path).raw().toBuffer()
  return { width: metadata.width, height: metadata.height, bytes: (await stat(path)).size }
}

function matchesCache(manifest, sharpVersion, entry, sourceHash) {
  return (
    manifest.sharpVersion === sharpVersion &&
    JSON.stringify(manifest.profile) === JSON.stringify(galleryThumbnailProfile) &&
    manifest.entries[entry.filename]?.sourceHash === sourceHash
  )
}

async function buildThumbnail({ sharp, entry, source, destination }) {
  const temporary = join(dirname(destination), `.${entry.filename}.${randomUUID()}.tmp`)
  try {
    await sharp(source)
      .resize(galleryThumbnailProfile.width, galleryThumbnailProfile.height, {
        fit: galleryThumbnailProfile.fit,
        withoutEnlargement: galleryThumbnailProfile.withoutEnlargement,
      })
      .webp({ quality: galleryThumbnailProfile.quality, effort: galleryThumbnailProfile.effort })
      .toFile(temporary)
    const result = await inspectThumbnail(sharp, temporary, entry)
    const thumbnailHash = await hashFile(temporary)
    await rename(temporary, destination)
    return { ...result, thumbnailHash }
  } finally {
    await rm(temporary, { force: true })
  }
}

export async function generateGalleryThumbnails({
  sharp,
  catalog,
  sourceDirectory,
  outputDirectory,
}) {
  const sharpVersion = sharp.versions?.sharp
  if (sharpVersion !== '0.35.4') throw new Error(`gallery_thumbnail_sharp_version:${sharpVersion}`)
  await mkdir(outputDirectory, { recursive: true })
  const previous = await readManifest(join(outputDirectory, manifestFile))
  const entries = {}

  for (const entry of catalog) {
    const source = join(sourceDirectory, entry.filename)
    const destination = join(outputDirectory, entry.filename)
    await inspectSource(sharp, source, entry)
    const sourceHash = await hashFile(source)
    let result
    if (matchesCache(previous, sharpVersion, entry, sourceHash)) {
      try {
        result = await inspectThumbnail(sharp, destination, entry)
        const thumbnailHash = await hashFile(destination)
        if (thumbnailHash !== previous.entries[entry.filename].thumbnailHash) result = undefined
        else result = { ...result, thumbnailHash }
      } catch {
        result = undefined
      }
    }
    if (!result) result = await buildThumbnail({ sharp, entry, source, destination })
    entries[entry.filename] = { sourceHash, ...result }
  }

  for (const entry of catalog)
    await inspectThumbnail(sharp, join(outputDirectory, entry.filename), entry)
  const manifest = {
    schemaVersion: manifestSchemaVersion,
    sharpVersion,
    profile: galleryThumbnailProfile,
    entries,
  }
  await writeAtomically(
    join(outputDirectory, manifestFile),
    `${JSON.stringify(manifest, null, 2)}\n`
  )
  return {
    count: catalog.length,
    totalBytes: Object.values(entries).reduce((total, entry) => total + entry.bytes, 0),
    sharpVersion,
  }
}
