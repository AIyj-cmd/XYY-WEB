# XYY-20260929-03 — 中文日常发布，英文精选补充

## 授权与范围

- 风险 HIGH；本轮用户授权本地实现和验证。流程 Terra → Luna → Nova → Sol；子代理不得再委派。
- 基线 HEAD `54b41d2388d34de5a8f6ddad2c32b77b1f75dfd5`。已有治理文档、角色日志、服务详情动效和素材修改全部保留，基线与文件哈希见 `output/english-news/xyy-20260929-03/`。
- 在原 news 记录增加可选英文标题、摘要、正文、状态、发布时间与后台英文版分组；英文默认 draft。共享 slug、封面、分类，英文分类本地化。英文发布需中文公开且英文 published、标题/摘要/可见正文齐全、时间有效且到点。
- 新增 `/en/news` 和 `/en/news/{slug}`、英文 Insights 导航、对应语言切换和动态 hreflang、独立 canonical、英文 sitemap。中文和既有批量接口继续兼容；旧记录没有英文字段应保持中文正常。
- 本地 CMS schema 定义与必要的纯规划/定向新增迁移代码、操作交接文档属于范围；不执行真实 CMS 字段、权限、数据库或内容写入。
- 排除：自动翻译服务、代写/发布首批三篇文章、无关重构、服务详情动效、依赖升级、推送、部署、基础设施和真实数据操作。计划中三篇只是选题建议，另记入编辑交接。

## 文件所有权

- Terra：`src/lib/directus-types.ts`、`src/lib/directus-queries.ts`、`src/lib/directus.ts`，新增 `src/lib/news-*.ts` 或 `src/lib/directus-news*.ts`；`src/i18n/routes.ts` 与新增 `src/i18n/news*.ts`；`src/pages/news/[slug].astro`、新增 `src/pages/en/news/`、`src/pages/sitemap.xml.ts`；`src/components/news/`、`src/styles/news.css` 与新增英文文章专用样式（如需要）；`scripts/data/case-news-collection-definitions.mjs`、`scripts/data/cms-admin-translations.mjs`，新增英文 news 字段定义和定向迁移模块/CLI（如需要）；相关 unit tests、CMS schema tests 的最小更新；`docs/english-news-editorial.md`、`docs/TERRA.md` 追加。
- Luna：相关 `tests/unit/english-news*.test.ts`、`tests/e2e/english-news*.spec.ts`、`tests/fixtures/english-news*`、必要的新闻测试断言更新（不得放宽无关验收）、`output/english-news/xyy-20260929-03/luna/`、`docs/LUNA.md` 追加。独立测试期间不改应用代码。
- Nova：只读代码/证据审阅；`output/english-news/xyy-20260929-03/nova/`、`docs/NOVA.md` 追加。
- Sol：本合同、基线/验收证据、`docs/SOL.md`、`DEV_STATE.md`。其他文件必须先回报必要性，明确追加所有权。
- 所有角色都不是单独在仓库工作，不得覆盖、回退既有或他人的修改。
- 实施补充（Sol）：现有 CMS setup 在归组字段之后才创建 alias，无法可靠建立“英文版”分组。追加 Terra 所有权 `scripts/lib/cms-setup-runtime.mjs` 与必要的新 group-alias helper、`tests/unit/cms-setup.test.ts`，仅将 group alias 提前创建并验证重跑幂等，关系 alias 继续在 relations 后创建；不改变其他 schema/权限/seed 行为。
- 测试补充（Sol）：Luna 可新增 `tests/helpers/english-news*` 与必要的 `playwright.english-news.config.ts`，用于仅绑定 localhost 的 Directus fixture 与网站隔离验证；可最小更新 `tests/e2e/english-acceptance-routes.spec.ts` 的导航数/路径预期，以及 `tests/e2e/language-suggestion-behavior.spec.ts` 的未配对示例路径。不得把测试服务接到真实 CMS，也不得提交样稿作为真实网站内容；截图和日志写本任务输出目录，避免覆盖其他任务证据。

