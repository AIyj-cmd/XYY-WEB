# Sol

XYY-WEB 产品管理、Agent 调度与 Obsidian 项目入口。

导航： [Terra 实现记录](TERRA.md) · [Luna 测试记录](LUNA.md) · [Nova Review 记录](NOVA.md) · [项目当前状态](../DEV_STATE.md) · [协作规则](../AGENTS.md)

## Project

XYY-WEB 已运行于正式环境，当前处于稳定维护阶段。仓库根目录同时作为 Obsidian Vault；Obsidian 只负责阅读、导航、关联和管理现有 Markdown，不建立第二套项目数据库。

| Authority                       | Purpose               |
| ------------------------------- | --------------------- |
| [AGENTS.md](../AGENTS.md)       | 怎么工作、Agent 层级、风险和生产边界 |
| [DEV_STATE.md](../DEV_STATE.md) | 项目当前客观状态的唯一实时记录       |
| `docs/SOL.md`                   | Sol 的产品管理、调度、决策与工作日志  |
| [TERRA.md](TERRA.md)            | Terra 实现记录            |
| [LUNA.md](LUNA.md)              | Luna 独立测试记录           |
| [NOVA.md](NOVA.md)              | Nova 质量与架构 Review 记录  |

## Current State

- 主站已正式运行；日常 Agent Scope 不包含部署、生产 CMS、数据库、DNS、TLS、Nginx 或 PM2。
- 当前客观状态以 [DEV_STATE.md](../DEV_STATE.md) 为准，协作方式以 [AGENTS.md](../AGENTS.md) 为准。
- Sol / Terra / Luna / Nova 多代理体系已启用；所有调度、失败和返工回到 Sol。
- 仓库根目录已作为 Obsidian Vault 正常加载；`docs/SOL.md` 是项目管理入口。
- 官网线索 Integration 已在 XYY-xiansuo 正式服务与 XYY-WEB staging 激活并通过真实 E2E；`56xyy.com` 主站未切换，仍保持原运行版本。
- XYY-xiansuo 已发布服务码中文显示版本 `a5f82b9`；staging 真实表单验证确认“来源细分”写入“鞋服云仓”，不再显示 `cloud-warehouse`。
- 服务专题页 Seed 结构修复已进入 GitHub `main`，staging Release `20260830T100940Z-82c01ed` 已验证 9 页结构和图片；正式主站 CMS 因当前无有效管理凭据尚未定向 apply，不能视为已修复。

## Current Tasks

| Task | Risk | Owner | Status |
| --- | --- | --- | --- |
| XYY-20260831-02 | HIGH | Sol | CLOSED |
| XYY-20260830-01 | HIGH | Sol | BLOCKED |
| XYY-20260825-04 | HIGH | Sol | CLOSED |
| XYY-20260825-03 | LOW | Sol | CLOSED |
| XYY-20260825-02 | HIGH | Sol | CLOSED |
| XYY-20260825-01 | MEDIUM | Sol | CLOSED |
| XYY-20260824-04 | HIGH | Sol | CLOSED |
| XYY-20260824-03 | LOW | Sol | CLOSED |
| XYY-20260824-02 | HIGH | Sol | CLOSED |
| XYY-20260824-01 | HIGH | Sol | CLOSED |
| XYY-20260822-01 | HIGH | Sol | CLOSED |
| XYY-20260821-03 | MEDIUM | Sol | CLOSED |
| XYY-20260821-02 | LOW | Sol | CLOSED |

## Priorities

1. 保持正式站稳定，不从历史 TODO 自动恢复生产或数据库工作。
2. 只处理真实需求、故障、风险或明确授权的改动。
3. 保持 Task ID、Scope、Acceptance Criteria、验证证据和工作日志连续。

## Agent Team

| Agent | Responsibility | Work Log |
| --- | --- | --- |
| Sol | 产品管理、任务规划、Scope、风险、调度与最终验收 | 本页 |
| Terra | 全栈实现，只执行 Sol 明确 Scope | [TERRA.md](TERRA.md) |
| Luna | 独立测试，只向 Sol 报告 PASS/FAIL | [LUNA.md](LUNA.md) |
| Nova | 质量、架构、安全与契约 Review | [NOVA.md](NOVA.md) |

子代理不得互相调度；所有失败、冲突、返工和升级返回 Sol。

## Workflow

Sol 的角色是 Product Manager / Orchestrator / Task Planner / Scope Controller / Risk Classifier / Final Acceptance Owner。模型为 `gpt-5.6-sol`，推理等级为 `xhigh`。

- 理解用户需求并检查项目当前状态，判断任务是否值得执行。
- 创建 Task ID，定义 Scope、Acceptance Criteria 和风险等级。
- 决定是否调度 Terra、Luna、Nova，并接收所有失败、返工、冲突和升级。
- 按风险流程完成最终验收，更新必要工作日志和 `DEV_STATE.md`。
- Sol 原则上不修改业务代码；业务实现默认交给 Terra。
- Sol 可直接修改 Markdown、Agent 配置、流程文档、状态记录和 Agent 任务记录。
- 未经用户明确授权，不部署、不写生产 CMS、不操作数据库，不处理 DNS、TLS、Nginx、PM2 或 PostgreSQL → Oracle 19c。
- 不从历史 TODO 自动恢复已退出当前范围的生产或数据库工作。

1. 读取 `AGENTS.md`、`DEV_STATE.md`、本文件及任务相关上下文。
2. 创建 `XYY-YYYYMMDD-NN` Task ID，记录 Scope、Acceptance Criteria、风险与排除项。
3. 向所需 Agent 提供最小充分上下文和明确输出合同。
4. Terra 完成后回 Sol；Sol 再派 Luna，不允许 Terra 直接派 Luna。
5. Luna FAIL 时沿用 Task ID 返回 Terra 修复并复测；PASS 后按风险决定是否派 Nova。
6. Nova REJECTED 时沿用 Task ID 返回 Terra，随后重新经过 Luna 和 Nova。
7. Sol 核对 Acceptance Criteria、验证证据、剩余风险和授权边界后最终验收。
8. 更新四本工作账中的实际参与记录；只有客观项目状态变化才更新 `DEV_STATE.md`。

### Risk Classification

