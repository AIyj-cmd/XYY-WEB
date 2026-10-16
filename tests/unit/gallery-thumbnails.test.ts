import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import sharp from 'sharp'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { readGalleryCatalog } from '../../scripts/lib/gallery-catalog.mjs'
import {
  galleryThumbnailProfile,
  generateGalleryThumbnails,
} from '../../scripts/lib/gallery-thumbnails.mjs'

const sourceDirectory = 'public/about/gallery'
const catalog = await readGalleryCatalog('src/data/about/gallery-catalog.ts')
const entries = catalog.slice(0, 2)
const workspaces: string[] = []

async function smallFixture(width = 100, height = 80) {
  const sourceDirectory = await mkdtemp(join(tmpdir(), 'xyy-gallery-source-'))
  workspaces.push(sourceDirectory)
  await sharp({ create: { width, height, channels: 3, background: { r: 30, g: 90, b: 160 } } })
    .webp()
    .toFile(join(sourceDirectory, 'fixture.webp'))
  return {
    sourceDirectory,
    catalog: [{ id: 'fixture', width, height, scene: 'archive', filename: 'fixture.webp' }],
  }
}

afterEach(async () => {
  await Promise.all(workspaces.splice(0).map((path) => rm(path, { recursive: true, force: true })))
})

