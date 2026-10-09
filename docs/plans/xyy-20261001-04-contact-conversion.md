# XYY-20261001-04 — 官网咨询转化一期

> 范围变更：用户于 2026-10-01 要求移除报告与事件统计，保留咨询来源与服务预选，由 [XYY-20261001-06](xyy-20261001-06-remove-conversion-reports.md) 执行。下文是原任务验收历史，事件开关、报告命令与示例不再属于后续交付范围；当前进度以新任务和 DEV_STATE 为准。

Status: CLOSED（本地；独立QA PASS、Nova r5 APPROVED，Sol验收完成）。Risk: MEDIUM。用户已批准方案并明确要求 Implement the plan；授权为本地实现、测试、报告工具与示例，不含提交/推送/部署、生产统计启用、真实线索/CMS/数据库写入或生产配置变更。

## 输入、基线与协作

- 已批准方向：服务信息自动带入表单；站内事件日志生成 HTML/CSV 报告。
- HEAD `7f903056233627c6e9b2007667b827b76a26d963`；基线 1409 路径、43 既有脏路径。证据目录 `output/conversion/xyy-20261001-04/` 含 manifest、status、diff 及既有角色日志快照。
- `src/layouts/ServiceLanding.astro` 及既有动效文件是保护路径，不修改；不改治理/config、已有素材和历史任务。日志只追加，不覆盖原内容。
- 顺序：Terra 实现/自测 → Luna 独立测试 → Nova Review → Sol 验收；失败按同 ID 返工。子代理不得互派或再委派。所有 Agent 不独占仓库，须保留他人修改；额外文件需求先回 Sol。
- r5执行恢复：两个专用Luna会话长期未返回进度后已中断，测试所有权转交 `luna_r5_recovery`；该QA会话实际继承主会话模型，不宣称使用GPT-5.6-luna。仍执行独立QA与Nova复审，Sol提供的命令证据明确归属。

## 产品与接口决定

### 服务预选

- 覆盖 10 个中文服务详情（8 仓配+物流数字化+智能寄件）和 6 个现有英文对应详情的首屏、底部、悬浮咨询入口。通用 CTA 在这些路径以外不带来源，不扩大其他页面改版。
- 统一 helper 从受控路由生成 `/contact` 或 `/en/contact` 链接；仅携带 `from`（受控规范来源路径）、`entry`（hero/bottom/floating/body），定位 `#contact-form`。
- 中文鞋服/跨境/华南/华东/直播/B2B 及其英文对应映射 `cloud-warehouse`；退货/后整映射 `quality-inspection`；数字化/智能寄件映射 `logistics-cloud`。不改变既有 service 枚举，不把来源塞进需求正文。
- SSR 预选；直接访问/未知来源/重复或非法参数不预选并归未携带来源。只从本地白名单映射名称与值，不渲染任意 query 文本。客户可改选；客户端初始化不可覆盖填写结果。
- 联系页中英文显式切换及语言提示入口保留合法参数；其他页面的语言行为保持。canonical 不包含这些参数。

### 事件

- `POST /api/conversion-events`。仅接受 `contact_cta_click`、`contact_form_start`、`contact_submit_success`；字段为事件 UUID、名称、白名单 source path/entry、locale、允许的 service code。服务器添加 ISO 时间；无来源使用 null 与统一未归因标签。
- 点击需真实用户激活；首次修改可见字段才发 start，每页面一次，自动预选不发。success 仅在 HTTP 成功且 JSON success===true 后发送，每个成功请求一次；中英文一致。蜜罐命中不计事件。
- 不采集姓名/电话/邮箱/公司/正文、完整 URL、IP/UA、Cookie 或持久访客 ID。IP 只可瞬时用于独立限流且不写统计日志。使用独立事件 ID做传输去重，不作为访客识别。
- 口径澄清：locale 是事件发生页当前语言，切换语言后 sourcePath 仍为原入口；service 是用户当前/最终选择，允许既有 `all`、`other` 与空值，不强制等于源页的默认预选。sourcePath/entry 可同为 null，此时仍可有用户选择的 service。来源字典必须检查自有键，`constructor`/`toString`/`__proto__` 不得命中。
- `CONVERSION_ANALYTICS_ENABLED` 严格值 `true` 才启用，默认关闭：前端不发送、端点 404；SSR 预选仍工作。只补 `.env.example`，不读写真实 .env；本地验证用命令环境显式启用。
- 校验 JSON 类型、2 KiB 读取上限（实际流也受限）、同源 Origin、字段白名单和枚举；独立有界内存限流（每来源 60 次/分钟、最多 1000 有效桶，容量耗尽返回429），不占询盘限额。非法来源403、格式400/415、超限413、限流429；有效事件204。错误不回显原始输入。
- 非阻塞 fetch keepalive，短超时、无自动重试；统计错误仅输出有限且无个人信息的可定位诊断，不阻碍导航/提交、不伪造成功。原 `/api/contact` 和 Xiansuo 六字段接收契约不改。
- 通过校验的事件以固定 `[xyy-conversion] ` 标记输出单行 JSON 到现有 stdout 日志。统计默认关闭；不开新日志服务，不改 PM2 或服务器。

