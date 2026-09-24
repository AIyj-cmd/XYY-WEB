type ManagedVideo = {
  index: number
  slide: HTMLElement
  video: HTMLVideoElement
  source: HTMLSourceElement
  src: string
}

const initProductVideoMedia = () => {
  document.querySelectorAll<HTMLElement>('[data-product-video-sequence]').forEach((sequence) => {
    if (sequence.dataset.mediaInitialized === 'true') return

    const scrollContainer = sequence.querySelector<HTMLElement>('[data-product-video-scroll]')
    const slides = Array.from(sequence.querySelectorAll<HTMLElement>('[data-product-video-slide]'))
    const videos = Array.from(sequence.querySelectorAll<HTMLVideoElement>('[data-product-video]'))
    if (!scrollContainer || !slides.length || !videos.length || !('IntersectionObserver' in window))
      return

    const managed = videos.flatMap((video) => {
      const source = video.querySelector<HTMLSourceElement>('source[data-src]')
      const slide = video.closest<HTMLElement>('[data-product-video-slide]')
      const src = source?.dataset.src
      if (!source || !slide || !src) return []
      return [{ index: slides.indexOf(slide), slide, video, source, src }]
    })
    if (!managed.length) return

    sequence.dataset.mediaInitialized = 'true'
    const ratios = new Map<HTMLElement, number>()
    let activeIndex = 0
    let revision = 0
    let pageHidden = document.hidden
    let canPlayController: AbortController | undefined

    const sourceIsAttached = ({ source, src }: ManagedVideo) => source.getAttribute('src') === src

    const attach = (item: ManagedVideo, preload: 'auto' | 'metadata') => {
      item.video.preload = preload
      if (!sourceIsAttached(item)) {
        item.source.src = item.src
        item.video.load()
      }
    }

    const release = (item: ManagedVideo) => {
      item.video.pause()
      item.video.autoplay = false
      item.video.preload = 'none'
      if (sourceIsAttached(item)) {
        item.source.removeAttribute('src')
        item.video.load()
      }
    }

    const cancelCanPlay = () => {
      canPlayController?.abort()
      canPlayController = undefined
    }

    const handlePlayFailure = (error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return
      console.warn('product_video_play_failed', error)
    }

    const prepareNext = (current: ManagedVideo, currentRevision: number) => {
      if (pageHidden || currentRevision !== revision || current.index !== activeIndex) return
      const next = managed.find((item) => item.index === current.index + 1)
      if (!next) return
      next.video.autoplay = false
      attach(next, 'metadata')
    }

    const playCurrent = (current: ManagedVideo, currentRevision: number) => {
      current.video.autoplay = true
      current.video.muted = true
      current.video.loop = true
      attach(current, 'auto')
      void current.video.play().then(() => prepareNext(current, currentRevision), handlePlayFailure)
      canPlayController = new AbortController()
      current.video.addEventListener('canplay', () => prepareNext(current, currentRevision), {
        once: true,
        signal: canPlayController.signal,
      })
    }

    const sync = () => {
      const currentRevision = ++revision
      cancelCanPlay()
      if (pageHidden) return
      const current = managed.find((item) => item.index === activeIndex)

      for (const item of managed) {
        if (item !== current) release(item)
      }
      if (!current) return
      playCurrent(current, currentRevision)
    }

    const suspend = () => {
      pageHidden = true
      ++revision
      cancelCanPlay()
      managed.forEach(release)
    }

    const resume = () => {
      pageHidden = document.hidden
      if (!pageHidden) sync()
    }

    const selectVisibleSlide = () => {
      const visible = slides.reduce<{ index: number; ratio: number } | null>(
        (best, slide, index) => {
          const ratio = ratios.get(slide) ?? 0
          return ratio > (best?.ratio ?? 0) ? { index, ratio } : best
        },
        null
      )
      const visibleIndex = visible?.ratio ? visible.index : -1
      if (visibleIndex === activeIndex) return
      activeIndex = visibleIndex
      sync()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          ratios.set(entry.target as HTMLElement, entry.intersectionRatio)
        selectVisibleSlide()
      },
      { root: scrollContainer, threshold: [0, 0.55, 0.9] }
    )
    slides.forEach((slide) => observer.observe(slide))

    document.addEventListener('visibilitychange', () => (document.hidden ? suspend() : resume()))
    window.addEventListener('pagehide', suspend)
    window.addEventListener('pageshow', resume)
    if (pageHidden) suspend()
    else sync()
  })
}

initProductVideoMedia()
