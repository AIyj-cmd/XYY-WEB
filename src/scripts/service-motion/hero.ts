import { revealOnLoad } from '@/scripts/motion/scroll-reveal'

export const initServiceHeroMotion = (root: HTMLElement) => {
  const copy = root.querySelector<HTMLElement>('[data-service-hero-copy]')
  const media = root.querySelector<HTMLElement>('[data-service-hero-media]')

  if (media) {
    revealOnLoad({
      targets: [media],
      scale: 1.025,
      y: 0,
      blur: 0,
      duration: 1.15,
      stagger: 0,
      delay: 0,
    })
  }

  if (copy) {
    revealOnLoad({
      targets: Array.from(copy.children) as HTMLElement[],
      y: 20,
      duration: 0.72,
      stagger: 0.09,
      delay: 0.12,
    })
  }
}
