export const APPROVED_SERVICES = [
  {
    id: 1,
    sort: 1,
    slug: 'cloud-warehouse',
    icon: 'warehouse',
    name: '鞋服云仓',
    subtitle: '全渠道一盘货与鞋服专用仓配',
    description:
      '提供B2C+B2B+O2O全渠道仓配、库存同步和门店补货服务。实际单仓单日峰值{{singleWarehousePeak}}，{{shippingSla}}。',
    features: [
      '发货准确率{{shippingAccuracy}}，库存准确率{{inventoryAccuracy}}',
      '{{shippingSla}}',
      '实际单仓单日峰值{{singleWarehousePeak}}',
      'RFID、电子标签与出库复核协同管理款色码',
      '支持唯品会JIT/JITX等项目，平台规则按项目核验',
    ],
  },
  {
    id: 2,
    sort: 2,
    slug: 'quality-inspection',
    icon: 'inspection',
    name: '退货质检与瑕疵修复',
    subtitle: '{{recognizableAnomalies}}异常识别，{{returnTurnaround}}二次上架',
    description:
      '与广检集团合作QC团队，按AQL 1.0–6.5执行；质检技师经广检集团资深讲师培训认证。可识别7大类{{recognizableAnomalies}}异常，按质检结果进入对应修复流程；退货质检与二次上架{{returnTurnaround}}，瑕疵修复成功率{{repairSuccessRate}}。',
    features: [
      '可识别7大类{{recognizableAnomalies}}异常',
      '退货质检与二次上架{{returnTurnaround}}，平均拆包4小时、质检12小时',
      '瑕疵修复成功率{{repairSuccessRate}}',
      '设置九大修复专区，完成后按品牌标准复检',
      '全年新货质检{{newGoodsInspectionAnnual}}，退货质检{{returnInspectionAnnual}}',
    ],
  },
  {
    id: 3,
    sort: 3,
    slug: 'logistics-cloud',
    icon: 'logistics',
    name: '物流数字化能力',
    subtitle: '六大系统模块与OTD物流服务中台协同',
    description:
      '以OTD物流服务中台为数字化底座，由物流网关、WMS、LMS、人效通、发货时效监控、轨迹与签收监控六大模块协同订单、库存、仓内作业与物流履约，支持路由、轨迹和异常管理。',
    features: [
      '运到已对接顺丰、京东、EMS等11家主流承运商',
      '物流轨迹与异常节点可视化',
      '可采用奇门、EDI、API或客户定制接口',
      '不收系统使用费；实施、接口联调、定制开发和其他服务费用按方案确认',
      '在线工单与运营报表支持履约复盘',
    ],
  },
]
