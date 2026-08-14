import { CLEARED_REVEAL_PROPS, gsap } from '@/scripts/motion/runtime'

interface EntranceRevealOptions {
  targets: HTMLElement[]
  x?: number
  y?: number
  scale?: number
  blur?: number
  duration?: number
  stagger?: number
  delay?: number
}

export const revealOnLoad = ({
  targets,
  x = 0,
  y = 20,
  scale = 1,
  blur = 3,
  duration = 0.72,
  stagger = 0.09,
  delay = 0.08,
}: EntranceRevealOptions) => {
  if (!targets.length) return

  gsap.fromTo(
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
      delay,
      ease: 'power3.out',
      clearProps: CLEARED_REVEAL_PROPS,
    }
  )
}
