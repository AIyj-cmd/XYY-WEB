import gsap from 'gsap'
import type { CapabilityMotionRuntime } from './runtime'

interface FlowElements {
  container: HTMLElement
  progress: HTMLElement | null
  steps: HTMLElement[]
  nodes: HTMLElement[]
}

export const createFlowPlayer = (
  { container, progress, steps, nodes }: FlowElements,
  runtime: CapabilityMotionRuntime
) => {
  return (direction: 1 | -1) => {
    const mobile = window.matchMedia('(max-width: 700px)').matches
    gsap.killTweensOf([progress, ...steps, ...nodes])
    gsap.set(progress, {
      scaleX: mobile ? 1 : 0,
      scaleY: mobile ? 0 : 1,
      transformOrigin: mobile
        ? direction > 0
          ? 'center top'
          : 'center bottom'
        : direction > 0
          ? 'left center'
          : 'right center',
    })
    gsap.set(steps, {
      opacity: 0.35,
      x: mobile ? 7 * -direction : 0,
      y: mobile ? 0 : 7 * direction,
    })
    gsap.set(nodes, { scale: 0.5 })

    runtime
      .createTimeline(container)
      .to(progress, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.95,
        ease: 'power2.inOut',
        onComplete: () => gsap.set(progress, { clearProps: 'transform,transformOrigin' }),
      })
      .to(
        steps,
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.32,
          stagger: { each: 0.1, from: direction > 0 ? 'start' : 'end' },
          ease: 'power2.out',
        },
        0.08
      )
      .to(
        nodes,
        {
          scale: 1,
          duration: 0.25,
          stagger: { each: 0.1, from: direction > 0 ? 'start' : 'end' },
          ease: 'back.out(2)',
        },
        0.12
      )
      .set(steps, { clearProps: 'opacity,transform' })
      .set(nodes, { clearProps: 'transform' })
  }
}
