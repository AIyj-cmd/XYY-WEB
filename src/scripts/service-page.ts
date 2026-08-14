import { prefersReducedMotion, scheduleScrollTriggerRefresh } from '@/scripts/motion/scroll-reveal'
import { initServiceHeroMotion } from '@/scripts/service-motion/hero'
import { initServiceSectionMotion } from '@/scripts/service-motion/sections'

const root = document.querySelector<HTMLElement>('[data-service-motion-root]')

if (root && !prefersReducedMotion()) {
  initServiceHeroMotion(root)
  initServiceSectionMotion()
  scheduleScrollTriggerRefresh()
}
