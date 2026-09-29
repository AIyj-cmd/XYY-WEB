# XYY-20260929-04 — 英文供应链白皮书资料页

## 目标、授权与风险

- 用户要求为 `supply-chain-whitepapers/` 增加英文版，并明确选择：英文资料页的标题、摘要、导航等文案英文；14 期报告 HTML 正文与 PDF 保留中文，阅读入口明确标注原文语言。风险 MEDIUM，Terra → Luna → Nova → Sol。
- 仅本地实现和验证；不提交/推送/部署，不执行真实 CMS、权限、数据库、schema 或内容写入，不引入自动翻译服务，不翻译报告正文或制作英文 PDF。
- 基线 HEAD `54b41d2388d34de5a8f6ddad2c32b77b1f75dfd5`；1393 文件哈希、既有 diff/status、五份状态/日志原字节及四路 SSR 基线保存在 `output/english-whitepapers/xyy-20260929-04/`。既有英文新闻、服务动效、治理文档和素材修改必须保留。

## Scope 与所有权

- Terra：新增 `src/pages/en/supply-chain-whitepapers.astro`；新增 `src/i18n/whitepapers*.ts` 及 `src/components/publications/English*.astro`，必要的专用英文样式；`src/i18n/routes.ts`、`src/pages/sitemap.xml.ts`、`src/pages/llms.txt.ts`、`src/components/news/EnglishNewsLanding.astro` 的最小发现入口增量；为尾斜线白皮书 canonical 正确配对，可最小调整 `src/components/Header.astro`、`src/components/layout/DocumentHead.astro`、`src/components/navigation/LanguageSuggestion.astro` 的路由匹配，其他路由行为保持。相关英文路由 unit 与新增 `tests/unit/english-whitepapers*.test.ts`；仅追加 `docs/TERRA.md`。
- Luna：新增 `tests/e2e/english-whitepapers*.spec.ts`、`tests/helpers/english-whitepapers*.ts`、必要的专用 Playwright config 与 fixtures；既有英文路由/语言建议 E2E 的必要预期更新（原未配对白皮书示例改为真实未翻译的中文报告详情）；仅追加 `docs/LUNA.md` 与本任务 luna 证据目录。不得改应用。
- Nova：只读审阅代码、翻译、源数据与证据；仅追加 `docs/NOVA.md` 与本任务 nova 证据目录，不改实现。
- Sol：本合同、`DEV_STATE.md`、`docs/SOL.md`、基线、测试协调与验收证据。
- 所有角色都不是独自在仓库工作，不覆盖/回退他人修改；不再委派。若需其他路径必须返回 Sol。日志不得全篇格式化，原历史字节保持。

## 可测试验收标准

1. 新英文资料页 HTTP 200，沿用英文站与中文资料页的视觉体系；hero、14 期标题/摘要、日期说明、FAQ、CTA、空状态和主要辅助文本均英文。报告封面上的原中文可保留。
2. 每个 HTML/PDF 阅读入口明确说明中文原文，目标仍为当前对应中文阅读页/原 PDF；不生成假的英文报告详情、英文 PDF 或它们的 hreflang/sitemap。第 10 期既有日期来源冲突必须在英文中保留，不臆造确定日期。
3. CMS 返回成功空目录/FAQ时英文保持空；网络/超时/5xx沿用审核回退，401/403和非法响应明确失败。目录只来自实际 CMS 可用期次与现有转换目录；标题/摘要翻译绑定已核对源元数据，未知或改写来源不套用错译，不泄露中文正文为英文摘要。沿用安全媒体与链接约束。
4. 英文页有独立 canonical、正确 reciprocal hreflang和双向语言切换；中文目录尾斜线canonical与语言建议一致。英文 Insights 提供入口，当前资料页归入 Insights 活动态；sitemap/llms包含英文资料页。已完成的其他英文页面与英文新闻配对保持。
5. 中文目录及中文报告正文、链接、媒体、title保持基线；本轮仅新增有效目录语言配对。中文报告详情仍为未翻译页面。现有英文新闻主内容仅允许增加资料入口。
6. 桌面1440及手机390/360可读可操作，无标题/按钮截断、导航遮挡或页面横溢；验证FAQ、阅读/下载链接和语言入口的实际交互。
7. 相关单测、类型/lint/维护预算、构建及独立浏览器验证通过；Luna PASS、Nova APPROVED后Sol验收。文档收尾仅检查diff/格式。未执行线上行为，不以本地模拟替代线上验收。

## 输入与证据

- 事实输入：现有中文目录、`src/data/whitepapers/*.json` 的标题/摘要/刊期及其来源标记、现有 publications CMS读取契约与FAQ。原CMS fallback的通用期刊摘要/年份与转换资料元数据不完全相同，英文目录以中文目录实际显示的转换元数据为准。
- 证据：实际命令/退出码、源绑定和CMS边界单测、mock→SSR响应、三宽布局与代表截图、中文基线对比、最终路径hash及范围外保护、角色审阅记录。
- 环境已知限制：根盘剩余空间约21MB，不得擅自清理旧证据/容器/用户文件；浏览器临时资料优先使用已授权方式下的任务独占内存临时目录，问题如实记为环境阻塞并返回Sol。

## 本地验收结果

- Terra 实施及返工完成，Luna 最终 PASS，Nova APPROVED，Sol 验收 CLOSED（本地）。最终 19 个代码/测试文件冻结，1379 保护路径无漂移；全部 AC 在约定本地验证范围内达成。
- 最终 `npm run verify` exit 0：571 类型文件零诊断、740 维护文件、90 文件/578 单测及 lint/资产/build 通过。白皮书 6、新闻 8、导航/语言 2 项浏览器用例通过；随后仅更正截图滚动测试并单独复测布局 1/1，应用未变。四张有效代表图完成独立复核，初次失败与无效截图不计通过。
- 执行时根盘可用空间已回升约144MB，实际使用任务独占 `/tmp` 临时目录并清理自身资源，未清理用户/旧任务文件。最终预览 `http://127.0.0.1:4322/en/supply-chain-whitepapers` 为 200。
- 未提交、推送、部署、写入真实 CMS/数据库/权限或运行 `verify:release`；本地 mock/offline CMS 与 Chromium 模拟视口证据不能替代未来线上验收。完整结果见 `output/english-whitepapers/xyy-20260929-04/sol/final-acceptance.json`。
