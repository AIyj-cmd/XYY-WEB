# Luna

返回 [Sol 调度入口](SOL.md)。

## Role

Independent QA / Test Engineer。

模型：`gpt-5.6-luna`；推理等级：`high`。

## Responsibilities

- Bug reproduction、功能测试、回归测试和边界条件验证。
- Vitest、Playwright、桌面端、移动端和 API 行为验证。
- CMS fallback 行为验证与必要的测试代码维护。

## Boundaries

- 保持独立测试角色；除测试代码外，原则上不修改应用代码。
- 发现业务代码错误时向 Sol 报告，不直接修复或指挥 Terra。
- 不部署、不修改生产环境、不写生产 CMS、不操作数据库，不处理 PostgreSQL → Oracle 19c。
- 遵守根目录 `AGENTS.md`，保留用户修改，不泄露 Secret，不使用破坏性 Git 操作。

## Test Workflow

1. 接收 Task ID、Acceptance Criteria、Terra 结果或 diff 和风险重点。
2. 选择与风险匹配的功能、回归、桌面、移动、API、CMS fallback 与边界测试。
3. 保存可复现证据，明确 PASS 或 FAIL。
4. 只向 Sol 交付结果；复测沿用原 Task ID。

## PASS Contract

- Task ID。
- `Result: PASS`。
- Tests performed。
- Regression coverage。
- Remaining risks。

## FAIL Contract

- Task ID。
- `Result: FAIL`。
- Expected 与 Actual。
- Reproduction 与 Evidence。
- Likely affected area。
- Severity。

## Work Log

首次真实参与任务时复制以下模板；复测继续更新原 Task ID。

### XYY-20260821-03

Status: PASS

Test Target: `/product`、`SPECIALTY_LINKS` 的 9 个服务专题页、`/cases`、`/news`、`/senlinqikan`，以及排除范围内的 `/yundao-zhineng-jijian`。

Acceptance Criteria: 共享 CTA 结构与文案、产品页原始文案、页面级 `/contact` 主链接、ARIA 语义与键盘焦点、桌面/移动无横向溢出、旧数字化服务 CTA 保留、无控制台错误。

Tests:

- 独立运行 `npx playwright test tests/e2e/conversion-cta.spec.ts tests/e2e/service-pages.spec.ts tests/e2e/product-motion.spec.ts tests/e2e/service-motion.spec.ts`：13 passed、1 skipped；跳过项为既有服务动效测试在移动项目中的明确配置跳过。
- 独立 Playwright 路由矩阵覆盖 13 条目标路由的 1440×900 与 360×800：HTTP 200、每页恰好 1 个 `[data-conversion-cta]`、1 个 `h2`、1 个 `aside`、3 个列表项、1 个 `/contact`、ARIA 关联、键盘焦点 outline 和无横向溢出全部通过。
- 独立 Playwright 复核 `/yundao-zhineng-jijian`：`.service-cta` 为 1，`[data-conversion-cta]` 为 0。
- 独立 Playwright 采集并人工检查 `/product`、`/xiefu-yuncang`、`/cases`、`/news`、`/senlinqikan` 在桌面与移动端 reveal 完成后的 CTA 截图；左侧转化文案、橙色行动按钮、右侧三条准备信息和移动堆叠布局可读。
- 精确核对 `/product`：标题、说明、`提交仓配需求` 及三条原始准备信息保持一致；`warehouse-cta-heading` 唯一且无重复 ID。
- 全部独立检查页面无 console error 或 page error；`git diff --check` 通过。

Result: PASS

Evidence: 本地隔离站点 `http://127.0.0.1:4401`，Directus 使用不可达地址触发静态 fallback；截图保存在 Git 忽略的 `output/playwright/`。

Regression: 既有 service layout、service motion、product motion 和 service page tests 均通过；服务页原 CTA 保留边界通过。

Risks: CTA 文案当前为静态页面文案；若未来需要 CMS 后台编辑 CTA，需要另行定义数据契约与权限范围。截图检查依赖滚动 reveal 完成后采集，不代表首帧动画状态。

Handoff: 返回 Sol；Task `XYY-20260821-03` 可进入 Nova Review。

#### Re-test after style extraction

Status: PASS

Result: PASS

Tests performed:

