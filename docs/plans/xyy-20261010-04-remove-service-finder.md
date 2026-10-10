# XYY-20261010-04 — 移除按需求选择服务

- 风险：MEDIUM，删除页面交互入口与服务选择模块；流程 Terra → Luna → Nova → Sol。
- 授权：用户要求删除截图中的“按需求选择服务”模块及首页按钮；本次仅本地修改，连同产品页和英文对应入口及失效链接清理。
- 基线：HEAD `af20f11be11d1f5e8c3af0d982f7ccd8b79fa608`；既有脏文件仅 DEV_STATE.md、README.md、docs/SOL.md，完整内容快照 `/tmp/xyy-20261010-04-baseline.json`。现有本地开发服务 `http://127.0.0.1:4322`；4321 另有原有服务，不操作。

## 范围与文件所有权

- Terra：移除 `src/components/home/HomeCoreSolutions.astro` 按钮及其独占外层间距；移除 `src/components/product/ProductVideoSequence.astro` 同类按钮/变量及 `src/styles/product/video-sequence-responsive.css` 中仅其使用的样式；从 `src/pages/contact.astro`、`src/components/en/EnglishContact.astro` 移除 ServiceFinder 导入和渲染；删除孤立的 `src/components/service-finder/ServiceFinder.astro`、`src/styles/service-finder.css`；更新 `src/pages/llms.txt.ts` 的两处已失效服务选择链接；维护 `tests/e2e/consultation-service-finder.spec.ts` 中依赖旧 UI 的断言，保留仍有效的咨询功能覆盖。只追加 docs/TERRA.md 本次结果。
- Luna：独立验证上述最终变更；可写 output/playwright/xyy-20261010-04/ 证据及 docs/LUNA.md 追加记录；不改实现，如需修复返回 Sol。使用项目已有 E2E 测试和 CLI 浏览器检查；本次没有新增测试文件要求。
- Nova：只读审查最终差异、Luna 证据、范围及契约，仅追加 docs/NOVA.md；不改实现。
- Sol：本合同、DEV_STATE.md、docs/SOL.md、最终验收。所有代理不得再委派，不得覆盖其他人的修改。

## 排除项

- 不修改 ContactForm、contact-source、咨询 API、CMS、数据库、Claims、服务内容、视频/动画逻辑、导航或其他业务功能。
- 保留既有 need/region/case 查询参数兼容与咨询上下文解析，不将删除 UI 扩大为共享转换逻辑重构。
- 不提交、推送、部署，不操作真实表单提交或真实外部写入；测试提交必须 mock 拦截。
- 不操作 4321/4322 现有服务进程；测试若需独立环境使用空闲端口且关闭自己创建的进程。

## 验收条件

1. `/`、`/en`、`/product`、`/en/services`、`/contact`、`/en/contact` 均不再出现目标文案、服务选择折叠块或指向 `#service-finder` 的入口。
2. 删除专属组件、样式及引用，首页不保留仅用于该按钮的空容器/留白；llms.txt 不再宣称或链接被删除功能。
3. 中英文联系页联系方式、咨询表单和填写提纲保留可用；旧查询参数兼容、案例上下文及失败重试行为保持，禁止真实 POST。
4. 当前相关源码格式检查、类型检查、相关转换单测和受影响 E2E 通过；如果发现既有过期断言，明确说明并只按现有页面事实维护断言，不改变对应实现。
5. 六个路由均完成桌面 1440 与手机 390 视口验证，HTTP 成功、主要内容可见、无水平溢出及页面异常；截图可复核首页删除位置和联系页表单区域，无明显残余空白。
6. 保留基线文档及范围外文件。适用的 Luna PASS、Nova APPROVED 后 Sol 验收；记录真实限制。

## 输入与预期证据

输入为用户两张截图、当前源码、上述 Git 基线与本地服务；Graphify 旧图仅辅助定位，不证明当前依赖。
交付需提供准确修改文件、命令/退出码、E2E 结果及桌面/手机截图路径。浏览器检查采用 Playwright skill；不因文档记录重跑完整验证。没有提交/部署时不触发完整 verify/verify:release。

## 当前结果

- Terra 已完成九个源码/测试文件的限定改动，专属组件/样式已删除；共享咨询解析和表单不变。
- 目标 Prettier/diff check PASS，typecheck 647 files、0 errors/0 warnings/4 既有 hints，conversion-source 7/7。
- Luna PASS：受影响 E2E 最终 8/8（桌面/手机各 4），六路由双端 12/12 HTTP 200、无目标入口/锚点、无横溢/pageerror。首轮 E2E 一次导航上下文中断保留，未改实现，同命令复测通过。
- Nova APPROVED，无阻断 finding；Sol 已核对最终差异、既有文档基线、首页前后和联系页截图、手机首页最终加载截图，以及实际 llms.txt 响应，AC 1–6 达成。
- 证据 `output/playwright/xyy-20261010-04/`；手机首页最终截图为 Luna 目录 `*-loaded.png`，初版动画未完成截图保留。
- 本地 4322 已生效；未提交、推送或部署，未真实表单提交或直接执行 CMS/数据库操作。验证限本地 Chromium 模拟视口，未覆盖真机/Safari/微信和生产站。
