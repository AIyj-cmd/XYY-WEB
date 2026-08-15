# DEV_STATE

更新时间：2026-08-15

## 协作记录约定

- 每完成一个开发任务、配置调整、验证、提交或部署动作，都要在本文件同步记录完成内容、验证结果、当前状态和剩余事项，保证项目负责人和开发者能够快速确认实际进度。
- 记录以任务结果为单位，不堆砌无助于判断状态的终端命令、重复讨论或临时尝试；失败方案仅在会影响后续决策时保留。
- 使用中性、任务导向的表述，只写需要完成的动作，不使用身份化角色称呼。
- 不记录密码、Token、API Key、私钥、Cookie、真实 `.env` 内容或其他敏感信息。

## 当前目标

- 在第一阶段 Directus 返回状态语义之上，完成公开业务事实唯一来源治理：全局公开事实只由 `src/lib/claims/` 审核注册表维护，页面、CMS、FAQ、SEO、JSON-LD、`llms.txt` 和 CMS seed 只能引用 `claimKey` 或 `{{claimKey}}`。
- 第一、第二阶段已拆分为两个连续的本地提交供人工审查；当前不推送、不部署，也不连接真实 CMS。

## 当前版本与环境

- 拆分前基线：`62095867ce74aabf6352cc9d08a361d9e217d108`（`6209586 记录验收站发布与运行权限状态`），该提交不包含第一、第二阶段修复。
- 第一阶段提交：`526f5b2 修复 Directus 返回状态语义`，父提交为上述基线。
- 第二阶段提交：本文件所在的当前本地提交，父提交为 `526f5b2`，只包含公开业务事实唯一来源与 CMS 防漂移治理。最终提交号通过 `git log -1` 获取，避免在提交自身内容中记录无法自洽的自身哈希。
- 验收站：`https://wz.tomatopia.top`。
- 当前 Release：`/var/www/xyy-web/releases/20260814T171015Z`，对应运行代码提交 `3f7f705`。
- 运行状态：PM2 中 `xyy-web` 在线，Web 端口为 `50031`。
- 健康状态：首页、`/healthz`、Directus ping、robots、sitemap 和 llms.txt 已通过发布后检查，`contactStorage: ok`。
- 当前数据库：PostgreSQL 16。Oracle 19c 迁移脚本已准备，但尚未迁移或完成恢复验证。

## 已完成

- 首页、产品、关于、案例、新闻、期刊及仓配专题页的响应式和动效问题已修复。
- 页面、组件、数据、样式、浏览器控制器、Directus 查询和服务端运行逻辑已按职责拆分，并由可维护性预算检查约束。
- CMS 内容可用时以后台数据为准；审核源码只在 CMS 不可用时提供故障回退。
- 首页案例固定为六个已确认品牌；公开运营数据统一从 `src/lib/claims/` 维护。
- `scripts/setup-cms.mjs` 可幂等创建十九个业务集合及初始化内容。
- 十八个官网内容集合统一定义在 `server/runtime-permissions.mjs`。
- 新增内容权限同步：`Website Content Read-Only` 策略只获得18个官网内容集合的读取动作，不获得新增、修改或删除权限；实例具备自定义权限授权时可进一步下沉 `published` 过滤。
- 联系表单继续使用独立的“仅创建留言”权限，不允许读取历史留言。

## 关键决策

- Web 代码发布与 Directus 数据库初始化分开执行，避免发布过程自动修改数据库。
- 管理员 Token 只临时用于建模和权限配置，不进入网站运行环境或 Git。
- 网站运行时使用两枚不同 Token：内容只读 Token、联系表单仅创建 Token。
- 后台已发布数据优先于静态回退内容，避免后台修改后前端仍显示旧数据。
- CMS 成功返回空数据代表运营侧当前没有已发布内容，必须保持为空；只有网络失败、超时和 HTTP 5xx 才能启用审核静态回退。
- HTTP 401/403 和非法响应必须明确失败，不能用静态内容掩盖权限或数据契约问题。
- 正式环境必须发布同一 Git 提交、完整资源包和对应 CMS 模型，不能只同步前端构建文件。

## 核心维护文件

