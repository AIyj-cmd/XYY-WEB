import { CLEARED_REVEAL_PROPS, gsap } from '@/scripts/motion/runtime'

interface VisualRevealOptions {
  element: HTMLElement
  image?: HTMLElement | null
  start?: string
  x?: number
  y?: number
  duration?: number
}

export const revealVisualOnScroll = ({
  element,
  image,
  start = 'top 84%',
  x = 0,
  y = x === 0 ? 34 : 0,
  duration = 1.05,
}: VisualRevealOptions) => {
  gsap.set(element, {
    autoAlpha: 0,
    x,
    y,
    scale: 0.975,
    clipPath: 'inset(0 0 8% 0)',
  })
  if (image) gsap.set(image, { scale: 1.06 })

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: element,
      start,
      once: true,
    },
  })

  timeline.to(element, {
    autoAlpha: 1,
    x: 0,
    y: 0,
    scale: 1,
    clipPath: 'inset(0 0 0% 0)',
    duration,
    ease: 'power3.out',
    clearProps: `${CLEARED_REVEAL_PROPS},clipPath`,
  })

  if (image) {
    timeline.to(
      image,
      {
        scale: 1,
        duration: 1.1,
        ease: 'power2.out',
        clearProps: 'transform',
      },
      0
    )
  }
}