- `LOW`：小文案、小 CSS、简单 UI、很小的局部修复。流程：Sol → Terra → Luna → Sol；产品治理任务可由 Sol 直接完成。
- `MEDIUM`：页面或组件逻辑、API、CMS 查询、表单、重要业务行为。流程：Sol → Terra → Luna → Nova → Sol。
- `HIGH`：安全、Auth、核心数据契约、Server 核心逻辑、跨模块架构、高影响公共逻辑。流程：Sol → Terra → Luna → Nova → Sol，必要时等待用户决策。

高风险不等于生产授权；任何生产动作仍需用户明确要求。

## Decisions

- `XYY-20260831-02` 将 News 公开可见性从数据库适配层的 `$NOW` 比较改为应用侧统一时间解析：无时区 Directus 时间按 `Asia/Shanghai` 解释，带 offset 时间按绝对时刻解释，先过滤未来文章再排序分页。批量发布只开放固定的服务端 `POST /api/integrations/news/batch`，由独立调用 Token 鉴权并使用独立 Directus News 写 Token；三个运行 Token 必须完整、足够长且两两不同。当前只完成本地代码验收，未创建 Secret/权限、未写 CMS、未部署，不能视为生产接口已启用。
- `XYY-20260830-01` 修复 CMS Seed 生成器遗漏 `stats` / `features` 的根因，并用独立 dry-run-first 工具只处理仓配下拉菜单的 9 条 `service_pages`、只允许 `stats` / `features` / `img_src` 三字段。测试站先发布和零差异验证；正式主站不部署前端、不重置 CMS，只在有效管理入口可用时备份后定向 apply。当前正式 Token 校验失败，因此任务保持 `BLOCKED`，不冒充生产内容已修复。
- `XYY-20260825-02` 仅发布已在上一 Task 验收的 XYY-xiansuo 两文件服务标签修复，并从既有 XYY-WEB staging 做真实表单 E2E；Web 应用无需重复发布，`56xyy.com`、Oracle、Directus、生产环境变量和数据库结构均不变。生产使用可审计的不可变 release，保留旧 release 与 unit 备份作为回滚目标。
- `XYY-20260825-01` 保持 XYY-WEB 传输稳定服务代码，在 XYY-xiansuo website lead Integration 构造 `source_note` 时转换为中文标签；未知或自定义值必须原样保留，不修改数据库、历史线索或官网表单契约。本次只完成本地实现与验收，未部署。
- `XYY-20260824-02` 仅将已验收 Integration 发布到 `xs.tomatopia.top` 与 XYY-WEB 测试站 `wz.tomatopia.top`，严格按 Xiansuo → 基础验证与直接 smoke → Web staging → 浏览器 E2E 顺序执行；`56xyy.com`、Oracle、Directus Schema 和历史 `contact_leads` 不在发布范围。真实 Token 只在受控运行环境中生成和传递，不进入 Git、Markdown、日志或 Agent 报告。
- `XYY-20260824-01` 将官网联系留言的唯一新登记目标从 Directus `contact_leads` 切换为 XYY-xiansuo 专用 Server-to-Server Integration API；历史 Directus / Oracle 数据保留且不迁移、不删除、不双写。浏览器继续只调用 `/api/contact`；机器身份使用独立 Bearer Token，负责人由 XYY-xiansuo 服务端配置并校验。Directus 继续承担 CMS 内容职责，健康检查必须区分 CMS 内容依赖与 Xiansuo contact storage。
- `XYY-20260822-01` 获得用户明确授权，将当前已验收的 Agent/Obsidian 治理配置与多页面 CTA 改动提交并推送到 GitHub，并通过现有原子发布脚本部署到测试站；正式主站、CMS 写入、数据库和生产配置不在 Scope。当前位于默认分支，按 GitHub 工作流先使用功能分支管理提交，通过门禁后再无冲突快进同步 `main`。
- `XYY-20260821-03` 统一仓配下拉菜单中的 9 个服务专题页与合作案例、行业动态、森林期刊栏目首页的底部转化区域；使用共享组件复用仓配页视觉结构，各页面保留与内容语义匹配的标题和行动文案。详情页、首页、关于页及不在仓配下拉菜单中的数字化页面不在本次 Scope。
- Sol 是当前 Codex 主 Session，不创建 `sol.toml`。
- 子代理并发上限为 3；正常业务任务按有序流水线运行，不默认并行写代码。
- 模型映射：Sol=`gpt-5.6-sol`，Terra=`gpt-5.6-terra`，Luna=`gpt-5.6-luna`，Nova=`gpt-5.6-sol`。
- 项目级 `.codex/` 仅在 Codex 将仓库标记为可信时加载。
- 当前已打开的主 Session 不热加载新 Agent 类型；新 Session 已实际 spawn 并识别 `terra`、`luna`、`nova`。
- 仓库根目录是唯一 Obsidian Vault；不复制 Markdown，不建立 `docs/XYY-WEB/` 或第二个 Dashboard。
- Obsidian 第一阶段仅使用 Core Plugins 和普通 Markdown，不安装社区插件。
- 共享 Vault 配置进入 Git，设备窗口布局、移动端布局和缓存留在本地。

## Dispatch Log

### XYY-20260831-02

- Risk: HIGH；涉及 News 公开时间契约、新增服务端写入 API、机器身份鉴权和 Directus 内容写入边界，但不包含生产配置、CMS 数据写入、Schema、部署或 Git 操作。
- Terra 完成时区可见性与批量发布实现；Luna 首轮发现非法日期归一化、三 Token 隔离不完整和无效 Directus ID false success 并 `FAIL`，Sol 沿用原 Task ID 返回 Terra 修复，Luna Re-test `PASS`。
- Nova 首轮发现非回环明文 HTTP 可能发送 Directus 写 Token 并 `REJECTED`；Terra 最小收紧为远端仅 HTTPS、HTTP 仅明确 loopback，Luna 再次 Re-test `PASS`，Nova Re-review 最终 `APPROVED`。
- 最终验证为聚焦 5 files / 90 tests、完整 `npm run verify` 51 files / 384 tests、format 与 `git diff --check` 通过；客户端构建产物无 Secret。没有部署、生产环境、CMS、数据库、Oracle、提交、推送或合并动作。

### XYY-20260830-01

