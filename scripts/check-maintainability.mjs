import { readdir, readFile } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const scanRoots = ['src', 'server', 'scripts', 'deploy', 'tests'].map((path) =>
  resolve(projectRoot, path)
)
const rootFiles = [
  'astro.config.mjs',
  'ecosystem.config.cjs',
  'eslint.config.mjs',
  'lighthouserc.cjs',
  'playwright.config.ts',
  'playwright.formal.config.ts',
  'server.mjs',
  'vitest.config.ts',
].map((path) => resolve(projectRoot, path))

const budgets = {
  '.astro': 180,
  '.css': 200,
  '.ts': 260,
  '.tsx': 260,
  '.mjs': 200,
  '.cjs': 180,
  '.sh': 200,
}

const inlineBudgets = {
  style: 180,
  script: 100,
}

const sourceFiles = []
const generatedFiles = new Set([
  'scripts/data/approved-faq-seeds.mjs',
  'scripts/data/approved-cms-page-seeds.mjs',
])

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (budgets[extname(entry.name)]) sourceFiles.push(path)
  }
}

const countLines = (content) => content.split(/\r?\n/).length

function budgetFor(name, extension) {
  if (name.startsWith('tests/') && extension === '.ts') return 220
  if (name.startsWith('src/data/') && extension === '.ts') return 180
  if (name.startsWith('src/pages/api/') && extension === '.ts') return 100
  if (name.startsWith('src/pages/') && extension === '.astro') return 150
  if (name === 'scripts/setup-cms.mjs') return 100
  if (name === 'scripts/sync-approved-cms-content.mjs') return 140
  if (name === 'deploy/oracle19c/migrate-directus-content.mjs') return 140
  return budgets[extension]
}

for (const root of scanRoots) await walk(root)
sourceFiles.push(...rootFiles)

const violations = []
const measurements = []

for (const path of sourceFiles) {
  const content = await readFile(path, 'utf8')
  const extension = extname(path)
  const lines = countLines(content)
  const name = relative(projectRoot, path)
  if (generatedFiles.has(name)) continue
  const budget = budgetFor(name, extension)

  measurements.push({ name, lines, budget })
  if (lines > budget) violations.push(`${name}: ${lines} lines exceeds ${budget}`)

  if (extension !== '.astro') continue
  for (const [tag, inlineBudget] of Object.entries(inlineBudgets)) {
    // Astro commonly uses self-closing JSON-LD scripts with `set:html`. Do not let
    // one of those openings consume the next real closing tag as an inline block.
    const pattern = new RegExp(
      `<${tag}\\b(?![^>]*\\/\\s*>)(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
      'gi'
    )
    for (const match of content.matchAll(pattern)) {
      const inlineLines = countLines(match[1]) - 2
      if (inlineLines > inlineBudget) {
        violations.push(
          `${name}: inline <${tag}> has ${inlineLines} lines (budget ${inlineBudget})`
        )
      }
    }
  }
}

const largest = measurements.sort((a, b) => b.lines - a.lines).slice(0, 8)
console.log(`Maintainability budgets checked across ${sourceFiles.length} project files.`)
console.log(`Largest files: ${largest.map(({ name, lines }) => `${name} (${lines})`).join(', ')}`)

if (violations.length) {
  console.error(`Maintainability budget failed:\n- ${violations.join('\n- ')}`)
  process.exitCode = 1
}
