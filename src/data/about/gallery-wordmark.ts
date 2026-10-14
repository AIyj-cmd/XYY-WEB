type PhotoPosition = { column: number; row: number; width: number; height: number }
type ResponsivePosition = Record<'desktop' | 'tablet' | 'mobile', PhotoPosition>
type Tile = readonly [column: number, row: number, width: number, height: number]

// White cells stay empty: the photographs themselves draw each 5 × 7 character.
const glyphs = [
  ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
]

// Each stroke cell is four units wide/high. These subdivisions vary photo area 4:1.
const subdivisions: readonly (readonly Tile[])[] = [
  [[0, 0, 4, 4]],
  [
    [0, 0, 2, 4],
    [2, 0, 2, 2],
    [2, 2, 2, 2],
  ],
  [
    [0, 0, 4, 2],
    [0, 2, 4, 2],
  ],
  [
    [0, 0, 2, 2],
    [2, 0, 2, 2],
    [0, 2, 2, 2],
    [2, 2, 2, 2],
  ],
  [
    [0, 0, 2, 4],
    [2, 0, 2, 4],
  ],
]

export function galleryWordmarkPositions(imageCount: number): ResponsivePosition[] {
  const positions: ResponsivePosition[] = []
  let strokeIndex = 0

  glyphs.forEach((glyph, glyphIndex) => {
    glyph.forEach((line, row) => {
      ;[...line].forEach((filled, column) => {
        if (filled !== '1') return
        const tiles = subdivisions[strokeIndex % subdivisions.length]
        strokeIndex += 1
        for (const [tileColumn, tileRow, width, height] of tiles) {
          const desktop = {
            column: (glyphIndex * 6 + column) * 4 + tileColumn,
            row: row * 4 + tileRow,
            width,
            height,
          }
          // Upper 56 is centered over XYY, separated by one empty stroke row.
          const mobile = {
            ...desktop,
            column:
              ((glyphIndex < 2 ? 3 + glyphIndex * 6 : (glyphIndex - 2) * 6) + column) * 4 +
              tileColumn,
            row: ((glyphIndex < 2 ? 0 : 8) + row) * 4 + tileRow,
          }
          positions.push({ desktop, tablet: desktop, mobile })
        }
      })
    })
  })

  if (positions.length !== imageCount) {
    throw new Error(`Gallery wordmark has ${positions.length} positions for ${imageCount} images`)
  }
  return positions
}
