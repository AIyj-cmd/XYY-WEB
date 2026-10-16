# 图片视频和加载优化合同

Task ID：`XYY-20261015-04`；风险 MEDIUM；四项优化方案第二阶段。第一阶段验收后开始实施，先建立性能基线，再修改资源。

## 范围与所有权

- Sol：开工时保存新的 Git/diff/hash 基线，维护本合同、`DEV_STATE.md`、`docs/SOL.md`；基线采样后冻结性能预算和准确资源改动文件。既有安全、内容可见性、阶段一改动及当前预览保持。
- Terra 第一部分：`config/lighthouse.cjs`、`scripts/lighthouse-runner.mjs`、`lighthouserc.cjs`、`lighthouserc.mobile.cjs`、必要的 `scripts/lib/lighthouse-*.mjs`、`package.json`；解决明确构建/运行 origin 和 ci 环境隔离，使桌面与手机串行审计确定来源的构建。不得复用未知 dist，输出只落本地 filesystem。
- Terra 第二部分候选：`src/components/about/AboutScrollGallery.astro`、`src/data/about/gallery-image.ts`、`src/data/about/gallery-images.ts`、`src/scripts/about/gallery-preview.ts`；展示资源生成脚本、生成目录的忽略项和必要构建准备入口。必须先获得实测基线，再由 Sol 冻结生成方式与文件清单；不得先行改动。
- 原图目录 `public/about/gallery/`、图库 catalog/顺序/布局、Claims、正文和 API 不可修改。只有瀑布图证明必要时，才增补首页图片、产品视频或字体对应文件，不进行全面改版。
- Luna：独立基线与复测、相关 Lighthouse/图库单测和 E2E；具体测试文件在开始时列明，单文件遵循预算。`docs/LUNA.md` 与 ignored 测试证据。
- 工具部分测试所有权：`tests/unit/lighthouse-config.test.ts`、`tests/unit/lighthouse-runner.test.ts`；必要时新增 `tests/unit/lighthouse-workspace.test.ts`、`tests/unit/lighthouse-command-runner.test.ts` 及 `tests/helpers/lighthouse-runner-fixture.ts`。保留八路由、每路由三次、原始中位数、运行/HTTP 错误及断言非零退出的既有覆盖，并增加构建/运行 origin 一致、工作区独立和失败清理验证。
- Nova：最终只读 Review、`docs/NOVA.md` 与 ignored 证据；不改实现。各角色不再委派，保留共享仓库其他改动。

## 测量方法

1. 使用独立测试工作目录或明确隔离的构建，公开 origin 固定为 loopback，构建与运行均 ci，CMS/咨询指向不可达 loopback 或假服务。桌面和手机顺序执行，不与其他重型任务并行。
2. 沿用现有八条路由，桌面/手机每路由各 3 次，保存浏览器版本、网络/CPU节流、缓存规则及原始报告；比较 LCP、TBT、CLS、资源字节和请求数。禁止误跳到正式域名，审计产物不上传外部平台。
3. 图库另测未进入视口、进入图墙、打开单张大图三种状态；保留中英桌面/手机截图和几何数据。157 张原图约 16.10 MiB 是资产总大小，不等于首屏下载量。
4. 同条件改动前后比较；性能预算在资源改动前冻结。TBT 不代表 INP，本地 Lighthouse 不代表线上真实访问达标。

### 隔离工具实现选择

- 临时工作区位于主项目目录之外的短 TMPDIR，独立复制依赖（可使用 reflink），不以源码、public 或 node_modules 软链/硬链接回主目录。结束清理工作区，报告保留到通用 `output/lighthouse/<run-id>/`。
- 复制完整 src/public/config/server/scripts、必要根配置、package 与 lock，以及容量基线的隔离副本；不复制真实 `.env*`、`.git` 或旧 dist。所有命令使用隔离 cwd，构建和运行使用同一个 CI loopback origin。
- `build → prebuild → check:assets → precheck:assets` 会运行公共产物检查和字体准备。保留完整生命周期和容量检查，复制已有 public/fonts 供隔离生成器判断缓存，不跳过准备步骤。
- 使用已安装的本地 LHCI，缺包明确失败，不由 npx 自动联网安装。派生图库只以本次输入 hash 管理生成缓存；原图保护使用任务 before/after 证据，不新增永久锁死原图的受控 hash 清单。