- Risk: HIGH；涉及 CMS Seed/reset 根因、正式内容三字段修复和 9 次非事务 Directus PATCH，但不涉及 Schema、数据库、Oracle、主站应用部署或 CMS 重置。
- Terra 完成 Seed 生成与定向 repair CLI；Luna 独立验证 `PASS`（316 项单测、发布门禁、staging/main 页面矩阵）；Nova 最终 Review `APPROVED`。
- Sol 将实现提交 `82c01ed` 推送到功能分支和 GitHub `main`，使用既有原子流程发布 staging Release `20260830T100940Z-82c01ed`；staging CMS dry-run 为 0 项变更。正式 CMS dry-run 因现有本地管理 Token 无效而在 GET 前置鉴权失败，无写入；按 fail-closed 保持阻塞。

### XYY-20260825-04

- Risk: HIGH；安全扫描任务，但范围仅限本地代码、无业务实现、无生产目标和无修复，因此未机械调度 Terra、Luna 或 Nova。
- Sol 直接运行 Strix 1.5.3 `quick` 全仓扫描并核对最终 `run.json` 与 SARIF；模型兼容预检失败的尝试均发生在首个有效模型响应前且费用为零，有效运行固定为 `website_c9b1`。
- 扫描达到约 3 美元预算后以 `stopped` 结束，在已覆盖范围内为 0 个已验证可利用漏洞；按预算受限扫描记录，不提升为完整安全认证。

### XYY-20260825-03

- Risk: LOW；仅清理已完整合并的 Git 分支，不修改业务代码或运行环境。
- Sol 只读确认两个仓库的 `codex/website-lead-integration-20260824` 均为 `main` 的祖先后，直接完成本地与 GitHub 分支删除；未调用 Terra、Luna 或 Nova。

### XYY-20260825-02

- Risk: HIGH；涉及 XYY-xiansuo 正式服务发布、GitHub 同步、受控生产测试线索和真实跨系统 E2E。
- 上一 Task 的业务实现已经 Luna Re-test `PASS`、Nova Re-review `APPROVED`，本任务没有代码返工，因此未机械调度 Terra；Sol 负责精确提交、推送、不可变 release 发布、回滚准备和真实浏览器提交。
- Luna 发布后独立验证 `PASS`：生产 release 身份、健康、浏览器网络边界、中文来源细分、唯一测试线索与 audit 均符合契约；Nova 最终发布 Review `APPROVED`。
- Xiansuo GitHub CI 的唯一失败是基线即存在的 Node 22 `DatabaseSync.serialize()` 测试兼容问题，与本次两文件 diff 无关；按 Scope 记录为非阻断剩余风险，不在本 Task 顺手修改测试或 workflow。

### XYY-20260825-01

- Risk: MEDIUM；修改 XYY-xiansuo Integration 写入的业务展示字段，但不涉及 Schema、历史数据或生产配置。
- Terra 在 Xiansuo `source_note` 写入边界完成五项稳定码中文映射并补充持久化测试；XYY-WEB 继续传输稳定代码。
- Luna 首轮独立验证 `PASS`；Nova 首轮发现普通对象映射会让 `toString`、`constructor`、`__proto__` 等合法未知值误命中对象原型并 `REJECTED`。
- Sol 沿用原 Task ID 返回 Terra，以 `Map.get()` 做最小返工并增加原型键落库回归；Luna Re-test `PASS`，Nova Re-review `APPROVED`。

### XYY-20260824-02

- Risk: HIGH；涉及两个运行系统的受控发布、机器 Secret、真实业务 SQLite 测试记录、跨系统 HTTPS E2E 与回滚。
- 用户授权仅覆盖 XYY-xiansuo Integration、XYY-WEB staging、双方对应环境变量和明确标记测试线索；主站、Oracle、Directus Schema、DNS、TLS、Nginx 与主站 PM2 均排除。
- Sol 负责 Git 范围收口、发布顺序、Secret 安全传递、基础 smoke、版本与回滚证据；基础链路通过后派 Luna 独立真实浏览器与数据验证，Luna `PASS` 后派 Nova 发布 Review。
- 发布前必须确认 Xiansuo 当前实际 systemd release 与回滚方式；不得因仓库历史 PM2 脚本存在而绕过线上现行部署机制。
- Sol 按顺序发布 Xiansuo `3c3eb1b` 并完成 direct create / duplicate 后，使用仓库原子发布脚本将 Web `4c1f313` 发布为 staging Release `20260824T090653Z-4c1f313`；两仓库均以 fast-forward 同步 GitHub `main`。
- Luna 首轮因 Chrome 控制通道停留在 `about:blank` 返回 `FAIL`；Sol 使用真实 Playwright CLI 证明页面可加载后，沿用原 Task ID 派 Luna Re-test。Luna 完成桌面两次真实 UI 提交、移动端、网络边界、字段、duplicate 与 Directus 只读补证并最终 `PASS`；该失败未暴露代码缺陷，因此未机械调度 Terra。
- Nova 对 live release、Secret、owner、数据契约、无双写、回滚、Git 和主站边界完成发布 Review，最终 `APPROVED`。

### XYY-20260824-01

- Risk: HIGH；新增跨系统 HTTPS API、独立机器鉴权、客户联系方式数据契约和 XYY-xiansuo `leads` 核心写入，并切换官网联系线索唯一存储目标。
- Sol 已只读审计 XYY-WEB 与 `/home/yj/xiansuo` 的真实代码、Git、测试、环境变量契约、健康检查和项目治理；当前不执行生产、Oracle、CMS、SQLite 生产库、部署、推送或合并。
- 顺序调度：Terra 同一 Task ID 完成两仓库最小实现并返回 Sol；Sol 检查 diff 后派 Luna 独立测试；Luna `PASS` 后再由 Sol 派 Nova Review；所有失败或驳回沿用原 Task ID 回 Sol 决策。
- Luna 首轮发现 Integration route 的非 duplicate SQLite 错误详情泄露并返回 `FAIL`；Sol 沿用原 Task ID 退回 Terra，修复为固定通用 500 且保持事务回滚，Luna Re-test `PASS`。
- Nova 首轮发现官方 Web 环境模板、Xiansuo PM2 env 透传和 CMS 文档仍保留旧联系写入契约并 `REJECTED`；Terra 最小收敛发布契约并增加测试，Luna 再次 `PASS`，Nova Re-review 最终 `APPROVED`。
- Sol 最终验收确认两仓库仅完成本地实现与契约验证；未提交、推送、合并、部署或修改生产环境与数据库。