- `npx playwright test tests/e2e/conversion-cta.spec.ts --project=chromium --project=mobile`：2 passed。
- 独立 Playwright 复测 `/product`、`/xiefu-yuncang`、`/cases`、`/news`、`/senlinqikan` 的 1440×900 与 390×844 视觉状态；等待 reveal 完成后截图，CTA 背景、栅格/移动单列布局、标题、描述、按钮及三项列表均正常。
- 独立 Playwright 检查 13 条目标路由：均 HTTP 200、恰好 1 个 CTA、无横向溢出、CTA 样式实际生效、无 console/page error。
- 独立复核 `/yundao-zhineng-jijian`：旧 `.service-cta` 为 1，新 `[data-conversion-cta]` 为 0。
- `npm run check:maintainability`：526 files，PASS。
- `git diff --check`：PASS。

Evidence: 新的 `src/styles/conversion-cta.css` 已由 `ConversionCTA.astro` 导入；代表页面 computed background 为 `rgb(240, 241, 239)`，桌面为两列、移动为单列，服务与产品 reveal 后标题 opacity 接近 1。复测截图位于 Git 忽略的 `output/playwright/retest-*`。

Regression coverage: focused CTA spec 的 Chromium/mobile 均通过；路由矩阵、服务页旧 CTA 边界、产品/服务 reveal 和响应式 overflow 均通过。

Remaining risks: 本次只移动不变样式，未扩大到 CMS CTA 数据化；截图验证覆盖 reveal 完成态，不覆盖首帧动画状态。

Handoff: 返回 Sol；返工复测通过，可进入 Nova Review。

### XYY-20260822-01

Status: PASS

Test Target: 测试站 `https://wz.tomatopia.top` 发布 Release `20260821T170201Z-eac6790`。

Acceptance Criteria: 发布身份与健康检查准确；13 条统一 CTA 目标路由在桌面和移动端可访问、CTA 可见且结构正确；无水平溢出、控制台错误或页面错误；`/yundao-zhineng-jijian` 不新增统一 CTA。

Tests:

- 只读 HTTP 验证：`/version` 返回完整 SHA `eac67903d1e65437b74f9b4ee74890dad01e3843`、`releaseId=20260821T170201Z-eac6790`、`environment=staging`；`/healthz` 返回 `status=ok`、`contactStorage=ok`。
- 真实 Chromium 浏览器矩阵：13 条目标路由分别在 1440×900 桌面端和 390×844 移动端检查，共 26/26 通过；每页 HTTP 200、恰好 1 个 `[data-conversion-cta]`、1 个 `/contact` 链接、3 条准备信息、CTA 滚动后可见、桌面双栏、移动单栏、无水平溢出。
- 重点页面 `/product`、`/xiefu-yuncang`、`/cases`、`/news`、`/senlinqikan` 完成桌面/移动截图检查；代表性桌面计算列为 `746.875px 497.922px`，移动为 `366px`。
- 排除边界 `/yundao-zhineng-jijian`：HTTP 200，`[data-conversion-cta]` 为 0，既有 `.service-cta` 为 1；无 console/page error。
- 26 次目标路由检查及排除页检查均未发现 console error 或 page error。

Result: PASS

Evidence: 截图保存在 Git 忽略的 `output/playwright/staging-*.png`；发布脚本内部 `CI=1` 门禁由 Sol 提供的发布证据为 45 个 Vitest 文件/292 项通过、39 项 E2E 通过、7 项跳过、3 项正式契约通过，构建通过，外部健康与版本核对通过且未回滚。

Regression: 覆盖统一 CTA 的 13 条目标路由、桌面/移动响应式结构、联系入口、准备信息行数、无溢出、渲染错误和排除页面边界；未执行 CMS 写入、表单提交或生产环境操作。

Remaining risks: 本次为发布后只读验收；CTA 文案仍为静态页面内容，未来若需要 CMS 编辑需另行定义数据契约与权限范围。截图检查覆盖滚动后的 CTA 可见态，不覆盖动画首帧。

Handoff: 返回 Sol；Task `XYY-20260822-01` 测试站发布后验收通过，可完成最终验收与状态同步。

#### Re-test after Nova formatting review

Status: PASS

Test Target: Terra 对 `tests/unit/image-cache-contract.test.ts` 的 Prettier 格式修复。

