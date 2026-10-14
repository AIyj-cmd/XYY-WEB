export function positionGalleryPreview(
  preview: HTMLElement,
  trigger: HTMLElement,
  image: HTMLImageElement
) {
  const margin = 12
  const gap = 8
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const rect = trigger.getBoundingClientRect()
  const ratio = Number(image.getAttribute('width')) / Number(image.getAttribute('height'))
  const imageWidth = Math.min(508, viewportWidth - margin * 2 - 12, 408 * ratio)
  const desiredWidth = imageWidth + 12
  const desiredHeight = imageWidth / ratio + 12
  const sides = [
    { side: 'right', space: viewportWidth - rect.right - margin - gap, size: desiredWidth },
    { side: 'left', space: rect.left - margin - gap, size: desiredWidth },
    { side: 'below', space: viewportHeight - rect.bottom - margin - gap, size: desiredHeight },
    { side: 'above', space: rect.top - margin - gap, size: desiredHeight },
  ]
  const placement = sides
    .map((side) => ({ ...side, scale: Math.min(1, Math.max(0, side.space / side.size)) }))
    .sort((a, b) => b.scale - a.scale)[0]
  const scale = Math.min(placement.scale, (viewportHeight - margin * 2) / desiredHeight)
  const width = desiredWidth * scale
  const height = desiredHeight * scale
  let left = rect.left + (rect.width - width) / 2
  let top = rect.top + (rect.height - height) / 2
  if (placement.side === 'right') left = rect.right + gap
  if (placement.side === 'left') left = rect.left - gap - width
  if (placement.side === 'below') top = rect.bottom + gap
  if (placement.side === 'above') top = rect.top - gap - height
  preview.style.width = `${width}px`
  preview.style.height = `${height}px`
  preview.style.left = `${Math.max(margin, Math.min(left, viewportWidth - width - margin))}px`
  preview.style.top = `${Math.max(margin, Math.min(top, viewportHeight - height - margin))}px`
}
