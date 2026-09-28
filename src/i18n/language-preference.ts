export type LanguagePreference = 'en' | 'zh-CN'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export const LANGUAGE_PREFERENCE_KEY = 'xyy-language-preference'

const supportedPreference = (value: string | null | undefined): LanguagePreference | undefined => {
  if (value === 'en' || value === 'zh-CN') return value
  return undefined
}

export function preferredBrowserLanguage(
  languages: readonly string[] | undefined,
  fallbackLanguage?: string
): LanguagePreference | undefined {
  const candidates = languages?.filter(Boolean).length ? languages : [fallbackLanguage ?? '']

  for (const candidate of candidates) {
    const language = candidate.toLowerCase()
    if (language === 'en' || language.startsWith('en-')) return 'en'
    if (language === 'zh' || language.startsWith('zh-')) return 'zh-CN'
  }
}

export function readLanguagePreference(
  storage: StorageLike | undefined
): LanguagePreference | undefined {
  try {
    return supportedPreference(storage?.getItem(LANGUAGE_PREFERENCE_KEY))
  } catch {
    return undefined
  }
}

export function writeLanguagePreference(
  storage: StorageLike | undefined,
  preference: LanguagePreference
): boolean {
  try {
    storage?.setItem(LANGUAGE_PREFERENCE_KEY, preference)
    return Boolean(storage)
  } catch {
    return false
  }
}