Tests performed:

- Diff 核对：仅将 `readProjectFile` 的单行表达式拆为两行；无断言、测试行为或应用代码变化。
- `npm run format:check`：通过，所有匹配文件均符合 Prettier 格式。
- `npx vitest run tests/unit/image-cache-contract.test.ts`：1 个测试文件、8 项测试通过，耗时 319ms。
- `git diff --check`：通过。

Result: PASS

Regression coverage: 覆盖 Nova 指出的 GitHub CI 格式门禁和受影响图片缓存契约测试；本次变更为纯格式调整，不改变发布代码或测试语义。

Remaining risks: 无新增功能风险；完整发布门禁由 Sol 按流程决定是否重新执行。

Handoff: 返回 Sol；Task `XYY-20260822-01` 的格式阻塞已通过独立复测，可进入最终 Review/同步。

#### Re-test after staging release 539bfd4

Status: PASS

Test Target: 测试站 `https://wz.tomatopia.top` 当前发布 Release `20260821T235850Z-539bfd4`。

Tests performed:

- 只读 HTTP 验证：`/version` 返回完整 SHA `539bfd44c05d81b5b7a1246cb009beec4c58f4c1`、`releaseId=20260821T235850Z-539bfd4`、`environment=staging`、`cmsSchemaVersion=2026-08-cms-hardening`；`/healthz` 返回 HTTP 200、`status=ok`、`contactStorage=ok`。
- 真实 Chromium 矩阵：13 条目标路由分别在 1440×900 桌面端和 390×844 移动端检查，共 26/26 通过；每页 HTTP 200、恰好 1 个 `[data-conversion-cta]`、1 个 `/contact` 链接、3 条准备信息、CTA 滚动后可见、无水平溢出。
- 响应式结构：桌面端 13/13 为双栏，代表性计算列 `746.875px 497.922px`；移动端 13/13 为单栏，代表性计算列 `366px`。
- 排除边界 `/yundao-zhineng-jijian`：HTTP 200，统一 CTA 为 0，既有 `.service-cta` 为 1。
- 26 次目标路由检查及排除页检查均未发现 console error 或 page error；当前 Release 截图保存在 Git 忽略的 `output/playwright/staging-*-539bfd4.png`。

Result: PASS

Regression coverage: 覆盖当前目标 SHA 的发布身份、健康状态、13 条 CTA 路由桌面/移动布局、联系入口、准备信息、无溢出、渲染错误和排除页面边界；未执行 CMS 写入、表单提交或生产环境操作。

Remaining risks: 本次为发布后只读验收；CTA 文案仍为静态页面内容，未来如需 CMS 编辑需另行定义数据契约与权限范围。截图检查覆盖滚动后的 CTA 可见态，不覆盖动画首帧。

Handoff: 返回 Sol；Task `XYY-20260822-01` 当前 staging Release 已通过独立发布后复验，可完成最终验收与状态同步。

### XYY-20260824-01

Status: FAIL

Test Target: XYY-WEB `/api/contact` → XYY-xiansuo `/api/integrations/website-leads`，包括两端鉴权、字段映射、owner 控制、手机号/座机、duplicate、事务、健康检查、失败语义、客户端边界和回归门禁。

Acceptance Criteria: 独立 Integration Bearer Token；官网浏览器只调用 `/api/contact`；XYY-WEB 保留现有 body/content-type/rate-limit/honeypot/privacy/phone/email 校验并以有限超时失败关闭；XYY-xiansuo 正确映射并服务端控制 owner/created_by，duplicate 不重复插入且不返回 500；Directus CMS health 与 Xiansuo contact health 分离；不泄露 Secret，不修改 Oracle/SQLite Schema，不双写。

Tests:

