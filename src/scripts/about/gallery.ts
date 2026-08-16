import {
  prefersReducedMotion,
  revealVisualOnScroll,
  scheduleScrollTriggerRefresh,
} from '@/scripts/motion/scroll-reveal'
import { CLEARED_REVEAL_PROPS, gsap } from '@/scripts/motion/runtime'

const gallery = document.querySelector<HTMLElement>('[data-about-gallery]')
const statements = Array.from(
  gallery?.querySelectorAll<HTMLElement>('[data-about-gallery-statement]') ?? []
)
let activeStatement = -1
let animationFrame = 0

const clamp = (value: number) => Math.min(1, Math.max(0, value))

const showStatement = (nextIndex: number) => {
  if (nextIndex === activeStatement) return

  const previous = statements[activeStatement]
  if (previous) {
    const previousTargets = Array.from(previous.children) as HTMLElement[]
    previous.dataset.active = 'false'
    previous.dataset.exiting = 'true'
    previous.setAttribute('aria-hidden', 'true')
    gsap.killTweensOf(previousTargets)
    gsap.to(previousTargets, {
      autoAlpha: 0,
      y: -12,
      filter: 'blur(2px)',
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => {
        delete previous.dataset.exiting
        previous.style.visibility = 'hidden'
      },
    })
  }

  const next = statements[nextIndex]
  if (!next) return
  const targets = Array.from(next.children) as HTMLElement[]
  next.style.visibility = 'visible'
  next.dataset.active = 'true'
  next.setAttribute('aria-hidden', 'false')
  gsap.killTweensOf(targets)
  gsap.set(targets, {
    autoAlpha: 0,
    y: 28,
    filter: 'blur(4px)',
  })
  gsap.to(targets, {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.82,
    stagger: 0.12,
    ease: 'power3.out',
    clearProps: CLEARED_REVEAL_PROPS,
  })
  activeStatement = nextIndex
}

const updateStatement = () => {
  animationFrame = 0
  if (!gallery || !statements.length) return
  const rect = gallery.getBoundingClientRect()
  if (rect.top > window.innerHeight * 0.84 || rect.bottom < window.innerHeight * 0.16) return

  const scrollDistance = Math.max(gallery.offsetHeight - window.innerHeight, 1)
  const progress = clamp(-rect.top / scrollDistance)
  showStatement(Math.min(statements.length - 1, Math.round(progress * (statements.length - 1))))
}

const requestStatementUpdate = () => {
  if (animationFrame) return
  animationFrame = window.requestAnimationFrame(updateStatement)
}

if (!prefersReducedMotion()) {
  document.querySelectorAll<HTMLElement>('[data-about-gallery-image]').forEach((element) => {
    revealVisualOnScroll({ element })
  })

  updateStatement()
  window.addEventListener('scroll', requestStatementUpdate, { passive: true })
  window.addEventListener('resize', requestStatementUpdate)
  scheduleScrollTriggerRefresh()
}
