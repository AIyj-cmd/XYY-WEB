# XYY-20261010-15 — 英文仓配详情补齐

- 风险：MEDIUM；用户在任务14诊断后明确要求修复。本轮范围为 `/home/yj/data/website` 本地代码，基线 `0ff161f9cef3e124169d5ba2c0cd3b45c34affae`，开始时工作树干净。
- 问题：英文总览第4/6/7项只返回当前页锚点，第5项错误复用第1项鞋服详情；中文独立内容已经存在，英文页面和呈现覆盖不完整。
- 目标：新增 `/en/cross-border-fulfillment`、`/en/south-china-fulfillment`、`/en/east-china-fulfillment`、`/en/livestream-fulfillment`，分别复用既有独立CMS服务身份和素材，补齐英文内容及交互文案。
- 排除：推送、提交、部署、远端配置、真实CMS/数据库读写、内容导入、数据删除、真实表单提交、依赖变更和无关重构。新服务器维持当前已部署版本，待本地结果验收后另行处理上线。

## 所有权和顺序

- Sol：本合同、DEV_STATE和SOL日志；协调接口与最终验收。
- Terra integration：四份受审核英文source目录及翻译、目录注册、四个英文页面、总览/页脚/语言路由/发现信息、相关unit测试及TERRA日志；不改redesign组件目录。
- Terra presentation：dispatcher、Crossborder/South组件及直接子组件、四类内容分组helper的locale支持；不改服务source目录、路由和测试。保留中文默认行为。
- Terra east/live presentation：East/Live组件及直接子组件、east/live-public-copy及相应局部UI文案；不改上述四类content helper。原presentation实施者确认这些文件尚未修改后交接。
- Review返工沿用本任务：presentation负责跨境英文标题空格、华南桥头镇地址漏译及中文MCN分组兼容修正；原测试实施者停止后，Sol单独交接 `tests/unit/service-redesign-live.test.ts` 给presentation补MCN回归断言。Luna定向复测受影响项，Nova复审，保留旧失败证据。
- 三实施范围互不写同一文件；有交叉需求先交Sol协调。子代理不得再委派，不得回退他人修改。
- 实施完成后交Luna独立测试、Nova审阅，再由Sol验收。

## 验收条件

1. 英文总览八项服务均直达八个不同、正确的英文详情；第5项为华南独立内容。
2. 四个新页面的标题、正文、FAQ、操作标签和联系入口均为对应英文内容，继承现有素材和服务身份，无未翻译的中文UI或误跳到中文路径。
3. 总览、页脚、语言切换、canonical/hreflang、站点地图与现有发现信息一致，四个中英文配对可来回切换。
4. 保持现有CMS空值与受审核翻译源绑定语义：空内容不填补，修改后未审核的内容不自动套用旧译文；已有中文页面与其他英文服务不回归。
5. 相关类型/格式/维护性/单测通过；独立本地浏览器验证新详情、总览八项跳转及语言切换的桌面与手机表现。使用隔离模拟CMS或既有离线数据，不连接真实接收端或写入CMS。
6. 证据记录到 ignored `output/english-services/xyy-20261010-15/`；浏览器证据置于 `output/playwright/xyy-20261010-15/`。未实际执行的检查不记为通过。

当前图索引已按Graphify查询辅助定位，属于旧索引；实现以当前源码和Task14真实点击证据为准。

## 验收结果

- 已完成本地实现，Luna PASS、Nova APPROVED，未解决 finding 为 0；Sol 验收通过。四类英文详情与八个总览入口的双端跳转、FAQ、联系入口和语言切换均有实际浏览器证据。
- CMS 初始源绑定、空值/变化源边界、中文与英文分组通过定向单测；标题空格、中文 MCN 回归和桥头镇地址漏译已完成返工与独立复测。
- 最终源码清单 `output/english-services/xyy-20261010-15/source-freeze-r3.json` 含 56 个源/测试文件，SHA-256 为 `212a4afcc7ab8ad979676548f3e61fa0e7381342b59abb60fbb38dda0757cd0f`；原完整报告 `luna/final-report.json` 与最终补测 `luna/r3/final-report.json` 共同记录验证范围。
- 当前为本地未提交修改，未推送或部署；没有修改服务器配置、真实 CMS/数据库或发送询盘。验证使用合成 CMS 和 Chromium 模拟视口，服务器上线效果待实际更新后验证。
