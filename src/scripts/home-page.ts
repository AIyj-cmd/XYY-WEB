export {}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
let requested = false
let observer: IntersectionObserver | undefined

const stopListening = () => {
  observer?.disconnect()
  window.removeEventListener('wheel', loadMotion)
  window.removeEventListener('touchstart', loadMotion)
  window.removeEventListener('scroll', loadMotion)
  window.removeEventListener('keydown', loadFromKeyboard)
}

const loadMotion = () => {
  if (requested || reducedMotion.matches) return
  requested = true
  stopListening()
  void import('./home-motion-loader').catch((error: unknown) => {
    // Content remains server-rendered and usable if optional motion cannot be loaded.
    console.error('Unable to load homepage motion', error)
  })
}

const loadFromKeyboard = (event: KeyboardEvent) => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
    loadMotion()
  }
}

if (!reducedMotion.matches) {
  window.addEventListener('wheel', loadMotion, { passive: true })
  window.addEventListener('touchstart', loadMotion, { passive: true })
  window.addEventListener('scroll', loadMotion, { passive: true })
  window.addEventListener('keydown', loadFromKeyboard)

  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0)) {
          loadMotion()
        }
      },
      { threshold: 0.01 }
    )
    document
      .querySelectorAll('.s-stats, .s-service')
      .forEach((section) => observer?.observe(section))
  }
}
