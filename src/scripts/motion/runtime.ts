import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const CLEARED_REVEAL_PROPS = 'transform,opacity,visibility,filter'

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const scheduleScrollTriggerRefresh = () => {
  const refresh = () => window.requestAnimationFrame(() => ScrollTrigger.refresh())

  refresh()
  void document.fonts?.ready.then(refresh)

  if (document.readyState === 'complete') refresh()
  else window.addEventListener('load', refresh, { once: true })
}

export { gsap }