- 页面与组件：`src/pages/`、`src/components/`。
- 内容与事实：`src/data/`、`src/lib/claims/`。
- Directus 请求与查询：`src/lib/directus-client.ts`、`src/lib/directus/request-state.ts`、`src/lib/directus-queries.ts`、`src/lib/directus-content-queries.ts`。
- 案例详情状态：`src/pages/cases/[slug].astro`。
- 服务端运行逻辑：`server/`、`server/runtime-permissions.mjs`。
- CMS 初始化：`scripts/setup-cms.mjs`。
- CMS 权限同步：`scripts/lib/content-policy-sync.mjs`、`scripts/sync-content-policy-permissions.mjs`。
- 发布：`scripts/deploy.sh`、`ecosystem.config.cjs`。
- 内容模型与维护说明：`docs/CMS_CONTENT_MODEL.md`、`docs/MAINTAINABILITY.md`。

## 已验证结果

- Astro：319 个文件，0 错误、0 警告、0 提示。
- ESLint：通过。
- Prettier：通过。
- 可维护性检查：464 个项目文件通过。
- 资源检查：55 个引用资源和 103 个部署资源完整。
- Vitest：24 个测试文件、137 项测试通过。
- Playwright：38 项通过，6 项按项目配置跳过。
- 正式域名契约：3 项通过。
- 生产构建：通过。
- `npm run verify:release`：完整通过。
- 服务器生产依赖安装：0 个已报告漏洞。
- 测试日志中的 Directus `fetch failed` 来自刻意使用不可达 CMS 验证回退和健康失败关闭，不是发布故障。

## 已知问题与未完成事项

- Directus 状态语义修复与事实唯一来源治理已拆分为两个本地提交，但均未推送或部署，也未连接生产 CMS；线上状态不能由本地测试结果推断。
- 本轮 E2E 使用本地隔离的空 Directus 响应验证案例真实 404，生产环境仍需在后续发布流程中单独验收。
- 代码已支持新的 `claimKey` 契约及旧首页统计的受控兼容路径；真实 CMS 内容迁移尚未执行。
- 注册表中的 16 项全局公开事实均有结构化来源引用、审核人和审核日期，但仓库内未找到可独立核验的正式来源附件；全部 16 项的统计周期仍为 `null`，现有备注只如实说明缺失、待补录或不适用，不能据此声称证据闭环已经完成。
- 案例专属指标目前没有统一的来源文件、审核时间、公开授权和统计周期字段；需要在后续阶段设计独立的案例证据模型，不能机械并入全局 claims。

- 验收站 Directus 12.1.1 已建立两套独立运行策略和静态令牌：18个内容集合只读、`contact_leads` 仅创建；运行权限审计已经通过。
- 管理令牌已移出 Web `.env` 并保存在服务器独立的受限维护环境文件中；Web `.env` 只保留两枚运行令牌且权限为600。
- Directus 12 Community 当前未授权自定义权限规则，不能在策略层设置 `status=published` 过滤或字段级限制；官网所有内容查询显式过滤已发布状态，联系接口只接受表单白名单字段。不得通过修改许可代码绕过该限制。
- 新版本首次服务器发布因旧运行环境不符合新的权限健康契约而自动回滚；权限拆分与Directus 12兼容修复完成后已重新发布成功。
- 正式域名是否已同步运行代码提交 `3f7f705`、完整资源和最新 Directus 内容模型，本轮没有重新验证。
- Oracle 19c 仍是待执行的独立数据库迁移方案，当前不能描述为已经上线。

## 已放弃或替换的方案

- 不再手工逐个补十五项权限，改为幂等脚本同步，避免漏配和口径不一致。
- 不再让静态兜底覆盖后台已发布内容，避免后台修改无法生效。
- 不把一枚高权限共享 Token 作为长期网站凭据。
- 不把代码发布与数据库初始化合并成不可控的一步。

## 项目结构审查（2026-08-14）