- `/home/yj/xiansuo/server`：`npm run build` 通过；`npm test` 通过，178 tests passed、0 failed。
- `/home/yj/XYY-GEO/website`：`npm run verify` 通过，46 test files、305 tests passed；typecheck、lint、maintainability、assets、Astro build 均通过。
- XYY-WEB 临时 Playwright 配置位于 `/tmp/xyy-luna-playwright.config.ts`，使用绝对 `testDir`、仓库 `webServer`（显式 cwd）和 `/usr/bin/google-chrome`；E2E `39 passed / 7 skipped`。桌面与移动项目均实际执行；跳过项为仓库既有移动项目配置的明确 skip。
- XYY-WEB formal 临时配置 `/tmp/xyy-luna-formal.config.ts` 使用同一系统 Chrome；formal `3 passed`。
- 独立 Xiansuo route 注入矩阵覆盖无 Authorization、非 Bearer、错误 Token、员工 JWT、正确 Token、短 Token、缺失/无效 owner、非法/超长/null payload、手机号、座机、字段映射、伪造 owner/created_by、格式变体 duplicate、lead+audit rollback 和员工 GET `/api/leads` JWT 语义；仓库集成测试全部通过。
- 独立源码/配置检查确认浏览器没有直接调用 `xs.tomatopia.top`；XYY-WEB 仅在服务端 storage 使用 `XIANSUO_API_URL`；health 同时要求 `cmsContent` 与 `contactStorage`；diff 中未发现真实 Secret、Oracle/数据库迁移或双写。
- `git diff --check`：XYY-WEB 与 XYY-xiansuo 均通过。

Result: FAIL

Expected: Integration API 在非 duplicate 的数据库/审计异常时返回不泄露内部错误细节的稳定 500 包络。

Actual: 直接将 `websiteLeadIntegrationRoutes` 注册到默认 Fastify 实例（未附加应用级错误处理器）后，审计触发器 `RAISE(ABORT, 'SQLITE_CONSTRAINT secret-detail')` 使合法 POST 返回 HTTP 500，响应体为 `{"statusCode":500,"code":"ERR_SQLITE_ERROR","error":"Internal Server Error","message":"SQLITE_CONSTRAINT secret-detail"}`，泄露 SQLite 错误详情。

Reproduction: 在隔离临时 SQLite 中建立 `audit_logs` 的 `BEFORE INSERT` 触发器，调用带正确随机 Integration Token 的合法 `/api/integrations/website-leads` 请求；未修改仓库测试或业务代码。当前 `src/index.ts` 的完整 `buildApp()` 确有统一 `setErrorHandler`，生产组装路径返回 generic `{code:1,msg:'服务器内部错误',data:null}`，但 route 本身在默认 Fastify 注册方式下仍可泄露，属于接口局部安全缺口。

Evidence: 临时 probe 输出 `status=500`、`leaksSecret=true`、`leaksSqlite=true`；相关实现为 `server/src/routes/website-leads.ts` 的事务 catch 在非 duplicate 异常处 `throw error`，完整应用级 handler 位于 `server/src/index.ts`。

Likely affected area: XYY-xiansuo Integration API 的非唯一数据库异常、审计写入异常或未来任何未预期异常；官网端会将下游 500 转为通用失败，但直接 API 调用方可看到内部错误。

Severity: HIGH（客户线索 Integration API 的错误响应可能泄露数据库实现细节；当前完整生产组装路径有缓解，但路由缺少局部 fail-closed 保证）。

Regression: 业务功能、Auth、payload、字段/owner/duplicate/事务、员工 JWT、官网 contact 安全校验、CMS fallback、桌面/移动浏览器、formal、health contract 和两仓库 build/verify 均通过；FAIL 仅来自上述独立错误泄露 probe。

Remaining risks: Terra 需在原 Task ID 下修复 Integration route 的非 duplicate 异常响应并补充断言；随后 Luna 必须重新执行相关 Xiansuo tests、XYY-WEB verify、错误语义 probe 和必要浏览器回归。未执行部署、生产环境修改、CMS 写入、数据库迁移、push 或 merge。

Handoff: 返回 Sol；`XYY-20260824-01` 保持 FAIL，按 `Luna → Sol → Terra → Sol → Luna Re-test` 闭环，不进入 Nova Review。

#### Re-test after Integration error-envelope fix

Status: PASS

Test Target: Terra 对 XYY-xiansuo `server/src/routes/website-leads.ts` 非 UNIQUE 异常 catch 的固定 500 响应，以及同一 Task 的 duplicate、事务回滚和官网回归门禁。

Tests performed:

