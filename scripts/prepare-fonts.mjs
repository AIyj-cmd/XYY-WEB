import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { buildFontCorpus } from './lib/font-corpus.mjs'
import { generateFontBundle } from './lib/font-generator.mjs'

const projectRoot = process.cwd()
const outputRoot = resolve(process.env.FONT_OUTPUT_ROOT ?? join(projectRoot, 'public/fonts'))
const fontPackageRoot = join(projectRoot, 'node_modules/@fontpkg/alibaba-puhuiti-3-0')
const manifestVersion = 3
const fontJobs = [
  { name: 'puhuiti-400', source: 'AlibabaPuHuiTi-3-55-Regular.ttf', weight: '400' },
  { name: 'puhuiti-900', source: 'AlibabaPuHuiTi-3-105-Heavy.ttf', weight: '900' },
]

const { codePoints: corpusCodePoints, hash: corpusHash } = await buildFontCorpus(
  projectRoot,
  manifestVersion
)

await mkdir(outputRoot, { recursive: true })
for (const job of fontJobs) {
  await generateFontBundle({
    job,
    outputRoot,
    fontPackageRoot,
    corpusCodePoints,
    corpusHash,
    manifestVersion,
  })
}

// cn-font-split's native worker may keep an event-loop handle alive after all
// files are flushed. This is a build CLI, so terminate explicitly on success.
process.exit(0)