describe('gallery thumbnail generation', () => {
  it('generates decodable profile-sized outputs and a manifest', async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), 'xyy-gallery-unit-'))
    workspaces.push(outputDirectory)
    const result = await generateGalleryThumbnails({
      sharp,
      catalog: entries,
      sourceDirectory,
      outputDirectory,
    })
    expect(result).toMatchObject({ count: 2, sharpVersion: '0.35.5' })
    const manifest = JSON.parse(await readFile(join(outputDirectory, 'manifest.json'), 'utf8'))
    expect(manifest.profile).toEqual(galleryThumbnailProfile)
    for (const entry of entries) {
      const metadata = await sharp(join(outputDirectory, entry.filename)).metadata()
      expect(metadata.format).toBe('webp')
      const scale = Math.min(
        1,
        Math.max(
          galleryThumbnailProfile.width / entry.width,
          galleryThumbnailProfile.height / entry.height
        )
      )
      expect(metadata.width).toBe(Math.round(entry.width * scale))
      expect(metadata.height).toBe(Math.round(entry.height * scale))
      expect(manifest.entries[entry.filename].sourceHash).toMatch(/^[a-f0-9]{64}$/)
    }
  })

  it('reuses a valid cache and regenerates a corrupted output', async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), 'xyy-gallery-unit-'))
    workspaces.push(outputDirectory)
    await generateGalleryThumbnails({ sharp, catalog: entries, sourceDirectory, outputDirectory })
    const first = await readFile(join(outputDirectory, 'manifest.json'), 'utf8')
    await generateGalleryThumbnails({ sharp, catalog: entries, sourceDirectory, outputDirectory })
    expect(await readFile(join(outputDirectory, 'manifest.json'), 'utf8')).toBe(first)
    await writeFile(join(outputDirectory, entries[0].filename), 'corrupt')
    await generateGalleryThumbnails({ sharp, catalog: entries, sourceDirectory, outputDirectory })
    await expect(
      sharp(join(outputDirectory, entries[0].filename)).metadata()
    ).resolves.toMatchObject({ format: 'webp' })
  })

  it('rejects vulnerable Sharp before processing an image', async () => {
    const vulnerableSharp = Object.assign(vi.fn(), { versions: { sharp: '0.35.4' } })
    const outputDirectory = await mkdtemp(join(tmpdir(), 'xyy-gallery-unit-'))
    workspaces.push(outputDirectory)
    await expect(
      generateGalleryThumbnails({
        sharp: vulnerableSharp,
        catalog: [entries[0]],
        sourceDirectory,
        outputDirectory,
      })
    ).rejects.toThrow('gallery_thumbnail_sharp_version:0.35.4')
    expect(vulnerableSharp).not.toHaveBeenCalled()
  })

  it('regenerates instead of reusing a cache written by vulnerable Sharp', async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), 'xyy-gallery-unit-'))
    workspaces.push(outputDirectory)
    await generateGalleryThumbnails({
      sharp,
      catalog: [entries[0]],
      sourceDirectory,
      outputDirectory,
    })
    const manifestPath = join(outputDirectory, 'manifest.json')
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    await writeFile(manifestPath, JSON.stringify({ ...manifest, sharpVersion: '0.35.4' }))
    const toFile = vi.spyOn(sharp.prototype, 'toFile')
    try {
      await generateGalleryThumbnails({
        sharp,
        catalog: [entries[0]],
        sourceDirectory,
        outputDirectory,
      })
      expect(toFile).toHaveBeenCalledTimes(1)
    } finally {
      toFile.mockRestore()
    }
    expect(JSON.parse(await readFile(manifestPath, 'utf8')).sharpVersion).toBe('0.35.5')
  })

  it('fails visibly when a catalog source is missing', async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), 'xyy-gallery-unit-'))
    const missingSourceDirectory = await mkdtemp(join(tmpdir(), 'xyy-gallery-unit-source-'))
    workspaces.push(outputDirectory, missingSourceDirectory)
    await expect(
      generateGalleryThumbnails({
        sharp,
        catalog: [entries[0]],
        sourceDirectory: missingSourceDirectory,
        outputDirectory,
      })
    ).rejects.toThrow(/Input file is missing|ENOENT/)
  })

  it('keeps a known small source at native size without enlargement', async () => {
    const { sourceDirectory, catalog } = await smallFixture()
    const outputDirectory = await mkdtemp(join(tmpdir(), 'xyy-gallery-unit-'))
    workspaces.push(outputDirectory)
    await generateGalleryThumbnails({ sharp, catalog, sourceDirectory, outputDirectory })
    await expect(sharp(join(outputDirectory, 'fixture.webp')).metadata()).resolves.toMatchObject({
      format: 'webp',
      width: 100,
      height: 80,
    })
  })

  it('invalidates changed source/profile cache and leaves no temporary file on output failure', async () => {
    const { sourceDirectory, catalog } = await smallFixture()
    const outputDirectory = await mkdtemp(join(tmpdir(), 'xyy-gallery-unit-'))
    workspaces.push(outputDirectory)
    await generateGalleryThumbnails({ sharp, catalog, sourceDirectory, outputDirectory })
    const first = JSON.parse(await readFile(join(outputDirectory, 'manifest.json'), 'utf8'))
    await sharp({ create: { width: 100, height: 80, channels: 3, background: 'orange' } })
      .webp()
      .toFile(join(sourceDirectory, 'fixture.webp'))
    await writeFile(
      join(outputDirectory, 'manifest.json'),
      JSON.stringify({ ...first, profile: { ...first.profile, width: 1 } })
    )
    await generateGalleryThumbnails({ sharp, catalog, sourceDirectory, outputDirectory })
    const second = JSON.parse(await readFile(join(outputDirectory, 'manifest.json'), 'utf8'))
    expect(second.profile).toEqual(galleryThumbnailProfile)
    expect(second.entries['fixture.webp'].sourceHash).not.toBe(
      first.entries['fixture.webp'].sourceHash
    )

    await rm(join(outputDirectory, 'fixture.webp'), { force: true })
    await mkdir(join(outputDirectory, 'fixture.webp'))
    await expect(
      generateGalleryThumbnails({ sharp, catalog, sourceDirectory, outputDirectory })
    ).rejects.toThrow()
    expect((await readdir(outputDirectory)).filter((name) => name.endsWith('.tmp'))).toEqual([])
  })

  it('rejects invalid source dimensions and image bytes', async () => {
    const { sourceDirectory, catalog } = await smallFixture(100, 81)
    const outputDirectory = await mkdtemp(join(tmpdir(), 'xyy-gallery-unit-'))
    workspaces.push(outputDirectory)
    await expect(
      generateGalleryThumbnails({
        sharp,
        catalog: [{ ...catalog[0], height: 80 }],
        sourceDirectory,
        outputDirectory,
      })
    ).rejects.toThrow('gallery_thumbnail_source_invalid:fixture.webp')
    await writeFile(join(sourceDirectory, 'fixture.webp'), 'invalid-image')
    await expect(
      generateGalleryThumbnails({ sharp, catalog, sourceDirectory, outputDirectory })
    ).rejects.toThrow()
  })
})
