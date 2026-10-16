import { readdir } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

import { parseGalleryCatalog, readGalleryCatalog } from '../../scripts/lib/gallery-catalog.mjs'

const catalogPath = 'src/data/about/gallery-catalog.ts'
type CatalogEntry = { id: string; filename: string; width: number; height: number; scene: string }

describe('gallery catalog source contract', () => {
  it('keeps the 157 original ids, dimensions, and source filenames stable', async () => {
    const catalog = await readGalleryCatalog(catalogPath)
    const sourceFiles = (await readdir('public/about/gallery'))
      .filter((file) => /^gallery-\d+\.webp$/.test(file))
      .sort()
    expect(catalog).toHaveLength(157)
    const typedCatalog = catalog as CatalogEntry[]
    expect(new Set(typedCatalog.map((entry) => entry.id)).size).toBe(157)
    expect(typedCatalog.map((entry) => entry.filename).sort()).toEqual(sourceFiles)
    for (const entry of typedCatalog) {
      expect(entry.width).toBeGreaterThan(0)
      expect(entry.height).toBeGreaterThan(0)
      expect(entry.scene).toMatch(/^[a-z-]+$/)
    }
  })

  it('rejects empty, spread, duplicate, computed, and malformed catalog entries', () => {
    expect(() => parseGalleryCatalog('const galleryCatalog = []')).toThrow(
      'galleryCatalog_must_not_be_empty'
    )
    expect(() => parseGalleryCatalog('const galleryCatalog = [...items]')).toThrow(
      'entry_1_must_be_gallery_literal_call'
    )
    expect(() => parseGalleryCatalog('const galleryCatalog = [')).toThrow('typescript_parse_error')
    expect(() =>
      parseGalleryCatalog(
        `const galleryCatalog = [gallery(1, 10, 10, 'archive'), gallery(1, 10, 10, 'archive')]`
      )
    ).toThrow('duplicate_id_1')
    expect(() =>
      parseGalleryCatalog(`const galleryCatalog = [gallery(id, 10, 10, 'archive')]`)
    ).toThrow('id_must_be_numeric_literal')
    expect(() => parseGalleryCatalog(`const galleryCatalog = [gallery(1, 10, 10, scene)]`)).toThrow(
      'scene_must_be_string_literal'
    )
  })
})
