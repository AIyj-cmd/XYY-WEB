export interface RedesignRouteExpectation {
  page: string
  video: string
  faq: string
  required: readonly (readonly [string, number])[]
}

export const REDESIGN_ROUTE_EXPECTATIONS = new Map<string, RedesignRouteExpectation>([
  [
    '/tuihuo-zhijian',
    {
      page: '.returns-page',
      video: '.returns-hero__media',
      faq: '.returns-faq details',
      required: [['.returns-grades__table [role="listitem"]', 4]],
    },
  ],
  [
    '/houzheng-xiufu',
    {
      page: '.repair-page',
      video: '.repair-hero__video',
      faq: '.repair-faq details',
      required: [
        ['.repair-page [data-redesign-feature]', 6],
        ['.repair-workshop__zones span', 9],
      ],
    },
  ],
  [
    '/kuajing-yuncang',
    {
      page: '.crossborder-page',
      video: '.crossborder-hero__video',
      faq: '.crossborder-faq details',
      required: [['[data-redesign-feature]', 6]],
    },
  ],
  [
    '/huanan-xiefu-yuncang',
    {
      page: '.south-page',
      video: '.south-hero__video',
      faq: '.south-faq details',
      required: [
        ['.south-warehouse-city li', 9],
        ['.south-business__lanes article', 3],
        ['.south-page [data-redesign-feature]', 6],
      ],
    },
  ],
  [
    '/huadong-xiefu-yuncang',
    {
      page: '.east-page',
      video: '.east-hero__video',
      faq: '.east-faq details',
      required: [
        ['.east-warehouses article', 3],
        ['.east-page [data-redesign-feature]', 6],
      ],
    },
  ],
  [
    '/zhibo-cangpei',
    {
      page: '.live-page',
      video: '.live-hero__video',
      faq: '.live-faq details',
      required: [
        ['.live-stages__list article', 3],
        ['.live-page [data-redesign-feature]', 6],
      ],
    },
  ],
  [
    '/b2b-mendian-cangpei',
    {
      page: '.b2b-page',
      video: '.b2b-hero__video',
      faq: '.b2b-faq details',
      required: [
        ['.b2b-distribution__objects > article', 3],
        ['.b2b-page [data-redesign-feature]', 6],
        ['.b2b-page > .b2b-section', 6],
      ],
    },
  ],
])