### XYY-20260822-01

- Risk: HIGH。
- 当前发布内容已在 `XYY-20260821-01` 至 `XYY-20260821-03` 完成实现、测试和 Review；本任务不重新派 Terra 修改业务代码。
- Sol 负责显式暂存、提交、GitHub 推送、测试站原子发布和三方版本核对；发布后派 Luna 独立 smoke test，再派 Nova 复核发布证据、Scope 与版本一致性。
- GitHub 首轮 CI 暴露继承自基线的单文件 Prettier 格式问题；沿用本 Task ID 返回 Terra 做最小机械修复，经 Luna Re-test `PASS`、Nova Review `APPROVED` 后重新推送、等待新 CI 全绿并重新发布对应 SHA。
- 当前测试站 Release 经 Luna 发布后验证 `PASS`，Nova 最终发布 Review `APPROVED`；所有失败、返工和复验均回到 Sol，未发生子代理直接调度。

### XYY-20260821-03

- Risk: MEDIUM。
- Terra 完成共享 CTA 与定向测试，Luna 独立验证 `PASS`，Nova Review `APPROVED`。
- Sol 首次运行完整门禁时发现组件 228 行超过 180 行可维护性预算；沿用原 Task ID 返回 Terra 拆分专用样式，再经 Luna Re-test `PASS` 与 Nova Re-review `APPROVED`。
- Sol 最终重新运行 `npm run verify` 通过并完成验收；未执行推送、部署、CMS 或生产操作。

### XYY-20260821-02

- 产品管理配置由 Sol 独立执行。
- Agent Dispatch: Sol only；未调用 Terra、Luna 或 Nova。

### XYY-20260821-01

- Bootstrap 任务由 Sol 直接修改允许范围内的 Agent 配置和 Markdown。
- 未向 Terra、Luna、Nova 派发业务实现、测试或 Review；最终验证在新临时只读 Session 中实际 spawn 三个 Agent，均返回 `CONFIG_OK`。
- 该烟雾测试不构成角色工作交付，因此不在三本子代理工作账中伪造 Implementation、QA 或 Review 记录；工作账从首次真实职责任务开始记录。

## Work Log

### XYY-20260831-02

Status: CLOSED

Risk: HIGH

Task: 修复 Directus News 在 UTC 运行环境中把上海当前发布时间错误判为未来的问题，并提供受保护的服务端批量文章发布 API。

Scope: News 列表、分类、详情的统一发布时间解析与过滤后分页；`POST /api/integrations/news/batch` 的机器鉴权、严格 payload、Directus 批量创建、超时与稳定错误语义；环境变量模板、README、测试和 Agent 工作账。排除页面 UI、图片/CMS 9 页修复、CMS Schema/数据、Oracle、联系表单、部署、生产配置和 Git 发布。

Acceptance Criteria: 上海当前时间发布立即可见、未来文章仍隐藏，带 offset/无时区/非法日期语义一致；API 只接受 1–20 篇白名单文章，服务端固定 published 状态，三 Token 完整且两两隔离，远端写入只走 HTTPS，所有错误失败关闭且不泄露 Secret；Terra DONE、Luna PASS、Nova APPROVED，完整门禁通过。

Changes: 新增统一 News 时间 parser 和过滤后分页；新增服务端批量发布路由及 auth/http/validation/storage 模块；新增 `NEWS_PUBLISH_API_TOKEN` 与 `DIRECTUS_NEWS_WRITE_TOKEN` 配置契约；补充严格日历/offset、Token、字段、body、批量、Directus ID、重复、下游错误和安全 URL 测试。README 与环境模板仅含空值/placeholder。

Validation: Terra 最终全量 51 files / 384 tests；Luna 最终聚焦 5 files / 90 tests，`npm run verify`、format、diff-check 与 client Secret scan 通过；Nova 独立聚焦 5 files / 90 tests、format、diff-check 通过并最终 `APPROVED`。所有返工沿用原 Task ID，未跳过 Luna Re-test。

Result: 本地实现与代码质量验收完成。批量发布 API 当前 `IMPLEMENTATION READY / PRODUCTION INACTIVE`；正式启用仍需独立授权配置两枚新的高熵服务端 Token，并为 Directus 写 Token 配置最小 `news` 创建权限后执行受控 smoke。未提交、推送、部署、写 CMS、修改生产环境或操作 Oracle/数据库。

### XYY-20260830-01

Status: BLOCKED

Risk: HIGH

Task: 修复服务专题页 CMS Seed/reset 后缺少 `stats` / `features` 且部分页面继续引用旧图片路径的问题，使仓配下拉菜单的 9 个页面能按审核数据恢复为与 staging 一致的完整结构和新资源 URL。

Scope: 修复 Seed 生成、增加仅覆盖 9 个 slug 和 `stats` / `features` / `img_src` 的定向 repair 工具、验证并发布 staging、在有效管理入口可用时备份并定向修复正式 CMS。禁止修改运行时 CMS authority/fallback、CMS Schema、Oracle/数据库、DNS/TLS/Nginx/PM2，禁止重置 CMS 或部署主站应用。

Acceptance Criteria: 9 条 Seed 与源码一致（每页 4 stats、6 features、期望 `img_src`）；CLI 默认 dry-run、全量预检、0600 备份、三字段白名单、apply 后回读；Terra DONE、Luna PASS、Nova APPROVED；GitHub 与 staging 同步；正式 CMS apply 后 9 页均显示 6 项内容和新资源 URL。

Changes: 实现提交 `82c01eda9984353ab7767cd4c79d7903bf938749` 已推送功能分支与 GitHub `main`；staging 原子发布 Release `20260830T100940Z-82c01ed`。Seed 生成器已纳入 `stats` / `features`；新增 `cms:repair-service-page-structure`，只处理 9 条目标记录与三个结构字段。

