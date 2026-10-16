import { readFile } from 'node:fs/promises'

import ts from 'typescript'

function fail(message) {
  throw new Error(`gallery_catalog_invalid:${message}`)
}

function numberArgument(argument, label) {
  if (!ts.isNumericLiteral(argument)) fail(`${label}_must_be_numeric_literal`)
  const value = Number(argument.text)
  if (!Number.isSafeInteger(value) || value <= 0) fail(`${label}_must_be_positive_integer`)
  return value
}

function stringArgument(argument, label) {
  if (!ts.isStringLiteral(argument) || !argument.text) fail(`${label}_must_be_string_literal`)
  return argument.text
}

function findCatalogInitializer(sourceFile) {
  let initializer
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'galleryCatalog'
    ) {
      if (initializer) fail('galleryCatalog_declared_more_than_once')
      initializer = node.initializer
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(sourceFile, visit)
  let expression = initializer
  while (
    expression &&
    (ts.isAsExpression(expression) ||
      ts.isSatisfiesExpression(expression) ||
      ts.isParenthesizedExpression(expression) ||
      ts.isTypeAssertionExpression(expression))
  ) {
    expression = expression.expression
  }
  if (!expression || !ts.isArrayLiteralExpression(expression))
    fail('galleryCatalog_must_be_array_literal')
  return expression
}

export function parseGalleryCatalog(source, fileName = 'gallery-catalog.ts') {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  if (sourceFile.parseDiagnostics.length) fail('typescript_parse_error')
  const initializer = findCatalogInitializer(sourceFile)
  if (!initializer.elements.length) fail('galleryCatalog_must_not_be_empty')
  const identifiers = new Set()

  return initializer.elements.map((element, index) => {
    if (
      !ts.isCallExpression(element) ||
      !ts.isIdentifier(element.expression) ||
      element.expression.text !== 'gallery' ||
      element.arguments.length !== 4
    ) {
      fail(`entry_${index + 1}_must_be_gallery_literal_call`)
    }
    const [idArgument, widthArgument, heightArgument, sceneArgument] = element.arguments
    const id = numberArgument(idArgument, `entry_${index + 1}_id`)
    if (identifiers.has(id)) fail(`duplicate_id_${id}`)
    identifiers.add(id)
    const width = numberArgument(widthArgument, `entry_${index + 1}_width`)
    const height = numberArgument(heightArgument, `entry_${index + 1}_height`)
    const scene = stringArgument(sceneArgument, `entry_${index + 1}_scene`)
    const filename = `gallery-${String(id).padStart(3, '0')}.webp`
    return { id, width, height, scene, filename }
  })
}

export async function readGalleryCatalog(path) {
  return parseGalleryCatalog(await readFile(path, 'utf8'), path)
}
