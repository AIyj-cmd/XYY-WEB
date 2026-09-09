# XYY-20260908-05 网页功能 QA

Task ID: `XYY-20260908-05`

Result: **PASS**（仅覆盖 14 期白皮书 HTML 页面、HTTP、DOM、响应式与浏览器功能；不代表 PDF 文字逐字校对通过。）

## Tests performed

- 本地冻结预览 `http://localhost:4321` 只读验证。未构建、未重启 PM2、未写 CMS/数据库、未部署。
- HTTP 矩阵：栏目 `/supply-chain-whitepapers/` 与详情 `/1/`–`/14/` 均 `200`；`/15/`、`/014/` 均真实 `404`；`/14?qa=1` 单次 `301` 至 `/14/?qa=1` 并保留 query。证据：[http-matrix.txt](../output/playwright/whitepaper05-final-pages/http-matrix.txt)。
- 栏目真实交互：14 个卡片“阅读白皮书”链接精确覆盖 `/1/`–`/14/`，Hero 阅读入口为 `/14/`；实际点击第14期卡片进入详情，再实际点击第3个 TOC 链接至 `#section-3`，锚点稳定后位于 Header 下方。证据：[real-click-and-toc-desktop.txt](../output/playwright/whitepaper05-final-pages/real-click-and-toc-desktop.txt)、[toc-settle-desktop.txt](../output/playwright/whitepaper05-final-pages/toc-settle-desktop.txt)。
- 14 期详情 DOM 桌面矩阵：每页 `article`/真实正文/唯一 H1，TOC targets 全存在；14/14 title、description 均独立且不重复；canonical 与 `og:url` 均自指向本地 HTML URL；`iframe/embed/object` 均为 0；首尾 PDF 与返回栏目链接均存在；Header/Footer 均存在。证据：[dom-matrix-desktop.txt](../output/playwright/whitepaper05-final-pages/dom-matrix-desktop.txt)、[metadata-viewer-contract.txt](../output/playwright/whitepaper05-final-pages/metadata-viewer-contract.txt)。
- 响应式浏览器循环：`1440×900` 14/14 与 `390×844` 14/14 均无水平溢出，Header/Footer 存在，唯一 H1 与正文存在，console/pageerror/HTTP>=400 均为 0。证据：[desktop-matrix-corrected.txt](../output/playwright/whitepaper05-final-pages/desktop-matrix-corrected.txt)、[mobile-matrix-corrected.txt](../output/playwright/whitepaper05-final-pages/mobile-matrix-corrected.txt)。
- 部分恢复稿：第3、4、5期顶端均显示“本期目前为部分恢复稿”，且每个章节各有 1 个带 PDF physical page/bbox 的 review-note（3期 18/18、4期 11/11、5期 16/16）。证据：[partial-recovery-contract.txt](../output/playwright/whitepaper05-final-pages/partial-recovery-contract.txt)、[04-issue3-partial-warning-mobile-390x844.png](../output/playwright/whitepaper05-final-pages/04-issue3-partial-warning-mobile-390x844.png)。
- 图片与 PDF：JSON 引用的 72 个唯一局部正文图源全部本地 HTTP `200 image/png`，本地文件均为有效 PNG 且有正尺寸；14 份原 PDF 全部 HEAD `200 application/pdf`。原 PDF Git diff 行数为 0。证据：[figure-http-matrix.txt](../output/playwright/whitepaper05-final-pages/figure-http-matrix.txt)、[figure-file-dimensions.txt](../output/playwright/whitepaper05-final-pages/figure-file-dimensions.txt)、[pdf-head-matrix.txt](../output/playwright/whitepaper05-final-pages/pdf-head-matrix.txt)、[pdf-preservation.txt](../output/playwright/whitepaper05-final-pages/pdf-preservation.txt)。
- 发现性：`/sitemap.xml` 与 `/llms.txt` 均 `200`，各含 14 个 HTML 详情 URL。证据：[discovery-matrix.txt](../output/playwright/whitepaper05-final-pages/discovery-matrix.txt)。
- 真实截图并已目视检查：
  - [01-directory-desktop-1440x900.png](../output/playwright/whitepaper05-final-pages/01-directory-desktop-1440x900.png)
  - [02-issue14-body-desktop-1440x900.png](../output/playwright/whitepaper05-final-pages/02-issue14-body-desktop-1440x900.png)
  - [03-issue14-body-mobile-390x844.png](../output/playwright/whitepaper05-final-pages/03-issue14-body-mobile-390x844.png)
  - [04-issue3-partial-warning-mobile-390x844.png](../output/playwright/whitepaper05-final-pages/04-issue3-partial-warning-mobile-390x844.png)

## Regression coverage

