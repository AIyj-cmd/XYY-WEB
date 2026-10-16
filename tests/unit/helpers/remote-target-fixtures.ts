export const LOOPBACK_CMS = 'http://127.0.0.1:4399/cms'
export const LOOPBACK_SITE = 'http://127.0.0.1:4399'
export const ACTIVE_ECS = 'https://8.138.148.179'
export const FORMAL_ORIGIN = 'https://56xyy.com'
export const RETIRED_ORIGIN = 'https://wz.tomatopia.top'

export const BANNED_OPERATION_TARGETS = [
  RETIRED_ORIGIN,
  'https://WZ.TOMATOPIA.TOP',
  'https://wz.tomatopia.top.',
  'https://cms.example.com',
  'https://8.138.148.180',
  'http://8.138.148.179',
  'https://47.82.105.103',
  'http://47.82.105.103',
  'https://56xyy.com',
] as const

export function responseFor(body: string | object, status = 200) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  return new Response(payload, {
    status,
    headers: { 'content-type': typeof body === 'string' ? 'text/plain' : 'application/json' },
  })
}
