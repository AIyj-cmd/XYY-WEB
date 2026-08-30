import { findUniqueRecord } from './fixed-collection-sync.mjs'
import { assertSync, isEqual } from './cms-sync-runtime.mjs'

export const SPECIALTY_SERVICE_PAGE_SLUGS = [
  'xiefu-yuncang',
  'huadong-xiefu-yuncang',
  'tuihuo-zhijian',
  'houzheng-xiufu',
  'kuajing-yuncang',
  'zhibo-cangpei',
  'huanan-xiefu-yuncang',
  'guangzhou-xiefu-yuncang',
  'b2b-mendian-cangpei',
]
export const SERVICE_PAGE_COLLECTION_PATH = '/items/service_pages?limit=-1&sort=slug'

const STRUCTURE_FIELDS = ['stats', 'features', 'img_src']

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0
const hasConfiguredHeroImage = (value) => value !== null && value !== undefined && value !== ''

function assertStats(stats, slug) {
  assertSync(Array.isArray(stats) && stats.length === 4, `${slug}: expected exactly 4 stats`)
  stats.forEach((stat, index) => {
    assertSync(
      stat &&
        isNonEmptyString(stat.stat) &&
        isNonEmptyString(stat.label) &&
        isNonEmptyString(stat.sub),
      `${slug}: invalid stat at index ${index}`
    )
  })
}

function assertFeatures(features, slug) {
  assertSync(
    Array.isArray(features) && features.length === 6,
    `${slug}: expected exactly 6 features`
  )
  features.forEach((feature, index) => {
    assertSync(
      feature && isNonEmptyString(feature.title) && isNonEmptyString(feature.desc),
      `${slug}: invalid feature at index ${index}`
    )
  })
}

export function selectSpecialtyServicePageTargets(seeds) {
  const targets = SPECIALTY_SERVICE_PAGE_SLUGS.map((slug) => {
    const target = findUniqueRecord(seeds, { slug }, ['slug'], 'approved service page seeds')
    assertStats(target.stats, slug)
    assertFeatures(target.features, slug)
    assertSync(isNonEmptyString(target.img_src), `${slug}: missing img_src`)
    return target
  })

  assertSync(
    new Set(targets.map(({ slug }) => slug)).size === SPECIALTY_SERVICE_PAGE_SLUGS.length,
    'specialty service page targets contain duplicate slugs'
  )
  return targets
}

export function planServicePageStructureRepair({ records, seeds }) {
  const targets = selectSpecialtyServicePageTargets(seeds)
  return targets.map((target) => {
    const current = findUniqueRecord(records, target, ['slug'], 'service_pages')
    assertSync(
      !hasConfiguredHeroImage(current.hero_image),
      `${target.slug}: hero_image is set; review it before repairing img_src`
    )
    assertSync(
      current.status === 'published',
      `${target.slug}: current record is not published; publish it before repairing structure`
    )
    return { current, target }
  })
}

export async function repairServicePageStructure({ records, seeds, runtime }) {
  const plan = planServicePageStructureRepair({ records, seeds })
  for (const { current, target } of plan) {
    await runtime.patchRecord('service_pages', current, target, STRUCTURE_FIELDS)
  }
  return plan
}

export function servicePageStructureMatches({ records, seeds }) {
  try {
    return planServicePageStructureRepair({ records, seeds }).every(({ current, target }) =>
      STRUCTURE_FIELDS.every((field) => isEqual(current[field], target[field]))
    )
  } catch {
    return false
  }
}

export { STRUCTURE_FIELDS }
