import { revealCopyOnScroll, revealVisualOnScroll } from '@/scripts/motion/scroll-reveal'

const visibleChildren = (element: HTMLElement) =>
  (Array.from(element.children) as HTMLElement[]).filter(
    (child) => !child.hidden && child.getAttribute('aria-hidden') !== 'true'
  )

export const initServiceSectionMotion = () => {
  document.querySelectorAll<HTMLElement>('[data-service-reveal="copy"]').forEach((element) => {
    revealCopyOnScroll({
      trigger: element,
      targets: visibleChildren(element),
    })
  })

  document.querySelectorAll<HTMLElement>('[data-service-reveal="visual"]').forEach((element) => {
    if (!element.childElementCount || element.matches(':empty')) return

    revealVisualOnScroll({
      element,
      image: element.querySelector<HTMLElement>('img'),
    })
  })
}
