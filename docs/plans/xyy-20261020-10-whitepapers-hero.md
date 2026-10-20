# XYY-20261020-10 — 白皮书首屏尺寸与图片

- 风险 LOW，Terra → Luna → Sol。用户要求供应链白皮书顶部与首页、案例、新闻使用相同尺寸，并更换顶部图片。
- 基线 HEAD `a0994d9b11d9a0898913980a05a9651962360445`；保留全部既有脏修改。4321 本地服务 PID 98418 已核验身份，保持运行，不关闭或替换。
- 输入：当前两语白皮书 Hero 组件、首页 `100vh / min-height:600px` 几何、已选本地图片；改前两组件在 `output/playwright/xyy-20261020-10/baseline/`，89 份保护文件在 `protected.json`。

## 所有权与范围

- Terra：`src/components/publications/PublicationsHero.astro`、`src/components/publications/EnglishPublicationsHero.astro`，新建仅两 Hero 使用的 `src/styles/publications-hero.css`，新增 `public/whitepapers-research-hero.webp`，来源记录 `docs/whitepapers-hero-image.md`，追加 `docs/TERRA.md`。
- Luna：独立浏览器及静态验证，`output/playwright/xyy-20261020-10/luna/` 与 `docs/LUNA.md`。本次不改测试或应用实现。
- Sol：合同、选图、最终验收、DEV_STATE 与 SOL 记录。
- 各角色不是唯一工作者，不回退他人修改，不再委派。需要扩展文件范围时先返回 Sol。

## 具体实现

两语目录页 Hero 使用全宽 `height:100vh; min-height:600px`，与首页和已调整案例/新闻一致。内容垂直居中，设置合适顶部安全留白；保留原文案、H1/aria、三个 CTA 的 href/条件/target/rel，允许为了窄短屏完整显示而调整首屏间距、字距、行高、字号及按钮排布，但不能隐藏内容、裁切文字或引入内部滚动。默认尽量保留原字号，不强制套用新闻的大标题；必要的紧凑规则限定短屏/手机。

两语顶部原依赖 latest.cover 的背景换为同一静态装饰图，即使 latest 为空也显示背景；使用空 alt 与 aria-hidden，明确宽高和 fetchpriority，不改变 latest 的阅读/PDF 条件。原 latest 类型接口可保留，不清理其他调用。统一适量深蓝渐变，让白字清晰、图表仍可辨；图片 cover，裁切点根据桌面/手机决定。目录中的真实期刊封面保持。

选图已下载并由 Sol 实际查看：Lukas Blazek，Pexels 590045，纸质报告/柱状与折线图。来源 `https://www.pexels.com/photo/graph-and-line-chart-printed-paper-590045/`；许可 `https://www.pexels.com/license/`（本次核对允许网站/商业使用，无须署名，不暗示背书）。下载 URL `https://images.pexels.com/photos/590045/pexels-photo-590045.jpeg?auto=compress&cs=tinysrgb&w=2400&fm=webp&q=82`。直接复制 `output/playwright/xyy-20261020-10/assets/590045.webp` 到指定 public 路径，2400×1589、54,616 bytes、SHA-256 `f719833a10d6a3c5be01e954cb222fba3ba4d575fa4e3bb4aefab3d96400988b`；来源文档记录日期 2026-10-20、下载/许可/规格/hash 和仅为主题装饰，非本企业数据。

排除：正文/目录/FAQ、白皮书文章页、期刊内容、翻译、CMS/API/claims、SEO metadata、Header/Footer、首页/案例/新闻、依赖、远程/CMS/数据库、提交/推送/部署。不得修改旧测试文案或新增测试；若确有断言需同步先报告。

## Acceptance Criteria

1. `/supply-chain-whitepapers/` 与 `/en/supply-chain-whitepapers` × 1440×900、768×1024、390×844、360×640、1440×600、360×560，宽度等于视口、高度等于 `max(innerHeight,600)`，与对应首页尺寸一致；无横溢。
2. 每页一个 H1，原文案和首屏链接保持；眉题、标题、正文和全部存在的 CTA 完整位于首屏内、不与导航重叠；实测文本 Range 边界，不能仅检查父容器。
3. 两语使用同一本地图，HTTP 200、WebP 解码和自然尺寸正确，cover 背景铺满；不依赖运行时外站图片。分类/统计或目录区紧随 Hero，实际点击“浏览全部资料”/“Browse all issues”到达 `#issues`；阅读/PDF href 与基线保持，不必外部打开 PDF。
4. 不改变 89 份保护文件。范围内格式/ESLint/diff、维护预算和既有 publication-copy 单测通过；Sol 审阅精确增量，Terra 冻结 hash 后 Luna 验证。静态布局任务不运行整套 CMS fixture/E2E、全量 verify/typecheck/build。
5. Luna 保存真实 CLI 原始输出和中英桌面/390 四张截图，拍摄前等待字体和首屏图片 decode，实际读图。Sol 最终看图验收；若失败，原 ID 返工，保留失败证据。验证仅本地 Chromium，不能宣称全量或线上通过。

## R2 — 按合作案例统一字号

用户纠正“字号没有统一”，明确以合作案例首屏为参照。沿用本 ID；覆盖前版“默认尽量保留原字号”的选择。Sol 当前浏览器实测：合作案例中英在 1440 宽度眉题/H1/副标题/正文/按钮依次为 11.2/103.68/23.2/16/14.4px，390 宽度依次为 11.2/48/17.6/16/14.4px；白皮书当前标题仅 60/39px。原始证据 `r2/baseline/typography.log`。

- Terra R2 所有权仅原两 Hero、`publications-hero.css` 与 TERRA 记录。移除冲突字号 utility，采用案例对应字号：眉题 0.7rem、标题 `clamp(3rem,7.2vw,6.5rem)`、副标题 `clamp(1.1rem,2vw,1.45rem)`、正文 1rem、按钮 0.9rem；标题同步案例行高 1.05 与字距 -0.055em，避免单纯放大造成不必要换行。不能再用手机规则缩小这些字号。允许必要的局部间距/行高/宽度/按钮排布调整以保持 600px 短屏完整显示。
- 保留前版图片、渐变、原文案、链接及所有非首屏内容，合作案例仅作参照，不改其代码。R2 三份基线与 91 份保护 hash 在 `output/playwright/xyy-20261020-10/r2/`。未授权其他页面字号改动。
- AC：两语在 1440×900、768×1024、390×844、360×560 四种视口，与同视口合作案例的上述五级计算字号逐项一致；白皮书追加 1440×600，两语文字/CTA 的 Range 边界在 hero 内且避开导航、无横溢，原文/href 保持。中英桌面/390 四张最终截图需读图。
- 流程仍 Terra → Luna → Sol。Terra 只跑目标 Prettier/ESLint/diff，CSS 预算检查；静态字号调整不新增测试，不重复上一轮未改文案的单测或全量门禁。冻结候选后 Luna 一次定向字号/边界矩阵，复核 91 项保护 hash；保留脚本失败记录。Root 可审阅源码与截图，不替代独立验证。
