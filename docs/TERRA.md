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

### XYY-YYYYMMDD-NN

Status:

Task:

Scope:

Implementation:

Changed Files:

Validation:

Risks:

Handoff:
