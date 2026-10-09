export const DETAIL_REVEAL_TIMING = {
  threshold: 0.08,
  rootMargin: '0px 0px -7% 0px',
  copyDistance: '0 0.875rem',
  mediaScale: '1.025',
  duration: 800,
  stagger: 150,
  maxStagger: 320,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const

export type DetailRevealKind = 'copy' | 'media'

export interface DetailRevealTarget {
  element: HTMLElement
  kind: DetailRevealKind
}

const candidateSelector = 'article, li, figure, video, img, h1, h2, h3, p'
const structuralSelector = 'article, li, figure, video, img'
const excludedSelector = '[hidden], [aria-hidden="true"], details, [role="tabpanel"]'

const isOuterPageContainer = (element: HTMLElement) =>
  element.matches('article') &&
  (element.parentElement?.matches('main') || Boolean(element.querySelector(':scope > section')))

const hasExcludedAncestor = (element: HTMLElement) => Boolean(element.closest(excludedSelector))

const hasStructuralAncestor = (element: HTMLElement) => {
  const parent = element.parentElement?.closest<HTMLElement>(structuralSelector)
  return Boolean(parent && !isOuterPageContainer(parent))
}

export const collectDetailRevealTargets = (root: HTMLElement): DetailRevealTarget[] =>
  Array.from(root.querySelectorAll<HTMLElement>(candidateSelector))
    .filter((element) => !hasExcludedAncestor(element))
    .filter((element) => !isOuterPageContainer(element))
    .filter((element) => !hasStructuralAncestor(element))
    .filter((element) => element.getClientRects().length > 0)
    .map((element) => ({
      element,
      kind: element.matches('figure, video, img') ? 'media' : 'copy',
    }))