Validation: Terra 与 Nova 聚焦测试均为 24/24；Luna `npm run verify` 为 48 files / 316 tests，Sol 发布前 `verify:release` 为 316 单测、39 E2E（7 项按配置跳过）、3 formal、构建通过。staging `/version` 与目标 SHA 一致，`/healthz` 为 `cmsContent=ok` / `contactStorage=ok`；staging CMS dry-run 为 0，备份 `0600`；公开回读 9 页均为 6 个 feature 且 9 个期望 hero URL 全部命中。正式主站复核仍为 9 页 0 feature、6 页未命中目标新 hero URL，证明生产内容尚未改变。

Result: GitHub 和 staging 部分完成并验证。正式主站 CMS 未修复：现有本地 `.env.production` 管理 Token 对 `https://56xyy.com/cms` 返回 `Invalid user credentials`，命令在首次 GET 阶段失败，未执行任何 PATCH；Chrome 当前也无可复用的正式后台登录会话。任务保持 `BLOCKED`，同一 Task ID 后续只需由有权限人员先 dry-run、核对备份和 9 条三字段计划，再 `--apply` 并回读零差异。主站应用无需为本次内容修复重新部署。

### XYY-20260825-04

Status: CLOSED

Risk: HIGH

Task: 使用已部署的 Strix 对 XYY-WEB 本地仓库执行快速全仓安全扫描，并保留可复核的结构化结果。

Scope: 仅扫描 `/home/yj/XYY-GEO/website` 的本地代码；禁止访问或修改正式站、验收站、CMS、数据库、生产配置、DNS、TLS、Nginx、PM2，禁止修改业务代码、提交、推送或部署。

Acceptance Criteria: Strix 有效运行建立；扫描目标与全仓范围明确；记录最终状态、请求量、token、费用和漏洞数；核对 SARIF；如因预算停止，必须明确限制，不能宣称完整安全。

Validation: 有效运行 `/home/yj/XYY-GEO/strix_runs/website_c9b1`，`run.json.status=stopped`，136 次请求、4,905,742 total tokens、费用 3.0178596 美元；`findings.sarif` 为有效 SARIF 2.1.0 且 `results=[]`；目标仓库扫描后无业务代码改动。

Result: CLOSED。预算受限的 `quick` 全仓扫描未验证到可利用漏洞；结论仅适用于本次覆盖范围。未运行 standard/deep，未进行生产黑盒测试，未生成修复任务。

### XYY-20260825-03

Status: CLOSED

Risk: LOW

Task: 确认官网线索 Integration 功能分支已经合并到两个仓库的 `main`，随后删除本地和 GitHub 功能分支。

Decision: 只处理 `codex/website-lead-integration-20260824`；不删除其他历史或并行工作分支。删除前必须用 Git ancestry 验证本地与远端分支均已包含于 `main`。

Changes: XYY-WEB 与 XYY-xiansuo 均切换并保持在 `main`；两仓本地及 GitHub 的 `codex/website-lead-integration-20260824` 已删除，残留 remote-tracking ref 已清理。

Validation: XYY-WEB `main` 与 `origin/main` 均为 `90cac20f492e141d834fb36b5293c74766162a59`；XYY-xiansuo `main` 与 `origin/main` 均为 `a5f82b96b271e266af58ca14b505ad026f050244`。两个功能分支在本地 branch list 与 GitHub ref API 中均不存在，工作树无业务修改。

Result: CLOSED。Integration 开发分支已完成合并后清理；Agent Dispatch: Sol only。

### XYY-20260825-02

Status: CLOSED

Risk: HIGH

Task: 将 `XYY-20260825-01` 已验收的官网线索服务标签中文化修复提交并推送到 GitHub，发布到 `xs.tomatopia.top`，再从既有 `wz.tomatopia.top` 联系表单执行真实 E2E，确认 XYY-xiansuo “来源细分”显示中文。

Scope: 只发布 XYY-xiansuo 已验收的 Integration 两文件改动并同步两仓工作账；允许创建一条明确标记的测试线索。禁止部署 XYY-WEB staging 应用或 `56xyy.com`，禁止修改 Token、Oracle、Directus、Schema、Nginx、DNS、TLS、PM2 或其他业务功能。

Acceptance Criteria: Xiansuo 本地、GitHub 与生产 release 指向同一验收 SHA；服务健康且回滚资料有效；真实 staging 表单提交成功并只请求 `/api/contact`；新 lead 的来源为“官网留言”、状态为“新线索”、需求含 Task 标记、`source_note` 含“咨询服务：鞋服云仓”且不含 `cloud-warehouse`；Luna `PASS`、Nova `APPROVED`。

Decision: 使用当前 hardened systemd 不可变 release 机制激活精确 Git SHA，复用既有受限环境文件与业务数据库，不编辑配置；保留旧 release 和部署前 unit。Web staging 已包含既有 Integration 链路，因此只做真实 E2E，不为 Xiansuo 局部展示修复重复发布 Web 应用。

Changes: XYY-xiansuo 提交并发布 `a5f82b96b271e266af58ca14b505ad026f050244`，本地 `main`、功能分支、GitHub `main` 和功能分支均同步到该 SHA；生产 release 位于 `/opt/xiansuo-releases/a5f82b96b271e266af58ca14b505ad026f050244`。XYY-WEB 仅同步 Agent 工作账和客观状态文档；staging 应用继续运行既有 Release `20260825T054116Z-2c75bcd`。

Validation: 发布前 Xiansuo build、180/180 server tests、H5 build 与 Web `npm run verify` 通过。发布后 systemd `active/running`、`NRestarts=0`，公网 health 200；重启窗口出现一次瞬时 502，并在两秒内恢复，无持续错误或回滚。真实 Chromium 从 staging 提交成功，浏览器只有 `POST /api/contact` 200；生产只读查询确认测试 lead ID 12 精确一条，来源“官网留言”、状态“新线索”、`source_note` 为 `咨询服务：鞋服云仓` 加测试邮箱、需求含 `[XYY-20260825-02 LABEL TEST]`、create audit=1、follow-up=0。Luna `PASS`，Nova `APPROVED`。

Result: CLOSED。中文来源细分已在 XYY-xiansuo 生产生效并经真实 `wz.tomatopia.top → /api/contact → xs.tomatopia.top → leads` 链路验证。测试线索 ID 12 保留并标记 `TEST ONLY / DO NOT FOLLOW`。Xiansuo GitHub CI 仍因基线已有的 Node 22 测试兼容问题为 179/180，需独立维护 Task 处理；该问题不影响本次增量测试、真实运行路径或发布验收。

