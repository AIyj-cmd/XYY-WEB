import { readdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcRoot = fileURLToPath(new URL('../../src', import.meta.url))
const claimRoot = join(srcRoot, 'lib', 'claims')
const publicClaimLiteral =
  /(?:54万㎡|150\+|1500\+|45万\+|10000\+|6000\+|99\.99%|50万单(?:\/日)?|100万单(?:\/日)?|18:00前截单|1\.17亿件|1\.53亿件|135\+种|90%|24小时)/u

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return ['.astro', '.ts'].includes(extname(entry.name)) ? [path] : []
  })
}

describe('public business claim registry', () => {
  it('keeps approved operational literals in the reviewed claim domain', () => {
    const violations = sourceFiles(srcRoot)
      .filter((path) => !path.startsWith(claimRoot))
      .filter((path) => !path.includes('/scripts/'))
      .filter((path) => publicClaimLiteral.test(readFileSync(path, 'utf8')))
      .map((path) => path.slice(srcRoot.length + 1))

    expect(violations).toEqual([])
  })
})