## 资源策略与验收

- 为小尺寸展示提供独立派生资源，保留 157 张原图的逐文件 hash、顺序、宽高比例和双语 alt。资源生成可重复；目录首次缺失或缓存缺项可自动生成，生成结束后所有预期输出必须存在且可解码。catalog 引用的原图缺失、非法或无法生成时明确阻断构建。
- 展示图按合适尺寸请求，图库总展示传输量严格小于对应基线；原图链接保持，悬浮/键盘/触摸放大读取原图而非缩略图 `currentSrc`，不一次加载全部大图。
- 无 JS 链接、放大关闭、焦点返回、现有布局与可接受清晰度通过；相关正文默认可见、减少动态效果及脚本故障回退保持。
- 改动后的三次性能中位数符合事先冻结的预算；无实测收益的额外视频、字体或首页改动不实施，不以放宽预算使失败通过。
- 相关类型、Lint、维护预算、格式、单测/E2E和构建通过；Luna PASS、Nova APPROVED、Sol 比较源码/资源/视觉后验收。

## 排除项与交付

不提交、推送、部署或进行真实 CMS/数据库/咨询操作；不改变生产缓存/代理配置，不接入新监测平台，不删除图库照片。不得借性能优化削弱发布验证或内容可见性。

交付为本地源码改动、性能基线与前后对照、资源清单/完整性结果、双端截图、冻结的性能预算及真实限制，证据目录 `output/optimization/xyy-20261015-04/`。

## 开工记录与补充约束

- 第一阶段已由 Sol 验收；本阶段基线 HEAD `9ad4fe0`、1587 文件 hash/status/diff 保存于本任务证据目录，现只实施 LHCI 隔离工具。资源与预算尚未修改。
- 图库清单只能来自现有 `galleryCatalog`；可用已声明的 TypeScript AST 严格解析字面量调用，不另引入加载框架或重复清单。生成准备覆盖 build、dev 和 local-preview 的 npm 生命周期，后续 dev:local 也须调用准备链。
- 已安装 Sharp 为 0.35.4，而既有 lock 的间接记录为 0.35.5。资源生成若直接引用 Sharp，精确声明已安装 0.35.4 并通过包管理器更新 lock，审查无无关升级；缓存记录实际版本，不将安装树与 lock 混为同一基线。

## 资源实施冻结（基线完成后）

