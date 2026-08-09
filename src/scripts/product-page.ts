import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const textTargetsFor = (element: HTMLElement) => {
  if (element.matches('.series-spread__copy')) {
    const meta = Array.from(
      element.querySelectorAll<HTMLElement>(':scope > .series-spread__meta > *')
    )
    const rest = Array.from(element.children).filter(
      (child) => !child.matches('.series-spread__meta')
    ) as HTMLElement[]
    return [...meta, ...rest]
  }

  if (element.matches('.care-heading,.assurance-heading')) {
    const headingChildren = Array.from(element.querySelectorAll<HTMLElement>(':scope > div > *'))
    const rest = Array.from(element.children).filter(
      (child) => !child.matches('div')
    ) as HTMLElement[]
    return [...headingChildren, ...rest]
  }

  if (
    element.matches(
      '.editorial-process li,.warehouse-hero__stat,.assurance-mechanisms__list article'
    )
  ) {
    const leading = Array.from(element.children).filter(
      (child) => !child.matches('div')
    ) as HTMLElement[]
    const nested = Array.from(element.querySelectorAll<HTMLElement>(':scope > div > *'))
    return [...leading, ...nested]
  }

  return Array.from(element.children) as HTMLElement[]
}

if (!prefersReducedMotion) {
  document.querySelectorAll<HTMLElement>('[data-reveal="copy"]').forEach((element) => {
    const targets = textTargetsFor(element).filter((target) => !target.hasAttribute('hidden'))
    if (!targets.length) return

    gsap.set(targets, { autoAlpha: 0, y: 28, filter: 'blur(4px)' })
    gsap.to(targets, {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.82,
      stagger: 0.12,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility,filter',
      scrollTrigger: {
        trigger: element,
        start: 'top 84%',
        once: true,
      },
    })
  })

  document.querySelectorAll<HTMLElement>('[data-reveal="image"]').forEach((element) => {
    const image = element.querySelector<HTMLElement>('img')
    const fromLeft =
      element.matches('.series-spread__image,.series-spread__care-gallery-main') &&
      !element.closest('.series-spread--reverse')
    const fromRight = element.matches(
      '.warehouse-hero__visual,.needs-directory__visuals,.series-spread--reverse .series-spread__image'
    )
    const x = fromLeft ? -42 : fromRight ? 42 : 0
    const y = x === 0 ? 34 : 0

    gsap.set(element, { autoAlpha: 0, x, y, scale: 0.975, clipPath: 'inset(0 0 8% 0)' })
    if (image) gsap.set(image, { scale: 1.06 })

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top 84%',
        once: true,
      },
    })

    timeline.to(element, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      clipPath: 'inset(0 0 0% 0)',
      duration: 1.05,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility,clipPath',
    })
    if (image)
      timeline.to(
        image,
        { scale: 1, duration: 1.1, ease: 'power2.out', clearProps: 'transform' },
        0
      )
  })
}
