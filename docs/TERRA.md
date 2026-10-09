# Terra

返回 [Sol 调度入口](SOL.md)。

## Role

Full-stack Implementation Engineer。

模型：`gpt-5.6-terra`；推理等级：`high`。

## Responsibilities

- Astro、TypeScript、CSS/Tailwind、页面与组件。
- Express、API、Directus 集成、服务端逻辑和普通应用脚本。
- Sol 明确 Scope 内的功能实现与 Bug 修复。

## Boundaries

- 只执行 Sol 定义的 Scope，不扩大需求、不顺手重构、不决定新产品需求。
- 不直接调度 Luna 或 Nova；失败、冲突和升级返回 Sol。
- 不部署、不修改生产环境、不写生产 CMS、不操作数据库，不处理 PostgreSQL → Oracle 19c。
- 遵守根目录 `AGENTS.md`，保留用户修改，不泄露 Secret，不使用破坏性 Git 操作。

## Input Contract

- Task ID。
- Scope 与明确排除项。
- Acceptance Criteria。
- 风险等级和相关上下文。
- 要求执行的验证及需要交给 Luna 的重点。

## Implementation Workflow

1. 读取最小必要上下文并确认任务合同。
2. 在 Scope 内实施，遇到范围冲突立即返回 Sol。
3. 按风险执行实现侧验证，记录实际结果。
4. 以标准输出合同向 Sol 交付，不直接派发测试。

## Output Contract

- Task ID。
- 完成内容。
- 修改文件。
- 实现说明。
- 执行的验证。
- 已知风险。
- 需要 Luna 验证的重点。

## Work Log

首次真实参与任务时复制以下模板；同一问题返工继续更新原 Task ID。

### XYY-20260916-05 — B2B 门店仓配七区实施

Status: CODE DONE（源码冻结；待 Luna 独立验证与 Nova Review）

- 完成视频/文案首屏、分货收货、补货运输、库存系统、合作费用、FAQ和咨询七区；移除示例门店、假单据字段和旧选择脚本，保留 `.b2b-allocation` 滚动目标。
- `ServiceLanding` 仅对精确 B2B slug+presentation 启用逐字展示映射；正文、metadata与Service/FAQ Schema共用展示值。空、自定义、近似和未知内容保留，contentDesc在分货、系统或补充区互斥地显示一次；contentDesc-only/FAQ-only不补默认区或CTA。
- Prettier、`git diff --check`、B2B grouping unit 2/2和本地路由HTTP 200 PASS；Root已确认1440/768/390布局。`npm run typecheck`仅被范围外 `tests/e2e/service-redesign-live.spec.ts:52` implicit-any阻塞。无build/full verify、提交、推送、部署、CMS或数据库操作。冻结说明：`output/terra/XYY-20260916-05-freeze.md`。
- Rework：按 `before/src/layouts/ServiceLanding.astro` 恢复共享布局的四项 `stats` tuple、原 named slot wrapper 与空态 CSS；仅保留精确 `b2b-mendian-cangpei` + `b2b` 的展示映射，East/South/Live gates 未变。Prettier 和 `git diff --check` PASS；基线 diff、SHA-256及范围记录：`output/playwright/xyy-20260916-05/terra-scope/`。未运行类型或测试，待 Luna 独立验证。

### XYY-20260913-13 · 阶段 A：退货质检

Status: CODE DONE（阶段 A 源码冻结；待 Luna 独立验证与 Nova Review，验收后才进入下一页）

Task: 只将 `/tuihuo-zhijian` 改为独立的检验记录式页面；其余六个待改服务、鞋服页、两个 classic 页和 `/product` 保持现有输出。

Scope: `ServiceLanding` 仅新增显式 `returns` 分支，退货路由只切换展示参数；新增 returns 页面组件、局部样式、内容分组单测与页面 E2E，更新受影响的服务矩阵断言。本阶段未改 CMS 访问/回退、claims、媒体、共享导航/Footer、旧组件、其他路由、依赖或外部环境。

Implementation: `ReturnInspectionPage` 不调用旧 Signature、unique 或 Experience 组合。页面依次输出：短服务名和“退回来的商品，下一步有依据”价值标题、视频旁的独立浅底检查说明、纵向字段示意记录、四级纵向分流、服装/鞋类/AQL检查重点、证据与指标、完整 FAQ 与退货质检咨询收尾。Hero 保留 clean 视频 MP4/JPG、1280×720、autoplay/loop/muted/playsinline/preload 和无 controls；桌面视频与说明为真实网格，手机按视频后说明顺序堆叠，首屏预留导航高度。Hero 含 `/contact` 咨询入口与指向 `#returns-grade-heading` 的本页轻链接；B- 级处理去向链接至现有 `/houzheng-xiufu` 页面；收尾恢复原自然入口 `/cases`（合作案例）与 `/product`（全部仓配服务）。

Content mapping: 基线六项 feature 以标题轻量分类，且每项完整 title/desc 只显示一次并带 `data-redesign-feature`/子字段：四级质检评定示例→四级处置对照；服装专项检查→服装检查；鞋类专项检查→鞋类检查；AQL质检规则→规则与判定；全程视频举证→可复核依据；修复联动上架→修复分流。未知、改名或额外 feature 保留在证据区，不按数组位置推断，也不丢失。四条指标仅在证据区各一次；五条原 FAQ 以原生 details、`data-redesign-faq` 各一次。旧 `ReturnGradeSection` 的四个等级定义、异常示例和处置去向进入纵向四行；其中整体时效继续从既有 `CLAIM_TEXT.returnTurnaround` 读取，C级“按约定通知”保留，未新增数字。原 `h1`、`h1sub`、`heroDesc`、`contentDesc` 均有可见去向；全空内容和FAQ时仅显示不可用状态，不复活静态业务能力，部分内容按对应区块独立保留。

Validation: `npx prettier --write` 及 `--check`（指派源码/样式/测试）通过；`npx eslint`（指派 Astro/TS/测试）通过；`npm run typecheck` 为430 files、0 errors、0 warnings、0 hints；`npx vitest run tests/unit/service-redesign-content.test.ts` 为1 file、2 tests通过；新增 `service-redesign.spec.ts` 最终2项 Chromium E2E通过（12.3秒），此前与受影响 service-pages/service-motion 合跑的7项 Chromium E2E状态为passed；`git diff --check` 通过。本地4322 SSR回读为1个H1、0旧Signature、6项 feature 标记、5 FAQ标记、4级行和正确clean Hero source/poster。实际Playwright CLI查看1440×900与390×844首屏，视频未被文字覆盖、移动端自然堆叠；手机标题按“退回来的商品，／下一步有依据”语义断行。新增 Astro（39–97行）、CSS（83/103/166行）、组件TS43行和测试（39/46行）均在任务预算内。

Known Risks: 本地 E2E 使用 Directus 网络不可用时的审核 fallback，命令输出记录了既有 fallback 日志；未对真实 CMS 非空/部分/全空输入执行浏览器契约测试。Playwright CLI 截图只代表本地 Chromium 视口模拟，未验证真实设备或部署环境。未运行 build/full verify、提交、推送、部署或 CMS/数据库写入。

Handoff: 请 Luna 在真实/模拟完整、部分及全空内容边界验证 returns 分支：六项 feature/五FAQ/四stats各一次，未知 feature 不丢失，空内容不显示静态能力；在1440/1024/390/360检查记录区、四级表、Hero/导航/浮动咨询不相交、无横溢出；验证Hero媒体、FAQ、`/contact`、本页分级锚点和B-修复链接，以及其他十个基线路由无变。请 Nova 复核只由 `presentation="returns"` 启用新页面、CMS/SEO/Schema直传、claims来源与无旧组合混入。

QA rework: Luna 定向发现两处部分内容 DOM 引用：无可识别分级时 Hero 仍链接不存在的 `#returns-grade-heading`，空 FAQ 时 section 指向不存在的 `returns-faq-heading`。`ReturnInspectionPage` 现将实际 `features.grade.length` 传给 Hero，Hero 仅在分级区存在时输出本页锚点；FAQ section 仅在 FAQ 标题实际输出时保留 `aria-labelledby`。full 内容的可视结构未改，全空分支仍只输出不可用状态。默认 Vitest 配置不编译 Astro，因此保留原纯 helper 单测并在任务 `output/.../A` 下以独立 `getViteConfig` 配置实际 `AstroContainer` 渲染完整、部分和全空分支：分级锚点只在存在目标时输出、空 FAQ 无悬空 ARIA、全空不复活 Hero/分级表。该临时配置未改全局工具链。

Validation rework: `npx vitest run --config output/playwright/xyy-20260913-13/A/returns-container.vitest.config.ts` 为1 file、2 tests通过；`npx vitest run tests/unit/service-redesign-content.test.ts` 为1 file、2 tests通过；指派 Astro/测试/日志的 Prettier check、ESLint 与 `git diff --check` 通过。未按定向返工合同重跑 typecheck、全站或原七项 E2E。Luna 请只复测完整/部分/全空的锚点与 ARIA 边界。

### XYY-20260913-13 · 阶段 B：后整修复

Status: CODE DONE（阶段 B 本地源码冻结；待 Luna 独立验证与 Nova Review）

Task: 仅将 `/houzheng-xiufu` 重做为以工艺近景、异常目录、九专区与二次质检为主体的独立页面；阶段 A 已验收，其他待改五页、鞋服、classic 页与 `/product` 未接入本轮。

Implementation: `ServiceLanding` 改为薄分派：`RedesignServicePage` 只在显式 `returns` 或 `repair` 时路由到各自完整页面，A 的 returns 输出继续由原组件处理。后整页不调用旧 Signature、unique 或 Experience 组合，先以左侧 clean Hero 视频和右侧“先评估／再修复／再复检”三段中文标题建立主题，接着依次输出六类异常原生 details（首项展开）、清污大图加侧栏、缝补错位细节、整烫横幅、九专区紧凑索引、二次质检的达标/未达标关口、成功率统计定义与其余指标、完整 FAQ 和修复评估收尾。没有重做旧四步工单时间轴或四项等宽指标排；质检分流、材质/瑕疵/验收评估、专业工位流转与状态留痕、品牌标准复检关系合并为二检区短说明。三个既有工艺图片均只出现一次，无合成前后对比。

Content and boundaries: `repair-content.ts` 按标题轻量分类清污、面料、缝线、配饰、鞋类、标识异味，未知/改名内容进入“其他已提供修复说明”；每个输入 feature 的 title/desc 仅在目录中一次并附 `data-redesign-feature`/子字段。九专区沿用已有数据，不将六类服务伪造为工位一一对应；四条 stats 均在二检论据旁各一次，修复成功率与“进入修复流程后，经处理和二次质检后达到品牌约定上架等级的比例”同处。原 `h1`、`h1sub`、`heroDesc`、`contentDesc`、五条 FAQ、`/contact`、`/cases`、`/product` 和质检关联入口均保持可见。全空仅显示不可用；部分输入保留提供的说明、stats、FAQ 或未知 feature，不生成死 ARIA/hash 引用。

Validation: `npm run typecheck` 为443 files、0 errors、0 warnings、0 hints；`npx vitest run tests/unit/service-redesign-repair.test.ts` 为1 file、2 tests通过；独立 `getViteConfig` + `AstroContainer` 的 `output/.../B/repair-container.test.ts` 为1 file、2 tests通过，覆盖完整、改名 partial 与全空分支。Chromium 定向 `service-redesign-repair.spec.ts` 为2 passed，含非默认异常目录展开、键盘展开 FAQ 与无 JS 下原生 details；受影响 shared service-pages 路由矩阵为1 passed、service-motion reveal 矩阵为1 passed。Prettier/ESLint 与 `git diff --check` 通过。本地浏览器实际查看1440×900、1024×844、390×844、360×800：Hero 标题按三段自然断行，视频/正文不相交，清污侧栏、缝补错位和整烫图片无 caption 覆盖；截图为 `output/playwright/xyy-20260913-13/B/terra-repair-1440.png`、`terra-repair-1024.png`、`terra-repair-mobile.png`、`terra-repair-360.png`。

Known Risks: 首次新增/改名 Astro 组件后，既有4322开发预览的 HMR 模块图未刷新，短暂返回 `FailedToLoadModuleSSR`；确认最新 `astro check` 零诊断后仅重启本地同端口 Astro dev，页面恢复 HTTP 200，未修改端口、项目配置、PM2 或外部环境。B 的 Playwright 命令未设置 `PLAYWRIGHT_PORT`，按现有配置使用4399；没有可复用服务器时，Playwright 的 webServer 隐式执行了本地 `npm run build && npm run start`。因此本轮实际发生过本地 build，虽未手动单独运行 build，也未运行 `npm run verify` 或 `verify:release`。初次并行启动两个共享矩阵使两个隐式 build 争用同一 `dist/.prerender`，出现 CSS rename 与 prerender 模块缺失；修复页定向用例已通过，随后顺序重跑两共享矩阵均通过。完整首次并发 stdout 未在当时重定向落盘，错误摘录、命令及限制见 `output/playwright/xyy-20260913-13/B/terra-e2e-execution.md`。Directus 网络不可用时 E2E 使用既有审核 fallback；未提交、推送、部署或 CMS/数据库操作。后续阶段须先确认4322首页HTTP200，显式 `PLAYWRIGHT_PORT=4322` 并顺序运行共享矩阵。

Handoff: 请 Luna 在1440/1024/390/360独立确认视频完整加载、目录键盘/触屏、三段图片的 loading/布局、九专区完整换行、二检成功率定义和支持统计、FAQ/details/no-JS/reduced-motion、无横溢出及A/其余路由回归；延迟 lazy 图片加载后再判断三张工艺图。请 Nova 复核 `repair` 仅由本路由显式启用、薄分派不改变 A、CMS/SEO/Schema直传、所有 feature/FAQ/stats 的唯一性及 CSS 无旧页泄漏。

Nova rework: `RepairFaq` 替换旧临时共享组件后，`repair.css` 遗留的 `.redesign-faq` 标题、正文、summary 及640px规则未命中实际 DOM。现统一改为 `.repair-faq`，不改变其他布局/内容；1440与390的现有4322计算样式和截图复核确认 FAQ 两个 `h2` 均继承既有大标题规则，且无横向溢出。390截图发现标题末字孤行后，仅在 `.repair-faq h2` 加入 `text-wrap: balance`，平衡 FAQ 与 CTA 标题断行，不影响其他已确认标题。Scoped Prettier与`git diff --check`通过；执行 scoped ESLint 时项目配置对 `.css` 无匹配规则，因此只返回“File ignored because no matching configuration was supplied”的0-error警告，不能表述为 CSS lint PASS。计算样式证据为1440两标题均63.36px/68.4288px、390均35.1px/37.908px，`textWrap: balance`；FAQ section/视口截图在 `output/playwright/xyy-20260913-13/B/terra-faq-fix-balanced-section-390.png` 与 `terra-faq-fix-viewport-1440.png`。未运行 build、typecheck、全站E2E或应用改动。Luna 请定向复测 FAQ desktop/mobile 标题与正文可读性，Nova 请复核选择器实际命中。

### XYY-20260913-13 · 阶段 C：跨境云仓

Status: CODE DONE（阶段 C 本地源码冻结；待 Luna 独立验证与 Nova Review）

Task: 仅将 `/kuajing-yuncang` 改为独立的跨境国内仓内准备与交接页面；阶段 A/B、鞋服页、其余路由和 `/product` 未重做。

Implementation: 路由以显式 `presentation="crossborder"` 进入薄 `RedesignServicePage` 分派；`ServiceLanding` 以 `RedesignPresentation` 类型承接展示分支，CMS 读取、SEO、Schema 和旧页输出未改。新页面依次输出居中价值标题与 16:9 clean Hero 视频、品牌/工厂→国内仓内→外部物流交接边界、标签/包装/QC 三种不等宽字段结构、国内退货 WMS 流程与 Urbanic 旁证、项目支持说明、原生 FAQ 及咨询收尾。边界图用实线国内流转与虚线外部交接，箭头放在列间 gap；手机转为纵向箭头。标题按“把出海前的／国内仓配准备好”语义分段，桌面保持同行，移动端两行；本页 h2 采用 `text-wrap: balance`。

Content mapping: `crossborder-content.ts` 不使用数组索引。仓配→国内仓内、换标换包装→标签模板、项目质检→QC 记录、退货→国内退货、物流→外部交接、项目支持和未知/改名项→支持区；每项完整 title/desc 仅一次，并带 `data-redesign-feature`/子字段。`contentDesc` 独立渲染，不依赖 support feature。三份资料示意含模板确认/目标平台/标签项、包材/包装要求/交接要求、抽检标准/结果记录/复核节点，未伪造条码或报关数据。原 WMS 录入与外部目标接收方语义保留；四项 stats 分别靠近国内仓退货、QC、物流及 Urbanic，未把 24 小时或 AQL 归给案例。全空仅输出不可用状态；FAQ 空时不输出无效 ARIA 引用。

Validation: scoped Prettier check、指派 Astro/TS/E2E 的 ESLint、`git diff --check` 通过；`tests/unit/service-redesign-crossborder.test.ts` 为1 file、2 tests通过；独立 `getViteConfig` + AstroContainer 的 `output/.../C/crossborder-container.test.ts` 为1 file、2 tests通过，覆盖完整/未知 feature、partial contentDesc、FAQ ARIA 和全空分支；确认4322首页 HTTP 200 后以 `PLAYWRIGHT_PORT=4322` 顺序运行 `service-redesign-crossborder.spec.ts --project=chromium`，2项通过（11.4秒，含无 JS）。Playwright CLI 实际查看1440×900与390×844，手机 `scrollWidth=390`、viewport=390，截图在 `output/playwright/xyy-20260913-13/C/terra-crossborder-1440.png` 与 `terra-crossborder-390.png`。`npm run typecheck` 首次报告 readonly 参数和 service-pages Map key 两项本任务类型错误，已最小修复；随后两次检查在本地30秒执行窗口结束前仅到 Astro diagnostics 阶段，未获得完成 PASS 输出，不能将 typecheck 记为通过。

Known Risks: 未运行 build、full verify、提交、推送、部署或 CMS/数据库操作。定向 E2E 使用既有审核 fallback 运行环境；Luna 应独立确认真实完整/partial/empty CMS 输入。类型检查最终完成状态受本地单命令30秒窗口限制，待 Luna/Sol 在可完成的环境复跑。

Handoff: 请 Luna 在1440/1024/390/360检查边界箭头不侵入节点文字、国内实线与外部虚线关系、资料字段层级、视频播放与导航/浮动咨询不相交；验证 FAQ 键盘/触屏/no-JS、WMS/24小时限定语义、6 feature与5 FAQ各一次、四 stats 的邻近归属、unknown/partial/empty 边界以及十一路由回归。请 Nova 复核 `crossborder` 的显式分派、内容分组零丢失、没有旧 Signature/unique/Experience 混入和 CSS 仅作用于本页。

QA rework: Luna 发现 H1 改为语义 span 后，accessible name 在两段间包含空格，旧 exact 连续字符串断言使有 JS 的 Chromium/mobile 两项失败；页面和 ARIA 无缺陷。仅将 E2E H1 名称改为严格的 `/^把出海前的\s*国内仓配准备好$/`，仍要求唯一一级标题和完整两段文字。确认4322首页 HTTP 200 后，显式 `PLAYWRIGHT_PORT=4322` 运行该 spec 的 Chromium 与 mobile 全部项目：4 passed（14.8秒）、exit 0，原始输出在 `output/playwright/xyy-20260913-13/C/terra-h1-test-fix-all-projects.log`；Prettier 与 `git diff --check`通过。Sol 后续完整 typecheck 结果为 exit 0、450 files、0 errors/warnings/hints，记录在 `C/sol-typecheck.log`。未重跑 build、全站测试或应用源码。

### XYY-20260913-11

Status: CODE DONE（静态路径映射冻结；待 Sol 完成受其所有权约束的 clean 素材生成和 Luna 独立验证）

Task: 将十个详情页的 Hero 替换为新的整洁工衣实拍素材；鞋服三阶段与 `/product` 保持。

Scope: 仅改共享 Hero 映射目录、鞋服 Hero 的 MP4/JPG 常量、既有 service-pages Hero 断言目录字面量及本日志。未改变映射目标、类型、模板、布局、文案、CMS/SEO、视频属性、测试结构或鞋服下方阶段媒体。

Implementation: 九个共享详情 slug 继续使用原 basename 映射，统一将根目录从 `/videos/service-detail-heroes-20260913` 改为 `/videos/service-detail-heroes-clean-20260913`。鞋服 Hero 直接映射为新目录的 `xiefu-yuncang.mp4/.jpg`；其入仓、订单与出库三阶段仍指向上一任务的独立媒体。既有九路由矩阵的 `mediaPath` 同步改至新目录，断言对象和其他测试逻辑不变。

Validation: `npx prettier --check`（三个指派源码、测试与日志）、`npx eslint`（指派 TS/Astro/测试）和 `git diff --check` 通过。按纯静态路径合同未运行 typecheck、E2E、build 或 full verify。

Known Risks: 十组 clean MP4/JPG 由 Sol 独占创建；Terra 仅写入路径，尚未验证资源存在、HTTP、视频规格、解码或实际播放，也不将素材写入视为这些结果。未修改的鞋服三阶段仍为上一任务素材。

Handoff: 请 Luna 在 Sol 资产完成后验证20个资源 HTTP 200、10个视频完整解码、十个详情页的桌面/手机实际播放与封面、工衣可见且背景整洁、自动静音循环和无 controls，以及鞋服三阶段和 `/product` 未变。

### XYY-20260913-10

Status: CODE DONE（源码映射冻结；待 Sol 完成媒体生成及 Luna 独立播放验证、Nova Review）

Task: 除独立鞋服页外，为其余九个服务详情页的首屏映射专用实拍视频和对应封面。

Scope: 仅修改共享 `ServiceLanding`、classic/editorial Hero、专用静态映射、首项直接相关的 service-pages Hero 断言及本日志。未改 CSS、服务正文、CMS/claims/SEO、路由参数、脚本、媒体文件或鞋服页和 `/product`。

Implementation: `service-hero-media.ts` 按 slug 映射九个固定 basename 到 `/videos/service-detail-heroes-20260913/` 的同名 MP4/JPG。`ServiceLanding` 不再从 `PRODUCT_VIDEO_SECTIONS` 取详情 Hero 媒体：七个 editorial 页面将映射的 source/poster 传给原分栏 Hero，广州和云道 classic 页面在原 absolute/object-cover、`data-service-hero-media` 位置以同构 video 替换背景 img。未知 slug 未映射时 classic Hero 仍输出原 CMS img。所有九个 Hero 保持原构图与 motion hook、autoplay/loop/muted/playsinline/preload、无 controls，固有尺寸为1280×720；动态 aria 仅使用现有服务标题，未添加地域或实拍事实标签。鞋服 `presentation="footwear"` 分支未读取此映射。

Tests: 既有十路由矩阵保留60秒累计预算、原内容/CTA/overflow断言；对九个非鞋服路由逐一断言新目录的对应 MP4/JPG、video 播放属性和无 controls，同时确认 editorial 仍使用分栏 Hero。未添加镜像单测。

Validation: `npx prettier --write`及随后`--check`（全部指派源码、测试与日志）通过；`npx eslint`（指派 Astro/TS/测试）通过；`npm run typecheck` 为421 files、0 errors、0 warnings、0 hints；`git diff --check` 通过。指派文件行数为 ServiceLanding 167、classic Hero 74、editorial Hero 44、映射 TS 30、测试 162，均在任务预算内。未由 Terra 运行完整浏览器矩阵、build 或 full verify。

Known Risks: 新九个 MP4/JPG 由 Sol 独占创建，本次仅固定引用，Terra 不将映射写入或后续文件存在视为 HTTP、解码或可播放证据；尚未独立验证实际九页桌面/手机播放。未映射的未来 editorial slug 会走既有 classic img 分支，保持不引入未知视频。

Handoff: 请 Luna 在资产完成后验证九资源对 HTTP 200、1280×720/30fps/H264/yuv420p/faststart/无音轨和完整解码，九页1440/390的实际自动静音循环、poster/source匹配、广州/云道的背景式构图、无 controls/溢出；运行相关 service-pages 矩阵并确认鞋服和 `/product` 无新目录引用。请 Nova 复核映射完整性、未知 slug img 回退、CMS/Schema/链接无改动和 CSS/脚本边界。

### XYY-20260913-09

Status: CODE DONE（静态路径映射冻结；待 Sol 完成受其所有权约束的媒体写入及 Luna 独立播放验证）

Task: 仅将 `/xiefu-yuncang` 的 Hero 与三个履约阶段改指向鞋服详情专用实拍视频和对应封面。

Scope: 仅修改 `FootwearPage.astro`、`FootwearHero.astro`、`FootwearFulfillment.astro` 的静态视频 source、poster 与固有尺寸，并记录本日志。未改文案、CMS availability/metadata、标签、切换逻辑、CSS、脚本、媒体文件、测试或其他页面。

Implementation: Hero 现在使用 `/videos/footwear-detail-20260913/hero-overview.mp4` 和同名 JPG；入仓、订单、出库阶段依次使用 `inbound-receiving`、`order-picking`、`outbound-packing` 的同目录 MP4/JPG。四个 video 元素均设为 `width="1280" height="720"`，保留原 autoplay、loop、muted、playsinline、preload、无 controls 与既有阶段绑定。已移除这三份组件对 `warehouse-sections-20260911` 视频的引用，且 Hero 不再使用不匹配的 CMS 图片作为视频封面。

Validation: `npx prettier --check`（三份指派 Astro 与本日志）、`npx eslint`（三份指派 Astro）和 `git diff --check` 通过。未按合同运行 typecheck、E2E、build 或 full verify。

Known Risks: 本次仅写入引用路径；新文件由 Sol 独占创建，Terra 不将当前或后续文件存在性视为自身媒体可播证据。尚未验证 HTTP、视频解码、桌面/手机播放或阶段切换中的实际媒体输出；本地改动不代表已部署。

Handoff: 请 Luna 在 Sol 资产就绪后确认四个资源 HTTP 200、均为1280×720且可完整解码，Hero/入仓/订单/出库实际播放对应独立片段，桌面1440和手机390的自动静音循环、无 controls、封面和三阶段切换保持正常；同时确认 `/product` 未引用这些详情资源。

### XYY-20260913-08

Status: CODE DONE（本地实现冻结；待 Luna 独立验证与 Nova Review）

Task: 仅为 `/xiefu-yuncang` 重做独立的七段式鞋服云仓页面，其他服务详情和 `/product` 保持既有输出。

Scope: 新增 `footwear` 展示分支、鞋服专用组件/样式/渐进增强脚本及直接相关测试。未改 Directus 查询、claims、旧服务组件/样式/脚本、媒体文件、其他路由、依赖或外部环境。

Implementation: `ServiceLanding` 只读取一次 CMS 内容并保留既有 metadata、canonical 与 JSON-LD；鞋服路由显式使用 `presentation="footwear"`。新页面以独立 `.footwear-page` article 组织七个区域：短文案加原概览视频 Hero、透明货品图的款色码管理、并行订单来源到统一库存再到并行出库方式的渠道图、三阶段七步骤履约视频、集中展示 CMS stats 的保障、三种适配情形与原 CMS 背景说明、原 FAQ 和咨询收尾。六条 CMS features 通过关键词分到货品/渠道/保障/适配，并将未知项保留在适配区，不依赖固定索引也不重复或丢失字段。Hero 仅显示批准的短说明，原 `heroDesc`/`contentDesc` 各保留一次在适配区；CMS 成功的空内容只输出不可用状态，不复活静态业务内容。履约页无 JS 时三阶段均可读，加载脚本后支持点击及方向/Home/End 键切换。手机渠道图以来源组→中心→出库方式组表达，避免把三个来源串联；适配和收尾标题使用语义整行且继承标题字号，避免拆开“订单”。

Validation: `npx prettier --check`（所有指派源码和测试）通过；`npx eslint`（指派 Astro/TS/测试）通过；`npm run typecheck` 为420 files、0 errors、0 warnings、0 hints；`npx vitest run tests/unit/footwear-content.test.ts` 为1 file、2 tests通过；`git diff --check` 通过。新增 Astro（35–97行）、CSS 模块（75–187行）、TS（19/31行）及新增测试（24/47行）均在任务预算内。未由 Terra 运行 E2E、build 或 full verify。

Known Risks: Terra 未执行浏览器 E2E，也未作独立媒体播放、390/360/1024/1440 截图复测；本地修改不代表已部署。Sol 的冻结前只读语义对比已确认11个本地路径 HTTP 200，鞋服 metadata/Schema、六项 feature 与五条 FAQ 完整保留，且十个控制页无内容差异；该结果不是 Terra 的独立验证。

Handoff: 请 Luna 检查 `/xiefu-yuncang` 在1440、1024、390、360下七区构图、无横向溢出、桌面渠道连线与移动组级流向、Hero/履约视频属性和交互、键盘切换、reduced-motion/no-JS 可读性、全部 CMS feature/FAQ 各一次及其他服务和 `/product` 无回归。请 Nova 复核 `footwear` 分支的 CMS 空内容处理、Schema/metadata 不变、无旧模块混入及 CSS 作用域。

### XYY-20260913-07

Status: CODE DONE（本地实现冻结；待 Luna 独立 E2E/浏览器验证与 Nova Review）

Task: 八个服务详情页采用统一的白底编辑视觉语言，同时按服务内容保留各自的叙事顺序与特色模块。

Scope: 仅更新共享 `ServiceLanding` 的显式 `editorial` 展示分支、新的编辑式 Hero、局部服务样式、八个指定路由的展示参数、直接受影响的服务 E2E 断言和本日志。未改 CMS 读取与回退、claims、既有特色组件、共享导航/Footer、媒体文件、`/product`、依赖或外部环境。

Implementation: `ServiceLanding` 新增默认 `classic` 的 `presentation` 参数，仅八个指定路由传入 `editorial`，广州与云道等其他详情页仍输出原 Hero 与原模块顺序。编辑式 Hero 使用左侧原 CMS 标题、副标题、说明和原“免费获取方案 / 查看全部产品”链接，右侧按既有 `PRODUCT_VIDEO_SECTIONS` href 匹配的自动静音循环 MP4；`content.imgSrc` 作为视频 poster，视频仍以服务标题提供无障碍名称，不把旧图片的 `imgAlt` 新增为视频正文。原 metadata、canonical、JSON-LD、FAQ、ServiceSignature、unique 插槽、ServiceExperience、reveal 标记和服务脚本均继续使用同一解析后 `content`。

Layout differences: 鞋服云仓按 Signature → 标准七步流程，桌面服务点为四列；退货质检按四级分流示例 → Signature，服务点为纵向诊断步骤；后整修复按 Signature → 修复工位与工单，服务点为双列；跨境按正逆双链路 → Signature，服务点为双列；华南按 Signature → 多仓协同图，华东按 Signature → 覆盖表，两者服务点均为双列；直播按场次挑战/平台适配 → Signature，服务点保持三列；B2B按对比与门店补货场景 → Signature，服务点为双列。八页随后均保留原 FAQ 与咨询入口；900px 以下网格自然收至两列，640px 以下单列，退货步骤同步缩窄编号列。

Tests: `service-pages` 现区分八个 editorial 路由与两个 classic 路由，锁定编辑容器、一个无 controls 的 autoplay/loop/muted/playsinline 视频、MP4 source、特性列表及 classic 不出现编辑容器；`service-motion` 在移动鞋服页锁定同一视频属性，原 reveal/reduced-motion 断言保留。

Validation: `npx prettier --write`（指派 Astro/CSS/测试文件）通过；`npx eslint`（指派 Astro/路由/测试文件）通过；`npm run typecheck` 为 409 files、0 errors、0 warnings、0 hints；`git diff --check` 通过。本次新增/修改的 Astro/CSS 均低于180/200行预算；全仓 `npm run check:maintainability` 仅因范围外既有 `src/styles/product/video-sequence.css`（254/200）和 `tests/e2e/home-product.spec.ts`（312/220）失败，未越权修复。本地 4322 SSR 回读八路由均成功，并用任务基线 `extract-content.py` 对比 signature、unique、features、FAQ、CTA、H1、Hero 文本、title、description、canonical、JSON-LD 共 11 类字段，全部一致；另确认八个编辑视频均有 autoplay/loop/muted/playsinline/poster 且无 controls，广州/云道为 classic 分支。未由 Terra 运行 E2E、unit、build 或 full verify。

Known Risks: Terra 未独立进行八页 1440×900/390×844 截图、交互、reduced-motion/no-JS 或实际媒体播放检查；Tailwind 写入的既有 unique 模块保持其业务图表和局部色彩，需确认它们与新的白底外层留白协调。本地修改不代表已部署。

Handoff: 请 Luna 运行 `service-pages`、`service-motion` 与指派 CMS 只读契约测试；在八页 1440×900、390×844 核验白底 Hero 的文案/CTA/视频 poster、无横向溢出或导航遮挡、八种模块顺序与特色内容、FAQ/咨询入口、移动菜单、reduced-motion/no-JS。请 Nova 复核只由 `presentation="editorial"` 启用八路由、非目标 classic 页面以及 CMS/Schema/内容契约保持。

QA rework: Luna 的浏览器、语义、保护 hash、reduced/no-JS 与单测证据均通过；Playwright HTML reporter 实际为3 passed、2 failed、1 skipped，两个失败均为10路由和9路由矩阵在尾段累计超过默认30秒，并非单路由或断言失败。仅在这两个矩阵 test 开头设置60秒总预算，保留所有单个 expect 超时、skip、全局配置和应用源码。Terra 已完成格式/lint/diff 检查，未重跑 typecheck、完整 E2E、build 或 full verify；请 Luna 只复测这两个 Chromium 矩阵，若仍超过60秒则报告具体阶段。

### XYY-20260913-06

Status: CODE DONE（本地 CSS 实现；待 Luna 独立两端视觉验证）

Task: 按用户最新要求为八段视频上的 copy 增加轻微文字阴影。

Scope: 仅在 `video-sequence.css` 的 `.product-video-sequence__copy` 增加指定属性，并记录本日志。未改文案、字体、颜色、布局、链接、媒体、导航或第九区。

Implementation: `.product-video-sequence__copy` 现使用 `text-shadow: 0 2px 6px rgb(0 0 0 / 0.45)`，因此标题、说明、要点和 CTA 均继承同一阴影；未新增背景、遮罩、滤镜或其他规则。

Validation: `npx prettier --check src/styles/product/video-sequence.css` 与 `git diff --check` 通过。按纯视觉 CSS 合同未运行 lint、typecheck、E2E、build 或 full verify。

Known Risks: Terra 未独立检查桌面/手机实际画面；阴影在不同视频亮度下的视觉效果待 Luna 确认。本地修改不代表已部署。

Handoff: 请 Luna 在1440×900与390×844确认八屏标题、说明、要点和橙色 CTA 均继承指定阴影，第九区无新增阴影，且无布局变化或新遮罩/滤镜。

### XYY-20260913-05

Status: CODE DONE（本地实现；待 Luna 独立 E2E 与浏览器验证）

Task: 将用户批准的八屏服务标题、正文及三项服务要点接入视频叠字，保留原详情入口与第九区。

Scope: 仅更新指派的 `video-sections` 数据、八屏 copy 渲染、copy 局部样式、直接受影响的 home-product E2E 和本日志。未改第九区、媒体、详情页、导航 JS、claims、CMS/数据库、依赖或外部环境。

Implementation: 八条 `PRODUCT_VIDEO_SECTIONS` 逐字采用批准稿的价值标题、两句说明和各三项要点；组件在既有正文和原橙色详情链接之间渲染语义 `ul/li`。样式保持居中白字、无遮罩/背景/阴影，正文最大宽度收至48rem；小于等于600px时调整左侧空间、说明16px、要点与 CTA 间距，短横屏进一步压缩要点间距与字号，维持固定胶囊安全距离。原8视频/媒体/ID/href/1H1+8H2、9分区和第九区 header 均未变。E2E 逐项锁定八个批准标题、正文和24条要点，以及既有视频/详情映射。

Validation: 指派代码的 Prettier、scoped ESLint、`npm run typecheck`（407 files，0 errors / warnings / hints）和 `git diff --check` 通过。以批准稿进行本地只读匹配，确认8段标题与正文及24条要点均在数据源码中逐字存在。按任务流程未由 Terra 运行 E2E、build 或 full verify。

Known Risks: Terra 未独立在1440×900、390×844、360×640或844×390浏览器验证长文案的实际折行和可见性；需由 Luna 复测既有 E2E 与视觉交互。本地修改不代表已部署。

Handoff: 请 Luna 运行 home-product/product-motion 相关8项E2E，并在桌面、390×844、360×640和844×390检查每屏标题/正文/三要点/原 CTA 完整可见、无横向溢出或与固定胶囊相交；同时确认08/09至09/09及静态保障区保持。

Mobile heading rework: 每个八屏标题现在按第一个中文逗号拆为相邻的 prefix/value span，数据原字符串、可访问名称和完整 DOM 文本不变；桌面 span 保持 inline，600px及以下 prefix 独占一行且 `nowrap`，value 在下一行自然平衡，防止“让多 / 渠道”及“B2B门店仓 / 配”断开服务名。仅修改八屏标题渲染和其局部 CSS；Prettier、scoped ESLint、`git diff --check` 通过。使用本地4322 SSR只读确认首屏两相邻 span 的拼接文本无空格且完整。未重跑 typecheck、E2E、build 或 full verify；请 Luna 仅复测受影响的手机标题折行和640高可达性。

### XYY-20260913-04

Status: CODE DONE（本地静态实现；待 Luna 独立视觉验证）

Task: 按用户最新截图重排第九区“能力与保障”的标题和说明，移除英文标签，其他内容保持。

Scope: 仅更新 `ProductAssurance` 的 header 内部、`video-assurance.css` 的标题/说明局部规则和本日志。未改第九区容器、shell/section padding、指标、机制、视频、导航、测试、数据、JS、依赖或外部环境。

Implementation: 标题现在位于 header 首位，桌面采用左侧约2份标题、右侧约1份两段说明；英文 `CAPABILITY & ASSURANCE` 已从 DOM 删除。H2 保留原两行语义、中文逐字不变，调整为 `clamp(2.4rem, 4.2vw, 4.3rem)`、`-0.04em` 字距和1.15行高。说明拆成原有两句并移除顶部空隙；小于等于1000px时自然变为标题在前、说明在后，既有小于等于760px的标题尺寸和其他内容布局不变。

Validation: `npx prettier --write src/components/product/ProductAssurance.astro src/styles/product/video-assurance.css`、`npx eslint src/components/product/ProductAssurance.astro` 与 `git diff --check` 通过。按纯静态合同未新增测试，也未运行 typecheck、E2E、build 或 full verify。

Known Risks: Terra 未进行浏览器截图或独立交互验证；桌面/手机标题与说明几何、09/09可达性及其余第九区内容保持情况待 Luna 独立确认。本地修改不代表已部署。

Handoff: 请 Luna 在1440、1024、390与360检查英文标签不存在、标题左说明右及窄屏先标题后说明、中文完整、无横向溢出/相交，并确认八视频、九分区、固定胶囊和 `09 / 09` 可达性保持。

### XYY-20260913-03

Status: CODE DONE（本地实现；待 Luna 独立 E2E 与视觉验证）

Task: 在 `/product` 八段服务视频后追加截图指定的静态“能力与保障”第九分区，并接入既有单一滚动容器和分区导航。

Scope: 仅修改指派的 `ProductVideoSequence`、新局部保障样式、两份既有产品 E2E 和本日志。未修改八视频、视频数据/媒体/详情映射、原保障组件/数据/CSS、导航脚本、共享组件、CMS/数据库、依赖或外部环境。

Implementation: 第九分区复用 `ProductAssurance`、其四项指标、五项机制和既有 SVG；外层使用 `data-product-video-slide`，`min-height: 100dvh`、`height: auto` 与可见溢出，不建立内部滚动层。胶囊初始总数为 `01 / 09`，无障碍名称更新为页面分区导航、上一个区域和下一个区域。新 `video-assurance.css` 仅在静态 wrapper 内导入原保障样式并补足原产品变量、shell、kicker、桌面右侧胶囊安全留白；小于等于760px时预留右侧空间，指标缩小并保持两列，机制单列。E2E 保留八视频和精确媒体/详情断言，新增九分区、八个 H2、四指标、五个机制 SVG、`09 / 09` 末尾禁用、`08 → 09 → 08` 与滚至最后机制的检查。

Validation: 指派源码与测试的 Prettier、scoped ESLint、`npm run typecheck`（407 files，0 errors / warnings / hints）及 `git diff --check` 通过。按任务合同未运行 E2E、unit、build 或 full verify。

Known Risks: Terra 未独立运行浏览器/E2E；第九区较长时的真实触摸滚动、手机菜单叠层、reduced-motion 与最后机制可达性仍待独立验证。本地修改不代表已部署。

Handoff: 请 Luna 在4322运行 `home-product` 与 `product-motion`，于1440×900、1849×907、1024×768、390×844与360px确认九分区/八视频、SSR `01 / 09`、第八至第九及返回第八、末尾禁用、最后机制在同一容器内可达、手机菜单和 reduced-motion 正常，且无横向溢出、文字或固定胶囊遮挡。

### XYY-20260913-02

Status: CODE DONE（本地实现；待 Luna 独立 E2E 与视觉验证）

Task: 将 `/product` 的七段服务视频入口扩充为按既有 editorial 八项顺序对应的八段，每段链接至唯一原服务详情页。

Scope: 仅更新指派的视频数据、视频组件总数、三份既有直接受影响测试和本日志。未改 CSS、导航 JS、共享导航、详情页、媒体文件、CMS/数据库、依赖或外部环境。

Implementation: `PRODUCT_VIDEO_SECTIONS` 现在以鞋服云仓、退货质检、后整修复、跨境云仓、华南鞋服云仓、华东鞋服云仓、直播电商仓配、B2B 门店仓配的八项顺序输出；描述精确复用 editorial 既有描述。首段保留 `01-overview`、既有 H1 及 `aria-labelledby` 兼容性，其他七段为 H2。旧媒体使用 `01-overview`、`04-inspection`、`05-refurbishment`、`02-storage`、`03-picking`、`06-packing`，跨境与 B2B 分别引用 Sol 冻结的 `outbound-loading` 与 `order-distribution`；不再引用 `07-dispatch`。胶囊初始总数从数据长度计算为 `01 / 08`。既有 E2E 现锁定 8 段、8 个 ID、每个精确媒体路径及八个唯一服务链接映射；资源契约锁定六条旧路径、两条新路径和四个新增实际文件。

Validation: 指派文件的 Prettier 与 scoped ESLint 通过；`npm run typecheck` 为 407 files、0 errors、0 warnings、0 hints；`npx vitest run tests/unit/image-cache-contract.test.ts` 为 1 file、24 tests PASS；`git diff --check` 通过。Sol 新媒体完成后，资源目录中四个 MP4/JPG 均非空；1145 项保护 hash 核验为 0 项变化、0 项越界。本任务未运行 E2E、build 或 full verify。

Known Risks: 尚未由独立角色实际访问八个详情页，或在桌面/手机浏览器核验八屏、首尾胶囊和 reduce 动作；本地实现不代表已部署。

Handoff: 请 Luna 运行 `home-product` 与 `product-motion` 既有 E2E，在桌面与手机确认 8 段、8 个详情链接可访问、`01 / 08` 至 `08 / 08`、首尾禁用、手动滚动与 reduced-motion 保持；并检查无遮罩居中文字、Header/胶囊遮挡和横向溢出。

Rework after Luna E2E FAIL: `home-product` 的媒体属性循环原以 `#${id}` 组合动态选择器；`01-overview` 等数字开头的 ID 不符合未转义 CSS ID 选择器语法，导致 Chromium 与 mobile 在首条属性断言前失败。现仅改为合法属性选择器 `[data-product-video][id="${id}"]`，八个 ID、媒体映射和全部属性断言保持。按返工 Scope 未重跑 typecheck、unit 或 E2E，待 Luna 仅复测此前失败用例。

### XYY-20260908-03

Status: CODE DONE（本地实现；待 Luna/Nova 独立验证）

Task: 将全站栏目入口由“森林期刊”迁移为“供应链白皮书”，规范 URL 为 `/supply-chain-whitepapers/`，并保留旧刊物资源和旧栏目页的永久重定向。

Scope: 仅变更派发的共享导航、旧/新栏目页、H1、新闻入口、sitemap/llms 条目和三份既有 E2E；未改 CMS/FAQ key、刊物数据、PDF/cover 路径、种子、Nginx、全站 trailing-slash、业务逻辑或外部环境。

Implementation: `NAV_LINKS` 的统一 desktop/mobile/footer 项精确改为 `供应链白皮书` 与 `/supply-chain-whitepapers/`。新页在无尾斜杠时先于 CMS 读取永久重定向，并以新 URL/title/canonical/breadcrumb 展示；保留 `getFaqs('senlinqikan', ...)`、刊物 ItemList 名称/描述、14 期和现有刊物文案。旧 `/senlinqikan` 页面仅 301 到新规范地址并保留 query，不影响 `/senlinqikan/pdf/*` 和 `/senlinqikan/covers/*` 静态资源。新闻入口只改 href，保留期刊名称/封面/内容。sitemap 和 llms 栏目条目同步新 URL/标签。

Validation: 已更新三份允许的 E2E，覆盖新 H1/title/canonical、desktop/mobile/footer 导航、新闻入口点击、旧无斜杠/旧尾斜杠/新无斜杠三种 301 与 query、sitemap/llms 和旧 PDF/cover 保护。`npx astro check`：388 files / 0 errors / 0 warnings / 0 hints；定向 ESLint 和 `git diff --check` 通过。在 Sol 提供的隔离 Astro dev 4322 上，Playwright CLI 手工确认新规范页 200、标题/H1 和 canonical 尾斜杠，以及 14 期刊内容与旧 PDF URL 保留；Sol 已在同一隔离服务预检三类带 query 的 301 目标正确。未自行 build、未触碰 4321 PM2 或外部环境；E2E 仍由 Luna 独立执行。

Known Risks: 尚无 Luna 独立 E2E 或新构建产物的完整回归结果；本地代码完成不代表已发布或正式域名已变更。

Handoff: 请 Luna 在协调后的本地测试服务器验证新页 200、三类 query-preserving 301、14 个 PDF/cover、桌面/移动 active 与无横向溢出；请 Nova 复核不应改动的 FAQ key、刊物 ItemList 身份/描述及静态资源路径均保留。

SSR redirect-loop rework (HIGH): Luna 在 SSR 4399 发现全局去尾斜杠的 canonical middleware 与页面的补尾斜杠 redirect 形成循环。请求策略在安全剥除 leading separators 后，对新栏目仅精确保留/归一到 `/supply-chain-whitepapers/`；`LEGACY_PATH_REDIRECTS` 为 `/senlinqikan` 与 `/senlinqikan/` 均直接映射至该 URL，避免旧尾斜杠两跳，且不使用 prefix 映射，故 PDF/cover 资源不受影响。先新增单测并以旧实现获得 4 个预期失败；最小修复后 `npx vitest run tests/unit/request-policy.test.ts` 为 1 file / 10 tests PASS。未运行 build、E2E、正式域名契约或外部操作；后续由 Luna 独立复测 SSR/正式 origin 契约。

### XYY-20260908-04

Status: CODE DONE（本地文案与 Seed；待 Luna/Nova 独立验证和 Sol 授权 CMS 同步）

Task: 优化供应链白皮书页的顶部读者价值文案与 8 条 FAQ，使可见内容、JSON-LD 和本地 CMS 种子使用同一审核稿件；不改变原刊、资源或 CMS 读取策略。

Implementation: Hero 明确鞋服品牌、电商运营与供应链团队的阅读场景，并保留既有 PDF 链接/新窗口行为和目录锚点。页面更新 title、description、FAQ heading 及 ItemList 资料目录身份，目录说明目前收录《森林期刊》，但每期期刊名称、14 个 PDF/cover 路径和 `getFaqs('senlinqikan', PUBLICATION_FAQS)` 均保留。原 `faq-senlinqikan-01` 至 `08` 原位重写为授权的定义、读者、问题、应用、获取、核验与更新问答；用 `npm run cms:generate-faq-seeds` 生成，Seed 差异仅为这 8 条的 question/answer，未执行 CMS/数据库操作。

Validation: 先新增内容契约测试，旧内容得到 3 项预期 RED；实现和生成后 `npx vitest run tests/unit/publication-copy.test.ts` 通过。该测试锁定 8 条审核文案、content key/page key/sort、种子一致性，以及 PageFAQ 和 JSON-LD 继续使用同一 `faqs` 对象。既有 E2E 增加 FAQ 标题、手风琴打开与可见首问答同 JSON-LD 的检查；未运行 build、Playwright 或 E2E，以避免与本地 dist 并发，后续由 Luna 独立执行。

Known Risks: 本地页面在 CMS 返回非空 FAQ 时仍将按既有 `getFaqs` 规则展示 CMS 内容，因此本地 Seed 不代表新 FAQ 已在 CMS 上线；Sol 持有精确 8 条的本地同步授权和执行责任。未做视觉/移动实测或外部发布。

Handoff: 请 Luna 复测桌面/移动 Hero 无横向溢出、FAQ 手风琴可开关，并确认 SSR 页面中可见问答与 JSON-LD 同源；请 Nova 审核文案不含效果、排名、固定周期或未经核验的承诺，并确认 Seed 仅变 8 条既有身份。

Hero copy rework (LOW): 用户确认采用精确介绍段“新亦源供应链白皮书聚焦鞋服行业，分享云仓运营、退货质检、直播仓配与数字化管理的一线经验，为品牌、电商及供应链团队提供仓配选型、流程优化和团队培训的实用参考。”，替换原 Hero 介绍段并明确不含“汇集《森林期刊》”。先更新精确断言，旧稿得到 1 项预期 RED；替换后 `npx vitest run tests/unit/publication-copy.test.ts` 为 1 file / 3 tests PASS。未变更 FAQ、Seed、CMS、页面元数据、路由、样式、按钮或外部环境。

### XYY-20260908-05

Status: PHASE 1 CODE DONE（第14期样板；待 Sol 内容检查后才扩展其他期）

Task: 为供应链白皮书建立离线 PDF 转换、结构化内容和共享 HTML 阅读页；本阶段只完成《森林期刊》第14期完整样板，不批量转换其他期。

Implementation: 新增 development-only PyMuPDF 转换器，按审核的印刷页 2、3、8、14、20、23、27、29、31、33、35、37 的 12 篇真实文章边界生成 `14.json`。每个 block 保留物理页、印刷页、左右半页及坐标；跨页先左后右、半页内按栏后按纵向读取。保留原署名/转载来源（数字100、中国服装协会）、历史年份/数字与原 PDF SHA-256；对 p12–13 的矢量图解和 p19–20 的多列名单写 review-note，不猜写缺失内容。提取 10 张局部图表/照片，不以整页或整半页栅格图代替正文，均标示原刊位置及未提取图中文字边界。

Implementation: 新增共享 `WhitepaperArticle` renderer、长文样式、`/supply-chain-whitepapers/[issue]/` SSR route、types/loader。14 期为唯一可用 issue；其他或格式错误 issue 返回 404。`server/request-policy.mjs` 仅为 `/supply-chain-whitepapers/14` 补单次尾斜杠 301，未知数字路径保持给 Astro 404；既有根栏目、旧栏目、主机与前导分隔符规则不改。阅读页使用独立 HTML canonical、目录、首尾原 PDF 下载和返回栏目；历史原刊声明明确不将旧数据升格为当前 KPI/承诺。

Validation: 新增内容测试（12 篇边界、source hash、每 block source、署名、局部图资源、未知 issue）与转换器 contract 测试。`npx vitest run tests/unit/whitepaper-content.test.ts tests/unit/request-policy.test.ts`：2 files / 14 tests PASS；`/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python tests/whitepapers/convert_issue.test.py`：1 test PASS；`npx astro check`：394 files / 0 errors / 0 warnings / 0 hints；定向 Prettier、ESLint 与 `git diff --check` 通过。未运行 build、E2E、浏览器或全量 verify。

Known Risks: 第14期 p12–15 图解大量为矢量轮廓字，局部图已保留但图中文字未逐项转写；p18 右侧 22 人储备干部表与 p19–20 多列奖项名单的逐行配对仍需对照原 PDF 审核。未把这些不确定内容写成正文。内容尚未在本地预览或 SSR 中实际点击检查，且只完成 14 期样板，其他期不应被视为可用。

Handoff: 请 Sol 先审核第14期 12 篇阅读顺序、图像裁切和 review-note 后再授予批量转换范围；请 Luna 独立检查 14 HTML、移动长文、`/14` 301/`/14/` 200、未知期 404、原 PDF 下载/HTML canonical 及不确定表格的准确边界；请 Nova 审核 source-traceability、历史数据声明和 canonical 安全改动。

Native-layout rework: 第14期转换改为 `scripts/whitepapers/native/native_layout.py` 中逐物理页/印刷页的可审计 region manifest，以及 line/span 级提取器；仅出口报道（印刷页3–7）按真实栏区读取，其余单栏、上下图文和名单页不再以固定 x 网格重排。12 个 section 使用 PDF 原长题；出口篇保留“形势综述→贸易数据→市场分析”，产品升级篇从“过去几年，鞋服行业持续处于高频上新、快速迭代和竞争加剧的环境中”开始，校企篇顺序为合作共识→会前座谈→6月16日供需见面会→合作结语。H3 采用逐篇审核白名单，避免将大字号正文误标为标题（兴泰篇只保留4个真实小标题）。

Assets rework: 41 张有内容价值的图表、照片、名单和无文字层图解均按真实 embedded-image 或审核 crop 边界重新生成并在对应印刷页正文后插入；修复会议合影、校企合影/招聘现场、出口趋势图、产品适配图和22人名单的截断。印刷页33名单、35–36各奖项名单保留为局部原图，未重新拼配姓名/仓库；待核查只指向相应图表区域。未改原 PDF、OCR 目录、CMS、DB、外部环境或发布配置。

Validation rework: `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python tests/whitepapers/convert_issue.test.py` PASS（真实重生成、12边界、阅读顺序、41图源）；`npx vitest run tests/unit/whitepaper-content.test.ts` PASS（4 tests）；`npx astro check` PASS（394 files，0 errors / 0 warnings / 0 hints）；Python `py_compile`、`git diff --check` 通过。未运行 build、full verify、浏览器或部署；请 Luna 独立核验长文桌面/手机阅读、图像裁切、TOC、下载 PDF、canonical 和404/301，再由 Nova 复核 source traceability/标题及历史信息边界。

Final correction: 顶部 eyebrow 改为“供应链白皮书”，首尾下载按钮统一为“下载 PDF 原版”，来源行仍保留原刊名和封面日期。印刷页33将22人名单的排除区域收紧至表体，恢复其前完整引导句“经过资质核验、综合面试、综合能力研判等多环节严格筛选，以下22位伙伴正式入选启明星储备干部（第二期）培养名单（排名不分先后）：”；名单图仍仅覆盖表体。最后一次重生成确认该句存在、名单 figure bbox 为 `[655, 515, 1148, 770]`，随后 `npx astro check` 与 `git diff --check` 再次通过。

Phase 1 rework: 转换器改用 PyMuPDF `dict` 的 line/span 文本而非 PDF block 直接输出；保留短文字，以中文/数字间距清理修复断字，移除数字即 H3 的猜测规则，并按半页显式区域合并连续段落。第14期重新生成 355 个语义段落/图文 block，补全跨境页 p20–23 的定位图解，review-note 只保留 p12–13 图解与 p19右奖项名单等确切不可靠区域。figure 增加 caption、width、height；阅读页补段距、图注、锚点偏移，移除“本阅读页链接”、PDF 按钮改为“下载 PDF 原版”。转换器 contract 现验证实际输出包含跨境首句、清理后的“数字100”且无碎字。定向 Vitest 14/14、Python test、Astro 394 files 无诊断及 diff 检查通过；未运行 build/E2E。其他期 OCR 预处理目录不属于 Terra 所有权，未读取或修改。

### XYY-20260908-01

Status: DONE（本地依赖安全修复；未部署）

Task: 修复发布前 `npm audit --omit=dev` 的 `qs` 与 `sanitize-html` moderate 依赖告警，不改变富文本清洗逻辑或白名单。

Scope: 仅修改 `package.json`、`package-lock.json`、`tests/unit/sanitize.test.ts` 和本日志；未修改 `src/lib/sanitize.ts`、其他依赖、业务代码、已暂存文件、部署或外部环境。

Implementation: 直接依赖 `sanitize-html` 升级为 `^2.17.7`；根级 npm override 固定传递依赖 `qs` 为 `6.16.0`，使 Express/body-parser 与 Lighthouse 依赖树统一使用安全版本。锁文件仅更新这两项和 `sanitize-html` 2.17.7 所需的 HTML parser 子树。补充白名单富文本结构/`mailto:` 链接保留回归，以及 SVG、`textarea`、XMP 绕过载荷移除回归；未扩张任何 allowed tags、attributes 或 schemes。

Validation: 先用旧依赖执行 `npx vitest run tests/unit/sanitize.test.ts`，6 tests PASS；执行 `npm install --ignore-scripts --no-audit --no-fund`，退出 0（added 5 packages, changed 2 packages）；更新后 `npm ls qs sanitize-html --all` 显示所有 qs 为 6.16.0、sanitize-html 为 2.17.7。`npx vitest run tests/unit/sanitize.test.ts` 6 tests PASS；`npx astro check` 为 387 files / 0 errors / 0 warnings / 0 hints；package/lock/test 的 Prettier、test ESLint、`npm audit --omit=dev`（found 0 vulnerabilities）及 `git diff --check` 均通过。

Known Risks: `sanitize-html` 2.17.7 引入其必需的 HTML parser 锁文件子树变化；本任务没有改清洗实现。未运行全量 `npm run verify` / `verify:release`、未提交、推送或部署，后续由 Sol/Luna/Nova 按 HIGH 闸门独立验证。

Handoff: 请 Luna 复核 lock diff 仅为 qs 6.16.0、sanitize-html 2.17.7 及其必需子树，复测 audit=0 和 SVG/textarea/XMP 安全处理；请确认白名单与 `src/lib/sanitize.ts` 未改。

Security regression refinement: SVG 样例改为公告形态的 `animate attributeName="href" values="#safe;javascript:..."`，断言无 SVG/animate/`javascript:`；textarea 样例改为 `</textarea/>` 字面闭合后跟随 img，断言 textarea/onerror/活动 URI 移除，同时允许既有安全 img+`loading=lazy` 保留；XMP 断言仅危险标签移除。`qs` 以根级精确 override 固定为 6.16.0：上游 Express/body-parser 的 `qs` 范围（含 `~6.15.1`）仍指向受限旧版，单纯更新直接依赖不能保证消除全部树上的 audit 告警；override 使所有实际解析树节点采用修复版。`sanitize-html` 2.17.7 所需 HTML parser 子树是必要传递 lock 变化，非额外依赖升级。

### XYY-20260905-01

Status: DONE

Task: 从 GPT-6 提示工程原则优化项目级 `AGENTS.md` 执行规则。

Scope: 仅重写 `AGENTS.md`，明确权限来源、任务合同、风险闸门、验证证据、协作边界及生产授权；不改运行配置、业务代码、`DEV_STATE.md` 或生产系统。用户已明确意图由 GPT-6 调度 GPT-5.6 系列角色，但 `.codex` 配置由 Sol 单独处理。

Implementation: 按规则来源、范围、安全、协作、风险、验证、生产边界和交付组织规则。Sol 明确由 GPT-6 主会话调度 GPT-5.6 系列角色，但以实际会话/配置生效为准；补充最小 Scope/可测 AC、授权目标/动作/环境匹配、只读诊断不自动修复、可逆已授权工作连续执行、独立闸门与并行条件。保留 Directus/claims、空内容与失败关闭语义、禁止 Oracle 历史事项复活，以及所有生产、外部写入和 Secret 边界。

Changed Files: `AGENTS.md`、`docs/TERRA.md`。

Validation: `git diff --check` 通过；人工核对现有 Sol → Terra/Luna/Nova 层级、MEDIUM/HIGH 流程、`npm run verify` / `npm run verify:release` 强制门槛、生产显式授权和 CMS 回退约束均保留。未运行应用测试：本次仅 Markdown 治理文档，未改行为代码。

Known Risks: `docs/SOL.md` 历史模型映射由 Sol 另行最小澄清；本任务不修改其内容或任何运行时配置。

Handoff: 请 Luna/Nova 检查文字是否准确保留授权、风险、独立验证和生产边界，并确认未将普通文档直办例外扩展至治理/授权规则改动。

### XYY-20260904-01

Status: DONE

Task: 只读诊断正式站文章发布 `ORA-12899` 的本地差异与根因，不实施修复。

Scope: 检查本地 Directus/PostgreSQL Schema、Directus revision 写入、Knex Oracle JSON 映射和仓库 Oracle 准备流程；不修改代码、生产数据库、CMS、权限或部署。

Implementation: 无业务实现。确认本地 `directus_revisions.data` / `delta` 为无界 PostgreSQL `json`、`news.content` 为无界 `text`；Directus 创建文章时在 `accountability=all` 下保存包含正文的完整 revision，Knex `oracledb` 将对应 JSON 定义编译为 `VARCHAR2(4000)`。

Validation: 本地只读信息表、Directus seed/service 源码、Knex compiler 和仓库 Oracle 脚本交叉验证一致。正式错误的 14,939/4,000 与该容量边界吻合；权限或网站业务代码不是根因。

Changed Files: 无。

Known Risks: 尚未读取正式 Oracle 数据字典；CLOB 仅为待 Oracle 克隆验证的目标，不是可直接上线的已验收修复。

Handoff: 请 Luna 独立验证本地类型、超 4,000 payload 传递和 Oracle 测试覆盖；不得写入本地或正式 CMS/数据库。

Follow-up (2026-09-08, HIGH repair phase preparation):

Scope: 在正式服务器 SSH/数据库尚无法连接时，仅新增固定目标的 Oracle SQL*Plus/SQLcl 元数据预检和精简执行说明；不执行任何 Oracle/CMS/服务器动作，不生成改表 SQL，不调用历史 prepare/cutover/backup 脚本。

Implementation: 新增 `deploy/oracle19c/inspect-revision-capacity.sql`，只读查询普通用户可见的身份、`PRODUCT_COMPONENT_VERSION` 组件版本/状态、`"XYY_DIRECTUS"."directus_revisions"` 的 `data`/`delta` 列定义、可见 JSON 约束、目标表所有可见索引、触发器、外键和对象依赖，且不读取正文、revision JSON、Token 或数据长度。新增 `deploy/oracle19c/REPAIR-REVISION-CAPACITY.md`，明确本包不是已完成修复或可直接执行的 DDL，并记录正式元数据→同版本隔离克隆→备份恢复演练→两列 CLOB 复制迁移候选→大中文 JSON 独立验证→审核→短暂停写变更→回读验证的受控顺序。

Validation: 对新增 SQL/Markdown 进行本地静态审阅；`git diff --check` 通过，且以行首 SQL 语句检查确认预检不含 DDL/DML/权限语句。未运行 Oracle：Sol 当前正式 SSH 身份被拒绝，未连接正式 DB；因此无正式版本、`delta` 类型、约束/索引/触发器/依赖或 Directus 驱动链的实测结论。

Known Risks: `ALL_*` 视图只显示执行身份可访问的元数据，空输出不能证明不存在；`VARCHAR2`→`CLOB` 直接改型不可假定成功，DDL 隐式提交；一旦正式接受长 revision，不能以缩回 4,000 或截断新历史作为回滚。现有本机 Directus type-copy helper 会在复制后删除原列，仅能作为本机机制证据，绝不可直接复用为正式修复。

Handoff: 请 Luna 独立静态检查 SQL 是否仅含 SELECT/客户端显示/失败退出设置、目标是否固定为 quoted lowercase table/两列、是否避免 DBA 视图与正文输出，以及说明是否准确排除自动 apply 并要求在隔离环境分别覆盖 create/update/history/revert 的 >14,939 与 >32,767 bytes 中文 JSON。

Rework after Luna FAIL: `DBMS_DB_VERSION` 为 PL/SQL 常量，不能直接作为 SQL 选择列表，改用 Oracle 19c `PRODUCT_COMPONENT_VERSION` 的 `PRODUCT`、`VERSION`、`VERSION_FULL`、`STATUS`。显式 `SET EXITCOMMIT OFF`，成功及两类错误退出均执行 `ROLLBACK`；预检必须使用新的专用会话，避免影响调用者未提交事务。索引改为目标 `TABLE_OWNER`/`TABLE_NAME` 的全部可见索引元数据，避免函数索引的 `SYS_NC` 映射导致漏报；空可见结果仍非不存在证明。说明同步澄清：同一已授权目标环境内的正常备份路径选择不需重批，只有新增权限、主机、环境或范围外目标才升级。不需要向 Codex 提供 SSH/数据库密码；运维可在既有受控客户端运行只读 SQL，并仅回传经审查、不含正文或 Secret 的元数据输出。

Rework after Luna re-test FAIL: 索引输出新增 `i.owner AS index_owner` 并按 owner/name/列位置稳定排序，避免同名索引的来源不明确。授权段落改为明确的单一规则：已批准备份、隔离 Oracle 验证和目标修复；已批准目标环境内的日常选择（包括备份路径）无需重批，只有需新权限或实质扩展目标、主机、环境的动作才升级。

Rework after Luna re-test FAIL (projection correction): 删除索引查询中重复的 `i.index_name` 投影；保留唯一的索引 owner、name、type 及列元数据输出。

Local code delivery follow-up: 新增纯检查器 `deploy/oracle19c/lib/revision-capacity.mjs` 与独立只读 CLI `deploy/oracle19c/verify-revision-capacity.mjs`。它固定查询连接账号的 `USER_TAB_COLUMNS`，仅当 quoted lowercase `directus_revisions` 的 `data`、`delta` 恰为两条 `CLOB` 元数据时返回 `CAPACITY_PASS`；缺列、重复、有限 `VARCHAR2`（含 32767）、其他类型、格式/查询/配置/连接错误均 fail-closed。CLI 无参数或 `--help` 不读 `.env`、不加载驱动、不连接；拒绝 `--apply` 和未知参数，使用 `parseEnv` 而非执行 `.env`，且所有成功连接均关闭并不输出连接或驱动错误细节。准备脚本在 bootstrap 后、snapshot/schema apply/uploads/PM2 前以 `${SCRIPT_DIR}` 绝对路径调用门禁，失败由既有 `set -e` 停止后续准备；未改变 bootstrap 的建表定义或执行 Oracle 改表。新增 mock 单测覆盖容量、配置、参数、关闭和调用顺序，并为新闻 API 添加 >14,939 与 >32,767 bytes 中文正文无截断/单请求/安全 502 回归。此为本地代码交付，不是 Oracle 实测、已扩容、JSON 约束或 Directus 运行行为验收。

Pre-handoff correction: 容量检查严格要求返回列名精确为 quoted lowercase `data`、`delta`，不再将 `DATA`/`DELTA` 归一化为通过；测试按完整行数组覆盖 `VARCHAR2(4000)`、`VARCHAR2(32767)`、重复、BLOB/JSON、列名大小写错误和 malformed 结果。CLI 测试另拆文件，补齐 env 读取/配置/driver/连接/close 失败、`OUT_FORMAT_OBJECT`、help/noargs/未知 flag 不读取 `.env`或加载 driver 及未预期异常的安全输出。CLI 只读取指定 CMS 目录 `.env`，不发现 PM2/容器覆盖；运维须确认该文件与实际连接一致，文件级 `CAPACITY_PASS` 不等于在线实例已经修复。

Local validation: 先执行 `npx vitest run tests/unit/oracle-revision-capacity.test.ts tests/unit/news-revision-capacity.test.ts`，因检查器模块尚未创建得到预期 RED；实现后执行 `npx vitest run tests/unit/oracle-revision-capacity.test.ts tests/unit/oracle-revision-capacity-cli.test.ts tests/unit/news-revision-capacity.test.ts tests/unit/news-publishing-errors.test.ts tests/unit/news-publishing-api.test.ts`，5 files / 82 tests PASS。`npx prettier --check`（本轮 MJS/Markdown/TS）、`npx eslint`（本轮 MJS/TS）、`bash -n deploy/oracle19c/prepare-directus-oracle.sh`、`git diff --check` 与新增文件 `git diff --no-index --check` 均通过。项目 Prettier 未配置 Shell parser，因此 `.sh` 使用 `bash -n` 验证；无 Oracle/SSH/CMS/DB 连接或实测，未运行全量 `npm run verify`，由 Sol 后续门禁执行。

Typecheck rework: 以 `typeof fetch` 明确新闻 fetch mock 签名并在读取可选 `RequestInit.body` 前收窄；CLI 测试补 `write(line: string)`。ORA-12899 回归改为 `data`、`delta` 两列，各自模拟完整 INSERT 错误及测试生成的 caller/write/content token，断言仅一次 fetch、502 和无错误/Schema/Token 泄漏。CLI 拒绝把 `--apply`、`--help` 或未知 flag 当作 `--cms-dir` 值（`./-dir` 仍可作为显式相对目录），并证明该类参数不读 `.env`/不加载 driver。实际执行 `npx astro check` 为 387 files / 0 errors / 0 warnings / 0 hints；定向 Vitest 为 5 files / 86 tests PASS；定向 Prettier、ESLint 与 `git diff --check` 通过。未运行全量 verify 或任何 Oracle/SSH/CMS/DB 操作。

### XYY-20260821-03

Status: DONE

Task: 统一仓配下拉菜单中的 9 个服务专题页与合作案例、行业动态、森林期刊栏目首页的底部转化区域，并保留仓配服务页作为视觉基线。

Scope: 抽取共享 CTA；替换 `/product`、9 个下拉菜单服务页、`/cases`、`/news`、`/senlinqikan` 的 CTA；补充定向 Playwright 覆盖。详情页、首页、关于页和 `/yundao-zhineng-jijian` 不改。

Implementation:

- 新增 `ConversionCTA`，统一左侧标题、说明、联系按钮及右侧三项准备信息的语义结构与响应式样式。
- `/product` 保留原有文案、标题换行和滚动显现；服务页只由 `SPECIALTY_LINKS` 中的 9 条路由启用共享 CTA，避免改变明确排除的数字化页面。
- 三个栏目首页使用与页面语义匹配的 CTA 文案，所有主操作均指向 `/contact`。
- 清理产品页已废弃的 CTA 样式入口与选择器；保留数字化页面仍在使用的旧服务 CTA 路径。

Changed Files:

- `src/components/conversion/ConversionCTA.astro`
- `src/pages/product.astro`、`src/pages/cases.astro`、`src/pages/news/index.astro`、`src/pages/senlinqikan.astro`
- `src/layouts/ServiceLanding.astro`、`src/components/service/ServiceExperience.astro`
- 相关产品/服务 CTA 样式及 4 个定向 Playwright spec。

Validation:

- `npm run typecheck`：通过（0 errors、0 warnings、0 hints）。
- `npm run lint`：通过。
- `npm run check:maintainability`：返工后通过；`ConversionCTA.astro` 为 71 行，`conversion-cta.css` 为 155 行，均低于对应预算。
- 定向 Prettier 检查：通过。
- `npx playwright test tests/e2e/conversion-cta.spec.ts tests/e2e/service-pages.spec.ts tests/e2e/product-motion.spec.ts tests/e2e/service-motion.spec.ts`：13 passed、1 skipped；新增矩阵覆盖 13 条目标路由的桌面和移动端结构、可访问标题、联系链接、三项准备信息及无横向溢出。
- 返工后 `npx playwright test tests/e2e/conversion-cta.spec.ts`：2 passed（Chromium、mobile）。

Rework: Sol 的完整验证发现 `ConversionCTA.astro` 为 228 行，超过 180 行组件预算。已将不变的 CTA 样式移至仅由该组件导入的 `src/styles/conversion-cta.css`，保持原有类名前缀、响应式规则和视觉输出，未改变页面文案、路由、CMS 契约或测试范围。

Risks:

- 共享 CTA 的文案为静态页面文案，未改变 CMS 数据或契约；后续如需后台运营 CTA 内容，应另行定义数据契约与迁移范围。
- 13 页矩阵在并行浏览器执行时可能超过默认 30 秒，测试文件局部设置为 60 秒以覆盖完整路由矩阵。

Handoff: 请 Luna 独立验证所有目标页在桌面与移动端的视觉一致性、CTA 仅出现一次、`/contact` 主链接可用、滚动显现及无横向溢出；请确认 `/yundao-zhineng-jijian` 仍保留原 CTA，未被本任务影响。

### XYY-20260822-01

Status: DONE

Task: 修复阻塞当前 main CI 的 Prettier 格式检查失败。

Scope: 仅机械格式化 `tests/unit/image-cache-contract.test.ts`，不改变断言、测试行为或应用代码。

Implementation:

- 使用项目 Prettier 格式化该单一测试文件；唯一 diff 是将超过行宽的 `readProjectFile` 表达式拆为两行。

Changed Files:

- `tests/unit/image-cache-contract.test.ts`
- `docs/TERRA.md`

Validation:

- `npm run format:check`：通过。
- `npx vitest run tests/unit/image-cache-contract.test.ts`：1 个文件、8 项测试通过。
- `git diff --check`：通过。
- 已核对实现 diff 仅包含上述格式变更，没有断言或行为调整。

Risks:

- 无已知功能风险；此次修复只处理既有 CI 格式门禁缺陷。

Handoff: 请 Luna 复核 `tests/unit/image-cache-contract.test.ts` 仍为纯格式调整，并确认完整 `npm run format:check` 与该文件的 8 项测试通过。

### XYY-20260824-01

Status: DONE

Task: 将官网联系留言由 Directus `contact_leads` 的新写入切换为 XYY-xiansuo 的专用服务端 Integration API。

Scope: 在 XYY-WEB 与 XYY-xiansuo 两个真实仓库实现最小 HTTPS + JSON 契约；保留浏览器 `/api/contact`、既有表单安全校验、Directus CMS 内容读取和历史 `contact_leads`。不双写、不改 Oracle/SQLite Schema、不做生产操作。

Implementation:

- XYY-xiansuo 新增 `/api/integrations/website-leads` 和同 Bearer 鉴权的只读 health endpoint；Token 运行时读取并作定时安全比较，空/错误/员工 JWT 均拒绝。
- 接口严格接收官网最小 payload，负责人由 `WEBSITE_LEAD_OWNER_ID` 服务端解析并由 `assertActiveOwner` 校验；手机号兼容官网手机号和座机；以 `官网留言`、`未知`、`新线索`、当前业务日期创建，email/service 仅在非空时映射入 `source_note`。
- 重复手机号预查与唯一索引冲突均返回稳定 duplicate 成功语义，不更新既有线索；新建审计记录标为 `website_integration`，不伪装成员工请求。
- XYY-WEB `storeContactLead()` 改为对 HTTPS Xiansuo endpoint 的单次 5 秒超时调用；配置、网络、鉴权、下游状态或 JSON 契约异常均失败关闭，且不记录 URL、Token 或下游错误；duplicate 对浏览器仍返回成功。
- `/healthz` 拆为 Directus `cmsContent` 与 Xiansuo `contactStorage` 两项依赖；保留 Directus 内容 ping/权限验证，部署预检改为要求内容 Token 与 Xiansuo runtime 配置。

Changed Files:

- XYY-WEB：`.env.example`、`.github/workflows/ci.yml`、`README.md`、`playwright*.config.ts`、`scripts/deploy.sh`、`scripts/lib/health-contract.mjs`、`server/health.mjs`、`src/lib/contact/storage.ts`、相关 unit/e2e contract tests。
- XYY-xiansuo：`.env.example`、`deploy/.env.example`、`server/src/index.ts`、`server/src/routes/website-leads.ts`、`server/test/website-leads-integration.test.ts`。

Validation:

- XYY-xiansuo：`cd server && npm run build && npm test` 通过（176 tests）。
- XYY-WEB 定向测试：6 files、56 tests 通过。
- XYY-WEB：`npm run typecheck`（369 files，0 diagnostics）、`npm run lint`、`npm run check:maintainability`、`npm run format:check` 通过。
- XYY-WEB：`npm run verify` 通过（46 files、301 tests，含生产 build）。
- `CI=1 npm run verify:release` 的完整 verify 阶段通过；E2E 阶段未能启动，原因是当前机器没有 Playwright Chromium binary。尝试下载该本地测试依赖未完成且已中止，未产生仓库或生产变更；Luna 应在具备浏览器二进制的环境独立重跑 release gate。
- 两仓库 `git diff --check` 已执行且通过（后续 Sol/Luna 仍需在最终交接 diff 上独立复核）。

Rework (Sol first review):

- Token 配置现在先 trim 后要求至少 32 UTF-8 bytes；Xiansuo 用固定长度 SHA-256 digest 的 `timingSafeEqual` 比较，输入 token 不 trim 改写。XYY-WEB contact storage 与 health 同样拒绝短 token。
- 官网电话在 Xiansuo 校验后规范化为空格/连字符剔除的数字再查重和存储；lead 与 audit insert 置于同一 SQLite transaction，审计失败会回滚 lead。
- CI、Playwright 和单元/E2E 测试改用隔离 `.test` endpoint 与运行时随机 token；部署健康循环每轮只读取一次 `/healthz` payload。
- 新增短 token、owner 缺失/无效、格式变体 duplicate、强制 audit failure rollback、timeout rejection 和 invalid JSON 证据。返工后 Xiansuo `npm run build && npm test` 通过（178 tests），XYY-WEB 定向 60 tests 与 `npm run verify` 通过（46 files、305 tests）。
- Luna FAIL 返工：Integration route 的非 duplicate 数据库/audit 异常现在在 rollback 后返回稳定 `{ code: 1, msg: '线索接收失败', data: null }`；强制 SQLite `secret-detail` audit failure 测试确认响应不包含 SQLite 或异常细节且没有遗留 lead。Xiansuo build 与全量 178 tests 再次通过。
- Nova REJECTED 返工：Web 官方生产 env 模板、prepare 脚本、部署 README 与 CMS 模型文档改为 Directus 内容读取 + Xiansuo 联系 Integration 的当前运行契约，且添加模板/prepare/根部署脚本的一致性测试；Xiansuo PM2 ecosystem 显式透传 Integration Token 与 owner ID，并以实际加载 CJS config 的隔离测试验证。未执行脚本、PM2 或部署。

Risks:

- 代码已 ready，但生产环境尚未配置双方同一随机 Token 和有效 owner ID，因而未切换生产流量。
- Xiansuo 服务端部署与官网部署必须同一变更窗口完成；任一端未部署或环境变量缺失时官网会明确失败关闭，不会回退写 Directus。

Handoff: 请 Luna 独立验证两端 Auth/payload/owner/duplicate/手机号与座机/审计映射、官网保留 honeypot/限流/隐私与失败语义、HTTPS-only 与 Secret 不进入客户端；检查 `/healthz` 必须同时要求 `cmsContent` 和 `contactStorage`，且本 Task 没有 Oracle/Directus 写入、Schema 改动、双写或生产操作。

### XYY-20260825-01

Status: DONE

Task: 将官网线索 Integration 的服务稳定码转换为中文显示名称。

Scope: 仅修改 XYY-xiansuo website lead Integration 的 `source_note` 构造和对应集成测试；不改官网业务代码、数据库/Schema、既有线索或运行配置。

Implementation:

- 在 XYY-xiansuo 的 Integration 边界增加五项精确服务码映射：`cloud-warehouse`、`quality-inspection`、`logistics-cloud`、`all`、`other` 分别写入既定中文标签。
- 已有中文或自定义服务值、未知服务值按原值写入；`service` 为 null 时仍只按现有逻辑处理 email，email-only 继续写为单行邮箱说明。

Changed Files:

- XYY-xiansuo：`server/src/routes/website-leads.ts`、`server/test/website-leads-integration.test.ts`
- XYY-WEB：`docs/TERRA.md`

Validation:

- `cd /home/yj/xiansuo/server && npx tsx --test test/website-leads-integration.test.ts`：8 项通过，覆盖五项稳定码、中文自定义值、null 与 email-only 行为。
- `cd /home/yj/xiansuo/server && npm run build`：通过。
- `cd /home/yj/xiansuo/server && npm test`：180 项通过。
- `git -C /home/yj/xiansuo diff --check`：通过。

Rework (Nova):

- 服务码查表已由继承 `Object.prototype` 的普通对象改为 `Map`，确保 `toString`、`constructor`、`__proto__` 等未知服务值按原字符串写入；集成测试已补充三项原型键回归覆盖。

Risks:

- 映射只匹配当前已确认的五个稳定码；未来新增官网服务码会按原值保留，直至另行确认中文显示标签。

Handoff: 请 Luna 独立复核五个稳定码写入中文、中文/自定义/未知值不变、null 与 email-only `source_note` 兼容，且鉴权、校验、重复、owner 与审计语义未回归。

### XYY-20260830-01

Status: DONE

Task: 修复服务专题页 CMS Seed 漏掉 `stats`、`features` 的生成缺陷，并提供仅覆盖 9 条仓配下拉服务页结构字段的受控修复命令。

Scope: 更新服务页 Seed 生成、生成输出、定向结构修复 CLI 与回归测试；不改变运行时 CMS 回退语义，不部署、不写生产 CMS、不改数据库/Schema。

Implementation:

- `generate-cms-content-seeds.mjs` 现在将页面源中的 `stats` 与 `features` 写入 `APPROVED_SERVICE_PAGE_SEEDS`，重新生成的 Seed 保留所有服务页的完整结构。
- 新增默认 dry-run 的 `cms:repair-service-page-structure`：只定位仓配菜单的 9 条 slug，只计划/修复 `stats`、`features`、`img_src`；逐条唯一匹配、审核数组完整性、`published` 状态和未设置 `hero_image` 均为前置条件。
- CLI 在 dry-run 与 apply 前均通过既有同步运行时保存 Git 忽略的 `output/cms-sync/` 快照；apply 后按 `slug` 回读并验证。9 次 PATCH 不具备事务语义，README 已明确中断后的备份、dry-run、幂等重跑与零差异复核流程。
- 没有改动 `src/lib/directus-content-queries.ts`；CMS 成功返回内容仍保持权威，不会由静态回退覆盖。

Changed Files:

- `scripts/generate-cms-content-seeds.mjs`
- `scripts/data/approved-cms-page-seeds.mjs`
- `scripts/lib/cms-sync-runtime.mjs`
- `scripts/lib/service-page-structure-sync.mjs`
- `scripts/repair-service-page-structure.mjs`
- `package.json`、`README.md`
- `tests/unit/service-page-seed-structure.test.ts`
- `docs/TERRA.md`

Validation:

- `npm run cms:generate-content-seeds`：通过；重复生成无额外差异。
- `npx vitest run tests/unit/service-page-seed-structure.test.ts tests/unit/cms-setup.test.ts tests/unit/cms-sync.test.ts`：通过（3 files、24 tests）。
- `npm run typecheck`（373 files，0 diagnostics）、`npm run lint`、`npm run check:maintainability`：通过。
- 新增/修改代码与测试文件 Prettier 检查、`git diff --check`：通过；README 保留了本任务前已存在的一处 Markdown 表格空格差异，避免产生无关 diff。Sol/Luna 仍需在最终完整 diff 上独立复核。

Risks:

- CLI 故意在发现 `hero_image`、未发布记录、缺失/重复 slug 或不完整审核数组时失败关闭；需由授权的 CMS 操作人员先处理这些显式阻塞项，脚本不会清空上传图片或改变发布状态。
- 本实现不执行 CMS 命令或生产写入；实际 apply 前必须使用正确环境的短期管理 Token，并先检查 dry-run 与本地备份。

Handoff: 请 Luna 独立验证生成 Seed 中 9 条目标页均为 4 个 stats、6 个 features 且与源码一致；验证 CLI 只使用 `sort=slug` 读取 `service_pages`、dry-run 不发 CMS PATCH、`--apply` 仅含三个字段且回读验证；覆盖 hero image、非 published、缺失/重复 slug 的失败关闭路径。确认无运行时回退、生产 CMS、数据库或部署操作。

### XYY-20260831-02

Status: DONE

Task: 修复 News 当天发布时间因 Directus 无时区时间比较而被隐藏的问题，并新增受保护的服务端批量发布接口。

Scope: News 列表、分类和详情的发布时间判定；`POST /api/integrations/news/batch`；相关运行变量、文档和测试。未修改页面 UI、CMS Schema/数据、图片修复工具、Oracle、联系表单、部署或生产环境。

Implementation:

- 公开 News 不再将 `$NOW` 交给数据库适配层比较。带 `Z` 或 UTC offset 的发布时间按绝对时刻解析；Directus 返回的无时区日期时间统一按 `Asia/Shanghai` 后台编辑时间解析。列表和分类先取得已发布且有发布时间的候选，在应用侧过滤未来文章、按真实时刻排序后再分页；详情页同样检查，保留定时发布语义。
- 新增只允许服务器调用的 `POST /api/integrations/news/batch`。请求仅接收 `articles` 白名单字段、JSON、1 MiB body 和最多 20 篇；服务端固定 `status=published`，默认填入当前 ISO 发布时间，不提供更新、删除、文件上传、任意集合或系统字段写入。
- 调用方使用 `NEWS_PUBLISH_API_TOKEN` Bearer 认证（至少 32 UTF-8 bytes，SHA-256 digest 后恒时比较）；Directus 写入使用独立 `DIRECTUS_NEWS_WRITE_TOKEN`。三个凭据均须存在、达到长度要求且两两不同；任一缺失、短 Token 或复用均失败关闭，不记录或返回 Secret、Directus URL 或下游错误详情。
- Directus 采用单次批量写入、10 秒超时、无重试；唯一约束映射为稳定 409，其余下游失败映射为非敏感 502。环境模板和 README 只记录空配置与最小权限契约。

Rework (Luna FAIL):

- 时间解析改为同一严格 parser：无时区值仍按 Shanghai 编辑时间解释，带 offset 的 API 值与运行时读取共享日期、闰年、小时和 ISO 8601 最大 `±14:00` 校验；非法日历日期和 `+14:01`/`+23:00` 被拒绝，不再依赖 `Date.parse()` 的自动归一化。
- 路由在任何下游 fetch 前要求 `NEWS_PUBLISH_API_TOKEN`、`DIRECTUS_NEWS_WRITE_TOKEN`、`DIRECTUS_CONTENT_TOKEN` 都至少 32 bytes 且两两不同；storage 层保留写入/内容凭据的独立防线。
- Directus 成功响应 ID 现在仅接受正安全整数，或可严格转换为正安全整数的十进制字符串；空、0、负数、小数、非数字和越界值均视作下游契约失败。

Rework (Nova REJECTED):

- Directus 写入地址现在只允许远端 `https:`；`http:` 仅允许 URL 真实 hostname 为 `localhost`、`127.0.0.1` 或 `[::1]`，并同时要求原始 URL 明确使用这三个字面量，拒绝数值别名、尾缀 lookalike、userinfo、query、hash 与其他协议。既有 `/cms` 路径继续安全追加 `/items/news`。
- 新增 HTTPS、三个 loopback HTTP 与拒绝性 URL 契约测试；所有拒绝均发生在 fetch 前，不会将 Directus 写 Token 明文发送到非回环 HTTP 目标。

Changed Files:

- `src/lib/directus-queries.ts`、`src/lib/news-publication-time.ts`、`src/lib/directus.ts`
- `src/lib/directus-client.ts`、`src/lib/news-publishing/*`、`src/pages/api/integrations/news/batch.ts`
- `.env.example`、`deploy/production/web/web.env.example`、`README.md`
- `tests/unit/directus.test.ts`、`tests/unit/news-publication-time.test.ts`、`tests/unit/news-publishing-api.test.ts`、`tests/unit/news-publishing-errors.test.ts`
- `docs/TERRA.md`

Validation:

- 首轮定向 Vitest：5 files、47 tests 通过，覆盖 Shanghai 无时区时间、UTC/offset、当前边界、未来隐藏、列表/分类/详情、分页，以及 API 鉴权、字段白名单、批量/大小限制、凭据隔离、Directus 成功/重复/错误/网络/超时与非泄露响应。
- Luna 返工后定向 Vitest：3 files、56 tests 通过，补充非法日历时间、ISO `±14:00` 边界、三项凭据缺失/过短/复用和无效 Directus ID。
- Nova 返工后定向 Vitest：3 files、68 tests 通过，补充 HTTPS、三个回环 HTTP 与不安全 Directus 写入 URL 的 fetch 前拒绝。
- 最终全量 `npm run test`：51 files、384 tests 通过。
- `npm run typecheck`、`npm run lint`、`npm run check:maintainability`、`npm run build`、`npm run format:check`、`git diff --check` 均通过。

Risks:

- 批量发布 API 代码已就绪，但在生产启用前必须由授权人员创建两个彼此不同的高熵服务端 Token，并创建只具 `news` 新建所需权限的 Directus 写入 Token；本 Task 未创建 Token、权限策略或 CMS 数据。
- 公开 News 查询现在为保证时区一致性读取全部已发布候选后再在应用侧分页；当前 News 数据量很小。若将来文章量显著增长，应另建任务设计数据库侧时区规范化或有界查询方案。

Handoff: 请 Luna 独立验证无时区 Shanghai、UTC/offset 与未来发布时间的可见性和分页；验证 API 不接受非 JSON/未知字段/系统字段、三种 Token 不可复用、短或缺失配置失败关闭、批量 Directus request 仅写允许字段并有超时、下游所有错误均不泄露 Secret 或内部信息。确认无 CMS/Oracle/生产/部署操作。

### XYY-20260908-05

Status: REWORK IN PROGRESS — first conversion was rejected before QA; do not treat the prior generated 6–13 set as accepted.

Task: 将《森林期刊》第 6–13 期无可靠正文文字层的 PDF，转换为共享白皮书阅读页所需的可追溯 JSON 和局部源图。

Scope:

- 仅第 6–13 期，以及离线转换脚本、OCR 版式工具、白皮书审阅清单与本角色测试；第 1–5 期已转交其他 Terra，未写入其数据或图片。
- 未修改第 14 期、共享 UI/路由/类型/loader、PDF 原件、CMS、数据库、部署或生产环境。

Implementation:

- 新增 `convert_archives.py`：核验源 SHA 后仅读取既有 PSM 3 缓存，按经审阅的印刷页/左右跨页起点分节；不再使用固定 OCR block 数量分段。第 10 期跳过 physical p3 上半出版信息和目录，保留下半《我们的故事》跨页正文；封面秋刊与前言 SUMMER 的冲突保留在来源标签。
- `archive_layout.py` 改为保留 Tesseract 的 block/paragraph 原顺序，避免将多段正文机械合并或以全局 y/x 排序交错双栏。
- 生成 6–13 JSON、每期一张小范围原刊上下文裁剪，及逐节 `review-note`；所有正文、图、待核查说明均有 PDF physical page/side/bbox 溯源。

Changed Files:

- `scripts/whitepapers/convert_archives.py`、`scripts/whitepapers/ocr/archive_layout.py`、`scripts/whitepapers/ocr/README.md`
- `src/data/whitepapers/6.json`–`13.json`
- `public/images/supply-chain-whitepapers/6`–`13`、`tests/whitepapers/archive_conversion_test.py`
- `docs/whitepapers-archive-review.md`、`docs/TERRA.md`

Validation:

- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python scripts/whitepapers/convert_archives.py --issues all`：8 期均生成，正文字符数和 H2/局部图/待核查计数见 `docs/whitepapers-archive-review.md`。
- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python -m unittest tests/whitepapers/archive_conversion_test.py`：1 test 通过；校验 6–13 源哈希、主体正文、单张局部图、无 iframe 正文与待核查说明。
- `py_compile` 与任务文件 `git diff --check`：通过。按任务排除项未运行 build/full verify/CMS/DB/部署。

Risks:

- OCR 并非人工逐字校对。图表、照片内文字、长标题截断、英文/品牌名和跨栏段落保留具体 source 区域待 Luna 对照 PDF；不可把高 OCR 均分当作逐字核验。
- 第 10 期 A4 微信打印与嵌入跨页并存，除已明示的 p3 下半外，`printedPage` 保持 `null`，不伪造印刷页映射。

Handoff:

- 请 Luna 抽查第 6 期 p3 right 的虚拟试穿双栏、p5/p6 视频号边界，第 10 期 p3 下半左右顺序和 p4–p6 标题/正文边界；再抽查 7–9、11–13 各一节 source bbox 与 JSON 文本。请确认局部图不是整页、目录未混入正文、任何不确定文字均有 review-note。

Rework (Sol review FAIL):

- 已改用 PDF `pdfRect × dpi` 的真实画布高度，不再以最后 OCR 词位置推断页高；每个 PSM 3 manifest 与 lines cache 均在读取时核验 SHA-256、physical page 和 side。
- 第 6 期前四节已从摘要性改写回可回源的段落转录：总指挥节保留原段，只改已核图错字；虚拟试穿节保留完整 AR 段并合并 `block16:4`、`block18` 与短句末 `block20` 的断行，按原图校正“近日”“虽然”和 AI；图表 OCR 垃圾替换为原刊局部图、原文可读统计段和精确 note；视频号节按 physical p5 原图重新转录。
- 第 10 期 physical p6/p7 按上左→上右→下左→下右的嵌入跨页拆为电商、跨境、花桥、合肥、乔迁五个 H2；并新增已目视的仓内作业、花桥仓局部照片。仍需完成第 6 期其余节和第 7–13 期同等清理，才可再次申请 QA。
- 当前定向验证：`convert_archives.py --issues 6,10`、`python -m unittest tests/whitepapers/archive_conversion_test.py`（2 tests）和任务文件 `git diff --check` 通过；未运行 build/full verify/CMS/DB/部署。

Rework (source-faithful OCR cleanup):

- 完成第 6–13 期的第二轮再生成与逐段噪声扫描。只移除已确认由图表、截图、海报、课程表或照片叠字混入的确切 OCR 段，并在对应节留下具体 `review-note`；未用“原文认为”等摘要句替代正文。
- 第 6 期虚拟试穿保留 p3 right 原段及已核图的“近日”“虽然”“AI”修正和短句 `能。`；p4 纺织图表改为 5 张经核验的局部图。图 5/6 已收窄至棕榈油与 LDPE 两图，不含下一排残片。
- 第 10 期以 PDF physical p3–p5 的 600 dpi 本地渲染逐段校对，重写《我们的故事》和 COCO ZONE 两篇为原刊可读段落；保留图片/商品卡局部 OCR 无法确认处的精确 note。p6/p7 维持按上左→上右→下左→下右拆分的五个原刊文章节，不再按物理页合并。
- 复用 Luna 已审阅且本人再查看的局部图锚点，替换第 7–13 期固定“context”裁剪；第 13 期 48 家公司数据表保持为有来源定位的局部原图，未把表格噪声写成正文。

Validation:

- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python scripts/whitepapers/convert_archives.py --issues all`：第 6–13 期均重建；最终每期 H2/正文字符/图/review-note 指标见 `docs/whitepapers-archive-review.md`。
- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python -m unittest tests/whitepapers/archive_conversion_test.py`：3 tests 通过，覆盖 source SHA、主体正文和图契约、第 6 期图表噪声/虚拟试穿末句，以及第 10 期正文原句、五个嵌入跨页 H2 与已知噪声不输出。
- 对生成 JSON 运行定向 raw-latin/符号段扫描；已知图表/截图噪声标记均无命中。`git diff --check` 通过。按 Scope 未运行 build/full verify/CMS/DB/部署。

Remaining risk / QA focus:

- 这不是人工逐字审校。第 7–9、11–13 的英文品牌名、统计图小字、课程表和照片内文字仍应由 Luna 对照 PDF；对应区域没有被补写或伪装成正文。
- Luna 应优先对第 10 期 physical p3 下半和 p4–p5 的已转录段落逐段对照，以及检查第 6 期 p3 right、p4 图 1—14、和第 7–13 的 18 个局部图源 bbox。确认后才可由 Sol 进入独立 QA/Review 阶段。

Rework (Sol source-reading FAIL):

- 取消“可读 OCR 原样保留”的宽松处理：逐节删除重复 H2、装饰性 `@`/`O` 署名和跨栏串行段；已确认坏段以原 `source` 的 physical page/side/bbox 写入精准 `review-note`，不以摘要或推测性修复填补。
- 针对 Sol 指出的第 8 期军大衣双栏串行、第 13 期开篇乱码、第 12 期断裂标题/导语，以及第 7/9/11 重复标题和图层噪声实施有界清理。正常历史数字仍保留；不可靠数字或图内文本留在原图核对范围。
- OCR catalog 的第 2 期边界锚点将“内部24小时异常通报”改为“内部责任事故通报”，仅移除备料描述中的 KPI 字面量，未改阅读正文历史数字。

Validation:

- 重建 6–13 后，定向 paragraph 扫描未再命中已知双栏片段、重复 H2、`@ 路年`、`ACSERGABNHEXS`、`MEARS |`、`5 月纺织`等公开噪声模式。
- `python -m unittest tests/whitepapers/archive_conversion_test.py`：4 tests 通过；新增回归覆盖已知串栏片段不进入 paragraph、重复 H2 不进入正文。
- `git diff --check` 通过；未运行 build/full verify/CMS/DB/部署。

Metric correction:

- `docs/whitepapers-archive-review.md` 的“已转换正文字符”现只统计 `paragraph`、`quote`（及未来 `list`）原刊文字；明确排除 H2/H3、图注和 `review-note`。表中字符数只说明当前可读恢复范围，不代表全文人工逐字校对 PASS。

Remaining risk / QA focus:

- 精确 note 数量增加（见 `docs/whitepapers-archive-review.md`），反映 OCR 损坏区域真实存在，而非正文完整度保证。请 Luna 核验被替换段的 source bbox 与原 PDF 是否匹配，并抽读保留段落以发现未列入本轮模式的错字/断页。

Rework (locator visibility and issue 11 source reading):

- 所有公开 `review-note` 已在 text 中写入《文章名》、PDF physical page、中文侧别和 bbox；阅读页面无需暴露内部 JSON source 字段也可定位原刊区域。连续坏段仍按各自原 bbox 保留，未合并为无定位的通用免责声明。
- 实读第 11 期 physical p3 left 卷首语后，以原图逐段替换损坏 quote/正文：修正“创始团队”“辜负”“兢兢业业”“贪婪”“千军易得”等 OCR 错字，保留原刊年份、项目脱敏符号与历史表述。第 12 期残标题“服装品牌的长寿法则一一”已从正文移除。

Validation:

- `python -m unittest tests/whitepapers/archive_conversion_test.py`：5 tests 通过，新增每一 note 均含 `PDF physical page` 与 `bbox` 的可见定位断言，并覆盖第 11 期卷首语原文修复。
- `git diff --check` 通过；未运行 build/full verify/CMS/DB/部署。

Rework (Luna 首轮离线内容 QA FAIL，限定锚点修复):

- 仅恢复 Luna 已逐张确认清晰的 source 区域，未扩展全刊扫描或用摘要替换正文：第 8 期 physical p8 right `s06-b01` 改回“在会议上”；第 9 期 physical p3 left ESG 引言；第 11 期 physical p3 left 改回“对于我们创业团队而言”；第 12 期 physical p3 left `bbox [65.5,208.4,294.5,270.4]`；第 13 期 physical p3 left 三段 `bbox [102.6,221.0,370.8,301.3]`、`[102.6,303.5,370.8,412.6]`、`[102.6,419.0,370.8,565.2]`，以及 physical p8 right 中段战略会议正文。
- 第 6 期 physical p4 图表局部图 `fig3-4.png` 的 alt 校正为“粘胶短纤与涤纶长丝价格趋势图”。恢复逻辑按 issue、physical page、side 与 bbox 精确匹配，保留不可读区域既有 review-note。

Validation:

- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python scripts/whitepapers/convert_archives.py --issues all`：重新生成 6–13；第 9/12/13 期原刊正文字符分别为 8,831 / 16,460 / 12,837，review-note 分别为 26 / 39 / 26，已同步审阅表（字符统计不含 note）。
- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python -m unittest tests/whitepapers/archive_conversion_test.py`：6 tests 通过；新增回归同时断言第 8/9/12/13 指定原文、issue 11“创业团队”及 issue 6 图 alt。`git diff --check` 通过。

Handoff:

- 请 Luna 仅复测本条列出的 p8/p3/p4 指定 source bbox、issue 11 的“创业团队”及 issue 6 图 alt；本轮未宣称 6–13 已完成人工逐字审校，其他现存精确 review-note 仍为原范围限制。

Rework (Luna 第 10 期 source 定位 FAIL，限定修复):

- 第 10 期《我们的故事》与 COCO ZONE 文章的人工转录未改正文，全部 source bbox 改为包含相应原文的嵌入印刷页正文区域，避免将相邻段或图片区域冒充逐行来源。physical p3 的印刷页 4/5 使用 `[95,410,300,780]` / `[295,410,510,780]`；physical p4/p5 的印刷页 6–13 分别按对应四象限正文区域标注。
- Luna 指出的三处现在为：`回首与新亦源共同成长的七年` → p3 `[95,410,300,780]`；`女装行业没有秘密` → p4 `[95,35,300,400]`；`为了保证消费者的购物体验` → p5 `[295,35,510,400]`。review-note 同步声明该粒度为印刷页正文区域、不是逐行框。

Validation:

- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python scripts/whitepapers/convert_archives.py --issues 10`：仅重建第 10 期，正文字符/图/note 计数维持 6,177 / 6 / 14。
- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python -m unittest tests/whitepapers/archive_conversion_test.py`：6 tests 通过；三个新断言同时锁定新 p3/p4/p5 source、并否定 Luna 指出的旧错误 bbox。三个新 bbox 已以本地 PyMuPDF 裁图目视确认包含对应原文。`git diff --check` 通过；未运行 build/full verify/CMS/DB/部署。

### XYY-YYYYMMDD-NN

Status:

Task:

Scope:

Implementation:

Changed Files:

Validation:

Risks:

Handoff:

### XYY-20260908-05 — Phase2-A early issues and claims source boundary

Status: Frozen and handed to Sol; no build, deployment, CMS or database operation was run.

Implementation:

- Added the isolated early-issue converter/layout/extractor, generated `1.json`–`5.json` and local figure crops. Conversion validates the current source PDF SHA-256 against the manifest and every cached PSM3 line file before generating.
- Issues 1–2 retain source-checked readable text. Issues 3–5 are explicitly partial recovery drafts: each low-resolution article has a physical-page/bbox `review-note`, and their reading notice states that the body is not fully converted.
- Narrowed `claims.test.ts` so historical literal handling applies only to verified 1–14 whitepaper body blocks with valid source locators, and to existing same-issue local PNG figure descriptions. Titles, descriptions, metadata, headings, notes, unlocated blocks and unsafe figure paths remain scanned.

Changed Files:

- `scripts/whitepapers/convert_early_issues.py`, `scripts/whitepapers/early/*`, `src/data/whitepapers/1.json`–`5.json`, `public/images/supply-chain-whitepapers/1`–`5`, `tests/whitepapers/early_conversion.test.py`, `docs/whitepapers-early-review.md`, `tests/unit/claims.test.ts`.

Validation:

- `npx vitest run tests/unit/claims.test.ts tests/unit/whitepaper-content.test.ts`: 2 files / 16 tests passed.
- `tests/whitepapers/early_conversion.test.py`: 4 tests passed; also ran Python compile and `git diff --check`.
- Ran Prettier check and ESLint for `tests/unit/claims.test.ts` successfully.

Risks / Handoff:

- Reliable recovered body-character counts are 1: 1438, 2: 2133, 3: 136, 4: 81, 5: 119. Counts for 3–5 explicitly do not represent complete articles; use `docs/whitepapers-early-review.md` and visible source-bounded notes for Luna review.
- Luna should verify the partial-recovery notice/note visibility for 3–5 and the claims boundary negative cases (missing locator/source hash, metadata literal, missing or traversal figure path). Sol owns full verify/build and final acceptance.

### XYY-20260908-05 — claims test maintainability rework

- Moved the source-bound historical-whitepaper literal scanner from `tests/unit/claims.test.ts` into `tests/helpers/whitepaper-claim-source.ts`; the test retains its original positive and negative cases.
- Both files remain below the 220-line budget (`claims.test.ts`: 193; helper: 127). The helper continues to fail closed for invalid article shape/hash/source/locator and unsafe or traversal figure paths.
- Validation: Prettier, ESLint, `npx vitest run tests/unit/claims.test.ts tests/unit/whitepaper-content.test.ts` (2 files / 16 tests), `npm run check:maintainability`, and `git diff --check` passed. No build, CMS, database or deployment action was run.

### XYY-20260908-05 — reader presentation rework

Status: Local implementation frozen for independent QA; no build, PM2, CMS, database, deployment or source-content rewrite was run.

Implementation:

- Added a presentation-only helper and a focused unit suite. It replaces raw internal review notes with one concise reader notice per affected section and a PDF link to the earliest related page; the original JSON notes remain unmodified. The page-level notice now uses reader-facing historical context, while issues 3–5 explicitly state that only part of the content is available and direct readers to the PDF original.
- All 76 figures pass through reader-copy cleanup before rendering. The shared figure manifest is consumed only at display time: its 31 entries provide independent image pixels and CSS display-width caps; unmatched figures retain their original source and dimensions without enlargement. Diagram entries receive an ordinary `查看大图` link, never a high-definition claim; photos retain their existing rounded treatment and diagrams use only a small corner radius.
- Figures and captions are width-bounded and horizontally centered at desktop and mobile breakpoints. The component no longer prints raw `review-note` text, bbox, OCR, physical-page or text-layer terminology into the reading HTML.

Changed Files:

- `src/components/publications/WhitepaperArticle.astro`, `src/styles/whitepapers.css`, `src/data/whitepapers/presentation.ts`, `tests/unit/whitepaper-presentation.test.ts`, `docs/TERRA.md`.

Validation:

- RED: `npx vitest run tests/unit/whitepaper-presentation.test.ts` initially failed because the new presentation helper did not yet exist.
- GREEN: `npx vitest run tests/unit/whitepaper-presentation.test.ts` passed, 1 file / 5 tests. The suite iterates all 76 figures, verifies 122 affected sections have one reader-facing PDF link, preserves the 3–5 partial-content warning, locks desktop/mobile centering CSS, and checks the 31-entry manifest split (28 enhanced / 3 source-limited).
- Prettier and ESLint passed for this round's TypeScript, Astro, CSS and test files; scoped `git diff --check` passed. No build or full verify was run by contract.

Risks / Handoff:

- The three `source-limited` entries deliberately retain their real limited pixels and are not labelled high-definition. Visual QA should measure desktop/mobile centering and verify source-limited diagrams remain legible without any invented quality claim.
- Luna should focus on issues 14, 12 and 7 across desktop/mobile: narrow diagrams, reader-note/PDF anchors, no raw conversion terminology, 3–5 strong notices, and ordinary diagram links (31 manifest-backed figures). Sol owns the unified build/preview and final acceptance.

Luna full-verify rework:

- Fixed `TS7053` in the presentation test without `any`, `ts-ignore` or a blind JSON cast: a runtime manifest shape guard now narrows the JSON module to `WhitepaperFigureAssets` before it is indexed by a figure source path.
- Added source-backed caption cases and extended display-only cleanup for the actual remaining locator strings: early issue `(原刊物理第N页局部)` is removed as a whole; issue 14 `原刊印刷页N` and optional side prefix are removed while attribution remains; issue 10 `PDF physical page` crop captions fall back to their existing semantic alt. No source JSON changed.
- Validation: RED confirmed the issue 14 alternate page-prefix and early leftover; after the minimal fix `npx vitest run tests/unit/whitepaper-presentation.test.ts` passed 1 file / 7 tests, `npx astro check` passed 399 files / 0 errors / 0 warnings / 0 hints, Prettier and `git diff --check` passed. No build, full verify, PM2, CMS, database or deployment action was run.

### XYY-20260908-05 — 阅读页通用声明移除返工

- `getArticleReadingNotice` 现在仅为第 3–5 期返回既有“本期仅部分内容，完整内容请阅读 PDF 原版。”；其余 11 期返回 `undefined`。共享阅读组件仅在有提示时渲染 notice `aside`，不再公开输出通用历史语境/服务承诺声明。
- 定向测试覆盖 11 期无 notice、3 期精确 partial 文案及无空 notice 框。RED 后 `npx vitest run tests/unit/whitepaper-presentation.test.ts` 为 1 file / 7 tests PASS；Prettier 与 `npx astro check`（399 files，0 diagnostics）通过。未改 JSON/PDF/图片、来源或出版日期、正文/章节提示/样式/metadata/目录/下载；未运行 build/full verify/图片脚本或任何外部操作。待 Luna 独立核验阅读页三期提示和其余期无空框。

### XYY-20260908-05 — 章节提示移除返工

- 删除章节级 `getSectionReadingNote`、组件调用/`aside` 和仅供其使用的 CSS selector；保留每个 `review-note` block 的 `return null`、原始 JSON 数据、3–5 顶部 partial 提示及所有既有图片、目录、PDF 下载和元数据。测试锁定 14 期仍有 122 个内部 review-note 所在章节，但它们不再公开生成提示或页码 PDF 链接。
- RED 后 `npx vitest run tests/unit/whitepaper-presentation.test.ts` 为 1 file / 7 tests PASS；指定文件 Prettier 与 `npx astro check`（399 files，0 diagnostics）通过。未运行 build/full verify/浏览器/图片脚本或任何外部操作；待 Luna 依 14→1 顺序复验桌面与移动阅读页。

### XYY-20260909-01 — 发布门禁依赖修复

- 仅在隔离候选 `/tmp/xyy-release-20260909-VEEy4m/candidate` 更新 `package.json`/`package-lock.json`：Astro 约束升至 `^7.2.8`，生产锁定为 Astro 7.2.8、Sharp 0.35.4、js-yaml 4.3.2、svgo 4.1.0；未新增 direct dependency、override 或跨 major。Astro 补丁所需的生产传递项随 lock 重解，dev-only lock 项保持基线。
- RED 为 `npm audit --omit=dev` 的 1 critical / 3 high；GREEN 为 0 vulnerabilities。隔离候选 `npm ci --dry-run`、生产 `npm ls`、两文件 Prettier 与 `git diff --check` 通过；未运行完整 release gate、提交、推送、部署或任何外部/CMS/数据库操作。

### XYY-20260909-01 — adapter/helpers SSR 返工

- 仅在同一隔离候选更新 `@astrojs/node` 为 `^11.1.4`（lock 11.1.4）；其官方 peer `astro ^7.2.1` 与 lock 的 Astro 7.2.8 兼容，并精确统一顶层 `@astrojs/internal-helpers` 至 0.10.4。实际模块确认 `stripRequestBase` 已导出；未加 override、未改应用 API 或根依赖目录。
- 合成 CMS/Integration 环境下 `npm run build` 成功；自身 loopback `127.0.0.1:4391` SSR 的 `/supply-chain-whitepapers/14/` 为 HTTP 200，进程已关闭。`npm ci --dry-run --prefer-offline`、生产 audit=0、生产 `npm ls`、Prettier 和 diff 检查通过；未运行完整 gate、提交、推送、SSH 或外部/CMS/数据库操作。

### XYY-20260910-01 — 仓配服务编辑式首屏重构

Status:

- Local implementation complete; handed to Sol for Luna independent verification. No build, commit, push, deployment, CMS, database or external write was run.

Implementation:

- Replaced only the `/product` assurance section's preceding presentation with five compact editorial sections: four blank image placeholders, service series, direct six-need links, product-care categories and the six-step process.
- Preserved the existing product CSS import and isolated new styling inside an inner `.product-editorial` wrapper, leaving the assurance section and Conversion CTA outside it.
- Replaced obsolete tab/panel assertions with direct-link, placeholder and anchor assertions. The cache contract now asserts that the temporary image-free hero does not reference the old warehouse asset.

Changed Files:

- `src/pages/product.astro`, `src/components/product/ProductEditorial*.astro`, `src/data/product/editorial.ts`, `src/styles/product/editorial*.css`, `tests/e2e/home-product.spec.ts`, `tests/unit/image-cache-contract.test.ts`.

Validation:

- `npx prettier --check` for all owned files; `npm run typecheck` (404 files, 0 diagnostics); `npm run check:maintainability`; and `npx vitest run tests/unit/image-cache-contract.test.ts` (1 file / 8 tests) passed.
- Local `http://127.0.0.1:4322/product` browser check: 1366px has no horizontal overflow, 4 placeholders, 1 H1, 6 directory links and a 1754px editorial block; 360px has no horizontal overflow; 390px validates a visible keyboard focus outline on a directory link. Desktop placeholder ratios are 1.75, 1.9, 4.5 and 3.

Risks / Handoff:

- Artwork is intentionally absent: every new visual is a blank, aria-hidden placeholder marked with `data-image-placeholder`. Luna should independently check 360/390/430 and 1366/1440 layout, focus navigation, direct routes, exact placeholder count and that assurance/CTA remain visually unchanged.

### XYY-20260910-01 — 锚点偏移返工

- 在 `.product-editorial [id]` 增加 `scroll-margin-top: 7rem`，仅覆盖本轮新增编辑区锚点；原 `#assurance` 和 CTA 不在该作用域内。
- `npx prettier --check src/styles/product/editorial-sections.css`、`npm run check:maintainability` 和 `git diff --check` 通过。390×844 本地直接打开 `#foundation` 与 `#product-care` 后，目标 top 分别为 112.4px / 111.6px，固定导航 bottom 为 62px，computed `scroll-margin-top` 均为 112px。未运行 build、未改组件/测试/全局样式、未执行外部操作。

### XYY-20260910-01 — 编辑区分屏尺度精修

- 仅更新三份 `.product-editorial` CSS：在 `>=1025px` 令五个新 section 以 `box-sizing: border-box` 的 `min-height: 55rem` 和上下 `7.5rem / 8rem` 留白居中；Hero 桌面字号上限调整为 `5rem`。小于该断点保持自然高度。
- 新容器在 `<=1024px` 使用 `min(1360px, 100% - 3rem)`，在 `<=760px` 使用 `100% - 1.5rem`，与保障区实际边距一致；保留 7rem 新锚点偏移和既有占位比例。
- 本地浏览器实测：1846/1440 宽五段均为 880px，编辑区与保障区容器同宽（1360px / 1345px）、无横向溢出；1024 为 961px/left 24，390 为 351px/left 12，均与保障区一致且无溢出。390 下新段保持流式高度，未应用桌面最小高度。
- Prettier、`npm run check:maintainability`、受保护文件 SHA-256 对比及 `git diff --check` 通过；未运行 build、未修改组件/测试/旧 CSS 或外部环境。

### XYY-20260910-01 — 编辑区内容布局续修

- 删除 `editorial.css` 中已由布局层覆盖的区块规则，保留基础变量、Hero、占位框和焦点样式；桌面维持统一1360px容器、自然内容高度和标题上方的三列核心服务。
- 手机核心服务改为三条全宽顺序项；商品处理的2×2与交付流程的2×3均重置为正确的行列分隔线。`<=900px` 时目录与流程占位框统一为 `1.7 / 1`，避免继承桌面比例形成过高空框；`<=600px` 保持适合手机的比例。
- 这是 Terra 的本地实现自测，非 Luna 独立结果：`resume-final-1440.png` 的五段高度为660/537/645/590/546px，总2978px；`resume-final-390.png` 确认三条服务全宽、四个空占位框保留及2列边线。随后以 Playwright 检查360、390、768、1024、1366、1440、1846px，均为零横向溢出；360/390为单列服务，其他所测桌面/平板宽度为三列服务。截图位于 `output/playwright/xyy-20260910-01-layout/`。
- 本轮运行 CSS Prettier、维护性预算、`git diff --check` 与 data/两份测试 SHA-256 对比；未运行 build、完整门禁、部署或外部/CMS/数据库操作。

### XYY-20260910-01 — 过程区桌面网格填满返工

- 将过程区两列改为可收缩的 `minmax(0, 0.65fr) minmax(0, 0.35fr)`，并令右侧空占位图 `width: 100%`、`min-width: 0`，消除 `aspect-ratio` 自动最小宽度导致的轨道外溢。目录与商品处理的桌面网格已实测填满容器，未改动。
- 1440px 实测容器、网格均为 `x=40 / width=1360 / right=1400`；过程轨道为 `846.562px + 57.6px + 455.828px`，右占位图实际 `x=944 / width=456 / right=1400`，左侧六步网格保持每项约282px 的3×2排列。过程截图为 `output/playwright/xyy-20260910-01-layout/resume-process-grid-1440.png`。
- 指定 CSS Prettier、维护性预算、`git diff --check` 与受保护 data/两份测试 SHA-256 对比通过；未运行 build、完整门禁、部署或任何外部/CMS/数据库操作。待 Luna 独立复核各视口与既有页面契约。

### XYY-20260910-01 — 编辑区无框分组返工

- 仅移除 `editorial-layout.css` 与 `editorial-responsive.css` 中核心服务、业务问题、商品处理和交付流程的列表/单元格 `border-top`、`border-left` 及不再需要的空重置规则；保留既有留白、内边距、网格、字号、尺寸和四个空占位框，未添加卡片背景或新布局。
- `npx prettier --check`（两份 CSS）、`git diff --check` 和 `output/playwright/xyy-20260910-01-borderless/protected.json` 的96份保护源码 SHA-256 对比通过。按本次 LOW 合同未运行应用测试、浏览器截图、build、完整门禁或任何外部操作；待 Luna 独立检查1440/390无横竖表格线与无横向溢出。

### XYY-20260910-01 — 编辑区统一滚动动效返工

- 仅为四个编辑组件的 Hero 文案、独立标题、列表直接子项容器和四个空占位框添加 `data-reveal="copy"`；独立节点以编辑区限定的 `data-reveal-self` 作为自身动画目标。`product-page.ts` 仅在该节点位于 `.product-editorial` 内时返回自身，原保障区和 CTA 的目标选择不变；不改共享动效参数、CSS、内容、链接或结构。
- 复用既有 `revealCopyOnScroll` 默认的上浮、淡入、模糊恢复、一次触发和 `clearProps` 契约。定向 E2E 在4322预览验证远处过程标题、首个步骤和空占位框滚动前为隐藏，进入视口后可见且不遗留 opacity/transform/filter 内联样式；既有末尾 CTA 进入用例继续通过。桌面与移动共2项通过。
- 相关 Astro/TypeScript/E2E Prettier 与 scoped ESLint、`npm run typecheck`（404 files，0 diagnostics）、维护性预算、`git diff --check` 均通过；93份保护源码 SHA-256 一致。未运行 build、完整门禁、外部/CMS/数据库操作。Luna 应独立复核1440/390正常、reduced-motion、无JS、深锚点快速到过程区以及无横向溢出。

### XYY-20260910-01 — 编辑区动效键盘可访问性返工

- 仅在 `editorial.css` 中为编辑区 copy 的真实动画目标覆盖 GSAP `autoAlpha` 写入的 `visibility`，维持其在 Tab 顺序内；目标或其后代获得焦点时，以同样局部 selector 恢复 `opacity: 1`、`filter: none` 与 `transform: none`。未改共享 helper、组件、动画参数、tabindex、全局事件或底部区域。
- `product-motion.spec.ts` 保留过程区滚动与 CTA 用例，并新增等待远处过程标题初始化为 `opacity: 0` 后，从 Hero CTA 连续 Tab 至 `foundation`、`returns`、`product-care-service` 和首个 needs 链接的回归；验证两类动画目标在焦点时均为最终可见状态且焦点轮廓存在。
- 两份文件 Prettier、测试 scoped ESLint、维护性预算、`git diff --check` 和92份保护源码 SHA-256 对比通过；`PLAYWRIGHT_PORT=4322 env -u CI npx playwright test tests/e2e/product-motion.spec.ts` 为4项通过（desktop/mobile 各2）。未运行 build、完整门禁或任何外部操作；待 Luna 继续验证 normal、focus、reduced-motion、无JS和深锚点路径。

### XYY-20260910-02 — 核心服务九项入口与导航下拉移除

- `EDITORIAL_SERVICE_SERIES` 改为依 `SPECIALTY_LINKS` 的既有顺序、标题和 href 生成九项，保留 `foundation`、`returns`、`product-care-service` 原锚点，其余入口使用唯一语义 id；简述仅提炼自各现有详情页，不新增公开数字。九个详情页及 `SPECIALTY_LINKS` 数据源均未改动。
- 桌面端“仓配服务”改为普通 `/product` 链接，移除箭头、`aria-haspopup` 与 popover；移动端移除九个子入口，保留同一主链接和详情页 `isProductActive` 样式。更新产品核心服务顺序/编号/链接预期、九项键盘顺序，并将 About/Cases 的旧 popover 断言改为普通链接无 popover；新增详情页下桌面 active 及手机仅7项主导航的行为断言。
- 指定六份源码/测试 Prettier 与 scoped ESLint、`npm run typecheck`（404 files，0 diagnostics）、维护性预算、`git diff --check` 均通过；`output/playwright/xyy-20260910-02/protected.json` 的617份保护源码 SHA-256 一致。按合同未运行浏览器、定向 E2E、build、完整门禁或外部操作；待 Luna 独立验证路由、菜单、九项网格、动效、键盘、reduced-motion、无JS与响应式。

### XYY-20260911-02 — 广州核心服务入口并入华南

- 从仅供 `/product` 核心服务列表使用的派生数组筛除 `/guangzhou-xiefu-yuncang`，保留 `SPECIALTY_LINKS`、旧广州详情、华南详情和其他消费者不变。类型谓词将筛选后的 href 收窄，使元数据索引保持 TypeScript 安全。
- 华南卡片仍为 07、链接 `/huanan-xiefu-yuncang`，说明更新为“华南区域仓网覆盖广州及珠三角，支持全渠道仓配、库存协同、退货质检与瑕疵修复。”；B2B 门店仓配顺延为 08 且保留 `store-fulfillment`。两份既有 E2E 同步为八项、无广州独立卡片/链接、精确华南说明及从华南到 B2B 的键盘顺序。
- 已按合同运行指定文件 Prettier PASS、scoped ESLint PASS、`npm run typecheck` PASS（404 files，0 errors、0 warnings、0 hints）、`git diff --check` PASS 和 18 项保护源码 SHA-256 对比 PASS；浏览器与两端定向 E2E 留给 Luna 独立执行。未运行 build、完整 verify、提交、推送、部署或外部/CMS/数据库操作。

- 同 Task 顺序续办：只在产品专用派生数组使用本地八项顺序表，严格生成 01 鞋服云仓、02 退货质检、03 后整修复、04 跨境云仓、05 华南鞋服云仓、06 华东鞋服云仓、07 直播电商仓配、08 B2B 门店仓配；共享 `SPECIALTY_LINKS` 未改，文案、id 和 href 均保留。两份既有 E2E 同步卡片与键盘顺序。
- 本次指定 Prettier PASS、scoped ESLint PASS、`npm run typecheck` PASS（404 files，0 errors、0 warnings、0 hints）、`git diff --check` PASS 及 18 项保护源码 SHA-256 对比 PASS；未运行浏览器、定向 E2E、build、完整 verify 或外部操作。

### XYY-20260911-03 — 仓配首屏原图与鼠标立体交互

Status: CODE DONE（源码冻结；待 Luna / Nova 独立验证）

- 首屏右侧空占位替换为独立 `ProductWarehouseVisual`。原图以 `1672 × 941`、SHA-256 `75bf437e1000d9476bc03016075f9b43c5b1cfcde7943a5a173fc16c0afce40e` 原样复制到 `/images/product/warehouse-flow-20260911.png`，桌面保留左右布局；`<=900px` 随既有单列布局在文案下完整显示。其余三个占位、左侧标题和咨询入口未改。
- GSAP 入场仍作用于外层 `data-reveal-self`；指针倾斜、高光与两层绿色光环限定在独立内层。仅在桌面 fine-pointer hover 时启用：指针事件写入目标角度，有限 rAF 插值至稳定值，离开平滑回正；光环只在 hover 循环。无 JS 时 `<img>` 仍直接渲染。
- 生命周期由 `IntersectionObserver`、页面 visibility、`prefers-reduced-motion`、fine-pointer 与 `min-width: 901px` 媒体查询共同约束。离屏、隐藏、减少动效或媒体改变时取消 rAF、清零角度并移除光环；运行时媒体变化已监听。触屏和移动端未绑定滚动阻断逻辑且保持静态。
- 实现侧验证 PASS：指定文件 Prettier、scoped ESLint、`npm run typecheck`（406 files，0 errors / warnings / hints）、`npm run check:maintainability`、`npm run check:assets`（57引用资产、103部署资产）和 `npx vitest run tests/unit/image-cache-contract.test.ts`（1 file / 9 tests）均通过；`git diff --check` 通过，基线947项保护 hash 为0 mismatch。未运行 build、完整 verify、提交、推送、部署、CMS 或数据库操作。
- Luna 重点：在4322独立核对1440/390/360无溢出和完整图片，鼠标倾斜/高光/离开归位，离屏与隐藏停动、运行时 reduced-motion 和宽度/指针媒体变化、无JS静态图与既有键盘顺序；Nova 复核仅所有权文件变更、GSAP transform 隔离及动画生命周期。

- 同 ID 生命周期续修：`pointerenter` 与 `pointermove` 均要求元素可见；`pointermove` 负责恢复 hover active 状态；`pointerleave` 无条件清零目标、移除 active 并尝试调度回正，避免页面可见性重置后“再次移动再离开”遗留倾斜。只重跑 TS Prettier、scoped ESLint 与 `npm run typecheck`，均 PASS（406 files，0 errors / warnings / hints）。

### XYY-20260911-04 — 仓配首屏右侧视频

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- `ProductEditorialHero` 的右侧空占位替换为原生 `<video>`：`controls`、`playsinline`、`preload="none"`、`width="854"`、`height="480"`、指定可访问名称、poster 与 MP4 source；未设置 autoplay，未添加 JS。组件内样式仅令播放器宽度100%、原始 `854 / 480` 比例和 `0.3rem` 圆角，手机随既有首屏单列位于文案下。
- 使用 `ffmpeg -map 0 -c copy -movflags +faststart` 把输入 MP4 重封装为 `public/videos/warehouse-fulfillment-20260911.mp4`，无重编码；输出为 H264 854×480、AAC、88.167秒。Sol 提供的52秒封面原样复制为 `public/videos/warehouse-fulfillment-20260911-poster.jpg`。
- 三份既有测试仅作受影响适配：占位数为3，Hero video/poster/source 属性断言存在；键盘测试先确认咨询 CTA 后聚焦原生播放器，再从 `foundation` 显式开始核对既有服务链接顺序，避免依赖浏览器播放器内部控件 Tab 序列。
- 验证 PASS：指定 Prettier、scoped ESLint、`npm run typecheck`（404 files，0 errors / warnings / hints）、维护性检查、`npx vitest run tests/unit/image-cache-contract.test.ts`（1 file / 10 tests）、`git diff --check`，以及04基线944项保护 hash（0 mismatch）。Sol 已确认重封装前后音视频流 SHA-256 相同，且本地 Range 返回 HTTP206/1024 bytes/`video/mp4`。未运行浏览器、build、完整 verify、提交、推送、部署、CMS 或数据库操作。
- Luna 重点：4322下1440/390播放器布局及3个剩余占位、首帧封面、controls 播放/暂停/音量、实际解码帧与不自动下载/播放，以及受影响 E2E 键盘顺序。

### XYY-20260911-05 — 补齐仓配页三张生成插画

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 原目录、商品整理与交付流程的三个空占位均保留原 class 和 `data-reveal="copy" data-reveal-self` 外壳，改为带 `data-product-visual` 的本地图片：入库与库存协同、商品质检整理、打包出库交付。每张均使用描述性 alt、`loading="lazy"`、`decoding="async"` 和1536×1024属性。
- `editorial.css` 仅增加图片 wrapper 的相对定位、隐藏溢出和绝对 `object-fit: cover`；目录与流程居中裁切。商品整理图在其既有宽幅比例内使用 `object-position: center 35%`，保留衣物和工具主体。
- 受影响断言更新为0个空占位、3张精确本地图路径，过程区动效定位切换到 `data-product-visual`；image-cache 增加三资源存在检查。Hero 视频、文案、链接、数据和共享动效未改。
- 验证 PASS：指定 Prettier、scoped ESLint、`npm run typecheck`（404 files，0 errors / warnings / hints）、维护性检查（home-product 218/220行）、资产检查（61引用、103部署资产）、`npx vitest run tests/unit/image-cache-contract.test.ts`（1 file / 13 tests）和 `git diff --check`。Sol 已核对943项保护 hash 为0 mismatch，且三图均为本地1536×1024 PNG。未运行浏览器、build、完整 verify、提交、推送、部署、CMS 或数据库操作。
- Luna 重点：4322下1440/390三图实际HTTP加载、主体裁切、无横向溢出、入场显示和指定既有E2E；若生成图主体在既有比例内不可辨，再回 Sol 协调，不改变全局版式。

### XYY-20260911-06 — 取消需求区六项跳转

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- `EDITORIAL_NEEDS` 仍提供原编号、标题、说明与顺序，但渲染时不再取用 `href`；需求区六项由 `<a>` 变为静态 `<article>`。未增加按钮、tabindex 或其他交互目标。
- 仅将 `editorial-layout.css` 与 `editorial-responsive.css` 中 `.product-editorial__needs a` 及偶数项选择器改为 `article`，保留尺寸、间距、颜色、网格和 `data-reveal="copy"` 入场外壳。核心八项服务链接、Hero 视频、三图片与其他页面链接未改。
- Home E2E 改为六个静态article及零 `a/button/[tabindex]` 断言；motion 键盘用例移除需求区目标并明确断言该区没有交互子项，原八项服务键盘顺序保留。
- 验证 PASS：指定 Prettier、scoped ESLint、`npm run typecheck`（404 files，0 errors / warnings / hints）、维护性检查（home-product 216行）、`git diff --check`；本次948项保护 hash 为0 mismatch。未运行浏览器、build、完整 verify、提交、推送、部署、CMS 或数据库操作。
- Luna 重点：4322下1440/390静态需求项的排版、无跳转/无焦点、入场显示和八项核心服务键盘顺序。

### XYY-20260911-07 — 三张插画改为透明背景物品

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 三组件改用 Sol 生成的透明物品 PNG：目录图为1536×1024的入库、库存与退货处理物品组合；商品整理图为2164×727的分类、清洁、修复与重新包装物品组合；交付流程图为1536×1024的验收、扫码、打包与交付物品组合。实际 `file` 检查均为RGBA PNG，组件宽高属性与实际尺寸一致。
- `data-product-visual` 容器背景设为透明，图片使用 `object-fit: contain`，不保留旧浅灰底或裁切重要物品。商品整理手机图框从旧 `1.35 / 1` 改为与素材接近的 `3 / 1`，减少透明留白，文字区和其他布局保持。
- Home E2E 三个精确路径与 image-cache 三项资源存在断言更新为 objects 资产。原05 PNG 未删除但不再引用；06六项静态article、核心八项链接、Hero视频及现有入场外壳均未改。
- 验证 PASS：指定 Prettier、scoped ESLint、`npm run typecheck`（404 files，0 errors / warnings / hints）、维护性检查（home-product 216行）、资产检查（61引用、103部署资产）、`npx vitest run tests/unit/image-cache-contract.test.ts`（1 file / 13 tests）、`git diff --check`；1103项保护 hash 为0 mismatch。未运行浏览器、build、完整 verify、提交、推送、部署、CMS 或数据库操作。
- Luna 重点：4322下1440/390透明白底、三图完整主体/无溢出、care横幅比例、入场显示及相关定向E2E。

### XYY-20260911-09 — 仓配页七区统一桌面规格

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 新增仅限 `.warehouse-services-page` 的 `uniform-sections.css`，在 `min-width: 901px` 使 Hero、核心服务、需求、商品整理、流程、保障和 CTA 七个根区均为 `width: min(100%, 913px)`、`height: 881px`、居中且采用 `border-box`；导航和页脚未受影响，`<=900px` 不应用这些规则。
- 在固定框内以局部容器宽度、间距、字号和网格尺寸适配内容；不使用裁切、隐藏或区内滚动。图像与视频未被拉伸；保障机制的说明恢复正常换行，使长文本保持在固定框内。
- 本地 Playwright CLI 自测：1440下七区均为 `x=263.5 / 913×881px`，913下均为 `x=0 / 913×881px`，根区 `scrollHeight` 均等于 `clientHeight`，文档 `scrollWidth` 等于 `clientWidth`；1440下逐文本 Range 边界无区外内容。900及390宽度快检同样无横向溢出。
- 验证 PASS：指定 Prettier、`npx eslint src/pages/product.astro`、`npm run typecheck`（404 files，0 errors / warnings / hints）、`npm run check:maintainability`、`git diff --check`，以及1113项保护文件 SHA-256（0 mismatch）。未运行 build、完整 verify、E2E、提交、推送、部署、CMS或数据库操作。
- Luna 重点：4322下1440/913验证七个固定区的尺寸、居中与完整内容，390/900检查自适应无横向溢出，并复核既有Hero视频、三张透明图、核心服务链接与静态需求项没有回归。

### XYY-20260911-10 — 服务保障机制图标与文字重叠修复

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 仅更新 `assurance.css` 的机制列表：五列固定网格改为以 `14rem` 最小轨道宽度自动适配；空间不足时自然换列，窄屏既有单列媒体规则保持有效。
- 图文条目改为顶部对齐，文字容器显式 `min-width: 0`；机制说明恢复正常换行并允许长词断行。图标、标题、说明、数字和 SVG 均未修改，未通过缩小文字或裁切掩盖问题。
- 验证 PASS：`npx prettier --check src/styles/product/assurance.css`、`git diff --check`，以及1112项保护文件 SHA-256（0 mismatch）。按本次纯 CSS LOW 合同未运行浏览器、typecheck、build、完整 verify、测试、提交、推送、部署、CMS或数据库操作。
- Luna 重点：4322下1440、1021、913与390检查五项机制的图标/文字无重叠、无区内或页面横向溢出、说明完整可读，以及<=760px既有单列展示。

### XYY-20260911-11 — 核心八项服务悬停反馈

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 仅在 `editorial-sections.css` 为核心服务的既有八个 `article` 增加浅绿背景、12px圆角的 inset 细绿边与柔和阴影；卡片语义、链接范围、初始尺寸和网格均未改变。
- `:focus-within` 在所有设备保留同等静态高亮；仅在 `(hover: hover) and (pointer: fine)` 下，卡片用独立 CSS `translate` 上浮4px，箭头右移4px。此属性不覆盖 GSAP 的 `transform`，且不会把卡片变为可点击目标或设定 `cursor:pointer`。
- `prefers-reduced-motion: reduce` 下明确移除卡片/箭头 transition 与 translate，静态背景、边线和阴影仍保留；无 `transition: all` 或常驻 `will-change`。
- 验证 PASS：`npx prettier --check src/styles/product/editorial-sections.css`、`git diff --check`，以及1113项保护文件 SHA-256（0 mismatch）。按合同未运行浏览器、typecheck、build、完整 verify、E2E、提交、推送、部署、CMS或数据库操作。
- Luna 重点：4322下逐项检查桌面 hover/离开复位与键盘 focus-within，390触屏无 hover 依赖，reduced-motion 无移动但有高亮，并运行指定 product-motion 定向回归。

- 同 ID 用户扩展与返工：核心服务现以既有“了解更多”链接的绝对定位 `::after` 覆盖其所属卡片，编号、正文和留白均命中原 href；未新增 DOM、JS、tabindex 或路由，Tab 顺序仍是八个原链接。卡片相对定位并使用 `cursor: pointer`，但自身不成为新的交互元素。
- 上浮与箭头位移媒体条件改为同时要求 fine pointer、hover 与 `prefers-reduced-motion: no-preference`，因此 reduced-motion 无需依赖低优先级重置规则即可稳定不移动；静态高亮和链接焦点轮廓保持。

### XYY-20260912-04 — 视频说明可读性和详情橙色链接

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 仅更新`video-sequence.css`的既有说明与详情链接规则：说明由78%透明白调整为`#fff`、`font-weight: 600`、`font-size: clamp(1.125rem, 1.65vw, 1.375rem)`（18–22px），短横屏为1rem（16px）；详情链接改用现有`var(--color-brand-orange)`。
- 未改标题、DOM、文案、媒体、JS、焦点样式、导航或任何布局参数；未引入遮罩、渐变、背景、滤镜或文字阴影。验证 PASS：指定CSS Prettier、`git diff --check`与1149项保护hash（0 mismatch）。按纯CSS合同未运行typecheck、单测、浏览器/E2E、build或完整verify，未提交、推送、部署或操作CMS/数据库。
- Luna重点：4322下1440×900和390×844确认七段说明为纯白/600字重/更大字号，详情链接为品牌橙色且可点击；保持文字在视频内、Header/胶囊无遮挡、无遮罩和无横向溢出。

### XYY-20260912-03 — 视频文字居中放大并取消遮罩

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 仅更新`video-sequence.css`：移除slide渐变伪元素和文字组的绿色装饰线，文字组改为覆盖整个slide的无背景居中网格。视频继续以原有`100dvh`、`object-fit: cover`和原始亮度显示，未添加背景、遮罩、滤镜或文字阴影。
- 桌面标题使用`clamp(3.5rem, 4.5vw, 4rem)`，1440px为64px；移动端使用`clamp(1.9rem, 9vw, 2.5rem)`，390/360均不低于30px。正文提高至`clamp(1.05rem, 1.5vw, 1.25rem)`，链接为1.05rem。文字以对称水平安全边距和居中对齐避开胶囊；低矮横屏压缩字号、行距与段间距，保持内容在视口内并避开Header。
- 未改组件DOM、文案、数据、媒体、导航脚本、胶囊样式或任何测试源码。验证 PASS：指定CSS Prettier、`git diff --check`及1149项保护hash（0 mismatch）。按纯CSS合同未运行typecheck、单测、浏览器/E2E、build或完整verify，未提交、推送、部署或操作CMS/数据库。
- Luna重点：4322下1440×900、390×844、360×844、844×390验证七段文字组在画面内居中、Header/胶囊无遮挡、无横向溢出或段间白线；确认视频无渐变/遮罩/滤镜/文字阴影，链接、胶囊、滚动与自动静音循环保持。
- 同 ID 桌面标题小修：1440截图显示`18ch`将首段标题不必要地拆为两行。仅改为`18em`，仍由文字组对称安全边距限制，允许桌面完整一行，移动端继续自然换行。指定CSS Prettier、`git diff --check`与1149项保护hash均PASS；未重跑typecheck、单测、浏览器或E2E，Luna待恢复最终验证。

### XYY-20260912-02 — 视频上方的服务内容

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 仅在七段视频既有数据中增加标题、说明、详情路径和链接文案，保留全部既有 `id`、`label`、`src`、`poster` 与媒体顺序。首段使用可见的唯一H1“鞋服品牌的一站式仓配服务”，后六段为H2；每段35–65字说明仅概括既有基础仓配、退货质检与商品整理范围，不新增数字、时效、赔付或其他承诺。
- 每个原有slide现在先输出独立深色文字区，再紧接原生视频。文字区采用细绿短线、白色标题和绿色原生详情链接，未覆盖视频或增加卡片；默认仍为一段一视口，视频以cover填满文字后的剩余高度。文字区为固定Header留出顶部空间并预留胶囊侧边空间；短横屏转为自然高度和原比例视频，避免文本或链接裁切。
- 更新既有home-product断言，确认单一可见H1、六个H2、七个文字区、首段真实服务链接，以及首段文字区底边不越过视频顶边。未改滚动导航脚本、`product.astro`、Schema、媒体或任何共享结构。
- 验证 PASS：指定Prettier、scoped ESLint、`npm run typecheck`（407 files，0 errors / warnings / hints）、`npx vitest run tests/unit/image-cache-contract.test.ts`（1 file / 22 tests）和`git diff --check`。Sol已只读确认三类详情链接本地HTTP200；未由Terra运行浏览器/E2E、build、完整verify、提交、推送、部署、CMS或数据库操作。
- Luna重点：4322下1440×900、390×844与844×390检查全部七段文字在视频上方且不重叠，Header/胶囊不遮文字、无横向或双重滚动，短横屏自然高段落仍可吸附/切换；继续验证自动静音循环、无controls、按钮计数和首尾状态。
- 同 ID 移动端标题收口：根据390截图，首段H1末行出现单字。仅在既有H1/H2局部规则增加`text-wrap: balance`，不改变文案、字号、可用宽度或其他布局。指定CSS Prettier、`git diff --check`与1147项保护hash均PASS；未重跑typecheck、单测、浏览器或E2E，待Luna复核390/360换行并完成最终E2E。
- 同 ID 布局纠正：用户明确文案应叠加在视频画面顶部，上一版独立深色文字带与短横屏自然增高规则不再适用。仅在局部CSS中恢复每段`100dvh`，使视频绝对铺满slide，文字以上层透明渐变显示并保持Header/胶囊安全间距；组件DOM、文案、媒体和导航脚本均未改。home-product位置断言改为视频四边覆盖slide、标题/链接均在视频边界内且首段标题位于Header下方。指定CSS/test Prettier、scoped test ESLint、`git diff --check`和1149项保护hash均PASS；未按本次纯CSS/断言返工重跑typecheck、单测、浏览器、E2E、build或完整verify。Luna待复核1440、390、360与844×390真实叠加画面、链接可点及滚动切换。
- 同 ID 遮罩小修：短横屏和手机长说明会接近原渐变的过早透明区。仅将slide伪元素改为从顶部延至`min(100%, 34rem)`，在62%后才自然渐隐，文字后保持半透明遮罩且不形成实体色带；未改DOM、字号、位置、测试或其余布局。指定CSS Prettier、`git diff --check`和1149项保护hash均PASS，待Luna复核实际截图。

### XYY-20260911-14 — 单屏视频滚动与右侧胶囊导航

Status: CODE DONE（源码冻结；待 Luna 独立验证及 Nova Review）

- 仅重构 `ProductVideoSequence`、其局部样式和新增的 `product-video-navigation.ts`：七段视频置于唯一的 `100dvh` 原生纵向滚动容器，每段同为一个视口高，使用 `scroll-snap`、无段间 margin/gap，视频以 `object-fit: cover` 等比填满。容器隐藏自身滚动条但保留原生滚轮、触摸和键盘滚动；页面本身不再产生第二个视频滚动区域。
- 右侧新增固定深灰玻璃胶囊，层级为40，低于既有Header的50。上下按钮均44px，具有中文无障碍名称、可见焦点和首尾 disabled 状态；中间序号以 `01 / 07` 形式随手动滚动更新。脚本只滚动本地容器：快速连续点击维持目标索引，wheel、触摸或键盘输入会取消待完成的程序滚动并交由原生滚动同步；无播放状态管理、全局方向键拦截或新增依赖。
- 保留七段的 `autoplay`、`muted`、`loop`、`playsinline`、`preload="auto"` 与无 `controls` 属性，未改媒体和数据文件。`prefers-reduced-motion` 下CSS和按钮均使用即时滚动、禁用控件过渡。
- 更新受影响的产品E2E断言：确认单一滚动容器、七个视口段、胶囊初始状态及自动播放属性；`product-motion` 还覆盖按钮键盘启动、手动滚至末段后的序号/禁用状态，以及减少动效时的即时滚动。
- 验证 PASS：指定 Prettier、scoped ESLint、`npm run typecheck`（407 files，0 errors / warnings / hints）。未运行E2E、浏览器截图、build、完整verify、提交、推送、部署、CMS或数据库操作。
- Luna 重点：4322下1440×900和390×844检查每段恰占一个视口、无段间白线/横向或双重滚动；验证胶囊在Header和手机菜单下方、按钮点击/快速点击/手动滚动后的序号与首尾禁用、键盘焦点、reduced-motion即时滚动以及媒体持续自动静音循环。Nova重点：审阅脚本只绑定本地容器且不改变视频播放状态、全局键盘或共享布局。
- 同 ID 定向单测返工：胶囊新增的 `data-product-video-*` 与 `aria-controls` 属性使旧的宽泛字符串匹配误计视频标记或误判存在播放器控件。仅将 image-cache 断言收紧为精确 `data-product-video` 属性边界及 `<video>` 开标签内的 `controls` 属性；资源、自动播放与其他资产断言均保留。`npx vitest run tests/unit/image-cache-contract.test.ts` 为1 file / 22 tests PASS，指定Prettier和scoped ESLint PASS；未改应用代码，未重跑typecheck、E2E、build或完整verify。
- 同 ID 导航E2E自检：按钮前进后先轮询至第二段的实际 `offsetTop`（1px容差）再模拟手动滚至末段，避免中途取消程序滚动造成假失败。减少动效用例显式检查计算后的 `scroll-behavior: auto`，点击后直接比较第二段目标位置（1px容差），而非仅判断滚动超过任意阈值。仅更新测试，指定Prettier和scoped ESLint PASS；浏览器E2E仍待Luna独立执行。
- 最终测试类型收口：Playwright `evaluate` 回调的元素联合类型未直接声明 `offsetTop`，仅在两处已知视频 `section` 上缩窄为 `HTMLElement`，断言逻辑未变。指定Prettier、scoped ESLint、`npm run typecheck`（407 files，0 errors / warnings / hints）和`git diff --check`均PASS；此前407 files通过记录不适用于加入offsetTop断言后的中间版本。
- Luna定向复测前修复：首段导航的 `expect.poll` 在浏览器上下文执行，漏传Node侧的 `secondOffset` 导致两个项目抛出 `ReferenceError`；现将它作为 `locator.evaluate` 的第二参数显式传入，其他断言与应用源码未改。Luna此前8项浏览器QA已PASS，仅此用例在两项目失败待复测。指定Prettier、scoped ESLint和`npm run typecheck`（407 files，0 errors / warnings / hints）均PASS；未由Terra重跑浏览器/E2E。

### XYY-20260911-13 — 七段全宽无声视频顺序展示

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- `/product` 主体现在只渲染 `ProductVideoSequence`：按总览、仓储、拣货、质检、后整、打包、出库顺序输出七个本地原生 `<video>`。各播放器为 `854 × 480`、`autoplay`、`muted`、`loop`、`playsinline`、`preload="auto"`，带各自 poster 和 H264 source；无 `controls`、播放/暂停入口或新增 JS。仅保留无视觉文本的 h1 和播放器 aria-label。
- 视频样式只在新 `video-sequence.css` 生效：页面宽度100%、高度自适应、保持854:480原比例、无最大宽度或固定区高；顶部为固定导航预留空间，视频间距紧凑，窄屏继续全宽。Layout 使用已有 `showFooter={false}` 与 `showFloatingContact={false}`，导航仍保留。
- `product.astro` 不再导入旧产品样式或 loader，主区域不输出旧文案、服务卡片、图片或 CTA；旧组件、CSS、JS、资产均未删除。按 Sol 审阅保留原 title、description、服务 JSON-LD 与 Breadcrumb JSON-LD。
- Sol 冻结的媒体清单确认七段均为854×480、30fps、仅H264视频轨、无音轨、faststart且完整解码；总时长78秒，所有 MP4/JPG 均在本地且非空。
- 验证 PASS：指定 Prettier、scoped ESLint、`npm run typecheck`（406 files，0 errors / warnings / hints）、`npx vitest run tests/unit/image-cache-contract.test.ts`（1 file / 22 tests）。未运行 E2E、build、完整 verify、提交、推送、部署、CMS或数据库操作。
- Luna 重点：4322下1440/390确认主体仅七视频、全宽比例和无横溢出；七段自动静音循环、无 `controls` 且无音轨，首段实际播放进度推进；Footer/悬浮入口隐藏，并运行更新后的 product E2E。

- 同 ID 用户新要求替代首轮 controls 方案：七段统一改为原生 `autoplay muted loop playsinline preload="auto"`，移除 `controls`，不增加播放/暂停入口、自动播放脚本或可见性暂停逻辑。静音来自元素属性且媒体文件继续无音轨；全宽比例、顺序、Header 与 Footer/悬浮入口的隐藏状态不变。
- 受影响 E2E 已改为断言所有段自动播放、循环、静音、无 controls 和预加载；`product-motion` 不再测试暂停或控件，改为在首段 `paused === false` 后等待实际 `currentTime > 0.1`。本轮指定 Prettier、scoped ESLint、`npm run typecheck`（406 files，0 errors / warnings / hints）和 image-cache 定向单测（1 file / 22 tests）均 PASS；未执行 E2E、build、完整 verify、提交、推送、部署、CMS或数据库操作。

### XYY-20260913-13 D — 华南鞋服云仓区域重设计

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- `/huanan-xiefu-yuncang` 通过 `south` 显式展示分支接入独立 `SouthNetworkPage`。首屏保留原 CMS 说明和洁净 Hero 视频，城市行改为可自然换行的四个语义片段；旧 Signature、unique 与 Experience 组合不参与此页。
- 选仓区为非实际坐标的广州主节点协同示意，左侧连接东莞、佛山、肇庆，右侧只呈现当前节点资料。原生按钮支持键盘和触屏切换；JS 仅隐藏未选资料并将焦点带到当前资料，无 JS 时四份资料按顺序完整可读。`4区域`、`30万㎡+` 保持为整张华南仓网口径。
- 工厂与品牌货源入仓、渠道订单履约、就近退货处理改为三条纵向业务带；仓容、人力、物流、系统改为四行项目确认对照。运输参考使用原 `contentDesc` 与现有仓内统计，未新增硬编码时效；所有 feature 选择器限定在 `.south-page`。South CSS 拆为 79/168/163 行模块。
- 验证：4322 HTTP 200；`npx vitest run tests/unit/service-redesign-south.test.ts` 为 2/2 PASS；`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-south.spec.ts --project=chromium --project=mobile --workers=1` 为 4/4 PASS（日志 `output/playwright/xyy-20260913-13/D/terra-south-e2e.log`）；共享服务矩阵与 motion PASS。`npm run typecheck` 为 458 files、0 errors/warnings/hints；指定 Prettier、scoped ESLint、`git diff --check` PASS。
- 限制：同次 `service-pages.spec.ts` 的无关新闻页用例失败，当前页面未出现旧断言“当前暂无已发布文章”；服务矩阵本身已通过，原始输出为 `output/playwright/xyy-20260913-13/D/terra-shared-e2e.log`。未建立 AstroContainer 的 full/empty/partial 离线组件 fixture；Luna 应补核 partial/empty 和无 JS 四份节点资料自然高度。未运行 build、完整 verify、提交、推送、部署、CMS 或数据库操作。

- 同 ID D Luna 定向返工：仅在 `south-content.css` 的 `<=760px` 区间为运输参考内层网格追加 `grid-template-columns: 1fr`。原运输说明保持完整全宽，既有截单统计顺序置于其后；桌面双列和其他模块未改。390×844 计算列为 `358px`、360×800 为 `328px`，两子项同宽且文档 `scrollWidth === clientWidth`；对应截图为 `D/terra-retest-reference-390.png` 与 `D/terra-retest-reference-360.png`。指定 CSS Prettier 和 `git diff --check` PASS；未按合同重跑 typecheck、全矩阵、build 或完整 verify，待 Luna 定向复测。

### XYY-20260913-13 E — 华东库存布局

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- `/huadong-xiefu-yuncang` 改为显式 `east` 展示分支，使用独立 East 页面而不再渲染旧编辑式模块。首屏为横向标题带、洁净 Hero 视频和仅含上海/昆山/合肥的仓点索引；原完整 h1、heroDesc 与 contentDesc 均有可见去向。
- 核心为五行目的地区域目录，分别保留城市组、所属省份、参考次日达和“具体以线路和合同SLA为准”。原生 details 可通过键盘展开核验说明，常驻条件不依赖 hover；三条自然高度业务带、华东/华南 OMS 协作、上海青浦/本地商务/系统费用条件与仓内截单分别呈现。六项 feature 各一次，未知项归入 support 并输出完整标题与说明。
- 验证：4322 HTTP200；`npx vitest run tests/unit/service-redesign-east.test.ts` 为 2/2 PASS；East Chromium/mobile/noJS E2E 为 4/4 PASS（`E/terra-east-e2e.log`）；共享服务矩阵为 2/2 PASS（`terra-shared-pages-e2e.log`）；legacy motion grep 为 chromium 1 PASS、mobile 1 configured skip（`terra-shared-motion-e2e.log`）。指定 Prettier、scoped ESLint、`npm run typecheck`（466 files，0 errors/warnings/hints）和 `git diff --check` PASS。
- 初步视觉证据：`E/terra-east-1440-core.png`、`E/terra-east-390-core.png`。未建立 AstroContainer 的 full/partial/empty 离线组件 fixture；Luna 应独立补核这些输入边界、360无溢出、五行目录的展开提示与无JS完整性。未运行 build、完整 verify、提交、推送、部署、CMS 或数据库操作。
- 同 ID E Luna 定向返工：仅在 `east-layout.css` 的 `<=760px` summary 增加 `padding-right: 1.75rem`，为右侧原生 details `+/-` 保留独立空间，桌面网格不变。Playwright 计算结果显示390px五行省份右边界均为346px、指示符右边界374px；360px分别为316px和344px，均有28px间隔且 `scrollWidth - clientWidth` 为0。局部截图与计算证据为 `E/terra-retest-east-{390,360}.png` 和 `terra-retest-east-{390,360}-computed.json`。指定CSS Prettier与 `git diff --check` PASS；未按合同重跑typecheck、全矩阵或E2E，待Luna定向复测。

### XYY-20260913-13 F — 直播场次叙事

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- `/zhibo-cangpei` 改为显式 `live` 展示分支，使用独立 `LiveCommercePage`，不再输出旧挑战卡和平台表。首屏以黑色大标题、旁侧说明和向右展开的原 Hero 视频组成；完整原 h1、heroDesc、contentDesc 均有可见去向。
- 主体按开播前、集中出单、场后履约三个不等宽章节组织，场次节奏图仅表示准备与订单集中关系，不含实时数据或业绩数字。平台订单/库存、仓内作业和状态回传形成静态链路；接口范围与联调前提相邻展示。MCN 段保留独立分区、权限、单据/报表及统一或分别结算的条件。六项 feature 各一次，截单服务 title=desc 仅渲染一次且同时保留两个数据标记；未知项进入 support。
- 本地开发服务器曾因并行文件创建保留旧 Vite SSR 模块缓存，表现为直播与退货页 HTTP500；当前源码 `astro check` 无诊断，按本地开发授权重启127.0.0.1:4322后两路由均HTTP200。此为本地缓存恢复，未改端口配置或生产进程。
- 验证：helper unit 2/2 PASS；AstroContainer 边界实际渲染 2/2 PASS（full/unknown-long、desc-only、stats-only、FAQ-only、empty及ARIA）；Live E2E Chromium/mobile/noJS 4/4 PASS；共享服务矩阵 Chromium/mobile 2/2 PASS；受影响 shared motion Chromium 1/1 PASS。指定 Prettier、scoped ESLint、`npm run typecheck`（473 files，0 errors/warnings/hints，`F/terra-live-typecheck.log`）和 `git diff --check` PASS。
- 预览证据：`F/terra-live-1440-core.png`、`F/terra-live-390-core.png`。未运行build、完整verify、提交、推送、部署、CMS或数据库操作。Luna 应独立检查1440/1024/390/360的自然断行/无溢出、视频实际播放、无JS和reduced-motion下三章与链路完整、FAQ键盘和空/partial边界。

### XYY-20260913-13 G — B2B 门店分货

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- `/b2b-mendian-cangpei` 使用本页专属 B2B Hero、分货板、补货段和系统段。首屏保留原 h1、h1sub、heroDesc、原静音循环视频与视频外文字；标题以三个完整短语换行，旁侧是补货单字段示意。
- 分货板以明确示例门店 A/B/C 展示门店、SKU、颜色、尺码、数量和箱号。原生门店按钮仅同步强调对应明细和箱标；无 JS 时全量信息仍可读。桌面以不等宽明细/箱标/字段说明布局，手机按 A 明细+箱标、B 明细+箱标、C 明细+箱标连续排列。
- 六项原 feature 根据标题语义各输出一次：分货和标签在分货板，换季铺货在三种补货段，ERP、物流与一盘货在系统段；未知项完整落入系统补充。日常、换季和展会/临时需求保留原场景限定与参考数字，ERP 品牌、系统使用费条件、线路/合同 SLA、4 stats、六行 B2C/B2B 对照、5 FAQ、`contentDesc`、`/contact`、`/cases`、`/product` 均保留。
- 验证 PASS：HTTP 200；helper unit 2/2、AstroContainer full/unknown-long 与 desc-only/stats-only/FAQ-only/empty 边界 2/2；本页 E2E Chromium/mobile 各 3/3；共享 service-pages 首矩阵 Chromium/mobile 各 1/1；legacy service-motion Chromium 首矩阵 1/1。指定 Prettier、scoped ESLint、`npm run typecheck`（482 files，0 errors/warnings/hints）与 `git diff --check` 通过。原始 stdout 位于 `output/playwright/xyy-20260913-13/G/terra-b2b-*.stdout.txt`。
- CSS 已按职责拆为 46/73/126/125 行四份；组件均不超过 180 行。视觉证据为 `G/terra-b2b-1440-core.png` 与 `G/terra-b2b-390-core.png`。未运行 build、完整 verify、提交、推送、部署、CMS 或数据库操作。G 实现已冻结，Luna 独立验收尚在执行，结果以实际 `luna-result` 证据为准。

### XYY-20260915-03 — 后整修复页重设计

Status: CODE DONE（本地实现冻结；待 Luna 独立验证与 Nova Review）

- `/houzheng-xiufu` 改为六个顺序区域：服务名与宽幅原视频、按输入顺序开放的 feature 列表、三工位与九专区、四步与两种复检结果、统计口径、FAQ 与咨询准备。唯一 H1 使用解析服务名称；Hero 的视频 src/poster、16:9、autoplay/muted/loop/playsinline 和无 controls 保持。
- 三工位对真实图片做渐进增强：无 JS 时三组图文均可读；JS 后可点击或用方向键、Home、End、Enter/Space 操作，首尾 Home/End 均阻止浏览器滚动。主图使用固定 16:10 contain 画框，图注预留稳定高度；当前工位文字随 aria-selected 同步。工位、流程、口径、FAQ 及关联链接保留原内容和既有数据来源，不改 CMS/SEO/媒体。
- 验证：指定 Prettier、scoped ESLint、`git diff --check` 均 PASS；`npm run typecheck` 为 485 files、0 errors/warnings/hints；`npx vitest run tests/unit/service-redesign-repair.test.ts` 为 2/2 PASS；Repair E2E Chromium 为 2/2 PASS，包含无 JS 内容、键盘边界和 1024 无横向溢出；共享 `service-pages.spec.ts` Chromium 为 3/3 PASS。视觉证据为 `output/playwright/xyy-20260915-03/terra/repair-1440x900-final2.png`、`repair-1024x768-final2.png`、`repair-390x844-final3.png`、`repair-360x800-final3.png`。
- 限制：`npm run check:maintainability` 仍因范围外既有 `ServiceLanding.astro`、`video-sequence.css`、`home-product.spec.ts` 超预算失败；本轮触及的组件、脚本和拆分 CSS 均低于预算。未运行 build、完整 verify、提交、推送、部署、CMS 或数据库操作。请 Luna 独立检查四视口的懒加载工位图实际显示、切换高度、无 JS/reduced-motion、锚点避开固定导航，以及 empty/partial 内容边界；请 Nova 复核内容/SEO 基线与范围。

- 同 ID Luna FAIL 最小返工：仅在 `repair-faq.css` 的咨询标题增加 `text-wrap: balance`，修复 1440 新字体环境将末字“估”单独换行的问题。原文、FAQ 双列/单列布局及其他源码保持不变。指定 Prettier 与 `git diff --check` PASS；快速浏览器元素截图覆盖 1440、1024、390、360，未见孤字末行或横向溢出。未重跑全套测试；等待 Luna 针对此返工复测。
- 同 ID Luna 复测 FAIL 最小返工：仅在 `repair-workshop.css` 的 `<=640px` 断点将工位图注最小高度由 `8rem` 提升至 `9rem`，完整文案继续参与自然流，不裁切；16:10 图片画框不变。快速浏览器采样三次切换：1440、1024、390、360 下 caption、figure、panels、section 和 zones 文档 Y 的最大差均为 0px（明细见 `output/playwright/xyy-20260915-03/terra/workshop-caption-stability-rework.md`）。指定 CSS Prettier 与 scoped `git diff --check` PASS；按最小返工合同未重跑全套测试，等待 Luna 独立复测。
- 同 ID Nova REJECTED 最小返工：工位控件改为 SSR 默认 `hidden` 且无 tab/tablist/tabpanel 语义，三张原生 `figure` 和完整图注直接可读；CSS 明确保持隐藏，避免 grid 规则覆盖 `hidden`。模块仅在成功取得完整 controls/tabs/panels 后赋予有效 id 引用、tablist/tab/tabpanel 和选中状态，再显示控件并隐藏非当前图。JS 未加载或请求被阻断时，控件继续不可见、不可 Tab 聚焦，三组图文保持自然展示。指定 Prettier、scoped ESLint、`npm run typecheck`（485 files，0 errors/warnings/hints）、Repair E2E Chromium/mobile（6/6）和 scoped `git diff --check`均 PASS；E2E 同时覆盖 `javaScriptEnabled:false` 与实际阻断 `/src/scripts/repair-workshop.ts` 请求。原始摘要见 `output/playwright/xyy-20260915-03/terra/progressive-enhancement-rework.md`；待 Luna 定向复测后交 Nova 闭环。

### XYY-20260915-05 — 华南仓库保留的定向还原

Status: CODE DONE（本地实现冻结；待 Luna 独立验证与 Nova Review）

- 按 `keep-warehouses` 替代合同，除华南仓库分布外恢复05开始前布局：`SouthBusiness.astro`、`south.css`、`south-layout.css`、`south-content.css` 与 `before/` 原副本一致；`SouthNetworkPage.astro` 仅保留已批准的“合适节点”→“合适仓库”及废弃城市切换脚本移除两处差异。新作业/退货流程和独立准备区已删除。
- 保留当前四城市分组和九条批准地址，以及仓库内局部 `.south-warehouses` 字体/行高/间距覆盖，避免周边旧布局规则改变其快照几何。展示层保持“广州主仓”→“广州仓库”、四城市“区域节点”→“仓库”、“华南产业链协同”→“货源入仓与库存安排”及“区域仓配协同”→“仓储与履约服务”；未恢复被否定的角色标签。
- 验证：`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-south.spec.ts --workers=1 --grep 'warehouse block retains'` 在 Chromium/mobile 为2/2 PASS；仓库 CSS Prettier PASS；4322路由HTTP 200；`git diff --check` PASS。此前本轮定向单测4/4与typecheck（484 files，零诊断）在最终逐字还原之前完成，作为时序证据而非最终独立验收。原始日志、源恢复差异、删除记录及最终 SHA-256 在 `output/playwright/xyy-20260915-05/terra/`。
- 未运行build、完整verify、提交、推送、部署、CMS或数据库操作。Luna请复核还原的非仓库区域、九地址、1440/390仓库几何、无JS可读性及已批准的展示纠正。

### XYY-20260915-06 — 华南仓库分布减少分隔线

Status: CODE DONE（本地实现冻结；待 Luna 独立验证）

- 仅更新 `south-nodes.css`：仓库区标题/介绍与既有两项统计在桌面分列，四个城市改为无边框、无阴影的浅暖灰面板，按广州/东莞、佛山/肇庆两列排列；手机为单列。面板内名称/地址桌面分列、手机自然上下排列；仓名列加宽，长仓名不以孤立末字换行。仓库标题下说明使用 `text-wrap: pretty` 避免孤字末行。
- 仓库及其条目、服务说明和继承的 feature 规则均清除分隔线，仅用背景、字号和留白区分；地址、统计、DOM顺序、业务说明与其他页面区域未改。South E2E既有仓库视觉断言相应改为核对1440/390列数、面板背景、零边线/阴影、名称/地址列及城市位置。
- 验证：两文件 Prettier PASS；`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-south.spec.ts --workers=1 --grep 'warehouse block uses warm city panels'` Chromium/mobile 2/2 PASS；`git diff --check` PASS。1440与390全页截图、原始日志、两文件最终SHA-256和冻结说明在 `output/playwright/xyy-20260915-06/terra/`。未运行无关单测、typecheck、build或完整verify，未提交、推送、部署、CMS或数据库操作。
- Luna请独立运行现有South E2E，并在1440/390复核四面板、9条逐字地址、无分隔线、移动单列和无横向溢出。

### XYY-20260915-07 — 华南业务入口减少分隔线

Status: CODE DONE（本地实现冻结；待 Luna 独立验证）

- 仅更新 `src/styles/service-redesign/south-content.css` 的 `.south-business` 专属规则，文件194行且低于200行预算。三项业务入口在桌面改为三列开放内容组，使用橙色大编号、黑色标题和自然留白，不含横竖分隔线、阴影或点击暗示；390下恢复为单列自然流。
- 既有“先确认资源，再决定组合”改为浅暖灰面板：桌面标题在左、四项资源在右侧2×2，手机全部单列，编号、标题、正文和提示按自然块流排列。DOM、文本、数据、仓库区、时效、FAQ及共享样式未改。
- 验证：局部Prettier PASS，`git diff --check` PASS；4322本地1440与390全页截图已目视确认业务区无分隔线、覆盖或横向溢出。截图、原始日志和最终SHA-256在 `output/playwright/xyy-20260915-07/terra/`。未运行构建、全量E2E、typecheck、完整verify、提交、推送、部署、CMS或数据库操作。
- Luna请独立运行既有South E2E，并核对三项业务和四项资源文本、1440三列/2×2与390单列流。

### XYY-20260915-08 — 华南首屏层级与圆角

Status: CODE DONE（本地实现冻结；待 Luna 独立验证）

- 仅更新 `src/styles/service-redesign/south-layout.css` 的 `.south-hero` 专属规则，文件103行。首屏背景改为 `#F8F8F6`；原16:9视频在桌面为32px、手机为24px圆角，未改素材、尺寸或播放属性。
- H1首个服务名称 span 调整为主张字号的0.66并增加间距，橙色价值主张保持大字；四城市改为 `#EDEDE8` 的非交互圆角胶囊。组件、DOM、文案、数据、媒体、仓库/业务/时效/FAQ及其他CSS均未改。
- 验证：局部Prettier和`git diff --check` PASS；4322独立浏览器在1440/390确认背景、32/24px圆角、0.66字号比例、四个城市胶囊及无横向溢出；视频 `currentTime` 均推进且无 controls。截图、计算样式、日志与SHA-256在 `output/playwright/xyy-20260915-08/terra/`。未运行E2E、build、完整verify、提交、推送、部署、CMS或数据库操作。
- Luna请独立检查两端首屏、视频实际播放和原有autoplay/muted/loop/playsinline行为。

### XYY-20260915-09 — 首屏说明文字减重

Status: CODE DONE（本地实现冻结；待 Luna 独立验证）

- 仅更新 `src/styles/service-redesign/south-layout.css` 的说明文字选择器：`.south-hero__sub` 为15px、600、`#484C4A`；紧随其后的首屏正文为15px、400、`#626660`、1.92行高，间距0.55rem（8.8px）。未用opacity，未改H1、kicker、城市胶囊、背景、视频、DOM、文本或其他区域。
- 验证：局部Prettier和`git diff --check` PASS；4322独立浏览器1440/390计算样式均为目标字号、字重、色值、28.8px正文行高和8.8px间距，整页无横向溢出。截图、计算样式、日志及纯SHA-256冻结清单在 `output/playwright/xyy-20260915-09/terra/`。未运行E2E、单测、build、完整verify、提交、推送、部署、CMS或数据库操作。
- Luna请独立核对两端说明文字与其他首屏元素保持08验收状态。

### XYY-20260915-10 — 首屏简介浓缩与精确展示映射

Status: CODE DONE（本地实现冻结；待 Luna 独立验证与 Nova Review）

- 路由本地 fallback 的 `heroDesc` 更新为授权短句“广州、东莞、佛山、肇庆多仓布局，支持 B2C、B2B、全渠道库存协同、退货质检及区域配送。”；metadata、其他文案及CMS读取逻辑未改。首屏仅在 `h1sub` 或 `heroDesc` 存在时输出 `.south-hero__intro`，因此双空字段不会出现空竖线。
- 发现成功CMS仍返回历史长段落后，按MEDIUM追加合同在 `south-content.ts` 增加精确展示函数：仅逐字相等的历史旧段落映射为该短句；新短句、空、自定义内容及末尾空格近似输入均原样返回。组件只显示函数结果，原 `content` 未变，不修改fetch/CMS或写入真实CMS。说明块为3px浅灰竖线、19.2px左padding、小标题15px/600和正文15px/400/#626660/1.8行高/5px上距。
- 验证：五文件Prettier与scoped ESLint PASS；`npx vitest run tests/unit/service-redesign-south.test.ts` 5/5 PASS，覆盖精确旧句、新句、空、自定义与近似输入。4322独立浏览器1440/390均显示短句一次、无旧长句、无横向溢出。`git diff --check` PASS；截图、计算样式、原始日志和纯SHA-256清单在 `output/playwright/xyy-20260915-10/terra/`。未运行E2E、build、完整verify、提交、推送、部署或CMS/数据库操作。
- Luna请独立运行合同的两项目South E2E，并核对短句、空态无竖线及两端布局；随后交Nova审阅精确映射边界。

### XYY-20260915-11 — 华南仓库标题与对外文案

Status: CODE DONE（本地实现冻结；待 Luna 独立验证与 Nova Review）

- 仓库区 H2 取消本地缩小字号/字重覆盖，继承与业务主标题相同的响应式样式；现有四城市、九仓地址、统计与卡片视觉保持。业务分组保留六项各一次，行业别名“货源入仓与库存安排”归 lane 01，“各仓退货质检”归 lane 03；lane 02 改为批准的“支持电商发货与门店补货，按需求安排出库配送。”
- 路由 fallback、业务/资源/时效/FAQ/咨询文字改为批准的对外表达。`ServiceLanding` 仅在精确 South slug 与 `south` presentation 时，对逐字相等的历史 CMS 字段生成展示副本，并同时供 metadata、Service JSON-LD、FAQPage JSON-LD 与 South 页面使用；不改 fetch/CMS、原 content 或其他展示分支。新增 South-only `toSouthPublicCopy` 对描述、时效正文、标签、城市 feature、行业 feature、两种退货旧句与四条 FAQ 精确映射；空值、任意自定义及近似值保留。首屏既有精确 hero 映射保持。
- 验证：11 个本任务源码/测试文件的 `npx prettier --check`、scoped ESLint 与 `git diff --check` 均 PASS；`npx vitest run tests/unit/service-redesign-south.test.ts` 为 6/6 PASS，覆盖正向精确字段映射、两种退货旧句契约、不可变输入、空/自定义/末尾空格近似边界。此前在新增最终 E2E 定向断言前，`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-south.spec.ts --workers=1` 为 Chromium/mobile 10/10 PASS；该日志只作时序证据，最终 E2E 交 Luna 运行。清单、日志、纯 SHA-256 冻结及说明在 `output/playwright/xyy-20260915-11/terra/`。
- Luna 请运行最终 South E2E，并重点核对 1440/390 H2 计算字号/字重一致、lane 01/03 各一次、页面 FAQ 与 JSON-LD 同文、可见/schema 无旧内部语句，以及 exact/empty/custom/near-match CMS 展示边界；随后交 Nova 复核映射范围、SEO/Schema 与 CMS 空值契约。未运行 build、完整 verify、提交、推送、部署、CMS 或数据库操作。
- 同 ID 预算收口：`ServiceLanding.astro` 的 `Props` 改为复用同字段的 `ServicePageContent`，只保留本页额外的 variant、slug、精确四项 stats 元组、faqs 与 presentation；移除重复字段和未用 `FeatureItem` 类型导入。运行行为未变，文件由187行降至176行。局部 Prettier、scoped ESLint 与 `git diff --check` PASS；仅刷新该文件冻结哈希，未重跑 E2E，Luna 的最终12项结果继续适用。

### XYY-20260915-13 — 华东鞋服云仓七区改版

Status: CODE DONE（源码冻结；待 Luna 独立验证与 Nova Review）

- 实现华东七区顺序：首屏标题与原视频、三仓平级地址、电商/门店/退货错落服务区、多仓库存说明、发货与费用、FAQ、居中咨询。新增用户提供的青浦仓、花桥仓、联亚仓及完整地址；各仓质检、修复另行安排。旧核心节点、仓点核验、商务 BD 与内部口径文字不再在当前 East 页面展示。
- 新增 East 专属精确展示副本，`ServiceLanding` 只在 East slug 与 `east` presentation 双门控下使用，South 与其他分支保持原路径。已知旧 CMS 全字段、feature、FAQ 问答映射为批准对外文案；空、自定义和近似字段不改写，整页全空继续显示不可用而非静态仓库内容。页面、metadata、Service/FAQ JSON-LD 共用展示副本。
- 实际执行过局部 Prettier 写入/检查、scoped ESLint（此前版本无错误，CSS 文件因项目 ESLint 未配置而提示 ignored）、`git diff --check`、本地4322 HTTP 200和 Playwright CLI 1440/768/390 截图。最后的具体版式收口后，Sol 已独立核对三视口：七区完整、无横向溢出、无装饰边线、视频16:9静音循环与32/24px圆角正确。源码冻结清单和SHA-256在 `output/playwright/xyy-20260915-13/terra/`。
- 未运行最终 E2E、unit、typecheck、build 或 fullverify；Luna 按合同独立验证精确映射/空自定义边界、实际渲染、FAQ/schema、无JS/键盘、媒体、1440/768/390及非East回归，随后交Nova复核范围、CMS与SEO契约。
- 同 ID Luna `astro check` FAIL 定向返工：`EastInventoryPage` 现在在仅 `contentDesc` 有值的 partial 输入时挂载并传入 `EastServiceInfo`，不会补 stats；已知旧 `contentDesc` 与本地 fallback 同步精确缩为“根据货品、订单去向和所需服务，确认发货安排与费用。”，自定义原文不改；FAQ 区整体只在 `faqs.length > 0` 时输出，成功空 FAQ 不留空灰区。四个允许文件的 Prettier、scoped ESLint 与 `git diff --check` PASS；未重跑 E2E/typecheck，待 Luna 复测。

### XYY-20260916-03 — 直播电商仓配七区实施

Status: CODE DONE（源码冻结；待 Luna 独立验证与 Nova Review）

- `/zhibo-cangpei` 保持原视频/poster与播放属性，改为七区：左文右视频首屏、三阶段渐进增强 tabs、订单/库存/回传错落区、退货去向、多品牌四组、FAQ 与咨询收尾。手机阶段控制横排；无 JavaScript 时三阶段连续完整显示。tabs 支持点击、方向键、Home/End 与原生 Enter/Space，选中/focus/panel 状态同步，无自动轮播。
- `ServiceLanding` 只在精确 `slug=zhibo-cangpei` 与 `presentation=live` 下使用 `toLivePublicCopy`。历史 CMS 全字段、六项服务、四项统计和五条 FAQ 以逐字匹配生成展示副本，并同时用于正文、metadata、Service/FAQ Schema；空、自定义、近似内容与未知服务/统计保持原值，未知项仅渲染一次。已知库存准确率明确为仓内准确率，单仓峰值明确为实际单仓单日运营峰值，退货时效保持服务约定条件。
- 验证：本任务文件 Prettier PASS、scoped ESLint PASS、`npm run typecheck` PASS（497 files，0 errors/warnings/hints）、`npx vitest run tests/unit/service-redesign-live.test.ts` 2/2 PASS、既有 Live Playwright Chromium/mobile/no-JS 4/4 PASS、`git diff --check` PASS；本地 `127.0.0.1:4322/zhibo-cangpei` HTTP 200。未运行 build、完整 verify、提交、推送、部署、CMS 或数据库操作。
- Luna 请更新并独立验证 Live 的 exact/custom/near/empty/contentDesc-only/FAQ-empty 边界、三阶段键盘与无 JS、1440/768/390 无溢出、FAQ/Schema 同源，以及非 Live 路由回归；随后交 Nova 复核双门控、公开数字与范围。

- 同 ID Luna `contentDesc-only` AstroContainer FAIL 定向返工：Live 页面现在仅在对应 hero、阶段 feature/stat、库存 feature/stat 或普通业务内容存在时挂载相关固定区域；仅 `contentDesc` 或 FAQ 时不再补视频、阶段、库存块或 CTA，原文各保留一次，全空继续为不可用。`LiveStages` 过滤无数据阶段；`LiveSync` 无库存数据时只输出自定义说明。多品牌四组改为独立 2×2，标题/正文为块级并补齐间距；960px 以下 Hero 与库存外层纵排，库存三块至手机才单列；精确旧库存 stat 副文案改为“出入库核对与库存管理”，自定义值不变。
- 返工验证：Luna 提供的 `live-render.vitest.config.ts` 运行 1/1 PASS；既有 Live helper unit 2/2 PASS；本任务 Prettier、scoped ESLint、`npm run typecheck` PASS（498 files，0 errors/warnings/hints）、`git diff --check` PASS；本地 `/zhibo-cangpei` HTTP 200。未运行 build、完整 verify、提交、推送、部署、CMS 或数据库操作；待 Luna 正式复测。

- 同 ID 第二轮场次交互返工：未增强时隐藏不可切换 tablist，三个阶段在无空列的单列网格连续展示并保留间距；增强成功后才显示桌面纵向/手机横向 tabs，`aria-orientation` 按 760px 同步。选中面板具有 180ms opacity transition 与同长淡入动画；减少动态效果时动画禁用。点击、箭头、Home/End、原生 Enter/Space、focus 与 `aria-selected` 行为保持。
- 验证：四个指定 Live 文件 Prettier 与 scoped ESLint PASS，`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-live.spec.ts --workers=1` Chromium/mobile/no-JS 4/4 PASS，`git diff --check` PASS，本地 `/zhibo-cangpei` HTTP 200；`live-layout.css` 保持200行预算。未运行 typecheck、build、完整 verify、提交、推送、部署、CMS 或数据库操作；待 Luna 正式复测 reduced-motion、click/keyboard 与无 JS。

### XYY-20260917-02 — 鞋服云仓八区改版

Status: CODE DONE（源码冻结；待 Luna 独立验证与 Nova Review）

- 在精确 `slug=xiefu-yuncang` 与 `presentation=footwear` 双门控下新增 `toFootwearPublicCopy`：仅完整匹配已知 fallback/CMS 的字段、feature、stat 与 FAQ 问答对才生成对外展示副本。页面、title/description、Service/FAQ Schema 同用该副本；空、自定义、近似和未知项保持原值，未知项在“更多服务信息”中只显示一次。未改路由旧稿、CMS 读取、四项 stat tuple、slot 行为或其他路由分支。
- 实现八区：层级首屏、商品管理、渠道系统、三阶段仓内视频、日常旺季、退货入口、FAQ、咨询。原四段视频和商品图路径、16:9及静音自动循环属性保持；阶段增强后支持点击、方向键、Home/End、roving tabindex、断点 aria-orientation 与 reduced-motion，无 JS 时三段均可读。部分数据只输出实际数据区，完整六项已知能力才启用固定业务视频、退货及咨询区。
- 验证：本任务 Prettier、scoped ESLint、`git diff --check` PASS；专属 `npx astro check --tsconfig output/playwright/xyy-20260917-02/tsconfig.source.json` 为335 files、0 errors/warnings/hints；本地 `/xiefu-yuncang` HTTP 200。`npm run check:maintainability` 已确认本任务所有文件及 `ServiceLanding.astro` 均在预算内；全局命令仍被既有 `src/styles/product/video-sequence.css`、`src/styles/service-redesign/live-layout.css` 与 `tests/e2e/home-product.spec.ts` 三项超预算阻断，均不在本任务范围。未运行 unit/E2E、build、完整 verify、提交、推送、部署或真实 CMS/数据库操作。
- Luna 请重点验证精确映射、FAQ 问答配对、empty/description-only/contentDesc-only/FAQ-only/custom/near/unknown 边界、正文与SEO/Schema同源、三阶段键盘/无JS/reduced-motion、四视频属性、1440/768/390/360无溢出及非Footwear保护路由。冻结哈希与命令结果见 `output/playwright/xyy-20260917-02/terra/implementation.md`。

- 同 ID Luna 平板阶段标签返工：仅更新 `src/styles/service-footwear/responsive.css` 与 `src/scripts/footwear-page.ts`。`<=960px` 的三项阶段控制改为容器内三等分胶囊，清除横向滚动及继承的满宽按钮，并在 `<=400px` 收紧字体、间距；脚本 `aria-orientation` 断点同步为960px，`>960px` 保持桌面纵向。Terra 本地 Playwright 实测360/390/768/960均为 horizontal、tablist `scrollWidth === clientWidth` 且三按钮可见，961为vertical；768点击第二项与 ArrowRight 依次切至第二、第三项。局部 Prettier、scoped ESLint、`git diff --check` PASS；刷新20文件SHA-256清单，聚合 `c4fd16f4e9504b90a41ef75b76157c40c1b9efa3e0859b75b8cd329b365c973b`。未改测试或其他源码，未运行unit/E2E/build/完整verify，待 Luna 独立复测横向溢出、键盘及no-JS。

- 同 ID Nova 合同返工：仅更新 `src/layouts/ServiceLanding.astro` 与 `src/components/service/footwear/FootwearPage.astro`。Footwear 正文分支现与展示映射同为精确 `slug=xiefu-yuncang` 加 `presentation=footwear` 双门控，错误 slug 不会进入鞋服固定结构；标准业务区现在以已精确分类的三组能力标题合并后 `Set.size === 6` 判定，重复已知能力不能替代缺失能力，六能力加重复或未知能力仍保留完整区，实际输入条目显示不去重。局部 Prettier、scoped ESLint、专属 `astro check`（335 files，0 errors/warnings/hints）、`git diff --check` PASS；两文件分别179/103行，均低于180行Astro预算。刷新20文件SHA-256清单，聚合 `f7049a4bf2da4b9d6d2e35810351332dd19e8ffeeddcbeb1e62771fa31997bb8`。未改测试/其他源码，未运行unit/E2E/build/完整verify；待 Luna 独立验证错误slug门控、重复/缺失六能力边界后交 Nova 复审。

### XYY-20260917-03 — 鞋服页三处展示微调

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 仅调整首屏、履约视频说明和合作准备区：首屏不再输出 `150+ 合作品牌` 指标段落，保留调用 props、CMS/claims、映射、SEO、标题、介绍、胶囊、CTA及视频；履约步骤把原短标题与灰色原说明分开输出，桌面按实际2/3项均分、760px以下单列，无分隔线或大卡片；合作准备区改为全宽浅灰底、直角外边缘，桌面横向内边距为 `max(3rem, (100% - 82rem) / 2)`，手机为全宽 `2rem 1rem`。
- 验证：7个授权源码文件 Prettier PASS、两项 Astro scoped ESLint PASS、`git diff --check` PASS，所有文件低于对应180/200行预算。本地Playwright实测1440/768/390/360文档与步骤区无横向溢出；CTA各视口均从左边缘全宽、0圆角；1440无 hero 指标DOM，768三列步骤、390/360单列，原四视频属性保持，768点击第二tab后选中状态正确。冻结清单与命令/浏览器证据在 `output/playwright/xyy-20260917-03/terra/`，聚合SHA-256为 `1969213c8cb22af20571a8d08ac0e822c43206ea3795d7804df73ac10b1e7ed1`。
- 未运行unit/E2E/build/完整verify，未改测试、JS、shared layout、路由、CMS、claims、媒体或链接；待 Luna 独立确认三处视觉、360–1440无溢出、tabs切换及四视频属性。

- 同 ID 小返工：仅在 `fulfillment-copy.css` 为步骤项增加 `align-content: start`，使短/长说明三列首行与说明起点对齐；`fit.css` 保留全宽、直角和原横向full-bleed内边距，CTA纵向padding恢复原 `clamp(3rem, 6vw, 5rem)`。局部Prettier与`git diff --check` PASS；1440实测三项标题top均为3350.28125px、说明top均为3376.203125px，CTA宽1440/左0/圆角0/上下padding80px且无横向溢出。刷新7文件SHA-256清单，聚合 `1969213c8cb22af20571a8d08ac0e822c43206ea3795d7804df73ac10b1e7ed1`；待Luna按最终版本收尾复测。

### XYY-20260917-04 — 合作准备 CTA 局部重排

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 仅改合作准备区标记及专属样式：保留全宽浅灰底、动态 `contentDesc`、三条原链接和费用条件。桌面改为左侧两行标题、说明和咨询入口，右侧30–34rem白色圆角资料板；资料项保留 SKU与品类、销售渠道、日常与峰值单量，并附批准的准备提示。平板/手机按同一阅读顺序纵排，390下恢复专属full-width覆盖并保留左右16px安全边距；没有分隔线、动画或新业务主张。
- 验证：6个授权文件 Prettier PASS、`git diff --check` PASS，均低于180/200行预算。最终实屏 [1440 CTA](output/playwright/xyy-20260917-04/terra/cta-1440.png) 与 [390 CTA](output/playwright/xyy-20260917-04/terra/cta-390.png) 已保存：1440区宽1440px、34rem资料板/29rem说明且无横向溢出；390区宽390px、左右16px、圆角0、358px主按钮且无横向溢出。冻结清单在 `output/playwright/xyy-20260917-04/terra/`，聚合SHA-256为 `bb232ab93b707b3740df63a39c3d77d5863f2843e459eb6b22db5376b64ee8f0`。
- 未运行测试、build或完整verify，未改JS、CMS、SEO、媒体、路由、shared layout或其他区域；待Luna独立验证1440/768/390/360、focus、链接与动态说明空值。

### XYY-20260917-05 — 全站底部转化区统一

Status: CODE DONE（源码冻结；待 Luna 独立验证与 Nova Review）

- 扩展既有 `ConversionCTA` 的可选展示输入，迁移七个服务详情 CTA、广州/运到旧 `ServiceExperience` 分支、首页 FAQ 联系动作、数字化证明与案例详情联系区；案例/新闻/白皮书列表继续复用 shared CTA。所有原有标题、正文、主/副链接、首页电话、Repair 额外链接、East 动态 `groups.support`、费用条件与空/主内容门控保持来源和内容不变；Footwear 未改。
- shared CTA 统一为满宽浅灰底、桌面左侧30rem文案与右侧30–34rem白色资料板；资料项保留原数据并给出简短准备提示。专属选择器覆盖旧 B2B/Live/East 祖先规则与旧服务 CTA 装饰残留；960px以下纵排，760px以下保持满宽、16px安全边距、全宽主按钮和均衡标题。
- 验证：13个授权源码文件 Prettier PASS、12个 Astro 文件 scoped ESLint PASS、专属 `astro check` 为335 files/0 errors/0 warnings/0 hints、`git diff --check` PASS；全部文件低于 Astro 180/CSS 200 预算。Terra 实屏抽查1440下八条代表路由及390下Home/Cases均无横向溢出，East动态支持原文、Home `tel:` 链接及白色主按钮保留。冻结清单与命令、截图证据在 `output/playwright/xyy-20260917-05/terra/implementation.md`，13文件聚合SHA-256为 `f46d09fc06a5c56c6b8bf3f9d9ccb191d35f2218c7c448f0c15f7d6b40b1f331`。
- 未运行unit/E2E、build或完整verify，未提交、推送、部署、CMS写入或数据库操作。Luna请独立覆盖16路由桌面/移动、旧祖先CSS隔离、East动态support与条件位置、原链接/电话/Repair副链接、空门控，以及Footwear reference CTA不变；随后交Nova复审。

- 同 ID 数字化 CTA 返工：Sol 在390px实浏览器发现遗留 `.digital-proof p` 覆盖 shared CTA 正文。检索确认 `digital-proof` 只被旧样式引用，未被行为、测试或其他标记使用，因此仅从 `LogisticsDigitalProof.astro` 的 shared CTA 移除该废弃 root class；未修改正文、链接、准备项或门控，也未为单页问题提高共享各项样式特异性。刷新后说明实测为共享 `rgb(93, 90, 85)`、16px、`20px 0 0`、28px行高，主链接保持白色且箭头无旧margin；390截图见 `output/playwright/xyy-20260917-05/terra/digital-390-rework.png`。局部Prettier、scoped ESLint、`git diff --check` PASS；刷新13文件SHA-256清单并逐项验证，聚合 `d07daf66704560237c50e34c9320ed5416e2a46abbb497ada6e70177a940c3ad`。未重跑不受该单行属性变更影响的完整typecheck、unit/E2E或full verify；请Luna最终复测 `/wuliu-shuzihua` 390px说明可读性及旧样式未残留。

### XYY-20260921-02 — 鞋服货品管理中央视觉替换

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 仅替换 `FootwearGoods` 的中央 PNG 槽位为局部 HTML/CSS/内联 SVG 商品档案卡。卡片表达款式、颜色、尺码概念；颜色与尺码明确为示意，不包含库存、数量、WMS 界面或性能主张。动态两侧 feature 卡、标题和其他区块未改；旧 PNG 文件及 `ProductEditorialServices` 的独立引用保留。
- 为保持既有 768px 三列网格，卡片使用可收缩内部列、`box-sizing: border-box` 和 SVG 最大宽度；在原 29rem 视觉槽内以 grid 垂直居中。显式隔离卡片 header 的既有 section margin，390/360 使用不高于原移动槽位的紧凑尺寸。图示以单一 `role=img` 中文说明提供可访问语义，装饰 SVG/色块/尺码 token 不可聚焦。
- 验证：两文件 `npx prettier --check`、scoped `npx eslint` 与 `git diff --check` 均 PASS；冻结源内检索旧图片路径、`<img`、旧 goods tag 均无匹配。实现者实浏览器测得1440/768/390文档宽度等于视口；768中央槽288px、卡片288px、内部239.94px，无横向溢出。冻结 SHA-256、1440截图与命令记录在 `output/playwright/xyy-20260921-02/terra/`。
- 未运行unit/E2E/build/full verify、未修改JS、CMS、SEO、路由、媒体文件或共享样式，未提交、推送、部署或写CMS/数据库。Luna请按冻结哈希独立检查1440/768/390/360四屏的无溢出、无旧图片请求、可读性/可访问名称和两侧动态卡不变。

- 同 ID 最后一处微调：仅移除服饰 SVG 右侧会被误读为删除按钮的橙色圆圈和白色短横；橙色衣服线及其他CSS、文案、尺寸均未改。两 Astro 文件 Prettier 与 `git diff --check` PASS；刷新冻结清单后，`FootwearGoodsVisual.astro` SHA-256 为 `f23ea78fd77b7d3bea9014164c5a60215c3cc88492897f9db0bd359954fed3c2`，`FootwearGoods.astro` 保持原哈希。未运行大套件；Luna按新manifest继续独立四屏验收。

### XYY-20260921-03 — 两项履约准确率更新

Status: CODE DONE（源码冻结；待 Luna 独立验证与 Nova Review）

- 仅将 `inventoryAccuracy` 与 `shippingAccuracy` 更新为 `rawValue: 100`、`displayValue: '100%'`、`unit: '%'`，并记录用户于2026-09-21确认的来源与未提供统计周期。产品保障区直接使用库存 claim，去除旧的 `+`。未改截单/发货 SLA、其他 claim、CMS 读取/回退、历史白皮书或展示映射。
- Footwear fixture 与产品 E2E 期望改为 registry 引用；claims 单测覆盖两项的 raw/display/unit/provenance、CMS token 插值以及 CSS/SVG 技术百分比排除，同时验证可见业务百分比（包括紧邻 `getComputedStyle`）仍会被扫描器报告。技术排除仅限 Astro style/class 属性、SVG 尺寸属性、既有双坐标计算样式期望与既有白皮书 CSS width 断言。
- 验证：授权文件 Prettier、scoped ESLint、`git diff --check` PASS；定向 claims 3/3 与 footwear 2/2 PASS。完整 claims+footwear 单测仍为一个失败测试，其中有8项既有 literal 扫描违规；基线同一测试有11项违规，减少的3项是已替换的旧 `99.99%` 期望，未新增 `100%` 误报。最终 SHA-256 清单与命令记录：`output/playwright/xyy-20260921-03/terra/implementation.md`。
- E2E 未完成，不作为本次验证；build/full verify 未运行。未提交、推送、部署或写入 CMS/数据库。Luna 请独立检查受影响路由的桌面/移动可见文本、无 `100%+`、CMS token 插值以及无布局溢出；Nova 请复核 claim 以外记录未变与扫描器保护边界。

### XYY-20260921-04 — 仓配首段过期面积标注清理

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 新增 `01-overview-clean-20260921.mp4/.jpg`，首段由原片帧 0–16 和 117–202 串接，完整移除出现旧白色引导线、蓝色数字及 `50万㎡` 标注的中段；为保留干净完整镜头而使用正常镜头切换。新片为 854×480、30fps、H.264/yuv420p、无音轨、faststart，103 帧/3.433333 秒；海报取原片干净 frame 0。原 MP4/JPG 未改。
- 仅将 `PRODUCT_VIDEO_SECTIONS` 首段的 `src`/`poster` 与对应 asset contract 前两个存在性路径改为新 URL；其余七段、文案、页面结构、控制属性、CSS、claims 与 CMS 均未改。编码、探针、解码、帧级/拼接视觉检查和冻结记录写入 `output/playwright/xyy-20260921-04/terra/implementation.md`。
- Luna 请独立验证 `/product` 在 1440 与 390 视口加载新媒体、静音自动循环和 `currentTime` 推进，检查首尾循环及拼接处没有旧面积标注或溢出。

### XYY-20260921-05 — 鞋服履约流程画板

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 仅替换鞋服页履约区三个阶段的阶段媒体为浅灰流程画板；保留原区标题、阶段名称、3/2/2条操作名称与说明，`CLAIM_TEXT.shippingSla` 仍完整出现在“发货出库”步骤。桌面左侧阶段导航不变，右侧为黑橙标题、白色编号操作卡、对应内联SVG图标及既有事实的阶段结果；无 JS 时所有面板仍直接可读。
- 新增局部 `FulfillmentIcon` 装饰图标组件；`fulfillment-copy.css` 的全部规则均以 `.footwear-fulfillment` 限定。桌面入仓三列、订单/出库两列满宽，768px为两列，760px以下单列且图标与说明紧凑排列；未改标签脚本、Hero媒体、其他区块、CMS/SEO/claims、测试或原视频文件。
- 验证：三个授权源码文件 `npx prettier --check` PASS、两个 Astro 文件 scoped `npx eslint` PASS、`git diff --check` PASS；授权源码中检索 `<video`、`<source`、`<img`、`poster` 及三段旧履约媒体名均无匹配。文件分别为110/147/156行，低于Astro180/CSS200维护预算；hash与命令记录在 `output/playwright/xyy-20260921-05/terra/implementation.md`。
- 未运行现有 `footwear-page.spec.ts`：其中仍明确断言本任务移除的三段视频，且合同排除持久测试修改；未运行浏览器、build或full verify。Luna请按合同独立检查1440/768/390/360、无媒体请求、标签点击与键盘、no-JS、reduced-motion及无横向溢出。未提交、推送、部署或操作CMS/数据库。

### XYY-20260921-06 — 响应式全站导航

Status: CODE DONE（源码冻结；待 Luna 独立验证与 Nova Review）

- 仅修改 Header、两份现有导航组件、既有菜单脚本并新增专属响应式样式。`>=1024px` 保留现有玻璃胶囊桌面导航；`768–1023px` 显示七项紧凑主导航；`<768px` 显示 Logo、原 `/product`、原 `/contact` 与保留 ID/标签的“菜单”按钮。未恢复已移除的 specialty 下拉，导航数据、`header-liquid-glass.css`、链接目的地和页面内容未改。
- 展开菜单使用两列七条原链接、最后一项满行、当前页 `aria-current` 与既有活动态 `bg-white/15`；短屏菜单内部滚动。脚本保留点击、链接关闭和 Escape 回焦，新增 outside pointer 关闭及跨 48rem 断点关闭/焦点移交，避免焦点留在隐藏的桌面导航、快捷链接、菜单按钮或菜单链接中；非模态菜单未添加焦点陷阱或页面滚动锁。
- 验证：五个授权实现文件 `npx prettier --check` PASS，Header、两个导航组件及脚本 scoped `npx eslint` PASS，`git diff --check` PASS。文件为72/52/55/67/117行，低于 Astro180、TS260、CSS200 预算；命令与最终 SHA-256 在 `output/playwright/xyy-20260921-06/terra/implementation.md`。
- 未运行浏览器、existing E2E、build或full verify；Luna请按合同检查1440/1024/850/768/767/390/360/320、键盘/指针/焦点移交、短屏滚动、reduced-motion及八路由保护对比。未提交、推送、部署或操作CMS/数据库。

- 同 ID 用户截图返工：原快捷入口/菜单方案已整体由常显七入口方案取代。`>=560px` 单行显示 Logo 与七条原导航，560–767 使用64px Logo、13px紧凑文字；`<560px` 由唯一Logo加首页/仓配服务/关于我们首行、其余四条次行组成，所有手机链接为14px及至少44px高，可在200%文本下自然换行增高。删除 Header 的脚本引用及无其他引用的 `header-menu.ts`，不再存在抽屉、按钮、快捷入口、焦点移交或隐藏控件。
- `MobileNavigation` 的两个静态链接组进入 `.site-header__glass > .site-header__row`，小屏使用 `display: contents` 参与同一两行流；保留原七组 label/href、产品详情/关于/白皮书/联系的 `aria-current` 与既有 `bg-white/15` 活动态。两份既有E2E仅同步导航断言，荣誉、案例和正文断言保持任务前版本。
- 返工验证：四个保留实现文件及两份授权E2E `npx prettier --check` PASS，scoped `npx eslint` PASS，`git diff --check` PASS；最终行数38/49/47/121，均低于预算。最终hash、删除记录及与 `before-source` 的测试对比在 `output/playwright/xyy-20260921-06/terra/implementation.md`。未由Terra运行浏览器或E2E、build/full verify；Luna请按新合同覆盖1440至320、短390×240、视频背景、200%文本、键盘与原生导航。

- 同 ID Luna 截图返工：仅在 `<35rem` 将 Header 顶部由12px改为6px，双行容器最小高度由94px改为88px；每个链接的44px最小触控高度、两行结构、正文和其他宽度均未改。局部Prettier与`git diff --check` PASS；最终CSS SHA-256为`75a0a5f0c6b154c50ffd143753d88ff012fcb0a2336f03701b0575aa6811f332`，待Luna复测首屏橙色crumb不再被Header遮挡。

- 同 ID 定位修正：上一微调误命中560–767区间而非手机区间；现已按媒体块恢复该中间区间12px顶部，并将`<35rem`准确设为6px。其他属性未改；局部Prettier与`git diff --check` PASS，最终CSS SHA-256为`dab0aaa847a124412e1d105b087c10df79f9feecbffd7bd19896a96936838dbf`。

- 同 ID fluid返工：仅改`Header.astro`与`header-responsive.css`。Header所有宽度统一居中为`min(calc(100% - 1.5rem), 44rem)`，移除原`lg`位置、平移与`w-max`工具；单行区的顶部、Logo、字号和链接横向内边距改为连续clamp计算，取消768/1024尺寸断点。560px处保持6px顶部、64px Logo、14px字体，仅发生允许的单双行重排；`<560px`两行、88px最小高度和44px链接保持。
- 验证：两文件Prettier、Header scoped ESLint、`git diff --check`与旧断点工具检索PASS；文件36/94行，低于预算。最终SHA-256为Header `b56a8f44c19e7e044528863e5787192f050074d83ce36f4efc56194ccbfbcc49`、CSS `7a0e0cfb39458406e7ac649cea17a2373ea3b159902e197e6b88ce2d1c31ed65`，细节记录于`output/playwright/xyy-20260921-06/fluid/terra/implementation.md`。未由Terra运行浏览器、build或full verify；待Luna对560/768/1024接点和双向resize sweep独立复测。

### XYY-20260921-07 — 页脚仓配服务入口更新

Status: CODE DONE（源码冻结；待 Luna 独立验证）

- 仅替换 `FOOTER_SERVICE_LINKS` 的四项旧入口为与 `/product` 当前服务顺序一致的八项：鞋服云仓、退货质检、后整修复、跨境云仓、华南鞋服云仓、华东鞋服云仓、直播电商仓配、B2B门店仓配；每项使用合同指定站内路径。`NAV_LINKS`、Footer 标记与样式、其他数据列、媒体、CMS、SEO、claims 和测试均未改。
- 验证：`npx prettier --check src/data/brand/navigation.ts`、`npx eslint src/data/brand/navigation.ts` 与 `git diff --check` 均 PASS；`NAV_LINKS` 段落与 HEAD 的 SHA-256 同为 `7fe8fae65ff31006a2d2755dddfd5034d5404d817e153ac703522058a90bd688`。冻结源码 SHA-256 为 `94940568fce81b0e861825180495b94e7abf0017e4cbb911d935aba8006fced0`，详情见 `output/playwright/xyy-20260921-07/terra/implementation.md`。
- 未运行应用测试、浏览器、build 或 full verify；Luna 请独立检查 `/`、`/product` 和一条服务详情页在 1440/768/390/320 下的八项标签、路径、键盘导航及无裁切/横向溢出。未提交、推送、部署或操作 CMS/数据库。

### XYY-20260921-08 — 发布候选只读审计

Status: AUDIT DONE（待 Sol 建立候选、Luna 独立门禁与 Nova 审阅）

- 只读审计建议纳入全部当前 dirty/untracked `src/**`（170路径，包含删除的 `header-menu.ts`）和 `tests/**`（25路径），以及41个当前源码/测试声明的未跟踪公共媒体；逐文件路径、工作树状态、字节数及 SHA-256 见 `output/xyy-release-20260921-08/terra/candidate-manifest.json`。
- 所有候选媒体存在，总计119,521,870 bytes；19个MP4均可由`ffprobe`读取，最大候选单文件为产品首屏MP4（56,992,517 bytes），无候选超过GitHub 100 MB。候选媒体、引用依据和精确排除理由见 `output/xyy-release-20260921-08/terra/audit.md`。
- 排除当前无运行/测试引用的旧非clean服务首屏、旧01 overview、07 dispatch和三张旧产品图；白皮书转换图、计划/治理/日志/证据文件及153,115,482 bytes的忽略原始视频亦不进入应用版本。未修改源码、测试、候选clone或暂存区，未运行应用门禁、浏览器、build、提交、推送或部署。

- 同 ID 发布阻塞返工：仅修改五个获分配测试。repair成功率、鞋服峰值/区域峰值/合作品牌/发货SLA、跨境退货时效和直播SLA/单仓峰值均改为`BRAND_CLAIMS`或`CLAIM_TEXT`引用；鞋服短截单值从完整registry SLA按字段边界取得，保留分组的既有输入形状。直播库存准确率fixture改为非业务字符串；live E2E JSON-LD 映射增加明确`FaqSchema`与`unknown`解析边界，不使用`any`或豁免。
- 验证：五文件Prettier与ESLint PASS；`npm run typecheck`为505 files、0 errors/0 warnings/0 hints；claims、footwear、crossborder、live、repair定向Vitest为5 files、21 tests PASS。未运行浏览器E2E；`package.json`和`package-lock.json`未改。细节见`output/xyy-release-20260921-08/terra/release-blocker-tests.md`；完整release门禁和独立浏览器验证仍待Luna。

### XYY-20260921-08 — 传递依赖安全修补

Status: CODE DONE（待 Sol 在独立候选执行 `npm ci` 后由 Luna 重跑审计与完整门禁）

- 仅更新 `package-lock.json`：`devalue` 5.8.1 → 5.9.4，`smol-toml` 1.7.0 → 1.8.0；`package.json`、源码、测试和本地预览 `node_modules` 均未修改。
- 修补先在隔离锁文件执行定向 `npm update devalue smol-toml --package-lock-only --ignore-scripts`，主锁同步前后 diff 仅含两个包的版本、resolved URL 与 integrity。`npm ls --package-lock-only --omit=dev` 证明 Astro 7.2.8 的 `devalue@^5.8.1` 与 `smol-toml@^1.6.0` 均兼容新锁定版本；详见 `output/xyy-release-20260921-08/deps/lock-patch.md`。
- 原始审计为两项漏洞，见 `output/xyy-release-20260921-08/luna/npm-audit.txt`。依 Sol 指示不在当前混合 `node_modules` 重复联网审计；需在候选的 fresh `npm ci` 完成后由 Luna 执行 `npm audit --omit=dev`，预期为 0 漏洞。未提交、推送、部署或操作 CMS/数据库。

### XYY-20260921-08 — 发布阻塞：服务 seed 本地再生成

Status: CODE DONE（待 Sol 复制候选并交 Luna 复跑完整门禁）

- 审阅 `generate-cms-content-seeds.mjs` 后确认其仅本地读取源码、格式化并写回 `approved-cms-page-seeds.mjs`，没有网络、CMS、数据库、同步或 repair 调用。按现有 `npm run cms:generate-content-seeds` 两次生成，第二次 SHA-256 保持 `06a65fd35b31099104d46ca3de6b57c67adb3190e7618f4021c1b5cc11a42b8b`。
- 仅生成静态 seed 文件：华南 seed 同步当前广州/东莞/佛山/肇庆仓库、各仓质检和配送文案；华东 seed 同步当前页面。差异为37新增/39删除，限两条 service seed；unified cases、case details、publications、about content/history/honors 与 site settings 均同生成前深度相等，完整 `{{claimKey}}` 引用排序列表保持一致。
- 验证：`service-page-seed-structure` 10/10 PASS，含9个下拉服务页的 `stats`/`features` 与当前源码精确深比较；seed Prettier 与 scoped `git diff --check` PASS。精确 diff、前后 hash、生成器审阅和幂等记录在 `output/xyy-release-20260921-08/seeds/seed-regeneration.md`；未修改生成器、测试、页面或任何外部系统，未提交、推送或部署。

### XYY-20260921-08 — 发布门禁文件预算拆分

Status: CODE DONE（待 Luna 在 Sol 冻结候选运行完整发布门禁）

- 将产品视频规则拆为入口 `video-sequence.css`（2行）、基础 `video-sequence-base.css`（176行）和响应式 `video-sequence-responsive.css`（76行）；入口依次导入基础、响应式，展开后与发布候选原样式去除纯空白行的规则序列完全一致。`live-layout.css` 以同 specificity 的 `:is()` 合并两个同声明响应式选择器，降至199行，规则顺序和可见样式保持。
- 完整迁移 E2E 的两个产品测试至自动收集的 `tests/e2e/product-video-sequence.spec.ts`（203行），原 `home-product.spec.ts` 为108行；所有7个原有 `test()` 声明仍被 `playwright.config.ts` 的 `*.spec.ts` 收集。首段视频媒体期望同步为已批准的 `01-overview-clean-20260921` JPG/MP4。完整迁移 generated CMS claim 的5个 `it()` 至自动收集的 `tests/unit/claims-generated.test.ts`（67行），原 `claims.test.ts` 为188行；11个原有 unit `it()` 均保留。
- 验证：`npm run typecheck`（507 files，0 diagnostics）、`npm run lint`、`npm run check:maintainability`、相关文件 Prettier、`git diff --check` 均 PASS；claims 两个定向 Vitest 文件为11 tests PASS。未运行浏览器/E2E或全量 release 门禁，交由 Luna 对 Sol 的冻结候选独立复测；未修改 package lock、候选、外部环境或 CMS/数据库。

### XYY-20260921-08 — 发布阻塞：E2E 当前结构断言

Status: CODE DONE（待 Luna 在 Sol 冻结候选统一复测）

- 仅更新四个获分配 E2E 文件，不改应用：`/product` 现断言无 shared CTA、八段视频和八个当前详情入口；鞋服详情保留自身联系入口。运到断言统一 `data-conversion-cta`、无旧 `.service-cta`，并保留可访问 `/contact` 入口；East 的增强/no-JS 两例改验 `.east-contact[data-conversion-cta]` 及唯一可访问“咨询华东仓配”链接。
- Repair 增强不可用例保留开发环境 `/src/scripts/repair-workshop.ts*` 的精确 abort，并增加仅从页面响应中删除含 `data-repair-workshop` 的内联脚本块，以适配生产构建内联。两个路径合计阻断/移除计数严格为1；JS不禁用，controls 隐藏且无 tablist，三面板均可见可读，未以全局禁用脚本或宽松计数替代。
- 验证：四文件 Prettier、scoped ESLint、`npm run typecheck`（507 files，0 errors/warnings/hints）、`npm run check:maintainability`（720 files）和 scoped `git diff --check` 均 PASS。冻结 hash、逻辑与未运行浏览器的原因见 `output/xyy-release-20260921-08/terra/e2e-assertion-repair.md`；未启动本地服务器、未运行本地 E2E、未修改页面/候选/外部系统，Luna 负责最终统一复测。

### XYY-20260921-08 — 发布阻塞：CTA 路线契约返工

Status: CODE DONE（待 Luna 定向后再跑完整候选门禁）

- 仅更新 `conversion-cta.spec.ts`：将过时的统一三项准备清单改为11条共享 CTA 路线的精确 map。每条验证当前 heading ID、精确 `/contact` action 可访问名称、准备项数量与标签、CTA 结构和无溢出。华东固定为4项（含当前 support 的“本地团队沟通”），Repair为4项、跨境为5项，其余为3项；产品八入口和鞋服独立 CTA 断言保持。
- 同轮仅更新 `service-pages.spec.ts` 的运到 CTA：`ServiceExperience` 当前 `reveal="service"` 会使 off-screen action 处于滚入揭示前状态，测试现在滚动 CTA、验证 action 可见并精确为“获取专属方案”；仍断言统一 CTA、无旧 `.service-cta` 和 `/contact`，未忽略隐藏状态或修改应用。
- 验证：两文件 Prettier、scoped ESLint、`npm run typecheck`（507 files，0 errors/warnings/hints）、`npm run check:maintainability`（720 files）和 scoped `git diff --check` PASS。完整路线表与冻结 hash 位于 `output/xyy-release-20260921-08/terra/conversion-cta-rework.md`；未启动本地服务器、未运行 E2E、未触碰候选或外部系统，交 Luna 先定向复测。

### XYY-20260921-08 — 发布阻塞：运到 CTA 标签校正

Status: CODE DONE（待 Luna 定向复测）

- 仅修正 `tests/e2e/service-pages.spec.ts` 一处精确可访问名称：运到 CTA 是 `ServiceExperience.astro` 的非 `SPECIALTY_LINKS` fallback 分支，源代码 actionLabel 为“免费获取方案”；保留既有 CTA 滚入、可见、统一结构、无旧 `.service-cta` 与 `/contact` 入口断言。
- 验证：该文件 Prettier、scoped ESLint、scoped `git diff --check` 均 PASS；当前 SHA-256 为 `d799cdab106d23fbfa11b2b0dd1366fca57a05ab64d2ccc6d6a521a3c56953ee`。未启动本地服务器、未重跑 typecheck 或 E2E，按 Sol 指示交 Luna 使用 `luna-retest-3/targeted-e2e.txt` 定向复测。

### XYY-20260921-08 — 暂停后验收站恢复脚本

Status: SCRIPT READY（仅供 Sol 在既有授权范围执行；待 Luna 独立检查与 Nova Review）

- 新增恢复 helper，未改根部署脚本、候选源码或应用工作树。恢复脚本限定候选 SHA 为 51d9c473268af11f7f4584042598cc72480d7e21，并固定仅以未启用 partial release 20260923T005553Z-51d9c47 作为新 release 的静态 seed；远端要求该 release 与 dist 均为非 symlink 实目录，且拒绝其解析为当前 active release。
- 同 ID 返工：先前 helper 的 SSH payload 转义被错误重写，已废弃且不得执行。现以 scripts/deploy.sh 字节复制重新生成，只保留精确 diff 的 SHA guard、staging target guard、固定 partial seed guard、seed cp 替换与 dist rsync 的 --checksum；所有其余既有远端 payload、转义、格式、回滚和 cleanup 字节保持原样。
- 种子采用 cp -al partial/dist/.；仅新 release 随后的 rsync -az --checksum --delete 比较内容字节并覆盖。未使用 --inplace，因此更新文件保持 rsync 默认临时文件/原子替换语义，未变资源可保留 hard-link；原 cleanup 保留且 wrapper 的 RELEASE_KEEP=100 防止本轮清理已有 release。原有 clean Git、全量 verify:release、远端既有 .env、生产依赖安装、原子 current 切换、内部/外部 health 与 version、失败回滚均保留。
- wrapper 固定进入持久 candidate checkout，保留既有 staging 与假构建 token 配置、RELEASE_KEEP=100，通过绝对路径运行派生脚本。验证：candidate clean 且 HEAD 为上述 SHA；两份脚本 bash -n PASS。最终 script SHA-256 为 resume-deploy 7140c35bc0fd640d394ad5173c76c98e5f8fd84b25d2d7b4d2baab790428ad29、wrapper 1234b4d3cd64ccd16019c453f6f980be879d80ab2068b92b5e82281c43fac073；精确改动和未执行外部动作记录在 output/xyy-release-20260921-08/resume-prep.md。
- 未执行 SSH、部署、安装、提交、推送、CMS/数据库或生产操作；完整发布门禁是此前 Luna 的候选证据，非本次重跑。需 Luna 独立审阅 shell guard/语法并由 Nova Review 后，Sol 才能按用户授权执行验收站部署与后续非强制 GitHub main 推送。

### XYY-20260923-01 — 仓配视频静态保障区可见性返工

Status: CODE DONE（待 Sol 同步候选并由 Luna 独立复测）

- 仅修改 `src/scripts/product-video-media.ts` 与 `tests/e2e/product-video-loading.spec.ts`。可见段选择不再要求固定 `intersectionRatio >= 0.55`，而是使用 IntersectionObserver 已提供的最高正比例目标；静态保障段即使自身高于视口而比例较低，也会成为非视频 active target，既有 `sync()` 随即解除全部八个视频 source 并暂停播放。所有观察比例为零时 active target 设为 `-1`，同样走既有释放路径；未添加 scroll 回调中的布局读取，导航、布局、文案、媒体与其他脚本未改。
- 新回归在既有 loading spec 中依次覆盖 360×640、844×390、390×844、1440×900：进入静态保障区要求零 attached source，回到第八段要求仅第八视频恢复 source 且播放。数字开头的第八 video ID 使用属性选择器，未放宽 timeout 或添加 skip。
- 验证：两文件 Prettier、scoped ESLint 与 `git diff --check` PASS；行数为 TS 143/200、E2E 185/220。`media-hashes-before.json` 为 16/16 PASS，`protected-hashes-before.json` 为 33/33 PASS。首次根目录 Playwright 尝试发现新增测试的非法数字 CSS ID selector，已改为属性选择器；按 Sol 指示未使用根目录旧依赖重跑，候选独立复测与完整门禁待 Luna/Sol。
- 未提交、推送、部署或操作 CMS/数据库。Luna 请在 Sol 同步的候选中复测四视口静态释放、反向第八段恢复、快速跨段/resize/后台恢复与既有 source-budget/no-JS 断言；Nova 请复核 `-1` 无可见目标释放分支及无 scroll 强制 layout。

### XYY-20260924-01 — 合作案例总览改版

Status: CODE DONE（源码冻结；待 Luna 独立验证与 Nova Review）

- 仅改 `/cases` 总览及获分配组件/样式/两份既有轨道断言：复用 `w-apparel.webp` 的深色沉浸首屏含“浏览合作案例”锚点与“预约案例分享”链接；`/cases/ur` 优先、否则第一项的重点案例以图文和前四项有效指标呈现；所有返回案例按 CMS 原顺序显示为 3/2/1 响应式静态卡片，每张直接显示前三项有效指标。空列表只显示空态；空指标不生成壳；slug 为空且既有 label 映射缺失时不生成详情链接。
- Logo 墙沿既有顺序常显前12个，余下66个由原生 `details/summary` 展开，保留78个现有素材及真实 alt；数据来源说明集中在案例区一次。三项优势、FAQ、底部咨询、CMS/error fallback、结构化数据、详情路由、claims、图片和全局导航/页脚未改。四份不再引用的 orbit CSS 和 `cases-orbit.ts` 已删除。
- 首轮视觉修复：重点图媒体改为确定纵横比以消除底部灰条；899px 以下重点区上下排，避免平板文图重叠；`cases-values.css` 加入与总览一致的标题层级；无详情地址的静态卡片显示完整简介，避免被三行摘要截断后无处查看。
- 验证：授权文件 Prettier、scoped ESLint、`npm run typecheck`（511 files，0 errors/warnings/hints）、`npm run check:maintainability`（724 files）和 scoped `git diff --check` 均 PASS。实现者隔离预览快速检查1440/768/390：文档宽度等于视口；768重点案例为单列上下排、全案例网格为2列，390全案例网格为1列；UR重点4项指标、6张卡片及ROMI文字型指标均可见。截图与完整命令记录见 `output/cases-redesign/xyy-20260924-01/terra/implementation.md`。
- 未运行E2E、full verify、无JS或360px浏览器检查；未提交、推送、部署或访问CMS/数据库。Luna请独立覆盖合同所列1440/768/390/360、Logo原生展开、锚点/详情链接/FAQ键盘、reduced-motion、无JS、正常/空/无指标/无链接 fixture及CMS回退；Nova请审阅展示 helper 的链接与空态边界、SEO不变量、CSS拆分和范围。

- 同 ID Luna 390px overflow FAIL 最小返工：Luna 在开发与4399构建预览确认字体加载后重点标题 `UR（Urban Revivo）` 的 `scrollWidth=376`、`clientWidth=358`，使文档宽度392px超过390px视口。仅新增专属 `cases-overview-title-wrap.css` 并由总览入口导入：重点案例内容容器、重点标题与案例卡标题均设 `min-width: 0`、`overflow-wrap: anywhere`，使长中英文品牌标题正常换行，不使用全页 `overflow` 裁切、不删除数据或修改测试。Terra仅运行格式、scoped lint、维护预算和diff检查；390/360实浏览器回归交由Luna复测。

- 同 ID Luna 第二轮 overflow FAIL 最小返工：Luna 复测证明首轮 `overflow-wrap:anywhere` 与 `min-width:0` 已加载但仍未换行。Terra 在隔离本地页面并等待字体完成加载后，实测仅将重点标题继承的 `letter-spacing:-0.055em` 改为 `normal` 即可使 `UR（Urban Revivo）` 成为两行；最终390请求视口的文档/客户端宽度为375/375、标题343/343，360为345/345、标题313/313，均无横向溢出或截字。仅在 `cases-overview-title-wrap.css` 新增 `.cases-featured h2 { letter-spacing: normal; }`，保留首轮可换行保护；未改品牌内容、测试、业务或全页overflow。细节见 `output/cases-redesign/xyy-20260924-01/terra/title-wrap-rework.md`；请Luna独立复测390/360与长中英文标题。

- 同 ID 去除重复重点案例：按用户反馈删除 Featured 组件挂载、组件文件及全部 Featured 专属基础/响应式样式；Hero 后直接为 `#cases-grid`，全案例卡片继续按原CMS顺序、详情链接与前三项有效指标渲染，UR仅保留列表中的一张卡。卡片标题的换行保护保留，旧 Featured 标题字距规则随组件一并移除。仅更新获分配的两份E2E中过时 Featured 断言为无 Featured、Hero与案例区相邻及UR详情链接唯一；未改数据、CMS/API、claims、其他组件/页面、媒体或配置。
- 验证：授权文件Prettier、page/E2E scoped ESLint、`npm run typecheck`（512 files，0 errors/warnings/hints）、`npm run check:maintainability`（726 files）及 scoped `git diff --check`均 PASS。隔离预览对1440/768/390/360实测 Featured=0、Hero后案例区=1、案例卡=6且文档宽度等于客户端宽度；网格列数分别为3/2/1/1，Hero锚点保持 `#cases-grid`。命令与限制见 `output/cases-redesign/xyy-20260924-01/remove-featured/terra-implementation.md`。
- 未运行E2E套件、构建或full verify；未提交、推送、部署或操作CMS/数据库。请Luna按本轮修订独立验证四视口、锚点、无Featured/无空白占位、每品牌单卡、详情链接/三指标及保护交互；随后交Nova增量Review。

### XYY-20260924-01 — 移除指定合作案例 FAQ

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- 仅在 `/cases` 展示层将 `Promise.all` 的 FAQ 结果命名为 `allFaqs`，再以精确问题文本（`trim()` 后比较）排除“合作一般需要多长时间才能\"跑顺\"？上线后要多久看到效果？”。`PageFAQ` 与 `createFaqSchema` 继续共用过滤后的 `faqs`，因此可见 FAQ 和 FAQPage JSON-LD 同时移除目标问答。
- 未修改 FAQ 种子、CMS/读取调用、回退与错误语义、其他页面或测试；成功返回空列表仍为空。冻结页面 SHA-256：`7db80c997325b18cc068280f306d37406d9915829e80165ec2a2ec5c68d3895a`；记录见 `output/cases-redesign/xyy-20260924-01/remove-faq/terra-implementation.md`。
- 验证：`npx prettier --check src/pages/cases.astro`、`npx eslint src/pages/cases.astro`、`git diff --check -- src/pages/cases.astro` 均 PASS。未运行 E2E、build、typecheck 或 full verify；未提交、推送、部署或操作 CMS/数据库。请 Luna 在渲染页面和 JSON-LD 独立确认目标问题/答案均不存在、余下七题的文案顺序不变，并检查 1440/390 FAQ 展开与无溢出。

### XYY-20260924-01 — 测试站发布准备

Status: PREPARED（仅供 Sol 在 High-risk 闸门后执行）

- 仅新增任务输出目录的 `run-deploy.sh` 与 `server-snapshot.mjs`。部署包装器固定候选 `/home/yj/XYY-GEO/website/output/performance/xyy-20260923-01/candidate`、`root@47.82.105.103`、`/var/www/xyy-web`、原 `NODE_BIN`/`WEB_PORT`、`RELEASE_KEEP=100`、`PLAYWRIGHT_PORT=4399` 和离线虚拟构建凭据；通过原 `scripts/deploy.sh` 执行既有 `verify:release`、原子切换及回滚，未复制、放宽或修改其逻辑。
- 包装器仅从本任务 `expected-commit.txt` 读取一个 40 位小写 SHA；先校验固定路径、candidate HEAD、完整候选干净状态，再验证 `frozen-hashes.json` 的16个存在文件与5个已删路径共21条。缺少/多行/非法 SHA、HEAD 不符、候选脏或哈希不符均在调用 deploy 前失败。只读 snapshot 输出 current realpath 和显式安全 manifest 字段、previous marker/target/target existence、release 目录及 mode、以及精确 `xyy-web`/`xyy-cms` 的 PM2 name/pid/status；不读取或输出环境变量、`.env` 或 PM2 env。
- 验证：`bash -n run-deploy.sh`、`node --check server-snapshot.mjs`、新文件 diff 空白检查均通过。以当前尚不存在的 `expected-commit.txt` 本地调用 wrapper，按预期在任何外部动作前返回 `expected-commit.txt is required after Sol creates the release commit`；未执行 SSH、部署、推送、提交、CMS/数据库操作或全量门禁。当前固定 candidate 为干净 `330969d65af52c1333c30d496983c65dcc15a992`，待 Sol 创建提交、写入精确 SHA 并快进该 candidate 后才可运行。哈希与交接见 `output/cases-redesign/xyy-20260924-01/release/terra-release-prep.md`。

- 随后 Sol 写入精确提交 `5081bdc372f550894c25d82115a2eb4f6bbcea32` 并快进 candidate。Terra 只读复核该 SHA 与 candidate HEAD 一致、candidate 仍 clean，且21条冻结路径为16个哈希匹配存在项和5个仍缺失项；未调用 wrapper，因而未触发 SSH 或部署。

### XYY-20260926-02 — 首页底部转化区内容与排版

Status: CODE DONE（待 Luna 独立验证）

- 仅调整 `HomeFAQ` 的首页底部 `ConversionCTA` props 并导入新增首页专属 CSS。保留共享组件、米白背景、黑橙两行标题、橙色主按钮、白色圆角卡片、01–03 编号和电话入口；主按钮继续指向 `/contact`，新增“查看合作案例”至 `/cases`。
- 替换为约定的“让仓配方案／贴合你的业务”说明、右卡“我们可以一起梳理”、三项仓储履约/渠道仓网/退货配套细节及项目条件说明。`.home-conversion-cta` 专属规则以较紧凑的桌面网格填满两栏、限制文案宽度并缩小中缝；共享 CSS 未改。返工后在同等 specificity 的960px断点显式设为 `grid-template-columns: 1fr`，确保平板与手机不继续保持两栏；760px 以下解除内容宽度限制。
- 验证：`npx prettier --check src/components/home/HomeFAQ.astro src/styles/home-conversion-cta.css`、`npx eslint src/components/home/HomeFAQ.astro`、`git diff --check` 均 PASS。冻结 SHA-256：`HomeFAQ.astro` 为 `462675806a87b1220533713c1c0ab030d90322e52ae1b39a69cecd9e17efdf88`，`home-conversion-cta.css` 为 `5aedd139781abeb9ae498ac46f1339a0e767517ac362c8dc18061ae025a8ae79`；详细记录见 `output/home-conversion/xyy-20260926-02/terra-implementation.md`。未运行浏览器/E2E、build、typecheck 或全量门禁，未提交、推送、部署或操作 CMS/数据库。请 Luna 独立核对1440/1024/768/390/360文本、无溢出/单字行、`/contact`/`/cases`/电话链接和焦点，以及 FAQ 与共享 CTA 未变。

- 同 ID 最小删除修订：仅从 `HomeFAQ` 的 CTA 删除 `secondaryLinks` prop，连同不再使用的 `phoneHref` 与 `phone` 解构；`Props.phone` 保留以兼容首页现有调用。目标区域不再渲染“查看合作案例”、咨询热线或空 `.conversion-cta__links` 容器；`/contact` 主按钮、标题/说明、右卡、FAQ、首页专属 CSS、共享 CTA 与页面其他电话均未改。冻结 `HomeFAQ.astro` SHA-256：`bc30f1938d8d3c0abf8f7f9fd29b8ca3471454bfa4356364a951a20896a23d8c`，证据见 `output/home-conversion/xyy-20260926-02/remove-links/terra-implementation.md`。
- 验证：`npx prettier --check src/components/home/HomeFAQ.astro`、`npx eslint src/components/home/HomeFAQ.astro`、scoped `git diff --check` 均 PASS。未运行浏览器/E2E、build、typecheck 或全量门禁，未提交、推送、部署或操作CMS/数据库。请 Luna 在1440/390独立确认两个入口和空 links 容器均消失，主咨询与其余 CTA/FAQ 无回归。

### XYY-20260926-04 — 删除广州鞋服云仓页

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- 删除 `/guangzhou-xiefu-yuncang` route、广州独有仓网/签名组件、三个 hub CSS 文件，以及路由在导航、Hero 媒体、variant/config/copy、sitemap、llms、签名选择与 hub 专用 CSS 中的入口；华南及其他页面的广州仓网内容保持。历史 `approved-cms-contract-mappings.mjs`、广州媒体与真实 CMS/DB 均未改。
- 本地离线服务 seed 从10变9、FAQ seed从90变85、specialty repair targets从9变8；服务 seed 仅删除广州对象，FAQ 仅删除其5条。对象级比较确认全部保留对象顺序和序列化 SHA-256 相同。离线 FAQ generator 曾根据当前页面源码拟改写既有华南/华东 seed，已恢复这些超范围差异；未运行内容生成器、CMS apply/sync/migration或任何外部写入。
- 服务/E2E 契约同步：旧页退出服务和 CTA 矩阵，classic 动画样本改为运到；SEO 合约断言旧 URL（含尾斜杠）404且 sitemap/llms 无入口。验证：指定 Prettier、scoped ESLint、两个定向 Vitest 文件（18/18）、`npm run typecheck`（509 files，0 diagnostics）、`npm run check:maintainability`（721 files）及 `git diff --check`均 PASS。详细证据见 `output/orphan-audit/xyy-20260926-04/terra-implementation.md`。
- 未运行浏览器/E2E、build或full verify，未提交、推送、部署、CMS/数据库或删除媒体。请 Luna 独立验证 404、桌面/移动端导航及运到 classic 动画/无溢出；请 Nova 复核排除的历史映射与媒体仍在，以及 seed diff 仅为指定删除。

- 同 ID Luna 首轮 FAIL 后最小返工：原契约将尾斜杠形式也要求直接404，忽略了未改动的全站规范化规则。只读核对 `server/request-policy.mjs` 后确认其 `normalizedPath !== req.path` 分支始终对非规范尾斜杠路径301，且无广州专属映射。仅更新 `contracts.spec.ts`：所有广州请求均设 `maxRedirects:0`，明确断言规范 URL 404且无 Location、尾斜杠301且 Location 为规范 URL，随后单独再次请求规范 URL 确认最终404。未改服务端策略、业务实现或其他测试；定向格式/lint/diff检查待本轮执行，交 Luna 按修订AC复测。

- 本返工验证：`npx prettier --check tests/e2e/contracts.spec.ts`、`npx eslint tests/e2e/contracts.spec.ts`及 scoped `git diff --check`均 PASS。实施者未运行 Playwright；需 Luna 独立运行修订后的 route contract，确认三步状态不被自动跟随掩盖。

### XYY-20260927-01 — 已确认孤儿代码清理

Status: CODE DONE（待 Luna 新构建独立验证与 Nova Review）

- 删除 `ownership.json` 列出的78个已审计候选，以及19个仅服务这些候选的 signature/editorial CSS 与空 wrapper；相对本轮基线共97个删除、14个必要联动修改。当前候选存在性检查为78/78缺失、0残留；详单、派生依据和基线范围核对在 `output/orphan-cleanup/xyy-20260927-01/terra-implementation.md`。
- 清除无消费者的 brand `ABOUT_STATS`/`CAPABILITIES` 和 product `CARE_CATEGORIES`/`SERVICE_FLOW`，保留 `DIGITAL_PRODUCTS`、`ASSURANCE*`、运到局部 `CAPABILITIES`。`ServiceSignature`/`ServiceExperience` config 保留：运到 classic 页仍以 `delivery-desk` 渲染，且共享 `ServiceVariant` 契约仍被在用路由使用。
- 移除未使用 `@astrojs/sitemap`，lock 仅删除该依赖及独占传递包，无升级。完整 `npm run verify`（493 tests/build）在四项最终死导出删除前 PASS；最终版再经格式、scoped ESLint、typecheck（457 files，0 diagnostics）、claims/product相关单测（38/38）、diff和AST reachability scan（444/444、0 orphan）通过。
- 未修改广州媒体、CMS/DB、seed/generator、claims/API/server、历史映射、首页或其他页面内容；未提交、推送、部署或外部写入。请 Luna 在 fresh build 对合同代表页基线，尤其运到 classic signature/experience、product、about及广州素材保留，做独立浏览器验证。

### XYY-20260927-03 — 发布门禁 sitemap URL 断言返工

Status: CODE DONE（待 Luna 定向复测与 Nova Review）

- 发布候选的真实门禁在 `PLAYWRIGHT_PORT=4510` 运行时，sitemap 正确生成4510 origin，但 `contracts.spec.ts` 将 `/product` `<loc>` 写死为4399而失败。仅将该断言改为由当前 Playwright project `baseURL` 构造完整绝对 URL；默认4399仍精确匹配，广州404/301相关断言未动。
- 验证：该测试文件 Prettier、ESLint、scoped diff检查及 `npm run typecheck`（457 files，0 diagnostics）均 PASS。未启动/停止本地服务、运行 Playwright、修改应用/配置/候选/Git或进行部署、CMS/DB操作；详细证据 `output/release/xyy-20260927-03/terra-test-fix.md`。请 Luna 在新候选以默认与发布门禁端口定向复测 contracts，再由 Nova 复审。

- 同 ID 第二次真实门禁返工：4510 单用例通过后，完整 verify 在维护预算报告该文件221行超过220。只把同一 sitemap 断言由格式展开的三行收紧为 `productUrl` 计算加严格 `<loc>` 匹配两行，最终文件219行；未删除断言、调整预算或修改应用/配置。Prettier、scoped ESLint、`npm run check:maintainability`（624 files）和 scoped diff检查均 PASS。未运行 Playwright 或启动/停止服务；请 Luna 在新候选跑完整 verify，随后 Nova 定向复审。

### XYY-20260927-04 — 英文商务站

Status: IMPLEMENTATION IN PROGRESS（待完成现有鞋服页与 About 交互组件接入后冻结）

- 已建立十个显式英文路由、`zh-CN`/`en` route pair、英文自 canonical 与真实 pair 的 reciprocal hreflang/x-default；未知 `/en/*` 使用英文 noindex 404 且不发布中文首页 alternate。中文 Header 增加键盘可用的 EN 入口：真实 pair 定位对应英文页，其余中文页明确前往 English home。
- 英文布局、sitemap、llms.txt、claims 格式化和 CMS 案例 source-snapshot adapter 已接入；案例翻译仅在 stable slug 与原始 source label 匹配时显示，否则省略。联系接口在不改变中文 `error`、请求体、国内号码校验、限流和存储契约的前提下增加稳定 `code`，英文客户端按 code 给出本地化结果。
- 产品视频序列已由并行实现模块提供 `locale="en"`，`/en/services` 使用同一八段视频、导航、惰性加载和保障区。About 原有 Hero/Explorer/history/warehouse/honors 交互组件正按 locale 复用；鞋服页 locale 组件接口由并行实现模块提供，主实现保留其 CMS/route 接入所有权。
- 当前验证：contact/英文路由/英文 claims/英文产品的 focused Vitest 26/26 PASS；已拥有文件的 Prettier 与 ESLint PASS；`npm run check:maintainability` PASS；`npm run build` PASS。未运行浏览器或 full verify；本任务未提交、推送、部署、写 CMS/数据库或进行真实线索提交。Luna 后续重点：十路由/EN 404、桌面与390/360语言切换、视频/Explorer/鞋服交互、CMS empty/error 和联系错误码。

- 后续静态复核发现英文布局、About 动态逐条翻译、Home/服务 CMS adapter 和现有页面级交互复用仍未达到合同；当前状态保持 partial，不能作为 Luna/Nova 验收候选。不得将临时英文卡片、宽泛 source 条件或占位翻译视为完成。

- 同 ID shared shell 完成：`Layout`、`DocumentHead`、Header/desktop-mobile navigation、Footer、FloatingContact 与 EnglishLayout 统一支持默认 `zh-CN` 的 locale；中文 `<html lang="zh-Hans">` 与原文案保持，英文复用玻璃胶囊、响应式导航、Footer 和浮动联系入口。DocumentHead 使用 safe-json、全量 OG/Twitter、self canonical 和真实 pair 的 hreflang（404 不产生 false alternate）；EnglishLayout 可使用 source-bound `getEnglishSiteSettings()`，并保留 custom footer/floating-contact 关闭选项。Prettier/ESLint 通过，`npm run typecheck` 489 files 0 diagnostics。调用方传入英文 settings 前必须先经该 helper；本段不代表页面 CMS adapter 或视觉验收完成。

- 同 ID 案例数据与首页接口完成：`translateCases()` 以六个本地审核 `CASE_FALLBACKS` 的 slug 和全部页面消费字段（品牌字段、分类、简介、tags、stats、metrics、图片）作 source snapshot 比对；未知或变化记录显式诊断并省略。翻译后的 `Case[]` 保留原 id/slug/图片等身份字段，使用审核英文的品牌、分类、摘要和 tags；未在 claims registry 审核的运营数字不展示，故 `stats: []`、`metrics: ''`，不恢复中文 fallback。`createEnglishHomeCaseDetails()` 仅从这些已本地化记录按 slug 构建首页详情，无 label/中文 fallback。八条案例 FAQ 同时校验原 q 与 a 后输出完整英文；变更项省略并诊断。新增 focused Vitest 覆盖六案例、未知/变化 source、slug map、stats 省略和 FAQ q+a 守卫：3 files/7 tests PASS；Prettier、scoped ESLint、diff check PASS。维护性命令实际失败于并行改动的 `src/i18n/home-ui.ts` 365/260 和 `FootwearGoodsVisual.astro` 181/180，本次 `cases.ts` 115、`cases-copy.ts` 100、测试 67 行均在预算内。未运行全量 typecheck/build/verify，未提交、推送、部署或访问 CMS/数据库；整体英文站仍为 partial，待页面垂直模块接入与独立验收。

- 同 ID 英文收尾消费者接入完成：`/en/cases` 复用原案例组件、样式、CTA 和 7 条与中文页一致的可见 FAQ 子集；FAQ 原 q+a、案例 source snapshot 均保持守卫，ItemList/Breadcrumb/FAQ JSON-LD 与实际英文卡片/`/en/contact` 行为一致。英文联系页改为复用原 Hero、信息区、字段、honeypot、国内号码验证、privacyConsent 和 API；英文 CMS settings 仅翻译审核 source，phone/ICP 保留当前 CMS 值，变更或空的文案字段显式诊断并留空。表单未知 code、坏 JSON 或网络异常不会显示内部字符串，已映射 code 保留稳定英文；未改中文错误显示。`/en/privacy` 逐段翻译现有隐私说明且 consent 指向它。`/en/services` 保留原视频序列并关闭与中文产品页相同的 Footer/FloatingContact，提供英文 Breadcrumb 与四类 Service schema。语言导航修正 Home/Services active 状态、切换 aria 标签和移动布局排序；DocumentHead 的 x-default 指向真实中文 pair，英文 catch-all 返回 HTTP 404，llms 补全十个英文路由。
- 验证：focused Vitest 7 files/33 tests PASS；scoped Prettier、ESLint 和 `git diff --check` PASS；`npm run typecheck` 505 files、0 errors/warnings/hints PASS。全量维护性检查仅因并行鞋服文件 `src/components/service/footwear/FootwearGoodsVisual.astro` 181/180 失败，本段文件均未超预算。未运行 build、浏览器或 full verify，未提交、推送、部署、写 CMS/数据库或提交真实线索；整体任务仍须等待并行页面模块完成、Luna 独立验证与 Nova Review。

- 同 ID 冻结交接补录（Home/About）：`/en` 已用英文 locale 组合原 Hero、能力数据、核心方案、案例卡片/模态、履约流程和 FAQ/CTA；首页 stats/services/FAQ 仅在完整审核中文 source 匹配时翻译，变化或未知记录省略，公开数字由 `englishClaim` 提供。案例卡片和模态按 slug 使用共享英文案例 adapter，空 stats 仅显示英文说明，操作入口为 `/en/contact`；长英文的响应式与 reduced-motion 规则保留。`/en/about` 已组合原视频 Hero、Explorer、History、Warehouse network、Honors、FAQ、滚动图库与最小页脚；overview/history/warehouse/honor/FAQ 均由 source-checked English adapter 提供，未知或过期 source 省略，页面自定义英文 footer 使用 `getEnglishSiteSettings()`，共享 Footer/FloatingContact 关闭。About UI 保留原视频、历史控件、Explorer/hash、荣誉 lightbox、图库、scroll reveal 与 reduced-motion 行为，并本地化控制、标签与 aria。相关 focused Vitest、scoped Prettier/ESLint 已通过；此前并行期 typecheck 阻塞历史已被最终冻结阶段替代。

- 同 ID 冻结交接补录（Product/四服务）：`/en/services` 使用全部八段原 ProductVideoSequence 媒体、poster、lazy source budget、滚动/前后导航和最终 assurance；`locale="en"` 仅切换英文 copy、ARIA 与可换行样式，中文默认不变。四条英文服务路由保留实际呈现与交互：`/en/apparel-fulfillment` 使用 Footwear 既有 Hero、tabs、FAQ、CTA 和脚本；`/en/returns-inspection` 使用现有 returns evidence-lab；`/en/garment-care` 使用 repair workshop；`/en/retail-distribution` 使用 B2B allocation/store-rhythm。各服务 adapter 以完整 source content 和 FAQ q+a 的审核快照守卫，成功空结果保持空，变化/未知 source 诊断后省略，公开数值仅来自相应 scope 的 `englishClaim`。临时 `EnglishService` 已删除。相关 focused Vitest、scoped Prettier/ESLint/diff 均通过；Sol 确认最终 Product/Footwear 维护性检查 PASS，`FootwearGoodsVisual.astro` 已为179行，先前并行超预算记录不再是当前阻塞。

- 当前 160 条应用/测试实现路径已冻结于 `output/english/xyy-20260927-04/implementation-freeze.json`，受保护的1153条路径零变更。未记录 browser、build、full verify 或独立验收为通过；未提交、推送、部署、CMS/数据库或真实线索写入。后续由独立 Luna QA 与 Nova/Sol 按冻结候选验证。

- 同 ID Luna 首轮 full verify 返工：仅修改 `tests/unit/english-claims.test.ts`，移除英文发货准确率断言中的审核公开数字字面量；期望值现从 `getApprovedClaim()` 的 rawValue 与 unit 派生，仍严格检查英文百分号结尾、千位分隔面积格式与异常类型的加号/英文单位。未改 claims、实现、allowlist 或其他冻结路径。`npx prettier --check`、scoped ESLint、`git diff --check` 通过；`npm test -- tests/unit/english-claims.test.ts tests/unit/claims.test.ts` 为2 files/8 tests PASS。未运行 full verify、build、浏览器、外部写入或部署。

- 同 ID Luna Round 3 可读性返工（共享收尾）：英文隐私页为 email/contact 链接前后加入显式空格，并新增本组件 scoped 的 h2、段落及链接层级样式，保持原政策含义、邮箱和日期不变；英文 Footer 服务列改为四条已实现的英文专题链接（apparel fulfilment、returns inspection、garment care、retail distribution），英文版权年份后与公司名/rights 间使用显式空格，中文原输出分支保持。新增专属服务链接单测，Prettier、scoped ESLint、diff 与2 files/3 tests均 PASS；各文件为 Privacy 77、Footer 140、routes 50、test 14 行。尝试 `npm run typecheck`，本地命令执行器在仅输出 diagnostics 开始阶段回收，未取得退出结果，不能记为 PASS；本地 Astro 守护进程虽报告已启动但4540端口拒绝连接，因此未把截图复测记为通过，待 Luna fresh browser retest。

- 同 ID 其他并行 Round 3 交接补录：Home 已将 source-guarded 英文 service.features 和 Yundao 名称/副标题/四项功能文案实际渲染，CJK-free focused assertion、3 files/8 tests、scoped Prettier/ESLint/维护预算/diff均 PASS；About 英文 `<768px` gallery statement 限为可用 padded width 和 `max-width: calc(100vw - 3rem)`，中文和 reduced-motion 不变，待 Luna 390/360 fresh browser retest。服务模块的 CTA 新增可选英文 preparation aria label，未传入时仍使用原中文 fallback；英文 returns/garment-care/retail caller 提供英文标签，Repair workshop tablist 按 `data-locale` 初始化英文/中文标签，局部3 files/8 tests、scoped lint/format/预算/diff和 filtered diagnostics PASS。以上为实现交接事实，不替代独立 Luna 验收。

- 同 ID 最终冻结前测试最小化：删除仅对 `ENGLISH_SERVICE_LINKS` 以同样字面量 `toEqual` 的新增镜像测试 `english-footer-services.test.ts`，该静态链接改动不保留重复实现的低价值测试。现有实现文件不变；Footer 的真实 DOM、四个 href、英文版权空格、中文输出与 Privacy 的390/360可读性由 Luna fresh browser 验证。本轮不再执行新命令。

- 同 ID Luna Round 4 前首屏返工：Sol 在离线4522旧构建以 `scrollY=0` 复现390px时固定 Header（top6/bottom96）遮住英文 Privacy 和 Contact eyebrow/H1 的首屏缺陷，已中断 Luna（CLI exit 1，未产生通过结论）。仅在 `EnglishPrivacy` Hero 和 `ContactHero` 的 `locale="en"` 分支增加顶部 padding：小屏7rem，35rem以上5rem，使 Hero 文案位于固定 Header 下方并保留间隔；中文 Contact 不获得 `english-contact-hero` class，原中文样式/表现不变。Prettier、scoped ESLint、diff通过；Privacy87、ContactHero56行，均在预算内。未运行 browser、build、full verify或测试，交 Luna 在1440/768/390/360初始 scrollY=0复测后冻结。

- 同 ID Luna Round 5 后联系返工：Sol 复核发现 `ContactHero` 错用 Svelte `class:` 指令，改为 Astro `class:list`，仅英文获得 `english-contact-hero`，中文原 class 列表不变。`englishContactFailure` 改为只接受自有已知 message key，`toString`、`constructor`、`__proto__` 和其他未知值始终返回 string 的既有英文通用失败提示；单测覆盖三键及正常 code。英文联系客户端仅在 HTTP 成功且 payload 自有 `success === true` 时显示成功并 reset，HTTP200 `{}`、`null`、`{success:false}` 走通用英文失败、保留输入并在 finally 恢复按钮；中文既有 HTTP200/错误、请求/API/storage契约未改。Prettier、scoped ESLint、diff和 contact focused 3 files/22 tests通过；未运行 browser、build、full verify，Luna应以 response mocks 验证英文 malformed-200 与 inherited-code 行为。

- 同 ID Luna Round 5 续修：英文 malformed-success 判定限定为 `response.ok`，故 HTTP 200 的空/无效 success payload 仍为通用英文失败且不 reset；HTTP 400 `validation_failed`、503 `storage_unavailable`、429 `rate_limited` 则重新进入已知 code 的英文映射。中文路径未改。局部 Prettier、ESLint、contact focused tests 与 diff check 通过；未运行 browser、build 或 full verify，Luna应复测上述三类非 2xx code 与 malformed HTTP200。

- 同 ID Round 5 peer 交接补录：About 英文 gallery eyebrow 在 mobile 可正常换行，且 mobile video controls 使用固定导航下方的独立行；中文 gallery 和视频交互保持不变。About peer 的 scoped Prettier/ESLint、2 files/5 tests、maintainability 与 diff check 均通过。B2B 英文小屏 Hero 顶部 padding 为7rem，CTA 使用紧凑标题并限制消息列宽，`<=760px` 时主 CTA action 的 `margin-inline` 重置为0；中文不变。服务 peer 的 focused Vitest 2 files/13 tests、scoped Prettier/ESLint、maintainability 与 diff check 均通过。Sol fresh browser 预检记录22条页面/布局记录 PASS，并记录11种 contact mock 状态（含3类 known non-2xx、3个 inherited code、4种 malformed HTTP200 和成功态）。以上仅为实现/预检交接，独立 Luna 与 Nova 验证仍 pending。

- 同 ID Returns 标题返工交接：`ReturnInspectionHero` 增加 locale hook 与 `data-locale`，英文标题 span 使用英文句点切分；`returns.css` 仅对 `[data-locale='en']` 标题允许 normal/balanced wrap，中文继续 `nowrap`。未改 Hero 视频、数据、claims 或交互。服务 peer 的 scoped Prettier/ESLint、diff check 均通过，文件行数 `ReturnInspectionHero.astro` 69/180、`returns.css` 170/200。Nova 首审发现四种宽度存在 nowrap 裁切；Luna 定向复测正在进行，不能视为最终 PASS。

### XYY-20260927-05 — 浏览器语言建议提示

Status: CODE DONE（本地实现冻结；待 Luna 独立浏览器验证与 Nova Review）

- Header 前新增默认隐藏、normal-flow 的非 modal 语言建议条；仅中文路由在无显式保存偏好且浏览器首个支持语言为 English 时显示。已有 route pair 用对应英文页，未配对中文页明确链接 English home；不会自动跳转、不会使用 IP 或改动 SEO/CMS/API。
- 接受、继续中文、关闭和中英文 Header 手动切换均只保存显式偏好。localStorage 无法读写时降级 sessionStorage；非法或两种存储都不可用时安全继续。英文文案标注 `lang="en"`，中文保持按钮标注 `lang="zh-CN"`，无 JS 时条保持隐藏且原语言链接可用。
- 提示条实际可见高度经 scroll、resize 和可用时的 `ResizeObserver` 写入 CSS variable，固定 Header 在原有 top 基础上偏移；关闭后清理监听，若焦点在条内以 `preventScroll` 返回既有语言切换。未改产品或其他页面组件。
- 验证：scoped Prettier、ESLint、`language-preference` 与既有 shell route Vitest（2 files/4 tests）、离线 `npm run typecheck`（514 files，0 diagnostics）、`npm run check:maintainability`（682 files）和 scoped diff check 均 PASS。未启动 server、浏览器、build 或 full verify，未提交、推送、部署或写 CMS/数据库/线索。冻结哈希与 Luna 复测矩阵见 `output/language-suggestion/xyy-20260927-05/terra/implementation.md`。

### XYY-20260927-06 — 英文首页数据卡片完整显示

Status: CODE DONE（本地 CSS 冻结；待 Luna 独立 build/浏览器验证）

- 仅修改 `home-capability-stats.css` 并新增其英文 CSS import layer。英文仓储卡片在宽屏使用等宽 tracks、1350px 以下堆叠；英文检验卡片在800px以下堆叠，窄屏 network/inspection 同步堆叠。完整数字和单位未缩写或修改，`100 %` 保持既有同排显示；中文无对应覆盖。
- 英文 tenure coverage 与生命周期步骤移除 `nowrap`，可在其原卡片空间内换行，保留原配色、卡片和交互。局部 Prettier、维护预算（685 files；英文 CSS 98/200）与 scoped diff check 均 PASS。4530 离线预览以稳定 counter/字体后的真实 Range 检查确认1649、768和701代表宽度的长数字均在 metric 内，已读取1649与701截图；具体边界、环境、截图和 SHA 见 `output/playwright/xyy-20260927-06/terra/implementation.md`。
- 未运行 build、完整验证、单测或全宽度浏览器矩阵；未改4526基线预览、未提交/推送/部署或写 CMS/数据库/线索。Luna 应在 fresh build 检查合同16个宽度、完整文本和裁切祖先边界，并比对中文1440/390基线。

- 同 ID 最小返工：Luna 首轮 probe 发现英文纵排长数字/单位的文字 Range 在1649、1440、1351和1350仍有0.53–1.36px交叠；只在同一英文 warehouse/network/inspection 数字 selector 增加 `line-height: 1.1`。未改单位、字体大小、breakpoint、原始完整值、accuracy 的 `100 %` 同排或中文输出。Sol 在4530稳定原始值下复核，1649间隙2.55/3.06px、1440间隙3.34/2.52px，均不相交；Luna 已暂停，待新冻结后独立复测。局部 Prettier、维护预算与 diff check 由 Terra 复跑；未运行 build、全矩阵或 full verify。
- Round 2 冻结复核：Prettier、`check:maintainability`（685 files；`english.css` 102/200）及 scoped `git diff --check` 均通过。`english.css` SHA-256 为 `74e7f0caeaf696c6a3dcc2c0f5ca41d78973cf236e3f389466252efa67e3d714`，入口 stylesheet 哈希保持 `c01101c4ccb375e5d8f3adba5a6015e0ed632c5acd246d37886d83cbaf92f9de`；此后不再修改 CSS，交由 Luna 独立最终验收。

### XYY-20260927-07 — 导航语言入口间距

Status: CODE DONE（本地 CSS 冻结；待 Luna 独立浏览器验证）

- 仅在 `header-responsive.css` 调整本任务导航布局：最大宽度由44rem增至46rem；桌面单行/窄屏双行两处配对 breakpoint 同步为40rem；语言入口在单行加0.75rem、双行加0.5rem 的 inline-start 留白。未改 Header 组件、文案、链接、切换/偏好逻辑、字体大小或 Liquid Glass 样式；任务05既有 language-suggestion 顶部偏移与 mobile order 差异保留。
- Terra 验证：scoped Prettier、`check:maintainability`（685 files；本文件107/200）和 scoped `git diff --check` 均 PASS。最终 `header-responsive.css` SHA-256 为 `77b5b214e2b9af2af3b3f3021012637b453b118384bf08e31502dce31cc31a81`。Sol 在独立本地CLI会话实际读取4532的中文838px截图，header宽736px、语言按钮至同排末链接间距16px，符合桌面阈值；该预检不替代 Luna。
- Terra 的完整代表宽度浏览器采集受受管环境的 Playwright daemon 缓存目录无写权限阻断（`/home/yj/.cache/ms-playwright/daemon/...`）；未重启或停止4532、未扩展工具诊断。Luna 应在 fresh 独立会话验证合同列出的中英文全宽度、640/639断点、点击盒/文字边界、焦点/双向切换及语言提示条偏移。

### XYY-20260927-08 — 英文数字化详情页

Status: CODE DONE（本地实现冻结；待 Luna 独立 fresh build/browser 验证与 Nova Review）

- 新增 `/en/digital-operations` ↔ `/wuliu-shuzihua` 与 `/en/smart-shipping` ↔ `/yundao-zhineng-jijian`。前者复用原 Logistics Digital 的 Hero、Modules、Chain、Proof 实际区块，后者复用运到的 classic ServiceLanding、Delivery Desk、Operations 和 Experience；locale props 仅替换英文 copy、alt、ARIA 和 `/en/contact` CTA，中文默认输出保持。
- 运到使用本地审核中文 snapshot（title、description、全部 content 字段、stats、features 和五组 FAQ q+a）配对英文 catalog，并经既有 `translateReviewedService` 处理。source drift 省略、成功空 content/FAQ 保持空，不复活英文 catalog；既有 401/403/invalid/网络失败语义未绕过。英文未公开中文源中的 `11家`、`最高50%`，而使用 route-qualified 非量化说明。classic 分支改为传递 `visibleContent`/`visibleFaqs`，避免 English CMS 空值泄漏静态页内容。
- 新路由同步 home 英文详情入口、service active state、route pair、sitemap、llms；Digital 的英文首屏标题收紧为可在原窄列自然换行。640px 以下仅英文 Delivery Desk 长 stats 改为单列堆叠；390px 实际截图显示 Multi-carrier、Multiple scenarios、End-to-end、Route-specific 均完整，无中文样式改动。
- 验证：focused Vitest 4 files/18 tests PASS（覆盖完整 source、变更 source/FAQ、省略、success-empty、route pair/active/home href）；`npm run typecheck` 522 files、0 errors/warnings/hints PASS；scoped Prettier、ESLint、维护预算（691 files）和 `git diff --check` PASS。详细实施、截图与 SHA-256 见 `output/english/xyy-20260927-08/implementation/terra-implementation.md`。
- 未运行 build、full verify 或完整浏览器矩阵，未提交、推送、部署、CMS/数据库或真实线索写入。Luna 应以 fresh build 检查两条路由的1440/768/390/360长文本、首屏固定导航避让、语言切换/canonical/hreflang，以及运到 CMS success-empty、source drift 与失败契约。

- 同 ID Luna CMS-combination FAIL 最小返工：英文 classic 服务的 source guard 令正文不可见时，`faqSchema` 曾仍接收翻译后的 FAQ 而发布不可见 FAQ JSON-LD。仅在 `ServiceLanding.astro` 将 schema 输入限定为 `presentation === 'classic' && !hasVisibleClassicContent ? [] : visibleFaqs`；正常可见 classic 继续发布5条 FAQ，中文 classic 和 footwear/redesign 语义不变。为保持179/180行预算，将同一 import 拆为 value/type 两行，未改变行为。Prettier、scoped ESLint、维护预算（692 files）、scoped diff check均 PASS；`npm run typecheck` 完成但被 Luna 并行新建且不属本范围的 `tests/e2e/english-digital-details.spec.ts` 两个 DOM 类型错误阻断，不能记为 PASS。详细证据见 `output/english/xyy-20260927-08/implementation/schema-guard-rework.md`；未运行 build/full verify/browser，待 Luna fresh candidate 复测 empty/changed 与正常 source schema。

### XYY-20260928-02 — 发布后首页 CMS 适配返工

Status: CODE DONE（待独立 Luna/Nova 复测与 Sol 补发布）

- 根因复现：验收站公开 GET 捕获的 3 条 services 使用 `approved-services.mjs` 的历史完整内容，现有 `HOME_SERVICE_FALLBACKS` 简版指纹不匹配，英文首页故将三条全部省略。仅在获分配的首页英文 adapter 增加精确 source catalog：既有 fallback、捕获的旧字面量版本、以及当前 approved-services claims 模板展开版本。匹配要求 slug、name、subtitle、description、feature 数和 feature 顺序/文本全部相同；不按 slug 盲译，未知/改写/缺项仍沿用 omission warning 并省略。成功空数组维持空数组。
- 英文仍复用既有审核 copy；历史 `99.99%` accuracy pair 是唯一保留的来源指纹，其余已登记数值均由 `CLAIM_TEXT` 或 fixture 中的 `{{claimKey}}` 模板构成。可见英文数值始终从 `englishClaim()` 生成。输入 `id`、`sort`、`icon` 原样保留；当前 approved-services 模板经当前 claims 展开仍可被识别。
- Luna 完整 verify 实际发现 claims 字面量守卫 FAIL（543 passed/1 failed，16 条违规），原失败证据保留在 `rework/luna/verify.log`。本轮仅把 catalog 中 7 类已登记数字改为 `CLAIM_TEXT`，fixture 改为对应 claims 模板，英文期望从 claims 获取；不改守卫/allowlist。专用 comparison test 对每个 subtitle/description/features 调用 `interpolateClaims`，展开后的 fixture 与本次 `published-services.json` 精确相等（3 records）。rework 后 `claims`/home-content/English CMS focused Vitest 3 files/18 tests、comparison 1 test、Prettier、scoped ESLint、scoped diff check、`npm run typecheck`（525 files，零诊断）和 `check:maintainability`（694 files）均 PASS。哈希、命令与限制见 `output/release/xyy-20260928-02/rework/terra/implementation.md`。
- 未运行完整 verify 或浏览器；未改 CSS、页面、CMS/DB/线索、服务器、部署、Git 提交或推送。Luna 应独立复测完整 verify、捕获三条与拒绝路径及首页 01–04；Nova 应核对 catalog 仅接受明示版本、claims 输出和范围。

- 同 ID Round2 视觉 FAIL 最小返工：Luna 稳定390px实测 service 03 的 badge `03` 被 `z-index:1` dashboard frame 覆盖，不能仅通过加层级遮盖另一段内容。只在 `digital.css` 新增 `max-width:768px` 且 `#svc-logistics-cloud[data-locale='en']` 的规则：media 改为纵向 flex，badge 设为 static/order -1，dashboard 宽100%，caption static；三者因而按照 badge→看板→说明的正常文档流排列。未改动画、中文、1440桌面、其他 section 或其他 CSS；此前四个 CMS 适配/测试文件 SHA-256 均保持冻结值。Prettier、维护预算（694 files）和 scoped diff check PASS；CSS 119/200 行，SHA-256 `d3597b5cbb1e96ba82074082bb77bc1eb0889b761b6aef767318d299619b25d8`。未自行运行浏览器或 full verify，交 Luna 独立检查360/390/768及中文/1440基线。

### XYY-20260928-03 — 英文已发布案例适配

Status: CODE DONE（待 Luna 独立 verify/SSR/浏览器验收与 Nova Review）

- 英文案例 adapter 现同时接受既有离线 `CASE_FALLBACKS` 和本次只读 staging published 六条来源。审核指纹严格包含 slug、category、label、name、full_name、case_description、details、tags、stats 和经 `getCases()` 规范化的 metrics；仅排除 `img`、`image_file`、`accent` 这三项展示信息，故线上图片/颜色变化会原样保留而正文、tags、stats、metrics 或未知身份改写仍诊断并省略。指纹采用 SHA-256，以避免把完整未审核运营数字复制进英文 adapter；实际 fixture 通过既有 `getCases()` 链路后进入比对。
- 新增 TOYOUTH 审核定性英文 copy；成功 CMS 返回的第六项为 toyouth，不注入离线 inman。现有 inman 离线 catalog 保持，实际六项顺序为 ur、maxrieny、xingmian、meiyi、romi-studio、toyouth。所有英文可见文字继续是英文审核 copy，stats/metrics 不公开；六个 CMS 图片地址保留。
- 英文首页 `cases=[]` 时只省略 gallery、全部案例入口与 modal，避免空的固定高度蓝色 gallery；中文分支保持原输出。`/en/cases` 的现有空态仍由其原组件处理。
- 验证：fixture 与只读 snapshot 的 `data` 逐字段一致（6 records、顺序及六个 img 均相等）；claims 与英文 case/CMS/route focused Vitest 5 files/22 tests PASS，覆盖 `getCases` 规范化后的真实样本、TOYOUTH、图片、empty、tags/stats改写和未知项拒绝；Prettier、scoped ESLint、diff check、typecheck（527文件零诊断）及维护预算（696 files）均 PASS。哈希、命令和限制见 `output/english-cases/xyy-20260928-03/implementation/terra/implementation.md`。
- 未运行 full verify、browser、提交、推送、部署或任何 CMS/数据库/线索写入；请 Luna 独立复测真实 fixture 的六项首页/列表/Modal、桌面与手机、empty gallery 与中文基线，随后交 Nova 审核。

- 同 ID 文案收尾：TOYOUTH 英文说明将面向读者无关的 “Its published case describes …” 改为 “Its operations coordinate inventory and orders across sales channels.”，保留首句、含义和 tags，不改 adapter、fixture、组件或测试。仅 `cases-copy.ts` 变更；Prettier 与 scoped diff check PASS，新 SHA-256 `30285238f6f5c74701554b4a36c021fae0d75a031e3fc8ac83cc6aa502ccf21c`，其余本任务五个应用/测试冻结文件哈希未变。未扩展测试，交 Luna 后续独立完整 verify/浏览器验证。


### XYY-20260928-04 — 英文案例内容与详情修复

- Terra-data 实现独立案例 claims 注册表和完整审核英文内容，六条 published 共32项指标及背景/tag数字都有同源记录；保留source digest与原离线回退。claims拆为35行入口及20–100行模块，未放宽全局claims守卫。定向3文件12单测、scoped格式/lint/diff PASS。
- Terra-ui 实现六案例动态英文详情、首页/弹窗/列表详情入口、同案例语言配对、Article/ItemList/hreflang/sitemap/llms及英文长指标两列/手机一列样式；获Sol批准增加case-display.ts路径helper。定向2单测、scoped格式/lint/diff PASS；MEIYI两视口headless内容检查通过，完整交互和视觉尚待Luna。
- 两个Terra完成后Sol冻结37应用/单测路径并同步隔离candidate，37/37 hash一致、1326保护路径未变。未运行全量verify/build或声称最终验收；既有修改保留。证据 output/english-cases/xyy-20260928-04/implementation/terra-data/ 与 terra-ui/。

- XYY-20260928-04 同ID返工：Terra_case_copy_rework修复UR description百分比和stores重复，百分比displayValue与unit分别登记并统一无空格渲染；其它描述/metrics已核对，无同类重复。仅5个案例数据/定向测试文件，32stats原值断言保持，3文件12单测及scoped格式/lint/diff PASS；Sol复制candidate并重冻37项，完整verify-rework再次exit0。证据 implementation/terra-data/rework-unit-copy/report.md；该Terra未执行发布或全量浏览器测试。

### XYY-20260928-04 — 英文列表单位空格补修

- 本次由实际继承模型的既有 `luna_case_qa_finish` 会话承担 Terra 职责，未宣称切换专用模型；此前主实现和当前独立测试/Review 角色继续分离。
- 仅修改 `src/components/cases/CaseCard.astro` 两处英文且单位非空的值/单位拼接，添加一个普通空格；中文和无单位值保持。局部 Prettier、ESLint、diff 检查 exit0，交付 `implementation/terra-ui/unit-spacing/report.md`；未修改其他实现或测试，未提交/推送/部署。

### XYY-20260929-01 — 中文仓配详情统一入场效果

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- `ServiceLanding` 仅向合同列出的八个中文详情传入共享 `ServiceDetailMotion`；组件仅为这些页面输出 inert `template[data-service-detail-motion-root]`。客户端脚本以该 marker 的父级 `main` 为唯一作用域，英文四个对应页、`/product` 和其他服务页不会初始化；未修改正文、路由、CMS、SEO/schema、媒体或八个详情组件。
- 共享脚本按 DOM 顺序收集可见的标题/段落、卡片/列表项和独立媒体；排除最外层大 article、折叠 FAQ、hidden/aria-hidden 与 tabpanel，避免祖孙重复和整段 section 被隐藏。`IntersectionObserver` 同批以集中配置的80ms间隔（最高320ms）调用 WAAPI；文案淡入轻上移，媒体轻缩放。键盘 focus 和锚点命中立即清理待显现状态；无 JS、无动画 API、reduced-motion 与运行时切换均恢复完整静态可读内容，不写滚动监听。
- 验证 PASS：指定文件 Prettier、scoped ESLint、`npx astro check`（544 files，0 errors/warnings/hints）、`npm run check:maintainability`（715 files，所有指派文件低于预算）及 scoped `git diff --check`。4322本地 curl 门控检查中八个中文路由各有一个 marker，四个英文对应页和 `/product` 均为0。详细命令、范围与限制见 `output/service-motion/xyy-20260929-01/terra/implementation.md`。
- 未运行浏览器矩阵、full verify、build、提交、推送、部署、CMS或数据库操作。Luna 应独立验证八页桌面/手机的动画中间帧、媒体边界、键盘/锚点即时显现、动态 reduced-motion、无 JS/API fallback 与英文隔离；Nova 应复核精确门控、目标排除和取消清理。

- 同 ID 用户节奏调整（LOW）：仅将共享 `DETAIL_REVEAL_TIMING.duration` 从460改为800、`stagger` 从80改为150；`maxStagger=320`与其他实现不变。按本轮合同未运行浏览器、类型检查或全量测试；局部 Prettier 与 diff 检查通过后交 Luna 独立核对1440/390实际时序、可读性与英文门控。

### XYY-20260929-02 — 英文仓配详情共享动效

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- 仅修改 `ServiceDetailMotion` 的 locale 启用条件为精确允许 `zh-CN` 与 `en`；原八项业务 slug 白名单、800ms/150ms/320ms 时序、脚本、样式及页面组件均未改。现有四个英文仓配详情因此复用同一共享效果。
- 验证 PASS：指定组件 Prettier、scoped ESLint、`npx astro check`（544 files，0 errors/warnings/hints）及 scoped `git diff --check`。与本任务基线的组件 diff 仅为 locale 条件一行。Sol 已另行完成17路 SSR 比对和源码保护冻结；Terra 未重复该验证。
- 未运行浏览器、full verify、build、提交、推送、部署、CMS或数据库操作。Luna 应独立验证英文四页1440/390的800ms/150ms/320ms时序、可读性、tabs/FAQ、reduce/no-JS和控制路由门控；Nova 复核白名单与最小范围。

### XYY-20260929-03 — 中文日常发布，英文精选补充

Status: CODE DONE（本地实现冻结；待 Luna 独立浏览器/接口验证与 Nova Review）

- 新增 `/en/news`、`/en/news/{slug}`、Insights 导航、动态 language pair、英文 sitemap 条目与英文 canonical/hreflang。英文适配器只在中文 `published` 且已到时、英文 `published` 且已到时、标题/摘要齐全、正文清洗后仍有可见内容时输出；列表、详情、相关推荐、中文配对及 sitemap 共用此判定。英文读取使用独立 `fields:['*']`，不对可选英文字段加 Directus filter，旧 schema/旧中文记录继续保持中文输出；401/403、非法响应仍沿用现有显式失败语义。英文详情不存在时保留 HTTP 404 并显示英文返回入口。
- CMS 定义新增可空 `title_en`、`summary_en`、`content_en`、默认 `draft` 的 `english_status`、`english_published_at` 与关闭态 `english_content` group alias。最小扩展 setup runtime，使 group alias 先于归组字段创建，原 relation alias 仍在 relation 后创建。定向 `migrate-english-news-schema.mjs` 默认 dry-run，仅显式 `--apply` 加确认环境值才写；对现存英文 group/字段的类型、可空性、归组和 draft 默认值不兼容会明确中止，不自动修正。未执行该脚本或任何 CMS/数据库/权限写入。
- 编辑交接在 `docs/english-news-editorial.md`，覆盖历史记录兼容、人工审校、事实变更复核、撤下规则及未来授权后上线顺序。Terra 定向验证：Vitest 8 files/40 tests PASS；`npm run typecheck` 557 files、0 errors/warnings/hints PASS；scoped Prettier、ESLint、`npm run check:maintainability`（728 files）和 `git diff --check` PASS。Sol 本地 4322 冒烟：`/en/news` 200、未发布英文详情 404 且有英文提示、`/news` 200。
- 受根盘空间协调限制，本轮未运行 build、完整 `npm run verify`、浏览器矩阵或 `verify:release`；未提交、推送、部署或写入真实 CMS/数据库。Luna 应以隔离 CMS fixture 独立检查旧 schema、状态/时间/空正文/中文撤下、404、hflang/canonical/sitemap、桌面和360/390导航及英文可读性；Nova 应复核 schema dry-run/apply 边界、共享判定与范围。
- 文档收尾：首批建议仅记录“中国鞋服仓配合作指南”“退货质检与再上架流程”“仓配项目启动资料清单”；每月按事实、场景和证据筛选，不强制篇数。本轮未代写、翻译或发布文章；`draft` 仅供后台编辑器核对，网站没有草稿预览。未来需在准确授权下依次审阅目标 CMS dry-run、apply 仅六项英文 schema、确认运行读取且不改权限、运行 `verify:release` 并取得部署授权、最后验收线上公开/撤下；本轮未执行其中任一步。
- 同 ID Luna FAIL 最小返工：英文不可公开详情保留 HTTP 404 与 `noindex,nofollow`，但 canonical 改为请求的 `/en/news/{slug}`（空 slug 使用 `unavailable`），不再借用 `/en/news` 栏目 canonical；未传 `localePair`，共享 `DocumentHead` 因此不会输出任何 hreflang alternate。英文列表首屏和详情面包屑分别以 `calc(8rem + language-suggestion 可见高度)` 留出手机安全间距、`sm` 起用 `6rem` 基础间距；可见语言提示时两者与固定 Header 的现有高度变量同步，未改共享 Header 或中文页面。
- 本轮验证：新闻 SEO 局部回归加既有英文适配器 Vitest 共 2 files/10 tests PASS；scoped Prettier、ESLint 与 `git diff --check` PASS；`npm run typecheck` exit 0（560 files，0 errors/0 warnings；Luna 新增 `tests/helpers/english-news-fixture.ts` 有2个既有 hints）。未运行 build、完整 `npm run verify` 或浏览器；返工后完整 verify 由 Sol 协调。Luna 应复测不存在/撤下详情的 404/noindex/无 hreflang，及 390/360 下英文列表 eyebrow 和详情 breadcrumb 与固定导航的几何不重叠。
- 同 ID Nova REJECTED 最小返工：先新增的6个不可见占位输入在旧实现下均复现为列表可见（定向 Vitest 16项中6项失败），包括 U+200B、ZWJ、ZWNJ、`&ZeroWidthSpace;`、`&#8203;` 和 `&shy;`。现将英文标题、摘要和清洗正文的资格 probe 改为移除 `White_Space` 与 `Default_Ignorable_Code_Point` 后判定是否仍有字符；该 probe 不改写实际返回的标题、摘要或清洗正文。安全图片仍可作为正文，含 ZWJ 的 emoji、正常 Unicode 文本及正文原样保留。
- 返工验证：`news-english-adapter`、`cms-news-hardening`、`news-publication-time` 共3 files/31 tests PASS；scoped Prettier、ESLint、`git diff --check` PASS；`npm run typecheck` exit 0（561 files，0 errors/0 warnings/0 hints）。未运行 build、完整 `npm run verify`、浏览器或外部操作；交 Luna 定向资格复测，再由 Nova 复审。

### XYY-20260929-04 — 英文供应链白皮书资料页

Status: CODE DONE（待 Luna 独立浏览器/SSR 验证与 Nova Review）

- 新增 `/en/supply-chain-whitepapers`：沿用中文目录的 CMS 可用期次与本地转换元数据，再仅在标题、摘要和刊期标签完整匹配审核源快照时显示英文卡片。成功空 CMS 目录/FAQ 保持空；未知或改写的期次/FAQ 显式诊断并省略。第10期卡片显示“Cover: Autumn 2024; e-publication foreword: SUMMER (source conflict retained)”，第14期显示“June 2026 (cover)”。所有阅读和 PDF 链接继续指向原中文文章/PDF，页面和链接文案明确原文语言。
- 新增 Insights 内资料入口；白皮书页归 Insights 活动态。路由、DocumentHead、Header 与语言建议的精确匹配统一忽略末尾斜杠，因此中文 `/supply-chain-whitepapers/` 与英文页具备双向切换、canonical/hreflang；sitemap 与 llms 已加入英文资料入口。中文目录与14期阅读页未改。
- 验证：`prettier --check`、scoped ESLint、`git diff --check`、`npm run check:maintainability`（737 files）均 PASS；`vitest run tests/unit/english-whitepapers.test.ts tests/unit/english-routes.test.ts tests/unit/english-shell-routes.test.ts` 为3 files/7 tests PASS；`npm run typecheck` 为567 files、0 errors/warnings/hints。未运行 build、完整 verify 或浏览器；未提交、推送、部署或访问 CMS/数据库。根盘仅约11MB可用，Luna 应使用协调的临时目录独立检查 CMS empty/error、14期链接（重点第10/14期）、canonical/hreflang/语言切换、Insights active 及1440/390/360 可读性。

- 同 ID Sol 源码复核返工：此前 Header、DocumentHead 与 LanguageSuggestion 分别移除 route-pair 末尾斜杠，但根路径 `/` 会变为空字符串，造成中文首页的静态 `localePair` 不匹配。现将路径规整、pair 匹配与静态 pair 查找集中到 `routes.ts` 的 `normalizePath`、`matchesLocalePath`、`findLocalePair`，三处调用同一行为；根路由、普通静态页、动态 news pair 和白皮书尾斜杠均保持可配对。新增单测遍历全部静态 pair 的中英文侧，并覆盖根路径与动态详情 pair。第12期标签改为“Summer 2025 (original contents page also shows 03–07)”，不推断该日期含义。
- 返工验证：scoped Prettier、ESLint、`git diff --check`、`npm run check:maintainability`（737 files）均 PASS；三份英文路由/白皮书单测为3 files/8 tests PASS。按返工合同未重跑全量 typecheck、build、verify 或浏览器；交 Luna 实际 SSR 验证根路由的语言切换与 hreflang。

- 同 ID Luna 移动视觉 FAIL 返工：已查看 `output/english-whitepapers/xyy-20260929-04/sol/before-mobile-spacing-fix/whitepapers-390.png` 与1440对照。390下固定 Header 底部紧贴 Hero eyebrow；仅在 `EnglishPublicationsHero` 将原 `py-20` 拆为保留 `pb-20`、小屏 `pt-[calc(8rem + language-suggestion visible height)]`、`sm` 的6rem安全间距和 `lg:pt-20`。因此390/360将首行、H1和CTA移至固定导航下方，1440恢复任务前80px顶部间距；未改文案、链接、中文或共享Header。
- 验证：该 Hero Prettier 与 scoped ESLint PASS，79行且低于180预算；`git diff --check -- src/components/publications/EnglishPublicationsHero.astro docs/TERRA.md` PASS。全局 `git diff --check` 仍因并行 `docs/LUNA.md:4211` 的既有 trailing whitespace 失败，未修改该非所有权文件。按合同未运行浏览器、build、verify或typecheck；交 Luna 复测390/360和1440。

- 同 ID Sol 增量源码审返工：上一轮 `lg:pt-20` 在无语言建议条时正确保留80px，却覆盖了共享 Header 的 `--language-suggestion-visible-height` 偏移。Hero 的 `lg` 规则现为 `calc(5rem + var(--language-suggestion-visible-height,0px))`；无提示时1440仍为80px，有提示时保留同一安全高度。小屏/`sm` 安全计算、文案、链接、中文和共享组件均未改。
- 验证：Hero scoped Prettier、ESLint 与 `git diff --check -- src/components/publications/EnglishPublicationsHero.astro docs/TERRA.md` PASS，79行；本轮按合同未运行浏览器、build、verify或typecheck，交 Luna 复测语言建议条可见时的1440/390/360。

### XYY-20260929-06 — 中英文 Services 共用首页页脚

Status: CODE DONE（待 Luna 独立浏览器验收）

- 仅移除 `/product` 与 `/en/services` 的 `showFooter={false}`，保留 `showFloatingContact={false}`；两页因此复用其现有 Layout/EnglishLayout 的同语言共享 Footer。视频序列根容器改为相对定位且不再裁剪，内层滚动移除 `overscroll-behavior-y: contain`，导航从 fixed 改为此根容器内的 absolute，故最后一分区可继续滚动至 Footer，导航不会停留在 Footer 上方。
- 验证：三份指派源码 Prettier PASS；Astro 页面 scoped ESLint PASS，CSS 被 ESLint 以无匹配配置提示 ignored、命令 exit 0；指派源码 `git diff --check` PASS。实现说明见 `output/playwright/xyy-20260929-06/terra/implementation.md`。未运行浏览器、build、full verify、typecheck、提交、推送、部署或 CMS/数据库操作；请 Luna 在4322独立覆盖1440/390的页脚可达性、返回服务、八视频/九分区、导航与无横溢。

- 同 ID 当前增量（MEDIUM）取代上轮外层页脚方向：中文与英文页面各读取一次既有站点设置，传给既有 Layout/EnglishLayout 并继续 `showFooter={false}`；相同语言的 `Footer` 以 named slot 静态置于第9个 assurance slide 的内容后。Footer 包装器为 `role="contentinfo"`，不新增 video slide、动画或外层 Footer。序列恢复单一内层滚动：根容器裁剪、inner `overscroll-behavior-y: contain`，并令根、八 video slides 和 assurance 最小高度统一扣除 `--language-suggestion-visible-height`，避免提示条可见时形成外层滚动。
- 分区导航初始 `hidden`，无 JS 时不显示无效控制；CSS 明确 `[hidden] { display:none }` 覆盖其 grid 声明。脚本初始化后显示导航，以 inner scroller 为 root 的 `IntersectionObserver` 仅在 Footer 可见时隐藏，离开即恢复；没有新增滚轮监听或 Footer 动画。Prettier、指派 Astro/TypeScript ESLint、`npm run check:maintainability`（740 files）及六个实现文件 scoped `git diff --check` 均 PASS。证据见 `output/playwright/xyy-20260929-06/static-footer/terra/implementation.md`；未运行浏览器、build、typecheck、full verify、提交、推送、部署或 CMS/数据库操作，交 Sol typecheck 与 Luna 4322 独立浏览器验收。

### XYY-20260929-07 — 窄屏导航间距修复

- 仅修改 `header-responsive.css` 的小于640px规则：两行导航从两端分散改为 `space-evenly`，主行添加 8px 起始留白，使 Logo 与首项不贴靠；链接继续按内容宽度排列，收紧横向内边距并明确不换行。因此320px中文第二行的“供应链白皮书”仍可单行显示，不采用可能挤断长标签的固定等列。640px以上的媒体规则、链接、激活状态、语言切换、组件和脚本未改。
- 验证 PASS：`node_modules/.bin/prettier --check src/styles/header-responsive.css`、`git diff --check -- src/styles/header-responsive.css docs/TERRA.md`。证据为 `output/playwright/xyy-20260929-07/terra/implementation.md`。按合同未启动或重启预览、未运行浏览器、build、full verify、提交、推送、部署或 CMS/数据库操作；交 Luna 在既有4322预览独立检查中英文320/360/390/589/639及640/1440、语言建议条组合和代表截图。

- 同 ID 单排增量取代上轮两排约束：小于640px时 Header 固定56px，两个既有 mobile-row 包装改为 `display: contents`，使 Logo、导航链接和语言按钮同排。Logo和语言按钮是不收缩的 flex 项；导航是唯一 `overflow-x: auto` 项，保留原生细滚动条及聚焦目标自动滚入能力。链接保持内容宽度与不换行，字号为12–14px clamp；链接放得下时 `space-between` 占满可用菜单区域，超宽则从起点原生横滑。移动链接焦点轮廓内收，避免纵向裁剪后不可辨。为572px完整显示所有标签，Logo/链接内边距/间隔使用紧凑值，320–390仅导航区横滑。640px以上规则、组件、链接、脚本和路由未改。
- 验证 PASS：`node_modules/.bin/prettier --write src/styles/header-responsive.css output/playwright/xyy-20260929-07/single-row/terra/implementation.md`、随后相同文件 `--check`，以及 `git diff --check -- src/styles/header-responsive.css docs/TERRA.md`。证据为 `output/playwright/xyy-20260929-07/single-row/terra/implementation.md`。未启动或重启预览、未运行浏览器、build、full verify、提交、推送、部署或 CMS/数据库操作；本轮视觉 AC 交 Luna 于既有4322预览独立验证。

- 同 ID CSS review 最小返工：共享玻璃导航的 `:focus-visible` 选择器优先级高于此前移动链接规则，致使内收 outline offset 无法覆盖。仅将移动规则收窄为 `.site-header .site-header__mobile-link:focus-visible`，优先级足以保留导航内的可见键盘焦点；布局、溢出、字号、链接、桌面规则和其他文件未改。后续 scoped Prettier 与 diff 检查通过，更新哈希和证据后交 Luna。

- 同 ID 溢出折叠菜单增量（MEDIUM）取代移动端横滑：现有 DesktopNavigation 在 JS 可用的窄屏担任主导航，语言按钮后新增本地化原生 `details/summary`，其静态内容始终保留原顺序的全部链接作为无 JS 回退。脚本先临时隐藏折叠控制并测量全部主链接；全量可放下则控制保持隐藏，否则重新显示控制、测量其占位后的可用宽度，并只将不能放下的连续后缀迁入折叠层。两处重复链接以 `hidden` 互斥，故不可见副本不保留键盘焦点。
- 分配在窗口/媒体查询变化、Header 行尺寸、`document.fonts.ready` 与后续 `loadingdone` 时调度；ResizeObserver只观察行容器，不观察被重新分配的导航。Escape关闭并归还 summary 焦点，外部指针关闭；resize 时链接焦点会迁到可见主链接或折叠层副本，summary若因临时测量失焦也会恢复。弹层复用现有 mobile-menu 玻璃样式，以100dvh及语言建议条高度限制高度并内部滚动；主导航、summary与折叠链接均用内收焦点提示，避免裁剪。
- 验证 PASS：四个源文件的 Prettier、scoped ESLint（CSS按项目配置提示 ignored、无 error）、`npm run typecheck`（572 files，0 errors/warnings/hints）、`npm run check:maintainability`（741 files）及 scoped `git diff --check`。证据见 `output/playwright/xyy-20260929-07/overflow-menu/terra/implementation.md`。未启动或重启预览、未运行浏览器/E2E、build/full verify、提交、推送、部署或 CMS/数据库操作；Luna须独立验证中英文各宽度、details交互/无JS、动态分配、焦点迁移、服务页Header与语言建议条组合，随后交Nova审阅。

- 同 ID 按指定按钮图最小视觉增量：仅将折叠 summary 的三点替换为 aria-hidden 内联 SVG 三横线；32px 按钮改为约8px圆角的浅色方框与深灰图标。hover/open仍保持浅色底和深灰图标，既有内收 focus 样式、native details语义、标签、尺寸、分配脚本和其他源未改。两文件 scoped Prettier、ESLint（CSS ignored warning、无 error）及 diff 检查通过；不重复全量 typecheck，更新哈希与实现证据后交 Luna。

- 同 ID 最新按钮材质调整：用户要求折叠按钮与导航栏一致，故仅在 `header-responsive.css` 去除实体浅色底和深灰图标，改为透明玻璃基底、细白边、白色 SVG 三横线、轻微内侧高光及白色半透明 hover/open 高光。32px尺寸、8px圆角、native details、焦点、reduced-motion继承和所有脚本/组件未改。scoped格式与 diff 检查后更新证据和哈希；未重跑类型或完整测试，交 Luna 独立核对视觉与交互。

- 同 ID 间距增量：仅在小于640px的响应式 CSS 将玻璃内联留白由8px增至12px、Header 行 gap 由4px增至8px；折叠菜单相对 summary 的顶部距离调整为20px，并将最大移动宽度改为 `calc(100vw - 3rem)`，保证左右各24px留白。不新增语言按钮边距，测量脚本和其余三源不变；格式/diff后更新证据和哈希，交 Luna 冻结测试。

- 同 ID 弹层可读性返工：已查看 `sol-preview-final/zh-390.png` 与 `en-390.png`，确认原嵌套 backdrop glass 会让 Hero 大字和蓝色 label 透过弹层、干扰“联系我们”/“Contact”。仅给 mobile-menu 加带轻高光的 `rgba(7,20,39,.95)` 深蓝玻璃底，保留已有边框、blur、圆角，主导航和按钮透明度不变。`calc(100vw - 3rem)`在宽屏 cap 下保证的是两侧至少24px留白，而非始终精确24px。scoped格式/diff后记录哈希，交 Luna 复测。

- 同 ID 主导航间距增量：用户指出“行业动态”和EN之间尾部空隙过大，故只将 JS 增强移动主导航的 `justify-content` 由 `flex-start` 改为 `space-between`；可见前缀的剩余宽度均匀分配，末项至 EN 仍使用 Header 行既有8px gap。链接 padding、columnGap测量、分配算法、按钮/弹层玻璃及其他源未改；scoped格式/diff后更新哈希和证据。

- 同 ID ResizeObserver 回退兼容修正：仅将 `header-overflow.ts` 的 API 分支从属性存在判断改为 `typeof ResizeObserver === 'function'`，避免全局值为 `undefined` 时构造抛错；既有 window resize 回退、字体与媒体查询重算及其他逻辑未改。scoped格式/ESLint/diff后更新脚本哈希，交 Luna 以 `window.ResizeObserver = undefined` 独立验证。

- 同 ID Luna edge FAIL 最小返工：查看 `overflow-menu/luna/edge-diagnosis.md` 和安装的 Lenis API，390×260下菜单虽有可滚动几何但首页 Lenis 拦截 wheel，`scrollTop` 保持0。仅给 overflow menu 的原生 `nav` 增加 `data-lenis-prevent`；Lenis 因此允许该既有 `overflow-y:auto` 容器原生 wheel/touch 滚动，不驱动背后页面。未改 href、分配、外观、无JS结构或 CSS，未加 overscroll规则。scoped格式/ESLint/diff后更新证据与哈希，交 Luna 重跑edge probe和导航回归。

- 同 ID glass-match LOW静态返工：响应式 mobile-menu 的 `.95` 深蓝覆盖已移除；`header-liquid-glass.css` 将原 popover/mobile-menu 共用圆角与 `.72` 背景拆开，popover保留原背景，mobile-menu因此直接继承与主导航相同的 `.5` 玻璃渐变、边框、阴影、blur及 `::before` 高光。尺寸、间距、链接、JS、按钮、fallback/reduced-transparency和其他文件未改。两CSS scoped Prettier/diff后更新证据与哈希，交 Luna 专项实测。

- 同 ID glass-match 视觉 FAIL最小返工：已查看 `glass-match/luna/glass-en-390.png`，Luna也已亲读四张 attempt-1 图并确认 FAIL。menu虽与主栏 computed glass 值相等，但父 `.site-header__glass` 的 backdrop-filter 形成 backdrop root，使子 menu 锐利且 Hero 橙字穿过“Contact”。仅在小于640px将父元素 filter 设为 none，并把相同22px blur/saturate/contrast移至其既有 `::before` 玻璃层；mobile-menu继续保留自身共享22px filter。主栏与下拉因此各自采样页面背景，桌面和现有无filter/reduced-transparency回退不变，未恢复深色罩层或改动尺寸/间距/JS/href。完成scoped检查后交Sol快速实页复核，再由Luna独立复测。

### XYY-20260930-01 — 英文询盘入口

Status: CODE DONE（待 Luna 独立浏览器验证与 Nova Review）

- 英文 `/en/contact` 现将 Email 设为必填，电话显示为选填；电话帮助文本要求含 `+` 及国家/地区代码，并说明接受空格、短横线和括号。英文侧明确把现有 400 号码标为中国境内热线，并新增 “International enquiries” 至同页 `#contact-form` 的表单入口；未添加或暗示业务邮箱，隐私权利邮箱未改作询盘用途。中文表单的电话必填、国内号码校验和既有文案保持。
- 表单提交携带 `locale=en`，共享校验对英文强制有效邮箱、允许空电话并校验非空国际号码；前端和 API 复用邮箱、国际号码及原始长度检查，防止超长字段先截断再通过。`locale` 仅作网站校验，不进入 `ContactLead`；接收端 mock 断言仍为原有六个业务字段，空电话保持空字符串，未制造占位值。
- 验证 PASS：`vitest run tests/unit/contact.test.ts tests/unit/contact-integration.test.ts tests/unit/contact-client-copy.test.ts`（3 files / 29 tests）、`npm run typecheck`（572 files，0 errors/warnings/hints）、scoped Prettier、scoped ESLint、`npm run check:maintainability`（741 files）及 scoped `git diff --check`。未运行浏览器/E2E：旧 4322 预览不可用，需 Luna 在本地隔离预览中覆盖桌面/移动、英文成功/失败 mock、空电话/国际号码、无横溢和中文对照；浏览器证据应留在 `output/playwright/xyy-20260930-01/`。
- 已知依赖：只读确认的 Xiansuo 接收端仍强制国内 `phone` 且以电话去重，故本地英文 email-only 或国际电话通过网站校验不表示真实接收端可保存。本轮未修改该仓库、CMS/数据库、外部接收端、提交、推送或部署；不得以 mock 成功替代该兼容性确认。

- 同 ID 最小返工：Sol 的本地浏览器检查发现 “International enquiries” 链接至 `#contact-form` 后，英文姓名字段会被固定导航遮挡。仅将英文 form 的现有 class 增加 `scroll-mt-28`，中文继续为原有 `space-y-5`。未改字段、校验、脚本、链接、测试或其他页面；桌面/移动锚点几何由 Sol 和 Luna 复核。

### XYY-20260930-02 — 官网英文询盘接收兼容

Status: RECEIVER CANDIDATE CODE DONE（待 Luna 独立全量测试与 Nova Review）

- 在 `/tmp/xyy-20260930-02-receiver` 的正确接收服务候选（基线 `2bb003e`）中，仅修改 `server/src/routes/website-leads.ts` 与对应隔离集成测试。空/缺省/null电话经校验后存为 `NULL`，空电话要求有效邮箱；非空电话原始长度不超过40，移除空格、横线和括号后允许既有国内格式或带 `+` 的国际7–15位格式。仅非空正规化电话查重，email-only 请求不会合并；Bearer、六字段 strict、负责人、事务、审计和通知捕获保持。
- 定向隔离数据库测试覆盖三种空电话、不同邮箱独立入库、`NULL` phone、来源备注、通知快照解析、国际格式及查重、无联系方式、无效/超长邮箱、无效/超长电话与原回滚路径。`npm run build` 和 `npx tsx --test test/website-leads-integration.test.ts` 通过（11/11）；`git diff --check` 通过。候选未加载 `.env`、未启动通知 worker、未触达真实数据库/服务或提交真实询盘。
- 接收服务项目未安装本地 Prettier/ESLint，离线 npm 对二者返回 `ENOTCACHED`，未将格式/lint写为通过；完整 `npm test` 交 Luna。未修改候选外的未追踪设计文档或 `server/node_modules` 软链接，未部署、提交、推送或改生产数据。

### XYY-20261001-01 — 英文页脚服务与中文对齐

Status: CODE DONE（待 Luna 独立页面验收）

- 仅修改 `src/i18n/routes.ts` 的 `ENGLISH_SERVICE_LINKS`：英文 Footer Services 现在与中文八项的语义与顺序对齐。四条既有英文详情页链接保持；新增 Cross-border warehouse operations、South China apparel fulfilment、East China apparel fulfilment、Livestream commerce fulfilment，分别指向 `/en/services#04-cross-border`、`#05-south-china`、`#06-east-china`、`#07-live-commerce`；B2B store distribution 继续在第八项并复用现有英文目录名称。
- 验证 PASS：routes.ts scoped Prettier、scoped ESLint 和 scoped `git diff --check` 均 exit 0；SHA-256 `ead0b951e2ee4e63c37d83350ff46be4bea7ceca20f5fa73b0c05f93ec01c97e`，命令与范围记录在 `output/playwright/xyy-20261001-01/terra.md`。未运行浏览器、应用测试、build/full verify、提交、推送、部署或 CMS/数据库操作。Luna 应独立验证1440/390中英文 Footer、英文八项链接及四个 section 锚点。

- 同 ID 最小返工：初始实现最后一项仍为 `Retail distribution`，与现有 `ENGLISH_PRODUCT_VIDEO_COPY` 不一致。仅将 `/en/retail-distribution` 的 Footer label 更正为 `B2B store distribution`，href和其余七项均未变。routes.ts scoped Prettier、scoped ESLint、scoped `git diff --check` 均 exit 0；更正后 SHA-256 `e1709daca4519d70c5741247df63d2ff5dda973f9ddfb8597953f3a81a99482a`，证据文件同步更新。仍未运行浏览器、应用测试、build/full verify或外部操作，交 Luna 独立复核。

### XYY-20261001-04 — 官网咨询转化一期

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- 新增受控16路由来源映射与 `ContactLink`，覆盖合同指定详情页的 hero、bottom、floating 和 body 入口；联系页按合法 `from`/`entry` 在 SSR 预选服务，非法、重复或直接访问不预选。联系页中英文切换只保留合法来源参数；客户改选不被客户端初始化覆盖。
- 新增默认关闭的转换事件端点和客户端发送：严格 `CONVERSION_ANALYTICS_ENABLED=true` 才启用，事件仅记录 UUID、白名单来源/入口、事件当前语言、当前服务选择和服务器时间；不记录表单内容或访客标识。端点有 JSON/2KiB/Origin/字段白名单/来源白名单和独立有界限流；统计异常不影响原 `/api/contact` 流程。
- 新增 `npm run report:conversions` 与流式 HTML/CSV 汇总、可跟踪 `.jsonl` fixtures、单测、中英文隐私说明及 `docs/CONTACT_CONVERSION.md`。同 ID 证据在 `output/conversion/xyy-20261001-04/terra/implementation.md`，包含可直接运行的样本报告。
- 验证 PASS：定向 Vitest 3 files/14 tests、`astro check`（585 files，0 diagnostics）、`check:maintainability`（754 files）、scoped Prettier/ESLint/diff check。首次 `npm run verify` 的 maintainability 步骤发现报告模块277行超过200预算；已拆分为两个模块，随后上述维护性检查通过。按 Sol 指示未重跑全量 verify/build、浏览器或 E2E。未改保护路径 `src/layouts/ServiceLanding.astro`（SHA-256 `b6d4a102d61d7cbac857d74f05c13dc98203320aeec52ad84e68fb2bdc9e85a6`），未执行提交、推送、部署、CMS/数据库或真实线索写入。

- 同 ID 报告读取器 Luna FAIL返工：仅修改 `scripts/lib/conversion-report-input.mjs`。白名单补齐 `/wuliu-shuzihua`；ISO 时间戳除格式匹配外，必须经 `Date#toISOString()` 精确回环，故 `2026-02-30` 等自动规范化日期明确失败；UUID 去重改为固定字段顺序序列化，字段值一致的不同 JSON 键序只计一次，值不同仍失败。验证 PASS：`npx vitest run tests/unit/conversion-report.test.ts tests/unit/conversion-source.test.ts tests/unit/conversion-events.test.ts`（3 files / 17 tests）、该输入模块 scoped Prettier、`npm run check:maintainability`（754 files）及 scoped diff check。按返工合同未跑完整 verify/build，待 Luna 独立复测。

- 同 ID Luna 浏览器 FAIL返工：仅修改中文 `ContactForm` 与 `ServiceExperience`。`#contact-form` 统一使用既有英文已验证的 `scroll-mt-28`，使中文锚点跳转后的姓名标签/输入避开固定 Header；`ServiceExperience` 的 body `ContactLink` 显式透传既有 `locale`，故英文 returns-inspection、garment-care、retail-distribution 维持 `/en/contact` 且保留合法 `from`、`entry=body` 与 hash。验证 PASS：两文件 scoped Prettier 和 diff check；`astro check` 586 files，0 errors/0 warnings/1 hint（Luna 新增 `tests/e2e/conversion-contact.spec.ts` 的未使用 `serviceByRoute`，不在本轮所有权）。按返工合同未运行完整 verify/build 或浏览器，由 Luna 独立复测。

- 同 ID Luna 正式 FAIL返工：仅修改 `ConversionCTA` 与转换事件 API。受控服务来源优先提供 CTA 目标语言，因此未传 `actionHref` 的英文 redesign 页 bottom CTA 仍以 `/en/contact` 生成来源参数、`entry=bottom` 和 hash，非服务页及显式非联系 href 不变；Content-Type 改为拆分参数后严格比较媒体类型，接受大小写/空白的 `application/json` 与合法参数，拒绝 `application/json-patch+json` 等其他 MIME。验证 PASS：`npx vitest run tests/unit/conversion-events.test.ts tests/unit/conversion-report.test.ts tests/unit/conversion-source.test.ts`（3 files / 28 tests）、两文件 scoped Prettier/ESLint、`npm run check:maintainability`（755 files）及 scoped diff check。按合同未运行完整 verify/build 或浏览器，交 Luna 独立复测。

- 同 ID AC 覆盖返工：仅修改 `ServiceExperience` 的英文 links 映射。精确匹配 `/en/contact` 时改用既有 `ContactLink` 并透传当前 `locale`、`sourcePath` 与 `entry=body`，因此 `/en/smart-shipping` 的 “Contact the team” 保持原文案且生成受控英文联系链接、来源与转换数据；`/en/services`、`/en/cases` 等其他链接仍直接使用原 href，中文分支未改。本轮验证 PASS：该文件 scoped Prettier 与 `npx astro check`（587 files，0 errors/0 warnings/0 hints）及 scoped `git diff --check`。按合同未运行完整 verify/build 或浏览器；实现已冻结，交 Luna 独立验证 smart-shipping 正文入口。

- 同 ID 第4轮视觉增量：仅将 `ContactForm` 的锚点滚动边距从 `scroll-mt-28`（112px）调整为 `scroll-mt-44`（176px）。表单前的标题行高约32px且有32px底间距，新增64px使锚点后标题及姓名标签/字段均留在固定 Header 下；不改 Header、外层布局、来源服务或事件逻辑，中英文共用。验证 PASS：该文件 scoped Prettier 与 scoped `git diff --check`；按合同未跑完整 verify/build 或浏览器，已冻结，交 Luna 在中英文1440/390实际量测标题及姓名字段几何。

- 同 ID 第5轮 Nova 返工：仅在跨境云仓与华南鞋服云仓的既有 `available` hero 文案区各加入一个 `ContactLink`，均传入当前 `Astro.url.pathname` 和 `entry=hero`，沿用中文默认 locale、全局 `redesign-button` 与现有 `mt-6` 间距工具。两按钮分别为“梳理跨境仓内方案”“咨询华南仓配服务”，因此生成受控 `/contact` 来源链接、`cloud-warehouse` 服务及 hero 事件数据；CMS 不可用分支、既有 bottom/floating、标题、数据、视频与 FAQ 未动。验证 PASS：两文件 scoped Prettier、`npx astro check`（587 files，0 errors/0 warnings/0 hints）及 scoped `git diff --check`。按合同未跑完整 verify/build 或浏览器；实现已冻结，交 Luna 在两页1440/390核验 hero 可读/可点击、href/data 属性、预选与无溢出遮挡，并强化16路必需入口集合复测。

### XYY-20261001-06 — 移除报告与事件统计，保留咨询预选

Status: CODE DONE（待 Luna 独立 QA 与 Nova Review）

- 精确删除报告 CLI/HTML/CSV 模块、三类前端事件与 API/独立限流/开关、专属测试及七份 fixture，并删除 Task04 的三份示例报告文件。`Layout`、联系表单脚本、`ContactLink` 和 `contact-source` 只移除事件接线、事件属性与事件专用导出；16 条受控 `from`/`entry` href、SSR 服务预选、语言切换和用户改选保留。未修改 `/api/contact`、联系校验或 `ContactInquiryFields`。
- 四份指定 E2E 改以真实 href 验证 hero/bottom/floating 入口；保留 SSR、无 JS、成功/失败/蜜罐、视觉和页面回归，并在点击、填写和提交路径检查没有 `/api/conversion-events` 请求。截图输出改到 Task06 路径，避免覆盖 Task04 历史证据。中英文隐私页已移除统计段落并恢复统计改动前的日期；说明文档仅描述当前咨询来源与预选行为。
- 自测 PASS：`npx prettier --check`（13 个指定文本文件）、指定 `npx eslint`、`npx vitest run tests/unit/conversion-source.test.ts`（1 file / 4 tests）、`npm run typecheck`（577 files，0 errors/warnings/hints）、`git diff --check` 均 exit 0。基线清单核验 1,437 路径仅缺失合同指定 21 项；`src/pages/api/contact.ts`、`src/lib/contact/validation.ts`、`ContactInquiryFields.astro` 均与 Task06 基线 hash 一致。初次将 `.env.example` 传给 Prettier 因无 parser 返回非零，随即以其余支持文件 scoped check 通过；`.env.example` 仅精确移除两行开关与说明。
- 按 Sol 要求未在仍运行的旧 4322 服务上跑完整 verify/build/E2E；未提交、推送、部署、写 CMS/数据库或触达真实线索。Luna 应以新构建且 `CONVERSION_ANALYTICS_ENABLED=true` 复核旧开关不再生效、旧端点不可用、16 路 href/SSR/语言/无 JS、成功失败无统计请求，以及中英文隐私/联系页 1440/390 截图。

- 同 ID Luna `npm run verify` FAIL 最小返工：`tests/e2e/service-redesign-south.spec.ts` 因新增 6 行、且在页面加载后才监听的重复统计请求检查达到 226 行，超过 220 行测试预算。按 Sol 确认，仅移除该首例的冗余监听与空数组断言；点击/填写/提交的无统计请求覆盖保留在 `conversion-contact`，华南原有页面、FAQ、底部 focus、无 JS hero 实际点击与 SSR 预选断言均保持。验证 PASS：该文件 scoped Prettier、scoped ESLint、`npm run check:maintainability`（746 files；测试最大 220）及 `git diff --check` 均 exit 0。未重跑 verify/build/E2E；交 Luna 依同 ID 重跑完整门禁与浏览器回归。

### XYY-20261002-02 — 咨询预选验收站发布最小测试返工

Status: CODE DONE（待 Luna 独立复测与 Nova Review）

- 仅修改 `tests/e2e/conversion-hero.spec.ts` 的横向溢出断言：由按项目名硬编码 mobile 390px、desktop 1440px，改为在被测页面内断言 `document.documentElement.scrollWidth <= window.innerWidth`。因此保留“不出现横向溢出”的实际判定，同时适配 Playwright mobile 项目的 Pixel 7 412px 视口。
- hero href、可见性、稳定动画、真实点击、SSR 服务预选、无统计请求及 pageerror 断言均未改；未修改业务/UI、浏览器配置、依赖、部署、Git、CMS 或数据库。仅完成局部格式与 diff 自检；未运行 E2E、完整 `npm run verify` 或其他发布动作，须由 Luna 独立复测。
- 自检命令、当前未跟踪测试文件的 no-index diff 与交接重点见 `output/release/xyy-20261002-02/terra/implementation.md`。

- 同 ID Git 传输返工：新增受限 `output/release/xyy-20261002-02/api-push.py`，只接受 `--apply`；默认 dry-run 验证不可变 plan SHA、候选 HEAD/clean、33条冻结 hash、根目录基线/空 index/保护路径及两段本地 Git object，再仅 GET GitHub `main` 与 staging `/version`。所有 API endpoint 固定为 Git Database 的 main 读取、tree/commit 创建和 `refs/heads/main` 更新，参数经 stdin JSON、`shell=False`，不接受仓库、ref、SHA 或 endpoint 输入。`--apply` 才按 tree→commit 顺序调用 POST，逐一要求返回 SHA；对象均匹配后重读 GitHub/staging，并以 `force:false` PATCH。PATCH 必须返回精确 `ref` 和 `object.sha`，再重读 main。每一步会先记录 expected/actual 并持久化，失败保留已完成步骤；main 已是 candidate 时幂等记为 `already_synced`。
- 验证 PASS：helper 语法编译与真实默认 dry-run。dry-run 本地预检、GitHub main=`7f903056`、staging=`b8021b1`均通过，状态 `ready_for_apply`，传输为 `not_run`；没有 POST/PATCH、Git ref、部署或源码变更。完整 mock 故障/响应路径与 apply 安全测试交 Luna，Nova 再审 helper；详细证据和准确 helper SHA 位于 `output/release/xyy-20261002-02/terra/api-push-implementation.md`。

### XYY-20261002-03 — CI 字体原生库加载修复

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- 仅在 `.github/workflows/ci.yml` 的 `npm ci` 后、Playwright 与首次字体调用前增加 Linux x64 native runtime 步骤。固定下载官方 `KonghaYao/cn-font-split` 7.6.8 的 `libffi-x86_64-unknown-linux-gnu.so`，限制 HTTPS 及 HTTPS 重定向，连接上限为10秒；单次传输最多90秒，最多3次重试。下载临时文件先检查精确 6,145,760 bytes 与 SHA-256 `db4690e3…bbf19c`，再在目标目录创建本步骤专属 staged 文件并原子替换；下载/尺寸/hash失败不触及既有 native 文件。步骤输出安装后 stat 和 ldd，任何 ldd 失败或 `not found` 明确非零，并直接 `require('cn-font-split/dist/node/index.js')` 触发真实 dlopen。
- 验证 PASS：workflow Prettier、抽取 run block 的 `bash -n`、scoped `git diff --check`，以及本机 target 的 node native loader。现有库为 6,145,760 bytes、mode 664，`ldd` 没有 `not found`。workflow SHA-256 `7c493d9b750e7ddd714e59d297ba00ec6ad2f0e90e1a7f88de81ada5413b2d25`。本机无 Ruby，故没有把 Ruby YAML 解析写为通过；Prettier 已实际解析 workflow。
- 未下载/替换本机 native 文件、未运行 `npm run verify`、未提交/推送/触发 CI/部署，亦未修改 package/lockfile、字体算法、业务代码、权限或其他工作流。Luna 应在隔离缺失 native 环境覆盖下载失败、尺寸/hash mismatch、ldd/loader failure和成功恢复后的两档字体实际输出；详细交接见 `output/ci/xyy-20261002-03/terra/implementation.md`。

### XYY-20261002-04 — CI 修复版本验收站发布工具准备

Status: TOOLING READY（待 Luna 独立预检与 Nova Review）

- 仅新增本任务发布 wrapper、远端快照与远端后验 helper。三个工具复用 Task02 已审逻辑；`remote-snapshot.py` 与 `check-remote.py` 为逐字相同副本。wrapper 仅把 evidence 目录切到 `output/release/xyy-20261002-04`，并将 release-files 断言由33改为1；候选路径仍为 `/tmp/xyy-20261002-02-website`。目标、完整 `verify:release` 写入前闸门、512MiB候选与 `/`/`/tmp` 空间守卫、`RELEASE_KEEP=100`、原子部署与远端身份/健康/回滚检查均保持。
- 验证 PASS：wrapper `bash -n`，两份 Python 的内存 `compile()`，两个 Python helper 与Task02逐字 `cmp`，三个 helper 的 no-index `git diff --check` 及当前 `docs/TERRA.md` diff 检查。wrapper 的精确 diff 仅 evidence 路径和 frozen count；SHA-256 分别为 wrapper `dbb82a8f…d06171`、snapshot `bb847839…8e7287`、check `c7e415e0…ac10f5c`。完整证据与差异见 `output/release/xyy-20261002-04/terra/implementation.md`。
- 未执行 wrapper、`verify:release`、SSH/远端写入、部署、push、CMS/数据库或真实表单操作；不应将工具语法检查表述为发布或线上验收。Luna 应在执行前复核 candidate `ab82cbd` clean、单文件 freeze、helper hash、空间守卫、目标固定性和未执行状态。

### XYY-20261002-06 — 咨询体验二期、按需求选择服务与移动端验收

Status: CODE DONE（待 Luna 独立 QA 与 Nova Review）

- 新增 SSR/原生 GET 的中英文“按需求选择服务”：5个固定业务需求（电商发货、门店补货、退货质检、商品整理、直播履约）与3个固定区域（不限、华东、华南）只在各参数唯一且有效时输出建议。每个建议提供真实服务详情、案例入口、准备事项及表单锚点；与既有16路 `from`/`entry` 映射的服务值冲突时不预选，参数可在语言切换中保留。首页服务区和产品首屏均新增真实联系页选择入口。
- 案例详情中英文 CTA 现在仅携带稳定 `case` slug；中英文联系页分别以当前 `getCasesResolution` 的结果再次确认案例才显示品牌/业务场景。未知、重复、恶意参数不反射；CMS 成功空结果没有静态复活路径。主动点击“插入填写提纲”才追加品类、SKU/订单规模、渠道、退货、计划时间，保留原输入、阻止重复；超过既有1200字上限时不修改输入并告知用户。
- 新增移动联系样式，使输入文本至少16px、新控件最小44px；新增 `lighthouserc.mobile.cjs`，覆盖首页、产品及中英文联系页的390×844实验室移动设置。未因未测得退化而修改视频、浮动入口或其他加载逻辑；不将该配置称为性能提升。
- 自测 PASS：`npm run typecheck`（580 files，0 errors/warnings/hints）、指定 Prettier/ESLint、scoped `git diff --check`；offline SSR 逐项验证15种需求/区域组合、无需求/重复/非法参数、既有来源/选择冲突/语言参数及中英文 `ur` 案例链接/上下文。实现说明、映射、限制与命令记录在 `output/iteration/xyy-20261002-06/terra/implementation.md`。关键实现 hash：`contact-source.ts` `ae6ab3fa…341b1f`、`ServiceFinder.astro` `ef853be0…4aff65`、`ContactForm.astro` `a46e92a8…a52f75`、`contact-enquiry.ts` `9e7344f3…cba1e0`、`lighthouserc.mobile.cjs` `86975fc0…f6b438`。
- 未运行 full `npm run verify`、E2E、Lighthouse 或浏览器矩阵，未提交/推送/部署、写CMS/数据库或触达真实线索。Luna 应独立覆盖无 JS、模板点击及1200边界、mock 成功/失败重试、来源/选择/案例三类参数和语言切换、360/390/768/1440键盘/遮挡/横溢、reduced-motion与Chromium/WebKit；英文既有案例 E2E 的精确 `/en/contact` href 预期需改为受控 `case` 语境后仍保留行为断言。

- 同 ID 收口：填写提纲现在按每个既有字段标题补缺，用户填写任一字段后再次点击不会重复整套标题；用户主动点击时才把已验证案例名及当前 finder 需求/区域作为可编辑的既有 `message` 文本加入，未增加 API 字段或自动写入。普通或服务来源联系页只在 URL 有有效 `case` key 时才读取案例，避免新增无关CMS依赖。隐私 checkbox 不再被移动端通配 `min-height` 拉伸，44px触达区域由其 label 提供。Finder GET action 带 `#service-finder` 且该锚点有固定导航滚动余量；移动 Lighthouse 启动命令显式使用不可达本地CMS、空内容 token和空线索接收配置，不能继承真实 `.env`。补充 `npm run typecheck`（580 files，0 diagnostics）、Prettier/ESLint/diff check、模板 DOM 隔离检查、SSR/action/context 与离线配置检查均 PASS；详细记录同步更新 `output/iteration/xyy-20261002-06/terra/implementation.md`。仍待 Luna 独立浏览器与全量验证。

- 同 ID 390px视觉返工：Sol本地 Chromium 发现 `.service-finder__reset` 仅56×21px。仅将该链接改为 `inline-flex`、border-box 最小44×44px、保留流式布局并增加可见 `:focus-visible` 轮廓，文案不变。Terra用本地 Chromium 实测中文390×844为79.109375×44px、英文1440×900为115.1875×44px，两个视口均无横向溢出且程序焦点与solid outline存在；局部 Prettier、`git diff --check`通过。样式 SHA-256 `1a5f67b4…fed3b4`，完整证据在 `output/iteration/xyy-20261002-06/terra/reset-touch-target.md`。未运行全量verify/E2E或外写；交 Luna 独立复测移动实际触达与键盘焦点。

- 同 ID 产品首屏视觉返工：Sol发现新增 `.product-video-sequence__finder-link` 在390px仅117.48×25.19px。仅在已有 `video-sequence-responsive.css` 为该新链接添加border-box最小44×44px和居中 inline-flex 内容，未影响原服务链接、导航、视频或文案。Terra Chromium实测中文360/390/1440均115.59375×44px，英文390为294×50.375px、1440为298.21875×44px；所有测点无横向溢出、未与分区导航重叠、键盘焦点和原有solid outline均可见。局部 Prettier与`git diff --check`通过；SHA-256 `edde7ea6…dcffac`，详细几何证据在 `output/iteration/xyy-20261002-06/terra/product-finder-touch-target.md`。未运行全量verify/E2E或外写，交 Luna 独立复测。

- 同 ID reduced-motion 返工：仅在 `.service-finder__summary-icon` 新增 `prefers-reduced-motion: reduce` 的 `transition: none`，常规 `transform 160ms ease` 保留。Terra以本地 Chromium 在普通和reduce模式实际点击原生 finder `summary` 展开/折叠两次：普通计算时长为`0.16s`、reduce为`0s`，两种模式均实测关闭后可重新展开。局部 Prettier与`git diff --check`通过；样式 SHA-256 `8952cf88…2025d2d`，完整证据在 `output/iteration/xyy-20261002-06/terra/finder-reduced-motion.md`。未运行全量verify/E2E、未外写；交 Luna 独立复测reduce计算样式、键盘和点击交互。

### XYY-20261002-07 — 咨询体验二期发布与 Git 同步工具准备

Status: TOOLING READY（待 Luna 独立预检与 Nova Review）

- 仅准备 `output/release/xyy-20261002-07/` 的发布wrapper、远端快照/后验及本地同步helper。wrapper复用Task04，精确改为Task07证据目录和22项freeze；候选固定`/tmp/xyy-20261002-02-website`，目标固定staging `root@47.82.105.103:/var/www/xyy-web`，保留完整`verify:release`门禁、512MiB三处空间守卫、`RELEASE_KEEP=100`、4510/4511端口和离线CMS/空线索接收环境。远端snapshot/check逐字复用Task04。
- `sync-local.py`基于Task02的已部署网站同步工具，适配Task07 baseline、`release-files.json`及未来`expected-website-commit.txt`。在读取GitHub/live身份后才可进入本地refs更新前路径：要求合法SHA、22项freeze、候选HEAD/clean、候选相对baseline文件集和hash、当前冻结/保护文件、空已有index、origin/HEAD基线；只导入精确候选commit、只stage22项并严格tree匹配，再用一个带old-value CAS的`update-ref --stdin`事务更新main和origin/main。未添加reset、clean、force或广泛stage。
- 验证PASS：wrapper `bash -n`，三份Python内存`compile()`，remote两个helper与Task04逐字`cmp`，22项/固定目标/门禁/同步guards静态断言和scoped `git diff --check`。SHA-256：wrapper `0870f641…71ce448`、snapshot `bb847839…8e7287`、check `c7e415e0…ac10f5c`、sync `418992a6…bc60f1`。完整证据位于`output/release/xyy-20261002-07/terra/implementation.md`。
- 未执行wrapper、remote snapshot/check、sync、验证套件、部署、push或任何CMS/数据库/线索外写；`expected-website-commit.txt`尚待Sol候选verify/提交后生成。Luna应独立覆盖成功与未知SHA、候选dirty/freeze/protection漂移、index变化、GitHub/live不匹配的失败路径，Nova再审工具和发布边界。

- 同 ID R2 发布门禁最小返工：首轮完整门禁在任何远端写入前以237通过、4失败、9 skip退出；Luna确认失败是`getByLabel('Your requirements')`同时匹配finder区域和textarea的测试定位歧义。仅把`tests/e2e/english-acceptance-contact.spec.ts`五处改为`{ exact: true }`，保留原mock、断言、超时和业务代码；wrapper与sync helper各仅将freeze守卫22改23，均与R1副本严格比对只差该数字。Prettier、该test ESLint、wrapper `bash -n`、sync内存compile、五处定位/两处数值静态断言及scoped `git diff --check`均PASS。R2 SHA：test `495e3ff0…28d87a`、wrapper `43c07264…81eaf3`、sync `54f3e288…518a0a`；详细证据`output/release/xyy-20261002-07/terra/r2-locator-fix.md`。未启动测试/服务、未修改候选或refs、未部署/push/外写；交Sol更新23项freeze并复制测试至候选，Luna独立复测双项目spec与candidate verify，Nova复审后才可重开完整门禁。

- 同 ID R3 定位器返工：Luna正式R2 FAIL确认精确label因必填星号无匹配，四个浏览器用例均超时，未产生本轮运行会话或外写。仅在同一测试新增一行`requirementsField`，使用精确`getByRole('textbox', { name: 'Your requirements', exact: true })`，并替换五处需求填充/回填断言；原mock、业务断言和timeout保持。Prettier、该test ESLint、scoped `git diff --check`及“一处精确textbox角色、五处helper、零需求label定位”静态断言均PASS；SHA `6df02482…adb30da`，证据`output/release/xyy-20261002-07/terra/r3-locator-fix.md`。未启动浏览器/测试/服务，未触碰候选、发布helper、refs或外部系统；交Sol更新冻结并复制到候选，Luna实测双项目唯一textarea匹配、四用例与candidate verify，Nova复审后再运行完整门禁。

- 同 ID R3补充submit定位收口：Sol发现finder与contact form各有submit，故同一spec五处全页`button[type="submit"]`未来会strict ambiguity。仅新增一行`submitButton` helper，固定`#contact-form button[type="submit"]`，并替换五处点击/可用断言，保持最新requirementsField、mock、业务断言和timeout；零全页submit定位。Prettier、该test ESLint、scoped `git diff --check`及“一处表单内selector、五处helper”静态断言均PASS；更新SHA `16f00055…3e44d0c`，证据已追加`output/release/xyy-20261002-07/terra/r3-locator-fix.md`。未启动浏览器/测试/服务，未修改候选、helper、refs或外部系统；Luna将独立验证全页/表单count及四用例，Sol待其现有进程结束后才复制和更新冻结。

- 同 ID R5 场景隔离返工：Luna R4正式FAIL确认mobile把busy/success和14个response mock串在一个30秒test中累计耗尽预算，且test为221行超过维护门槛；未改timeout、expect、retry或项目配置。仅将busy及其成功释放拆为一条独立test，保留英文页、disabled/aria-busy/Submitting、成功清空和失败文案断言；14个原mode改为模块级表注册14条独立fresh-page tests，每条保留`serveContact` mock、精确提示、无中文、按钮恢复、成功清空或失败保留断言；本地invalid-fields test保留。requirementsField精确textbox和submitButton表单范围定位保留。Prettier、该test ESLint、`check:maintainability`（184行）和scoped `git diff --check`均PASS，14个mode/busy/invalid断言静态检查PASS；SHA `c5313c6f…319ec6`，场景映射和证据`output/release/xyy-20261002-07/terra/r5-test-scenarios.md`。未运行浏览器/测试/服务、未修改候选/refs/helper或外部系统；交Sol冻结复制，Luna独立跑两项目新用例和candidate verify，Nova复审后完整发布门禁仍必须重跑。

- 同 ID R6 发布可观测性工具准备：仅新增`output/release/xyy-20261002-07/terra/run-observed-release-r6.py`，固定绝对调用未改的`run-website-deploy.sh`并强制其当前SHA `43c07264…81eaf3`；仅在继承环境上覆写`DEPLOY_PREFLIGHT_ONLY=false`和`DEBUG=pw:browser`。runner以exclusive新建`deploy-r6.log`、`deploy-r6-resources.jsonl`与`deploy-r6-result.json`，任一既存即拒绝覆盖；wrapper stdout/stderr直入独立log。每2秒只读记录其后代PID/PPID/comm/RSS/FD/Max open files及`/`、`/tmp`、release目录free、MemAvailable、SwapFree、`/dev/shm`使用；退出进程以null项记录，采样错误写入JSONL/result且结果不标PASS。KeyboardInterrupt仅转发SIGINT给子进程并等待退出，wrapper退出码原样返回；不读/写进程命令行或环境，不改资源、时限、重试、ulimit或原4 helpers。内存Python compile、固定wrapper/hash/env/stdio/2秒/退出传播静态契约、wrapper实际hash及no-index/scoped diff检查均PASS；工具SHA `1da7ccf7…0d593d`。未执行runner/wrapper或任何外部动作；Luna继续原单例资源诊断，Nova可审此工具后再决定是否批准一次完整门禁重试。

- 同 ID R6 runner预审返工：采样或JSONL写入异常现在经`safe_sample`记录类型化`sampling_errors`并停采样sink，已启动wrapper仍在保持打开的stdout/stderr日志上下文内循环等待真实退出，最终保留其原退出码；不再有异常跳出后wrapper后台运行或`SystemExit(None)`返回0的路径。`read_ppids`、`proc_snapshot`、`meminfo`、磁盘与`/dev/shm`读取区分正常`FileNotFound`进程退出（null）和Permission/parse/system错误（字段加类型标记）；Popen明确为`['bash', absolute_wrapper]`。最终内存compile、异常等待/字段化错误/bash固定调用/安全输出静态契约、冻结wrapper hash和no-index/scoped diff检查均PASS；更新工具SHA `4c350ab9…393976a`。未运行runner、wrapper、浏览器或外部操作；交Luna仅作成功、非零、采样抛异常仍wait、拒绝覆盖和hash失败的stub验证，Nova再审。

### XYY-20261002-08 — 本地定向安全加固

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- 仅修改合同冻结的5个实现文件，新增5个合同单测：咨询请求按原始字节流累计，超过8192立即取消并稳定返回原413；JSON MIME改为精确主类型匹配，缺失和伪装类型在读流/存储前415。流异常仍由API统一500，恰好8192及跨chunk UTF-8解析通过。
- Directus发布资源的正/负缓存及并发读取共享5秒引用快照；缺失UUID不再重复7集合查询，读取失败不缓存且下一次会重试。所有成功/304资源响应统一加入独立`sandbox; default-src 'none'` CSP和`nosniff`，保留现有类型、字节、ETag、Range/206/304等转发协议。
- 本地限流桶以有界到期最小堆保持1000项，满时淘汰最早到期桶；被容量淘汰的key会重新计数，仍是进程内尽力防护。存储失败日志只保留固定原因和可用HTTP状态，不再写入lead字段、Token、下游body或异常详情；API通用失败不变。
- 红测定向安全回归为16项失败；修复后相关8个测试文件57项通过，限定Prettier/ESLint、`npm run typecheck`（586 files，0 errors/warnings/hints）及实现文件的scoped `git diff --check`通过。未运行全量`npm run verify`、E2E、构建、外部/CMS/数据库调用、push或部署。详细命令与结果：`output/security/xyy-20261002-08/terra/implementation.md`。
- Luna应独立验证全量隔离`verify`及合成浏览器HTML/SVG脚本阻断、图片/PDF显示下载、Range/206/304兼容；Nova审查CSP、缓存失败重试、限流容量语义和范围。本轮为本地应用层加固，不声称已确认生产攻破。

### XYY-20261003-03 — 已复现安全问题本地修复

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- F1仅改新闻发布请求读取器：现在逐块累计原始字节，超过1MiB的首个超限块不缓存，立即发起取消且不等待取消或EOF；reader总会释放，收齐后才一次性解码/解析，因此既有跨块UTF-8、400非法JSON与413契约保持。鉴权、Content-Length提前拒绝、媒体类型及咨询reader未改。
- F2将`public/新亦源官网审阅Swiss.html`与`public/新亦源官网截图审阅.html`原样移至`output/internal-reviews/XYY-20261003-03/`；SHA-256分别为`650c0c25ffccefa17c2b00a5666bb58b5a611962932e2c76d263deafb5be9235`和`4dafea2bbfedfaf435392e130993732142d012229025b8086bb098cdb3680818`。新增递归、大小写不敏感HTML/HTM构建门禁，`prebuild`经`check:assets`在字体准备和资源检查之前运行它。只删除了两份相同hash、gitignore的陈旧`dist/client`生成副本，未清理旧证据或媒体。
- F3在保持第三个可注入fetch参数的前提下增加可选第四`AbortSignal`；预取消不读共享引用也不发资产请求，引用读完后的取消同样阻止资产fetch，signal被转给上游。资源路由传`request.signal`；共享公开引用查询不绑定单个客户端signal，Directus现有CSP/缓存并行改动完整保留。
- 红测已在实现前实际运行：新闻3项中1项因旧实现继续读取而失败；资源取消3项均失败（预取消仍读引用、两项因未传signal超时）；public测试因脚本缺失无法收集。修复后6个定向测试文件48项PASS；task-scoped Prettier、ESLint、`check:maintainability`（760 files）、`check:public-artifacts`与源码/测试scoped diff检查均PASS。完整命令摘要与限制在`output/security/xyy-20261003-03/terra/implementation.md`。
- 按Sol指示未重复完整typecheck/build/verify，也未启动或停止服务、提交、push、部署或进行CMS/数据库/询盘外写。Luna需在新构建独立覆盖1,250,000字节无Content-Length提前413、两条public/fresh-dist 404、临时嵌套大小写HTML门禁、及6秒上游在客户端约1秒断开后的header/body/并发取消；Nova随后审范围与错误/缓存契约。`check-integrity.py`曾在删除陈旧dist副本前运行一次并按设计写入Sol目录的FAIL报告，须由Sol保留该首次记录并在Luna新构建后重跑。

### XYY-20261004-01 — http-cache-semantics 本地漏洞补丁

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- 以可追溯`http-cache-semantics@4.2.0-xyy.1`本地包替换 Astro 实际 transitive 依赖：原4.2.0源码哈希、官方tarball URL/integrity、BSD-2-Clause许可证、GHSA/CVE和PR58/60参考均记录在`PATCH.md`。这是本地补丁，不宣称 npm 或上游已发布修复；`file:`依赖不受 npm advisory 扫描。
- 补丁将共享复用判定收口到普通命中、数值/无限`max-stale`、TTL、SWR、SIE和失败重新验证：阻断无`public`/`immutable`许可的Set-Cookie、proxy-revalidate、no-cache/no-store/private、无许可认证、`Vary: *`及逗号通配、共享s-maxage陈旧复用；保留public/immutable cookie、符合既有`storable()`授权许可、私有缓存、304和序列化正例。错误SIE回退还要求请求匹配且未要求no-cache。
- 红测实际显示4.2.0库级8项中6项失败、Astro包版本检查失败；修复后`http-cache-semantics*.test.ts`两文件37项PASS，实际解析路径和`npm ls`均为`scripts/vendor/http-cache-semantics`的4.2.0-xyy.1。task-scoped ESLint、vendor Node syntax和scoped diff检查通过；冻结hash、命令与来源详见`output/security/xyy-20261004-01/terra/implementation.md`。
- `npm audit --omit=dev --json`首次实际执行因npm advisory端点TLS连接失败而非零；升级重试在等待审批期间由Sol中断Agent，故没有成功audit结果。未跑full verify、独立production npm ci、build或部署；Luna需独立完成这些合同门禁并补序列化受限策略、库级304、实际Astro TTL与生产布局测试。

- 同 ID R2：Luna独立probe确认第一版未处理私有缓存的Vary通配，且`' * '`与`'Accept, * '`未按token去空白。仅在vendor `_isReusable()`将Vary通配判定移到private提前返回之前，并将`_hasVaryStar()`改为逗号分割后逐token `trim() === '*'`；普通private cookie和合法`Vary: accept`保留。新增独立`http-cache-semantics-vary.test.ts`：红测7项中5项失败的原始输出存`output/security/xyy-20261004-01/terra/r2/red-vitest.log`；修复后定向绿测7/7、post-format Prettier、scoped ESLint、vendor syntax和diff检查通过，原始输出同目录。R2 vendor SHA `60318d6615aa1c7cbce1df85909ba67ac632f761dec33cea64ca3e32083c11a3`，新测试 SHA `3602c630bf6b4bd55f054b81976286d2a84fc1e6805a6c4e56db29afeca24c7f`。未运行audit/npm网络/full verify或外部操作，交Luna独立复测。

### XYY-20261003-04 — 安全修复验收站发布准备

Status: PREPARATION DONE（待 Luna/Nova 独立审阅与 Sol 执行）

- 仅在`output/release/xyy-20261003-04/resume-20261004/`新增发布 wrapper、远端快照/检查、本地同步、远端 isolation preflight 与合成缓存 probe。wrapper 固定候选`0ffe149df13148d6280b5230979eb0a3d0ea26cb`、27项哈希、候选 clean、512MiB、4510/4511 空闲、`RELEASE_KEEP=100`和 staging 目标；预检成功前不进入既有`deploy.sh`，成功后仍由它实际运行完整`verify:release`。
- 预检只在服务器`preparation/xyy-20261003-04-<sha>`进行，校验 package/lock/vendor 来源哈希，使用 Node22 的带超时`npm ci --omit=dev`、严格 JSON audit、本地 vendor realpath/哈希和已安装实际 Astro 缓存消费者的受限/正例。所有 npm/probe stdout、stderr、实际 exit 均保留；wrapper 在失败时也回收限定日志归档并停止，不上传 node_modules、不读或输出真实`.env`。
- 本地 shell/Node/Python语法检查通过；隔离候选中实际本地包 probe PASS；合成远端 before/after 校验覆盖 releaseId、SHA、previous、CMS/环境哈希与旧 release 保留。候选 27 项、clean 与 diff 一致；详细命令、冻结hash和限制见`output/release/xyy-20261003-04/resume-20261004/terra/implementation.md`及`freeze.json`。
- 本轮未运行 SSH、远端预检、npm 网络、提交、推送、部署或本地同步。Luna应独立审阅预检失败日志保存、file 包 realpath、release 保留、远端快照与 CAS index/ref；Nova再审权限、敏感环境不泄露和发布边界。

- 同 ID R2：Luna发现 preparation 内仅最终文件软链被拒绝，`scripts/vendor` 祖先软链仍可导致读取 preparation 外源；Sol只读确认当前服务器 preparation 祖先正常、目标不存在，此问题尚未在线发生。仅修正`production-preflight.sh`：canonical preparation path 必须等于固定字面路径，manifest 与 6 个上传源文件的 realpath 必须精确等于其内部预期路径后才读取/hash；安装后的`node_modules` file 依赖继续精确匹配内部 vendor，保留正常软链。当前 helper 提取式 fixture 实测内部源/installed symlink PASS、祖先软链退出1拒绝，详见`terra/r2/`；更新`freeze.json`。未运行外部操作，交Luna独立复测。

### XYY-20261004-03-B — 容量、媒体与版本保留维护

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- 候选目录新增按 `stat.dev` 合并、按 `statfs` 检查字节及 inode 的容量工具：本地最低 3 GiB、远端最低 2 GiB，均与实测峰值的 125% 取高；没有可解析的 baseline 时以 `capacity_baseline_measurement_required` 失败。基线测量工具在起始及串行采样期间执行同一 floor/inode 守卫，采样失败会终止并等待子进程退出，不将测量本身当作发布基线。
- `deploy.sh` 在构建前、本地上传前、远端上传前及安装前调用容量预检；远端只先传最小预检工具，预检通过才传完整 release。旧的自动 `xargs rm -rf` 已删除，release 清理默认 JSON preview；仅 `RELEASE_CLEANUP_APPLY=true` 才按当次精确清单删除。工具保护保留5版、`current`、`.previous_target` 和固定版本，并拒绝目录名、目标和符号链接越界。
- Playwright 四套配置的测试结果目录可通过环境变量改到数据盘。媒体清单工具只读生成 505 个 `public` 文件的大小、SHA-256、精确源码引用和 Git归属，证据`/home/yj/data/xyy-maintenance-20261004-03/evidence/B/media-manifest.json` SHA-256 为`837ebe358a4bf197030673ecbd8b46613df140379ee84683f6467ef77b01d95c`。
- 定向验证通过：`TMPDIR=/home/yj/data/xyy-maintenance-20261004-03/tmp npx vitest run tests/unit/maintenance-capacity.test.ts tests/unit/deployment-config.test.ts`（2 files/20 tests）、B范围Prettier、`bash -n scripts/deploy.sh`、`git diff --check`。本机根/tmp仅约947MiB，缺基线预检按设计阻断；data盘安全测量的`true`仅验证工具链，不能用于发布峰值。未运行完整verify/build、SSH、远端预检、删除、部署、CMS/数据库操作、提交或推送。

### XYY-20261008-01 — 中文联系我们填写提纲文案

Status: CODE DONE（待 Luna 独立浏览器验收与 Sol 验收）

- 仅将 `src/scripts/contact-enquiry.ts` 的中文提纲第 4、5 项从“退货情况：”“计划时间：”替换为“日均发货单量：”“B2B还是B2C模式：”。英文数组、插入/去重/已有输入逻辑均未修改。
- 自检 PASS：`npx prettier --check src/scripts/contact-enquiry.ts` 与 `git diff --check -- src/scripts/contact-enquiry.ts docs/TERRA.md` 均 exit 0；未运行全量 `verify`，未提交、推送、部署或进行 CMS、数据库、真实表单写入。交 Luna 独立在桌面与移动视口验证中文提纲顺序、已有输入/重复点击、英文不变及无水平溢出；浏览器证据按合同写入 `output/playwright/xyy-20261008-01/`。

- R2：按用户追加明确要求，仅将英文提纲第 4、5 项从“Returns scenario:”“Target timeline:”替换为“Average daily shipments:”“Business model (B2B or B2C):”。相对 `output/contact-outline/xyy-20261008-01/r2/contact-enquiry-before.ts` 的实现 diff 仅为这两项 title/line 替换；中文、插入/去重/已有输入逻辑均保持。`npx prettier --check src/scripts/contact-enquiry.ts` 与 `git diff --check -- src/scripts/contact-enquiry.ts docs/TERRA.md` 均 exit 0。未运行全量 `verify`，未启动或停止 4322 服务，未提交、推送、部署或外部写入；交 Luna 独立验证英文 1440/390、真实换行已有字段/括号字段去重及中文回归。

### XYY-20261008-03 — 页脚小红书账号入口

Status: CODE DONE（待 Luna 独立浏览器验收与 Sol 验收）

- 新增共享 `XiaohongshuLink` 组件，集中保存用户授权的账号 profile 地址；通用 Footer 与 About 独立页脚均复用该组件，并按 locale 显示“小红书”或“Xiaohongshu”。链接为原生新窗口外链，带 `noopener noreferrer`、本地化新窗口可访问名称、隐藏的外链图标、可见焦点与 44px 最小触控高度；未引入 SDK、嵌入、图片或 JS。
- About 联系区仅增加 `flex-wrap`，使新增入口在窄宽度有换行空间；电话、地址、导航、版权及此前中英文提纲均未修改。目标 Prettier、scoped `git diff --check` 均通过；`npm run typecheck` 完成 638 files、0 errors、0 warnings、4 existing hints。
- 未运行浏览器或全量 `verify`，未启动或停止 4322，未登录/关注外站，未提交、推送、部署或外部写入。交 Luna 独立覆盖中英文通用/关于页脚 1440/390，以及关于页 768 的布局、键盘焦点、精确目标与新窗口属性。

- XYY-20261008-03 R2：共享组件改为社交图标分组，上方显示中文“关注我们”或英文“FIND US ON”，下方为单个黑色小红书图标入口；已移除可见名称按钮、粉色胶囊、边框和外链箭头。图标内联 Simple Icons 14.0.0 的 CC0-1.0 小红书路径，保留原 24×24 viewBox，以 48px 图标盒呈现并保持至少 44px 触控区；没有运行时远端资源或新增依赖。
- R2 静态核对 PASS：账号 href 与 R2 冻结组件一致、SVG path 与本地 Simple Icons 参考一致；目标 Prettier 与 scoped `git diff --check` 均 exit 0。`target`、`rel`、本地化新窗口可访问名称、原生本地化 title、图标 `aria-hidden`/`focusable=false` 与键盘 focus 均保留。未重跑 typecheck/verify、浏览器或外站访问，未启动或停止 4322，未提交、推送、部署或外部写入；交 Luna 视觉验证各视口的标题/图标上下排列、黑色无胶囊、无重叠/横溢及焦点可见。

- XYY-20261008-03 R3：将未提交的共享组件更名为 `FooterSocialLinks`，两个既有页脚仅更新 import/调用。保留本地化标题并将小红书、抖音、微信三个深色图标横排；三枚控件均为 48px 触控盒，其中小红书横向字标保留独立 48px SVG 盒，抖音与微信图形为 32px。三个图标 path 分别与本地 Simple Icons 14.0.0（CC0-1.0）参考一致；外链保留安全新窗口属性和本地化 title/aria。
- 微信使用原生 `popover="auto"`、`popovertarget` 与 `popovertargetaction="hide"`，未添加自定义 JS；卡片含本地化标题/说明/alt、原生关闭按钮和响应式二维码尺寸，未以 author `display` 覆盖隐藏态。二维码已从用户原图逐字节复制到 `public/images/social/wechat-official-account.jpg`；源文件、public 文件和 4322 HTTP 响应 SHA-256 均为 `c9b19b7b0bc10ecbc2db4399c0076cfd111aa27ce27f53733ab06cb22df885ba`。
- 自检 PASS：目标 Prettier 与 scoped `git diff --check` exit 0；四个本地路由 `/`、`/en`、`/about`、`/en/about` 均 HTTP 200 且包含社交区和二维码引用。未重复 typecheck/verify 或浏览器测试，未停止 4322、访问外站、提交、推送、部署或外部写入；交 Luna 独立验证 Popover 打开/关闭（按钮、Esc、外部点击、重开）、二维码完整可见及合同视口矩阵。

- R3 源复核返工：Sol 发现前次微信 path 末尾与本地 Simple Icons 参考相差一个路径段（组件长度1219、参考1220），故前次“三条 path 一致”结论不正确。仅将 `FooterSocialLinks.astro` 内微信 path 替换为参考原值；修后小红书、抖音、微信 path 逐字等值断言均 PASS，长度依次为3469、597、1220，目标 Prettier 与 scoped `git diff --check` 均 exit 0。未重跑先前已通过的 HTTP/哈希检查、typecheck、verify 或浏览器；源码已冻结交 Luna 独立验收。

### XYY-20261008-04 — 页脚企业文化

Status: CODE DONE（待 Luna 独立浏览器验收与 Sol 验收）

- 仅将通用 Footer 的 Logo 下方旧 `settings.footer_description` 展示替换为本地化企业文化区。`shellCopy` 新增“企业文化 / Corporate culture”及中英文四项愿景、使命、价值观、服务理念；Footer 以紧凑的 `dl`/`dt`/`dd` 渲染，标签为 inline 加粗。Logo、电话、导航、地址、三社交入口及版权保持。
- 自检 PASS：目标 Prettier 与 scoped `git diff --check` exit 0；运行中 4322 的 `/contact`、`/en/contact`、`/`、`/en` 都返回 HTTP 200，且各自语言的四项文案均存在。源码中旧 `settings.footer_description` 引用已移除。
- 未运行浏览器、typecheck 或全量 verify，未停止 4322、提交、推送、部署或外部写入；交 Luna 在中英文联系页 1440/390/768 验证可读性、无横溢/重叠、Logo/电话/导航/地址/三社交入口/版权保留，并抽查微信原生二维码按钮打开关闭。

### XYY-20261008-05 — 首页统计发布状态与字段投影

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- `getHomepageStats()` 现在显式请求 `id`、`status`、`stats`；成功空 singleton、`draft` 和已发布的空 `stats` 均返回空数组且不使用 fallback。仅 `published` 能进入 Claims 统计解析；`archived`、缺失、`null` 或未知状态，以及非法 `stats` 均维持既有 `invalid_data` 失败语义。
- 既有首页 CMS 样例均显式标记 `status: 'published'`。新增 `homepage-cms-contract.test.ts` 经真实 Directus URL 构造、fetch 响应和字段动态投影覆盖 published、draft、已发布空统计、空 singleton、archived、缺失/null/未知状态和非法统计；固定测试 URL/内容 token，不连接真实 CMS。
- 修复前 `npx vitest run tests/unit/homepage-cms-contract.test.ts` exit 1，记录请求仅含 `id,stats`、draft 被解析、非法状态未拒绝，日志为 `output/homepage-stats/xyy-20261008-05/terra/red-homepage-cms-contract.log`。修复后四份目标测试 27/27 PASS（exit 0）；目标 Prettier、ESLint、scoped `git diff --check` 均通过。`npm run typecheck` 为639 files、0 errors、0 warnings、4既有 hints。未运行全量 verify、提交、推送、部署或真实 CMS/数据库操作。
- Luna 应独立通过 fetch 字段投影复测 published/draft/空/非法状态与 fallback 边界；Nova 应审查状态严格性、`invalid_data` 与现有网络/5xx fallback 不变。

### XYY-20261008-06 — 中英文首页站点设置并行取数

Status: CODE DONE（待 Luna 独立验证与 Nova Review）

- 中文首页将 `getSiteSettings(DEFAULT_SITE_SETTINGS)` 放入现有四项 CMS 读取的同一 `Promise.all()`，并显式传给 `Layout`；英文首页将既有 `getEnglishSiteSettings()` 同样并行读取并传给 `EnglishLayout`，保留原有英语转换语义。两个 Layout 因此不会为首页再顺序请求设置。
- 仅修改两个首页，无新 helper、缓存、请求/回退层、Layout、内容、样式、新闻或 assets 查询。相对冻结基线的 diff 仅含两个 imports、两项并行读取及两个 Layout props。
- 自检 PASS：`npx vitest run tests/unit/english-site-settings.test.ts tests/unit/homepage-cms-contract.test.ts` 为2 files/9 tests，目标 Prettier、ESLint、scoped `git diff --check` 均 exit 0；证据在 `output/homepage-parallel/xyy-20261008-06/terra/`。按合同未运行类型检查（交 Sol 最终源码检查）、完整 verify、构建或浏览器测试，也未提交、部署或访问真实 CMS/数据库。
- Luna 应以真实本地 SSR 复测同阶段五请求、每次仅一次 site_settings、实时更新、受控延迟前后对照及桌面/移动首页视觉；Nova 应复核范围、英文转换和请求/回退语义不变。

### XYY-20261008-07 — Lighthouse CI 与真实体验观察

Status: CODE DONE（待 Luna 独立采样与 Nova Review）

- 将 desktop/mobile Lighthouse 配置收敛到同一离线 loopback 路由集：`/`、`/product`、`/about`、`/xiefu-yuncang`、`/b2b-mendian-cangpei`、`/houzheng-xiufu`、`/contact`、`/en/contact`，每路由三次；全部 LHCI 断言明确使用 `aggregationMethod: median`。runner 顺序执行 collect/upload/assert，并在 report 上传后检查运行时、HTTP、精确路由集合和三次样本，输出 LCP、TBT、CLS 与四个分类分数的中位数 JSON；TBT 不作为 INP。
- 默认 observe 仅 warn 性能阈值；enforce 必须显式提供完整 `LHCI_ENFORCE_THRESHOLDS`，由 LHCI 原生 median error 断言返回非零。CI 在既有生产构建后顺序运行两设备，先验证 Playwright Chromium 可执行路径，失败仍上传已有 filesystem 报告；未改变 GitHub 权限、应用源码或依赖。
- 新增只读 CrUX CLI：必须有 `CRUX_API_KEY`，分别请求 PHONE/DESKTOP，并输出 origin/URL 粒度、`collectionPeriod` 和 LCP/INP/CLS p75 及良好阈值。缺 key、严格的 API `NOT_FOUND` 无数据、缺/非法 p75、鉴权或网络错误都不会被报告为通过，且不输出 key。当前正式数据为 unknown：key 缺失、两次 PageSpeed 只读请求连接超时，无响应；没有把它写成无样本或通过。
- 自检 PASS：配置 8 路由×3 次及所有 native assertions median 的 Node 合同检查、`node --check`、目标 ESLint、`npm run format:check`、scoped `git diff --check`；缺 CrUX key 和缺 enforce 阈值均以 exit 1 明确失败。以强制 performance 1.1 的已有离线 LHR 运行 native enforce，LHCI 输出 `Assertion failed. Exiting with status code 1.`。`npm run build` 被现有容量闸门阻止（可用约2.06 GiB、要求3 GiB），未绕过或清理文件；`npm run check:maintainability` 亦因不在本 Scope 的既有 `src/components/FooterSocialLinks.astro` 246行超180行阻断。未运行完整48次采集、完整 verify、提交、推送、部署、CMS/数据库或真实 CrUX 请求。
- Luna 应在容量满足后独立顺序运行两设备完整48次采样，核对两份 artifact、每 URL 三样本/median、HTTP/采集错误、observe/enforce 故障传播，以及 CrUX 成功/NOT_FOUND/403/网络路径；Nova 应审查该动态 config、阈值授权边界和无 key/无数据失败语义。

- XYY-20261008-07 R2：按 Luna R1 FAIL 修正只读 CrUX 数据契约。CLS p75 现保留 API 的无单位比例小数（含官方允许的字符串编码），不再 `/100`；只接受非负、有限、非空白 number/string，拒绝 boolean/null/空白/负值/非有限。成功响应要求 record 与含 firstDate/lastDate 的 collectionPeriod，缺失即明确失败，不能输出 observed。请求同时使用 AbortController 和 10 秒 race timeout；网络、超时与 API 错误均输出脱敏稳定错误，不泄露 key/URL。
- 同 ID R2 CI/文档最小补充：维持既有 `test:lhci:all` 串行短路，desktop 失败后的 mobile 缺失明确为未测而非通过；filesystem artifact 拆为 desktop/mobile 两个 `always()` 上传步骤。性能基线新增可执行的 enforce 校准条件（同候选、同 CI 环境至少五次、逐设备/路由比较 median 与明确波动上限）、完整 JSON 字段示例及“示例非校准阈值”声明；明确未修改 required status checks/合并规则，发布脚本不运行 LHCI，观察不构成部署闸门。补充 CrUX API metric value types 与 Web Vitals 官方链接。
- R2 自检 PASS：`npx vitest run tests/unit/crux.test.ts` 为1 file/7 tests；`node --check scripts/crux.mjs`、CrUX scoped ESLint、Prettier 与 `git diff --check` 均 exit 0；无 `CRUX_API_KEY` 仍明确 exit 1。未运行 build、完整 LHCI、verify 或外部 CrUX 请求，未修改已冻结 Lighthouse config/runner、应用、依赖、权限、提交、推送、部署、CMS 或数据库。

- R2 边界补全：`collectionPeriod.firstDate/lastDate` 现要求各自是有效的 `{year, month, day}` 日期且 first 不晚于 last，拒绝空对象、字符串和不可能日期。10 秒 timeout 的 race 已从 fetch headers 扩至整个 response body JSON 解析、record 契约检查和结果构造，超时会 abort 请求并以脱敏 `crux_api_timeout` 失败。README 的“字段数据”更正为“真实用户数据”；性能文档原“本阶段未修改脚本/阈值”限缩为 2026-08-15 历史观察阶段，避免与当前实现冲突。复跑同一 CrUX 单测、ESLint、Prettier、语法和 scoped diff 均 PASS；仍未触及冻结的 Lighthouse config/runner 或应用。

### XYY-20261008-09 — 开放 AI 爬虫公开页面抓取

Status: CODE DONE（待 Luna 独立响应验证与 Nova Review）

- 仅在 `src/pages/robots.txt.ts` 删除 GPTBot 的专属 `User-agent: GPTBot` / `Disallow: /` 分组及其分组空行，使 GPTBot 与其他未单列的 AI 爬虫适用既有通用组 `Allow: /`。通用组与 OAI-SearchBot 的五项受限路径、Sitemap 及响应头未改。
- 自检 PASS：`npx prettier --check src/pages/robots.txt.ts` 与 `git diff --check -- src/pages/robots.txt.ts docs/TERRA.md` 均 exit 0；未启动服务或运行 HTTP/E2E/全量 verify，未修改测试、依赖、CMS、数据库、鉴权或其他源码，未提交、推送或部署。交 Luna 独立验证实际响应与保留规则。

### XYY-20261008-12 — 发布分支 CI 与生产依赖审计修复

Status: CODE DONE（待 Luna 独立完整 verify 与 Nova Review）

- 隔离候选 `/tmp/xyy-20261008-12-candidate` 只修改 `.github/workflows/ci.yml`、新增 `scripts/validate-ci-release-identity.mjs`、新增 `tests/unit/ci-release-identity.test.ts`，并定向更新 `package-lock.json`。CI 身份步骤改用纯 CLI，严格校验 full SHA、UTC 时间与 `ci` 环境，再强制传入 `createReleaseIdentity`；只输出 identity 与 `cmsSchemaStatus`，不生成 deployment manifest。`create-release-manifest.mjs`、CMS status、发布脚本和 CI audit/`verify:release` 步骤未改。
- 锁文件将五个已发布修复版本更新为 `compression@1.8.2`、`proxy-addr@2.0.8`、`sharp@0.35.5`、`smol-toml@1.9.0`、`source-map-js@1.2.2`；Sharp 的全部平台包为 0.35.5、libvips 子树为 1.3.4。`package.json`/override/http-cache 本地 file 依赖不变。`compression@1.8.2` 新增运行时 `destroy@1.2.0`，因此其旧的仅开发标记移除；Sharp 的 optional `@types/node` peer 使既有 `@types/node` 与 `undici-types` 记录为 `devOptional`。根 `hasInstallScript` 的无关自动元数据已移除。
- 自检 PASS：目标 Prettier、目标 ESLint、`node --check`、`npx vitest run tests/unit/ci-release-identity.test.ts tests/unit/release-deployment.test.ts`（2 files / 18 tests）、lock JSON/五项版本及 Sharp 平台子树断言、`package.json` 无 diff、scoped `git diff --check` 均 exit 0。真实 manifest 在 `candidate_unverified` 下仍 exit 1 且无产物。未运行干净安装、fresh audit、完整 `verify`/`verify:release`、提交、推送、部署、CMS/数据库或外部写入；这些留给 Luna。证据见 `output/merge/xyy-20261008-12/terra/implementation.md`。

#### XYY-20261008-12 — 2026-10-09 候选恢复

- 旧 `/tmp/xyy-20261008-12-candidate` 和任务 cache 已不存在；在 Sol 重建的干净数据盘候选 `/home/yj/data/xyy-merge-20261008-12/candidate`（基线 `f04bd1e`）恢复同一四文件实现。`npm update --package-lock-only --ignore-scripts --no-audit` 使用任务数据盘 cache 完成，无 `node_modules` 安装。
- 四项 SHA-256 均精确匹配 `output/merge/xyy-20261008-12/sol/candidate-freeze.json`：CI `28abed…4b6b`、CLI `a94d5f…23ef`、测试 `c06055…cfe2`、lock `eebf30…69a0`。候选 scoped `git diff --check` 通过；未重跑测试、干净安装、audit、verify 或 verify:release，交 Luna 独立完成。
- 已保存四文件副本和完整 patch：`output/merge/xyy-20261008-12/terra/recovered/`。未提交、推送、部署、CMS/数据库或外部写入。

### XYY-20261008-10 — 更新 llms.txt 网站内容索引

Status: CODE DONE（待 Luna 独立 HTTP/定向测试验证与 Nova Review）

- 仅更新 `src/pages/llms.txt.ts` 的公开 Markdown 内容：标题补充 `shellCopy('en').brand` 的 XINYIYUAN Supply Chain；企业文化由 `shellCopy('zh-CN').culture` 映射生成；产品/联系、华南佛山、英文 Insights/服务/联系、站点地图与爬虫规则入口按当前路由补充。企业成立和业务事实、所有既有服务链接及除华南佛山补充外的既有描述均保留。
- 动态案例与白皮书、六项 `getClaimText(..., 'llms')` 调用、`getCases(CASE_FALLBACKS)`、英文案例映射及响应头均未修改。咨询提示只引用既有表单字段；案例说明限于对应项目及页面统计范围，不作为通用承诺。
- 自检 PASS：`npx prettier --check src/pages/llms.txt.ts`、`npx eslint src/pages/llms.txt.ts` 与 `git diff --check -- src/pages/llms.txt.ts docs/TERRA.md` 均 exit 0。未启动服务或运行 HTTP/E2E/全量 verify，未修改测试、依赖、CMS、数据库、鉴权或其他源码，未提交、推送或部署。交 Luna 独立验证实际响应、既有定向测试和动态内容边界。

### XYY-20261009-01 — 页脚社交组件维护性门禁修复

Status: CODE DONE（待 Luna 独立完整验证与 Nova Review）

- 仅将 `FooterSocialLinks.astro` 的 120 行现有 CSS 移至新增 `src/styles/footer-social-links.css`；组件保留非 global 的 `<style>`，通过同一作用域内的 `@import` 加载。选择器、声明、规则顺序和 UI/语义结构未改，故保持 Astro scoped CSS 路径及既有优先级；中英文文案、外链、SVG、二维码、Popover、布局和焦点行为均未触及。
- 自检 PASS：`npm run check:maintainability`（820 files）、目标 `npx prettier --check`、`npm run typecheck`（647 files，0 errors / 0 warnings / 4 hints）与 scoped `git diff --check` 均 exit 0。组件由初始 snapshot 的 245 行降至 126 行。未运行完整 `verify`/`verify:release`、浏览器回归、提交、推送、部署、CMS 或数据库操作；交 Luna 重点复核中英文桌面/移动端社交链接、Popover/二维码、键盘焦点和样式一致性。证据：`output/release/xyy-20261009-01/terra/implementation.md`。

#### XYY-20261009-01 — Luna R1 动效失败只读诊断

- 未修改实现或测试。`english-acceptance-routes` 的两条 H1 失败是旧用例在导航/字体就绪后立即读取 `opacity`，而既定详情页动效仍处于 800ms 入场首帧；trace 显示 `/en/apparel-fulfillment` 768px 的该读取发生在导航后约 52ms。原合同要求标题依阅读顺序渐显，不能为该测试移除 H1 动效。应在同一用例的几何读取前等待 `h1` 不再有 `data-service-detail-reveal`，保留原几何断言和既有 timeout。
- `service-redesign` 的 `/houzheng-xiufu` 点击是真实交互缺陷：链接 href 正确，Playwright 点击调用已完成但 URL 未变。该链接位于被收集为动效目标的 `article[role=listitem]` 中；focusin 捕获会同步清除祖先 target 的 translate，可能在 pointer down/up 间移动命中点。建议在 `detail-reveal.ts` 区分 pointer 触发的 focus，pointer focus 不清除动画、键盘 focus 仍立即清除，以保留卡片入场效果和键盘可操作性。详细只读证据：`output/release/xyy-20261009-01/terra/diagnosis.md`。

#### XYY-20261009-01 R1 — pointer focus 点击回归最小修复

- 仅修改 `src/scripts/service-motion/detail-reveal.ts`。root capture-phase `pointerdown` 记录命中节点；随后的 `focusin` 若来自同一个待显现目标内的 pointer，则保留当前动画几何，避免在 pointer down/up 之间同步清除父 `article` 的 translate。键盘或其他非 pointer focus 继续立刻清除待显现状态，保留原有可读性/可操作性行为。
- 指针状态会在 focus 处理后、window `pointerup`、`pointercancel` 和组件 cleanup 时清理；新增的 root/window 监听在 cleanup 中全部解除。未改动选取范围、800ms/150ms/320ms 参数、CSS、链接、文案、业务页面或测试。自检 PASS：目标 Prettier、ESLint、`npm run typecheck`（647 files，0 errors / 0 warnings / 4 hints）、`npm run check:maintainability`（820 files）及 scoped `git diff --check`。未运行 E2E 或完整 verify；交 Luna 独立复现 pointer 跳转、键盘立即显现及全套发布复测。证据：`output/release/xyy-20261009-01/terra/implementation.md`。

#### XYY-20261009-01 R2 — 真实触摸 compat mouse 最小返工

- Sol 的 Pixel 7 `tap()` 原始事件顺序为 `pointerdown(touch) → pointerup(touch) → mousedown → focusin`；R1 在 `pointerup` 清除 marker 后，compat `mousedown/focusin` 会错误按键盘 focus 处理。仅令既有 root capture handler 同时记录 `pointerdown` 与 `mousedown`（`PointerEvent | MouseEvent`），并在 window `mouseup` 清理；`pointerup`、`pointercancel` 和 cleanup 保持。故 compat `mousedown` 在 focus 前重设 marker，pointer-origin focus 不再中途清除 translate；键盘路径没有 press marker，仍即时 reveal。
- cleanup 解除新增 `mousedown`/`mouseup` 监听并清空 marker；未使用 timeout，不改动动画参数、targets/selectors、CSS、页面、链接、文案或测试。自检 PASS：目标 Prettier、ESLint、`npm run typecheck`（647 files，0 errors / 0 warnings / 4 hints）、`npm run check:maintainability`（820 files）及 scoped `git diff --check`。`detail-reveal.ts` 为177行，低于260行预算。未运行 E2E、完整 verify 或浏览器；交 Luna 用真实 mouse、Pixel 7 tap、键盘和 cleanup 复测。证据：`output/release/xyy-20261009-01/terra/implementation.md`。
