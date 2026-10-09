import { RAW_SERVICE_PAGE_CONFIG as servicePage0 } from './houzheng-xiufu'
import { RAW_SERVICE_PAGE_CONFIG as servicePage1 } from './kuajing-yuncang'
import { RAW_SERVICE_PAGE_CONFIG as servicePage2 } from './huanan-xiefu-yuncang'
import { RAW_SERVICE_PAGE_CONFIG as servicePage3 } from './zhibo-cangpei'
import { RAW_SERVICE_PAGE_CONFIG as servicePage4 } from './b2b-mendian-cangpei'
import { RAW_SERVICE_PAGE_CONFIG as servicePage5 } from './huadong-xiefu-yuncang'
import { RAW_SERVICE_PAGE_CONFIG as servicePage6 } from './tuihuo-zhijian'
import { RAW_SERVICE_PAGE_CONFIG as servicePage7 } from './xiefu-yuncang'
import { RAW_SERVICE_PAGE_CONFIG as servicePage8 } from './yundao-zhineng-jijian'
import { resolveServicePageClaims } from './claims'
import type { ServicePageStaticConfig, ServicePageStaticConfigRaw } from './types'

export type { ServicePageStaticConfig } from './types'

export const RAW_SERVICE_PAGE_CONFIG = {
  'houzheng-xiufu': servicePage0,
  'kuajing-yuncang': servicePage1,
  'huanan-xiefu-yuncang': servicePage2,
  'zhibo-cangpei': servicePage3,
  'b2b-mendian-cangpei': servicePage4,
  'huadong-xiefu-yuncang': servicePage5,
  'tuihuo-zhijian': servicePage6,
  'xiefu-yuncang': servicePage7,
  'yundao-zhineng-jijian': servicePage8,
} satisfies Record<string, ServicePageStaticConfigRaw>

export const SERVICE_PAGE_CONFIG = Object.fromEntries(
  Object.entries(RAW_SERVICE_PAGE_CONFIG).map(([slug, config]) => [
    slug,
    resolveServicePageClaims(config),
  ])
) as Record<string, ServicePageStaticConfig>

export const SERVICE_PAGE_CONFIG_RAW = RAW_SERVICE_PAGE_CONFIG