### 报告

- 新增 `npm run report:conversions -- --input <log> [--input <log2>] [--from YYYY-MM-DD --to YYYY-MM-DD] [--out <dir>]`。默认最近7个北京时间自然日（含今天），支持包含边界的自选日期；默认输出在忽略目录 `output/conversion-reports/`。
- 流式读取指定文件；跳过无标记行；标记行必须合法。缺失/不可读输入、无效日期/倒置区间、损坏事件或冲突重复明确非零失败，不当作零数据。合法重复 UUID 去重；不输出原始敏感行。
- 输出 HTML 与 CSV，按北京时间日期/来源页面/语言/入口/服务汇总三类次数；HTML 文本转义、CSV 正确引用，零数据明确说明。禁止把事件次数称独立访客数、新增有效线索或成交；不计算虚假的跨事件转化率。无定时任务/线上后台/数据库。
- 同步中英文隐私说明，仅解释本次新增最小统计及真实字段用途，不作法律保证。README/使用文档说明开关、手工导出日志后生成报告、漏报/重复/客户端可伪造等限制，区分本地验收和生产启用。

## 文件所有权

Terra 可修改的现有实现文件：

- `package.json`、`.env.example`
- `src/layouts/Layout.astro`
- `src/components/Header.astro`、`src/components/navigation/LanguageSuggestion.astro`
- `src/components/layout/FloatingContact.astro`
- `src/components/contact/ContactForm.astro`、`src/components/contact/ContactInquiryFields.astro`
- `src/components/conversion/ConversionCTA.astro`
- `src/components/service/ServiceLandingHero.astro`、`src/components/service/ServiceExperience.astro`
- `src/components/service/footwear/FootwearHero.astro`、`src/components/service/footwear/FootwearCta.astro`
- `src/components/service/redesign/RepairHero.astro`、`src/components/service/redesign/B2BHero.astro`、`src/components/service/redesign/LiveHero.astro`、`src/components/service/redesign/EastHero.astro`、`src/components/service/redesign/ReturnInspectionHero.astro`
- `src/components/service/redesign/CrossborderPage.astro`、`src/components/service/redesign/SouthNetworkPage.astro`（Nova发现首屏入口缺失后，同ID补齐原批准的16页hero覆盖；只加受控咨询入口，保留CMS内容存在性判断）
- `src/components/digital/LogisticsDigitalHero.astro`
- `src/scripts/contact-page.ts`
- `src/pages/privacy.astro`、`src/components/en/EnglishPrivacy.astro`

Terra 可新增模块（只为此功能，保持行数预算）：`src/lib/conversion/`、`src/scripts/conversion-events.ts`、`src/components/conversion/ContactLink.astro`、`src/pages/api/conversion-events.ts`、`config/conversion*.mjs`、`scripts/report-conversions.mjs`、`scripts/lib/conversion-report*.mjs`、`docs/CONTACT_CONVERSION.md`。只追加 `docs/TERRA.md`。

Terra 可新增相关单测 `tests/unit/conversion-*.test.ts` 与 `tests/fixtures/conversion-*`，自测不代替 Luna。Luna 负责独立测试补充与受影响旧 href 断言（仅本任务覆盖路径）：`tests/unit/conversion-*.test.ts`、`tests/e2e/conversion-*.spec.ts`、`tests/e2e/service-pages.spec.ts`、`tests/e2e/english-acceptance-contact.spec.ts`；按需在 `output/conversion/xyy-20261001-04/` 写测试配置/证据；只追加自身日志 `docs/LUNA.md`。额外测试文件先报 Sol。

