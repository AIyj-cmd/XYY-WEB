# 供应链白皮书 HTML 阅读页

Task ID：`XYY-20260908-05`。本功能使用现有 Astro 服务端路由、Layout、Header、Footer 和网站样式，不引入 PDF viewer 或新的 UI 框架。这里的命令仅用于本地开发；不包含 CMS 写入、数据库操作或部署。

## 页面与源文件

- 栏目：`/supply-chain-whitepapers/`。
- 详情：共用 `src/pages/supply-chain-whitepapers/[issue].astro`，期号为 `1` 至 `14`。不存在的期号返回 404。
- 原件：`public/senlinqikan/pdf/1.pdf` 至 `14.pdf`，共 14 期、187 个物理页；保留原下载地址。
- 阅读数据：`src/data/whitepapers/<issue>.json`。
- 局部图片：`public/images/supply-chain-whitepapers/<issue>/`。
- 渲染组件：`src/components/publications/WhitepaperArticle.astro`；长文样式：`src/styles/whitepapers.css`。

离线流程是“PDF 原件 → 文字层或经核对的 OCR 区域 → 章节/语义块 JSON 与局部图片 → 共用 Astro 模板”。线上请求只渲染已有 JSON，不解析 PDF，也不运行 Python 或 OCR。正常构建不需要 OCR 缓存。

第 14 期优先提取原生文字。第 1–13 期经逐页检查，正文不存在可靠原生文字层；部分原生文字只是浏览器打印页眉、URL 和页码，因此仅这些图像正文使用本地 OCR。多栏按源区域/原文阅读顺序整理，不按整页全局坐标拼接。

## 阅读内容边界

每期具有独立主题标题、简介和自身 HTML canonical；原刊名称、期号与出版日期仍保留。按用户要求，页面不再显示通用的历史语境/服务承诺声明，也不生成空提示框；仅第 3–5 期保留“本期仅部分内容，完整内容请阅读 PDF 原版。”。目录仅在章节达到 4 节时出现。正文支持段落、小标题、列表、引用、局部图和表格。章节内不再显示重复的转换说明框或“查看原版第X页”链接；保留页首、页尾的 PDF 下载入口，不公开 OCR、bbox 等制作备注。

原刊中的历史时间、人数、指标和计划不作为当前服务承诺。不能可靠恢复的正文仍在内部数据和复核清单保留原文章、物理页和源区域，不以摘要或猜测文字代替。移除公开提示仅是展示调整，不代表内容缺口已补齐或全文已校对完成，具体缺口见：

- `docs/whitepapers-manual-review.md`：汇总所有当前阅读数据中的待核查条目，按期号、文章、物理页和 bbox 定位。
- `docs/whitepapers-early-review.md`：第 1–5 期；尤其第 3–5 期低清小字，阅读数据是部分恢复稿。
- `docs/whitepapers-archive-review.md`：第 6–13 期 OCR 正文、图表与混排区域。
- `docs/whitepapers-conversion-notes.md`：第 14 期原生文字和无文字层图解、名单等边界。
- `docs/whitepapers-archive-figures-audit.md`：第 6–13 期局部源图独立核验。

字段 `source.pdfPage` 从 1 开始，表示 PDF 物理页；`printedPage` 仅在印刷页映射可信时填写。第 14 期原生提取以及第 6–13 期的 bbox 为 PDF 坐标；第 1–5 期为已核定 200 dpi 缓存 PNG 的像素坐标。不可跨转换器混用坐标单位。

## 当前本地结果（2026-09-09）

最新章节说明清理已验收：从共用模板移除122个章节提示框及对应页码链接，原JSON/235条内部核查记录不变，3–5顶部partial及每期首尾PDF下载保留。定向3 files/18 tests、Astro399零诊断、构建、14页剩余HTML/metadata前后精确对比和104源哈希检查均通过，14份PDF HEAD均200。独立按14→1串行完成桌面1440×900与手机390×844共28视口，76图每端全部解码/居中0px，无横向溢出，Nova本轮Review APPROVED。每期手机截图及14桌面截图见 `output/playwright/whitepaper05-no-section-notes/`；不代表原稿全文已补齐。