## Acceptance Criteria

1. 中文旧记录和中文发布 API 的输入输出保持兼容，英文字段留空或草稿不阻断中文；不自动产生英文稿。
2. 列表、详情、相关推荐、语言配对和 sitemap 使用一致可见性：英文 draft/archived、缺少标题/摘要/有效正文、缺少/非法/未来时间、中文撤下或未到发布时间均不可公开；有效英文发布可访问，撤下后即移除。
3. 无英文版本或不可公开的 `/en/news/{slug}` 返回真正 HTTP 404；中文无英文稿仍提示 English home，有稿则双向跳对应文章。
4. 两语言独立 canonical，仅真实可访问配对输出 hreflang；英文 published 详情进入 sitemap，草稿和未来稿不进入；分类和日期、页面主要 UI 均用英文。
5. CMS 成功空返回空；仅网络/超时/5xx 可按既有规则空回退；401/403/非法响应/契约错误明确失败。保持消毒与安全 URL 约束。
6. 英文列表和详情在桌面/手机可读可操作、无横溢；验证导航及语言入口，不回归中文文章。
7. 本地 schema 默认草稿、英文组与字段定义可审查；定向迁移如新增必须默认 dry-run，只有显式 apply 才写入，mock 测试覆盖、不触达真实 CMS。交接说明历史内容兼容、人工审核、中文事实变更复核、独立撤下与授权后上线顺序。
8. 相关单测、独立浏览器验证和 `npm run verify` 通过，Nova APPROVED 后 Sol 才本地验收。没有提交/推送/部署；`verify:release` 在未来部署前运行。

## 输入、证据与限制

- 输入：本会话用户计划、AGENTS.md、DEV_STATE.md 当前相关状态、各角色最近相关日志、上述实际代码。graphify 只读查询已定位新闻组件和 sitemap，实际代码为准。
- 预期证据：实际命令/退出码、unit 与 mock 边界、桌面/手机截图、路由 HTTP/SEO/sitemap 结果、实现清单与文件哈希、范围差异、真实失败和限制。
- 真实 CMS 字段与网站部署未授权，最终交付必须明确本地完成与真实后台尚未启用的区别；禁止以 mock 或预览代替线上验收。

## 同 ID 审阅返工

- Nova 终审发现仅含零宽字符或软连字符的英文标题、摘要、正文仍可通过空内容判定，属于 AC2 缺陷。Terra 仅修复 `src/lib/news-english.ts` 的可见内容判定与 `tests/unit/news-english-adapter.test.ts`；保留正常 Unicode 文字、emoji 和实际内容中的连接字符，不改原文。
- Luna 复测并可在既有英文新闻测试所有权范围内补充独立 Unicode 空内容案例，验证列表、详情、语言配对和 sitemap 均不公开；随后 Nova 复审。继续沿用本 ID，不扩展 CMS 或上线授权。

## 本地验收结果

- Terra 返工已完成；正常 Unicode、ZWJ emoji、图片正文及纯文本尖括号保留，Unicode 不可见空字段不会公开。Luna 独立测试设计与最终证据复核 PASS，Nova 复审 APPROVED，初次 REJECTED 及失败证据保留。
- 最终完整 `npm run verify` exit 0：562 类型文件零诊断、732 维护文件、89 文件/574 单测、lint/资产/build；原生浏览器新闻专项 9/9、定向旧回归 2/2。最终 32 个代码/测试文件冻结一致，1354 个保护路径无意外变化。
- Sol 本地验收完成，真实 CMS/权限/数据库、内容发布、提交、推送与部署均未执行。完整旧 E2E 矩阵未取得通过结果；其余环境限制及原始命令见 `output/english-news/xyy-20260929-03/sol/final-acceptance.json`。未来部署前仍需目标授权与 `npm run verify:release`。
