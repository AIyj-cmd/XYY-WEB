# DEV_STATE

更新时间：2026-08-21

## 协作记录约定

- 每完成一个开发任务、配置调整、验证、提交或部署动作，都要在本文件同步记录完成内容、验证结果、当前状态和剩余事项，保证项目负责人和开发者能够快速确认实际进度。
- 记录以任务结果为单位，不堆砌无助于判断状态的终端命令、重复讨论或临时尝试；失败方案仅在会影响后续决策时保留。
- 使用中性、任务导向的表述，只写需要完成的动作，不使用身份化角色称呼。
- 不记录密码、Token、API Key、私钥、Cookie、真实 `.env` 内容或其他敏感信息。

## 当前目标

- 五个代码治理阶段、真实 CMS 契约迁移、运行权限收口和验收站发布均已完成；当前不再新增治理阶段，项目进入稳定维护状态。
- 后续只在出现真实用户问题、5xx、数据不一致、安全风险、构建失败或部署失败时启动修复；一般结构改进和性能建议保留为已知技术债，不主动扩大范围。
- 当前工作重点是保持验收站稳定，并在获得明确发布授权后单独处理正式域名发布；验收站完成不等同于正式站已同步。

## 当前版本与环境

- 仓库最新提交以 `git log -1` 为准；关于页仓点局部修复的范围和验证记录见本文件末尾。
- 验收站当前运行提交以 `/version` 返回的 `gitSha` 为准，不能仅根据仓库 HEAD 推断。
- 验收站：`https://wz.tomatopia.top`。
- 验收站 Release ID、环境和 CMS Schema 以 `/version` 的实时响应为准。
- 运行状态：PM2 中 `xyy-web` 在线，Web 端口为 `50031`。
- 健康状态：`/healthz` 返回200；首页、产品、案例、关于、新闻、期刊、联系、服务专题和真实404均已完成发布后 smoke test。
- CMS 状态：19个集合严格 Verify 为0 failure；Active 身份与 claimKey 迁移完成；运行权限审计通过；第二次迁移 dry-run 为0项内容变更、0项 Schema 变更。
- 当前数据库：PostgreSQL 16。Oracle 19c 迁移脚本已准备，但尚未迁移或完成恢复验证。

## 已完成

- 首页、产品、关于、案例、新闻、期刊及仓配专题页的响应式和动效问题已修复。
- 页面、组件、数据、样式、浏览器控制器、Directus 查询和服务端运行逻辑已按职责拆分，并由可维护性预算检查约束。
- CMS 内容可用时以后台数据为准；审核源码只在 CMS 不可用时提供故障回退。
- 首页案例固定为六个已确认品牌；公开运营数据统一从 `src/lib/claims/` 维护。
- `scripts/setup-cms.mjs` 可幂等创建十九个业务集合及初始化内容。
- 官网运行读取集合从 `config/cms-contract.mjs` 的 active 生命周期派生；13个运行集合与5个 legacy、1个 private 集合明确分离，不在运行权限代码中维护第二份数组。
- 内容权限同步：`Website Content Read-Only` 策略只获得运行集合的读取动作，不获得新增、修改或删除权限；实例具备自定义权限授权时可进一步下沉 `published` 过滤。
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

- Astro：350 个文件，0 错误、0 警告、0 提示。
- ESLint：通过。
- Prettier：通过。
- 可维护性检查：通过。
- 资源检查：55 个引用资源和 103 个部署资源完整。
- Vitest：38 个测试文件、260 项测试通过。
- Playwright：38 项通过，6 项按项目配置跳过。
- 正式域名契约：3 项通过。
- 生产构建：通过。
- `npm run verify:release`：完整通过。
- GitHub CI：应用提交 `1c7b657` 与状态文档提交 `0578cd0` 均通过。
- 验收站：`/version`、`/healthz`、CMS Verify、运行权限审计和核心页面 smoke test 均通过。
- 测试日志中的 Directus `fetch failed` 来自刻意使用不可达 CMS 验证回退和健康失败关闭，不是发布故障。

## 已知问题与未完成事项

- 以下项目是当前明确接受的技术债，不构成验收站故障，也不自动生成新的优化阶段。
- 5个 legacy 集合继续保留用于历史兼容，但已退出 runtimeRead、Seed、正常迁移和内容 Token 权限；没有明确删除收益前不处理。
- `faqs.page_key` 继续作为 legacy 兼容字段保留，FAQ 页面归属仍以 `faq_page` 关系和 `faq_pages.key` 为准；运行逻辑不依赖 `page_key`。
- `news.cover_image` 继续兼容字符串路径；当前没有资源加载故障，只有未来明确采用 Directus 文件上传时才需要独立迁移。
- `public/` 中森林期刊 PDF 体积较大，但当前部署和资源校验正常；只有发布包体或存储压力成为真实问题时再外置。
- 注册表中的 16 项全局公开事实均有结构化来源引用、审核人和审核日期，但仓库内未找到可独立核验的正式来源附件；全部 16 项的统计周期仍为 `null`，现有备注只如实说明缺失、待补录或不适用，不能据此声称证据闭环已经完成。
- 案例专属指标仍缺统一的来源文件、审核时间、公开授权和统计周期字段；在出现外部审计或公开证明要求前，只记录缺口，不启动新的证据模型建设。
- 开发机 `.env` 曾存在过期内容 Token；发布脚本使用受限服务器运行变量后已成功部署。若再次出现403，优先检查环境变量，不据此重构部署系统。
- 截图或历史沟通中曾出现过完整 Token；若相关 Token 尚未撤销，必须轮换。这是唯一需要按安全事件立即处理的条件项。
- 验收站 Directus 12.1.1 已建立两套独立运行策略：13个 active 运行集合只读、`contact_leads` 仅创建；5条 legacy read 权限已撤销，运行权限审计通过。
- 管理令牌已移出 Web `.env` 并保存在服务器独立的受限维护环境文件中；Web `.env` 只保留两枚运行令牌且权限为600。
- Directus 12 Community 当前未授权自定义权限规则，不能在策略层设置 `status=published` 过滤或字段级限制；官网所有内容查询显式过滤已发布状态，联系接口只接受表单白名单字段。不得通过修改许可代码绕过该限制。
- 仓库 HEAD 比验收站应用 SHA 多一个纯文档提交，不影响运行；无需仅为文档重新部署。
- 正式域名 `56xyy.com` 是否已同步当前验收站 Release，本轮没有重新验证；正式发布必须作为独立授权动作处理。
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

## Directus CMS 模型契约与迁移准备（第三阶段，2026-08-15）

