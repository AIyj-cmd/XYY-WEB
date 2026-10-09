import {
  collectDetailRevealTargets,
  DETAIL_REVEAL_TIMING,
  type DetailRevealTarget,
} from './detail-reveal-targets'

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const marker = document.querySelector<HTMLElement>('[data-service-detail-motion-root]')
const root = marker?.parentElement instanceof HTMLElement ? marker.parentElement : null
const pendingAttribute = 'data-service-detail-reveal'

const clearTarget = (target: DetailRevealTarget, animation?: Animation) => {
  target.element.removeAttribute(pendingAttribute)
  animation?.cancel()
}

const reveal = (target: DetailRevealTarget, animations: Map<HTMLElement, Animation>, delay = 0) => {
  if (!target.element.hasAttribute(pendingAttribute) || animations.has(target.element)) return

  const keyframes: Keyframe[] =
    target.kind === 'media'
      ? [
          { opacity: 0, scale: DETAIL_REVEAL_TIMING.mediaScale },
          { opacity: 1, scale: 1 },
        ]
      : [
          { opacity: 0, translate: DETAIL_REVEAL_TIMING.copyDistance },
          { opacity: 1, translate: '0' },
        ]
  const animation = target.element.animate(keyframes, {
    duration: DETAIL_REVEAL_TIMING.duration,
    delay,
    easing: DETAIL_REVEAL_TIMING.easing,
    fill: 'both',
  })

  animations.set(target.element, animation)
  animation.addEventListener(
    'finish',
    () => {
      clearTarget(target, animation)
      animations.delete(target.element)
    },
    { once: true }
  )
}

const isVisibleSoon = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight * 1.12 && rect.bottom > window.innerHeight * -0.12
}

const revealInOrder = (targets: DetailRevealTarget[], animations: Map<HTMLElement, Animation>) =>
  targets.forEach((target, index) => {
    reveal(
      target,
      animations,
      Math.min(index * DETAIL_REVEAL_TIMING.stagger, DETAIL_REVEAL_TIMING.maxStagger)
    )
  })

const hashTarget = () => {
  if (!location.hash) return null
  const hash = location.hash.slice(1)

  try {
    return document.getElementById(decodeURIComponent(hash))
  } catch {
    return document.getElementById(hash)
  }
}

const initialize = () => {
  if (
    !root ||
    motionQuery.matches ||
    !('IntersectionObserver' in window) ||
    !HTMLElement.prototype.animate
  )
    return () => undefined

  const targets = collectDetailRevealTargets(root)
  if (!targets.length) return () => undefined

  const animations = new Map<HTMLElement, Animation>()
  const targetByElement = new Map(targets.map((target) => [target.element, target]))
  const targetOrder = new Map(targets.map((target, index) => [target.element, index]))
  let pointerDownTarget: EventTarget | null = null
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleTargets = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (left, right) =>
            (targetOrder.get(left.target as HTMLElement) ?? 0) -
            (targetOrder.get(right.target as HTMLElement) ?? 0)
        )
        .flatMap((entry) => {
          observer.unobserve(entry.target)
          const target = targetByElement.get(entry.target as HTMLElement)
          return target ? [target] : []
        })
      revealInOrder(visibleTargets, animations)
    },
    {
      threshold: DETAIL_REVEAL_TIMING.threshold,
      rootMargin: DETAIL_REVEAL_TIMING.rootMargin,
    }
  )
  const revealAll = () => {
    observer.disconnect()
    targets.forEach((target) => clearTarget(target, animations.get(target.element)))
    animations.clear()
  }

  targets.forEach((target) => {
    target.element.setAttribute(pendingAttribute, target.kind)
    if (!isVisibleSoon(target.element)) observer.observe(target.element)
  })
  revealInOrder(
    targets.filter((target) => isVisibleSoon(target.element)),
    animations
  )

  const anchor = hashTarget()
  if (anchor) {
    targets
      .filter((target) => target.element.contains(anchor))
      .forEach((target) => {
        clearTarget(target, animations.get(target.element))
        animations.delete(target.element)
      })
  }
  const clearPointerDownTarget = () => {
    pointerDownTarget = null
  }
  const onPointerDown = (event: PointerEvent | MouseEvent) => {
    pointerDownTarget = event.target
  }
  const onFocusIn = (event: FocusEvent) => {
    const element = (event.target as HTMLElement).closest<HTMLElement>(`[${pendingAttribute}]`)
    const target = element ? targetByElement.get(element) : undefined
    const pointerFocus =
      pointerDownTarget instanceof Node && Boolean(element?.contains(pointerDownTarget))
    clearPointerDownTarget()
    if (target && !pointerFocus) {
      clearTarget(target, animations.get(target.element))
      animations.delete(target.element)
    }
  }
  root.addEventListener('pointerdown', onPointerDown, { capture: true })
  root.addEventListener('mousedown', onPointerDown, { capture: true })
  root.addEventListener('focusin', onFocusIn, { capture: true })
  window.addEventListener('pointerup', clearPointerDownTarget, { capture: true })
  window.addEventListener('pointercancel', clearPointerDownTarget, { capture: true })
  window.addEventListener('mouseup', clearPointerDownTarget, { capture: true })
  return () => {
    root.removeEventListener('pointerdown', onPointerDown, { capture: true })
    root.removeEventListener('mousedown', onPointerDown, { capture: true })
    root.removeEventListener('focusin', onFocusIn, { capture: true })
    window.removeEventListener('pointerup', clearPointerDownTarget, { capture: true })
    window.removeEventListener('pointercancel', clearPointerDownTarget, { capture: true })
    window.removeEventListener('mouseup', clearPointerDownTarget, { capture: true })
    clearPointerDownTarget()
    revealAll()
  }
}

let cleanup = initialize()

motionQuery.addEventListener('change', (event) => {
  if (!event.matches) return
  cleanup()
  cleanup = () => undefined
})

window.addEventListener('pagehide', () => cleanup(), { once: true })
