const trim = (s: string) => s.replace(/\/+$/, '')

export const SITE_URL = trim(
  (import.meta.env.PUBLIC_SITE_URL as string | undefined) ?? 'https://56xyy.com'
)