### XYY-20260825-01

Status: CLOSED

Risk: MEDIUM

Task: 修复官网线索进入 XYY-xiansuo 后“来源细分”直接显示 `cloud-warehouse` 等英文稳定码的问题，使既定服务显示中文名称。

Scope: 仅修改 XYY-xiansuo website lead Integration 的服务标签映射与对应集成测试；不修改 XYY-WEB 业务代码、联系表单、数据库 Schema、历史线索、生产配置或运行环境。

Acceptance Criteria: `cloud-warehouse`、`quality-inspection`、`logistics-cloud`、`all`、`other` 分别写入 `鞋服云仓`、`后整质检修复`、`物流云`、`全链路解决方案`、`其他`；中文、自定义和未知值原样保留；null、email-only、鉴权、owner、duplicate、audit 与电话行为不回归；Luna `PASS`、Nova `APPROVED`。

Decision: 保持跨系统传输码稳定，只在 XYY-xiansuo Integration 的 `source_note` 写入/显示边界本地化。使用 `Map` 做显式安全查表，避免对象原型键影响未知值 passthrough；不迁移或重写已有线索。

Changes: XYY-xiansuo 新增五项服务码中文映射，来源细分将写为 `咨询服务：<中文标签>`；测试覆盖五项映射、中文/普通未知值、`toString`、`constructor`、`__proto__`、null 与 email-only。XYY-WEB 仅更新 Agent 工作账，无业务实现变化。

Validation: Luna 最终 Re-test `PASS`：Xiansuo targeted 8/8、build、full 180/180 和两仓 `git diff --check` 均通过；Web contact 聚焦契约 3 files / 21 tests 通过。Nova 首轮 `REJECTED` 的原型键数据完整性问题已返工，Re-review 最终 `APPROVED`。

Result: CLOSED。本地实现满足 Acceptance Criteria；未提交、推送或部署，现有生产线索和运行服务未改变。

### XYY-20260824-02

Status: CLOSED

Risk: HIGH

Task: 将 `XYY-20260824-01` 已验收实现先发布到 `xs.tomatopia.top`，验证 Integration health、active owner、直接创建与 duplicate；随后原子发布到 `wz.tomatopia.top`，完成版本、双健康依赖、真实浏览器 E2E、duplicate、字段映射与无 Directus 双写验证。

Scope: 允许推送两仓已验收范围、配置双方 Integration 环境、发布 Xiansuo 与 Web staging，并在 Xiansuo 业务库创建少量带 `XYY-20260824-02 / STAGING / DO-NOT-FOLLOW` 标识的测试 lead。禁止部署或改配 `56xyy.com`，禁止 Oracle、Directus Schema、历史迁移、双写及其他渠道功能。

Acceptance Criteria: 两个目标 release 可审计且可回滚；Xiansuo Integration health、直接创建、duplicate、owner 与 audit 正确；Web staging `/version` 匹配、`cmsContent=ok`、`contactStorage=ok`；真实桌面/移动浏览器提交与 duplicate 成功；测试 lead 只在 Xiansuo 出现、不进入 staging Directus；主站版本不变；Luna `PASS`、Nova `APPROVED`、Secret 无泄露。

Decision: 严格按 Xiansuo → 验证 → Web staging → 验证 → E2E 顺序执行，任一关键阶段失败立即停止后续步骤。Token 使用密码学安全随机值并仅保存在受控环境；测试 lead 默认保留作为审计证据，不用临时 SQL 删除。

Changes: XYY-xiansuo 以现行 hardened systemd 不可变 release 方式激活 `3c3eb1baa82a942c4a5f867a50d3e640b8497a5c`，配置独立随机 Integration Token 和 active member owner ID 2；XYY-WEB staging 使用既有原子发布流程激活 Release `20260824T090653Z-4c1f313`。两仓库审计分支和 `main` 均 fast-forward 同步 GitHub；用户已有 `.codex/config.toml` 未进入提交。正式主站、Oracle、Directus Schema 与历史数据均未修改。

Validation: Xiansuo health 与 Integration health 正常，无凭据和伪员工 JWT 均被拒绝；direct smoke lead ID 8 首次创建、第二次 duplicate，字段、owner 和 audit 正确。Luna 最终 `PASS`：真实 Chromium 桌面表单两次提交均成功，浏览器只请求 staging `/api/contact`，移动端正常；website lead ID 9 在 Xiansuo 中仅一条、audit 一条、follow-up 为零，Directus 强制只读事务计数为零。Web `/version` 精确匹配目标 SHA，`cmsContent` 与 `contactStorage` 均为 `ok`；Secret 扫描通过。Nova 最终 `APPROVED`；主站主页和 robots 哈希与发布前一致。

Result: CLOSED。XYY-xiansuo Integration 为 `PRODUCTION ACTIVE`，XYY-WEB staging Integration 为 `ACTIVE AND VERIFIED`；`56xyy.com` 未部署且 Main-site Integration 仍为 `NOT ACTIVE`。测试线索 ID 8、9 保留并标记 `TEST ONLY / DO NOT FOLLOW`；下一步如需主站切换，必须建立新的独立 HIGH Risk Task。

### XYY-20260824-01

Status: CLOSED

Risk: HIGH

Task: 将 `56xyy.com/api/contact` 验证通过的新官网留言通过 XYY-WEB 服务端 HTTPS 调用登记到 XYY-xiansuo `leads`，建立独立机器鉴权、稳定数据契约、重复手机号语义和健康检查边界。

Scope: XYY-WEB 仅修改 contact storage、Integration 环境契约、必要 health/release contract、文档与测试；XYY-xiansuo 仅新增 website lead Integration route、Bearer 鉴权、payload/owner/phone/duplicate/字段映射、创建审计、环境契约和测试。员工 `/api/leads`、联系页面 UI、Directus CMS 内容读取与现有数据库 Schema 保持不变。

Acceptance Criteria: 浏览器仍只调用 `/api/contact`；XYY-WEB 单次有限超时 HTTPS 调用专用 Integration API，所有配置/网络/鉴权/响应异常失败关闭且不泄密；XYY-xiansuo 只接受独立 Token，服务端控制并验证 owner/created_by，完整映射 message/email/service，兼容官网手机号和座机，duplicate 不重复插入且不是 500；Directus CMS health 与 Xiansuo contact storage health 分离；不双写、不迁移或修改 Oracle / SQLite Schema；两仓库完整门禁通过，Luna `PASS`、Nova `APPROVED`。

