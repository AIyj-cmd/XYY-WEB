export function assertWebHealthPayload(value) {
  if (!value || typeof value !== 'object') {
    throw new Error('health payload must be an object')
  }
  if (value.status !== 'ok') {
    throw new Error(`unexpected status: ${JSON.stringify(value)}`)
  }
  if (value.dependencies?.contactStorage !== 'ok') {
    throw new Error('contact storage is not healthy')
  }
  if (value.dependencies?.cmsContent !== 'ok') {
    throw new Error('CMS content is not healthy')
  }
}
