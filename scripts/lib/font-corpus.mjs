import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'

const CORPUS_EXTENSIONS = new Set(['.astro', '.css', '.js', '.json', '.md', '.mjs', '.ts', '.tsx'])

async function collectCorpusFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await collectCorpusFiles(path)))
    else if (CORPUS_EXTENSIONS.has(extname(entry.name))) files.push(path)
  }

  return files
}

export async function buildFontCorpus(projectRoot, manifestVersion) {
  const corpusFiles = [
    ...(await collectCorpusFiles(join(projectRoot, 'src'))),
    join(projectRoot, 'scripts/approved-cms-content.mjs'),
  ]
  const corpusText = (await Promise.all(corpusFiles.map((path) => readFile(path, 'utf8')))).join(
    '\n'
  )
  const codePoints = [
    ...new Set(Array.from(corpusText, (character) => character.codePointAt(0))),
  ].sort((a, b) => a - b)
  const hash = createHash('sha256')
    .update(`xyy-font-corpus-v${manifestVersion}\n`)
    .update(codePoints.join(','))
    .digest('hex')

  return { codePoints, hash }
}