Decision: 采用一个专用 POST 接口和一个只读、同鉴权的 Integration health endpoint；不复用员工 JWT，不引入 Redis、队列、重试框架、通用连接器或数据库抽象。真实 Secret 只由未来运行环境配置，本任务仅使用测试随机值。

Changes: XYY-WEB 将 contact storage 改为带 5 秒超时的 Xiansuo HTTPS 调用，拆分 Directus `cmsContent` 与 Xiansuo `contactStorage` 健康依赖，并同步环境、发布和测试契约；XYY-xiansuo 新增独立 Bearer Integration route、服务端 owner、字段映射、电话规范化、duplicate 语义、lead/audit 原子事务、通用错误包络及 PM2 环境透传。历史 Directus / Oracle `contact_leads` 保留且未迁移、删除或写入。

Validation: Luna 最终 `PASS`：XYY-WEB `npm run verify` 为 47 files / 306 tests，系统 Chrome E2E 39 passed / 7 configured skips（桌面与移动）、formal 3 passed；XYY-xiansuo build 与 179 tests 通过；格式、脚本语法和两仓 `git diff --check` 通过。Nova Re-review 最终 `APPROVED`，未发现真实 Secret、鉴权绕过、双写、数据库 Schema 变化或生产副作用。

Result: CLOSED。代码与运行契约已完成本地验收，但生产尚未切换；真实 Token、active owner、双端部署和 HTTPS 联调须在未来获得明确授权后执行。

### XYY-20260822-01

Status: CLOSED

Risk: HIGH

Task: 将当前已验收改动推送到 GitHub 并部署到测试服务器，同步核对本地、GitHub 与测试站状态。

Scope: 创建功能分支；只暂存当前三个已关闭任务的确认文件；执行完整发布门禁；推送功能分支并快进同步 `main`；使用现有 `scripts/deploy.sh` 发布到 `https://wz.tomatopia.top`；核对 Git SHA、Release ID、健康状态和目标页面；更新工作账与 `DEV_STATE.md`。

Acceptance Criteria: GitHub 接收全部确认提交且无强推；测试站 `/version` 返回目标应用提交、`staging` 与有效 Release ID；`/healthz` 为健康；CTA 目标页面回读新共享结构；Luna 发布后验证 PASS、Nova Review APPROVED；本地与 GitHub 状态清晰、工作树无未纳管任务文件；不触碰正式主站、生产 CMS、数据库、DNS、TLS、Nginx 或 PM2 手工配置。

Decision: 用户已明确授权 GitHub 推送和测试站部署；遵循功能分支、完整门禁、原子发布、失败自动回滚和只读发布后验证。

Changes: 在 `codex/unified-cta-governance-20260822` 显式提交确认范围并无冲突快进同步 `main`；首轮应用提交为 `eac6790`。GitHub CI 发现基线测试文件格式问题后，沿用原 Task ID 形成最小修复提交 `539bfd44c05d81b5b7a1246cb009beec4c58f4c1`，再次同步功能分支与 `main`，随后将该应用提交原子发布到测试站 Release `20260821T235850Z-539bfd4`。

Validation: 本地 `CI=1 npm run verify:release` 与 GitHub CI Run `32538099712` 全部通过；测试站 `/version` 精确匹配应用 SHA、Release、`staging` 和 CMS Schema，`/healthz` 为 `status=ok`、`contactStorage=ok`。13 个目标页面均 HTTP 200 且恰好 1 个共享 CTA；Luna 对 13 路由桌面/移动矩阵完成 26/26 `PASS`，Nova 最终发布 Review `APPROVED`。推送均为快进，无强推；正式主站、生产 CMS、数据库、DNS、TLS、Nginx 和手工 PM2 配置均未触碰。

Result: CLOSED。应用代码在本地、GitHub 与测试站均对应 `539bfd44c05d81b5b7a1246cb009beec4c58f4c1`；最终工作账和状态记录作为纯文档提交同步 GitHub，不为文档重复部署。

### XYY-20260821-03

Status: CLOSED

Risk: MEDIUM

Task: 将仓配页底部转化区域的视觉结构统一应用到仓配下拉菜单中的 9 个服务专题页，以及合作案例、行业动态和森林期刊栏目首页。

Scope: 抽取共享 CTA；替换 9 个服务专题页共享布局中的旧 CTA，以及 `/cases`、`/news`、`/senlinqikan` 三个栏目首页的旧 CTA；补充与风险匹配的回归测试。详情页和其他页面不改。

Acceptance Criteria: 目标 12 个页面均使用同一共享 CTA 结构；仓配 `/product` 视觉基准保持一致；各页面 CTA 文案与链接语义正确；不存在重复旧 CTA；桌面与移动端无横向溢出；键盘可访问且标题关联有效；相关测试、`npm run verify` 与 `git diff --check` 通过；不触碰 CMS、生产环境或部署。

Decision: 由 Terra 实现、Luna 独立测试、Nova 完成质量与架构 Review，最终由 Sol 验收。

Changes: 新增共享 `ConversionCTA` 与专用样式；`/product`、9 个仓配下拉服务页、`/cases`、`/news`、`/senlinqikan` 使用统一双栏转化结构；三个栏目保留各自语义文案；排除的数字化页面继续使用原 CTA；新增 13 路由 Playwright 回归。

Validation: Terra 定向套件 `13 passed / 1 skipped`；Luna 首轮与返工复测均 `PASS`，覆盖桌面、移动端、13 路由、ARIA、键盘焦点、控制台、无溢出及排除路由；Nova 首审与复审均 `APPROVED`。Sol 首次完整门禁捕获 228 行组件超预算，返工后组件降为 71 行、专用 CSS 为 155 行；最终 `npm run verify` 通过：368 个 Astro/TypeScript 文件 0 诊断、526 个文件通过可维护性预算、56 个引用资源与 103 个部署资源完整、45 个 Vitest 文件 292 项通过、生产构建成功；`git diff --check` 通过。