- 已对 `src/`、`scripts/`、`server/` 和 `deploy/` 完成依赖与目录结构审查；结构图共覆盖 748 个节点、1312 条关系。`scripts/` 与 `server/` 未发现循环依赖，现有页面、组件、运行服务和部署脚本总体已具备清晰职责边界，不需要进行全项目重写。
- 已向项目负责人说明本轮发现项的含义、用户影响与处理优先级；这些项目多数属于未来容易引发漏配、性能浪费或维护困难的结构风险，并不表示当前网站已经全部发生故障。代码修复尚未开始。
- 审查时发现 CMS 集合清单存在重复来源：运行时只读集合与 CMS 建模集合分别维护，新增集合后可能漏配权限；该项已在下方“第一批结构优化”中完成共享契约和完整性测试。
- 审查时确认一条类型依赖环：`src/data/about/types.ts` 经 `src/lib/directus.ts` 与 `src/lib/directus-content-queries.ts` 相互引用；该循环已在第一批优化中解除，`directus.ts` 继续仅作为兼容门面。
- 审查时发现 `/healthz` 单次会产生约二十个 Directus 请求；该项已在第一批优化中收敛为3个请求，逐集合读取验证保留在发布验收脚本中。
- 十二个仓配专题路由已共享页面布局，但静态回退内容仍重复写在各 Astro 页面中。后续可把每页配置迁入类型化的 `src/data/service-pages/`，路由只保留页面组装和独有内容，同时由同一数据源生成 CMS 初始化快照，降低页面与种子数据漂移风险。
- `src/styles/` 有 124 个 CSS 文件，其中存在较多仅转发两到五行导入的多层入口。现有单文件体积合理，不应重新合并成巨型样式文件；建议保留每个功能一个公开入口，并把嵌套导入层级压到一层。
- `public/` 约 158 MB，其中森林期刊 PDF 约 133 MB。当前发布脚本已复用未变化文件，短期部署可接受；长期应在附件上传、备份和恢复流程稳定后，将 PDF 迁入 Directus 文件库或对象存储，减少 Git 历史和发布包体积。
- `DEV_STATE.md` 与 `docs/PROJECT_STATUS.md` 同时记录项目现状，后者含有过时 Release 和测试数据。后续应以本文件作为唯一实时状态入口，将旧状态文档归档或改为指向本文件，README 也应直接链接本文件。
- 本次仅完成只读结构审查和状态记录，没有修改业务代码、接口、路由、页面或部署配置，也没有重新运行测试；上一节列出的已验证结果仍对应当前提交 `7fd7a8a`。

## 第一批结构优化（2026-08-14）

- 新增 `config/cms-collections.mjs` 作为18个公开内容集合、1个私有联系集合和19个全量CMS集合的统一名称契约；运行权限、权限同步和模型契约测试改为共用该清单。
- 新增集合完整性测试：CMS模型定义必须与共享契约完全一致、不得重名，`contact_leads` 必须保持在公开内容集合之外。
- `/healthz` 从逐一读取18个集合改为 Directus ping 加两枚令牌的权限映射检查，单次下游请求由约20次降为3次；任一内容集合不是受限只读权限，或联系令牌不能创建留言时仍失败关闭。逐集合真实读取和越权检查继续由 `cms:verify-runtime-permissions` 承担。
- 关于页仓点类型改为直接依赖 `src/lib/directus-types.ts`，解除 `about/types → directus兼容门面 → 内容查询 → about/types` 的导入循环；重新生成源码依赖图后确认无导入循环。
- 原子发布清单已加入 `config/`，并增加部署契约测试，避免本地构建正常但服务器缺少共享配置。
- README、CMS内容模型、维护性说明和生产修复交接文档已同步到新结构与健康检查语义。
- 全量 `npm run verify` 通过：Astro检查309个文件无错误、ESLint通过、454个文件通过维护性预算、55个引用资源与103个部署资源完整、21个测试文件共98项单元测试通过、生产构建通过。
- Playwright本地回归结果为35项通过、4项按配置跳过、1项桌面案例页在并发运行中加载超时；该用例随后单独重跑并在1.6秒内通过，移动端同用例也已通过，暂未发现与本轮改动相关的浏览器回归。
- 本轮未修改业务数据、页面文案、接口、路由或数据库，未提交Git、未推送、未部署。

## 对话文档整理（2026-08-14）

- 新增 `docs/CONVERSATION_SUMMARY.md`，按主题汇总本次长对话中的技能库、官网设计、产品页、Directus、数据库、部署、安全、代码结构、测试、关键决策和下一步任务。
- 新增 `docs/CONVERSATION_TIMELINE.md`，从项目窗口最早的技能库讨论开始，按时间阶段记录用户目标、执行结果、方案替换、验证状态和未完成事项。
- 文档区分当前方案、历史方案和未执行事项，不记录任何密码、Token或真实环境变量；当前实时状态仍以本文件为准。

