# XYY-20261021-01：中英文文章后台入口分离

- 日期：2026-10-21。
- 目标：Directus 左侧“文章”下紧接独立“英文文章管理”入口；中英文列表、新建、编辑表单分离。
- 风险：HIGH（涉及 CMS 内容契约与发布流程；尚未授权真实 CMS、Schema、权限或生产发布操作）。
- Git 基线：`984461e17dfcae7e7d1324a9fa530fb742133b2c`。
- 既有修改：`.gitignore`、`DEV_STATE.md`、四角色日志、`scripts/check-public-artifacts.mjs`、`tests/unit/public-artifacts.test.ts`；既有未跟踪 Task18 发布合同与百度验证文件。保留上述内容，基线副本在 `output/english-news-admin/xyy-20261021-01/`。

## Scope 与文件所有权

- Sol：本合同、`docs/SOL.md` 任务记录、`DEV_STATE.md` 本任务客观状态；授权判断和最终验收。
- Terra：先提交最小方案及精确文件清单，获 Sol 确认后实施后台定义、英文内容读取与迁移工具及必要测试，追加 `docs/TERRA.md` 本任务记录。
- Luna：独立测试，仅可改本任务测试及 `docs/LUNA.md`，不得改实现。
- Nova：独立 Review，默认只追加 `docs/NOVA.md`，不得重写实现。
- 各角色不得再派子代理；共享工作区，不得覆盖既有或并行修改。流程为 Terra → Luna → Nova → Sol，失败返回 Sol 后沿用本 ID 返工。

## 排除项与边界

- 不改变中文文章展示、非文章 CMS 业务或页面设计，不做无关重构。
- 不推送、不部署、不进行真实 CMS 写入、数据库操作、Schema/权限变更，不读取凭据或请求退役环境。
- 本地纯函数、内存模拟 API 与浏览器 fixture 可以验证；真实 Directus 数据库验证须另获准确目标/动作/环境授权。
- 不以框架原生界面预期或模拟 API 通过宣称真实后台 UI 已验证或已上线。

## Acceptance Criteria

1. 定义两个真实独立的文章管理入口；英文入口位于原“文章”入口下方，英文列表、新建和编辑表单不混入中文必填字段。
2. 英文草稿、发布时间、内容有效性及发布条件可独立维护，中文发布流程不受影响。
3. 既有英文内容与 URL 可通过明确、可预览、可重复执行的迁移流程保留；冲突显式失败，不覆写人工编辑、不意外公开旧草稿。
4. 英文前台列表、详情与媒体引用遵守发布/时间/清洗规则；成功空结果为空，401/403 与非法响应不得用回退掩盖。
5. 默认预览不写入；真实 apply 需要准确目标与环境匹配。未经授权不执行任何真实 apply。
6. 相关回归通过，完成适用的独立测试与 Review；未覆盖的真实后台验证如实列为阻塞。

## 输入与证据

