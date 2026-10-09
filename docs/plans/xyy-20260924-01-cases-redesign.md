# XYY-20260924-01 合作案例总览改版合同

- 风险：MEDIUM。用户已确认并授权本地实现；仅 `/cases` 总览。
- 基线：HEAD `330969d65af52c1333c30d496983c65dcc15a992`；既有治理配置、日志、计划及未引用素材改动保留。哈希与状态见 `output/cases-redesign/xyy-20260924-01/baseline-*`。
- 视觉：深色沉浸首屏、浅色案例、规整品牌墙，品牌与案例并重。

## 所有权和顺序

1. Terra：仅案例总览页面、总览组件及其专属样式/展示 helper、旧轨道脚本、两份原有轨道断言和 `docs/TERRA.md`。
2. Luna：仅案例相关测试、任务输出证据及 `docs/LUNA.md`；实现冻结后独立验证，不改业务实现。
3. Nova：只读审阅实现和证据，仅写 `docs/NOVA.md` 和任务审阅证据；不改实现、不再委派。
4. Sol：本合同、`docs/SOL.md`、`DEV_STATE.md` 及验收证据。所有冲突与返工返回 Sol。

## 实施范围

- 页面 `src/pages/cases.astro`；组件 `CasesHero.astro`、`CasesGrid.astro`、`CasesLogoWall.astro`、`CasesValueProps.astro`，可新增同目录总览专用 Featured/Card/Stats 组件和轻量展示 helper，禁止修改 `CaseDetail*`。
- 可新增总览专属 CSS 并调整 `cases-values.css`；删除不再引用的四份 `cases-orbit*.css` 与 `src/scripts/cases-orbit.ts`。
- 更新 `tests/e2e/about-cases.spec.ts`、`tests/e2e/home-product.spec.ts` 中仅与总览旧轨道有关的断言。Luna 可增加总览边界/交互测试。
- 保留 CMS 类型、读取/回退策略、详情路由、SEO 元信息及结构化数据来源；可修正展示顺序/链接计算以保持一致，不修改后端契约。

## 页面行为及 AC

1. 首屏复用 `/w-apparel.webp`，深色遮罩、左侧大标题“鞋服仓配合作案例”、橙色副标题“仓配、质检与退货处理实践”，精简介绍；主按钮“浏览合作案例”到 `#cases-grid`，次按钮“预约案例分享”到 `/contact`。移动端预留双行导航空间，无导航遮挡。
2. 重点案例优先使用当前数据中路径为 `/cases/ur` 的条目，否则取第一项；图左文右，手机上下排。简介和前四项有效指标直接可见。没有案例则不渲染重点区。
3. `#cases-grid` 展示所有返回案例，保留 `.case-card` 供现有计数测试；1024px 起三列、640–1023px 两列、更窄一列。每张卡含现有图片、品牌/分类/简介、前三项有效指标、有效详情链接。重点案例仍在全集中，CMS 排序保持。
4. 成功空列表显示明确空态；空指标不显示空壳；缺少 slug 且现有 label 映射无匹配时不生成详情链接。不得写死六个品牌或注入新的客户事实、数字、成效。
5. Logo 沿现有顺序，前12个常显，其余通过原生 details/summary 展开；保留78个现有素材及真实 alt，不旋转、不复制 marquee。没有 JavaScript 时正常使用。
6. 数据来源说明集中一次呈现在案例区下方；三项优势、FAQ、底部咨询正文/链接保持，统一分区和排版。
7. 桌面1440、平板768、手机390/360无横向溢出、意外裁字或导航遮挡。移动指标直接可见，链接/锚点/Logo展开/FAQ/键盘可用；reduced-motion 无持续动画。
8. 不新增视频/动画依赖，不修改首页案例、详情页、全站导航/页脚、品牌/CMS数据、claims、媒体文件、环境配置。

## 验证与交付

- Terra 做局部格式、lint、维护预算与必要自测，交回精确文件列表及限制。
- Luna 独立覆盖四视口截图与交互、无JS、reduced-motion、正常/空/无指标/无链接 fixture、现有 CMS 回退与详情链接回归。只使用本地隔离 CMS/fixture，不提交真实联系表单。
- Nova 审阅质量、范围、CMS/链接/SEO/无障碍与证据，APPROVED 后 Sol 复核视觉及保护文件。
- 本次不提交；若后续提交必须 `npm run verify`，部署必须另获明确授权并 `npm run verify:release`。
- 本地完成后更新角色日志与 DEV_STATE；证据如实注明浏览器/设备限制。

## 排除项

推送、部署、生产配置、真实 CMS/数据库读写或迁移、权限变更、业务数据修订、新生成媒体、无关重构。已有验收站与本地回退名单差异不在本次修正。

## 同 ID 修订：去除重复重点案例（2026-09-24）

