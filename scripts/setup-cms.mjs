/**
 * One-time CMS setup script.
 * Creates Directus collections (homepage_stats, services, warehouses)
 * and seeds the reviewed CMS content.
 *
 * Usage: node scripts/setup-cms.mjs
 */

import {
  APPROVED_HOMEPAGE_STATS,
  APPROVED_SERVICES,
  APPROVED_WAREHOUSES,
} from './approved-cms-content.mjs'

const URL = (process.env.DIRECTUS_URL || 'http://127.0.0.1:8055').replace(/\/+$/, '')
const TOKEN = process.env.DIRECTUS_TOKEN

if (!TOKEN) {
  console.error('DIRECTUS_TOKEN is required')
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

async function api(method, path, body) {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok && res.status !== 409) {
    console.warn(`  [warn] ${method} ${path} → ${res.status}`, JSON.stringify(json).slice(0, 200))
  }
  return json
}

async function createCollection(name, icon = 'database', meta = {}) {
  console.log(`\n[collection] ${name}`)
  await api('POST', '/collections', {
    collection: name,
    schema: { name },
    meta: { icon, ...meta },
  })
}

async function addField(collection, field, type, meta = {}, schema = {}) {
  await api('POST', `/fields/${collection}`, {
    field,
    type,
    schema,
    meta: { interface: 'input', display: 'raw', ...meta },
  })
}

async function seed(collection, items) {
  console.log(`  seeding ${items.length} items into ${collection}...`)
  for (const item of items) {
    await api('POST', `/items/${collection}`, { status: 'published', ...item })
  }
}

// ──────────────────────────────────────────────────────────────
// 1. homepage_stats
// ──────────────────────────────────────────────────────────────

await createCollection('homepage_stats', 'bar_chart')
await addField('homepage_stats', 'status', 'string', {
  interface: 'select-dropdown',
  display: 'labels',
  required: true,
  width: 'half',
  options: {
    choices: [
      { text: '已发布', value: 'published' },
      { text: '草稿', value: 'draft' },
    ],
  },
})
await addField('homepage_stats', 'sort', 'integer', {
  interface: 'input',
  display: 'raw',
  width: 'half',
})
await addField('homepage_stats', 'value', 'string', { required: true })
await addField('homepage_stats', 'label', 'string', { required: true })
await addField('homepage_stats', 'unit', 'string', {})
await addField('homepage_stats', 'detail', 'string', {})

await seed(
  'homepage_stats',
  APPROVED_HOMEPAGE_STATS.map((item) =>
    Object.fromEntries(Object.entries(item).filter(([field]) => field !== 'id'))
  )
)

// ──────────────────────────────────────────────────────────────
// 2. services
// ──────────────────────────────────────────────────────────────

await createCollection('services', 'room_service')
await addField('services', 'status', 'string', {
  interface: 'select-dropdown',
  required: true,
  width: 'half',
  options: {
    choices: [
      { text: '已发布', value: 'published' },
      { text: '草稿', value: 'draft' },
    ],
  },
})
await addField('services', 'sort', 'integer', { width: 'half' })
await addField('services', 'slug', 'string', { required: true })
await addField('services', 'icon', 'string', {})
await addField('services', 'name', 'string', { required: true })
await addField('services', 'subtitle', 'string', {})
await addField('services', 'description', 'text', { interface: 'input-multiline' })
await addField('services', 'features', 'json', {
  interface: 'list',
  options: { template: '{{item}}' },
})

await seed(
  'services',
  APPROVED_SERVICES.map((item) =>
    Object.fromEntries(Object.entries(item).filter(([field]) => field !== 'id'))
  )
)

// ──────────────────────────────────────────────────────────────
// 3. warehouses
// ──────────────────────────────────────────────────────────────

await createCollection('warehouses', 'warehouse')
await addField('warehouses', 'status', 'string', {
  interface: 'select-dropdown',
  display: 'labels',
  required: true,
  width: 'half',
  options: {
    choices: [
      { text: '已发布', value: 'published' },
      { text: '草稿', value: 'draft' },
      { text: '归档', value: 'archived' },
    ],
  },
})
await addField('warehouses', 'sort', 'integer', { width: 'half' })
await addField('warehouses', 'name', 'string', { required: true })
await addField('warehouses', 'city', 'string', {})
await addField('warehouses', 'since', 'string', {})
await addField('warehouses', 'address', 'string', {})
await addField('warehouses', 'park', 'string', { note: '园区总面积（㎡）' })
await addField('warehouses', 'rent', 'string', { note: '可租面积（㎡）' })
await addField('warehouses', 'height', 'string', { note: '层高' })
await addField('warehouses', 'highlight', 'text', {
  interface: 'input-multiline',
  note: '核心优势描述',
})

