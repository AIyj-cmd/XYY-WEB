import {
  prefersReducedMotion,
  revealCopyOnScroll,
  revealVisualOnScroll,
  scheduleScrollTriggerRefresh,
} from '@/scripts/motion/scroll-reveal'

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

if (!prefersReducedMotion()) {
  document.querySelectorAll<HTMLElement>('[data-reveal="copy"]').forEach((element) => {
    const targets = textTargetsFor(element).filter((target) => !target.hasAttribute('hidden'))
    if (!targets.length) return

    revealCopyOnScroll({
      trigger: element,
      targets,
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

    revealVisualOnScroll({ element, image, x, y })
  })

  scheduleScrollTriggerRefresh()
}