- Diff 核对：XYY-xiansuo 本次实现变更仅为 Integration route 的 rollback 后固定返回和对应测试断言；官网业务实现文件未在此次返工中改变，Sol 另行修正了一处 README 历史说明。用户 `.codex/config.toml` 与其他已有改动保留。
- 独立复现原失败：在临时 SQLite `audit_logs` trigger 中执行 `RAISE(ABORT, 'SQLITE_CONSTRAINT secret-detail')`，直接注册 `websiteLeadIntegrationRoutes` 的默认 Fastify 实例调用合法请求，得到 HTTP 500，响应体严格为 `{"code":1,"msg":"线索接收失败","data":null}`。
- 敏感响应检查：响应不含 `error`、`message`、`stack`、`SQLITE`、`secret-detail`、Integration Token、手机号或其他客户字段；审计异常后 `leads` 对应手机号计数为 0，确认 rollback。
- 独立 duplicate 复测：先提交 `13700137000`，再提交格式变体 `137 0013-7000`；两次均为 HTTP 200，第二次为 `{code:0,msg:"线索已存在",data:{duplicate:true}}`，数据库仍只有 1 条。
- `/home/yj/xiansuo/server`：`npm run build` 通过；`npm test` 178 tests passed、0 failed。
- 两仓库 `git diff --check`：通过。

Result: PASS

Regression coverage: 原 Luna PASS 中的 XYY-WEB `verify`（46 files / 305 tests）、XYY-WEB E2E（39 passed / 7 skipped，桌面/移动系统 Chrome）、formal（3 passed）、Auth/payload/owner/映射/手机号/座机/duplicate/员工 JWT/health/Secret/Oracle 边界证据仍适用；Xiansuo 全量复测再次通过。官网 contact storage 与浏览器调用边界未在 Terra 返工中改变。

Remaining risks: 本次只完成本地实现与验证；双方生产环境变量、部署和真实端到端联调仍未执行。Integration API 仍应通过完整 `buildApp()` 运行，不能脱离仓库统一 Fastify 错误配置单独暴露；本复测已确认 route 自身也 fail-closed。

Handoff: 返回 Sol；`XYY-20260824-01` 的 Luna 安全阻塞已关闭，结果为 PASS，可进入 Nova Review。未部署、未修改生产环境、未执行 CMS/数据库迁移、未 push/merge。

#### Re-test after Nova Review: production configuration and documentation contract

Status: PASS

Test Target: Nova 指出的生产 Web 环境模板/prepare/deploy 一致性、XYY-xiansuo PM2 环境透传、隔离加载测试，以及历史 `contact_leads` 保留与当前不新写/不迁移文档契约。

Tests performed:

- Web 正式模板 `deploy/production/web/web.env.example`、`deploy/production/web/prepare-web-server.sh`、`scripts/deploy.sh` 一致要求 `DIRECTUS_CONTENT_TOKEN`、HTTPS `XIANSUO_API_URL` 和 `XIANSUO_INGEST_TOKEN`；均不再把 `DIRECTUS_CONTACT_TOKEN` 或 legacy `DIRECTUS_TOKEN` 作为 Web runtime 前置条件。
- 模板只包含非真实 placeholder；`XIANSUO_INGEST_TOKEN` 为空，未发现真实 Secret。`bash -n deploy/production/web/prepare-web-server.sh`：PASS，未执行脚本、root 操作或部署。
- `tests/unit/production-web-contact-config.test.ts` 已纳入 Website verify，断言模板、prepare、root deploy 三者契约一致及旧联系令牌/fallback 缺失。
- Xiansuo `deploy/ecosystem.config.cjs` 显式透传 `WEBSITE_LEAD_INGEST_TOKEN`、`WEBSITE_LEAD_OWNER_ID`，无默认值；`server/test/deploy-ecosystem.test.ts` 使用随机临时 token、隔离 `XIANSUO_SERVER_DIR`，恢复环境变量与 `require.cache`，未调用 PM2。该测试在全量测试中通过。
- `README.md`、`deploy/production/web/README.md` 和 `docs/CMS_CONTENT_MODEL.md` 明确：历史 Directus `contact_leads` 保留；当前 Web 不新写、不迁移、不双写；新留言走 XYY-xiansuo；health 分离为 `cmsContent` 与 `contactStorage`。Sol 的当前任务措辞修订不改变该客观边界。
- Website：`npm run verify` 通过，47 test files、306 tests，Astro build/typecheck/lint/maintainability/assets 均通过；`npm run format:check` 通过。
- Xiansuo：`npm run build && npm test` 通过，179 tests passed、0 failed。
- 两仓库 `git diff --check`：PASS。
- 前轮浏览器 runtime 未改变；此前使用系统 Chrome 的 E2E `39 passed / 7 skipped`（桌面/移动）及 formal `3 passed` 证据继续适用，本轮未机械重跑。

