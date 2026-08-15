const warehouses = [
  ['warehouse-guangzhou-huangpu', '黄埔仓', ['黄埔仓'], '广州', '广东省广州市黄埔区果园一路2号'],
  [
    'warehouse-guangzhou-xingtai',
    '兴泰仓',
    ['兴泰仓', '番禺仓'],
    '广州',
    '具体地址与启用状态以双方确认信息为准',
  ],
  [
    'warehouse-guangzhou-xintang',
    '新塘仓',
    ['新塘仓'],
    '广州',
    '具体地址与启用状态以双方确认信息为准',
  ],
  [
    'warehouse-dongguan-yungu',
    '东莞云谷仓',
    ['东莞云谷仓', '云谷仓'],
    '东莞',
    '具体地址与启用状态以双方确认信息为准',
  ],
  [
    'warehouse-foshan-hongsheng',
    '佛山宏盛仓',
    ['佛山宏盛仓', '宏盛仓'],
    '佛山',
    '具体地址与启用状态以双方确认信息为准',
  ],
  ['warehouse-zhaoqing', '肇庆仓', ['肇庆仓'], '肇庆', '具体地址与启用状态以双方确认信息为准'],
  [
    'warehouse-kunshan-huaqiao',
    '昆山花桥仓',
    ['昆山花桥仓', '花桥仓'],
    '昆山',
    '具体地址与启用状态以双方确认信息为准',
  ],
  [
    'warehouse-shanghai-qingpu-huijin',
    '上海青浦汇金仓',
    ['上海青浦汇金仓', '汇金仓'],
    '上海',
    '上海市青浦区白鹤镇外青松公路3939号B-3-3',
  ],
  [
    'warehouse-hefei-lianya',
    '合肥联亚仓',
    ['合肥联亚仓', '联亚仓'],
    '合肥',
    '具体地址与启用状态以双方确认信息为准',
  ],
]

export const APPROVED_WAREHOUSES = warehouses.map(
  ([content_key, name, aliases, city, address], index) => ({
    content_key,
    sort: index + 1,
    name,
    aliases,
    city,
    address,
    since: '',
    park: '',
    rent: '',
    height: '',
    highlight: '仓容、作业范围和可用服务以双方确认的项目方案为准。',
  })
)

export const LEGACY_WAREHOUSE_NAMES = ['智谷仓', '朗州仓', '桥头仓']
