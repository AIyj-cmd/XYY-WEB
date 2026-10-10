import { URL } from 'node:url'
import { CmsContentError } from './cms-content-snapshot.mjs'

export function parseCmsContentOptions(args) {
  if (args.length === 0) return { mode: 'preview', help: false }
  if (args.length !== 1 || !['--apply', '--check', '--help'].includes(args[0])) {
    throw new CmsContentError('cms_content_invalid_arguments')
  }
  return {
    mode: args[0] === '--apply' ? 'apply' : args[0] === '--check' ? 'check' : 'preview',
    help: args[0] === '--help',
  }
}

export function contentCredentials(env) {
  if (!env.DIRECTUS_URL?.trim() || !env.DIRECTUS_TOKEN?.trim()) {
    throw new CmsContentError('DIRECTUS_URL and DIRECTUS_TOKEN are required')
  }
  let url
  try {
    url = new URL(env.DIRECTUS_URL)
  } catch {
    throw new CmsContentError('cms_content_invalid_directus_url')
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new CmsContentError('cms_content_invalid_directus_url')
  }
  return { baseUrl: url.href.replace(/\/+$/, ''), token: env.DIRECTUS_TOKEN }
}
