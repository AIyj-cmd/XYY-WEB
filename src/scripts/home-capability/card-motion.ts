import gsap from 'gsap'
import type { CapabilityMotionRuntime } from './runtime'

export const createStatCardPlayer = (runtime: CapabilityMotionRuntime) => {
  return (card: HTMLElement, direction: 1 | -1) => {
    const numbers = Array.from(card.querySelectorAll<HTMLElement>('.stat-num'))
    const warehouseBars = Array.from(
      card.querySelectorAll<HTMLElement>('.warehouse-schematic span')
    )
    const networkOrbit = card.querySelector<HTMLElement>('.network-orbit')
    const networkNodes = Array.from(card.querySelectorAll<HTMLElement>('.network-orbit i'))
    const inspectionDirections = Array.from(
      card.querySelectorAll<HTMLElement>('.inspection-direction')
    )
    const accuracyRing = card.querySelector<HTMLElement>('.accuracy-ring')
    const decorTargets = [
      ...warehouseBars,
      networkOrbit,
      ...networkNodes,
      ...inspectionDirections,
      accuracyRing,
    ].filter(Boolean)

    gsap.killTweensOf([card, ...decorTargets])
    gsap.set(card, { opacity: 0, y: 26 * direction })

    const timeline = runtime.createTimeline(card)
    timeline
      .to(card, { opacity: 1, y: 0, duration: 0.58, ease: 'power3.out' })
      .call(() => numbers.forEach(runtime.animateNumber), [], 0.08)

    if (warehouseBars.length) {
      timeline.fromTo(
        warehouseBars,
        { opacity: 0.15, scaleY: 0.18, transformOrigin: 'center bottom' },
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.46,
          stagger: { each: 0.08, from: direction > 0 ? 'start' : 'end' },
          ease: 'back.out(1.65)',
          clearProps: 'opacity,transform,transformOrigin',
        },
        0.16
      )
    }

    if (networkOrbit) {
      timeline
        .fromTo(
          networkOrbit,
          { opacity: 0, rotation: -32 * direction, scale: 0.72 },
          {
            opacity: 1,
            rotation: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
          },
          0.1
        )
        .fromTo(
          networkNodes,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.28,
            stagger: { each: 0.07, from: direction > 0 ? 'start' : 'end' },
            ease: 'back.out(2)',
            clearProps: 'opacity,transform',
          },
          0.26
        )
    }

    if (inspectionDirections.length) {
      timeline.fromTo(
        inspectionDirections,
        { opacity: 0, x: 10 * -direction },
        {
          opacity: 1,
          x: 0,
          duration: 0.38,
          stagger: { each: 0.11, from: direction > 0 ? 'start' : 'end' },
          ease: 'power2.out',
          clearProps: 'opacity,transform',
        },
        0.16
      )
    }

    if (accuracyRing) {
      timeline.fromTo(
        accuracyRing,
        { opacity: 0, rotation: -105 * direction, scale: 0.76 },
        {
          opacity: 0.24,
          rotation: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        },
        0.1
      )
    }

    timeline.set(card, { clearProps: 'opacity,transform' })
  }
}