## 发布与案例资源稳定性（2026-08-15）

- `02bad39` 与案例资源修复提交 `5f5ec44` 已推送到 GitHub `main`。
- 阻断原因为案例详情Hero继续依赖六张Unsplash外部图片；DOM已经完整返回，但外部图片连接长时间未结束，Playwright等待页面 `load` 事件超过30秒。该问题在发布门禁中连续影响桌面与移动端，不能继续按偶发超时忽略。
- 六张已确认案例封面已保存为本地WebP资源并统一写入案例事实数据，首页回退卡片和案例详情继续共用同一图片来源，页面不再依赖Unsplash可用性。
- 修复后案例详情桌面与移动端定向回归均通过，加载耗时约1.1至1.2秒；资源检查通过。随后完整门禁36项通过、4项按配置跳过，正式域名契约3项通过、生产构建通过。

## Directus 12 权限兼容与发布尝试（2026-08-15）

- `5f5ec44` 的验收站发布完成全部本地门禁和远端依赖安装后，新版 `/healthz` 因网站仍使用管理级兼容令牌返回503；原子发布脚本自动恢复到 `20260814T135305Z`，旧版恢复后健康检查为200，未留下半发布状态。
- 验收站实际 Directus 版本确认为12.1.1；Community 许可允许生产运行，但 `custom_permission_rules_enabled` 未授权，因此创建已发布内容过滤或字段级权限会被官方许可门禁拒绝。首次权限拆分在写入 Web 环境前停止，没有泄露或替换令牌。
- 已按实例真实能力建立 `Website Content Read-Only` 与 `Website Contact Create-Only` 两套策略、两个独立运行用户和两枚不同静态令牌；前者只能读取18个内容集合，后者只能创建 `contact_leads`，二者访问系统集合和对方集合均返回401/403。
- 项目权限契约已兼容两种合法模式：具备授权时读取权限为 `partial` 并下沉已发布过滤；Community 模式读取权限为 `full` 但仍只限指定集合和读取动作，应用查询继续统一过滤 `status=published`。联系字段白名单继续由服务端接口强制执行。
- 定向单元测试3个文件共16项通过；两枚运行令牌的真实权限审计通过。随后完整发布门禁通过：Astro 309个文件无问题、ESLint通过、454个文件通过维护性预算、55个引用资源与103个部署资源完整、21个测试文件共100项单元测试通过、Playwright 36项通过且4项按配置跳过、正式域名契约3项通过、生产构建通过。
- 权限兼容提交 `3f7f705` 已推送到 GitHub `main`。首次推送遇到GitHub HTTPS短暂超时，连通性恢复后重试成功，远端与本地提交一致。
- 验收站原子发布成功切换到 `/var/www/xyy-web/releases/20260814T171015Z`；PM2 `xyy-web` 在线、无重启，内部和外部 `/healthz` 均返回200与 `contactStorage: ok`，首页、Directus ping、robots、sitemap、llms.txt及本地案例封面资源均通过发布后检查。

## Directus 返回状态语义修复（2026-08-15）

- 本轮基于 Git SHA `62095867ce74aabf6352cc9d08a361d9e217d108` 开展，最终形成独立本地提交 `526f5b2`；未推送、未部署、未修改真实 Directus 或数据库。
- 统一内容请求语义：HTTP 成功且响应结构合法为 `success`，空数组或空单例保持为空；网络连接失败、超时和 HTTP 5xx 为 `unavailable`；401/403 为 `unauthorized`；其他异常 4xx、非法 JSON、缺少 `data` 或数据类型错误为 `invalid`。
- 所有集合和单例内容读取统一经过 Directus 请求适配层，并使用集中维护的 3000ms 超时；测试可以临时注入更短超时，且每个测试后都会恢复默认请求器和超时。
- 只有 `unavailable` 可以使用审核静态回退，并输出带集合、操作、原因和可选 HTTP 状态的 `[directus:fallback]` 日志；相同降级日志在短时间内去重。401/403 与非法响应会抛出包含集合和错误类型的明确错误。
- 案例列表在 CMS 正常返回空数据时保持为空；案例 slug 不存在或取消发布时返回真正的 HTTP 404，不再 302 跳转或恢复静态详情。CMS 网络失败、超时或 5xx 时，审核静态案例仍可访问。
- 修改范围：Directus 客户端与两组查询、状态错误适配器、Directus 门面、案例详情路由，以及相关 Vitest、Playwright 契约测试；未修改视觉、业务文案、公开数字、CMS 模型、权限、部署、Oracle 或依赖版本。
- 测试先行证据：旧实现下定向 Vitest 为12项失败、2项通过；案例空 CMS 的 Playwright 契约为1项失败、1项通过，失败原因均符合待修语义。实现后5个Directus定向测试文件共33项通过，案例与回退定向 Playwright 3项通过；另有一条空记录校验测试先失败再由统一客户端校验修复。
- 首次完整发布验证因新增测试文件332行超过220行维护预算而失败；随后按成功/空数据与故障分类职责拆成195行和157行两个测试文件，没有放宽预算或删除断言。
- 最终实际验证：`npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run test:e2e`、`npm run test:formal-contract`、`npm run build`、`npm run verify:release` 均通过；最终为311个Astro文件无问题、456个文件通过维护预算、112项单元测试通过、37项E2E通过且5项按配置跳过、3项正式域名契约通过、生产构建通过。

