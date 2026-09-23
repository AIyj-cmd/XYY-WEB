import { expect, test } from '@playwright/test'

const warehouseRows = [
  '黄埔仓广东省广州市黄埔区果园一路2号',
  '兴泰仓（番禺仓）广东省广州市番禺区石楼镇华山路2号',
  '新塘仓暂不公布',
  '智谷仓东莞市常平镇多宝路2号常平智谷',
  '朗州仓东莞市常平镇朗洲村鸿腾缘工业园',
  '桥头仓东莞市桥头镇多宝路2号常平桥头',
  '云谷仓暂不公布',
  '宏盛仓（佛山仓）广东省佛山市三水区大塘镇大塘园区园东一路',
  '四会仓（肇庆仓）肇庆市四会市东城街道唯品会物流园20号库',
]

test('south network restores its prior sections while keeping all warehouse addresses', async ({
  page,
}) => {
  await page.goto('/huanan-xiefu-yuncang')

  await expect(page.locator('.south-page')).toHaveCount(1)
  await expect(page.locator('.south-hero h1')).toHaveCount(1)
  const video = page.locator('.south-hero__video')
  await expect(video).toHaveAttribute('autoplay', '')
  await expect(video).toHaveAttribute('loop', '')
  await expect(video).toHaveAttribute('muted', '')
  await expect(video).toHaveAttribute('playsinline', '')
  await expect(video).not.toHaveAttribute('controls')
  await expect(page.locator('.south-warehouse-city')).toHaveCount(4)
  await expect(page.locator('.south-warehouse-city li')).toHaveCount(9)
  expect(
    await page
      .locator('.south-warehouse-city li')
      .evaluateAll((rows) => rows.map((row) => row.textContent?.replaceAll(/\s/g, '') ?? ''))
  ).toEqual(warehouseRows)
  await expect(page.locator('.south-page [data-redesign-feature]')).toHaveCount(6)
  await expect(page.locator('.south-business__lanes article')).toHaveCount(3)
  await expect(page.locator('.south-confirm__rows article')).toHaveCount(4)
  await expect(page.locator('.south-reference')).toHaveCount(1)
  await expect(
    page.locator('.south-operation-flow, .south-return-flow, .south-preparation')
  ).toHaveCount(0)
  await expect(page.locator('.south-faq details')).toHaveCount(5)
  await expect(page.locator('[data-south-node], [data-south-record]')).toHaveCount(0)
  await expect(page.getByText(/主节点|制造协同|区域协同|平台协同/)).toHaveCount(0)

  await page.locator('.south-faq details').first().locator('summary').press('Enter')
  await expect(page.locator('.south-faq details').first()).toHaveAttribute('open', '')
  await page.getByRole('link', { name: '咨询华南仓配服务' }).focus()
  await expect(page.getByRole('link', { name: '咨询华南仓配服务' })).toBeFocused()
})

test('south presentation keeps the public copy, lanes, and FAQ schema aligned', async ({
  page,
}) => {
  await page.goto('/huanan-xiefu-yuncang')
  const pageText = await page.locator('.south-page').innerText()
  for (const phrase of [
    '退货质检中心',
    '仓库资料按城市展开',
    '实际启用节点',
    '项目核验',
    '仓内口径',
    '履约口径',
    '线路SLA',
    '公司公开的',
    '线路编排',
    '状态贯通',
  ]) {
    expect(pageText).not.toContain(phrase)
  }
  await expect(page.locator('.south-business__lanes article').nth(0)).toContainText(
    '货源入仓与库存安排'
  )
  await expect(page.locator('.south-business__lanes article').nth(2)).toContainText('各仓退货质检')
  await expect(page.getByText('各仓退货质检', { exact: true })).toHaveCount(1)

  const visibleAnswers = await page.locator('.south-faq details > p').allTextContents()
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(
    ''
  )
  for (const answer of visibleAnswers) expect(jsonLd).toContain(answer)
  expect(jsonLd).not.toMatch(
    /退货质检中心|实际启用节点|项目核验|仓内口径|履约口径|线路SLA|公司公开的|线路编排|状态贯通/
  )

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    const headings = await page
      .locator('.south-warehouses .south-section__heading h2, #south-business-heading')
      .evaluateAll((elements) =>
        elements.map((element) => {
          const heading = getComputedStyle(element)
          return { fontSize: heading.fontSize, fontWeight: heading.fontWeight }
        })
      )
    expect(headings).toHaveLength(2)
    expect(headings[0]).toEqual(headings[1])
  }
})