Result: PASS

Regression coverage: 覆盖 Nova 指出的三项阻断：生产 Web 三处配置契约、Xiansuo PM2 实际环境透传与隔离恢复、CMS 历史线索保留/当前不写不迁移/health 分离文档；同时覆盖两仓库格式、类型、构建、单元测试和 diff 门禁。未执行 PM2、部署、生产环境、CMS 写入、数据库迁移、push 或 merge。

Remaining risks: 真实生产 token、有效 `WEBSITE_LEAD_OWNER_ID` 和双方运行环境仍需未来经授权配置；本次只验证模板、代码和测试，不代表生产已切换。

Handoff: 返回 Sol；Nova 指出的配置/文档阻断已通过独立复测，`XYY-20260824-01` 的 Luna 结果为 PASS，可进入 Nova Re-review。

### XYY-20260824-02

Status: FAIL

Risk: HIGH

Test Target: 发布后 `xs.tomatopia.top` Xiansuo、`wz.tomatopia.top` staging Web、真实浏览器联系表单端到端链路，以及正式主站只读完整性。

Tests performed:

- XYY-xiansuo public checks：`https://xs.tomatopia.top/` HTTP 200；`/api/health` HTTP 200；Integration health with server-side token HTTP 200、`code=0`、`data.status=ok`；Integration health without Authorization HTTP 401；伪造员工 JWT HTTP 401；员工 `/api/leads` without Authorization HTTP 401。
- Xiansuo systemd：`xiansuo-api.service` 为 `active/running`，`NRestarts=0`；未执行 PM2、部署或生产写入。
- Website staging：`/version` 返回 `gitSha=4c1f31346ebe19664bccfec13d69841bd31a5e4e`、`releaseId=20260824T090653Z-4c1f313`、`environment=staging`；`/healthz` 返回 `status=ok`、`cmsContent=ok`、`contactStorage=ok`。
- 主站只读 SHA：主页 `45291ef9c7c8ab1751a7747469f701a073db64236abc9acc51fea45d64ed291e`；robots `1a3b3749ed2976e528adbe550381110e98f669decc0d3f5e6043ac05f2e026ee`，均与验收基线一致；未提交主站表单。
- 只读 SSH SQLite 核对：配置 owner 为 `2`；当前已存在的 direct smoke lead ID 8 为测试数据，但手机号为 `01000000001`。查询本 Task 要求的规范化手机号 `01000000002` 返回不存在，未发现本次要求的第二条测试线索。
- Git：任务开始时仅有用户已有 `.codex/config.toml` 修改；未修改业务代码、生产配置、CMS、数据库或 Secret。`git diff --check` 已通过。

Result: FAIL

Expected: 使用真实 Chrome UI 打开 `https://wz.tomatopia.top/contact`，提交手机号 `010-00000002` 的受控测试留言两次，并获得两次 UI 成功后再做 Xiansuo SQLite 字段/duplicate/audit 核对。

Actual: Chrome 扩展浏览器在两种真实 UI 操作路径均无法加载 staging 联系页：`tab.goto('https://wz.tomatopia.top/contact')` 两次各超时约 30 秒；认领现有 Chrome 空白标签后再次导航仍超时，标签保持 `about:blank`。因此没有实际提交表单，也没有创建本 Task 的测试 lead；不能将 HTTP/SSH 只读结果冒充 UI PASS。

Reproduction: 通过 browser skill 连接 Chrome，创建/认领 `about:blank` 标签后导航到 `https://wz.tomatopia.top/contact`；两次 `goto` 均在 30 秒超时。内置浏览器表面不可用，未切换到 curl 或其他自动化方式代替 UI 操作。

Evidence: 浏览器导航失败；SQLite 只读查询 `phone='0100000002'` 返回 `lead=null`；现有 ID 8 的手机号为 `01000000001`，不是本 Task 要求的 `010-00000002`。发布版本、健康、鉴权和主站 SHA 只读检查均通过。

