export interface ServiceHeroMedia {
  src: string
  poster: string
}

const heroDirectory = '/videos/service-detail-heroes-clean-20260913'

const mediaNames = [
  'tuihuo-zhijian',
  'houzheng-xiufu',
  'kuajing-yuncang',
  'huanan-xiefu-yuncang',
  'huadong-xiefu-yuncang',
  'zhibo-cangpei',
  'b2b-mendian-cangpei',
  'guangzhou-xiefu-yuncang',
  'yundao-zhineng-jijian',
] as const

const serviceHeroMedia = Object.fromEntries(
  mediaNames.map((name) => [
    name,
    {
      src: `${heroDirectory}/${name}.mp4`,
      poster: `${heroDirectory}/${name}.jpg`,
    },
  ])
) as Record<string, ServiceHeroMedia>

export const getServiceHeroMedia = (slug: string) => serviceHeroMedia[slug]
