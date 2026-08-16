const warehouses = [
  ['warehouse-guangzhou-huangpu', '黄埔仓', ['黄埔仓'], '广州', '广东省广州市黄埔区果园一路2号'],
  [
    'warehouse-guangzhou-xingtai',
    '兴泰仓',
    ['兴泰仓', '番禺仓'],
    '广州',
    '广东省广州市番禺区石楼镇华山路2号',
  ],
  ['warehouse-guangzhou-xintang', '新塘仓', ['新塘仓'], '广州', '暂不公布'],
  [
    '90e48b22-4483-44bf-a08a-68f20a1725e0',
    '智谷仓',
    ['智谷仓'],
    '东莞',
    '东莞市常平镇多宝路2号常平智谷',
    '高速出口3公里，一层层高12米，10个升降平台，8部货梯',
  ],
  [
    '6c2e4b2a-e193-4e55-905a-d3fab2cdfa9c',
    '朗州仓',
    ['朗州仓', '东莞仓点'],
    '东莞',
    '东莞市常平镇朗洲村鸿腾缘工业园',
    '4台专配电商货梯，前后设中转空间，进出货流转高效',
  ],
  [
    'dc8351be-a324-401b-b276-bbe7e2e4ee4a',
    '桥头仓',
    ['桥头仓'],
    '东莞',
    '东莞市桥头镇多宝路2号常平桥头',
    '东部高速5公里，方正大开间，动线流畅，弹性扩容灵活',
  ],
  [
    'warehouse-foshan-hongsheng',
    '佛山宏盛仓',
    ['佛山宏盛仓', '宏盛仓'],
    '佛山',
    '广东省佛山市三水区大塘镇大塘园区园东一路',
  ],
  [
    'warehouse-zhaoqing',
    '肇庆仓',
    ['肇庆仓'],
    '肇庆',
    '肇庆市四会市东城街道唯品会物流园20号库',
    '唯品会物流园内仓点，多条自动打包线，快递资源集中',
  ],
  [
    'warehouse-kunshan-huaqiao',
    '昆山花桥仓',
    ['昆山花桥仓', '花桥仓'],
    '昆山',
    '江苏省苏州市昆山市鸡鸣塘南路936号院内A8-2F',
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
    '安徽省合肥市蜀山区紫蓬路2886号',
  ],
]

export const APPROVED_WAREHOUSES = warehouses.map(
  ([content_key, name, aliases, city, address, highlight], index) => ({
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
    highlight: highlight || '仓容、作业范围和可用服务以双方确认的项目方案为准。',
  })
)

export const LEGACY_WAREHOUSE_NAMES = ['东莞云谷仓']
