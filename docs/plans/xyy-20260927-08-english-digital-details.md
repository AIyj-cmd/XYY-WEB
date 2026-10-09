# XYY-20260927-08 — 英文首页数字化与智能寄件详情

- Status: CLOSED（本地验收；24 个应用/测试路径冻结，Luna PASS、Nova APPROVED、Sol 已验收）
- Risk: MEDIUM；Terra → Luna → Nova → Sol。
- Authorization: 用户在只读诊断后明确要求“修复一下”，授权补齐两个英文详情页及其首页入口、语言配对和发现信息；沿用同一 Task ID。无发布或外部写入授权。
- Baseline: HEAD `4a5bb2a3b8aff7bde49a9b6024222ebba0584502`；本轮实施基线与原脏文件保存于 `output/english/xyy-20260927-08/implementation/`。原诊断记录保留上级目录，不作为实施结果。

## 目标与路径

- 首页 03 Digital operations centre → `/en/digital-operations`，对应 `/wuliu-shuzihua`。
- 首页 04 Smart shipping platform → `/en/smart-shipping`，对应 `/yundao-zhineng-jijian`。
- 两页沿用实际中文布局、区块、图片/视频及交互，完整翻译界面文字、ARIA/alt、问答和页面元数据；原系统截图中的中文保持原素材，不生成替换图片。

## 文件所有权

- Terra 可修改：`src/components/digital/*.astro`，`src/components/service/{YundaoOperations,ServiceLandingHero,ServiceSignature,ServiceExperience}.astro`，`src/components/service/signature/DeliveryDeskSignature.astro`，`src/layouts/ServiceLanding.astro`；只做新详情需要的可选 locale 传递/内容呈现，默认中文保持。
- Terra 可修改：`src/i18n/{home-ui-en,routes,service-source-catalog}.ts`，新增 `src/i18n/digital-operations*.ts`、`src/i18n/smart-shipping*.ts`、`src/i18n/service-sources-yundao*.ts`，新增 `src/pages/en/digital-operations.astro`、`src/pages/en/smart-shipping.astro`，修改 `src/pages/{sitemap.xml,llms.txt}.ts`。
- Terra 样式限 `src/styles/logistics-digital.css`、`src/styles/logistics-digital/*`、`src/styles/yundao-operations.css`、`src/styles/yundao-operations/*`、`src/styles/service-signature*.css`、`src/styles/service-signature/*`、`src/styles/service-experience*.css`、`src/styles/service-experience/*` 以及新详情组件自身样式；只加英文作用域的必要换行/布局修复。
- Terra 单测限 `tests/unit/english-{routes,shell-routes,home-content}.test.ts` 和新增 `tests/unit/english-digital-details.test.ts`；追加 `docs/TERRA.md`，本任务实施目录内保存证据。不新增脆弱的源码字符串快照测试来代替行为测试。
- Luna 独立验证，仅拥有新增 `tests/e2e/english-digital-details.spec.ts`（确有需要可按路由/布局分成同前缀文件），本任务证据、追加 `docs/LUNA.md`。不改应用或 Terra 单测。
- Nova 审阅实现差异和 QA 证据，只写 Review 证据及追加 `docs/NOVA.md`；不修改实现。
- Sol 负责合同、`docs/SOL.md`、`DEV_STATE.md`、基线/冻结、预览及最终验收。
- 所有角色保留用户和其他代理改动，不再委派。需要超出上述文件先返回 Sol。

## 边界与实现要求