### 第一阶段文件范围

- 已修改：`DEV_STATE.md`、`src/lib/directus-client.ts`、`src/lib/directus-content-queries.ts`、`src/lib/directus-queries.ts`、`src/lib/directus.ts`、`src/pages/cases/[slug].astro`、`tests/e2e/contracts.spec.ts`、`tests/unit/directus-content-resilience.test.ts`、`tests/unit/directus-resilience.test.ts`。
- 第一阶段新增且仍未跟踪：`src/lib/directus/request-state.ts`、`tests/unit/directus-error-semantics.test.ts`。
- `DEV_STATE.md`、两组 Directus 查询、案例契约测试和 `directus-resilience.test.ts` 在第二阶段继续发生修改，因此属于两阶段共享文件；不能仅凭最终 `git diff` 自动归属某一个阶段。

## 公开业务事实唯一来源与 CMS 防漂移治理（2026-08-15）

- 本轮以第一阶段提交 `526f5b2` 为父提交，形成独立的第二阶段本地提交；未推送、未部署、未连接或修改真实 Directus，也未修改数据库、权限、页面视觉、公开审核值或依赖版本。
- 第一阶段前置条件已确认：Directus 请求能够区分 `success`、`unavailable`、`unauthorized` 和 `invalid`，成功空数据不回退，401/403 与非法响应明确失败，案例取消发布返回真实 404；相关定向测试 18 项全部通过。
- `src/lib/claims.ts` 继续作为稳定公开入口，新增注册表验证、页面范围校验、审核状态与过期校验、统一展示值拆分、严格占位符插值、CMS 首页统计解析和旧格式映射等小型职责模块，避免事实解析重新堆入巨型文件。
- 全局公开事实只能从 claims 注册表读取；调用方必须通过 `getApprovedClaim()`、`getClaimText()` 或 `getClaimPresentation()` 并传入明确页面范围。`CLAIM_TEXT` 仅作为兼容导出保留，运行时只包含确实允许 `*` 全站使用的事实，不能绕过页面权限。
- CMS 首页统计的新契约使用 `claimKey`；CMS 即使同时提交冲突的 `value` 或 `unit`，页面仍使用审核注册表的值，并输出去重的兼容警告。旧记录只能通过集中、受测试保护的稳定数字 ID 映射；禁止按 CMS 数值、标签、单位、说明、其他自由文本或当前排序猜测事实。没有稳定 ID 或映射未命中时明确判为非法。
- 旧格式兼容层是上线迁移期间的临时措施，只支持 `LEGACY_HOMEPAGE_CLAIM_BY_ID` 中明确列出的旧记录 ID。自由文本指纹映射已删除，并有“文本完全匹配但缺少稳定 ID 仍失败”的回归测试。待真实 CMS 全部写入合法 `claimKey`、迁移结果经过验收并确认没有旧记录后，应删除 ID 映射与 `[claims:legacy]` 警告路径。
- CMS 文本占位符必须以 `interpolateClaims(value, { pageScope, source })` 解析；未知、未审核、已过期或当前页面越权的 claim 均明确失败，不再原样输出 `{{...}}`。错误只包含 claimKey、页面范围和有限来源定位，不包含 Token 或完整 CMS 正文。
- 首页统计、FAQ、服务 seed、首页可见文本、品牌数据、案例页公共文案、SEO/JSON-LD 与 `llms.txt` 已改为引用同一 claims 注册表；数据卡的值和单位由统一 presentation 层拆分，防止重复单位。
- CMS seed 生成源改为保存 `claimKey` 或 `{{claimKey}}`，生成前统一验证引用；`npm run cms:generate-faq-seeds` 成功生成 17 个页面的 100 条 FAQ，`npm run cms:generate-content-seeds` 成功生成 12 个服务页、14 期期刊、6 个案例详情及关于/站点内容。两个生成输出 `scripts/data/approved-faq-seeds.mjs` 和 `scripts/data/approved-cms-page-seeds.mjs` 与 Git 中现有内容一致，没有产生工作树差异。
- CMS 字段 Schema 未修改：`scripts/data/core-content-collection-definitions.mjs`、`scripts/setup-cms.mjs`、`server/runtime-permissions.mjs` 和 `scripts/data/cms-admin-translations.mjs` 相对 HEAD 均无差异；`scripts/data/content-management-collection-definitions.mjs` 只有首页统计字段的后台说明文字由硬编码 `150+` 改为引用审核事实注册表，没有增加、删除或更改字段名、类型、接口、选项、关系或权限。
- 漂移检查覆盖 `src/**/*.{astro,ts,tsx}`、`scripts/**/*.{mjs,json}` 和测试源码，并对非业务百分比等明确场景设置窄范围排除；页面、seed 和测试不得重新维护一份全局审核数字。案例专属指标继续留在案例域，只记录证据缺口。
- 测试先行证据：新增测试在旧实现下因缺少严格插值模块和 presentation API、未知 claimKey 被接受、CMS 值直接透传而失败；实现后新增两组核心契约测试 18 项全部通过。
- 实际验证结果：阶段一前置定向测试 18 项通过；自由文本指纹回归测试在修复前按预期 1 项失败、4 项通过，删除指纹后 claims 定向测试 3 个文件共 26 项通过；单元测试 24 个文件共 137 项通过；`npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run test:e2e`、`npm run test:formal-contract`、`npm run build` 和 `npm run verify:release` 全部通过。最终门禁为 319 个 Astro 文件无问题、464 个文件通过维护预算、38 项 E2E 通过且 6 项按项目配置跳过、3 项正式域名契约通过、生产构建通过。
- 首次完整门禁发现三个已有或本轮触及的文件超过维护预算；通过复用类型和抽取测试夹具完成拆分，未提高阈值、未删除测试、未降低断言。测试期间出现的 `[directus:fallback]` 网络日志来自本地不可达 CMS 的受控降级验证，不代表真实环境已经连接或验证。

