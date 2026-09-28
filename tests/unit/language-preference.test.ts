import { describe, expect, it } from 'vitest'

import {
  LANGUAGE_PREFERENCE_KEY,
  preferredBrowserLanguage,
  readLanguagePreference,
  writeLanguagePreference,
  type StorageLike,
} from '@/i18n/language-preference'

describe('language preferences', () => {
  it('uses the first supported browser language and falls back to navigator.language', () => {
    expect(preferredBrowserLanguage(['fr', 'en-GB', 'zh-CN'])).toBe('en')
    expect(preferredBrowserLanguage(['fr', 'zh-Hans', 'en-US'])).toBe('zh-CN')
    expect(preferredBrowserLanguage([], 'en-US')).toBe('en')
    expect(preferredBrowserLanguage(['fr-FR'], 'de-DE')).toBeUndefined()
  })

  it('only accepts saved explicit choices and safely handles unavailable storage', () => {
    const values = new Map<string, string>([[LANGUAGE_PREFERENCE_KEY, 'en']])
    const storage: StorageLike = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    }

    expect(readLanguagePreference(storage)).toBe('en')
    expect(writeLanguagePreference(storage, 'zh-CN')).toBe(true)
    expect(readLanguagePreference(storage)).toBe('zh-CN')
    expect(readLanguagePreference({ ...storage, getItem: () => 'fr' })).toBeUndefined()
    expect(
      readLanguagePreference({
        ...storage,
        getItem: () => {
          throw new Error('denied')
        },
      })
    ).toBeUndefined()
    expect(writeLanguagePreference(undefined, 'en')).toBe(false)
    expect(
      writeLanguagePreference(
        {
          ...storage,
          setItem: () => {
            throw new Error('denied')
          },
        },
        'en'
      )
    ).toBe(false)
  })
})
