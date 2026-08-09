import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// ── Lenis smooth scroll ──────────────────────────────────────
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)

// ── Hero reveal on load ──────────────────────────────────────
const heroTl = gsap.timeline({ delay: 0.3 })
heroTl
  .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0)
  .to(
    '.hero-brand-kw, .hero-title .hl',
    {
      opacity: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.75,
      ease: 'power3.out',
    },
    0.25
  )
  .to('.hero-sub, .hero-data', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.6)
  .to('.hero-actions', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.8)

// Set initial y for hero elements
gsap.set('.hero-eyebrow, .hero-brand-kw, .hero-title .hl, .hero-sub, .hero-data, .hero-actions', {
  y: 30,
})

import './home-capability-motion'
import './home-service-motion'
