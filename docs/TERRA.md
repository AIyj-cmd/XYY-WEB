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

### XYY-YYYYMMDD-NN

Status:

Task:

Scope:

Implementation:

Changed Files:

Validation:

Risks:

Handoff:
