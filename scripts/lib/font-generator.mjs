import { access, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fontSplit } from 'cn-font-split'

async function hasGeneratedFont(directory, weight, corpusHash, manifestVersion) {
  try {
    await access(join(directory, 'result.css'))
    const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'))
    const hasWoff = (await readdir(directory)).some((name) => name.endsWith('.woff2'))
    return (
      hasWoff &&
      manifest.version === manifestVersion &&
      manifest.corpusHash === corpusHash &&
      manifest.weight === weight
    )
  } catch {
    return false
  }
}

async function retainSmallestFontFace(directory) {
  const cssPath = join(directory, 'result.css')
  const generatedCss = await readFile(cssPath, 'utf8')
  const fontFaces = [...generatedCss.matchAll(/@font-face\{[^}]+\}/g)].map((match) => ({
    css: match[0],
    file: match[0].match(/url\("\.\/(.+?\.woff2)"\)/)?.[1],
  }))
  const usableFaces = fontFaces.filter((face) => face.file)
  if (usableFaces.length <= 1) return

  const facesBySize = await Promise.all(
    usableFaces.map(async (face) => ({
      ...face,
      size: (await stat(join(directory, face.file))).size,
    }))
  )
  facesBySize.sort((a, b) => a.size - b.size)
  const [siteCorpusFace, ...unusedFaces] = facesBySize
  await writeFile(cssPath, `${siteCorpusFace.css}\n`)
  await Promise.all(unusedFaces.map((face) => rm(join(directory, face.file))))
}

export async function generateFontBundle({
  job,
  outputRoot,
  fontPackageRoot,
  corpusCodePoints,
  corpusHash,
  manifestVersion,
}) {
  const { name, source, weight } = job
  const targetDirectory = join(outputRoot, name)
  if (await hasGeneratedFont(targetDirectory, weight, corpusHash, manifestVersion)) {
    console.log(`Font shards ready: ${name}`)
    return
  }

  const temporaryDirectory = join(outputRoot, `.${name}-${process.pid}`)
  await rm(temporaryDirectory, { recursive: true, force: true })
  await mkdir(temporaryDirectory, { recursive: true })

  try {
    const sourceBuffer = await readFile(join(fontPackageRoot, source))
    await fontSplit({
      input: new Uint8Array(sourceBuffer.buffer, sourceBuffer.byteOffset, sourceBuffer.byteLength),
      outDir: temporaryDirectory,
      subsets: [corpusCodePoints],
      languageAreas: false,
      autoSubset: false,
      css: {
        fontFamily: 'Alibaba PuHuiTi',
        fontWeight: weight,
        fontStyle: 'normal',
        fontDisplay: 'optional',
        localFamily: ['Alibaba PuHuiTi'],
        compress: true,
      },
      reporter: false,
      testHtml: false,
    })

    await retainSmallestFontFace(temporaryDirectory)
    await rm(join(temporaryDirectory, 'index.proto'), { force: true })

    const generatedFiles = await readdir(temporaryDirectory)
    const hasUsableBundle = await access(join(temporaryDirectory, 'result.css')).then(
      () => generatedFiles.some((file) => file.endsWith('.woff2')),
      () => false
    )
    if (!hasUsableBundle) throw new Error(`cn-font-split did not create a usable ${name} bundle`)

    await writeFile(
      join(temporaryDirectory, 'manifest.json'),
      `${JSON.stringify(
        {
          version: manifestVersion,
          corpusHash,
          codePointCount: corpusCodePoints.length,
          weight,
        },
        null,
        2
      )}\n`
    )

    await rm(targetDirectory, { recursive: true, force: true })
    await rename(temporaryDirectory, targetDirectory)
    console.log(`Generated font shards: ${name}`)
  } catch (error) {
    await rm(temporaryDirectory, { recursive: true, force: true })
    throw error
  }
}