- 用户反馈重点 UR 与下方案例列表重复，授权去除或换表达。采用去除重点区，Hero 直接衔接完整案例列表；本修订替代原 AC 2 和 AC 3 中“重点案例”相关要求，其余保持。沿用 MEDIUM 与 Terra → Luna → Nova → Sol，验证仅覆盖本次增量及相邻行为。
- Terra 文件所有权：`src/pages/cases.astro`、`src/components/cases/CasesFeatured.astro`（删除）、`src/styles/cases-overview-base.css`、`src/styles/cases-overview-responsive.css`、`src/styles/cases-overview-title-wrap.css`，以及 `tests/e2e/cases-overview.spec.ts`、`tests/e2e/home-product.spec.ts` 中过时的 Featured 断言。保留卡片共用样式；不修改卡片内容、数据、详情、Logo/FAQ/CTA 或其他页面。
- AC：页面无 Featured 区和重复大幅 UR；Hero 后首个内容区为 `#cases-grid`；完整列表顺序、详情链接、前三指标及每品牌单卡保持。1440/768/390/360 无溢出、空白占位或导航遮挡；浏览案例锚点仍正常；源码无无引用 Featured 组件与专属样式。相关既有 E2E 通过，CMS/claims/媒体/依赖保持基线。
- 输入：用户截图、当前源码及 `output/cases-redesign/xyy-20260924-01/remove-featured/baseline-hashes.json`。前轮证据保留为历史；本轮证据统一写 `remove-featured/`，截图放 `output/playwright/xyy-20260924-01/remove-featured/`。
- Luna 仅独立测试与证据/自身日志；Nova 仅增量 Review 与自身日志；Sol 更新状态及最终验收。不提交、推送、部署或操作真实 CMS/数据库。

## 同 ID 修订：移除指定 FAQ（2026-09-24）

- 用户明确要求去掉“合作一般需要多长时间才能\"跑顺\"？上线后要多久看到效果？”。仅在 `/cases` 页面展示层对读取后的 FAQ 列表排除该精确问题（可 trim），页面和 FAQ Schema 共用过滤结果；同时覆盖 CMS 返回和本地回退，不写真实 CMS 或改全局读取契约。风险 MEDIUM，Terra → Luna → Nova → Sol。
- Terra 仅拥有 `src/pages/cases.astro`、自身日志及 `output/cases-redesign/xyy-20260924-01/remove-faq/terra*`；不改 FAQ 原始种子/claims/CMS/测试文件/其他页面。Luna 仅独立验证与自身日志/输出，Nova 仅增量审阅与自身日志/输出，Sol 管合同、状态与验收。
- AC：该问答同时从可见 FAQ 和 FAQPage JSON-LD 消失，当前回退剩余七题的文案和顺序保持；成功空列表仍为空，原 getFaqs 的错误与回退语义不变；1440/390 下剩余 FAQ 可正常展开、无溢出。局部格式/lint/diff 与独立渲染检查通过，无需新增测试文件或重跑前轮无关套件。输入当前页面、`src/data/cases/faqs.ts` 目标文案及 `remove-faq/baseline-hashes.json`。

## 同 ID 发布授权（2026-09-24）

- 用户明确要求部署测试站、推送 GitHub 并同步本地状态。风险 HIGH；目标为既有 `https://wz.tomatopia.top` staging、`origin` 的 `AIyj-cmd/XYY-WEB` 仓库 `main` 普通推送。本次仅发布 `release/release-paths.json` 锁定的 21 个案例应用/测试路径（16 存在、5 删除）。治理配置、日志和无关未引用素材继续保留，不纳入应用提交。
- 授权包括本次精确应用提交、已存在测试站发布脚本的安装/原子切换及必要回滚、非强制 GitHub 推送、只读发布后 QA 与状态更新；不包括正式站、真实 CMS/数据库写入、迁移、独立权限/环境/DNS/TLS/Nginx 修改。
- 基线 HEAD/GitHub/staging 预期 `330969d65af52c1333c30d496983c65dcc15a992`，远端实际版本已回读；21 路径冻结、混合脏文件状态和保护 hash 位于 `output/cases-redesign/xyy-20260924-01/release/`。任何新变动或版本分歧先核查，禁止覆盖用户修改或强推。
- Terra 仅负责一次性发布 wrapper/只读状态采集 helper、发布准备证据及自身日志，禁止改应用/测试或执行外部写入；Luna 在准备冻结后独立核对精确候选、已运行门禁及发布后桌面/手机 QA，只写自身日志/任务证据；Nova 在 Luna 后审阅发布前后证据，只写自身日志/任务证据；Sol 唯一执行提交、发布、推送与最终状态验收。不得再委派。
- 提交前运行 `npm run verify`；部署脚本必须在首次 SSH/上传前运行 `npm run verify:release`。另验证 format、production dependency audit、候选 clean/HEAD/hash、staging 精确目标与现有回滚版本。复用当前干净的 `output/performance/xyy-20260923-01/candidate`，仅快进至本次提交，保留旧 stash；测试用 4399 默认端口与离线虚拟凭据，不访问真实 CMS。
- AC：21 路径精确提交且根目录与 clean candidate 同 SHA/hash；门禁通过后测试站 `/version`、health、回滚路径有效；线上 1440/390 检查案例网格、无重复 Featured、指定 FAQ 正文/Schema 消失、Logo/FAQ/锚点/详情链接无回归；GitHub main 非强制推送成功且同 SHA CI 成功，本地 HEAD/origin/main、GitHub 和 staging 一致；更新 DEV_STATE/角色日志，保留无关脏项，不宣称整个根工作区 clean。
