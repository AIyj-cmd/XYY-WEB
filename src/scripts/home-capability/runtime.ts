import gsap from 'gsap'

const parseValue = (raw: string) => {
  const match = raw.match(/^(\d+(?:\.\d+)?)(.*)$/)
  if (!match) return { value: 0, suffix: '', decimals: 0 }

  const decimals = match[1].includes('.') ? match[1].split('.')[1].length : 0
  return { value: Number.parseFloat(match[1]), suffix: match[2], decimals }
}

export const createCapabilityMotionRuntime = () => {
  const numberCounters = new WeakMap<HTMLElement, { value: number }>()
  const moduleTimelines = new WeakMap<Element, gsap.core.Timeline>()

  const createTimeline = (element: Element) => {
    moduleTimelines.get(element)?.kill()
    const timeline = gsap.timeline()
    moduleTimelines.set(element, timeline)
    return timeline
  }

  const animateNumber = (element: HTMLElement) => {
    const raw = element.dataset.raw || ''
    const { value, suffix, decimals } = parseValue(raw)
    if (!value) {
      element.textContent = raw
      return
    }

    const previousCounter = numberCounters.get(element)
    if (previousCounter) gsap.killTweensOf(previousCounter)

    const counter = { value: 0 }
    numberCounters.set(element, counter)
    element.textContent = `0${suffix}`

    gsap.to(counter, {
      value,
      duration: 1.35,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        const current = decimals > 0 ? counter.value.toFixed(decimals) : Math.floor(counter.value)
        element.textContent = `${current}${suffix}`
      },
      onComplete: () => {
        element.textContent = raw
        numberCounters.delete(element)
      },
    })
  }

  return { animateNumber, createTimeline }
}

export type CapabilityMotionRuntime = ReturnType<typeof createCapabilityMotionRuntime>