- CMS 读取仍由现有服务内容/FAQ接口提供；新增 Yundao 英文源快照与 `translateReviewedService` 配对，不在英文页面绕过 CMS 直接展示固定发布内容。成功空、未审核/变更来源保持空并按原规则诊断；仅网络/超时/5xx 可用既有审核回退，401/403/非法契约显式失败。
- `ServiceLanding` classic 分支当前直接消费中文 content/displayFaqs，需最小改为 visibleContent/visibleFaqs 并向子组件传 locale；其他已本地完成的中文及四个英文服务呈现保持。
- 公开数字仅来自现有 `src/lib/claims/`。中文旧页的“11家”“最高50%”未在当前审核 registry 找到；不得复制成英文公开数字或新建虚构审核记录。英文使用不带量化承诺的承运商/按线路报价描述，保留实际线路、报价和时效条件。源快照仍精确对应原中文内容，不修改原中文页面或 claims。
- 排除新增服务范围、案例/新闻/白皮书翻译、导航设计、数据卡片或提示条行为、依赖/配置/媒体、CMS客户端/规则、claims注册表、真实CMS/数据库/线索写入、生产环境、提交、推送及部署。

## Acceptance Criteria

1. 两个新英文路径 HTTP200，服务端返回英文正文和唯一完整 H1；首页03/04各自直达正确详情，而非总览/联系页。对应中文页的内容、素材、按钮和布局保持。
2. 详情页包含与原中文对应的核心模块、工作流程、系统图/视频、适用场景、FAQ（原页存在时）及咨询入口；没有中文界面残留（原品牌/法律名称/截图内文字除外），没有虚构数字或承诺。英文CTA、相关页面和页脚遵循现有英文路由。
3. 两组中英文双向切换保持当前详情；浏览器语言提示在这两条中文路径建议对应英文详情；Services导航活动态、canonical/hreflang/x-default、title/description/JSON-LD及sitemap/llms正确。未知英文页仍真实404。
4. 新英文页在1440/768/390/360下正文/导航/H1实际文字Range无横向裁切、重叠或溢出；图片/视频可用、FAQ/CTA可见，桌面/手机代表截图已实际读取。中文两详情页1440/390保持基线；classic中文呈现和四个既有英文服务做定向回归。
5. Yundao审核源/空响应/变更来源/FAQ过滤由相关单测覆盖；网络/5xx审核回退与401/403/非法响应失败不被此次改动绕过。本地测试不访问真实CMS或提交线索。
6. 格式、lint、维护预算、类型检查、相关单测和定向E2E通过，最终fresh构建通过；Luna PASS、Nova APPROVED、Sol冻结及基线保护核对通过。不提交不部署，不为本轮重复无关全量套件；未来提交或部署前仍执行对应强制门禁。

## 验证方式

- 使用显式离线CMS/假线索配置的本地预览；保留现有4532等进程。Sol先采集中文基线，QA阶段再启动本轮独立预览。
- 不用持续媒体页面的networkidle作为准备条件；等DOM、字体、相应文本/动画稳定后采样。可见文字Range与真实裁切祖先优先，不能仅看document宽度。
- 证据按本次实际命令和退出码记录；无关历史通过结果不冒充本次证据。失败应区分应用、测试和环境问题，不静默跳过。

## 验收结果

- 两条新详情、首页实际点击、语言配对/浏览器提示、SEO/发现信息及真实404满足AC；正常页面、媒体、FAQ和咨询入口完整。CMS/schema边界发现后按同ID返工，7组组合复测通过。
- 40项限定单测；最终schema增量后524文件类型检查零诊断、693文件预算、局部格式/lint与fresh构建通过。最终浏览器11个不同用例分段完成，1个重复SSR检查跳过；早期脚本失败与exit143日志保留，mobile缺失的明确结束状态通过单独复测exit0补齐。
- 8布局组合56采样、6页语义基线、4组CTA实点及中文四组合116元素几何通过；桌面/手机截图已实际审阅。最终24路径冻结、基线保护和文档增量检查通过。
- 仅本地离线Chrome152和模拟视口；未提交、推送、部署或真实外部写入，未运行全量verify/release。完整QA、Review及限制见`output/english/xyy-20260927-08/implementation/`，最终验收为`sol-final-acceptance.json`。
