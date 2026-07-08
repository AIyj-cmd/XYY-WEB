/**
 * One-time CMS setup script.
 * Creates Directus collections (homepage_stats, services, warehouses)
 * and seeds all data from brand.ts.
 *
 * Usage: node scripts/setup-cms.mjs
 */

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

await seed('homepage_stats', [
  {
    sort: 1,
    value: '140+',
    label: '合作知名品牌',
    unit: '家',
    detail: '鞋服、潮玩、美妆、箱包等细分行业',
  },
  { sort: 2, value: '50万', label: '直营鞋服仓储', unit: '㎡', detail: '三级仓网架构，按需配仓' },
  {
    sort: 3,
    value: '6000+',
    label: '服务区域',
    unit: '个',
    detail: '覆盖全国主要城市及区县网络',
  },
  {
    sort: 4,
    value: '2000+',
    label: '自有员工',
    unit: '人',
    detail: '固定员工占比约80%，行业内较高水平',
  },
  {
    sort: 5,
    value: '1.17亿',
    label: '全年新货质检',
    unit: '件',
    detail: '专业质检团队，标准化流程',
  },
  { sort: 6, value: '1.53亿', label: '全年退货质检', unit: '件', detail: '退货二次上架，降低损耗' },
  { sort: 7, value: '99.99%', label: '库存准确率', unit: '+', detail: 'RFID + 系统双重校验' },
  {
    sort: 8,
    value: '3000万',
    label: '包材二次利用',
    unit: '个/年',
    detail: '旧纸箱回收再利用，降本减碳',
  },
])

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

await seed('services', [
  {
    sort: 1,
    slug: 'cloud-warehouse',
    icon: 'warehouse',
    name: '鞋服云仓',
    subtitle: '一仓发全国，全渠道一盘货',
    description:
      '以鞋服品类深度优化的仓储管理系统为核心，提供B2C+B2B+O2O全渠道发货、库存同步与智能补货服务。单仓单日峰值50万单，弹性产能保障大促不爆仓。',
    features: [
      '全渠道一盘货，库存准确率99.99%+',
      '当日18:00前订单，当日24:00前全出',
      '单仓峰值50万单/日，弹性人力调配',
      'RFID全域识别，拣货效率+40%',
      '支持唯品会JIT/JITX等主流平台',
    ],
  },
  {
    sort: 2,
    slug: 'quality-inspection',
    icon: 'inspection',
    name: '后整质检修复',
    subtitle: '135+种缺陷识别，48小时二次上架',
    description:
      '与广检集团合作的QC认证质检团队，按AQL 1.0–6.5标准运行。新货全检/抽检、退货质检、瑕疵修复一站式服务，瑕疵修复成功率90%，退货48小时内完成质检并二次上架。',
    features: [
      '可识别缺陷135+种，覆盖四大类型',
      '退货质检+二次上架48小时内（加急24小时）',
      '瑕疵修复成功率90%，专属9区修复分区',
      '1080P拆包监控，电商争议全程可举证',
      '全年新货质检1.17亿件，退货质检1.53亿件',
    ],
  },
  {
    sort: 3,
    slug: 'logistics-cloud',
    icon: 'logistics',
    name: '物流云',
    subtitle: '多承运商聚合，智能路由降本',
    description:
      '自研物流服务中台OTD，聚合全平台承运商，一键切换路由、实时轨迹可视化、发货超时预警。通过智能寄件平台"运到"，实现商圈零售门店正向+逆向网络统一管理。',
    features: [
      '全平台承运商聚合，一键拦截转寄',
      '发货超时预警+签收时效监控',
      '奇门/EDI接口，与主流ERP无缝对接',
      '不收系统使用费，按需付费',
      '物流轨迹可视化，在线客户工单流',
    ],
  },
])

// ──────────────────────────────────────────────────────────────
// 3. warehouses
// ──────────────────────────────────────────────────────────────

await createCollection('warehouses', 'warehouse')
await addField('warehouses', 'status', 'string', {
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

await seed('warehouses', [
  {
    sort: 1,
    name: '黄埔仓',
    city: '广州',
    since: '2025',
    address: '广州市黄埔区果园一路2号',
    park: '15,000',
    rent: '3,000',
    height: '6m',
    highlight: '紧邻广园快速、京港澳高速，10台3吨货梯，进出货效率高',
  },
  {
    sort: 2,
    name: '番禺仓',
    city: '广州',
    since: '2023',
    address: '广州市番禺区石楼镇市莲路石楼段6号',
    park: '6,000',
    rent: '200',
    height: '6m',
    highlight: '番禺石楼核心区，3台电梯，丙二类消防，开仓即用',
  },
  {
    sort: 3,
    name: '肇庆仓',
    city: '肇庆',
    since: '2019',
    address: '肇庆市四会市东城街道唯品会物流园20号库',
    park: '100,000',
    rent: '50,000',
    height: '12m',
    highlight: '20万平米物流园，12米超高层，多条自动打包线，快递资源发达',
  },
  {
    sort: 4,
    name: '智谷仓',
    city: '东莞',
    since: '2020',
    address: '东莞市常平镇多宝路2号常平智谷',
    park: '110,000',
    rent: '5,000',
    height: '12m / 4m',
    highlight: '高速出口3公里，一层层高12米，10个升降平台，8部货梯',
  },
  {
    sort: 5,
    name: '朗州仓',
    city: '东莞',
    since: '2017',
    address: '东莞市常平镇朗洲村鸿腾缘工业园',
    park: '30,000',
    rent: '5,000',
    height: '4.5m',
    highlight: '4台专配电商货梯，前后1500–2000㎡中转空间，进出货流转高效',
  },
  {
    sort: 6,
    name: '桥头仓',
    city: '东莞',
    since: '2023',
    address: '东莞市桥头镇多宝路2号常平桥头',
    park: '30,000',
    rent: '5,000',
    height: '6m',
    highlight: '东部高速5公里，方正大开间，动线流畅，弹性扩容灵活',
  },
])

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
    category: '跨境快时尚',
    label: 'Urbanic',
    metrics: '年发货 1800–2300万件 · 年质检 800–1400万件 · 年包装 1500–2000万件',
    details:
      '面向印度、英国等海外市场的跨境快时尚品牌，主营全品类女装。新亦源提供B2B+B2C一体化仓储，覆盖质检、包装、上架全流程。',
    tags: ['跨境出海', '质检+包装+上架'],
    img: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=75&auto=format&fit=crop',
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
