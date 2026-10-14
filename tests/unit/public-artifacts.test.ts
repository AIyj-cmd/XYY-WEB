import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  assertNoPublicHtmlArtifacts,
  findPublicHtmlArtifacts,
  googleVerificationContents,
  googleVerificationFileName,
} from '../../scripts/check-public-artifacts.mjs'

const directories: string[] = []

async function publicDirectory() {
  const directory = await mkdtemp(join(tmpdir(), 'xyy-public-artifacts-'))
  directories.push(directory)
  return directory
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })))
})

describe('public artifact build gate', () => {
  it('rejects nested HTML files without case-sensitive extension loopholes', async () => {
    const directory = await publicDirectory()
    await writeFile(join(directory, 'review.HTML'), '<html></html>')
    await mkdir(join(directory, 'nested'))
    await writeFile(join(directory, 'nested', 'review.htm'), '<html></html>')

    await expect(findPublicHtmlArtifacts(directory)).resolves.toEqual([
      'nested/review.htm',
      'review.HTML',
    ])
    await expect(assertNoPublicHtmlArtifacts(directory)).rejects.toThrow(
      'Public HTML artifacts are forbidden:\n- nested/review.htm\n- review.HTML'
    )
  })

  it('allows normal static assets', async () => {
    const directory = await publicDirectory()
    await writeFile(join(directory, 'cover.svg'), '<svg></svg>')
    await writeFile(join(directory, 'guide.pdf'), 'pdf bytes')

    await expect(findPublicHtmlArtifacts(directory)).resolves.toEqual([])
    await expect(assertNoPublicHtmlArtifacts(directory)).resolves.toBeUndefined()
  })

  it('allows only the approved root Google verification file byte-for-byte', async () => {
    const directory = await publicDirectory()
    await writeFile(join(directory, googleVerificationFileName), googleVerificationContents)
    await mkdir(join(directory, 'nested'))
    await writeFile(
      join(directory, 'nested', googleVerificationFileName),
      googleVerificationContents
    )
    await writeFile(join(directory, 'google4adb4e763f43adcd.HTML'), googleVerificationContents)
    await writeFile(join(directory, 'review.html'), '<html></html>')

    await expect(findPublicHtmlArtifacts(directory)).resolves.toEqual([
      'google4adb4e763f43adcd.HTML',
      'nested/google4adb4e763f43adcd.html',
      'review.html',
    ])
    await expect(assertNoPublicHtmlArtifacts(directory)).rejects.toThrow(
      'Public HTML artifacts are forbidden:\n- google4adb4e763f43adcd.HTML\n- nested/google4adb4e763f43adcd.html\n- review.html'
    )
  })

  it('rejects a root Google verification file whose content differs', async () => {
    const directory = await publicDirectory()
    await writeFile(join(directory, googleVerificationFileName), `${googleVerificationContents}\n`)

    await expect(findPublicHtmlArtifacts(directory)).resolves.toEqual([googleVerificationFileName])
    await expect(assertNoPublicHtmlArtifacts(directory)).rejects.toThrow(
      `Public HTML artifacts are forbidden:\n- ${googleVerificationFileName}`
    )
  })
})