Likely affected area: 当前 Chrome 扩展/浏览器控制环境与 staging 页面导航，不是已验证的应用发布版本或 Integration API；无法据此判断真实 UI 表单提交、浏览器请求仅到 Web、桌面/移动 UI 提交结果。

Severity: HIGH（用户明确要求的真实 UI 端到端验收未完成；不得以服务端 smoke 替代）。

Remaining risks: 未验证第二条受控线索的字段映射、duplicate 不覆盖、无 follow-up、audit、Directus 中不存在该 phone，以及桌面/移动真实 UI 的控制台/网络请求证据。当前未产生新的测试线索，无需清理。

Handoff: 返回 Sol；`XYY-20260824-02` 保持 FAIL。需恢复可用浏览器控制后沿用同一 Task ID 重试 UI 表单；未部署、未写生产 CMS、未操作 Oracle、未 push/merge。

#### Re-test: real Playwright UI after browser-control failure

Status: PASS

Test Target: 使用独立 Playwright CLI Chromium session `luna-task02-retest-headless` 复测 `https://wz.tomatopia.top/contact` 桌面/移动 UI、两次相同手机号提交、浏览器网络边界，以及 Xiansuo staging 数据落库。

Tests performed:

- 真实 Playwright CLI：`bash /home/yj/.codex/skills/playwright/scripts/playwright_cli.sh --session luna-task02-retest-headless open https://wz.tomatopia.top/contact`；headed 模式因当前会话无 X server 不可用，改用同一真实 Chromium 的 headless UI session，未改仓库 Playwright 配置。
- 桌面表单实际填写并提交两次：姓名 `STAGING E2E 测试`、电话 `01000000002`、公司 `XYY-STAGING-DO-NOT-FOLLOW`、邮箱 `test@example.test`、服务“其他”、受控 E2E message、隐私同意。两次页面均显示“提交成功！商务团队将根据您的需求与您联系”。
- Playwright `requests` 记录两次均为 `POST https://wz.tomatopia.top/api/contact => 200 OK`；未出现浏览器直连 `xs.tomatopia.top`，未出现其他 contact 目标。`console`：0 messages，Errors 0，Warnings 0。
- 移动 viewport `390x844` 真实打开 contact 页面；表单、提交按钮和移动导航均可见，点击“打开菜单”后出现“移动端导航”及全部主要入口；保存了 snapshot 与 screenshot：`.playwright-cli/page-2026-08-24T09-33-48-737Z.yml`、`.playwright-cli/page-2026-08-24T09-34-00-265Z.png`、`.playwright-cli/page-2026-08-24T09-34-09-515Z.yml`。
- 只读 SSH SQLite：测试线索唯一为 ID `9`（TEST ONLY / DO NOT FOLLOW），`phone=01000000002`，`contact_name`、`company_name`、`source=官网留言`、`status=新线索`、`intent_level=未知`、`lead_date=2026-08-24`、`owner_id=2`、`created_by=2` 均正确；`demand_note` 完整保留受控 message，`source_note` 包含 `咨询服务：other` 与 `邮箱：test@example.test`。
- 同号第二次提交未覆盖原记录：`leads` count=1；`audit_logs` 仅有该 lead 的一条 `create`（`user_id=2`、`source=website_integration`）；`follow_ups` 为空。未删除或修改任何记录。
- staging Directus `contact_leads` 只读查询返回 HTTP 403（当前内容 Token 无权读取该历史私有集合），未执行写入/删除/迁移；因此不能以无权限响应冒充记录不存在，但 Xiansuo 唯一测试线索与浏览器证据均已核对。
- Xiansuo 公开 H5 根页面 HTTP 200、`/api/health` HTTP 200；Integration health 正确服务 Token HTTP 200，缺失 Authorization HTTP 401，伪造员工 JWT HTTP 401；员工 `/api/leads` 无认证 HTTP 401。staging `/version` 为 SHA `4c1f31346ebe19664bccfec13d69841bd31a5e4e`、release `20260824T090653Z-4c1f313`，`/healthz` 为 `cmsContent=ok/contactStorage=ok`。
- 正式主站只读 SHA 仍为主页 `45291ef9c7c8ab1751a7747469f701a073db64236abc9acc51fea45d64ed291e`、robots `1a3b3749ed2976e528adbe550381110e98f669decc0d3f5e6043ac05f2e026ee`；未提交主站表单。前轮 Xiansuo `build + test`、Website `verify`、正式 E2E/formal 和安全边界证据未因本次 UI-only 重试而改变，继续适用。
- 两仓库 `git diff --check`：通过；Xiansuo 工作树无新修改，Website 仅保留用户 `.codex/config.toml` 与本工作账改动。未输出或提交 Secret，未触碰 Oracle、生产 CMS、生产数据库、部署、PM2、push 或 merge。