### 第二阶段文件范围

- Claims：`src/lib/claims.ts`、`src/lib/claims/cms.ts`、`src/lib/claims/interpolation.ts`、`src/lib/claims/legacy-mapping.ts`、`src/lib/claims/presentation.ts`、`src/lib/claims/validation.ts`、`src/lib/claims/fulfillment-performance.ts`、`src/lib/claims/fulfillment-scale.ts`、`src/lib/claims/quality.ts`。
- Directus 契约：`src/lib/directus-content-queries.ts`、`src/lib/directus-interpolation.ts`、`src/lib/directus-queries.ts`、`src/lib/directus-types.ts`。
- 页面与数据：`src/data/brand/core.ts`、`src/data/brand/home.ts`、`src/data/home/cms-fallbacks.ts`、`src/data/home/faqs.ts`、`src/pages/cases.astro`、`src/pages/index.astro`、`src/pages/llms.txt.ts`。
- Seed 与生成：`scripts/data/approved-homepage-stats.mjs`、`scripts/data/approved-services.mjs`、`scripts/data/cms-seed-config.mjs`、`scripts/data/content-management-collection-definitions.mjs`、`scripts/generate-cms-content-seeds.mjs`、`scripts/generate-faq-seeds.mjs`、`scripts/lib/claim-reference-validation.mjs`、`scripts/migrate-unified-content.mjs`、`scripts/sync-approved-cms-content.mjs`。
- 测试：`tests/e2e/contracts.spec.ts`、`tests/e2e/home-product.spec.ts`、`tests/formal/production-origin.spec.ts`、`tests/unit/claims-contract.test.ts`、`tests/unit/claims.test.ts`、`tests/unit/cms-sync.test.ts`、`tests/unit/directus-resilience.test.ts`、`tests/unit/directus.test.ts`、`tests/unit/homepage-claims-contract.test.ts`。
- 状态记录：`DEV_STATE.md`。
- 第二阶段新增文件：`scripts/lib/claim-reference-validation.mjs`、`src/lib/claims/cms.ts`、`src/lib/claims/interpolation.ts`、`src/lib/claims/legacy-mapping.ts`、`src/lib/claims/presentation.ts`、`src/lib/claims/validation.ts`、`tests/unit/claims-contract.test.ts`、`tests/unit/homepage-claims-contract.test.ts`。

