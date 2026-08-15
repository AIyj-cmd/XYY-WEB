import { beforeEach, describe, expect, it } from 'vitest'

import {
  __setDirectusRequesterForTests,
  getAboutContent,
  getPublications,
  getServicePageContent,
  getSiteSettings,
} from '@/lib/directus'

describe('Directus singleton content resilience', () => {
  beforeEach(() => __setDirectusRequesterForTests(null))

  it('does not mix static fallback fields into an existing published CMS record', async () => {
    __setDirectusRequesterForTests(async (collection) => {
      if (collection === 'service_pages') {
        return [
          {
            slug: 'sample',
            title: '',
            description: '后台描述',
            breadcrumb_label: '',
            eyebrow: '',
            h1: '',
            h1sub: '',
            hero_desc: '',
            img_src: '',
            img_alt: '',
            content_desc: '',
            features_label: '',
            stats: [],
            features: [],
          },
        ]
      }
      if (collection === 'about_content') {
        return { overview: '', hero_description: '后台首屏介绍' }
      }
      if (collection === 'site_settings') {
        return {
          phone: '',
          headquarters_label: '广州总部',
          headquarters_address: '',
          icp: '粤ICP备测试号',
          footer_description: '',
        }
      }
      if (collection === 'service_stats' || collection === 'service_features') {
        throw new Error('legacy service collections must not be queried')
      }
      return []
    })
    const stat = { stat: '1', label: '指标', sub: '说明' }
    const serviceFallback = {
      title: '回退标题',
      description: '回退描述',
      breadcrumbLabel: '回退面包屑',
      eyebrow: '回退标签',
      h1: '回退主标题',
      h1sub: '回退副标题',
      heroDesc: '回退首屏说明',
      imgSrc: '/fallback.webp',
      imgAlt: '回退图片',
      contentDesc: '回退正文',
      featuresLabel: '回退能力',
      stats: [stat, stat, stat, stat] as [typeof stat, typeof stat, typeof stat, typeof stat],
      features: [{ title: '回退能力', desc: '能力说明' }],
    }

    await expect(getServicePageContent('sample', serviceFallback)).resolves.toMatchObject({
      title: '',
      description: '后台描述',
      h1: '',
      imgSrc: '',
      stats: [],
      features: [],
    })
    await expect(
      getAboutContent({ overview: '回退公司介绍', heroDescription: '回退首屏介绍' })
    ).resolves.toEqual({
      overview: '',
      heroDescription: '后台首屏介绍',
    })
    await expect(
      getSiteSettings({
        phone: '400-6865-156',
        headquarters_label: '总部',
        headquarters_address: '回退地址',
        icp: '回退备案号',
        footer_description: '回退页脚',
      })
    ).resolves.toMatchObject({
      phone: '',
      headquarters_label: '广州总部',
      headquarters_address: '',
      icp: '粤ICP备测试号',
      footer_description: '',
    })
  })

  it('keeps successful empty singleton and collection responses empty', async () => {
    __setDirectusRequesterForTests(async () => [])
    const stat = { stat: '1', label: '旧指标', sub: '旧说明' }
    const serviceFallback = {
      title: '旧标题',
      description: '旧描述',
      breadcrumbLabel: '旧面包屑',
      eyebrow: '旧标签',
      h1: '旧主标题',
      h1sub: '旧副标题',
      heroDesc: '旧首屏说明',
      imgSrc: '/old.webp',
      imgAlt: '旧图片',
      contentDesc: '旧正文',
      featuresLabel: '旧能力',
      stats: [stat, stat, stat, stat] as [typeof stat, typeof stat, typeof stat, typeof stat],
      features: [{ title: '旧能力', desc: '旧能力说明' }],
    }

    await expect(getServicePageContent('sample', serviceFallback)).resolves.toEqual({
      title: '',
      description: '',
      breadcrumbLabel: '',
      eyebrow: '',
      h1: '',
      h1sub: '',
      heroDesc: '',
      imgSrc: '',
      imgAlt: '',
      contentDesc: '',
      featuresLabel: '',
      stats: [],
      features: [],
    })
    await expect(
      getAboutContent({ overview: '旧公司介绍', heroDescription: '旧首屏介绍' })
    ).resolves.toEqual({ overview: '', heroDescription: '' })
    await expect(
      getPublications([
        {
          issue: 1,
          title: '旧期刊',
          season: '',
          summary: '旧摘要',
          cover: '/old.jpg',
          pdf: '/old.pdf',
          date: '2025',
          isLatest: true,
        },
      ])
    ).resolves.toEqual([])
  })
})
