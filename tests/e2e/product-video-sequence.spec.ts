import { expect, test } from '@playwright/test'
import { getClaimText } from '../../src/lib/claims'

test('product page presents eight muted videos and a static assurance section in one scroll container', async ({
  page,
}) => {
  await page.goto('/product')

  const videos = page.locator('[data-product-video]')
  const scrollContainer = page.locator('[data-product-video-scroll]')
  await expect(videos).toHaveCount(8)
  await expect(scrollContainer).toHaveCount(1)
  await expect(page.locator('[data-product-video-slide]')).toHaveCount(9)
  const copies = page.locator('[data-product-video-copy]')
  await expect(copies).toHaveCount(8)
  const videoCopy = [
    {
      heading: '鞋服云仓，让多渠道共用一盘货',
      description:
        '面向款式、颜色、尺码繁多的鞋服商品，统一管理库存与订单。从电商发货到门店补货，衔接入库、存储、拣货与出库，让线上线下的货品流转更有序。',
      highlights: ['款色码管理', '库存协同', '全渠道发货'],
    },
    {
      heading: '退货质检，让每件商品去向清楚',
      description:
        '退回的商品，哪些可以上架，哪些需要整理或修复？通过拆包核对、状态检查与质检分级，按品牌确认的标准安排后续处理，并保留可追溯的作业记录。',
      highlights: ['拆包核对', '质检分级', '处置分流'],
    },
    {
      heading: '后整修复，让可修复商品重新流转',
      description:
        '针对污渍、缝线、配饰及标识等已确认问题，结合商品材质安排清洁、修复与整理。处理完成后再次质检，符合客户标准的商品进入后续上架流程。',
      highlights: ['清洁整理', '瑕疵修复', '二次质检'],
    },
    {
      heading: '跨境云仓，衔接国内备货与出运',
      description:
        '为跨境鞋服项目提供国内端仓储、项目质检、换标换包装及退货整理。按确认的商品与包装要求完成仓内作业，再依项目方案交接物流资源。',
      highlights: ['国内备货', '项目质检', '换标换包装'],
    },
    {
      heading: '华南鞋服云仓，协同珠三角仓配',
      description:
        '面向广州及珠三角鞋服品牌，衔接工厂入仓、电商发货、门店补货与退货处理。结合项目需求组织区域库存和仓内作业，支持华南业务开展。',
      highlights: ['工厂入仓', '区域仓配', '退货处理'],
    },
    {
      heading: '华东鞋服云仓，承接区域订单与补货',
      description:
        '面向长三角及华东市场的库存布局需求，提供电商发货、门店补货与退货质检。可按项目与华南仓网协同库存，安排区域订单履约和退货回流。',
      highlights: ['区域履约', '门店补货', '多仓协同'],
    },
    {
      heading: '直播电商仓配，应对集中出单与退货',
      description:
        '面向品牌自播和代播团队，围绕场次计划提前组织备货与作业安排。通过多平台订单协同、波次拣货和弹性产能，衔接集中发货与播后退货处理。',
      highlights: ['场次备货', '弹性产能', '退货处理'],
    },
    {
      heading: 'B2B门店仓配，让分货与补货有序衔接',
      description:
        '面向连锁品牌、批发商与加盟体系，按门店及款色码组织分货、复核和出库。配合标签、分货明细与 ERP 协同，承接换季铺货和日常补货需求。',
      highlights: ['按店分货', '标签明细', 'ERP协同'],
    },
  ]
  for (const [index, { heading, description, highlights }] of videoCopy.entries()) {
    const copy = copies.nth(index)
    await expect(copy.locator(index === 0 ? 'h1' : 'h2')).toHaveText(heading)
    await expect(copy.locator('p')).toHaveText(description)
    await expect(copy.locator('[data-product-video-highlights] li')).toHaveText(highlights)
  }
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(8)
  const serviceDetails = [
    ['鞋服云仓', '/xiefu-yuncang'],
    ['退货质检', '/tuihuo-zhijian'],
    ['后整修复', '/houzheng-xiufu'],
    ['跨境云仓', '/kuajing-yuncang'],
    ['华南鞋服云仓', '/huanan-xiefu-yuncang'],
    ['华东鞋服云仓', '/huadong-xiefu-yuncang'],
    ['直播电商仓配', '/zhibo-cangpei'],
    ['B2B门店仓配', '/b2b-mendian-cangpei'],
  ]
  for (const [label, href] of serviceDetails) {
    await expect(copies.getByRole('link', { name: `了解${label}服务` })).toHaveAttribute(
      'href',
      href
    )
  }
  const firstSlide = page.locator('[data-product-video-slide]').first()
  const layout = await firstSlide.evaluate((slide) => {
    const video = slide.querySelector('video')
    const heading = slide.querySelector('h1')
    const link = slide.querySelector('a')
    const header = document.querySelector('.site-header')
    if (!video || !heading || !link || !header) return null

    const slideRect = slide.getBoundingClientRect()
    const videoRect = video.getBoundingClientRect()
    const headingRect = heading.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()
    const headerRect = header.getBoundingClientRect()
    const withinVideo = (rect: DOMRect) =>
      rect.left >= videoRect.left - 1 &&
      rect.right <= videoRect.right + 1 &&
      rect.top >= videoRect.top - 1 &&
      rect.bottom <= videoRect.bottom + 1

    return {
      videoFillsSlide:
        Math.abs(videoRect.left - slideRect.left) <= 1 &&
        Math.abs(videoRect.right - slideRect.right) <= 1 &&
        Math.abs(videoRect.top - slideRect.top) <= 1 &&
        Math.abs(videoRect.bottom - slideRect.bottom) <= 1,
      copyIsInsideVideo: withinVideo(headingRect) && withinVideo(linkRect),
      headingClearsHeader: headingRect.top >= headerRect.bottom - 1,
    }
  })
  expect(layout).toEqual({
    videoFillsSlide: true,
    copyIsInsideVideo: true,
    headingClearsHeader: true,
  })
  await expect(page.locator('.product-editorial, [data-conversion-cta], footer')).toHaveCount(0)
  await expect(page.locator('[data-floating-contact]')).toHaveCount(0)
  const assurance = page.locator('#assurance')
  await expect(assurance).toBeVisible()
  await expect(assurance.locator('video')).toHaveCount(0)
  await expect(assurance.getByRole('heading', { level: 2 })).toHaveText(
    '让服务可以被看见、被复核，也被持续改进。'
  )
  await expect(assurance.locator('.assurance-grid article')).toHaveCount(4)
  await expect(assurance.locator('.assurance-grid strong')).toHaveText([
    getClaimText('inventoryAccuracy', 'product'),
    '18:00',
    '24:00前',
    '全流程',
  ])
  await expect(assurance.locator('.assurance-mechanisms__list article')).toHaveCount(5)
  await expect(assurance.locator('.assurance-mechanisms__list article svg')).toHaveCount(5)
  await expect(page.getByRole('navigation', { name: '页面分区导航' })).toBeVisible()
  await expect(page.getByRole('button', { name: '上一个区域' })).toBeDisabled()
  await expect(page.getByRole('button', { name: '下一个区域' })).toBeEnabled()
  await expect(page.locator('[data-product-video-status]')).toHaveText('01 / 09')
  expect(await videos.evaluateAll((items) => items.map((item) => item.id))).toEqual([
    '01-overview',
    '02-returns',
    '03-refurbishment',
    '04-cross-border',
    '05-south-china',
    '06-east-china',
    '07-live-commerce',
    '08-b2b-stores',
  ])
  const media = [
    ['01-overview', 'warehouse-sections-20260911/01-overview-clean-20260921'],
    ['02-returns', 'warehouse-sections-20260911/04-inspection'],
    ['03-refurbishment', 'warehouse-sections-20260911/05-refurbishment'],
    ['04-cross-border', 'warehouse-services-20260913/outbound-loading'],
    ['05-south-china', 'warehouse-sections-20260911/02-storage'],
    ['06-east-china', 'warehouse-sections-20260911/03-picking'],
    ['07-live-commerce', 'warehouse-sections-20260911/06-packing'],
    ['08-b2b-stores', 'warehouse-services-20260913/order-distribution'],
  ]
  for (const [id, path] of media) {
    const video = page.locator(`[data-product-video][id="${id}"]`)
    await expect(video).toHaveAttribute('autoplay', '')
    await expect(video).toHaveAttribute('loop', '')
    await expect(video).toHaveAttribute('muted', '')
    await expect(video).toHaveAttribute('playsinline', '')
    await expect(video).toHaveAttribute('preload', 'auto')
    await expect(video).not.toHaveAttribute('controls')
    await expect(video).toHaveAttribute('poster', `/videos/${path}.jpg`)
    await expect(video.locator('source')).toHaveAttribute('src', `/videos/${path}.mp4`)
  }
})

test('product navigation remains a single active entry on detail pages', async ({
  page,
}, testInfo) => {
  await page.goto('/xiefu-yuncang')

  if (testInfo.project.name === 'chromium') {
    const productLink = page.getByRole('navigation', { name: '主导航' }).getByRole('link', {
      name: '仓配服务',
      exact: true,
    })
    await expect(productLink).toHaveAttribute('href', '/product')
    await expect(productLink).toHaveAttribute('aria-current', 'page')
    await expect(productLink).not.toHaveAttribute('aria-haspopup')
    await expect(page.locator('.site-header__popover')).toHaveCount(0)
    return
  }

  const mobileNavigation = page.getByRole('navigation', { name: '移动端导航' })
  await expect(mobileNavigation.locator('a')).toHaveCount(7)
  await expect(
    mobileNavigation.getByRole('link', { name: '仓配服务', exact: true })
  ).toHaveAttribute('href', '/product')
  await expect(mobileNavigation.getByRole('link', { name: '仓配服务', exact: true })).toHaveClass(
    /bg-white\/15/
  )
  await expect(mobileNavigation.locator('a[href="/xiefu-yuncang"]')).toHaveCount(0)
})