Result: PASS

Regression coverage: 关闭初轮浏览器控制通道 FAIL；完成真实桌面两次 UI 提交、移动页面可用性、浏览器仅调用 Web `/api/contact`、Xiansuo duplicate/字段/owner/audit/follow-up 只读核验，并复核发布版本、健康、鉴权和正式主站完整性。

Remaining risks: staging Directus `contact_leads` 当前 Token 无读取权限（HTTP 403），无法从该接口直接证明该 phone 的历史集合记录数；本次未扩大权限。测试线索 ID 9 必须保留并标记 TEST ONLY / DO NOT FOLLOW。真实生产配置、生产提交和生产数据仍未在本次执行。

Handoff: 返回 Sol；同一 Task ID `XYY-20260824-02` 的发布后独立 QA 复测 PASS，可进入 Sol Final Acceptance。测试线索 ID 9：TEST ONLY / DO NOT FOLLOW。

#### No Double Write supplement

Status: PASS

Independent evidence:

- 检查 `/tmp/xyy-staging-directus-readonly.sh`：脚本只读取 `/var/www/xyy-cms/.env` 以供连接，设置运行时 `PGPASSWORD`，执行 `BEGIN TRANSACTION READ ONLY`、单条 `contact_leads` 规范化手机号计数查询和 `COMMIT`；不含写入、删除、迁移命令，不输出凭据。
- 通过 SSH 独立执行该脚本，实际输出事务边界与计数 `0`：Directus staging `contact_leads` 中不存在 `01000000002`。API 403 后未扩大 Token 权限。
- 通过只读 SQLite 独立复核 Xiansuo `phone=01000000002` 的 `leads` count=`1`。未执行删除、更新或其他数据库写操作。

Result: PASS

No Double Write: 对本次受控线索，Directus=0、XYY-xiansuo=1，符合新留言唯一登记目标；Oracle/Directus 历史数据未迁移或修改。

Handoff: 返回 Sol；`XYY-20260824-02` 的 No Double Write 补证完成，最终 QA 仍为 PASS。

### XYY-20260824-03

Status: PASS

Test Target: `wz.tomatopia.top` 联系表单经 staging `/api/contact` 和服务端 HTTPS Integration 写入 XYY-xiansuo `leads` 的真实路径。

Acceptance Criteria: 表单成功；浏览器 staging `/api/contact` 请求成功；XYY-xiansuo 中出现且仅出现本次测试线索；联系人、来源、状态及 `[XYY PATH TEST]` 标记一致。

Tests: 独立只读检查 Playwright 提交后快照、网络 trace、控制台/page error 与截图；只读查询 XYY-xiansuo live SQLite 中规范化电话、姓名和需求标记的唯一记录，并复核 audit 和 follow-up。

Result: PASS

Evidence: 页面显示提交成功；trace 仅有一次 `POST https://wz.tomatopia.top/api/contact`，HTTP 200，无浏览器直连 Xiansuo、无控制台或页面错误。线索 ID 10 唯一匹配，`contact_name=Codex路径测试-请勿跟进`、`source=官网留言`、`status=新线索`，`demand_note` 包含 `[XYY PATH TEST]`；对应一条 website Integration create audit，无 follow-up。

Regression: 本任务只验证指定路径，未重新提交表单，未访问 `56xyy.com`，未写 CMS/数据库，未修改应用、配置或生产基础设施。

Risks: 无阻断；证据来自 Sol 本次真实浏览器会话和 Luna 的独立只读远端复核。

Handoff: 返回 Sol；路径验证 PASS，可最终关闭 `XYY-20260824-03`。
