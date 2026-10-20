import { join } from 'node:path'
import { Buffer } from 'node:buffer'
import sharp from 'sharp'

// All text uses the repository's pinned font package, never host fallback fonts.
export async function renderShareCard(projectRoot, locale) {
  const fontfile = join(
    projectRoot,
    'node_modules/@fontpkg/alibaba-puhuiti-3-0/AlibabaPuHuiTi-3-85-Bold.ttf'
  )
  const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#f5f8fc"/>
    <path d="M940 0h260v510H750z" fill="#e7effb"/>
    <path d="M1060 0h140v510H870z" fill="#dbe8fa"/>
    <rect x="48" y="42" width="332" height="145" rx="18" fill="#10284b"/>
    <rect x="64" y="224" width="68" height="8" rx="4" fill="#f97316"/>
    <rect y="510" width="1200" height="120" fill="#10284b"/>
    <rect y="510" width="1200" height="6" fill="#f97316"/>
  </svg>`)
  const text = async (value, size, color, left, top) => ({
    input: await sharp({
      text: {
        text: `<span foreground="${color}">${value}</span>`,
        font: `Alibaba PuHuiTi 3.0 Bold ${size}`,
        fontfile,
        rgba: true,
        dpi: 72,
      },
    })
      .png()
      .toBuffer(),
    left,
    top,
  })
  const logo = await sharp(join(projectRoot, 'public/logo.png')).resize(300).png().toBuffer()
  const lines =
    locale === 'en'
      ? [
          ['XINYIYUAN Supply Chain', 56, '#10284b', 64, 264],
          ['Apparel fulfillment · Returns inspection', 29, '#334b6b', 66, 360],
          ['Omnichannel inventory', 29, '#334b6b', 66, 408],
        ]
      : [
          ['新亦源供应链', 68, '#10284b', 60, 260],
          ['鞋服仓配 · 退货质检 · 全渠道库存', 36, '#334b6b', 64, 370],
        ]
  return sharp(background)
    .composite([
      { input: logo, left: 64, top: 58 },
      ...(await Promise.all(lines.map((line) => text(...line)))),
      await text('56xyy.com', 30, '#ffffff', 66, 552),
    ])
    .png({ compressionLevel: 9 })
    .toBuffer()
}
