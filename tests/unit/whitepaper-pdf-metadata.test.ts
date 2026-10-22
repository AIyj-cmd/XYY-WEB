import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { PDFDocument, PDFName } from 'pdf-lib'
import { afterEach, describe, expect, it } from 'vitest'

import {
  WHITEPAPER_ISSUES,
  writeWhitepaperPdfMetadata,
} from '../../scripts/whitepapers/pdf-metadata.mjs'

const temporaryDirectories: string[] = []
function sha256(bytes: Uint8Array) {
  return createHash('sha256').update(bytes).digest('hex')
}
async function writeFixturePdf(path: string, issue: string, signed = false) {
  const document = await PDFDocument.create({ updateMetadata: false })
  document.addPage([300, 400])
  document.setTitle(`森林期刊第${issue}期.cdr`)
  document.setAuthor('ShuXing')
  document.setSubject('stale subject')

  const xmp = document.context.flateStream(
    new TextEncoder().encode(
      `<x:xmpmeta><dc:title>森林期刊第${issue}期.cdr</dc:title><dc:creator>ShuXing</dc:creator></x:xmpmeta>`
    ),
    { Type: 'Metadata', Subtype: 'XML' }
  )
  document.catalog.set(PDFName.of('Metadata'), document.context.register(xmp))
  if (signed) {
    const signature = document.context.register(
      document.context.obj({ Type: PDFName.of('Sig'), ByteRange: [0, 1, 2, 3] })
    )
    document.catalog.set(PDFName.of('Perms'), document.context.obj({ DocMDP: signature }))
  }
  await writeFile(path, await document.save({ addDefaultPage: false, useObjectStreams: false }))
}
async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'xyy-whitepaper-pdf-metadata-'))
  temporaryDirectories.push(root)
  const sourcePdfDirectory = join(root, 'public', 'senlinqikan', 'pdf')
  const dataDirectory = join(root, 'src', 'data', 'whitepapers')
  await Promise.all([
    mkdir(sourcePdfDirectory, { recursive: true }),
    mkdir(dataDirectory, { recursive: true }),
  ])

  for (const issue of WHITEPAPER_ISSUES) {
    const sourcePath = join(sourcePdfDirectory, `${issue}.pdf`)
    await writeFixturePdf(sourcePath, issue)
    const source = await readFile(sourcePath)
    await writeFile(
      join(dataDirectory, `${issue}.json`),
      JSON.stringify({
        issue,
        originalTitle: `《森林期刊》第${issue}期`,
        title: `内容标题${issue}`,
        description: `第${issue}期说明`,
        sourcePdf: `/senlinqikan/pdf/${issue}.pdf`,
        sourceSha256: sha256(source),
      })
    )
  }
  return { root, sourcePdfDirectory, dataDirectory }
}
afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true }))
  )
})

