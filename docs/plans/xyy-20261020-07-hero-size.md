# XYY-20261020-07 — 合作案例与行业动态首屏尺寸统一

- 风险：LOW，静态布局调整；Terra → Luna → Sol。
- 用户要求：合作案例与行业动态顶部图片展示尺寸统一到首页顶部。
- 基线：HEAD `a0994d9b11d9a0898913980a05a9651962360445`；工作区包含未提交视觉改动和 SEO 回填，全部保留。当前本地 4321 PID 90294 已通过项目身份核验。
- 首页实际规则：`.s-hero` 为全宽、`height: 100vh; min-height: 600px`，图片 cover。首页实现只读，不修改。

## 文件所有权与输入

- Terra：仅 `src/styles/cases-overview-base.css`、`src/styles/cases-overview-responsive.css` 的首屏高度/对齐/必要留白，`src/components/news/NewsLandingIntro.astro`、`src/components/news/EnglishNewsLanding.astro` 的首屏布局类，`src/styles/news.css` 的首屏专用规则；`docs/TERRA.md` 仅追加本任务结果。
- Luna：只读独立浏览器与静态验证，`output/playwright/xyy-20261020-07/luna/` 证据及 `docs/LUNA.md` 结果。不改源码或测试。
- Sol：本合同、`DEV_STATE.md`、`docs/SOL.md`、改前证据与最终验收。
- 改前五份目标文件在 `output/playwright/xyy-20261020-07/baseline/`；76 份既有非目标文件 hash 在 `protected.json`；改前六路由尺寸矩阵在 `baseline-matrix.log`。
- 所有角色不是唯一工作者，必须保留他人修改，不相互委派或另行派发。

## 实施范围

案例与新闻中英文首屏均使用全宽、100vh 高度、最低 600px，背景覆盖容器；移除案例手机端固定 43rem 高度覆盖。新闻加入仅限首屏的共享类，左右内容容器需占满可用宽度，避免 flex 居中后宽度收缩。内容垂直居中，并保留导航所需安全留白。允许只调整首屏内层上下留白以适配完整文字和案例按钮；优先保持原字号、横向内容宽度和现有图片焦点。

英文新闻组件已有 180 行预算，不引入新组件/抽象、JS、依赖或无关压行。中文与英文原文、语义/id、链接、CTA、渐变、图片素材/尺寸属性与优化规则、列表/分类/FAQ、CMS/API/claims、Header/Footer/Home 均排除。图片只改变页面内展示尺寸，不重新下载或修改素材。不新增测试文件，不修复旧 FAQ 综合测试，不提交、推送或部署。

## Acceptance Criteria

1. `/cases`、`/news`、`/en/cases`、`/en/news` 在同一视口下，首屏宽高与对应语言首页相差不超过 1px；实际高度为 `max(innerHeight, 600)`，图片/背景覆盖首屏。
2. 至少验证 1440×900、768×1024、390×844、360×640 和 844×390；文字、案例两个 CTA 完整，无新增导航遮挡、横溢或文本裁切，短屏允许整页正常纵向滚动到首屏底部。
3. 新闻分类栏紧随首屏，案例浏览按钮仍可定位案例网格；原 CTA href、标题/正文与图片路径保持。中英文图片加载并可解码，桌面和手机实际截图中主体可辨、文字清楚。
4. 目标 Prettier/ESLint、维护预算、scoped diff 检查通过；76 份保护文件 hash 不变。基于本轮改前快照审阅精确增量，不把旧脏改动算本任务。

## 预期证据与流程

Terra 提供本次精确增量、自检命令结果和最终 hash，冻结后交 Luna。Luna 使用 Playwright CLI 在既有隔离本地预览独立验证五种视口×六路由；等待字体和首屏图片后截图，实际读图，原始 CLI 输出直接保存。代表截图覆盖两个目标页各自中文桌面/手机和英文手机；不要仅以元素 visible 代替裁切、导航遮挡或图片覆盖判断。无实现改动后不重复扩张全量门禁。Sol 按 AC 审核日志、截图及文件身份后更新状态。

## R2 — 短桌面边界返工

独立补测 1440×600 时，英文案例首屏高度正确，但原桌面 padding 使两 CTA 底边到 612.328px，超出首屏被裁切；原始证据 `luna/fail-en-cases-1440x600.log` 保留。沿用本 ID，只允许 Terra 调整案例 base 的内层 padding 一条声明，手机覆盖与其余四个候选保持。Luna 重测受影响案例尺寸/内容矩阵及短桌面，新闻范围已通过的验证可沿用。首页英文在两组短屏的原有 eyebrow/header 重叠记录为范围外既有现象：首页相关文件受保护、未改动，不扩大修复。