- 基线为第二阶段本地提交 `9cb7b426547582a84d865b18bc24397685aefe5c`。开始前工作树干净；第一、第二阶段快照保存为 `/tmp/xyy-phase1-2-status.txt` 与 `/tmp/xyy-phase1-2-tracked.patch`，两者均为空文件且 SHA-256 均为 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`。开始时没有未跟踪文件，因此未创建空压缩包。
- 前置回归通过：Directus 状态分类、成功空数据、401/403/invalid、案例真实 404、claims、claimKey、占位符、首页统计和事实漂移相关 6 个测试文件共 44 项通过，确认第一、第二阶段没有退化。
- 审查发现原实现存在 `config/cms-collections.mjs → scripts/data/cms-contract.mjs` 的运行反向依赖，已将唯一机器可读主契约移动为 `config/cms-contract.mjs`，模型版本为 `2026-08-phase3`。当前运行 import graph 为 `server/runtime-permissions.mjs → config/cms-collections.mjs → config/cms-contract.mjs`；`scripts/data/cms-contract-definitions.mjs` 仅在脚本侧绑定字段定义，`config/` 与 `server/` 不再依赖 `scripts/`。最小发布包测试只复制真实发布目录 `config/` 与 `server/`，可以成功导入运行权限模块。
- 集合生命周期分类：13 个 active（`homepage_content`、`faq_pages`、`services`、`warehouses`、`cases`、`news`、`faqs`、`publications`、`service_pages`、`about_content`、`about_history`、`about_honors`、`site_settings`）；5 个 legacy（`homepage_stats`、`case_details`、`case_stats`、`service_stats`、`service_features`）；1 个 private（`contact_leads`）。private 集合不参与内容 seed 或合同迁移。
- 稳定身份规则：沿用 `key`、`slug`、`issue` 等既有不可变字段；为 `warehouses`、`faqs`、`about_history`、`about_honors`、`service_features` 定义只读、必填、唯一 `content_key`；为 `homepage_stats`、`case_stats`、`service_stats` 定义只读、必填、唯一 `metric_key`。所有新 seed key 均显式存在于审核源数据；问题、标题、标签、名称、排序、年份、数组索引、显示文案、数字和单位不再生成稳定身份，并有改文案、改排序、改年份仍保持同一身份的测试。
- FAQ 归属以 `faq_page` 关系为唯一权威来源，前端按 `faq_page.key` 查询；seed 保存 `faqPageKey` 并在 setup 时解析当前环境真实关系 ID。`page_key` 暂时保留为只读 legacy 字段，只用于迁移核对；真实 CMS 完成关系迁移、验证全部一致且新代码不再读取后方可删除。
- setup 只创建缺失集合、安全缺失字段和关系，并按稳定身份补齐缺失 seed；已匹配的集合和字段元数据不会重复写入，已存在的运营正文不会被覆盖。有数据集合缺少 required+unique 身份字段时，迁移按“创建 nullable/非 unique 字段 → 回填 → 重新读取验证无 null → 验证无重复 → 收紧 required → 增加 unique → 完整 verify”分阶段执行；中途失败可以安全重跑，完成后第二次计划为零变更。现有字段 type、required、unique、default、singleton、relation target、on_delete 不兼容时明确返回 `migration_required`。
- 第三阶段提交前审查复现了 Singleton Seed 覆盖风险：稳定身份不一致时，旧实现会把审核 seed 整条 PATCH 到现有单例。当前 setup 只允许在稳定身份为空且所有 seed 管理的业务字段均无内容时初始化 Singleton；身份相同的现有 Singleton 始终 no-op，不同步或补齐正文；身份缺失或不一致但已有内容时返回 `singleton_migration_required`，且错误不包含运营正文。setup-cms 不是运营正文同步工具；运营内容只能通过 Directus 后台、受控内容同步或显式迁移维护。修复前新增回归测试为 6 项失败、11 项通过；修复后 Singleton/Setup 两个定向测试文件共 18 项通过，第三阶段 9 个定向文件共 63 项通过。最终 `npm run verify:release` 以状态码 0 完成：337 个 Astro 文件无诊断、482 个文件通过维护预算、193 项单元测试通过、38 项 E2E 通过且 6 项按配置跳过、3 项正式域名契约通过、生产构建通过。真实 CMS 未执行 dry-run 或迁移；第三阶段作为独立本地提交管理，尚未推送或部署。
- verify 输出模型版本、集合总数与 active/legacy/private 数量，并阻塞字段、关系、singleton、稳定身份缺失或重复等关键契约错误。已确认的旧字符串文件字段进入显式 allowlist，必须输出原因和删除条件；未知例外仍然阻塞。
- 新增 `npm run cms:migrate-contract`。默认只读 dry-run；`--apply` 还必须提供与模型版本完全一致的确认值。每个旧 ID 映射必须同时包含 collection、record ID、target stable key 与 expected-before 精确断言；只先按 ID 选中记录，再验证内容，验证不一致即 `manual_mapping_required`。旧 `homepage_stats` 通过审核记录 ID 精确回填 `metric_key`，首页单例内嵌 stats 只有携带稳定 ID 且满足同一审核断言时才能回填 `claimKey`；缺少稳定 ID 时禁止按数组顺序推断。其他迁移只接受稳定 slug/key/issue、审核 seed key或人工确认的精确记录 ID 映射，禁止使用文本寻找记录。
- apply 前会将受影响的非 private 集合保存到 Git 已忽略的 `output/cms-migrations/`，写入 SHA-256 后才允许外部修改。Directus API 不提供跨请求原子事务，因此实现采用 fail-fast、逐步幂等、保留快照和安全重跑，不声称原子迁移；apply 后自动验证剩余变更、稳定身份、FAQ 关系、claimKey 和完整 Schema。
- seedPolicy 已统一：active 为 `normal`，legacy 为 `migration_only`，private 为 `never`。`case_details`、`case_stats`、`service_stats`、`service_features` 等 legacy Schema 仅为旧数据迁移、核对和必要回滚保留，全新 CMS 不再 Seed legacy 内容；`contact_leads` 不参与 seed、内容读取、迁移或快照，verify 只检查它的集合、字段和关系 Schema。
- CMS 生成结果已重新生成并保留第三阶段差异：17 个页面的 100 条 FAQ 增加显式稳定 `content_key` 与 `faqPageKey`；12 个服务页、14 期期刊、6 个案例详情以及 history、honor 内容使用显式稳定身份。生成文件仍由脚本产生，没有直接手改 generated 输出；legacy case/service 指标不再进入新 seed 输出。
- 测试先行证据：验收补强前，legacy 集合仍被 normal seed、FAQ key 仍由数组索引生成的测试按预期失败；实现后第三阶段定向测试 9 个文件、86 项通过，第一、第二阶段回归 6 个文件、44 项通过。Schema 分阶段迁移拆分后的 3 个定向文件共 16 项通过，覆盖创建、回填、远端无空值/无重复校验、约束收紧、中断重跑、零变更和快照边界。
- 最终验证：两项 CMS seed 生成命令分别生成 17 页/100 条 FAQ 与 12 个服务页、14 期期刊、6 个案例详情；`npm run format:check` 通过；`npm run typecheck` 检查 336 个文件，0 错误、0 警告、0 提示；`npm run lint` 通过；维护性预算检查 481 个文件通过；`npm run test` 为 31 个文件、183 项通过；`npm run test:e2e` 为 38 项通过、6 项按配置跳过；`npm run test:formal-contract` 为 3 项通过；`npm run build` 通过；`npm run verify:release` 以状态码 0 完成；`git diff --check` 通过。
- 真实 CMS 尚未执行 dry-run 或 apply；没有连接真实 Directus、修改真实 Schema 或迁移真实内容。第三阶段代码、测试和文档已完成本地验收并作为独立本地提交管理，但尚未推送或部署，不能描述为“CMS 已迁移”。

### 第三阶段主要文件范围

- 主契约与定义：`config/cms-contract.mjs`、`config/cms-collections.mjs`、`scripts/data/cms-contract-definitions.mjs`、`scripts/data/*collection-definitions.mjs`、`scripts/data/cms-field-builders.mjs`、`scripts/data/cms-seed-config.mjs`。
- setup/verify 运行时：`scripts/setup-cms.mjs`、`scripts/verify-production-cms.mjs`、`scripts/lib/cms-setup-runtime.mjs`、`scripts/lib/cms-seed-runtime.mjs`、`scripts/lib/cms-navigation-runtime.mjs`、`scripts/lib/cms-contract-runtime.mjs`。
- 迁移：`scripts/migrate-cms-contract.mjs`、`scripts/lib/cms-contract-migration.mjs`、`scripts/lib/cms-contract-schema-migration.mjs`、`scripts/lib/cms-contract-snapshot.mjs`、`package.json` 的 `cms:migrate-contract` 脚本。
- FAQ 读取：`src/lib/directus-queries.ts`、`src/lib/directus-types.ts`。
- Seed 生成：`scripts/generate-faq-seeds.mjs`、`scripts/generate-cms-content-seeds.mjs`、`scripts/data/service-page-slugs.mjs`、两份 generated seed 及稳定仓库 seed。
- 测试：`tests/unit/cms-contract.test.ts`、`tests/unit/cms-contract-runtime.test.ts`、`tests/unit/cms-contract-migration.test.ts`、`tests/unit/cms-contract-schema-migration.test.ts`、`tests/unit/cms-contract-snapshot.test.ts`、`tests/unit/cms-seed-identity.test.ts`、`tests/unit/cms-setup-contract.test.ts`，以及直接调整的 setup、Directus 和最小发布包既有测试。
- 文档：`docs/CMS_CONTENT_MODEL.md`、`DEV_STATE.md`。

## Web 运行权限残余收口（第四阶段，2026-08-15）

- 基线为第三阶段独立提交 `ad54a4bd6aaa081f9109ac8ba65f4ff383eb5f5b`；开始前工作树干净。第四阶段完成后作为独立本地提交管理，未推送、未部署，未主动执行真实 CMS 权限审计，也未修改真实 Token、策略或数据。首次未隔离构建曾向本机既有 Directus 配置发出一次 `site_settings` 只读请求并收到403，不能表述为“完全未连接真实 CMS”；后续完整验收均使用本机不可达地址和虚拟 Token 隔离运行。
- 确认并修复三项运行风险：内容读取与联系写入不再回退 `DIRECTUS_TOKEN`；缺少任一专用 Token 或两枚专用 Token 相同时运行契约失败；内容运行集合由主 CMS 契约的 active 生命周期派生，排除5个 legacy、`contact_leads` private 集合及显式 `runtimeRead=false` 的 active 集合。`DIRECTUS_TOKEN` 继续仅供 setup、迁移和管理权限脚本使用。
- `/healthz` 继续只执行1次 Directus ping 和2次 `/permissions/me`，证明服务就绪、双 Token 存在且不同、13个运行集合可读、联系 Token 可创建留言；不逐集合请求内容，也不冒充完整最小权限审计。
- `cms:verify-runtime-permissions` 负责完整 mock 可验证契约：内容 Token 可读取全部运行集合且无写动作，不能读取 legacy、private、咨询或系统集合；联系 Token 仅可创建 `contact_leads`，不能读取/修改/删除/分享留言，不能读取运行、legacy 或系统集合。允许端点必须返回2xx，禁止端点只有401/403可证明拒绝；2xx、404和网络错误均失败关闭，网络错误标记为 `permission_verification_unreachable`。
- Directus 12 Community 的集合 create 权限可能返回 `fields=['*']`，因此字段限制模式明确为 `application_enforced`；服务端只把 `name`、`phone`、`company`、`email`、`service`、`message` 写入 Directus，浏览器提交的 `status`、`source`、时间和系统字段会被丢弃，不声称 CMS 已实施不存在的字段级策略。
- 集合导出消费者已逐项核查：`CMS_CONTENT_COLLECTIONS` 只供 Web 运行权限与 `Website Content Read-Only` 权限同步使用，二者都需要13个运行集合；`CMS_ALL_COLLECTIONS` 只用于19个 Schema 定义的完整性校验；`CMS_LEGACY_COLLECTIONS` 只用于负权限映射与拒绝探测；`CMS_PRIVATE_COLLECTIONS` 只用于边界断言。未发现把运行集合误用于 Schema、seed、迁移或快照的消费者。
- 测试先行证据：旧实现下4个定向测试文件为8项失败、18项通过，另有权限审计测试因脚本导入即调用 `process.exit(1)` 无法运行；失败证据包括共享 Token 实际用于留言 POST、health 对相同 Token 继续请求下游、运行集合无法排除 legacy，以及审计缺少可注入的失败关闭语义。修复后5个定向测试文件共37项通过；`npm run format:check` 与 `npm run typecheck` 已通过。
- 首次未隔离环境执行完整门禁时，本机既有 Directus 配置在构建 `/404.html` 读取 `site_settings` 时返回403，门禁据此正确失败；未执行权限审计、写请求或数据修改。随后显式使用本机不可达地址和两枚虚拟且不同的测试 Token 重新执行 `npm run verify:release`，退出码为0：338个 Astro 文件无诊断、ESLint通过、483个文件通过维护预算、55个引用资源与103个部署资源完整、33个单元测试文件共206项通过、38项 E2E 通过且6项按配置跳过、3项正式域名契约通过、两次生产构建通过，`git diff --check` 通过。该结果只证明本地代码和 mock/fixture 权限契约，不代表真实运行权限已重新审计。

## 发布身份与运行可追溯治理（第五阶段，本地验收完成）

- 基线为第四阶段独立提交 `54fa9e64642403548f2c3e04f0242e427445aa30`；开始前工作区干净。本阶段只建立 Release Identity、`/version`、部署版本核对、CI 候选身份、测试环境隔离证明和性能观察基线，不修改 CMS、运行权限、页面或性能实现。
- 已新增唯一 Release Identity 契约：字段为 `schemaVersion`、完整 Git SHA、派生短 SHA、包含短 SHA 的 Release ID、UTC 构建时间、显式环境和从 CMS 主契约读取的模型版本；Manifest 拒绝未知字段，不能携带 Token、密码、Cookie、私钥、内部地址或部署路径。
- 部署入口现在会在构建、SSH 和上传之前拒绝已修改、已暂存或未跟踪文件，生成与当前提交绑定的 `release-manifest.json` 并放入独立 Release 根目录；新版本切换和带 Manifest 的回滚都必须同时通过 `/healthz` 与版本身份核对。旧 Release 没有 Manifest 时保留首次兼容回滚，但输出 `legacy_previous_release_identity_unavailable`，不能声称身份已验证。
- `/version` 与 `/healthz` 职责分离：前者返回不可缓存的公开 Release 身份，Manifest 缺失或非法时安全返回503；后者继续只证明 Directus 与双 Token 权限映射就绪。外部健康检查支持精确核对 Git SHA、Release ID、环境和 CMS 模型版本；未提供预期值时只验证基本结构，不声称目标版本匹配。
- CI 使用 `github.sha` 和 `environment=ci` 生成候选 Manifest，仍只有 `contents: read` 权限，不具备生产部署能力；CI、Playwright 与正式域名契约显式覆盖不可达 Directus 地址和虚拟双 Token，不依赖开发者机器的 `.env`。
- 测试先行证据：实现前两个新增定向测试文件因缺少契约、Manifest 生成器、`/version`、脏工作区门禁、版本核对和 CI SHA 绑定而失败。首次失败测试在重构前导入旧 `scripts/health-check.mjs` 时，旧脚本的顶层副作用对现有验收地址执行了一次只读健康检查；未写入数据、未部署、未修改服务器。脚本现已改为仅在 CLI 直接执行时发起请求，测试导入不再访问网络。
- 最终本地验证：4个 Release/部署/健康定向测试文件共43项通过；可维护性检查曾发现 `scripts/deploy.sh` 超出200行预算1行，已通过压缩同一职责代码恢复到预算内。`npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run test` 和 `npm run verify:release` 均通过；聚合门禁为343个 Astro 文件无诊断、488个文件通过维护预算、55个引用资源与103个部署资源完整、35个单元测试文件共230项通过、38项 E2E 通过且6项按配置跳过、3项正式域名契约通过、生产构建通过，`git diff --check` 通过。第五阶段作为独立本地提交管理，提交 SHA 以 Git 历史为准；当前状态为 `PHASE_5_LOCALLY_VERIFIED`、`RELEASE_IDENTITY_CONTRACT_VERIFIED`、`VERSION_ENDPOINT_VERIFIED`、`MOCK_DEPLOYMENT_IDENTITY_VERIFIED`、`PERFORMANCE_BASELINE_RECORDED`、`REAL_DEPLOYMENT_NOT_EXECUTED`、`REAL_VERSION_NOT_VERIFIED`、`LOCALLY_COMMITTED`、`NOT_PUSHED`、`NOT_DEPLOYED`。
- 已登记用户提供的 2026-08-15 桌面 PageSpeed 实验室基线：性能82、无障碍100、最佳做法100、SEO100、FCP 0.8秒、LCP 1.9秒、TBT 0毫秒、CLS 0、Speed Index 4.0秒；无 CrUX 数据且无法确认当时 Git SHA。本阶段没有修改任何性能代码，真实部署后需结合 `/version` 重新采集。

## 下一步

1. 人工审查两个连续的本地提交，重点确认成功空数据、案例 404、页面范围、CMS `claimKey`、旧格式映射和严格占位符符合运营预期。
2. 对真实 CMS 先完成独立数据库备份，再使用第三阶段工具执行只读 dry-run；人工审核所有 `manual_mapping_required`、稳定身份、FAQ 关系和 claimKey 计划后，才可决定是否 apply。
3. 真实 apply 后运行完整 verify，并确认第二次 dry-run 为 0 changes；达成前不得删除 `page_key`、旧首页统计 ID 映射或 legacy 文件字段例外。
4. 建立案例专属 evidence 模型，明确来源文件、统计周期、审核时间和公开授权；在依据不足前不得将案例指标并入全局 claims，也不得补造证据。
5. 人工审查第五阶段 Release Identity、`/version`、部署与回滚身份核对 Diff；审查通过后再决定是否建立独立提交和执行真实部署。本轮代码治理到此结束，不创建第六阶段。
6. 补齐 16 项全局事实的正式来源附件和统计周期；对于确实不适用统计周期的事实，应由业务审核后形成明确证明，而不是由代码推断。

## 真实环境契约收口补丁（2026-08-15，不是第六阶段）

- 基线为已发布提交 `1c3c81e336d3fc67de74ccd5d550981c9603052d`，开始前工作区干净。本补丁仅收口 CMS 目标契约和 dry-run 计划，当前仍未提交、未推送、未 apply、未部署。
- 真实预检确认5个 legacy 集合不参与运行读取或 seed，因此取消 `homepage_stats.metric_key`、`case_stats.metric_key`、`service_stats.metric_key`、`service_features.content_key` 的新增、映射、必填与唯一要求；legacy 继续保留现有 Schema，但 verify 不读取其记录，也不再产生人工映射。
- Active 要求保持不变：`warehouses.content_key`、`faqs.content_key`、`about_history.content_key`、`about_honors.content_key` 与 `homepage_content.stats.claimKey` 仍必须经人工确认；FAQ 继续以 `faq_page` 关系为唯一页面归属。
- 该轮曾按预检快照将 `cases.metrics`、`news.summary`、`news.published_at` 视为 string；真实 Apply 后的严格复核确认最终 Schema 分别为 text、text、timestamp，后续“Verify 契约漂移收口”已以真实迁移结果更正这项历史判断。
- 迁移读取边界：正常内容快照只包含 active 迁移集合；private `contact_leads` 只读取字段元数据并只允许上述两个默认值的 schema-only 计划，不读取、快照、修改或回填任何留言记录。
- 测试先行证据：旧实现下4个定向测试文件共14项失败、30项通过，失败准确覆盖 legacy 人工映射、legacy 身份字段、三项类型升级、private 记录读取边界和缺失安全 Schema 计划；实现后5个定向测试文件共45项通过。维护性预算曾因新增用例令两个测试文件超过220行而失败，随后按“真实环境契约收口”职责拆出专用测试文件，没有提高阈值或删除断言。
- 本地验证使用不可达 Directus 地址与两枚虚拟 Token 隔离执行：Prettier、Astro typecheck、ESLint、维护性、资源检查、245项 Vitest、38项 Playwright（6项按配置跳过）、3项正式域名契约、构建和 `npm run verify:release` 全部通过。未隔离的首次聚合构建因开发机既有 CMS Token 对 `site_settings` 返回403而正确失败，未发生写请求；隔离重跑退出码为0。
- 真实验收 CMS 只读复检：`cms:verify` 不再因4个 legacy 身份字段或 `cases.metrics`、`news.summary`、`news.published_at` 的 string 类型失败；它仍按预期阻塞4个 active 身份字段、`news.slug` unique 和两项联系默认值。默认 `cms:migrate-contract` dry-run 产生144项 `manual_mapping_required`（仓库12、FAQ100、发展历程9、荣誉15、首页 claimKey 8），legacy 映射0；`singleton_migration_required`、重复身份、关系错误与 contract review 均为0。Schema 计划为4个 active nullable 身份字段、`news.slug` unique 和两项 private schema-only 默认值。
- 范围外状态不变：内容 Token 仍有5条 legacy read 权限待精确撤销；数据库和附件备份虽已完成同机校验，但 `offsite_backup_missing`。两项均未在本补丁中处理，并继续阻止真实 apply。

任何密码、Token、API Key、私钥、Cookie 和真实 `.env` 都不得写入本文档或提交到 Git。

## Verify 契约漂移收口（2026-08-15）

- 基线提交为 `f2d47bd47060db5e6d4dd42b8fae6861f76facc1`。144项 Active 身份与 claimKey、5条 legacy read 权限、真实 migration Apply 和运行权限审计均已完成；本轮不再执行 Apply，也不修改真实 CMS、内容或权限。
- 根因是 `scripts/data/cms-contract-definitions.mjs` 在权威 collection definitions 之后又把 `cases.metrics`、`news.summary`、`news.published_at` 覆盖为 string，同时 `faqs.page_key` 与 `about_honors.image` 的 definitions 没有表达真实 required 状态；migration planner 不规划这些反向变更，因此第二次 dry-run 已为零，但 verify 仍读取了漂移后的契约。
- 最终严格契约与已迁移 Schema 对齐：`cases.metrics=text`、`news.summary=text`、`news.published_at=timestamp`、`faqs.page_key required=true`、`about_honors.image required=true`。没有增加 allowlist、warning 或 verify 跳过；错误类型和 required 状态仍由严格回归测试阻断。
- 测试先行证据：旧实现下五项目标断言和五项反向漂移断言共10项失败；修复后5个定向测试文件共47项通过。新增严格漂移测试拆为独立文件以维持220行维护预算，没有提高阈值或删减断言。
- 隔离环境完整门禁通过：349个 Astro 文件无诊断、38个 Vitest 文件257项通过、E2E 38项通过且6项按配置跳过、正式域名契约3项通过、构建和 `npm run verify:release` 均成功。直接使用开发机 `.env` 的首次构建因本机内容 Token 对 `site_settings` 返回403而停止；按 CI 契约显式覆盖不可达 Directus 和虚拟双 Token 后完整通过，未发生 CMS 写入。
- 真实 CMS 只读结果：`npm run cms:verify` 为19个集合、0 warning、0 failure；`npm run cms:migrate-contract` 为0项内容变更、0项 Schema 变更。本轮修复作为独立提交管理，提交 SHA 以 Git 历史为准；真实 CMS 未再次 Apply，staging 尚未部署。

## Active 身份映射最终收口（2026-08-15）

- 当前基线为 `b726ccba2bbd4c25bfc705193195380683b9dee1`。本轮只修正审核映射的 expected-before 语义并装载已确认的144项 Active 身份，不新增 Schema、legacy 治理或迁移框架。
- expected-before 现在只对旧审查流程已经定义的 comparable business fields 生成 canonical SHA-256；FAQ 额外纳入权威 `faq_page.key`。Directus 更新时间、系统用户和其他不参与身份审核的元数据变化不再误判为身份丢失，业务字段或 FAQ 页面关系变化仍会阻断。
- FAQ 100条继续使用旧审查包中同一 record ID 对应的 content_key，并以当前业务字段和 `faq_page.key` 刷新 canonical precondition；仓库1–3保留原审核结果，仓库7–12按已审核 record ID 到 stable key 的连续性保留身份，仓库4–6使用与 record ID 绑定的随机 UUID 风格 content_key。发展历程9条、荣誉15条和首页8项 claimKey 决策保持原样。
- 已批准映射集中在 `scripts/data/approved-cms-contract-mappings.mjs`，迁移仍通过现有 `cms-contract-migration` 实现按 record ID、stable key 和 canonical hash 三重校验；没有运行时文本匹配或新建第二套迁移机制。
- 本地定向验证为4个文件26项通过；完整隔离门禁为348个 Astro 文件无诊断、ESLint通过、493个文件满足维护预算、37个 Vitest 文件250项通过、Playwright 38项通过且6项按配置跳过、正式域名契约3项通过、两轮生产构建通过，`npm run verify:release` 与 `git diff --check` 均通过。
- 当前状态：代码尚未提交或推送；真实 dry-run 尚未使用新映射重跑；真实 CMS 未 apply、权限未变更、staging 未部署。
- 新映射的真实 CMS 默认 dry-run 已只读执行成功：137条内容 PATCH 计划覆盖仓库12、FAQ100、发展历程9、荣誉15及首页单例1条整体 stats PATCH（内含8个 claimKey），另有4个 Active 身份字段各3阶段共12条 Schema 计划；没有 `manual_mapping_required`、`singleton_migration_required`、重复稳定身份、关系错误、contract review 或 legacy mapping。真实 CMS 仍未 apply，运行权限与 staging 尚未变更。
- 首次真实 Apply 已生成迁移前快照并完成普通 Active 集合的幂等身份写入，但在首页单例处因使用普通集合的 `/items/homepage_content/1` 路由被 Directus 拒绝；流程在首页 claimKey 和约束收紧前安全停止。当前实现改为单例专用 `/items/homepage_content` PATCH，并增加精确路由回归测试；需要重新完成本地门禁、GitHub CI、Apply 后 verify 和零变更 dry-run 后才能视为迁移完成。

## Staging 字段类型迁移阻塞修复（2026-08-15）

- 基线提交为 `518445ddd784947def7f202f07950b12448dae46`。真实 staging 已完成 Active 身份与 claimKey 内容迁移、身份约束和 `about_honors.image` 必填约束；当前只剩 `cases.metrics`、`news.summary`、`news.published_at` 三个字段类型变更，网站仍保持在迁移前 Release，尚未部署本轮代码。
- 根因已从 staging 安装的 Directus 12.1.1 实现确认：`PATCH /fields/{collection}/{field}` 只有请求体包含 `schema` 时才进入数据库列变更路径；旧实现只发送 `{ type }`，因此 API 返回成功但数据库类型没有变化。修复保持目标类型不变，仅在三个受控类型变更请求中增加空 `schema` 触发器，不新增迁移框架或其他 Schema 目标。
- 测试先行：回归断言先改为要求 `{ type, schema: {} }`，旧实现按预期1项失败；实现修复后3个迁移定向测试文件共23项通过。隔离环境 `npm run verify:release` 通过：350个 Astro 文件无诊断、38个 Vitest 文件260项通过、E2E 38项通过且6项按配置跳过、正式域名契约3项通过、生产构建通过，`git diff --check` 通过。
- 修复已作为提交 `1c7b6571ff843ef0b31b5630209489006525f9a2` 推送到 `main`，GitHub CI Run `31893117581` 的 release verification 全部通过。两份既有备份 SHA-256 复核一致后，真实 staging 仅重试上述3项类型变更；迁移快照 SHA-256 为 `cc8289fa85d436aaaf382dd10640629fa3b9b88aa05c870056283ce9850f007f`，Apply 成功且严格后置 Verify 为0 failure。
- Apply 后 `npm run cms:verify` 为19个集合、0 failure；真实双 Token 运行权限审计通过；第二次 `npm run cms:migrate-contract` 为0项内容变更、0项 Schema 变更。未重新处理映射、权限、业务内容或其他 Schema。
- 首次部署尝试在上传前因开发机 `.env` 中过期的内容 Token 对 staging CMS 返回403而停止，没有创建远端 Release；临时注入服务器现有受限双 Token 后，现有发布脚本成功部署 staging Release `20260815T162408Z-1c7b657`。`/version` 返回完整 Git SHA `1c7b6571ff843ef0b31b5630209489006525f9a2`、环境 `staging` 与 CMS Schema `2026-08-phase3`，`/healthz` 返回200。
- 真实浏览器 smoke test 覆盖首页、产品、案例列表、案例详情、关于、新闻、森林期刊、联系、鞋服云仓专题及404：业务页面均为200、未知路径为真实404，无未解析 `{{claimKey}}`、无旧 `140+` 或 `50万㎡+`、无水平溢出，联系表单必填校验生效。首页与关于页各存在一个无 `src`、无 `alt` 的装饰性图片占位，但没有实际资源 URL 加载失败；本轮未提交真实联系线索。

## 当前状态文档收口（2026-08-16）

- 只更新状态文档，没有修改代码、CMS、权限、数据库或服务器。仓库工作区在修改前干净，现有 staging 验收结果继续有效。
- 文档顶部已改为当前有效状态：五阶段治理、真实 CMS 迁移、权限收口和 staging 发布均已完成；应用 Release 为 `1c7b6571ff843ef0b31b5630209489006525f9a2`，仓库最新 `0578cd0` 仅为状态文档提交。
- 已删除顶部仍把第三、第四阶段描述为“未推送、未部署”的过时口径，并将13个 active 运行集合、5个 legacy 集合和1个 private 集合的当前边界写清楚。后续历史阶段记录仅作为过程证据，不代表当前状态。
- 当前没有需要继续启动的代码治理任务。legacy 集合、`faqs.page_key`、`news.cover_image` 字符串兼容、期刊 PDF 体积、事实证据附件和案例指标证据缺口均作为可接受技术债保留，仅在产生真实业务、审计、性能或安全影响时处理。
- 条件性安全事项：历史截图中出现过完整 Token；若尚未撤销则必须轮换，若已撤销则没有立即处理项。

## AGENTS 协作规则精简（2026-08-16）

- 将项目 `AGENTS.md` 从设计细节、服务器信息、长文件清单和重复维护说明压缩为六条执行规则；详细资料继续由 `DEV_STATE.md`、README 和专项文档承担。
- 保留范围控制、技术债触发条件、Directus 与 claims 数据职责、Git 与敏感信息安全、分级验证、浏览器验收、外部写操作授权和状态记录要求。本次未修改应用代码、CMS、服务器或部署状态。

## Agent 与设计文档收口（2026-08-16）

- 项目已不再使用 Claude Code，因此删除包含重复及过时规则的 `CLAUDE.md`；Codex 协作规则统一由精简后的 `AGENTS.md` 承担。
- `AGENTS.md` 已从本地忽略项移除，后续可随仓库同步；通用设计规范从根目录移动到 `docs/DESIGN_REFERENCE.md`，仅在明确的页面设计任务中按需阅读，不作为日常开发前置条件。
- 本次只调整协作与参考文档，没有修改应用代码、CMS、权限、数据库、服务器或当前部署状态。

## 文档目录收口（2026-08-16）

- 保留 `CMS_CONTENT_MODEL.md`、`MAINTAINABILITY.md`、`MAIN_DOMAIN_CUTOVER.md`、`PERFORMANCE_BASELINE.md` 和 `DESIGN_REFERENCE.md`，分别承担 CMS、代码边界、正式域名切换、性能基线和按需设计参考。
- 删除已被 `DEV_STATE.md` 或自动测试取代的对话总结、对话时间线、旧项目状态、旧生产交接清单及三份 TDD 过程记录；README 已改为直接指向当前状态和保留文档。
- 更新保留文档中的旧口径：运行集合为13个 active 集合，Web 不回退共享 Token，真实 staging CMS 迁移与零变更 dry-run 已完成，测试计数统一由本文件维护。本次未修改应用代码或外部环境。

## 性能基线状态更新（2026-08-16）

- `docs/PERFORMANCE_BASELINE.md` 已补充 README 中现有的本地 Lighthouse 单次采样，并明确其不是正式站 Release 或 CrUX 证据。
- 历史 PageSpeed 提示已改为条件性观察项：仅在正式站多次复测、Core Web Vitals 或真实用户反馈证明问题存在时进行最小修复，不据单次分数启动性能专项。
- 本次只更新文档，没有修改图片、缓存、脚本、页面、性能阈值、CMS、服务器或当前部署状态。

## 文档收口 GitHub 同步（2026-08-16）

- 本批次包含精简后的 `AGENTS.md`、按需设计参考、性能基线状态，以及 README、CMS、维护和主域名文档的当前口径；同时删除已被当前状态或自动测试取代的历史总结、交接和 TDD 过程记录。
- 本批次作为一个纯文档与协作规则提交同步到 GitHub `main`，具体提交 SHA 以 Git 历史为准；没有修改应用代码、依赖、CMS、权限、数据库或服务器，也不触发部署。

## 关于页仓点展示与数据修复（2026-08-16）

- 只读核对确认页面分组函数本来支持同一城市多个仓点；东莞只显示1个的根因是 CMS 中“智谷仓、朗州仓、桥头仓”被归入 archived，并非前端把同城记录合并。最终业务口径保留4个东莞仓点：“智谷仓、朗州仓、桥头仓、东莞云谷仓”，其中云谷仓地址显示“暂不公布”。
- 关于页仓点桌面端保持华南在左、华东在右，但移除外层容器的边框、圆角、背景和阴影；内部仅以标题、留白和细分隔线组织城市及仓点，不使用顶部装饰线、城市卡片、仓点卡片、表头或单元格，移动端两个区域自然上下排列。
- 审核回退数据恢复东莞3个既有仓点及 Directus 中仍保留的地址，并恢复肇庆唯品会物流园仓地址；业务方随后确认兴泰、佛山宏盛、昆山花桥、合肥联亚的具体地址，新塘明确显示“暂不公布”，页面回退与审核 Seed 已使用同一口径。
- 仓点行最终只展示仓点名称和地址，不再展示启用年份、区位、仓容、楼层、货梯或作业动线说明；Directus 与审核回退中的原始说明字段仍保留，避免影响其他用途。E2E 回归明确验证示例说明不会重新出现在关于页。
- 审核 CMS 仓库源保留4条东莞稳定记录，云谷仓不再作为 legacy 名称。经用户明确授权，本机和验收站 Directus 均只执行仓点精确字段更新，不运行整库 `cms:sync-approved --apply`，不改动现有 `content_key` 或其他运营正文；两端均已复核为12个发布仓点，东莞4个，云谷仓地址为“暂不公布”。
- 新增仓点一致性单测：东莞分组必须恰好包含4个审核仓点、云谷仓地址必须为“暂不公布”，CMS seed 与页面回退必须使用同一4个名称和不同稳定身份；CMS 不可用 E2E 改为通过统一仓点区域的稳定可访问名称定位，不再依赖旧 DOM 层级。
- 隔离测试环境下 `npm run verify:release` 通过：Astro typecheck 351个文件0诊断、ESLint、496个文件维护预算、55个引用资源、103个部署资源、39个 Vitest 文件268项测试、38项 E2E 通过且6项按配置跳过、3项正式域名契约和生产构建全部通过。未隔离的首次构建被开发机 `.env` 中已知过期内容 Token 的403阻断；显式使用不可达测试 CMS 与不同虚拟运行 Token 后完整通过，没有修改 `.env`。
- Playwright 真实浏览器检查覆盖1440px桌面与430px手机：东莞显示3个仓点，手机 `scrollWidth === clientWidth === 430`，控制台0错误/0警告；最终布局移除外层容器造型，桌面为华南左、华东右，内部无卡片化表达。
- 本地预览已于2026-08-16使用隔离 CMS 配置启动在 `http://127.0.0.1:4323/`；首页与 `/about` 均返回 HTTP 200。该进程仅用于本机查看，不代表验收站同步或部署。
- 地址证据复查覆盖当前代码、全部 Git/Reflog 历史、本机旧文档与 Office 文件、Directus 仓库修订历史、56xyy.com 的2018—2024年网页存档及公开搜索；未从历史来源恢复的5项已由业务方在2026-08-16明确确认，并已同步到页面回退、审核 CMS Seed 与本机 Directus。验收站或正式站是否同步必须分别通过远端 CMS 读取和页面验收确认，不能由本机结果推断。
- 首次同步提交已通过本地完整门禁，但用户随后补充云谷仓也需展示，因此部署在上传远端 Release 前中止；纠正提交 `c56a101` 的 GitHub CI 只因新增仓点测试文件未经过 Prettier 而在格式步骤停止，功能门禁未发生新失败。该文件已按项目既有格式规则机械修正，后续发布以修正后的提交和 CI 结果为准。

## 关于页沉浸式内容浏览改造（2026-08-16）

- 关于页最终收为单一全屏仓储视频舞台，不再排列独立公司概述区、CTA、全站完整页脚和悬浮咨询入口；该页保留悬浮导航与原主标题，删除主标题下方两行缩略说明，完整公司概述直接常驻显示，不再依赖鼠标悬停或点击展开。
- 视频暂停和静音控制从主标题下方移至页面右上安全区，桌面与悬浮导航保持同一水平线但不贴靠导航；手机因导航占满顶部宽度而下移到导航下方右侧。两个控制改为深蓝纯色圆形按钮，悬停时使用橙色反馈。
- 删除“ABOUT XYY / 浏览新亦源”标题、场景图片、翻页按钮、外框、分隔线、单元格底色和箭头；发展历程、仓网布局、资质荣誉和常见问题紧接完整公司概述下方，以纯文字双列排列，桌面仅做轻微透明度反馈。点击入口继续打开原统一内容层，四类数据仍在 Astro SSR 时读取并渲染。
- 先前用于入口预览的 ImageGen 临时方案及其WebP资源已撤销，没有遗留未引用图片；品牌 Logo 与“关于新亦源”标题在公司概述顶部水平排列，删除与概述重复的页脚简介。总部名称、地址和电话不再占用视频首屏，统一复用现有 Directus 全站设置并移入About极简页脚；页面没有新增重复业务口径。其他页面的 Layout 与悬浮咨询行为保持不变。
- `AboutHero.astro`、`AboutExplorer.astro`、`about-stage.css`、`about-explorer.css` 和 `about/explorer.ts` 分别承担视频舞台、文字入口/弹层结构、视觉和交互；`about.astro` 只负责编排现有数据组件，没有将改动重新堆入页面入口。
- 内容层继续支持键盘焦点、Esc、遮罩关闭、焦点恢复、页面滚动锁定和 URL hash；荣誉证书大图打开时，第一次 Esc 只关闭证书层，第二次才关闭外层内容层。
- Playwright 真实浏览器复核覆盖1440×900桌面和430×932手机：完整概述常驻显示，右上纯色视频控制不压导航，四组入口在概述下方保持纯文字双列，品牌与联系信息继续向下自然排列；两种宽度均无横向溢出，控制台0错误/0警告。
- 背景视频恢复全屏cover，避免16:10屏幕出现明显深蓝留白；桌面端从项目已有720p素材生成约12 MB的1280×720发布版本，减少原960×540视频放大造成的模糊，手机端继续使用540p版本控制传输体积。没有使用153 MB的4K原片，也没有改变视频内容或交互。
- 补齐768–1199px响应式控制位置：该宽度下导航已切换为通栏样式，暂停与静音按钮同步下移到导航下方，不再被导航层遮挡；手机端继续收紧右侧安全距离。
- 定向 About 交互 E2E 2项通过；最终完整发布门禁结果见本节后续记录。新舞台、文字入口、弹层和响应式样式继续按职责拆为小文件，单文件均低于维护预算。
- 本地预览使用隔离 CMS 配置运行在 `http://127.0.0.1:4323/`；首页与 `/about` 均实测返回 HTTP 200。该预览使用审核回退内容，不修改 `.env`、Directus 或远端环境。
- 本次仅修改本地工作树并完成本地验收，尚未提交、推送或部署，也未修改 Directus、数据库、权限、业务数字或其他页面。

## 关于页全员影像画廊（2026-08-16）

- 在现有全屏视频舞台之后新增独立滚动影像段，不改变视频舞台、四类内容弹层或其他页面。画廊使用一次性确定的随机顺序，不按主题分组；桌面采用四列、手机采用两列的规整纵向瀑布流，列宽和间距统一，每个图片框按对应WebP的真实宽高比计算，横图、竖图和方图均完整展示且不裁剪，所有访客及页面刷新看到的顺序一致。
- 素材源目录当前共有160个文件，其中157个可正常解码并全部转为最长边不超过1280px、去除元数据、质量68的WebP，并通过 `loading="lazy"`、异步解码和低加载优先级控制实际请求。2026-08-16新增的6张JPEG已从桌面临时目录移动到公用WEB素材目录，并生成 `gallery-155.webp` 至 `gallery-160.webp`；`06302138_05.0.jpg.jpg`、`06302138_06.0.jpg.jpg`、`06302138_12.0.jpg.jpg` 仍是缺失深度图引用的损坏HEIF，因此未生成不可用网页资源。
- 画廊图片随页面自然纵向滚动，并使用 `/product` 的 `revealVisualOnScroll` 进入视口动画；图片保持真实尺寸属性与 `object-fit: contain`，不加遮罩、不悬停放大，避免任何视觉裁切。五段员工文案继续固定在100svh视口中央并随画廊滚动进度依次切换，但进入动作改为与Product文字一致的上移、去模糊和逐项显现，不再使用旧的连续交叉透明度计算或进度编号；`prefers-reduced-motion` 下保持无动画完整可见。
- 结构继续按职责拆分：`gallery-images.ts` 保存157张WebP的真实尺寸元数据，`AboutScrollGallery.astro` 负责SSR结构、固定顺序与按比例瀑布流位置，`about-gallery.css` 与 `about-gallery-responsive.css` 负责基础和响应式视觉，`about/gallery.ts` 复用产品页图片揭示并只负责按滚动进度切换文案；`about.astro` 只新增组件编排。视频控制初始化优先于下方画廊动画，避免大量下方动画注册延迟首屏控件。
- E2E覆盖157张图片、5段文案、固定随机顺序、图片Product同款揭示以及滚动过程中始终只有一段当前文案；定向About E2E 2项通过。
- 修复画廊滚动文案容器残留 `opacity: 0` 导致内容状态已切换但仍不可见的问题：当前激活文案容器明确恢复可见，上一段在退出动画完成后再隐藏，文案会随画廊滚动依次出现。修复后定向About E2E 2项通过，测试已校验激活标题透明度为1；Astro类型检查357个文件0诊断、格式检查与 `git diff --check` 均通过。
- About视频继续使用铺满式 `cover`，但画面改为底部对齐，优先保留视频内嵌字幕；下方影像画廊的区块、舞台和图片空余底色由深蓝改为白色。五段滚动文案的大标题、小标题与说明文字统一使用白色，并保留深色文字阴影以适配不同明暗照片；文案退出阶段使用独立状态，切换中始终只有一项被标记为当前内容。定向About E2E覆盖视频位置、白色画廊背景、文案可见性和文案颜色；格式检查和 `git diff --check` 通过。
- About页继续关闭全站完整页脚，在画廊后增加专用极简收尾：白色呼吸留白后接低高度浅灰白页脚与细分隔线；桌面在同一横栏内依次排列版权备案、总部地址与电话、返回顶部，手机端仅在空间不足时换行，不重复首屏Logo或导航。组件独立为 `AboutMinimalFooter.astro`；定向About E2E验证联系信息只位于页脚、浅色背景和返回顶部锚点。
- 新增6张素材后，Playwright确认 `gallery-155.webp` 至 `gallery-160.webp` 全部进入页面且继续使用 `object-fit: contain`；定向About E2E 2项通过，Astro 357个文件0诊断，格式、509个文件维护预算、资源引用检查和 `git diff --check` 均通过。
- 新增素材并统一动画后，隔离CMS环境下 `npm run verify:release` 全部通过：Astro 357个文件0诊断、ESLint、509个文件维护预算、39个Vitest文件268项通过、E2E 38项通过且6项按配置跳过、正式域名契约3项通过、两轮生产构建成功；资源检查通过。
- 当前本地预览运行于 `http://127.0.0.1:4322/about`，使用不可达测试CMS与虚拟双Token，只展示审核回退内容。本次仍未提交、推送或部署，也未修改真实Directus、数据库、权限或业务数字。

## 全站导航 Liquid Glass 精修（2026-08-16）

- 只调整悬浮导航控制层，不修改任何页面内容背景：主导航胶囊、仓配服务下拉层和移动菜单统一使用半透明深色材质、22px背景模糊、饱和增强、内侧高光与折射感边缘，底层视频和图片保持原样可见。
- 导航继续使用深色自适应底保证白字在明暗内容上均可读；无 `backdrop-filter` 支持或启用“减少透明度”时自动退回不透明深蓝，键盘焦点使用白色描边与品牌橙外环，“减少动态效果”时关闭导航过渡。
- 样式独立为 `header-liquid-glass.css`，移除 Header 与服务下拉层原有行内背景实现；定向About与移动导航E2E 2项通过，并验证导航模糊材质与胶囊圆角。当前仅本地修改，未提交、推送或部署。
- Liquid Glass 外层原先使用 `overflow: hidden`，会裁掉绝对定位在导航下方的“仓配服务”菜单；现已只将该层改为允许溢出，保留下拉层原有玻璃样式、链接和交互。Playwright 实页确认菜单完整位于视口内。
- About 四个内容入口继续使用原生 `dialog`，补充 `position: fixed; inset: 0; margin: auto` 后按视口严格居中；1280×720 实测水平与垂直中心偏差均为 0px。新增 E2E 同时约束下拉菜单可见与弹窗中心位置，相关桌面/移动测试 2 项通过；Astro 类型检查 357 个文件 0 诊断，ESLint、Prettier 和 `git diff --check` 均通过。本次仍仅修改本地工作树，未提交、推送或部署。

## 全站页脚浅色化（2026-08-16）

- 全站标准页脚去除大面积深蓝背景，统一使用浅灰白 `#f8fafc`、顶部细分隔线、深蓝正文与橙色交互强调；Logo、服务入口、快速入口、总部地址、电话、版权、隐私说明和备案信息均保留，未改变链接或数据来源。
- About专用极简页脚同步使用相同浅灰白基调，并把原视频首屏的总部地址与电话收进既有低高度横栏；页脚属于内容层，因此不套用导航的 Liquid Glass 材质。
- Playwright实页复核覆盖标准页脚桌面与430px手机布局、About极简页脚；定向E2E 2项通过，Astro类型检查357个文件0诊断，ESLint、格式检查和 `git diff --check` 均通过。当前仅本地修改，未提交、推送或部署。

## 关于页发展历程补充（2026-08-16）

- 2011年历程不再使用纯年份占位块，改为复用网站 `/logo.png`；Logo 在深蓝承载面上以 `object-fit: contain` 完整显示，不裁切品牌图形。2026年新增“精进·管理升级”节点，正文为“引入华为管理体系，全面提升公司管理水平，建立可支撑长远发展的运作体系”。
- 历程唯一源码 `src/data/about/history.ts` 更新后，通过 `npm run cms:generate-content-seeds` 重新生成审核 Seed；没有直接手改生成文件，也没有连接或修改真实 Directus。
- 定向 Playwright 实际切换到2026年并核对文案通过；CMS Seed/身份相关 Vitest 2个文件19项通过；Astro类型检查357个文件0诊断，ESLint、Prettier和 `git diff --check` 均通过。本次仍仅修改本地工作树，未提交、推送或部署。

## 合作案例品牌轨道展示（2026-08-16）

- `/cases` 顶部 Hero、业务文案、6个案例数据、详情路由和 FAQ 均保持不变；原独立 Logo 跑马灯与六张等权案例卡被合并为一个白色案例舞台。
- 参考 `cosmos.so` 实际Canvas首屏的分层运动规律，原有78个合作品牌 Logo 分配到三层无可见边框的安全轨道，以不同速度和方向持续缓慢旋转，并通过不同尺寸、透明度和轻微倾角形成分散的动态品牌场；外、中、内圈分别固定分配34、26、18个Logo，同圈弧长与圈间半径差均大于Logo最大显示尺寸，避免独立旋转过程中发生重叠。鼠标经过不会暂停，减少动态效果时完全关闭旋转。Logo 只表达合作品牌生态，不承担案例身份或切换逻辑。
- 固定560px舞台中心承载6个真实案例，默认展示UR，通过左右按钮依次切换案例名称、业务类别、核心数据、标签与详情链接；轨道超出舞台的部分直接裁切，不再按圆环尺寸撑高页面。交互脚本只维护当前索引和可见面板，没有新增WebGL、轮播库或复制业务数据。
- 2026-08-16视觉复查后进一步移除桌面端 Logo 的统一白色卡片、边框和阴影，以透明 Logo、轻微投影及更明显的尺寸和透明度差异表达远近层级；桌面舞台最大宽度由1180px扩展到1600px，四层轨道增加错位起点、扩大半径并整体放大Logo，避免宽屏页面仍聚集在中间。中心案例取消矩形白底，只保留无边界的径向留白，UR标题和核心数据在桌面端保持单行，底部数据来源说明回到正常内容流。
- 最靠近案例的内圈Logo单独从中心渐隐区域向外提至360—450px安全半径，并提高尺寸和可见度；该圈仍位于案例信息层后方，不遮挡标题、数据、链接或切换控件。
- 中心案例改为紧凑的动态案例索引：核心数据按原文中的分隔符自动拆为等宽指标，去除与顶部类别重复的标签行；底部同时显示上一个案例名称、当前详情入口、序号和下一个案例名称，切换时名称、链接与无障碍标签同步更新。手机端指标自动改为两列，案例数据和切换顺序未改变。
- 中心案例最终使用各案例现有封面作为正圆形主视觉，品牌名、核心数据、详情入口、序号和前后案例导航均直接叠加在圆形图片内部；文字没有独立卡片或背景块，只使用统一的图片暗化层保证可读性。切换案例时封面随当前面板同步切换，外围78个Logo与三层安全轨道保持不变。
- 桌面端圆形案例新增无点击数据层：默认展示现有案例介绍，鼠标移入或内部链接获得键盘焦点时，原位渐变为该案例现有的全部指标；介绍来自 `case_description/details`，完整数据来自 `Case.stats`，未新增、复制或改写业务内容。品牌名、详情入口和案例切换始终可见；触屏手机端继续显示介绍与详情入口，避免在小圆内强塞8项数据。
- Playwright实页确认UR悬停后摘要透明度为0、完整8项数据透明度为1，数据、品牌名与三组操作区在580px圆内无重叠；定向E2E 6项通过，隔离CMS构建成功，本地4322预览已更新。
- 中心案例圆的桌面最大尺寸由520px提高至580px，舞台只同步补足为620px高，避免圆形裁切；手机端仍使用原430px上限，外围Logo轨道半径、数量和运动规则未改。
- 手机端不强行显示圆形轨道：四层Logo降级为可横向浏览的轻量品牌带，案例内容独立置于上方，避免圆形轨道压缩正文或造成页面横向溢出。“为什么品牌选择新亦源”继续使用轻量编号、文字与分隔线。
- 结构按职责拆为案例SSR组件、轨道交互脚本、轨道样式、中心内容样式、响应式样式与价值说明样式，单文件均在维护预算内。本地构建与 `http://127.0.0.1:4322/cases` 桌面截图检查通过；Typecheck为358文件0错误，定向浏览器回归结果以本节后续记录为准；本批次未修改真实Directus数据、数据库或权限。
- 提交前完整门禁使用不可达测试 CMS 与两枚不同虚拟 Token 隔离运行并通过：Astro 检查359个文件0诊断、ESLint通过、517个文件符合维护预算、56个引用资源与103个部署资源完整、39个 Vitest 文件共268项通过、Playwright 37项通过且7项按项目矩阵跳过、正式域名契约3项通过、两轮生产构建成功。维护性检查首次发现 About 极简页脚样式、案例轨道内容样式和综合 E2E 超出预算，已按样式与测试职责拆分，未提高阈值、删除断言或改变页面视觉。
- 本批次已提交并普通推送至 `main`，应用提交为 `2f60c4fa7d0102e784013d19e351ff1484b1bbe9`（`feat(site): refresh about and case experiences`）；GitHub Actions Run `31954344791` 对该完整 SHA 执行完成且为 `success`。首次本地验证因开发机遗留内容 Token 对 `site_settings` 返回403而在上传前终止，随后使用不可达构建 CMS 与虚拟双 Token 完成隔离构建，未改动服务器运行环境。
- 验收站 `https://wz.tomatopia.top` 已通过现有原子发布脚本部署 Release `20260816T150610Z-2f60c4f`，未发生回滚；公开 `/version` 返回应用 SHA `2f60c4fa7d0102e784013d19e351ff1484b1bbe9`、`environment=staging`、CMS Schema `2026-08-phase3`，`/healthz` 返回 HTTP 200。桌面1440×900与移动430×932共检查首页、仓配服务、案例列表、UR案例详情、关于、新闻、森林期刊、联系及真实404共18项：状态码均符合预期，无水平溢出、可见断图、未解析 `{{...}}` 或非预期控制台错误。

## 主站 FAQ 与 CMS 文章封面只读诊断（2026-08-20）

- 主站与验收站不是同一运行环境：`56xyy.com` 和 `wz.tomatopia.top` 解析到不同服务器，并各自暴露独立 Directus 项目信息；两站 `/healthz` 和 `/cms/server/ping` 均正常，不能据此推断应用 Release、CMS Schema 或内容已经同步。
- 主站首页、关于页和案例页均保留 FAQ 区标题，但代表性已审核问题不存在；验收站同一路由正常返回对应问题。当前源码按 `faq_page.key` 与 `status=published` 查询，Directus 成功返回空数组时明确保持为空，只有网络失败、超时或 5xx 才使用审核回退。
- 验收站 `/version` 明确返回 Release `20260816T150610Z-2f60c4f` 和应用 SHA `2f60c4fa7d0102e784013d19e351ff1484b1bbe9`；主站 `/version` 落入站内 404，首页静态资源指纹也与验收站不同。现有证据将 FAQ 故障定位为正式环境的应用/CMS 内容契约未同步，而不是当前仓库 FAQ 查询在已部署验收版本上的通用代码故障。主站服务器未接受现有 SSH 公钥，本轮不能进一步只读确认其精确 Release、FAQ 记录数量、发布状态或关系迁移结果。
- 当前 CMS 模型把 `news.cover_image` 定义为 `uuid`、`file-image` 界面和 `directus_files` 关系；但兼容清单仍允许文章封面保留旧字符串路径，Setup 遇到非 UUID 数据库字段时会主动保留旧字段并跳过文件关系。测试站和主站后台均不能选择封面的现象与该兼容路径一致，属于两个 CMS 实例尚未完成的文件字段迁移，不是新闻页面组件或普通前端部署问题。
- 定向契约测试 `tests/unit/directus.test.ts`、`tests/unit/cms-setup.test.ts`、`tests/unit/cms-schema-drift.test.ts` 共25项通过。诊断期间未修改应用代码、CMS 数据、数据库、权限、服务器配置或部署；后续处理前需分别备份两个 CMS 的数据库与附件，先只读核对主站 FAQ 关系/发布状态和 `news.cover_image` 真实字段类型，再单独审批正式站 Release 同步、FAQ 内容迁移与封面 UUID/文件关系迁移。
- 当前源码使用不可达隔离 CMS 构建并通过正式 SSR 入口运行后，首页、关于页和案例页均显示审核 FAQ；Playwright 在1440×900与430×932下确认首页8条问题存在，控制台0错误、0警告。本地实例仅用于只读页面验证，完成后已停止；没有修改 `.env` 或连接真实 CMS。
- 验收站实时 `/version` 仍为 `2f60c4fa7d0102e784013d19e351ff1484b1bbe9`，该提交到仓库 HEAD 只相差 `DEV_STATE.md` 文档，应用代码一致；验收站首页实时响应也包含审核 FAQ。由此进一步确认 FAQ 组件与当前应用发布包正常，正式站缺失来自其独立 Release/CMS 数据契约未同步。文章封面仍属于 CMS 旧字符串字段到 Directus 文件 UUID 关系尚未执行的独立迁移，不会因重新发布同一 Web 构建自动恢复文件选择器。
- 已新增 `docs/DEPLOYMENT_FAQ_COVER_DIAGNOSTIC.md` 作为部署侧交接报告，包含正式 Release/Nginx/环境变量检查、FAQ 数据与关系查询、运行令牌权限判定、新闻封面迁移顺序、验收标准和脱敏证据清单。报告不含密码或 Token，未授权任何部署、Apply、权限或真实 CMS 写入。
- 后续只读复查确认验收 CMS 的 `news.cover_image` 物理列仍为 `varchar`，Directus 元数据虽为 `file-image`/`special=file`，但没有指向 `directus_files` 的关系；两条已发布新闻中一条保存 UUID 字符串、一条封面为空，符合“文件上传成功但文章选择、保存或回显不可靠”的半迁移状态。验收 Release 未包含 `scripts/verify-production-cms.mjs`，因此服务器内执行 `npm run cms:verify` 报 `MODULE_NOT_FOUND`；未改动服务器或 CMS。
- 验收站还复现了新闻详情问题：发布记录 ID 5 的 slug 为 `chehsi `（末尾 ASCII 空格），列表原样生成 `/news/chehsi `；`/news/chehsi` 返回302到 `/news`，`/news/chehsi%20` 返回200，正常记录 `/news/cheshi` 返回200。当前契约仅在 slug 唯一约束缺失时检查空值/重复，且未校验首尾空格；需先经授权修正 CMS 数据，再补充 slug 规范化校验、规范化重复检查和详情不存在时的404测试。FAQ 前端结论不变，但不能再表述为“项目完全无需代码修复”。

## CMS 全功能只读审计（2026-08-20）

- 按用户要求只排查、不修复；未修改业务代码、Directus 数据、数据库结构、权限、服务器配置或部署。完整报告见 `docs/CMS_FULL_READONLY_AUDIT_2026-08-20.md`。
- 验收 Directus 的19个预期集合均存在；100条 FAQ 全部已发布且17个页面关系完整；真实运行令牌下49组内容查询全部成功，27条 CMS 驱动路由和 sitemap 的29条 URL 均返回200，63个静态内容资源可访问，必填字段、状态、嵌套结构与富文本安全检查未发现新增问题。
- 新确认用户可见故障：验收 CMS 中已被新闻引用的封面资源，无论匿名、内容令牌还是公开 `/cms/assets/` 代理均返回403，页面已经输出该失效资源 URL；这会影响当前文章封面，并可能影响未来所有 Directus 文件字段。
- 新确认代码问题：`src/lib/directus-content-queries.ts` 只替换服务功能项 `desc` 中的 Claim 变量，未处理 `title`；验收站 `/zhibo-cangpei` 实际泄漏两处 `{{shippingSla}}`。本轮未改代码。
- 结合此前结果，仍存在 `news.cover_image` 为 varchar、元数据却为文件界面且无文件关系的半迁移状态，以及已发布新闻 slug 尾随空格导致正常 URL 302 回新闻列表的问题。验收 Release 还同时缺少两份 CMS 验证脚本，声明的 `cms:verify` 命令无法在发布目录运行。
- 定向 Vitest 6个文件61项全部通过，但未覆盖真实资源 HTTP 状态、后台 CRUD/发布、封面保存后重开、slug 规范、功能标题变量替换和发布制品内 CMS 自检，不能据此宣称整个 CMS 已测试。
- 真实 CMS 写入需单独授权，因此本轮没有创建/编辑/发布/删除测试文章、上传一次性附件或成功提交联系表单；Chrome 自动化也未能稳定接管已登录后台。后续完整写入闭环须在授权后使用带测试前缀的草稿和一次性图片执行并清理。

## CMS 本地隔离写入审计（2026-08-20）

- 按用户后续要求改用本机完全隔离环境实际写入；启动独立 PostgreSQL 数据库、Directus 12.1.1 和本地 Astro SSR，未连接或修改验收站、主站、真实 CMS、真实数据库、权限或部署。完整报告见 `docs/CMS_LOCAL_WRITE_AUDIT_2026-08-20.md`。
- 通过真实 Directus 后台完成新闻新建、草稿保存、PNG 附件上传、封面选择、列表返回后重开回显、发布、取消发布、文章删除和文件库附件删除。正确的全新 PostgreSQL 字段与文件关系下，封面选择和保存本身正常；清理后 `news=0`、`directus_files=0`。
- 发布状态下本地 `/news` 与文章详情均返回200并读取到测试内容；切回草稿后列表不再显示，详情返回302到 `/news`。另实际创建一条关联 `faq_pages.key=news` 的 FAQ，前台显示成功，删除后消失，FAQ 总数恢复为100。
- 全新实例中的封面匿名 `/assets/{uuid}` 返回403。当前内容权限同步只覆盖业务内容集合，未建立 Directus 文件公开交付策略；因此后台关系保存正常也不能保证前台图片可用，需要仓库明确资源交付方案并由部署侧配置验证。
- 全新数据库直接执行 `scripts/setup-cms.mjs` 会在 Singleton Seed 阶段失败：运行时固定查询 `date_created`、`user_created`、`user_updated`，部分单例集合定义并未创建这些字段。本轮只在一次性本地数据库补临时占位字段以继续审计，没有修改仓库代码；该初始化缺陷需要后续修复。
- 文章允许在 `published_at=null` 时发布，当前前台 `formatDate(null)` 显示为“1970年1月1日”；需补发布校验或空值回退。本地 `/admin/content/news/+` 与完整生命周期均正常，未复现远端 new 页面偶发打不开，远端应结合半迁移 Schema、异常 slug、浏览器失败请求和 Directus 日志继续定位。

## CMS 修复与隔离完整回归（2026-08-20）

- 已按本地写入审计结果修复代码：Singleton Seed 只读取实际定义字段；新闻 slug 增加格式、空白和规范化重复校验；已发布新闻强制 `published_at` 且前台只展示到期记录；非法日期不再渲染为1970年；服务功能标题补齐 Claim 变量替换。
- `news.cover_image` 已退出旧字符串字段兼容清单；契约迁移仅在全部非空值均为 UUID 时计划转换，否则报告 `data_validation_required`。该保护要求部署侧先清洗真实环境异常封面数据，不能强制迁移。
- 新增站内 `/api/cms-assets/{uuid}` 资源代理；内容令牌权限同步与审计纳入 `directus_files` 只读，但代理只放行已发布案例、新闻、期刊、服务页和关于内容实际引用的文件。匿名 Directus 文件仍不开放，令牌不进入浏览器。
- 发布脚本已包含 `scripts/`，部署目录中的 `cms:verify` 和运行权限审计具备代码文件；CMS Schema 版本更新为 `2026-08-cms-hardening`。
- 全新隔离 PostgreSQL + Directus 12.1.1 一次 Setup 成功：19个集合、100条 FAQ、14项内容读取权限，`cms:verify` 为0 failure。没有再补临时 Singleton 字段。
- 真实后台回归完成：`news/+` 打开、草稿创建、富文本、PNG上传、封面选择、保存后重开回显、无发布时间发布被阻止、补时间后发布、取消发布、文章删除和文件库附件删除均符合预期。
- 发布阶段前台新闻列表、详情与封面均成功；资源代理返回200、Range返回206、未引用UUID返回404，Directus匿名资源保持403。切回草稿后列表消失且详情302回 `/news`。
- 临时新闻 FAQ 创建后前台显示，删除后消失；最终测试文章0、测试附件0、临时 FAQ 0，FAQ总数恢复100。完整报告见 `docs/CMS_REPAIR_AND_REGRESSION_2026-08-20.md`。
- 清理后的 `cms:verify` 为19个集合、0 warning、0 failure；双令牌运行权限审计通过。`npm run verify:release` 全部通过：364个 Astro/TypeScript 文件0问题、522个文件维护预算、41个单元测试文件276项、E2E 37项通过且7项按配置跳过、正式域名契约3项和最终生产构建均通过。
- 发布级 E2E 在隔离库产生的10条联系表单记录随一次性数据库删除；本地 Directus、Astro、浏览器会话和临时目录均已停止或移除。本轮未提交、推送、部署、迁移或修改验收站/主站及真实 CMS。远端执行仍须先备份、dry-run、清洗异常 slug/封面数据并获得明确授权。

## CMS 全功能测试计划（2026-08-20）

- 已确认上一轮真实写入闭环只完整覆盖 `news`、`directus_files` 和一条关联既有页面的 `faqs`；`contact_leads` 覆盖前台创建与权限边界。其他 active 集合此前虽通过 Schema、读取、权限和前台检查，但不能据此视为已完成后台 CRUD 测试。
- 已新增 `docs/CMS_COMPLETE_FUNCTIONAL_TEST_PLAN_2026-08-20.md`，覆盖13个 active 集合、1个 private 集合和文件库，区分普通内容、Singleton、关系、文件、富文本、权限、后台导航稳定性及桌面/移动前台消费者。
- 计划要求先在一次性本地 Directus/PostgreSQL 中实现可重复自动化和失败后强制清理，连续通过两次后再申请验收站写入；主站默认只读。当前仅制定方案，未再次启动本地 CMS，未写入验收站/主站，未执行部署、迁移或权限变更。

## CMS 全功能回归与身份约束加固（2026-08-20）

- 已按全功能方案在两套一次性本地 PostgreSQL + Directus 12.1.1 环境执行；未连接、写入、迁移或部署验收站与主站。完整报告见 `docs/CMS_COMPLETE_FUNCTIONAL_TEST_REPORT_2026-08-20.md`。
- 14个内容入口与文件库共15个页面各连续打开5次，75/75通过；11个可创建集合的 `new` 页面各打开5次，55/55通过。10个普通集合、3个 Singleton、联系留言和文件库均完成真实写入、重开、状态、关系、前台联动与清理。
- 新闻封面已实际执行移除旧封面、从文件库选择另一张图片、保存、返回列表和重开；后台、Directus字段与前台详情均读取新UUID。WebP/PDF/PNG、Range 206、未引用404、匿名Directus资源403和删除引用文件后的SET NULL行为均通过。
- 新发现并修复 active 稳定身份只做后台必填、未完整落到数据库约束的问题；13个 active 身份字段统一为 `NOT NULL + UNIQUE`，案例slug同时设为后台必填。合同迁移扩展到全部13个 active 集合，并用物理 `is_nullable=false` 判定数据库必填，避免把Directus UI `required`误认为NOT NULL。
- 本地既有库 dry-run正确计划10项身份约束并成功Apply；修复后的全新Setup直接生成正确约束，随后迁移dry-run为0。10个普通集合空写入全部400，有基线记录的重复身份全部为`RECORD_NOT_UNIQUE`，无意外创建。
- 新发现并修复联系限流单测在执行环境存在真实可写令牌时会写入当前CMS的问题；单测现在默认清空CMS环境并模拟存储。删除本轮30条一次性“张三/咨询”记录后，使用真实本地令牌运行联系单测和整套发布验证，`contact_leads`保持0。
- 最终 `cms:verify` 为19集合、0 warning、0 failure、文件0；运行权限审计通过。`npm run verify:release` 通过：364个Astro/TypeScript文件0问题、522个文件维护预算、41个单测文件278项、E2E 37项通过且7项按配置跳过、正式域名契约3项和最终构建全部通过。
- 清理后新闻0、联系留言0、Directus文件0，集合计数与Singleton均恢复基线。Directus 12.1.1新闻富文本仍有一次非阻塞 `Unexpected token '<'`，对应TinyMCE相对语言脚本路径返回Admin HTML；不影响编辑、封面、保存和重开，作为低优先级上游问题记录。
- 两套本地 Directus、Astro 和浏览器会话均已停止；两套一次性 PostgreSQL 数据库、临时上传目录、浏览器证据缓存和本地迁移快照均已删除，不可恢复。本轮未提交、推送、部署或修改任何远端环境。

## CMS 修复发布准备（2026-08-20）

- 用户已明确授权同步 GitHub 并部署验收站；主站、真实 CMS 迁移和权限 Apply 不在本次授权范围。由于 `main` 是默认分支，本轮建立功能分支 `codex/cms-hardening-20260820` 管理提交。
- 提交前使用不可达测试 CMS 与两枚不同的虚拟运行令牌重新执行 `npm run verify:release`，结果为364个 Astro/TypeScript 文件0问题、522个文件通过维护预算、41个单测文件278项通过、E2E 37项通过且7项按矩阵跳过、正式域名契约3项通过、两轮生产构建成功。

## CMS 修复验收站发布（2026-08-20）

- 修复提交 `da8f4e69112a4a6cee99dca781721682f653b201` 已推送到 GitHub 分支 `codex/cms-hardening-20260820`；远端分支 SHA 与本地一致。仓库工作流未对该功能分支产生 GitHub Actions Run，本地与发布脚本内的两轮完整 `verify:release` 均已通过。
- 现有原子发布脚本已将同一提交部署为验收站 Release `20260820T085234Z-da8f4e6`。`/version` 返回完整 Git SHA、`environment=staging` 与 `cmsSchemaVersion=2026-08-cms-hardening`；`/healthz`、Directus Ping、首页、新闻、产品、案例、关于、服务详情、期刊和联系页面均返回预期状态。首页实际输出9个 FAQ 条目，FAQ 内容未丢失。
- 发布后独立检查发现站内资源代理读取当前已发布文件 `a9be7a91-e74c-43f4-947c-52c3fc25879a` 返回502；服务器使用现有内容令牌只读访问 `/files/{id}` 与 `/assets/{id}` 均为403，`npm run cms:verify-runtime-permissions` 明确报告 `content token cannot read directus_files`。这证明应用代码已部署，但验收站 Directus 运行权限尚未同步，CMS 图片代理与文章封面端到端仍未完成。
- 本次没有执行 CMS Schema 迁移、权限 Apply、后台写入或主站部署，也没有回滚当前验收 Release。下一步必须获得单独授权后，为验收站内容令牌补齐 `directus_files` 只读权限并执行只读后置审计；文章封面后台字段若仍为旧字符串类型，还需另行授权 Schema 迁移后再做真实保存/重开验证。

## CMS 验收站迁移与权限执行（2026-08-20，进行中）

- 用户已明确授权验收站 CMS Schema 迁移、`directus_files` 权限 Apply 和迁移后真实回归；主站继续不在范围内。Chrome 控制接口当前未发现用户已登录的 Chrome，因此后台 UI 闭环暂候浏览器扩展恢复，API、迁移和公开前台验证继续执行。
- 迁移 dry-run 未写入数据；计划11项 Schema 变更，但被新闻记录 `slug` 首尾空格阻断。迁移器报告 `data_validation_required collection=news field=slug reason=whitespace`，Schema Apply 尚未执行。
- 迁移前在验收服务器生成 PostgreSQL 备份 `/var/backups/xyy-postgresql/directus-20260820T091048Z.dump`（361650 bytes）和附件备份 `/var/backups/xyy-uploads/directus-uploads-20260820T091048Z.tar.gz`（203854 bytes）；两份 SHA-256 校验均通过，备份及清单权限均为600。正式备份配置和两个定时器仍缺失，备份尚未证明已复制到加密异机。
- 已同步 `Website Content Read-Only` 策略的14项读取权限（新增1项、更新13项）。服务器后置审计通过：13个运行内容集合、1个文件集合和联系仅创建令牌保持分离且最小权限；已发布文件代理从502恢复为 HTTP 200、`image/jpeg`、201655 bytes。
- 新闻 `id=5` 的异常 slug 已在确认目标无重复后由 `chehsi ` 精确规范化为 `chehsi`，未修改标题、正文、状态或发布时间。随后 dry-run 为0项内容变更、11项 Schema 变更且无阻断。
- 首次 Schema Apply 生成迁移快照 `output/cms-migrations/2026-08-cms-hardening-2026-08-20T09-14-56-932Z.json`，SHA-256 为 `3431a57966e2f339e7c75d5681453ec305a861cd1c2ff7b1745148b47ed54128`；11项字段和约束已执行，但自动后置验证发现 `news.cover_image` 已转 UUID 而 `directus_files` 关系仍缺失，因此以 `post_migration_schema_verify_failed` 停止。文件元数据与两条现有新闻记录均保留。
- 根因为迁移快照没有读取关系元数据，字段收敛器也只转换物理列类型而未规划文件关系。新增关系迁移回归测试在旧实现下3项全部失败；修复后迁移器会读取带关系合同集合的 `/relations/{collection}`，在 UUID 值安全时规划并创建缺失关系，支持类型转换后中断重跑，再次完成后 dry-run 为零。错误目标关系仍失败关闭，不执行猜测修复。
- 迁移、Setup 与新闻加固定向测试5个文件29项通过；相关新旧定向测试8项通过。完整门禁首次仅因既有 About/Cases 综合 E2E 在并行负载下30秒超时而失败，该用例单独重跑9.3秒通过；未修改测试或放宽超时。随后完整 `npm run verify:release` 退出码为0：365个 Astro/TypeScript 文件0问题、523个文件通过维护预算、42个单测文件281项、E2E 37项通过且7项按矩阵跳过、正式域名契约3项和两轮生产构建全部通过。
- 迁移修复提交 `cd6868d` 已推送并部署为验收 Release `20260820T092656Z-cd6868d`；剩余1项 `news.cover_image → directus_files` 关系 Apply 成功。第二份迁移快照 SHA-256 为 `d6fa70b59915fd10eb75b116d1b5c46433508a063951e5df5c0c300e42ccb868`；后置 `cms:verify` 为19集合、0 warning、0 failure、文件2，随后 dry-run 为0内容/0 Schema。
- 首次验收站全功能写入回归在发布新增服务时复现首页500，服务器日志为 `Cannot read properties of null (reading 'map')`。测试脚本在失败后完整清理，集合计数和文件数恢复基线。根因是 `services.features` 合同允许空值，而首页查询直接对 `null` 调用 `.map()`；新增回归测试在旧实现下按预期失败，修复后把非数组能力列表规范为空数组，相关2个文件22项通过。
- 服务空能力修复后的完整 `npm run verify:release` 退出码为0：365个 Astro/TypeScript 文件0问题、523个文件通过维护预算、42个单测文件282项、E2E 37项通过且7项按矩阵跳过、正式域名契约3项和两轮生产构建全部通过。验收站全功能回归将在该修复提交部署后从干净基线重新执行。
- 服务空能力修复提交 `5be0a00` 已推送并部署为验收 Release `20260820T095607Z-5be0a00`。重新执行全功能写入回归时，用户要求暂停；进程已立即中止，只完成必要清理。已按运行标识 `cms-staging-e2e-1787220995144` 核验并删除本轮已创建的案例、仓库、服务、FAQ 页面及3个一次性附件；所有测试标识残留为0。清理后基线恢复：FAQ 页面17、服务3、仓库12、案例6、新闻2、FAQ 100、期刊14、服务专题12、发展历程9、企业荣誉15、联系留言62、文件2；验收站首页 HTTP 200。未继续后续回归、迁移或部署。
- 用户恢复执行后，验收站全功能回归从干净基线重跑完成。首次恢复运行仅因临时回归脚本遗漏联系表单必填的 `privacyConsent` 而得到预期400，非产品缺陷；补齐测试输入后整套通过：后台75/75列表路由、55/55新建路由和5/5文件路由可访问，FAQ 页面、服务、仓库、案例、期刊、服务专题、发展历程、企业荣誉8类内容完成创建/读取/更新/重复约束/发布/取消发布/删除；FAQ 子项关联及新闻页发布可见；新闻封面完成上传、初始选择、替换、公开读取、Range读取、删除后关系置空；首页、关于和全站设置3个单例完成修改、公开验证与原值恢复；联系表单完成无效提交、有效入库、后台状态更新与删除。回归结束后所有集合与文件数量精确恢复暂停前基线，测试标识残留为0。
- 发布后只读收口通过：`/version` 确认验收 Release `20260820T095607Z-5be0a00`、环境 `staging`、CMS Schema `2026-08-cms-hardening`；`/healthz` 为 `status=ok` 且 `contactStorage=ok`；显式锁定验收 CMS 后 `cms:verify` 为19集合、0 warning、0 failure、文件2；服务器运行权限审计再次通过13个运行内容集合、1个文件集合及联系仅创建的分离最小权限。Chrome 扩展已安装并启用，但 Google Chrome 当前未运行，因此后台真实点击、媒体选择器和浏览器可视状态仍待浏览器启动后补测；不得用已通过的HTTP后台路由检查代替该项。
- 用户已授权启动 Chrome 补测后台 UI，但当前执行环境缺少 X Server/`DISPLAY`，Chrome `Default` 配置窗口启动即退出，扩展无法建立浏览器连接；未执行任何后台 UI 写入。需用户在桌面端手动打开同一 Chrome 配置并保持后台登录后再重试媒体选择器、封面保存回读及 New 页面可用性。
- 针对远程环境已进一步使用现有 Xvfb 建立虚拟显示并成功启动 Chrome `Default` 配置；Chrome 150、浏览器扩展安装/启用状态及 Native Messaging 清单均核验正常，扩展宿主进程已运行，但 ChatGPT 浏览器控制通道仍未注册该 Chrome 实例，因而无法进行受支持的 UI 控制。按浏览器插件安全边界未改用 DevTools 注入或其他旁路；临时 Chrome/Xvfb 已停止且无残留进程。若继续 UI 层验收，需要重新安装/连接 Browser 插件，或由用户明确批准切换到隔离的 Playwright 浏览器会话。
- 用户批准切换 Playwright 后，已通过隔离浏览器真实登录验收后台并复现文章新建流程：媒体选择器可以打开、选择现有 JPEG，表单也正确显示封面预览；点击文章保存时失败并提示“URL 标识：值是必需的”。现场字段元数据核验确认 `news.slug` 同时为必填和只读且无值，因此封面没有丢失，实际是整篇文章未能保存；这也解释了文章 New 页面偶发看似无效的问题。
- 根因为身份字段分阶段迁移曾临时统一写入 `readonly=true`，完成默认值与唯一约束后没有把运营录入字段恢复为合同要求的可编辑状态。影响范围为 `services.slug`、`cases.slug`、`news.slug`、`publications.issue`、`service_pages.slug`；8个由系统稳定身份管理的 `key/content_key` 字段应继续只读。迁移规划器现仅为合同可编辑且现场仍只读的字段生成 `identity_meta`，Apply 时恢复完整字段元数据；新增回归测试覆盖规划与 PATCH 请求，避免误放开系统键。
- 修复后6个迁移定向测试文件共36项通过。首次直接使用开发机 `.env` 的完整门禁在283项单测通过后被既有本地 Directus 403正确阻断；随后按隔离测试合同覆盖不可达 CMS 与两枚不同的虚拟运行令牌，`npm run verify:release` 退出码为0：366个 Astro/TypeScript 文件0诊断、524个文件通过维护预算、43个单测文件283项通过、E2E 37项通过且7项按矩阵跳过、正式域名契约3项和两轮生产构建全部通过。尚未发布本次修复或执行这5项字段元数据迁移。
- 修复提交 `6323226` 已推送到 GitHub 分支 `codex/cms-hardening-20260820`，并通过原子发布脚本部署为验收 Release `20260820T114539Z-6323226`。首次发布尝试仍被开发机过期内容 Token 的403在上传前阻断；只在后续发布进程内临时使用服务器现有只读内容 Token 后，发布脚本内完整 `verify:release`、依赖安装、PM2切换、健康检查与精确 Release 身份核对全部通过，未回滚。
- 发布后迁移 dry-run 仅规划 `services.slug`、`cases.slug`、`news.slug`、`publications.issue`、`service_pages.slug` 5项 `identity_meta` 且0内容变更；Apply 快照为 `output/cms-migrations/2026-08-cms-hardening-2026-08-20T11-50-07-238Z.json`，SHA-256 `a20d2f4eca5d2c9a23d2b31903ffe11a3cbe0733465026099b5f34caf7f4ec98`。Apply 后5个运营身份字段均为 `required=true, readonly=false`，抽查 `homepage_content.key`、`faqs.content_key` 仍为只读；迁移再次 dry-run 为0内容/0 Schema。
- Playwright 后台 UI 闭环通过：新建文章表单的 URL 标识恢复可编辑；选择既有 JPEG 封面后成功保存草稿，重开记录仍显示同一文件且 API 回读关系 ID 正确；设置当前发布时间并发布后，文章详情与 `/api/cms-assets/{id}` 均为 HTTP 200，封面为1280×720 JPEG；取消发布后详情 URL 按合同302返回新闻列表；后台永久删除后测试文章残留0、文件仍为2。仓配服务、合作案例、文章、森林期刊和服务专题页5个 New 表单均逐页确认可进入，`slug/期刊期号` 控件可编辑。
- UI 登录过程中 Playwright CLI 曾把测试站管理员填充值回显到本地测试输出；已立即在验收 Directus 中轮换该管理员密码、同步 `/var/www/xyy-cms/.env` 并用新凭据验证登录，之后改为抑制填充输出。主站未涉及，旧验收密码已失效；浏览器会话关闭，最终 CMS 不含测试文章或一次性附件。
- 最后一轮验收站完整写入回归通过：75/75后台列表路由、55/55新建路由、5/5文件路由；FAQ页面、服务、仓库、案例、期刊、服务专题、发展历程、企业荣誉8类内容完成CRUD、重复约束、发布/取消发布/删除；FAQ关联、文章封面上传替换/公开读取/Range读取/删除关系、3个单例恢复及联系表单/后台状态/删除均通过。清理后精确恢复基线：FAQ页面17、服务3、仓库12、案例6、新闻2、FAQ 100、期刊14、服务专题12、发展历程9、企业荣誉15、联系留言62、文件2。
- 最终只读收口：`cms:verify` 为19集合、0 warning、0 failure、文件2；运行权限审计通过13个内容集合、1个文件集合和联系仅创建的分离最小权限；`/version` 为 `6323226b8df9aaa9bf4ba23d65cd580abe924164`、Release `20260820T114539Z-6323226`、`environment=staging`、CMS Schema `2026-08-cms-hardening`，`/healthz` 为 `status=ok`、`contactStorage=ok`。主站未部署、未迁移、未写入。

## CMS 修复合并主分支与验收站部署（2026-08-20）

- 修复分支 `codex/cms-hardening-20260820` 已在确认 `origin/main` 为其祖先后，通过 `--ff-only` 快进合并到 `main`；GitHub `main` 已同步到 `0e40c563cd123d551884b15c8db86fd55ee81dd3`，对应 CI Run `32370671940` 完成且结论为 `success`。
- 发布前首次直接使用开发机遗留 `.env` 验证时，283项单元测试通过，但构建因过期内容 Token 读取 `site_settings` 返回403而停止；随后按既定隔离方式使用不可达测试 CMS 与两枚不同虚拟 Token 重跑 `npm run verify:release`，结果为366个 Astro/TypeScript 文件0诊断、524个文件通过维护预算、43个单测文件283项通过、E2E 37项通过且7项按矩阵跳过、正式域名契约3项和两轮生产构建全部通过。该403属于已记录的开发机环境问题，不是代码失败。
- 验收站已通过原子发布脚本部署 Release `20260820T124758Z-0e40c56`，精确应用 SHA 为 `0e40c563cd123d551884b15c8db86fd55ee81dd3`、`environment=staging`、CMS Schema `2026-08-cms-hardening`；依赖安装无漏洞，PM2切换、内部健康检查、外部健康检查和 Release 身份核对均通过，未回滚。
- 发布后首页、仓配服务、案例、关于、新闻、森林期刊、联系和直播仓配专题均返回HTTP 200；`/healthz` 返回 `status=ok`、`contactStorage=ok`，`/version` 与目标提交和 Release 完全一致。发布过程中只临时读取服务器现有受限 Web 运行环境用于构建验证，临时副本已由退出清理机制删除，未输出或提交任何 Token。
- 本次合并和部署只包含既有 CMS 修复、测试与文档，不包含 Lighthouse 性能建议或任何测试站专用性能修改。正式主站未部署、未迁移、未写入，也未修改正式站服务器配置。

## 测试站 CMS 管理员凭据重置（2026-08-20）

- 按明确授权，已将验收站 Directus 管理员账号 `admin@wz.tomatopia.top` 重置为一次性临时密码，并通过测试服务器本机 Directus API 登录验证；未修改内容表、CMS Schema、权限或正式站。
- 临时密码不写入仓库、`DEV_STATE.md`、服务器环境文件、命令输出记录或 GitHub；登录后必须立即在 Directus 用户设置中改为长期密码。Chrome 自动连接不可用，因此未代填浏览器。

## 服装云仓与唯品会专题页下线（2026-08-21）

- 按用户明确范围，仅下线 `/fuzhuang-yuncang` 与 `/weipinhui-jit-jitx`；未增加重定向，其他服务页、导航入口、共享图片和专属展示组件均保持不变。两条路由文件已删除，并同步移出 sitemap、`llms.txt`、服务专题/FAQ Seed 来源、FAQ 页面选项、CMS 合同映射及服务页 E2E 清单。
- 本地 Directus 已按精确记录删除2条 `service_pages`、2条 `faq_pages` 和10条关联 FAQ；删除后目标 slug/key/page_key 查询均为空，总量为服务专题10、FAQ页面15、FAQ 90。删除前记录备份保存在 `/tmp/xyy-delete-*-20260821.json`，未修改其他 CMS 数据。
- 本地路由核验为两个下线地址均返回404，其余10个服务专题均返回200；`npm run verify` 通过（364个 Astro/TypeScript 文件0诊断、43个单测文件283项通过、生产构建成功），服务页 Playwright E2E 桌面与移动端共6项通过。本轮未提交、推送或部署，也未修改验收站与主站。

## 直播仓配顶部图片替换（2026-08-21）

- `/zhibo-cangpei` 顶部图已改为独立高清资源 `/w-live-commerce.webp`（1920×1440），页面源码、CMS Seed 与本地 Directus 已发布记录现保持一致；本地 CMS 仅修改 `service_pages` 中 `zhibo-cangpei` 的 `img_src`，原记录备份为 `/tmp/xyy-zhibo-hero-before-20260821.json`，未修改其他 CMS 数据。
- 本地页面已确认实际加载新图，资源完整性检查与 `git diff --check` 通过；Playwright 桌面端 1440×900、移动端 390×844 实屏检查通过，建筑主体、`唯品会 vip.com` 标识与装卸区域可见，控制台0错误。本轮未提交、推送或部署，验收站与主站未修改。

## 后整修复顶部图片替换（2026-08-21）

- `/houzheng-xiufu` 顶部图已改为独立高清资源 `/w-post-processing.webp`（1920×1440），页面源码、CMS Seed 与本地 Directus 已发布记录保持一致；本地 CMS 仅修改 `service_pages` 中 `houzheng-xiufu` 的 `img_src`，原记录备份为 `/tmp/xyy-houzheng-hero-before-20260821.json`，未修改其他 CMS 数据。
- 本地页面已确认实际加载新图，资源完整性检查与 `git diff --check` 通过；Playwright 桌面端 1440×900、移动端 390×844 实屏检查通过，作业区、工作人员、工位与周转箱主体可见，控制台0错误。本轮未提交、推送或部署，验收站与主站未修改。

## 鞋服云仓顶部图片替换（2026-08-21）

- `/xiefu-yuncang` 顶部图已改为独立高清资源 `/w-footwear-cloud.webp`（1920×1440），页面源码、CMS Seed 与本地 Directus 已发布记录保持一致；本地 CMS 仅修改 `service_pages` 中 `xiefu-yuncang` 的 `img_src`，原记录备份为 `/tmp/xyy-xiefu-hero-before-20260821.json`，未修改其他 CMS 数据。
- 本地页面已确认实际加载新图，资源完整性检查与 `git diff --check` 通过；Playwright 桌面端 1440×900、移动端 390×844 实屏检查通过，质检作业区、工作人员和周转箱主体可见，控制台0错误。本轮未提交、推送或部署，验收站与主站未修改。

## 鞋服云仓标准服务流程视觉调整（2026-08-21）

- 仅调整 `/xiefu-yuncang` 的“鞋服云仓标准服务流程”区块：桌面端流程轨道按自身内容宽度水平居中，移动端仍从第1步开始并保留区块内横向滚动；新增贯穿步骤的浅色引导轨道、循环扫光、序号呼吸和箭头位移动效，并为 `prefers-reduced-motion` 关闭全部动画。
- Playwright 验证桌面端流程中心与容器中心偏差为0px；移动端区块 `scrollLeft=0`、页面横向溢出为0，流程区可独立横向浏览。动画计算样式、桌面与移动端截图和控制台检查通过；`astro check` 为364个文件0诊断，ESLint、Prettier、资源完整性和 `git diff --check` 均通过。本轮未提交、推送或部署。

## 退货质检顶部图片替换（2026-08-21）

- `/tuihuo-zhijian` 顶部图已改为独立高清资源 `/w-return-inspection.webp`（1920×1440），最终采用服装挂仓与作业通道画面；页面源码、CMS Seed 与本地 Directus 已发布记录保持一致。本地 CMS 仅修改 `service_pages` 中 `tuihuo-zhijian` 的 `img_src`，原记录备份为 `/tmp/xyy-tuihuo-hero-before-20260821.json`，未修改其他 CMS 数据。
- 本地页面已确认实际加载最终图片，资源完整性检查与 `git diff --check` 通过；Playwright 桌面端 1440×900、移动端 390×844 实屏检查通过，挂仓、服装和作业通道主体可见，控制台0错误。本轮未提交、推送或部署，验收站与主站未修改。

## 首页退货质检作业区图片替换（2026-08-21）

- 仅替换首页“02 退货质检作业区”右侧独立资源 `/w-inspect2.webp`，最终图片为1448×1086 WebP；未修改首页首屏、文案、布局、其他区块或 CMS 数据。替换前资源备份为 `/tmp/xyy-home-inspect2-before-20260821.webp`。
- 本地首页已确认实际加载新图，资源完整性检查与 `git diff --check` 通过；Playwright 桌面端 1440×900、移动端 390×844 实屏检查通过，人物、牛仔裤和质检工位主体可见，页面横向溢出为0，控制台0错误。本轮未提交、推送或部署，验收站与主站未修改。

## 行业动态文章列表横向卡片优化（2026-08-21）

- 仅调整 `/news` 文章列表组件，桌面端由三列方块卡片改为单列横向卡片；直接复用现有 `cover_image`、`category`、`published_at`、`title`、`summary` 与 `slug` 字段，未修改 CMS Schema、文章数据和详情页。无封面文章继续使用品牌占位图，并补充中英文识别层级。
- 移动端自动切换为封面在上、内容在下的纵向卡片。Playwright 验证本地5篇文章均正常渲染，桌面端卡片1152px、封面区320px，移动端卡片358px且页面横向溢出为0，控制台0错误；`astro check` 为364个文件0诊断，ESLint、Prettier 和 `git diff --check` 通过。本轮未提交、推送或部署。

## 行业动态分类列表十篇上限（2026-08-21）

- `/news` 的“全部”及每个分类列表默认只展示最新10篇文章；当当前列表超过10篇时，在列表底部显示“查看全部”按钮，按钮保留当前分类参数并通过 `all=1` 展示该分类全部已获取文章。标题区文章总数继续显示当前分类的完整数量，分类切换不继承展开状态。
- 当前本地数据为全部5篇、物流干货3篇，均按边界规则不显示列表内“查看全部”按钮；Playwright 已确认分类选中状态、文章数量、页面无横向溢出且控制台0错误。`astro check` 为364个文件0诊断，ESLint、Prettier 和 `git diff --check` 通过。本轮未修改 CMS 数据、未提交、未推送或部署。

## 联系留言咨询服务中文显示（2026-08-21）

- 仅调整 `contact_leads.service` 的 Directus 字段元数据：保持官网提交的英文稳定代码不变，在 CMS 中通过选项和标签映射显示为“鞋服云仓、后整质检修复、物流云、全链路解决方案、其他”；未修改提交时间字段或客户留言记录。
- 本地 Directus 字段已同步并回读确认，原字段元数据备份为 `/tmp/xyy-contact-service-field-before-20260821.json`。字段映射单测8项通过，`astro check` 为364个文件0诊断，ESLint、Prettier 和 `git diff --check` 通过。本轮未提交、未推送或部署，测试站与主站未修改。

## 行业动态详情页顶部层级修复（2026-08-21）

- 仅调整行业动态详情页面包屑顶部留白，为固定导航栏预留空间；未修改全站导航、文章内容、CMS 数据或其他页面。
- 本地 `http://localhost:4322/news/111111111111111111111111` 实屏验证通过：桌面端导航与面包屑文字间隔10px，移动端间隔18px，页面无横向溢出，控制台0错误。`astro check` 为364个文件0诊断，ESLint、Prettier 和 `git diff --check` 通过。本轮未提交、未推送或部署。

## 站点内容与交互更新发布候选（2026-08-21）

- 当前全部已授权改动已收口到发布分支 `codex/site-content-ux-20260821`，包含两条旧服务专题路由下线、服务页与首页图片更新、鞋服云仓流程视觉调整、行业动态列表与详情布局优化，以及联系留言咨询服务中文标签映射；未包含主站部署或主站 CMS 写入。
- 发布门禁首次发现测试文件超过220行维护预算，已将咨询服务字段回归断言拆入独立测试文件；随后发现动画 CSS 的 `90%` 透明度字面量被公开数字门禁识别，已等价改为 `0.9`，页面视觉与业务口径均未改变。并行 E2E 首轮仅 `about-cases` 在30秒超时，单独复跑10.6秒通过，未放宽超时或修改测试。
- 最终 `npm run verify:release` 通过：365个 Astro/TypeScript 文件0诊断、523个文件通过维护预算、56个引用资源与103个部署资源完整、44个 Vitest 文件共284项通过、Playwright 37项通过且7项按配置跳过、正式域名契约3项通过、生产构建成功，`git diff --check` 通过。当前尚未提交、推送或部署。
- 首次测试站部署在上传前再次因同一 `about-cases` 并行负载超时安全停止，服务器未创建或切换新 Release。为保留30秒测试标准并消除 CI/部署机资源竞争，Playwright 现仅在 `CI` 环境固定为1个工作线程；调整后该用例8.6秒通过，完整 `CI=1 npm run verify:release` 再次全部通过。本地开发并发策略未改变。
