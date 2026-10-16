import { CLEARED_REVEAL_PROPS, gsap } from '@/scripts/motion/runtime'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface CopyRevealOptions {
  trigger: HTMLElement
  targets: HTMLElement[]
  start?: string
  x?: number
  y?: number
  scale?: number
  blur?: number
  duration?: number
  stagger?: number
}

export const revealCopyOnScroll = ({
  trigger,
  targets,
  start = 'top 84%',
  x = 0,
  y = 28,
  scale = 1,
  blur = 4,
  duration = 0.82,
  stagger = 0.12,
}: CopyRevealOptions) => {
  if (!targets.length) return

  ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter: () => {
      let timeline: gsap.core.Timeline | undefined

      try {
        timeline = gsap.timeline({ paused: true })
        timeline
          .fromTo(
            targets,
            {
              autoAlpha: 0,
              x,
              y,
              scale,
              filter: `blur(${blur}px)`,
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration,
              stagger,
              ease: 'power3.out',
              clearProps: CLEARED_REVEAL_PROPS,
            }
          )
          .play(0)
      } catch (error) {
        timeline?.clear()
        timeline?.kill()
        gsap.set(targets, { clearProps: CLEARED_REVEAL_PROPS })
        throw error
      }
    },
  })
}