describe('writeWhitepaperPdfMetadata', () => {
  it('writes all public URLs with reviewed metadata, removes conflicting XMP, and leaves sources unchanged', async () => {
    const fixture = await createFixture()
    const sourceBefore = await readFile(join(fixture.sourcePdfDirectory, '1.pdf'))
    const outputDirectory = join(fixture.root, 'custom-client-output')

    const results = await writeWhitepaperPdfMetadata({
      clientOutputDirectory: outputDirectory,
      sourceRoot: fixture.root,
    })

    expect(results).toHaveLength(14)
    const generated = await readFile(join(outputDirectory, 'senlinqikan', 'pdf', '1.pdf'))
    const generatedDocument = await PDFDocument.load(generated, { updateMetadata: false })
    expect(generatedDocument.getTitle()).toBe('《森林期刊》第1期｜内容标题1｜新亦源')
    expect(generatedDocument.getAuthor()).toBe('新亦源供应链')
    expect(generatedDocument.getSubject()).toBe('第1期说明')
    expect(generatedDocument.catalog.get(PDFName.of('Metadata'))).toBeUndefined()
    expect(await readFile(join(fixture.sourcePdfDirectory, '1.pdf'))).toEqual(sourceBefore)
  })

  it('is deterministic for independent output directories', async () => {
    const fixture = await createFixture()
    const firstOutput = join(fixture.root, 'first-client-output')
    const secondOutput = join(fixture.root, 'second-client-output')

    await writeWhitepaperPdfMetadata({
      clientOutputDirectory: firstOutput,
      sourceRoot: fixture.root,
    })
    await writeWhitepaperPdfMetadata({
      clientOutputDirectory: secondOutput,
      sourceRoot: fixture.root,
    })

    await Promise.all(
      WHITEPAPER_ISSUES.map(async (issue) => {
        const [first, second] = await Promise.all([
          readFile(join(firstOutput, 'senlinqikan', 'pdf', `${issue}.pdf`)),
          readFile(join(secondOutput, 'senlinqikan', 'pdf', `${issue}.pdf`)),
        ])
        expect(first).toEqual(second)
      })
    )
  })

  it('rejects output paths that would overwrite frozen sources before writing', async () => {
    const fixture = await createFixture()
    const sourceBefore = await Promise.all(
      WHITEPAPER_ISSUES.map((issue) => readFile(join(fixture.sourcePdfDirectory, `${issue}.pdf`)))
    )

    await expect(
      writeWhitepaperPdfMetadata({
        clientOutputDirectory: join(fixture.root, 'public'),
        sourceRoot: fixture.root,
      })
    ).rejects.toThrow('Client output directory overlaps the frozen source PDF directory')

    await Promise.all(
      WHITEPAPER_ISSUES.map((issue, index) =>
        expect(readFile(join(fixture.sourcePdfDirectory, `${issue}.pdf`))).resolves.toEqual(
          sourceBefore[index]
        )
      )
    )

    const outputDirectory = join(fixture.root, 'symlinked-client-output')
    await mkdir(join(outputDirectory, 'senlinqikan'), { recursive: true })
    await symlink(fixture.sourcePdfDirectory, join(outputDirectory, 'senlinqikan', 'pdf'))
    await expect(
      writeWhitepaperPdfMetadata({
        clientOutputDirectory: outputDirectory,
        sourceRoot: fixture.root,
      })
    ).rejects.toThrow('Client output directory overlaps the frozen source PDF directory')

    const replacementOutput = join(fixture.root, 'replacement-client-output')
    const replacementDirectory = join(replacementOutput, 'senlinqikan', 'pdf')
    const replacementPdf = join(replacementDirectory, '1.pdf')
    await mkdir(replacementDirectory, { recursive: true })
    await symlink(join(fixture.sourcePdfDirectory, '1.pdf'), replacementPdf)
    await writeWhitepaperPdfMetadata({
      clientOutputDirectory: replacementOutput,
      sourceRoot: fixture.root,
    })
    await expect(readFile(join(fixture.sourcePdfDirectory, '1.pdf'))).resolves.toEqual(
      sourceBefore[0]
    )
  })

  it.each([
    [
      'a missing source file',
      async (fixture: Awaited<ReturnType<typeof createFixture>>) => {
        await rm(join(fixture.sourcePdfDirectory, '1.pdf'))
      },
      /Unable to read source PDF for issue 1/,
    ],
    [
      'a source hash mismatch',
      async (fixture: Awaited<ReturnType<typeof createFixture>>) => {
        const metadataPath = join(fixture.dataDirectory, '1.json')
        const metadata = JSON.parse(await readFile(metadataPath, 'utf8'))
        metadata.sourceSha256 = '0'.repeat(64)
        await writeFile(metadataPath, JSON.stringify(metadata))
      },
      /Source hash mismatch for issue 1/,
    ],
    [
      'an invalid PDF',
      async (fixture: Awaited<ReturnType<typeof createFixture>>) => {
        const sourcePath = join(fixture.sourcePdfDirectory, '1.pdf')
        const invalid = Buffer.from('not a PDF')
        await writeFile(sourcePath, invalid)
        const metadataPath = join(fixture.dataDirectory, '1.json')
        const metadata = JSON.parse(await readFile(metadataPath, 'utf8'))
        metadata.sourceSha256 = sha256(invalid)
        await writeFile(metadataPath, JSON.stringify(metadata))
      },
      /Invalid source PDF for issue 1/,
    ],
    [
      'a signed PDF',
      async (fixture: Awaited<ReturnType<typeof createFixture>>) => {
        const sourcePath = join(fixture.sourcePdfDirectory, '1.pdf')
        await writeFixturePdf(sourcePath, '1', true)
        const metadataPath = join(fixture.dataDirectory, '1.json')
        const metadata = JSON.parse(await readFile(metadataPath, 'utf8'))
        metadata.sourceSha256 = sha256(await readFile(sourcePath))
        await writeFile(metadataPath, JSON.stringify(metadata))
      },
      /Signed source PDF is not supported for issue 1/,
    ],
  ])('fails explicitly for %s', async (_name, arrange, expectedError) => {
    const fixture = await createFixture()
    await arrange(fixture)

    await expect(
      writeWhitepaperPdfMetadata({
        clientOutputDirectory: join(fixture.root, 'client-output'),
        sourceRoot: fixture.root,
      })
    ).rejects.toThrow(expectedError)
  })
})
