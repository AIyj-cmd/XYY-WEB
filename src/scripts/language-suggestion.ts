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
let offsetFrame = 0
let measuredHeight = 0
let measuredTop = 0
let lastVisibleHeight = -1

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
  const visibleHeight =
    suggestion instanceof HTMLElement && !suggestion.hidden
      ? Math.max(0, Math.min(measuredHeight, measuredTop + measuredHeight - window.scrollY))
      : 0
  if (visibleHeight === lastVisibleHeight) return
  lastVisibleHeight = visibleHeight
  document.documentElement.style.setProperty(
    '--language-suggestion-visible-height',
    `${visibleHeight}px`
  )
}

const scheduleOffsetUpdate = () => {
  if (offsetFrame) return
  offsetFrame = requestAnimationFrame(() => {
    offsetFrame = 0
    updateHeaderOffset()
  })
}

const measureSuggestion = () => {
  if (!(suggestion instanceof HTMLElement) || suggestion.hidden) return
  const { top, height } = suggestion.getBoundingClientRect()
  measuredHeight = height
  measuredTop = top + window.scrollY
  updateHeaderOffset()
}

const startOffsetTracking = () => {
  const element = suggestion instanceof HTMLElement ? suggestion : undefined
  const observer =
    typeof ResizeObserver === 'undefined' || !element
      ? undefined
      : new ResizeObserver(measureSuggestion)

  if (element) observer?.observe(element)
  if (!observer) requestAnimationFrame(measureSuggestion)
  window.addEventListener('scroll', scheduleOffsetUpdate, { passive: true })
  window.addEventListener('resize', measureSuggestion)
  stopOffsetTracking = () => {
    window.removeEventListener('scroll', scheduleOffsetUpdate)
    window.removeEventListener('resize', measureSuggestion)
    cancelAnimationFrame(offsetFrame)
    offsetFrame = 0
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