Nova 只读审阅，写审阅证据和追加自身日志 `docs/NOVA.md`（工具权限不允写时由 Sol 代录）。Sol 独占本合同、`DEV_STATE.md`、`docs/SOL.md`、基线/最终验收证据。任何角色不得改真实 CMS/数据库、生产配置、源 service APIs、鉴权或部署流程。

Sol 基线检索补充：Luna 可更新 `tests/e2e/footwear-page.spec.ts`、`tests/e2e/service-redesign-east.spec.ts`、`tests/e2e/service-redesign-repair.spec.ts`、`tests/e2e/service-redesign-south.spec.ts`、`tests/e2e/service-redesign-crossborder.spec.ts`、`tests/e2e/english-digital-details.spec.ts` 中被本次参数化链接直接影响的精确 href 断言；不得只放宽匹配而不验证新 query 的来源/入口。案例、白皮书和其他非服务页联系链接保持旧契约。

## 可测试 AC 与预期证据

1. 16 服务详情的指定入口带正确来源/位置/语言，联系页 SSR 预选正确；直接/非法参数无预选；改选、刷新及语言切换不误覆盖，禁用 JS 时链接和预选仍可用。
2. 事件仅按定义触发且 schema 不含个人信息；重复输入只发一次 start，网络/400/429/503/200非法payload与蜜罐不计 success；统计开启/关闭/异常不影响咨询业务。
3. 事件 API 默认关闭；开启后的正常、跨域、额外字段、超大/流式body、限流与时间窗边界通过单测。原联系接口六字段白名单与独立限流回归通过，无真实线索写入。
4. 报告固定样本的三类次数与预期一致：重复、多输入、跨北京时间日、范围边界、零数据；坏日志/缺文件可见失败；HTML/CSV无注入与个人信息。
5. 中英文桌面1440与移动390的关键流程、CTA与表单无新溢出/遮挡/页面错误，截图实看。10+6路由都覆盖映射，代表页面实际点击覆盖每种入口及服务组。
6. `npm run verify` 通过；相关 E2E 和已有中文/英文询盘、CTA、语言行为、API契约回归通过；测试仅 mock/offline CMS 与本地受控接收端。没有部署，因此不启动生产验证或 verify:release。
7. Luna PASS、Nova APPROVED；现有保护路径哈希保持，既有角色日志前缀保留；示例 HTML/CSV 和运行说明可直接使用。最终报告准确区分本地完成、统计关闭、未部署。

Nova首轮审阅补充：逐路断言必需的 `hero`、`bottom`、`floating` 入口集合，正文入口按实际页面覆盖；补齐跨境云仓、华南鞋服云仓首屏按钮后，验证两页1440/390可见、实点落地预选及无JShref。报告补充多输入去重、零数据、缺文件失败的直接用例；不扩大业务或外部授权。

Terra交接：实际修改清单、模块/导出接口、运行命令、测试输出和待独立核对项。Luna交接：命令及退出码、浏览器矩阵、截图路径与限制，缺环境须BLOCKED而非PASS。Nova交接：Scope/质量/安全/契约/回归结论与可定位缺陷。

## 最终验收

- 本地CLOSED：Terra实现，恢复Luna独立QA PASS，Nova r5 APPROVED，Sol完成验收。最终实现冻结34路径、测试/fixture冻结21路径；1371保护路径保持，HEAD未变。
- 最终完整verify exit0：588类型文件零诊断、93文件616/616单测、lint/维护预算/assets/build；独立桌面与手机E2E 62/62 PASS，16路必需入口、两页hero/无JS实点和预选齐全。四张稳定截图逐张审读通过；报告多输入、零数据和缺文件测试及真实CLI失败行为通过。
- 最终证据：`output/conversion/xyy-20261001-04/luna/r5-recovery-qa.md`、`nova/review-r5.md`、`sol-final-acceptance.json`；具体文件差异见同目录 `task-delta-final.json`。r4不变的事件、英文询盘、默认关闭与表单视觉证据明确复用，没有声称本轮全部重跑。
- 统计默认关闭；无提交、推送、部署或真实外部写入。验证限本地Chromium模拟视口及offline/mock依赖，示例报告为合成数据。无当前Scope内遗留阻塞。