### 第二阶段准确验证命令

- `npx vitest run tests/unit/homepage-claims-contract.test.ts`：删除自由文本指纹前为 1 项失败、4 项通过，证明相同自由文本在没有稳定 ID 时会被旧实现错误接受。
- `npx vitest run tests/unit/homepage-claims-contract.test.ts tests/unit/claims-contract.test.ts tests/unit/claims.test.ts`：3 个文件、26 项通过。
- `npm run cms:generate-faq-seeds`：成功，生成 17 个页面的 100 条 FAQ；生成文件无 Git 差异。
- `npm run cms:generate-content-seeds`：成功，生成 12 个服务页、14 期期刊、6 个案例详情及关于/站点内容；生成文件无 Git 差异。
- `npm run format:check`：通过。
- `npm run typecheck`：319 个文件，0 错误、0 警告、0 提示。
- `npm run lint`：通过。
- `npm run test`：24 个文件、137 项通过、0 失败、0 跳过。
- `npm run test:e2e`：38 项通过、0 失败、6 项按项目配置跳过。
- `npm run test:formal-contract`：3 项通过、0 失败、0 跳过。
- `npm run build`：通过。
- `npm run verify:release`：通过；聚合门禁再次完成类型、Lint、464 个文件维护预算、55 个引用资源、103 个部署资源、137 项单元测试、38 项 E2E、3 项正式域名契约和生产构建。

### 两阶段提交拆分与独立验证

- 第一阶段已独立提交为 `526f5b2 修复 Directus 返回状态语义`，包含10个文件；第二阶段以该提交为父提交，包含39个文件。共享查询和测试文件按具体代码块拆分，没有把 claims API、`claimKey` 或页面范围校验混入第一阶段。
- 在独立临时 worktree 检出 `526f5b2` 后，`npx vitest run tests/unit/directus-error-semantics.test.ts tests/unit/directus-content-resilience.test.ts tests/unit/directus-resilience.test.ts` 为3个文件、18项通过；`npm run typecheck` 检查311个文件，0错误、0警告、0提示。
- 临时 worktree 首次执行 `npm ci` 长时间无进展后被中止；残留的部分依赖目录一度被 Astro 当成项目文件扫描并导致内存耗尽。将该临时目录移出 worktree 后，第一阶段 typecheck 正常通过，证明该失败来自临时验证环境而不是提交代码。临时 worktree 与残留依赖目录均已清理。
- 第二阶段提交前重新执行 `npm run format:check` 与 `npm run test`，结果为格式通过、24个测试文件共137项通过。两个提交均仅存在于本地，未推送、未部署。

## 下一步

1. 人工审查两个连续的本地提交，重点确认成功空数据、案例 404、页面范围、CMS `claimKey`、旧格式映射和严格占位符符合运营预期。
2. 第三阶段单独处理 CMS 模型契约：为真实内容增加稳定 `claimKey` 并执行受控迁移；迁移验收完成后删除旧首页统计 ID 兼容层。本轮没有执行真实 CMS 迁移。
3. 建立案例专属 evidence 模型，明确来源文件、统计周期、审核时间和公开授权；在依据不足前不得将案例指标并入全局 claims，也不得补造证据。
4. 后续阶段分别处理权限治理、内容发布审批与过期提醒，不与本轮事实唯一来源改动混做。
5. 补齐 16 项全局事实的正式来源附件和统计周期；对于确实不适用统计周期的事实，应由业务审核后形成明确证明，而不是由代码推断。

任何密码、Token、API Key、私钥、Cookie 和真实 `.env` 都不得写入本文档或提交到 Git。