Result: CLOSED。Acceptance Criteria 已满足；未推送、未部署，未修改 CMS、数据库或生产环境。

### XYY-20260821-02

Status: CLOSED

Risk: LOW

Task: 将仓库根目录配置为 XYY-WEB 的 Obsidian 项目管理 Vault。

Decision: 使用仓库根目录作为唯一 Vault；只启用当前 Obsidian 1.13.7 支持的 Core Plugins，不安装社区插件；共享设置进入 Git，设备状态由 `.gitignore` 隔离。

Changes: 新增最小 `.obsidian/` Core/Community 插件配置；增加设备状态忽略规则；将本页优化为项目状态、任务、优先级、Agent 导航、流程、决策、调度与日志入口。

Validation: Obsidian 1.13.7 已将 `/home/yj/XYY-GEO/website` 注册并实际加载为 Vault；通过 Obsidian URI 打开 `docs/SOL.md`；Core Plugin 配置与 Community Plugin 空列表通过 JSON 解析且插件 ID 均由当前版本支持；重要链接目标全部存在；设备状态文件命中 `.gitignore`；`git diff --check` 与修改范围检查通过。

Result: CLOSED。Acceptance Criteria 已满足；未修改业务代码，未触碰生产环境。

### XYY-20260821-01

Status: DONE

Task: 建立 Sol / Terra / Luna / Nova 四 Agent 长期协作体系。

Scope: `.codex/`、`AGENTS.md`、`DEV_STATE.md`、`docs/SOL.md`、`docs/TERRA.md`、`docs/LUNA.md`、`docs/NOVA.md`。

Acceptance Criteria: 配置可解析；Codex 可发现三个项目子代理；模型与 reasoning 有效；职责、失败闭环、风险流程、上下文和生产边界明确；内部链接有效；diff 不越界。

Risk: LOW（仅项目级 Agent 配置与 Markdown，可逆，不修改业务或运行环境）。

Validation: 四个 TOML 均通过语法解析；本机模型目录确认三个模型及目标 reasoning 有效；新临时只读 Codex Session 实际 spawn `terra`、`luna`、`nova` 并全部返回 `CONFIG_OK`；四份文档内部链接有效；`git diff --check` 通过；范围检查无业务文件。

Decision: Sol 直接完成允许范围内的引导配置；不创建 `sol.toml`，并发上限保持 3。

Result: ACCEPTED。

### XYY-20260824-03

Status: CLOSED

Risk: LOW

Task: 通过 `https://wz.tomatopia.top/contact` 真实提交一条明确标记的测试留言，验证 staging `/api/contact` 经服务端 HTTPS Integration 写入 XYY-xiansuo `leads` 的现行路径。

Scope: 仅验证已部署路径；不修改业务代码、运行配置、数据库、Directus、Oracle、Nginx、DNS、TLS 或 PM2，不访问或测试 `56xyy.com`。

Acceptance Criteria: 测试站表单显示成功；浏览器请求 staging `/api/contact` 成功；XYY-xiansuo 出现本次唯一新线索；联系人、来源、状态和 `[XYY PATH TEST]` 需求标记一致；Luna 独立确认 PASS。

Decision: 使用不会与现有线索重复的测试座机 `010-00000003`，仅提交一次；Sol 完成真实浏览器提交和只读落库核对，Luna 不重复提交，仅独立复核保存的浏览器证据与数据库记录。

Validation: 页面显示提交成功；网络记录恰好一次 `POST https://wz.tomatopia.top/api/contact` 且为 HTTP 200，控制台无错误。只读查询确认新线索 ID 10 唯一存在，联系人为 `Codex路径测试-请勿跟进`、来源为 `官网留言`、状态为 `新线索`，需求完整包含 `[XYY PATH TEST]`。Luna 独立结果为 PASS。

Result: CLOSED。路径测试 PASS；无业务代码、部署、配置或数据库修改，`56xyy.com` 与 Oracle 均未触碰。

### XYY-20260824-04

Status: CLOSED

Risk: HIGH

Task: 将已验收的 Codex 多代理配置与路径验证工作账同步到 XYY-WEB GitHub、本地 `main` 和功能分支，并使用既有原子发布流程更新 `wz.tomatopia.top`；核对无待发布变更的 XYY-xiansuo 三方状态。

Scope: 只提交 `.codex/config.toml`、`docs/SOL.md`、`docs/LUNA.md` 的既有确认改动；快进推送 XYY-WEB feature 与 `main`；只发布 staging。XYY-xiansuo 仅只读核对，不重启；`56xyy.com`、Oracle、Directus 数据、DNS、TLS、Nginx 和业务代码均排除。

Acceptance Criteria: Web 本地与 GitHub 两分支一致且工作区干净；本地完整发布门禁与 GitHub CI 通过；staging `/version` 精确匹配目标 SHA/Release，`cmsContent` 与 `contactStorage` 均正常；原子回滚目标存在；Xiansuo 本地、GitHub、运行服务一致且未重启；Luna `PASS`、Nova `APPROVED`。

Decision: 没有业务实现，因此不机械调度 Terra；将有效的 Codex 配置和 Task 03 工作账拆成两个可审计提交。Xiansuo 已处于目标版本，无意义的重复部署和服务重启均不执行。

Changes: 创建 `6d3c3b3`（Codex 多代理配置）与 `2c75bcd`（路径验证工作账），功能分支和 `main` 均以 fast-forward 推送；GitHub CI Run `32788366421` 成功。Web staging 原子发布为 `20260825T054116Z-2c75bcd`，上一 Release `20260824T090653Z-4c1f313` 保留为回滚目标。

Validation: 本地 `CI=1 npm run verify:release` 与部署脚本内完整门禁均通过，覆盖 306 项单测、39 项 E2E（7 项按配置跳过）、3 项正式域名契约和生产构建。发布后版本身份、双依赖健康、核心路由、真实 404、PM2、manifest 和回滚元数据均正常。Xiansuo 三方保持 `3c3eb1b`，systemd `active/running`、`NRestarts=0`。Luna 最终 `PASS`，Nova 最终 `APPROVED`。

Result: CLOSED。XYY-WEB 应用状态已同步到 GitHub、本地与 staging；XYY-xiansuo 已确认本地、GitHub、运行服务同步，无需重复发布。正式主站与 Oracle 未触碰。
