import ts from 'typescript'

const unwrap = (node) => {
  let current = node
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression
  }
  return current
}

const propertyName = (node, sourceFile) => {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text
  }
  return node.getText(sourceFile)
}

export function evaluateSourceNode(input, sourceFile, context = {}) {
  const node = unwrap(input)
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false
  if (node.kind === ts.SyntaxKind.NullKeyword) return null
  if (ts.isIdentifier(node) && node.text in context) return context[node.text]
  if (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'CLAIM_TEXT'
  ) {
    return `{{${node.name.text}}}`
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((item) => evaluateSourceNode(item, sourceFile, context))
  }
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(
      node.properties
        .filter(ts.isPropertyAssignment)
        .map((item) => [
          propertyName(item.name, sourceFile),
          evaluateSourceNode(item.initializer, sourceFile, context),
        ])
    )
  }
  if (ts.isTemplateExpression(node)) {
    return node.templateSpans.reduce((value, span) => {
      const expression = unwrap(span.expression)
      if (
        ts.isPropertyAccessExpression(expression) &&
        ts.isIdentifier(expression.expression) &&
        expression.expression.text === 'CLAIM_TEXT'
      ) {
        return `${value}{{${expression.name.text}}}${span.literal.text}`
      }
      throw new Error(`Unsupported template expression: ${expression.getText(sourceFile)}`)
    }, node.head.text)
  }
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'map'
  ) {
    return evaluateSourceNode(node.expression.expression, sourceFile, context)
  }
  throw new Error(`Unsupported seed expression: ${node.getText(sourceFile)}`)
}

export function parseVariable(source, file, symbol, context = {}) {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  let initializer
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === symbol) {
      initializer = node.initializer
    }
    if (!initializer) ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  if (!initializer) throw new Error(`${symbol} not found in ${file}`)
  return evaluateSourceNode(initializer, sourceFile, context)
}

function serviceTag(source) {
  const start = source.indexOf('<ServiceLanding')
  if (start < 0) throw new Error('ServiceLanding tag not found')
  let quote = ''
  let braceDepth = 0
  for (let index = start; index < source.length; index += 1) {
    const char = source[index]
    if (quote) {
      if (char === quote && source[index - 1] !== '\\') quote = ''
      continue
    }
    if (char === "'" || char === '"' || char === '`') quote = char
    else if (char === '{') braceDepth += 1
    else if (char === '}') braceDepth -= 1
    else if (char === '>' && braceDepth === 0) return `${source.slice(start, index)} />`
  }
  throw new Error('Unclosed ServiceLanding tag')
}

export function parseServiceProps(source, file) {
  const context = {}
  for (const symbol of ['CAPABILITIES']) {
    try {
      context[symbol] = parseVariable(source, file, symbol, context)
    } catch {
      // Most service pages use inline feature arrays.
    }
  }
  const jsx = `const page = (${serviceTag(source)})`
  const sourceFile = ts.createSourceFile(file, jsx, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let element
  const visit = (node) => {
    if (ts.isJsxSelfClosingElement(node)) element = node
    else ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  if (!element) throw new Error(`ServiceLanding JSX not parsed in ${file}`)
  return Object.fromEntries(
    element.attributes.properties
      .filter(ts.isJsxAttribute)
      .filter(({ name }) => name.getText(sourceFile) !== 'faqs')
      .map((attribute) => {
        const name = attribute.name.getText(sourceFile)
        const initializer = attribute.initializer
        if (ts.isStringLiteral(initializer)) return [name, initializer.text]
        if (ts.isJsxExpression(initializer) && initializer.expression) {
          return [name, evaluateSourceNode(initializer.expression, sourceFile, context)]
        }
        throw new Error(`Unsupported ${name} attribute in ${file}`)
      })
  )
}
