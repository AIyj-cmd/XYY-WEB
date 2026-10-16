import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!prefersReducedMotion) {
  gsap.registerPlugin(ScrollTrigger)

  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)

  const heroTargets =
    '.hero-eyebrow, .hero-brand-kw, .hero-title .hl, .hero-sub, .hero-data, .hero-actions'
  let heroTimeline: gsap.core.Timeline | undefined

  try {
    heroTimeline = gsap.timeline({ delay: 0.3 })
    heroTimeline
      .fromTo(
        '.hero-eyebrow',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        0
      )
      .fromTo(
        '.hero-brand-kw, .hero-title .hl',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.75,
          ease: 'power3.out',
        },
        0.25
      )
      .fromTo(
        '.hero-sub, .hero-data',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        0.6
      )
      .fromTo(
        '.hero-actions',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        0.8
      )
  } catch (error) {
    heroTimeline?.kill()
    gsap.set(heroTargets, { clearProps: 'transform,opacity,visibility' })
    throw error
  }
}

import './home-capability-motion'
import './home-service-motion'