最新顶部说明最小返工已独立验收：14页不再输出通用历史声明，非3–5期无空提示框。定向3 files/18 tests、Astro399文件零诊断、14/3期两端共4视口和14页HTTP/104源哈希检查通过，Nova增量Review APPROVED。本地预览已更新；以下完整测试和图片检查属于此前阅读体验阶段，本次未重复全量验证。

此前第二轮源内容修正已通过独立源内容、技术及页面复测和 Nova Review。用户反馈图片与公开说明问题后的阅读体验返工，也已通过本轮独立技术/有限源图/UI检查、Sol全14页HTTP检查与Nova增量Review；Sol完成本地验收，Task `CLOSED`。下述原稿内容数量不变，验收不代表整本原刊已逐字校对。

- 第 14 期样板：12 篇文章、299 个语义块、41 张局部图，主要使用原生文字层。
- 第 1–2、6–13 期：已生成可阅读的章节正文；低可信文字和图表区域仍有明确复核说明。
- 第 3–5 期：仅部分恢复稿，页首明确提示未完成全文恢复，不宣称已完成整本转录。
- 全部 14 个阅读页已接入栏目，正文合计引用 76 张局部图；235 条内部待核查记录保留在原 JSON 和逐期复核清单，不再逐条直接显示制作说明。此前合并的 122 个章节阅读提示按用户最新要求从公开展示层移除。
- 本轮完整 `npm run verify` 复测实际退出 0，包含 Astro 399 files 零诊断、Vitest 58 files / 444 tests、ESLint、可维护性、资源与构建检查。新增图片生成测试 4 项、31 项资源清单校验和定向 Vitest 37 项独立通过；104 项原 PDF / JSON / PNG 基线哈希未变，有限新旧图对照通过。旧 archive 12 项、native 1 项和 early 4 项保留此前独立通过记录，未在本次展示改动中重跑转换。
- 全 14 页已有桌面/手机独立检查；第一次内容修正后第 10、12、13 期两端阅读、目录和表格复测 PASS，第二次修正后第 7–13 期两端增量检查也已 PASS，未将未变页面伪称为再次执行。最新 HTTP 检查覆盖全部 14 页、76 张正文图、14 个原 PDF 及哈希、独立元数据、301/query 和非法期号 404。各阶段详见 `docs/whitepapers-page-qa.md`。

本轮图片资源通过独立清单 `src/data/whitepaper-figure-assets.json` 接入，不修改原稿 JSON、PDF 或第一代局部图。28 张图解/表格按原区域生成高清无损 WebP，3 张原稿低清图表保留原生像素和显示上限。其余图片继续使用原资源；图注居中，图解提供普通“查看大图”链接。生成方式与真实清晰度限制见 `docs/whitepapers-reading-images.md`。

本轮独立浏览器矩阵为第14/12/7期桌面1440×900与手机390×844，图片全加载、中心偏差0px、无横向溢出；另核对3期部分提示及10期图注。大图新tab、原PDF页锚点、既有目录与页面组件正常。四张最终归档截图及真实覆盖限制见 `docs/whitepapers-page-qa.md`；不重跑或冒称全14页浏览器矩阵。

本地检查入口：`http://localhost:4321/supply-chain-whitepapers/`，以及 `http://localhost:4321/supply-chain-whitepapers/14/`；将 `14` 换为 `1` 至 `13` 可查看其他期。当前结果仅在本地，不代表已提交、推送或部署，也不等于 14 本全文逐字校对完成。

## 本地重生成

仅在需要重新转换原刊时准备 Python 3.11 或更新版本（使用 `hashlib.file_digest`）、PyMuPDF（本次验证版本 1.28.2）、Tesseract（`chi_sim` 和 `eng` 语言包）和 ImageMagick `convert`。Python 环境可放在仓库外；下列 `python` 应替换为所选虚拟环境的解释器。

