# XYY-20261020-09 — 行业动态首屏文案与字号

- LOW，Terra → Luna → Sol。用户要求首屏文案字号加大，并试一版新文案；中英文同步。
- HEAD `a0994d9b11d9a0898913980a05a9651962360445`，保留所有既有脏改动。当前独立后台预览 4321 / PID 98418 身份核验通过，不能关闭或替换该进程。
- 范围：仅首屏文案与排版，保留上一任务满屏高度、图片、渐变、分类栏及后续内容。

## 所有权

- Terra：`src/components/news/NewsLandingIntro.astro`、`src/components/news/EnglishNewsLanding.astro` 的首屏文案/排版类，`src/styles/news.css` 的首屏专用样式；`docs/TERRA.md` 追加结果。
- Luna：独立浏览器验证和 `output/playwright/xyy-20261020-09/luna/` 原始证据，`docs/LUNA.md`；仅同步 `tests/e2e/service-pages.spec.ts` 与 `tests/e2e/english-news-fixture.spec.ts` 各一处旧 H1 文案断言，不改其他测试逻辑。
- Sol：本合同、选定文案、最终视觉验收、`DEV_STATE.md` 和 `docs/SOL.md`。
- 所有角色不是唯一工作者，不回退他人修改，不再委派。改前源码和两测试在证据根目录 `baseline/`，77 份非目标保护文件在 `protected.json`。

## 选定文案

中文眉题：行业洞察 · 仓配实务

中文 H1 两行：看见行业变化 / 读懂鞋服仓配

中文配文：聚焦鞋服行业趋势，分享仓储履约、品质管理与退货处理的思考和实践。

英文眉题：Industry & operations

英文 H1 两行：Industry insights. / Apparel operations.

英文配文：Explore industry trends and practical perspectives on apparel fulfilment, quality management and returns.

## 实施与排除

标题使用专用类和两个 block 文本片段实现自然两行；建议 `font-size: clamp(2.75rem, 6vw, 5.5rem)`（手机 44px、1440 桌面 86.4px，旧为 36/48px），紧凑但不裁切的行高约 1.1。配文建议 `clamp(1.25rem, 1.7vw, 1.5rem)`，手机 20px、桌面 24px，行高约 1.65；允许必要的首屏段间距与标题最大宽度调整，保持横向内容容器和导航安全留白。通过首屏专用选择器避免影响正文与文章页，移除本处冲突的旧字号/行高类。

英文组件仍须满足 180 行预算，不增加抽象、脚本或无关压行。保留原 H1 id/aria 引用、图片路径/尺寸/裁切/渐变、100vh/最低 600px、分类链接和列表/FAQ、CMS/API、claims、SEO metadata、Header/Footer/Home/Cases；不添加新事实、数字、CTA、素材或新测试。未授权提交、推送、部署、远程访问或真实 CMS/数据库操作。

## Acceptance Criteria 与证据

1. 中英首屏为上述新文案且各有一个 H1；1440px 桌面标题至少 80px、390/360 手机至少 42px；介绍文字分别至少 22px/20px，无截断、横溢或导航遮挡。
2. `/news`、`/en/news` 在 1440×900、768×1024、390×844、360×640、1440×600、360×560 六种视口，hero 高度为 `max(innerHeight,600)`；背景正常、文字全部在容器内、分类栏紧随首屏。英文必要的自然折行可多于两行，不能强制 nowrap 造成溢出。
3. 原分类 href、文章页排版和 77 份保护文件保持；两条已有标题测试断言同步，并在真实浏览器用相同 role/name 选择器确认唯一命中。
4. Terra 交精确增量、目标格式/Lint/diff/维护预算与 hash 后冻结；Luna 再独立验证，原始 CLI 输出直接保存，中英桌面/手机四张代表截图等待字体和首屏图后拍摄并实际读图。
5. 本次静态改动不新增测试，不运行会重新构建的整套 E2E、全量 verify/typecheck/build；明确区分浏览器定向验证与未执行的原整条 CMS 测试，不把旧证据当本次通过。Sol 看最终截图、核对日志/候选后验收，遇失败沿用本 ID 返工。
