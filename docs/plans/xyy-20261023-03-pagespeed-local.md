# XYY-20261023-03 — PageSpeed 细节优化与 HSTS 本地候选

## 授权、基线与风险

- 用户授权：“ok，修复这些问题在本地”。仅本地文件、构建和隔离测试；不提交、推送或部署。
- 基线：`33acf4b644b7d4d76d5627c29c73802203710601`，开始时 `main` 工作区干净。
- 风险 HIGH：涉及静态资源缓存与 HSTS/HTTP2 配置候选；执行 Terra 实现 → Luna 独立验证 → Nova 审阅 → Sol 验收。
- 当前生产 release 不变。旧服务器模板不作为实施目标，不连接服务器、CMS、数据库或真实询盘接收端。
- 本地安装的 Astro 为 7.2.8，而锁定依赖为 7.3.3；最终测试须在排除真实环境文件的隔离副本按锁文件安装。

## 输入

- 用户提供的 Google 报告：`https://pagespeed.web.dev/analysis/https-56xyy-com/khe0osqxpj?hl=zh-cn&form_factor=desktop`。
- 桌面/手机原始报告：`/home/yj/data/56xyy-pagespeed-20261023/psi-recovered-{desktop,mobile}.json`。
- 已读取的现网 Nginx 快照：同目录 `server/config-network.txt`，只采用开头完整 Nginx 配置段。
- 当前组件图已通过 graphify query 查询；实际源码和本次测试优先于历史图。

## 文件所有权

- Terra 页面：`src/styles/conversion-cta.css`、`src/styles/home-fulfillment/steps.css`、`src/scripts/home-page.ts`、新增动画加载模块、`src/scripts/language-suggestion.ts`及直接相关前端测试。必要时修改首页/语言提示组件，禁止改变业务文案和内容契约。
- Terra 传输：`scripts/generate-site-images.mjs`、`src/data/site-images.json`、两组新增内容哈希图片、`server.mjs`静态缓存及必要辅助模块、`astro.config.mjs`受限 CSS 内联、新原生 Nginx 候选与说明、直接相关单测。
- Luna：独立测试证据及必要行为测试，不修改实现。
- Nova：只读审阅，输出问题与结论，不修改实现。
- Sol：本合同、状态与角色记录、最终证据整合；协调所有权，不覆盖并行代码。
- 所有证据保存 `output/pagespeed/xyy-20261023-03/`，禁止复制真实 `.env`、私有配置或凭据到测试副本/证据。

## 验收标准

1. “咨询仓配”及手机流程编号 01–07 的普通文本对比度至少 4.5:1，布局与品牌主视觉保持。
2. 首页标题、正文、按钮不依赖动画包即可显示；非首屏动画按需加载且只初始化一次。滚动、键盘导航、统计数字、案例交互与 reduced-motion 可用。
3. 语言提示显示、关闭、语言选择和尺寸适配保持；减少布局写入后的同步读取。
4. 首屏和鞋服云仓图片变体比原生成版本更小，原图与旧 URL 保留；生成器检查可重复，其他图片不改变。
5. 只有确认的内容哈希生成图片使用一年 immutable 缓存；普通图片、字体、PDF、HTML和API策略保持。
6. 小 CSS 可内联减少阻塞请求；可执行脚本始终外链，CSP 不放宽，双端无样式缺失和横向溢出。
7. 新 Nginx 候选从本次现网快照最小派生，HTTP2 启用、主域/www HSTS 为初阶段 7 天。保留其余路由、代理和证书路径；无 includeSubDomains/preload。说明后续 30 天/1 年阶段及本地验证限制，不声称全部 HSTS 提示已经消失。
8. 目标行为测试、类型/格式检查及构建通过；桌面和手机实际浏览器检查通过；安全/缓存相关回归通过。完整 verify 在隔离副本运行一次，失败按证据修复，不降低门禁。
9. 本地 Nginx 语法与 HTTP2/HSTS 行为在可用的隔离运行时验证；若运行时不可用，明确记录限制，不以静态匹配冒充运行验证。

## 排除项

- Git 提交/推送、生产部署、远程 Nginx/TLS/DNS/防火墙/权限操作、真实 CMS 与数据库读写、真实询盘发送。
- 依赖升级、改变 HTML 缓存或 CMS 数据规则、删除原始图片/旧生成 URL、重构站点、SEO URL 迁移。
- HSTS 子域覆盖与预加载。分阶段策略需要实际运行观察，本地测试无法替代生产观察时间。

## 交付状态

- 本地验收 LOCAL_READY 后，已按用户后续授权由 `XYY-20261023-04` 同步 GitHub：应用提交 `a95c9ce6495afd0efd182188b20b471595f49e40`。Terra 实现、Luna 独立验证、Nova 审阅与 Sol 验收完成，20 个实现文件保持冻结；未部署。
- fresh npm ci 使用锁定的 Astro 7.3.3 / Node 24。完整 `npm run verify` 通过：775 类型文件零错误/警告、156 测试文件/1140 单测及构建；格式、维护预算、资源和缓存检查通过。
- 桌面/手机浏览器 95 项通过、5 项既有条件跳过、零失败。新增动画行为双端 10 项均通过；语言提示、案例交互、无 JS、reduced-motion、响应式和键盘操作通过。实际 viewport 导航位置正常，无横向溢出。
- 同依赖前后对照：首屏 CSS 请求 7→4，无内联可执行 JS，CSP 不变；8 处文字对比度最低 4.9169。两组图片六变体减少 11.90%–14.30%，16 原图、49 旧 URL 和其他 14 图组保持。
- 实际 HTTP 缓存 69 项通过；隔离 Nginx 1.30.6 语法及 13 项 HTTP/2、HSTS、重定向、ACME、CMS mock 和错误响应检查通过。新版 Nginx 的旧式 HTTP/2 语法弃用提示与容器 nofile 警告保留，实际服务器版本与证书仍属于部署阶段验证。
- 首轮发现的 TypeScript 模块作用域冲突已修正；第二轮测试缓存误入源码扫描仅调整隔离环境；HTTP 探针的既有 API 状态/缓存及条件请求假设均通过基线对照纠正。原失败日志保留，没有放宽应用规则或断言。
- 核心证据：`output/pagespeed/xyy-20261023-03/luna/final-summary.json`、`nova/review.json`、`sol/source-acceptance.json`。本地测试不构成生产部署、新 PageSpeed 分数或其他浏览器的验证结论。
