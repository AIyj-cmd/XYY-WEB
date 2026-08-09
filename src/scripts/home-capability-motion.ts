import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createStatCardPlayer } from './home-capability/card-motion'
import { createFlowPlayer } from './home-capability/flow-motion'
import { createCapabilityMotionRuntime } from './home-capability/runtime'
import { createTenurePlayer } from './home-capability/tenure-motion'

gsap.registerPlugin(ScrollTrigger)

const statsSection = document.querySelector<HTMLElement>('.s-stats')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (statsSection && !reduceMotion) {
  const runtime = createCapabilityMotionRuntime()
  const tenureCard = statsSection.querySelector<HTMLElement>('.stats-tenure')
  const statCards = Array.from(statsSection.querySelectorAll<HTMLElement>('.stat-card'))
  const statsFlow = statsSection.querySelector<HTMLElement>('.stats-flow')

  if (tenureCard) {
    const playTenure = createTenurePlayer(
      {
        card: tenureCard,
        path: statsSection.querySelector<SVGPathElement>('.tenure-route-progress'),
        nodes: Array.from(statsSection.querySelectorAll<SVGCircleElement>('.tenure-route-node')),
        number: statsSection.querySelector<HTMLElement>('.tenure-value'),
        numberValue: statsSection.querySelector<HTMLElement>('.tenure-value strong[data-raw]'),
        status: statsSection.querySelector<HTMLElement>('.tenure-status i'),
        range: statsSection.querySelector<HTMLElement>('.tenure-range i'),
      },
      runtime
    )

    ScrollTrigger.create({
      trigger: tenureCard,
      start: 'top 86%',
      end: 'bottom 14%',
      onEnter: () => playTenure(1),
      onEnterBack: () => playTenure(-1),
    })
  }

  const playStatCard = createStatCardPlayer(runtime)
  statCards.forEach((card) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 86%',
      end: 'bottom 14%',
      onEnter: () => playStatCard(card, 1),
      onEnterBack: () => playStatCard(card, -1),
    })
  })

  if (statsFlow) {
    const playFlow = createFlowPlayer(
      {
        container: statsFlow,
        progress: statsSection.querySelector<HTMLElement>('.stats-flow-progress'),
        steps: Array.from(statsSection.querySelectorAll<HTMLElement>('.stats-flow-step')),
        nodes: Array.from(statsSection.querySelectorAll<HTMLElement>('.stats-flow-step > i')),
      },
      runtime
    )

    ScrollTrigger.create({
      trigger: statsFlow,
      start: 'top 90%',
      end: 'bottom 10%',
      onEnter: () => playFlow(1),
      onEnterBack: () => playFlow(-1),
    })
  }
}
