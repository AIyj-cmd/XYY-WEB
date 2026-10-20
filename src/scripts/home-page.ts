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

  // Keep the server-rendered hero readable from first paint; animate sections below it.
}

import './home-capability-motion'
import './home-service-motion'
