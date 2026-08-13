import { beforeEach, describe, expect, it } from 'vitest'

import {
  __setDirectusRequesterForTests,
  getAboutContent,
  getCaseDetail,
  getPublications,
  getServicePageContent,
  getSiteSettings,
} from '@/lib/directus'

describe('Directus structured page content', () => {
  beforeEach(() => __setDirectusRequesterForTests(null))

  it('prefers unified stats and features embedded in each service page', async () => {
    __setDirectusRequesterForTests(async (collection) => {
      if (collection === 'service_pages') {
        return [
          {
            slug: 'sample',
            title: '标题',
            description: '描述',
            breadcrumb_label: '服务',
            eyebrow: '标签',
            h1: '服务名称',
            h1sub: '副标题',
            hero_desc: '首屏说明',
            img_src: '/sample.webp',
            img_alt: '图片',
            content_desc: '正文',
            features_label: '能力',
            stats: Array.from({ length: 4 }, (_, index) => ({
              stat: String(index + 1),
              label: `指标${index + 1}`,
              sub: '说明',
            })),
            features: [{ title: '能力一', desc: '能力说明' }],
          },
        ]
      }
      if (collection === 'service_stats' || collection === 'service_features') {
        throw new Error('legacy collections should not be queried')
      }
      return []
    })
    const stat = { stat: '0', label: '回退', sub: '回退' }
    const fallback = {
      title: '回退',
      description: '回退',
      breadcrumbLabel: '回退',
      eyebrow: '回退',
      h1: '回退',
      h1sub: '回退',
      heroDesc: '回退',
      imgSrc: '/fallback.webp',
      imgAlt: '回退',
      contentDesc: '回退',
      featuresLabel: '回退',
      stats: [stat, stat, stat, stat] as [typeof stat, typeof stat, typeof stat, typeof stat],
      features: [],
    }

    await expect(getServicePageContent('sample', fallback)).resolves.toMatchObject({
      title: '标题',
      stats: expect.arrayContaining([expect.objectContaining({ stat: '1' })]),
      features: [{ title: '能力一', desc: '能力说明' }],
    })
  })

  it('reads publications, case details, about content and settings', async () => {
    __setDirectusRequesterForTests(async (collection) => {
      if (collection === 'publications')
        return [
          {
            issue: 15,
            title: '第15期',
            season: '',
            summary: '摘要',
            cover: '/15.jpg',
            pdf: '/15.pdf',
            cover_file: 'cover-id',
            pdf_file: 'pdf-id',
            date: '2026',
            is_latest: true,
          },
        ]
      if (collection === 'case_details')
        return [
          {
            slug: 'sample',
            name: '案例',
            full_name: '案例全称',
            accent: '#123456',
            description: '详情',
          },
        ]
      if (collection === 'case_stats') return [{ label: '库存', value: '1万+', unit: '件' }]
      if (collection === 'about_content')
        return { overview: '公司介绍', hero_description: '首屏介绍' }
      if (collection === 'site_settings')
        return {
          phone: '400-0000',
          headquarters_label: '总部',
          headquarters_address: '地址',
          icp: '备案号',
          footer_description: '页脚',
        }
      return []
    })
    const publications = await getPublications([])
    expect(publications).toHaveLength(1)
    expect(publications[0]?.cover).toContain('/assets/cover-id')
    expect(publications[0]?.pdf).toContain('/assets/pdf-id')
    await expect(
      getCaseDetail('sample', {
        slug: 'sample',
        name: '回退',
        fullName: '回退',
        category: '分类',
        image: '/case.jpg',
        accent: '#000',
        description: '回退',
        stats: [],
      })
    ).resolves.toMatchObject({
      name: '案例',
      stats: [{ label: '库存', value: '1万+', unit: '件' }],
    })
    await expect(getAboutContent({ overview: '', heroDescription: '' })).resolves.toEqual({
      overview: '公司介绍',
      heroDescription: '首屏介绍',
    })
    await expect(
      getSiteSettings({
        phone: '',
        headquarters_label: '',
        headquarters_address: '',
        icp: '',
        footer_description: '',
      })
    ).resolves.toMatchObject({ phone: '400-0000', icp: '备案号' })
  })

  it('prefers the unified brand record when building a case detail page', async () => {
    const fallback = {
      slug: 'sample',
      name: '回退',
      fullName: '回退品牌',
      category: '回退分类',
      image: '/fallback.jpg',
      accent: '#000000',
      description: '回退说明',
      stats: [],
    }
    const unifiedCase = {
      id: 1,
      slug: 'sample',
      category: '鞋服品牌',
      label: '品牌',
      name: '品牌简称',
      full_name: '品牌完整名称',
      accent: '#2563EB',
      case_description: '统一案例说明',
      stats: [{ label: '库存', value: '100万+', unit: '件' }],
      metrics: '',
      details: '列表说明',
      tags: [],
      img: '/brand.jpg',
    }

    await expect(getCaseDetail('sample', fallback, unifiedCase)).resolves.toMatchObject({
      fullName: '品牌完整名称',
      description: '统一案例说明',
      stats: [{ label: '库存', value: '100万+', unit: '件' }],
    })
  })
})