- 有效基线为 `output/lighthouse/2026-10-15T09-44-04-970Z-296f0278/` 的 48 次审计及 `luna/gallery-baseline/cdp/gallery-cdp-baseline.json` 的 4 cases / 12 states。Nova 已确认修正版采样可前后比较；旧开发页与 invalid-r1 不计入预算。
- 图墙四组自然进入均请求 157 原图、16,998,686 encoded bytes；未进入时为 0。最大展示尺寸在 1440 视口为 46.48×60.16 CSS px，390 视口为 20.36×27.39 px。派生 profile 冻结为 Sharp 0.35.4、192×192 fit outside、withoutEnlargement、WebP quality 78 / effort 4，保持比例且不裁图；考虑 1600px 容器及高 DPR 清晰度，双端视觉另验收。
- Terra 文件所有权：新增 `scripts/lib/gallery-catalog.mjs`、`scripts/generate-gallery-thumbnails.mjs`；修改 `.gitignore`、`package.json`、`package-lock.json`、`src/data/about/gallery-image.ts`、`src/components/about/AboutScrollGallery.astro`、`src/scripts/about/gallery-preview.ts`。Sharp 精确 devDependency，不是生产依赖。允许为维护预算拆分为 `scripts/lib/gallery-thumbnails.mjs`。其他候选文件无须改动。
- 输出 URL 固定 `/about/gallery-thumbnails/gallery-NNN.webp`，生成目录忽略。原图 href、157 清单/顺序/alt/尺寸属性/CSS保持；hover/dialog 读取 anchor.href。生命周期覆盖 predev、precheck:assets、prebuild:local-preview。完整校验及失败语义沿用上文。
- Luna 测试所有权增补：`tests/unit/gallery-thumbnails.test.ts`、`tests/unit/gallery-catalog-source.test.ts`、必要的 `tests/helpers/gallery-thumbnail-fixture.ts`、`tests/e2e/about-gallery-layout.spec.ts`、`tests/e2e/about-gallery-preview.spec.ts`、`tests/e2e/about-cases.spec.ts`、`tests/e2e/helpers/about-gallery.ts`。必要拆分测试 helper 先报 Sol；保留原断言语义。
- 数值预算在 `output/optimization/xyy-20261015-04/performance-budgets.json` 冻结：图墙合计传输下降至少 75%，进入图墙原图请求为 0；About 整页资源中位数不超过基线 40%。其他页面资源最多基线三次最大值加 2%（至少 20KB），请求数最多增加 2。LCP 不超过基线最大值 110%，TBT 不超过最大值加 20%（至少 50ms），CLS 不超过最大值加 0.01；performance 不低于基线最小值减 0.02，其他类别不低于基线中位数。时间预算容纳已观察到的实验波动，不能当线上达标证明；不得事后放宽。
- 不新增视频、首页或字体优化；图库已是本阶段充分证实的主要资源问题。后测沿用同浏览器、设备、节流、缓存、构建和 A/B/C 方法，预算不满足先判断具体原因。

- 后测同时使用既有 `LHCI_MODE=enforce` / `LHCI_ENFORCE_THRESHOLDS` 校准入口：`lhci-enforce-thresholds.json` 为全设备/路由共同包络；逐路由的精确预算比较仍为必需，不能仅以宽包络通过验收。该断言模式不改变采样设置。

## R2：实测布局偏移修复与复测

R1 的 48 次后测原始命令通过，但精确预算为 FAIL：手机首页 CLS 0.119446（上限 0.101949），鞋服云仓 TBT 264ms（上限 249ms）。保留全部 R1 证据；预算不变。Nova 对六份首页报告确认资源完全一致，语言提示条在客户端显现后以正常流占据 77px，推移 hero；鞋服页同样存在该脚本的同步布局工作，尚不能断言 TBT 因果。

- 在已授权加载性能范围内增补最小修复：Terra 仅拥有 `src/styles/language-suggestion.css`；先将提示条移出正文流、保留文档顶部位置和随页面滚离行为。既有脚本的导航可见高度补偿、语言选择、存储、键盘、无 JS 隐藏保持。若实测标题遮挡或需其他实现文件，先回 Sol 确定文件范围。
- AC：提示条显现/关闭前后首页 hero 文档坐标不变；桌面/手机提示条与导航互不遮挡、代表路由标题可见；滚动/缩放/关闭后的导航补偿正确；中文浏览器、英文页面与无 JS 不留下额外空白。
- Luna 测试文件增补 `tests/e2e/language-suggestion-layout.spec.ts`，可拆出 `tests/e2e/language-suggestion-stability.spec.ts`。行为/存储测试保留原语义；对受影响全站共享 CSS，候选冻结后重新运行完整 48 次同条件采样，保留所有样本，与原冻结预算比较。不得择优替换 R1 或追加样本直到通过。
- 若 R2 再失败，按具体原始证据诊断后才决定必要修复；不凭测量波动解释直接验收。图库资源及原图证据继续有效，除具体回归无需重复完整图库矩阵。

### R3 收窄提示条布局作用范围

R2 定向测试 17 passed / 1 failed：中文联系页 390px 的导航遮挡标题，故未启动 R2 的 48 次性能测量。R2 同时误从主工作区执行了 Playwright 自动构建，ignored dist 的 manifest 变为 loopback 4419；如实记录，主 4321 dev 保持，后续使用独立工作区，不为恢复可再生制品重复构建。

