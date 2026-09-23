export type RedesignPresentation =
  'returns' | 'repair' | 'crossborder' | 'south' | 'east' | 'live' | 'b2b'

export function isRedesignPresentation(presentation: string): presentation is RedesignPresentation {
  return (
    presentation === 'returns' ||
    presentation === 'repair' ||
    presentation === 'crossborder' ||
    presentation === 'south' ||
    presentation === 'east' ||
    presentation === 'live' ||
    presentation === 'b2b'
  )
}
