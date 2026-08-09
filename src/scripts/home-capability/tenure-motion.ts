import gsap from 'gsap'
import type { CapabilityMotionRuntime } from './runtime'

interface TenureElements {
  card: HTMLElement
  path: SVGPathElement | null
  nodes: SVGCircleElement[]
  number: HTMLElement | null
  numberValue: HTMLElement | null
  status: HTMLElement | null
  range: HTMLElement | null
}

export const createTenurePlayer = (
  { card, path, nodes, number, numberValue, status, range }: TenureElements,
  runtime: CapabilityMotionRuntime
) => {
  return (direction: 1 | -1) => {
    const targets = [card, path, number, numberValue, status, range, ...nodes].filter(Boolean)
    gsap.killTweensOf(targets)

    gsap.set(card, { opacity: 0, y: 24 * direction })
    gsap.set(path, { strokeDashoffset: direction > 0 ? 1 : -1 })
    gsap.set(nodes, { opacity: 0.2, scale: 0.55 })
    gsap.set(number, { opacity: 0, scale: 0.82, y: 10 * direction })
    gsap.set(status, { opacity: 0, scale: 0 })
    gsap.set(range, { scaleX: 0, transformOrigin: direction > 0 ? 'left' : 'right' })

    runtime
      .createTimeline(card)
      .to(card, { opacity: 1, y: 0, duration: 0.62, ease: 'power3.out' })
      .to(number, { opacity: 1, scale: 1, y: 0, duration: 0.52, ease: 'back.out(1.45)' }, 0.08)
      .call(() => numberValue && runtime.animateNumber(numberValue), [], 0.08)
      .to(status, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, 0.16)
      .to(path, { strokeDashoffset: 0, duration: 1.05, ease: 'power2.inOut' }, 0.14)
      .to(
        nodes,
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          stagger: { each: 0.14, from: direction > 0 ? 'start' : 'end' },
          ease: 'back.out(1.8)',
        },
        0.26
      )
      .to(range, { scaleX: 1, duration: 0.65, ease: 'power2.inOut' }, 0.4)
      .set(card, { clearProps: 'opacity,transform' })
      .set(number, { clearProps: 'opacity,transform' })
      .set(status, { clearProps: 'opacity,transform' })
      .set(range, { clearProps: 'transform,transformOrigin' })
      .set(nodes, { clearProps: 'opacity,transform' })
  }
}
