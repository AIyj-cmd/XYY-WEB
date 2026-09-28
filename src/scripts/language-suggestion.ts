import {
  preferredBrowserLanguage,
  readLanguagePreference,
  writeLanguagePreference,
  type LanguagePreference,
  type StorageLike,
} from '@/i18n/language-preference'

const suggestion = document.getElementById('language-suggestion')
const languageSwitch = document.querySelector<HTMLElement>('[data-language-switch]')
let stopOffsetTracking: () => void = () => {}

const storage = (name: 'localStorage' | 'sessionStorage'): StorageLike | undefined => {
  try {
    return window[name]
  } catch {
    return undefined
  }
}

const localStorage = storage('localStorage')
const sessionStorage = storage('sessionStorage')

const savedPreference = () =>
  readLanguagePreference(localStorage) ?? readLanguagePreference(sessionStorage)

const savePreference = (preference: LanguagePreference) => {
  if (!writeLanguagePreference(localStorage, preference)) {
    writeLanguagePreference(sessionStorage, preference)
  }
}

const updateHeaderOffset = () => {
  if (!(suggestion instanceof HTMLElement) || suggestion.hidden) {
    document.documentElement.style.setProperty('--language-suggestion-visible-height', '0px')
    return
  }

  const { bottom, height } = suggestion.getBoundingClientRect()
  const visibleHeight = Math.max(0, Math.min(height, bottom))
  document.documentElement.style.setProperty(
    '--language-suggestion-visible-height',
    `${visibleHeight}px`
  )
}

const startOffsetTracking = () => {
  const element = suggestion instanceof HTMLElement ? suggestion : undefined
  const observer =
    typeof ResizeObserver === 'undefined' || !element
      ? undefined
      : new ResizeObserver(updateHeaderOffset)

  if (element) observer?.observe(element)
  window.addEventListener('scroll', updateHeaderOffset, { passive: true })
  window.addEventListener('resize', updateHeaderOffset)
  stopOffsetTracking = () => {
    window.removeEventListener('scroll', updateHeaderOffset)
    window.removeEventListener('resize', updateHeaderOffset)
    observer?.disconnect()
    stopOffsetTracking = () => {}
  }
}

const hideSuggestion = () => {
  if (!(suggestion instanceof HTMLElement)) return
  const restoreLanguageSwitch = suggestion.contains(document.activeElement)
  suggestion.hidden = true
  stopOffsetTracking()
  updateHeaderOffset()
  if (restoreLanguageSwitch) languageSwitch?.focus({ preventScroll: true })
}

document.querySelectorAll<HTMLElement>('[data-language-switch]').forEach((link) => {
  link.addEventListener('click', () => {
    const preference = link.dataset.languagePreference
    if (preference === 'en' || preference === 'zh-CN') savePreference(preference)
  })
})

if (suggestion instanceof HTMLElement) {
  const showSuggestion =
    suggestion.dataset.currentLocale === 'zh-CN' &&
    !savedPreference() &&
    preferredBrowserLanguage(navigator.languages, navigator.language) === 'en'

  if (showSuggestion) {
    suggestion.hidden = false
    updateHeaderOffset()
    requestAnimationFrame(updateHeaderOffset)
    startOffsetTracking()
  }

  suggestion.querySelectorAll<HTMLElement>('[data-language-choice]').forEach((control) => {
    control.addEventListener('click', () => {
      const preference = control.dataset.languageChoice
      if (preference === 'en' || preference === 'zh-CN') savePreference(preference)
      hideSuggestion()
    })
  })

  suggestion
    .querySelector<HTMLElement>('[data-language-dismiss]')
    ?.addEventListener('click', () => {
      savePreference('zh-CN')
      hideSuggestion()
    })

  suggestion.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    event.preventDefault()
    savePreference('zh-CN')
    hideSuggestion()
  })
}
