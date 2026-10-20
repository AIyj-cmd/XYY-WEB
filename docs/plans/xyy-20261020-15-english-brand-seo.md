# XYY-20261020-15 — 英文品牌搜索关联

风险：MEDIUM。用户在只读诊断后明确要求“你看着来优化”，授权本地网站优化。目标是让可见文案与搜索元数据一致表达 XINYIYUAN / XINYIYUAN Supply Chain 与新亦源的关系，不承诺 Google 收录、排名或 AI 引用。

## 基线与最小范围

- HEAD：`f9bcf4675b07e1639af888f54c093216ceeb8c17`。开始时已有 `docs/TERRA.md` 的 Task14 增量与未跟踪 `docs/plans/xyy-20261020-14-native-release.md`；必须保留。Task14 在独立工作树进行，本任务不得改变其候选或产物。
- 已有英文首页、关于页、双向 hreflang、自引用 canonical 和 sitemap；这些路由关系保持。英文现有标题已经带品牌后缀，优先保留当前标题组装逻辑，不为品牌前置扩大为全站标题重构。
- 增加稳定英文品牌字段，在中文首页与关于页可见品牌行自然展示 XINYIYUAN；完善这四页的中英文品牌描述和企业结构化数据。根首页现有 WebSite 增加英文别名。
- 同一企业使用既有 `/#organization` 标识，注册名称仍为已知中文全称；不编造英文注册名称、社交账号、sameAs、认证、指标或业务能力。
- 保持现有 CMS 读取、翻译匹配、空内容与回退规则；不替换、拼接或伪造 CMS 返回的企业简介。品牌关联可通过现有固定 UI 文案表达。
- 排除外部账号写入、Search Console 提交、推送、部署、服务器操作、CMS/数据库操作、DNS/TLS/权限变更、旧环境访问及真实表单提交。没有新增这些动作的授权。

## 文件所有权

- Sol：本合同、`DEV_STATE.md`、`docs/SOL.md`、`output/seo/xyy-20261020-15/sol/`，范围判断与最终验收。
- Terra：`src/data/brand/core.ts`、`src/lib/seo.ts`、`src/pages/index.astro`、`src/pages/en/index.astro`、`src/pages/about.astro`、`src/pages/en/about.astro`、`src/i18n/home-ui-zh.ts`、`src/i18n/about-ui.ts`；必要的语义回归测试 `tests/unit/brand-identity.test.ts`，及 `tests/e2e/home-product.spec.ts` 中受新品牌文案影响的单条精确文案断言；只追加自己的 `docs/TERRA.md` 记录与 `output/seo/xyy-20261020-15/terra/` 证据。
- Luna：独立验证上述最终候选；可写 `tests/e2e/brand-identity.spec.ts`、自己的 `docs/LUNA.md` 增量和 `output/seo/xyy-20261020-15/luna/` 证据，不改实现。
- Nova：只读审阅实现、测试与证据；只写自己的 `docs/NOVA.md` 增量及 `output/seo/xyy-20261020-15/nova/`。
- 各角色不是独占工作区，不覆盖他人改动或重排历史日志。实施 → Luna 独立验证 → Nova Review 顺序进行。子代理不得再委派；需要新增文件或改变范围时返回 Sol。

## 可观察验收判据

1. 中文首页与关于页的可见品牌文案及页面标题同时包含“新亦源”和 `XINYIYUAN`；中英文首页/关于页的标题或描述清楚包含既有品牌名及业务语境。英文标题保留已有品牌后缀。
2. 四个页面均输出合法 Organization JSON-LD，`@id` 相同，提供两种语言的真实名称关联、根站 URL、Logo、真实注册名称及一致的基础企业信息；没有互相矛盾的组织节点或虚构的 sameAs。
3. 根首页仅有一个 WebSite 节点，保留根 URL 并含英文别名；canonical、双向 hreflang、语言及现有索引控制不变。英文页面仍使用英文 UI，不为关联而破坏既有语言契约。
4. 现有 CMS 获取与翻译逻辑不变，公开数字继续从 claims 引用；未改既有正文、图片、页面布局与视觉风格。中英文四页桌面与手机的新增/受影响品牌文字可见，无新增裁切、横溢或导航遮挡。
5. 相关单测、格式、Lint、维护预算及类型检查通过；用隔离 loopback 依赖验证四页实际 HTML。独立浏览器证据同时核对标题、JSON-LD、canonical/hreflang 与品牌可见性。既有问题和环境阻塞明确区分，不宣称未运行的全量门禁通过。
6. Luna PASS、Nova APPROVED 后由 Sol 审阅最终 diff 与必要截图、核对改动边界并更新任务状态。本轮不提交或部署，故不以全量 verify / verify:release 代替相关验证；若随后提交或部署则必须另跑相应强制门禁。

## 输入与交接

- 先读 AGENTS.md、本合同与各角色最近相关日志；源码以当前文件为准。此前已核对 Google 官方 site-names、Organization、ask-google-to-recrawl 与 localized-versions 文档。
- 输出精确文件清单、实现说明、执行命令/退出码、最终源码哈希、截图路径及限制。保留并行文件和主预览；如另起验证实例，仅使用 loopback 与假依赖，禁止连接真实 CMS。
- 当前预览记录为 `http://127.0.0.1:4321/`，实际身份与可用性需本次核实；不得按旧 PID 擅自停止进程。

## R2 — 回归截图隔离

- Nova 发现新 E2E 使用固定任务目录与文件名，默认 chromium/mobile 两个项目会并发覆盖截图。原单项目 12/12 证据有效，此项为测试可移植性缺陷。
- Sol 将 `tests/e2e/brand-identity.spec.ts` 的这次修正临时分配给 Terra：只给测试回调增加 `testInfo`，将三处截图路径改为 `testInfo.outputPath(...)`，保留全部断言和视口。Luna 此阶段不写该文件。
- Terra 完成后，Luna 使用默认双项目重新运行该 E2E，验证 24 项结果及每项截图路径隔离，并更新测试哈希；业务源码与原冻结 10 文件保持。随后 Nova 复审测试增量与证据，Sol 最终验收。
