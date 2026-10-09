# XYY-20261002-06 — 咨询体验二期、按需求选择服务与移动端验收

## 授权、风险与基线

- 用户选择实施「咨询体验二期、按需求选择服务、移动端体验专项」。本任务为本地实现与验证；风险 MEDIUM，按 Terra → Luna → Nova → Sol 执行。
- 基线 HEAD `ab82cbdafb3923e4d62041b801d700f360ccdf20`；既有修改与文件 hash 保存于 `output/iteration/xyy-20261002-06/baseline.json`，既有 diff 为同目录 `baseline.diff`。全部既有动效、素材、配置与治理改动保留。
- 现有项目为 Astro/Express 自管部署，无 `.openai/hosting.json`。本任务沿用项目，不创建 Sites 项目、托管配置或外部预览。

## 最小 Scope 与产品交互

1. 咨询体验：中英文案例详情的咨询链接携带受控案例上下文，联系页显示已验证的案例/业务场景；语言切换保留有效场景。只有当前内容来源认可的案例才能显示品牌上下文，CMS 成功返回空或未发布案例不能复活为静态内容。
2. 需求模板：联系表单提供用户主动点击的「插入填写提纲」，内容涵盖品类、SKU/订单规模、渠道、退货及计划时间；保留现有输入，不重复插入、不静默截断，超过 1200 字限制时明确提示。模板不是必填字段，也不自动提交。
3. 服务选择：在现有中英文联系页增加可折叠的「按需求选择服务」，首页服务区域与产品页首屏提供可发现入口。使用业务需求与区域两个简单选择，返回推荐服务、对应详情入口、案例入口及合作准备事项，再进入预选联系表单。至少覆盖电商发货、门店补货、退货质检、商品整理、直播履约；区域不限/华东/华南。已有英文页面无对应区域详情时链接到真实英文服务页面，不虚构区域能力。
4. 采用 SSR/原生 GET 渐进增强：无 JS 时选择、推荐与咨询入口仍可用；选择参数仅包含固定枚举，不把个人信息或自由文本放进 URL。未选择需求时不宣称推荐结果。直接联系表单保持可达。
5. 移动端：联系输入可读（至少 16px）、新控件触达区域至少 44px、固定导航及悬浮入口不遮挡关键表单控件；针对本次流程的实际问题做最小修复。保留已有品牌与视频交互。
6. 移动性能专项：对首页、产品、中文联系与英文联系建立本次移动实验室基线，扩展可复用的检查配置；有具体退化/不可用证据才调整有关加载或布局。不得把实验室结果称为真实用户指标。

## 文件所有权

- Sol：本合同、`DEV_STATE.md`、`docs/SOL.md`、基线与最终验收证据，以及 `output/playwright/xyy-20261002-06/sol/` 视觉补证。
- Terra 实现：`src/lib/conversion/` 内现有来源模块及所需新辅助模块；`src/components/contact/`（限场景、模板、输入移动体验）；新目录 `src/components/service-finder/`；新脚本 `src/scripts/contact-enquiry.ts`；新样式 `src/styles/contact-enquiry.css` 与 `src/styles/service-finder.css`；`src/components/cases/CaseDetailContact.astro`；必要时两条案例详情路由 `src/pages/cases/[slug].astro`、`src/pages/en/cases/[slug].astro`；`src/pages/contact.astro`、`src/components/en/EnglishContact.astro`、`src/components/home/HomeCoreSolutions.astro`、`src/components/product/ProductVideoSequence.astro`；`src/styles/product/video-sequence-responsive.css`（仅新增入口适配）；`src/styles/floating-contact.css`（仅有遮挡证据时）；新 `lighthouserc.mobile.cjs`；`docs/CONTACT_CONVERSION.md`、`docs/TERRA.md`，以及 `output/iteration/xyy-20261002-06/terra/`。
- Luna：`tests/unit/conversion-source.test.ts` 与本任务所需新 unit/E2E 文件、必要的现有测试预期修正（不得削弱旧断言）、`docs/LUNA.md`、`output/iteration/xyy-20261002-06/luna/`、`output/playwright/xyy-20261002-06/`（排除 `sol/`）。不改业务实现。
- Nova：`docs/NOVA.md`、`output/iteration/xyy-20261002-06/nova/`；只读审查实现、测试与证据。
- 任一额外文件或依赖需求须返回 Sol；代理不得再派代理。所有角色均不是独占工作区，不覆盖或回退别人修改。

## 排除项

- 不提交/推送/部署，不写真实 CMS、数据库或线索接收端，不修改权限、生产配置、schema、依赖版本或锁文件。
- 不增加统计、报告、追踪、CRM、报价承诺、预约发送或新公开数字。
- 不改变联系 API、六字段接收契约、隐私同意和失败语义，不重构 CMS、视频系统、全站导航或既有动效。
- 自动化使用 offline CMS/本地受控 fixture 与 mock 询盘；不得通过测试发送真实询盘。

## Acceptance Criteria

- AC1：中文、英文案例咨询入口保留对应案例语境；服务/案例/选择器有效参数经语言切换可保留，未知、重复、冲突或恶意参数不产生错误预选或任意内容反射。已有 16 路来源预选保持可用。
- AC2：模板仅在主动点击后插入，已有文字完整保留；重复点击无重复内容；超长时输入不被截断；失败提交保留输入且能重试；请求仍遵循原联系协议。
- AC3：五种以上业务需求、三种区域组合均得到一致且真实可达的服务结果；用户可重选或直接咨询；推荐与最终咨询表单的服务一致，场景可见；无 JS 完成同一基本路径。
- AC4：中英文首页与产品首屏的选择入口真实可点击；360/390 手机、768 平板、1440 桌面无本任务引入的横溢、控件遮挡或不可达；键盘可完成选择与模板操作。
- AC5：独立测试覆盖选择、来源解析、模板保护、语言切换、无 JS、mock 成功/失败、减少动效和手机关键流程；移动实验室结果保留指标及限制。可用时测 WebKit；环境缺少引擎/真机时记为 BLOCKED 或未覆盖，不能声称 Safari/微信真机 PASS。
- AC6：本次 `npm run verify` 与相关 E2E 通过，Nova APPROVED，既有范围外文件 hash 不变、既有角色日志前缀保留。性能没有基线或原因为未知时不声称已加速。

## 所需输入、证据与交接

- 输入为本合同、AGENTS.md、DEV_STATE 当前相关状态、各角色近期日志、现有来源/联系/案例/CMS解析/产品页代码。graphify 现有图谱仅作入口，源码为准。
- Terra 交付最小改动列表、映射与交互说明、自测、文件 hash 和限制；Luna 独立运行 verify/相关测试、真实浏览器截图并亲读、记录移动实验室结果；Nova 对可访问性、用户输入、CMS事实来源、无统计/外写、回归和 Scope 审阅。
- 有失败按同 ID 返工：Luna → Sol → Terra → Luna；Nova 驳回后 Terra → Luna → Nova。依赖阶段顺序执行。
- 受磁盘约 1.1GiB 可用空间限制，复用依赖和本地构建目录，不复制媒体或清理用户/历史文件；测试引擎缺失由 Sol 处理。
