import { access, readFile, readdir } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const projectRoot = process.cwd()
const sourceRoot = join(projectRoot, 'src')
const publicRoot = join(projectRoot, 'public')
const sourceExtensions = new Set(['.astro', '.css', '.js', '.mjs', '.ts', '.tsx'])
const assetPattern = /["'(]\/([^"'()?#]+\.(?:avif|css|gif|jpe?g|mp4|pdf|png|svg|webm|woff2?))/gi
const requiredAssetFamilies = [
  {
    label: '合作品牌 Logo',
    paths: Array.from({ length: 78 }, (_, index) => `logos/imgi_${index + 6}_default.png`),
  },
  {
    label: '关于页媒体',
    paths: [
      ...Array.from({ length: 6 }, (_, index) => `about/history/${index + 2017}.png`),
      ...Array.from({ length: 3 }, (_, index) => `about/history/${index + 2023}.jpg`),
      ...Array.from({ length: 15 }, (_, index) => `about/honor/${index + 1}.jpg`),
    ],
  },
  {
    label: '公司介绍媒体',
    paths: ['introduce-poster.jpg', 'introduce-540p.mp4'],
  },
]

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(path)))
    else if (sourceExtensions.has(extname(entry.name))) files.push(path)
  }

  return files
}

const sourceFiles = await walk(sourceRoot)
const references = new Map()

for (const sourceFile of sourceFiles) {
  const source = await readFile(sourceFile, 'utf8')
  for (const match of source.matchAll(assetPattern)) {
    const assetPath = match[1]
    if (assetPath.includes('${') || assetPath.includes('{')) continue
    const locations = references.get(assetPath) ?? []
    locations.push(relative(projectRoot, sourceFile))
    references.set(assetPath, locations)
  }
}

const missing = []
for (const [assetPath, sourceLocations] of references) {
  try {
    await access(join(publicRoot, assetPath))
  } catch {
    missing.push({ assetPath, sourceLocations })
  }
}

for (const family of requiredAssetFamilies) {
  for (const assetPath of family.paths) {
    try {
      await access(join(publicRoot, assetPath))
    } catch {
      missing.push({ assetPath, sourceLocations: [`deployment asset family: ${family.label}`] })
    }
  }
}

if (missing.length) {
  console.error(`Missing ${missing.length} referenced public asset(s):`)
  for (const item of missing) {
    console.error(`- /${item.assetPath} ← ${item.sourceLocations.join(', ')}`)
  }
  process.exitCode = 1
} else {
  console.log(
    `Verified ${references.size} referenced public assets and ${requiredAssetFamilies.reduce((count, family) => count + family.paths.length, 0)} deployment assets across ${sourceFiles.length} source files.`
  )
}