- 输入：用户本次需求、AGENTS.md、DEV_STATE.md 当前边界、相关 CMS 定义与英文章节读取/测试代码。
- 框架依据：[Directus Collections API](https://directus.com/docs/api/collections) 的 Collection 独立数据模型、`meta.group` 与同级 `meta.sort`；这是实施依据，不是任何 CMS/数据库操作授权。
- 证据：本次 diff、相关测试/格式/Lint、内存 CMS 迁移幂等与冲突验证、英文前台桌面/移动端 fixture；真实后台 UI 若未具备授权/环境则单独记录。
- 提交前必须 `npm run verify`；部署前必须 `npm run verify:release`，本任务未获提交/部署授权。

## 当前状态

- 已确认：当前英文五字段位于 `news.english_content` 分组，中文与英文共用一个 Collection 和编辑表单。
- 已批准 Terra 采用原生 `english_news` 独立 Collection；保留 legacy 英文字段并在成功迁移后隐藏。前台英文读取切换独立集合，不做旧接口错误回退。
- Terra 文件范围：`config/cms-contract.mjs`（必要时 `config/cms-collections.mjs`）；`scripts/data/{case-news-collection-definitions,cms-admin-translations,english-news-collection-definition,cms-seed-config}.mjs`；专用 `scripts/migrate-english-news-separation.mjs` 及 `scripts/lib/english-news-separation-*.mjs`；`src/lib/{directus-types,directus-news-english,news-english,news-english-types,directus-assets}.ts`；对应英文 fixture、unit/E2E 测试和 `docs/TERRA.md` 任务日志。必要的既有 CMS 单测期望变更限新集合/版本所致。
- 迁移不得直接复制旧 `english_status` 造成曝光增加：旧中文未发布或缺少有效时间时，目标英文为草稿；中文/英文均已发布且时间有效时，以两者较晚时间为英文生效时间。不得改变原有可见集或提前公开未来文章。
- 必要范围补充：`src/pages/news/[slug].astro` 和 `src/pages/en/news/[slug].astro` 只调整语言对应关系查询。中英文仅在确有公开的同 slug 对应文章时输出互链与 hreflang；不改变页面设计、中文正文或中文发布规则。
- 所有内容/契约冲突须在写入前检出；旧英文字段隐藏在迁移与回读成功后执行。只作用于 `english_news` 的 read policy apply 必须单独显式启用。
- 实施进行中；尚未操作真实 CMS。
- Terra 首轮实施已冻结，5 个文件 / 39 项定向单测通过；完整验证与真实后台 UI 尚未通过验收，已交 Luna 独立测试，之后需 Nova Review。
- 专用迁移入口：`scripts/migrate-english-news-separation.mjs`；独立读取权限入口：`scripts/sync-english-news-read-policy.mjs`（默认仅打印预期权限，apply 范围为 `english_news` 的指定 policy read）。这些脚本尚未获准操作任何真实 CMS。
- Luna 首轮 FAIL：54 项定向测试中旧集合列表断言失败；完整 verify 类型检查 754 文件、0 errors/0 warnings/5 hints，Lint 通过后在两项行数预算处失败。内存探针另复现图片正文误判、已有英文集合隐藏/中文标签未收敛、权限 CLI 错 scope 响应仍被 PATCH 且无写后回读。格式与 diff 检查通过，源码哈希保持；未进入 E2E。
- 已由 Sol 按同 ID 交 Terra R2 返工，授权 `tests/unit/cms-setup.test.ts` 更新新增集合期望，类型可拆到既有 `src/lib/news-english-types.ts`，迁移和权限逻辑可在限定 `english-news-separation-*` helper 内拆分。其余 Scope、真实外部写入限制和独立闸门保持。
- R2 另包含必要运行兼容修复：package 声明 Node >=22.12，但迁移工具直接导入 TS 需默认类型擦除能力；批准将既有时间解析器提取为唯一纯 JS `src/lib/news-publication-time-core.mjs`，原 `src/lib/news-publication-time.ts` 保持等值 typed API，迁移直接引用同 core，不提升 Node 要求、不添依赖或复制解析实现。该变更需既有时间单测与禁用类型擦除的 CLI import 验证。
- Luna R2：68 项定向测试及迁移/权限探针通过；完整 verify 类型、Lint、预算、资源/缓存通过，单测 149 文件中 2 文件/8 项发布夹具失败（旧 schema 字符串与 pending 状态阻断目标门禁测试），未进入 build/E2E。已交 Terra R3 仅修 `tests/unit/ci-release-identity.test.ts`、`tests/unit/helpers/deploy-target-fixture.ts` 和必要 `tests/unit/deploy-target-gate.test.ts` 的隔离夹具及 pending 负例；真实 schema 状态保持 pending。
- 并行改动边界：R2 验证期间另一工作流继续更新百度验证文件及其测试/检查器，旧 `public/baidu_verify_codeva-Yi87xCOa9G.html` 已被其替换为 `public/baidu_verify_codeva-dy5qG5C8Yw.html`。本任务未修改/回退这些内容；后续源码冻结校验将其与本任务文件分开，当前并行文件哈希见 `output/english-news-admin/xyy-20261021-01/parallel-baidu-20261021-1449.sha256`。
- Luna R3：17 项发布夹具回归通过，类型/Lint/预算/资源/缓存通过；Sol 提醒的严格时间探针确认迁移出站 `published_at` 仍保留裸 Shanghai 字符串，可能在数据库重解释时区，因此 FAIL 并停止完整 verify，未计为 PASS。已交 Terra R4 仅将既有解析出的确定时间戳写为 UTC ISO，包含 draft/archived 合法时间，补迁移时间回归，不改前台时间规则或发布状态。
- Luna R4：时间探针与 19 项时间/迁移测试、17 项发布夹具测试通过；元数据复核发现新英文状态缺 archived，FAIL 并中止完整验证。Terra R5 只补本集合 archived 选项和显式非 singleton 列表约束及元数据回归；中文状态和通用 builder 保持。R5 实施自测 19 项、格式/Lint/预算/diff 通过，已冻结交 Luna 完整 verify 与英文前台桌面/手机浏览器测试。
- R5 测试联合类型属性访问失败由 Terra R6 改为精确路径断言，保留原判据。Luna R6 完整 `npm run verify` exit 0：757 类型文件 0 errors、149 单测文件/1062 项全部通过，Lint/预算/资源/缓存/构建通过；英文 Playwright 3 pass/1 fail/5 未运行，失败为旧 fixture 的中文 draft 与英文 published 并存，而断言沿用旧联合发布规则。
- Sol 裁决并派发 R7：业务源保持独立英文发布规则；只将测试夹具的英文数据显式独立定义，草稿用例必须是真正英文 draft，补中文 draft/缺失仍可独立发布英文的浏览器断言。不能恢复中文 gate 或删除可见性断言来迎合旧夹具。真实后台与外部操作边界保持。
- Luna R7 PASS：当前 typecheck 757 文件、0 errors/0 warnings/5 hints，格式/Lint/922 文件预算/diff 通过，25 项定向单测与英文前台 Playwright 9/9 通过；1440/390/360 列表和详情共 6 张截图。R6 完整 verify（1062 单测及 build）单独复用，未称 R7 重跑；18 个应用文件及当前测试夹具的验证前后哈希无漂移。Sol 已查看桌面列表、手机详情两张截图，并复核并行百度四文件保持。本地证据 `output/english-news-admin/xyy-20261021-01/luna-r7/pass-summary.md`，已交 Nova 独立审阅。
- Nova 首轮 REJECTED：三个可复现 HIGH 问题为迁移与公开层对不可见 entity 正文的判断漂移、通用 setup 默认权限可能覆盖 English published-only、既有 schema 的 choices/关键表单元数据和额外人为 required 字段检查不完整。证据 `output/english-news-admin/xyy-20261021-01/nova/review.json`。
- R8 范围扩展仅为上述修复：`src/lib/sanitize-core.mjs` 与 `src/lib/sanitize.ts` 等值薄包装，新增纯 JS 共享英文可见性 helper 并供原 `news-english.ts`/迁移共用；`scripts/lib/content-policy-sync.mjs` 只固定新 `english_news` 默认 published-only，其他集合保持；迁移 schema helper 补关键元数据及额外必填约束检查，相应 bounded 单测补缺。不增加依赖，不改变清洗策略、中文权限或生产状态，之后重新完整独立验证与 Nova 复审。
- Luna R8 的新鲜完整 verify 在类型检查处失败：760 文件、6 errors，均为新增 `tests/unit/english-news-separation-contract.test.ts` 的异构字段联合类型访问；未进入全量单测、build 或 E2E，源码与并行百度哈希保持。已交 Terra R9 仅收窄该测试的类型并核实先前自报 typecheck 证据；业务实现保持 R8，不删减断言，之后重跑完整独立验证。
- Terra R9 已冻结，仅用明确的 API 字段 fixture 类型和 choices 运行时收窄修复测试；6 项目标测试、完整 typecheck、格式/Lint/diff 自检通过，先前 R8 typecheck 表述已在角色日志更正。已交 Luna 在 `luna-r9/` 重跑完整 verify 与英文浏览器验收，R8 业务实现保持。
- Luna R9 PASS：新鲜完整 `npm run verify` exit 0，760 类型文件 0 errors/0 warnings/5 hints、150 单测文件/1070 项、Lint/925 文件预算/资源/缓存/构建通过；三项 Nova 独立探针、62 项定向回归、英文 Playwright 9/9、1440/390/360 六张列表/详情截图及格式/diff 通过。22 个业务文件、相关测试和并行百度四文件哈希保持；Sol 已审阅桌面列表和 360 手机详情截图。证据 `output/english-news-admin/xyy-20261021-01/luna-r9/`，已交 Nova R2。真实 Directus Studio UI、真实 schema/权限/迁移和上线仍未执行或验收。
- Nova R2 APPROVED（local_ready）：三个 HIGH finding 均闭环，独立重放探针与当前 22 个业务/相关测试哈希匹配 Luna R9；批准仅限本地候选。Sol 据本轮新鲜验证、Review、实际 diff 和截图完成本地验收，状态 LOCAL_READY；真实 AC 的菜单/表单与 CMS 状态仍未验收，未关闭生产阶段，schema status 不得提前改 verified。后续须用户明确授权在 `8.138.148.179` 正式环境备份相关 CMS 数据与配置、创建英文集合并迁移现有英文内容、调整菜单与该集合读取权限、部署配套网站代码；获准后仍需真实回读、Studio 桌面/移动验收及部署前 `npm run verify:release`。本地收尾仅补状态/日志并检查文档增量与 diff，不重复已通过的应用测试。

## R10 本地真实后台预览

- 用户在获知本机未运行 Directus 后明确要求“肯定要运行啊，不然我怎么看”。本阶段据此启动独立本地 Directus 并加载本任务配置，供直接登录查看；仅对新建隔离预览实例初始化，不扩展到生产或任何已有数据库。
- 风险 HIGH，Terra → Luna → Nova → Sol；沿用原 ID。Terra 仅拥有 ignored `output/english-news-admin/xyy-20261021-01/local-preview/` 运行配置/脚本/独立 SQLite/证据和自身日志；Luna 仅本轮独立浏览器证据与自身日志；Nova 仅 Review 证据与自身日志；Sol 维护本合同与状态记录。各角色不得再委派、改冻结业务源码或回退并行修改。
- 准确目标为新容器 `xyy-english-news-preview`、新 SQLite 数据及 loopback `http://127.0.0.1:8055`，使用本机已缓存的 Directus 12.1.1 镜像。本地预览账号与示例数据独立生成，不读取生产凭据、不连接现有 5432、生产或退役环境，不更改源码依赖/Schema release 状态、已有容器或服务。
- AC：真实 Studio 可登录；中文左侧“文章”后紧跟“英文文章管理”；两列表/新建/编辑表单分离，无交叉语言必填字段；桌面/手机可查看；两类本地草稿示例明确为演示内容；固定本地 URL、进程/容器和独立数据目录可回读，业务与并行文件 hash 保持。本地验证不替代生产迁移/权限验收。
- 前台 `127.0.0.1:4321` 已运行；本轮重点补齐实际后台供用户查看。若发现需要业务源码修复，由 Terra 返回 Sol，不能修改冻结源或虚构后台。
- Terra R10 已完成：真实 Directus 12.1.1 容器与独立 SQLite 就绪，`/admin/` 与 demo 登录 HTTP 200；两集合完整 UUID 封面字段/关系保留，菜单 sort 1/2、中文翻译、隐藏只读旧英文子字段和两条 draft 示例回读通过。SQLite 的物理 varchar 与逻辑 UUID 差异仅在 ignored 本地 bootstrap 适配，未改通用 runtime 或冻结业务源。
- Luna R10 实际 Studio UI PASS：真实登录、相邻菜单、独立列表/新建/编辑、英文三状态及 1440/390 十二张截图；未保存文章/配置，22 业务/并行百度哈希不变。Directus 自带部分非阻塞本地 console 噪声如实保留，不宣称 console 零事件；未发现可见阻塞 UI，已交 Nova 本地运行范围 Review。
- Nova R10 APPROVED（isolated_local_directus_preview_only）：容器仅绑定 loopback，独立 SQLite/uploads 挂载、遥测关闭、输出忽略、原业务/并行文件 hash 与 pending 状态保持。Sol 审阅 API 回读、桌面中文列表与英文新建、手机英文新建截图和独立测试/Review 后验收本地运行；后台继续保持运行供用户查看。生产阶段仍待准确授权。本轮仅初始化隔离演示实例并补文档，不改业务源码，不重跑已通过的完整业务测试；文档增量与 diff 检查通过。
