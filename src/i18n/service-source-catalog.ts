import type { EnglishServiceSource } from './service-sources'
import { FOOTWEAR_ENGLISH_SOURCE } from './service-sources-footwear'
import { RETURNS_ENGLISH_SOURCE } from './service-sources-returns'
import { REPAIR_ENGLISH_SOURCE } from './service-sources-repair'
import { B2B_ENGLISH_SOURCE } from './service-sources-b2b'
import { YUNDAO_ENGLISH_SOURCE } from './service-sources-yundao'
import { CROSSBORDER_ENGLISH_SOURCE } from './service-sources-crossborder'
import { SOUTH_ENGLISH_SOURCE } from './service-sources-south'
import { EAST_ENGLISH_SOURCE } from './service-sources-east'
import { LIVE_ENGLISH_SOURCE } from './service-sources-live'

export const ENGLISH_SERVICE_SOURCES: Record<string, EnglishServiceSource> = {
  'xiefu-yuncang': FOOTWEAR_ENGLISH_SOURCE,
  'tuihuo-zhijian': RETURNS_ENGLISH_SOURCE,
  'houzheng-xiufu': REPAIR_ENGLISH_SOURCE,
  'b2b-mendian-cangpei': B2B_ENGLISH_SOURCE,
  'yundao-zhineng-jijian': YUNDAO_ENGLISH_SOURCE,
  'kuajing-yuncang': CROSSBORDER_ENGLISH_SOURCE,
  'huanan-xiefu-yuncang': SOUTH_ENGLISH_SOURCE,
  'huadong-xiefu-yuncang': EAST_ENGLISH_SOURCE,
  'zhibo-cangpei': LIVE_ENGLISH_SOURCE,
}
