import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PDFDict, PDFDocument, PDFName, PDFRef } from 'pdf-lib'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const sourcePdfDirectory = ['public', 'senlinqikan', 'pdf']
const dataDirectory = ['src', 'data', 'whitepapers']

export const WHITEPAPER_ISSUES = Array.from({ length: 14 }, (_, index) => String(index + 1))

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function isMetadata(value, issue) {
  return (
    value &&
    typeof value === 'object' &&
    value.issue === issue &&
    [value.originalTitle, value.title, value.description].every(
      (field) => typeof field === 'string' && field.trim() !== ''
    ) &&
    value.sourcePdf === `/senlinqikan/pdf/${issue}.pdf` &&
    typeof value.sourceSha256 === 'string' &&
    /^[a-f0-9]{64}$/u.test(value.sourceSha256)
  )
}

async function readIssueMetadata(sourceRoot, issue) {
  try {
    const metadata = JSON.parse(
      await readFile(join(sourceRoot, ...dataDirectory, `${issue}.json`), 'utf8')
    )
    if (!isMetadata(metadata, issue)) throw new Error('invalid schema')
    return metadata
  } catch (error) {
    throw new Error(`Invalid whitepaper metadata for issue ${issue}: ${error.message}`, {
      cause: error,
    })
  }
}

function removeXmpMetadata(document) {
  const metadata = document.catalog.get(PDFName.of('Metadata'))
  document.catalog.delete(PDFName.of('Metadata'))
  if (metadata instanceof PDFRef) document.context.delete(metadata)
}

function hasSignatureStructure(document) {
  const name = (value, expected) => value instanceof PDFName && value.asString() === `/${expected}`
  const permissions = document.catalog.lookupMaybe(PDFName.of('Perms'), PDFDict)
  if (permissions?.get(PDFName.of('DocMDP'))) return true
  return document.context.enumerateIndirectObjects().some(([, value]) => {
    if (!(value instanceof PDFDict)) return false
    return (
      value.get(PDFName.of('ByteRange')) !== undefined ||
      name(value.get(PDFName.of('Type')), 'Sig') ||
      (name(value.get(PDFName.of('FT')), 'Sig') && value.get(PDFName.of('V')) !== undefined)
    )
  })
}

async function resolveExistingPath(targetPath) {
  const missing = []
  let currentPath = resolve(targetPath)
  while (true) {
    try {
      return resolve(await realpath(currentPath), ...missing.reverse())
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      const parentPath = dirname(currentPath)
      if (parentPath === currentPath) throw error
      missing.push(basename(currentPath))
      currentPath = parentPath
    }
  }
}

async function assertOutputIsSeparateFromSource(sourceRoot, outputDirectory) {
  const sourceDirectory = join(sourceRoot, ...sourcePdfDirectory)
  const outputPdfDirectory = join(outputDirectory, ...sourcePdfDirectory.slice(1))
  const [source, output] = await Promise.all([
    resolveExistingPath(sourceDirectory),
    resolveExistingPath(outputPdfDirectory),
  ])
  if (
    [relative(source, output), relative(output, source)].some(
      (path) => path === '' || !path.startsWith('..')
    )
  ) {
    throw new Error('Client output directory overlaps the frozen source PDF directory')
  }
}

async function createMetadataPdf({ sourceRoot, outputDirectory, stagingDirectory, issue }) {
  const metadata = await readIssueMetadata(sourceRoot, issue)
  const sourcePath = join(sourceRoot, ...sourcePdfDirectory, `${issue}.pdf`)
  let sourceBytes
  try {
    sourceBytes = await readFile(sourcePath)
  } catch (error) {
    throw new Error(`Unable to read source PDF for issue ${issue}: ${error.message}`, {
      cause: error,
    })
  }
  const actualHash = sha256(sourceBytes)
  if (actualHash !== metadata.sourceSha256) {
    throw new Error(
      `Source hash mismatch for issue ${issue}: expected ${metadata.sourceSha256}, received ${actualHash}`
    )
  }

  let document
  try {
    document = await PDFDocument.load(sourceBytes, {
      ignoreEncryption: false,
      throwOnInvalidObject: true,
      updateMetadata: false,
    })
  } catch (error) {
    throw new Error(`Invalid source PDF for issue ${issue}: ${error.message}`, { cause: error })
  }
  if (document.isEncrypted)
    throw new Error(`Encrypted source PDF is not supported for issue ${issue}`)
  if (hasSignatureStructure(document))
    throw new Error(`Signed source PDF is not supported for issue ${issue}`)

  removeXmpMetadata(document)
  document.setTitle(`${metadata.originalTitle}｜${metadata.title}｜新亦源`)
  document.setAuthor('新亦源供应链')
  document.setSubject(metadata.description)
  const outputPath = join(outputDirectory, ...sourcePdfDirectory.slice(1), `${issue}.pdf`)
  const stagingPath = join(stagingDirectory, `${issue}.pdf`)
  await mkdir(dirname(outputPath), { recursive: true })
  await mkdir(stagingDirectory, { recursive: true })
  await writeFile(
    stagingPath,
    await document.save({
      addDefaultPage: false,
      updateFieldAppearances: false,
      useObjectStreams: false,
    })
  )
  await rename(stagingPath, outputPath)
  return { issue, outputPath }
}

export async function writeWhitepaperPdfMetadata({
  clientOutputDirectory,
  sourceRoot = repositoryRoot,
}) {
  if (typeof clientOutputDirectory !== 'string' || clientOutputDirectory.trim() === '') {
    throw new Error('A client output directory is required for whitepaper PDF metadata')
  }
  const outputDirectory = resolve(clientOutputDirectory)
  const sourceDirectory = resolve(sourceRoot)
  await assertOutputIsSeparateFromSource(sourceDirectory, outputDirectory)
  await mkdir(outputDirectory, { recursive: true })
  const stagingDirectory = await mkdtemp(join(outputDirectory, '.whitepaper-pdf-metadata-'))
  const results = []
  try {
    for (const issue of WHITEPAPER_ISSUES) {
      results.push(
        await createMetadataPdf({
          sourceRoot: sourceDirectory,
          outputDirectory,
          stagingDirectory,
          issue,
        })
      )
    }
  } finally {
    await rm(stagingDirectory, { force: true, recursive: true })
  }
  return results
}