test('south redesign has no horizontal overflow at the required desktop and mobile viewports', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/huanan-xiefu-yuncang')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width
    )
  }
})

test('warehouse block uses warm city panels without separator lines', async ({ page }) => {
  for (const [viewport, expectedColumns] of [
    [{ width: 1440, height: 900 }, 2],
    [{ width: 390, height: 844 }, 1],
  ] as const) {
    await page.setViewportSize(viewport)
    await page.goto('/huanan-xiefu-yuncang')
    const styles = await page.locator('.south-warehouses').evaluate((section) => {
      const cities = Array.from(section.querySelectorAll<HTMLElement>('.south-warehouse-city'))
      const rows = Array.from(section.querySelectorAll<HTMLElement>('.south-warehouse-city li'))
      const services = Array.from(section.querySelectorAll<HTMLElement>('.south-city-service'))
      const list = section.querySelector<HTMLElement>('.south-warehouse-list')!
      return {
        listColumns: getComputedStyle(list).gridTemplateColumns.trim().split(/\s+/).length,
        cityRects: cities.map((city) => {
          const { x, y } = city.getBoundingClientRect()
          return { x, y }
        }),
        cityStyles: cities.map((city) => {
          const style = getComputedStyle(city)
          return {
            background: style.backgroundColor,
            borderTop: style.borderTopWidth,
            borderRight: style.borderRightWidth,
            borderBottom: style.borderBottomWidth,
            borderLeft: style.borderLeftWidth,
            boxShadow: style.boxShadow,
          }
        }),
        rowColumns: rows.map(
          (row) => getComputedStyle(row).gridTemplateColumns.trim().split(/\s+/).length
        ),
        rowBorders: rows.map((row) => getComputedStyle(row).borderTopWidth),
        serviceBorders: services.map((service) => getComputedStyle(service).borderTopWidth),
      }
    })
    expect(styles.listColumns).toBe(expectedColumns)
    expect(styles.cityStyles).toHaveLength(4)
    for (const city of styles.cityStyles) {
      expect(city.background).toBe('rgb(244, 241, 236)')
      expect([city.borderTop, city.borderRight, city.borderBottom, city.borderLeft]).toEqual([
        '0px',
        '0px',
        '0px',
        '0px',
      ])
      expect(city.boxShadow).toBe('none')
    }
    expect(styles.rowColumns.every((columns) => columns === expectedColumns)).toBe(true)
    expect(styles.rowBorders).toEqual(Array(9).fill('0px'))
    expect(styles.serviceBorders).toEqual(Array(4).fill('0px'))
    if (expectedColumns === 2) {
      expect(styles.cityRects[0].y).toBeCloseTo(styles.cityRects[1].y, 1)
      expect(styles.cityRects[0].x).toBeLessThan(styles.cityRects[1].x)
      expect(styles.cityRects[2].y).toBeGreaterThan(styles.cityRects[0].y)
    } else {
      expect(styles.cityRects.map(({ x }) => x)).toEqual(Array(4).fill(styles.cityRects[0].x))
      expect(styles.cityRects[1].y).toBeGreaterThan(styles.cityRects[0].y)
      expect(styles.cityRects[2].y).toBeGreaterThan(styles.cityRects[1].y)
      expect(styles.cityRects[3].y).toBeGreaterThan(styles.cityRects[2].y)
    }
  }
})

test.describe('south network redesign without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('keeps city lists, features, FAQ, and links readable', async ({ page }) => {
    await page.goto('/huanan-xiefu-yuncang')
    await expect(page.locator('.south-warehouse-city li')).toHaveCount(9)
    await expect(page.locator('[data-redesign-feature]')).toHaveCount(6)
    await expect(page.locator('[data-redesign-faq]')).toHaveCount(5)
    await expect(page.getByRole('link', { name: '咨询华南仓配服务' })).toHaveAttribute(
      'href',
      '/contact'
    )
  })
})

test('south network remains readable when modules are blocked', async ({ page }) => {
  let blockedRequests = 0
  await page.route('**/*', (route) => {
    if (route.request().resourceType() === 'script') {
      blockedRequests += 1
      return route.abort()
    }
    return route.continue()
  })
  await page.goto('/huanan-xiefu-yuncang')
  expect(blockedRequests).toBeGreaterThan(0)
  await expect(page.locator('.south-warehouse-city li')).toHaveCount(9)
  await expect(page.locator('.south-faq details')).toHaveCount(5)
})
