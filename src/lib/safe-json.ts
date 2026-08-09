const SCRIPT_CONTEXT_ESCAPES: Readonly<Record<string, string>> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

/**
 * Serializes data for embedding inside an HTML <script> element.
 *
 * JSON.stringify alone leaves HTML-significant characters such as `<` intact,
 * allowing a CMS value containing `</script>` to terminate the element. These
 * escapes remain valid JSON and are decoded back to their original characters
 * by JSON.parse in the browser.
 */
export function serializeJsonForScript(value: unknown): string {
  const json = JSON.stringify(value) ?? 'null'

  return json.replace(/[<>&\u2028\u2029]/g, (character) => SCRIPT_CONTEXT_ESCAPES[character])
}