await seed(
  'warehouses',
  APPROVED_WAREHOUSES.map((item) =>
    Object.fromEntries(Object.entries(item).filter(([field]) => field !== 'aliases'))
  )
)

// ──────────────────────────────────────────────────────────────
// 4. cases — seed existing collection
// ──────────────────────────────────────────────────────────────

console.log('\n[collection] cases (existing — seeding only)')
await seed('cases', [
  {
    sort: 1,
    category: '快时尚女装',
    label: 'UR（Urban Revivo）',
    metrics: '库存 260万件+ · SKU 13万+ · 仓面积 10万㎡+ · 峰值B2C 10万件/日',
    details:
      'UR 是中国头部快时尚女装品牌，天猫超品日创服饰类目GMV新纪录，全球门店超400家。新亦源为其提供全渠道仓储，RFID全面上线，支持唯品会JIT/JITX。',
    tags: ['合作自2017年', 'B2C+B2B全渠道', 'RFID全面上线', '唯品会JIT/JITX'],
    img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=75&auto=format&fit=crop',
  },
  {
    sort: 2,
    category: '高端设计师女装',
    label: '玛克茜妮（MAXRIENY）',
    metrics: '库存 90万件+ · SKU 1.7万+ · 峰值B2C 7.5万件/日 · 峰值B2B 6万件/日',
    details:
      '聚焦28–38岁独立都市高知女性，欧洲中世纪宫廷奇幻美学，产品均价800–4500元。新亦源提供B2C+B2B联动仓储及仓内质检修复。',
    tags: ['B2C+B2B联动', '仓内质检修复'],
    img: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&q=75&auto=format&fit=crop',
  },
  {
    sort: 3,
    category: '内衣基础品类',
    label: '幸棉',
    metrics: '库存 370万件+ · SKU 5000+ · 仓 2.5万㎡ · 峰值B2C 10万件/日',
    details:
      '国内内衣基础品类代表性品牌。新亦源提供多渠道订单聚合、新货退货质检、达播寄样、全链路一体化服务。',
    tags: ['多渠道接入', '达播寄样', '退货质检'],
    img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=75&auto=format&fit=crop',
  },
  {
    sort: 4,
    category: '跨境全品类女装',
    label: '美一(MEIYI)',
    metrics:
      '年发货 100~150万件/年 · 年质检 120~200万件/年 · 年上架 130~180万件/年 · 年包装 80~160万件/年',
    details:
      '美一（MEIYI）是专注跨境全品类女装的服饰品牌。新亦源为其提供 B2B+B2C 一体化仓储服务，涵盖收货验货、新货质检、包装整理、库存上架及发货打包全流程，年综合处理量达百万件级别。',
    tags: ['跨境出海', '质检+包装+上架'],
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=75&auto=format&fit=crop',
  },
  {
    sort: 5,
    category: '直播女装',
    label: 'LOORAPWD 罗拉密码',
    metrics: '日均出库 3万+ 件 · 快速补货 · 直播寄样',
    details: '头部直播女装品牌，主打快速上新。新亦源为其提供快速周转仓储、达播寄样一体化服务。',
    tags: ['直播电商', '快速补货', '达播寄样'],
    img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=75&auto=format&fit=crop',
  },
  {
    sort: 6,
    category: '棉麻生活品牌',
    label: '茵曼（Inman）',
    metrics: '全渠道库存统一管理 · 多平台同步发货',
    details:
      '知名棉麻生活服装品牌，多年线上线下融合运营。新亦源提供全渠道一盘货仓储，实现多平台库存统一。',
    tags: ['全渠道一盘货', '线上线下融合'],
    img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=75&auto=format&fit=crop',
  },
])

console.log('\n✅ CMS setup complete!')
console.log('   collections: homepage_stats, services, warehouses')
console.log('   cases: seeded with 6 items')
console.log(`\nAccess Directus admin at ${URL}/admin`)
