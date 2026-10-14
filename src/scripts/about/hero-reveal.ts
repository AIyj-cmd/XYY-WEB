const stage = document.querySelector<HTMLElement>('[data-about-hero-reveal]')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

if (stage) {
  let revealDistance = 0
  let maxInset = 0
  let ticking = false

  const reset = () => {
    stage.style.removeProperty('--about-reveal-inset')
    stage.style.removeProperty('--about-reveal-radius')
  }

  const update = () => {
    ticking = false
    if (reducedMotion.matches || revealDistance === 0) return

    const stageTop = stage.getBoundingClientRect().top + window.scrollY
    const progress = Math.min(1, Math.max(0, (window.scrollY - stageTop) / revealDistance))

    stage.style.setProperty('--about-reveal-inset', `${Math.round(maxInset * progress)}px`)
    stage.style.setProperty('--about-reveal-radius', `${Math.round(36 * progress)}px`)
  }

  const requestUpdate = () => {
    if (ticking) return
    ticking = true
    window.requestAnimationFrame(update)
  }

  const measure = () => {
    if (reducedMotion.matches) {
      reset()
      return
    }

    revealDistance = stage.getBoundingClientRect().height
    maxInset =
      window.innerWidth < 768 ? window.innerWidth * 0.2 : Math.min(480, window.innerWidth * 0.28)
    requestUpdate()
  }

  const enable = () => {
    if (reducedMotion.matches) {
      reset()
      return
    }

    measure()
  }

  window.addEventListener('scroll', requestUpdate, { passive: true })
  window.addEventListener('resize', measure)
  reducedMotion.addEventListener('change', enable)
  enable()
}