覆盖栏目入口、Hero/卡片 HTML 主入口、14 期详情、TOC 锚点、唯一 H1、H2/H3 与正文、首尾 PDF/返回链接、HTML canonical/og:url、viewer 标签排除、Header/Footer、桌面/移动无溢出、运行时错误、部分恢复状态、局部图资源、14 份 PDF 下载、404/301/query、sitemap/llms。未运行完整 `npm run verify` 或独立内容/PDF 文字校对，按本次网页 QA Scope 留给 Sol 及对应测试角色。

## Remaining risks

- 本结果只证明本机 `4321` 冻结预览的网页功能与资源契约；未证明验收站/正式环境部署结果。
- 第3–5期已明确为部分恢复稿；本报告不把 review-note 之外的 PDF OCR 文本当作逐字准确，也不替代其他 Luna 的源稿校对。
- 完整 `npm run verify`、新增测试文件及 Nova Review 尚未在本阶段执行；Sol 需在最终验收前按 HIGH 闸门处理。

## 2026-09-09 修正后复测（第10/12/13期）

Task ID: `XYY-20260908-05`

Result: **PASS**（仅本次修正后第10/12/13期本地页面；不宣称本轮重新浏览全部14期。）

### Tests performed

- 使用 Playwright CLI 会话 `luna-wp05-final` 只读访问当前本地 `http://localhost:4321`，实际检查 `1440×900` 与 `390×844` 两种视口。第10、12、13期均生成并目视检查桌面/手机截图。
- 第12期质检正文和表格实际滚动查看：桌面与手机均显示修正后的 H2、正文和完整六行两列表格；无裁剪、缺图或横向溢出。第12期 TOC 点击 `#section-7` 后 target top `87.91px`、Header bottom `62px`。
- 第10期与第13期 hero、H1、正文、TOC 实际可见；第13期团建 TOC 点击 `#section-12` 后 target top `112.28px`、Header bottom `70px`，未被固定 Header 遮挡。
- 三页 DOM 均为唯一 H1；10期 12 个、12/13期各 13 个 TOC 链接，所有 target 存在；canonical/title/description 独立；PDF 与返回入口存在；无 iframe/embed/object。
- 三页分别执行真实滚动到底触发 lazy 图片：10期 8/8、12期 5/5、13期 4/4 图片加载成功；scrollX=0、body width=390、无 horizontal overflow；Footer 均存在并保留 PDF/返回入口文案。
- 本会话 console error/warning 均为 0。此前旧段落记录的 72 图是旧版本阶段事实；本次修正后 12期图为 3、全14为 73，图片完整性已由本轮页面实际检查第10/12/13期覆盖，Sol smoke 另已覆盖全量 HTTP/资源矩阵。

### Regression coverage

覆盖第10/12/13期桌面与移动页面、质检正文/表格、修正文章 H2/正文、TOC 锚点、Header/Footer、唯一 H1、metadata、PDF/返回入口、懒加载图片、横向溢出与 console 错误。未新增 E2E spec，未重复全14浏览器套件；第14期布局引用既有独立证据。

### Evidence

- [final-page-retest.txt](../output/playwright/luna-wp05/final-page-retest.txt)
- 第10期：[desktop](../output/playwright/luna-wp05/final-retest-10-desktop.png)、[mobile](../output/playwright/luna-wp05/final-retest-10-mobile.png)
- 第12期：[desktop quality](../output/playwright/luna-wp05/final-retest-12-desktop-quality.png)、[desktop table](../output/playwright/luna-wp05/final-retest-12-desktop-table.png)、[mobile quality](../output/playwright/luna-wp05/final-retest-12-mobile-quality.png)、[mobile table](../output/playwright/luna-wp05/final-retest-12-mobile-table-visible.png)
- 第13期：[desktop](../output/playwright/luna-wp05/final-retest-13-desktop.png)、[mobile](../output/playwright/luna-wp05/final-retest-13-mobile.png)

### Remaining risks

- 本轮只验证本机 4321 的第10/12/13期；未重跑第1–9、11、14期浏览器矩阵。Sol 的当前 smoke 已另行覆盖全14 HTTP/资源/内容锚点。
- 未访问线上、未操作 CMS/数据库、未重启 PM2；页面结果不等于正式环境部署结果。

## 2026-09-09第二轮最终数据复测

Task ID: `XYY-20260908-05`

Result: **PASS**（仅最终冻结 localhost 预览的第 7–13 期页面；不扩展为全 14 期浏览器复测，也不替代有限源内容验收。）

### Tests performed