Terra 实现所有权增补 `src/components/navigation/LanguageSuggestion.astro`。默认提示条恢复 `position:relative`；仅首页 `/` 与鞋服页 `/xiefu-yuncang`（等价单尾斜杠可规范化）由 SSR 显式输出 overlay 布局标记，CSS 通过准确值匹配应用 absolute。其他路由保持原排版。不要使用依赖下游 DOM 的 `:has()`，以免解析期间发生布局策略切换；不自动扩展到其他页面，不声称已消除全站 CLS。

沿用 R2 的稳定性/语言/布局 AC，增加联系页 390px 回归、非目标路由保持 flow、目标路由 SSR 即 overlay 的验证。Luna 测试需对最终 R3 候选执行；行为通过后完整 48 次采样仍按原预算，一次固定三样本，不与重型任务并行。

R3 测试 helper 所有权增补 `tests/e2e/helpers/language-suggestion-layout.ts`，用于提取坐标与等待；overlay 稳定性只针对两个中文页面，英文对应页应验证提示条隐藏，不能错误等待显现。

### 最终证据完整性收尾（R3 采样完成后）

Nova 只读预检发现 `lighthouse-summary.mjs` 将 total-byte-weight 视为可选，可能静默省略指标或将后续样本 null 当作 0 参与排序。R3 正在运行，当前不修改候选；结束后 Terra 仅在该 helper 内改成与其他必需指标相同的有限数值校验，取消可选字段过滤。所有权为该 helper、角色日志；不改变采样、统计方法或阈值。

Luna 测试所有权补充 `tests/unit/lighthouse-summary.test.ts`（也可在既有 runner test/fixture 中完成，保持文件预算），覆盖第一及后续样本缺失 audit、null/非法非数字均明确失败，正常三样本中位数保持。对本次已存在且 audit 齐全的原始报告重新汇总/比对，不重新启动 Lighthouse；旧基线与 R1/R3 全样本缺项情况明确检查。

另在任务专属隔离副本删除完整派生缩略图目录后执行真实 npm build 生命周期，确认生成 157 张可解码缩略图和 manifest，主原图与派生目录保持；现有从主目录复制派生图的 E2E 证据不能单独称为 clean checkout 验证。补非目标联系页无 overlay 属性且 computed position 为 relative 的直接断言，可与该隔离服务验证共用，不扩大为全站新矩阵。

### R4 联系页稳定首屏与最终收尾

R3 完整 48 次后测仅手机 `/contact` CLS 0.119446 超出原预算 0.101949，其余 15 组通过；全部原始证据保留。首页及鞋服页修复已通过。本轮由 Terra 修改 `src/components/navigation/LanguageSuggestion.astro` 精确增加中文 `/contact` overlay，并新增 `src/components/contact/ContactHero.astro` 的中文专属静态顶部间距（移动端约 9rem、桌面约 8rem），英文现有样式保持。静态留白是 Hero 内部设计，无提示时也存在；不添加独立提示条占位，不改显示判断与存储。同步完成上文 summary 必需指标校验。其他图库及实现文件冻结。

Luna 继续拥有语言布局测试/helper，并可新增独立 summary 单测。AC：360/390/430 和桌面下实际提示条、导航、kicker、H1 矩形无重叠；出现和关闭提示条不推动 Hero；英文、中文浏览器、无 JS 正文可读；非目标 `/product` 或 `/about` 直接断言默认 relative。完成独立 clean checkout 构建，确认全量 157 派生图可解码。

性能仅对 `/contact` 与 `/en/contact` 双端各 3 次（12 次）执行原测量配置与冻结预算，不择优换样本。复用 R3 其他 12 组前，必须证明 R4 对其实际请求 CSS/JS 内容及 URL、SSR 关键标记未造成变化；R3 源码已保存在本任务 ignored 证据目录，可按需在独立工作区还原构建用于对照。若存在影响，仅扩大实际受影响路由的完整三次采样。summary 修复对现有所有 raw reports 重新汇总一致，无须重采。

每轮完整测试失败先回 Sol，不启动后续阶段。主 4321 保持；不得从主工作区运行会重建 dist 的测试。
