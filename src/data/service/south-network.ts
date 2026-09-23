export const SOUTH_WAREHOUSE_CITIES = [
  {
    city: '广州',
    warehouses: [
      { name: '黄埔仓', address: '广东省广州市黄埔区果园一路2号' },
      { name: '兴泰仓（番禺仓）', address: '广东省广州市番禺区石楼镇华山路2号' },
      { name: '新塘仓', address: '暂不公布' },
    ],
  },
  {
    city: '东莞',
    warehouses: [
      { name: '智谷仓', address: '东莞市常平镇多宝路2号常平智谷' },
      { name: '朗州仓', address: '东莞市常平镇朗洲村鸿腾缘工业园' },
      { name: '桥头仓', address: '东莞市桥头镇多宝路2号常平桥头' },
      { name: '云谷仓', address: '暂不公布' },
    ],
  },
  {
    city: '佛山',
    warehouses: [{ name: '宏盛仓（佛山仓）', address: '广东省佛山市三水区大塘镇大塘园区园东一路' }],
  },
  {
    city: '肇庆',
    warehouses: [{ name: '四会仓（肇庆仓）', address: '肇庆市四会市东城街道唯品会物流园20号库' }],
  },
] as const

// Kept compatible with retired, unmounted legacy South components while removing prior role labels.
export const SOUTH_NETWORK_NODES = SOUTH_WAREHOUSE_CITIES.map(({ city }) => ({
  city,
  code: city,
  role: '仓库资料',
  note: '仓点与服务条件以项目确认结果为准。',
}))

export const SOUTH_COLLABORATION_BANDS = [
  {
    num: '01',
    title: '库存存储',
    desc: '根据货品数量与库存变化安排存储空间，方便货品入库、管理与出库。',
    signal: '库存管理',
  },
  {
    num: '02',
    title: '订单处理',
    desc: '围绕日常订单和促销活动安排作业人员，衔接收货、拣货与打包。',
    signal: '作业安排',
  },
  {
    num: '03',
    title: '发货配送',
    desc: '结合收货地区与发货渠道安排配送，确认发出时间与预计到达时间。',
    signal: '配送安排',
  },
  {
    num: '04',
    title: '订单与库存',
    desc: '连接订单、库存、仓内作业和退货状态，方便跟进商品进度。',
    signal: '状态跟进',
  },
] as const