- 使用 Playwright CLI 新会话 `luna-wp05-final-data`，通过 `bash /home/yj/.codex/skills/playwright/scripts/playwright_cli.sh` 只读访问 `http://localhost:4321/supply-chain-whitepapers/{7..13}/`；每期实际检查 `1440×900` 与 `390×844`。
- 7–13 共 14 个视口均通过唯一 H1、独立 title/self-canonical、TOC target 完整、Header/Footer、PDF/返回入口；所有 lazy 图片逐张滚动后成功加载：7/8/9/10/11/12/13 分别为 6/6、4/4、5/5、8/8、4/4、5/5、4/4。桌面 document/body width 均 1425，手机均 375，无水平溢出。
- 14 个视口 console error/warning、pageerror、HTTP≥400 响应及 request failure 均为空。7–13 TOC target 缺失均为 0；10 期 13 个、11 期 10 个、12 期 13 个、13 期 13 个（7/8/9 为 13/14/12 个）。
- 重点 DOM/正文回归：10 期含“为了缓解炎热”与“618特辑”；11 期含“吞噬”“行业最大异常工况数据库”“CargoWare”“eTower”；12 期含“卷服务质量”及“提升消费者购物体验”；13 期含“林间小憩”“此刻没有 KPI”“奋斗蓄力”及“返程”。
- 实际点击 10 期 `#section-8`、13 期 `#section-12`，等待平滑滚动稳定后 hash 正确，target top 均约 112px，位于固定 Header 下方。
- 已目视检查真实 viewport 正文/图片上下文截图：7 两张独立招聘海报（桌面/手机含底部联系与地点）、9 蓝色历史数据框（含 `超50万m²`、图注与 note）、10 夏日与 618 两个独立文章段（桌面/手机）、13 小憩与返程（桌面/手机）。13 return 两张使用精确 `h3` 文本定位及 instant scroll 重截，标题 bounding box y≈110px 且返程段落可读。
- 证据：[page-qa-final-report.txt](../output/playwright/whitepaper05-final-source/page-qa-final-report.txt)；重点图例见该目录中的 `issue-7-*-viewport.png`、`issue-9-*-context-viewport.png`、`issue-10-*-viewport.png`、`issue-13-*-viewport.png`。

### Regression coverage

覆盖最终修改的第 7–13 期两视口页面、HTML metadata、TOC anchors/真实点击、Header/Footer、PDF/返回链接、lazy 图片、横向溢出、console/runtime/network 基础异常及本轮指定正文/图片可读性；未新增 E2E spec，未重跑全 14 期浏览器套件、源 PDF 逐字校对或技术门禁。

### Remaining risks

- 结果仅证明本机冻结预览 `localhost:4321`；未访问线上、未部署、未操作 PM2/CMS/数据库。
- 本轮仅覆盖 7–13；第 3–5 期仍为明确部分恢复并保留 manual-review 边界，页面 QA 不等于全书逐字 PDF 校对。
- 8/11/12 按调度仅做 DOM/滚动回归，未增加重点截图；7/9/10/13 的截图是上下文证据，不替代全书视觉审阅。

## 阅读体验增量 UI 验收（2026-09-09）

Task ID: `XYY-20260908-05`

Result: **PASS**（仅指定 localhost 页面与视口）

- Playwright CLI 独立会话检查第 14、12、7 期 `1440×900` / `390×844`；第 3 期移动页首提示与第 10 期图注禁词。
- 第 14 期两端 41/41 图片解码、最大中心偏差 `0px`，桌面/移动 `scrollWidth` 分别为 `1425/375`；27 张增强图满足自然宽度大于显示宽度，3 张 source-limited 图显示宽 `318/316/315px`。
- 第 12 期两端 3/3 图片解码、中心偏差 `0px`、无溢出；12 个读者提示链接均为对应 PDF `#page`。第 7 期两端 4/4 图片解码、中心偏差 `0px`、无溢出。
- 第 3 期页首显示“本期仅部分内容，完整内容请阅读 PDF 原版”；第 10 期 6 个图注不含“上半/下半/左侧文章区域”。指定页面的唯一 H1、Header/Footer、TOC target、PDF 入口均存在。
- 实际点击第 14 期“查看大图”并打开独立图片 tab。证据：[14 桌面窄图](../output/playwright/whitepaper05-presentation-ui/issue14-desktop-narrow-export.png)、[14 移动跨境图](../output/playwright/whitepaper05-presentation-ui/issue14-mobile-cross-border.png)、[12 移动表/入口](../output/playwright/whitepaper05-presentation-ui/issue12-mobile-quality-table-notice.png)、[3 移动部分提示](../output/playwright/whitepaper05-presentation-ui/issue3-mobile-partial-notice.png)。12 期截图仅为表格/大图入口上下文，不宣称拍到下方 aside。

### Regression coverage

覆盖指定页面的图片 lazy 解码、自然/显示尺寸、section 居中、横向溢出、H1/Header/Footer、TOC/PDF 链接及 3/10 公共文案边界；未新增 E2E、未重跑全 14 期浏览器套件。

### Remaining risks

- 结果仅证明本机冻结预览 `localhost:4321`，未证明线上部署。
- 首次逐图等待命令超时；调整等待方式并显式等待 load/decode 后复测通过。
- 第 3–5 期仍是部分恢复稿，不替代全书逐字源稿校对；未执行 verify、CMS、数据库或部署操作。
