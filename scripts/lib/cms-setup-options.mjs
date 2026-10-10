export function parseCmsSetupOptions(args) {
  if (args.length === 0) return { schemaOnly: false, help: false }
  if (args.length !== 1 || !['--schema-only', '--help'].includes(args[0])) {
    throw new Error('cms_setup_invalid_arguments')
  }
  return { schemaOnly: args[0] === '--schema-only', help: args[0] === '--help' }
}