```bash
# 有文字层的第 14 期；按已审核的原刊版式提取
python scripts/whitepapers/convert_issue.py

# 仅首次缺少缓存或经重新审核后才进行本地 OCR
python scripts/whitepapers/ocr_sources.py --issues all --psm 3 --dpi 200 --workers 4 --output output/whitepapers-ocr-layout

# 使用已核对缓存和明确的文章区域配置生成阅读数据
python scripts/whitepapers/convert_early_issues.py --issues 1 2 3 4 5
python scripts/whitepapers/convert_archives.py --issues all

# 转换器相关测试（包含重生成；在原件与缓存就绪时运行）
python tests/whitepapers/convert_issue.test.py
python tests/whitepapers/early_conversion.test.py
python -m unittest tests/whitepapers/archive_conversion_test.py

# 网站正常验证与本地预览构建
npm run verify
PUBLIC_SITE_URL=http://localhost:4321 npm run build:local-preview
```

OCR 缓存、TSV、预览截图及临时环境属于开发证据，保存在被 Git 忽略的 `output/` 或仓库外，不随网站发布。需纳入版本控制的是转换脚本/区域规则、审核记录、JSON 和必要的局部图片。

原件发生变化时，应先重新判断文字层和版式，复核 SHA-256 与区域映射，再重新转换；不能只更新哈希来绕过源文件检查。脚本中的人工核字也只适用于其已核对的原件。

## 栏目和 SEO 约束

栏目以 CMS 返回的期次为准，与已转换数据显式匹配；CMS 成功返回空数组时不得用静态数据补满。只有 PDF、尚无转换数据的未来期次保留 PDF 入口。

已有转换数据的主要按钮为“阅读白皮书”，次要入口保留 PDF 原版。详情页独立输出 title、description、H1 和 canonical；生产构建使用配置中的正式域名，本地预览构建使用本地域名。sitemap 和 llms.txt 包含阅读页地址，但不承诺搜索引擎收录或 AI 引用。

## 本任务文件范围

本清单只列 PDF → HTML 功能的差异。任务开始前已有的导航更名、FAQ、Oracle 修复及配置变更不属于本功能，未回退或一并宣称为本次修改。

新增：

- `src/pages/supply-chain-whitepapers/[issue].astro`。
- `src/components/publications/WhitepaperArticle.astro`、`src/styles/whitepapers.css`。
- `src/data/whitepapers/1.json` 至 `14.json`、`types.ts`、`index.ts`。
- 阅读展示辅助 `src/data/whitepapers/presentation.ts`、派生图清单 `src/data/whitepaper-figure-assets.json`、对应 Vitest 回归 `tests/unit/whitepaper-presentation.test.ts`。
- `public/images/supply-chain-whitepapers/1/` 至 `14/` 中使用的局部 PNG。
- 阅读体验增量：`scripts/whitepapers/enhance_reading_images.py`、`tests/whitepapers/reading_images_test.py`，以及第 12、14 期 `reading/` 下的 31 张 WebP；不替换原 PNG。
- `scripts/whitepapers/convert_issue.py`、`convert_early_issues.py`、`convert_archives.py`、`ocr_sources.py`，以及 `native/`、`early/`、`ocr/` 的区域规则、OCR 来源目录与说明。
- `tests/unit/whitepaper-content.test.ts`、`tests/unit/whitepaper-source-contract.test.ts`、`tests/helpers/whitepaper-claim-source.ts`、`tests/helpers/whitepaper-source-pages.ts`、`tests/whitepapers/` 三份 Python 测试。
- `docs/whitepapers-*.md` 的源审查、转换说明、逐期复核与网页 QA 记录。

修改：

- 既有新栏目页 `src/pages/supply-chain-whitepapers.astro`：接入 HTML 阅读入口、目录及元数据。
- `src/components/publications/PublicationsHero.astro`、`PublicationsDirectory.astro`：主要 HTML CTA 与次要 PDF 入口。
- `src/pages/sitemap.xml.ts`、`src/pages/llms.txt.ts`：新增各期阅读页地址。
- `server/request-policy.mjs`、`tests/unit/request-policy.test.ts`：限定 1–14 详情地址的尾斜杠和未知期号规则。
- `tests/unit/claims.test.ts`：原刊历史正文的来源感知检查，不放宽当前公司指标注册表。
- `tests/formal/production-origin.spec.ts`：正式域名下的阅读页 canonical 与 301/404 契约（仅本地隔离测试）。
- `.gitignore`：忽略本功能 Python 缓存；`DEV_STATE.md` 与角色日志：记录实现和本轮验证状态。
