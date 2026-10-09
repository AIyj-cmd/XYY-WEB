# Luna

返回 [Sol 调度入口](SOL.md)。

## Role

Independent QA / Test Engineer。

模型：`gpt-5.6-luna`；推理等级：`high`。

## Responsibilities

- Bug reproduction、功能测试、回归测试和边界条件验证。
- Vitest、Playwright、桌面端、移动端和 API 行为验证。
- CMS fallback 行为验证与必要的测试代码维护。

## Boundaries

- 保持独立测试角色；除测试代码外，原则上不修改应用代码。
- 发现业务代码错误时向 Sol 报告，不直接修复或指挥 Terra。
- 不部署、不修改生产环境、不写生产 CMS、不操作数据库，不处理 PostgreSQL → Oracle 19c。
- 遵守根目录 `AGENTS.md`，保留用户修改，不泄露 Secret，不使用破坏性 Git 操作。

## Test Workflow

1. 接收 Task ID、Acceptance Criteria、Terra 结果或 diff 和风险重点。
2. 选择与风险匹配的功能、回归、桌面、移动、API、CMS fallback 与边界测试。
3. 保存可复现证据，明确 PASS 或 FAIL。
4. 只向 Sol 交付结果；复测沿用原 Task ID。

## PASS Contract

- Task ID。
- `Result: PASS`。
- Tests performed。
- Regression coverage。
- Remaining risks。

## FAIL Contract

- Task ID。
- `Result: FAIL`。
- Expected 与 Actual。
- Reproduction 与 Evidence。
- Likely affected area。
- Severity。

## Work Log

### XYY-20260923-01 — staging 发布后独立只读 QA

Task ID: XYY-20260923-01

Result: PASS

Tests performed:

- 执行 staging 专用短 probe，仅访问 `https://wz.tomatopia.top`，两个 Playwright context：1440×900、390×844。`/version` 返回精确 SHA `330969d65af52c1333c30d496983c65dcc15a992`、release `20260924T040212Z-330969d`、environment `staging`。
- 两端首屏均仅附加 `01-overview` 与 `02-returns` source，后六段禁止请求为空；当前 `01-overview` 为唯一 active，`muted=true`、`loop=true`、`controls=false`、`readyState=4`。下一段 source attach 时记录 active current `readyState=4`。
- 点击下一段后第二视频均播放；进入 assurance 后 8 个视频全部 `source=null` 且 `paused=true`；返回首段后恢复原 source 和静音循环播放。两端均无横向溢出、console error 或 pageerror。
- 等待口径校正：原始 JSON 的 `initialWaitMs` 是完整 viewport journey 累计时长（1440 为 8612ms、390 为 6657ms），不是首屏等待；DCL 后 current+next source budget 的 `initialBudgetWaitMs` 分别为 657ms、537ms。下一段/assurance/返回首段等待分别为 238/961/964ms 与 225/844/942ms。媒体响应均为 HTTP 206；每端 15 个 requestfailed 为切换释放 source 的预期取消，不是 HTTP 错误。

Regression coverage: staging version identity、桌面/移动 source budget、当前优先与播放属性、第二段切换、静态 assurance 释放、返回首段恢复、无横溢、无运行时错误、首屏及静态 assurance 截图。

Evidence: [luna-staging-post-qa.json](../output/performance/xyy-20260923-01/luna-staging-post-qa.json)、[AC check and timing correction](../output/performance/xyy-20260923-01/luna-staging-post-qa-checks.md)、[1440 first](../output/playwright/xyy-20260923-01/staging/post-qa-1440x900-first.png)、[1440 assurance](../output/playwright/xyy-20260923-01/staging/post-qa-1440x900-assurance.png)、[390 first](../output/playwright/xyy-20260923-01/staging/post-qa-390x844-first.png)、[390 assurance](../output/playwright/xyy-20260923-01/staging/post-qa-390x844-assurance.png)。

Remaining risks: 验证限线上 headless system Chrome 与两个模拟视口，未覆盖真实设备、其他浏览器或正式站；未提交表单、写 CMS/数据库或访问正式站。字节总量未作为本次判据，响应仅记录完成 MP4 请求的状态与头部。

Handoff: 独立 staging QA PASS，返回 Sol；浏览器 session 已关闭，未修改应用实现、永久测试、CMS、数据库或部署配置。

### XYY-20260923-01 — staging post-QA probe 准备

Task ID: XYY-20260923-01

Status: READY（未执行线上请求）

已准备 [post-qa-short.mjs](../output/playwright/xyy-20260923-01/staging/post-qa-short.mjs)，固定 `https://wz.tomatopia.top`、目标 SHA `330969d65af52c1333c30d496983c65dcc15a992` 与 `staging` 身份校验；仅覆盖 1440×900、390×844 两个 context。脚本在 page.goto 前监听视频请求，检查首屏 current+next source budget、后六段零请求、next attach 时 current readyState、第二段播放、assurance 全 source/playback 释放、回到首段恢复、overflow、console/pageerror，并保存首屏/静态截图与等待时长。`node --check` 已通过。

Evidence: [post-qa-short.mjs](../output/playwright/xyy-20260923-01/staging/post-qa-short.mjs)。

限制：等待 Sol 完成目标版本 staging 发布后再执行；本次未访问验收站、未提交表单、未操作 CMS/数据库或生产环境。

### XYY-20260923-01 — 修复后独立 E2E 与四视口媒体 probe

Task ID: XYY-20260923-01

Result: PASS（修复后独立复测）

Tests performed:

- 候选原生 Playwright config 执行 `CI=1 PLAYWRIGHT_PORT=4411 PLAYWRIGHT_BROWSERS_PATH=/home/yj/.cache/ms-playwright npm run test:e2e -- tests/e2e/product-video-loading.spec.ts tests/e2e/product-motion.spec.ts tests/e2e/product-video-sequence.spec.ts`：Chromium/mobile 共 14/14 passed，1.5m，退出码 0。证据：[luna-resume-final-e2e.log](../output/performance/xyy-20260923-01/luna-resume-final-e2e.log)。
- 独立 system Chrome probe 覆盖 360×640、844×390、1440×900、390×844：首屏均仅 `01-overview` 与 `02-returns` attached，后六段禁止请求数为 0；下一段 source setter 记录时当前播放视频 `readyState=4`；8 段顺序、快速前后跳转、resize 后均保持当前视频 muted/loop/playing。360/844 与 844/390 进入 assurance 后 8 段 source 全部为 null 且 paused，反向回 08 恢复原 source、muted、loop、playing；四视口 console/pageerror 均为空。
- 复核候选 16 个媒体与 33 个保护文件 SHA-256：0 mismatch；结果见 [luna-resume-hash-check.txt](../output/performance/xyy-20260923-01/luna-resume-hash-check.txt)。响应记录均为 HTTP 206；请求取消计数为 source 释放时的预期取消，不作为 HTTP 故障。字节字段仅记录 completed MP4 response 的 `Content-Length` header，不宣称总线传输量。

Regression coverage: 产品媒体 source budget、当前优先的 readyState 顺序、视频可见性与静音循环、静态保障区释放/反向恢复、8 段导航与快速跳转、resize、首屏与保障区截图、无 pageerror/console error、16 媒体及 33 保护 hash。截图和完整 JSON：[luna-resume-probe.json](../output/performance/xyy-20260923-01/luna-resume-probe.json)、[implementation probe screenshots](../output/playwright/xyy-20260923-01/implementation/)。

Remaining risks: 尚未执行项目级 `npm run verify`/`verify:release`，未覆盖真实设备、其他浏览器、生产环境或验收站线上 BASE_URL；未操作 CMS/数据库、提交、推送或部署。验证使用候选已构建版本和 headless system Chrome，Directus 网络不可达时按既有静态 fallback 运行。

Handoff: 独立验证 PASS，返回 Sol；Luna 未修改应用实现、业务测试、CMS、数据库或部署状态，已停止自有 4411 server。

### XYY-20260923-01 — assurance 静态区 360×640 独立 probe

Task ID: XYY-20260923-01

Result: FAIL

Expected: 360×640 进入第 9 个静态保障区后，assurance 不附加视频 source、不播放，当前/下一视频均释放。

Actual: assurance slide 实际高度 `1230.921875px`，视口高度 `640px`；以既有 scroll container 为 root 的 IntersectionObserver 实测 ratio `0.5199354887008667`，低于实现固定的 `0.55` 门槛。页面状态显示 `09 / 09`，但 `08-b2b-stores` 仍附加原始 source、`paused=false`、`readyState=4`；其余视频 source 已释放。

Reproduction: 候选已构建版本启动 `server.mjs` 于 4411；system Chrome 360×640 打开 `/product`，将现有 scroll container 滚动到 `scrollHeight - clientHeight`，等待 800ms，读取 assurance 几何、IntersectionObserver ratio 与 8 个视频状态。

Evidence: [luna-resume-probe-assurance-360.json](../output/performance/xyy-20260923-01/luna-resume-probe-assurance-360.json)、[luna-resume-assurance-360x640.png](../output/playwright/xyy-20260923-01/implementation/luna-resume-assurance-360x640.png)。

Likely affected area: `src/scripts/product-video-media.ts` 的固定 `intersectionRatio < 0.55` 选中门槛与高度超过视口的 assurance slide 交互。

Severity: HIGH（静态保障区进入时仍播放并保留最后视频 source，违反媒体释放 AC）。

Handoff: 已立即返回 Sol → Terra 返工；Luna 未修改实现或业务测试，已停止自有 4411 server，未继续其他视口 probe。

### XYY-20260923-01 — 恢复后 loading 定向复测

Task ID: XYY-20260923-01

Result: PASS（loading 定向复测）

Tests performed:

- 在候选目录使用候选原生 `playwright.config.ts`，命令 `CI=1 PLAYWRIGHT_PORT=4411 PLAYWRIGHT_BROWSERS_PATH=/home/yj/.cache/ms-playwright npm run test:e2e -- tests/e2e/product-video-loading.spec.ts`，实际 `4 passed、0 failed`（Chromium/mobile 各 source budget 与生命周期 1 项、no-JS fallback 1 项），退出码 0，耗时 25.5s。
- Webserver 自动启动并结束；Directus 网络失败按静态回退运行。证据：[luna-resume-loading.log](../output/performance/xyy-20260923-01/luna-resume-loading.log)。

Regression coverage: 初始当前/下一段 source 预算、后六段零请求、当前媒体优先后准备下一段、跳转与回退释放、visibility/pagehide/pageshow 生命周期、静态 assurance 无视频，以及无 JS 首段 native autoplay 与后续 poster/text fallback；桌面与 mobile 两个 project 均执行。

Remaining risks: 尚未在本条复测完整 `npm run verify`/`verify:release`，也未执行后续桌面/移动视口视觉 probe；未涉及部署、CMS/数据库或生产环境。此前使用 root/output config 的一次命令仅因 root/candidate Playwright 混载报测试环境错误，不作为业务结果；本条使用候选原生 config 的 4 项结果为有效证据。

Handoff: 返回 Sol；未修改应用、永久测试、候选、CMS、数据库或部署状态。

### XYY-20260921-03 — 两项准确率更新独立页面验证

- Result: PASS（限定本次独立浏览器检查）。Luna执行`output/playwright/xyy-20260921-03/luna_resume/claims-browser-qa.sh`，完成鞋服云仓及产品保障区1440/390四组合；4份原始`### Result` JSON均为PASS，数值100%、无附加+或旧99.99%、18:00/24:00保持、无横向溢出。截图保存于同目录。
- Sol解析原始JSON并查看桌面/手机代表截图，归档至`browser-result-check.json`；首个未完成的luna_claims03会话不作为通过证据。最终浏览器会话已按脚本关闭。
- 限制：仅本地Chromium模拟视口；本轮Luna没有独立重跑Terra单测，也未运行全量verify/build、CMS/数据库或部署。Terra单测与既有全局扫描的8条违规另见其交付记录，未声明全套测试通过。
- 本条由Sol依据Luna已执行的独立原始证据整理；验证完成后会话已停止，不留后台验证任务。未修改应用实现或永久测试文件。

### XYY-20260916-05 — B2B 门店仓配七区独立验收

Task ID: XYY-20260916-05

Result: PASS

Tests performed:

- `npx vitest run tests/unit/service-redesign-b2b.test.ts`：1 file、4/4 passed。覆盖六项能力与四类统计分组、精确旧文案映射、自定义/空/近似/未知值保留及输入不变。
- `npx vitest run --config output/playwright/xyy-20260916-05/luna/b2b-render.vitest.config.ts`：1 file、7/7 passed。AstroContainer 离线夹具覆盖全空、仅自定义 contentDesc、仅 FAQ、未知分货关键词能力/指标、空 FAQ，以及仅分货或仅库存区时已知说明的唯一落点。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-b2b.spec.ts --project=chromium --project=mobile --workers=1`：最终冻结版 6/6 passed。验证七区顺序、单个 B2B H1、六项能力、四类统计含义、五 FAQ 与 FAQ Schema 相同、Service Schema 与 meta 一致、canonical 路径、成对费用说明、原视频/poster 与静音播放时间推进、FAQ 键盘/减少动效/no-JS 行为，以及 1440/768/390 三端尺寸。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-pages.spec.ts --grep 'shared service landing layout renders every visual variant' --project=chromium --project=mobile --workers=1`：最终 ServiceLanding 冻结版 2/2 passed。
- 三视口截图：[1440](../output/playwright/xyy-20260916-05/luna/b2b-1440.png)、[768](../output/playwright/xyy-20260916-05/luna/b2b-768.png)、[390](../output/playwright/xyy-20260916-05/luna/b2b-390.png)。首次宽泛 `h1` 选择器误命中隐藏的 Astro 开发工具 shadow DOM，已改为 `.b2b-page h1`；最终结果通过。初始输出及复测输出均保留。

Regression coverage: B2B 七区结构和次序、六项能力与四类统计语义分组、旧稿精确转公开文案与 FAQ、未知和自定义 CMS 值原样保留、描述不重复、费用条件相邻、公司整体规模数字归属、Schema/meta/canonical 同源、媒体原地址与实际播放、三联对象与费用的可见性、平板/手机堆叠与无重叠/横溢出、原生 FAQ 键盘及 no-JS，以及冻结后的共享服务路由矩阵。

Evidence: [result.json](../output/playwright/xyy-20260916-05/luna/result.json)、[B2B 单测](../output/playwright/xyy-20260916-05/luna/b2b-unit-final.stdout.txt)、[AstroContainer](../output/playwright/xyy-20260916-05/luna/b2b-render.stdout.txt)、[最终 B2B E2E](../output/playwright/xyy-20260916-05/luna/b2b-e2e-final.stdout.txt)、[最终共享矩阵](../output/playwright/xyy-20260916-05/luna/shared-service-pages-final.stdout.txt)。最终源哈希：`ServiceLanding.astro` `41554a98d55e812232cec144cb708f607412a871b282b6959851a2c9605affb6`；`b2b-content.ts` `c9b76c0e54cfdde5358e23617cdede471f4575c93dce838dc836ea09e51d8817`；`b2b-public-copy.ts` `7645a19ca8c315af1d206b1617b541ab34dba258a54229706bcf5fd2de814409`。测试 SHA-256 见 `result.json`。

Remaining risks: 浏览器复用本地 `127.0.0.1:4322`，不据此推断 CMS/fallback 连接状态；AstroContainer 数据为离线 fixtures。三种尺寸为 headless Chromium 模拟，没有实体设备或其他浏览器覆盖。项目级 typecheck 仍有既有 `tests/e2e/service-redesign-live.spec.ts:52` implicit-any 诊断，属于本 Task 范围外；由 Sol 记录项目静态门禁状态。

Handoff: 返回 Sol → Nova；Luna 只修改了授权 B2B 测试入口、任务证据和本日志，没有改应用实现、CMS、数据库、生产环境或部署状态。

### XYY-20260913-02 — E2E 选择器修复后终端复测

Task ID: XYY-20260913-02

Result: PASS（定向复测；首轮合并命令的 6 PASS + 本次 2 PASS = 8 PASS、0 FAIL）

Tests performed:

- Terra 将 `tests/e2e/home-product.spec.ts:154` 的数字开头 ID 动态选择器改为合法的 `[data-product-video][id="${id}"]`；本次只执行此前失败的定向命令：`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts --grep 'product page presents eight muted videos' --workers=2`。
- 复用本地 `127.0.0.1:4322`，Chromium 与 mobile 各 1 项实际通过，退出码 0，结果为 `2 passed、0 failed`（7.7s）。首轮原始结果保留为 `6 passed、2 failed`，两项均为同一非法 selector 测试缺陷，非业务断言失败。

Regression coverage: 与首轮 `product-motion`、360px 溢出及 `home-product` 其余已通过结果合并后，指定 8 项 E2E 达到 8 PASS；此前独立媒体 ffprobe/完整解码、SSR/8 详情直 GET 与 1145 项保护 hash 均已 PASS，本次未重复运行。

Evidence: [luna-terminal-e2e-retest.txt](../output/playwright/xyy-20260913-02/luna-terminal-e2e-retest.txt)、[luna-terminal-e2e.txt](../output/playwright/xyy-20260913-02/luna-terminal-e2e.txt)、[luna-terminal-media.json](../output/playwright/xyy-20260913-02/luna-terminal-media.json)、[luna-terminal-ssr.json](../output/playwright/xyy-20260913-02/luna-terminal-ssr.json)、[luna-terminal-hash.json](../output/playwright/xyy-20260913-02/luna-terminal-hash.json)。

Remaining risks: 仅验证本地 4322 的 Chromium/mobile 模拟，未运行 build/fullverify、真实设备、部署或生产环境；本次未修改应用、媒体、CMS、数据库或外部环境。

Handoff: 返回 Sol；仅新增本 Task `luna-terminal-*` 证据并追加本日志复测记录。

### XYY-20260912-02 — 视频文字叠加返工独立验收

Task ID: XYY-20260912-02

Result: PASS

Tests performed:

- 使用独立 Playwright CLI session 在本地 `127.0.0.1:4322/product` 验证最终遮罩修正版。1440×900 与 390×844 的七个 slide/video 矩形逐项相等（桌面 1440×900、手机 390×844），实际 H1/H2、段落和链接文字盒均位于对应视频内；video `object-fit: cover`、854×480 natural size、`autoplay`/`muted`/`loop`/`playsinline` 保持，controls 为 false。布局为单一滚动容器，scroll-snap 为 `y mandatory`，body 与页面均无横向溢出。
- 叠加证据确认 copy 背景为透明、`::before` 为渐变，未出现独立纯色文字带或段间白线；header 与胶囊的实际文字盒均不与文案相交，胶囊按钮均为44px。七个 href 顺序保留；首个服务链接实际导航到 `/xiefu-yuncang` 并返回 product。
- 桌面胶囊点击、wheel、Home/首段禁用、链接 focus-visible 通过；移动 390×844 真实 CDP touch swipe 到 `02 / 07` 后点下一段到 `03 / 07`，菜单开关后胶囊仍可见，reduced-motion 下滚动行为为 `auto` 且点击即时到 `02 / 07`。360×844 与 844×390 补充检查均为一段一视口、文字在视频内、无横向溢出，短横屏七段高度均390px。
- 已查看最终普通鼠标截图：[luna-desktop.png](../output/playwright/xyy-20260912-02/overlay-rework/luna-desktop.png)、[luna-mobile.png](../output/playwright/xyy-20260912-02/overlay-rework/luna-mobile.png)、[luna-landscape.png](../output/playwright/xyy-20260912-02/overlay-rework/luna-landscape.png)。桌面/手机浏览器 warning、error 与 pageerror 均为0；明细见 [luna-desktop.txt](../output/playwright/xyy-20260912-02/overlay-rework/luna-desktop.txt)、[luna-mobile.txt](../output/playwright/xyy-20260912-02/overlay-rework/luna-mobile.txt)、[luna-short-layout.txt](../output/playwright/xyy-20260912-02/overlay-rework/luna-short-layout.txt)、[luna-mobile-interactions.txt](../output/playwright/xyy-20260912-02/overlay-rework/luna-mobile-interactions.txt) 与 [luna-link-navigation.txt](../output/playwright/xyy-20260912-02/overlay-rework/luna-link-navigation.txt)。
- 按合同执行 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts --grep 'product page|product video navigation' --workers=2`，实际 **8 passed、0 failed**（33.2s），见 [luna-e2e.txt](../output/playwright/xyy-20260912-02/overlay-rework/luna-e2e.txt)。1149 项保护 hash 为 0 missing、0 mismatch，见 [luna-protected-hash.txt](../output/playwright/xyy-20260912-02/overlay-rework/luna-protected-hash.txt)。

Regression coverage: 最终叠加布局、七段 video/slide 边界、透明渐变、文字与 header/胶囊遮挡、导航与真实 touch/wheel/keyboard、focus-visible、reduced-motion、移动菜单、href 导航、autoplay/muted/loop/playsinline/no controls、1440/390/360/844×390 无横溢出、console/pageerror、指定 8 项 product E2E 与 1149 项保护 hash。

Remaining risks: 仅本地 4322 独立 Chromium 与移动模拟，未验证真实 Safari/设备、构建/fullverify、部署或生产环境；视频屏外播放仍遵循浏览器原生 autoplay 策略。

Handoff: 返回 Sol；本次仅新增 `output/playwright/xyy-20260912-02/overlay-rework/luna-*` 证据与本日志，未修改应用或测试源码。此前同 Task 的“文字位于视频上方”证据保留为历史记录，不作为本次叠加验收证据。

### XYY-20260912-04 — 视频说明与橙色链接可读性独立验收

Task ID: XYY-20260912-04

Result: PASS

Tests performed:

- 使用单一独立 Playwright CLI session 在本地 `127.0.0.1:4322/product` 完成 1440×900 与 390×844 检查。两端 HTTP 200、七段视频与文字均在各自 slide 内，容器 scroll-snap 为 `y mandatory`，body/容器无横向溢出；归一化到每段视口后，实际文字盒均不与 header 或固定胶囊相交。
- 七段说明计算样式均为纯白 `rgb(255, 255, 255)`、字重 `600`；桌面字号 `22px`，手机 `18px`。七条详情链接均为品牌橙色 `rgb(232, 93, 38)`，文案与 href 顺序保持；首条链接实际点击到 `/xiefu-yuncang`。
- 视频保持 854×480 natural size、`autoplay`/`muted`/`loop`/`playsinline`，controls=false；slide/copy/video 的背景、伪元素、滤镜和文字阴影均为无覆盖状态。胶囊按钮尺寸44px，正常播放截图已查看：[luna-desktop.png](../output/playwright/xyy-20260912-04/luna-desktop.png)、[luna-mobile.png](../output/playwright/xyy-20260912-04/luna-mobile.png)。浏览器 warning/error 与 pageerror 均为0，完整修正采样见 [luna-browser-corrected.txt](../output/playwright/xyy-20260912-04/luna-browser-corrected.txt)。
- 1149 项保护 hash 为 0 missing、0 mismatch，见 [luna-protected-hash.txt](../output/playwright/xyy-20260912-04/luna-protected-hash.txt)。按合同未重复 E2E、typecheck、单测、build 或 fullverify。

Regression coverage: 1440/390 文字可读性、说明颜色/字重/字号、橙色链接、七段文字与视频边界、header/胶囊避让、视频无遮罩与媒体属性、链接真实导航、横向溢出、console/pageerror 与 1149 项保护 hash。

Remaining risks: 仅本地 4322 独立 Chromium 两种视口，未验证真实 Safari/设备、构建或部署；无遮罩视频的明暗变化可能影响局部文字对比度。

Handoff: 返回 Sol；本次仅新增 `output/playwright/xyy-20260912-04/luna-*` 证据与本日志，未修改应用或测试源码。

### XYY-20260912-03 — 视频文字居中放大并取消遮罩独立验收

Task ID: XYY-20260912-03

Result: PASS

Tests performed:

- 使用独立 Playwright CLI 在本地 `127.0.0.1:4322/product` 完成 1440×900、390×844、360×844、844×390 四视口检查。七段 video 与 slide 矩形逐项一致、scroll-snap 为 `y mandatory`，body/容器无横向溢出或双滚动；文字组实际中心的水平偏移为不超过 0.008px，垂直偏移为桌面约+34px、手机约+30px、短横屏约+28px，均在画面内且避开 header 与胶囊。
- 标题字号实测为桌面 64px、390px 35.1px、360px 32.4px、844×390 46.42px；标题/说明/链接均完整位于对应视频内，390/360 自然换行，无裁切。copy 与 slide/video 的 background、filter、text-shadow 均为透明/none，slide 伪元素为 none，确认无视频遮罩、渐变、背景带或文字阴影。视频 natural size 为854×480，`autoplay`/`muted`/`loop`/`playsinline` 保持且 controls=false。
- 桌面胶囊前进/后退与首段禁用、移动真实 CDP touch 上滑、胶囊切换、移动菜单开关均通过；首个服务链接实际导航至 `/xiefu-yuncang`。浏览器 warning/error 与 pageerror 均为0；最终普通鼠标截图已查看：[luna-desktop.png](../output/playwright/xyy-20260912-03/luna-desktop.png)、[luna-mobile.png](../output/playwright/xyy-20260912-03/luna-mobile.png)。完整采样见 [luna-desktop-final.txt](../output/playwright/xyy-20260912-03/luna-desktop-final.txt)、[luna-mobile-final-corrected.txt](../output/playwright/xyy-20260912-03/luna-mobile-final-corrected.txt)、[luna-interactions.txt](../output/playwright/xyy-20260912-03/luna-interactions.txt) 与 [luna-mobile-interactions.txt](../output/playwright/xyy-20260912-03/luna-mobile-interactions.txt)。
- 按合同执行 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts --grep 'product page|product video navigation' --workers=2`，实际 **8 passed、0 failed**（31.0s），见 [luna-e2e.txt](../output/playwright/xyy-20260912-03/luna-e2e.txt)。1149 项保护 hash 为 0 missing、0 mismatch，见 [luna-protected-hash.txt](../output/playwright/xyy-20260912-03/luna-protected-hash.txt)。

Regression coverage: 四视口七段居中布局、标题字号和换行、视频/文字边界、透明背景与无遮罩/滤镜/阴影、header/胶囊避让、原生媒体属性、服务链接、胶囊/滚轮/触摸/键盘/菜单行为、reduced-motion 既有回归、横向溢出、console/pageerror、指定 8 项 E2E 与 1149 项保护 hash。

Remaining risks: 仅本地 4322 独立 Chromium 与移动模拟，未验证真实 Safari/设备、构建/fullverify、部署或生产环境；无遮罩后原始视频明暗变化可能影响文字对比度，属于用户明确选择的视觉取舍。

Handoff: 返回 Sol；本次仅新增 `output/playwright/xyy-20260912-03/luna-*` 证据与本日志，未修改应用或测试源码。

### XYY-20260912-02 — 视频上方文字区独立验收

Task ID: XYY-20260912-02

Result: PASS

Tests performed:

- 使用独立 Playwright CLI 在本地 `127.0.0.1:4322/product` 验证 1440×900、390×844、360×844 与 844×390。桌面为 1 个 900px 视口容器、手机为 1 个 844px 视口容器；短横屏按自然高度 689.046875px 展开，7 个 slide 的文字区与视频区上下连续，`copy bottom → video top` 间距均为 `0px`，无横向溢出或 body 双滚动。
- 1440 首屏确认 1 个 H1、6 个 H2、7 个段落与 7 个原生服务链接；标题均避开 header，文字盒与右侧胶囊无交叠。390/360 的 H1 均衡为两行（末行不再是孤立单字），7 段链接均在文字区和 slide 内；844×390 的标题/链接可读，视频均保持 `object-fit: cover` 与 854×480 原始尺寸比例。
- 7 个 href 顺序与数据一致；首条链接实际导航至 `/xiefu-yuncang`，HTTP 200。桌面正常鼠标截图、手机截图和短横屏截图均已查看：[luna-final-desktop1440.png](../output/playwright/xyy-20260912-02/luna-final-desktop1440.png)、[luna-final-mobile390.png](../output/playwright/xyy-20260912-02/luna-final-mobile390.png)、[luna-final-landscape-844x390.png](../output/playwright/xyy-20260912-02/luna-final-landscape-844x390.png)。
- 同 Task 先前已完成的按钮快连/首尾禁用、滚轮、键盘、真实触摸、reduced-motion、菜单层级与链接 focus 证据保留；本轮 CSS 仅增加标题 `text-wrap: balance`，最终定向 E2E 实际 **8 passed、0 failed**（Chromium/mobile 各 4，27.3s），命令与汇总见 [luna-final-summary.json](../output/playwright/xyy-20260912-02/luna-final-summary.json)。
- 本轮 console warning/error 均为 0，pageerror 监听为空；1147 项保护文件 SHA-256 为 0 missing、0 mismatch，见 [luna-protected-hash.txt](../output/playwright/xyy-20260912-02/luna-protected-hash.txt)。完整矩形、换行与交互采样见 [luna-final-desktop-corrected.txt](../output/playwright/xyy-20260912-02/luna-final-desktop-corrected.txt)、[luna-final-mobile-corrected.txt](../output/playwright/xyy-20260912-02/luna-final-mobile-corrected.txt)、[luna-link-navigation.txt](../output/playwright/xyy-20260912-02/luna-link-navigation.txt)。

Regression coverage: 文字区与视频非 overlay 关系、1 H1 + 6 H2、标题换行、7 段文字/链接位置与 href、header/胶囊避让、0px 段内间隙、cover 比例、1440/390/360/844×390 布局、横向溢出与 body 双滚动、首条服务导航、原滚动/触摸/键盘/reduced-motion/菜单交互证据、指定 8 项 product E2E、console/pageerror 与 1147 项保护 hash。

Remaining risks: 仅本地 4322 独立 Chromium 与手机模拟，未验证真实 Safari/设备；未运行 build/fullverify、部署或生产环境。视频屏外播放仍遵循浏览器原生媒体策略。

Handoff: 返回 Sol，进入 Nova Review；未修改应用或测试源码，仅新增本 Task `luna-*` 证据与本日志。

### XYY-20260911-14 — 单屏视频滚动与右侧胶囊导航独立验收

Task ID: XYY-20260911-14

Result: PASS（首轮测试闭包错误已修正并完成复测）

Expected: 1440×900 与 390×844 只有一个 100dvh 视频滚动容器；七段视频无 gap、无白缝并按 854:480 原比例 cover；右侧胶囊按钮各至少44px，首尾禁用、序号同步，按钮、滚轮、键盘和触摸导航可连续使用；reduced-motion 即时滚动；导航/菜单、autoplay/muted/loop/playsinline/no controls 与无横向溢出保持；本次受影响 `home-product` 与 `product-motion` E2E 全部通过。

Actual: 独立浏览器检查通过：桌面容器 1440×900、7 段各 900px，手机容器 390×844、7 段各 844px；body 高度均为单视口且无横向溢出。桌面按钮快连到 `07 / 07`、末段下一按钮禁用，返回到 `06 / 07`；滚轮到 `02 / 07`、ArrowDown 到 `03 / 07`、Home 回到 `01 / 07`。手机真实 coarse/touch profile 通过 CDP 触摸上滑到 `02 / 07`，再触摸下一按钮到 `03 / 07`，返回到 `02 / 07`；手机菜单打开时菜单中心命中菜单层，关闭后 `display:none` 且胶囊可见；reduced-motion 下 `scroll-behavior:auto` 且按钮立即到第二段。截图已查看：[luna-desktop-preview.png](../output/playwright/xyy-20260911-14/luna-desktop-preview.png)、[luna-mobile-navigation390.png](../output/playwright/xyy-20260911-14/luna-mobile-navigation390.png)。

首轮指定回归命令实际 **8 passed、2 failed**（Chromium/mobile 各 5）。两项失败均为 `tests/e2e/product-motion.spec.ts:49` 的测试表达式：`locator.evaluate((element) => Math.abs(element.scrollTop - secondOffset))` 在浏览器回调引用 Node 侧 `secondOffset`，报 `ReferenceError: secondOffset is not defined`；该断言未能执行，不能据此判定业务导航失败。reduced-motion 用例及 `home-product` 四项均通过。Terra 随后仅将 `secondOffset` 作为 `evaluate` 第二参数传入，应用实现未变。

Reproduction: 在本地 4322 执行：

`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts --grep 'product page|product navigation|refactored home and product modules' --workers=2`

Evidence: [luna-browser-summary.json](../output/playwright/xyy-20260911-14/luna-browser-summary.json)、[luna-e2e-result.txt](../output/playwright/xyy-20260911-14/luna-e2e-result.txt)、[luna-e2e-retest.txt](../output/playwright/xyy-20260911-14/luna-e2e-retest.txt)、[luna-desktop-nav.txt](../output/playwright/xyy-20260911-14/luna-desktop-nav.txt)、[luna-desktop-interactions.txt](../output/playwright/xyy-20260911-14/luna-desktop-interactions.txt)、[luna-mobile-touch-menu.txt](../output/playwright/xyy-20260911-14/luna-mobile-touch-menu.txt)、[luna-desktop-console-error.txt](../output/playwright/xyy-20260911-14/luna-desktop-console-error.txt)、[luna-mobile-console-error.txt](../output/playwright/xyy-20260911-14/luna-mobile-console-error.txt)。桌面/手机 console warning/error 均为0，pageerror监听为空。989项保护 hash：0 missing、0 mismatch，见 [luna-protected-hash.txt](../output/playwright/xyy-20260911-14/luna-protected-hash.txt)。

Likely affected area: 首轮 `tests/e2e/product-motion.spec.ts` 第49行的 Playwright Node/browser 闭包边界；已由 Terra 以显式 evaluate 参数修正，非应用运行时缺陷。

Severity: MEDIUM（首轮测试错误曾阻断回归门禁；修正后两项复测通过，当前独立浏览器行为未复现业务故障）。

Regression coverage: 单容器/单视口与比例、无 gap/overflow/body 双滚动、桌面按钮快连/边界/滚轮/键盘、手机真实触摸上滑与按钮连续操作、菜单打开/关闭层级、reduced-motion、导航可见性、autoplay 属性边界、console/pageerror、989 项保护 hash；首轮 8 passed/2 failed，修正后失败的 Chromium/mobile 两项复测通过，合并 **10 passed、0 failed**。

Remaining risks: 本轮仅本地 4322 独立 Chromium 与手机模拟，未运行 build/fullverify、真实设备、部署或生产验证；屏外视频是否持续播放仍遵循浏览器原生媒体策略。

Handoff: 返回 Sol，交 Nova Review；未修改应用实现或测试源码，仅新增本 Task `luna-*` 证据与本日志。

### XYY-20260911-13 — 仓配七段视频 autoplay 独立验收

Task ID: XYY-20260911-13

Result: PASS

Tests performed:

- 使用独立 Playwright CLI session 在本地 `127.0.0.1:4322/product` 验证 1440×900 与 390×844。七段视频顺序为 `01-overview` 至 `07-dispatch`，桌面每段渲染为 1440×809.359375，手机每段为 390×219.203125，均保持 854×480 原比例；两端页面无横向溢出，导航保留。
- 两端七段均具备 `autoplay`、`muted`、`loop`、`playsinline`、`preload=auto`，无原生 `controls`；正文 editorial、CTA、footer、floating contact 均为 0，主内容仅保留无障碍名称“仓配作业视频”。7 张 poster 均 HTTP 200，见 [luna-poster-http.json](../output/playwright/xyy-20260911-13/luna-poster-http.json)。
- 将各段滚入可视区后，桌面 7/7、手机首/中/末 3/3 在约 0.9 秒内 `currentTime` 增长、保持播放且静音；首段桌面从 6.646667 秒回绕至 0.426055 秒，`loop` 实际生效。浏览器明细见 [luna-video-browser.json](../output/playwright/xyy-20260911-13/luna-video-browser.json)，原始采样见 `luna-video-desktop-*.txt` 与 `luna-video-mobile-*.txt`。
- 已查看两端正常截图：[luna-video-desktop1440.png](../output/playwright/xyy-20260911-13/luna-video-desktop1440.png)、[luna-video-mobile390.png](../output/playwright/xyy-20260911-13/luna-video-mobile390.png)。桌面 CLI console warning/error 均为 0，独立运行未观察到 pageerror；环境此前 4322 连接拒绝记录保留在 [luna-browser-blocked.txt](../output/playwright/xyy-20260911-13/luna-browser-blocked.txt)，服务恢复后验证完成。
- 指定受影响回归命令实际 **12 passed、0 failed**（Chromium/mobile 各 6，40.8s），摘要见 [luna-e2e-summary.json](../output/playwright/xyy-20260911-13/luna-e2e-summary.json)。
- 1110 项保护文件 0 missing、0 mismatch，见 [luna-protected-hash.json](../output/playwright/xyy-20260911-13/luna-protected-hash.json)。

Regression coverage: 七段视频顺序、autoplay/muted/loop/playsinline/preload 与 controls 边界、可视区实际播放进度和真实 loop、854×480 比例、桌面/触屏移动端宽度与溢出、poster 状态、导航、正文/页脚/CTA 排除、指定首页与 product E2E、console/pageerror 观察及 1110 项保护 hash。

Remaining risks: 仅验证本地 4322 的独立 Chromium CLI 与 1440/390 视口；浏览器会对屏外原生 autoplay 暂停，已通过滚入可视区后进度增长验证，未将其作为失败。未运行 build、`npm run verify`、全量测试、真实设备、部署或生产环境验证；原视频物理无声与完整解码沿用已提供的媒体证据。

Handoff: 返回 Sol；未修改应用实现或测试源码，仅新增本 Task `luna-*` 证据与本日志。

### XYY-20260911-11 — 核心八项服务整卡反馈独立验收

Task ID: XYY-20260911-11

Result: PASS

Tests performed:

- 使用独立 Playwright CLI session `luna-editorial-20260911-11`，在 1440×900 逐一 hover 八张服务卡：每次仅对应卡片背景/阴影/`translate: 0px -4px` 与箭头 `translate: 4px` 改变，移到卡外后均恢复初始状态。桌面截图已查看：[luna-hover-desktop1440.png](../output/playwright/xyy-20260911-11/luna-hover-desktop1440.png)。
- 桌面 Tab 遍历八个原链接：编号/顺序与 href 对应，当前卡片唯一 `:focus-within`，链接 outline 为 solid 3px；整卡空白右下角以及每卡编号、正文中心的 `elementFromPoint().closest('a')` 均命中本卡 href（24 个命中点全部匹配）。首尾卡片空白区域实际点击分别进入 `/xiefu-yuncang` 与 `/b2b-mendian-cangpei`。明细见 [luna-desktop-browser.json](../output/playwright/xyy-20260911-11/luna-desktop-browser.json)。
- 使用独立 `--mobile` CLI session `luna-editorial-20260911-11-touch2`，390×844 真实 coarse/touch profile（`hover=false`、`pointer=coarse`、touch=true）：卡片无 sticky hover 位移/高亮，页面 scrollWidth 为390；在第一卡 h3 非链接文字位置执行 `touchscreen.tap`，`elementFromPoint` 命中对应 anchor 并导航至 `/xiefu-yuncang`。截图已查看：[luna-touch390.png](../output/playwright/xyy-20260911-11/luna-touch390.png)，明细见 [luna-touch-browser.json](../output/playwright/xyy-20260911-11/luna-touch-browser.json)。
- `prefers-reduced-motion: reduce` 下 hover 保留绿色背景/阴影，但卡片与箭头 translate 均为 `0px`，transitionDuration 为 `0s`、transitionProperty 为 `none`；诊断为空，见 [luna-focus-reduced-browser.json](../output/playwright/xyy-20260911-11/luna-focus-reduced-browser.json)。
- 既有回归：`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/product-motion.spec.ts --workers=2`，4 passed（chromium/mobile 各 2）。1113 项保护文件 SHA-256：0 missing、0 mismatch，见 [luna-protected-hash.json](../output/playwright/xyy-20260911-11/luna-protected-hash.json）。

Regression coverage: 八卡 hover/复位与箭头反馈、键盘 Tab 顺序与 focus-within/outline、整卡定位命中与首尾实际导航、390 touch/coarse 无 sticky 位移与无溢出、reduced-motion 静态高亮、原 href/文案/编号、既有 motion E2E、console/pageerror 与 1113 项保护 hash。

Remaining risks: 仅本地 4322 headless Chromium CLI、1440/390 两种视口及两张代表截图；未运行 build、typecheck、全量测试或真实设备/生产验证。

Handoff: 返回 Sol；未修改应用实现或测试，仅新增本日志与本 Task `luna-*` 证据。

### XYY-20260911-10 — 服务保障机制图标与文字重叠修复独立验收

Task ID: XYY-20260911-10

Result: PASS

Tests performed:

- 使用独立 Playwright CLI session `luna-assurance-20260911-10`，在本地 `http://127.0.0.1:4322/product` 依次验证 1440×900、1021×881、913×881、390×844。四端 HTTP 均为 200，页面/body scrollWidth 分别等于视口宽度；保障机制 5 项与 5 个 SVG 均存在，四个数字卡片保留。
- 1440 为单行五列；1021 与 913 自动换为两行；390 为单列五行。等待原 reveal 触发并完成后，5 项图标与本项/相邻文本矩形均无相交，段落 `scrollWidth <= clientWidth` 且均在卡片内；实际矩形、行数与属性见 [luna-assurance-browser.json](../output/playwright/xyy-20260911-10/luna-assurance-browser.json)。
- 已查看 1021 与 390 保障区截图：[luna-assurance-desktop1021.png](../output/playwright/xyy-20260911-10/luna-assurance-desktop1021.png)、[luna-assurance-mobile390.png](../output/playwright/xyy-20260911-10/luna-assurance-mobile390.png)。1021 显示四项首行加一项次行，390 显示五项单列，说明正常换行，未见图标遮字。
- 三张透明物品图均实际加载；需求区 6 项仍无链接/按钮/tabindex；Hero 视频 controls、playsinline、preload=none、poster 与 MP4 source 保留。CLI `console warning` 与 `console error` 均返回 0 条，pageerror 监听为空。
- 1112 项保护文件 SHA-256：0 missing、0 mismatch，见 [luna-protected-hash.json](../output/playwright/xyy-20260911-10/luna-protected-hash.json)。

Regression coverage: assurance 机制五项/五 SVG、图文与相邻卡片矩形边界、段落换行、1440/1021/913/390 列数适配、四数字卡片、三图/需求静态区/Hero 视频保留、页面溢出、console/pageerror 与 1112 项保护 hash。按合同未新增 spec、未运行 E2E、build 或全量测试。

Remaining risks: 仅本地 headless Chromium CLI 四种视口与两张代表截图；未验证真实设备浏览器、build、部署或生产环境。

Handoff: 返回 Sol；未修改应用实现或测试，仅新增本日志与本 Task `luna-*` 证据。

### XYY-20260911-09 — 统一尺寸撤回独立取消验证

Task ID: XYY-20260911-09

Result: PASS

Tests performed:

- 只读核对取消记录：`cancellation-verification.json` 标记 `CANCELLED`，`product.astro` 与 `ProductEditorialHero.astro` 均恢复成功，统一尺寸样式已移除；1112 项保护 hash 为 0 mismatch。独立源文件比对确认当前两个文件与 `baseline/` 逐字节一致，见 [cancellation-luna-source.json](../output/playwright/xyy-20260911-09/cancellation-luna-source.json)。
- 独立 headless Chromium 在本地 `127.0.0.1:4322/product` 对 1440×900 与 390×844 各执行一次 DOM 检查：HTTP 200、页面与 body 无横向溢出，七区高度不再统一为881px；三张透明图实际加载且 natural size 正确、响应 HTTP 200。
- 两端需求区均为 6 个 article，区域内无链接/按钮/tabindex；Hero 视频仍保留 controls、playsinline、preload=none、poster 与 MP4 source，`hero-points` 数为 0；console warning/error 与 pageerror 均为空。明细见 [cancellation-luna-browser.json](../output/playwright/xyy-20260911-09/cancellation-luna-browser.json)。

Regression coverage: 取消后的源文件基线一致性、统一样式移除、保护 hash、1440/390 HTTP 与 DOM 布局、三图加载、需求区静态边界、Hero 视频属性、无横向溢出与浏览器诊断。按合同未运行旧统一尺寸 E2E 或全量测试。

Remaining risks: 仅验证本地 headless Chromium 两种视口；未运行 build、E2E、全量测试、部署或生产环境验证，旧 09 统一尺寸截图仅为历史中间证据。

Handoff: 返回 Sol；未修改应用实现、测试或其他文件，仅新增本日志与本 Task cancellation-luna 证据。

首次真实参与任务时复制以下模板；复测继续更新原 Task ID。

### XYY-20260911-07 — 三张插画透明物品构图独立验收

Task ID: XYY-20260911-07

Result: PASS

Tests performed:

- 独立 Playwright Chromium context 检查 `/product` 的 1440×900 与 390×844：三图新路径实际加载、尺寸分别为 1536×1024、2164×727、1536×1024，响应均 HTTP 200；图片容器背景为透明，页面背景为白色，`object-fit: contain`，入场完成后 opacity/filter/transform 均清除。
- 六张区域截图已人工查看：目录图衣架/箱装商品/标签、商品整理图衬衣/鞋/刷具/线团/包装、交付图包裹/扫码器/打包用品均清晰可辨，无场景、文字或背景卡片；care 手机容器约 122px 高。证据：[luna-desktop-directory.png](../output/playwright/xyy-20260911-07/luna-desktop-directory.png)、[luna-desktop-care.png](../output/playwright/xyy-20260911-07/luna-desktop-care.png)、[luna-desktop-process.png](../output/playwright/xyy-20260911-07/luna-desktop-process.png)、[luna-mobile-directory.png](../output/playwright/xyy-20260911-07/luna-mobile-directory.png)、[luna-mobile-care.png](../output/playwright/xyy-20260911-07/luna-mobile-care.png)、[luna-mobile-process.png](../output/playwright/xyy-20260911-07/luna-mobile-process.png)。
- 三个 PNG 均为 RGBA/srgba，实际结构为 0 个占位、3 个 product visual 图片、需求区 0 个链接、核心服务 8 个链接；两端无横向溢出，console warning/error 与 pageerror 均为空。浏览器明细见 [luna-visual-browser.json](../output/playwright/xyy-20260911-07/luna-visual-browser.json)，alpha/尺寸见 `luna-alpha-images.txt`。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts --grep 'product page presents editorial|product page reveals late sections|product page keeps animated service links' --workers=2`：6 passed（chromium/mobile 各 3 项）。
- 1103 项保护源码 SHA-256：0 missing、0 mismatch，见 [luna-protected-hash.json](../output/playwright/xyy-20260911-07/luna-protected-hash.json）；Hero 视频、需求区静态无跳转与核心服务入口边界保持。

Regression coverage: 三个新透明 PNG 的 alpha/尺寸/HTTP200、透明白底与 contain、三种区域比例、主体可辨识度、reveal 完成态、桌面/移动无溢出、需求区静态边界、核心 8 服务链接、指定 6 项既有 E2E、console/pageerror 与 1103 项保护 hash。

Remaining risks: 仅验证本地 `127.0.0.1:4322` headless Chromium；主体裁切为两种视口截图人工核验，不代表真实设备矩阵；未运行 build、`npm run verify`、视频播放、全量页面、部署或生产环境验证。

Handoff: 返回 Sol；未修改应用实现、已有测试或其他文档，仅新增本日志与 `output/playwright/xyy-20260911-07/luna-*` 证据。

### XYY-20260911-06 — 需求区六项取消跳转独立验收

Task ID: XYY-20260911-06

Result: PASS

Tests performed:

- 独立 Playwright Chromium context 检查 `http://127.0.0.1:4322/product` 的 1440×900 与 390×844：需求区均为 6 个 `article`，编号、文案、顺序与基线一致；区域内无 `a`、`button` 或 `[tabindex]`，逐项点击后 URL 保持 `/product`。
- 两端等待入场稳定后截图并人工查看：[luna-desktop-needs.png](../output/playwright/xyy-20260911-06/luna-desktop-needs.png)、[luna-mobile-needs.png](../output/playwright/xyy-20260911-06/luna-mobile-needs.png)。三张 product visual 图片均实际加载、natural size 1536×1024、HTTP 200；核心 8 个服务链接保留，页面无横向溢出。
- 页面 console warning/error 与 pageerror 均为空，明细见 [luna-needs-browser.json](../output/playwright/xyy-20260911-06/luna-needs-browser.json)。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts --grep 'product page presents editorial|product page keeps animated service links' --workers=2`：4 passed（chromium/mobile 各 2 项）。
- 948 项保护源码 SHA-256：0 missing、0 mismatch，见 [luna-protected-hash.json](../output/playwright/xyy-20260911-06/luna-protected-hash.json）。

Regression coverage: 需求区静态结构、编号/文案/顺序、点击不跳转、需求区无焦点目标、三图加载、核心 8 服务链接、桌面/移动布局、无溢出、既有 editorial 与 keyboard motion E2E、console/pageerror 与 948 项保护 hash。

Remaining risks: 仅验证本地 `127.0.0.1:4322` headless Chromium；截图为两种视口，不代表真实设备矩阵；未运行 build、`npm run verify`、视频播放、全量动效、部署或生产环境验证。

Handoff: 返回 Sol；未修改应用实现、已有测试或其他文档，仅新增本日志与 `output/playwright/xyy-20260911-06/luna-*` 证据。

### XYY-20260911-05 — 仓配页三张图片独立验收

Task ID: XYY-20260911-05

Result: PASS

Tests performed:

- 独立 Playwright Chromium context 串行检查 `http://127.0.0.1:4322/product` 的 1440×900 与 390×844；目录、商品整理、交付三图滚动进入视区后均实际加载，natural size 均为 1536×1024，图片响应均 HTTP 200，`data-image-placeholder` 为 0、`data-product-visual img` 为 3，页面无横向溢出。
- 六张区域截图已人工查看：目录图主体衣架/库存台，商品整理图衣物/工具/包装，交付图打包台/包裹均清晰可辨；背景边缘裁切符合现有容器比例。证据：[luna-desktop-directory.png](../output/playwright/xyy-20260911-05/luna-desktop-directory.png)、[luna-desktop-care.png](../output/playwright/xyy-20260911-05/luna-desktop-care.png)、[luna-desktop-process.png](../output/playwright/xyy-20260911-05/luna-desktop-process.png)、[luna-mobile-directory.png](../output/playwright/xyy-20260911-05/luna-mobile-directory.png)、[luna-mobile-care.png](../output/playwright/xyy-20260911-05/luna-mobile-care.png)、[luna-mobile-process.png](../output/playwright/xyy-20260911-05/luna-mobile-process.png)。
- noJS 390×844 context 逐区滚动后，三图均 `complete=true`、natural size 1536×1024、HTTP 200，且无溢出；console warning/error 与 pageerror 均为空，见 [luna-nojs-visual.json](../output/playwright/xyy-20260911-05/luna-nojs-visual.json) 与 [luna-visual-browser.json](../output/playwright/xyy-20260911-05/luna-visual-browser.json)。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts --grep 'product page presents editorial|product page has no horizontal overflow|product page reveals late sections' --workers=2`：6 passed（chromium/mobile 各 3 项）。
- 943 项保护源码 SHA-256：0 missing、0 mismatch，见 [luna-protected-hash.json](../output/playwright/xyy-20260911-05/luna-protected-hash.json）；视频原生属性未改动并由前一 Task 验收保留。

Regression coverage: 三个图片资源的实际加载与尺寸、现有容器比例/裁切主体、桌面与移动滚动区域、noJS 懒加载可见性、页面溢出、既有 editorial/overflow/late-section motion E2E、视频 DOM 边界与 943 项保护 hash。

Remaining risks: 仅验证本地 `127.0.0.1:4322` headless Chromium；主体裁切为截图人工核验，未扩大到真实设备/网络矩阵；未运行 build、`npm run verify`、部署或生产环境验证。

Handoff: 返回 Sol；未修改应用实现或测试源码，仅新增本日志与 `output/playwright/xyy-20260911-05/luna-*` 证据。

### XYY-20260911-04 — 仓配首屏视频独立验收

Task ID: XYY-20260911-04

Result: PASS

Tests performed:

- 独立 Playwright Chromium context 串行检查 `http://127.0.0.1:4322/product` 的 1440×900 与 390×844：视频分别位于文案右侧/下方，854×480 原比例保持，封面完整可见，原生 `controls`、`playsinline`、`preload=none`、poster/source 属性与实际属性均正确；两端 `scrollWidth` 无溢出。
- 两端初始均 `paused=true`、`readyState=0` 且未请求 MP4；poster 均 HTTP 200，明细见 [luna-initial-media.json](../output/playwright/xyy-20260911-04/luna-initial-media.json)。正常截图与播放截图已人工查看：[luna-desktop-normal.png](../output/playwright/xyy-20260911-04/luna-desktop-normal.png)、[luna-desktop-playing.png](../output/playwright/xyy-20260911-04/luna-desktop-playing.png)、[luna-mobile-normal.png](../output/playwright/xyy-20260911-04/luna-mobile-normal.png)、[luna-mobile-playing.png](../output/playwright/xyy-20260911-04/luna-mobile-playing.png)。
- 通过原生视频焦点与 Space 播放控制触发实际播放：桌面/移动 `currentTime` 增长至约1.4秒、解码帧48/47、`readyState=4`、无 `video.error`；pause 后 350ms 时间稳定。MP4 播放请求均 HTTP 206，控制与媒体明细见 [luna-video-browser.json](../output/playwright/xyy-20260911-04/luna-video-browser.json)。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts --grep 'product page presents editorial|product page has no horizontal overflow|product page keeps animated editorial links' --workers=2`：6 passed（chromium/mobile 各3项）。
- 本任务保护 hash 944 项：0 missing、0 mismatch，见 [luna-protected-hash.json](../output/playwright/xyy-20260911-04/luna-protected-hash.json）；两端 console warning/error 与 pageerror 均为空。

Regression coverage: 首屏视频媒体属性、封面/原比例、桌面与移动布局、无横向溢出、初始不播放与延迟请求、原生播放/解码/暂停、既有三项产品 editorial/overflow/keyboard motion E2E，以及 944 项保护源码 hash。

Remaining risks: 仅验证本地 `127.0.0.1:4322` headless Chromium；视频播放使用静音临时测试，未做真实设备音量/网络带宽矩阵；未运行 build、`npm run verify`、部署或生产环境验证。

Handoff: 返回 Sol；未修改应用实现、测试源码、依赖、配置、CMS、数据库或外部环境，仅新增本日志和 `output/playwright/xyy-20260911-04/luna-*` 证据。

### XYY-20260911-02 — 广州核心服务入口并入华南独立验收

Task ID: XYY-20260911-02

Result: PASS

Tests performed:

- `PLAYWRIGHT_PORT=4322 env -u CI ./node_modules/.bin/playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts -g 'product page presents editorial|product page keeps animated'` 实际 4 passed（chromium/mobile 各覆盖核心列表与键盘顺序）。
- 单个 headless Chromium page 串行检查 1440×900 与 390×844；等待 `networkidle`、字体、DOM 与 reduced-motion 完成态，隐藏 Astro dev toolbar。两端均为 8 项、序号 01–08；07 华南与 08 B2B 末两项完整可读，华南说明精确匹配，广州独立卡片/链接均为 0，`scrollWidth === clientWidth`，末两项 opacity=1。截图：[luna-1440-last-two.png](../output/playwright/xyy-20260911-02/luna-1440-last-two.png)、[luna-390-last-two.png](../output/playwright/xyy-20260911-02/luna-390-last-two.png)，原始矩形/DOM 证据：[luna-visual-check.json](../output/playwright/xyy-20260911-02/luna-visual-check.json)。
- 本地 `GET /huanan-xiefu-yuncang` 与 `GET /guangzhou-xiefu-yuncang` 均 HTTP 200。
- `protected.json` 中 18 项保护源码 SHA-256 全部一致；当前 SSR 从 `#service-directory` 至 assurance、assurance 至 footer 与 `before.html` 对应片段一致，证据：[luna-protected-hash.json](../output/playwright/xyy-20260911-02/luna-protected-hash.json)、[luna-ssr-boundary.json](../output/playwright/xyy-20260911-02/luna-ssr-boundary.json)。

Regression coverage: 核心服务数量、连续编号、顺序、华南/B2B 链接与文案、广州入口移除、六项 needs 目录、四个占位、动效卡片键盘顺序、桌面/移动端溢出、详情页可达性、保护源码、SSR 非目标区域与样式边界。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 开发预览；截图采用合同允许的 reduced-motion 静态布局，正常键盘动效由上述 4 项 E2E 覆盖；未运行 build、`npm run verify`、全 motion 矩阵或部署环境验证。

Handoff: 返回 Sol；未修改应用实现、测试、依赖、配置、CMS、数据库或外部环境，仅更新本日志并写入本 Task 证据。

### XYY-20260911-02 — 核心服务顺序独立复测

Task ID: XYY-20260911-02

Result: PASS

Tests performed:

- 同一指定 Playwright 命令实际 4 passed（chromium/mobile 各覆盖核心列表与键盘顺序）。
- 单个 headless Chromium page 在 1440×900 与 390×844 使用 reduced-motion 检查 `#service-series`；当前 DOM 与 `after-entries.json` 完全一致：01 鞋服云仓、02 退货质检、03 后整修复、04 跨境云仓、05 华南鞋服云仓、06 华东鞋服云仓、07 直播电商仓配、08 B2B 门店仓配。两端 8 项均 opacity=1，文字矩形未越出卡片，`scrollWidth === clientWidth`，无广州独立卡片或链接，toolbar 已隐藏。截图与明细：[luna-1440-service-order.png](../output/playwright/xyy-20260911-02-order/luna-1440-service-order.png)、[luna-390-service-order.png](../output/playwright/xyy-20260911-02-order/luna-390-service-order.png)、[luna-order-visual.json](../output/playwright/xyy-20260911-02-order/luna-order-visual.json)。
- 18 项保护源码 SHA-256 全部一致：[luna-protected-hash.json](../output/playwright/xyy-20260911-02-order/luna-protected-hash.json)。

Regression coverage: 本轮仅覆盖核心服务新顺序、01–08 编号、现有文案/id/href、两端核心区可读性、无横向溢出、广州入口排除、键盘顺序及保护源码；未扩大到其他路由或全 motion 矩阵。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 开发预览；截图使用合同允许的 reduced-motion，正常键盘动效由上述 4 项 E2E 覆盖；未运行 build、完整 verify 或部署环境验证。

Handoff: 返回 Sol；未修改应用实现、测试、依赖、配置、CMS、数据库或外部环境，仅更新本日志并写入 order 证据。

### XYY-20260905-01

Task ID: XYY-20260905-01

Result: PASS

Tests performed:

- 独立审阅当前 `AGENTS.md` 及本 Task 相关 diff；确认生产/外部写入、权限、真实 CMS、数据库和 PostgreSQL → Oracle 19c 均要求准确目标、动作与环境的用户授权，且历史 TODO 不得复活生产或数据库工作。
- 场景断言确认 Directus 为 CMS 权威、公开数字仅来自 `src/lib/claims/`、CMS 成功空内容不回退，401/403/非法响应/契约错误明确失败；提交前 `npm run verify` 与部署前 `npm run verify:release` 门禁仍在。
- 场景断言确认已授权的常规可逆工作可连续执行；普通文档/只读直办例外排除治理/授权规则，MEDIUM/HIGH 保留 Luna 独立验证与 Nova Review；只读诊断不自动授权修复，Sol 是唯一调度者，证据与阶段声明需精确。
- 使用 Python `tomllib` 解析 `.codex/config.toml` 与三个子代理 TOML：主模型为 `gpt-6-astra`、推理等级 `xhigh`；Terra/Luna/Nova 仍为 `gpt-5.6-terra` / `gpt-5.6-luna` / `gpt-5.6-sol`，推理等级均为 `high`。
- `npx prettier --check AGENTS.md` 通过；`git diff --check` 通过。使用任务开始前快照核对，Terra/Sol/DEV_STATE 的新增内容均为本 Task 记录或对应配置说明，未发现覆盖既有日志的无关改动。

Regression coverage: Agent 层级与唯一调度者、MEDIUM/HIGH 闸门、授权连续性、生产/CMS/数据库/Oracle 边界、Directus fallback、claims 来源、验证门禁、证据合同、主/子模型配置和工作树差异隔离。

Remaining risks: 本 Task 仅修改治理文档、日志和主模型默认配置，未运行应用测试、浏览器、部署、生产/CMS/数据库操作；实际会话模型是否已切换不能仅由静态配置证明，需以生效会话为准。

Handoff: 返回 Sol；XYY-20260905-01 独立 QA PASS，可进入 Nova Review。`docs/LUNA.md` 为本轮新增工作账记录。

### XYY-20260904-01

Task ID: XYY-20260904-01

Result: PASS

Test Target: 本地 Directus/PostgreSQL 相关列、超 4,000 的 News 发布 payload、Oracle migration/deployment 合同与缺失覆盖。

Tests performed:

- 本地 Directus 12.0.2 与 PostgreSQL 16.15 只读检查通过；`directus_revisions.data` / `delta` 为无界 `json`，`news.content` 为无界 `text`。
- 本地共有 2,553 条 revision，最大 payload 3,229 bytes；未执行真实文章写入。PostgreSQL 只读表达式可处理超过 14,939 bytes 的 JSON。
- 临时测试探针确认 14,939 字符正文经发布路由完整传递到 mock Directus，payload 超过 4,000；探针已删除且仓库无残留 diff。
- Oracle migration/deployment 合同 2 files / 18 tests 全部通过；现有测试未覆盖 `directus_revisions` 大 payload 容量，`docs/MAINTAINABILITY.md` 也明确 Oracle 仅有静态检查。

Regression coverage: 本地运行版本、数据库连接与 Schema、revision/正文容量、发布 payload、Oracle 合同和工作区清洁度。

Remaining risks: 未连接正式 Oracle；mock payload 不等于本地真实发布成功，也不证明 CLOB 与 Directus 已兼容。

Handoff: 返回 Sol；诊断证据 PASS，正式站问题属于 Oracle revision 列容量，不是权限，本地 PostgreSQL 不复现同一 4,000 限制。

### XYY-20260821-03

Status: PASS

Test Target: `/product`、`SPECIALTY_LINKS` 的 9 个服务专题页、`/cases`、`/news`、`/senlinqikan`，以及排除范围内的 `/yundao-zhineng-jijian`。

Acceptance Criteria: 共享 CTA 结构与文案、产品页原始文案、页面级 `/contact` 主链接、ARIA 语义与键盘焦点、桌面/移动无横向溢出、旧数字化服务 CTA 保留、无控制台错误。

Tests:

- 独立运行 `npx playwright test tests/e2e/conversion-cta.spec.ts tests/e2e/service-pages.spec.ts tests/e2e/product-motion.spec.ts tests/e2e/service-motion.spec.ts`：13 passed、1 skipped；跳过项为既有服务动效测试在移动项目中的明确配置跳过。
- 独立 Playwright 路由矩阵覆盖 13 条目标路由的 1440×900 与 360×800：HTTP 200、每页恰好 1 个 `[data-conversion-cta]`、1 个 `h2`、1 个 `aside`、3 个列表项、1 个 `/contact`、ARIA 关联、键盘焦点 outline 和无横向溢出全部通过。
- 独立 Playwright 复核 `/yundao-zhineng-jijian`：`.service-cta` 为 1，`[data-conversion-cta]` 为 0。
- 独立 Playwright 采集并人工检查 `/product`、`/xiefu-yuncang`、`/cases`、`/news`、`/senlinqikan` 在桌面与移动端 reveal 完成后的 CTA 截图；左侧转化文案、橙色行动按钮、右侧三条准备信息和移动堆叠布局可读。
- 精确核对 `/product`：标题、说明、`提交仓配需求` 及三条原始准备信息保持一致；`warehouse-cta-heading` 唯一且无重复 ID。
- 全部独立检查页面无 console error 或 page error；`git diff --check` 通过。

Result: PASS

Evidence: 本地隔离站点 `http://127.0.0.1:4401`，Directus 使用不可达地址触发静态 fallback；截图保存在 Git 忽略的 `output/playwright/`。

Regression: 既有 service layout、service motion、product motion 和 service page tests 均通过；服务页原 CTA 保留边界通过。

Risks: CTA 文案当前为静态页面文案；若未来需要 CMS 后台编辑 CTA，需要另行定义数据契约与权限范围。截图检查依赖滚动 reveal 完成后采集，不代表首帧动画状态。

Handoff: 返回 Sol；Task `XYY-20260821-03` 可进入 Nova Review。

#### Re-test after style extraction

Status: PASS

Result: PASS

Tests performed:

- `npx playwright test tests/e2e/conversion-cta.spec.ts --project=chromium --project=mobile`：2 passed。
- 独立 Playwright 复测 `/product`、`/xiefu-yuncang`、`/cases`、`/news`、`/senlinqikan` 的 1440×900 与 390×844 视觉状态；等待 reveal 完成后截图，CTA 背景、栅格/移动单列布局、标题、描述、按钮及三项列表均正常。
- 独立 Playwright 检查 13 条目标路由：均 HTTP 200、恰好 1 个 CTA、无横向溢出、CTA 样式实际生效、无 console/page error。
- 独立复核 `/yundao-zhineng-jijian`：旧 `.service-cta` 为 1，新 `[data-conversion-cta]` 为 0。
- `npm run check:maintainability`：526 files，PASS。
- `git diff --check`：PASS。

Evidence: 新的 `src/styles/conversion-cta.css` 已由 `ConversionCTA.astro` 导入；代表页面 computed background 为 `rgb(240, 241, 239)`，桌面为两列、移动为单列，服务与产品 reveal 后标题 opacity 接近 1。复测截图位于 Git 忽略的 `output/playwright/retest-*`。

Regression coverage: focused CTA spec 的 Chromium/mobile 均通过；路由矩阵、服务页旧 CTA 边界、产品/服务 reveal 和响应式 overflow 均通过。

Remaining risks: 本次只移动不变样式，未扩大到 CMS CTA 数据化；截图验证覆盖 reveal 完成态，不覆盖首帧动画状态。

Handoff: 返回 Sol；返工复测通过，可进入 Nova Review。

### XYY-20260822-01

Status: PASS

Test Target: 测试站 `https://wz.tomatopia.top` 发布 Release `20260821T170201Z-eac6790`。

Acceptance Criteria: 发布身份与健康检查准确；13 条统一 CTA 目标路由在桌面和移动端可访问、CTA 可见且结构正确；无水平溢出、控制台错误或页面错误；`/yundao-zhineng-jijian` 不新增统一 CTA。

Tests:

- 只读 HTTP 验证：`/version` 返回完整 SHA `eac67903d1e65437b74f9b4ee74890dad01e3843`、`releaseId=20260821T170201Z-eac6790`、`environment=staging`；`/healthz` 返回 `status=ok`、`contactStorage=ok`。
- 真实 Chromium 浏览器矩阵：13 条目标路由分别在 1440×900 桌面端和 390×844 移动端检查，共 26/26 通过；每页 HTTP 200、恰好 1 个 `[data-conversion-cta]`、1 个 `/contact` 链接、3 条准备信息、CTA 滚动后可见、桌面双栏、移动单栏、无水平溢出。
- 重点页面 `/product`、`/xiefu-yuncang`、`/cases`、`/news`、`/senlinqikan` 完成桌面/移动截图检查；代表性桌面计算列为 `746.875px 497.922px`，移动为 `366px`。
- 排除边界 `/yundao-zhineng-jijian`：HTTP 200，`[data-conversion-cta]` 为 0，既有 `.service-cta` 为 1；无 console/page error。
- 26 次目标路由检查及排除页检查均未发现 console error 或 page error。

Result: PASS

Evidence: 截图保存在 Git 忽略的 `output/playwright/staging-*.png`；发布脚本内部 `CI=1` 门禁由 Sol 提供的发布证据为 45 个 Vitest 文件/292 项通过、39 项 E2E 通过、7 项跳过、3 项正式契约通过，构建通过，外部健康与版本核对通过且未回滚。

Regression: 覆盖统一 CTA 的 13 条目标路由、桌面/移动响应式结构、联系入口、准备信息行数、无溢出、渲染错误和排除页面边界；未执行 CMS 写入、表单提交或生产环境操作。

Remaining risks: 本次为发布后只读验收；CTA 文案仍为静态页面内容，未来若需要 CMS 编辑需另行定义数据契约与权限范围。截图检查覆盖滚动后的 CTA 可见态，不覆盖动画首帧。

Handoff: 返回 Sol；Task `XYY-20260822-01` 测试站发布后验收通过，可完成最终验收与状态同步。

#### Re-test after Nova formatting review

Status: PASS

Test Target: Terra 对 `tests/unit/image-cache-contract.test.ts` 的 Prettier 格式修复。

Tests performed:

- Diff 核对：仅将 `readProjectFile` 的单行表达式拆为两行；无断言、测试行为或应用代码变化。
- `npm run format:check`：通过，所有匹配文件均符合 Prettier 格式。
- `npx vitest run tests/unit/image-cache-contract.test.ts`：1 个测试文件、8 项测试通过，耗时 319ms。
- `git diff --check`：通过。

Result: PASS

Regression coverage: 覆盖 Nova 指出的 GitHub CI 格式门禁和受影响图片缓存契约测试；本次变更为纯格式调整，不改变发布代码或测试语义。

Remaining risks: 无新增功能风险；完整发布门禁由 Sol 按流程决定是否重新执行。

Handoff: 返回 Sol；Task `XYY-20260822-01` 的格式阻塞已通过独立复测，可进入最终 Review/同步。

#### Re-test after staging release 539bfd4

Status: PASS

Test Target: 测试站 `https://wz.tomatopia.top` 当前发布 Release `20260821T235850Z-539bfd4`。

Tests performed:

- 只读 HTTP 验证：`/version` 返回完整 SHA `539bfd44c05d81b5b7a1246cb009beec4c58f4c1`、`releaseId=20260821T235850Z-539bfd4`、`environment=staging`、`cmsSchemaVersion=2026-08-cms-hardening`；`/healthz` 返回 HTTP 200、`status=ok`、`contactStorage=ok`。
- 真实 Chromium 矩阵：13 条目标路由分别在 1440×900 桌面端和 390×844 移动端检查，共 26/26 通过；每页 HTTP 200、恰好 1 个 `[data-conversion-cta]`、1 个 `/contact` 链接、3 条准备信息、CTA 滚动后可见、无水平溢出。
- 响应式结构：桌面端 13/13 为双栏，代表性计算列 `746.875px 497.922px`；移动端 13/13 为单栏，代表性计算列 `366px`。
- 排除边界 `/yundao-zhineng-jijian`：HTTP 200，统一 CTA 为 0，既有 `.service-cta` 为 1。
- 26 次目标路由检查及排除页检查均未发现 console error 或 page error；当前 Release 截图保存在 Git 忽略的 `output/playwright/staging-*-539bfd4.png`。

Result: PASS

Regression coverage: 覆盖当前目标 SHA 的发布身份、健康状态、13 条 CTA 路由桌面/移动布局、联系入口、准备信息、无溢出、渲染错误和排除页面边界；未执行 CMS 写入、表单提交或生产环境操作。

Remaining risks: 本次为发布后只读验收；CTA 文案仍为静态页面内容，未来如需 CMS 编辑需另行定义数据契约与权限范围。截图检查覆盖滚动后的 CTA 可见态，不覆盖动画首帧。

Handoff: 返回 Sol；Task `XYY-20260822-01` 当前 staging Release 已通过独立发布后复验，可完成最终验收与状态同步。

### XYY-20260824-01

Status: FAIL

Test Target: XYY-WEB `/api/contact` → XYY-xiansuo `/api/integrations/website-leads`，包括两端鉴权、字段映射、owner 控制、手机号/座机、duplicate、事务、健康检查、失败语义、客户端边界和回归门禁。

Acceptance Criteria: 独立 Integration Bearer Token；官网浏览器只调用 `/api/contact`；XYY-WEB 保留现有 body/content-type/rate-limit/honeypot/privacy/phone/email 校验并以有限超时失败关闭；XYY-xiansuo 正确映射并服务端控制 owner/created_by，duplicate 不重复插入且不返回 500；Directus CMS health 与 Xiansuo contact health 分离；不泄露 Secret，不修改 Oracle/SQLite Schema，不双写。

Tests:

- `/home/yj/xiansuo/server`：`npm run build` 通过；`npm test` 通过，178 tests passed、0 failed。
- `/home/yj/XYY-GEO/website`：`npm run verify` 通过，46 test files、305 tests passed；typecheck、lint、maintainability、assets、Astro build 均通过。
- XYY-WEB 临时 Playwright 配置位于 `/tmp/xyy-luna-playwright.config.ts`，使用绝对 `testDir`、仓库 `webServer`（显式 cwd）和 `/usr/bin/google-chrome`；E2E `39 passed / 7 skipped`。桌面与移动项目均实际执行；跳过项为仓库既有移动项目配置的明确 skip。
- XYY-WEB formal 临时配置 `/tmp/xyy-luna-formal.config.ts` 使用同一系统 Chrome；formal `3 passed`。
- 独立 Xiansuo route 注入矩阵覆盖无 Authorization、非 Bearer、错误 Token、员工 JWT、正确 Token、短 Token、缺失/无效 owner、非法/超长/null payload、手机号、座机、字段映射、伪造 owner/created_by、格式变体 duplicate、lead+audit rollback 和员工 GET `/api/leads` JWT 语义；仓库集成测试全部通过。
- 独立源码/配置检查确认浏览器没有直接调用 `xs.tomatopia.top`；XYY-WEB 仅在服务端 storage 使用 `XIANSUO_API_URL`；health 同时要求 `cmsContent` 与 `contactStorage`；diff 中未发现真实 Secret、Oracle/数据库迁移或双写。
- `git diff --check`：XYY-WEB 与 XYY-xiansuo 均通过。

Result: FAIL

Expected: Integration API 在非 duplicate 的数据库/审计异常时返回不泄露内部错误细节的稳定 500 包络。

Actual: 直接将 `websiteLeadIntegrationRoutes` 注册到默认 Fastify 实例（未附加应用级错误处理器）后，审计触发器 `RAISE(ABORT, 'SQLITE_CONSTRAINT secret-detail')` 使合法 POST 返回 HTTP 500，响应体为 `{"statusCode":500,"code":"ERR_SQLITE_ERROR","error":"Internal Server Error","message":"SQLITE_CONSTRAINT secret-detail"}`，泄露 SQLite 错误详情。

Reproduction: 在隔离临时 SQLite 中建立 `audit_logs` 的 `BEFORE INSERT` 触发器，调用带正确随机 Integration Token 的合法 `/api/integrations/website-leads` 请求；未修改仓库测试或业务代码。当前 `src/index.ts` 的完整 `buildApp()` 确有统一 `setErrorHandler`，生产组装路径返回 generic `{code:1,msg:'服务器内部错误',data:null}`，但 route 本身在默认 Fastify 注册方式下仍可泄露，属于接口局部安全缺口。

Evidence: 临时 probe 输出 `status=500`、`leaksSecret=true`、`leaksSqlite=true`；相关实现为 `server/src/routes/website-leads.ts` 的事务 catch 在非 duplicate 异常处 `throw error`，完整应用级 handler 位于 `server/src/index.ts`。

Likely affected area: XYY-xiansuo Integration API 的非唯一数据库异常、审计写入异常或未来任何未预期异常；官网端会将下游 500 转为通用失败，但直接 API 调用方可看到内部错误。

Severity: HIGH（客户线索 Integration API 的错误响应可能泄露数据库实现细节；当前完整生产组装路径有缓解，但路由缺少局部 fail-closed 保证）。

Regression: 业务功能、Auth、payload、字段/owner/duplicate/事务、员工 JWT、官网 contact 安全校验、CMS fallback、桌面/移动浏览器、formal、health contract 和两仓库 build/verify 均通过；FAIL 仅来自上述独立错误泄露 probe。

Remaining risks: Terra 需在原 Task ID 下修复 Integration route 的非 duplicate 异常响应并补充断言；随后 Luna 必须重新执行相关 Xiansuo tests、XYY-WEB verify、错误语义 probe 和必要浏览器回归。未执行部署、生产环境修改、CMS 写入、数据库迁移、push 或 merge。

Handoff: 返回 Sol；`XYY-20260824-01` 保持 FAIL，按 `Luna → Sol → Terra → Sol → Luna Re-test` 闭环，不进入 Nova Review。

#### Re-test after Integration error-envelope fix

Status: PASS

Test Target: Terra 对 XYY-xiansuo `server/src/routes/website-leads.ts` 非 UNIQUE 异常 catch 的固定 500 响应，以及同一 Task 的 duplicate、事务回滚和官网回归门禁。

Tests performed:

- Diff 核对：XYY-xiansuo 本次实现变更仅为 Integration route 的 rollback 后固定返回和对应测试断言；官网业务实现文件未在此次返工中改变，Sol 另行修正了一处 README 历史说明。用户 `.codex/config.toml` 与其他已有改动保留。
- 独立复现原失败：在临时 SQLite `audit_logs` trigger 中执行 `RAISE(ABORT, 'SQLITE_CONSTRAINT secret-detail')`，直接注册 `websiteLeadIntegrationRoutes` 的默认 Fastify 实例调用合法请求，得到 HTTP 500，响应体严格为 `{"code":1,"msg":"线索接收失败","data":null}`。
- 敏感响应检查：响应不含 `error`、`message`、`stack`、`SQLITE`、`secret-detail`、Integration Token、手机号或其他客户字段；审计异常后 `leads` 对应手机号计数为 0，确认 rollback。
- 独立 duplicate 复测：先提交 `13700137000`，再提交格式变体 `137 0013-7000`；两次均为 HTTP 200，第二次为 `{code:0,msg:"线索已存在",data:{duplicate:true}}`，数据库仍只有 1 条。
- `/home/yj/xiansuo/server`：`npm run build` 通过；`npm test` 178 tests passed、0 failed。
- 两仓库 `git diff --check`：通过。

Result: PASS

Regression coverage: 原 Luna PASS 中的 XYY-WEB `verify`（46 files / 305 tests）、XYY-WEB E2E（39 passed / 7 skipped，桌面/移动系统 Chrome）、formal（3 passed）、Auth/payload/owner/映射/手机号/座机/duplicate/员工 JWT/health/Secret/Oracle 边界证据仍适用；Xiansuo 全量复测再次通过。官网 contact storage 与浏览器调用边界未在 Terra 返工中改变。

Remaining risks: 本次只完成本地实现与验证；双方生产环境变量、部署和真实端到端联调仍未执行。Integration API 仍应通过完整 `buildApp()` 运行，不能脱离仓库统一 Fastify 错误配置单独暴露；本复测已确认 route 自身也 fail-closed。

Handoff: 返回 Sol；`XYY-20260824-01` 的 Luna 安全阻塞已关闭，结果为 PASS，可进入 Nova Review。未部署、未修改生产环境、未执行 CMS/数据库迁移、未 push/merge。

#### Re-test after Nova Review: production configuration and documentation contract

Status: PASS

Test Target: Nova 指出的生产 Web 环境模板/prepare/deploy 一致性、XYY-xiansuo PM2 环境透传、隔离加载测试，以及历史 `contact_leads` 保留与当前不新写/不迁移文档契约。

Tests performed:

- Web 正式模板 `deploy/production/web/web.env.example`、`deploy/production/web/prepare-web-server.sh`、`scripts/deploy.sh` 一致要求 `DIRECTUS_CONTENT_TOKEN`、HTTPS `XIANSUO_API_URL` 和 `XIANSUO_INGEST_TOKEN`；均不再把 `DIRECTUS_CONTACT_TOKEN` 或 legacy `DIRECTUS_TOKEN` 作为 Web runtime 前置条件。
- 模板只包含非真实 placeholder；`XIANSUO_INGEST_TOKEN` 为空，未发现真实 Secret。`bash -n deploy/production/web/prepare-web-server.sh`：PASS，未执行脚本、root 操作或部署。
- `tests/unit/production-web-contact-config.test.ts` 已纳入 Website verify，断言模板、prepare、root deploy 三者契约一致及旧联系令牌/fallback 缺失。
- Xiansuo `deploy/ecosystem.config.cjs` 显式透传 `WEBSITE_LEAD_INGEST_TOKEN`、`WEBSITE_LEAD_OWNER_ID`，无默认值；`server/test/deploy-ecosystem.test.ts` 使用随机临时 token、隔离 `XIANSUO_SERVER_DIR`，恢复环境变量与 `require.cache`，未调用 PM2。该测试在全量测试中通过。
- `README.md`、`deploy/production/web/README.md` 和 `docs/CMS_CONTENT_MODEL.md` 明确：历史 Directus `contact_leads` 保留；当前 Web 不新写、不迁移、不双写；新留言走 XYY-xiansuo；health 分离为 `cmsContent` 与 `contactStorage`。Sol 的当前任务措辞修订不改变该客观边界。
- Website：`npm run verify` 通过，47 test files、306 tests，Astro build/typecheck/lint/maintainability/assets 均通过；`npm run format:check` 通过。
- Xiansuo：`npm run build && npm test` 通过，179 tests passed、0 failed。
- 两仓库 `git diff --check`：PASS。
- 前轮浏览器 runtime 未改变；此前使用系统 Chrome 的 E2E `39 passed / 7 skipped`（桌面/移动）及 formal `3 passed` 证据继续适用，本轮未机械重跑。

Result: PASS

Regression coverage: 覆盖 Nova 指出的三项阻断：生产 Web 三处配置契约、Xiansuo PM2 实际环境透传与隔离恢复、CMS 历史线索保留/当前不写不迁移/health 分离文档；同时覆盖两仓库格式、类型、构建、单元测试和 diff 门禁。未执行 PM2、部署、生产环境、CMS 写入、数据库迁移、push 或 merge。

Remaining risks: 真实生产 token、有效 `WEBSITE_LEAD_OWNER_ID` 和双方运行环境仍需未来经授权配置；本次只验证模板、代码和测试，不代表生产已切换。

Handoff: 返回 Sol；Nova 指出的配置/文档阻断已通过独立复测，`XYY-20260824-01` 的 Luna 结果为 PASS，可进入 Nova Re-review。

### XYY-20260824-02

Status: FAIL

Risk: HIGH

Test Target: 发布后 `xs.tomatopia.top` Xiansuo、`wz.tomatopia.top` staging Web、真实浏览器联系表单端到端链路，以及正式主站只读完整性。

Tests performed:

- XYY-xiansuo public checks：`https://xs.tomatopia.top/` HTTP 200；`/api/health` HTTP 200；Integration health with server-side token HTTP 200、`code=0`、`data.status=ok`；Integration health without Authorization HTTP 401；伪造员工 JWT HTTP 401；员工 `/api/leads` without Authorization HTTP 401。
- Xiansuo systemd：`xiansuo-api.service` 为 `active/running`，`NRestarts=0`；未执行 PM2、部署或生产写入。
- Website staging：`/version` 返回 `gitSha=4c1f31346ebe19664bccfec13d69841bd31a5e4e`、`releaseId=20260824T090653Z-4c1f313`、`environment=staging`；`/healthz` 返回 `status=ok`、`cmsContent=ok`、`contactStorage=ok`。
- 主站只读 SHA：主页 `45291ef9c7c8ab1751a7747469f701a073db64236abc9acc51fea45d64ed291e`；robots `1a3b3749ed2976e528adbe550381110e98f669decc0d3f5e6043ac05f2e026ee`，均与验收基线一致；未提交主站表单。
- 只读 SSH SQLite 核对：配置 owner 为 `2`；当前已存在的 direct smoke lead ID 8 为测试数据，但手机号为 `01000000001`。查询本 Task 要求的规范化手机号 `01000000002` 返回不存在，未发现本次要求的第二条测试线索。
- Git：任务开始时仅有用户已有 `.codex/config.toml` 修改；未修改业务代码、生产配置、CMS、数据库或 Secret。`git diff --check` 已通过。

Result: FAIL

Expected: 使用真实 Chrome UI 打开 `https://wz.tomatopia.top/contact`，提交手机号 `010-00000002` 的受控测试留言两次，并获得两次 UI 成功后再做 Xiansuo SQLite 字段/duplicate/audit 核对。

Actual: Chrome 扩展浏览器在两种真实 UI 操作路径均无法加载 staging 联系页：`tab.goto('https://wz.tomatopia.top/contact')` 两次各超时约 30 秒；认领现有 Chrome 空白标签后再次导航仍超时，标签保持 `about:blank`。因此没有实际提交表单，也没有创建本 Task 的测试 lead；不能将 HTTP/SSH 只读结果冒充 UI PASS。

Reproduction: 通过 browser skill 连接 Chrome，创建/认领 `about:blank` 标签后导航到 `https://wz.tomatopia.top/contact`；两次 `goto` 均在 30 秒超时。内置浏览器表面不可用，未切换到 curl 或其他自动化方式代替 UI 操作。

Evidence: 浏览器导航失败；SQLite 只读查询 `phone='0100000002'` 返回 `lead=null`；现有 ID 8 的手机号为 `01000000001`，不是本 Task 要求的 `010-00000002`。发布版本、健康、鉴权和主站 SHA 只读检查均通过。

Likely affected area: 当前 Chrome 扩展/浏览器控制环境与 staging 页面导航，不是已验证的应用发布版本或 Integration API；无法据此判断真实 UI 表单提交、浏览器请求仅到 Web、桌面/移动 UI 提交结果。

Severity: HIGH（用户明确要求的真实 UI 端到端验收未完成；不得以服务端 smoke 替代）。

Remaining risks: 未验证第二条受控线索的字段映射、duplicate 不覆盖、无 follow-up、audit、Directus 中不存在该 phone，以及桌面/移动真实 UI 的控制台/网络请求证据。当前未产生新的测试线索，无需清理。

Handoff: 返回 Sol；`XYY-20260824-02` 保持 FAIL。需恢复可用浏览器控制后沿用同一 Task ID 重试 UI 表单；未部署、未写生产 CMS、未操作 Oracle、未 push/merge。

#### Re-test: real Playwright UI after browser-control failure

Status: PASS

Test Target: 使用独立 Playwright CLI Chromium session `luna-task02-retest-headless` 复测 `https://wz.tomatopia.top/contact` 桌面/移动 UI、两次相同手机号提交、浏览器网络边界，以及 Xiansuo staging 数据落库。

Tests performed:

- 真实 Playwright CLI：`bash /home/yj/.codex/skills/playwright/scripts/playwright_cli.sh --session luna-task02-retest-headless open https://wz.tomatopia.top/contact`；headed 模式因当前会话无 X server 不可用，改用同一真实 Chromium 的 headless UI session，未改仓库 Playwright 配置。
- 桌面表单实际填写并提交两次：姓名 `STAGING E2E 测试`、电话 `01000000002`、公司 `XYY-STAGING-DO-NOT-FOLLOW`、邮箱 `test@example.test`、服务“其他”、受控 E2E message、隐私同意。两次页面均显示“提交成功！商务团队将根据您的需求与您联系”。
- Playwright `requests` 记录两次均为 `POST https://wz.tomatopia.top/api/contact => 200 OK`；未出现浏览器直连 `xs.tomatopia.top`，未出现其他 contact 目标。`console`：0 messages，Errors 0，Warnings 0。
- 移动 viewport `390x844` 真实打开 contact 页面；表单、提交按钮和移动导航均可见，点击“打开菜单”后出现“移动端导航”及全部主要入口；保存了 snapshot 与 screenshot：`.playwright-cli/page-2026-08-24T09-33-48-737Z.yml`、`.playwright-cli/page-2026-08-24T09-34-00-265Z.png`、`.playwright-cli/page-2026-08-24T09-34-09-515Z.yml`。
- 只读 SSH SQLite：测试线索唯一为 ID `9`（TEST ONLY / DO NOT FOLLOW），`phone=01000000002`，`contact_name`、`company_name`、`source=官网留言`、`status=新线索`、`intent_level=未知`、`lead_date=2026-08-24`、`owner_id=2`、`created_by=2` 均正确；`demand_note` 完整保留受控 message，`source_note` 包含 `咨询服务：other` 与 `邮箱：test@example.test`。
- 同号第二次提交未覆盖原记录：`leads` count=1；`audit_logs` 仅有该 lead 的一条 `create`（`user_id=2`、`source=website_integration`）；`follow_ups` 为空。未删除或修改任何记录。
- staging Directus `contact_leads` 只读查询返回 HTTP 403（当前内容 Token 无权读取该历史私有集合），未执行写入/删除/迁移；因此不能以无权限响应冒充记录不存在，但 Xiansuo 唯一测试线索与浏览器证据均已核对。
- Xiansuo 公开 H5 根页面 HTTP 200、`/api/health` HTTP 200；Integration health 正确服务 Token HTTP 200，缺失 Authorization HTTP 401，伪造员工 JWT HTTP 401；员工 `/api/leads` 无认证 HTTP 401。staging `/version` 为 SHA `4c1f31346ebe19664bccfec13d69841bd31a5e4e`、release `20260824T090653Z-4c1f313`，`/healthz` 为 `cmsContent=ok/contactStorage=ok`。
- 正式主站只读 SHA 仍为主页 `45291ef9c7c8ab1751a7747469f701a073db64236abc9acc51fea45d64ed291e`、robots `1a3b3749ed2976e528adbe550381110e98f669decc0d3f5e6043ac05f2e026ee`；未提交主站表单。前轮 Xiansuo `build + test`、Website `verify`、正式 E2E/formal 和安全边界证据未因本次 UI-only 重试而改变，继续适用。
- 两仓库 `git diff --check`：通过；Xiansuo 工作树无新修改，Website 仅保留用户 `.codex/config.toml` 与本工作账改动。未输出或提交 Secret，未触碰 Oracle、生产 CMS、生产数据库、部署、PM2、push 或 merge。

Result: PASS

Regression coverage: 关闭初轮浏览器控制通道 FAIL；完成真实桌面两次 UI 提交、移动页面可用性、浏览器仅调用 Web `/api/contact`、Xiansuo duplicate/字段/owner/audit/follow-up 只读核验，并复核发布版本、健康、鉴权和正式主站完整性。

Remaining risks: staging Directus `contact_leads` 当前 Token 无读取权限（HTTP 403），无法从该接口直接证明该 phone 的历史集合记录数；本次未扩大权限。测试线索 ID 9 必须保留并标记 TEST ONLY / DO NOT FOLLOW。真实生产配置、生产提交和生产数据仍未在本次执行。

Handoff: 返回 Sol；同一 Task ID `XYY-20260824-02` 的发布后独立 QA 复测 PASS，可进入 Sol Final Acceptance。测试线索 ID 9：TEST ONLY / DO NOT FOLLOW。

#### No Double Write supplement

Status: PASS

Independent evidence:

- 检查 `/tmp/xyy-staging-directus-readonly.sh`：脚本只读取 `/var/www/xyy-cms/.env` 以供连接，设置运行时 `PGPASSWORD`，执行 `BEGIN TRANSACTION READ ONLY`、单条 `contact_leads` 规范化手机号计数查询和 `COMMIT`；不含写入、删除、迁移命令，不输出凭据。
- 通过 SSH 独立执行该脚本，实际输出事务边界与计数 `0`：Directus staging `contact_leads` 中不存在 `01000000002`。API 403 后未扩大 Token 权限。
- 通过只读 SQLite 独立复核 Xiansuo `phone=01000000002` 的 `leads` count=`1`。未执行删除、更新或其他数据库写操作。

Result: PASS

No Double Write: 对本次受控线索，Directus=0、XYY-xiansuo=1，符合新留言唯一登记目标；Oracle/Directus 历史数据未迁移或修改。

Handoff: 返回 Sol；`XYY-20260824-02` 的 No Double Write 补证完成，最终 QA 仍为 PASS。

### XYY-20260824-03

Status: PASS

Test Target: `wz.tomatopia.top` 联系表单经 staging `/api/contact` 和服务端 HTTPS Integration 写入 XYY-xiansuo `leads` 的真实路径。

Acceptance Criteria: 表单成功；浏览器 staging `/api/contact` 请求成功；XYY-xiansuo 中出现且仅出现本次测试线索；联系人、来源、状态及 `[XYY PATH TEST]` 标记一致。

Tests: 独立只读检查 Playwright 提交后快照、网络 trace、控制台/page error 与截图；只读查询 XYY-xiansuo live SQLite 中规范化电话、姓名和需求标记的唯一记录，并复核 audit 和 follow-up。

Result: PASS

Evidence: 页面显示提交成功；trace 仅有一次 `POST https://wz.tomatopia.top/api/contact`，HTTP 200，无浏览器直连 Xiansuo、无控制台或页面错误。线索 ID 10 唯一匹配，`contact_name=Codex路径测试-请勿跟进`、`source=官网留言`、`status=新线索`，`demand_note` 包含 `[XYY PATH TEST]`；对应一条 website Integration create audit，无 follow-up。

Regression: 本任务只验证指定路径，未重新提交表单，未访问 `56xyy.com`，未写 CMS/数据库，未修改应用、配置或生产基础设施。

Risks: 无阻断；证据来自 Sol 本次真实浏览器会话和 Luna 的独立只读远端复核。

Handoff: 返回 Sol；路径验证 PASS，可最终关闭 `XYY-20260824-03`。

### XYY-20260824-04

Status: PASS

Test Target: XYY-WEB 本地/GitHub/staging 发布一致性、原子回滚资料，以及 XYY-xiansuo 本地/GitHub/runtime 无变更一致性。

Acceptance Criteria: Web refs 与目标提交一致、CI 成功、staging 版本和双健康正常、核心路由可用、回滚目标有效；Xiansuo 三方 SHA 一致且服务未重启；无 Secret、主站、Oracle 或数据库越界。

Tests: 独立只读核对 Git refs、GitHub CI、staging `/version` 与 `/healthz`、8 个核心路由和真实 404、远端 current/previous Release、PM2 运行目标；核对 Xiansuo Git/runtime SHA、公开 health、systemd 状态与重启计数；扫描目标增量的 Secret 和 Scope。

Result: PASS

Evidence: Web 本地/GitHub main 与 feature 均为 `2c75bcd0d3878f4877afac1cc07c4dfa18913360`，CI Run `32788366421` 成功；staging Release 为 `20260825T054116Z-2c75bcd`，`cmsContent=ok`、`contactStorage=ok`，PM2 online，上一 Release 存在。Xiansuo 三方均为 `3c3eb1baa82a942c4a5f867a50d3e640b8497a5c`，systemd active/running、`NRestarts=0`。

Regression: 覆盖发布身份、健康、核心路由、真实 404、回滚、进程状态、Xiansuo 无重启及 Secret/Scope 边界；未提交表单，未访问正式主站，未读取 Token 或操作数据库。

Risks: 无阻断；staging `/healthz` 已验证联系存储依赖，无需读取 Integration Token。

Handoff: 返回 Sol；发布后独立 QA PASS，可进入 Nova Review 与最终验收。

### XYY-20260825-01

Result: PASS

Tests performed:

- 独立检查 `/home/yj/xiansuo` 实际 diff：仅 `server/src/routes/website-leads.ts` 与 `server/test/website-leads-integration.test.ts`；无 Schema/迁移、生产配置、既有线索或 Secret 改动。`git diff --check`：PASS。
- `cd /home/yj/xiansuo/server && npx tsx --test test/website-leads-integration.test.ts`：8/8 通过；五个稳定码分别写入 `鞋服云仓`、`后整质检修复`、`物流云`、`全链路解决方案`、`其他`，中文/自定义/未知服务保持原值，`service=null` 与 email-only `source_note` 行为正确。
- `cd /home/yj/xiansuo/server && npm run build`：PASS。
- `cd /home/yj/xiansuo/server && npm test`：180/180 通过、0 failed。
- XYY-WEB 聚焦合约：`npx vitest run tests/unit/contact-service-cms.test.ts tests/unit/contact-integration.test.ts tests/unit/contact.test.ts`：3 files、21 tests 通过；只读核对 `ContactInquiryFields.astro` 与 CMS/test 合约的五个 code/label 完全一致。
- XYY-WEB `git diff --check`：PASS；当前 Web 工作树仅有 Terra 的 `docs/TERRA.md` 日志变更，无 Web 业务实现 diff。

Regression coverage: 全量 Xiansuo tests 覆盖 Integration 鉴权、严格 payload、duplicate/idempotency、owner 控制、audit、事务回滚、员工 JWT、手机号/座机规范化；聚焦 Web contact tests 覆盖服务字段、服务端白名单 payload、duplicate 成功语义、失败关闭、honeypot、限流、body/email 校验、HTTPS 与短 Token 配置。未执行无关浏览器/E2E 矩阵，符合本任务范围。

Remaining risks: 未来新增官网服务码会继续按原值写入，需另行确认中文标签；本次未部署、未写生产 CMS/数据库、未修改 Web 业务代码，未验证生产运行环境。

Handoff: 返回 Sol；`XYY-20260825-01` 独立 QA PASS，可进入 Nova Review 与最终验收。

#### Re-test after Nova REJECTED

Task ID: XYY-20260825-01

Result: PASS

Tests performed:

- 独立检查 Terra 最终 diff：Xiansuo 仅修改 `server/src/routes/website-leads.ts` 与 `server/test/website-leads-integration.test.ts`；实现使用 `Map.get()`，新增 `toString`、`constructor`、`__proto__` 原型键未知值回归，Web 业务代码未修改。
- `cd /home/yj/xiansuo/server && npx tsx --test test/website-leads-integration.test.ts`：8/8 通过；五个稳定码映射正确，普通未知/中文自定义值及三个原型键未知值均持久化原值，`service=null` 与 email-only 正确。
- `cd /home/yj/xiansuo/server && npm run build`：通过。
- `cd /home/yj/xiansuo/server && npm test`：180/180 通过、0 failed。
- `/home/yj/xiansuo` 与 XYY-WEB `git diff --check`：均通过。

Regression coverage: 集成测试及全量服务端测试覆盖 Bearer 鉴权、严格 payload、owner/active owner、duplicate 与手机号格式化、audit source、事务回滚、员工 JWT；本次新增持久化原型键未知值覆盖，确认不存在对象原型属性误映射。

Remaining risks: 未来新增服务码仍按原值保存，需另行确认中文标签；本次未部署、未写生产 CMS/数据库、未修改 Web 业务代码。

Handoff: 返回 Sol；Nova REJECTED 项已完成返工后的独立 QA Re-test，`XYY-20260825-01` PASS，可继续 Nova Review/最终验收。

### XYY-20260825-02

Task ID: XYY-20260825-02

Result: PASS

Tests performed:

- 独立核对 XYY-xiansuo 本地 `main` 与 feature、GitHub `main` 与 feature 均指向完整 SHA `a5f82b96b271e266af58ca14b505ad026f050244`；目标 commit 仅改动 `server/src/routes/website-leads.ts` 与对应集成测试。XYY-WEB commit `17dd56d201ea6666a3e972488e914a97e6484778` 仅改动治理/工作账文档，GitHub CI Run `32818079729` 成功。
- 只读核对生产 systemd：`xiansuo-api.service` 为 `active/running`、`NRestarts=0`，`ExecStart` 与 `/opt/xiansuo-releases/a5f82b96b271e266af58ca14b505ad026f050244/RELEASE_SHA` 一致，环境文件仍为 `/etc/xiansuo/xiansuo-api.env`；旧 release `3c3eb1b...` 与 `/var/backups/xiansuo/XYY-20260825-02/xiansuo-api.service.pre` 均存在。
- `https://xs.tomatopia.top/api/health` HTTP 200；Nginx 记录重启瞬间 14:45:17 一次 502，14:45:19 恢复 200，无回滚启动迹象。release journal 自 14:45 起无 error-like 服务日志或凭据泄露；token 关键词仅出现在迁移描述文本。
- 独立检查 Sol 提供的真实 Playwright trace 与截图：恰有 `POST https://wz.tomatopia.top/api/contact`、HTTP 200，截图显示“提交成功”；未见浏览器直连 Xiansuo。远端 SQLite 只读查询确认规范化手机号 `01000000025` 精确一行、预期 lead ID 12，联系人“XYY标签发布测试-请勿跟进”，来源“官网留言”、状态“新线索”；`source_note` 含 `咨询服务：鞋服云仓` 且不含 `cloud-warehouse`，需求标记 `[XYY-20260825-02 LABEL TEST]` 存在，create audit=1、follow-up=0。
- Xiansuo `website-leads-integration.test.ts` 聚焦测试 8/8 通过；未写生产数据、未读 Integration Token、未修改应用/配置/服务/Git。

Regression coverage:

- 覆盖 release 三方身份、systemd 健康与重启计数、环境路径、回滚资料、短暂 502 后恢复、真实浏览器成功页/网络边界、lead 字段映射、服务标签中文化、唯一记录、audit 与无 follow-up，以及 Secret/Schema/迁移/Directus/Oracle/正式主站范围检查。
- GitHub Xiansuo CI Run `32818086795` 的唯一失败为未改动的 `phase45-pilot-readiness.test.ts` 在 Node 22 下调用不存在的 `db.serialize`（179/180）；baseline `3c3eb1b...` CI 也为 failure，且本次目标集成测试 8/8、生产标签 E2E 均通过。该既有全局 CI 问题对本次标签发布非阻断，未修改相关测试或 workflow。

Remaining risks:

- Xiansuo 全局 GitHub CI 仍有与本任务无关的 Node 22/SQLite API 兼容性失败，后续应由独立维护任务处理；本任务不扩大范围。
- 测试线索 ID 12 为 `TEST ONLY / DO NOT FOLLOW`，应按既定审计策略保留；本次未执行删除。

Handoff: 返回 Sol；XYY-20260825-02 发布后独立 QA PASS，可进入最终验收。

### XYY-20260830-01

Task ID: XYY-20260830-01

Result: PASS

Tests performed:

- `npm run cms:generate-content-seeds` 连续执行两次均通过；生成结果均为 10 个 service pages、14 个 publications、6 个 case details，生成文件 SHA-256 前后及两次执行后保持一致，确认生成器幂等且保留 `stats`/`features`。
- `npx vitest run tests/unit/service-page-seed-structure.test.ts tests/unit/cms-setup.test.ts tests/unit/cms-sync.test.ts`：3 个文件、24 项测试通过。覆盖 9 条 `SPECIALTY_LINKS` 目标、每页 4 个完整 stats/6 个完整 features 且与源页面 props 一致、精确 `img_src` 映射、`sort=slug`、只改三个结构字段、dry-run 无 CMS 请求、缺失/重复记录、不完整 Seed、已配置 `hero_image`、非 published 的 fail-closed。
- `npm run verify`：48 个测试文件、316 项测试通过；typecheck（373 files/0 diagnostics）、lint、maintainability、assets、生产构建均通过。
- `npm run format:check`：通过；`git diff --check`：通过。
- 隔离临时目录调用 `createCmsSyncRuntime.writeBackup(..., { includeDryRun: true })`：备份文件权限为 `0600`；仓库 `output/cms-sync/` 命中 `.gitignore:8 output/`。未连接真实 Directus，未执行真实环境 repair 或任何 CMS PATCH。
- 使用隔离临时目录和 mock Directus fetch 执行 repair CLI 默认路径：仅发出 1 次 `GET /items/service_pages?limit=-1&sort=slug`，规划 9 次 PATCH、实际 PATCH 次数为 0，生成 1 个权限 `0600` 的备份；确认默认模式为 dry-run 且不写 CMS。
- 只读 HTTP 矩阵核对 9 条目标页：`https://wz.tomatopia.top` 全部 HTTP 200、每页 6 个 feature 项且使用期望 hero URL；主站 `https://56xyy.com` 当前 9 页均为 0 个 feature 项、6 页未使用期望新 hero URL，作为本次修复前的已知生产缺陷基线，不作为未部署代码的失败。
- `src/lib/directus-content-queries.ts` 及运行时 CMS authority/fallback 路径无 diff；本次无业务实现、数据库/Schema、生产配置或部署变更。

Regression coverage: 覆盖 Seed 生成、9 条目标页结构完整性、图片缓存规避映射、CMS 修复 CLI 的计划/字段范围/安全前置条件、备份与忽略规则，以及全站 type/lint/test/build/资源门禁和 staging/main 只读页面证据。

Remaining risks: 本次验证未使用真实管理员 Token，未执行生产 CMS dry-run/apply；生产修复仍需由获授权人员先备份，再执行默认 dry-run，确认 9 条记录均满足 published、无 `hero_image` 且计划仅涉及 `stats`/`features`/`img_src` 后再 apply，并完成回读验证。9 次 PATCH 不具备事务语义，中断时必须依据备份和零差异复核处理。主站当前缺失内容和旧图片仍待该受控 CMS 修复流程解决。

Handoff: 返回 Sol；`XYY-20260830-01` 独立 QA PASS，可进入 Nova Review。未部署、未推送、未写 CMS、未修改 Oracle/数据库。

### XYY-20260831-02

Status: FAIL

Test Target: News 发布时间可见性与 `POST /api/integrations/news/batch` 批量发布接口的独立 QA；同时覆盖既有 News、Directus 读取、联系线索 Integration 和仓库门禁回归。

Acceptance Criteria: 无时区 Directus 时间按 Asia/Shanghai 解释；带 `Z`/offset 的时间按绝对时刻解释且 malformed timestamp 被拒绝；未来文章不显示并在过滤后分页；批量发布接口必须严格 Bearer 鉴权、三类 Token 独立且配置缺失/过短/复用时 fail-closed；Directus success response 无效时不得 false success；现有功能与安全边界不回归。

Tests performed:

- 独立运行 `npx vitest run tests/unit/news-publication-time.test.ts tests/unit/news-publishing-api.test.ts tests/unit/news-publishing-errors.test.ts tests/unit/directus.test.ts tests/unit/contact-integration.test.ts`：5 files、54 tests 通过。
- `npm run verify`：typecheck 382 files/0 diagnostics、lint、maintainability、assets、51 files/348 tests、Astro build 全部通过。
- `git diff --check`：通过。
- 构建产物检查：`dist/client` 未发现 `NEWS_PUBLISH_API_TOKEN`、`DIRECTUS_NEWS_WRITE_TOKEN`、`XIANSUO_INGEST_TOKEN` 或 Bearer 内容；新增 Secret 仅在服务端 chunk 中以运行时环境变量名存在。
- 独立 Node 边界检查：`parseNewsPublicationTime('2026-02-30T14:00:00Z')` 返回有效时间戳 `1772460000000`，确认无效日历日期未被拒绝；`2026-08-31T25:00:00+08:00` 与非法 offset 能被拒绝。
- 源码契约检查：`batch.ts` 仅阻止 caller token 与 write token 相同；`storage.ts` 仅在 content token 非空时阻止 write/content 复用，且未要求 content token 存在/达到最小长度；caller/content 复用未被拒绝。`createdArticles()` 将空字符串 ID 转为 `0` 并可能接受为成功响应。

Result: FAIL

Expected:

- 所有格式错误或无效日历日期的带 offset 时间均拒绝，不得进入公开可见性判断或发布写入。
- `NEWS_PUBLISH_API_TOKEN`、`DIRECTUS_NEWS_WRITE_TOKEN`、`DIRECTUS_CONTENT_TOKEN` 三者均存在、满足长度要求且两两不同；任意缺失、过短或复用均在 fetch 前 fail-closed。
- Directus 返回的每条创建记录必须有有效、非空的 ID；无效响应应返回稳定失败，不得报告发布成功。

Actual:

- `2026-02-30T14:00:00Z` 被 `Date.parse` 归一化并接受；对应 `validation.ts` 也会接受该值。
- caller 与 content token 相同的配置不会被 route 拦截；content token 为空或过短时仍可能调用 Directus；只有 write/content 复用且 content 非空才被拦截。
- `id: ''` 经过 `Number('')` 变为 `0`，`createdArticles()` 认为响应有效。

Reproduction:

1. 在仓库根目录执行 `node --experimental-strip-types --input-type=module`，导入 `src/lib/news-publication-time.ts`，调用 `parseNewsPublicationTime('2026-02-30T14:00:00Z')`，得到 `1772460000000` 而非 `null`。
2. 阅读 `src/pages/api/integrations/news/batch.ts:17-20` 与 `src/lib/news-publishing/storage.ts:65-74`：未见 caller/content 两两隔离及 content token 完整配置校验。
3. 阅读 `src/lib/news-publishing/storage.ts:43-62`：`typeof id === 'string'` 后直接 `Number(id)`，空字符串得到 `0`。

Evidence: `src/lib/news-publication-time.ts:14-16`、`src/lib/news-publishing/validation.ts:40-44`、`src/pages/api/integrations/news/batch.ts:17-20`、`src/lib/news-publishing/storage.ts:65-74,43-62`；命令证据为上述 Vitest/verify 通过及 Node 边界输出。

Likely affected area: News 公开发布时间解析、批量发布接口的凭据隔离与 Directus 响应校验。

Severity: HIGH（无效时间可能错误发布/显示内容；Token 配置隔离不完整；无效下游响应可能造成 false success）。

Regression: 现有 News 查询、分页、分类/详情、联系 Integration、完整类型/lint/maintainability/assets/test/build 均通过；未执行生产/staging 请求、CMS 写入、数据库、部署、Git push/merge 或 Oracle 操作。

Remaining risks: Terra 需在原 Task ID 下补齐严格的带 offset 日期组件校验、三类 Token 两两独立且完整 fail-closed 校验和严格 Directus ID 响应校验；之后 Luna 需复测聚焦用例、完整 `npm run verify` 及上述安全边界。

Handoff: 返回 Sol；`XYY-20260831-02` 保持 FAIL，按 `Luna → Sol → Terra → Sol → Luna Re-test` 闭环，不进入 Nova Review。

#### Re-test after Terra strict validation fixes

Task ID: XYY-20260831-02

Result: PASS

Tests performed:

- 独立核对 Terra 最新 diff：时间解析、News 查询、批量发布接口、环境模板、README 与对应测试均属于本 Task；未发现业务代码外的无关改动。未执行部署、生产请求、CMS/数据库写入、Oracle 操作或 Git push/merge。
- 独立运行 `npx vitest run tests/unit/news-publication-time.test.ts tests/unit/news-publishing-api.test.ts tests/unit/news-publishing-errors.test.ts tests/unit/directus.test.ts tests/unit/contact-integration.test.ts`：5 files、78 tests 通过。新增边界覆盖无效日历日期、`+14:00`/`+14:01`、三类 Token 缺失/过短/复用，以及 Directus ID 空值、0、负数、小数、非数字和越界值。
- `npm run verify`：typecheck 382 files/0 diagnostics、lint、maintainability、assets、51 files/372 tests、Astro build 全部通过。
- `npm run format:check`：通过；`git diff --check`：通过。
- 独立 Node 边界检查确认 `2026-02-30T14:00:00Z`、`24:00:00`、`+14:01`、`+23:00` 均返回 `null`；Shanghai 无时区时间和合法 `+14:00`/`-14:00` 能正确解析。
- 独立构建产物检查：`dist/client` 未出现 `NEWS_PUBLISH_API_TOKEN`、`DIRECTUS_NEWS_WRITE_TOKEN`、`DIRECTUS_CONTENT_TOKEN`、`XIANSUO_INGEST_TOKEN` 或 Bearer 字符串；Secret 只作为服务端运行时环境变量读取。
- 源码/范围检查确认 API 在 fetch 前要求 caller/write/content 三个 Token 均存在、至少 32 UTF-8 bytes 且两两不同；Directus 成功响应 ID 只接受正安全整数；没有 CORS、公开 Token、更新/删除/文件上传/任意集合端点；修改路径均限于 News 时间、批量发布、配置/文档/测试和本工作账。

Regression coverage: 覆盖 Directus News 列表、分类、详情的 Shanghai 无时区/UTC offset/当前边界/未来隐藏/过滤后排序分页/非法 slug 与日期；覆盖批量发布鉴权、非 JSON、body 限制、字段白名单、系统字段阻断、类别/slug/UUID/ISO 校验、批量限制、固定 published 状态、默认发布时间、单次 timeout 请求、duplicate 和所有下游错误语义；同时复核既有联系线索 Integration 和完整 XYY-WEB verify 门禁。

Remaining risks: News 公开查询为保证跨环境时间一致性读取全部已发布候选后在应用侧过滤；当前数据量小，未来文章量显著增长时需另建任务设计有界查询或数据库时区规范化。批量发布接口代码已就绪，但生产启用仍需授权人员创建彼此不同的高熵调用/写入 Token，并为 Directus 写入 Token 配置最小 `news` 创建权限；本次未创建 Secret、未配置生产环境、未写 CMS。

Handoff: 返回 Sol；`XYY-20260831-02` Re-test PASS，首轮三个 FAIL 点均已关闭，可进入 Nova Review。`docs/LUNA.md` 为本次唯一工作账变更。

#### Re-test after Nova URL-safety rejection

Task ID: XYY-20260831-02

Result: PASS

Tests performed:

- 独立运行 `npx vitest run tests/unit/news-publication-time.test.ts tests/unit/news-publishing-api.test.ts tests/unit/news-publishing-errors.test.ts tests/unit/directus.test.ts tests/unit/contact-integration.test.ts`：5 files、90 tests 通过。
- URL 正例验证：远端 `https://directus.example.test/cms`、`http://localhost:8055/cms`、`http://127.0.0.1:8055/cms`、`http://[::1]:8055/cms` 均调用正确的 `/cms/items/news`；回环 HTTP 仅发送到字面量回环地址。
- URL 反例验证：非回环 HTTP、`localhost.evil.test`、`127.0.0.1.evil.test`、数值 IP 别名、`ftp`、userinfo、query、hash 均在 fetch 前返回稳定失败；未向不安全目标发送 Directus write token。
- 独立源码检查确认 URL 校验先于 `fetch` 与 Authorization header 构造，远端只允许 `https:`；HTTP 仅允许真实 `localhost`、`127.0.0.1`、`[::1]`，且保留 `/cms` 路径安全追加 `/items/news`。
- 原首轮边界复测：无效日历时间、`24:00:00`、offset 超过 `+14:00`、Shanghai 无时区时间、合法 offset、三类 Token 缺失/过短/复用、Directus 无效 ID 均由新增测试覆盖并通过。
- `npm run verify`：typecheck 382 files/0 diagnostics、lint、maintainability、assets、51 files/384 tests、Astro build 全部通过。
- `npm run format:check`：通过；`git diff --check`：通过。
- 构建产物检查：`dist/client` 未出现 `NEWS_PUBLISH_API_TOKEN`、`DIRECTUS_NEWS_WRITE_TOKEN`、`DIRECTUS_CONTENT_TOKEN`、`XIANSUO_INGEST_TOKEN` 或 Bearer 字符串。
- 范围检查：本轮未修改业务代码，仅追加本工作账；未执行生产/staging 请求、CMS/数据库写入、Oracle 操作、部署或 Git push/merge。

Regression coverage: 覆盖 URL 协议、主机、路径、userinfo/query/hash 和 fetch 前 secret 发送边界；同时覆盖 News 时间可见性、批量发布鉴权/Token 隔离、payload 白名单与限制、Directus response/duplicate/error 语义、既有联系 Integration 及完整 Web 门禁。

Remaining risks: 批量发布 API 生产启用仍需授权人员配置彼此不同的高熵调用/写入 Token 和 Directus 最小 `news` 创建权限；News 查询当前读取全部已发布候选后应用侧过滤，未来数据量显著增长时需另建性能/时区规范化任务。本次未配置生产环境或写 CMS。

Handoff: 返回 Sol；Nova REJECTED 的 Directus URL 安全问题已通过独立 Re-test，可继续 Nova Re-review。`docs/LUNA.md` 为本轮唯一工作账变更。

### XYY-20260831-03

Task ID: XYY-20260831-03

Result: PASS

Test Target: XYY-WEB staging Release `20260831T081814Z-b91a7b2` 发布后的独立 QA，覆盖 News 页面、批量发布 API 的未启用 fail-closed 行为、基础页面回归、GitHub 同步与生产边界。

Tests performed:

- 只读 HTTP `/version`：HTTP 200，`gitSha=b91a7b20d96adf086cc2ec50aea1a8dd77ecd199`、`releaseId=20260831T081814Z-b91a7b2`、`environment=staging`、`cmsSchemaVersion=2026-08-cms-hardening` 完全匹配目标发布。
- 只读 HTTP `/healthz`：HTTP 200，`status=ok`，`cmsContent=ok`、`contactStorage=ok`。
- 真实 Chromium 桌面视口打开 `https://wz.tomatopia.top/news`：页面标题正确，3 篇已发布文章、分类入口、FAQ、统一转化 CTA 和联系入口均可见；控制台 0 条消息（Errors 0、Warnings 0）。
- 真实 Chromium 移动视口 `390x844` 打开同一新闻页：移动导航、文章列表、FAQ、统一转化 CTA 和页脚均可访问；已保存移动截图，控制台 Errors 0、Warnings 0。
- 只读 HTTP `/contact`：HTTP 200；页面源码仍包含表单向 `/api/contact` 的 POST，未发现浏览器直连 XYY-xiansuo 的实现路径。首页、`/product`、`/cases`、`/senlinqikan`、`/contact` 均 HTTP 200。
- 只读 POST `https://wz.tomatopia.top/api/integrations/news/batch`（无 Secret、空文章列表）：HTTP 503，响应为通用 `{"error":"发布服务暂不可用"}`；未配置发布 Token 时正确 fail-closed，未泄露内部错误或触发 CMS 写入。
- GitHub CI Run `33371936252`：`status=completed`、`conclusion=success`，`headSha` 精确匹配目标 SHA；本地与 `origin/main` 均在 `main`，没有额外本地/远程分支。
- 发布记录显示 staging 原子发布已保留上一 Release 作为 rollback target；本轮未执行回滚。未访问或修改 `56xyy.com`、生产 CMS、数据库或 Oracle。

Regression coverage: 覆盖 staging 发布身份、双依赖健康检查、News 桌面/移动渲染与控制台错误、联系页 `/api/contact` 边界、代表性基础页面、发布 API 未配置时的非敏感 503、GitHub CI/main/分支清理和 staging 原子回滚证据；未执行 CMS 写入、数据库操作或正式主站表单提交。

Remaining risks: `NEWS_PUBLISH_API_TOKEN` 与 `DIRECTUS_NEWS_WRITE_TOKEN` 在 staging 尚未配置，因此本轮只证明批量发布接口安全关闭，未验证真实批量写 CMS；启用该能力需另行配置并执行受控 CMS 验证。没有新增阻塞性回归。

Handoff: 返回 Sol；`XYY-20260831-03` 发布后独立 QA PASS，可进入 Nova Release Review。`docs/LUNA.md` 为本轮唯一修改文件；未修改业务代码、未部署或改配生产环境。

### XYY-20260904-01 — repair-phase preflight recheck

Task ID: XYY-20260904-01

Result: FAIL

Expected: 准备物中的 SQL 应能在 Oracle 19c SQL*Plus/SQLcl 普通用户会话中解析；只执行 SELECT 与必要的 SQL*Plus 显示/失败退出设置，不提交任何既有事务；执行说明应保留用户已授权的备份/隔离修复目标，仅对新增环境、权限或范围外外部目标另行确认。Oracle 实测必须保持 NOT RUN。

Actual:

- `deploy/oracle19c/inspect-revision-capacity.sql:37-40` 使用 `select dbms_db_version.version, dbms_db_version.release from dual`。两者是 PL/SQL 包常量，不是可由 SQL 直接调用的函数；Oracle SQL 对此类引用会产生 `ORA-06553: PLS-221`，因此该版本查询不满足 SQL*Plus/Oracle 19c 兼容性。应改用普通用户可读的版本视图（例如 `PRODUCT_COMPONENT_VERSION`），或采用明确可用的 PL/SQL 方式。
- `inspect-revision-capacity.sql:171` 为 `exit success`，未显式 `ROLLBACK`，也未设置 `EXITCOMMIT OFF`。SQL*Plus 默认 `EXITCOMMIT ON`，成功退出会提交当前会话待提交事务；这与“只读、不改变会话已有事务”的安全承诺冲突。错误分支的 `ROLLBACK` 不能覆盖成功路径。
- `REPAIR-REVISION-CAPACITY.md:53-57` 将“backup destination”一概列为每次都需另行授权，过度收紧了已批准的备份/隔离修复目标；应明确同一已授权范围内的普通备份位置选择无需重复审批，只有新增账户、权限、主机、环境或范围外外部目标才需额外授权。第 37-44 行对历史 backup 脚本的 blanket 禁用也应与“执行已批准正式备份”区分，避免材料阻断已授权备份流程；历史迁移/cutover 脚本仍不得直接启用。

Reproduction:

1. 在 Oracle 19c SQL*Plus/SQLcl 普通会话中执行 `select dbms_db_version.version from dual;`；按 Oracle SQL/PLSQL 包边界会在解析阶段得到 `ORA-06553 / PLS-221`，本机无 Oracle 客户端，故未实际连接或运行。
2. 在同一 SQL*Plus 会话先保留任意待提交事务，再执行该文件；文件末尾 `exit success` 在默认 `EXITCOMMIT ON` 下提交待提交事务。`WHENEVER ... ROLLBACK` 仅覆盖错误路径。
3. 阅读 `REPAIR-REVISION-CAPACITY.md:53-57`，可见 routine backup destination 没有与新增权限/目标区分。

Evidence: `nl -ba deploy/oracle19c/inspect-revision-capacity.sql`、`nl -ba deploy/oracle19c/REPAIR-REVISION-CAPACITY.md`；`git diff --check` 通过；`npx prettier --check deploy/oracle19c/REPAIR-REVISION-CAPACITY.md docs/TERRA.md docs/LUNA.md` 通过；去除注释后的禁止 DDL/DML/权限/提交动词扫描无匹配，SQL 实体均为 SELECT（含一个 EXISTS 子查询）、PROMPT、SET、WHENEVER 和 EXIT。Oracle 官方 SQL*Plus 文档说明 `SET EXITCOMMIT` 默认 ON，`EXIT` 默认提交；Oracle 包文档将 `DBMS_DB_VERSION.VERSION/RELEASE` 定义为 PL/SQL 常量。未运行 Oracle、SQL*Plus、CMS、数据库、服务器或部署操作。

Likely affected area: Oracle 19c revision-capacity 元数据预检脚本的版本查询与会话退出语义；修复说明的授权边界和正式备份执行路径。

Severity: HIGH（脚本当前可能在真正目标会话中直接失败，成功执行还可能提交会话外既有事务；说明措辞可能阻断已批准备份或造成授权误判）。

Regression coverage: 已静态核对固定 owner/table/column、普通用户 `ALL_*` 视图、无正文/Token 输出、无 DDL/DML/权限/动态目标、JSON 约束/依赖查询及隔离克隆→备份恢复→双 CLOB→create/update/history/revert 闸门；格式和 diff 检查通过。Oracle 实际兼容性、正式元数据、备份恢复、CLOB、Directus 行为均 NOT RUN。

Remaining risks: Terra 需在原 Task ID 下最小修正版本查询、成功退出的显式非提交行为和授权措辞；修正后 Luna 复测。本轮不宣称生产可执行或真实修复 PASS。

Handoff: 返回 Sol；`XYY-20260904-01` 独立 QA FAIL，按 `Luna → Sol → Terra → Sol → Luna Re-test` 闭环；未修改应用实现或 Terra 准备物。

### XYY-20260904-01 — repair-phase preflight re-test

Task ID: XYY-20260904-01

Result: FAIL

Expected: Terra 返工后的准备物应移除 `DBMS_DB_VERSION` 包常量 SQL，使用普通用户可读的 `PRODUCT_COMPONENT_VERSION`；专用新会话中禁用 `EXITCOMMIT` 且所有成功/错误退出显式回滚；已授权范围内的正常备份路径无需重复审批；目标表的全部可见索引元数据应清晰、无重复投影。Oracle 实测继续 NOT RUN。

Actual:

- 版本查询已改为 `PRODUCT_COMPONENT_VERSION(PRODUCT, VERSION, VERSION_FULL, STATUS)`；`SET EXITCOMMIT OFF`、`WHENEVER ... EXIT FAILURE ROLLBACK`、`EXIT SUCCESS ROLLBACK` 和专用会话说明均已满足上轮 FAIL 修正要求。
- `inspect-revision-capacity.sql:102-117` 的索引 SELECT 两次投影 `i.index_name`（第 103、104 行），但没有输出 `i.owner`/明确的 `index_owner`。这会产生重复列并丢失索引所有者元数据，属于本次预检输出的明显静态缺陷；目标表过滤本身已改为 `i.table_owner`/`i.table_name`，覆盖全部可见索引。
- `REPAIR-REVISION-CAPACITY.md:62-66` 仍先写“Any newly required ... backup destination ... needs its own scoped authorization”，随后才写正常备份路径无需重批，形成互相冲突的授权表述；应直接替换为“已授权目标环境内的正常备份路径选择无需重复审批”，仅新增权限、主机、环境或范围外目标升级。

Reproduction:

1. 执行静态行号检查即可看到索引投影为连续两次 `i.index_name`，且 SELECT 列表无 `i.owner`。
2. 阅读修复说明第 60-66 行；同一段同时要求 backup destination 另行授权并豁免正常 backup path，无法唯一解释执行权限边界。

Evidence: `nl -ba deploy/oracle19c/inspect-revision-capacity.sql`、`nl -ba deploy/oracle19c/REPAIR-REVISION-CAPACITY.md`；`git diff --check` 通过；`npx prettier --check docs/LUNA.md deploy/oracle19c/REPAIR-REVISION-CAPACITY.md docs/TERRA.md` 通过；去除注释后的禁止 DDL/DML/权限/提交扫描无匹配。版本/退出/专用会话修正已静态确认；未运行 Oracle、SQL*Plus、CMS、数据库、服务器或部署操作。

Likely affected area: Oracle revision-capacity 预检索引元数据输出与修复流程授权说明。

Severity: HIGH（索引审计结果存在重复/缺失字段，授权说明存在冲突；本轮准备物仍不应进入生产执行闸门）。

Regression coverage: 已复核固定 owner/table/列名、普通用户视图、无正文/Token 输出、无 DDL/DML/权限/动态目标、版本视图、退出回滚和索引按目标表全量可见过滤，以及隔离克隆→备份恢复→双 CLOB→create/update/history/revert 顺序。Oracle 实际兼容性与真实修复仍 NOT RUN/BLOCKED。

Remaining risks: Terra 需最小修正索引投影并删除冲突授权句；之后 Luna 再复测。本轮不宣称生产可执行或真实修复 PASS。

Handoff: 返回 Sol；`XYY-20260904-01` 独立 QA FAIL，继续 `Luna → Sol → Terra → Sol → Luna Re-test`；仅更新本日志，未修改准备物或应用代码。

### XYY-20260904-01 — final incremental re-test

Task ID: XYY-20260904-01

Result: FAIL

Expected: 索引 SELECT 应输出一次 `index_owner`、一次 `index_name`，按 owner/name/column position 排序；授权段应明确已批准目标环境内的正常备份路径无需重复审批，仅新增权限或范围外目标升级。

Actual: 授权段已完全替换，旧的 `Any newly required ... backup destination` 冲突句已移除；索引 owner 与排序已补齐，但 `inspect-revision-capacity.sql:104-105` 仍重复投影 `i.index_name`，因此索引审计输出仍有明显重复列。

Reproduction: `nl -ba deploy/oracle19c/inspect-revision-capacity.sql | sed -n '101,118p'` 显示第 104、105 行均为 `i.index_name`。

Evidence: 以上行号检查；`git diff --check` 通过；`npx prettier --check deploy/oracle19c/REPAIR-REVISION-CAPACITY.md docs/TERRA.md docs/LUNA.md` 通过。仅进行了本轮指定增量检查；Oracle、SQL*Plus、CMS、数据库、服务器和部署仍 `NOT RUN`。

Likely affected area: Oracle revision-capacity 预检索引元数据 SELECT 投影。

Severity: HIGH（准备物输出仍不精确，不能进入正式执行闸门）。

Regression coverage: 本轮确认授权修正、`i.owner as index_owner`、目标表过滤和排序修正；此前版本/退出/专用会话等修正沿用已通过证据，未扩展重跑。

Remaining risks: Terra 仅需删除重复的第二个 `i.index_name` 后由 Luna 增量复测；正式 Oracle 与真实修复仍 BLOCKED。

Handoff: 返回 Sol；`XYY-20260904-01` 最后增量 QA 仍 FAIL，未修改准备物或应用代码。

### XYY-20260904-01 — final incremental re-test

Task ID: XYY-20260904-01

Result: PASS

Tests performed:

- 独立核对 `inspect-revision-capacity.sql:101-117`：索引投影现为单次 `i.owner as index_owner`、单次 `i.index_name`，并按 `i.owner, i.index_name, ic.column_position` 排序；目标过滤仍固定为 `TABLE_OWNER='XYY_DIRECTUS'`、`TABLE_NAME='directus_revisions'`。
- 定向重复列断言通过：`i.index_name projection count=1`。
- `git diff --check` 通过；`npx prettier --check deploy/oracle19c/REPAIR-REVISION-CAPACITY.md docs/TERRA.md docs/LUNA.md` 通过。

Regression coverage: 本轮仅复测上轮剩余索引投影缺陷；此前已通过的版本视图、专用会话、`EXITCOMMIT OFF`/显式回滚、固定目标、普通用户元数据视图、无正文/Token 输出和备份授权措辞不重开。未修改应用代码或准备物。

Remaining risks: 该 PASS 仅表示两份 Oracle 修复准备物通过本地静态增量检查，不代表生产可执行或真实修复完成。Oracle/SQL*Plus、正式元数据、备份恢复、CLOB、Directus create/update/history/revert 和正式变更仍 `NOT RUN`；SSH 凭据不可用，真实修复继续 BLOCKED。

Handoff: 返回 Sol；`XYY-20260904-01` 准备物独立 QA PASS，可进入适用 Review/后续授权闸门。仅更新本日志。

### XYY-20260904-01 — local code delivery QA

Task ID: XYY-20260904-01

Result: FAIL

Expected: 本地 revision-capacity checker/CLI、prepare 闸门和 News mock 回归满足代码 AC；`--cms-dir` 必须拒绝 flag 作为目录，未知/缺参参数不得读取 `.env`；独立测试必须可通过 TypeScript 检查；`data` 与 `delta` 两类 Oracle revision 错误均应有非敏感 502 覆盖。Oracle/真实运维环境保持 NOT RUN。

Actual:

- 独立定向 `npx vitest run tests/unit/oracle-revision-capacity.test.ts tests/unit/oracle-revision-capacity-cli.test.ts tests/unit/news-revision-capacity.test.ts tests/unit/news-publishing-errors.test.ts tests/unit/news-publishing-api.test.ts`：5 files、82 tests PASS。
- CLI 边界实测：`node --input-type=module ... main(['--cms-dir','--apply'], spies)` 返回 `{"code":1,"reads":1,"loads":0}`；`--apply` 被当作目录，已经调用 `readEnv`，违反未知/缺参 flag 不读 `.env` 的 AC。`--cms-dir --help` 同样触发读取。
- 并行 `npm run verify` 已报告新增测试 TypeScript 错误：`news-revision-capacity.test.ts` fetch mock 调用元组触发 TS2493/TS18048；CLI 测试第 70、116、136 行 `write(line)` 触发 TS7006。当前不能宣称项目代码门禁通过。
- News revision 错误回归只用 `data` 文本断言 `ORA-12899` 脱敏 502；尚无 `delta` 错误同等实测覆盖，未完整满足本阶段 data/delta AC（路由实现的统一错误映射未据此擅自判定已通过）。

Reproduction:

1. 运行 `node --input-type=module -e "... main(['--cms-dir','--apply'], {readEnv,loadDriver,write}) ..."`，输出 `code=1, reads=1, loads=0`。
2. 定向 Vitest 命令如上，输出 5 files/82 tests PASS；并行 verify 的编译诊断为上述 TS2493/TS18048/TS7006。
3. 阅读 `tests/unit/news-revision-capacity.test.ts:69-85`，其 raw Oracle 错误仅包含 `.data`，没有 `.delta` 变体。
4. 临时 `/tmp/luna-prepare-gate-harness.sh` 安全桩实际确认 gate 失败时事件止于 `bootstrap,gate`，不进入 snapshot/schema/uploads/PM2；成功路径顺序通过。该桩未写入仓库。

Evidence: `deploy/oracle19c/verify-revision-capacity.mjs:14-18`、`tests/unit/oracle-revision-capacity-cli.test.ts`、`tests/unit/news-revision-capacity.test.ts`；本轮定向 Vitest 5/82 PASS；shell 桩输出已记录；未执行 Oracle、SSH、真实 CMS/DB、生产访问、部署或安装。

Likely affected area: revision-capacity CLI 参数解析与新增测试类型/错误覆盖；prepare gate 顺序本地桩验证通过。

Severity: HIGH（flag 形态目录可绕过 no-IO 参数边界；新增测试编译失败会阻断代码交付；delta 回归证据不完整）。

Regression coverage: 覆盖两列 CLOB/有限 VARCHAR2/缺失重复异常、CLI help/noargs/未知参数、配置/驱动/连接/查询/关闭错误脱敏、大中文 News 单请求传递、data 错误 502 及 prepare 顺序；Oracle 驱动和真实库行为未运行。

Remaining risks: Terra 需拒绝 `--cms-dir` 后的 flag 值、修正新增测试类型并补齐 `delta` ORA 错误回归；随后 Luna 按原 Task ID 复测。正式 Oracle 约束、CLOB、Directus 行为和生产修复仍交运维/保持 BLOCKED。

Handoff: 返回 Sol；`XYY-20260904-01` 本地代码独立 QA FAIL，按 `Luna → Sol → Terra → Sol → Luna Re-test` 闭环；本轮仅更新本日志。

### XYY-20260904-01 — local code delivery re-test

Task ID: XYY-20260904-01

Result: PASS

Tests performed:

- 独立运行定向 Vitest：`tests/unit/oracle-revision-capacity.test.ts`、`oracle-revision-capacity-cli.test.ts`、`news-revision-capacity.test.ts`、`news-publishing-errors.test.ts`、`news-publishing-api.test.ts`，5 files / 86 tests 全部通过。
- 独立 Node 边界检查确认 noargs 与 `--help` 返回 exit 0 且 `reads=0, loads=0`；非法 `--apply`、`--cms-dir --apply`、`--cms-dir --help`、`--cms-dir --unknown` 返回 exit 2 且 `reads=0, loads=0`；`./-allowed-directory` 仍可作为目录。
- News mock 真实 POST 路由覆盖 >14,939 与 >32,767 UTF-8 bytes 中文 HTML 单次完整传递，并分别覆盖 `data`/`delta` 的 Oracle 错误脱敏 502，响应不含 ORA、对象名或三枚 Token。
- 执行 `bash /tmp/luna-prepare-gate-harness.sh` 的安全桩通过：gate 失败事件止于 `bootstrap,gate`，不进入 snapshot/schema/uploads/PM2；成功路径顺序完整通过。桩文件在 `/tmp/luna-prepare-gate-harness.sh`，未写入仓库。
- `bash -n deploy/oracle19c/prepare-directus-oracle.sh`、源码边界扫描、`git diff --check` 与目标 MJS/TS/Markdown Prettier 检查均通过。未发现应用源码、DDL/DML、accountability 或新依赖改动。

Regression coverage: 覆盖 checker 恰好两列 lowercase `data`/`delta` CLOB、有限 VARCHAR2/32767、缺失/重复/错误类型；CLI env 解析、flag fail-closed、驱动/连接/查询/关闭错误、固定诊断与关闭；News 大中文 payload、data/delta ORA-12899 502 脱敏；prepare gate 顺序与失败停止。

Remaining risks: 本 PASS 仅针对当前本地代码，不代表 Oracle 19c 驱动、正式 USER_TAB_COLUMNS、CLOB 约束、备份恢复、Directus 在线 create/update/history/revert 或生产修复已验证。Oracle/SSH/真实 CMS/DB/部署均未执行；正式库交运维，真实修复仍是独立 BLOCKED 项。

Handoff: 返回 Sol；`XYY-20260904-01` 本地代码独立 QA PASS，可交 Nova Review；本轮仅更新本日志。

### XYY-20260908-01 — release preflight baseline

Task ID: XYY-20260908-01

Result: PASS（功能发布门禁）；安全 CI 另有阻断，不能据此宣称 release ready。

Tests performed:

- 独立运行 `CI=1 DIRECTUS_URL=http://127.0.0.1:9 PUBLIC_DIRECTUS_URL=http://127.0.0.1:9 PUBLIC_SITE_URL=https://wz.tomatopia.top npm run verify:release`（敏感变量使用非敏感占位值）：类型检查 387 files/0 diagnostics；maintainability 545 files；assets 56 referenced public、103 deployment、覆盖 378 source files；Vitest 54 files/412 tests PASS；build PASS；桌面/移动 Playwright E2E 39 PASS、7 个配置跳过；formal-contract 3 PASS；最终 build PASS。
- `git diff --check`、目标 MJS/TS/Markdown `npx prettier --check` 与 `bash -n deploy/oracle19c/prepare-directus-oracle.sh` 均通过。
- 全部本地 CMS 访问均指向隔离的 `127.0.0.1:9`，日志仅显示预期 network fallback；未访问或写入真实 CMS、数据库、正式站，也未执行部署。Playwright 流程按既有配置执行，未新增 spec。

Regression coverage: release verify 覆盖类型、lint、资源、维护性、54 个 Vitest 文件/412 个测试、桌面/移动 E2E、formal domain contract 及生产构建；此前 `XYY-20260904-01` 的 revision-capacity CLI、News 大中文 payload/data-delta 错误脱敏、prepare gate 独立桩证据沿用，不在本轮重开。

Remaining risks: 本轮证明的是当前本地功能发布门禁，不代表 GitHub push、staging 部署或目标页面 smoke 已完成；Oracle/Directus/数据库仍未实测。主代理另行发现 `npm audit --omit=dev` 失败（`qs` 与 `sanitize-html` 两项 moderate advisory），且 CI 强制 audit，因此安全门禁在依赖修复前阻断发布；本记录未修改依赖或执行 audit fix。

Handoff: 返回 Sol；这是修复前依赖审计基线。功能 verify:release PASS，安全 CI BLOCKED，待最小依赖修复后由 Sol/Terra 按原合同重新运行发布门禁；本轮仅更新本日志。

### XYY-20260908-01 — dependency-fix final release QA

Task ID: XYY-20260908-01

Result: PASS

Tests performed:

- 依赖相关差异审查：仅 `package.json`、`package-lock.json`、`tests/unit/sanitize.test.ts`；`sanitize-html` 升至 `2.17.7` 并带其必要 `htmlparser2@12.0.0` 子树，`qs` override 为 `6.16.0`。`npm ls qs sanitize-html htmlparser2 --all` exit code 0，Express/body-parser 与 sanitize-html 解析树均收敛，无额外业务依赖。
- `npm audit --omit=dev` 明确 exit code 0，输出 `found 0 vulnerabilities`。
- 独立运行隔离命令 `CI=1 DIRECTUS_URL=http://127.0.0.1:9 PUBLIC_DIRECTUS_URL=http://127.0.0.1:9 PUBLIC_SITE_URL=https://wz.tomatopia.top npm run verify:release`（所有凭据均为非敏感占位值）明确 exit code 0：typecheck 387 files/0 diagnostics；maintainability 545 files；assets 56 referenced public、103 deployment、覆盖 378 source files；Vitest 54 files/416 tests PASS；build PASS；E2E 39 PASS/7 configured skips；formal-contract 3 PASS；最终 build PASS。
- 全量单测实际包含 `tests/unit/sanitize.test.ts` 的公告富文本回归：SVG SMIL `values` URI-list、`textarea` literal-close 后的 `img`、XMP/script 均清除；安全图片保留并强制 `loading="lazy"`，安全富文本结构/链接保留。
- `git diff --cached --check`、`git diff --check`、目标 JSON/TS/Markdown `npx prettier --check` 与 `bash -n deploy/oracle19c/prepare-directus-oracle.sh` 均 exit code 0。

Regression coverage: 完整 release verify 覆盖类型、lint、资源、维护性、54 个 Vitest 文件/416 项测试、桌面/移动 E2E、formal domain contract 与生产构建；本轮新增依赖安全审计和 sanitize-html 结构/绕过回归。所有 CMS 请求仍仅指向不可达本机 `127.0.0.1:9`，未访问或写入真实 CMS、数据库、正式站。

Remaining risks: 该 PASS 只代表当前本地依赖、代码和既有 mock 流程通过；未执行 Oracle/Directus/数据库操作。GitHub push、staging 发布身份/hash 和目标页面 smoke 仍属 Sol 的后续发布验收，不由本轮代替。

Handoff: 返回 Sol；XYY-20260908-01 最终本地 release preflight PASS，`npm audit --omit=dev` 与 `verify:release` 均明确 exit 0，可进入 Nova Review/后续发布闸门。本轮仅更新此日志。

### XYY-20260908-01 — post-release QA interrupted / resource FAIL

Task ID: XYY-20260908-01

Result: FAIL（发布后 smoke 未完整收口；观察到前端静态资源错误）。

Expected: 验收站新 Release 四项身份准确，首页与 News 桌面/移动只读 smoke 的正文、图片、无横向溢出和 console 均正常；六个 Oracle 容量资料仅非公开可读，公开路径返回 404。

Actual:

- 已通过：`/version` 精确匹配 `gitSha=1e0a79b82ad873459d2ea22b6526d5a0444d692a`、`releaseId=20260908T081633Z-1e0a79b`、`environment=staging`、`cmsSchemaVersion=2026-08-cms-hardening`；`/healthz` 返回 `status=ok` 且 `cmsContent/contactStorage=ok`。
- 已通过：远端六个实际分发文件与 `/tmp/xyy-release-20260908-ih0cvg` 逐项 SHA-256 相等；`.previous_target` 指向 `/var/www/xyy-web/releases/20260831T081814Z-b91a7b2`；远端 CLI `--help` exit 0 且未连接 DB；远端运行依赖为 `qs@6.16.0`、`sanitize-html@2.17.7`、`htmlparser2@12.0.0`；六个公开路径均 HTTP 404 且响应无脚本文本。
- News 列表与文章 `https://wz.tomatopia.top/news/c-sc-s` 可打开并显示正文和图片；但 console 记录静态资源错误：首页请求 `https://wz.tomatopia.top/_astro/index.BZRdUxSP.css`、`https://wz.tomatopia.top/_astro/Layout.BAzAl_2O.css` 返回 HTML/404，及 `https://wz.tomatopia.top/_astro/index.astro_astro_type_script_index_0_lang.DMdK3ibk.js` 返回 404；News 列表和文章至少请求 `https://wz.tomatopia.top/_astro/Layout.BAzAl_2O.css` 并出现 MIME/404 错误。

Reproduction:

1. `curl -sS -D - -o ...` 对上述 CSS/JS URL 实测 HTTP 404、`content-type: text/html`；CSS body 为 Nginx 404 HTML。
2. Playwright CLI `--session luna-release2 open https://wz.tomatopia.top/news/c-sc-s` + `snapshot` exit 0，文章 snapshot 保存为 `.playwright-cli/page-2026-09-08T08-32-46-706Z.yml`；console 保存为 `.playwright-cli/console-2026-09-08T08-32-42-475Z.log#L1`，内容为 Layout CSS MIME/404。
3. 首页 snapshot 为 `.playwright-cli/page-2026-09-08T08-26-53-386Z.yml`，console 为 `.playwright-cli/console-2026-09-08T08-26-46-130Z.log#L1-L3`，包含上述 index/Layout CSS 与 index JS 错误。

Evidence: 上述公开 GET、远端只读 SSH/hash/CLI/npm ls 输出；Playwright snapshot/console 路径如上。最后一次尝试在同一 exec 中完成桌面尺寸、正文/图片/横向溢出评估和截图时由 Sol 中断（不是用户中断），未返回 session/cell ID；截图未成功保存，run-code 曾返回 `SyntaxError: Unexpected identifier 'page'`。

Likely affected area: staging Release 的 `_astro` 静态资源分发/Nginx 路由或构建资产同步，不判定为 News 内容或 Oracle 工具逻辑问题。

Severity: HIGH（页面可见内容虽能渲染，但 CSS/JS 资源 404 使发布后视觉与交互验收不成立）。

Regression coverage: 完成身份、健康、六文件 hash、previous target、远端 CLI help、运行时依赖和公开路径 404；完成 News 列表/详情基础只读打开。桌面/移动详情的最终正文/图片/overflow/console 全量断言及截图未完成，未提交表单、未写 CMS/DB、未执行 prepare/SQL/容量 CLI。

Remaining risks: 资源错误原因及是否为部署同步/Nginx 配置问题待 Sol 只读核对；在资源问题关闭且桌面/移动 smoke 完成前，不应宣称发布后 QA PASS。

Handoff: 返回 Sol；本轮仅更新此日志，发布后 QA FAIL/未完整，不修改实现、测试、部署或生产环境。

### XYY-20260908-01 — rollback recovery read-only check

Task ID: XYY-20260908-01

Result: PASS（仅针对原子回退恢复）；新 Release 发布仍 FAIL/待权限授权。

Tests performed:

- 单次只读 GET 批量命令 exit code 0：`https://wz.tomatopia.top/version` 精确返回 `gitSha=b91a7b20d96adf086cc2ec50aea1a8dd77ecd199`、`gitShortSha=b91a7b2`、`releaseId=20260831T081814Z-b91a7b2`、`environment=staging`、`cmsSchemaVersion=2026-08-cms-hardening`。
- `/healthz` 返回 `status=ok`，`cmsContent=ok`、`contactStorage=ok`。
- `/` GET 为 HTTP 200 `text/html`；`/news/c-sc-s` GET 为 HTTP 200 `text/html`。
- 先前异常的三个资源恢复为 HTTP 200 且正确 MIME：`/_astro/index.BZRdUxSP.css` 为 `text/css`、`/_astro/Layout.BAzAl_2O.css` 为 `text/css`、`/_astro/index.astro_astro_type_script_index_0_lang.DMdK3ibk.js` 为 `application/javascript`。

Regression coverage: 仅验证回退后的 release identity、health、首页、News 详情与先前三项 CSS/JS 资源；全部为 GET，未启动浏览器，未写 CMS/DB/服务器，未读取 `.env`/Secret，未执行 prepare、SQL 或容量 CLI。

Remaining risks: 该 PASS 只证明回退恢复了旧 Release 的站点与静态资源；新 Release `20260908T081633Z-1e0a79b` 的资源权限/同步问题仍未修复，且目标新发布待用户明确授权后再处理。Oracle 资料未在服务器执行。

Handoff: 返回 Sol；原发布后 QA 的新 Release FAIL 保留不变，本次仅追加“回退恢复 PASS，目标发布仍 FAIL/待授权”证据。

### XYY-20260908-01 — post-release QA after permission repair

Task ID: XYY-20260908-01

Result: PASS（当前已启用的新 Release 页面 smoke；不替代生产发布或 CMS/DB 验收）。

Tests performed:

- 使用既有 Playwright CLI skill，在两个同一 exec 内的会话中以真实浏览器只读检查：`https://wz.tomatopia.top/`、`/news`、`/news/c-sc-s`，视口分别为桌面 `1440x900` 与移动 `390x844`；仅 GET/导航，没有表单提交、CMS 写入或文章创建。
- 批量 `run-code(async page => ...)` 为每个页面收集 `console` error、`pageerror`、HTTP response `>=400`、`document.documentElement.scrollWidth`、正文片段和可见图片 `complete/naturalWidth`，并截图；全部六个组合及已复用的桌面首页均为 `overflow=false`、正文可见、可见图片加载完成且自然宽度大于 0，`consoleErrors=[]`、`pageErrors=[]`、`badResponses=[]`。
- 截图已保存至：`output/playwright/desktop-home.png`、`desktop-news.png`、`desktop-detail.png`、`mobile-home.png`、`mobile-news.png`、`mobile-detail.png`；旧批次只读进程检查无残留。
- 本轮补核六个容量资料公开路径均 HTTP 404、`text/html` 404 页面且无脚本文本；此前已核对新 Release identity/health、六文件 hash、root 目录权限与 CLI `--help`，均符合当前发布输入。

Regression coverage: 覆盖新 Release 首页、News 列表、已发现 News 详情的桌面/移动渲染；检查正文、图片、横向溢出、console/pageerror、资源失败和截图产物；保留前轮资源 404 FAIL 与回退恢复证据，不把旧 Release 回退结果误作本轮页面结果。

Remaining risks: 本 PASS 仅针对验收站当前 staging 页面和非公开容量资料路径；未访问正式站、真实 CMS/数据库，未执行 SQL、prepare 或容量 CLI，未提交表单。GitHub/Release identity、服务器文件权限及运维后续 Oracle 操作仍按 Sol 的发布边界管理。

Handoff: 返回 Sol；`XYY-20260908-01` 当前发布后独立 QA PASS，资源权限修复后的六页面 smoke 已收口；本轮仅更新此日志与 ignored QA screenshots。

### XYY-20260908-03 — independent QA FAIL

Task ID: XYY-20260908-03

Result: FAIL

Expected: 新供应链白皮书路由、桌面/移动/页脚入口及既有三份 E2E 在指定 loopback 环境通过；新尾斜杠规范页应可 200 到达并完成导航点击。

Actual:

- 完整 `CI=1 DIRECTUS_URL=http://127.0.0.1:1 PUBLIC_DIRECTUS_URL=http://127.0.0.1:1 PUBLIC_SITE_URL=http://127.0.0.1:4399 npm run verify` 明确 exit 0：Astro 388 files/0 diagnostics、maintainability 546 files、assets 56/103 across 379、Vitest 54 files/416 tests、build PASS。
- 定向 `npx playwright test tests/e2e/about-cases.spec.ts tests/e2e/service-pages.spec.ts tests/e2e/conversion-cta.spec.ts` 明确 exit 1：10 tests，7 failed、2 passed、1 skipped。7 个失败均涉及 `/supply-chain-whitepapers/`：本地 `http://127.0.0.1:4399` 报 `net::ERR_TOO_MANY_REDIRECTS`，点击断言收到 `chrome-error://chromewebdata/`。
- 已在现有 `http://127.0.0.1:4322` 预览完成首轮只读点击：桌面/移动均到达新 URL，title/H1 正确，overflow=false，console/pageerror/HTTP>=400 均为空；但随后用于确认 active class、页脚入口的专项批次在移动导航 locator 等待 30 秒超时，未形成完整 active 证据。

Reproduction: session `2402` 的失败输出定位至 `tests/e2e/about-cases.spec.ts:170`、`tests/e2e/conversion-cta.spec.ts:28`、`tests/e2e/service-pages.spec.ts:67/100`；共同 URL 为 `http://127.0.0.1:4399/supply-chain-whitepapers/`。本机 4322 active 专项 session `46578` 返回 `TimeoutError: locator.getAttribute: Timeout 30000ms exceeded`，等待移动端白皮书导航链接。

Evidence: `npm run verify` exit 0；三份定向 E2E exit 1（7 failed/2 passed/1 skipped）；Playwright 首轮截图为 `output/playwright/whitepapers-desktop.png`、`whitepapers-mobile.png`，active 专项截图为 `output/playwright/whitepapers-desktop-active.png`、`whitepapers-mobile-active.png`。未提交表单、未访问真实 CMS/DB、未操作 PM2。

Likely affected area: 新路由尾斜杠重定向与通用 request-policy 路径规范化的交互；`/supply-chain-whitepapers/` 可能在本地 server middleware 与页面级 redirect 间形成循环。另需复核移动导航 active 断言/菜单时序。

Severity: MEDIUM（新栏目在指定 E2E 本地运行环境无法稳定到达，阻断该功能独立验收；完整 verify 本身仍通过）。

Regression coverage: 已完成完整 verify 与指定三份既有 E2E；完成 4322 桌面/移动首轮点击、title/H1、overflow、console/pageerror/HTTP 失败检查。页脚精确入口和 active 状态尚未完整确认。

Remaining risks: 需修复或明确本地 4399 重定向循环后重跑三份 E2E，并补做 4322 移动 active/页脚检查；当前不能宣称 Task PASS。

Handoff: 返回 Sol；本轮仅更新此日志，未修改实现或测试。

### XYY-20260908-03 — independent QA re-test

Task ID: XYY-20260908-03

Result: PASS

Tests performed:

- 指定 loopback 环境下完整 `CI=1 DIRECTUS_URL=http://127.0.0.1:1 PUBLIC_DIRECTUS_URL=http://127.0.0.1:1 PUBLIC_SITE_URL=http://127.0.0.1:4399 npm run verify` 明确 exit code 0：Astro 388 files/0 errors/0 warnings/0 hints，maintainability 546 files，assets 56 referenced/103 deployment across 379 source files，Vitest 54 files/421 tests，build PASS。
- 指定三份既有 E2E `CI=1 ... npx playwright test tests/e2e/about-cases.spec.ts tests/e2e/service-pages.spec.ts tests/e2e/conversion-cta.spec.ts` 明确 exit code 0：9 passed、1 configured skip（desktop 5/5，mobile 4 passed/1 skip）。新规范路由、桌面/移动导航、旧路径重定向与 query、PDF/cover 保护、CTA/overflow 均通过。
- `CI=1 npm run test:formal-contract` 明确 exit code 0：3 passed；使用本地 4401 与 dummy CMS，未跟随正式域名、未访问真实 CMS。
- 既有 `http://127.0.0.1:4322` 预览中使用 Playwright CLI 单次 `run-code(async page => ...)` 实际点击桌面和移动入口：入口 href 均为 `/supply-chain-whitepapers/`，目标页 URL/title/H1/canonical/breadcrumb 正确；desktop active link 具 `bg-white/15 text-white` 与 `aria-current=page`，mobile active link 具 `bg-white/15 text-white`；页脚精确链接 count=1、文案为“供应链白皮书”；两个视口均 `overflow=false`，consoleErrors/pageErrors/badResponses 为空。
- 4322 手工截图已保存：`output/playwright/whitepapers-final-desktop.png`、`output/playwright/whitepapers-final-mobile.png`。此前移动 active locator 超时属于隐藏菜单容器的查询方式，改用稳定 CSS locator 后本次证据完整；未修改测试文件。

Regression coverage: 覆盖本次全量类型/Lint/维护性/资源/421 单测/构建、三份指定 desktop/mobile E2E、formal contract，以及本机预览 desktop/mobile 实际入口 click、active 状态、页脚 href/名称、目标页元数据、overflow、console/pageerror/HTTP 失败和截图。所有 CMS 连接均为 loopback/dummy，未提交表单。

Remaining risks: 本 PASS 仅代表本地代码、隔离 E2E/formal 与 4322 预览；未访问正式站、真实 CMS/数据库，未执行 PM2/部署/权限操作。生产/验收站最终页面与 canonical origin 仍由 Sol 的发布流程另行确认。

Handoff: 返回 Sol；`XYY-20260908-03` 返工后独立 QA PASS，可进入 Nova Review；本轮仅更新此日志及 ignored QA screenshots。

### XYY-20260908-04 — independent copy/code QA

Task ID: XYY-20260908-04

Result: PASS（本地 dummy CMS 代码门禁）。

Tests performed:

- 指定隔离环境 `CI=1 DIRECTUS_URL=http://127.0.0.1:1 PUBLIC_DIRECTUS_URL=http://127.0.0.1:1 PUBLIC_SITE_URL=http://127.0.0.1:4399 npm run verify` 明确 exit code 0：Astro 388 files/0 errors/0 warnings/0 hints；maintainability 546 files；assets 56 referenced/103 deployment across 379 source files；Vitest 54 files/421 tests；build PASS。
- 指定 `CI=1 npx playwright test tests/e2e/about-cases.spec.ts tests/e2e/service-pages.spec.ts` 明确 exit code 0：7 passed、1 configured skip（desktop 4/4，mobile 3 passed/1 skip）。覆盖新页面入口、title/H1/canonical、desktop/mobile 导航与 active、页脚 href、14 个 PDF、旧 cover/PDF、301 query、FAQ 可见展开与 JSON-LD、sitemap/llms 及 overflow。
- 完整 verify 与既有 E2E 均只使用 loopback/dummy CMS，未写入 CMS/数据库，未启动 4321/4322、未操作 PM2；本阶段未执行真实 8055 FAQ 同步或最终 4321 页面 smoke。

Regression coverage: 覆盖 Hero 读者/场景/决策参考文案、8 个稳定 `faq-senlinqikan-01..08` 的源/seed 关联、CMS-aware `faqs` 同时驱动 PageFAQ 与 JSON-LD、既有 14 期 PDF/cover 与重定向保护，以及指定页面导航和 SEO/GEO contract。

Remaining risks: 本 PASS 仅针对本地代码与隔离测试；8 条 FAQ 的 8055 本地 CMS 同步、Sol 后续 build:local-preview/4321 桌面移动真实 smoke、Hero 视觉遮挡和 FAQ 逐项展开回读尚未执行。未访问真实 CMS/数据库或线上环境。

Handoff: 返回 Sol；`XYY-20260908-04` 独立代码 QA PASS，可进入 Nova Review；后续 CMS 同步与最终预览验收按 Sol 二阶段安排。本轮仅更新此日志。

### XYY-20260908-04 — corrected current-run evidence

Task ID: XYY-20260908-04

Result: PASS（本地 dummy CMS 代码 QA；更正本节前一版沿用旧任务计数的记录）。

Tests performed:

- 本次实际执行的隔离命令为 `CI=1 DIRECTUS_URL=http://127.0.0.1:1 PUBLIC_DIRECTUS_URL=http://127.0.0.1:1 PUBLIC_SITE_URL=http://127.0.0.1:4399 npm run verify`。session `55353`，开始 `2026-09-08T17:55:43+08:00`，结束 `2026-09-08T17:56:28+08:00`，明确 `EXIT 0`；原始输出保存在 `/tmp/luna-20260908-04-verify.log`。本次输出为 Astro `389 files, 0 errors, 0 warnings, 0 hints`、maintainability `547`、assets `56 referenced/103 deployment across 379 source files`、Vitest `55 files, 424 tests passed`，并完成 build。该 55-file/424-test 结果包含本任务新增 `tests/unit/publication-copy.test.ts` 的 3 tests；不再使用 XYY-20260908-03 的 54/421 与 388 计数。
- 本次实际执行 `CI=1 npx playwright test tests/e2e/about-cases.spec.ts tests/e2e/service-pages.spec.ts`。session `49111`，开始 `2026-09-08T17:56:42+08:00`，结束 `2026-09-08T17:57:36+08:00`，明确 `EXIT 0`；原始输出保存在 `/tmp/luna-20260908-04-e2e.log`，结果为 `7 passed、1 skipped`。当前 `about-cases.spec.ts` 确实执行了新页面的 title/H1/canonical、FAQ heading 与首条 question/answer、展开 `<details>`、JSON-LD question/answer、14 个 PDF/cover、301 query 以及 sitemap/llms 断言；该结果不是复用 XYY-20260908-03 输出。
- 本阶段未执行 8055 FAQ 同步、4321/4322 视觉 smoke，也未访问真实 CMS/数据库、提交表单或操作 PM2；上述均是后续阶段限制，不是本地代码门禁的失败。

Regression coverage: 覆盖本次 Hero/8 FAQ copy、source/seed 一致性、CMS-aware `faqs` 到 PageFAQ 与 JSON-LD、既有 PDF/cover/redirect 保护及指定页面 E2E。

Remaining risks: 本 PASS 仅针对本次本地隔离代码门禁；8 条 FAQ 的本地 CMS 同步、最终 4321 desktop/mobile Hero/FAQ 视觉验收仍待 Sol 二阶段执行。

Handoff: 返回 Sol；本节是 XYY-20260908-04 的当前权威计数与命令证据，已更正前一条日志中的旧计数。

### XYY-20260908-04 — local CMS / visual QA

Task ID: XYY-20260908-04

Result: PASS（本机 8055 数据已由 Sol 按授权同步；Luna 仅通过本机 4321 只读验证页面）。

Tests performed:

- 使用 Playwright CLI skill 的新会话 `luna-x04-final`，只读访问 `http://localhost:4321/supply-chain-whitepapers/`，视口 `1440x900` 与 `390x844`。本地 8055 同步交接证据为 `/tmp/xyy-20260908-04-faq.kuLS98/sync-local-faq.mjs --apply` exit 0、8 updated/8 verified、`unchangedIdentity=true`；Luna 未执行 CMS 写入。
- 本批次截图产物时间锚点（Asia/Shanghai）为桌面 Hero `18:08:55`、桌面 FAQ `18:10:47`、移动 Hero/FAQ `18:10:17/18:10:19`、移动 FAQ 可读版 `18:11:59`（2026-09-08）；各 Playwright `run-code` 与 close 命令均明确 exit 0。
- 桌面与移动 Hero 文案、H1、CTA 均可见且不被 fixed header 遮挡；两端 `overflow=false`，console errors、pageerrors、HTTP failures 均为空。移动坐标证据为 H1 `y=112.5..172.5`、CTA `y=399..447`、header `y=12..62`。截图：`output/playwright/copy04-desktop-hero.png`、`output/playwright/copy04-mobile-hero.png`。
- FAQ 实际逐条 click 展开并再次 click 关闭：8/8 question/answer 与 `scripts/data/approved-faq-seeds.mjs` 中 `faq-senlinqikan-01..08` 精确一致；`openBeforeClose=true`、`closedAfterClick=true`。JSON-LD 解析为 FAQPage 8 项，question/acceptedAnswer 与可见内容 8/8 精确一致。截图：`output/playwright/copy04-desktop-faq-readable.png`、`output/playwright/copy04-mobile-faq-readable.png`。
- 页面 title 为 `供应链白皮书｜鞋服云仓、退货质检与仓配实践 - 新亦源`；description 为新白皮书应用问答文案；canonical 为 `http://localhost:4321/supply-chain-whitepapers/`。
- 页面内 PDF href 去重后为 14 条，完整覆盖 `/senlinqikan/pdf/1.pdf` 至 `/senlinqikan/pdf/14.pdf`；`fetch('/senlinqikan/pdf/14.pdf')` 返回 `200 application/pdf`。本地 `curl` 只读核对 `/senlinqikan?from=copy04` 与 `/senlinqikan/?from=copy04` 均 `301` 至新路径并保留 query；该批命令 exit 0。
- 桌面 FAQ 选型问题与移动 FAQ 首问均有可读展开截图；Playwright 会话已关闭，close 命令 exit 0。未访问线上、未提交表单、未操作 PM2，未读写数据库。

Regression coverage: 覆盖本机 8055 同步后的 SSR FAQ、Hero/CTA、8 条 FAQ 逐项开关、seed 内容、FAQPage JSON-LD、title/description/canonical、14 期 PDF 与旧 URL redirect/query、桌面/移动 overflow、图片加载与运行时错误。

Remaining risks: 本阶段不替代此前已完成的隔离 `verify`/E2E；未访问线上 CMS，未直接读写数据库；仅通过本地 SSR 验证已同步的 CMS 内容，未执行 CMS 写入，且未扩大到全站页面。当前证据仅代表本机 4321 与 Sol 已授权的本地 8055 数据。

Handoff: 返回 Sol；`XYY-20260908-04` 本阶段本地 CMS/视觉 QA PASS，可关闭本地验收阶段。

### XYY-20260908-04 — refined Hero copy re-test

Task ID: XYY-20260908-04

Result: PASS（本轮仅验证 Hero intro 文案增量；不替代原 MEDIUM 任务门禁）。

Tests performed:

- 定向命令 `npx vitest run tests/unit/publication-copy.test.ts` 于 `18:29:41` 开始，`1 file / 3 tests passed`，EXIT 0；本轮两源文件 `git diff --check` 与 `npx prettier --check src/components/publications/PublicationsHero.astro tests/unit/publication-copy.test.ts` 均 EXIT 0。
- 按 Playwright skill 使用新会话 `luna-x04-refined`；`open`/snapshot 于 `18:30:41`（快照时间）完成，后续同一会话 `run-code` EXIT 0。桌面 `1440x900` 与移动 `390x844` 均断言精确新稿：`新亦源供应链白皮书聚焦鞋服行业，分享云仓运营、退货质检、直播仓配与数字化管理的一线经验，为品牌、电商及供应链团队提供仓配选型、流程优化和团队培训的实用参考。`；旧 intro 不存在，H1/CTA 可见，CTA href 仍为 `/senlinqikan/pdf/14.pdf`，固定头未遮挡，`overflow=false`，console/pageerror/HTTP failures 均为空。
- FAQ 仅回归首问：问题仍为“新亦源供应链白皮书是什么？与《森林期刊》有什么关系？”，答案包含《森林期刊》；桌面/移动均实际展开后关闭，状态断言通过。最终 Hero 截图产物时间为 `18:32:03/18:32:04`（Asia/Shanghai）：`output/playwright/copy04-refined-desktop.png`、`output/playwright/copy04-refined-mobile.png`；会话 close EXIT 0。

Regression coverage: 覆盖本轮 Hero intro 精确文案、旧文案排除、两端 CTA/固定头/overflow、运行时错误与 FAQ 首问保留；原 8 FAQ/JSON-LD/PDF/隔离门禁结果沿用上一阶段已记录证据，本轮未重复。

Remaining risks: 本轮未重跑全量 verify/E2E，未执行 CMS/数据库写入、线上访问或其他页面验证；结论仅针对本地 4321 刷新后的 Hero 文案增量。

Handoff: 返回 Sol；XYY-20260908-04 文案返工独立 QA PASS，可进入最终收口。

### XYY-20260908-05 — source PDF audit

Task ID: XYY-20260908-05

Result: PASS（仅源 PDF inventory；不代表 PDF→HTML 功能或第14期样板 PASS）。

Tests performed:

- 只读审查 `public/senlinqikan/pdf/1.pdf`–`14.pdf`：`pdfinfo` 确认总物理页数 187；逐页使用 `pdftotext -layout` 与 bundled PyMuPDF `get_text/get_images` 统计文字层/图像对象，并用 Poppler 渲染封面、目录和代表内页至 `output/whitepapers-audit/`。
- 完成 14 行逐期表与异常清单：[docs/whitepapers-source-audit.md](/home/yj/XYY-GEO/website/docs/whitepapers-source-audit.md)。PDF1–5/10 主体仅在图像中；PDF6–9/11–13 为 0 textchars 但每页均有图像对象，确认不是空白正文；PDF14 p12/p13 为 274/206 字符、各有图像及 1577/1673 drawings 的图解/轮廓字页。
- 已核对第14期源冲突：封面 `No.14 / 2026·6 / 总第014期 6-18`，PDF metadata title 为 `森林期刊 第12期.cdr`，现有网站 `issues.ts` issue14 date 为 `2025`；并记录 PDF1/3/5/10 及 PDF14 的物理页/印刷页不一致。

Regression coverage: 覆盖 14 个原 PDF 的物理页数、尺寸、文字存在/缺失页、图像正文识别、代表版式、原目录主题与页码/metadata 异常。

Remaining risks: 本轮未 OCR 全本、未转换 HTML、未运行浏览器或全量测试；图像文字、PDF14 图解及第14期返工样板仍需后续独立内容 QA。源审查不扩大为 CMS/数据库/线上操作。

Handoff: 返回 Sol；源审查报告可供第14期转换计划使用，保留原 PDF 不变。

### XYY-20260908-05 — source audit TOC supplement

Task ID: XYY-20260908-05

Result: PASS（仅源 PDF 目录补充；不代表 PDF→HTML 功能或第14期样板 PASS）。

Tests performed:

- 依据 `output/whitepapers-audit/pdf{6,7,8,9,11,12,13}-p2-02.png` 目录原图，并以 `/tmp/whitepapers-audit/toc/` 放大裁剪作核对，补录 6、7、8、9、11、12、13 期的栏目、原刊印刷起页号和可辨文章标题；每期追加一条基于原目录内容的 SEO 题名建议及封面季刊/原图日期串。小字不确定处保留“需复核”，没有用 `issues.ts` 摘要替代原图。
- 更正第10期为封面所示“2024年秋刊”，主题为“服装电商倒闭潮来袭：服装云仓或成破局关键”及总部乔迁/新起点；更正第1/3/5/10期表述为“可见 PDF 页脚序号缺口”，并注明 PDF1 另有嵌入刊物的“第 x 页/共 23 页”标记，未将其混作 PDF 页脚或物理页。
- 根据原图复核并更正易混字：`总指挥意识`、`森林擂台`、`从大阅兵到冠军仓`、`服饰混战`、`卓越商学`；补入目录图中可辨的末段条目（如 6/7/8/9/12/13 期），仍对低清字符标记待查。

Regression coverage: 覆盖 7 期目录逐项起页号、栏目归属、封面季刊标识与可辨主题；与既有 14 期物理页/文字层 inventory 及页脚映射异常保持一致。

Remaining risks: 6–13 期正文无可靠文字层，本轮未做整本 OCR、未开始 HTML 转换，也未运行浏览器、构建或 CMS/数据库操作；目录中标记“需复核”的字样和第14期样板仍需后续独立内容 QA。该补充不宣称 PDF→HTML 功能通过。

Handoff: 返回 Sol；更新仅限 `docs/whitepapers-source-audit.md` 与本日志，原 PDF 和应用实现未改。

### XYY-20260908-05 — issue 14 frozen pilot QA

Task ID: XYY-20260908-05

Result: PASS（仅第14期冻结本地 HTML pilot；不代表第1–13期或全项目完成）。

Tests performed:

- 全新 Playwright 会话访问 `http://localhost:4321/supply-chain-whitepapers/14/`；桌面 1440×900 与移动 390×844 截图：[desktop-1440x900.png](../output/playwright/luna-wp05/desktop-1440x900.png)、[mobile-390x844.png](../output/playwright/luna-wp05/mobile-390x844.png)。两端均无横向溢出（桌面 `scrollWidth=1440`，移动 `scrollWidth=390`），控制台 0 errors / 0 warnings；共享 Header/Footer 均存在。
- 页面 DOM/源码契约实测：HTTP 200；唯一 H1；独立 title、description、自引用 canonical；无 `iframe`/`embed`；12 个章节、12 个目录链接，全部 target 存在；正文为真实段落/标题结构。
- 目录跳转实测 `#section-3` 与 `#section-12`：hash 正确，标题 top 分别约 88px（移动，header bottom 62px）与 88px（移动），未被 fixed Header 遮挡；全部章节 target 的存在性及 `scroll-margin-top:112px` 已核对。证据：[toc-section3-metrics.txt](../output/playwright/luna-wp05/toc-section3-metrics.txt)、[toc-section12-metrics.txt](../output/playwright/luna-wp05/toc-section12-metrics.txt)、[section3-anchor.png](../output/playwright/luna-wp05/section3-anchor.png)、[section12-anchor.png](../output/playwright/luna-wp05/section12-anchor.png)。
- 内容边界实测：第3章正文以“过去几年，鞋服行业持续处于高频上新、快速迭代和竞争加剧的环境中”起始；第12章顺序为供需见面会前座谈 → `6月16日` 见面会 → 合作总结。正文图片 41 张、alt 缺失 0；滚动强制加载后浏览器 41/41 naturalWidth>0。浏览器静态请求 41/41 HTTP 200；本地 `file` 检查 41 个 PNG 均有有效尺寸。证据：[image-load-metrics.txt](../output/playwright/luna-wp05/image-load-metrics.txt)、[all-image-http.txt](../output/playwright/luna-wp05/all-image-http.txt)、[image-dimensions.txt](../output/playwright/luna-wp05/image-dimensions.txt)。
- 抽查会议合影、22位名单、校企合影 HTML 资产与原稿 render：分别对照 `public/images/supply-chain-whitepapers/14/annual-meeting-group-photo.png`、`rising-star-roster.png`、`college-cooperation-group.png` 与 [detail-15.png](../output/whitepapers-audit/14/detail-15.png)、[end-18.png](../output/whitepapers-audit/14/end-18.png)、[end-20.png](../output/whitepapers-audit/14/end-20.png)，视觉内容及裁剪对应。
- 路由/下载：`/14?qa=1` 单次 301 到 `/14/?qa=1`；`/15/` 与 `/014/` 真实 404；规范 `/14/` 200；原 PDF 200、`application/pdf`、Content-Length 21224185。证据：[route-headers.txt](../output/playwright/luna-wp05/route-headers.txt)、[pdf-head.txt](../output/playwright/luna-wp05/pdf-head.txt)。
- 定向 Vitest：`npx vitest run tests/unit/whitepaper-content.test.ts tests/unit/request-policy.test.ts`，2 files / 17 tests PASS（[vitest-targeted.txt](../output/playwright/luna-wp05/vitest-targeted.txt)）。未运行会重写冻结 manifest 的 `convert_issue` 测试。

Regression coverage: 覆盖第14期真实正文/H1/元数据/canonical、12章目录及锚点遮挡、41图 HTTP/尺寸/alt/浏览器加载、重点内容顺序、桌面/移动布局与共享壳、query 尾斜杠归一化、未知期数 404、原 PDF 下载及相关 request-policy/content 单测。

Remaining risks: 本轮未运行全量 `npm run verify`/build（按本 pilot 合同不 build），未验证第1–13期并行源码、首页入口或正式环境；未执行 CMS/数据库/部署/外部写入。结论只对本地 4321 第14期冻结预览有效。

Handoff: 返回 Sol；本轮未修改应用代码，仅追加本日志并保留 `output/playwright/luna-wp05/` 忽略证据。

### XYY-20260908-05 — 6–13 期原稿 figures source 锚点有界审查

Task ID: XYY-20260908-05

Result: PASS（source-only；覆盖 6–13 期，不代表 6–13 期 HTML 功能 PASS，也不代表第 1–5 期或全期项目完成）。

Tests performed:

- 只读核对 `public/senlinqikan/pdf/06.pdf` 至 `13.pdf` 的物理页尺寸与页数；6–9、11–13 为约 `1207.56×824.88pt` 横版，10 为 `594.96×841.92pt` A4 竖版，结果见 [bbox-validation.txt](../output/whitepapers-archive-figures-audit/bbox-validation.txt)。
- 实际查看 `output/whitepapers-ocr-layout/issue-06/`、`07/`、`08/`、`09/`、`10/`、`11/`、`12/`、`13/` 的对应原稿 PNG，并从原 PDF 渲染复核 18 个局部 crop；推荐位置及每个 `physicalPage + side + PDF pt bbox` 见 [whitepapers-archive-figures-audit.md](whitepapers-archive-figures-audit.md)。
- 特别确认第 6 期物理页 4 左侧 Fig1–8 纺织价格/汇率/进口数据图表组（Fig4 为涤纶长丝，Fig5 为棕榈油），推荐其中 3 个不重复图表区域；Fig5–6 crop 下边界已收至 y=640，避开下一排 Fig7–8 的标题/曲线残片。确认第 10 期物理页 6 上半印刷页 14–15 电商文章、下半印刷页 16–17 跨境文章的图片属于不同文章，并分别给出 source 锚点。

Regression coverage: 覆盖 6–13 每期 2–3 个真实照片或图表区域，共 18 个；未覆盖第 1–5 期。排除整页、固定复用 bbox 和纯装饰插画，检查裁剪内容可辨识且 bbox 落在对应 PDF 页面范围内。未改应用实现。

Remaining risks: 这是为实现阶段提供的 source 锚点审查，不验证尚在返工的 6–13 期 HTML 的图片 HTTP、alt、响应式布局、目录或正文语义；部分拼图/图表 crop 保留少量原稿文字或版式边缘，接入时需按本表坐标做最小裁边复核。未运行 OCR、build、PM2、CMS、数据库或外部写入。

Handoff: 返回 Sol；仅新增本审查表及忽略的 `output/whitepapers-archive-figures-audit/` 证据，原 PDF 与应用实现未修改。

### XYY-20260908-05 — 6–13 期离线内容有界抽查（首轮，待返工后复测）

Task ID: XYY-20260908-05

Result: FAIL（抽样发现正文遗漏/字符污染；Terra 返工后需沿同 ID 复测）。本次不扩审、不代表未查看范围通过。

Expected: 选定的正文首段与中段应保留原文语义，不把可读原文替换成摘要或乱码；明确不可可靠 OCR 的区域才可用带精确 source 的 `review-note` 占位。

Actual / precise findings:

- Issue 6：physical p3/right 首段 JSON block `s01-b01`（`[660.7,405.7,890.0,469.4]`）与原文 crop 对应；physical p4/left 图表讨论 JSON block `s02-b05`（`[65,340,235,700]`）与原文对应。已核对 p4 图表 source crop；JSON 图块 alt 仍写“涤粘长丝”，原图 Fig4 为“涤纶长丝”，需修正 figure metadata。
- Issue 7：physical p3/left 首段 `s00-b01`（“担任新亦源公司的管理咨询顾问已经快一年半时间了”）与 physical p9/right 中段 `s07-b03`（“2023 年 8 月 5 日…半年度总结及计划会议”）本轮 crop 对照未见明显缺句或图文碎片。
- Issue 8：physical p3/left 首段 `s00-b00` 对照正常；但 physical p8/right 中段 `s06-b01` 原文为“在会议上”，JSON 写成“企会议上”，属于 OCR 字符污染，FAIL。
- Issue 9：physical p3/left 首段原图清晰写“在快速变化的时尚鞋服市场中…环境、社会和治理（ESG）原则”，JSON `s00-b03` 仅为 review-note，清晰原文被遗漏，FAIL；physical p12/left 中段 `s07-b02` 对照正常。
- Issue 11：physical p3/left 首段原文为“对于我们创业团队而言”，JSON `s00-b02` 为“对于我们队而言”，缺失“创业团”，FAIL；physical p10/left 中段年会导语对照正常。
- Issue 12：physical p3/left 首段正文区域 `[65.5,208.4,294.5,270.4]` 在原图可读，JSON 以 review-note 替代，属于清晰原文遗漏，FAIL；其后保留段落及 physical p10/left 中段对照正常。
- Issue 13：physical p3/left 首段前三个正文区域 `[102.6,221.0,370.8,301.3]`、`[102.6,303.5,370.8,412.6]`、`[102.6,419.0,370.8,565.2]` 原图均可读，JSON 均以 review-note 替代，属于正文缺失，FAIL。physical p8/right 中段 `[694.5,253.8,1059.9,486.0]` 原图会议报道正文也清晰，当前同样为 review-note，需返工时决定逐段恢复或保留更精确的不可恢复边界，不得发布泛化占位。

Reproduction: 读取 `src/data/whitepapers/6.json` 至 `13.json` 的对应 `sections[].blocks[]`，按其 `source.pdfPage/side/bbox` 渲染原 PDF crop；逐张查看证据后比较 JSON 短锚点。Python 静态转换契约：`python tests/whitepapers/archive_conversion_test.py`，3 tests PASS。

Evidence: [sample-manifest.txt](../output/playwright/luna-wp05/offline-content-qa/sample-manifest.txt)、[sample-manifest.json](../output/playwright/luna-wp05/offline-content-qa/sample-manifest.json) 及同目录 17 个原 PDF crop；已实际查看的 crop 包括 issue 6（p3/p4）、7（p3/p9）、8（p3/p8）、9（p3/p12）、11（p3/p10）、12（p3/p10），另查看原稿 layout `output/whitepapers-ocr-layout/issue-12/page-003-left.png` 与 `issue-13/page-003-left.png`、`issue-13/page-008-right.png`。图表坐标证据见 [whitepapers-archive-figures-audit.md](whitepapers-archive-figures-audit.md)。

Likely affected area: `scripts/whitepapers/convert_archives.py` 的 OCR 清洗/分段边界与 `src/data/whitepapers/6.json`–`13.json` 的正文及 figure metadata。Severity: High（发布阅读版会造成原文缺失或事实/术语错误）；不涉及生产环境。

Unfinished: Issue 10 physical p3 下半及 p4–p5 的 3 个 crop 已生成并写入 manifest，但本次中断前未逐张视觉查看，不能宣称该部分 PASS；其余未列区域也未扩审。不得复用本轮 FAIL 结论作为返工后 PASS。

Handoff: 返回 Sol；本轮只追加本日志与 `output/playwright/luna-wp05/offline-content-qa/` 证据，未修改实现、JSON、PDF、CMS、数据库或构建产物。

### XYY-20260908-05 — 第10期三个 source 锚点复核与全14契约测试扩展

Task ID: XYY-20260908-05

Result: FAIL（第10期三个已指定 source 锚点均存在定位/边界问题；内容返工后需复测）。

Tests performed:

- 实际逐张查看此前生成的三个原 PDF crop，并与当前 `src/data/whitepapers/10.json` 的 `sections[].blocks[]` 对照：physical p3 下半 `s00-b02` 声明“回首与新亦源共同成长的七年”，但 bbox `[105,620,295,760]` 实际从“一群人、一条心……”创业段中部开始；physical p4 `s01-b01` 声明“女装行业没有秘密……”但 bbox `[100,150,295,300]` 从“店铺 COCO ZONE…”中段开始；physical p5 `s01-b17` 声明“为了保证消费者的购物体验…顺丰发货”，bbox `[315,410,500,500]` 实际落在相邻流量运营文字。三处均不能作为当前声明段落的可靠 source 锚点，未猜测新坐标。
- 完成测试文件扩展：`tests/unit/whitepaper-content.test.ts` 增加全 14 期唯一 issue、metadata/source hash、section/block source、figure 路径/alt/尺寸、本地资产、3–5 期逐节 review-note 及无 viewer/iframe/embed 契约；`tests/formal/production-origin.spec.ts` 增加白皮书栏目与 14 个详情页 indexable/canonical 检查、sitemap 第14期 URL、`/14?qa=1` 单次 301、`/014/` 与 `/15/` 真实 404。
- `npx vitest run tests/unit/whitepaper-content.test.ts`：1 file / 8 tests PASS。formal 尚未运行，避免触发 build 并干扰 Sol 正在准备的本地预览。

Regression coverage: 本轮仅覆盖第10期指定的 p3 下半、p4 首段、p5 中段三个 source 锚点；全14契约已写入测试但 formal/最终本地预览尚未执行。其余 6–13 source FAIL 修复后的最终视觉复测不在本轮扩审范围。

Evidence: [sample-manifest.txt](../output/playwright/luna-wp05/offline-content-qa/sample-manifest.txt)、[sample-manifest.json](../output/playwright/luna-wp05/offline-content-qa/sample-manifest.json)、`issue-10-s00-b02-p3-lower-first-prose.png`、`issue-10-s01-b01-p4-first-prose.png`、`issue-10-s01-b17-p5-middle-prose.png`、[whitepaper-content-contract.txt](../output/playwright/luna-wp05/whitepaper-content-contract.txt)。

Likely affected area: `scripts/whitepapers/convert_archives.py` 第10期 p3–p5 curated source bbox 与段落映射。Severity: High（会使正文 source traceability 失真，且段首/段中被截断或错配）。

Handoff: 返回 Sol；仅修改获授权的两个测试文件与本日志，未改实现或数据；formal 测试待本地预览刷新且 Sol 明确串行时运行。

### XYY-20260908-05 — 已修复 6/8/9/11/12/13 原 FAIL 锚点复测

Task ID: XYY-20260908-05

Result: PASS（本轮限定的原 FAIL 锚点正文保真与 source 定位均已恢复；不扩展为全期内容 PASS）。

Tests performed:

- 6：p4/left 图组 3 个 figure alt 与 bbox 已恢复准确：Fig3–4 为“粘胶短纤与涤纶长丝”，Fig5–6 为“棕榈油与 LDPE”，Fig1–2 为“国内 328 棉指与 Cotlook A”；Fig5–6 使用 `[220,520,550,640]`。
- 8：p8/right `s06-b01` 已恢复“在会议上”，原 bbox `[661.0,471.6,923.8,551.5]` 保持。
- 9：p3/left `s00-b03` 已恢复完整 ESG 引言“时尚鞋服市场…环境、社会和治理（ESG）原则”，bbox `[65.5,296.3,210.6,442.4]`。
- 11：p3/left 首段已恢复“对于我们创业团队而言”，使用修订后的 `[55,255,540,315]` source bbox。
- 12：p3/left 开场已恢复“近两年，服装电商行业经历了深刻变革…”，bbox `[65.5,208.4,294.5,270.4]`。
- 13：p3/left 三段首文与 p8/right 会议中段已从泛 review-note 恢复为带精确 source 的正文；p3 三个 bbox 分别为 `[102.6,221.0,370.8,301.3]`、`[102.6,303.5,370.8,412.6]`、`[102.6,419.0,370.8,565.2]`，p8 中段为 `[694.5,253.8,1059.9,486.0]`。
- `npx prettier --write tests/unit/whitepaper-content.test.ts tests/formal/production-origin.spec.ts` 完成；随后 `npx vitest run tests/unit/whitepaper-content.test.ts`：1 file / 8 tests PASS。

Regression coverage: 仅复测此前已报出的 6/8/9/11/12/13 source 锚点；区分正文保真 PASS 与第10期尚待人工重新定位的 source 锚点 FAIL。未运行 formal/build/PM2，避免干扰 Sol 的本地预览构建。

Evidence: [retest-fixed-anchors.txt](../output/playwright/luna-wp05/offline-content-qa/retest-fixed-anchors.txt)、[whitepaper-content-contract.txt](../output/playwright/luna-wp05/whitepaper-content-contract.txt)，以及对应原稿 layout/crop 证据。

Remaining risks: 第10期 p3 下半、p4、p5 三个原锚点仍待 Terra 给出新定位后复测；本轮不代表 6–13 其他段落或全14网页验收通过。

Handoff: 返回 Sol；测试文件已格式化并冻结，未修改应用实现、JSON 或 PDF。

### XYY-20260908-05 — 第10期新 source 粗定位最终复测

Task ID: XYY-20260908-05

Result: PASS（仅本次指定的 3 个第10期 source 粗定位；不等同于全篇内容验收）。

Tests performed:

- physical p3 下半文章《我们的故事》：`[95,410,300,780]` crop 实际包含原刊印刷页 4 左侧标题、合影及“回首与新亦源共同成长的七年……”正文，页/象限映射正确。
- physical p4 文章《单场 GMV 破亿，轻奢极简风女装在直播间爆发》：`[95,35,300,400]` crop 实际包含原刊印刷页 6 左侧标题及“女装行业没有秘密……”首段，页映射正确。
- physical p5 同文服务段：`[295,35,510,400]` crop 实际包含原刊印刷页 11 右侧文章区域及“为了保证消费者的购物体验…顺丰发货”段落，未发生前后文章/象限颠倒。
- 三处均核对 JSON 当前段落文本与 `source.pdfPage/side/bbox`；对应说明明确写为“定位至对应印刷页正文区域（非逐行框）”，与实际粗粒度 bbox 一致且未冒充逐行框。

Regression coverage: 仅复测此前失败的第10期 p3 下半、p4、p5 三个锚点；未扩展新样本，未据此宣称第10期全文或全14网页内容完成。

Evidence: [issue-10-retest.txt](../output/playwright/luna-wp05/offline-content-qa/issue-10-retest.txt)、[issue-10-retest-p3-story.png](../output/playwright/luna-wp05/offline-content-qa/issue-10-retest-p3-story.png)、[issue-10-retest-p4-gmv.png](../output/playwright/luna-wp05/offline-content-qa/issue-10-retest-p4-gmv.png)、[issue-10-retest-p5-service.png](../output/playwright/luna-wp05/offline-content-qa/issue-10-retest-p5-service.png)。

Remaining risks: 粗定位区域仍需实现阶段保留原文边界与 review-note 说明；未验证区域内每一行 OCR、图内小字或全篇其他段落。未运行 build/formal/PM2。

Handoff: 返回 Sol；第10期此前三个 source 定位 FAIL 已复测 PASS，测试文件与文档均保持在授权范围内。

### XYY-20260908-05 — 最终独立技术门禁

Task ID: XYY-20260908-05

Result: PASS（本次技术门禁；不替代 Sol 已完成的 formal/E2E 与全14网页视觉验收）。

Tests performed:

- `npm run verify`：EXIT 0；Astro check `395 files / 0 errors / 0 warnings / 0 hints`；maintainability `554 project files`；assets `56 referenced public assets + 103 deployment assets across 384 source files`；Vitest `56 files / 434 tests PASS`；Astro server build complete。
- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python tests/whitepapers/convert_issue.test.py`：EXIT 0，`1 test PASS`；原始输出记录写出第14期 `299 semantic blocks / 41 source crops`。
- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python tests/whitepapers/early_conversion.test.py`：EXIT 0，`4 tests PASS`；覆盖第1–5期生成契约。
- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python tests/whitepapers/archive_conversion_test.py`：EXIT 0，`6 tests PASS`；覆盖第6–13期 source-traceable archive 契约及已修复锚点。
- Python 生成测试后追加 `npx vitest run tests/unit/whitepaper-content.test.ts`：`1 file / 8 tests PASS`，确认全14内容契约在生成后仍通过。
- `git diff --check`：EXIT 0。

Regression coverage: 覆盖 typecheck、lint、维护性预算、静态资源、全量 Vitest、构建、三套离线转换契约、全14白皮书内容契约及 whitespace 检查；3–5 期保持“各章节明确 review-note 的未恢复边界”，未将其误报为完整正文恢复。Sol 已另行完成 formal 4 passed、既有 E2E 9 passed/1 configured skip 及全14网页技术/视觉 QA，本轮未重复。

Remaining risks: `convert_issue.test.py` 与 `early_conversion.test.py` 按测试设计重新生成 14 及 1–5 期 JSON/裁剪；对应原始日志已保留，生成结果在 post-python 白皮书契约中复核。3–5 期仍是部分恢复、237 条 manual review 边界，不应表述为逐字全文恢复。未重启 PM2，未访问线上，未执行 CMS/数据库/外部写入。

Evidence: [whitepaper05-luna-verify-final.log](../output/whitepaper05-luna-verify-final.log)、[convert_issue log](../output/whitepaper05-luna-convert_issue-final.log)、[early_conversion log](../output/whitepaper05-luna-early_conversion-final.log)、[archive_conversion log](../output/whitepaper05-luna-archive_conversion-final.log)、[post-python contract log](../output/whitepaper05-luna-whitepaper-contract-post-python.log)、[git diff check](../output/whitepaper05-luna-git-diff-check-final.log)。

Handoff: 返回 Sol；技术门禁 PASS，可进入 Nova；本轮未修改实现，仅记录日志及 QA 证据。

### XYY-20260908-05 — Nova re-test source preparation (bounded)

Task ID: XYY-20260908-05

Result: FAIL（源证据复测边界；不是全站/全14内容最终结论）。

Expected:

- 冻结来源表应准确表达每个 PDF physical page 的页数、尺寸、SHA；第10期 p9、 第12期物流→通知→质检及后续文章、 第13期 p15 left 与当前 JSON 文章/区域应一致；第14期指定 native paragraph bbox 应落在真实原文区域。

Actual:

- `public/senlinqikan/pdf/14.pdf` SHA `3db4a91dcae7e51fb2e7b1f02435c9ee25cb3bb16db4883c62e6cbb1f020603d` 与固定表一致，20页且宽均 1207.56pt；但唯一高度异常是 physical p11 = 825.10pt，p20 = 824.88pt。当前 `tests/helpers/whitepaper-source-pages.ts` 把 issue14 全部记录为 824.88pt，因此逐页尺寸表不精确（且异常页是 p11，不是 p20）。
- 第10期 physical p9 三篇文章映射正确：印刷26 无纸化（左上）、印刷27 上下班安全（右上）、印刷28–29 服务效率（下半，重庆仓/湖北仓分列）。
- 第12期 physical p11 为物流分析（印刷18–19），p12-left 为公众号迁移通知（印刷20），p12-right/p13-left 为质检（印刷21–22），p13-right 已是下一篇印刷23；但 p15-right 原图标题为“粽情端午，暖心相伴——新亦源云仓祝您端午安康”（印刷27），当前 `12.json` 将其置于“新亦源管理开放日·正式上线”小节；管理开放日实际在 physical p16/right（印刷29）。这是文章身份/边界错配。
- 第13期 p15 left 清晰显示团建标题与正文，页/象限正确。第14期 p3/p5/p6/p15 代表段 bbox 的 PDF clip 均含对应正文前缀，未见原文改写的证据。

Reproduction:

- 用 `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python` + PyMuPDF 读取 14 本 PDF 页数、每页 `rect` 与 SHA；用 `pdfinfo -f 11 -l 11`、`pdfinfo -f 20 -l 20` 复核异常页；用 `file` 检查 1–5 缓存 PNG。
- 从原 PDF 新鲜渲染并逐张查看限定区域：`output/playwright/luna-wp05/source-retest/` 下 issue10 p9 三图、issue12 p11–p15 分区图、issue13 p15 left、issue14 四个 paragraph clip；将当前 JSON 的 `source.pdfPage/side/bbox` 与原图标题/段首对照。

Evidence:

- [native-pages.txt](../output/playwright/luna-wp05/source-retest/native-pages.txt)
- [source-findings.txt](../output/playwright/luna-wp05/source-retest/source-findings.txt)
- `issue-10-p9-paperless.png`, `issue-10-p9-commute-safety.png`, `issue-10-p9-service-efficiency.png`
- `issue-12-p11-left.png`, `issue-12-p11-right.png`, `issue-12-p12-left.png`, `issue-12-p12-right.png`, `issue-12-p13-left.png`, `issue-12-p13-right.png`, `issue-12-p14-*-v2.png`, `issue-12-p15-*-v2.png`
- `issue-13-p15-left.png`; `issue-14-p3-sec0-block2.png`, `issue-14-p5-sec1-block28.png`, `issue-14-p6-sec2-block1.png`, `issue-14-p15-sec5-block20.png`

Likely affected area: `tests/helpers/whitepaper-source-pages.ts` issue14 page-dimension catalog (requires a page-specific height override by Native owner) and `src/data/whitepapers/12.json` article grouping/source boundary for physical p15/right. Severity: High for source traceability/content identity; no production impact.

Remaining risks: OCR 6–13 was still subject to the parent’s freeze handoff at the time of this bounded source preparation; no conversion regeneration, build, Vitest, formal, or browser test was run in this phase. Findings cover only the listed source regions, not full-corpus textual fidelity. Do not call this an overall content PASS until the two findings are corrected and re-tested.

Handoff: 返回 Sol；本轮仅追加本日志与忽略的 source-retest evidence，未修改实现、JSON、PDF、测试、CMS、数据库或部署环境。

### XYY-20260908-05 — Native four-locator / p11 height correction re-test

Task ID: XYY-20260908-05

Result: PASS（仅本次 Native 四个修复 locator 与 issue14 页高 override；此前 issue12 p15/right 文章分组 FAIL 仍有效）。

Tests performed:

- 重新读取当前 `src/data/whitepapers/14.json` 的四个实际修复块，并从原 `public/senlinqikan/pdf/14.pdf` 按精确 PDF 点坐标渲染、逐张查看：
  - `s1-b4` physical p3/right `[661.4,222.4,1140.7,739.2]`：目标“针对严峻外部环境，党中央…”完整落在 union 框内，跨两栏续文可见。
  - `s1-b37` physical p5/right `[662.2,348.6,1141.3,755.3]`：目标“一季度，我国共进口棉花33.8万吨…”完整落在 union 框内，页内后续图文仍属该有意 union 区域。
  - `s2-b15` physical p6/right `[660.9,695.6,1142.2,727.8]`：目标“也正因如此，越来越多品牌…”整段精确落框。
  - `s5-b23` physical p15/left `[81.5,605.5,495.5,648.7]`：视觉 crop 同时包含“咨询热线：400-686-5156”及其后“将仓储难题…”正文；PDF 文本层顺序与 JSON 句序不同，但内容均在框内。
- 重新核对 `tests/helpers/whitepaper-source-pages.ts`：issue14 已有 `pageHeights: { 11: 825.1 }`。PyMuPDF 与 `pdfinfo` 再次确认 p11 `1207.56×825.10pt`、p20 `1207.56×824.88pt`，页高异常为 p11，override 与原件一致。

Regression coverage: 仅覆盖本次明确指定的四个坏 bbox 修复块及 p11/p20 页高边界；不扩展到未列段落，不运行转换、fullverify、build 或浏览器测试。

Evidence: [source-findings.txt](../output/playwright/luna-wp05/source-retest/source-findings.txt)、[native-pages.txt](../output/playwright/luna-wp05/source-retest/native-pages.txt)、`issue-14-fixed-s1-b4-p3.png`、`issue-14-fixed-s1-b37-p5.png`、`issue-14-fixed-s2-b15-p6.png`、`issue-14-fixed-s5-b23-p15.png`。

Remaining risks: 本次只纠正证据归属并复测 Native locator；第12期 p15/right “粽情端午”与当前“管理开放日”分组错配仍待 OCR 返工后复测。此前证据中的四个“首段样本”不能替代本次四个坏 bbox 结论。

Handoff: 返回 Sol；本轮仅追加 QA 日志与忽略 source crops/evidence，未修改实现、JSON、PDF、测试或外部环境。

### XYY-20260908-05 — 联合 Re-test：源内容与技术门禁

Task ID: XYY-20260908-05

Result: FAIL（当前冻结数据的源内容/图片裁剪保真；技术门禁单项通过，不能据此发布）。

Expected:

- 第10期 p9 三篇及 p10 续文、第12期物流→通知→质检→周年庆→步履→端午→管理开放日→竞赛→花桥仓、第13期 p15 left 团建均应按原 PDF 页/象限映射，正文不得有裸 OCR 碎片；图片应为完整、准确的局部原图。
- 三组离线转换、全量契约/verify、diff check 均应以本次冻结源码实际结果通过，且原 PDF 不被改写。

Actual:

- 第10期 p9/p10、第12期 physical p10–p18 的文章边界与第13期 p15 left 分区映射经新鲜原 PDF 全页图核对通过；第12期质检五节及表格确实位于 p12 right/p13 left，后续文章边界未再前后颠倒。
- 第12期仍有未标记正文污染：`sections[4].blocks[9]`/`[10]` 为“并车本千”“体平稳结级力质效”图形碎片；`sections[4].blocks[25]` 以“Ft:”开头；周年庆 `sections[7].blocks[7]` 含“干册竞发再攀登。上海他 wa Sh”；花桥段 `sections[12].blocks[0]`/`[5]`/`[11]` 含“花桥仑”“WA重视”“新吴工座谈会”。p17/p18 仍有相似可疑替换，均未以精确 review-note 隔离。
- `public/images/supply-chain-whitepapers/12/quality-defect-table.png`（JSON s6-b13，p13 left/印刷22 bbox `[120,96,550,300]`，645×306）实看左侧首列被截断，底部混入下一节正文开头，非完整忠实表格裁剪。

Reproduction:

- 以 PyMuPDF 重新读取原 PDF 并查看 `output/playwright/luna-wp05/source-retest/joint-issue10-p9-full.png`、`joint-issue10-p10-full.png`、`joint-issue12-p10-full.png` 至 `joint-issue12-p18-full.png`、`joint-issue13-p15-full.png`，逐一对照 JSON `source.pdfPage/printedPage/side/bbox` 与正文。
- 直接查看 `public/images/supply-chain-whitepapers/12/quality-defect-table.png`，并回查 `src/data/whitepapers/12.json` s6-b13 的 source 与尺寸。

Evidence:

- [joint-final-technical-and-content.txt](../output/playwright/luna-wp05/source-retest/joint-final-technical-and-content.txt)
- [joint-source-review.txt](../output/playwright/luna-wp05/source-retest/joint-source-review.txt)
- [joint-issue12-p13-full.png](../output/playwright/luna-wp05/source-retest/joint-issue12-p13-full.png)
- [joint-issue12-p18-full.png](../output/playwright/luna-wp05/source-retest/joint-issue12-p18-full.png)
- [joint-issue10-p9-full.png](../output/playwright/luna-wp05/source-retest/joint-issue10-p9-full.png)
- [joint-issue10-p10-full.png](../output/playwright/luna-wp05/source-retest/joint-issue10-p10-full.png)
- [joint-issue13-p15-full.png](../output/playwright/luna-wp05/source-retest/joint-issue13-p15-full.png)

Technical checks performed:

- `convert_issue.test.py`: EXIT 0，1 test；`early_conversion.test.py`: EXIT 0，4 tests；`archive_conversion_test.py`: EXIT 0，9 tests。
- 定向 Vitest：4 files / 30 tests PASS，EXIT 0。
- `npm run verify` 原始日志已实际完成 Astro check（397 files、0 errors/warnings/hints）、lint、maintainability、assets、Vitest（57 files / 437 tests）及 Astro server build；首个 30 秒 wrapper 在打印 post-command EXIT 标记前被工具超时终止，故不伪造 EXIT 0。
- JSON/source/schema 检查：0 schema errors；73 figures 均有文件、alt、width、height；总计 1,601 paragraph、73 figure、235 review-note、96 subheading、82 quote blocks。全部 PDF SHA/页数/尺寸已重读，PDF 路径 `git diff --check` 对源 PDF EXIT 0；全仓 `git diff --check` EXIT 0。

Likely affected area: `src/data/whitepapers/12.json` OCR 段落隔离/字符恢复，以及 `public/images/supply-chain-whitepapers/12/quality-defect-table.png` 的源 bbox 裁剪；不属于环境阻塞。Severity: High（发布正文与来源追溯风险；技术构建本身无故障）。

Remaining risks: 第3–5期仍为部分恢复并保留 237 条 manual review 边界；本轮未重跑浏览器/formal/E2E，不能把上轮页面证据当成本次数据版本证据。OCR/表格裁剪修复并重新冻结后，应重新执行受影响的源内容复测及带明确 EXIT 标记的完整 verify，再决定是否释放 dist。

Handoff: 返回 Sol；当前联合 Re-test 内容 FAIL，已冻结具体返工点；未修改实现、JSON、PDF、测试、CMS、数据库或部署环境。

### XYY-20260908-05 — 第12期定向返工源复测

Task ID: XYY-20260908-05

Result: PASS（仅第12期上一轮明确 FAIL 点及新增质检表裁剪；尚未代表全14技术/网页最终 PASS）。

Tests performed:

- 独立从原 `public/senlinqikan/pdf/12.pdf` 新鲜渲染 physical p10、p11、p14、p17、p18 指定区域，与当前 `src/data/whitepapers/12.json` 的 `source.pdfPage/printedPage/side/bbox` 对照。物流 p10 装饰碎片已删除，p11 民航段从“Ft:”恢复为“5月民航货邮运输量…”，p14 上海祝福恢复为可读 quote，p17 竞赛和 p18 花桥段落均为清晰原文；照片/装饰区域由 review-note 覆盖。
- 新鲜查看 `public/images/supply-chain-whitepapers/12/quality-defect-table.png`：当前 698×221，完整包含标题、表头及“面辅料、外观、缝制、工艺、异味、配件”六行两列；当前 source 为 p13 left/印刷22 bbox `[55,95,520,242]`，无左侧截断或下一节正文混入。独立原 PDF bbox 渲染亦一致。
- 当前第12期计数：234 paragraph、3 figure、44 review-note、15 subheading、12 quote，17,241 paragraph 字符；全14合计 1,587 paragraph、73 figure、238 review-note、99 subheading、83 quote。上一轮缺陷字符串在 12.json 中均已消失。

Regression coverage: 仅复测上一轮 issue12 物流/周年/竞赛/花桥缺陷与本轮新增表格 crop；不扩展为全14内容或网页验收。此前 10/13 source 锚点与 14 四 locator/p11 高度已有独立证据，本轮不重复。

Evidence: [12-correction-retest.txt](../output/playwright/luna-wp05/source-retest/12-correction-retest.txt)、[p11-corrected-cargo.png](../output/playwright/luna-wp05/source-retest/12-final/p11-corrected-cargo.png)、[p14-anniversary.png](../output/playwright/luna-wp05/source-retest/12-final/p14-anniversary.png)、[p18-flower-left.png](../output/playwright/luna-wp05/source-retest/12-final/p18-flower-left.png)、[p18-flower-right.png](../output/playwright/luna-wp05/source-retest/12-final/p18-flower-right.png)、[p13-quality-table-source-bbox.png](../output/playwright/luna-wp05/source-retest/12-final/p13-quality-table-source-bbox.png)。

Remaining risks: 仍需按调度顺序重跑 archive 9、定向4 files、完整 `npm run verify` 并捕获真实退出码；本轮未运行 build、PM2、formal/E2E 或线上检查。第3–5期仍为部分恢复并保留 237 条 manual review 边界。

Handoff: 返回 Sol；第12期本轮指定源内容与新增表格裁剪 PASS，可进入约定技术门禁；未修改实现或测试。

### XYY-20260908-05 — 第12期修复后技术门禁复测

Task ID: XYY-20260908-05

Result: PASS（本次指定技术门禁；结合上一节第12期源复测 PASS，可交 Sol 进入本地预览/后续页面复测；不替代上轮全14网页证据）。

Tests performed:

- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python tests/whitepapers/archive_conversion_test.py`：EXIT 0，9 tests PASS。
- `npx vitest run tests/unit/whitepaper-source-contract.test.ts tests/unit/whitepaper-content.test.ts tests/unit/claims.test.ts tests/unit/request-policy.test.ts`：EXIT 0，4 files / 30 tests PASS。
- `npm run verify`：通过可持续 session 轮询取得真实 `exit_code: 0`；Astro check 397 files、0 errors/0 warnings/0 hints；maintainability 556 project files；assets 56 referenced + 103 deployment assets across 384 source files；全量 Vitest 57 files / 437 tests PASS；Astro server build complete。
- 生成后 JSON/source/schema 检查：0 schema errors；全14合计 1,587 paragraph、73 figure、238 review-note、99 subheading、83 quote blocks；73 figures 文件、alt、width、height 均存在。第12期 source SHA 与原 PDF 匹配（`dc5ccb52c536e4a53b2ce34316e8b0df5c2e9b49c88626a900fb3f5a1bf81daf`），`git diff --quiet -- public/senlinqikan/pdf` EXIT 0。
- `git diff --check`：EXIT 0。

Regression coverage: 本轮重跑 archive9、定向 source/content/claims/request-policy 4 文件及完整 verify；native1、early4、14 四 locator/p11 高度与 PDF dimension 已在上一轮独立 PASS，本轮无变更故不重复；未重跑 formal/E2E/浏览器。

Evidence: [12-correction-retest.txt](../output/playwright/luna-wp05/source-retest/12-correction-retest.txt)、[retest archive log](../output/whitepaper05-luna-retest-archive.log)、[retest Vitest log](../output/whitepaper05-luna-retest-vitest.log)、[retest verify log](../output/whitepaper05-luna-retest-verify.log)。

Remaining risks: 本轮未执行 PM2、CMS/数据库、线上访问；需由 Sol 释放本地 dist 后，对受影响第10/12/13期执行桌面/手机预览复测。第3–5期仍为部分恢复并保留 237 条 manual review 边界，不应表述为逐字全文恢复。

Handoff: 返回 Sol；第12期修复后源内容与技术门禁均 PASS，dist 已由本次 verify 构建完成，可在 Sol 确认后刷新本地预览；未修改实现或测试。

### XYY-20260908-05 — Nova 第二轮 Re-test 源证据准备（未验当前 JSON）

Task ID: XYY-20260908-05

Result: PREPARED（只读原 PDF/原图锚点；当前数据尚未复测，不提前 PASS）。

Tests performed:

- 独立查看 `output/whitepapers-ocr-layout/issue-10/page-008.png` 与对应原 PDF physical p8，并用 PyMuPDF 新鲜渲染 `output/playwright/luna-wp05/nova2-source-prep/issue-10-physical-8-pdf-render.png`。确认印刷页阅读顺序与归属：p22 左上为总部乔迁续文“03 新的根据地”；p23 右上为夏日消暑；p24 左下为夏日续文；p25 右下为独立 618 特辑。
- 独立查看 `issue-13/page-015-left.png`、`page-015-right.png` 与对应原 PDF physical p15，并新鲜渲染 `issue-13-physical-15-pdf-render.png`。确认 p26 左侧团建标题/作者/漂流段，p27 右侧依次为“林间小憩：在自然里放松，于交流中蓄力”完整段落、再到“返程：带着热爱，奔赴新程”完整段落。
- 建立了后续整篇核对的原文短锚点、文章归属、分栏阅读顺序和禁止裸 OCR 碎片清单；不以当前 JSON 或转换器期待值替代源证据。

Regression coverage: 仅覆盖 Nova 新增阻断的 issue10 physical p8、issue13 physical p15 左右页；未读取/修改当前实现和 JSON，未运行转换、Vitest、verify、build、浏览器或外部操作。

Evidence: [source-order-anchors.txt](../output/playwright/luna-wp05/nova2-source-prep/source-order-anchors.txt)、[issue10 PDF render](../output/playwright/luna-wp05/nova2-source-prep/issue-10-physical-8-pdf-render.png)、[issue13 PDF render](../output/playwright/luna-wp05/nova2-source-prep/issue-13-physical-15-pdf-render.png)。

Remaining risks: Terra 返工尚未由 Sol 宣布最终冻结；后续必须对整段文章逐项比对正文、断行、归组、阅读顺序及 source bbox，不能只搜索“笔架山／一起闯／奋斗蓄力”等三个词。第3–5期既有部分恢复与 manual review 边界不在本次扩审范围。

Handoff: 返回 Sol；已完成限定源证据准备，等待最终 JSON/实现冻结后再执行正式 Luna Re-test。

### XYY-20260908-05 — 最终有限源内容验收（7 个指定源区）

Task ID: XYY-20260908-05

Result: PASS（仅源阶段；7、8、9、10、11、12、13 均 PASS）。

Tests performed:

- 实际目视对比最终 JSON 与指定原图/原 PDF 证据：10 physical p8 乔迁续文→夏日消暑→618 边界、13 physical p15 团建左页→林间小憩→返程顺序，均与原图一致；争议 crop 复核确认原文为“为了缓解炎热给员工带来的不适”“此刻没有 KPI”“传递货物”。
- 7 physical p16 right 两张局部招聘图均独立包含岗位及工作地点行，bbox `[665,110,895,660]` / `[915,110,1145,660]`，不含共用橙色尾语；历史招聘免责声明保留在 review-note。
- 8 physical p13 left 橙框正文按左后右合并，完整由“总而言之，数字化物流系统已成为鞋服品牌迈向成功的关键因素”至“助力其飞向更加辉煌的未来”；9 physical p3 left 蓝框局部图完整保留“50万 m²”，旧“50万只/©”未作为普通正文。
- 11 physical p7 left/right 实看导语“吞噬”、跨栏衔接“行业最大异常工况数据库”、CargoWare 175/55/120 与 eTower 151/52/99 年迭代原数及后续顺序；未见 `NA WallTech` 或本轮列明的裸 OCR。12 physical p3 right “4. 卷服务质量”连续至“提升消费者购物体验”，无 `_sft`/`3B wa`。
- 只读核对 7 个原 PDF SHA 与 JSON `sourceSha256` 一致；7 个目标 JSON 均由 `jq` 解析成功。完整证据：[source-qa-report.txt](../output/playwright/whitepaper05-final-source/source-qa-report.txt)。

Regression coverage: 仅覆盖本轮合同列出的 7 个源区及 10/13 三张争议原图；未扩展到其他源段或全 187 页，未运行转换、Vitest、verify、build、浏览器、PM2、CMS、数据库或线上操作。

Remaining risks: 本 PASS 不等于全书逐字校对；第 3–5 期仍为明确部分恢复并保留待核查边界。第 11 期未将未列入本轮验收要求的小型英文资源名单作为完整转录目标。后续技术/页面门禁需由 Sol 另行调度。

Handoff: 返回 Sol；本轮未修改实现、JSON、图片、PDF、测试或外部环境。

### XYY-20260908-05 — 独立技术门禁复测（源 QA 后）

Task ID: XYY-20260908-05

Result: PASS（本轮指定技术门禁；不替代后续 localhost 页面复查）。

Tests performed:

- `/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python -m unittest tests/whitepapers/archive_conversion_test.py`：实际 `exit_code=0`，`Ran 12 tests`，`OK`。
- `npx vitest run tests/unit/whitepaper-content.test.ts tests/unit/whitepaper-source-contract.test.ts tests/unit/claims.test.ts tests/unit/request-policy.test.ts`：实际 `exit_code=0`，4 files / 30 tests PASS。
- `npm run verify`：通过持久 `exec_command` 会话与 `write_stdin` 取得真实 `exit_code=0`；日志末尾为 `VERIFY_EXIT:0`。Astro 397 files / 0 errors / 0 warnings / 0 hints；维护性 556 files；资源 56 referenced + 103 deployment assets；全量 Vitest 57 files / 437 tests；Astro build 完成。
- 只读完整性检查：14 个 JSON 的 `sourceSha256` 均与 `public/senlinqikan/pdf/1.pdf`–`14.pdf` 实际 SHA 匹配（`JSON_HASH_FAILURES:0`）；引用计数 `FIGURES:76`、`REVIEW_NOTES:235`；source-contract 的有界 locator 测试已在上述 30 tests 中通过；`git diff --quiet -- public/senlinqikan/pdf` 为 0；`git diff --check` 为 0。

Regression coverage: 仅执行调度指定的 archive 12 项、定向 4 files / 30 tests、完整 `npm run verify` 及 PDF/JSON/hash/数量/diff 检查；未重跑 native1、early4、formal、E2E、浏览器或页面复查，未运行 PM2/CMS/数据库/线上操作。

Evidence: [archive log](../output/whitepaper05-nova2-luna-archive.log)、[Vitest log](../output/whitepaper05-nova2-luna-vitest.log)、[verify log](../output/whitepaper05-nova2-luna-verify.log)、[integrity log](../output/whitepaper05-nova2-luna-integrity.log)。

Remaining risks: 本轮技术门禁 PASS 不等于页面运行态 PASS；需由 Sol 按顺序执行 localhost preview build（仅本地 `xyy-web`）后另派桌面/移动页面复查。第 3–5 期仍为明确部分恢复并保留待核查边界。

Handoff: 返回 Sol；本轮未修改实现、测试、JSON、图片或 PDF，未进行外部写入。

### XYY-20260908-05 — 章节提示移除全14期独立 UI 复测

Task ID: XYY-20260908-05

Result: PASS（14→1 串行、28 个视口；仅本轮章节提示增量）。

Tests performed:

- 指定 Vitest：实际 `exit_code=0`，3 files / 18 tests PASS。
- Playwright CLI session `luna-whitepaper05-no-section-notes-2` 单 tab 串行访问 14→1，各 `1440×900`、`390×844`；无 `.whitepaper-article__review-note`、章节提示文案、`查看原版第` 或 `#page=` 链接/空框。3–5 顶部 notice 各 1 且精确为“本期仅部分内容，完整内容请阅读 PDF 原版。”，其余各 0。
- 每期 H1=1、来源/日期、TOC 目标、Header/Footer、PDF 链接=2、返回入口均保留。正文图矩阵（桌面/手机均同）：14 `41/41`、13 `2/2`、12 `3/3`、11 `2/2`、10 `6/6`、9 `3/3`、8 `2/2`、7 `4/4`、6 `5/5`、5 `1/1`、4 `1/1`、3 `1/1`、2 `2/2`、1 `3/3`；共 76 张/端全部 decode，最大中心偏差 `0px`，无横向溢出（桌面 `1425/1425`，移动 `375/375`）。
- 阶段结果：14–10 为 10/10 PASS；9–5 为 10/10 PASS；4–1 为 8/8 PASS。重截并目视确认 14 期桌面/手机及 3 期手机末端上下文定位正确。

Regression coverage: 覆盖全14期两端章节提示移除、保留项、正文图片解码/数量/居中、TOC/Header/Footer/PDF/返回与 overflow；未做 PDF 逐字审、全交互回归、CMS、数据库、PM2、部署或线上检查。

Evidence: 截图目录为 `output/playwright/whitepaper05-no-section-notes/`；每期 `issue{14..1}-mobile-last-section.png`，另有 `issue14-desktop-last-section.png`。唯一 CLI session 已关闭，未触碰用户 Chrome tabs。

Remaining risks: 结果仅证明本机冻结预览；3–5 期仍为部分恢复稿，不代表全文逐字校对。未修改应用实现、数据或测试。

Handoff: 返回 Sol；本轮独立全14期 UI 复测 PASS。

### XYY-20260908-05 — 顶部通用说明删除独立复测

Task ID: XYY-20260908-05

Result: PASS（仅本轮指定 14/3 页首 UI 与 3 个定向 Vitest 文件）。

Tests performed:

- `npx vitest run tests/unit/whitepaper-presentation.test.ts tests/unit/whitepaper-content.test.ts tests/unit/whitepaper-source-contract.test.ts`：实际 `exit_code=0`，3 files / 18 tests PASS。
- Playwright CLI 本地 `localhost:4321` 检查 14、3 期各 `1440×900` 与 `390×844`（4/4 视口）；两期页首均无“本阅读版整理自／历史语境／不构成当前服务承诺”。14 期 `.whitepaper-article__notice` 数量为 0；3 期为 1，文本精确为“本期仅部分内容，完整内容请阅读 PDF 原版。”
- 四个视口均保留来源/出版日期、顶部 PDF 下载、目录、Header/Footer；PDF 链接各 2 个。无横向溢出：桌面 `1425/1425`，移动 `375/375`（scrollWidth/clientWidth）；页面运行命令实际 `exit_code=0`。

Regression coverage: 仅覆盖本次页首说明、空 notice 节点、来源/日期、目录/下载入口、Header/Footer 与两端 overflow；未扩展全14页、全文图片滚动、PDF、CMS、数据库、PM2 或线上。

Evidence: [issue14-desktop-top.png](../output/playwright/whitepaper05-no-banner/issue14-desktop-top.png)、[issue14-mobile-top.png](../output/playwright/whitepaper05-no-banner/issue14-mobile-top.png)。

Remaining risks: 证据仅证明本机冻结预览；第3–5期仍为部分恢复稿，不代表全书逐字校对。Playwright wrapper 初次直接执行因权限/cache 环境失败，改用 `bash` 与 `/tmp` cache/XDG 后成功，未影响实际检查结果。

Handoff: 返回 Sol；未修改应用实现、测试、JSON、图片或 PDF。

### XYY-20260908-05 — 阅读体验增量 UI 验收

Task ID: XYY-20260908-05

Result: PASS（仅指定 localhost UI 矩阵与文案/链接检查）

Tests performed:

- 使用 Playwright CLI 独立会话只读访问 `http://localhost:4321/supply-chain-whitepapers/{3,7,10,12,14}/`。第 14、12、7 期实际检查 `1440×900` 与 `390×844`；第 3 期移动端检查页首部分内容提示，第 10 期检查 6 个图注。
- 第 14 期两端 41/41 图片成功解码，最大图片相对所属 section 中心偏差 `0px`；桌面 `scrollWidth=1425≤1440`，移动 `375≤390`。27 张增强 `/reading/*.webp` 均为 `naturalWidth>displayWidth`；3 张 source-limited 图显示宽分别为 `318/316/315px`。
- 第 12 期两端 3/3 图片成功解码，中心偏差 `0px`，无横向溢出；质量表移动端最终实测原图 `1860×588`、显示宽 `343px`。12 个读者提示链接均为 `/senlinqikan/pdf/12.pdf#page=N`。
- 第 7 期两端 4/4 图片成功解码，中心偏差 `0px`，无横向溢出。所有指定页面均通过唯一 H1、Header/Footer、TOC target 与 PDF 入口检查。
- 第 3 期页首明确显示“本期仅部分内容，完整内容请阅读 PDF 原版”；第 10 期 6 个 figure 的 aria-label/innerText/alt 均不含“上半/下半/左侧文章区域”，公开技术制作术语检查通过。
- 实际点击第 14 期“查看大图”，成功打开独立图片 tab：`/images/supply-chain-whitepapers/14/reading/cross-border-challenges.webp`。

Regression coverage: 覆盖指定第 14、12、7 期两端图片滚动解码、自然尺寸/显示尺寸、section 居中、横向溢出、唯一 H1、Header/Footer、TOC/PDF 链接，以及第 3/10 期指定公共文案边界；未新增测试套件，未重跑全 14 期浏览器矩阵。

Evidence: 截图位于 `output/playwright/whitepaper05-presentation-ui/`：`issue14-desktop-narrow-export.png`、`issue14-mobile-cross-border.png`、`issue12-mobile-quality-table-notice.png`、`issue3-mobile-partial-notice.png`。其中 12 期截图仅作表格/大图入口上下文，不宣称包含下方 aside。

Remaining risks: 结果仅证明本机冻结预览 `localhost:4321`；未访问线上、未部署、未操作 PM2/CMS/数据库。首次逐图等待命令因等待时限超时，缩短等待并加入显式 load/decode 等待后复测通过。第 3–5 期仍为部分恢复稿，不替代全书逐字源稿校对。

Handoff: 返回 Sol；本轮未修改应用实现、测试、JSON、图片或 PDF。

### XYY-20260908-05 — reader presentation rework 技术阶段复测

Task ID: XYY-20260908-05

Result: PASS（仅本轮增量技术门禁；浏览器 UI 阶段待本地 build/restart 后另行复测。）

Tests performed:

- `python3 tests/whitepapers/reading_images_test.py`：4/4 PASS；`python3 scripts/whitepapers/enhance_reading_images.py --check`：`Validated 31 source-locked reading image assets`。
- `npx vitest run tests/unit/whitepaper-presentation.test.ts tests/unit/whitepaper-content.test.ts tests/unit/whitepaper-source-contract.test.ts tests/unit/claims.test.ts tests/unit/request-policy.test.ts`：5 files / 37 tests PASS。
- `npm run verify` retest：Astro 399 files、0 errors/0 warnings/0 hints；lint、maintainability、assets PASS；全量 Vitest 58 files / 444 tests PASS；Astro build 完成；日志末尾真实 `VERIFY_EXIT=0`。
- 只读完整性：`output/whitepaper05-presentation-baseline.json` 的 104 项（14 JSON、14 PDF、76 原图）当前缺失 0、变化 0；14 期原 JSON 内部 `review-note` 总数仍为 235。manifest 31 项尺寸/展示宽度/类型由 Python check 覆盖（28 enhanced、3 source-limited）。
- 已生成并查看 4 组有限 old/new 对照：14 期跨境四栏图、14 期名单图、12 期六行质检表、14 期三张出口图；同图身份及完整边缘未见异常。未扩展 187 页整书源审查。

Regression coverage: 覆盖本轮图片派生校验、presentation/content/source-contract/claims/request-policy 定向测试、完整 lint/类型/维护性/资产/单测/build，以及 104 项源基线、235 条内部 notes 和 31 项 manifest 完整性；未查看旧浏览器预览，未执行 UI 矩阵、CMS/数据库/PM2/部署/外部写入。

Evidence: [verify retest log](../output/whitepaper05-presentation-luna-verify-retest.log)、[initial verify log](../output/whitepaper05-presentation-luna-verify.log)、有限图对照位于 `output/playwright/whitepaper05-presentation-qa/`。

Remaining risks: 页面运行态尚未复测；需在 Sol 通知本地 build/restart 就绪后，按合同覆盖 14/12/7 桌面与移动视口、中心偏差、无溢出、lazy decode、31 链接/PDF 锚点及公共文案禁词。首次 verify 曾因测试 JSON 索引 TS7053 得到 `VERIFY_EXIT=1`，Terra 已最小修复后本轮 retest 通过。

Handoff: 返回 Sol；本轮未修改应用实现、原文、JSON、图片或 PDF，仅追加本日志与 QA output 证据。

### XYY-20260908-05 — 最终 localhost 页面 QA（第 7–13 期）

Task ID: XYY-20260908-05

Result: PASS（仅最终冻结 localhost 预览的第 7–13 期，两种视口；不代表全 14 期浏览器复测或全书逐字源审。）

Tests performed:

- 使用 Playwright CLI 新会话 `luna-wp05-final-data`，通过 `/home/yj/.codex/skills/playwright/scripts/playwright_cli.sh` 实际访问 `http://localhost:4321/supply-chain-whitepapers/{7..13}/`，逐期检查 `1440×900`、`390×844`。
- 7–13 共 14 个视口均通过唯一 H1、title/description/self-canonical、TOC target、Header/Footer、PDF/返回入口；逐张滚动 lazy 图后加载计数 7/8/9/10/11/12/13 = 6/6、4/4、5/5、8/8、4/4、5/5、4/4；桌面宽 1425、手机宽 375，均无水平溢出。
- 每个视口 console error/warning、pageerror、HTTP≥400、request failure 均为 0。TOC target 均存在；实际点击 10 期 `#section-8`、13 期 `#section-12` 后等待平滑滚动稳定，hash 正确且 target top 约 112px，在 Header 下方。
- 重点正文实际确认：10 期“为了缓解炎热”与独立后续“618特辑”；11 期“吞噬”、行业最大异常工况数据库、CargoWare/eTower；12 期“卷服务质量”至“提升消费者购物体验”；13 期“林间小憩”、渲染后的“此刻没有 KPI”、 “奋斗蓄力”及“返程”。
- 目视检查真实 viewport 截图：7 两张独立招聘海报（桌面/手机，底部联系与地点行可见）；9 蓝色历史数据框与图注/note（`超50万m²`）；10 夏日与 618 桌面/手机正文；13 小憩与返程桌面/手机正文。13 return 两张已用精确 `h3` 定位及 instant scroll 重截并确认标题与段落可见（target top 约 110px）。

Regression coverage: 仅覆盖本次页面 Scope 的 7–13 两视口、metadata、TOC anchors/click、Header/Footer、PDF/返回、lazy 图、overflow、console/runtime/network 基础检查及 7/9/10/13 重点视觉证据；未新增 E2E spec、未重跑全 14 浏览器、源 PDF 逐字审、build、PM2/CMS/DB/线上。

Evidence: [page-qa-final-report.txt](../output/playwright/whitepaper05-final-source/page-qa-final-report.txt)；截图位于 `output/playwright/whitepaper05-final-source/`，含 `issue-7-*viewport.png`、`issue-9-*context-viewport.png`、`issue-10-*viewport.png`、`issue-13-*viewport.png`。

Remaining risks: 结果仅证明本机 `localhost:4321` 冻结预览；未证明部署/线上运行。第 3–5 期仍是明确部分恢复并保留 manual-review 边界；8/11/12 按合同仅做 DOM/滚动回归，未增加重点截图。

Handoff: 返回 Sol；本轮未修改实现、测试、JSON、图片或 PDF，未进行外部写入。

### XYY-20260909-01 — 发布候选独立门禁

Task ID: XYY-20260909-01

Result: FAIL（候选发布被格式与生产依赖审计门禁阻断；`verify:release` 本身 EXIT0）。

Expected: 候选 `npm ci`、`format:check`、`npm audit --omit=dev`、`verify:release` 均实际 EXIT0，且候选源码/index 不变。

Actual: 候选 `/tmp/xyy-release-20260909-VEEy4m/candidate` 的 `npm ci` EXIT0；`format:check` EXIT1，唯一警告为 `scripts/whitepapers/ocr/catalog.issues-1-13.json`；`npm audit --omit=dev` EXIT1，4 项漏洞（1 critical/3 high，Astro、js-yaml、sharp、svgo）。`verify:release` EXIT0：Astro 399 files/0 diagnostics、Vitest 58 files/444 tests、E2E 39 passed/7 skipped（1 worker）、formal 4 passed、build complete。

Reproduction: 在候选目录依次运行合同指定 `npm ci`、`CI=1 ... npm run format:check`、`npm audit --omit=dev`、`CI=1 ... npm run verify:release`；未运行修复命令。

Evidence: [release-gate-summary.md](../output/xyy-release-20260909-01/release-gate-summary.md)；末次 `git write-tree` 为 `728002ddf5f2da17c0647b9823f5eb0637959964`，工作树相对 index clean。

Likely affected area: `scripts/whitepapers/ocr/catalog.issues-1-13.json` 格式；候选 `package-lock.json`/生产依赖版本对应的 Astro、js-yaml、sharp、svgo 安全门禁。

Severity: HIGH（发布门禁阻断；未发现应用测试、类型、E2E、formal 或构建失败）。

Handoff: 返回 Sol；未修改候选源码/index，未推送、SSH、部署或访问 CMS/数据库/正式站。

### XYY-20260909-01 — 发布候选依赖返工 Re-test

Task ID: XYY-20260909-01

Result: FAIL（格式与生产 audit 已修复通过，但 `verify:release` 的 E2E webServer 启动失败）。

Expected: 候选 `npm ci`、`format:check`、`npm audit --omit=dev`、指定 `npm ls` 与完整 `verify:release` 均 EXIT0，且 tree 不变。

Actual: candidate `/tmp/xyy-release-20260909-VEEy4m/candidate` 中 `npm ci` EXIT0（785 packages/3m）、`format:check` EXIT0、`npm audit --omit=dev` EXIT0（0 vulnerabilities）、`npm ls astro sharp js-yaml svgo --omit=dev --all` EXIT0（Astro 7.2.8、sharp 0.35.4、js-yaml 4.3.2、svgo 4.1.0）。`verify:release` EXIT1：其 `verify` 子流程 Astro 399 files/0 diagnostics、Vitest 58 files/444 tests、build 均通过；E2E webServer 因 `@astrojs/internal-helpers/path` 缺少 `stripRequestBase` export 启动失败，E2E/formal 未执行。

Reproduction: 在 candidate 依次执行上述合同命令；未执行依赖修复或其他写入。

Evidence: [release-gate-retest-summary.md](../output/xyy-release-20260909-01/release-gate-retest-summary.md)；末次 `git write-tree` 为 `039ac8c0fe314a49d1ba50699b7b18775f92814e`，`git diff --quiet` EXIT0。

Likely affected area: 发布候选的 `@astrojs/node` 与 `@astrojs/internal-helpers` 运行时依赖解析/锁定版本兼容性。

Severity: HIGH（E2E webServer 无法启动，发布门禁阻断）。

Handoff: 返回 Sol；未修改 candidate 源码/index，未推送、SSH、部署或访问 CMS/数据库/正式站。

### XYY-20260913-02 — 八项仓配视频入口独立浏览器验证

Task ID: XYY-20260913-02

Result: PASS（Luna 浏览器验证范围）

Tests performed:

- 独立 Playwright CLI 会话 `luna-xyy-20260913-02` 在本地 `127.0.0.1:4322/product` 完成 1440×900 桌面与 390×844 移动采样；会话已关闭。桌面实际 DOM 为 8 个视频区域、1 个 H1 + 7 个 H2、8 个唯一 source，`scrollWidth=clientWidth=1440`；移动端同样为 8 段、1 H1 + 7 H2，`scrollWidth=clientWidth=390`。
- 八段逐段采样确认标题/说明/链接均在视频边界内，视频填满段区域；固定 Header 与胶囊均以二维矩形相交检查，文字的 `top/bottom` 已按各自 slide.top 归一化，固定导航仍使用视口坐标，桌面/移动均无 Header 或胶囊遮挡。段间最大空隙为 0，copy/video 无背景遮罩、滤镜或文字阴影；说明 computed color 为纯白且 weight=600，链接 computed color 为 `rgb(232, 93, 38)`。
- 桌面首屏与第 8 屏截图在视频正常播放期间保存；初始计数为 `01 / 08`，连续点击下一段到 `08 / 08` 后下一段 disabled、上一段 enabled，再点击上一段回到 `07 / 08`。第 8 段实测 `paused=false`、`muted=true`、`controls=false`、`loop=true`、`autoplay=true`；补采的移动第八屏同样为 `08 / 08`、下一段 disabled、上一段 enabled，视频 `paused=false`、`muted=true`、`controls=false`、`loop=true`，点击上一段回到 `07 / 08`。
- 桌面依次滚入并点击 8 个入口，实际目的路径逐一等于 `/xiefu-yuncang`、`/tuihuo-zhijian`、`/houzheng-xiufu`、`/kuajing-yuncang`、`/huanan-xiefu-yuncang`、`/huadong-xiefu-yuncang`、`/zhibo-cangpei`、`/b2b-mendian-cangpei`。移动菜单打开后可见 7 个链接，仓配入口 href 为 `/product` 且带 active class；程序触发的 touch pointer + scroll 响应后计数推进到 `02 / 08`。两视口 console warning/error 与 pageerror 均为 0。

Regression coverage: 本轮覆盖 `/product` 八段 DOM/文字边界/遮罩/固定 Header 与胶囊避让、无横溢出与段间白隙、自动静音循环无 controls、桌面首尾按钮、8 个详情入口实际导航、390px 移动菜单与触摸推进；未修改应用实现或测试源码，未执行 E2E、ffprobe、hash、SSR 或 build/fullverify（由 Sol 另行安排）。

Evidence: [luna-browser-desktop-result.json](../output/playwright/xyy-20260913-02/luna-browser-desktop-result.json)、[luna-browser-mobile-result.json](../output/playwright/xyy-20260913-02/luna-browser-mobile-result.json)、[luna-mobile-eighth-result.json](../output/playwright/xyy-20260913-02/luna-mobile-eighth-result.json)、[luna-desktop-first-final.png](../output/playwright/xyy-20260913-02/luna-desktop-first-final.png)、[luna-desktop-last-final.png](../output/playwright/xyy-20260913-02/luna-desktop-last-final.png)、[luna-mobile-first-final.png](../output/playwright/xyy-20260913-02/luna-mobile-first-final.png)、[luna-mobile-eighth-final.png](../output/playwright/xyy-20260913-02/luna-mobile-eighth-final.png)。JSON 顶层均为 `{samples, diagnostics}` 对象。

Remaining risks: 当前证据仅覆盖本地 4322 开发预览与 Chromium 视口模拟；移动推进的 touch pointer + scroll 为页面内程序事件响应，真实 iOS/Android 手势尚未覆盖。指定 E2E、媒体 ffprobe/完整解码、1145 项保护 hash 与 SSR 初始回读不在本轮执行范围。

Handoff: 返回 Sol；未修改应用/测试源码、未提交推送部署、未操作 CMS/数据库/生产环境。

### XYY-20260910-02 — 核心服务九项入口与导航下拉移除

Task ID: XYY-20260910-02

Result: PASS

Tests performed:

- 按合同执行 `PLAYWRIGHT_PORT=4322 env -u CI npx playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts -g 'product page|product navigation'`：`10 passed`（17.5s）。
- 独立 headless 会话 `luna-product-nav2` 在 1440×900 与 390×844 实测九项标题、href 与 `src/data/navigation.ts` 原顺序完全一致；桌面 3×3、手机单列九项，needs 2×3、care 桌面 4×1/手机 2×2、process 桌面 3×2/手机 2×3，四占位、单 H1、无横向溢出且编辑区边框均为 0。完成态截图：[luna-core-1440-final.png](../output/playwright/xyy-20260910-02/luna-core-1440-final.png)、[luna-core-390-final.png](../output/playwright/xyy-20260910-02/luna-core-390-final.png)。
- 桌面导航无箭头、`aria-haspopup` 与 popover；手机展开仅 7 个主项，Escape 回焦菜单按钮，点击仓配服务关闭菜单并停留 `/product`；首末入口真实鼠标点击分别到 `/xiefu-yuncang` 与 `/b2b-mendian-cangpei`，证据见 [luna-click-details-final.json](../output/playwright/xyy-20260910-02/luna-click-details-final.json)。九详情 GET 均为 200、详情 H1 精确 DOM 计数均为 1，见 [luna-product-nav-result.json](../output/playwright/xyy-20260910-02/luna-product-nav-result.json)。
- Hero CTA 后 Tab 连续 10 项在两端均按九项服务 href 再到首个 needs 链接；每项 computed `opacity: 1`、`visibility: visible`、清晰 focus ring，见 [luna-tab-order.json](../output/playwright/xyy-20260910-02/luna-tab-order.json)。正常滚动等待动画完成后九项均可读且再次进入不重隐藏；`#service-process` 深链两端可见可读，`#foundation` 1440 端 top 369px、header bottom 62px，未被遮挡，见 [luna-deeplink.json](../output/playwright/xyy-20260910-02/luna-deeplink.json)、[luna-normal-complete.json](../output/playwright/xyy-20260910-02/luna-normal-complete.json)、[luna-foundation-anchor.json](../output/playwright/xyy-20260910-02/luna-foundation-anchor.json)。
- reduced-motion 与 no-JS 两端九项均可读、无隐藏项、无横溢；`protected.json` 617/617 SHA-256 一致。当前 SSR 的 `#product-care`、`#service-process`、`#assurance` 与 `before.html` 选定边界相同，见 [luna-ssr-boundary.json](../output/playwright/xyy-20260910-02/luna-ssr-boundary.json)。

Regression coverage: 覆盖本轮九入口数据、桌面/手机导航结构、网格与溢出、首末真实跳转、九详情可达性、键盘顺序与 focus、正常滚动、reduced-motion、no-JS 及服务区以下 SSR 边界；未运行无关套件、build 或 full verify。

Remaining risks: 仅在本地 4322 预览与指定 10 项 E2E 验证，未执行构建门禁或目标环境部署验证；旧初始动画截图及旧脚本的宽泛 `h1`/popover 子串计数未作为结论依据。

Handoff: 返回 Sol；仅补写本日志与 `output/playwright/xyy-20260910-02/` 证据，未修改应用源码、测试、依赖、CMS、数据库或外部环境。

### XYY-20260910-01 — 编辑区无框分组独立复测

Task ID: XYY-20260910-01

Result: PASS

Tests performed:

- 使用独立 headless Playwright CLI 会话 `luna-borderless`，仅在 1440×900 与 390×844 各检查一次 `/product`。两端 `series-list/series articles`、needs links、`care-list/articles`、process `ol/li` 的 computed 四边 `border-width` 全部为 `0px`，编辑区视觉分组未出现表格边线。
- 当前网格保持：1440 为核心服务 3×1、needs 2×3、care 4×1、process 3×2；390 为核心服务 1×3、needs 2×3、care 2×2、process 2×3。两端四个 `data-image-placeholder`、单一 H1、编辑区 0 个 `img`、编辑区 ID 唯一且无横向溢出；1440 流程右侧占位图 right 与 1360px 容器 right 对齐。
- `protected.json` 的 96 项源码 SHA-256 全部匹配。对照 borderless `baseline`，CSS 差异仅为约定的 border 声明与无效重置删除，padding、gap、字号、grid、尺寸保持。

Regression coverage: 本次限定覆盖 LOW 纯装饰增量的两份 editorial CSS、1440/390 分组边框与当前网格、四占位、H1、编辑区图片及横向溢出；未重跑单测、E2E、typecheck、build、全量 verify、服务路由或外部写入，按本次合同排除项执行。

Evidence: [luna-borderless-result.json](../output/playwright/xyy-20260910-01-borderless/luna-borderless-result.json)、[css-diff.txt](../output/playwright/xyy-20260910-01-borderless/css-diff.txt)、[luna-1440.png](../output/playwright/xyy-20260910-01-borderless/luna-1440.png)、[luna-390.png](../output/playwright/xyy-20260910-01-borderless/luna-390.png)。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 开发预览；保留的 `#assurance` 及其后区域不在本次 LOW 增量范围内，未重复验证。无本次页面 FAIL 或环境阻塞。

Handoff: 返回 Sol；未修改应用实现、既有测试、依赖、配置、CMS、数据库或外部环境。

### XYY-20260910-01 — 编辑区统一滚动动效独立验证

Task ID: XYY-20260910-01

Result: FAIL

Expected: `/product` 编辑区新动效在 1440×900 与 390×844 正常模式下按滚动进入可见，reduced-motion 与无 JS 下所有新区域保持可见；从 Hero 继续键盘 Tab 时服务与 needs 链接应保持可到达，深链接 `#service-process` 与重复进出不应留下永久隐藏内容。

Actual: 当前版本发现键盘可访问性阻断：正常页面 Hero 动效完成后，将焦点置于 Hero 咨询链接并继续 Tab，`#foundation` 仍为 `visibility:hidden` / `opacity:0`，焦点直接跳到 Footer logo，服务与 needs 链接被键盘顺序跳过。该 FAIL 发生在本轮新编辑区动效初始化与 Tab 顺序交界处；不得以滚动后动画可见替代键盘可达性。

Reproduction:

1. 在当前冻结版本以独立浏览器打开 `http://127.0.0.1:4322/product`，视口 1440×900 或 390×844，等待 Hero 动效完成。
2. 将焦点置于 Hero 的 `/contact` 咨询链接，按一次 `Tab`。
3. 观察焦点跳过仍处于 `visibility:hidden` / `opacity:0` 的 `#foundation` 及其后服务/needs 链接，落到 Footer logo。

Evidence: Sol 独立键盘回归已记录上述当前版本 FAIL；本次 Luna 动效行为证据 [luna-motion-result.json](../output/playwright/xyy-20260910-01-motion/luna-motion-result.json) 与 [luna-process-1440-middle.png](../output/playwright/xyy-20260910-01-motion/luna-process-1440-middle.png)、[luna-process-1440-end.png](../output/playwright/xyy-20260910-01-motion/luna-process-1440-end.png)、[luna-process-390-middle.png](../output/playwright/xyy-20260910-01-motion/luna-process-390-middle.png)、[luna-process-390-end.png](../output/playwright/xyy-20260910-01-motion/luna-process-390-end.png)；CSS/组件/脚本基线与 `protected.json` 位于同一目录。

Likely affected area: `src/scripts/product-page.ts` 的编辑区 `data-reveal="copy"` 目标初始化调用 `revealCopyOnScroll`，其 `autoAlpha: 0` 同时设置 `visibility:hidden`，使尚未滚入视口的编辑区链接从键盘 Tab 顺序消失。

Severity: MEDIUM（编辑区可视滚动动效可运行，但正常键盘用户无法连续到达首个服务分组及后续新链接；需返工后再进行本 Task 独立复测）。

Handoff: 返回 Sol；已停止当前版本后续扩大验证，未修改应用实现、测试、依赖、配置、CMS、数据库或外部环境。

### XYY-20260910-01 — 编辑区动效键盘可访问性返工独立复测

Task ID: XYY-20260910-01

Result: PASS

Tests performed:

- 使用独立 headless Playwright CLI 会话 `luna-motion-retest`，仅在 1440×900 与 390×844 验证正常、reduced-motion、无 JS 三种模式。正常模式初态的实际动画目标保持 `opacity: 0` 但 `visibility: visible`；滚动到流程区后记录中间态 opacity 0.4689/0.4598、可见且仍有 transform/blur，结束态三类目标均 opacity 1、visibility visible、无残留 inline style。深链接 `#service-process` 两端结束态可见，重复回到顶部再进入不重新隐藏。
- 正常模式从 Hero `/contact` CTA 连续按 Tab，1440/390 均依次到达 `/xiefu-yuncang`、`/tuihuo-zhijian`、`/houzheng-xiufu` 和首个 needs `/xiefu-yuncang`；每个目标 opacity/visibility 为 1，绿色 3px focus ring 可见。
- reduced-motion 两端所有新 reveal 目标均无 opacity 0 或 visibility hidden；无 JS 两端 `#service-process` 深链接保持 10 个编辑区链接可用，所有新目标无隐藏状态。正常/reduced/no-JS 结果均 `scrollWidth === clientWidth`；390 的 `#foundation` 深链接 targetTop=111.94px，高于导航 bottom=62px，最终可读。
- 4 个空占位与单一 H1 在正常/reduced/no-JS 路径保持；fresh SSR 选定 Header、`#assurance`、CTA 边界（去除运行时 style）与 `before.html` 相同。`protected.json` 92 项源码 SHA-256 全部匹配。

Regression coverage: 覆盖本次 editorial.css focus visibility 修复、正常滚动初态/中间态/结束态、Hero CTA 键盘顺序、深链接与重复进入、1440/390 reduced-motion、无 JS、占位/H1/溢出及底部 SSR 边界；未重复 motion suite、typecheck、build、verify、无关路由或外部写入。

Evidence: [luna-motion-retest-result.json](../output/playwright/xyy-20260910-01-motion/luna-motion-retest-result.json)、[luna-foundation-anchor.json](../output/playwright/xyy-20260910-01-motion/luna-foundation-anchor.json)、[luna-retest-process-1440-middle.png](../output/playwright/xyy-20260910-01-motion/luna-retest-process-1440-middle.png)、[luna-retest-process-1440-end.png](../output/playwright/xyy-20260910-01-motion/luna-retest-process-1440-end.png)、[luna-retest-process-390-middle.png](../output/playwright/xyy-20260910-01-motion/luna-retest-process-390-middle.png)、[luna-retest-process-390-end.png](../output/playwright/xyy-20260910-01-motion/luna-retest-process-390-end.png)。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 开发预览，未覆盖构建产物或部署环境；本次保留共享 helper、底部 assurance/CTA 及其他页面边界，未扩大检查。

Handoff: 返回 Sol；未修改应用实现、测试、依赖、配置、CMS、数据库或外部环境。

### XYY-20260910-01 — 编辑区布局独立复测

Task ID: XYY-20260910-01

Result: PASS

Tests performed:

- 使用独立 Playwright CLI 会话 `luna-layout-review` 在 `http://127.0.0.1:4322/product` 实测 1366、1440、1846、360、390、768、1024 七个视口；七端 `scrollWidth === clientWidth`，无横向溢出。桌面编辑区高度为 2908.83–2990.86px（1440 为 2969.14px），按内容自然布局；Hero 四个标题 span 各为单一 client rect，无额外折行。
- 几何矩阵通过：桌面服务卡为 3 列、业务问题为图左/右侧 2×3、商品处理为图文加 4 类、流程为左侧 3×2 加右图且右图 right 与容器一致；360/390 的业务问题为 2×3、商品处理为 2×2、流程为 2×3，分隔线与容器边界连续。四个 `data-image-placeholder` 均存在且无编辑区 `img`，页面仅 1 个 H1、无编辑区 tab/button，五个新 ID 均唯一。
- 390×844 与 1440×900 直接访问 `#foundation`、`#product-care`、`#service-process` 后，目标 top 为 111.52–112.45px，固定导航 bottom 为 62/70px，computed `scroll-margin-top` 为 112px，目标可见；六张锚点截图与 1440/390/768 整页截图已保存。
- 键盘 Tab 在 390/1440 均落到编辑区 `/contact` 链接，绿色 3px focus outline 可见；本次页面监听 console warning/error 与 pageerror 均为 0。`/xiefu-yuncang`、`/tuihuo-zhijian`、`/houzheng-xiufu`、`/contact` GET 均 HTTP 200。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts --grep 'product page' --workers=2`：6 passed；`npx vitest run tests/unit/image-cache-contract.test.ts`：1 file / 8 tests passed。
- `protected-resume.json` 的 86 项源码 SHA-256 全部匹配，`unchanged.sha256` 的 data/两份测试 hash 全部 OK；fresh SSR 的 Header、`#assurance`、Conversion CTA 选定 DOM（去除运行时 reveal style）与 `resume-before.html` 相同。

Regression coverage: 覆盖本轮四个新 editorial CSS、四组件及 `/product` 新 import 的七视口自然高度、统一容器、标题折行、四占位、服务/问题/商品/流程网格、移动端分隔线、锚点偏移、键盘焦点、console、服务与咨询路由；同时回归 assurance/CTA DOM 保留、编辑区无图片及既有定向 E2E/unit。未提交表单，未访问或写入 CMS/数据库/生产环境，未运行 build、`npm run verify` 或无关全量套件（按本轮合同限制）。

Evidence: [luna-layout-matrix.json](../output/playwright/xyy-20260910-01-layout/luna-layout-matrix.json)、[luna-bounds.json](../output/playwright/xyy-20260910-01-layout/luna-bounds.json)、[luna-anchors.json](../output/playwright/xyy-20260910-01-layout/luna-anchors.json)、[luna-focus-console.json](../output/playwright/xyy-20260910-01-layout/luna-focus-console.json)、[luna-1440.png](../output/playwright/xyy-20260910-01-layout/luna-1440.png)、[luna-390.png](../output/playwright/xyy-20260910-01-layout/luna-390.png)、[luna-768.png](../output/playwright/xyy-20260910-01-layout/luna-768.png) 及六张锚点截图。

Remaining risks: 仅验证本地 4322 开发预览，未覆盖构建产物或部署环境；截图与矩阵证据位于 [xyy-20260910-01-layout](../output/playwright/xyy-20260910-01-layout/)，本轮无页面 FAIL 或环境阻塞。

Handoff: 返回 Sol；未修改应用实现、既有测试、依赖、配置、CMS、数据库或外部环境。

### XYY-20260910-01 — 分屏尺寸精修独立复测

Task ID: XYY-20260910-01

Result: PASS

Tests performed:

- 对照 `/tmp/xyy-20260910-01-sizing/` 三份 CSS 基线，实际差异仅为本轮约定的 Hero 字号、桌面五段 55rem flex 居中尺寸，以及 1024/760 响应式容器规则；`content.sha256` 与原 `protected.sha256` 均全通过。
- `document.fonts.ready` 后在 1366/1440/1846 测量：五个编辑段高度均 `880px`，`#assurance` 为 `880.64px`，最大差值 `0.64px`；各编辑容器与 `#assurance .warehouse-shell` 的 left/width 完全一致（1366: `40/1271`，1440: `40/1345`，1846: `235.5/1360`）。三端 `scrollWidth=clientWidth`，无越界/裁切；Hero 四个 span 均 `getClientRects().length=1`。
- 360/390/768/1024 测量确认各段 computed `min-height=0px`，高度按内容自然流式；四端 `scrollWidth=clientWidth`，无越界/裁切。390 与 1440 代表截图已保存。

Regression coverage: 本轮仅覆盖尺寸精修涉及的七个视口、五段分屏高度、assurance 尺寸/容器对齐、Hero 四行单行渲染、移动端自然高度、溢出/裁切及前轮锚点修复后的关键布局；assurance/CTA 与受保护源保持不变。未重复 unit/E2E/typecheck/build，未执行外部写入。

Evidence: [luna-size-matrix.txt](../output/playwright/xyy-20260910-01-sizing/luna-size-matrix.txt)、[luna-1440.png](../output/playwright/xyy-20260910-01-sizing/luna-1440.png)、[luna-390.png](../output/playwright/xyy-20260910-01-sizing/luna-390.png)。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 开发预览，未运行构建或部署环境验证；本轮未扩展无关路由审计。

Handoff: 返回 Sol；独立浏览器会话 `xyy-product-luna` 已关闭，未修改实现、测试、依赖、配置、CMS、数据库或外部环境。

### XYY-20260910-01 — 仓配服务编辑式首屏独立验证

Task ID: XYY-20260910-01

Result: FAIL

Expected: `/product` 上半页按 Hero → 三类核心服务 → 六类业务问题 → 四类商品处理 → 六步交付顺序呈现；关键新区域 hash 锚点进入视口时不被固定导航遮挡；四个空白图片区、单一 H1、无编辑区图片、链接可用、键盘 focus 可见，并在 360/390/430/1366/1440 视口无横向溢出。`#assurance` 及后续内容、顶部导航保持基线一致。

Actual: 五段顺序、四占位、单 H1、编辑区 0 个 `img`、无重复 ID、0 个 role=tab/编辑区按钮、五视口横向溢出检查均通过；编辑区四个直达链接及 `/contact` 均返回 HTTP 200，目录链接 focus outline 为绿色 3px 且可见，控制台 Error 为 0。直接访问 `#foundation`、`#returns`、`#service-directory`、`#product-care`、`#service-process` 并等待平滑滚动完成后，目标 top 约 `0px`，固定导航底部为 `62px`，目标被导航覆盖；这些新 ID 的 computed `scroll-margin-top` 为 `0px`。原有 `#assurance` 仍为 `112px` 偏移并未复现遮挡。

Reproduction:

1. 使用独立 Playwright 会话 `xyy-product-luna` 打开 `http://127.0.0.1:4322/product`，在 390×844 依次访问上述 hash，等待 1.6 秒。
2. `page.evaluate` 记录目标与 `.site-header` 的 bounding rect：例如 `#foundation targetTop=0.39, headerBottom=62, scrollMargin=0px`；`#service-directory targetTop=0.34`；`#product-care` / `#service-process` 目标 top 约 `0`。
3. 查看锚点截图确认 `#foundation` 页面顶部的 `01/基础仓配` 位于固定导航下方并被遮住。

Evidence:

- [luna-anchor-foundation-390.png](../output/playwright/xyy-20260910-01/luna-anchor-foundation-390.png)；[luna-anchor-service-directory-390.png](../output/playwright/xyy-20260910-01/luna-anchor-service-directory-390.png)；[luna-anchor-assurance-390.png](../output/playwright/xyy-20260910-01/luna-anchor-assurance-390.png)。
- [luna-desktop-1366.png](../output/playwright/xyy-20260910-01/luna-desktop-1366.png)、[luna-desktop-1440.png](../output/playwright/xyy-20260910-01/luna-desktop-1440.png)、[luna-mobile-360.png](../output/playwright/xyy-20260910-01/luna-mobile-360.png)、[luna-mobile-390.png](../output/playwright/xyy-20260910-01/luna-mobile-390.png)、[luna-mobile-430.png](../output/playwright/xyy-20260910-01/luna-mobile-430.png)。
- `npx vitest run tests/unit/image-cache-contract.test.ts`: 1 file / 8 tests PASS；`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts -g 'product|motion'`: 12 passed；`sha256sum -c /tmp/xyy-20260910-01/protected.sha256`: 全部 OK；Playwright `console error`: 0 errors / 0 warnings。

Likely affected area: `src/styles/product/editorial*.css` 未为新 `#foundation`、`#returns`、`#service-directory`、`#product-care`、`#service-process` 锚点提供固定导航所需的 `scroll-margin-top`（原旧类名规则未覆盖新 ID）。

Severity: MEDIUM（直接 hash 导航的关键标题/内容会被固定导航遮挡；正常从页面顶部滚动的主流程未受影响）。

Handoff: 返回 Sol；未修改实现、测试、依赖、配置、CMS、数据库或外部环境。

### XYY-20260910-01 — 锚点偏移返工独立复测

Task ID: XYY-20260910-01

Result: PASS

Tests performed:

- 复核 Terra 返工交接：仅在 `src/styles/product/editorial-sections.css` 增加 `.product-editorial [id] { scroll-margin-top: 7rem; }`；本次未发现组件、文案、测试、原 product CSS 或全局样式的返工变更。
- 使用独立 Playwright 会话 `xyy-product-luna`，在 390×844 与 1440×900 直接访问 `#foundation`、`#returns`、`#service-series`、`#service-directory`、`#product-care`、`#service-process`。12 个锚点均 computed `scroll-margin-top=112px`，目标 top 约 111.6–112.5px；导航 bottom 为移动 62px、桌面 70px，均未覆盖目标且可见。
- 保障节仍唯一存在，`/product` 页面保留 CTA；五段编辑区顺序保持 Hero → 服务 → 问题 → 商品处理 → 交付。前轮已验证的 360/390/430/1366/1440 溢出、四占位、单 H1、无编辑区图片、链接 HTTP 200、键盘 focus 与定向测试继续有效。
- 返工后 Playwright `console error` 返回 0 errors / 0 warnings；`sha256sum -c /tmp/xyy-20260910-01/protected.sha256` 全部 OK。

Regression coverage: 本次覆盖返工涉及的六个新 hash 锚点双端直接进入与固定导航遮挡回归，并复核 assurance/CTA 保留；沿用同 Task 前轮 `image-cache` 1 file / 8 tests、`home-product` 12 passed、五视口布局、链接与 focus 证据。未运行无关全量套件、build、部署、CMS 或数据库操作。

Evidence: [luna-retest-foundation-390.png](../output/playwright/xyy-20260910-01/luna-retest-foundation-390.png)、[luna-retest-service-process-1440.png](../output/playwright/xyy-20260910-01/luna-retest-service-process-1440.png)；六锚点双端矩形与 computed style 为本次 Playwright run-code 原始结果。

Remaining risks: 本地 4322 开发预览验证通过；未执行 build 或目标环境部署验证，页面仍需由 Sol 按既定本地验收流程决定最终关闭。

Handoff: 返回 Sol；独立浏览器会话 `xyy-product-luna` 已关闭，未修改实现、测试、依赖、配置、CMS、数据库或外部环境。

### XYY-20260909-01 — staging 发布后独立只读 QA

Task ID: XYY-20260909-01

Result: PASS

Tests performed:

- staging HTTP QA 实际 EXIT0：14/14 期 HTML GET 通过（raw article 与本地 baseline、title/description、staging canonical、H1、TOC/PDF/返回入口、章节提示及通用历史声明断言）；14/14 PDF HEAD 返回 200、`application/pdf`、Content-Length 与本地匹配。Sol 独立证据另完成当前 Release 14/14 PDF SHA256 精确一致。
- 旧/无效路由 5/5 通过 Node `fetch(..., { redirect: 'manual' })`：无斜杠与 legacy 301/Location 正确，014/15 为 404；landing HTML CTA 15 个；`/version` 200 对应 gitSha `63deee1dfdd5c9a88e229e52f7f1e0d292de1581`、Release `20260909T112839Z-63deee1`、staging；`/healthz` 200 且 `cmsContent`/`contactStorage` 均 ok。
- 单一命名 headless Playwright session `luna-release-20260909-01`、单 page 串行执行 14→1 × `1440×900`/`390×844`，实际 EXIT0，28/28 视口通过：76/76 正文图解码、source JSON 计数匹配、figure/img 中心偏差最大 0px、无横向溢出；28/28 article 非 viewer、单 H1、来源日期、TOC target、Header/Footer、每期 2 个 PDF 与返回入口均通过；章节 review-note/#page/历史通用文案均为 0；3/4/5 各两视口保留且仅一个精确 partial notice，其余各 0；console/page errors、非 GET/HEAD 请求、跨源请求均 0。
- 已保存 14 期桌面/手机代表顶部截图；关闭了自建 Playwright session，未操作用户 Chrome。

Regression coverage: 仅本次 staging 发布后白皮书 14 期顶部/DOM/图像布局、发布元数据、入口路由、版本/健康与 PDF 可用性/完整性；未提交表单、未写 CMS/数据库、未执行生产操作或全站无关回归。

Evidence: [staging-http-qa.json](../output/xyy-release-20260909-01/staging-http-qa.json)、[playwright-ui-run.txt](../output/playwright/xyy-release-20260909-01/playwright-ui-run.txt)、[remote-pdf-sha256.json](../output/xyy-release-20260909-01/remote-pdf-sha256.json)、[issue14-desktop-top.png](../output/playwright/xyy-release-20260909-01/issue14-desktop-top.png)、[issue14-mobile-top.png](../output/playwright/xyy-release-20260909-01/issue14-mobile-top.png)。脚本位于同一 QA evidence 目录。

Remaining risks: 本轮未逐字复审 PDF、未滚动全书逐图做视觉截图；HTTP PDF hash 由 Sol 独立 SSH 只读证据闭合，Luna 本轮执行全 14 HEAD 大小/MIME 检查并保留已完成的代表性 full GET/hash 过程。

Handoff: 返回 Sol；未修改应用源码、测试、JSON、图片或 PDF，未推送/SSH 写入、CMS/数据库写入或生产操作。

### XYY-20260909-01 — 发布候选环境修复后 Re-test 3

Task ID: XYY-20260909-01

Result: PASS（当前 `58081a6103af3da2599a9e1f53003be00293a036` tree；native 依赖为 Sol 事后 hash 校验的环境修复）。

Tests performed:

- 当前 fresh-install candidate 的 `npm ci --prefer-offline` EXIT0；Sol 仅恢复上游已校验的 `cn-font-split` native 库，Luna 只读 hash 为 `db4690e3b9c4b04f6dfa5965792585c389914038f6a4c90fbe73baaf16bbf19c`，未改源码、lockfile、测试或 index。
- `format:check` EXIT0；`npm audit --omit=dev` EXIT0（0 vulnerabilities）；指定 `npm ls astro @astrojs/node @astrojs/internal-helpers sharp js-yaml svgo --omit=dev --all` EXIT0（Astro 7.2.8、adapter 11.1.4、helpers 0.10.4、sharp 0.35.4、js-yaml 4.3.2、svgo 4.1.0）。
- `CI=1 ... npm run verify:release` 实际 EXIT0：Astro 399 files/0 diagnostics、lint、维护性 558 files、assets 56 referenced + 103 deployment assets across 385 files、Vitest 58 files/444 tests、verify build 均通过；E2E 单 worker 39 passed/7 skipped；formal 4 passed；最终 build complete。

Regression coverage: 完整发布前 verify、单 worker E2E、formal、最终 build、格式/生产依赖 audit 与锁定版本核对；未执行 push、SSH、部署、CMS/数据库、生产写入或用户浏览器操作。

Evidence: [release-gate-retest-3-summary.md](../output/xyy-release-20260909-01/release-gate-retest-3-summary.md)；末次 `git write-tree` 为 `58081a6103af3da2599a9e1f53003be00293a036`，工作树相对 index clean。

Remaining risks: 该 PASS 依赖 fresh install 后的 hash 校验 native 库环境修复，不等同于上游 npm 包裸安装自动具备该库；发布后 staging 页面/版本/健康仍需按 Sol 的后续只读 QA 指令验证。未修改候选源码/index。

Handoff: 返回 Sol；当前候选完整发布前 gate PASS，可进入 Nova/Sol 发布闸门。

### XYY-20260909-01 — 发布候选依赖返工 Re-test 2

Task ID: XYY-20260909-01

Result: FAIL（格式与生产 audit/依赖版本均通过，但 fresh `npm ci --prefer-offline` 后 `verify:release` 在字体 native 依赖阶段失败）。

Expected: 候选 `npm ci`、格式检查、生产 audit、依赖核对与完整 `verify:release` 均 EXIT0，tree 不变。

Actual: candidate `/tmp/xyy-release-20260909-VEEy4m/candidate` 中 `npm ci --prefer-offline` EXIT0（783 packages/2m）、`format:check` EXIT0、`npm audit --omit=dev` EXIT0（0 vulnerabilities）、`npm ls astro @astrojs/node @astrojs/internal-helpers sharp js-yaml svgo --omit=dev --all` EXIT0（Astro 7.2.8、adapter 11.1.4、helpers 0.10.4、sharp 0.35.4、js-yaml 4.3.2、svgo 4.1.0）。`verify:release` EXIT1：Astro check 399 files/0 diagnostics、lint、维护性 558 files 均通过；`prepare:fonts` 因 `cn-font-split` 缺少 `node_modules/cn-font-split/dist/libffi-x86_64-unknown-linux-gnu.so` 报 `ERR_FFI`，assets、Vitest、E2E、formal、最终 build 未执行。

Reproduction: 在 candidate 依次执行上述合同命令；未执行补装、修复或其他写入。

Evidence: [release-gate-retest-2-summary.md](../output/xyy-release-20260909-01/release-gate-retest-2-summary.md)；末次 `git write-tree` 为 `58081a6103af3da2599a9e1f53003be00293a036`，`git diff --quiet` EXIT0。

Likely affected area: fresh npm install 后 `cn-font-split` 的平台 native shared library 打包/可用性。

Severity: HIGH（发布门禁阻断，不能以此前非同一安装状态的 E2E/formal PASS 替代）。

Handoff: 返回 Sol；未修改 candidate 源码/index，未推送、SSH、部署或访问 CMS/数据库/正式站。

### XYY-20260913-03 — 第九区静态能力与保障独立验证

Task ID: XYY-20260913-03

Result: PASS

Tests performed:

- 实际执行 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts --grep 'product page|product video navigation' --workers=2`：8 项全部通过（Chromium 4、mobile 4，26.4s）。
- 独立 Playwright CLI 在 1440×900、1849×907、1024×768、390×844、360×844 检查 9 个分区、8 个视频、静态保障区 0 个 video、4 个指标值、5 个机制 SVG/原文、无水平溢出；HTML 与指定序列滚动宽度差均为 0，各尺寸序列内无额外可滚动元素。
- 1440×900 正常平滑滚动实测 `01 / 09 → 02 / 09`（offset 900）→ `08 / 09`（6300）→ `09 / 09`（7200，下一段 disabled）→ `08 / 09`（6300，下一段恢复）；390×844 直接到底为 `09 / 09`、下一段 disabled，最后机制项完全位于视口内。静态区标题、99.99%+、18:00、24:00前、全流程及五项机制均可达。
- 8 个视频逐一确认 `autoplay`、`loop`、`muted` 属性与 muted property、`playsinline`、`preload=auto`，均无 `controls`；静态区无视频。页面初始 SSR 胶囊为 `01 / 09`，`#assurance` 存在、未设置 `hidden` 且 computed display 为 `block`。
- assurance 顶部对当前可见文本执行 `.site-header` 与分区固定导航二维矩形相交检查，1440×900 与 390×844 均无相交；指标值/对应说明、机制图标/对应文字均在各自列且不相交。移动菜单 390×844 可打开，7 个链接可见，clientWidth 与 scrollWidth 均为 390。
- 已保存桌面第九区完整视口图、手机顶部/静态顶部/底部图；1146 项保护 SHA-256 最终核验 0 mismatch。

Regression coverage: 覆盖本次第九静态区与既有八视频回归、分区导航 01/09 与 08↔09、末尾禁用/回退、静态内容可达、视频媒体契约、减少动效既有 E2E、桌面/移动菜单、1440/1849/1024/390/360 溢出与几何、SSR 未隐藏证据及 1146 项保护 hash。未运行 build/fullverify/unit 或无关测试，未执行 CMS、数据库、部署、生产或外部写入。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-03/luna-result.json)、[luna-hash-check.txt](../output/playwright/xyy-20260913-03/luna-hash-check.txt)、[luna-desktop-assurance-1440x900.png](../output/playwright/xyy-20260913-03/luna-desktop-assurance-1440x900.png)、[luna-mobile-top-390x844.png](../output/playwright/xyy-20260913-03/luna-mobile-top-390x844.png)、[luna-mobile-assurance-top-390x844.png](../output/playwright/xyy-20260913-03/luna-mobile-assurance-top-390x844.png)、[luna-mobile-bottom-390x844.png](../output/playwright/xyy-20260913-03/luna-mobile-bottom-390x844.png)。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 开发预览，未覆盖构建产物或部署环境；按合同未运行 `npm run verify`、build、无关单测或全量回归。无本次实现 FAIL 或环境阻塞。

Handoff: 返回 Sol；未修改应用实现、测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260913-07 — 八服务详情页独立 QA

Task ID: XYY-20260913-07

Result: PASS（返工后必需 Chromium E2E 门禁通过）

Expected: 合同指定的 `service-pages` 与 `service-motion` E2E 全部完成且无失败。

Actual: 初轮完整项目统计为 3 passed / 2 failed / 1 skipped；两个失败均为 `Test timeout of 30000ms exceeded`，对应 `shared service landing layout...` 与 `all service dropdown pages...`。Terra 仅将这两个多路由测试累计预算调整为 60 秒后，按合同复测 Chromium 2 passed（44.3s）、0 failed、0 skipped；应用未修改。初轮上下文见 `test-results/service-pages-shared-servi-1d181-enders-every-visual-variant-chromium/error-context.md` 和 `test-results/service-motion-all-service-0b3fe-e-same-prompt-scroll-reveal-chromium/error-context.md`。

Reproduction / retest: 初轮命令为 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-pages.spec.ts tests/e2e/service-motion.spec.ts --grep 'shared service landing|all service dropdown|service motion remains' --workers=2`；复测命令为 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-pages.spec.ts tests/e2e/service-motion.spec.ts --grep 'shared service landing|all service dropdown' --project=chromium --workers=2`。

Evidence / Tests performed:

- 独立 Playwright CLI 在 8 个 editorial 路由的 1440×900、390×844 检查通过：HTTP 200、1 H1、Hero 文案、各自 editorial variant、原 src/poster、视频 autoplay/loop/muted/playsinline/无 controls 且真实播放；signature、detail、features、FAQ、CTA 存在。
- 每页滚动查看特色要点并滚到底确认 FAQ/CTA 可达；特色文字非空、特色卡片无相交，页面横向溢出为 0。Hero 文案/视频及 `.site-header` 无相交。已保存各页 Hero/特色截图。
- 1024×768 鞋服与 360×844 B2B 稳态抽检通过；移动菜单开关（7 links）、reduced-motion、真实 noJS（H1/特色/FAQ/CTA 可读）通过。广州、云道 editorial=0；`/product` 保持 9 sections/8 videos。
- Directus 单测实际 `npx vitest run tests/unit/directus-content.test.ts tests/unit/directus-content-resilience.test.ts`：2 files / 6 tests passed。
- 复测原始 stdout 与 Playwright last-run 已保存：2 passed、0 failed、0 skipped；初轮 3 passed / 2 failed / 1 skipped 按统计纠正，skip 未计入通过。
- `current-content.json` 对 baseline 的 8 路由、11 类字段共 88 项比较为 0 mismatch；1125 项保护 hash 为 0 mismatch。Terra 已记录 Prettier/scoped ESLint/typecheck 409 files zero diagnostics/diff PASS。

Likely affected area: 初轮两项多路由 E2E 的 30 秒累计测试预算；60 秒测试预算复测通过，独立浏览器检查未复现页面结构、播放、内容或布局故障。

Severity: MEDIUM（初轮门禁因测试预算失败；测试范围内已由局部预算调整闭合，未发现应用缺陷）。

Regression coverage: 覆盖 8 editorial 路由 × 2 视口、Hero/视频/特色/FAQ/CTA、真实滚动、溢出与遮挡、1024/360 长标题、经典分支、`/product`、mobile menu、reduced-motion、noJS、CMS 内容语义对照与保护 hash。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-07/luna-result.json)、[luna-test-summary.txt](../output/playwright/xyy-20260913-07/luna-test-summary.txt)、[luna-e2e-retest.stdout.txt](../output/playwright/xyy-20260913-07/luna-e2e-retest.stdout.txt)、[luna-e2e-retest.last-run.json](../output/playwright/xyy-20260913-07/luna-e2e-retest.last-run.json)、[xiefu desktop Hero](../output/playwright/xyy-20260913-07/luna-xiefu-yuncang-desktop-hero.png)、[xiefu mobile features](../output/playwright/xyy-20260913-07/luna-xiefu-yuncang-mobile-features.png)、[B2B steady mobile Hero](../output/playwright/xyy-20260913-07/luna-b2b-mendian-cangpei-mobile-hero-steady-360x844.png)、[representative unique screenshots](../output/playwright/xyy-20260913-07/luna-xiefu-yuncang-desktop-unique.png)。

Remaining risks: 初轮 30 秒累计预算问题已由 Terra 的局部 60 秒测试预算调整闭合；Luna 未修改测试或应用。验证仅限本地 `127.0.0.1:4322`，未运行 build/fullverify、提交、部署、CMS 或数据库操作。

Handoff: 返回 Sol；本次复测 PASS，Nova 门禁可继续只读复核。

### XYY-20260913-06 — 视频文案 text-shadow 独立验证

Task ID: XYY-20260913-06

Result: PASS

Tests performed:

- 独立 Playwright CLI 批量检查本地 `/product` 的 1440×900 与 390×844 首屏。9 个分区、8 个视频、静态 assurance 区 0 个 video；初始状态均为 `01 / 09`，滚动容器 `scrollTop=0`。
- 8 个文案块内共 48 个 h1/h2、p、li、a 的 computed `text-shadow` 均为 `rgba(0, 0, 0, 0.45) 0px 2px 6px`；白字为 `rgb(255, 255, 255)`，CTA 为 `rgb(232, 93, 38)`。静态 `#assurance` 文本 shadow 均为 `none`。
- 两端 `.product-video-sequence__copy` 背景均为透明、copy/video filter 均为 `none`；HTML、body、序列横向溢出均为 0，序列内只有 1 个滚动层，当前可见文案与 `.site-header`/分区导航均无二维矩形相交。两张首屏截图已保存。
- 对 task baseline 源文件核对仅增加合同指定单条 CSS 声明；1136 项保护 SHA-256 核验 `0 mismatch`。

Regression coverage: 覆盖本次 CSS 阴影继承至 8 屏文案元素、白字/橙 CTA、静态 assurance 隔离、背景/滤镜、首屏两端溢出与固定导航遮挡；按合同未运行 E2E、typecheck、unit、build 或 fullverify。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-06/luna-result.json)、[luna-dom-check.txt](../output/playwright/xyy-20260913-06/luna-dom-check.txt)、[luna-hash-check.txt](../output/playwright/xyy-20260913-06/luna-hash-check.txt)、[luna-desktop-first-1440x900.png](../output/playwright/xyy-20260913-06/luna-desktop-first-1440x900.png)、[luna-mobile-first-390x844.png](../output/playwright/xyy-20260913-06/luna-mobile-first-390x844.png)。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 开发预览，未覆盖构建产物或部署环境；Terra 已完成局部 prettier/diff 检查。本次实现无 FAIL 或环境阻塞。

Handoff: 返回 Sol；未修改应用实现、测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260913-05 — 移动标题语义分行返工独立复测

Task ID: XYY-20260913-05

Result: PASS

Tests performed:

- 仅复测 390×844 与 360×640 八个视频屏。八个标题均为相邻 prefix/value 两个 span，prefix 保留首个中文逗号、≤600px 为 block 且 `white-space: nowrap`；批准标题完整，尤其 `鞋服云仓，`、`B2B门店仓配，` 与最长的 `直播电商仓配，` 均未拆分。value 按空间自然换行。
- 每屏正文、3 个要点与橙色 CTA 均完整位于 video/slide 和 viewport 内；固定 header/胶囊二维矩形无相交，HTML/序列横向溢出为 0，序列内无额外滚动层。8 个视频仍 autoplay/loop/muted/无 controls。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts --grep 'presents eight muted videos' --project=chromium --project=mobile --workers=2`：2 passed（Chromium/mobile）。
- 1133 项保护 SHA-256 最终核验 0 mismatch；保存返工后两张截图。

Regression coverage: 仅覆盖指定 390/360 标题分行返工、八屏文案/要点/CTA 屏内可见、导航遮挡、视频属性及指定 `home-product` Chromium/mobile 直接测试；保留本轮原 8/8 E2E 与全四视口矩阵证据，未重复 motion、全矩阵、unit、build 或 fullverify。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-05/luna-result.json)、[luna-retest-hash-check.txt](../output/playwright/xyy-20260913-05/luna-retest-hash-check.txt)、[luna-retest-mobile-first-390x844.png](../output/playwright/xyy-20260913-05/luna-retest-mobile-first-390x844.png)、[luna-retest-mobile-eighth-360x640.png](../output/playwright/xyy-20260913-05/luna-retest-mobile-eighth-360x640.png)。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 开发预览，未覆盖构建产物/部署环境；Terra 已完成局部格式、ESLint、diff 与 SSR 文本拼接检查。本次返工项无剩余 FAIL 或环境阻塞。

Handoff: 返回 Sol；未修改应用实现、测试、媒体、依赖、配置、CMS、数据库或外部环境。

#### XYY-20260913-05 — 移动端标题视觉复测待返工

Task ID: XYY-20260913-05

Result: RETEST_REQUIRED（已由后续返工复测 PASS 关闭；保留为历史问题记录）

Expected: 390×844 首屏与 360×640 第 8 屏的批准标题按语义自然分行，标题保持可读且不产生生硬的词内断行。

Actual: Sol 复核本轮稳定截图发现 390 首屏“鞋服云仓，让多 / 渠道共用一盘货”、360 第 8 屏“B2B门店仓 / 配”出现不理想断行。逐屏文案、矩形、固定导航、溢出与底部可达性检查仍通过。

Reproduction: 使用证据目录中的 `luna-mobile-first-390x844.png` 与 `luna-mobile-eighth-360x640.png` 查看稳定首屏/第 8 屏；仅需在 Terra 的 ≤600px 标题规则完成语义分行后复测这两个 viewport。

Evidence: [luna-mobile-first-390x844.png](../output/playwright/xyy-20260913-05/luna-mobile-first-390x844.png)、[luna-mobile-eighth-360x640.png](../output/playwright/xyy-20260913-05/luna-mobile-eighth-360x640.png)、[luna-result.json](../output/playwright/xyy-20260913-05/luna-result.json)。

Likely affected area: `src/styles/product/video-sequence.css` 的 `max-width: 600px` 标题换行/宽度规则。

Severity: LOW（移动标题语义断行影响阅读品质；功能、文案完整性、导航与媒体契约未受影响）。

Handoff: 返回 Sol → Terra；后续返工复测已完成并 PASS，本段仅保留历史问题记录。

### XYY-20260913-05 — 八视频服务文案独立验证

Task ID: XYY-20260913-05

Result: PASS

Tests performed:

- 实际执行 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/home-product.spec.ts tests/e2e/product-motion.spec.ts --grep 'product page|product video navigation' --workers=2`：8 项完成，`test-results/.last-run.json` 为 `status: passed` 且 `failedTests: []`（Chromium/mobile 各 4）。
- 独立 Playwright CLI 在 1440×900、390×844、360×640、844×390 逐屏核对批准稿 8 个标题、8 个正文和 24 个要点，全部逐字匹配；8 个原始 id/href/src 映射保持。1 个 H1、8 个 H2、9 个分区、8 个视频和第九区静态内容保持。
- 四视口逐屏确认 copy 完整位于对应 video/slide 与 viewport 内，无固定 header/胶囊矩形相交；HTML/序列横向溢出均为 0，序列内只有指定滚动容器。白字居中、橙色 CTA、copy 背景透明、filter/text-shadow/box-shadow 均为 none，视频 filter 为 none。
- 四端滚到底均准确为 `09 / 09`，`scrollTop === maxScroll`，第 5 个机制完整可见；视频逐项保留 autoplay/loop/muted/playsinline、无 controls。已保存 1440 首屏与第 8 屏、390 首屏、360×640 第 8 屏稳定截图。
- 对四文件基线与批准文案做独立比对；1133 项保护 SHA-256 最终核验 0 mismatch。

Regression coverage: 覆盖八屏批准标题/正文/三要点、原媒体与详情映射、H1/H2/九区结构、四视口 copy 视觉几何与导航遮挡、溢出/滚动层、CTA 样式、视频属性及第九区底部可达性。按合同未新增或运行 unit、typecheck、build、fullverify 或详情页全套回归。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-05/luna-result.json)、[luna-hash-check.txt](../output/playwright/xyy-20260913-05/luna-hash-check.txt)、[luna-desktop-first-1440x900.png](../output/playwright/xyy-20260913-05/luna-desktop-first-1440x900.png)、[luna-desktop-eighth-1440x900.png](../output/playwright/xyy-20260913-05/luna-desktop-eighth-1440x900.png)、[luna-mobile-first-390x844.png](../output/playwright/xyy-20260913-05/luna-mobile-first-390x844.png)、[luna-mobile-eighth-360x640.png](../output/playwright/xyy-20260913-05/luna-mobile-eighth-360x640.png)。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 开发预览，未覆盖构建产物或部署环境；Terra 已完成局部格式/lint/typecheck/diff 检查，本轮按合同未重复。无本次实现 FAIL 或环境阻塞。

Handoff: 返回 Sol；未修改应用实现、测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260913-04 — 第九区标题排版独立验证

Task ID: XYY-20260913-04

Result: PASS

Tests performed:

- 使用独立 Playwright CLI 会话在 1440×900、1024×768、390×844、360×844 验证 `/product`。四端 HTML/序列横向溢出均为 0；9 个分区、8 个视频、静态 assurance 区 0 个 video、4 个指标与 5 个机制 SVG 均保持。
- 英文 `CAPABILITY & ASSURANCE` 不存在；H2 与两段中文说明逐字完整。桌面 header 子节点为 `H2 → DIV`，1440/1024 为约 2:1 两列；390/360 为单列且 H2 在说明之前。各视口 H2/说明矩形不相交，均在 header 内。
- assurance 顶部对 `.site-header` 与分区固定导航执行当前可见文本二维矩形检查，四视口均无相交。1024/360 到最大滚动位置均为 `09 / 09`，第 5 个机制项完整可见；390 顶部/底部截图状态均准确为 `09 / 09`。
- 已保存 1440 静态区、390 静态区顶部和底部截图。对比 baseline 源文件，ProductAssurance 仅 header 内部重排/英文删除，video-assurance.css 仅标题/说明局部规则变化；header 外 DOM 与其余内容保持。1135 项保护 SHA-256 核验 0 mismatch。

Regression coverage: 覆盖本轮 header 排序、桌面 2:1 列、<=1000px 单列顺序、中文文案/英文移除、固定导航遮挡、9 区/8 视频/静态机制保留、四视口溢出与滚动到底可达性。按合同未新增或运行 E2E、typecheck、build、fullverify、unit 或无关回归。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-04/luna-result.json)、[luna-hash-check.txt](../output/playwright/xyy-20260913-04/luna-hash-check.txt)、[luna-desktop-assurance-1440x900.png](../output/playwright/xyy-20260913-04/luna-desktop-assurance-1440x900.png)、[luna-mobile-assurance-top-390x844.png](../output/playwright/xyy-20260913-04/luna-mobile-assurance-top-390x844.png)、[luna-mobile-bottom-390x844.png](../output/playwright/xyy-20260913-04/luna-mobile-bottom-390x844.png)。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 开发预览，未覆盖构建产物或部署环境；Terra 已完成局部 prettier/eslint/diff 检查，本轮未重复。无本次实现 FAIL 或环境阻塞。

Handoff: 返回 Sol；未修改应用实现、测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260913-08 — 鞋服云仓独立七区页面独立 QA

Task ID: XYY-20260913-08

Result: PASS

Tests performed:

- 实际执行 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/footwear-page.spec.ts tests/e2e/service-pages.spec.ts tests/e2e/service-motion.spec.ts --grep 'footwear page|shared service landing|all service dropdown|service motion remains' --project=chromium --project=mobile --workers=2`：10 项中 9 passed、0 failed、1 skipped，耗时 58.4s。skip 是测试显式跳过 mobile 项目的 all-service dropdown 用例，未计入通过数。
- 实际执行三个指定 Vitest 文件：3 files passed、8 tests passed、0 failed。
- 独立 Playwright CLI 在 1440×900、1024×768、390×844、360×844 检查 `/xiefu-yuncang`：HTTP 200、7 区、1 H1、无旧整页模块、六组原 feature 标题/正文各一次、4 stats、5 FAQ、整页横溢出 0、固定导航和内容矩形相交 0。4 个视频（hero+3 履约阶段）均实际播放并保持 autoplay/loop/muted/playsinline、无 controls。
- 手机网络图确认来源组三项→库存中枢→出库组三项；组内 span 箭头 `display:none`，仅组间显示向下连接箭头。履约 tab 的 click、左右方向键、Home/End、`aria-selected`、panel hidden 与对应视频均通过；390px 稳定锚点为 `#footwear-fulfillment`，目标 top 0.36px 可见，outbound panel/video 可见且播放。
- reduced-motion 内容可读；实际 JavaScript disabled 页面中三阶段全部可读、5 个 FAQ 保持原生 details 展开。`/tuihuo-zhijian` editorial 与 `/guangzhou-xiefu-yuncang` classic spot check 均 HTTP 200、无 footwear 模块、无横溢出。11 路由语义对比 differences 为空。
- 1140 项保护 SHA-256 最终核验 0 mismatch；已保存稳定桌面/手机 hero、全页、履约区和网络区截图。

Regression coverage: 覆盖指定 footwear Chromium/mobile E2E、shared service landing、service motion/reduced motion、no-JS、FAQ、履约键盘/点击、hero 锚点、视频属性与实际播放、四视口布局溢出/遮挡、editorial/classic 回归 spot check、11 路由内容语义和 1140 保护 hash。按合同未重复 typecheck、build、fullverify 或扩大到全站截图矩阵。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-08/luna-result.json)、[luna-e2e.stdout.txt](../output/playwright/xyy-20260913-08/luna-e2e.stdout.txt)、[luna-vitest.stdout.txt](../output/playwright/xyy-20260913-08/luna-vitest.stdout.txt)、[luna-browser-targeted.stdout.txt](../output/playwright/xyy-20260913-08/luna-browser-targeted.stdout.txt)、[luna-hash-check.txt](../output/playwright/xyy-20260913-08/luna-hash-check.txt)、[luna-footwear-1440x900-hero.png](../output/playwright/xyy-20260913-08/luna-footwear-1440x900-hero.png)、[luna-footwear-1440x900-full.png](../output/playwright/xyy-20260913-08/luna-footwear-1440x900-full.png)、[luna-footwear-390x844-hero.png](../output/playwright/xyy-20260913-08/luna-footwear-390x844-hero.png)、[luna-footwear-390x844-full.png](../output/playwright/xyy-20260913-08/luna-footwear-390x844-full.png)、[luna-footwear-390x844-fulfillment-steady.png](../output/playwright/xyy-20260913-08/luna-footwear-390x844-fulfillment-steady.png)、[luna-footwear-390x844-network-steady.png](../output/playwright/xyy-20260913-08/luna-footwear-390x844-network-steady.png)。
Independent semantic evidence: [luna-content-comparison.json](../output/playwright/xyy-20260913-08/luna-content-comparison.json) and [luna-content-comparison.stdout](../output/playwright/xyy-20260913-08/luna-content-comparison.stdout).

Remaining risks: 仅验证本地 `127.0.0.1:4322` 开发预览和 Chromium 模拟视口，未覆盖构建产物或部署环境；Terra 已提供 typecheck420 零诊断及 scoped format/lint/diff 证据，本轮按合同未重复。无本次实现 FAIL 或环境阻塞。

Handoff: 返回 Sol → Nova；未修改应用实现、测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260913-09 — 鞋服详情专用实拍视频独立媒体 QA

Task ID: XYY-20260913-09

Result: PASS

Tests performed:

- 四个详情 MP4 与同名 JPG 均 HTTP 200。四个 MP4 均为 1280×720、30fps、H.264、yuv420p、无音轨、faststart，ffmpeg 完整解码 exit 0。
- 独立复算 selected-media-plan.json 中指定目录的 5 个原片 SHA-256：5/5 match、0 mismatch。新四个 MP4 与 `/product` 的 8 个 MP4 SHA-256 均无碰撞，`/product` 源码未引用 `footwear-detail-20260913`。
- 独立 Playwright CLI 在 1440×900、390×844 检查 `/xiefu-yuncang`：四资源加载并映射到对应 poster/source，固有尺寸均为 1280×720；Hero 及每个履约 tab 选中后 currentTime 均增长，保持 autoplay/loop/muted/playsinline、无 controls；click、ArrowRight、Home、End 和对应 panel/source 状态通过；页面横向溢出为 0。
- 已查看新素材时间线及与既有服务帧的抽样对照，画面内容分别为分拣线全景、检收、拣货和打包出库，未见与对照帧相同画面。1157 项保护 hash 复算 0 mismatch。

Regression coverage: 覆盖四个新视频及封面 HTTP、编码元数据、完整解码、来源 5 原片 hash、`/product` 八视频引用与 hash 差异、鞋服页 1440/390 资源加载/播放/阶段切换/属性/尺寸/溢出，以及三份指定 Astro 相对基线的局部媒体 diff。未运行 08 E2E、unit、typecheck、build、fullverify，未执行 CMS、DB、部署或外盘写入。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-09/luna-result.json)、[luna-media-verification.json](../output/playwright/xyy-20260913-09/luna-media-verification.json)、[luna-browser-verification.stdout](../output/playwright/xyy-20260913-09/luna-browser-verification.stdout)、[luna-stage-play.stdout](../output/playwright/xyy-20260913-09/luna-stage-play.stdout)、[luna-source-hash-check.txt](../output/playwright/xyy-20260913-09/luna-source-hash-check.txt)、[luna-product-media-check.json](../output/playwright/xyy-20260913-09/luna-product-media-check.json)、[luna-protected-hash-check.json](../output/playwright/xyy-20260913-09/luna-protected-hash-check.json)、[luna-footwear-1440x900-hero.png](../output/playwright/xyy-20260913-09/luna-footwear-1440x900-hero.png)、[luna-footwear-390x844-stage.png](../output/playwright/xyy-20260913-09/luna-footwear-390x844-stage.png)。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 预览和 Chromium 模拟视口，未覆盖构建产物或部署环境；未重跑全站回归。隐藏的未选中履约 panel 视频会暂停，已确认每个阶段选中后均真实播放。无本次实现 FAIL 或环境阻塞。

Handoff: 返回 Sol → Nova；未修改应用实现、测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260913-10 — 其余服务详情首屏实拍视频独立 QA

Task ID: XYY-20260913-10

Result: PASS

Tests performed:

- 运行限定 E2E：`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-pages.spec.ts tests/e2e/service-motion.spec.ts --grep 'shared service landing layout renders every visual variant|all service dropdown pages share the same prompt scroll reveal' --project=chromium --project=mobile --workers=2`，4 项中 3 passed、0 failed、1 skipped（service-motion 的 all-service dropdown 用例显式跳过 mobile 项目），耗时 47.0s。
- 九个 MP4 与九个 JPG 均 HTTP 200。九个 MP4 均为 1280×720、30fps、H.264、yuv420p、无音轨、faststart，ffmpeg 完整解码 exit 0；九个 poster 均 1280×720。
- 独立 Playwright CLI 在九路由的 1440×900、390×844 共 18 次检查中，所有 source/poster 映射、currentTime 增长、paused=false、autoplay/loop/muted/playsinline、无 controls、固有尺寸、页面横向溢出和 Hero 标题/CTA 与 site header 遮挡检查通过。前七页保持 editorial 分栏，广州/云道保持 classic 背景式构图；共保存 18 张稳定首屏截图。
- 独立复算 selected-media-plan.json 的 9 个原片 SHA-256：9/9 match；1164 项保护 hash 与 23 项冻结 hash 均 0 mismatch。映射文件含 9 个且无缺失/意外 slug；product 未引用新目录及与八片 hash 无碰撞由 Nova review 阶段补足核验。新时间线代表帧与既有服务参考帧人工抽看未见相同镜头。

Regression coverage: 覆盖合同指定 service-pages/service-motion E2E、18 个媒体资源 HTTP/编码/解码、九原片 hash、1164 保护 hash、23 冻结 hash、九路由两视口实际播放/映射/尺寸/属性/溢出/遮挡、editorial/classic 分支；`/product` 媒体引用与 hash 由 Nova review 阶段补足核验。未运行 footwear/product E2E、unit、typecheck、build、fullverify，未执行 CMS、DB、部署或外部素材写入。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-10/luna-result.json)、[luna-e2e.stdout.txt](../output/playwright/xyy-20260913-10/luna-e2e.stdout.txt)、[luna-media-verification.json](../output/playwright/xyy-20260913-10/luna-media-verification.json)、[luna-browser-verification.json](../output/playwright/xyy-20260913-10/luna-browser-verification.json)、[luna-browser-corrected.stdout](../output/playwright/xyy-20260913-10/luna-browser-corrected.stdout)、[luna-source-hash-check.json](../output/playwright/xyy-20260913-10/luna-source-hash-check.json)、[luna-protected-hash-check.json](../output/playwright/xyy-20260913-10/luna-protected-hash-check.json)、[luna-frozen-hash-check.json](../output/playwright/xyy-20260913-10/luna-frozen-hash-check.json)、[luna-mapping-check.json](../output/playwright/xyy-20260913-10/luna-mapping-check.json)、[nova-review.json](../output/playwright/xyy-20260913-10/nova-review.json)（product/footwear 媒体引用与 hash 为 Nova review 阶段补足证据）。18 张截图均位于同一证据目录，命名为 `luna-<slug>-1440x900.png` 与 `luna-<slug>-390x844.png`。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 预览和 Chromium 模拟视口，未覆盖构建产物或部署环境；按合同未扩大全站回归。首次浏览器脚本曾因 CTA 全局选择器产生误报，修正为 Hero 内 CTA 后 18/18 检查通过；无实现 FAIL 或环境阻塞。

Handoff: 返回 Sol → Nova；未修改应用实现、测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260913-11 — 详情 Hero 清洁实拍媒体定向复测

Task ID: XYY-20260913-11

Result: PASS

Tests performed:

- 复用本地 `127.0.0.1:4322`，先确认 `/product` HTTP 200；实际执行限定 E2E：`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-pages.spec.ts --grep 'shared service landing layout renders every visual variant' --project=chromium --project=mobile --workers=2`，2 passed、0 failed、0 skipped，耗时 22.7s，原始输出见 `luna-e2e.stdout.txt`。
- 首轮8个未变媒体在 1440×900、390×844 的 16 项浏览器检查保持通过；华南、华东精剪后以带 cache-busting 查询的新 context 定向复测桌面/手机4项。四项均 HTTP 200、readyState 4、currentTime 增长、paused=false，autoplay/loop/muted/playsinline 均为 true、controls=false，固有尺寸 1280×720、source/poster 映射正确、页面横溢出 0、Hero 标题/CTA 与 `.site-header` 无相交。共 20 项浏览器检查通过。
- 华南/华东精剪后 4 个资源（MP4/JPG）HTTP 200；MP4 均 H.264、1280×720、30fps、yuv420p、无音轨、faststart，完整解码 exit 0；文件体积分别为 2,074,175 与 1,781,274 bytes，封面均 1280×720。最终媒体索引明确区分8片首轮未变证据与2片精剪后权威复测证据。
- 查看更新后的 `final-timeline-1.jpg`、`final-timeline-2.jpg`、`final-timeline-3.jpg` 及华南/华东精剪后桌面/手机截图：黑橙品牌工衣可辨、仓库/工位有序；原报告的红马甲路人和摇镜问题在两片最终片段中未复现。
- 最终复算 10 个来源 SHA-256：`luna-source-hash-check-final.json` 为 0 mismatch；1184 项保护 hash 与 23 项冻结 hash 分别为 `luna-protected-hash-check-final.json`、`luna-frozen-hash-check-final.json`，均 0 mismatch。product 八片及鞋服下方媒体由保护/冻结清单覆盖保持。

Regression coverage: 覆盖10路由首屏媒体映射、20项两视口播放/属性/固有尺寸/溢出/导航遮挡、20资源 HTTP/编码/解码、最终10来源 hash、1184保护 hash、23冻结 hash，以及精剪两片的最终视觉时间线。首轮8片证据在两片精剪前采集且其媒体未改动；两片已完成定向复测。按合同未重跑 motion、unit、typecheck、build、fullverify 或无关全站回归。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-11/luna-result.json)、[luna-e2e.stdout.txt](../output/playwright/xyy-20260913-11/luna-e2e.stdout.txt)、[luna-media-verification-final.json](../output/playwright/xyy-20260913-11/luna-media-verification-final.json)、[luna-media-retest-huanan-huadong.json](../output/playwright/xyy-20260913-11/luna-media-retest-huanan-huadong.json)、[luna-browser-eight.json](../output/playwright/xyy-20260913-11/luna-browser-eight.json)、[luna-browser-retest-huanan-huadong.json](../output/playwright/xyy-20260913-11/luna-browser-retest-huanan-huadong.json)、[luna-source-hash-check-final.json](../output/playwright/xyy-20260913-11/luna-source-hash-check-final.json)、[luna-protected-hash-check-final.json](../output/playwright/xyy-20260913-11/luna-protected-hash-check-final.json)、[luna-frozen-hash-check-final.json](../output/playwright/xyy-20260913-11/luna-frozen-hash-check-final.json)、[final-timeline-1.jpg](../output/playwright/xyy-20260913-11/final-timeline-1.jpg)、[final-timeline-2.jpg](../output/playwright/xyy-20260913-11/final-timeline-2.jpg)、[final-timeline-3.jpg](../output/playwright/xyy-20260913-11/final-timeline-3.jpg)。20张两视口截图均位于同一证据目录，命名为 `luna-<slug>-1440x900.png`、`luna-<slug>-390x844.png`；精剪复测以 `luna-retest-<slug>-<viewport>.png` 命名。

Remaining risks: 仅验证本地 `127.0.0.1:4322` Chromium 模拟视口，未覆盖构建产物、真实设备或部署环境；未运行 build/fullverify/全站回归，符合本任务范围。首轮8片媒体探针发生在精剪前，最终索引已明确由8片未变首轮记录与华南/华东精剪后定向探针组成。无本次实现 FAIL 或环境阻塞。

Handoff: 返回 Sol 最终验收；未修改应用实现、测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260913-13 — 阶段A退货质检独立验证

Task ID: XYY-20260913-13

Result: FAIL

Expected: returns 分支在完整及合法部分 CMS 内容下，Hero 分级入口均指向存在目标，FAQ 区域的 `aria-labelledby` 均指向存在标题；其余内容、媒体、布局、回归与边界验收通过。

Actual: `ReturnInspectionHero.astro:25` 无条件输出 `href="#returns-grade-heading"`，而 `ReturnInspectionPage.astro:43` 仅在 `features.grade.length > 0` 时渲染 `ReturnGradeFlow`。改名 feature、仅 `contentDesc`、仅 stats 或仅 FAQ 的非空部分内容都会留下无目标死锚点。另 `ReturnInspectionFaq.astro:11` 无条件输出 `aria-labelledby="returns-faq-heading"`，但标题在 `faqs.length > 0` 时才渲染（14–20行），空 FAQ 且有其他内容时形成孤立 ARIA 引用。

Reproduction / Evidence: [luna-boundary-risk.json](../output/playwright/xyy-20260913-13/A/luna-boundary-risk.json) 记录四种部分内容和空 FAQ 的确定性条件、selector 与定位。完整内容实际 DOM 检查通过（`luna-returns-dom-check.json`），该结果不覆盖部分 CMS SSR。独立 helper 边界测试 2 passed，覆盖改名/未知/超长 feature 保留、部分字段可用与全空不可用；未写 CMS，未伪造真实 Directus 部分响应。

Tests performed:

- `service-redesign.spec.ts`：Chromium/mobile 4 passed、0 failed、0 skipped。
- 共享 `service-pages.spec.ts`：Chromium/mobile 2 passed；`service-motion.spec.ts` Chromium 1 passed。
- `service-redesign-content.test.ts`：2 passed；独立边界 helper 测试：2 passed。
- 独立 Playwright CLI 在 1440×900、1024×768、390×844、360×800 检查 Hero、视频实际播放、6 feature、4级、4 stats、5 FAQ、锚点、导航与横溢出，均通过；reduced-motion 与 FAQ 键盘操作通过。
- `/contact`、`/cases`、`/product`、`/houzheng-xiufu` HTTP 均 200；11 路由语义/SEO 对照通过（returns SEO unchanged，其余10路由正文/SEO unchanged）。
- 1197 项 protected hash 与17项阶段A frozen hash 均 0 mismatch。

Likely affected area: `src/components/service/redesign/ReturnInspectionHero.astro`、`ReturnInspectionPage.astro`、`ReturnInspectionFaq.astro` 的部分 CMS 条件渲染与锚点/无障碍引用。

Severity: Medium。完整内容主路径不复现，合法部分内容会出现功能死链与孤立 ARIA 引用，需定向修复后复测。

Regression coverage: 已覆盖指定 returns E2E（含 no-JS）、共享 service-pages/service-motion、四视口全页/核心区、媒体属性与播放、FAQ 键盘、reduced-motion、链接 HTTP、11路由语义/SEO、旧组件排除及 protected/frozen hash。四视口截图、12张证据图和原始 stdout 均在 `output/playwright/xyy-20260913-13/A/`。

Remaining risks: 本地 Chromium 模拟视口，未覆盖真实设备/部署环境；部分/全空 CMS 行为为 helper 边界与冻结源码确定性审计，未连接或写入真实 CMS；以上两个实现边界修复前不能验收 PASS。未运行 build/fullverify，符合合同范围。

Handoff: 返回 Sol → Terra 定向修复 → Sol → Luna re-test；Luna 未修改应用实现、测试实现、媒体、CMS、数据库或外部环境。

#### XYY-20260913-13 A 定向复测

Result: PASS（此前两个部分内容边界缺陷已修复）

- Terra 定向修复后，实际执行 `returns-container.vitest.config.ts`：2 tests passed；Luna 独立 AstroContainer fixture 覆盖仅 stats、仅 FAQ、仅 feature + 超长未知文案：2 tests passed。确认无分级死锚点、无孤立 FAQ `aria-labelledby`，未知长文案完整保留。
- 实际执行 returns E2E：Chromium/mobile 共4 passed、0 failed、0 skipped。
- 独立 Playwright CLI 复测 1440×900、390×844：完整内容 DOM、Hero 视频真实播放及 autoplay/loop/muted/playsinline/无 controls、6 feature、4级、4 stats、5 FAQ、分级入口/目标、FAQ ARIA、导航遮挡、横溢出和旧组件排除均通过；修复前后结构与视觉保持一致。截图为 `luna-retest-returns-1440x900-full.png`、`luna-retest-returns-390x844-full.png`。
- 最终 A frozen hash 17 项 0 mismatch；首轮 protected hash 1197 项 0 mismatch、其余路由语义/SEO及未改媒体证据沿用且仍适用。

Evidence: [luna-retest-result.json](../output/playwright/xyy-20260913-13/A/luna-retest-result.json)、[luna-retest-container.stdout.txt](../output/playwright/xyy-20260913-13/A/luna-retest-container.stdout.txt)、[luna-retest-fixture.stdout.txt](../output/playwright/xyy-20260913-13/A/luna-retest-fixture.stdout.txt)、[luna-retest-e2e.stdout.txt](../output/playwright/xyy-20260913-13/A/luna-retest-e2e.stdout.txt)、[luna-retest-browser.json](../output/playwright/xyy-20260913-13/A/luna-retest-browser.json)、[luna-retest-frozen-hash-check.json](../output/playwright/xyy-20260913-13/A/luna-retest-frozen-hash-check.json)。

Remaining risks: 本轮为定向复测，未重复共享矩阵、4视口、全媒体解码、typecheck、build或fullverify；部分内容由AstroContainer fixture验证，未连接真实CMS；仅本地Chromium模拟视口，未覆盖真实设备或部署环境。无本轮实现FAIL或环境阻塞。

Handoff: 返回 Sol 最终验收；Luna 未修改应用实现、原有测试实现、媒体、CMS、数据库或外部环境，仅新增独立证据fixture与结果文件。

### XYY-20260913-13 B — 后整修复独立 QA

Task ID: XYY-20260913-13

Result: PASS

Tests performed:

- 先确认 `127.0.0.1:4322/` HTTP 200；按合同顺序实际执行 repair E2E（Chromium/mobile）4 passed、repair helper 2 passed、官方 AstroContainer 2 passed、Luna 独立 AstroContainer 边界 fixture 2 passed、shared service-pages（Chromium/mobile）2 passed、shared service-motion（Chromium）1 passed；合计 13 passed、0 failed、0 skipped。原始输出分别在 `output/playwright/xyy-20260913-13/B/luna-e2e-repair.stdout.txt`、`luna-vitest-repair.stdout.txt`、`luna-container.stdout.txt`、`luna-retest-boundaries.stdout.txt`、`luna-e2e-shared-pages.stdout.txt`、`luna-e2e-shared-motion.stdout.txt`。
- 独立 Playwright CLI 复核 `/houzheng-xiufu` 的 1440×900、1024×768、390×844、360×800：四端无横向溢出，Hero 与文案列不相交；视频 `currentTime` 实际增长、`paused=false`、`autoplay/loop/muted/playsinline` 保持、无 controls、固有 1280×720。六个目录首项默认展开，非默认项 click/Enter/Space 通过；5 FAQ 的键盘与 click toggle 通过；三张工艺图逐张滚入后均 `complete`、解码并可见。五个核心标题逐段滚动时均避开固定 `.site-header`，可见性与 ARIA 目标检查通过。
- 内容审计确认原服务名、Hero 两段说明、6 feature 标题/全文（每项 feature node 一次）、4 stats（90%、135+种、24小时、1.53亿件）、9 专区、5 FAQ 原文及 SEO/JSON-LD 保留；`/contact`、`/cases`、`/product`、`/tuihuo-zhijian`、本页均 HTTP 200。独立边界 fixture 覆盖 full、all-empty、仅 desc、仅 stats、仅 FAQ、未知超长 feature，并确认无死 ARIA 引用。
- 当前页四端全页截图及工艺区截图已保存；1197 项 protected hash 与 B 21 项 frozen hash 各 0 mismatch。剩余 9 路由对照 baseline 的正文与 title/description/canonical/JSON-LD 全部相同，9/9 通过。

Regression coverage: 覆盖 B repair 分支的四端布局、Hero 真实播放、目录/FAQ 原生交互、工艺图懒加载后的实际可见性、9 专区、4 stats、6 feature、5 FAQ、链接/ARIA/SEO、reduced-motion、no-JS（repair E2E mobile test）、partial/all-empty CMS 离线渲染，以及 shared service-pages/service-motion 的薄 dispatcher 回归。未运行 build、fullverify、全媒体解码或重复 typecheck。Terra 历史 E2E 曾因未设置 `PLAYWRIGHT_PORT` 使用默认 4399 并隐式 build/start；本轮 Luna 明确使用 4322，未 build、未 restart、未部署。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-13/B/luna-result.json)、[luna-browser-matrix.json](../output/playwright/xyy-20260913-13/B/luna-browser-matrix.json)、[luna-browser-interactions.json](../output/playwright/xyy-20260913-13/B/luna-browser-interactions.json)、[luna-section-geometry-corrected.json](../output/playwright/xyy-20260913-13/B/luna-section-geometry-corrected.json)、[luna-repair-content-audit.json](../output/playwright/xyy-20260913-13/B/luna-repair-content-audit.json)、[luna-semantic-regression.json](../output/playwright/xyy-20260913-13/B/luna-semantic-regression.json)、[luna-frozen-hash-check.json](../output/playwright/xyy-20260913-13/B/luna-frozen-hash-check.json)、[luna-protected-hash-check.json](../output/playwright/xyy-20260913-13/B/luna-protected-hash-check.json)、[luna-repair-1440x900-full.png](../output/playwright/xyy-20260913-13/B/luna-repair-1440x900-full.png)、[luna-repair-1024x768-full.png](../output/playwright/xyy-20260913-13/B/luna-repair-1024x768-full.png)、[luna-repair-390x844-full.png](../output/playwright/xyy-20260913-13/B/luna-repair-390x844-full.png)、[luna-repair-360x800-full.png](../output/playwright/xyy-20260913-13/B/luna-repair-360x800-full.png)、[luna-repair-390x844-craft.png](../output/playwright/xyy-20260913-13/B/luna-repair-390x844-craft.png)。

Remaining risks: 仅本地 `127.0.0.1:4322` 与 Chromium/mobile 模拟视口，未覆盖真实设备、构建产物或部署环境；partial CMS 行为由独立 AstroContainer fixture 验证，未连接或写入真实 CMS。无本轮实现 FAIL 或环境阻塞。

Handoff: 返回 Sol → Nova；Luna 未修改应用、既有测试实现、媒体、依赖、配置、CMS、数据库或外部环境，仅新增 B 目录独立证据与 fixture。

### XYY-20260913-13 C — 跨境仓配独立复测

Task ID: XYY-20260913-13

Result: PASS

Tests performed:

- 初轮 C E2E 的 2 个失败已保留在 `C/luna-crossborder-e2e-failure.json`；原因是测试精确 accessible name 未处理 H1 两个 span 间的空白，Terra 仅调整定位正则后，实际复测 `service-redesign-crossborder.spec.ts` Chromium/mobile 为 4 passed、0 failed、0 skipped。
- 实际执行 C helper 2 passed、官方 AstroContainer 2 passed、Luna 独立边界 fixture 2 passed、shared service-pages Chromium/mobile 2 passed、shared service-motion Chromium 1 passed；合计 13 passed、0 failed、0 skipped。独立 fixture 覆盖 full + unknown long feature、仅 desc、仅 stats、仅 FAQ、全空及 ARIA 目标完整性。
- 独立 Playwright 在 `/kuajing-yuncang` 的 1440×900、1024×768、390×844、360×800 均确认 HTTP 200、无横向溢出、H1 在固定导航下方、Hero 16:9 视频真实播放及 autoplay/loop/muted/playsinline/无 controls、三段交接层级/箭头、三类资料、6 feature、4 stats、5 FAQ、FAQ 键盘与点击、链接和 aria 目标。no-JS E2E 与 reduced-motion 内容均可读。
- 内容审计确认原 h1/heroDesc/contentDesc、6 feature 全文各一次、5 FAQ、4 stats、跨境责任/国内退货/资料说明和 SEO/JSON-LD；其余 8 路由正文及 title/description/canonical/JSON-LD 对 baseline 无差异。
- C 17 项 frozen hash 与总 1197 项 protected hash 均 0 mismatch；Terra/Sol 已提供 450 files、0 diagnostics 的 typecheck 证据，本轮未重复。

Regression coverage: 覆盖本页修复后 E2E、helper/AstroContainer 全空与部分内容边界、四视口布局和实际媒体播放、FAQ/no-JS/reduced-motion、shared pages/motion、其余 8 路由语义/SEO 回归及 17/1197 hash。未运行 build、fullverify、无关页面或真实 CMS。

Evidence: [luna-retest-result.json](../output/playwright/xyy-20260913-13/C/luna-retest-result.json)、[luna-retest-e2e.stdout.txt](../output/playwright/xyy-20260913-13/C/luna-retest-e2e.stdout.txt)、[luna-retest-helper.stdout.txt](../output/playwright/xyy-20260913-13/C/luna-retest-helper.stdout.txt)、[luna-retest-container.stdout.txt](../output/playwright/xyy-20260913-13/C/luna-retest-container.stdout.txt)、[luna-retest-boundaries.stdout.txt](../output/playwright/xyy-20260913-13/C/luna-retest-boundaries.stdout.txt)、[luna-retest-shared-pages.stdout.txt](../output/playwright/xyy-20260913-13/C/luna-retest-shared-pages.stdout.txt)、[luna-retest-shared-motion.stdout.txt](../output/playwright/xyy-20260913-13/C/luna-retest-shared-motion.stdout.txt)、[luna-crossborder-browser.json](../output/playwright/xyy-20260913-13/C/luna-crossborder-browser.json)、[luna-crossborder-content-audit.json](../output/playwright/xyy-20260913-13/C/luna-crossborder-content-audit.json)、[luna-semantic-regression.json](../output/playwright/xyy-20260913-13/C/luna-semantic-regression.json)、[luna-frozen-hash-check.json](../output/playwright/xyy-20260913-13/C/luna-frozen-hash-check.json)、[luna-protected-hash-check.json](../output/playwright/xyy-20260913-13/C/luna-protected-hash-check.json)。四视口截图均在同一 C 证据目录，命名为 `luna-crossborder-<viewport>-full.png`。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 和 Chromium/mobile 模拟视口，未覆盖真实设备、构建产物或部署环境；部分 CMS 行为由 AstroContainer fixture 验证，未连接真实 CMS。无本轮实现 FAIL 或环境阻塞。

Handoff: 返回 Sol 最终验收；Luna 未修改应用、既有测试实现、媒体、依赖、配置、CMS、数据库或外部环境，仅新增 C 目录独立证据与边界 fixture。

#### XYY-20260913-13 B FAQ 定向复测

Result: PASS

- Nova 初审指出 `RepairFaq` 的两个 H2 仍受旧 `.redesign-faq` 选择器影响；Terra 定向改为 `.repair-faq` 并刷新 B frozen manifest。Luna 实际执行 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-repair.spec.ts --project=chromium --project=mobile --workers=2`：4 passed、0 failed、0 skipped（16.7s），原始输出为 `output/playwright/xyy-20260913-13/B/luna-retest-faq-e2e.stdout.txt`。
- 独立 Playwright CLI 在 1440×900 与 390×844 检查 FAQ 标题和咨询 CTA 标题：两端 H2 computed font-size 分别为 63.36px 与 35.1px，手机无孤字行或横向溢出；FAQ/CTA 标题逐段稳定滚动后均位于固定 `.site-header` 下方，CTA `/contact`、FAQ Enter 与 click toggle 均通过。截图为 `luna-retest-faq-1440x900.png`、`luna-retest-faq-390x844.png`。
- B 21 项最终 frozen hash 复核 0 mismatch；与 `initial-frozen-hashes.json` 对照仅 `src/styles/service-redesign/repair.css` 变化，其余 20 项不变。结果为 `output/playwright/xyy-20260913-13/B/luna-retest-faq-result.json`。

Remaining risks: 本轮仅针对 FAQ 样式修复复测，其他 13 项测试与四视口/内容/边界证据沿用；未重复 shared、typecheck、build 或 fullverify。仅本地 Chromium/mobile 模拟视口，未覆盖真实设备、构建产物或部署环境。

Handoff: 返回 Sol → Nova；Luna 未修改应用、测试、媒体或其他实现文件。

### XYY-20260913-13 D — 华南选仓独立验证

Task ID: XYY-20260913-13

Result: FAIL

Expected: 390×844 与 360×800 移动端的运输参考说明和仓内截单统计应自然单列并完整可读，避免桌面双列造成过窄文字列。

Actual: `.south-reference > .redesign-shell > div` 在 390px 计算为 `169.625px 141.375px`，在 360px 计算为 `153.266px 127.734px`。长运输说明被压入窄左列，截单统计位于窄右列并与其同高，产生明显空白；页面没有横向溢出，但移动端版式不满足可读性收口。

Reproduction / Evidence: 独立 Playwright CLI session `xyy13d` 访问 `http://127.0.0.1:4322/huanan-xiefu-yuncang`，读取 computed grid、两列矩形和全文；原始结果见 [luna-south-reference-check.raw.txt](../output/playwright/xyy-20260913-13/D/luna-south-reference-check.raw.txt)，汇总见 [luna-result.json](../output/playwright/xyy-20260913-13/D/luna-result.json)。

Likely affected area: `src/styles/service-redesign/south-content.css` 的 `.south-reference > div > div` 移动端响应式规则。

Severity: Medium。

Tests performed:

- 先确认 `127.0.0.1:4322/` HTTP 200；实际执行本页 `service-redesign-south.spec.ts` Chromium/mobile：4 passed、0 failed、0 skipped；shared service-pages 首矩阵 Chromium/mobile：2 passed；shared service-motion 首矩阵 Chromium：1 passed。
- 独立 AstroContainer 边界 fixture：2 passed，覆盖 full、未知长中文及连续 SKU 字符串、仅 desc、仅 stats、仅 FAQ、全空和 ARIA 目标。
- 独立 Playwright 四视口检查：页面及文字元素无横向溢出，Hero 视频实际播放、四城角色/节点、键盘 Enter、touch pointer click、FAQ/链接/ARIA、标题导航避让均通过；四张稳定全页截图已保存。
- D frozen 18 项和 protected 1197 项 hash 均 0 mismatch。

Regression coverage: 覆盖 D 本页 E2E（含 no-JS）、shared pages/motion、四视口布局/视频/地图节点/文字边界、城市交互、reduced-motion、partial CMS 离线渲染及 18/1197 hash。Terra 的历史 shared news 用例失败与本 D 范围无关，未重跑；未运行 build、fullverify、typecheck、about/news 或真实 CMS。

Remaining risks: 移动端运输参考双列需定向 CSS 修复后复测；当前仅本地 Chromium/mobile 模拟视口，未覆盖真实设备、构建产物、部署环境或 live CMS partial 响应。

Handoff: 返回 Sol → Terra 定向响应式修复 → Sol → Luna re-test；Luna 未修改应用、现有测试实现、媒体、CMS、数据库或外部环境，仅新增 D 目录独立 fixture 与证据。

#### XYY-20260913-13 D 定向响应式复测

Task ID: XYY-20260913-13

Result: PASS

Tests performed:

- 仅按合同复测运输参考区：390×844 与 360×800 的 `.south-reference > .redesign-shell > div` 均为单列（分别 343px、313px），说明全宽、截单统计随后，全文 SLA/截单文字保留，无页面或文字溢出；1440×900 仍为双列。
- 保存局部截图：`luna-retest-reference-390x844.png`、`luna-retest-reference-360x800.png`、`luna-retest-reference-1440x900.png`。
- 最终 18 项 frozen hash 与 1197 项 protected hash 均 0 mismatch；与 `initial-frozen-hashes.json` 对照仅 `src/styles/service-redesign/south-content.css` 一项变化，无增删文件。

Regression coverage: D 首轮本页 E2E 4/4、shared pages 2/2、shared motion 1/1、独立边界 fixture 2/2 及四视口/城市/视频/ARIA 证据继续有效；本轮仅针对 CSS 变更复测移动单列与桌面双列，未重复其余测试、typecheck、build 或 fullverify。

Evidence: [luna-retest-result.json](../output/playwright/xyy-20260913-13/D/luna-retest-result.json)、[luna-retest-reference.raw.txt](../output/playwright/xyy-20260913-13/D/luna-retest-reference.raw.txt)、[luna-retest-hash-check.json](../output/playwright/xyy-20260913-13/D/luna-retest-hash-check.json)、[luna-retest-reference-390x844.png](../output/playwright/xyy-20260913-13/D/luna-retest-reference-390x844.png)、[luna-retest-reference-360x800.png](../output/playwright/xyy-20260913-13/D/luna-retest-reference-360x800.png)、[luna-retest-reference-1440x900.png](../output/playwright/xyy-20260913-13/D/luna-retest-reference-1440x900.png)。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 与 Chromium 模拟视口，未覆盖真实设备、构建产物或部署环境；无本轮实现 FAIL 或环境阻塞。

Handoff: 返回 Sol 最终验收；Luna 未修改应用、现有测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260913-13 E — 华东库存独立验证

Task ID: XYY-20260913-13

Result: FAIL

Expected: 390×844 与 360×800 移动端的五个目的地摘要中，省份/目的地文字应与右侧原生展开 `+/-` 指示器保持独立、完整可读；页面无横向溢出。桌面 1440×900 与 1024×768 保持四列目的地布局。

Actual: 五个摘要在 390×844 和 360×800 均复现 `plusOverlap: true`。`.east-destinations summary b` 的右边界分别贴近摘要右边界（约 359px / 329px），而 `.east-destinations summary::after` 仍以 `right: 0` 定位并占约 11px，因此江苏、浙江、安徽、福建等省份文字会进入 `+/-` 指示器区域。桌面两视口无该重叠。

Reproduction: 独立 Playwright CLI session `xyy13e` 访问 `http://127.0.0.1:4322/huadong-xiefu-yuncang`，在 1440×900、1024×768、390×844、360×800 采集摘要、省份和伪元素矩形；页面 HTTP 200。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-13/E/luna-result.json)、[luna-east-browser.json](../output/playwright/xyy-20260913-13/E/luna-east-browser.json)、[luna-east-browser.raw.txt](../output/playwright/xyy-20260913-13/E/luna-east-browser.raw.txt)、[luna-east-390x844-full.png](../output/playwright/xyy-20260913-13/E/luna-east-390x844-full.png)、[luna-east-360x800-full.png](../output/playwright/xyy-20260913-13/E/luna-east-360x800-full.png)。

Likely affected area: `src/styles/service-redesign/east-layout.css` 的 `.east-destinations summary` 移动端网格/右侧预留空间，以及 `summary::after` 指示器定位。

Severity: Medium。

Tests performed: 本页 `service-redesign-east.spec.ts` Chromium/mobile 4 passed、0 failed、0 skipped；shared service-pages 首矩阵 Chromium/mobile 2 passed；shared service-motion 首矩阵 Chromium 1 passed；独立 AstroContainer 边界 fixture 2 passed（full、unknown-long 中英文/SKU、desc-only、stats-only、FAQ-only、all-empty、ARIA）。四视口浏览器检查还确认视频真实播放、所需属性、五目的地、FAQ 交互、内容/ARIA/reduced-motion、无页面/文字横溢出。17 项 frozen hash 与 1197 项 protected hash 均 0 mismatch。

Regression coverage: 已覆盖本页 E 行为、共享页面/动效、四视口布局与实际视频、目的地和 FAQ 原生交互、部分/空内容离线渲染、内容/SEO 与 hash 回归；未运行 build、fullverify、typecheck、无关页面或真实 CMS。

Remaining risks: 需仅针对移动摘要为指示器保留独立右侧空间后复测 390×844、360×800，并确认桌面四列与原文字不变；当前无环境阻塞。Luna 未修改应用、测试、媒体或其他实现文件。

Handoff: 返回 Sol → Terra 定向修复 `east-layout.css` → Sol → Luna 定向复测。

#### XYY-20260913-13 E 定向复测

Task ID: XYY-20260913-13

Result: PASS

Tests performed: 复用本地 `127.0.0.1:4322`，独立 Playwright CLI session `xyy13e-retest` 在 390×844、360×800、1440×900、1024×768 检查五行目的地摘要。移动端五行省份与 `summary::after` 指示器实际矩形均无交集（两端均 0 overlap），城市/省份/参考次日达/SLA 文字完整，页面及目的地元素无横向溢出；桌面仍保持四列网格。390×844 下键盘 Enter 和点击均成功展开详情，焦点/内容可见，指示器由 `+` 变为 `−`。证据见 [luna-retest-result.json](../output/playwright/xyy-20260913-13/E/luna-retest-result.json)、[luna-east-retest-browser.json](../output/playwright/xyy-20260913-13/E/luna-east-retest-browser.json)、[luna-east-retest-browser.raw.txt](../output/playwright/xyy-20260913-13/E/luna-east-retest-browser.raw.txt)；手机和桌面局部截图已保存于 E 证据目录。

Regression coverage: 首轮本页 E2E 4 passed、shared pages 2 passed、shared motion 1 passed、独立边界 fixture 2 passed、四视口内容/视频/ARIA/FAQ 证据继续有效；本轮只复测 CSS 影响面，未重复 E2E、容器、类型或全量检查。最终 17 项 frozen hash、1197 项 protected hash 均 0 mismatch；与 initial frozen 对照仅 `src/styles/service-redesign/east-layout.css` 变化。

Remaining risks: 仅覆盖本地 Chromium 模拟视口，未覆盖真实设备、构建产物或部署环境；本轮未运行 build、fullverify、typecheck、无关测试或真实 CMS。无当前实现 FAIL 或环境阻塞。

Handoff: 返回 Sol 最终验收；Luna 未修改应用、现有测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260913-13 F — 直播场次叙事独立验证

Task ID: XYY-20260913-13

Result: PASS

Tests performed:

- 先确认 `http://127.0.0.1:4322/` HTTP 200。按合同顺序实际执行 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-live.spec.ts --project=chromium --project=mobile --workers=1`：4 passed、0 failed、0 skipped；`service-pages.spec.ts` 共享首矩阵 Chromium/mobile：2 passed、0 failed、0 skipped；`service-motion.spec.ts` 首矩阵 Chromium：1 passed、0 failed、0 skipped。F 的实际 stdout 分别为 [luna-live-e2e.stdout.txt](../output/playwright/xyy-20260913-13/F/luna-live-e2e.stdout.txt)、[luna-shared-pages.stdout.txt](../output/playwright/xyy-20260913-13/F/luna-shared-pages.stdout.txt)、[luna-shared-motion.stdout.txt](../output/playwright/xyy-20260913-13/F/luna-shared-motion.stdout.txt)。
- 实际运行 `npx vitest run tests/unit/service-redesign-live.test.ts`：1 file / 2 tests passed；stdout 为 [luna-live-helper.stdout.txt](../output/playwright/xyy-20260913-13/F/luna-live-helper.stdout.txt)。另实际运行 [live-container.vitest.config.ts](../output/playwright/xyy-20260913-13/F/live-container.vitest.config.ts)：1 file / 2 tests passed，覆盖 full、unknown long feature、仅 desc、仅 stats、仅 FAQ、全空和 ARIA 目标；stdout 为 [luna-live-container.stdout.txt](../output/playwright/xyy-20260913-13/F/luna-live-container.stdout.txt)。
- 独立 Playwright CLI session `xyy13f-live` 在 1440×900、1024×768、390×844、360×800 实际检查：页面及文字无横向溢出，H1/各阶段标题避开固定导航，Hero 文本与视频不重叠；视频 currentTime 增长、paused=false、muted/autoplay/loop/playsinline=true、controls=false、readyState=4、固有尺寸 1280×720，src/poster 正确。三个阶段为“开播前/集中出单/场后履约”，桌面宽度有三档节奏变化；平台→仓内→状态链路有 2 个箭头；6 feature、5 FAQ、4 stats、MCN/接口条件、CTA 及内链均存在，FAQ 键盘交互和 reduced-motion 内容通过。四张稳定全页截图及明细见 [luna-result.json](../output/playwright/xyy-20260913-13/F/luna-result.json)、[luna-live-browser.json](../output/playwright/xyy-20260913-13/F/luna-live-browser.json)。
- 17 项 frozen hash 和 1197 项 protected hash 均 0 mismatch；11 路由语义/SEO 对照证据 `sol-other-routes.json` 无受影响页面差异。Terra 已提供 473 files、0 diagnostics 的 typecheck 结果，本轮未重复。

Regression coverage: 覆盖直播页 helper 2 tests、三阶段叙事、实际视频属性与播放、四视口布局/导航避让/文字边界、FAQ 键盘、no-JS E2E、reduced-motion、离线 CMS partial/full-empty 边界 2 tests、ARIA、内容/SEO、共享 service pages/motion 及 17/1197 hash；合计 11 passed、0 failed、0 skipped。未运行 build、fullverify、无关页面或真实 CMS。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 和 Chromium/mobile 模拟视口，未覆盖真实设备、构建产物或部署环境；无当前实现 FAIL 或环境阻塞。

Handoff: 返回 Sol → Nova；Luna 未修改应用、现有测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260913-13 G — B2B 门店分货独立验证

Task ID: XYY-20260913-13

Result: PASS

Tests performed:

- 先确认 `GET http://127.0.0.1:4322/` 返回 HTTP 200。按合同顺序独立执行 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-b2b.spec.ts --project=chromium --project=mobile --workers=1`：6 passed、0 failed、0 skipped；共享 `service-pages.spec.ts --grep 'shared service landing layout renders every visual variant'` Chromium/mobile：2 passed；`service-motion.spec.ts --grep 'all service dropdown pages share the same prompt scroll reveal'` Chromium：1 passed。另运行 B2B unit 2 tests 与 `G/b2b-container.vitest.config.ts` 边界 2 tests，均通过。原始 stdout 为 [luna-b2b-e2e.stdout.txt](../output/playwright/xyy-20260913-13/G/luna-b2b-e2e.stdout.txt)、[luna-shared-pages.stdout.txt](../output/playwright/xyy-20260913-13/G/luna-shared-pages.stdout.txt)、[luna-shared-motion.stdout.txt](../output/playwright/xyy-20260913-13/G/luna-shared-motion.stdout.txt)、[luna-b2b-unit.stdout.txt](../output/playwright/xyy-20260913-13/G/luna-b2b-unit.stdout.txt)、[luna-b2b-container.stdout.txt](../output/playwright/xyy-20260913-13/G/luna-b2b-container.stdout.txt)。
- 独立真实 Chromium 浏览器检查在 1440×900、1024×768、390×844、360×800 均确认无页面/文字横向溢出，主要标题滚动后避开固定导航；Hero 文本与视频无重叠。视频 `1280×720`、src/poster 正确，muted/autoplay/loop/playsinline 生效、无 controls、readyState 4，四端 `currentTime` 实际增长。
- B/C/A 原生按钮经键盘 Enter 与 touch tap 分别切换，`aria-pressed`、对应分货明细和箱标各自保持唯一同步高亮，其他状态取消；手机三条记录字段 SKU/颜色/尺码/数量/箱号完整，箱标紧随明细。FAQ 与六行对比均经键盘/点击操作。no-JS 360×800 保留 3 条记录/箱标、6 feature、5 FAQ；reduced-motion 390×844 内容完整。四张全页截图及 no-JS 截图已保存。
- 当前页面实际正文核对 6 个 feature（各一个 data 容器且标题唯一）、5 FAQ、4 stats、三种补货场景、示意免责声明、ERP 品牌、系统费实施/定制条件、线路 SLA、B2C/B2B 一盘货与六行对比信息；11 路由 HTTP/metadata/title/description/canonical/JSON-LD 语义回归通过，B2B 主体按范围变化，其余 10 路由 accepted/baseline 正文不变。19 项 G frozen 与 1197 项 protected SHA-256 均 0 missing、0 mismatch。
- 首轮独立检查器将实际无空格文案“以线路和合同SLA为准”与检查器字面空格写法误判为缺失，并用不稳定缓存坐标触屏点击 C；保留了首轮 raw 观察，修正仅作用于 G 输出脚本，随后用 `locator.tap()` 和实际 DOM 命中/状态重新检查，四端均 PASS。

Regression coverage: 覆盖 B2B 页面 Chromium/mobile 6 项、共享 service-pages 2 项、共享 service-motion 1 项、B2B unit 2 项、AstroContainer full/empty/desc-only/stats-only/FAQ-only/unknown-long 2 项、四视口截图与布局/导航避让/视频播放、键盘/触屏/FAQ/对比、no-JS/reduced-motion、11 路由语义/SEO 与 19/1197 hash。合计既定测试 13 passed、0 failed、0 skipped；未运行 build、fullverify、typecheck 或无关页面测试。

Evidence: [luna-result.json](../output/playwright/xyy-20260913-13/G/luna-result.json)、[luna-b2b-browser.json](../output/playwright/xyy-20260913-13/G/luna-b2b-browser.json)、[luna-b2b-browser.raw.txt](../output/playwright/xyy-20260913-13/G/luna-b2b-browser.raw.txt)、[luna-touch-note.md](../output/playwright/xyy-20260913-13/G/luna-touch-note.md)、[luna-hash-check.json](../output/playwright/xyy-20260913-13/G/luna-hash-check.json)、[luna-semantic-regression.json](../output/playwright/xyy-20260913-13/G/luna-semantic-regression.json)、[luna-b2b-1440x900-full.png](../output/playwright/xyy-20260913-13/G/luna-b2b-1440x900-full.png)、[luna-b2b-1024x768-full.png](../output/playwright/xyy-20260913-13/G/luna-b2b-1024x768-full.png)、[luna-b2b-390x844-full.png](../output/playwright/xyy-20260913-13/G/luna-b2b-390x844-full.png)、[luna-b2b-360x800-full.png](../output/playwright/xyy-20260913-13/G/luna-b2b-360x800-full.png)、[luna-b2b-nojs-360x800-full.png](../output/playwright/xyy-20260913-13/G/luna-b2b-nojs-360x800-full.png)。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 与 Chromium/mobile 模拟视口，未覆盖真实设备、构建产物或部署环境；CMS 边界为离线 AstroContainer fixture，未连接真实 CMS。Luna 仅新增 G 目录独立证据与 `docs/LUNA.md` 日志，未修改应用、既有测试、媒体、依赖、配置、CMS、数据库或其他阶段。

Handoff: 返回 Sol → Nova → Sol 最终验收。

#### XYY-20260915-03 Nova progressive-enhancement 定向复测

Task ID: XYY-20260915-03

Result: PASS

Tests performed: Terra 按 Nova REJECTED 要求仅调整工位 SSR progressive enhancement 后，Luna 执行 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-repair.spec.ts --project=chromium --project=mobile --workers=1`，exit 0，6/6 passed。正常 JS、真实 no-JS、实际 abort 模块请求三项测试在 Chromium/mobile 均通过；阻断场景明确记录并断言 `blockedRequests: 1`。独立浏览器脚本 exit 0：no-JS 与模块阻断中 controls hidden、无 tab roles/死 ARIA，三 figure/图注可读，隐藏控件未进入真实 Tab 序列，FAQ 使用浏览器键盘 Enter 展开；正常 JS tablist/tab/tabpanel 引用闭合。

Regression coverage: 复用既有四视口几何脚本，1440×900、1024×768、390×844、360×800 三工位 image frame/caption/figure/panels/section 高度与 zones 文档 Y 差值均 ≤1px；图注 overflow 检查 exit 0。最终冻结清单 19/19、保护文件 1280/1280 均 0 missing、0 mismatch。历史 geometry FAIL 保留为 `luna/retest1-report.md`。完整 shared service-pages 的范围外 news 空态断言失败不属于本页范围，本轮未重跑。

Evidence: [最终 result.json](../output/playwright/xyy-20260915-03/luna/result.json)、[最终 report.md](../output/playwright/xyy-20260915-03/luna/report.md)、[nova-rework-repair-e2e.stdout.txt](../output/playwright/xyy-20260915-03/luna/nova-rework-repair-e2e.stdout.txt)、[nova-rework-progressive-result.json](../output/playwright/xyy-20260915-03/luna/nova-rework-progressive-result.json)、[retest3/repair-geometry.stdout.txt](../output/playwright/xyy-20260915-03/luna/retest3/repair-geometry.stdout.txt)、[luna-hash-check.json](../output/playwright/xyy-20260915-03/luna/luna-hash-check.json)。

Remaining risks: 仅验证本地 Chromium 模拟视口，未覆盖真实设备、构建产物、部署环境或 live CMS；Luna 未修改应用实现、既有测试、CMS、数据库或外部环境。

Handoff: 返回 Sol → Nova 定向复审 → Sol 最终验收。
### XYY-20260915-03 — 后整修复页重设计独立验证

Task ID: XYY-20260915-03

Result: FAIL

Expected: 1440×900、1024×768、390×844、360×800 下三工位切换的 image frame、图注、figure、panels、workshop section 高度及 zones 文档 Y 差值均 ≤1px；FAQ 咨询标题自然断行。

Actual: 字体就绪后 FAQ 标题四视口均无孤字；四视口 active 工位图均完成 decode 并正确显示。1440×900、1024×768、390×844 几何通过。360×800 清污图注高度为 143.96875px，缝补与熨烫均为 128px，差值 15.96875px；figure、panels、section 及 zones 文档 Y 同步下移 15.96875px，切换存在跳动。

Evidence: 独立浏览器脚本 `node output/playwright/xyy-20260915-03/luna/repair-browser-check.mjs`（显式 `document.fonts.ready`）最终 exit 1、1 failure；历史结果保留于 [retest1-report.md](../output/playwright/xyy-20260915-03/luna/retest1-report.md) 与 [repair-browser-check-retest.stdout.txt](../output/playwright/xyy-20260915-03/luna/repair-browser-check-retest.stdout.txt)。四视口首屏/工位/流程/FAQ 及 no-JS 截图已落盘于同一目录。独立 Repair E2E 2/2、边界 2/2、shared motion 2/2、Repair 相关 shared pages 1/1 均 exit 0。冻结源 19/19 与保护文件 1280/1280 hash 均 0 mismatch，见 [luna-hash-check.json](../output/playwright/xyy-20260915-03/luna/luna-hash-check.json)。

Likely affected area: `src/styles/service-redesign/repair-workshop.css` 移动端 `figcaption` 高度；`min-height: 8rem` 未限制最长清污图注的额外一行。

Severity: Medium。

Remaining risks: 等待 Terra 定向 CSS 修复后，仅复测四视口三工位几何稳定与图注不裁切；Luna 未修改应用实现。验证仅覆盖本地 Chromium 模拟视口，未覆盖真实设备、构建产物、部署环境或 live CMS。

Handoff: 返回 Sol → Terra → Sol → Luna 几何复测。

#### XYY-20260915-03 最终 CSS 定向复测

Task ID: XYY-20260915-03

Result: PASS

Tests performed: Terra 仅调整 <=640px 工位 `figcaption` 最小高度后，Luna 运行 `LUNA_GEOMETRY_ONLY=1 LUNA_RUN_DIR=retest2 node output/playwright/xyy-20260915-03/luna/repair-browser-check.mjs`，exit 0。1440×900、1024×768、390×844、360×800 均逐一切换清污、缝补、熨烫，状态与图片映射正确；image frame、caption、figure、panels、section 高度和 zones 文档 Y 在三状态间差值均 ≤1px。另运行独立图注 overflow 检查，exit 0，四视口三状态 `scrollHeight === clientHeight`、`scrollWidth === clientWidth`，无裁切或溢出。

Regression coverage: 既有 Repair E2E 2/2、AstroContainer boundary 2/2、shared service-motion 2/2、Repair 相关 shared service-pages 1/1 保持通过；既有 no-JS、reduced-motion、内容/SEO 证据沿用，本轮未重复。完整 shared service-pages 首次执行的范围外 news 空 CMS 断言失败不属于本页范围。

Evidence: 最终 [result.json](../output/playwright/xyy-20260915-03/luna/result.json)、[report.md](../output/playwright/xyy-20260915-03/luna/report.md)、[retest2/repair-geometry.stdout.txt](../output/playwright/xyy-20260915-03/luna/retest2/repair-geometry.stdout.txt)、[retest2/caption-overflow.stdout.txt](../output/playwright/xyy-20260915-03/luna/retest2/caption-overflow.stdout.txt)、[luna-hash-check.json](../output/playwright/xyy-20260915-03/luna/luna-hash-check.json)。最终冻结清单 19/19、保护文件 1280/1280 均 0 missing、0 mismatch。首轮 FAIL 报告保留为 `luna/retest1-report.md`。

Remaining risks: 仅验证本地 Chromium 模拟视口，未覆盖真实设备、构建产物、部署环境或 live CMS；Luna 未修改应用实现、既有测试、CMS、数据库或外部环境。

Handoff: 返回 Sol → Nova → Sol 最终验收。

### XYY-20260915-05 — South 旧六区验证准备（已被新合同取代）

Task ID: XYY-20260915-05

Result: SUPERSEDED BY keep-warehouses/contract.md

Tests performed: 本轮仅完成验证准备和只读基线核对，未运行 E2E、Vitest、AstroContainer、build、full verify、CMS 或数据库操作。已读取任务合同、根目录 `AGENTS.md`、相关 `DEV_STATE.md` 段落、04 最终方案、仓库地址资料、当前 South 测试入口、Playwright/Vitest 配置及最近 Luna/Terra 相关记录。`HEAD` 为 `63deee1dfdd5c9a88e229e52f7f1e0d292de1581`，任务基线为 1300 项源码/媒体/测试 hash，保护集为 1286 项；`npx` 可用，Node `v24.18.0`、npm `11.16.0`。

Planned verification: 冻结后使用独立 Playwright session，先确认并复用 `127.0.0.1:4322`，所有 E2E 显式 `PLAYWRIGHT_PORT=4322`、`--workers=1`，不触发隐式 build/start。按 hero → 仓库 → 作业 → 时效 → 准备 → FAQ 顺序检查 1440×900、1024×768、390×844、360×800；逐元素检查横溢出、裁切、覆盖、长地址和移动阅读顺序；核对9条地址逐字符、原6 features 映射、原5 FAQ/4 stats、heroDesc/contentDesc、原媒体/metadata/链接及其余8路由；补做视频静音播放时间推进、原生 FAQ/CTA 键盘、真实禁 JS、模块请求阻断、reduced-motion、ARIA 与 1286 保护 hash。独立 fixture 将基于真实 Astro 组件覆盖 full、全空、仅 desc、仅 stats、仅 FAQ、空 features、缺城市、unknown/改名 feature 与长文本输入，不能将 fixture 结果称为真实 CMS 线上验证。

Evidence: [luna/prep-manifest.json](../output/playwright/xyy-20260915-05/luna/prep-manifest.json)；9 地址 oracle、AC、执行门槛、基线计数和未运行命令均记录在该文件。当前 Terra 尚未在 `docs/TERRA.md` 交付本 Task 的最终冻结交接，因此本轮没有 PASS/FAIL 行为结论。

Remaining risks: 当前工作树仍含 Terra 的 South 实现和其他并行改动，冻结前任何浏览器结果都可能失效；本轮尚未验证页面行为、视觉、CMS partial/empty 语义、真实媒体解码或其他路由回归。等待 Sol 发出最终 freeze 后再执行并沿用本 Task ID。

Handoff: 返回 Sol；本条旧六区准备记录不再作为验收依据。Luna 未修改应用实现、既有测试、媒体、CMS、数据库或外部环境。

### XYY-20260915-05 — 仅保留仓库分布的独立验证准备

Task ID: XYY-20260915-05

Result: PREPARED / WAITING FOR NEW TERRA FREEZE

Tests performed: 六区重设计已按用户要求取消。本轮仅读取并执行 `keep-warehouses/contract.md` 的准备核对：恢复基线为 `output/playwright/xyy-20260915-05/before/`，仓库视觉 oracle 为 `keep-warehouses/before-style.json`，仓库 before HTML、revision hash、9 地址资料、当前工作树和相关日志均已确认。未运行任何 E2E、Vitest、AstroContainer、build、full verify、CMS 或数据库操作。

Effective verification: 仅验证当前 South 仓库分布和9条地址（广州3、东莞4、佛山1、肇庆1）；名称、括号别名、地址逐字符一致，保留“朗州仓/朗洲村”“桥头镇/常平桥头”，新塘仓和云谷仓仅显示“暂不公布”，排除昆山/上海/合肥。其余首屏、三业务入口、资源确认、运输参考、FAQ/咨询按 05/before 结构和顺序还原；不再测试已取消的新五步作业、退货流程或独立准备区。

Planned verification: 冻结后使用独立 Playwright session，只运行 1440×900 与 390×844；先确认并复用 `127.0.0.1:4322`，E2E 显式 `PLAYWRIGHT_PORT=4322`、`--workers=1`，不触发隐式 build/start。逐项比较仓库区相对元素几何、字号、行高和颜色，允许与 `before-style.json` 差异≤1px；检查无横溢出/覆盖、无主节点/制造协同/区域协同/平台协同、无旧城市按钮或失效脚本、视频静音自动循环、FAQ/CTA 键盘、无 JS、真实脚本请求阻断（按 `request.resourceType() === 'script'` 计数，含 `.ts`）、empty/partial 真实 AstroContainer 输出、9 地址和1286保护 hash；其他8路由按 `baseline-semantics.json` 回归。

Evidence: [keep-warehouses-prep-manifest.json](../output/playwright/xyy-20260915-05/luna/keep-warehouses-prep-manifest.json)。旧六区准备清单已标记为 superseded：[prep-manifest.json](../output/playwright/xyy-20260915-05/luna/prep-manifest.json)。当前 Terra 尚未交付新合同对应的最终 freeze，因此本轮不发布 PASS/FAIL。

Remaining risks: Terra 的选择性还原尚未冻结；当前任何行为或视觉结果均可能随还原变更失效。尚未验证新合同下的仓库相对几何、任务前结构还原、真实组件 partial/empty、脚本阻断或其他8路由回归。

Handoff: 返回 Sol；等待新 freeze 后按限定范围执行。Luna 仅更新本任务独立准备证据和日志，未修改应用实现、既有测试、媒体、CMS、数据库或外部环境。

### XYY-20260915-05 — keep-warehouses 最终独立验证

Task ID: XYY-20260915-05

Result: PASS

Tests performed:

- 已读取并核对 Terra 冻结交接 [freeze.md](../output/playwright/xyy-20260915-05/terra/freeze.md) 与 `freeze-hashes.txt`；执行 `sha256sum -c output/playwright/xyy-20260915-05/terra/freeze-hashes.txt`，15/15 项均 `OK`。冻结内容确认四个 South 旧布局文件恢复、`SouthNetworkPage.astro` 仅保留批准的“合适仓库”文案和脚本 import 删除、仓库节点与9地址保留，取消的准备组件/旧脚本删除。
- 实际运行 `npx vitest run tests/unit/service-redesign-south.test.ts`：1 file / 4 tests passed；实际运行 Luna 自有真实 AstroContainer 边界 fixture（代表性 partial 与全空）配置：1 file / 2 tests passed。原始日志为 [south-unit.stdout.txt](../output/playwright/xyy-20260915-05/luna/south-unit.stdout.txt)、[keep-warehouses-boundaries.stdout.txt](../output/playwright/xyy-20260915-05/luna/keep-warehouses-boundaries.stdout.txt)；首次 fixture 检查器误计 ARIA class 的失败原文保留在 [keep-warehouses-boundaries.initial-failure.stdout.txt](../output/playwright/xyy-20260915-05/luna/keep-warehouses-boundaries.initial-failure.stdout.txt)，修正仅限测试断言后复跑通过。
- 复用 `127.0.0.1:4322` 服务，实际执行 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-south.spec.ts --project=chromium --project=mobile --workers=1`：10 passed、0 failed、0 skipped；HTTP 200 原始响应与测试 stdout 已保存为 [south-e2e.stdout.txt](../output/playwright/xyy-20260915-05/luna/south-e2e.stdout.txt)。测试覆盖9地址逐字、旧 South 区域结构/文案、无旧流程/准备区、无横溢出、FAQ/CTA、no-JS 与按 `resourceType() === 'script'` 计数的真实脚本阻断。
- 独立 headless Chromium session `luna05keep2` 先加载桌面页面再 resize 到手机，避免 `font-display: optional` 的首载字体条件改变 oracle。1440×900 与390×844分别采集仓库区68元素；相对 x/y、w/h、margin、padding、颜色、tag/class/text 均与 `keep-warehouses/before-style.json` 差异 0（≤1px 判定），两端 `document/body.scrollWidth` 均等于 viewport。元素级与首屏截图为 [south-warehouse-element-1440.png](../output/playwright/xyy-20260915-05/luna/south-warehouse-element-1440.png)、[south-warehouse-element-390.png](../output/playwright/xyy-20260915-05/luna/south-warehouse-element-390.png)、[south-warehouse-1440x900.png](../output/playwright/xyy-20260915-05/luna/south-warehouse-1440x900.png)、[south-warehouse-390x844.png](../output/playwright/xyy-20260915-05/luna/south-warehouse-390x844.png)，原始快照/几何/对比日志见 [browser-1440-snapshot.txt](../output/playwright/xyy-20260915-05/luna/browser-1440-snapshot.txt)、[browser-390-snapshot.txt](../output/playwright/xyy-20260915-05/luna/browser-390-snapshot.txt)、[browser-1440-geometry.json](../output/playwright/xyy-20260915-05/luna/browser-1440-geometry.json)、[browser-390-geometry.json](../output/playwright/xyy-20260915-05/luna/browser-390-geometry.json)、[browser-1440-style-compare.txt](../output/playwright/xyy-20260915-05/luna/browser-1440-style-compare.txt)、[browser-390-style-compare.txt](../output/playwright/xyy-20260915-05/luna/browser-390-style-compare.txt)。
- 独立浏览器确认静音视频在首屏可见时 `currentTime` 从 `5.343932` 增至 `6.120027`、`paused=false`、`muted=true`；FAQ 原生 summary 经 Enter 展开，CTA 经 focus 命中。原始交互与视频日志为 [browser-interactions.txt](../output/playwright/xyy-20260915-05/luna/browser-interactions.txt)、[browser-video-visible.txt](../output/playwright/xyy-20260915-05/luna/browser-video-visible.txt)、[browser-video-state.txt](../output/playwright/xyy-20260915-05/luna/browser-video-state.txt)、[browser-video-play.txt](../output/playwright/xyy-20260915-05/luna/browser-video-play.txt)。

Regression coverage: 覆盖 South 9 地址、原6 features 映射、原5 FAQ/4 stats、首屏媒体/CTA、三业务入口/资源确认/运输参考、无旧六区流程、no-JS、真实 script 阻断、FAQ/CTA 键盘、AstroContainer partial/empty、1440/390 仓库逐元素几何与 overflow；最终相关单测4/4、边界2/2、South E2E10/10、冻结 hash15/15 通过。Sol 已独立完成保护 hash 与其余8路由语义核对，本轮未重复全站矩阵。

Remaining risks: 仅验证本地 `127.0.0.1:4322`、headless Chromium 模拟视口和 AstroContainer 离线输入，未覆盖真实设备、构建产物、部署环境或真实 CMS；未运行 build/fullverify。首轮独立 CLI 曾因无 DISPLAY 无法 headed 启动，headless 独立 session 已完成全部浏览器检查。手机 stat 盒宽差异只在新文档首载回退字体时出现；按与 oracle 相同的桌面加载后 resize 序列为0差异，且可见文本位置/样式通过，记录为未改动字体加载条件限制，不构成实现 FAIL。

Evidence: [keep-warehouses-prep-manifest.json](../output/playwright/xyy-20260915-05/luna/keep-warehouses-prep-manifest.json)、[freeze-hashes-check.txt](../output/playwright/xyy-20260915-05/luna/freeze-hashes-check.txt) 及上述命令日志、JSON、截图。

Handoff: 返回 Sol → Nova；Luna 仅新增本任务独立 evidence、边界 fixture 与本日志，未修改应用实现、既有测试、媒体、依赖、配置、CMS、数据库或外部环境。

### XYY-20260915-06 — South 仓库面板 CSS 独立验证

Task ID: XYY-20260915-06

Result: PASS

Tests performed:

- 按合同仅运行一次现有 South E2E：`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-south.spec.ts --project=chromium --project=mobile --workers=1`，10 passed、0 failed、0 skipped；原始日志见 [south-e2e.stdout.txt](../output/playwright/xyy-20260915-06/luna/south-e2e.stdout.txt)。
- 独立 headless Chromium session `luna06` 通过一次循环在 1440×900、390×844 加载页面并采集截图/geometry。四个城市面板均为 `rgb(244, 241, 236)`、四边 `0px`、`box-shadow:none`；仓库列表桌面 2 列、手机 1 列，仓库行和服务说明边线均为 `0px`。9 条名称/地址逐字一致，长地址均在容器内换行，`document/body.scrollWidth` 分别为 1440/390。证据见 [browser-visual.json](../output/playwright/xyy-20260915-06/luna/browser-visual.json)、[south-warehouse-1440.png](../output/playwright/xyy-20260915-06/luna/south-warehouse-1440.png)、[south-warehouse-390.png](../output/playwright/xyy-20260915-06/luna/south-warehouse-390.png)。
- 执行 Terra freeze 清单核对：`sha256sum -c output/playwright/xyy-20260915-06/terra/freeze-hashes.txt`，`south-nodes.css`、South E2E、`docs/TERRA.md`、freeze 文档共 4/4 `OK`，原始输出见 [freeze-hashes-check.txt](../output/playwright/xyy-20260915-06/luna/freeze-hashes-check.txt)。

Regression coverage: 覆盖 4 个暖灰无边框/无阴影城市面板、桌面 2×2/手机单列、9 地址、长文本换行、面板及内部边线、整页 overflow、no-JS、script 阻断、原 South DOM/FAQ/CTA/媒体与现有 E2E 回归。Sol 已独立完成 1297 项保护 hash 及非仓库内容/媒体/metadata/尺寸核对。

Remaining risks: 仅验证本地 `127.0.0.1:4322`、headless Chromium 模拟视口；未运行 build、fullverify、typecheck、单测、AstroContainer、真实 CMS、真实设备或部署环境检查。未发现实现 FAIL 或环境阻塞。

Evidence: [result.json](../output/playwright/xyy-20260915-06/luna/result.json) 及上述原始日志、JSON、截图。

Handoff: 返回 Sol → Nova；Luna 仅新增本任务 `luna/` 证据和本日志，未修改应用实现、业务数据、既有测试逻辑、CMS、数据库或外部环境。

### XYY-20260915-07 — South 业务入口与资源确认 CSS 独立验证

Task ID: XYY-20260915-07

Result: PASS

Tests performed:

- 按合同仅运行一次现有 South E2E：`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-south.spec.ts --project=chromium --project=mobile --workers=1`，10 passed、0 failed、0 skipped；原始日志见 [south-e2e.stdout.txt](../output/playwright/xyy-20260915-07/luna/south-e2e.stdout.txt)。
- 独立 headless Chromium session `luna07` 在 1440×900、390×844 各采集业务区实际 geometry 与全页截图。1440 业务内容为 3 列、资源确认内容为 2×2；390 两者均为单列。三项业务标题和四项资源标题逐项存在，业务区边框命中数为 0，资源面板为 `rgb(244, 241, 236)`、四边 `0px`、阴影 `none`；两端均无 sibling overlap，`document/body.scrollWidth` 等于 viewport，9 条仓库地址仍逐字可读。证据见 [browser-visual.json](../output/playwright/xyy-20260915-07/luna/browser-visual.json)、[south-business-1440.png](../output/playwright/xyy-20260915-07/luna/south-business-1440.png)、[south-business-390.png](../output/playwright/xyy-20260915-07/luna/south-business-390.png)。
- 执行 Terra freeze hash 核对。`freeze-hashes.txt` 首行是未标记的 CSS 行数，直接 `sha256sum -c` 会给出格式 warning；去掉该元数据行后，`south-content.css` hash 为 1/1 `OK`，原始结果见 [freeze-hashes-check.txt](../output/playwright/xyy-20260915-07/luna/freeze-hashes-check.txt) 和 [freeze-hash-valid-check.txt](../output/playwright/xyy-20260915-07/luna/freeze-hash-valid-check.txt)。未修改 Terra freeze 文件。

Regression coverage: 覆盖三业务内容三列/单列、四项资源确认 2×2/单列、业务区无横竖边线、资源面板背景/边框/阴影、无覆盖与横溢出、9 地址、no-JS、script 阻断及现有 South E2E。Sol 已独立完成 1298 项保护 hash、业务 HTML、非业务区域、链接、metadata、media 与其他回归。

Remaining risks: 仅验证本地 `127.0.0.1:4322`、headless Chromium 模拟视口；未运行 build、fullverify、单测、AstroContainer、真实 CMS、真实设备或部署环境检查。freeze hash 文件含行数头部，已单独验证有效 hash 行通过；未发现实现 FAIL 或环境阻塞。

Evidence: [result.json](../output/playwright/xyy-20260915-07/luna/result.json) 及上述原始 E2E、geometry JSON、截图和 hash 日志。

Handoff: 返回 Sol → Nova；Luna 仅新增本任务 `luna/` 证据和本日志，未修改应用实现、测试、业务数据、CMS、数据库或外部环境。

### XYY-20260915-08 — South Hero CSS 独立验证

Task ID: XYY-20260915-08

Result: PASS

Tests performed:

- 按合同仅运行指定首项 South E2E：`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-south.spec.ts --grep 'south network restores its prior sections' --project=chromium --project=mobile --workers=1`，2 passed、0 failed、0 skipped；原始日志见 [south-hero-e2e.stdout.txt](../output/playwright/xyy-20260915-08/luna/south-hero-e2e.stdout.txt)。
- 独立 headless Chromium session `luna08` 在 1440×900、390×844 实际采集首屏。两端背景均为 `rgb(248, 248, 246)`；视频圆角分别为 32px/24px，保持约 16:9；H1 第一 span 与第二 span 字号比均为 0.66，无重叠；4 个城市胶囊均为 `rgb(237, 237, 232)`、999px 圆角，无重叠或横溢出。视频 `readyState=4`、muted/autoplay/loop/playsInline 均为 true、controls=false，两个视口 currentTime 均推进。证据见 [browser-visual.json](../output/playwright/xyy-20260915-08/luna/browser-visual.json)、[hero-1440.png](../output/playwright/xyy-20260915-08/luna/hero-1440.png)、[hero-390.png](../output/playwright/xyy-20260915-08/luna/hero-390.png)。
- 执行 Terra freeze hash 核对：去除 `freeze-hashes.txt` 首行行数元数据后，3 个有效 hash（`south-layout.css`、`docs/TERRA.md`、freeze 文档）均 `OK`；原始结果见 [freeze-hashes-check.txt](../output/playwright/xyy-20260915-08/luna/freeze-hashes-check.txt) 与 [freeze-hash-valid-check.txt](../output/playwright/xyy-20260915-08/luna/freeze-hash-valid-check.txt)。

Regression coverage: 覆盖指定 South 首项 E2E、两端首屏背景、视频圆角/尺寸/播放属性与时间推进、H1 层级、城市胶囊、文字边界及 overflow。Sol 已独立完成 1298 项保护文件、正文/hero HTML、非 hero 样式、metadata、links 与 video HTML 对比。

Remaining risks: 仅验证本地 `127.0.0.1:4322`、headless Chromium 模拟视口；未运行全套 E2E、build、fullverify、单测、AstroContainer、真实 CMS、真实设备或部署环境检查。freeze hash 文件含行数头部，已单独验证有效 hash 行通过；未发现实现 FAIL 或环境阻塞。

Evidence: [result.json](../output/playwright/xyy-20260915-08/luna/result.json) 及上述原始 E2E、geometry JSON、截图和 hash 日志。

Handoff: 返回 Sol；Luna 仅新增本任务 `luna/` 证据和本日志，未修改应用实现、测试、业务数据、CMS、数据库或外部环境。

### XYY-20260915-09 — South 首屏说明文字减重独立验证

Task ID: XYY-20260915-09

Result: PASS

Tests performed:

- 独立 headless Chromium session `luna09` 在 1440×900、390×844 实际检查说明文字。小标题均为 15px/600、`rgb(72, 76, 74)`；正文均为 15px/400、`rgb(98, 102, 96)`、28.8px 行高；标题与正文间距为 8.8px。正文完整，无覆盖或横向溢出。
- 同时确认原 hero 背景、H1 比例、4 个城市胶囊与视频保持：背景 `rgb(248, 248, 246)`，H1 第一/第二 span 比例 0.66，城市胶囊 4 个，视频 muted/autoplay/loop/playsInline、controls=false，两个视口 currentTime 均推进。
- Freeze SHA-256：`sha256sum -c output/playwright/xyy-20260915-09/terra/freeze-hashes.txt`，`south-layout.css` 为 1/1 `OK`；原始日志见 [freeze-hashes-check.txt](../output/playwright/xyy-20260915-09/luna/freeze-hashes-check.txt)。computed JSON 与截图见 [browser-visual.json](../output/playwright/xyy-20260915-09/luna/browser-visual.json)、[hero-copy-1440.png](../output/playwright/xyy-20260915-09/luna/hero-copy-1440.png)、[hero-copy-390.png](../output/playwright/xyy-20260915-09/luna/hero-copy-390.png)。

Regression coverage: 覆盖两端说明文字字号、字重、颜色、行高、间距、完整性、无覆盖/overflow，并复核主标题、城市胶囊、背景和视频属性。Sol 已独立完成 1298 项保护文件及全文、DOM、SEO、链接、媒体、非首屏样式对比。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 和 headless Chromium 模拟视口；未运行 E2E、build、fullverify、单测、AstroContainer、真实 CMS、真实设备或部署环境检查。未发现实现 FAIL 或环境阻塞。

Evidence: [result.json](../output/playwright/xyy-20260915-09/luna/result.json) 及上述 computed JSON、截图和 hash 日志。

Handoff: 返回 Sol；Luna 仅新增本任务 `luna/` 证据和本日志，未修改应用实现、测试、数据、CMS、数据库或外部环境。

### XYY-20260915-10 — South Hero CMS 长句展示映射独立验证

Task ID: XYY-20260915-10

Result: PASS

Tests performed:

- 按合同运行 `npx vitest run tests/unit/service-redesign-south.test.ts`：5/5 passed；运行指定 South 首项 E2E `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-south.spec.ts --grep 'south network restores its prior sections' --project=chromium --project=mobile --workers=1`：2/2 passed。原始日志见 [south-unit.stdout.txt](../output/playwright/xyy-20260915-10/luna/south-unit.stdout.txt) 与 [south-hero-e2e.stdout.txt](../output/playwright/xyy-20260915-10/luna/south-hero-e2e.stdout.txt)。
- 独立 headless Chromium session `luna10` 在 1440×900、390×844 确认批准短句精确出现 1 次，旧长句不在 hero，标题原样；intro 左侧 3px 灰竖线、19.2px 左内距，正文 15px/400、`rgb(98, 102, 96)`、27px 行高、5px 上距。两端均无文字覆盖或横溢出。
- 同时确认 hero 背景、H1 比例、4 个胶囊和视频保持；视频 muted/autoplay/loop/playsInline、controls=false，两个视口 currentTime 均推进。wrapper 源码审读确认 `(content.h1sub || content.heroDesc)` 两字段为空时不渲染 intro，`服务内容暂不可用` 分支保留。证据见 [browser-visual.json](../output/playwright/xyy-20260915-10/luna/browser-visual.json)、[wrapper-review.txt](../output/playwright/xyy-20260915-10/luna/wrapper-review.txt)、[hero-intro-1440.png](../output/playwright/xyy-20260915-10/luna/hero-intro-1440.png)、[hero-intro-390.png](../output/playwright/xyy-20260915-10/luna/hero-intro-390.png)。
- `sha256sum -c output/playwright/xyy-20260915-10/terra/freeze-hashes.txt`：五个冻结文件 5/5 `OK`，原始日志见 [freeze-hashes-check.txt](../output/playwright/xyy-20260915-10/luna/freeze-hashes-check.txt)。

Regression coverage: 覆盖精确旧长句映射、短句/空值/自定义值/近似值边界（unit 5/5）、首项 E2E 两端、短句计数、旧句排除、标题/intro 视觉、H1/胶囊/背景/视频、包装条件及 unavailable 分支。Sol 已完成 1294 项保护文件和非 hero/全页内容对比。

Remaining risks: 仅验证本地 `127.0.0.1:4322`、headless Chromium 模拟视口；未连接或写入真实 CMS，未运行 full E2E、build、fullverify、真实设备或部署环境检查。未发现实现 FAIL 或环境阻塞。

Evidence: [result.json](../output/playwright/xyy-20260915-10/luna/result.json) 及上述原始 stdout、computed JSON、wrapper 审读、截图和 hash 日志。

Handoff: 返回 Sol → Nova；Luna 仅新增本任务 `luna/` 证据和本日志，未修改应用实现、测试、CMS、数据库或外部环境。

### XYY-20260915-11 — South 单位映射、公开文案与 FAQ 独立验证

Task ID: XYY-20260915-11

Result: PASS

Tests performed:

- 按合同运行 `npx vitest run tests/unit/service-redesign-south.test.ts`：6/6 passed，原始输出见 [south-unit.stdout.txt](../output/playwright/xyy-20260915-11/luna/south-unit.stdout.txt)。
- 按合同运行 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-south.spec.ts --project=chromium --project=mobile --workers=1`：12/12 passed，原始输出见 [south-e2e.stdout.txt](../output/playwright/xyy-20260915-11/luna/south-e2e.stdout.txt)。该次完整运行发生在授权修正 H2 探针之前。
- 将 H2 断言收紧为直接读取两个 locator 元素，并断言元素数为 2；这是测试文件内的最小 QA 修正，未改应用实现。修正后按 `--grep 'south presentation keeps the public copy'` 在 chromium/mobile 定向复测：2/2 passed，见 [south-public-copy-e2e-corrected.stdout.txt](../output/playwright/xyy-20260915-11/luna/south-public-copy-e2e-corrected.stdout.txt)。
- 独立 headless Chromium session `luna11` 复核 1440×900 与 390×844：仓库区桌面 2 列、手机 1 列；业务区桌面 3 业务列及资源 2×2、手机单列；9 个仓库地址逐字一致、可读且无横溢出；warehouse/business H2 分别为桌面 64.8px/900、手机 35.1px/900 且两者相等。FAQ 可见 5 组问答与 FAQPage JSON-LD 一致，South 公开页和 schema 均无内部表达；业务区无分隔线，页面无横向 overflow/重叠。视频保持 muted/autoplay/loop/playsInline、controls=false，两个视口 `currentTime` 均推进；CTA focus 通过。完整 computed/DOM 证据见 [browser-visual.json](../output/playwright/xyy-20260915-11/luna/browser-visual.json)。
- 保存独立仓库与业务区两端截图：[south-warehouse-1440.png](../output/playwright/xyy-20260915-11/luna/south-warehouse-1440.png)、[south-warehouse-390.png](../output/playwright/xyy-20260915-11/luna/south-warehouse-390.png)、[south-business-1440.png](../output/playwright/xyy-20260915-11/luna/south-business-1440.png)、[south-business-390.png](../output/playwright/xyy-20260915-11/luna/south-business-390.png)。截图为目标元素独立捕获；固定工具条在部分原始捕获中可见，不作为页面布局内容判定。hero 两端截图也已保存。
- 冻结 hash：排除测试探针变更后，10 个应用/单测冻结条目全部 `OK`，原始输出见 [freeze-source-hashes-check.txt](../output/playwright/xyy-20260915-11/luna/freeze-source-hashes-check.txt)。完整清单仅 E2E 测试条目因本次授权 QA 修正而 `FAILED`，见 [freeze-hashes-check.txt](../output/playwright/xyy-20260915-11/luna/freeze-hashes-check.txt)；当前测试 hash 单列记录为 [test-hash-after-qa-fix.txt](../output/playwright/xyy-20260915-11/luna/test-hash-after-qa-fix.txt)（`a434072131fd8b443c4827b34daa6ae0c3c5805f09aba9e7c33da45eeefdb6a6`）。

Regression coverage: 覆盖 South 单位映射边界、直接 H2 字号/字重一致性、4 城 9 地址、仓库列布局、业务三列/资源四项、公开文案与 FAQ schema、内部表达清理、页面 overflow/重叠、no-JS/module blocking/CTA focus，以及 hero 视频属性和时间推进。Sol 已完成保护文件、正文/非业务区域、metadata、links、媒体等前后审计，本日志不重复扩展全站矩阵。

Remaining risks: 仅验证复用本地 `127.0.0.1:4322` 的 headless Chromium 模拟视口；未运行 build/fullverify、全站矩阵、真实设备、部署环境或真实 CMS/数据库操作。完整 12 项 E2E 日志在测试探针修正前，修正后的相关场景已在两个项目 2/2 复测通过。若保留该测试修正，Terra freeze manifest 需将 E2E 测试 hash 更新为上述当前值；应用冻结条目无差异。

Evidence: [result.json](../output/playwright/xyy-20260915-11/luna/result.json)、[browser-visual.json](../output/playwright/xyy-20260915-11/luna/browser-visual.json)、原始 Vitest/Playwright stdout、两端仓库/业务截图及 freeze hash 日志。

Handoff: 返回 Sol → Nova；Luna 仅新增本任务 `luna/` 证据、测试文件内授权的 H2 断言修正与本日志，未修改应用实现、CMS、数据库或外部环境。

### XYY-20260915-13 — 华东鞋服云仓改版独立验证（预检 FAIL）

Task ID: XYY-20260915-13

Result: FAIL（预检阻塞，已返回 Sol）

Expected: `EastServiceInfo` 应接收 East 页面 `contentDesc` 并在服务信息区展示；冻结源码须先通过 Astro 类型检查，才能进入 East 浏览器验收。

Actual: `npx astro check` 在 `src/components/service/redesign/EastInventoryPage.astro:38` 报 `TS2322`：调用 `<EastServiceInfo {stats} />` 缺少 Props 要求的 `contentDesc`。4322 路由虽返回 HTTP 200，但实际 `east-service-info` header 未输出 route 的 contentDesc 段落。

Reproduction: 已执行 `npx astro check`；并以 `curl --max-time 10 -sS ... http://127.0.0.1:4322/huadong-xiefu-yuncang` 做只读响应核对。原始证据见 [astro-check.stdout.txt](../output/playwright/xyy-20260915-13/luna/astro-check.stdout.txt)、[east-route-curl.stdout.txt](../output/playwright/xyy-20260915-13/luna/east-route-curl.stdout.txt)、[east-route-response.html](../output/playwright/xyy-20260915-13/luna/east-route-response.html) 与 [preflight-fail.json](../output/playwright/xyy-20260915-13/luna/preflight-fail.json)。

Likely affected area: `EastInventoryPage.astro` 到 `EastServiceInfo.astro` 的 prop wiring/`contentDesc` 展示；自定义 contentDesc 可能丢失，且当前类型检查失败。

Severity: HIGH（冻结验收阻塞；不是仅视觉差异）。Luna 未修改应用实现；依赖当前冻结源码的完整 East E2E、AstroContainer/partial fixture 和浏览器矩阵暂停，等待 Terra 定向修复及 Sol 新 freeze。

### XYY-20260915-13 — 华东鞋服云仓改版独立复测

Task ID: XYY-20260915-13

Result: PASS（返工 1 新 freeze 后复测；首轮缺 `contentDesc` 的 FAIL 记录保留在本节前）

Tests performed:

- East 单测 `npx vitest run tests/unit/service-redesign-east.test.ts`：4/4 passed，覆盖精确 legacy → public 映射、空/自定义/近似值原样保留与输入 immutable、6 项 feature 分组各一次、未知 feature/stat 和 unavailable 判定。原始输出：[east-unit.stdout.txt](../output/playwright/xyy-20260915-13/luna/east-unit.stdout.txt)。
- 真实 AstroContainer 边界夹具 `npx vitest run --config output/playwright/xyy-20260915-13/luna/service-redesign-east-render.vitest.config.ts`：3/3 passed，覆盖全空、局部未知 feature/stat、自定义 contentDesc/FAQ，以及空 contentDesc/空 stats 不生成 service-info。原始输出：[east-render.stdout.txt](../output/playwright/xyy-20260915-13/luna/east-render.stdout.txt)。
- `npx astro check`：491 files，0 errors/0 warnings/0 hints；局部 Prettier、ESLint 通过。原始输出：[astro-check-final.stdout.txt](../output/playwright/xyy-20260915-13/luna/astro-check-final.stdout.txt)、[format-check.stdout.txt](../output/playwright/xyy-20260915-13/luna/format-check.stdout.txt)、[eslint-check.stdout.txt](../output/playwright/xyy-20260915-13/luna/eslint-check.stdout.txt)。
- East E2E：`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-east.spec.ts --project=chromium --project=mobile --workers=1`，4/4 passed；共享矩阵：`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-pages.spec.ts --grep 'shared service landing layout renders every visual variant' --project=chromium --project=mobile --workers=1`，2/2 passed。原始输出：[east-e2e.stdout.txt](../output/playwright/xyy-20260915-13/luna/east-e2e.stdout.txt)、[shared-service-pages-east-matrix.stdout.txt](../output/playwright/xyy-20260915-13/luna/shared-service-pages-east-matrix.stdout.txt)。
- 独立 CLI session `luna13` 复核 1440×900、768×900、390×844：七区顺序正确；3 仓地址逐字、完整可读；6 feature、3 业务服务、3 协作项、2 服务信息卡、5 FAQ 与 FAQPage schema 对齐；Service description 与 meta 一致；公开页面无内部表达，装饰边线为 0，地址无重叠，document scrollWidth 等于 viewport；CTA 为 `/contact`；视频 source/poster、muted/autoplay/loop/playsInline、controls=false 和三个视口时间推进均通过。证据：[browser-independent.json](../output/playwright/xyy-20260915-13/luna/browser-independent.json)。
- 保存三端独立全页截图：[east-luna-1440.png](../output/playwright/xyy-20260915-13/luna/east-luna-1440.png)、[east-luna-768.png](../output/playwright/xyy-20260915-13/luna/east-luna-768.png)、[east-luna-390.png](../output/playwright/xyy-20260915-13/luna/east-luna-390.png)。
- 新 Terra freeze SHA-256：17/17 `OK`，原始输出：[freeze-hashes-check.txt](../output/playwright/xyy-20260915-13/luna/freeze-hashes-check.txt)；source-freeze.json 同样 17/17 OK。Terra 行预算记录已审阅，合计 1107 行，未发现本次范围内预算阻塞。

Regression coverage: 覆盖 East 页面 7 区结构、三仓地址、6 feature/4 stats/5 FAQ、精确展示映射和空/自定义/未知边界、真实组件输出、FAQ schema/meta、1440/768/390 排版、无边线/overflow/遮挡、键盘 FAQ、no-JS、CTA、hero 视频静音循环播放，以及共享 service landing 的 chromium/mobile 矩阵。Sol 已完成保护文件、其他路由、SEO、links、media 与前后源审计，本次不重复全站矩阵。

Remaining risks: 验证限复用本地 `127.0.0.1:4322` 与 headless Chromium 模拟视口；未运行 build/fullverify、无关全站测试、真实设备、部署、真实 CMS 写入或数据库操作。首轮 `EastServiceInfo` 缺 `contentDesc` 的类型/局部输出 FAIL 已由 Terra 定向修复并在新 freeze 后通过 Astro check、AstroContainer 与浏览器验证；不代表历史 FAIL 被隐藏。

Evidence: [result.json](../output/playwright/xyy-20260915-13/luna/result.json) 及上述原始命令日志、JSON、截图、freeze hash 和首轮 [preflight-fail.json](../output/playwright/xyy-20260915-13/luna/preflight-fail.json)。

Handoff: 返回 Sol → Nova；Luna 仅修改授权 East 测试/fixture、`docs/LUNA.md` 与 `13/luna` 证据，未修改应用实现、CMS、数据库、部署环境或外部系统。

### XYY-20260916-03 — 直播电商仓配七区独立验证（首轮 FAIL）

Task ID: XYY-20260916-03

Result: FAIL

Expected: 仅有自定义 `contentDesc` 的 CMS 内容应保留原文，不补出无关的场次、库存或 CTA 固定业务段；768px hero/库存布局及 MCN 四组标题、正文应保持可读分组；库存准确率指标使用客户语言，限定解释放在 FAQ。

Actual: AstroContainer 传入仅含 `contentDesc`、空 features/stats/FAQs 后，仍输出 `live-stages`、三段固定场次文案、静态库存接入区和 CTA；contentDesc-only 回归测试 1 项失败。768px 页面仍使用双栏，hero 文案宽 303px、视频宽 379px；库存外层宽 720px，其中标题 224px、内容块 450px。四组 MCN 的 `b` 与 `span` 均为 inline 且纵坐标相同，标题与说明连在一行。当前库存统计描述为“库存准确率 · 仓内库存准确率，不表示同步速度或零超卖”。

Reproduction: `npx vitest run --config output/playwright/xyy-20260916-03/luna/live-render.vitest.config.ts`：1 failed，失败位置为 `tests/unit/service-redesign-live-render.test.ts:36`；`npx vitest run tests/unit/service-redesign-live.test.ts`：2 passed；`PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-live.spec.ts --project=chromium --project=mobile --workers=1`：4 passed；本地 Live 路由 HTTP 200。

Evidence: [result.json](../output/playwright/xyy-20260916-03/luna/result.json)、[live-render.stdout.txt](../output/playwright/xyy-20260916-03/luna/live-render.stdout.txt)、[live-e2e.stdout.txt](../output/playwright/xyy-20260916-03/luna/live-e2e.stdout.txt)、[live-unit.stdout.txt](../output/playwright/xyy-20260916-03/luna/live-unit.stdout.txt)、[rendered-stats.txt](../output/playwright/xyy-20260916-03/luna/rendered-stats.txt)、三端视口截图 [1440](../output/playwright/xyy-20260916-03/luna/live-1440.png)、[768](../output/playwright/xyy-20260916-03/luna/live-768.png)、[390](../output/playwright/xyy-20260916-03/luna/live-390.png)；Sol 的局部截图 [tablet-hero](../output/playwright/xyy-20260916-03/tablet-hero.png)、[tablet-inventory](../output/playwright/xyy-20260916-03/tablet-inventory.png)、[mobile-mcn](../output/playwright/xyy-20260916-03/mobile-mcn.png)。当前相关源码/测试哈希见 [source-hashes-at-fail.txt](../output/playwright/xyy-20260916-03/luna/source-hashes-at-fail.txt)。

Likely affected area: `LiveCommercePage.astro`/`content-presence.ts` 的可用内容门控、`LiveStages.astro` 与 `LiveSync.astro` 的固定区域门控、`LiveMcn.astro` 与 Live CSS 的标题/正文排版、`live-public-copy.ts` 的库存指标说明。

Severity: MEDIUM（CMS 局部内容会带出无关默认业务段，并存在平板可读性与公开指标文案问题）。

Tests performed: 当前 Live 单测 2/2、Chromium/mobile 指定 E2E 4/4 通过；新增 AstroContainer contentDesc-only 回归复现 1/1 失败。截图使用本地 headless Chromium 模拟视口。

Regression coverage: 现有测试覆盖分组、390px 常规页面和 360px no-JS 可见性；新增组件边界测试复现局部 CMS 数据导致固定内容泄漏。

Remaining risks: 按 Sol 要求在首轮 FAIL 后停止扩展旧版本验证。stage 方向键/Home/End/Enter/Space、reduced-motion、完整 FAQ 与 Schema 一致性、三端完整验收和真实设备尚待同一 Task ID 返工后复测。本轮未运行全量 verify/build，未执行 CMS/数据库写入、部署或生产检查。

Handoff: 已返回 Sol 等待 Terra 定向修复；Luna 仅新增授权范围内的一项组件回归测试、日志与本任务证据，未修改应用实现。

### XYY-20260916-03 — 直播电商仓配七区独立复测 1

Task ID: XYY-20260916-03

Result: FAIL（返工版复测发现两项交互验收缺口；本轮按 Sol 指示停止对该版本继续验证）

Expected: 阶段面板切换有 180ms 淡入并尊重 reduced-motion；禁用 JavaScript 时阶段正文仍可读，且不显示无效 tab 控件。

Actual: 本轮记录的冻结快照中，阶段切换没有正常动效要求的 180ms 淡入；无 JS 时 SSR tablist 按钮仍可见，但脚本未运行、没有交互处理。上述两项是本轮确认的产品 FAIL。原首轮 `contentDesc-only` 门控、响应式布局、MCN 排版与指标文案问题属于此前记录；Sol 已完成对应视觉复核，本条不重复认定。

Reproduction: 观察快照来源为 [scope-check.json](../output/playwright/xyy-20260916-03/scope-check.json) 中 15 项应用源文件 hash。当前 Live E2E 文件已加入淡入与无 JS tablist 断言，但本轮停测前未执行这组新断言；此前 [live-e2e.stdout.txt](../output/playwright/xyy-20260916-03/luna/live-e2e.stdout.txt) 的 4/4 是旧断言的历史结果，不作为本次两项验收通过证据。

Evidence: [retest-1-result.json](../output/playwright/xyy-20260916-03/luna/retest-1-result.json)、[live-render-retest.stdout.txt](../output/playwright/xyy-20260916-03/luna/live-render-retest.stdout.txt)、[live-unit-retest.stdout.txt](../output/playwright/xyy-20260916-03/luna/live-unit-retest.stdout.txt)、[prettier-retest.stdout.txt](../output/playwright/xyy-20260916-03/luna/prettier-retest.stdout.txt)。真实 AstroContainer 专用夹具已移出默认 `tests/unit` 收集目录，位于 `output/playwright/xyy-20260916-03/luna/live-render.test.ts`，通过专用 Astro Vitest config 运行；未修改共享 Vitest 配置。

Tests performed: AstroContainer CMS 边界测试 4/4 passed，覆盖 contentDesc-only、FAQ-only、full empty、partial unknown/empty FAQ。纯映射单测 3 passed、1 failed；失败是新增测试夹具从 `oldContent` 展开后仍留下应被映射的 exact 旧文案，不能据此判为应用缺陷。局部 Prettier 命令报告两个 Live 测试文件 unchanged。E2E 新断言、默认 `npm test` 收集、完整键盘交互和最终三视口矩阵均未运行。

Likely affected area: `LiveStages.astro` / `live-stages.ts` / Live CSS 的 no-JS tablist 门控与面板淡入实现。

Severity: MEDIUM。

Remaining risks: 源码快照以 `scope-check.json` 内 15 项应用 hash 为准；随后观察到相关工作树文件已有变动，本条不宣称那些后续变动已验证。纯映射夹具和新 E2E 断言尚未完成定向修整/执行。最终冻结版需再测点击、方向键、Home/End、Enter/Space、reduced-motion、1440/768/390、七区/feature/stat/FAQ 与 Schema、视频属性及完整 CMS 边界。

### XYY-20260916-03 — 直播电商仓配七区独立最终复测

Task ID: XYY-20260916-03

Result: PASS

Tests performed:

- `npx vitest run tests/unit/service-redesign-live.test.ts`：1 file，4/4 tests passed。将 preserve fixture 中继承的旧文案字段改成自定义或空值后，输入保持断言通过。
- `npx vitest run --config output/playwright/xyy-20260916-03/luna/live-render.vitest.config.ts`：1 file，4/4 passed，覆盖 contentDesc-only、FAQ-only、全空、partial unknown/empty FAQ。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-live.spec.ts --project=chromium --project=mobile --workers=1`：初次运行4/4 passed。复核发现 tablet geometry 读取时 viewport 已是390px；测试断言现先显式设为768px，再设回390px检查移动 tab。
- 修正后的定向复测 `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-redesign-live.spec.ts --project=chromium --project=mobile --workers=1 --grep="controls, content, media, and responsive layout"`：2/2 passed。no-JS 两项在上述完整矩阵4/4中通过，且本次测试定位修正未改变 no-JS 用例。点击、上下/左右方向键、Home/End、Enter/Space 的焦点与选中状态、180ms fade、reduced-motion、no-JS 三面板与 tablist 隐藏、FAQ/JSON-LD 同文、视频属性、1440/768/390 横溢出、768 hero/库存纵排及 MCN 标题/正文块均通过。
- `npx prettier --check tests/unit/service-redesign-live.test.ts tests/e2e/service-redesign-live.spec.ts` 与 `npx eslint tests/unit/service-redesign-live.test.ts tests/e2e/service-redesign-live.spec.ts`：均通过；E2E 文件为 186 行。
- 对 `final-source-hashes.json` 中 15 项应用源码逐项复算并与 `scope-check.json` 比较：0 mismatch；排序映射汇总 SHA-256 为 `b67af007abbeead5d3fdd8b387237815dbc9e09db0839cad42732f23ba008f2f`。

Regression coverage: 本轮新增/收紧 stage 键盘激活与焦点、左右/上下方向键、Home/End、动画时长/减少动效、禁用 JS 后全部阶段正文可见、FAQ JSON-LD 与页面正文完全对应、七区/六能力/四统计/五 FAQ、视频自动静音循环属性，以及三视口横溢出和 768px 纵向排版断言。AstroContainer 边界矩阵仍位于 task evidence 目录，不进入默认 Vitest 收集。

Remaining risks: 浏览器验证复用已运行的本地 `127.0.0.1:4322`，headless Chromium 使用模拟视口；没有真实设备检查。本轮未核实该服务实际连接的 CMS 状态；CMS 边界使用离线 AstroContainer fixtures 验证，未写入 CMS。没有运行 `npm run verify`、build、数据库操作、部署或生产检查。Sol 的 `typecheck-final.txt`（497 files、0 diagnostics）、路由前后对比 `route-comparison.json` 与已审阅桌面/平板/手机截图作为补充证据，本轮未重复这些检查。

Evidence: [final-result.json](../output/playwright/xyy-20260916-03/luna/final-result.json)、[final-validation.stdout.txt](../output/playwright/xyy-20260916-03/luna/final-validation.stdout.txt)、[live-unit-final.stdout.txt](../output/playwright/xyy-20260916-03/luna/live-unit-final.stdout.txt)、[live-render-final.stdout.txt](../output/playwright/xyy-20260916-03/luna/live-render-final.stdout.txt)、[live-e2e-final.stdout.txt](../output/playwright/xyy-20260916-03/luna/live-e2e-final.stdout.txt)、[live-e2e-final-retest.stdout.txt](../output/playwright/xyy-20260916-03/luna/live-e2e-final-retest.stdout.txt)、[final-source-hashes.json](../output/playwright/xyy-20260916-03/final-source-hashes.json)、[desktop-final.png](../output/playwright/xyy-20260916-03/desktop-final.png)、[tablet-hero-final.png](../output/playwright/xyy-20260916-03/tablet-hero-final.png)、[tablet-inventory-final.png](../output/playwright/xyy-20260916-03/tablet-inventory-final.png)、[mobile-mcn-final.png](../output/playwright/xyy-20260916-03/mobile-mcn-final.png)。首次 FAIL 与返工复测 FAIL 记录均保留；返工结果 JSON 已从误放的 `task/luna/` 移至本任务 Luna evidence 目录并修复原日志链接。

Handoff: 独立最终验证 PASS，返回 Sol 进入 Nova Review；仅修改授权测试、日志与本任务证据，没有修改应用实现、共享测试配置、CMS、数据库或部署环境。

Handoff: 已返回 Sol；测试和应用源均未在本轮报告过程中改写。旧版首轮 FAIL 和本条 retest 结果分别保留，未覆盖历史证据。

### XYY-20260917-02 — 鞋服云仓八区改版独立验证

Task ID: XYY-20260917-02

Result: PASS

Tests performed:

- 初轮独立复现并报告 768px 履约 tab 缺陷：tablist `scrollWidth=2037`、`clientWidth=672`，三个按钮均宽672且后两项超出可视区，`aria-orientation="vertical"` 与横向布局不符。Terra 按原 Task ID 仅修复 `responsive.css` 与 `footwear-page.ts`，复测已通过。
- `npx vitest run tests/unit/footwear-content.test.ts`：1 file、2/2 passed，覆盖 exact 映射、q+a 配对、输入不可变、custom/near/unknown、重排分类与未知统计保留。
- `node output/playwright/xyy-20260917-02/fixtures/astro-container-boundaries.mjs`：AstroContainer 8/8 场景通过，覆盖 empty、description-only、contentDesc-only、FAQ-only、unknown-only、partner-only，以及删 FAQ 后完整能力和未知 feature/stat；脚本含失败即退出断言。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/footwear-page.spec.ts --project=chromium --project=mobile --workers=1`：8/8 passed。覆盖八区、六能力、四指标、五 FAQ、Service/metadata/FAQ Schema 同源、四段原视频属性与比例、切换实际播放、鼠标/键盘/Home/End/focus、reduced-motion、no-JS、链接与横溢出。
- E2E 断点矩阵 1440/961/960/768/390/360 均通过；最终 768/960/390/360 tablist 横溢出为0、三个胶囊完整可见，960及以下 `aria-orientation=horizontal`，961/1440 为 vertical。原始证据见 `retest-*.json`。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-pages.spec.ts --grep 'shared service landing layout' --project=chromium --project=mobile --workers=1`：共享矩阵 2/2 passed。
- 测试与 fixture `npx prettier --check`、`npx eslint` 均通过；Terra `source-sha256.manifest` 逐项复算 20/20 OK，聚合冻结 hash `c4fd16f4e9504b90a41ef75b76157c40c1b9efa3e0859b75b8cd329b365c973b`；测试/fixture 最终 hash 记录于 `final-test-fixture-hashes.txt`。

Regression coverage: 鞋服八区结构和内容去重、exact 双门控映射、未知/空/部分 CMS 边界、FAQ q+a 与 Schema、四视频原资源和实际播放、履约 tab 鼠标键盘与 no-JS、reduced-motion、1440/961/960/768/390/360 响应式几何、共享十路服务 landing 矩阵。未修改业务源码；仅新增/维护合同内单测、E2E、输出 fixture/config 与本日志。

Remaining risks: 浏览器为本地 `127.0.0.1:4322` 的 headless Chromium 与 mobile 模拟视口，未覆盖真实设备、生产环境和真实 CMS 连接；未运行全量 `npm run verify`、build、部署、CMS/数据库操作。旧 `service-redesign-live.spec.ts:52` implicit-any 与既有非本 Scope maintenance 预算错误未纳入本次结论。

Evidence: [footwear-unit-final.stdout.txt](../output/playwright/xyy-20260917-02/luna/footwear-unit-final.stdout.txt)、[astro-container-final.stdout.txt](../output/playwright/xyy-20260917-02/luna/astro-container-final.stdout.txt)、[footwear-e2e-final2.stdout.txt](../output/playwright/xyy-20260917-02/luna/footwear-e2e-final2.stdout.txt)、[shared-service-matrix.stdout.txt](../output/playwright/xyy-20260917-02/luna/shared-service-matrix.stdout.txt)、[desktop-contract-final.json](../output/playwright/xyy-20260917-02/luna/desktop-contract-final.json)、[tablet-tabs-bug.json](../output/playwright/xyy-20260917-02/luna/tablet-tabs-bug.json)、[final-source-hash-check.stdout.txt](../output/playwright/xyy-20260917-02/luna/final-source-hash-check.stdout.txt)、[final-test-fixture-hashes.txt](../output/playwright/xyy-20260917-02/luna/final-test-fixture-hashes.txt)。

Handoff: 返回 Sol → Nova；待 Nova Review。仅写入授权测试、输出 fixture/config 和本角色日志，未修改应用实现、CMS、数据库、生产环境或部署。

### XYY-20260917-02 — Nova 门控返工独立复测

Task ID: XYY-20260917-02

Result: PASS

Tests performed:

- `node output/playwright/xyy-20260917-02/fixtures/astro-container-boundaries.mjs`：14 个 AstroContainer 渲染场景通过（8 个空/部分/完整基础场景，另对六项已知能力逐项执行“缺项 + 同组重复项”矩阵）。每个缺项均未错误启用 `footwear-fulfillment`、`footwear-returns`、`footwear-cta`；完整六能力加额外重复能力与 unknown feature/stat 仍保留标准业务区及未知条目，输入序列未被渲染修改。
- `node output/playwright/xyy-20260917-02/fixtures/service-landing-gates.mjs`：2 个真实 `ServiceLanding.astro` 离线渲染通过。`presentation=footwear` 配合错误 slug 渲染 classic body、保留 fallback SEO title/canonical；精确 `xiefu-yuncang` 才渲染 Footwear body。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/footwear-page.spec.ts --grep "full page" --project=chromium --project=mobile --workers=1`：2/2 passed，定向覆盖八区内容、SEO/Service/FAQ JSON-LD 同源、四视频元数据与实际页面。
- `PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/service-pages.spec.ts --grep "shared service landing layout" --project=chromium --project=mobile --workers=1`：2/2 passed，共享服务矩阵回归。
- `npx vitest run tests/unit/footwear-content.test.ts`：2/2 passed。测试/fixture Prettier、ESLint 与 `git diff --check` 均通过。
- Terra `source-sha256.manifest`：20/20 OK；本次冻结聚合 hash 为 `f7049a4bf2da4b9d6d2e35810351332dd19e8ffeeddcbeb1e62771fa31997bb8`。测试/fixture hash 见 `final-test-fixture-hashes.txt`，本轮原始日志 hash 见 `final-raw-log-hashes-nova.txt`。

Regression coverage: 沿用此前已通过的 1440/961/960/768/390/360 响应式 tab 可见性、横溢出为0、aria orientation、键盘、no-JS、reduced-motion 与鼠标切换证据；本轮只对 Nova 改动的内容门控、slug/presentation 双门控、主页面内容/SEO 及共享矩阵执行定向回归。未修改应用实现。

Remaining risks: 浏览器为本地 `127.0.0.1:4322` 的 headless Chromium 与 mobile 模拟视口，未覆盖真实设备、生产环境或真实 CMS 连接；CMS 边界为纯离线 AstroContainer mock，未写入 CMS。未运行全量 `npm run verify`、build、部署、CMS/数据库操作。旧 `service-redesign-live.spec.ts:52` implicit-any 与既有非本 Scope maintenance 预算错误仍不纳入本结论。

Evidence: [astro-container-nova-final.stdout.txt](../output/playwright/xyy-20260917-02/luna/astro-container-nova-final.stdout.txt)、[service-landing-gates-nova-final.stdout.txt](../output/playwright/xyy-20260917-02/luna/service-landing-gates-nova-final.stdout.txt)、[footwear-e2e-nova-content-seo.stdout.txt](../output/playwright/xyy-20260917-02/luna/footwear-e2e-nova-content-seo.stdout.txt)、[shared-service-matrix-nova.stdout.txt](../output/playwright/xyy-20260917-02/luna/shared-service-matrix-nova.stdout.txt)、[footwear-unit-nova-final.stdout.txt](../output/playwright/xyy-20260917-02/luna/footwear-unit-nova-final.stdout.txt)、[final-source-hash-check-nova.stdout.txt](../output/playwright/xyy-20260917-02/luna/final-source-hash-check-nova.stdout.txt)、[final-test-fixture-hash-check-nova.stdout.txt](../output/playwright/xyy-20260917-02/luna/final-test-fixture-hash-check-nova.stdout.txt)、[final-test-fixture-hashes.txt](../output/playwright/xyy-20260917-02/luna/final-test-fixture-hashes.txt)、[final-raw-log-hashes-nova.txt](../output/playwright/xyy-20260917-02/luna/final-raw-log-hashes-nova.txt)。

Handoff: Nova 门控返工独立复测 PASS，返回 Sol → Nova Review；仅修改授权测试/fixture 与本角色日志，未修改应用实现、CMS、数据库、生产环境或部署。

### XYY-20260917-03 — 鞋服页三处展示微调独立复测

Task ID: XYY-20260917-03

Result: PASS

Tests performed:

- 使用独立 headless Chromium 对 `http://127.0.0.1:4322/xiefu-yuncang` 在 1440、768、390、360 宽度取证。四端页面与 body `scrollWidth/clientWidth` 均相等；首屏 `.footwear-hero__partner` 为 0 且首屏不含 `150+`，标题、介绍、胶囊、CTA、hero 视频保留。
- CTA 四端均为 `left=0`、`width=viewport`、`border-radius=0px`；内容安全内边距 1440/768 为 64/48px，390/360 为 16/16px，背景为浅灰。履约步骤在 1440/768 均为 3 列，在 390/360 均为单列，无文字碰撞。
- 在四个视口逐一点击 01/02/03 三个 tab，共 12 次阶段切换。三个阶段标题、短标题、灰色说明逐字与原内容一致；三个视频 source/poster、autoplay、loop、muted、playsInline、无 controls 均保持，激活后 `currentTime` 实际推进。
- 页面链接 href/文字数组与任务 browser-before 基线完全一致。1440 首阶段三列标题 top 均为 `3350.28125px`、说明 top 均为 `3376.203125px`，对齐返工通过。
- Terra `source-sha256.manifest`：7/7 `OK`；最终冻结 manifest 聚合 hash 为 `1969213c8cb22af20571a8d08ac0e822c43206ea3795d7804df73ac10b1e7ed1`。原始浏览器 JSON/log、几何对齐 JSON、截图及 evidence hashes 均保存在本任务 Luna 目录。

Regression coverage: 仅覆盖合同指定的首屏 partner 行、履约标题/步骤列布局、合作准备 CTA 全宽/方角/安全边距、四端 overflow/碰撞、三 tab 切换、原文数字与条件、视频属性与实际播放、页面链接和 7 个冻结源文件。未新增持久测试，未修改应用实现。

Remaining risks: 浏览器为本地 headless Chromium 与模拟视口，未覆盖真实设备、生产环境或真实 CMS；未运行全量 unit/E2E、build、`npm run verify`、CMS/数据库操作或部署。截图包含本地固定导航/工具条时，仅按目标元素几何判定，不作为目标区域内容。

Evidence: [browser-final.stdout.txt](../output/playwright/xyy-20260917-03/luna/browser-final.stdout.txt)、[browser-final.json](../output/playwright/xyy-20260917-03/luna/browser-final.json)、[alignment-final.json](../output/playwright/xyy-20260917-03/luna/alignment-final.json)、[source-hash-check.txt](../output/playwright/xyy-20260917-03/luna/source-hash-check.txt)、[evidence-sha256.txt](../output/playwright/xyy-20260917-03/luna/evidence-sha256.txt)，以及 `hero-*`, `fulfillment-*`, `cta-*`, `page-*` 四端截图。

Handoff: 独立复测 PASS，返回 Sol；仅写入授权 task/Luna 证据与本日志，未修改源代码、测试、CMS、数据库或外部环境。

### XYY-20260917-04 — 鞋服页合作准备 CTA 独立复测

Task ID: XYY-20260917-04

Result: PASS

Tests performed:

- 独立 headless Chromium 对本地 `/xiefu-yuncang` 在 1440/768/390/360 取证；四端 CTA 均为全宽浅灰背景，`left=0`、宽度等于 viewport、`border-radius=0px`，页面无横向溢出或 CTA 内容碰撞。
- 1440px `.footwear-cta__inner` 为两栏；768/390/360 为单栏纵排。三项资料标签与新说明逐项可读：`SKU与品类/商品品类、款式与尺码`、`销售渠道/主要销售平台与门店`、`日常与峰值单量/日常订单量与活动预估`。
- 四端动态 `contentDesc` 和原费用/服务条件均逐字保留；三个 CTA 链接 href/text 与基线一致。通过键盘焦点检查，四端三个链接均匹配 `:focus-visible`，outline 为 3px solid、4px offset；未提交表单或触发外部写入。
- Terra 6 文件 manifest：6/6 `OK`；聚合 hash 为 `bb232ab93b707b3740df63a39c3d77d5863f2843e459eb6b22db5376b64ee8f0`。浏览器原始 JSON、4 张 CTA 截图、source/diff/evidence hash 已保存于本任务 Luna 目录。

Regression coverage: 仅覆盖合同指定 CTA 全宽/灰底/安全边距、桌面两栏与小屏纵排、三项标签说明、动态内容与费用条件、链接、焦点可见性及四端 overflow/碰撞。其他七区、head/media/links 基线由 Sol 独立核对；未新增永久测试、未修改应用实现。

Remaining risks: 仅验证本地 headless Chromium 模拟视口，未覆盖真实设备、生产环境或真实 CMS；未运行全量 unit/E2E、build、`npm run verify`、CMS/数据库操作或部署。

Evidence: [browser-final.stdout.txt](../output/playwright/xyy-20260917-04/luna/browser-final.stdout.txt)、[browser-final.json](../output/playwright/xyy-20260917-04/luna/browser-final.json)、[source-hash-check.txt](../output/playwright/xyy-20260917-04/luna/source-hash-check.txt)、[diff-check.txt](../output/playwright/xyy-20260917-04/luna/diff-check.txt)、[evidence-sha256.txt](../output/playwright/xyy-20260917-04/luna/evidence-sha256.txt) 及 `cta-1440.png`、`cta-768.png`、`cta-390.png`、`cta-360.png`。

Handoff: 独立复测 PASS，返回 Sol；仅写入本任务 Luna 证据与本日志，未修改源代码、测试、CMS、数据库或外部环境。

### XYY-20260917-05 — 统一全站底部转化区 QA 预检准备

Task ID: XYY-20260917-05

Result: PREPARED（Terra 尚未最终冻结，本条不作 PASS/FAIL 结论）

Tests performed: 完成一次性浏览器脚本、AstroContainer 边界脚本、选择器与四端/961 路由矩阵清单；`node --check` 两个脚本通过，脚本与清单 `npx prettier --check` 通过，`git diff --check` 通过。未执行未冻结源码的浏览器验收、CMS、数据库、表单提交或生产操作。

Prepared coverage: 1440/390 覆盖 `routes.json` 全 16 路由；768/360 覆盖 Footwear、退货质检、后整修复、华东、首页 spot；961 覆盖广州、云道、案例详情、新闻长标题。脚本检查最外层 CTA 单一性、全宽灰底、安全边距、桌面分栏/小屏堆叠、白色圆角资料卡、黑橙标题、白字橙色按钮、横竖装饰线、overflow/碰撞、baseline href/text、repair 四项、East 动态 feature、首页电话、FAQ toggle、no-JS 与键盘 focus-visible。`conversion-container-boundaries.mjs` 覆盖 shared CTA 旧必填 props、空 optional、四项资料和自定义 East feature。

Remaining risks: 必须等待 Terra 最终 source manifest 后再运行两个 disposable harness 并取截图；当前没有对未冻结源码宣称 PASS。陈旧 `conversion-cta.spec.ts` 未运行，也未修改任何实现或永久测试。

Evidence: [cta-browser-qa.mjs](../output/playwright/xyy-20260917-05/luna/cta-browser-qa.mjs)、[conversion-container-boundaries.mjs](../output/playwright/xyy-20260917-05/luna/conversion-container-boundaries.mjs)、[qa-preflight.md](../output/playwright/xyy-20260917-05/luna/qa-preflight.md)、[preflight-validation.txt](../output/playwright/xyy-20260917-05/luna/preflight-validation.txt)、[preflight-hashes.txt](../output/playwright/xyy-20260917-05/luna/preflight-hashes.txt)。

Handoff: QA harness 已准备好，等待 Sol 通知 Terra 最终 freeze 后执行；仅写入授权 task/Luna 目录与本日志，未修改应用实现、测试、CMS、数据库或外部环境。

### XYY-20260917-05 — 统一全站底部转化区最终独立复测

Task ID: XYY-20260917-05

Result: PASS

Tests performed:

- Terra 最终 13 文件 `source-sha256.manifest` 逐项 `sha256sum -c`：13/13 `OK`；冻结 aggregate hash 为 `d07daf66704560237c50e34c9320ed5416e2a46abbb497ada6e70177a940c3ad`。
- `node output/playwright/xyy-20260917-05/luna/conversion-container-boundaries.mjs`：4/4 AstroContainer 边界场景通过，覆盖旧 API 完整 props、空可选描述/条件、四项资料和自定义 East feature。
- `node output/playwright/xyy-20260917-05/luna/cta-browser-qa.mjs`：46/46 浏览器矩阵通过（16 路由×1440/390，Footwear/退货/后整/华东/首页×768/360，广州/云道/案例详情/新闻×961）。各路由 CTA 的全宽/浅灰底、安全边距、桌面两栏与小屏单列、白色圆角资料卡、黑橙标题、白字橙色按钮、无装饰伪元素、无碰撞/横溢出和链接 href/访问文本均通过。
- 同一矩阵的 computed readability 断言通过：eyebrow/标题强调色、说明正文、资料 detail、费用条件均可读；`/wuliu-shuzihua` 390px 说明正文为共享 CTA 预期 `rgb(93,90,85)`、16px，未再受旧 `digital-proof p` 样式覆盖。FAQ 行为 12/12、no-JS 3/3、键盘 focus-visible 及首页电话/Repair/East 动态条目断言通过。
- 探针 `node --check`、Prettier `--check` 与 `git diff --check` 通过；未运行陈旧 `conversion-cta.spec.ts`，未新增永久测试。浏览器原始输出、Container 输出、最终 hash、预检日志、390px 截图和证据 hash 见本任务 Luna 目录。

Regression coverage: 统一 ConversionCTA 16 路由的 1440/390 主矩阵及 768/360/961 定向断点；覆盖 full-width block、panel/CTA 样式、正文颜色可读性、dynamic East feature、Repair 四项资料、Home 电话链接、FAQ toggle、no-JS、focus-visible、原始链接和 overflow。Sol 已独立完成 16 路由 protected 正文/head/FAQ/media/features/links 对比 PASS；本轮未重复其非 CTA 全站基线。

Remaining risks: 仅验证本地 `127.0.0.1:4322` headless Chromium 与模拟视口，未覆盖真实设备、生产环境或真实 CMS；AstroContainer 为离线边界 fixture。未运行全量 `npm run verify`、build、部署、CMS/数据库操作；未提交或推送。Terra source manifest 与实现日志中的 scoped checks 由 Terra 提供，Luna 仅独立复算 source hash 和页面行为。

Evidence: [cta-browser-qa-final.stdout.txt](../output/playwright/xyy-20260917-05/luna/cta-browser-qa-final.stdout.txt)、[cta-browser-qa-final.json](../output/playwright/xyy-20260917-05/luna/cta-browser-qa-final.json)、[conversion-container-boundaries-final.stdout.txt](../output/playwright/xyy-20260917-05/luna/conversion-container-boundaries-final.stdout.txt)、[source-hash-check-final.txt](../output/playwright/xyy-20260917-05/luna/source-hash-check-final.txt)、[preflight-validation-final.txt](../output/playwright/xyy-20260917-05/luna/preflight-validation-final.txt)、[evidence-sha256.txt](../output/playwright/xyy-20260917-05/luna/evidence-sha256.txt)、[qa-preflight.md](../output/playwright/xyy-20260917-05/luna/qa-preflight.md) 及 `cta-*-390.png`。

Handoff: 独立复测 PASS，返回 Sol → Nova；Luna 仅写入授权 task/Luna 证据与本角色日志，未修改应用实现、永久测试、CMS、数据库、生产环境或部署。

### XYY-20260921-06 — 全站响应式导航独立 QA

Task ID: XYY-20260921-06

Result: PASS

Tests performed:

- `bash output/playwright/xyy-20260921-06/nav-qa.sh` 最终复跑明确 `status: PASS`，77/77 checks 通过，failures/errors 均为空。覆盖 1440/1024/850/768/767/390/360/320 宽度、桌面/移动导航边界、7 条原链接、两列菜单、aria-current、点击/Enter/Tab/Escape/外部点击、移动→桌面 resize 焦点交接、短屏滚动、200% 菜单文字、两种背景、reduced-motion、overflow 与 pageerror。
- 相关 E2E：`home-product.spec.ts` 2/2 passed（chromium/mobile）；`service-pages.spec.ts` 1/1 passed（chromium）。
- 实际查看 1440 桌面、850 紧凑、390 收起/展开、320 展开及 390×320 短屏截图；导航文字、触控目标、两列菜单与底部链接均清晰，无可见裁切/碰撞。首轮第二次脚本曾出现一次 `resize:desktop-focus` 时序性单项失败；保留其 raw 结果，并以独立单例及 5 次重复复现确认 `/about` 焦点始终可见，随后完整脚本复跑通过。
- 五个冻结实现文件 SHA-256 复核与 Terra manifest 一致：Header、DesktopNavigation、MobileNavigation、header-menu、header-responsive.css 均 match。

Regression coverage: 仅覆盖合同指定的全站 header 响应式布局与交互；Sol 已独立完成 8 路由正文/meta/media/links/schema 保护比较（934 个保护文件未变）。未修改应用实现或测试文件。

Remaining risks: 验证限本地 `127.0.0.1:4322` 的 Playwright Chromium 模拟视口，未覆盖真实设备、其他浏览器、生产环境或真实 CMS；未运行全量 `npm run verify`、build、无关套件、CMS/数据库操作、部署或提交推送。

Evidence: [browser-result.json](../output/playwright/xyy-20260921-06/luna/browser-result.json)、[browser-raw.txt](../output/playwright/xyy-20260921-06/luna/browser-raw.txt)、[home-product-navigation-e2e.txt](../output/playwright/xyy-20260921-06/luna/home-product-navigation-e2e.txt)、[service-pages-navigation-e2e.txt](../output/playwright/xyy-20260921-06/luna/service-pages-navigation-e2e.txt)、[final-hashes-recheck.txt](../output/playwright/xyy-20260921-06/luna/final-hashes-recheck.txt)、[resize-focus-repro.txt](../output/playwright/xyy-20260921-06/luna/resize-focus-repro.txt)、[resize-focus-repro-repeat.txt](../output/playwright/xyy-20260921-06/luna/resize-focus-repro-repeat.txt)，以及 `nav-1440-closed.png`、`nav-850-closed.png`、`nav-390-closed.png`、`nav-390-open.png`、`nav-320-open.png`、`nav-390-short-open.png`。

Handoff: 独立验证 PASS，返回 Sol → Nova；仅写入授权 task/Luna 证据与本日志，未修改应用实现、永久测试、CMS、数据库、生产环境或部署。

### XYY-20260921-06 — 常显响应式导航首次独立复测

Task ID: XYY-20260921-06

Result: FAIL（实现返工后首次视觉复测）

Expected: 559px 以下两行常显导航的 header 不遮挡页面首段 breadcrumb；header 与正文首行应无矩形相交。

Actual: 新版 `nav-qa.sh` 功能脚本 83/83 checks 通过，两个更新后的导航 E2E 也通过（2/2、1/1），但 390/320 截图显示橙色 breadcrumb 被两行 header 底部遮住上沿。DOM 几何为两端 header `top=12,bottom=108,height=96`，`.footwear-hero__crumb` `top=96,bottom=124`，相交 12px。

Reproduction: `bash output/playwright/xyy-20260921-06/nav-qa.sh`；查看 `nav-390.png`、`nav-320.png`、`page-390.png`、`page-320.png`，并运行一次性矩形探针。

Evidence: [browser-result.json](../output/playwright/xyy-20260921-06/luna-v2/browser-result.json)、[browser-raw.txt](../output/playwright/xyy-20260921-06/luna-v2/browser-raw.txt)、[content-overlap.txt](../output/playwright/xyy-20260921-06/luna-v2/content-overlap.txt)、[nav-390.png](../output/playwright/xyy-20260921-06/luna-v2/nav-390.png)、[nav-320.png](../output/playwright/xyy-20260921-06/luna-v2/nav-320.png)、[page-390.png](../output/playwright/xyy-20260921-06/luna-v2/page-390.png)、[page-320.png](../output/playwright/xyy-20260921-06/luna-v2/page-320.png)。

Likely affected area: `src/styles/header-responsive.css` 的 `<560px` 两行 header 高度/顶部间距与页面首段布局避让。

Severity: LOW（首屏可读性与视觉遮挡；导航链接、页面内容和功能测试未失败）。

Handoff: 返回 Sol → Terra；Luna 未修改应用或永久测试，等待 CSS 修正后仅复跑新版浏览器视觉脚本。

### XYY-20260921-06 — 常显导航顶距修正后的视觉复测

Task ID: XYY-20260921-06

Result: FAIL（仍需实现修正）

Tests performed: Terra 将 `<560px` header 缩至 88px 总高并将顶部间距调整为 6px；仅复跑当前 `nav-qa.sh`，结果 88 checks、无 errors，但 `559/480/390/360/320:first-copy-clearance` 五项失败。实际状态均为 `headerBottom=102`、首段 copy/crumb `copyTop=96`，仍有 6px 相交。已查看更新后的 `nav-390.png`、`nav-320.png`、`page-390.png`、`page-320.png` 与 `nav-390-short.png`，breadcrumb 仍贴入 header 底部。

Expected: 两行 header 与首段 breadcrumb 完全分离，header 底部不高于首段 copy 顶部。

Actual: header 已比首轮降低，但首段仍上移到 header 内 6px；新版其余 83 项功能/布局检查保持通过，之前两个 E2E 仍为 2/2 与 1/1。

Evidence: [browser-result.json](../output/playwright/xyy-20260921-06/luna-v2/browser-result.json)、[browser-raw.txt](../output/playwright/xyy-20260921-06/luna-v2/browser-raw.txt)、[nav-390.png](../output/playwright/xyy-20260921-06/luna-v2/nav-390.png)、[nav-320.png](../output/playwright/xyy-20260921-06/luna-v2/nav-320.png)、[page-390.png](../output/playwright/xyy-20260921-06/luna-v2/page-390.png)、[page-320.png](../output/playwright/xyy-20260921-06/luna-v2/page-320.png)、[nav-390-short.png](../output/playwright/xyy-20260921-06/luna-v2/nav-390-short.png)。

Likely affected area: `<560px` responsive header 与鞋服首段 copy 的垂直避让规则。

Severity: LOW（首屏 breadcrumb 可读性/遮挡风险；导航功能与链接回归未受影响）。

Handoff: 返回 Sol → Terra；Luna 未修改应用或永久测试，等待下一次 CSS 修正后仅视觉复跑。

### XYY-20260921-06 — 常显导航最终独立视觉复测

Task ID: XYY-20260921-06

Result: PASS

Tests performed:

- Terra 最终 breakpoint 修正后，仅复跑 `bash output/playwright/xyy-20260921-06/nav-qa.sh`：88/88 checks 通过，failures/errors 均为空。12 个宽度覆盖 7 链接常显、559px 以下两行布局、44px 触控高度、无溢出/碰撞、键盘焦点、short 390×240、200% 文字、视频背景与 reduced-motion。
- 五个 `first-copy-clearance` 检查均通过：559/480/390/360/320 的 `headerBottom=96`、`copyTop=96`，无正文相交。实际查看 390/320 导航、完整首屏和 390 短屏截图，breadcrumb 位于 header 下方，首段标题/说明/CTA/图片清晰，无 header 遮挡。
- 最终实现 hash：Header `a934bca54fc5204f1b7e555bf84275e085458847a76fb3ded9a7d5e18de465f0`；DesktopNavigation `6926ca3c6e3681d0e7c25c323acbb8c135cb48e60a60aa888899c9f3a1a92d54`；MobileNavigation `aaf5ba7c8054671c1259775cede4528379bc5ef70daaa53751a39721ea1eccfc`；header-responsive.css `dab0aaa847a124412e1d105b087c10df79f9feecbffd7bd19896a96936838dbf`；`header-menu.ts` 按合同删除。两个既有 E2E 已在 CSS 修正前通过 3/3，本轮按要求未重复执行。

Regression coverage: 新版脚本覆盖 1440/1024/850/768/600/577/560/559/480/390/360/320、7 条原链接、aria-current、常显两行布局、键盘导航、原生跳转、视频背景、短屏、200% 文字、reduced-motion、overflow 与 pageerror。Sol 负责 8 路由正文/meta/media/links/schema 保护比较；旧 hamburger 证据不计入本轮验收。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 的 Playwright Chromium 模拟视口，未覆盖真实设备、其他浏览器、生产环境、CMS/数据库、全量 verify/build 或部署。CSS 修正后未重复已通过的两条 E2E，按 Sol 指示保留其 3/3 结果。

Evidence: [browser-result.json](../output/playwright/xyy-20260921-06/luna-v2/browser-result.json)、[browser-raw.txt](../output/playwright/xyy-20260921-06/luna-v2/browser-raw.txt)、[nav-390.png](../output/playwright/xyy-20260921-06/luna-v2/nav-390.png)、[nav-320.png](../output/playwright/xyy-20260921-06/luna-v2/nav-320.png)、[page-390.png](../output/playwright/xyy-20260921-06/luna-v2/page-390.png)、[page-320.png](../output/playwright/xyy-20260921-06/luna-v2/page-320.png)、[nav-390-short.png](../output/playwright/xyy-20260921-06/luna-v2/nav-390-short.png)、[nav-390-large-text.png](../output/playwright/xyy-20260921-06/luna-v2/nav-390-large-text.png)。

Handoff: 独立最终验证 PASS，返回 Sol → Nova；Luna 仅写入授权 task/luna-v2 证据与本日志，未修改应用实现、永久测试、CMS、数据库、生产环境或部署。

### XYY-20260921-06 — 响应式导航 fluid 尺寸独立 QA

Task ID: XYY-20260921-06

Result: PASS

Tests performed:

- `bash output/playwright/xyy-20260921-06/fluid/qa.sh`：78/78 checks 通过，failures/errors 均为空。覆盖 320/390/559/560/561/600/700/727/728/729/767/768/769/850/1023/1024/1025/1440、7 入口、边界布局、首屏避让、44px 手机触控目标、键盘焦点/原生链接、视频背景及双向 46 步 resize sweep。
- 连续性量化通过：559→560 和 560→561 capsule width 均变化 1px；727→728 width 变化 1px；728→729、767→768、768→769、1023→1024、1024→1025 width 变化 0px；对应 top 最大变化 0.015625px，未见字体或 logo 跳变。宽度随 viewport 单调增加，最大 capsule width 704px；双向 sweep 每一步均通过。
- 实际查看 1440、1023、768、560、390 及视频背景 577 截图。单行/双行允许的 560px 重排清楚，390 首屏 breadcrumb 与正文无遮挡；7 个入口均在胶囊内，无裁切、碰撞或横向溢出。
- 最终两文件 hash 复核与 `fluid/final-hashes.json` 一致：`Header.astro` `b56a8f44c19e7e044528863e5787192f050074d83ce36f4efc56194ccbfbcc49`；`header-responsive.css` `7a0e0cfb39458406e7ac649cea17a2373ea3b159902e197e6b88ce2d1c31ed65`。Sol 的 scope.json：936 个保护文件未变，状态 PASS。

Regression coverage: 仅覆盖本次 fluid sizing 合同指定的导航几何连续性、边界布局、resize、首屏避让与既有可访问/链接/视频背景行为；不重复旧 88 项导航检查、E2E、build 或 fullverify。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 的 Playwright Chromium 模拟视口，未覆盖真实设备、其他浏览器、生产环境、CMS/数据库、全量 verify/build 或部署。

Evidence: [browser-result.json](../output/playwright/xyy-20260921-06/fluid/luna/browser-result.json)、[browser-raw.txt](../output/playwright/xyy-20260921-06/fluid/luna/browser-raw.txt)、[nav-1440.png](../output/playwright/xyy-20260921-06/fluid/luna/nav-1440.png)、[nav-1023.png](../output/playwright/xyy-20260921-06/fluid/luna/nav-1023.png)、[nav-768.png](../output/playwright/xyy-20260921-06/fluid/luna/nav-768.png)、[nav-560.png](../output/playwright/xyy-20260921-06/fluid/luna/nav-560.png)、[nav-390.png](../output/playwright/xyy-20260921-06/fluid/luna/nav-390.png)、[nav-577-video.png](../output/playwright/xyy-20260921-06/fluid/luna/nav-577-video.png)、[page-390.png](../output/playwright/xyy-20260921-06/fluid/luna/page-390.png)。

Handoff: 独立 fluid QA PASS，返回 Sol → Nova；Luna 仅写入授权 fluid/luna 证据与本日志，未修改应用实现、永久测试、CMS、数据库、生产环境或部署。

### XYY-20260921-02 — 鞋服货品管理视觉替换 QA 预检准备

Task ID: XYY-20260921-02

Result: PREPARED（Terra 最终源码 manifest 尚未提供，本条不作 PASS/FAIL 结论）

Tests performed:

- 已读取任务合同、`DEV_STATE.md`、相关 `docs/LUNA.md` 历史日志、任务基线与当前目标区源码；确认当前页面本地预览为 `http://127.0.0.1:4322/xiefu-yuncang`，当前工作树仍包含并行改动，未回退或覆盖。
- `command -v npx` 通过；按 Playwright skill 使用 wrapper 进行 CLI 预检。wrapper 的 npm 缓存遇到 EROFS 后，按工具权限流程以同一 wrapper 命令完成 `--help`，CLI 可用。
- 已在 `output/playwright/xyy-20260921-02/luna/` 准备一次性 `goods-qa.sh` 与 `qa-preflight.md`。脚本在最终 manifest 缺失时以 exit 2 阻止运行，避免对未冻结源码宣称验收；已通过 `bash -n`、`git diff --check`。按 Sol 预检反馈修正为明确 `async (page) => { ... return result; }`，使用 `domcontentloaded` 与 `document.fonts.ready`，矩形相交仅比较视觉外框与两张 feature 卡，并对每个视口/no-JS 结果输出及执行 PASS/FAIL 判据。未执行浏览器验收、未截取最终区域图、未新增永久测试。

Prepared coverage: 最终冻结后使用 Playwright CLI 在 1440×960、768×900、390×844、360×800 检查货品管理区的文档/页面/区域/视觉滚动尺寸、文字盒、视觉与两张动态 feature 卡矩形碰撞、SVG/aria-label/装饰元素焦点性、旧 `directory-objects-20260911.png` 请求、区域截图及浏览器请求记录；另在 390×844 新建 JavaScript-disabled context 验证原生示意可见。标题与两项 feature 精确字符串从 `browser-before.json` 对照；其他七区/head/links/videos 与全 scope hash 由 Sol 负责。

Remaining risks: 必须等待 Sol 提供 Terra 最终 source manifest/hash freeze 后再执行 `goods-qa.sh`。当前无最终浏览器结果，不能判定 PASS 或 FAIL；未运行表单提交、CMS、数据库、部署、生产检查、全量 E2E/unit/build/fullverify。

Evidence: [goods-qa.sh](../output/playwright/xyy-20260921-02/luna/goods-qa.sh)、[qa-preflight.md](../output/playwright/xyy-20260921-02/luna/qa-preflight.md)、[contract.md](../output/playwright/xyy-20260921-02/contract.md)。

Handoff: 已将预检方案返回 Sol，等待最终 manifest/freeze；本轮仅写入授权 task Luna 证据与本日志，未修改应用实现、永久测试、CMS、数据库、生产环境或部署。

### XYY-20260921-02 — 鞋服货品管理视觉替换最终独立验证

Task ID: XYY-20260921-02

Result: PASS

Tests performed:

- Terra 最终 `output/playwright/xyy-20260921-02/terra/frozen-source-sha256.txt`：2/2 `sha256sum -c` 通过。`FootwearGoods.astro` 为 `67cac06af079be4ca4090dfde8477d7d69e0474a00b2daa5028b102a9ed58bae`；最终 `FootwearGoodsVisual.astro` 为 `f23ea78fd77b7d3bea9014164c5a60215c3cc88492897f9db0bd359954fed3c2`，包含去除装饰圆圈/短横后的冻结版本。
- 最终 Playwright CLI harness：`goods-1440x960`、`goods-768x900`、`goods-390x844`、`goods-360x800`、`goods-nojs-390x844` 均明确输出 `PASS`；每端检查 native SVG、零 img、语义 aria label、零 focusable 控件、款式/颜色/尺码文字、区域/文档横向溢出、视觉外框与两张 feature 卡不相交及裁切判据。
- 实际查看四张 goods 区域截图：桌面两端图卡与左右 feature 卡留白清楚；390/360 图示缩入可用宽度，衣服 SVG、颜色圆点、S/M/L 与动态 feature 文字可读，未见目标区内部裁字或碰撞。390 no-JS 截图和 raw 结果仍显示原生示意可见。
- Playwright request 记录中未发现 `directory-objects-20260911.png`；`old-png-request-check.txt` 明确为 `PASS`。旧文件仅保留在工作树，未被本区请求。
- Sol 的 protected `comparison.json` 已复核为 PASS：另外七区/head/links/videos 与两张动态卡原文保持，2 个冻结源码文件变更，1324 项保护文件未变（新增 Astro scoped data 属性按约定忽略）。

Regression coverage: 货品管理区四视口（1440/768/390/360）、390 no-JS、native SVG/aria semantics、装饰元素无焦点/伪交互、目标区与页面横向溢出、视觉与 feature 卡矩形关系、标签裁切、旧 PNG 请求、冻结源码 hash；Sol 独立覆盖其余七区、head、links、videos、动态原文与全 scope protected comparison。

Remaining risks: 验证限本地 `127.0.0.1:4322` 的 Playwright Chromium 模拟视口，未覆盖真实设备、其他浏览器、生产环境或真实 CMS；未运行全量 E2E/unit/typecheck/build/fullverify，未执行表单提交、CMS、数据库、部署或生产操作。截图中可见页面既有的全局移动导航/悬浮控件，未计入 goods 组件内部 DOM 几何判定。

Evidence: [goods-qa.sh](../output/playwright/xyy-20260921-02/luna/goods-qa.sh)、[source-hash-check.txt](../output/playwright/xyy-20260921-02/luna/source-hash-check.txt)、[old-png-request-check.txt](../output/playwright/xyy-20260921-02/luna/old-png-request-check.txt)、[goods-1440x960.raw.txt](../output/playwright/xyy-20260921-02/luna/goods-1440x960.raw.txt)、[goods-768x900.raw.txt](../output/playwright/xyy-20260921-02/luna/goods-768x900.raw.txt)、[goods-390x844.raw.txt](../output/playwright/xyy-20260921-02/luna/goods-390x844.raw.txt)、[goods-360x800.raw.txt](../output/playwright/xyy-20260921-02/luna/goods-360x800.raw.txt)、[goods-nojs-390x844.raw.txt](../output/playwright/xyy-20260921-02/luna/goods-nojs-390x844.raw.txt) 及四张 `screenshots/goods-*.png`。

Handoff: 独立最终验证 PASS，先返回 Sol；本轮仅写入授权 task Luna 证据与本日志，未修改应用实现、永久测试、CMS、数据库、生产环境或部署。

### XYY-20260921-05 — 鞋服履约流程画板独立验证

Task ID: XYY-20260921-05

Result: PASS

Tests performed:

- 按合同 amendment，仅修改既有 `tests/e2e/footwear-page.spec.ts`：将旧四视频/阶段播放时间断言替换为 hero 单视频属性、三阶段画板无 `video/source/img`、操作文案、卡片数、SVG 图标与面板可见性断言；保留页面八区、SEO/FAQ、tab 键盘、断点、reduced-motion 和 no-JS 断言。
- Terra 三文件冻结 hash 逐项核对：`FootwearFulfillment.astro`、`FulfillmentIcon.astro`、`fulfillment-copy.css` 3/3 match。
- `npx prettier --check tests/e2e/footwear-page.spec.ts`、scoped ESLint 与 `git diff --check`：PASS。
- `npx playwright test tests/e2e/footwear-page.spec.ts --config=output/playwright/xyy-20260921-05/playwright.config.ts`：4/4 passed，仅本地 `127.0.0.1:4322`，无新 server/build。
- 准备好的 CLI QA 四视口 1440/768/390/360：PASS。三阶段点击后 selected/visible/ARIA linkage、操作卡内容、SVG 图标、三/二/一列布局、hero video 保留与无横向溢出均通过；键盘 Home/Arrow/End、reduced-motion、no-JS 全部通过。旧三阶段视频/海报请求为 0，pageerror 为 0。
- 已查看 1440、768、390、360 截图；画板与操作卡在桌面、平板和手机均无目标区内部裁切或重叠，outbound 保留 `18:00前截单，当日24:00前发出`。

Regression coverage: 八区页面结构、SEO/FAQ Schema、hero-only 视频属性、三阶段 tab 点击/ARIA/键盘、断点方向与列数、三阶段操作文案与卡片、SVG 图标、媒体请求、reduced-motion、no-JS、四视口 overflow，以及现有测试文件的局部回归。未运行无关全量 verify/build。

Remaining risks: 仅验证本地 Playwright Chromium 模拟视口，未覆盖真实设备、其他浏览器、生产环境或真实 CMS；未执行 CMS、数据库、部署、提交或推送。原始媒体文件仍保留，未作删除验证以外的外部操作。既有测试/仓库范围外问题未扩展处理。

Evidence: [footwear-e2e.txt](../output/playwright/xyy-20260921-05/luna/footwear-e2e.txt)、[browser-result.json](../output/playwright/xyy-20260921-05/luna/browser-result.json)、[browser-raw.txt](../output/playwright/xyy-20260921-05/luna/browser-raw.txt)、[source-hash-current.txt](../output/playwright/xyy-20260921-05/luna/source-hash-current.txt)、[test-prettier.txt](../output/playwright/xyy-20260921-05/luna/test-prettier.txt)、[test-eslint.txt](../output/playwright/xyy-20260921-05/luna/test-eslint.txt) 及 `fulfillment-*.png`。

Handoff: 独立验证 PASS，返回 Sol → Nova；仅修改合同允许的既有 E2E 测试视频断言并写入 task Luna 证据/日志，未修改应用实现、CMS、数据库、生产环境或部署。

### XYY-20260921-05 — 履约画板卡片对齐修正独立复测

Task ID: XYY-20260921-05

Result: PASS

Terra 仅调整 `fulfillment-copy.css` 的卡片行轨道；最新 hash 为 `cc1454cf85cdb0911e870d2a026e8fc7a94538fcaf8c2012679c81424783b8f1`，另外两个应用文件 hash 保持冻结值。已保留首轮 `browser-result.json` 为 `before-alignment-result.json`，复跑 `bash output/playwright/xyy-20260921-05/fulfillment-qa.sh` 后 1440/768/390/360 四视口均 PASS；1440 入仓三张操作卡标题现已同高，390/360 手机卡片与阶段结果仍清晰、无溢出/裁切，媒体请求仍为 0，no-JS/reduced-motion/键盘结果保持 PASS。未重跑已通过的 4 项 E2E、格式检查或无关测试。

Evidence: [source-hash-alignment-retest.txt](../output/playwright/xyy-20260921-05/luna/source-hash-alignment-retest.txt)、[browser-result.json](../output/playwright/xyy-20260921-05/luna/browser-result.json)、[before-alignment-result.json](../output/playwright/xyy-20260921-05/luna/before-alignment-result.json) 及更新后的 `fulfillment-1440-inbound.png`、`fulfillment-390-inbound.png`、`fulfillment-360-inbound.png`。

### XYY-20260921-04 — 产品首段清洁视频独立浏览器验证

Task ID: XYY-20260921-04

Result: PASS

Tests performed: 按预置 `video-browser-qa.sh` 在本地 `/product` 使用 Chromium 验证 1440×900 与 390×844。两端均通过新 video/poster URL、3.433333 秒、854×480、静音自动播放/循环/inline、时间推进、loop 回绕、无 controls、8 个视频、9 个分区及无横向溢出；回绕后 1440 为 `currentTime=0.086653`、`paused=false`、`readyState=4`、`seeking=false`，390 为 `0.065364`、`paused=false`、`readyState=4`、`seeking=false`。

Regression coverage: Terra 冻结证据已覆盖 103 帧、H.264/yuv420p、30fps、无音轨、完整解码、干净接缝/全片抽帧及原始素材保留。首轮脚本结果已保存在 `output/playwright/xyy-20260921-04/luna/attempt-1/`；首轮 JSON 记录 `playing=false`、`currentTime=0`，未记录 `paused/readyState` 字段，符合 seek 边界采样竞态特征。Sol 仅将断言等待条件收紧为 `readyState>=2`、`!seeking` 与 `currentTime>0.05` 后复测通过。未修改应用实现或新增永久测试。

Remaining risks: 仅本地 headless Chromium 模拟视口，未覆盖真实设备、生产环境、真实 CMS/数据库、部署、全量 build 或 `npm run verify`。

Evidence: `output/playwright/xyy-20260921-04/luna/browser-result.json`、`browser-raw.txt`、`product-1440.png`、`product-390.png` 与 `attempt-1/`。

Handoff: 独立浏览器验证 PASS，返回 Sol；仅写入授权 task Luna 证据与本日志，未修改应用实现、永久测试、CMS、数据库、生产环境或部署。

### XYY-20260921-07 — Footer 服务列八项独立 QA

Task ID: XYY-20260921-07

Result: PASS

Tests performed:

- Sol 修正 H1 判据后，仅重跑 `bash output/playwright/xyy-20260921-07/qa.sh`：21/21 checks 通过，failures/errors 均为空。`/product` 视频服务标签/href 与八项 footer 入口顺序一致；`/xiefu-yuncang` 在 1440/768/390/320 的服务列均为八项，列内链接分离、在容器内且页面无横向溢出；首页与华南详情页保持同列；键盘焦点和一次原生 `/kuajing-yuncang` 跳转通过。
- 八个目标均 HTTP 200 且存在非空 H1：`/xiefu-yuncang`、`/tuihuo-zhijian`、`/houzheng-xiufu`、`/kuajing-yuncang`、`/huanan-xiefu-yuncang`、`/huadong-xiefu-yuncang`、`/zhibo-cangpei`、`/b2b-mendian-cangpei`。
- 已实际查看 1440/768/390/320 服务列截图及 1440/390 完整 footer 截图；八个标签均可读，无裁切、碰撞或溢出，其他 footer 列同时可见。
- `src/data/brand/navigation.ts` SHA-256 为 `94940568fce81b0e861825180495b94e7abf0017e4cbb911d935aba8006fced0`，与冻结值一致。Sol scope comparison PASS，937 个保护文件未变，`NAV_LINKS` 保持不变。首次 helper 的过严 `h1.includes(label)` 失败证据已保留为历史，修正后不再复现。

Regression coverage: 覆盖 product 服务顺序、footer 服务列 4 视口、首页/华南详情页、8条服务原生链接、键盘焦点、单次原生跳转、8 个目标 HTTP/H1、页面 overflow 与 footer 视觉截图。未运行旧 E2E、build、fullverify 或无关测试。

Remaining risks: 仅验证本地 `127.0.0.1:4322` 的 Playwright Chromium 模拟视口，未覆盖真实设备、其他浏览器、生产环境、CMS/数据库或部署；H1 断言验证目标页存在非空 H1 与 HTTP 200，营销标题无需重复 footer 标签。

Evidence: [browser-result.json](../output/playwright/xyy-20260921-07/luna/browser-result.json)、[browser-raw.txt](../output/playwright/xyy-20260921-07/luna/browser-raw.txt)、[services-1440.png](../output/playwright/xyy-20260921-07/luna/services-1440.png)、[services-768.png](../output/playwright/xyy-20260921-07/luna/services-768.png)、[services-390.png](../output/playwright/xyy-20260921-07/luna/services-390.png)、[services-320.png](../output/playwright/xyy-20260921-07/luna/services-320.png)、[footer-1440.png](../output/playwright/xyy-20260921-07/luna/footer-1440.png)、[footer-390.png](../output/playwright/xyy-20260921-07/luna/footer-390.png)、[before-headline-check-browser-result.json](../output/playwright/xyy-20260921-07/luna/before-headline-check-browser-result.json)。

Handoff: 独立验证 PASS，返回 Sol 最终验收（LOW，无 Nova 门禁）；Luna 仅写入授权 task07/luna 证据与本日志，未修改应用实现、永久测试、CMS、数据库、生产环境或部署。

### XYY-20260921-08 — 本地候选发布门禁首轮

Task ID: XYY-20260921-08

Result: BLOCKED（候选门禁首轮失败，未进入发布验收）

Expected: 候选在指定隔离环境中通过 `verify:release`（含 `verify`）、`format:check`、`npm audit --omit=dev` 与 `npm ls --omit=dev`。

Actual: `format:check` PASS；`npm audit --omit=dev` FAIL（1 high：smol-toml，1 moderate：devalue）；`npm ls --omit=dev` FAIL（复制的 node_modules 中 `@astrojs/node@11.0.2`、`astro@7.1.6` 不满足 package.json 要求 `^11.1.4`、`^7.2.8`）。`verify:release` 已按合同执行一次并在 `verify → typecheck` 首阶段停止：`tests/e2e/service-redesign-live.spec.ts:52:39` 的 `item` 参数隐式为 any（ts(7006)），505 files、1 error；未进入后续 lint/assets/unit/E2E/formal/build。

Reproduction: 在 `/tmp/xyy-release-20260921-08` 使用合同指定 CI、Directus、Xiansuo、PUBLIC_SITE_URL 与 ENABLE_DOMAIN_REDIRECTS 环境变量，分别执行 `npm run format:check`、`npm audit --omit=dev`、`npm ls --omit=dev`、`npm run verify:release`。

Evidence: [format-check.txt](../output/xyy-release-20260921-08/luna/format-check.txt)、[npm-audit.txt](../output/xyy-release-20260921-08/luna/npm-audit.txt)、[npm-ls.txt](../output/xyy-release-20260921-08/luna/npm-ls.txt)、[verify-release.txt](../output/xyy-release-20260921-08/luna/verify-release.txt)。

Likely affected area: 候选依赖复制状态与 `service-redesign-live.spec.ts` 类型错误；audit 漏洞涉及锁文件依赖版本。

Severity: HIGH（发布门禁未通过，禁止据此宣称可发布）。

Handoff: 返回 Sol；保留真实首轮失败证据，未运行 audit fix、未修改候选源码/锁文件、未部署、未连接 CMS/数据库或外部系统。等待依赖安装与 scoped 修复后再按合同复测。

XYY-20260921-08 claims 定向诊断补充：候选内 `./node_modules/.bin/vitest run tests/unit/claims.test.ts` 一次执行为 10/11 passed、1 failed；失败扫描列出 8 个既有硬编码：`tests/e2e/service-redesign-repair.spec.ts`（90%）、`tests/unit/footwear-content.test.ts`（18:00前截单，当日24:00前发出；50万单/日；100万单/日；150+）、`tests/unit/service-redesign-crossborder.test.ts`（24小时）、`tests/unit/service-redesign-live.test.ts`（18:00前截单，当日24:00前发出；50万单/日）。该诊断不作为发布门禁 PASS。

复测补充：candidate 未变时，`check:assets` PASS（79 referenced public assets、103 deployment assets、526 source files）；`npm test` FAIL，66 files / 489 tests 中 488 passed、1 failed。失败为 `tests/unit/service-page-seed-structure.test.ts` 的 `preserves the exact dropdown-page stats and features from source pages`，实际 `huanan-xiefu-yuncang.astro` features 与 seed 期望不一致。证据：[check-assets.txt](../output/xyy-release-20260921-08/luna-retest-1/check-assets.txt)、[unit-test.txt](../output/xyy-release-20260921-08/luna-retest-1/unit-test.txt)。因单测失败，按合同未继续执行 `test:e2e` 与 `test:formal-contract`；候选未修改，未部署、未连接 CMS/数据库。
后段诊断补充：在同一未变 candidate 继续执行 `npm run test:e2e`，实际 **79 passed、12 failed、7 skipped**（6 类失败在 Chromium/mobile 成对出现），退出 1；`npm run test:formal-contract` 实际 **4 passed、0 failed**，退出 0。E2E 具体失败为：

- `conversion-cta.spec.ts:21`：`/product` `[data-conversion-cta]` 期望 1、实际 0。
- `home-product.spec.ts:64`：`01-overview` poster 期望 `/videos/warehouse-sections-20260911/01-overview.jpg`，实际 `/videos/warehouse-sections-20260911/01-overview-clean-20260921.jpg`。
- `service-pages.spec.ts:4`：`/yundao-zhineng-jijian` `.service-cta` 期望 1、实际 0。
- `service-redesign-east.spec.ts:27,131`：`.east-contact a.redesign-button` 期望 href `/contact`，元素未找到（桌面/移动各两项）。
- `service-redesign-repair.spec.ts:105`：阻断增强模块请求期望 1、实际 0；测试在 `blockedModuleRequests` 断言处失败（桌面/移动各一项）。

完整浏览器断言、截图/trace 路径与回退日志见 [e2e-diagnostic.txt](../output/xyy-release-20260921-08/luna-retest-1/e2e-diagnostic.txt)；formal 证据见 [formal-diagnostic.txt](../output/xyy-release-20260921-08/luna-retest-1/formal-diagnostic.txt)。E2E 的 Directus 网络失败均按合同走静态回退；未写 CMS/数据库，未修改 candidate。整体仍 FAIL，未进入发布后 QA。

最终候选复测：243 路径 before/after SHA-256 均与 `candidate-hashes.json` **MATCH**，0 missing、0 mismatch；`npm run format:check` PASS。`npm run verify:release` 的 `typecheck` PASS（507 files，0 errors/warnings/hints）、lint PASS、maintainability PASS（720 files）、assets PASS（79 referenced、103 deployment、528 source files）、Vitest PASS（67 files / 489 tests）、内层 build PASS；随后 E2E **87 passed、4 failed、7 skipped**，退出 1，因此该命令未进入后续 final formal/release build。最终 E2E 失败均为桌面/移动成对出现：

- `tests/e2e/conversion-cta.spec.ts:30`：`[data-conversion-cta] ol > li` 期望 3、实际 4。
- `tests/e2e/service-pages.spec.ts:4`：`[data-conversion-cta] a[href="/contact"]` accessible name 期望非空、实际空字符串。

证据：[source-hash-before.json](../output/xyy-release-20260921-08/luna-retest-2/source-hash-before.json)、[source-hash-after.json](../output/xyy-release-20260921-08/luna-retest-2/source-hash-after.json)、[format-check.txt](../output/xyy-release-20260921-08/luna-retest-2/format-check.txt)、[verify-release.txt](../output/xyy-release-20260921-08/luna-retest-2/verify-release.txt)。Likely affected area：`ConversionCTA` 每路由 preparation 数据契约与 CTA 联系链接可访问名称；候选未修改，未部署、未连接 CMS/数据库。Severity：HIGH，发布门禁仍 FAIL。

最终两项修复 targeted 复测：243 路径 before/after SHA-256 均与更新后的 `candidate-hashes.json` **MATCH**，0 missing、0 mismatch。命令 `npm run test:e2e -- tests/e2e/conversion-cta.spec.ts tests/e2e/service-pages.spec.ts --grep 'target pages retain|shared service landing'` 实际 **2 passed、2 failed**（Chromium/mobile 各一项），退出 1。conversion path 两项通过；`tests/e2e/service-pages.spec.ts:4` 的 Chromium/mobile 两项仍失败：Expected accessible name `获取专属方案`，Actual `免费获取方案`。证据：[targeted-e2e.txt](../output/xyy-release-20260921-08/luna-retest-3/targeted-e2e.txt)、[source-hash-before.json](../output/xyy-release-20260921-08/luna-retest-3/source-hash-before.json)、[source-hash-after.json](../output/xyy-release-20260921-08/luna-retest-3/source-hash-after.json)。Likely affected area：共享 ConversionCTA 联系链接的 route-specific accessible label；candidate 未修改，未运行 full verify，未部署、未连接 CMS/数据库。Severity：HIGH，targeted gate FAIL。

### XYY-20260921-08 — 最终候选独立发布门禁复测

Task ID: XYY-20260921-08

Result: **PASS**（本地候选门禁；未部署）

Tests performed：

- targeted `service-pages.spec.ts --grep 'shared service landing'`：**2 passed、0 failed**（Chromium/mobile，24.4s）。
- `npm run format:check`：退出 0。
- `npm run verify:release`：退出 0；typecheck 507 files、0 errors/warnings/hints；lint PASS；maintainability 720 files PASS；assets 79 referenced / 103 deployment / 528 source files PASS；Vitest **67 files / 489 tests PASS**；内层 build PASS；E2E **91 passed、0 failed、7 skipped**；formal contract **4 passed、0 failed**；final build PASS。
- E2E 的 7 个 skip 与既有项目配置一致（无新增 skip、无断言削弱、无 gate 改动）；Directus 网络不可达均按合同使用静态 fallback，未发生 CMS/DB 写入。
- 243 路径 source hash before/after 均与更新后的 `candidate-hashes.json` MATCH，0 missing、0 mismatch。

Regression coverage：typecheck、lint、maintainability、public/deployment assets、489 个 unit tests、桌面/移动端 98 项 E2E（含 CMS fallback、SEO/AEO、CTA、product video、响应式、service redesign、无 JS/reduced motion、导航/FAQ/overflow）、4 项 formal production-origin contract、两次 server build、Prettier format check，以及候选 243 路径 hash identity。

Evidence：[targeted-service-pages.txt](../output/xyy-release-20260921-08/luna-retest-4/targeted-service-pages.txt)、[verify-release.txt](../output/xyy-release-20260921-08/luna-retest-4/verify-release.txt)、[format-check.txt](../output/xyy-release-20260921-08/luna-retest-4/format-check.txt)、[source-hash-before.json](../output/xyy-release-20260921-08/luna-retest-4/source-hash-before.json)、[source-hash-after.json](../output/xyy-release-20260921-08/luna-retest-4/source-hash-after.json)。

Remaining risks：尚未执行发布后验收站桌面/移动浏览器 QA；未部署、未推送、未连接真实 CMS/数据库。候选源在本轮未修改，等待 Sol 进入发布后只读 QA 调度。

### XYY-20260921-08 — 恢复候选独立就绪核验

Task ID: XYY-20260921-08

Result: **PASS**（恢复候选就绪；未执行部署或发布后 QA）

Tests performed：

- 重建候选与根目录 `HEAD` 均为 `51d9c473268af11f7f4584042598cc72480d7e21`；候选 `git status --short --untracked-files=all` 为空。
- 独立核对 `candidate-hashes.json` 的 243 条记录：242 条文件 SHA-256 MATCH；`src/scripts/header-menu.ts` 的 `DELETED` sentinel 符合候选缺失状态，无 missing/mismatch。
- `npm --prefix output/xyy-release-20260921-08/candidate ls --depth=0` 退出 0；锁文件解析为 Astro 7.2.8、`@astrojs/node` 11.1.4、`devalue` 5.9.4、`smol-toml` 1.8.0。
- fresh `resume-install.log/json` 记录 `npm ci` 退出 0、783 packages added；`resume-audit.log` 报告 `found 0 vulnerabilities`。
- `post-qa.sh` `bash -n`、10 个生成 route script 与 template 的 `node --check` 均 PASS；10 条 route 与 10 个生成脚本一一对应。
- 静态审阅 post-QA helper：需要 `EXPECTED_GIT_SHA`，校验 staging `/version` 和 `/healthz`，20 个桌面/移动视口覆盖导航、footer/product、layout、媒体及 Range；未见 CMS/DB 写入、部署、SSH、rsync 或非 GET 外部请求。

Regression coverage：243 条候选源/媒体/测试路径、冻结依赖树、fresh 安装与生产依赖 audit、候选 clean state，以及 10 路由 × 1440/390 的发布后 QA 断言准备。

Evidence：[resume-validation.md](../output/xyy-release-20260921-08/luna-resume/resume-validation.md)、[post-qa-review.md](../output/xyy-release-20260921-08/luna-resume/post-qa-review.md)、[resume-source-check.json](../output/xyy-release-20260921-08/resume-source-check.json)、[resume-install.json](../output/xyy-release-20260921-08/resume-install.json)、[resume-audit.log](../output/xyy-release-20260921-08/resume-audit.log)。

Remaining risks：本轮未运行 `post-qa.sh`，未对验收站产生新结果；Terra 的恢复部署脚本仍待 Sol 交接后的 guard review。部署脚本中的完整 `verify:release` 和 Sol 确认 exact deployed SHA 后的发布后桌面/移动 QA 仍是后续门禁。

Handoff：独立候选与 helper review PASS，返回 Sol；Luna 未修改应用、永久测试、候选、Terra 进行中的恢复部署脚本、CMS、数据库、生产环境或外部系统。

### XYY-20260921-08 — 恢复部署 helper 独立 guard review

Task ID: XYY-20260921-08

Result: **PASS**（helper guard 与原部署尾段核验；未执行部署）

Tests performed：

- `resume-deploy.sh` SHA-256 为 `7140c35bc0fd640d394ad5173c76c98e5f8fd84b25d2d7b4d2baab790428ad29`；`resume-staging.sh` SHA-256 为 `1234b4d3cd64ccd16019c453f6f980be879d80ab2068b92b5e82281c43fac073`；两份 `bash -n` PASS。
- 与 `scripts/deploy.sh` 的 diff 限于 exact SHA、staging target、固定 inactive partial seed 目录/非 symlink/active `-ef` guard、`cp -al` seed 和 `rsync --checksum`；修改块之后的 5,690 bytes 通过 `cmp` 字节一致。
- mock wrong-SHA probe 在 verify/SSH 前以 `deployment_requires_expected_git_sha:51d9c473268af11f7f4584042598cc72480d7e21` 退出 1。
- 合法 exact-SHA 的 wrong-target probe 仅创建本地临时 manifest，随后以 `deployment_requires_expected_staging_target` 退出 1；mock `npm`/`ssh`/`rsync` 均未调用。
- wrapper 保持 staging host/site/CMS URL、persistent candidate checkout、`RELEASE_KEEP=100` 与绝对路径 helper 调用。

Regression coverage：helper syntax/hash、原部署原子切换/回滚/cleanup 尾段字节保持、SHA 与 staging target guard 顺序、partial seed guard、checksum 上传方式及 wrapper 环境契约。

Evidence：[helper-review.md](../output/xyy-release-20260921-08/luna-resume/helper-review.md)、Terra [resume-prep.md](../output/xyy-release-20260921-08/resume-prep.md)。

Remaining risks：未执行 SSH、部署、CMS/DB、生产或外部写入；远端 partial seed 与 active `current` 关系仅完成 guard 静态核验。Nova review 与实际部署时 helper 内的完整 `verify:release` 仍是后续门禁。

Handoff：独立 helper review PASS，返回 Sol / Nova；Luna 未修改应用、helper、候选或部署脚本。

### XYY-20260921-08 — staging 发布后独立浏览器 QA

Task ID: XYY-20260921-08

Result: **PASS**（已部署 staging 的 post-QA）

Tests performed：

- 按授权执行 `EXPECTED_GIT_SHA=51d9c473268af11f7f4584042598cc72480d7e21 bash output/playwright/xyy-release-20260921-08/post-qa.sh`；为绕过本地只读 npm/home cache，仅将 npm 与 Playwright daemon cache 定向到 `/tmp`，未修改 helper。
- `/version` 返回 staging、exact SHA `51d9c473268af11f7f4584042598cc72480d7e21`、Release `20260923T070817Z-51d9c47`；`/healthz` 返回 `status=ok`，CMS 与 contactStorage 均 `ok`。
- **10 routes / 154 checks / 0 failures / 0 page errors** 全部 PASS；20 个 route viewport（1440×900、390×900）导航 7 项、无横向溢出；产品 8 服务链接、8 段视频加 1 个静态保障区（共 9 个产品区域）与 clean overview；其余 9 路由页脚 8 项服务链接均通过。
- 16 个视频 Range 请求均 `206` 且 `Content-Range` 正确，16 个 poster/image 请求均 `200`；视频 muted/autoplay/loop、无 controls 通过。
- 已查看首页、产品、华南、华东及 footer 的 desktop/mobile 代表截图；华南/华东 desktop 3 秒等待复核均显示实际 hero 视频帧。post-QA 浏览器 session 已关闭。

Regression coverage：exact version/health、10 路由、桌面/移动导航、overflow、heading、产品媒体序列、footer 服务链接、视频属性与 Range、poster、pageerror 及代表性视觉布局。

Evidence：[post-deploy-review.md](../output/xyy-release-20260921-08/luna-resume/post-deploy-review.md)、[browser-result.json](../output/playwright/xyy-release-20260921-08/browser-result.json)、[version.json](../output/playwright/xyy-release-20260921-08/version.json)、[health.json](../output/playwright/xyy-release-20260921-08/health.json)，以及同目录截图/`raw-*.txt`。

Remaining risks：本轮为 headless Chromium 的 1440×900 与 390×900 验证，未覆盖真实设备、其他浏览器、CMS/数据库写入或生产环境；autoplay 本轮验证属性与媒体可交付性，并以短等待视觉复核 hero 帧，未新增完整播放时长门禁。

Handoff：独立发布后 QA PASS，返回 Sol；Luna 未修改应用、测试、部署脚本、CMS、数据库或生产环境。

### XYY-20260924-01 — 合作案例总览改版独立验证首轮

Task ID: XYY-20260924-01

Result: **FAIL**（移动端横向溢出，已返回 Sol/Terra；等待最小实现修复后复测）

Expected：`/cases` 在 1440×900、768×1024、390×844、360×800 均无横向溢出；页面根节点 `scrollWidth` 至多比 `clientWidth` 大 1px，重点案例标题不产生隐藏横向内容。其他首屏、网格、Logo、FAQ、锚点、详情链接及 CMS 回退行为按合同验证。

Actual：

- 冻结源码 13/13 项 SHA-256 与 `frozen-source-hashes.json` 一致。
- 相关 Vitest 5 个文件 **24/24 passed**；新增案例显示边界测试覆盖 slug 优先/映射无匹配不造链接、简介回退、空指标过滤与 3 项上限。
- 案例独立 Playwright E2E **2/2 passed**，既有 `about-cases`、`home-product` 案例回归在修正选择器后通过；1440×900 与 768×1024 CLI 检查通过。
- 390×844 在开发预览和隔离 build server 均为 `document/body.scrollWidth=392`、`clientWidth=390`；重点标题 `UR（Urban Revivo）` 的 `getBoundingClientRect().width=358`、`scrollWidth=376`，其父 `.cases-featured__content` 同样 `scrollWidth=376`。因此页面超过允许的 1px 容差，不能判定移动端验收通过。

Reproduction：

```text
XDG_CACHE_HOME=/tmp/xyy-20260924-01-playwright-cache \
NPM_CONFIG_CACHE=/tmp/xyy-20260924-01-npm-cache \
npm_config_cache=/tmp/xyy-20260924-01-npm-cache \
bash output/playwright/xyy-20260924-01/luna/cases-overview-qa.sh
```

Evidence：[cases-overview-qa.sh](../output/playwright/xyy-20260924-01/luna/cases-overview-qa.sh)、[cases-1440x900.raw.txt](../output/playwright/xyy-20260924-01/luna/cases-1440x900.raw.txt)、[cases-768x1024.raw.txt](../output/playwright/xyy-20260924-01/luna/cases-768x1024.raw.txt)、[cases-390x844.raw.txt](../output/playwright/xyy-20260924-01/luna/cases-390x844.raw.txt)、[overflow-390-build.raw.txt](../output/playwright/xyy-20260924-01/luna/overflow-390-build.raw.txt)、[cases-390x844.png](../output/playwright/xyy-20260924-01/luna/screenshots/cases-390x844.png)、[cases-1440x900.png](../output/playwright/xyy-20260924-01/luna/screenshots/cases-1440x900.png)、[cases-768x1024.png](../output/playwright/xyy-20260924-01/luna/screenshots/cases-768x1024.png)。

Likely affected area：`src/styles/cases-overview-base.css` 中重点案例移动端标题/内容宽度与换行约束，具体溢出节点为 `.cases-featured__content` / `.cases-featured h2`。Luna 未修改实现，已交 Terra 做最小修复。

Severity：MEDIUM（合同明确要求 390/360 移动端无横向溢出；阻断本任务 PASS）。

Remaining risks：按 Sol 指示已暂停依赖当前实现的后续浏览器检查；因此 360、no-JS 截图/结果尚未进入本轮脚本尾段。CMS 相关既有回退/成功空/401/403/网络语义单测本轮定向 20 项通过；未写 CMS、数据库、联系表单、生产环境、部署或提交。

### XYY-20260924-01 — 合作案例总览修复后复测

Task ID: XYY-20260924-01

Result: **FAIL**（指定 4322 隔离预览的 390×844 横向溢出仍存在，已再次返回 Sol/Terra）

Expected：新增标题换行 CSS 后，字体加载完成的 390×844、360×800 页面均满足 `scrollWidth <= clientWidth + 1px`，重点案例长标题不产生隐藏横向内容；随后继续完成 no-JS、reduced-motion、四视口、Logo/FAQ/详情链接及 CMS 边界验证。

Actual：

- 更新冻结 manifest 共 14 文件，SHA-256 **14/14 MATCH**。
- 隔离 4399 重建后的 `cases-overview.spec.ts` 页面级 E2E **2/2 passed**，其 390/360 页面级 overflow 判据通过；该结果与指定 4322 CLI 证据不一致，未据此覆盖 4322 FAIL。
- 指定 `http://127.0.0.1:4322/cases`，等待 `document.fonts.ready` 后，360×800 为 `360/360`，标题正常换行；390×844 仍为 `document/body.scrollWidth=392`、`clientWidth=390`，重点标题 `UR（Urban Revivo）` 为 `scrollWidth=376`、`clientWidth=358`。新规则 `overflow-wrap:anywhere` 与 `min-width:0` 已计算生效，但未消除 390 溢出。
- 已暂停依赖当前实现的 no-JS、reduced-motion、完整四视口 CLI 及后续边界验证，避免在实现未收口时宣称 PASS。

Reproduction：

```text
XDG_CACHE_HOME=/tmp/xyy-20260924-01-playwright-cache \
NPM_CONFIG_CACHE=/tmp/xyy-20260924-01-npm-cache \
npm_config_cache=/tmp/xyy-20260924-01-npm-cache \
PW_SESSION=xyy-20260924-01-luna-cases-r2 \
bash output/playwright/xyy-20260924-01/luna/cases-overview-qa.sh
```

Evidence：[cases-390x844.raw.txt](../output/playwright/xyy-20260924-01/luna/cases-390x844.raw.txt)、[overflow-360.raw.txt](../output/playwright/xyy-20260924-01/luna/overflow-360.raw.txt)、[css-390.raw.txt](../output/playwright/xyy-20260924-01/luna/css-390.raw.txt)、[overflow-390-build.raw.txt](../output/playwright/xyy-20260924-01/luna/overflow-390-build.raw.txt)、[cases-overview-qa.sh](../output/playwright/xyy-20260924-01/luna/cases-overview-qa.sh)。

Likely affected area：`src/styles/cases-overview-title-wrap.css` 新增的标题换行规则尚未覆盖 4322 390px 字体布局的实际溢出，具体节点为 `.cases-featured__content` / `.cases-featured h2`。Luna 未修改实现。

Severity：MEDIUM（指定隔离预览仍不满足移动端无横向溢出验收，阻断本任务 PASS）。

Remaining risks：CMS、数据库、联系表单、生产环境和部署均未操作；24 项既有定向 Vitest 未因 CSS 复测重复运行。等待 Terra/Sol 对 4322 与 4399 差异及 390px 长标题布局收口后再继续独立复测。

### XYY-20260924-01 — 合作案例总览第三轮独立复测

Task ID: XYY-20260924-01

Result: **PASS**（第三轮最终冻结版本；交 Nova 复核）

Tests performed：

- 最新 `frozen-source-hashes.json` 共 14 个文件，独立 SHA-256 **14/14 MATCH**；`npm run build` 在 14:51 新鲜重建，产物 CSS 明确包含 `letter-spacing:normal`。
- 指定 4322 隔离预览，等待字体完成后 1440×900、768×1024、390×844、360×800 均 PASS：页面无横向溢出，重点标题在 390/360 均两行且 `scrollWidth=clientWidth`；390/360 页面宽度分别为 390/360。Logo/FAQ/reduced-motion 控件检查 PASS，78 个 Logo 逐图滚入并确认 `naturalWidth>0`。
- 新鲜重建 4399 build server 的 no-JS 390×844、360×800 均 PASS；字体为 `loaded`，文档宽度与 viewport 相等，原生 details、Hero、`#cases-grid`、6 张卡片和 FAQ 均保留。
- 新增案例 E2E Chromium **2/2 passed**；about-cases **1/1**、home-product 案例相关 **5/5**、CMS fallback 与 service-pages 定向回归 **2/2**；mobile project 案例新测 **2/2**、CMS fallback **1/1**、service mobile navigation **1/1**。
- 六个本地详情链接 `/cases/ur`、`/cases/maxrieny`、`/cases/xingmian`、`/cases/meiyi`、`/cases/romi-studio`、`/cases/inman` 均 HTTP 200 且有非空 H1。
- AstroContainer SSR boundary：`node output/playwright/xyy-20260924-01/luna/cases-container-boundaries.mjs` 输出 **PASS**；空数组不渲染 Featured 且显示明确空态，无 stats 不渲染空 `<dl>`，无 slug/无映射不生成详情链接且保留完整简介，无 UR 时首项成为 Featured 且列表顺序保持。
- 新增测试修正后 `npx prettier --check`、scoped ESLint、`git diff --check` 与 `npm run typecheck` 均 PASS；typecheck 为 513 files、0 errors/warnings/hints。此前已通过且不受 CSS 影响的案例/CMS Vitest 24/24 保持有效，未无理由重复运行。

Regression coverage：四视口首屏深色 Hero、双 CTA、导航几何、锚点、网格 3/2/1 列、完整卡片、重点四项指标、卡片最多三项指标、详情链接、12+66 Logo 原生展开、逐图资源加载、FAQ 键盘、reduced-motion、fresh build no-JS、CMS 网络回退/成功空/401/403/非法响应单测语义，以及首页案例/关于案例/服务页定向回归。

Evidence：[cases-1440x900.raw.txt](../output/playwright/xyy-20260924-01/luna/cases-1440x900.raw.txt)、[cases-768x1024.raw.txt](../output/playwright/xyy-20260924-01/luna/cases-768x1024.raw.txt)、[cases-390x844.raw.txt](../output/playwright/xyy-20260924-01/luna/cases-390x844.raw.txt)、[cases-nojs-build-fresh.raw.txt](../output/playwright/xyy-20260924-01/luna/nojs-390-build-fresh.raw.txt)、[nojs-360-build-fresh.raw.txt](../output/playwright/xyy-20260924-01/luna/nojs-360-build-fresh.raw.txt)、[detail-links-build.raw.txt](../output/playwright/xyy-20260924-01/luna/detail-links-build.raw.txt)、[cases-container-boundaries.json](../output/playwright/xyy-20260924-01/luna/cases-container-boundaries.json)、[cases-container-boundaries.stdout.txt](../output/playwright/xyy-20260924-01/luna/cases-container-boundaries.stdout.txt)、[cases-container-boundaries.mjs](../output/playwright/xyy-20260924-01/luna/cases-container-boundaries.mjs)、[cases-nojs-build-390.png](../output/playwright/xyy-20260924-01/luna/screenshots/cases-nojs-build-390.png)、[cases-nojs-build-360.png](../output/playwright/xyy-20260924-01/luna/screenshots/cases-nojs-build-360.png)、[cases-controls-390.png](../output/playwright/xyy-20260924-01/luna/screenshots/cases-controls-390.png)。

Remaining risks：验证限本地隔离 4322 与新鲜 4399 的 headless Chromium 模拟视口，未覆盖真实设备、其他浏览器、生产环境或真实 CMS/数据库；未提交、推送、部署或提交真实联系表单。4322 的旧 no-JS 诊断因 Vite 开发模式未注入最新 CSS 已保留为历史证据，已由新鲜 4399 build no-JS 结果 supersede，不作为最终结论。

Handoff：Luna 独立验证 PASS，交 Nova 进行只读质量、范围、契约与回归审阅；Luna 未修改业务实现、CMS、数据库、环境或部署。

### XYY-20260924-01 — remove-featured 增量独立验证

Task ID：XYY-20260924-01

Result：**PASS**（去除重复 Featured 的七文件冻结增量；交 Sol/Nova）

Tests performed：

- `output/cases-redesign/xyy-20260924-01/remove-featured/frozen-hashes.json` 的 7 个路径独立 SHA-256 校验为 `count=7, bad=[]`；删除的 `CasesFeatured.astro` 保持不存在。
- 新鲜 4399 build server 上执行 `PLAYWRIGHT_PORT=4399 npx playwright test tests/e2e/cases-overview.spec.ts tests/e2e/home-product.spec.ts --project=chromium --workers=1`，**7 passed**。
- 独立浏览器脚本在 1440×900、768×1024、390×844、360×800 均 PASS；每张案例图片逐张滚入视口并确认 `naturalWidth>0` 后截图。四视口分别通过 Featured=0、Hero 紧邻 `#cases-grid`、六卡原顺序、UR 单详情链接、最多三指标、详情链接、Logo 12+66、FAQ/CTA、导航无遮挡、无横溢及 3/2/1/1 列。
- 新鲜 4399 build 的 JavaScript-disabled 390×844 PASS：Hero→grid、6 卡、无 Featured、无横溢，原生 CTA 导航至 `#cases-grid`。
- `npx prettier --check tests/e2e/cases-overview.spec.ts tests/e2e/home-product.spec.ts`、scoped ESLint 与 `git diff --check` 均 PASS。

Regression coverage：更新后的 `cases-overview` 两项和 `home-product` 案例页项；相关首页/产品回归共 7 项；去除重复 Featured 后六案例顺序、UR 唯一详情链接、每卡指标上限、Hero 双 CTA、锚点、Logo/FAQ 均保持。

Evidence：[verification-summary.md](../output/playwright/xyy-20260924-01/remove-featured/verification-summary.md)、[e2e-targeted.log](../output/playwright/xyy-20260924-01/remove-featured/e2e-targeted.log)、[luna-remove-featured-qa.sh](../output/playwright/xyy-20260924-01/remove-featured/luna-remove-featured-qa.sh)、四视口及 no-JS 原始结果（同目录 `cases-*.raw.txt`）和截图（同目录 `screenshots/`）。

Remaining risks：验证限本地新鲜 4399 build 与 headless Chromium 模拟视口，未覆盖真实设备、其他浏览器、真实 CMS/数据库或生产环境；未执行真实表单、部署、提交或推送。`about-cases.spec.ts` 不在本次七文件冻结增量内；临时加入的两条重复断言已撤回，当前文件 SHA-256 `23ada6270077cfd8b06d2b204c12812bc7707fe16deb7332437def92c649bb31` 与 `remove-featured/baseline-hashes.json` 一致，既有 UR 标题与 Logo 断言保留。

Handoff：Luna 未修改应用实现；仅新增本轮浏览器证据与验证摘要，交 Sol/Nova 复核。

### XYY-20260924-01 — remove-faq 增量独立验证

Task ID：XYY-20260924-01

Result：**PASS**（移除指定 FAQ 的单文件增量）

Tests performed：

- 4322 隔离预览 HTTP `GET /cases` 返回 **200**；当前正文目标问题出现次数为 `0`，FAQPage JSON-LD 包含 **7** 个 Question。
- `src/pages/cases.astro` SHA-256 为 `7db80c997325b18cc068280f306d37406d9915829e80165ec2a2ec5c68d3895a`，与 Terra 冻结值一致；remove-faq baseline 的 552 个 `src/` 文件中仅该页面发生差异，FAQ 数据、Directus 读取与 SEO helper 保持 hash。
- 现有 4322 预览 Playwright CLI 在 1440×900、390×844 均 PASS：可见 FAQ 与 FAQPage JSON-LD 均为旧 8 题去目标后的 7 题，文案/顺序一致；目标问答从可见内容、JSON-LD 和 body 消失；首条 FAQ 可原生展开且答案非空；无横向溢出。
- 代码只读确认：`allFaqs` 由 `getFaqs('cases', CASE_FAQS)` 得到后按 `q.trim()` 精确过滤，过滤结果同时传给 `PageFAQ` 与 `createFaqSchema`；未改 `getFaqs` 的成功空、错误与回退语义。

Regression coverage：本轮仅验证 `/cases` FAQ 可见层、FAQPage JSON-LD、顺序/文案、1440/390 展开与宽度边界，以及应用单文件 hash 和 `src/` 保护范围；未重跑前轮无关测试。

Evidence：[luna-verification.md](../output/cases-redesign/xyy-20260924-01/remove-faq/luna-verification.md)、[hash-protection.json](../output/playwright/xyy-20260924-01/remove-faq/hash-protection.json)、[http-head.txt](../output/playwright/xyy-20260924-01/remove-faq/http-head.txt)、[faq-1440x900.raw.txt](../output/playwright/xyy-20260924-01/remove-faq/faq-1440x900.raw.txt)、[faq-390x844.raw.txt](../output/playwright/xyy-20260924-01/remove-faq/faq-390x844.raw.txt) 与同目录截图。

Remaining risks：验证限本地 4322 隔离开发预览和 headless Chromium 模拟视口，未执行 fresh build、全量 E2E、typecheck、真实 CMS/数据库/表单、部署、提交或推送；Luna 未修改测试或应用文件。

Handoff：Luna 独立验证 PASS，交 Sol/Nova 增量复核。

### XYY-20260924-01 — release 发布阶段独立预检

Task ID：XYY-20260924-01

Result：**PASS**（发布前独立预检；未执行实际 deploy/SSH/push）

Tests performed：

- root HEAD 与固定 candidate HEAD 均为 `5081bdc372f550894c25d82115a2eb4f6bbcea32`；candidate 工作区 clean，旧 stash `stash@{0}` 保留。root 工作区仍有 18 项既有治理/日志/媒体脏状态，未宣称根目录 clean。
- commit 路径与 `release-paths.json` 精确一致：21 paths，16 present、5 deleted；candidate 21 路径 SHA-256 全部匹配 `frozen-hashes.json`；提交路径未包含治理、媒体、secret 或 `.env`。
- `run-deploy.sh` SHA-256 `9844a8176ec493a64959fb97e39a6005646b7dcc75c8a04352a21d91ac68148f`、`server-snapshot.mjs` SHA-256 `badd0564f02a8fee3a1bcd84802da0a0ee8da5fa91c2ec16a56d868cc1179762`；`bash -n` 与 `node --check` 均通过。
- 在固定 release 目录执行 `DEPLOY_PREFLIGHT_ONLY=true bash ./run-deploy.sh`，退出码 0，输出 `deployment preflight ok`；该分支在 candidate 本地 manifest 后退出，Luna 未触发 SSH。
- wrapper 静态核对 expected SHA、candidate root/HEAD/clean、21 路径 hash gate、staging host/site、`RELEASE_KEEP=100` 与端口 4399 均存在；原 `scripts/deploy.sh` 的首次 SSH 前 `npm run verify:release` gate 保持。
- `precommit-check.json` 与既有日志核对：verify exit 0、512 types、493 unit tests、build PASS；format PASS；production dependency audit vulnerabilities `0`。未重复运行完整 verify:release。
- `server-before.json` 快照契约核对 PASS：仅输出当前 manifest 安全字段、previous target、release names/modes 与 `xyy-web`/`xyy-cms` 的 pid/status；10 个现有 release 均保留，未出现敏感环境值。

Regression coverage：覆盖精确提交/候选 checkout、21 路径增删与 hash、治理/媒体/secret 排除、wrapper 固定目标与 preflight 分支、首次 SSH 前 release gate、verify/format/audit 输入、RELEASE_KEEP=100 与快照安全元数据。

Evidence：[luna-preflight.json](../output/cases-redesign/xyy-20260924-01/release/luna-preflight.json)、[luna-snapshot-safety.json](../output/cases-redesign/xyy-20260924-01/release/luna-snapshot-safety.json)、[luna-wrapper-preflight.log](../output/cases-redesign/xyy-20260924-01/release/luna-wrapper-preflight.log)、[terra-release-prep.md](../output/cases-redesign/xyy-20260924-01/release/terra-release-prep.md)、[precommit-check.json](../output/cases-redesign/xyy-20260924-01/release/precommit-check.json)、[verify.log](../output/cases-redesign/xyy-20260924-01/release/verify.log)、[server-before.json](../output/cases-redesign/xyy-20260924-01/release/server-before.json)。

Remaining risks：Luna 未执行 `npm run verify:release`、真实 SSH/deploy、GitHub push 或发布后线上 QA；candidate/commit/precommit 输入均已独立核对。实际外部写操作仍由 Sol 按授权执行。

Handoff：Luna 发布前独立预检 PASS，交 Nova/Sol 进入后续发布闸门。

### XYY-20260924-01 — release staging 发布后独立 QA

Task ID：XYY-20260924-01

Result：**PASS**

Tests performed：

- 只读 `GET https://wz.tomatopia.top/version` 返回 SHA `5081bdc372f550894c25d82115a2eb4f6bbcea32`、release `20260924T091109Z-5081bdc`、`staging`；`GET /healthz` 返回 `ok`，CMS/contact 依赖均 ok。
- 真实 staging `/cases` 在 1440×900、390×844 均通过：无 console/pageerror、无横溢、Hero/双 CTA/导航无遮挡、无 Featured、Hero 紧邻案例 grid、6 卡与 CMS 顺序正确。
- CMS 六案例顺序与发布前 live baseline 一致：UR、MAXRIENY、幸棉、MEIYI、ROMI STUDIO、初语（TOYOUTH）；未以本地 fallback 的 INMAN 替换。六卡图片逐张滚入并确认 `naturalWidth>0` 后重新截图。
- UR 仅 1 个详情链接；6 个详情路由 `/cases/ur`、`/cases/maxrieny`、`/cases/xingmian`、`/cases/meiyi`、`/cases/romi-studio`、`/cases/toyouth` 均 HTTP 200 且有 H1；每卡最多 3 项指标。
- 目标 FAQ 同时从正文与 FAQPage JSON-LD 消失；余下 7 题与旧 8 题删除目标后的文案/顺序一致。Logo 12+66 原生 details、FAQ 展开、`#cases-grid` 锚点、`/contact` CTA 均通过。

Regression coverage：发布身份/健康、真实 CMS 案例顺序、Hero/grid、卡片链接与图片加载、FAQ 正文/Schema、Logo/FAQ 原生交互、CTA/锚点、1440/390 无溢出及 console/pageerror。

Evidence：[luna-post-qa.md](../output/cases-redesign/xyy-20260924-01/release/luna-post-qa.md)、[luna-post-result.json](../output/cases-redesign/xyy-20260924-01/release/luna-post-result.json)、[luna-post-version.json](../output/cases-redesign/xyy-20260924-01/release/luna-post-version.json)、[luna-post-health.json](../output/cases-redesign/xyy-20260924-01/release/luna-post-health.json)、[recapture-cases-1440x900.raw.txt](../output/playwright/xyy-20260924-01/release/recapture-cases-1440x900.raw.txt)、[recapture-cases-390x844.raw.txt](../output/playwright/xyy-20260924-01/release/recapture-cases-390x844.raw.txt) 与同目录最终截图。首轮 fixed-nav 中部现象已判定为 smooth-scroll 截图时序问题，最终截图在 `scrollY=0` 且连续两帧几何稳定后重取，应用无变更。

Remaining risks：验证限真实 staging、headless Chromium 两个视口与只读 GET/浏览器导航；Luna 未提交表单、写 CMS/数据库、部署、push 或 commit。完整发布门禁与远端部署检查沿用 Sol 已提供结果，未重复执行。

Handoff：Luna 发布后独立 QA PASS，交 Nova/Sol 最终验收。

### XYY-20260926-02 — 首页底部转化区独立验证

Task ID：XYY-20260926-02

Result：**PASS**

Tests performed：在本地 `http://localhost:4322/` 用严格 Playwright CLI 脚本检查 1440×900、1024×900、768×1024、390×844、360×800；五视口均 PASS。1440/1024 为两栏，768/390/360 为单栏；页面与 body 无横向溢出、无 console/page error。批准的标题、说明、右卡标题、三项完整细节、条件文案和 01/02/03 均可见；标题 Range 字形行统计为 `[5]`、`[6]`，无意外单字行。`/contact`、`/cases` GET 均返回 200，主 CTA、案例、电话链接、键盘焦点与 FAQ 通过。

Regression coverage：`HomeFAQ.astro` 当前 hash 为冻结值 `462675806a87b1220533713c1c0ab030d90322e52ae1b39a69cecd9e17efdf88`；新增 `home-conversion-cta.css` hash 为 `5aedd139781abeb9ae498ac46f1339a0e767517ac362c8dc18061ae025a8ae79`。共享 `ConversionCTA.astro` 与 `conversion-cta.css` hash 保持 `4dbedc6f6f63246c22ec6ed4b5773fe60a1a4486d7226952e74d40fb80475d2e`、`9d3816963e9cddfd1b7d677ed40e5034de3c348447459ccbaa42c7b9874eb535`；基线 546 个 `src/` 文件逐项复核仅批准的 `HomeFAQ.astro` 差异。未修改应用、持久测试、CMS、数据库或环境。

Evidence：[luna-verification.md](../output/home-conversion/xyy-20260926-02/luna-verification.md)、[luna-result.json](../output/home-conversion/xyy-20260926-02/luna-result.json)、[1440 screenshot](../output/playwright/xyy-20260926-02/screenshots/home-conversion-1440x900.png)、[390 screenshot](../output/playwright/xyy-20260926-02/screenshots/home-conversion-390x844.png) 及同目录其余视口 raw/check 结果与截图。

Remaining risks：仅覆盖本地 4322 与 headless Chromium 模拟视口；未覆盖真实设备、其他浏览器、构建产物、CMS、表单提交、部署或推送。局部截图保留本地 Astro fixed 导航、浮动按钮和开发工具条，内容与几何断言独立通过；Sol 可另取纯 CTA 展示图。

Handoff：Luna 独立验证 PASS，交 Sol/Nova 复核。

### XYY-20260926-02 — remove-links 增量独立验证

Task ID：XYY-20260926-02（remove-links）

Result：**PASS**

Tests performed：在本地 `http://localhost:4322/` 用 Playwright CLI 检查 1440×900、390×844，实际工具结果为 `status=PASS`。CTA 内“查看合作案例”和“咨询热线：400-6865-156”均不存在，`.conversion-cta__links` 不存在，唯一 CTA anchor 为 `/contact`；标题、说明、三项内容、FAQ 与无横溢通过，console/page error 为空。两视口局部截图已保存。

Regression coverage：`HomeFAQ.astro` 当前 hash `bc30f1938d8d3c0abf8f7f9fd29b8ca3471454bfa4356364a951a20896a23d8c` 与 Terra 冻结值一致。remove-links 646 路径基线逐项复核仅该文件发生预期变更（上一冻结值 `462675806a87b1220533713c1c0ab030d90322e52ae1b39a69cecd9e17efdf88` → 当前冻结值）；未修改实现、测试、CMS、数据库或环境。

Evidence：[luna-verification.md](../output/home-conversion/xyy-20260926-02/remove-links/luna-verification.md)、[luna-result.json](../output/home-conversion/xyy-20260926-02/remove-links/luna-result.json)、[1440 screenshot](../output/playwright/xyy-20260926-02/remove-links/screenshots/home-conversion-1440x900.png)、[390 screenshot](../output/playwright/xyy-20260926-02/remove-links/screenshots/home-conversion-390x844.png)、[raw Result](../output/playwright/xyy-20260926-02/remove-links/luna-remove-links.raw.txt)。

Remaining risks：仅覆盖本地 4322 与 headless Chromium 两个模拟视口，未覆盖真实设备、其他浏览器、构建产物、全量套件、CMS、表单提交、部署或推送；截图保留本地固定导航、浮动按钮与 Astro 开发工具条。

Handoff：Luna 独立验证 PASS，交 Sol 复核。

### XYY-20260926-04 — 广州页删除独立验证

Task ID：`XYY-20260926-04`

Result：**FAIL**。合同要求 `/guangzhou-xiefu-yuncang` 有无尾斜杠均直接 404 且无重定向；fresh build 隔离服务实测无尾斜杠为 `404`，尾斜杠为 `301 Location: /guangzhou-xiefu-yuncang`。这是 MEDIUM，阻塞该 AC 与整体 PASS。

Tests performed：`npx vitest run tests/unit/service-page-seed-structure.test.ts tests/unit/cms-setup.test.ts tests/unit/claims-generated.test.ts --maxWorkers=1` 通过 3 files/23 tests；定向 fresh-build Playwright 通过 8、跳过 2；9 service seeds、85 FAQ seeds、8 specialty links 无广州对象；sitemap/llms 无广州匹配；保护基线 1340 文件检查 `protectedMismatches=0`。运到 classic 1440/390 稳定截图及广州 404 截图已保存。

Evidence：[luna-validation.md](../output/orphan-audit/xyy-20260926-04/luna-validation.md)、[guangzhou 404 desktop](../output/playwright/xyy-20260926-04/guangzhou-404-1440x900.png)、[guangzhou 404 mobile](../output/playwright/xyy-20260926-04/guangzhou-404-390x844.png)、[yundao classic desktop](../output/playwright/xyy-20260926-04/yundao-classic-1440x900-stable.png)、[yundao classic mobile](../output/playwright/xyy-20260926-04/yundao-classic-390x844-stable.png)。

Likely affected area：删除路由后仍生效的 Astro/server 全局尾斜杠 canonical redirect；Luna 未修改实现，已交 Sol/Terra 修复后复测。

Remaining risks：仅本地隔离构建与 headless Chromium；未访问真实 CMS/DB、提交表单、部署或外部写入。尾斜杠行为修复后需复测两种旧 URL。

Handoff：Luna 独立验证 FAIL，交 Sol → Terra → Sol → Luna Re-test。

### XYY-20260926-04 — 修订 AC1 定向复测

Task ID：`XYY-20260926-04`

Result：**PASS（按修订后的 AC1）**。保留初轮 [luna-validation.md](../output/orphan-audit/xyy-20260926-04/luna-validation.md) FAIL；本轮按修订合同验证 canonical 404、尾斜杠既有全站 301 到 canonical 后 404。

Tests performed：`PLAYWRIGHT_PORT=4399 npx playwright test tests/e2e/contracts.spec.ts --grep 'core pages and discovery' --workers=1` 结果 1 passed/1 skipped；`npx vitest run tests/unit/request-policy.test.ts --maxWorkers=1` 结果 1 file/11 tests passed。原始 HTTP：无尾斜杠 `404`、无 `Location`；尾斜杠 `301 Location: /guangzhou-xiefu-yuncang`；跟随一次后 `404`。sitemap/llms 广州匹配均为 0。

Regression coverage：`server/request-policy.mjs` 当前/基线 hash 均为 `793eba0459fd5300ab2ad86a38cb6f158eb342b4386e64d31604e88259089a97`；修订后的 `tests/e2e/contracts.spec.ts` hash 与冻结值 `66ac11065787b52e798d6614fdaca4398a5ed7e45ecb57ddc1fe6be5a470dbbb` 一致；`git diff --check` 通过。未修改应用实现或外部系统。

Evidence：[luna-retest.md](../output/orphan-audit/xyy-20260926-04/luna-retest.md)。

Remaining risks：本轮仅复测修订 AC1，未重复初轮已通过的页面矩阵、业务单测或截图；未访问真实 CMS/DB、部署或推送。交 Sol 后进入 Nova Review。

Handoff：Luna 修订 AC 独立复测 PASS，交 Sol → Nova Review；初轮 FAIL 保留。

### XYY-20260927-01 — 清理后验证准备

Task ID：`XYY-20260927-01`

Status：**READY，未开始清理后验证**。已读取合同、ownership/baseline、清理前 `runtime-before.json` 与 18 个保存响应；未清理候选、未重建 dist、未执行应用构建或外部写入。

Prepared：[luna-validation-plan.md](../output/orphan-cleanup/xyy-20260927-01/luna-validation-plan.md) 与只读 [luna-semantic-probe.mjs](../output/orphan-cleanup/xyy-20260927-01/luna-semantic-probe.mjs)。探针比较 15 个现用页面、广州 404、sitemap、llms 的 status、可见正文、title/description/canonical/JSON-LD、链接和媒体引用；归一化 origin，忽略 Astro 构建 hash、script/style 与空 wrapper，不执行 HTML 脚本。

Validation gate：Terra 冻结新构建后，必须使用全新隔离服务运行语义探针，并用 1440/390 检查 about/product/yundao/xiefu、9 服务路由矩阵、core SEO、广州 404、导航/CTA/About/Product 交互、console/pageerror 与横溢。不得复用旧 4399 bundle 作为新代码证据。

Check：`node --check output/orphan-cleanup/xyy-20260927-01/luna-semantic-probe.mjs` 通过。修正基线路径、H1 映射、对象/数组深比较及已知本地 origin 归一化后，以原 4399 对保存基线做自检：18/18 status、18/18 semantic 通过；该自检只证明探针自身，不能作为清理后证据。本阶段仍没有清理后 PASS/FAIL 结论，等待 Terra 实现冻结。

Handoff：交 Sol，等待清理后独立验证闸门。

### XYY-20260927-01 — 清理后独立验证

Task ID：`XYY-20260927-01`

Result：**PASS**。使用最终版 fresh build 与新隔离服务 `127.0.0.1:4509`；旧 4399 仅用于基线，4322/4321 未触碰。

Tests performed：18 条清理前响应语义比较 `18/18 status、18/18 semantic PASS`；定向 Playwright service-pages/service-motion/conversion-cta 结果 `9 passed、1 skipped`。覆盖 9 服务路由桌面/手机、运到 classic、鞋服移动/Reduced Motion、About 弹层、Product/CTA。Core SEO 6 路由均 200/H1/metadata/JSON-LD 完整；广州 canonical `404`、尾斜杠 `301 Location: /guangzhou-xiefu-yuncang`，随后 canonical 404；sitemap/llms 无广州匹配。

Regression coverage：Product 8 video/8 links 与保障区、运到 Signature/Experience/FAQ/CTA、鞋服 3 tabs/5 FAQ、About 荣誉大图交互均通过；广州 4 个媒体 hash 与 baseline 一致；package/package-lock 仅移除 `@astrojs/sitemap` 及独占传递依赖，无版本升级。截图与完整证据见 [luna-validation.md](../output/orphan-cleanup/xyy-20260927-01/luna-validation.md)。

Remaining risks：仅本地 fresh build、headless Chromium 两视口和不可达 Directus fallback；未访问真实 CMS/DB、提交表单、部署或推送。Terra 最终 typecheck/lint/format/unit/scan 作为实现侧证据，Luna 未重复完整 verify。

Handoff：Luna 独立验证 PASS，交 Sol → Nova Review；未修改应用实现。

### XYY-20260927-01 — Product 移动端补充覆盖

Task ID：`XYY-20260927-01`

Result：**PASS（补充覆盖）**。复用最终 dist，仅重启自己的 4509 隔离服务，未重建或重跑绿色套件。

Tests performed：390×844 Product 检查 9 个 slide、8 个 video/source、初始 `01 / 09`、点击下一个到 `02 / 09`，连续切换到保障区 `09 / 09` 并确认保障标题和 next disabled，再点击上一个回到 `08 / 09`；viewport/content 均 390，console/pageerror 为空。

Evidence：[product mobile screenshot](../output/playwright/xyy-20260927-01/product-390x844.png)，完整结果追加在 [luna-validation.md](../output/orphan-cleanup/xyy-20260927-01/luna-validation.md)。服务已停止，未修改应用实现。

Handoff：补充覆盖通过，交 Sol 继续 Nova Review。

### XYY-20260927-02 — 本地 `/news` 500 独立诊断

Task ID：`XYY-20260927-02`

Result：**诊断完成**。只读复现：4399/news 与 4321/news 均 HTTP 500、空响应；4322/news HTTP 200。当前已有 dist 未重建，由新 4509 进程提供 `/news` HTTP 200，title `行业动态 | 新亦源供应链`、H1 `鞋服物流知识库`，Directus 不可达时进入正常空内容 fallback。

Evidence：当前 `dist/server/entry.mjs` mtime `2026-09-27 07:33:23 +0800`，其 `/news` 映射的 `dist/server/chunks/index_B93yEmUX.mjs` 存在；news/directus 相关源码 baseline hash 均未变。完整证据见 [luna-diagnosis.md](../output/news-diagnosis/xyy-20260927-02/luna-diagnosis.md)。

Likely cause：旧 4399 进程启动时间早于当前 dist 重建，最符合旧 SSR entry/chunk 引用失效导致新闻路由动态加载 500；这是高可信推断，当前命名空间无法读取 PID 57592 的 stderr/`/dev/console`，未捕获缺失 chunk 堆栈。4321 为另一个全路由 500 的失效/过期实例。

Recovery boundary：4509 临时服务已停止；未重启 4399/4321，不宣称既有入口恢复。最小动作是服务所有者确认目标后用当前 dist 重启并复测 `/news`，必要时读取实际 stderr。

Handoff：交 Sol → Nova 复核；未修改应用、测试、配置、媒体或外部系统。

### XYY-20260927-03 — 发布前独立验证

Task ID：`XYY-20260927-03`

Result：**PASS（发布前本地门禁）**。

Tests performed：只读核对 `release-paths.json`/`candidate-check.json`、冻结 hash、主工作区保护 hash、配置与广州媒体；运行隔离环境 `npm run verify`，命令完整日志见 [verify.log](../output/release/xyy-20260927-03/verify.log)。candidate 共 141 路径，38 项保留 hash 与 103 项预期删除项精确匹配；主工作区 1,233/1,233 保护路径匹配。广州四份媒体均存在且 hash 匹配，未修改媒体。依赖与 Astro 配置均无 `@astrojs/sitemap`。

Regression coverage：verify 退出码 `0`；Astro typecheck 457 files、0 errors/0 warnings/0 hints；lint PASS；maintainability 624 files PASS；assets 68 referenced + 103 deployment assets across 429 source files PASS；Vitest 68 files/493 tests PASS；Astro server build PASS。完整结构化结果见 [luna-preflight.json](../output/release/xyy-20260927-03/luna-preflight.json)，报告见 [luna-preflight.md](../output/release/xyy-20260927-03/luna-preflight.md)。

Remaining risks：本轮未运行 `verify:release`、未部署、未推送 GitHub、未访问线上或提交表单；线上 `/healthz`、`/version`、`/news`、桌面/手机与独立 Playwright 4510 留待发布后步骤。中间 hash 脚本曾将 `null` 删除项及主工作区保护文件误作 candidate 缺失，已修正；最终证据按正确口径生成，应用无失败。

Handoff：Luna 发布前独立验证 PASS，交 Sol → Nova 发布前 Review；未修改应用、Git 或外部系统。

### XYY-20260927-03 — contracts 修复后复测（当前尝试）

Task ID：`XYY-20260927-03`

Result：**FAIL（发布门禁阻塞）**。隔离 `PLAYWRIGHT_PORT=4510` 的 contracts 定向用例 1 passed；随后完整 `npm run verify` 退出码 1，在 maintainability 阶段报告 `tests/e2e/contracts.spec.ts` 为 221 行、超过 220 行预算。typecheck 已 457 files、0 errors/0 warnings/0 hints；尚未进入 Vitest/build。

Evidence：[luna-retest.md](../output/release/xyy-20260927-03/luna-retest.md)、[luna-retest.json](../output/release/xyy-20260927-03/luna-retest.json)、[contracts-retest.log](../output/release/xyy-20260927-03/contracts-retest.log)、[verify-retest.log](../output/release/xyy-20260927-03/verify-retest.log)。

Likely affected area：仅测试文件维护性预算；Luna 未修改任何测试、应用、Git 或外部系统。Severity：HIGH，阻塞发布。需最小调整后沿同一 Task ID 重新跑完整 verify。

### XYY-20260927-03 — 最终 candidate verify 复测

Task ID：`XYY-20260927-03`

Result：**PASS（提交前完整 verify）**。Terra 仅将 `tests/e2e/contracts.spec.ts` 的 baseURL 断言排版压回既有 220 行维护性预算，未改变语义；Luna 未修改测试或应用。最终 `npm run verify` 在隔离环境退出码 0：457 files typecheck 零诊断、lint PASS、624 files maintainability PASS、68 files/493 tests PASS、资源检查与 Astro build PASS。

Evidence：[luna-retest-2.md](../output/release/xyy-20260927-03/luna-retest-2.md)、[luna-retest-2.json](../output/release/xyy-20260927-03/luna-retest-2.json)、[verify-retest-2.log](../output/release/xyy-20260927-03/verify-retest-2.log)。此前预算 FAIL 保留于 [luna-retest.md](../output/release/xyy-20260927-03/luna-retest.md) 与 `verify-retest.log`。

Remaining risks：线上部署、`verify:release`、GitHub/服务器状态及 staging 桌面/手机只读验收尚未由 Luna 执行；等待部署成功后按既定脚本验收。

Handoff：Luna 最终 candidate verify PASS，交 Sol → Nova/部署流程；未修改应用、Git 或外部系统。

### XYY-20260927-03 — staging 部署后线上只读验收

Task ID：`XYY-20260927-03`

Result：**PASS**。目标 `https://wz.tomatopia.top` Release `20260927T004516Z-4a5bb2a`，`/version` SHA `4a5bb2a3b8aff7bde49a9b6024222ebba0584502` 且 environment=`staging`；`/healthz` HTTP 200，CMS/contact 双依赖均 `ok`。`/news` HTTP 200，title 为“行业动态 | 新亦源供应链”、H1 为“鞋服物流知识库”。首页保留“获取仓配方案”、FAQ 8 项，Product 8 视频/9 slides/保障区与 `01 / 09 → 02 / 09` 切换，运到与鞋服页均 HTTP 200。

广州 canonical 旧 URL 为 404 无 Location，尾斜杠 301 到 canonical 后 404；sitemap/llms 均无旧页；已跟踪广州 JPG/MP4 HEAD 均 200。Playwright 线上只读检查 1440×900、390×844 均 PASS，无横向溢出、console/pageerror 为 0，截图覆盖首页/News/Product 两视口。完整报告见 [luna-post-report.md](../output/release/xyy-20260927-03/luna-post-report.md)，结构化结果见 [luna-post-result.json](../output/release/xyy-20260927-03/luna-post-result.json)，HTTP 原始结果见 [luna-post-http.json](../output/release/xyy-20260927-03/luna-post-http.json)。

Remaining risks：仅覆盖 staging 线上只读 HTTP/HEAD 与 headless Chromium 模拟视口，未提交表单、写 CMS/数据库，未覆盖真实设备或其他浏览器。验收 harness 的两个初始化问题已在成功运行前修正，未影响应用。

Handoff：Luna 线上独立 QA PASS，交 Sol 继续 GitHub 同 SHA CI 与最终验收；未修改应用、Git 或外部系统。

### XYY-20260927-04 — 冻结候选独立验证

Task ID：`XYY-20260927-04`

Result：**FAIL（完整 verify 被实现/配套英文测试的 claims literal 治理失败阻塞）**。测试前核对冻结应用哈希 163/163 匹配；`4321`、`4322` 保持监听，隔离端口 `4517` 空闲。

Tests performed：在显式 loopback/offline Directus、fake Xiansuo URL/token、`PUBLIC_SITE_URL=http://127.0.0.1:4517` 环境运行完整 `npm run verify`，真实退出码为 `1`。typecheck：510 files、0 errors/0 warnings/0 hints；lint PASS；maintainability 677 files PASS；assets 68 referenced + 103 deployment assets across 467 source files PASS；Vitest 为 80 passed files、1 failed file，529/530 tests passed。失败为 `tests/unit/claims.test.ts` 的 approved operational literals 扫描，发现 `src/i18n/about-ui-captions.ts => 24小时`、`tests/unit/english-claims.test.ts => 100%`、`tests/unit/english-footwear-ui.test.ts => 100%`、`tests/unit/english-footwear-ui.test.ts => 150+`。

Evidence：[verification-result.md](../output/english/xyy-20260927-04/luna/verification-result.md)、[verify.log](../output/english/xyy-20260927-04/luna/verify.log)、[frozen-hash-check.log](../output/english/xyy-20260927-04/luna/frozen-hash-check.log)。失败断言位于 `tests/unit/claims.test.ts:87`；疑似实现/配套英文测试范围，Luna 未修改应用、claim registry、既有测试或配置。

独立 acceptance 自检：三份自有 acceptance 测试 Prettier PASS、ESLint PASS；`tests/unit/english-acceptance-cms.test.ts` 独立运行 1 file/6 tests PASS，结果见 [acceptance-self-check.log](../output/english/xyy-20260927-04/luna/acceptance-self-check.log)。因完整 verify 已确认阻塞，依合同停止依赖该候选的 fresh build、4517 预览、focused E2E、视觉/交互及截图矩阵；没有留下新本地预览进程，也未触碰 4321/4322。

Likely affected area：English claim localization and newly added English About/Footwear literals/fixtures need Sol/Terra review against `src/lib/claims/` and the approved literal allowlist。Severity：MEDIUM，阻塞本任务 acceptance PASS。未执行真实 CMS、数据库、lead 写入、部署、commit 或 push。

Handoff：交 Sol → Terra 修复后沿同一 Task ID 重新运行完整 verify，再由 Luna 继续独立运行 focused E2E 与浏览器验收。

### XYY-20260927-04 — Round 2 独立验收（当前）

Task ID：`XYY-20260927-04`

Result：**FAIL（中文 mobile navigation 无障碍契约回归，且收尾发现候选漂移）**。测试前冻结哈希 163/163 匹配；`4321`、`4322` 未触碰，`4517` 已留置本地预览（managed session `74894`，监听 `0.0.0.0:4517`）。

Tests performed：显式 `DIRECTUS_URL/PUBLIC_DIRECTUS_URL=http://127.0.0.1:1`、fake Xiansuo `http://127.0.0.1:1`、fake token、`PUBLIC_SITE_URL=http://127.0.0.1:4517` 环境下，`npm run verify` 退出码 0：typecheck 510 files/0 diagnostics，lint、maintainability、assets、Astro build PASS，Vitest 81 files/530 tests PASS。focused unit 为 18 files/77 tests PASS。English acceptance fresh 联合 E2E 为 12 passed、2 个按测试设计跳过、退出码 0；接触表单单独复测 Chromium 1/1 PASS。路由机器结果显示 10 个 EN 路径 HTTP 200/lang=en/每页 1 个 H1，unknown EN 为真实 404，尾斜杠为 301，sitemap/llms 均包含 10 个 EN 路径。

Regression coverage：原有受影响 E2E fresh build 在 Chromium/mobile 共 48 passed、3 skipped、3 failed、退出码 1。失败为 `tests/e2e/service-pages.spec.ts:132/:151`（Chromium 与 mobile）和 `tests/e2e/product-video-sequence.spec.ts:198`（mobile）：页面实际可见 7 个中文 mobile 链接，但 `src/components/navigation/MobileNavigation.astro` 通过 `shellCopy('zh-CN').nav` 暴露 `aria-label="主导航"`，既有 contract 查找 `aria-label="移动端导航"` 得到 0 个 landmark。截图/ARIA 快照证实这是实现对既有中文无障碍语义的回归，不能修改原测试或放宽断言。

Evidence：[verification-result.md](../output/english/xyy-20260927-04/luna/verification-result.md)、[verify.log](../output/english/xyy-20260927-04/luna/verify.log)、[focused-unit.log](../output/english/xyy-20260927-04/luna/focused-unit.log)、[e2e-english-acceptance-retest.log](../output/english/xyy-20260927-04/luna/e2e-english-acceptance-retest.log)、[e2e-affected-regression.log](../output/english/xyy-20260927-04/luna/e2e-affected-regression.log)、[route-browser-results.json](../output/english/xyy-20260927-04/luna/route-browser-results.json)、[preview-4517-launch.txt](../output/english/xyy-20260927-04/luna/preview-4517-launch.txt)。

Acceptance harness：Luna 仅修正三处自有 acceptance 选择器缺陷（busy 状态稳定 submit selector、404 正文链接范围、mobile nav 内 button 范围），三份文件 Prettier/ESLint/diff check PASS，94/106/79 行；未修改应用、原有测试、配置或预算。修正后的 route/contact acceptance fresh serial 与并行复测均 PASS。收尾 hash 复核为 154/163，除两份上述自有 acceptance 测试外，另有 7 个 untracked English source/test 文件在验收期间发生漂移；Luna 未编辑这些文件，见 [post-owned-test-hash-check.log](../output/english/xyy-20260927-04/luna/post-owned-test-hash-check.log)。因此候选完整性也未满足，不能把本轮结果视作单一冻结候选 PASS。

Remaining risks：按确认的 MEDIUM 实现回归停止后续 1440/768/390/360 全量视觉截图、九个 Product sections/八视频、About gallery/warehouse、Home modal、FAQ、reduced-motion/no-JS 与 console/media 矩阵；这些不是 PASS 或未发现问题。未写 CMS/数据库、未提交 lead、未部署、未 commit/push；`4517` 仅本地预览供 Sol 检查。

Handoff：交 Sol；需先确认并修复中文 mobile navigation `aria-label` 兼容契约及候选漂移，再沿同一 Task ID 重新冻结、完整 verify、原有回归和浏览器 QA。

### XYY-20260927-04 — Round 3 final retest

Task ID：`XYY-20260927-04`

Result：**FAIL（英文首页中文内容与 About 移动端溢出）**。按 Round 2 归因要求先核对新冻结候选；起点与收尾均为 163/163 hash 匹配，0 missing/0 mismatch。未复用旧 PASS，未触碰 4321/4322；最终 4518 预览保留在 managed exec session `95642`。

Tests performed：loopback/offline Directus、fake Xiansuo 与 `PUBLIC_SITE_URL=http://127.0.0.1:4518` 下完整 `npm run verify` 退出 0（typecheck 510/0 diagnostics、81 files/534 Vitest、lint/maintainability/assets/build PASS）；English acceptance fresh Chromium/mobile 为 12 passed、2 designed skips；原有 home/about/product/footwear/cases/navigation/contact 相关中文回归为 51 passed、3 existing skips；CMS acceptance unit 为 1 file/6 tests PASS。日志与退出码见 `output/english/xyy-20260927-04/luna/final/`。

Visual/interaction：完成 60 条浏览器记录与截图（10 EN 页面 × 1440/768/390/360，10 中文对应页 × 1440/390），0 console error、0 pageerror、0 bad response；完成 Home case modal Escape/overlay、About explorer/history/gallery/honors、Product 10 sections/8 videos、四服务 FAQ/鞋服 tab、mobile contact mock success、5 路由 no-JS 检查。截图和机器结果见 [verification-details.md](../output/english/xyy-20260927-04/luna/verification-details.md) 与 `output/english/xyy-20260927-04/luna/final/visual-matrix/`；已人工读取 EN home/About、returns 及中文 home 代表截图。

FAIL 1：`/en` 在四个验收宽度都渲染非许可中文业务文案，包含 `多渠道订单履约`、`鞋服库存管理`、`快速订单处理`、`运到智能寄件平台` 及其描述；不是语言切换或法律标签。证据：`visual-matrix/screenshots/en-{1440,768,390,360}.png`、`browser-results.json` 的 `/en` `cjkText`。Likely affected area：英文首页服务/解决方案文案绑定。Severity：HIGH，验收阻塞。

FAIL 2：`/en/about` 在 390×844 文档 `scrollWidth=403`（+13px），360×844 为 +30px；直接探针定位 `.about-gallery` 的 `scrollWidth=403`。证据：`visual-matrix/screenshots/en_about-390.png`、`en_about-360.png`、`browser-results.json`。Likely affected area：About gallery responsive layout。Severity：HIGH，验收阻塞。

Evidence：[verification-result.md](../output/english/xyy-20260927-04/luna/verification-result.md)、[verification-details.md](../output/english/xyy-20260927-04/luna/verification-details.md)、`final/frozen-hash-start.log`、`final/frozen-hash-end.log`、`final/verify.log`、`final/e2e-english-acceptance.log`、`final/e2e-affected-regression.log`、`final/visual-matrix/browser-results.json`。

Handoff：未修改应用、原有测试、配置、CMS、数据库或外部系统；已停止依赖实现修复的后续昂贵验收。需由 Sol 派发修复并生成新的 freeze 后，沿同一 Task ID 重新执行完整 verify、中文回归与视觉矩阵。

### XYY-20260927-04 — Round5 targeted final retest

Task ID：`XYY-20260927-04`

Result：**FAIL（About mobile overflow、Retail distribution initial H1 overlap、Contact mobile eyebrow overlap）**。Round5 起止冻结哈希均为 165/165 match，0 missing、0 mismatch；未修改应用、原有测试、配置、CMS、数据库或外部系统。

Tests performed：loopback/offline Directus、fake Xiansuo、`PUBLIC_SITE_URL=http://127.0.0.1:4520` 下完整 `npm run verify` exit 0：typecheck 510 files/0 diagnostics，lint、677-file maintainability、assets、81 files/535 unit tests、build PASS。English acceptance Chromium/mobile 为 12 passed、2 designed skips、exit 0；受影响原有 Home/About/cases、Repair/B2B、service motion/pages、ConversionCTA 回归为 34 passed、2 skips、exit 0。Round3 unchanged CMS evidence 6/6 PASS is reused by scope; current full unit run independently passed all 535 tests。

Browser/interaction：新鲜 4520 预览下完成 60 条页面记录和 60 张初始截图（10 EN × 4 宽度，10 中文 × 1440/390），所有 EN 记录 `scrollY=0`、lang/H1 正确、0 console/page/bad response；English CJK 仅 exact allowed switch/legal labels。独立交互 exit 0，26 states：Home modal Escape/overlay、mobile nav、About explorer/history/gallery/South-East warehouse section/article、9 services slides（8 videos+assurance）、FAQ、footwear/Repair keyboard tabs、mock contact success。人工读取了 EN About/Retail/Contact/Privacy 及中文 Home/About/三服务 CTA 对照图。

FAIL 1：`/en/about` 横向溢出，390 为 +9px、360 为 +24px；direct probe 定位 `.about-gallery__eyebrow` / `.about-gallery__statements` 链。Severity：HIGH。

FAIL 2：`/en/retail-distribution` 初始 H1 在 390/360 被固定 header 覆盖；header `y=6..96`，H1 `y=71.1875..305.4531` / `71.1875..302.8906`。`scrollY=0` 且截图人工确认首行遮挡。Severity：HIGH。

FAIL 3：`/en/contact` 的 `Contact` eyebrow 在 390/360 被固定 header 覆盖；eyebrow `y=64..84`，header `y=6..96`；1440/768 无此覆盖。Privacy English eyebrow/H1 四宽度已通过。Severity：HIGH。

Evidence：`output/english/xyy-20260927-04/luna/round-5/verification-details.md`、`verification-result.md`、`round-5/verify.log`、`round-5/e2e-english-acceptance.log`、`round-5/e2e-affected-regression.log`、`round-5/visual-matrix/browser-results.json`、`round-5/direct-probe.log`、`round-5/hero-spacing-probe.log`。

Handoff：交 Sol；需返修上述三个实现缺陷、生成新 freeze，并沿同一 Task ID 重新执行独立 Round5 retest。4520 预览保持运行供 Sol 复核；真实 CMS/数据库/lead/deployment 均未触碰。

### XYY-20260927-04 — Round6 final independent QA

Task ID：`XYY-20260927-04`
Risk：`MEDIUM`
Result：**PASS**。

Candidate safety：Round6 implementation manifest 166/166 matched at start. At end, 165 matched, 0 missing and 1 mismatch; the only mismatch is Luna-owned `tests/e2e/english-acceptance-contact.spec.ts`, which now contains the required contact response matrix. Unexpected application drift is 0. Round5 artifacts remain archived and reused evidence is labelled as reused.

Tests performed：在正确继承的 Directus/Xiansuo loopback、fake token、`PUBLIC_SITE_URL=http://127.0.0.1:4524` 环境中，`npm run verify` exit 0：Astro check 510 files/0 diagnostics、lint PASS、maintainability 677 files、assets 68 referenced + 103 deployment assets、Vitest 81 files/535 tests、build PASS。English acceptance E2E 为 `13 passed / 1 existing design skip`、exit 0；contact matrix 在 Chromium 与 mobile 均执行。受影响中文 `about-cases`、contact contract、B2B、CTA 回归为 `17 passed / 5 existing skips`、exit 0。CMS acceptance focused unit 为 `1 file / 6 tests`、exit 0。日志集中在 [round-6 evidence](../output/english/xyy-20260927-04/luna/round-6/)。

Behavioral coverage：新增/更新的 owned English contact acceptance 覆盖 busy/network/success、400 validation、503 storage、429 rate limit、unknown/toString/constructor/__proto__、HTTP200 `{}`/`null`/`{success:false}`/invalid JSON；失败态保留输入与 consent、恢复 submit、禁止 Thank you，成功态 reset。均为 mock route，无真实 lead。

Browser coverage：fresh 4524 harness exit 0，22 页面记录、28 张稳定截图、0 console/page/bad-response，覆盖 English About/Contact/Retail/Privacy 四视口、Chinese 三路由对照、B2B CTA mobile、About controls/gallery normal first-middle-end、独立 reduced-motion/no-JS，以及 mobile Product 9/9（8 videos + assurance）。English H1/eyebrow/controls 使用真实 2D overlap 检查；document/internal overflow 均为 0。sitemap/llms 各包含 10 个 English 路由，unknown English 为 404。人工读取关键截图通过。

Remaining risks：仅 local offline Chromium/mock contact 覆盖；未执行 live CMS、真实 lead、数据库、部署、`verify:release`、commit 或 push。B2B CTA 的 `scrollIntoViewIfNeeded` 截图中 eyebrow 位于 fixed header 边界，但本合同要求的 CTA heading/action 完整性与宽度均通过；这不是本轮阻塞项。Round5 未改变的 desktop Product9 与既有 Home/modal/explorer/FAQ/tab 等证据为 reused，不冒充 Round6 新执行。

Handoff：Luna 独立 QA PASS，交 Sol → Nova Review → Sol 最终验收；4524 已停止，4321/4322 未触碰。

### XYY-20260927-04 — returns title targeted retest

Task ID：`XYY-20260927-04`
Result：**PASS**。

Tests performed：仅在自有 `tests/e2e/english-acceptance-routes.spec.ts` 增加真实浏览器 H1 Range 几何回归。测试递归收集 H1 非空文本节点的 `Range.getClientRects()`，逐行检查视口与所有 `overflow-x/y: hidden|clip|scroll|auto` 祖先边界；字体等待上限 2 秒，不以 `document.scrollWidth` 或容器高度代替文字判定。按 Playwright 项目分工完成 10 条英文路由 × 1440/768/390/360 共 40 组合，全部通过。fresh offline `npm run verify` 退出码 `0`：Astro check 510 files/0 diagnostics、lint PASS、maintainability 677 files（owned acceptance test 219 行）、assets PASS、Vitest 81 files/535 tests PASS、Astro build PASS。自有测试格式、ESLint、diff check 通过。实际日志：[verify.log](../output/english/xyy-20260927-04/luna/returns-title-retest/verify.log)、[e2e-routes-returns.log](../output/english/xyy-20260927-04/luna/returns-title-retest/e2e-routes-returns.log)。

Regression coverage：英文 acceptance 与原有 returns service E2E 在 fresh 4524 预览退出码 `0`，共 `17 passed / 1 existing design skip`；其中 route contract/语言切换/404/trailing slash/mobile shell 通过，原 returns redesign 的 Chromium/mobile 正常与 no-JS 共 4 项通过。返回页四宽度英文截图共 4 张、中文 `/tuihuo-zhijian` 对照截图 2 张，实际逐张读取；英文完整 H1、导航、媒体、CTA/FAQ 可用，中文标题 `white-space: nowrap` 在 1440/390 保留。独立 probe 为 6/6 cases、0 failures：H1 Range、header-H1 不相交、nav/media/CTA/FAQ、中文 nowrap、overflow、console/pageerror/bad response 均通过。证据：[returns-preview-probe.json](../output/english/xyy-20260927-04/luna/returns-title-retest/returns-preview-probe.json)、[screenshots](../output/english/xyy-20260927-04/luna/returns-title-retest/screenshots/)。两个 frozen hash 日志均为测试完成后的收尾一致性核验，不能作为测试前/后起止证据；两次均为 167 entries、166 matched、0 missing、1 mismatch，唯一 mismatch 是 Sol 已接受的 Luna 所有 `tests/e2e/english-acceptance-routes.spec.ts`，原始日志保留于 [frozen-hash-start.log](../output/english/xyy-20260927-04/luna/returns-title-retest/frozen-hash-start.log) 与 [frozen-hash-end.log](../output/english/xyy-20260927-04/luna/returns-title-retest/frozen-hash-end.log)。Sol 在测试前已核对最新两应用 delta 与 167-path freeze；本轮未观察到应用漂移。完整汇总见 [verification-result.md](../output/english/xyy-20260927-04/luna/returns-title-retest/verification-result.md)。

Remaining risks：验证限本地离线 Chromium/mock fallback 与模拟视口；未访问 live CMS、未提交真实 lead、未操作数据库、未部署、未 commit/push、未运行 `verify:release`。未覆盖真实设备及 Firefox/Safari。

Handoff：Luna 独立 QA PASS，交 Sol → Nova 增量 Review → Sol 最终验收。4524 已停止，4321/4322 保持原监听；未修改应用、配置、原有中文测试或其他角色日志。

### XYY-20260927-05 — language suggestion independent QA

Task ID：`XYY-20260927-05`
Result：**PASS**。

Tests performed：Luna 仅新增并验证 `tests/e2e/language-suggestion-behavior.spec.ts`（213 行）与 `tests/e2e/language-suggestion-layout.spec.ts`（202 行），均在 220 行预算内；Prettier、ESLint、diff check 通过。显式离线 Directus/Xiansuo 环境下 fresh `npm run verify` exit 0：Astro check 516 files/0 diagnostics、lint/maintainability/assets/build PASS、Vitest 82 files/537 tests PASS。4526 fresh browser 联合 E2E 为 31 passed、1 existing design skip、exit 0，覆盖新 behavior/layout、English acceptance routes 与原有 returns `service-redesign.spec.ts`，Chromium/mobile 两项目均执行。附加 accept persistence probe 为 2 cases/0 failures，验证接受 English 后返回中文及 reload 均不再提示。完整汇总见 [verification-result.md](../output/language-suggestion/xyy-20260927-05/luna/verification-result.md)。

Regression coverage：覆盖首个 supported language、fallback、无自动跳转、paired/unpaired English 目标、accept/keep/close/Escape/manual switch 双向持久化、有效/非法/拒绝 storage、focus/no-JS、scroll/resize/ResizeObserver header offset、dismiss reset、真实 H1/导航/strip 几何与产品内部滚动。7 张代表截图已实际读取：稳定中文 home 1440/390、English About 390，以及中文 product/about/returns/contact 390；两张早期 home 截图保留为动画诊断，不计入代表 PASS 数。截图、hash、命令和退出码均在上述报告及同目录日志中；冻结 7/7 start 与 end 均为 matched，0 missing/0 mismatch。

Remaining risks：验证限本地 offline fallback、Chromium 与模拟 mobile；未覆盖 live CMS、真实设备、Firefox/Safari、真实 lead、部署、`verify:release`、commit 或 push。未重复无关完整媒体互动矩阵；4526 已停止，4321/4322/4524 未触碰。初始两次 verify 失败仅为新增测试自身类型/残留引用问题，已修正并由最终 fresh verify 通过，详见 `verify-test-type-failures.log`。

### XYY-20260927-06 — English stats layout Round2 independent QA

Task ID：`XYY-20260927-06`
Result：**PASS**。

Tests performed：Round2 新冻结测试前后均为 `2/2 matched、0 missing、0 mismatch、exit 0`。显式离线环境下 fresh `npm run build` exit 0。修正后的真实浏览器 probe 覆盖 16 个 EN 宽度（1649、1440、1351、1350、1280、1101、1100、1024、801、800、768、701、700、430、390、360），桌面与真实 mobile context 均执行；所有 `data-raw` 前后均等于实际文字并稳定，EN 16/16 无 Range 文字重叠、clip ancestor 越界或 viewport 横向越界。360px 实际点击展开 Data notes，正文 7 个 Range 完整可见。新 `stat-num` 计算 line-height 1.1 已由浏览器记录确认。完整报告：[verification-result.md](../output/playwright/xyy-20260927-06/luna/round2/correction/verification-result.md)。

Regression coverage：实际读取 13 张代表卡片截图（EN 1649/768/390、ZH 1440/390），30 张正常模式卡片截图均保留；数字、单位、经营能力、tenure 与 lifecycle 标签/说明完整。Luna 使用 bundled HeadlessChrome 149；旧中文 baseline 来自 Chrome 152，文字宽度差异作为跨引擎不可比项保留，不冒充应用回归。Sol 独立使用同引擎 Chrome 152 对中文 1440/390 各 58 元素做 before/after，对比结果为 `0` geometry/style diff；结合 Luna 中文卡片截图确认本次英文 CSS 未改变中文布局。Round2 初始探针的 details/跨引擎误报已归档在 `luna/round2/initial/`，未覆盖。

Remaining risks：验证限本地 offline fallback 与 Chromium/模拟 mobile；未覆盖 live CMS、真实设备、Firefox/Safari、真实线索、部署或 `verify:release`。Sol 的 4531 fresh preview 保持运行供最终验收；Luna 未启停 4531，未触碰 4530 或其他旧端口，未修改应用、配置或已有测试。

### XYY-20260927-07 — navigation language spacing independent QA

Task ID：`XYY-20260927-07`
Result：**PASS**。

Tests performed：Luna 使用 Sol 管理的离线 4532 预览和真实 Chromium（version `149.0.7827.55`）运行独立导航探针；显式假 Directus/Xiansuo 环境，最终命令 exit 0。中文与英文首页在 1440、838、768、640、639、600、560、559、390、360px 共 20/20 组合通过：实际文字 Range 均在 header/viewport 内，点击盒无重叠，导航文字与 href 无基线漂移；桌面语言间距 16px 或以上，窄屏为 8px，桌面一行、窄屏两行且链接全部可见。639/600px 的首页、About、Contact 中英文共 12 个标题边界检查通过。提示条显示时 header 位于条下方，关闭后 offset 从 `76.578125px` 恢复 `0px`；键盘焦点保持在 `site-language-switch`，Enter 双向 `/` ↔ `/en` 通过。完整报告：[verification-result.md](../output/playwright/xyy-20260927-07/luna/correction/verification-result.md)。

Regression coverage：实际读取 8 张截图（中英文 838、390、640、639），确认桌面单行、窄屏双行、语言入口留白及无可见裁切/重叠。冻结 CSS 测试前后均为 1/1 matched、0 missing、0 mismatches、exit 0，详见任务目录 `luna/frozen-hash-start.log` 与 `luna/frozen-hash-end.log`。初次 networkidle 超时和隐藏导航选择器误报保留在 `luna/correction/initial/`，修正后的 domcontentloaded 探针为最终证据。

Remaining risks：验证限本地离线 fallback、模拟视口与 bundled Chromium；未覆盖 live CMS、真实设备、Firefox/Safari、`verify:release`、真实线索、数据库、部署、commit 或 push。Luna 未启动或停止 4532，未修改应用、配置、持久测试或其他角色文件。

### XYY-20260927-08 — English digital details independent QA

Task ID：`XYY-20260927-08`；Risk：`MEDIUM`；Result：**PASS**。本轮由当前继承模型承担 Luna 独立验证职责，未宣称切换至固定 `gpt-5.6-luna`。

Tests performed：接手后独立确认初始应用 freeze 22/22；发现空/变更英文 classic 服务隐藏正文却仍生成 5 条 FAQ JSON-LD，报 Sol 后由 Terra 修复。应用 freeze 开始与收尾均 22/22 matched，0 drift；Sol 收入已冻结的两份 Luna E2E 后，最终再核对 24/24 matched。Luna 只写两份自有 E2E（133/190 行）、本任务证据与本日志。scoped Prettier/ESLint、693-file maintainability、typecheck 524 files/0 diagnostics 通过；限定 8 files/40 单测通过，FAQ guard 增量另以实际源码表达式和真实 helper 验证 7/7 组合通过。详见 [verification-result.md](../output/english/xyy-20260927-08/implementation/luna/independent/verification-result.md)。

Browser/visual：复用 Sol 最终离线 4533 fresh 预览，按分段完成证据计 11 个独立 E2E PASS、1 shared-SSR design skip。首轮 9 PASS/1 skip 后两项 harness 滚动顺序失败已修；Smart desktop reporter 明确 PASS 后父进程 exit143，未将整命令说成通过；mobile 单独补测明确 1 PASS/exit0。两新页×1440/768/390/360 共 8 组合/56 次 Range、真实裁切祖先、邻居、导航及横向溢出采样零失败；console/page/http 错误 0。两中文+四既有英文页正文/媒体/链接基线 6/6 精确相同；4 组末尾 CTA 实际点击到英文联系页，完整滚动后 Smart 19 个 reveal 块均可见。32 张截图保留，实际读取 16 张代表截图。中文 116 元素几何零差异为独立核对并明确复用的 Sol 同 Chrome152 证据，未做跨引擎混比。

Remaining risks：范围限本地离线 Chrome152/模拟视口；CMS 边界为真实 helper/源码表达式组合与既有mock单测，不冒充 live CMS 或空内容 SSR 整栈测试。未访问真实 CMS、提交 lead、操作数据库、启停预览、提交/推送/部署；未重复无关全量 verify/release。前任测试、harness/类型/媒体口径误报及143进程退出日志均保留，详见最终报告；当前 QA 无剩余阻塞。交 Sol → Nova Review，4533 继续由 Sol 管理。


### XYY-20260928-02 — Independent release preflight

Task ID：`XYY-20260928-02`；Risk：`HIGH`；Result：**PASS（仅发布前独立 QA）**。本轮由继承主会话模型承担 Luna 职责，未宣称固定 `gpt-5.6-luna`。前任同任务报告缺少支持其 PASS 的实际执行日志，原件保存在 `output/release/xyy-20260928-02/luna/interrupted-predecessor/`，不纳入门禁；本条结果来自替代会话实际执行。

Tests performed：在候选副本与净化环境中，使用明确的离线 Directus、假 Xiansuo token 和验收站 PUBLIC_SITE_URL，完整 `npm run verify` exit 0：Astro check 524 files、0 errors/warnings/hints；lint PASS；693-file maintainability、68 referenced/103 deployment assets across 477 source files PASS；Vitest 83 files/541 tests PASS；Astro server build PASS。`npm run format:check` exit 0；`npm audit --omit=dev` exit 0、found 0 vulnerabilities。三个完整命令、时间、退出码及原始日志均在 [independent/preflight.md](../output/release/xyy-20260928-02/luna/independent/preflight.md) 和同目录 JSON 中。

Integrity：测试前后 frozen/candidate/workspace 均 194/194 matched、0 缺失/差异；候选 HEAD 为 `4a5bb2a3b8aff7bde49a9b6024222ebba0584502`，实际 Git 变更集合与194条清单精确相等，0额外路径，diff check 通过。候选仅 `.env.example`，未加载真实环境文件；node_modules/.astro/dist 均为忽略项。历史04–08验收合成仅作来源相关性，不冒充本轮浏览器执行。

Remaining scope：本轮未执行 E2E/verify:release 或线上浏览器验收；原部署脚本的完整 verify:release 仍须在远端动作前通过，部署后只读 QA 待 Sol 派发。未修改应用/测试/配置、未真实 CMS/数据库/线索写入、未 commit/push/deploy、未触碰旧服务。交 Sol → Nova 发布前 Review；本次门禁无剩余阻塞。


### XYY-20260928-02 — Initial staging online QA

Result：**FAIL**。目标 wz.tomatopia.top，实际 ce682aba1b4322cea2f6d40a6470efcae357d0d3 / 20260928T002840Z-ce682ab；继承模型独立承担 Luna 职责。Chrome 154.0.8037.57、1440×900 与 390×844，完成 30 首屏与 6 重点样本。12 EN HTTP200/真实404、语言/SEO、语言提示接受/关闭/持久化、两详情中英配对、标题/导航布局通过；最大横向溢出0px，console/pageerror/资源HTTP错误0。

首页 CMS 三服务全部缺失，03 的 digital 入口不存在，固定 Smart shipping 被编号01，真实业务 AC 未满足，已返回 Sol 返工。保留同 heading Range 字体行盒的17条原始误报与视觉/ink 复核；原手机 stats 长图为计数动画/自动滚动采集无效，已用6张终值 viewport 截图替代并逐图读取。媒体取消另经 GET206 核实存在；初始 EROFS 和 guard 超时均保留，不冒充PASS。详见 [post-report.md](../output/release/xyy-20260928-02/luna/online/post-report.md)、同目录 post-result.json 和原始命令/截图。未修改应用或持久测试，未真实写入；所有自有浏览器已关闭。新候选结果另记，不覆盖初版FAIL。


### XYY-20260928-02 — Rework candidate Round1

Result：**FAIL**。完整 npm run verify exit 1；543 单测 PASS、1 FAIL（claims.test.ts:87），新增来源指纹、fixture 与测试触发16条数字字面量守卫，构建未到达，未执行SSR。已返回 Sol → Terra，未修改守卫/白名单/实现。npm run format:check exit 0；196 路径候选/工作区匹配，候选仅4个指定文件变化，原始fixture与本次公开CMS捕获3条完全相同。源文件、冻结清单及失败原始日志均保留，见 [round1-report.md](../output/release/xyy-20260928-02/rework/luna/round1-report.md)。后续新冻结使用独立round2证据；依赖未变，不重复audit。


### XYY-20260928-02 — Rework candidate Round2

Result：**总体FAIL，功能门禁PASS**。独立完整verify exit0（525类型文件零诊断、694文件预算、83文件/544单测、build PASS），format exit0；196冻结路径前后无漂移。真实interpolateClaims展开模板fixture与原始公开3条精确相同，7类空/未知/改写拒绝通过。只读raw-CMS mock→候选SSR，Chrome154、1440/390，01–04 DOM恢复，03/04四次真实点击正确，43请求全部GET、浏览器错误0。

实际逐图读取9张后发现390首页03编号被dashboard覆盖；2/5/8秒稳定几何与数字中心hit-test确认是真实遮挡（badge z=auto/frame z=1），已返回Sol→Terra定向CSS修复。见 [Round2 report.md](../output/release/xyy-20260928-02/rework/luna/round2/report.md) 与原始截图/JSON。未修改实现/持久测试，未写真实CMS/数据库/表单；自有4512/4513与浏览器全部关闭。原线上与Round1FAIL证据保留，后续Round3另记。


### XYY-20260928-02 — Rework candidate Round3

Result：**PASS，仅本地冻结候选**。完整verify与format均exit0：525类型文件零诊断、694文件预算、83文件/544单测、claims守卫/build通过；197路径前后0漂移，原4来源/fixture/test路径相对Round2未变，新增英文03 CSS为第5路径。Round2真实插值/原始snapshot精确相等与7类严格拒绝明确复用，本轮完整单测重新执行。

Chrome154.0.8037.57，原始公开3条→只读mock→候选SSR，1440/390的01–04及03/04四次实点通过；360/768仅03补测。四宽度badge/frame/caption与文字hit-test零问题，独立读取6张最终代表图确认无遮挡；中文新增英文选择器0匹配，标题导航正常。63次mock请求全GET、浏览器异常0，12条CLI命令exit0。详见 [Round3 report.md](../output/release/xyy-20260928-02/rework/luna/round3/report.md)、result.json与原始截图/命令。

保留中文lang探针预期错误与自有端口TIME-WAIT记录，修采集器后重采，未改应用或布局/链接断言、未重跑已过verify。自有4512/4513及浏览器已关闭；未改持久测试、写真实CMS/数据库/表单、提交/部署。限制为本地raw snapshot与Chrome模拟视口；原上线FAIL/Round1/Round2FAIL保留，交Sol→Nova→Sol后续阶段。


### XYY-20260928-02 — Final deployed targeted QA

Result：**PASS**。独立Luna设计探针，Sol协调执行，Luna独立验收；实际使用继承模型，不宣称专用5.6 Luna。Sol运行冻结collector（session45280、exit0），本人独立核对6条CLI原始日志/退出码、生成探针及collector hash、19项记录一致性并实际读取桌面/手机两图。唯一完整run为20260928T033101Z，实际staging SHA5a1227443a722891c41c8006fd738a09063b0510、release20260928T023618Z-5a12274。

/version、health200且依赖ok，12EN200/未知路径真404。Chrome154.0.8037.57，1440×900与390×844，首页01–04正确、03/04四次实点详情及一次中英对应入口/偏好正确；导航间距17.67px/8px，overflow0、browser errors0。手机03badge/frame/caption完整可读，文字hit-test均true；桌面caption在截图屏下，仅计盒/Range分离与包含，不冒称屏内hit-test。自有浏览器全部关闭。见 [最终报告](../output/release/xyy-20260928-02/rework/luna/online-final/post-report.md)、post-result.json及原始证据。

两次权限等待中断均未执行，默认沙箱EROFS仅HTTP通过；全部保留且不算页面PASS/FAIL。原36样本/完整语言交互/stats终值图明确复用为未改代码的既有线上证据，不称最终SHA重跑；初版、Round1、Round2失败记录不覆盖。未重跑collector/全verify/全矩阵、未修改业务或写真实CMS/数据库/表单。范围限Chrome模拟视口、指定staging定向QA，交Sol→Nova最终Review。


### XYY-20260928-03 — Published English cases independent QA

Task ID：`XYY-20260928-03`；Risk：`HIGH`；Result：**PASS，仅冻结本地候选**。继承模型承担独立 Luna 职责，不宣称专用模型。Luna 实际发起完整 verify、来源探针及浏览器执行，独立判读结果；未用实施者自测替代门禁。六个冻结文件前后与 root/candidate 精确匹配，候选 HEAD5a1227443a722891c41c8006fd738a09063b0510、零漂移、仅六路径差异。

Fresh `npm run verify` exit0：527 类型文件零诊断、lint、696 文件预算、资产检查、84 文件/547 单测、claims 守卫和 build 通过；format exit0。实际 getCases 归一化后，公开 raw fixture 六条顺序及 TOYOUTH 正确，未注入 INMAN；独立 probe 验证 img/image_file/accent 三类更新接受保留，正文/名称/分类等七类变更拒绝且有诊断，成功 empty 保持空。fixture 与公开 snapshot 完整 JSON 精确相等。

Chrome154.0.8037.57，1440×900/390×844，raw published 与 successful-empty 共四组：两英文页面各六条且所有实际图片加载；桌面六弹窗、手机 UR/TOYOUTH 共八次实点并关闭，内容/语义为英文。中文 home/cases 两视口各六；空首页无 gallery/案例CTA/modal，案例页明确空态，无回填。横溢0px，page/console/http/requestfailed/blocked均0；53次mock请求全GET，12条CLI命令exit0。实际读取12张代表截图，确认弹窗完整可读、手机关闭按钮可达及两视口空态。

默认 sandbox 首次因 npm cache EROFS 浏览器未启动，保留为环境阻塞；必要权限获批后由 Luna 执行同一collector（session71058 exit0），未通过换缓存规避权限。自有4512/4513及浏览器全部清理，旧4321/4322未操作。详见 [report.md](../output/english-cases/xyy-20260928-03/implementation/luna/report.md)、result.json、原始命令/日志及指定截图。限制为本地公开快照与Chrome模拟视口；未改应用/配置/持久测试，未真实CMS/DB/lead写入、提交/推送/部署，未重复audit或全站矩阵。交 Sol → Nova；verify:release和部署后只读验收仍属后续阶段。

### XYY-20260928-03 — Deployed staging online QA recovery

Task ID：`XYY-20260928-03`；Result：**PASS**。本轮准确身份为“独立Luna设计探针，Sol协调执行，恢复后的Luna独立验收”；Sol 协调未改变的冻结 online runner（session85997，exit0），Luna 独立审阅原始证据，不宣称本轮运行由 Luna 实际发起。首轮默认 sandbox 的 npm cache EROFS 失败保留在 `implementation/luna/online/run-20260928T064859Z/`，不计为页面结果。

线上 `/version` 200 精确匹配 `b90b7771bf58ed7f93ca08c58a2519d9dea52509`、staging、`20260928T054511Z-b90b777`；`/healthz` 200 且 CMS/contactStorage 均 ok。Chrome154.0.8037.57 在 1440×900、390×844 两视口的 `/en` 与 `/en/cases` 均为六项，顺序精确为 `ur`、`maxrieny`、`xingmian`、`meiyi`、`romi-studio`、`toyouth`，无 Inman。六张首页图片均 complete 且 naturalWidth>0；UR/TOYOUTH 弹窗均实际打开并关闭，内容、图片、英文 `Close case` 正常；中文 `/` 与 `/cases` 两视口均六项且 `zh-Hans`。横溢为0，page/console/HTTP/blocked/failed/unexpected request 错误均为0。6/6 原始命令 exit0，run-code JSON 与提取 `browser-results.json` 精确相等，cleanup remainingSessions 为空。

Luna 亲读三张线上代表截图：`online/run-20260928T072929Z/1440/home-gallery.png`、`390/modal-toyouth.png`、`390/cases-toyouth.png`；桌面六列、手机 TOYOUTH 弹窗与案例末卡均可读。成功 empty、CMS 错误边界及源变化拒绝引用同 Task ID 已完成本地独立证据，未通过线上 CMS 制造测试数据。证据与完整结果见 [online/post-report.md](../output/english-cases/xyy-20260928-03/implementation/luna/online/post-report.md) 和 [online/post-result.json](../output/english-cases/xyy-20260928-03/implementation/luna/online/post-result.json)。

Remaining risks：范围限指定 staging 两视口和 Chrome 模拟视口，未覆盖真实设备、Safari/Firefox 或全站矩阵；未运行新的 verify/verify:release，未提交表单、写 CMS/数据库或启停 4321/4322。采集器创建的浏览器已全部关闭。


### XYY-20260928-04 — Complete English cases independent QA

Result：**PASS，仅本地候选**。实际继承父会话模型承担 Luna 职责，未宣称专用5.6 Luna。独立Luna设计/判读，Sol协调完整verify与collector实际执行：verify原始日志541类型文件零诊断、86文件/553单测、lint/维护性/资产/build全通过；完整verify早于最终E2E收入，明确不冒称其覆盖最终spec。

最终r2四宽1440/768/390/360各六详情与32项stats精确通过（合计128项），Range/卡片/裁切祖先0问题，图片ready、溢出0、浏览器错误0。每宽UR/MEIYI真实卡→弹窗→详情→联系GET、关闭/后退，同案例语言按钮/建议条、无JS锚点、新标签均通过。两宽empty、正文变更/unknown/401/403真实SSR边界通过；698次mock请求全GET、18条CLI raw与提取JSON一致。持久spec默认fallback两项目8/8 PASS，无整组skip或ignored依赖。

亲读最终13张代表图，MEIYI手机范围在破折号处换行且端点完整；UR重复单位已修。保留390 UR首卡位于固定导航之后、empty首屏未包含空态正文的取景限制，不冒称截图覆盖。39路径运行前后无漂移，结束后仅等价类型排版修预算，转译JS逐字相同；最终spec hash b625c5c4，fixture fd266002，定向格式/lint/711文件预算/diff PASS。报告及原始证据见 `output/english-cases/xyy-20260928-04/implementation/luna/report.md`。

原采集器失败、EROFS及ROMI Rapid/Fast误报均保留；最终无本地产品阻塞。未修改实现、写真实CMS/DB/线索、提交/推送/部署；自有mock/SSR/浏览器清理完毕。交Sol→Nova，后续verify:release和部署后QA独立执行。

### XYY-20260928-04 — 发布后检查与空格定向复测

- e764 首次成功部署后，独立核对线上六案例32项、三宽96项检查、modal→详情新文档、语言/无JS、version/health及零浏览器错误；原 collector PASS，视觉发现TOYOUTH列表英文词组粘连，经Sol判定需修复，报告总体保留FAIL，不抹去通过的独立功能证据。
- 两行空格补修后本地定向独立PASS：1440/390/360每宽17项精确文本、TOYOUTH两完整短语、实际详情新文档、无溢出/裁切；中文与e764同浏览器SSR/DOM/几何完全相同。亲读7张截图，核对18条CLI/rawJSON、39项冻结和全GET/清理证据。Sol执行冻结collector和完整verify，Luna独立核对原始证据（553单测、541类型、711预算与build），未冒称自行重跑。详见 `implementation/luna/unit-spacing/report.md`；当前只本地通过，待新SHA线上定向补验。

### XYY-20260928-04 — Final deployed English unit-spacing QA

Result：**PASS**。本会话继承模型承担独立Luna职责，Sol实际执行冻结collector，Luna独立核对raw/版本健康并亲读6张最终线上截图；未宣称专用Luna模型或本人发起执行。指定staging SHA `54b41d2388d34de5a8f6ddad2c32b77b1f75dfd5`、release `20260928T110250Z-54b41d2`，/version前后同SHA同release，/healthz及CMS/contactStorage依赖ok。

Chrome154，1440/390/360每宽6卡17项精确通过；TOYOUTH `All-channel unified inventory pool` / `Online and offline integrated operations`空格、自然换行完整。横溢/指标Range裁切/浏览器错误0，6案例图ready；三宽实际TOYOUTH详情入口新文档200。9CLI退出和JSON成功，3raw记录与提取精确一致；冻结runner/模板未变，99浏览器请求全GET，自有会话清理完整。

独立读本次deploy-command/log：exit0，553单测、149E2E+9既有skip、4formal、finalbuild与发布后health/version通过。报告 `implementation/luna/unit-spacing/online-report.md`，机器结果 `online-result.json`，raw `online-run-2026-09-28T111857-973211+0000`。原六详情32项/语言/无JS/边界明确复用未改变功能证据；中文三宽相同使用本地e764对照，CMS空等仅本地mock，不称在线改变CMS。旧e764总体FAIL与早期资源失败记录保留。

未改应用/持久测试/runner，未重复全矩阵或真实外部写入。限制为Chrome模拟视口；全页图不作为整页媒体或所有小字视觉验收。当前窄范围无阻塞，交Sol/Nova最终增量审阅。

### XYY-20260929-01 — 中文仓配详情统一入场效果

Task ID：`XYY-20260929-01`；Result：**PASS**。Luna 独立 QA 仅修改任务证据目录与本日志，未修改应用或持久测试。

Tests performed：

- 复用前任 `output/service-motion/xyy-20260929-01/luna/matrix-1440-390.json` 首屏证据；本轮用 Playwright CLI 独立 session `xyy-motion-luna2` 对八个中文目标路由在 1440×900 逐个滚动 `main > article > section`，每 section 等待800ms，再快速滚底/返回首屏。`output/service-motion/xyy-20260929-01/luna-resume/desktop-sections.txt` 记录 8/8 路由、49 sections、marker 8/8、console/page/HTTP/requestfailed 全0、横溢0、底部及返回首屏 pending opacity 0。
- Sol 的 `sol-boundaries/mobile-sections.json` 覆盖 390×844 八页49 sections、滚底/返回首屏，overflow/errors均0；Luna 复核原始结果，不冒称本会话亲自运行 mobile 矩阵。
- `sol-boundaries/edge-native-recheck.json` 用原生 `IntersectionObserver` 复核桌面及手机边缘候选：桌面 root bottom 实测837、手机785，候选均未达到 `isIntersecting`/0.08 threshold；section 探针中的暂时 opacity=0 均属真实 IO 触发区外，不构成缺陷。此前按 viewport 宽度推算触发边界的旧探针结果保留但不纳入结论。
- `sol-boundaries/interactions.txt` 覆盖 reduced-motion 动态切换（1440/390 pending36→0、active0）、键盘焦点、FAQ、鞋服/直播/后整 tabs、锚点、返回、非法 hash；`summary.json` 中相关单测6 files/21 tests通过。`luna-resume/desktop-current.png` 与 `mobile-hero.png` 两张代表截图已亲读，标题/CTA/导航/媒体/手机换行完整。

Regression coverage：`sol-boundaries/browser.json` 的英文四页、中文 classic 两页、首页和 `/product` marker门控/no-JS可读性通过；八页共享入口、无JS fallback、视频可见播放、tabs/FAQ/链接/焦点/锚点/返回未见新增横溢或页面错误。Terra 已提供 scoped format/lint/typecheck/maintainability 结果；实现冻结由 `sol-verification-summary.json` 与 `implementation-freeze.json` 复核。

Remaining risks：验证限本地 headless Chromium 模拟视口与离线配置，未覆盖真实设备、Safari/Firefox、真实CMS或部署后环境；按合同未运行全量 `npm run verify` / `verify:release`。首次 headed CLI 无 X server、npx缓存曾因 EROFS 失败，均按工具规则重跑；一次临时 mobile 探针因裸 `scrollHeight` 报错，原始失败文件保留且未纳入 PASS。最终报告：[output/service-motion/xyy-20260929-01/luna-resume/report.md](../output/service-motion/xyy-20260929-01/luna-resume/report.md)。

#### 同 ID 用户节奏调整 — slower 定向复测

Task ID：`XYY-20260929-01`；Result：**PASS**。本轮只验证 Terra 的 `duration 460→800`、`stagger 80→150`，`maxStagger=320` 与其余逻辑未变；未修改应用或持久测试。

Tests performed：独立 Playwright CLI 在 `/xiefu-yuncang` 的 1440×900、390×844 记录真实 WAAPI duration=800、delay=`0/150/300/320` 及中间帧；首屏和下方 section 等1.3s后 pending/active均为0，横溢为0。reduced-motion 清理为0；英文 `/en/apparel-fulfillment` marker/pending均为0；console、pageerror、异常响应均为空。Sol 的 `slower/sol-browser.json` 补充核对 H1 与 `#footwear-fulfillment-heading` opacity=1/pending=false，我已复核原始结果。证据：[slower/luna/report.md](../output/service-motion/xyy-20260929-01/slower/luna/report.md)。

Regression coverage：本轮仅覆盖合同指定鞋服代表页和英文门控，初版八页全矩阵作为未变逻辑基线，不重复执行。

Remaining risks：验证限本地 headless Chromium 模拟视口，未覆盖真实设备、Safari/Firefox、build/full verify 或部署后环境。wrapper npx EROFS 与一次探针语法错误均已保留原始记录，不影响最终 PASS。

### XYY-20260929-02 — 英文仓配详情共享动效

Task ID：`XYY-20260929-02`；Result：**PASS**。Luna 独立执行英文四路由×1440/390定向 Playwright CLI（8组合），未修改应用或持久测试。

Tests performed：四页均观察到真实中间帧，WAAPI duration=800ms、delay=`0/150/300/320`，1.3s后首屏与指定下方标题清晰；横溢、console、pageerror、异常响应均为0。reduce 动态检查 targets/pending/active均为0；鞋服 tabs/FAQ、修复 tabs/FAQ结构通过。`retail-edge.txt` 唯一候选位于原生 IO rootBottom=785以下（top=813.05、ratio=0、isIntersecting=false），属未触发边缘，不判实现失败。两张代表图 `english-shoe-1440.png`、`english-repair-390.png` 已亲读。

Regression coverage：Terra scoped format/lint/Astro check（544文件零诊断）和单行 gate 证据通过；Sol 的 `sol-ssr-comparison.json` 覆盖17路无语义差异，`sol-protected-check.json` 覆盖878保护路径无意外变化。Sol 实际执行 `javaScriptEnabled:false` 的鞋服/修复390补测，`sol-nojs.txt` 记录 pending=0、H1 opacity=1、横溢=false，我已复核；原 Luna noJS 两次 `SyntaxError` 探针失败保留，不计入PASS。

Remaining risks：仅本地离线 headless Chromium与模拟视口，未覆盖真实设备、Safari/Firefox、live CMS、部署后环境或合同排除的全量 verify/release。证据：[luna report](../output/service-motion/xyy-20260929-02/luna/report.md)。

### XYY-20260929-03 — English news independent fixture QA

Task ID：`XYY-20260929-03`；Result：**PASS（Luna 独立测试设计与复核范围）**。Luna 未修改应用实现、CMS、数据库或部署；仅新增/更新 Luna 所有权测试与 fixture。最终浏览器/verify 由 Sol 按批准的内存 runner 协调执行，Luna 独立复核原始日志、结果 JSON 与截图。

Tests performed：新增可持续 `tests/helpers/english-news-fixture.ts`、`tests/fixtures/english-news-records.json`、`tests/e2e/english-news-fixture.spec.ts`、`tests/e2e/english-news-visibility.spec.ts`、`tests/e2e/english-news-layout.spec.ts` 与 `playwright.english-news.config.ts`。mock Directus 与独立 `server.mjs` 使用动态 localhost 端口，实际 SSR 读取 mock 状态。Sol 会话 77789 在 `/dev/shm`、1 worker 下执行最终 fixture，`output/english-news/xyy-20260929-03/sol/final-fixture.log` 记录 **9 passed、exit 0**：既有中文旧 schema、发布资格/消毒、draft/archived/missing/future/unknown 真 404、无 hreflang、related/language pair/sitemap、状态转换、CMS fallback/错误边界和 1440/390/360 几何，以及新增 Unicode 空内容边界。新增独立用例逐一覆盖仅 U+200B 标题、U+200D 摘要、`&ZeroWidthSpace;`、`&#8203;`、`&shy;` 正文：均不进入列表、英文详情真 404/no hreflang、中文无英文配对、sitemap 排除；正常重音 Unicode 与含 ZWJ 的 emoji 保持原文并可公开。4439 专属端口仅用于后续旧回归服务器。早期 selector 失败和维护预算失败分别保留在 `luna/attempt-*`、`sol/verify-unicode-attempt-1.*`，均未计产品失败。

Unit/静态验证：最终 Sol `npm run verify` 会话 49706，`verify-final-result.json` 记录 **exit 0**、562 类型文件零诊断、lint、732 文件维护预算、89 文件/574 单测、资产检查与 build 通过。相关 Unicode unit 与边界测试包含在最终单测结果中；测试文件 Prettier、ESLint、`git diff --check` 均 exit 0。先前 95405 维护预算失败（287 行测试文件）保留为测试组织问题，拆分后已清除，未放宽预算。旧 `english-acceptance-routes` 已加入 `/news↔/en/news` 与六项移动导航；language suggestion 的 unpaired 样本改为 `/supply-chain-whitepapers/`。

Regression coverage：Sol 会话 77789 在专属 4439 SSR 服务器上以 1 worker 执行变更后的两个旧回归目标（mobile English navigation、paired/unpaired language suggestion），`output/english-news/xyy-20260929-03/sol/final-regression.log` 记录 **2 passed、exit 0**。完整旧 E2E 矩阵曾尝试但受环境/runner 问题未完成，不计 PASS；本次仅两个定向目标通过。Luna 已实际读取重新生成的四张代表截图：`luna/news-list-1440.png`、`news-list-390.png`、`news-detail-1440.png`、`news-detail-390.png`；桌面/手机列表与详情均显示英文主要 UI/正文、related、导航，未见明显遮挡或横溢。Sol 的最终范围检查 `final-scope-check.json` 显示 32/32 冻结文件匹配、1354 个保护路径无漂移、HEAD 未变。

Remaining risks：验证限本地 mock Directus、构建后的本地 SSR、Chromium 模拟视口；未覆盖 live CMS、真实设备、Safari/Firefox、真实数据、部署或 `verify:release`。32 文件范围与保护路径校验通过；未运行完整旧 E2E 矩阵，保留的早期 ENOSPC/page crash 日志不影响 9/9 fixture 与 2/2 定向回归结果。未写入真实 CMS/数据库，未部署。

### XYY-20260929-04 — English whitepaper QA test preparation

Task ID：`XYY-20260929-04`；Risk：`MEDIUM`；Result：**TEST PREPARED（等待 Sol 协调的 built SSR/浏览器执行）**。Luna 未修改应用、schema、CMS、数据库、部署或旧 server，仅新增本任务测试/fixture/config，并将语言建议未配对样例从 `/supply-chain-whitepapers/` 更新为真实中文报告详情 `/supply-chain-whitepapers/14/`，保留原断言。

Tests prepared：`tests/helpers/english-whitepapers-fixture.ts`（181 行）、`tests/fixtures/english-whitepaper-records.json`（14 期）、`tests/e2e/english-whitepapers-fixture.spec.ts`（200 行）与 `playwright.english-whitepapers.config.ts`。独立 localhost mock 按 `publications`、`faqs` 分开控制 `ok`、成功空、network、5xx、401、403、invalid；site_settings及其他依赖保持有效空响应。六个 E2E 用例覆盖英文标题/摘要/FAQ/CTA/空态、14期原中文 HTML/PDF 入口、第10期来源冲突、第12期目录 03–07 串、第14期 June 2026、根 `/`↔`/en` hreflang、中文白皮书尾斜杠配对、Insights active、sitemap/llms、动态 news/cases 配对、1440/390/360 几何与实际链接/FAQ交互。旧 `english-acceptance-routes` 已加入白皮书英文目录，旧 language-suggestion unpaired 用例保留并改指 `/14/`。

Static validation：`npx playwright test --config=playwright.english-whitepapers.config.ts --list` 列出 6 tests；新增测试与 fixture 均在 220 行预算内。任务文件 Prettier、ESLint、`git diff --check` 通过；`npm run check:maintainability` exit 0（739 files）。按交接要求本阶段未启动 build、完整 verify 或浏览器。

Handoff：交 Sol 使用批准的唯一内存临时目录执行白皮书 fixture 与旧定向回归；执行后 Luna 仅复核实际日志、JSON、必要截图和结果状态，再沿同一 Task ID 追加 PASS/FAIL。当前不宣称浏览器、SSR、build 或线上验证已通过。

#### XYY-20260929-04 — Test contract correction before coordinated run

按 Sol 复核修正白皮书 E2E：network 中断单独验证 200 + 14 期静态回退；401/403/invalid 分别在 `publications` 与 `faqs` 上验证 SSR 明确 500，未把 network 错误当作失败预期。布局用例在字体 ready 并短暂稳定后，将 1440 与 390 viewport 截图写入 `output/english-whitepapers/xyy-20260929-04/luna/whitepapers-{1440,390}.png`，不生成 fullPage 图。

本次仅压缩空行使 `tests/e2e/english-acceptance-routes.spec.ts` 维护性计数从 221 降至预算内 220；白皮书 E2E 219 行、fixture helper 181 行。Prettier、ESLint、`git diff --check` 与 `npm run check:maintainability`（739 files）均 exit 0。未运行 build、SSR 或浏览器，等待 Sol 单次协调执行后再复核真实截图和日志。

#### XYY-20260929-04 — Browser selector correction

首轮 Sol 协调浏览器执行因测试中未限定同名 `Contact us` 链接而 strict-mode 失败；应用未发现问题。两处断言现限定到 `section[aria-labelledby="english-whitepapers-conversion-cta-heading"]`，实际 CTA 语义保持不变。network fallback 断言已单独保留为 HTTP 200 + 14 期，401/403/invalid 仍为明确 SSR 500。

修正后白皮书 spec 为 219 行；Prettier、ESLint、`git diff --check` 与 `npm run check:maintainability`（739 files）均 exit 0。未重复 build、full verify 或浏览器，等待 Sol 重跑 browser 并提供截图/日志后再独立复核。

#### XYY-20260929-04 — Final independent visual QA

Task ID：`XYY-20260929-04`
Result: **FAIL**

Expected：390/360 移动端的 hero eyebrow `XINYIYUAN SUPPLY CHAIN · RESEARCH LIBRARY` 应完整显示在固定 Header 下方，不与导航重叠或被遮挡；1440 桌面端同样保持完整可读。

Actual：亲读 Sol 最终 `390×844` 截图发现固定 Header 覆盖 hero eyebrow 首行，截图只显示第二行 `RESEARCH LIBRARY`；主 H1、说明和 CTA 可见。1440 截图未观察到该遮挡。现有 E2E 的 viewport/overflow 检查通过，但没有检查 hero 文本 Range 与 fixed Header 的相交关系。

Reproduction：在 Sol 最终 built SSR/Chromium runner 中打开 `/en/supply-chain-whitepapers`，viewport `390×844`，等待字体与页面稳定后观察首屏；同一任务证据中的 `whitepapers-390.png` 可复现。该现象属于页面实现问题，不是测试环境错误。

Evidence：`output/english-whitepapers/xyy-20260929-04/luna/whitepapers-390.png`（已亲读）；对照 `whitepapers-1440.png`；`sol/whitepapers-e2e.log` 为 6/6 passed，`sol/news-regression.log` 为 8/8 passed，`sol/shell-regression.log` 为 2/2 passed，`sol/verify.log` exit 0（570 type files/0 diagnostics、739 maintainability files、90 test files/578 tests、lint/assets/build PASS）；`final-code-freeze.json` 与 `sol/pre-review-scope-check.json` 无保护路径漂移。

Likely affected area：`src/components/publications/EnglishPublicationsHero.astro` 的移动端 hero 顶部间距与共享 fixed Header 的安全偏移交互；建议修复后补充 hero 首个可见文字 Range 不得高于 Header bottom 的 390/360 几何断言。Luna 未修改应用或自行修复。

Severity：**HIGH**（合同 AC6 明确要求移动端无导航遮挡；首屏辅助标题首行实际不可读）。

Regression coverage：英文白皮书 fixture 6/6、英文新闻相关回归 8/8、旧 English shell/语言建议 2/2；中文目录/14期详情及 `/`↔`/en`、`/en/cases` 的 Sol SSR 对照与保护冻结均通过。当前 FAIL 仅由 390px hero/header 遮挡阻塞，不否定其余通过项。

#### XYY-20260929-04 — Mobile spacing retest preparation

Terra 已修复 `EnglishPublicationsHero.astro` 的移动端 padding；Luna 未修改应用。为保持维护性预算，布局与视觉用例已拆至 `tests/e2e/english-whitepapers-layout.spec.ts`（130 行），原 CMS/SEO/边界用例 `tests/e2e/english-whitepapers-fixture.spec.ts` 为 171 行。新增 390/360 的 hero eyebrow 与 H1 实际文本 Range 必须位于 fixed Header bottom 之下的断言；1440 维持同一 viewport/overflow/CTA 检查。

布局用例将生成四张非 fullPage 任务截图：`whitepapers-1440-top.png`、`whitepapers-390-top.png`、`whitepapers-390-latest.png`、`whitepapers-390-faq.png`，后两张分别定位最新卡片与 FAQ。Scoped Prettier、ESLint、`git diff --check` 与 `npm run check:maintainability`（740 files）已通过；未运行 build 或浏览器，等待 Sol 统一执行。

#### XYY-20260929-04 — Layout test logic correction

按 Sol 复核，移除布局测试对页面底部 CTA 必须处于初始首屏的错误要求，改为仅检查 CTA 标题横向边界；保留 hero eyebrow/H1 首屏 Range 与 fixed Header bottom 的移动端相交断言。最新卡片截图定位改为 `#issues article h3`，滚动后距 Header 约 110px，以包含英文标题、摘要和链接。

修正后 `tests/e2e/english-whitepapers-layout.spec.ts` 为 122 行。Prettier、ESLint、`git diff --check` 与 `npm run check:maintainability`（740 files）均 exit 0；未运行 build 或浏览器。

#### XYY-20260929-04 — Locale-banner scenario disposition

经核对 `src/scripts/language-suggestion.ts`，语言条显示条件是当前页面 `data-current-locale="zh-CN"` 且浏览器首选语言为 English；英文目录的当前 locale 固定为 `en`，因此“浏览器 zh-CN + English 目录同时显示语言条”的场景在真实机制下不成立。未伪造 CSS 变量、未新增必失败测试，也未将该不可适用场景冒称为已测覆盖；当前 layout spec 保留 English 目录默认无语言条的 1440/390/360 断言。此前 layout spec 的 122 行 scoped Prettier、ESLint、diff 与维护性结果继续有效。

#### XYY-20260929-04 — Visual evidence capture correction

亲读 Sol 首轮复测图确认取证错位：`whitepapers-390-latest.png` 仍显示 hero，`whitepapers-390-faq.png` 实际显示最新卡片；两图未能证明下方目标视觉通过。原因是页面全局 smooth scrolling，原脚本在滚动动画完成前截图。旧图及 Sol 的 `sol/before-mobile-spacing-fix/` 证据保留，不计作 FAQ/最新卡片 PASS。

已将布局测试滚动改为 `window.scrollTo({ behavior: 'instant' })`，并在每个目标截图前轮询其 top 位置落在 100–120px，再保存四张 viewport 图；未改应用。修正后 layout spec 为 144 行。Prettier、ESLint、`git diff --check` 与 `npm run check:maintainability`（740 files）通过；未运行 build 或浏览器，等待 Sol 仅重跑 layout 用例。

#### XYY-20260929-04 — Final independent QA PASS

Task ID：`XYY-20260929-04`
Result：**PASS**。Luna 已独立复核 Sol 最终原始日志、freeze/scope 元数据及四张最新 viewport 截图；未发现剩余 AC 阻塞。

Tests performed：白皮书 fixture/layout 合计 `6 passed`（`whitepapers-e2e.log` 与 `layout-retest.log`，layout session 62486 exit 0）；覆盖英文标题/摘要/FAQ/CTA/空态、14 期原中文 HTML/PDF 入口、第10期来源冲突、第12期 `03–07` 目录串、第14期 June 2026、CMS empty/network/5xx/401/403/invalid、根路由 hreflang、尾斜杠 reciprocal pair、Insights active、sitemap/llms、实际 FAQ/原文链接交互，以及 1440/390/360 hero Range、fixed Header 不相交、横溢和 CTA 横向边界。亲读四图 `whitepapers-1440-top.png`、`whitepapers-390-top.png`、`whitepapers-390-latest.png`、`whitepapers-390-faq.png`；最新卡片图已显示英文标题/摘要/中文原文链接，FAQ 图已显示英文 FAQ 标题和问题控件。无效 smooth-scroll 截图保留在 `sol/invalid-smooth-scroll-screenshots/`，未计入 PASS。

Regression coverage：`news-regression.log` `8 passed`、`shell-regression.log` `2 passed`；最终 `verify-final.log` exit 0：571 type files/0 diagnostics、740 maintainability files、90 files/578 tests、lint/assets/build PASS。`final-code-freeze.json`/`verify-final-code-freeze.json` 共 19 路径，`pre-review-scope-check.json` 显示 1379 protected paths 无漂移；中文目录/14期详情及 `/`↔`/en`、`/en/cases` SSR 对照保持。English 目录语言提示条场景未冒称覆盖，因真实脚本仅在当前 locale 为 `zh-CN` 时显示；本轮验证的是 English 页面默认无条布局。

Remaining risks：验证限本地 built SSR、mock/offline CMS、Chromium 模拟 1440/390/360 viewport；未覆盖 live CMS、真实设备、Safari/Firefox、部署后环境、`verify:release` 或线上行为。未写入真实 CMS/数据库/lead，未部署、提交或推送。交 Nova Review → Sol 最终验收。

### XYY-20260929-05 — Independent release preflight

Task ID：`XYY-20260929-05`；Risk：`HIGH`；Result：**PASS（仅发布前独立只读核对）**。Luna 未修改应用、测试、配置、CMS、数据库或部署，也未 commit、push、clone 候选或运行浏览器/`verify:release`。

Tests performed：`release-files.json` 的49个路径全部存在且当前 SHA-256 全匹配；其中 `approved-code-freeze.json` 的46个代码/测试路径匹配，另3个为合同指定编辑/计划文档。`precommit-scope-check.json` 记录49 frozen、1350 protected、0 hash mismatch、0 unexpected changes、0 credential-pattern hits；清单无 secret/env、生成物、备份、token/password、`dist`/`node_modules`/`output` 路径。Sol 提供的 `verify-precommit.log` 与会话结果为571类型文件零诊断、lint、740文件维护预算、资产检查、90文件/578单测（578 passed）及 build 完成，命令 exit 0；Luna 未重复执行。

Baseline/执行器：当前 HEAD、local `main`、记录的 GitHub `main` 和线上基线均为 `54b41d2388d34de5a8f6ddad2c32b77b1f75dfd5`；线上基线 health 的 `cmsContent`/`contactStorage` 均为 `ok`，保留17个 release，CMS PID 为1401397。Luna 亲读候选准备器、任务部署器及 `scripts/deploy.sh`：候选限定任务独占 `/dev/shm/xyy-20260929-05-*/candidate` 并复核49 hash；部署目标只为 staging `wz.tomatopia.top` `/var/www/xyy-web`，且首个 SSH/上传动作前调用完整 `npm run verify:release`，没有 CMS/schema/数据库/权限写入路径。

Regression coverage：本轮复核任务03 English news + 任务04 English whitepaper 的最终49路径并集及已有保护路径范围，未重复执行已提供的单测、E2E、build 或浏览器矩阵。

Remaining risks：这是发布前准备 PASS，不是 release gate 或线上 PASS。工作区仍处于未 commit 阶段，`output/release/xyy-20260929-05/expected-commit.txt` 尚未生成，因此候选 clone、`verify:release`、commit、push、部署及部署后在线 QA 仍是后续前置条件。证据：[preflight report](../output/release/xyy-20260929-05/luna/preflight.md) 与 [preflight JSON](../output/release/xyy-20260929-05/luna/preflight.json)。

#### XYY-20260929-05 — Post-deployment QA runner prepared

Luna 已按同一 Task ID 准备只读后测脚本与清单：`output/release/xyy-20260929-05/luna/run-online-qa.py`、`online-browser.template.js`、`online-qa-checklist.md`。脚本要求 `--confirmed-deployed-sha` 精确等于 `expected-commit.txt` 且显式提供 `--deployment-complete`，未在部署完成前访问新版、启动浏览器或占用4510/4511。

Runner scope：只对 `wz.tomatopia.top` 发起 GET；先核对 `/version` 的 SHA/environment、`/healthz` 双依赖、根/语言配对、白皮书中文目录与14详情、英文目录、`/en/cases`、`/news`、sitemap、llms、14期PDF及缺失英文新闻404，再以 Chromium 1440×900/390×844 做英文目录内容分支（真实CMS无英文稿时明确空态，不臆造14张卡）、FAQ实际展开、Insights active、canonical/hreflang、语言切换、移动 hero/header 几何与横溢检查。仅FAQ summary等只读交互；不提交表单、不写CMS/数据库/权限。

Evidence limits：最多四张非全文截图（1440 top、390 top、390 latest、390 FAQ；目标不存在时不伪造），记录 console/page/request/HTTP 错误与非GET请求。脚本和清单通过 Python compile、模板替换后的 Node syntax check、scoped Prettier 与 `git diff --check`；本段仅表示 runner 已准备，未表示线上后测或部署完成。

#### XYY-20260929-05 — Runner review corrections before online execution

按 Sol 只读审阅意见修正 runner，仍未访问新版。FAQ 现在先完成首屏 geometry 与 top 截图，再滚动到 FAQ、展开真实 summary、复位目标位置后截图；最新卡片改为定位 `Issue 14`，空目录时跳过不存在的 latest/FAQ截图。每个浏览器 session 均有独立 `finally` close，cleanup 证据记录真实 closed/remaining/errors，不再虚构清理。

英文目录语言按钮与 Insights 入口现在实际执行双向 GET 导航；1440使用桌面入口，390明确定位移动导航中的 Insights 链接，避免把隐藏桌面链接误判为可点击；另明确读取 `/en/news` 的真实卡片或空态。缺失英文文章的预期404仅按准确路径排除对应 response/request/console 错误，其余错误继续失败。runner 固定 `https://wz.tomatopia.top`，浏览器 route guard 只允许 GET/HEAD；`/healthz` 明确要求 `dependencies.cmsContent` 与 `dependencies.contactStorage` 均存在且为 `ok`。浏览器结束后重新 GET `/version`/`/healthz` 并逐项核对起始 identity。

Runner 记录各选定页面的 rendered main-text SHA，并把 `online-pages-before.json` 纳入运行证据；raw `main_sha256` 的精确对比仍由 Sol 独立完成。修正后 Python compile、模板替换 Node syntax、scoped Prettier、LUNA 新后缀 Prettier 与 `git diff --check` 均通过；仍未执行线上后测。

### XYY-20260929-05 — Final staging post-deployment QA

Task ID：`XYY-20260929-05`；Result：**PASS（真实 staging 只读 QA，含明确 FAQ 未渲染限制）**。

Tests performed：最终 runner `online-20260929T050711Z` exit 0，目标 `https://wz.tomatopia.top` 的 `/version` 返回 SHA `79ba3c152bda1866c70f139bb3abe4145c1dc414`、Release `20260929T044842Z-79ba3c1`、`staging`；起始/结束 identity 一致，`/healthz` 为200且 `cmsContent`/`contactStorage` 均为 `ok`。GET 路由根/EN配对、中文白皮书目录/14详情、英文白皮书目录、`/en/news`、`/en/cases`、`/news`、sitemap、llms、14期PDF均200；确定缺失英文新闻为404。1440×900与390×844均渲染14张英文卡，Issue10/12/14来源标注、Issue14中文HTML/PDF、canonical/hreflang、Insights active、真实 Insights/语言按钮双向GET导航、390移动导航入口、hero/header几何与无横溢通过；issues/errors均为0，所有浏览器请求为GET，两个session真实关闭且无残留。

Regression coverage：我亲读 `online-20260929T050711Z/screenshots/whitepapers-1440-top.png`、`whitepapers-390-top.png`、`whitepapers-390-latest.png`；桌面 hero/卡片、手机 hero/Issue14卡片均可读，未见固定Header遮挡或横溢。Sol 已另行提供四个保护页面 raw `main_sha256` 上线前后精确一致证据；本 runner 记录 rendered main-text SHA、语义 title/H1 与完整 raw CLI/HTTP/identity/cleanup日志。证据：[post-QA report](../output/release/xyy-20260929-05/luna/post-qa-report.md)、[result JSON](../output/release/xyy-20260929-05/luna/post-qa-result.json)。

FAQ限制：真实线上页面 `faqCount=0`，因此没有宣称FAQ点击通过，也没有伪造第四张FAQ截图。源码仅在翻译后的FAQ结果非空时渲染 `PageFAQ`，且 `translatePublicationFaqs` 会过滤未匹配审核源 q/a 的条目；当前英文FAQ输出为空，可能源为空或未通过审核源匹配，未直接判定原始CMS记录。未写CMS或制造内容。最终有效截图为3张，仍在4图上限内。

初次失败保留：`online-20260929T050437Z/001-open.log` 为 npx 写 `/home/yj/.npm/_cacache` 时 EROFS，HTTP identity/routes已先通过且浏览器未启动；`online-20260929T050543Z/002-run-code.log` 为 runner `document.documentElement` 空值假设，Chromium已启动且session真实关闭，无页面结果。前者为环境阻塞，后者为测试harness问题；均不计页面FAIL。最小可选根元素修正后 scoped syntax/format/diff通过，最终第三次执行PASS。

Remaining risks：验证限授权 staging、本地CMS实际内容状态、Chromium模拟1440/390；未覆盖真实设备、Safari/Firefox、production及CMS有FAQ时的FAQ交互。raw主文hash以Sol独立证据为准；未写真实CMS/数据库/权限，未触碰正式站。

### XYY-20260929-06 — Independent services footer QA

Task ID：`XYY-20260929-06`；Result：**PASS**。

Tests performed：Luna 仅将 `tests/e2e/product-video-sequence.spec.ts` 中过时的“无页脚”断言拆为旧两个 selector 仍为0及 `footer` 为1；scoped Prettier、ESLint、`git diff --check` 通过。Sol 的内存盘原生回归 `output/playwright/xyy-20260929-06/sol-e2e-memory.log` 为 Chromium 桌面/移动 8/8 passed，覆盖视频自动播放与单滚动容器、减少动态效果、更新后的产品断言及详情页导航。Luna 亲读 `sol-browser-r2/sol5-{product-1440,product-390,services-en-1440,services-en-390}.log`：四份各有一条 `### Result`、无 `### Error`；两页两个视口均为单 footer、9 分区/8 视频、footer 位于服务内容后、与对应首页 locale footer 文本及链接集合一致、底部隐私链接可见、无横溢、无服务导航/footer 相交、浏览器错误0；均到达内层 `09 / 09` 与 max scroll 后再跨到 footer，并通过 wheel 回到服务内容。两个390 run 以 CDP `dispatchTouchEvent` 实际滑动，`touchScrollDelta` 均为844。四张 viewport 图已亲读：`output/playwright/xyy-20260929-06/sol-browser-r2/footer-{product-1440,product-390,services-en-1440,services-en-390}.png`，中英文页脚内容、版权及隐私链接可读，未见重复页脚或横向溢出。

Regression coverage：最终 native E2E 8/8；桌面与移动、reduced-motion、视频/分区导航、服务详情 active navigation 均通过。Luna 未重复执行 Sol 已完成的同套 E2E。

Remaining risks：证据限本地 `127.0.0.1:4322` 离线 CMS 预览、Chromium、模拟1440/390视口及 CDP touch；未覆盖真实设备、Safari/Firefox、live CMS、部署或正式站。Luna 未运行 build/full verify，未写 CMS/数据库，未 commit、push 或部署。初次根盘 EROFS、浏览器崩溃及 synthesize touch 失败日志均保留，未计入 PASS；最终 r2 使用任务内存盘并完整通过。

### XYY-20260929-06 — Static-footer increment runner prepared

本增量沿用同一 Task ID，按 MEDIUM 合同准备独立 runner，尚未执行，不能视为 PASS。`tests/e2e/product-video-sequence.spec.ts` 仅补充页面外层无 `footer`、`[data-product-video-footer]` 内唯一 `footer` 的结构断言；scoped Prettier、ESLint、`git diff --check` 通过。一次 CLI session/一次 `async page =>` runner 已写入 `output/playwright/xyy-20260929-06/static-footer/luna/footer-static-cli-runner.sh`，并通过 `bash -n`：覆盖中英文 `/product`、`/en/services` 的 1440/390，Header 附近滚动时 outer scroll/footer 门控、前8分区无 footer、09/09 后 footer 自然 wheel/touch 到达、静态 `position/transform/animation`、页脚与首页文本/链接一致、版权/隐私、nav 隐藏与返回服务恢复、横溢/浏览器错误、四张 viewport 截图；另以 raw SSR HTML 检查无 JS 所需的 footer/inner-slot 结构。使用 cached wrapper、`NPM_CONFIG_OFFLINE=true` 与任务内存盘 TMP/XDG，未启动浏览器、未重复8项 E2E、未运行 build/full verify。

同一 runner 后续修订仍未执行：在每个中文视口清除自有 browser 的 `xyy-language-preference` 后 reload，断言语言提示条实际高度及 dismiss 后高度归零且 outer scroll max 不增加；四个正常 case 在 return 前均硬断言首页 footer 文本/链接一致且 browser errors 为空；另在同一 run-code 中创建 `javaScriptEnabled:false`、390×844 独立 context，对中英文 Services 实际 wheel 到 footer、版权/隐私可见、outerY 为0及 nav hidden 后关闭 context。CLI 非零退出与 `### Error` 均显式失败。上述仅为 runner 能力与待执行范围，不是通过结论。

#### XYY-20260929-06 — Existing motion test assumption correction

Sol 的 static-footer E2E 首轮为 7 passed/1 failed；失败仅为 mobile `product-motion.spec.ts:78` 的旧测试假设。实际 error-context 显示测试把最后 mechanism `scrollIntoViewIfNeeded()` 后直接点击 `previous`，此时第9分区 footer 已进入内层视口，新的 IntersectionObserver 按合同隐藏分区导航，导致 locator 等待超时；没有实现错误证据。Luna 在授权测试文件中最小补充回到 `#assurance` heading、断言 `previous` 可见后再点击，保留原 status/offset/nav 断言，不改实现。Scoped Prettier、ESLint、`git diff --check` 通过；等待 Sol 仅重跑该失败 mobile case，未自行启动浏览器。

#### XYY-20260929-06 — Static-footer independent evidence review

Luna 已独立复核 Sol 的 `static-footer/sol-browser/footer-static-cli.log` 与 `results.json`：单次 CLI session exit 0、无 `### Error`，4 个中英文 `/product`/`/en/services` 1440/390 case 全部有硬断言结果；两个 390 no-JS context 也实际滚动到页脚并关闭。各 case 均为单 footer、9 分区/8 视频，前 8 分区不露 footer，`09 / 09` 到 max 后 footer/隐私可见，outer scroll 保持 0，footer static/no transform/no animation，导航隐藏后能回服务并恢复；页脚内容与对应首页链接集合匹配，errors 为空。中文 1440/390 语言条实际显示后 dismiss，height 分别为 49/76.578px，outer max 始终为 0；英文页无语言条符合真实显示机制。四张 `sol-browser/footer-{product-1440,product-390,services-en-1440,services-en-390}.png` 已亲读，页脚文字、版权与隐私链接可读，未见横溢或视觉遮挡。

上述仅确认 static-footer runner 证据；旧 E2E 首轮 7/8 的 mobile motion 测试修正仍待 Sol 定向复测，故本增量在该复测完成前不写最终 PASS。

#### XYY-20260929-06 — Static-footer increment final independent QA

Task ID：`XYY-20260929-06`；Result：**PASS**。

Tests performed：Sol 定向复测 `output/playwright/xyy-20260929-06/static-footer/e2e-retest-r2.log` exit 0，`product-motion.spec.ts` 改动后的 desktop/mobile 两项均 passed。首轮 7/8 中 mobile 的失败是旧测试在 footer 进入视口后仍假设导航可见；第一次修正后 desktop 又暴露同类末尾 `next` role locator 假设。Luna 仅在测试文件中保留 `09 / 09`、disabled 与导航 hidden 断言，改用 DOM locator 覆盖 hidden 按钮；未改应用。此前两次失败日志及 error-context 均保留，不计为产品失败。

静态页脚 runner `footer-static-cli.log` exit 0、无 `### Error`：中英文 `/product`、`/en/services` 的 1440/390 四组合均通过单 footer、9 分区/8 视频、前 8 分区不露 footer、内层到 `09 / 09`/max 后页脚可见、版权/隐私可读、outer scroll 为0、页脚 static/no transform/no animation、导航在 footer 隐藏并可回服务恢复、首页页脚文字/链接匹配与浏览器错误0。中文两视口语言条实际显示→dismiss，height 为 49/76.578px 且 outer max 始终0；英文无语言条符合真实机制。两个 390 no-JS context 均实际 wheel 到 footer，隐私可见、outerY 为0、导航 hidden 并真实关闭 context。四张 `sol-browser/footer-{product-1440,product-390,services-en-1440,services-en-390}.png` 已亲读，未见横溢或页脚视觉遮挡。

Regression coverage：旧 E2E 首轮其余 7 项通过，修改后的 motion desktop/mobile 定向复测 2/2 通过；合并证据覆盖原有视频/分区导航、reduced-motion、服务详情导航，以及 static-footer 的桌面/移动 wheel、移动真实 touch、语言条、no-JS 和 footer/home 链接一致性。结构断言仍保留页面外层无 footer、滚动容器内唯一 footer。测试文件 Prettier、ESLint、`git diff --check` 通过；本任务 LUNA 新增后缀单独 Prettier 检查通过。未运行 build/full verify，未重复已通过的其余浏览器用例。

Remaining risks：证据限本地 `127.0.0.1:4322` 离线 CMS 预览、Chromium 模拟 1440/390、CDP touch 与 no-JS Chromium context；未覆盖真实设备、Safari/Firefox、live CMS、部署或正式站。未写 CMS/数据库、未 commit/push/deploy。初始 page crash/EROFS、CLI 语法与触摸探针失败日志均保留并明确未计 PASS。

### XYY-20260929-07 — Narrow header responsive independent QA

Task ID：`XYY-20260929-07`；Result：**PASS**。

Tests performed：Sol 使用冻结后的 Luna 单 session/单 `async page =>` runner 原生执行，CLI exit 0、无 `### Error`，session 已关闭；Luna 独立解析 `output/playwright/xyy-20260929-07/browser-results.json` 的 14/14 结果，覆盖中英文 `/product`、`/en/services` 在 320/360/390/589/639/640/1440px。小于640px均为两排可见导航，640/1440均为桌面单排；中英文目标 href、单一 active 内容、文本 Range 边界、nowrap、client/scroll 尺寸、链接/Logo/语言按钮矩形相交和水平溢出均通过。移动 Logo 与首项最小实测间距为10.3125px，行间 gap spread 在3px阈值内。语言切换实际点击 `/product`→`/en/services` 与 `/en/services`→`/product`；中文320px语言提示条实际显示高115.15625px、outerMax为0、header top为121.15625px，dismiss 后 hidden/0高。四张 `luna/header-{zh-CN,en}-{320,589}.png` 已亲读，中英文两排文字、激活态和语言按钮可读，无明显裁切/覆盖。

Regression/source evidence：Terra交接 CSS SHA `1099ace7c347c1d76b082e908453b606a0701b68b043c32298b6aebcccaaea08` 与 Sol source review 一致，桌面规则字节未变，42 protected files matched。首轮 attempt-1 保留；唯一失败为测试将640px字体 ink Range 高度20px与 line-height14.0896px比较导致的 harness 误报，实际文字完整在链接盒内。最终 runner 改用 nowrap、Range 边界及 client/scroll 尺寸判据后通过。Luna 未修改实现、持久E2E、CMS、数据库、构建、提交、推送或部署。

Remaining risks：验证限本地 `127.0.0.1:4322` 离线 CMS、Chromium 模拟视口及四张裁剪 header 图；未覆盖真实设备、Safari/Firefox、live CMS、部署或正式站。语言提示条只在中文320px组合实测显示/关闭，其余 14 组合验证的是默认导航布局，不扩大为全宽度提示条覆盖。

### XYY-20260929-07 — Overflow-menu final independent QA

Task ID：`XYY-20260929-07`；Result：**PASS**。

Tests performed：Sol 最终 `core-final.json` 为12个中英文首页/服务页布局、2个菜单交互、2个 no-JS context，覆盖320/390/589/640/1440、精确 href/顺序与 active、无横溢、键盘 Enter/Space/Tab/Escape、外点关闭、末项导航、双向语言点击及中文320语言提示条显示/关闭，`errors=[]`。最终 edge `edge-final.json`（session71142）在390×260真实局部 wheel 得到 `popupScroll=87`、window scroll 前后均0、末项可见；`data-lenis-prevent` A/B 对照去除属性后 nav scroll=0且 window scroll=116，恢复后通过。焦点 resize、字体 loadingdone 的3→2→3分配与 no-ResizeObserver `/contact` fallback 均通过且无错误。既有定向 E2E `e2e-retest.log` 为6/6 passed。

Regression coverage：最终 spacing raw/四图显示中英文589/390 header高58、末链接至语言按钮间距均8px，菜单分配与三横线玻璃按钮可读；Luna 已亲读 `sol-preview-final-spacing/{zh,en}-{390,589}.png` 与 `luna/header-edge-390x260.png`。typecheck 572文件0 errors/warnings/hints、7文件 format、6文件 ESLint、diff 与 budget 的初始检查及6项E2E早于最终非视觉 `data-lenis-prevent` 属性；属性加入后仅做 scoped format/lint/diff，并重跑 core/edge，均通过。final freeze 7路径、protected 40路径保持。

Remaining risks：证据限本地 Astro dev preview `127.0.0.1:4322`（本次未build）、离线CMS、Chromium模拟视口与测试时隐藏 Astro dev toolbar 的390×260截图；no-ResizeObserver probe 用 `/contact` 隔离首页 Lenis 运行时依赖，未扩大该既有依赖。未覆盖真实设备、Safari/Firefox、live CMS、部署或生产环境，未写CMS/数据库。attempt-1至5 edge失败日志保留；其中早期 `popupScroll=0` 先后受命中层与首页 Lenis no-ResizeObserver 环境影响，最终以 hitNav=true 与 Lenis A/B 结果为准。

### XYY-20260929-07 — Overflow-menu edge diagnosis

Task ID：`XYY-20260929-07`；Result：**FAIL（edge condition）**。

Expected：390×260 窄视口的折叠菜单在 `overflow-y: auto` 容器内响应真实 wheel，并可滚动到全部导航项。

Actual：edge session `66566` exit 1；wheel 已定位到实测 nav 内部，但 `popupScroll` 保持 `0`。原始失败日志保留在 `output/playwright/xyy-20260929-07/overflow-menu/luna/header-overflow-edge-probe-attempt-1.log` 与 `header-overflow-edge-probe.log`。

Reproduction/Evidence：`src/scripts/home-page.ts:8` 启用 Lenis `smoothWheel`；当前安装的 Lenis 在事件路径没有 `data-lenis-prevent`/`data-lenis-prevent-wheel` 且未启用 `allowNestedScroll` 时拦截原生嵌套滚动（`node_modules/lenis/dist/lenis.mjs:603-610`）。新 mobile nav 只有 CSS `overflow-y:auto`（`src/styles/header-responsive.css:138-148`），其 `<nav>` 没有 Lenis prevent 属性（`src/components/navigation/MobileNavigation.astro:25`）。因此该失败归类为实现集成缺陷，不是 geometry harness 误报。

Likely affected area：Lenis 全局 smooth-wheel 与 mobile overflow nav 的嵌套滚动集成。Severity：Medium；短视口下可能无法触达折叠菜单中的全部入口。建议 Sol/Terra 在 nav 上加入项目约定的 Lenis nested-scroll boundary（如 `data-lenis-prevent` 或更窄的 wheel/touch 属性），然后仅重跑 edge probe 与受影响导航检查。未改实现、未写 CMS/数据库、未部署。

#### XYY-20260929-07 — Edge diagnosis correction and final evidence

上述早期 FAIL 记录仅保留 attempt-1至5 的中间诊断，不是最终产品结论。attempt-4 的 `hitOuterHTML` 为 `<astro-dev-toolbar>`，其下一层才是 mobile nav；390×260 开发工具栏覆盖了探针中心点。attempt-5 在隐藏工具栏后暴露首页 Lenis no-ResizeObserver 依赖。最终 session71142 仅用测试样式隐藏该开发工具栏，未改源码，确认 `hitNav=true`、`popupScroll=87`、window scroll 前后均为0、末项可见。随后同一 open menu 临时移除并恢复 `data-lenis-prevent` 的 A/B 对照为 nav scroll=0、window scroll=116，证明该属性确实提供本地滚动边界。最终 `edge-final.json` 与 final report 结论为 PASS；no-ResizeObserver fallback 改在 `/contact` 独立 context 验证，以隔离首页 Lenis 运行时依赖。

### XYY-20260929-07 — Glass-match CSS increment final independent QA

Task ID：`XYY-20260929-07`；Result：**PASS**。

Tests performed：glass-match CLI session `56110` exit 0，6组合全部通过：中文/英文首页在438/390/1440的真实 summary 展开、Escape关闭、背景/边框/阴影/`::before`高光 computed 等值、有效滤镜比较、8px手机末项至语言入口间距、无横溢、精确 href 集合、1440折叠隐藏。手机 effective glass filter 为 `glass::before` 的 `blur(22px) saturate(1.8) contrast(1.06)`，与菜单自身滤镜一致；桌面为 glass element 与菜单一致，`errors=[]`。

Regression coverage：Luna 独立亲读最终四图 `glass-match/luna/glass-{zh-CN,en}-{438,390}.png`；菜单背景已实际模糊，英文390中原先穿透的橙色 hero 文案不再清晰穿过 Contact 面板，标签、边框和主导航均可读。两 CSS Prettier 与 diff check 通过；未运行 typecheck/full verify/build，未写 CMS/数据库、未提交、推送或部署。

Remaining risks：验证限本地 Astro dev preview `127.0.0.1:4322`、离线CMS、Chromium与6个合同视口；未覆盖真实设备、Safari/Firefox、live CMS或部署环境。首轮 `luna/attempt-1/` raw/四图保留：computed 参数通过但视觉模糊不足，未计入最终PASS。
### XYY-20260929-08 — 发布前独立 preflight 与线上 runner 准备

Task ID：`XYY-20260929-08`；Result：**发布前 PASS**。Luna 独立核对 `release-files.json` 精确15路径及逐文件 SHA-256（15/15）、HEAD/合同基线 `79ba3c1`、1386保护路径、冻结 `baseline-status.txt` 与当前工作区 55/55 一致；未把40个既有并行修改纳入发布清单。`verify-precommit-result.json` 显示 session50610 的候选 `npm run verify` exit0：569类型文件零诊断、737维护预算、90文件/578 tests、lint/assets/build均完成。`remote-before.json` 仅作为部署前旧版本环境基线：staging/GitHub/online均为79ba3c1，healthz双依赖ok、18旧release、CMS/web进程保持；不代表新版本已部署。

保留首次候选准备失败证据（node_modules软链接忽略规则，未启动verify且非应用失败），不计为当前失败。只读线上 runner 已写入 `output/release/xyy-20260929-08/luna/online-qa-runner.sh`，`bash -n` 与内嵌 async probe 的 `node --check` 均通过；固定 `https://wz.tomatopia.top`、只允许 GET/HEAD、显式识别 `### Error`/`### Result`；覆盖中英文首页390/438/1440玻璃/blur/8px/菜单/Escape/语言实点，`/product`与`/en/services` 390/1440内层wheel/touch至09/09静态footer与返回服务，以及英文news/whitepaper GET。此次尚未执行线上runner、部署、push或任何外部写入；candidate native路径不在Luna沙箱可读挂载中，未重复尝试读取。详细证据：`output/release/xyy-20260929-08/luna/preflight-report.md`。后续仅待Nova/ Sol按合同完成部署顺序后，由Luna复核真实线上raw与截图。

同任务预执行复核：初版线上 runner 的 `inspectHeader` 错误依赖 Node 闭包中的 `rect`、`visible`、`styles`，且桌面隐藏菜单仍要求 summary 可见，均属测试 harness 缺陷，未启动线上执行。修正版已将 helper 放入 `page.evaluate`，按移动/桌面分别判断 summary，并依 `src/i18n/routes.ts` 核对英文导航顺序；原始未执行版本保留为 `online-qa-runner-attempt-1.sh`。修正版 `bash -n`、内嵌 `node --check`、`git diff --check` 通过；不改变 preflight 结论，也不构成应用 FAIL。

### XYY-20260929-08 — conversion CTA locator correction

Task ID：`XYY-20260929-08`；Result：**PASS（scoped test-harness correction）**。首轮 release-gate 失败证据显示旧 locator `[data-product-video-slide] a[href^="/"]` 在 `/product` 收到25个链接而非预期8个：Task06 将 Footer 放入第9 assurance slide，该 slide仍带 `data-product-video-slide`，因此 footer links 被计入。Luna 仅修改 `tests/e2e/conversion-cta.spec.ts`，将 locator 限定为 `[data-product-video-slide]:has([data-product-video]) a[href^="/"]`；count=8、精确 `productDetailRoutes`、accessible name、footwear、conversion CTA、a11y 与 overflow 断言均保留，应用未改。

Scoped `prettier --check`、ESLint、`git diff --check` 均通过；diff为3 additions/1 deletion，当前测试文件 SHA-256 为 `eeaeb1355a22a87bb50f088308786abcb1b47a4ffe4c761da0138bf11e6167fc`。Luna 未运行浏览器或全量测试；Sol 将以该最小修正加入候选后执行定向及完整 release gate。原始失败证据保留，当前仅归类为测试 harness 定位问题，不构成应用 FAIL。详见 `output/release/xyy-20260929-08/luna/conversion-cta-fix-report.md`。

### XYY-20260929-08 — conversion CTA locator 修复复核

Task ID：`XYY-20260929-08`；Result：**PASS**。Luna 独立复核 Sol 证据：`test-rework-result.json` session59924 exit0，Chromium/mobile 定向 conversion CTA 测试2/2 passed（31.0s）；两项均执行原完整断言。`verify-rework-result.json` session44699 exit0，候选16路径 verify 完成：569类型文件零诊断、lint、737维护预算、assets、90文件/578 tests、build均通过，candidate tree `663660eb591b35ee8fd2fbfa92106dc64d47d931`。首轮session84172 exit130的87pass/1fail/1interrupt/99未运行及25链接失败证据保留，归因仍为旧locator计入Task06第9 assurance/footer links。

当前结论仅覆盖测试修复和候选门禁；应用源码未改，尚未由Luna执行部署或线上验证，后续仍需Nova增量Review及合同发布流程。详见 `output/release/xyy-20260929-08/luna/conversion-cta-fix-report.md`。

### XYY-20260929-08 — smart-shipping layout audit 修正

Task ID：`XYY-20260929-08`；Result：**PASS（scoped test-harness correction）**。首轮 release gate session71222 的唯一失败为 mobile `smart-shipping` layout：旧 audit 对所有可见文字 Range 使用 `rangeCount > 20`，折叠导航后合法得到20；同一失败无裁切、重叠、overflow、fonts 或 browser errors 证据，不能归类为应用缺陷。

Luna 仅修改 `tests/e2e/english-digital-details-layout.spec.ts`：保留原 Range 几何、section、媒体、overflow、font 和 browser-error 检查，增加每个 sample 的 `mainRangeCount > 0`、`headingRangeCount > 0`、`navigationRangeCount > 0`，替代与可见导航数量耦合的任意总数下限。未把20改19、未删除空扫描防护，应用与其他测试不变。Scoped Prettier、ESLint、`git diff --check` 通过；diff为6 additions/1 deletion，SHA-256 `f16668fcb93c7a4a1f3f0477c1b4bf1530cbbdf4e5881f313f76c2edcc31ba87`。未由Luna重跑浏览器或release gate，首轮失败证据保留；详见 `output/release/xyy-20260929-08/luna/english-digital-details-layout-fix-report.md`，待Sol执行定向复测与候选门禁。

### XYY-20260929-08 — smart-shipping layout audit 修正最终定向复核

Task ID：`XYY-20260929-08`；Result：**PASS**。Luna 复核修正前 `luna/smart-shipping-mobile-failed-layout.json`：两份 mobile initial sample 的 `rangeCount=20`，但 `failures=[]`、overflow=0、fonts loaded、errors为空；该 raw 保留并证明旧 `>20` 门槛误报。Sol 定向 `test-rework-2.log` exit0，digital-operations 与 smart-shipping 在 Chromium1440/768、mobile390/360 共4/4 passed（1.9m）。`rework-2-verification-result.json` session56881 显示完整 verify exit0：569类型文件零诊断、737维护预算、90 files/578 tests、lint/assets/build完成，17 frozen paths/1384 protected paths。

新的正文/标题/导航分别非空守卫通过四组合复测，原几何、媒体、section、overflow、font、browser-error断言保留。应用未改，完整release尚未重跑；当前交付供Nova增量Review。详见 `output/release/xyy-20260929-08/luna/english-digital-details-layout-fix-report.md`。

### XYY-20260929-08 — staging online final independent QA

Task ID：`XYY-20260929-08`；Result：**PASS**。部署 release `20260929T234844Z-b50c4b3` / SHA `b50c4b3e85ecdf60e3cded498b5701d9d107e1c7` 后，Sol runner session15193 exit0；Luna 独立解析 `online-qa-cli.log` 的 Result JSON，与 `online-result.json` 逐字一致：header6、language2、service4、content GET2、errors=[]。中英文390/438/1440导航均单排/无横溢/精确href/唯一active，移动末项至语言入口8px（中文438为7.765625px且在容差内），真实菜单展开/Escape及双向语言点击通过；有效玻璃背景/边框/高光与菜单一致，窄屏真实blur为22px。

`/product` 与 `/en/services` 390/1440均9分区/8视频/单Footer，前段Footer不提前出现，内层滚动至09/09/max后Footer static、privacy可见、分区nav隐藏，outerY保持0，回滚服务后nav与控制恢复；390 touch delta为702/794，Footer/home链接集合一致。英文 `/en/news`、`/en/supply-chain-whitepapers` GET均200且title/main非空。部署证据 `deploy-result.json` session24022 exit0（578 unit、179 E2E、9既有skip、4 formal/finalbuild），`deployment-check.json`确认18旧release、previous有效、CMS PID1401397未变、health ok。

补图 session69213 exit0；raw与`sol-footer-result.json`一致，/product 8172/8172、/en/services 8375/8375，outerY0、privacy bottom约819.9<844、footer static。Luna 亲读 `sol-footer-zh-full.png` 与 `sol-footer-en-full.png`，版权/隐私/备案及链接可读，无分区nav遮挡。首轮补图探针未到末尾的失败日志保留，不计入结果；以真实wheel修正补证为准。

Remaining risks：此处仅为staging线上QA，GitHub main在证据时仍79ba3c1、尚未push；验证限Chromium模拟390/438/1440，未覆盖真机/Safari/Firefox。六张主runner图为header/top裁剪，Footer完整视觉以两张390×844补图为准，桌面Footer仅有raw几何/状态证据。未写CMS、数据库、权限、表单或其他外部系统。详细报告：`output/release/xyy-20260929-08/luna/online-report.md`。
### XYY-20260930-01 — 英文询盘独立复测（anchor FAIL）

Task ID：`XYY-20260930-01`；Result：**FAIL（网站候选，待实现修正后复测）**。

Expected：英文 `/en/contact` 在桌面与移动端应提供邮箱必填、电话选填、国际电话说明、英文失败保留输入、中文对照正常；点击 International enquiries 的 `#contact-form` 入口后，表单首个字段应在固定导航下方可见并可操作。

Actual：精确 Email locator 已修正为 `getByRole('textbox', { name: 'Email', exact: true })`，默认 30 秒总预算下的首轮 session83751 exit1 仅因 mobile 长状态序列耗尽总测试预算；使用 `--timeout=60000`、每项 expect 仍 5 秒的 session24574 exit0，4/4 E2E 通过。三项定向 unit 共 29/29 通过。Sol 独立 CLI session67044 exit0 的 EN/ZH 1440/390 required、无横溢、mock POST、英文 email-only payload 与零 pageerror 均通过；亲读 `sol-en-1440.png`、`sol-en-390.png`、`sol-zh-1440.png`、`sol-zh-390.png` 发现英文锚点跳转后固定玻璃导航覆盖首行姓名标签/输入区域，桌面和移动均可见，影响入口可用性。

Reproduction：打开 `http://127.0.0.1:4331/en/contact`，点击 `International enquiries` 下的 `enquiry form below`，观察 `#contact-form` 顶部；在 1440×900 与 390×900 截图中，固定导航停留在表单首行之上并遮住姓名字段区域。

Evidence：`output/playwright/xyy-20260930-01/sol-final-e2e/.last-run.json`（session86133，4/4 E2E exit0）；`output/playwright/xyy-20260930-01/sol-en-1440.png`、`sol-en-390.png`、`sol-zh-1440.png`、`sol-zh-390.png`；本次 `npm_config_offline=true npx vitest run tests/unit/contact.test.ts tests/unit/contact-integration.test.ts tests/unit/contact-client-copy.test.ts` exit0，3 files/29 tests passed。Luna CLI 复跑受 wrapper npm 缓存限制：首次 exit1 为 EROFS，离线重试 exit1 为 ENOTCACHED；未将环境阻塞伪报为通过。

Likely affected area：英文联系页 `#contact-form` 锚点滚动偏移与固定 Header 的页面内入口衔接（ContactForm/页面布局的 scroll margin 规则）。Luna 未修改应用实现；测试文件当前 Email locator 为精确 role/name 选择器，未放宽断言。

Severity：Medium；英文访客从页面明确入口跳转后可能看不到或误触首个必填字段，降低询盘完成率。

真实接收端限制仍存在：`output/contact/xyy-20260930-01/receiver-schema-check.json` 显示 xiansuo schema 仍拒空 phone 与国际 phone；本次只能判定网站本地候选行为，不能宣称真实保存兼容。待 Terra 修正 anchor scroll offset 后，Luna 仅复测定向 anchor 截图与表单回归，再给出最终 PASS/FAIL。

### XYY-20260930-01 — 英文询盘独立复测（最终网站候选）

Task ID：`XYY-20260930-01`；Result：**PASS（网站本地候选）**。

Tests performed：Terra 仅为英文 `#contact-form` 增加 `scroll-mt-28`，中文路径保持原样；其 scoped format、lint、diff 检查通过。Luna 复核源码 diff，并复测测试文件的精确 role/name Email locator；为满足维护预算，新增单一 `emailField` helper，保持 locator 与断言不变。最终 E2E session22346 exit0，4/4 通过（Chromium/mobile，`--workers=1`，`--timeout=60000`，每项 expect 仍5秒）；三项定向 Vitest 仍为3 files/29 tests通过；scoped Prettier、ESLint、`check:maintainability` exit0，测试文件217行。Sol 最终 session86133 4/4 E2E、21/21 validation boundary 与 EN/ZH 页面 evidence 作为交叉回归证据。

Regression coverage：邮箱必填、电话选填、国际号码提示；英文缺失/非法邮箱与非国际电话本地拒绝、失败保留输入；成功/失败 mock 提交；英文 `locale` 标识不进入下游六字段 payload；中文电话规则回归；桌面/移动无横溢；anchor stable geometry。最终 anchor session48866 exit0：1440 formTop 113.75/nameTop 139.75/navBottom 70，390 formTop 112.75/nameTop 138.75/navBottom 64，`scrollMarginTop="112px"`，Email required、Phone optional、scrollWidth 等于 viewport。Luna 亲读 `sol-anchor-stable-1440.png` 与 `sol-anchor-stable-390.png`，姓名字段完整位于固定导航下方；表单标题被导航覆盖但不是锚点目标字段，未影响操作。

Remaining risks：`output/contact/xyy-20260930-01/receiver-schema-check.json` 仍显示实际 xiansuo 接收 schema 拒绝空 phone 与国际 phone；PASS 仅代表网站本地候选，不代表真实保存兼容。验证限本地 Astro dev server/Chromium 模拟视口，未覆盖真机、Safari/Firefox、部署或生产环境；未运行真实 CMS、数据库或外部写入。Luna 未修改应用实现、未提交、推送或部署。

### XYY-20260930-02 — 发布预检

Task ID：`XYY-20260930-02`；Result：**BLOCKED（接收端契约阻断）**。

Tests performed：审阅 `output/release/xyy-20260930-02/contract.md`、`release-files.json`、`baseline.json`、`candidate.patch` 及 Sol 生成的只读 `remote-preflight.json`。逐文件 `sha256sum` 核对候选 10/10 一致；当前 10 路径 diff SHA `c7cbe2e249bd9a2c83fc924e03b3b69872f1d960b46243ea55dad4f8c9fc29a6` 与 `candidate.patch` 一致。基线 1407 个既有 hash 全部匹配，保护路径无漂移。证据报告：[preflight-report.md](../output/release/xyy-20260930-02/luna/preflight-report.md)。

Regression/source coverage：Task01 最终网站候选的 4/4 E2E、3 files/29 unit、21/21 validation boundary、EN/ZH 1440/390 页面与 anchor evidence 沿用已记录结果；本预检未重新启动 CLI、未运行全量 verify，未改应用/测试。远端当前 website release 与 GitHub main 均为 `b50c4b3e85ecdf60e3cded498b5701d9d107e1c7`，healthz/CMS/contactStorage 为 ok；这只证明服务健康，不证明输入兼容。

Release blocker：精确映射证据 `receiver-nginx-map.json`、`receiver-runtime-map.json` 确认 `xs.tomatopia.top` → `127.0.0.1:3302` → PID `1401452` → `/opt/newxs-xiansuo/releases/records-20260905-01/server`，实际运行文件为 `dist/routes/website-leads.js`，SHA-256 `edd6c298befd35112d90ce6295b11dcfce55f28a56743f87b03c1ddd0ed1c4de`。针对该精确文件的有限纯 schema VM 检查 `receiver-runtime-schema-check.json` 显示 email-only 被拒“电话不能为空”、国际号码用例（`+44 20 7946 0958`）被拒“电话格式不正确”、国内手机号通过，且 `network_submissions=0`、`database_operations=0`。因此网站发布会使英文 email-only/国际电话询盘在真实接收端失败，不能按用户授权直接放行网站部署→GitHub同步。需要另行明确授权的准确缺口是 xs 接收服务契约、空 phone 与国际 phone 校验及对应去重策略；Luna 未修改另库、未部署 xs、未写真实线索/CMS/数据库。

### XYY-20260930-02 — 接收端 route 独立 QA

Task ID：`XYY-20260930-02`；Result：**PASS（接收端候选 scope）；BLOCKED（完整后端发布门禁）**。

Tests performed：在正确源 clone `/tmp/xyy-20260930-02-receiver/server` 独立执行 `npx tsx --test test/website-leads-integration.test.ts`，11/11 passed，exit 0；覆盖 email-only 的 phone 缺失/null/空串与 NULL 存储、国际号码分隔符规范化和查重、国内无 email、缺失联系方式、非法/超长输入零写入拒绝、email-only 不去重、phone 规范化去重、通知快照、audit 失败回滚及 Bearer/JWT 语义。route/test 输入 SHA-256 分别为 `34bd0e064294643b7e622f470d0327e1ef275875cb9147ee767dd18d1c16d4a0`、`59992e057b6e2bef5d1cf9cbae399e8cc75143848192e76a0eefe93fa50c9595`。`receiver-candidate-artifact-check.json` 显示68个编译产物中67个未变，唯一 route 编译文件 SHA 为 `839a05146002fe84858683c1ae16a722624a0278c44f1587ad10aaf29628dbf6`。

Regression coverage：同 clone 的完整 `npm test` 实际 exit 1，279 tests 中278 pass、1 fail；唯一失败为既有 `test/security-upload.test.ts` 隐藏敏感路径用例，合法 `/pages/dashboard/index` 预期 200、实际 404，非 website-leads 路由范围。该失败按证据保留，未伪报全套通过。网站离线部署工具 `python3 output/release/xyy-20260930-02/test-receiver-deploy.py` 独立4/4 passed，覆盖 check/no-write、漂移拒绝、失败回滚和成功完整性；未执行部署 wrapper。候选 website verify 日志显示 typecheck、lint、maintainability、assets、585 Vitest 与 Astro build 完成。

Remaining risks：接收端候选定向契约 PASS，但完整后端 suite 未全绿，发布门禁保持 BLOCKED，需 Sol 处理或裁决无关的 `security-upload` 回归后再放行。测试仅使用每项自建 `/tmp/xiansuo-independent-*` SQLite 库，未加载 `.env`、未启动真实 worker、未连接真实数据库、未发送真实 POST、未部署或 SSH；网站健康/构建通过也不替代真实接收端兼容性与发布验证。详细报告：`output/release/xyy-20260930-02/luna/receiver-qa-report.md`；候选 clone 的 `docs/03-测试验证/TEST_REPORT.md` 已追加本次报告。

### XYY-20260930-02 — 接收端同 ID 重测

Sol 确认首轮完整 suite 的唯一失败来自隔离 clone 缺少既有 `app/dist/build/h5` 测试前置：`server/src/index.ts` 在该目录不存在时按既有设计不注册 H5 fallback，故合法 `/pages/dashboard/index` 得到 404。Luna 按 `receiver-release-metadata.json` 对正确源 `/home/yj/xiansuo/.worktrees/newxs-wecom/app/dist/build/h5` 的48个文件逐一 SHA-256 核对，48/48 匹配后，仅复制该未跟踪且被忽略的 H5 产物到候选 clone；未修改业务源码、依赖或测试。

重测 `npm test > /tmp/xyy-20260930-02-receiver-npm-test-after-h5.log 2>&1` exit0：279 tests/279 pass/0 fail/0 skipped，约34.4s；接收端定向11/11保持通过。当前版本部署工具离线复测 `receiver-deploy-offline-tests-v2.log` exit0，7/7通过，覆盖 check/no-write、漂移拒绝、失败回滚、部分写入回滚、精确 commit/artifact 绑定与完整性保护。

Updated Result：**PASS（接收端候选与完整后端 suite）**。首轮278/1仅保留为缺少H5前置的环境证据；本次匹配 metadata 的前置补齐后全绿。剩余边界不变：未执行部署、SSH、真实数据库、真实 POST 或通知外发；网站 verify/health 不能替代线上接收端兼容性验证。

### XYY-20260930-02 — 线上发布后独立 QA

Task ID：`XYY-20260930-02`；Result：**PASS（网站线上 probe，session35485）**。

Tests performed：只读核对接收端部署 `DEPLOYED`/`LIVE_COMPATIBLE_IDENTITY`、PID `1401452→1781533`、候选 commit `b0c82c8…`、compiled route SHA `839a0514…` 与191/191 manifest；website release `20260930T113222Z-3543ecb` / SHA `3543ecb…`，`healthz=ok`、`cmsContent=ok`、`contactStorage=ok`；`.previous_target` 回退记录有效，对应旧目录保留，19个旧 release 均保留。website `verify:release` 完成585 unit、181 E2E、9 skip、4 formal 与 build。

独立复核最终 probe：第三轮仅将 `page.goto` navigation timeout 调至60秒，session35485 exit0；`live-ui-raw.txt` 无异常、stderr为空，EN/ZH×1440/390四张最终图均生成。脚本内 required 语义、无横溢、英文 anchor 姓名不被导航遮挡、错误邮箱零请求、email-only/国际号码 payload、pageerror 断言均执行完无异常；所有 contact 请求使用浏览器 route mock。Luna 亲读 `live-en-1440.png`、`live-en-390.png`、`live-zh-1440.png`、`live-zh-390.png`，四图表单可读且未见横向溢出，英文姓名字段位于固定导航下方。

Regression coverage：前两轮 `load`/30秒 `domcontentloaded` timeout 原始证据仍保留于 `live-ui-raw-first-timeout.txt`、`live-ui-raw-second-timeout.txt`，归类为 probe 导航等待环境限制；第三轮延长 timeout 后全组合完成。CLI wrapper 未透传 `console.log` JSON，Luna 不虚构具体 payload 数值，以 exit0、无异常、四图和脚本断言作为证据。`prepush-protection.json` 显示1402非日志基线路径零漂移、10发布冻结一致；GitHub 仍为旧 `b50c4b3`，本地线上候选为 `3543ecb`，二者状态未混淆。

Remaining risks：未发送真实表单 POST，未操作 CMS、数据库或接收端数据；验证限部署后的 Chromium 模拟视口与当前线上 staging，未覆盖真实设备、Safari/Firefox。详细报告：`output/release/xyy-20260930-02/luna/postdeploy-qa.md`。该 PASS 供 Nova 进行发布后 Review，不能单独代替 Sol 的 GitHub push 或最终发布授权。

### XYY-20261001-01 — 英文页脚服务与中文对齐

Task ID：`XYY-20261001-01`；Result：**PASS**。

Tests performed：Luna 使用独立 Playwright CLI session `xyy-footer-recovered` 对本地 Astro 预览 `http://127.0.0.1:4322` 执行 1440×900 与 390×900 浏览器验证。英文 `/en/contact` 与中文 `/contact` 的 Contact Footer 均按合同显示八项服务、顺序和 href 完整，四组几何均为 `scrollWidth === clientWidth`，Quick links 与 Contact/address 其他列仍存在；六张 fresh 截图已亲读并保存在 `output/playwright/xyy-20261001-01/luna/`。四个新增英文链接从 Contact Footer 实际点击后，在内层滚动初始化完成的 1000ms 稳定观测点均到达准确 `/en/services#04-cross-border`、`#05-south-china`、`#06-east-china`、`#07-live-commerce`，两宽共 8/8 对应区块可见。四个旧英文详情 GET 均为 200：`/en/apparel-fulfillment`、`/en/returns-inspection`、`/en/garment-care`、`/en/retail-distribution`。英文 `/en/services` 内层 Footer 两宽八项逐项滚动可达，外层 `window.scrollY=0`、无横溢、末尾分区导航隐藏。`src/i18n/routes.ts` SHA-256 为 `e1709daca4519d70c5741247df63d2ff5dda973f9ddfb8597953f3a81a99482a`，scoped `git diff --check` exit 0，diff 仅为合同静态数组。

Regression coverage：覆盖中英文 Contact Footer 1440/390 的八项数量、文案、顺序、href、可达性与横溢；英文 Services 内层 Footer 的两宽八项可达性及滚动容器状态；四个新 section anchor 的真实点击导航与区块可见性；四个既有英文详情 href 的 HTTP 200；其他 Footer 列存在性及实现范围/hash。工具 wrapper 直接执行位缺失且默认 npm cache 只读，改用已缓存 `playwright-cli` 二进制与 `/tmp/xyy-pw-cache`，未修改仓库或实现。

Remaining risks：本次仅验证本地 Astro 预览和 Chromium 模拟视口，未覆盖真机、Safari、Firefox、部署或生产；未运行无关全量 `npm run verify`，未执行 CMS、数据库、POST 或任何外部写入。详细 raw 与报告：`output/playwright/xyy-20261001-01/luna/qa-raw.json`、`qa-report.md`。

### XYY-20261001-02 — 英文页脚发布前独立预检

Task ID：`XYY-20261001-02`；Result：**PASS（发布前预检；未部署、未 push）**。

Tests performed：独立核对隔离候选 `/tmp/xyy-20261001-02-website`：HEAD `7f903056233627c6e9b2007667b827b76a26d963`，父提交精确为 `3543ecbcff6ac7629f6f168db61b2217ea2dd21e`，工作树干净，提交仅改 `src/i18n/routes.ts`（5 additions/1 deletion）。候选文件 SHA-256 `e1709daca4519d70c5741247df63d2ff5dda973f9ddfb8597953f3a81a99482a` 与 `release-files.json`、Task01 最终 Luna `qa-raw.json`、`candidate.patch` 一致。实际读取 `verify-result.json`/`verify.log`：Sol session74497 的 `npm run verify` exit 0，569 文件类型检查零诊断、737 文件维护预算、assets、90 files/585 tests、Astro build 均通过。`run-website-deploy.sh` `bash -n`、`sync-local.py`/`remote-snapshot.py` `py_compile` 均通过。静态审阅确认 wrapper 仅绑定 website staging `/var/www/xyy-web`、web `pm2 xyy-web`、候选单文件 hash 和 512MiB守卫；`scripts/deploy.sh` 保存 `.previous_target`、失败回退 current、`RELEASE_KEEP=100`，未包含接收服务发布或 CMS/数据库写入。`remote-before.json` 只读快照显示现行 `3543ecb`、20 个旧 release、previous 有效、CMS PID `1401397`、health 双依赖 ok。

Regression coverage：覆盖候选提交身份、单文件范围、冻结 hash、Task01 final QA 绑定、verify 当前实际结果、部署包装器语法/隔离守卫、website-only 目标、旧 release/previous 回退条件和部署前远端健康状态。没有重复 Task01 浏览器矩阵，也没有将本地行为证据写成线上结果。

Remaining risks：本结果仅为发布前预检 PASS；`npm run verify:release` 尚未在本报告中宣称通过，部署前仍须由包装器实际执行。尚未部署、push、同步本地 refs 或运行线上只读 QA，后续由 Sol 调度；Luna 未修改应用/测试代码，未操作 CMS、数据库、真实 POST 或外部系统。详细报告：`output/release/xyy-20261001-02/luna/preflight.md`。

### XYY-20261001-02 — 线上只读 QA runner 准备

Task ID：`XYY-20261001-02`；Result：**READY（未执行线上 QA）**。

已准备独立 Playwright session `xyy-footer-sol-1001` 的只读 runner：[postdeploy-qa.sh](../output/release/xyy-20261001-02/luna/postdeploy-qa.sh) 与 [postdeploy-qa.js](../output/release/xyy-20261001-02/luna/postdeploy-qa.js)。脚本固定目标 `https://wz.tomatopia.top`，首次公网页面导航使用 60 秒超时，核对 `/version` SHA `7f903056233627c6e9b2007667b827b76a26d963`、`/healthz`、EN/ZH Contact Footer 1440/390 八项精确顺序与语言、四个英文服务锚点实际点击可见，以及英文 `/en/services` 两宽内层 Footer 到末尾可达；计划生成四张 Contact 与两张 Services fresh 截图。页面路由会阻断非 GET/HEAD 请求，runner 不提交表单、不写 CMS/DB。

验证：`bash -n postdeploy-qa.sh`、`node --check postdeploy-qa.js`、`command -v npx`/`npx --version` 均 exit 0；未执行公网导航，未生成线上 PASS/FAIL。部署成功通知后由 Sol 执行 runner，并由 Luna 独立审阅 `postdeploy-qa-cli.log`、`postdeploy-qa-result.json` 与六张新截图；旧 Task01 截图不作为本轮线上视觉证据。

Remaining risks：当前仅证明 runner 可执行语法与检查范围，不能证明线上版本、行为、截图或部署成功。详细准备说明：[postdeploy-qa.md](../output/release/xyy-20261001-02/luna/postdeploy-qa.md)。

### XYY-20261001-02 — 线上只读 QA 最终结果

Task ID：`XYY-20261001-02`；Result：**PASS（线上网站 Footer scope）**。

部署成功后，Luna 使用独立 Playwright CLI session `xyy-footer-sol-1001` 执行最终 runner，命令 exit 0。`/version` HTTP 200 精确匹配 `7f903056233627c6e9b2007667b827b76a26d963`，release 为 `20261001T012818Z-7f90305`、staging；`/healthz` HTTP 200 且 `status=ok`、`cmsContent=ok`、`contactStorage=ok`。EN/ZH Contact 1440/390 均为八项精确顺序与 href、语言分别 `en`/`zh-Hans`、单 Footer、无横溢；英文四个服务锚点两宽共 8/8 实际点击后到达准确 `/en/services#...` 且目标区块可见。英文 `/en/services` 两宽均 outer `window.scrollY=0`、无横溢、八项可达、末尾 Footer 可见、内层导航隐藏。`unexpectedMethods=[]`、in-scope `errors=[]`。

Luna 逐张亲读六张 fresh 截图：`postdeploy-en-contact-1440.png`、`postdeploy-en-contact-390.png`、`postdeploy-zh-contact-1440.png`、`postdeploy-zh-contact-390.png`、`postdeploy-en-services-1440.png`、`postdeploy-en-services-390.png`；英文/中文内容与文件命名相符，八项服务清晰可见，未见横向溢出。最终 raw、CLI 日志、尝试 exit code 与截图均在 `output/release/xyy-20261001-02/luna/`；详细报告：[postdeploy-qa.md](../output/release/xyy-20261001-02/luna/postdeploy-qa.md)。

Remaining risks：最终 raw 记录 52 个 `/videos/*.mp4` 的 `net::ERR_ABORTED`，发生于 Services 导航/预加载切换；已与 Footer gate 分离并保留为媒体加载限制。首次 ENOTCACHED、语言期望修正和媒体 gate 失败均保留在 `postdeploy-attempts.json`，未伪报为应用失败。未发送真实 POST、未操作 CMS/DB；验证限部署后 Chromium 模拟视口与本次 Footer/锚点/内层滚动范围。

### XYY-20261001-04 — 官网咨询转化一期独立 QA（当前 FAIL）

Task ID: XYY-20261001-04

Result: FAIL

Expected: 16 个服务详情的中文/英文 CTA 均生成对应语言的 `/contact` 或 `/en/contact`，保留正确 `from`、`entry`、`#contact-form`；中文/英文 1440/390 hash 跳转后首字段避开固定 Header；事件 API 对非 JSON MIME 返回 415；报告读取器可接受完整来源白名单、拒绝不存在日期并按固定字段值去重。

Actual: Terra 第 2 轮前浏览器实测中文 hash 首字段被 Header 覆盖（Chromium 1440 fieldTop=25.5/headerBottom=70，390 fieldTop=26.078125/headerBottom=64）；`/en/returns-inspection`、`/en/garment-care`、`/en/retail-distribution` 在 Chromium/mobile 均至少有 bottom CTA 实际为 `/contact?from=...`，应为 `/en/contact?...`；`Content-Type: application/json-patch+json` 实际返回 204，应为 415。报告首轮另发现 `/wuliu-shuzihua` 被拒、`2026-02-30T00:00:00.000Z` 被接受、同 UUID 同字段不同 JSON 属性顺序被判冲突，Terra 已返工。

Reproduction: `env ... npx playwright test --config=output/conversion/xyy-20261001-04/luna/playwright.config.mjs tests/e2e/conversion-contact.spec.ts --project=chromium --project=mobile --workers=1`（首轮 28 passed/10 failed，见 `luna/conversion-e2e.txt`；Terra 第 2 轮新 build 后 31 passed/6 failed，见 `luna/post-terra-browser-retest-1.txt`）；`env ... npx vitest run tests/unit/conversion-events.test.ts`（18 tests，17 passed/1 failed，见 `luna/events-boundary-final-before-fix.txt`）。报告边界复测 `npx vitest run tests/unit/conversion-report.test.ts tests/unit/conversion-source.test.ts` 为 10/10 PASS，`report-wuliu` CLI exit 0。

Evidence: [conversion-e2e.txt](../output/conversion/xyy-20261001-04/luna/conversion-e2e.txt)、[post-terra-browser-retest-1.txt](../output/conversion/xyy-20261001-04/luna/post-terra-browser-retest-1.txt)、[events-boundary-final-before-fix.txt](../output/conversion/xyy-20261001-04/luna/events-boundary-final-before-fix.txt)、[report-edge-vitest-retest.txt](../output/conversion/xyy-20261001-04/luna/report-edge-vitest-retest.txt)、[contact-hash-chromium.png](../output/conversion/xyy-20261001-04/luna/contact-hash-chromium.png)、[contact-hash-mobile.png](../output/conversion/xyy-20261001-04/luna/contact-hash-mobile.png)。截图已亲读；中文 hash 在 Terra 第 2 轮新 build 后 1440/390 2/2 PASS。

Likely affected area: `src/components/service/redesign/RepairFaq.astro`、`src/components/service/redesign/ReturnInspectionFaq.astro`、`src/components/service/redesign/B2BCta.astro` 未将英文 CTA 的 locale/actionHref 传入 `ConversionCTA`；`src/pages/api/conversion-events.ts` 的 Content-Type 判断使用过宽的 `includes('application/json')`。

Severity: MEDIUM（英文服务入口语言/来源契约和统计端点 MIME 边界不符合验收；不涉及真实线索写入）。

Tests performed: Terra 报告修复后报告/16源单测 10/10 PASS；来源/事件/报告初始三件套此前 14/14 PASS；新增 API 边界其余 17/18 PASS；新建 E2E 覆盖 16 路由、SSR/非法/重复参数、语言切换、无 JS、事件 click/start/success、失败/蜜罐、1440/390。Terra 第 2 轮新 build 后中文 hash 2/2、英文 digital 4/4、失败/蜜罐 2/2、中文 CTA/East/Repair/Footwear 回归 24/24 PASS。

Remaining risks: 英文 redesign 三页 CTA 与 API MIME 修复未完成，故不得宣称本 Task PASS；完整 `npm run verify` 在首轮因新增报告 FAIL 退出 1，报告修复后尚未等剩余实现修复完成重跑；未部署、未写 CMS/数据库、未提交真实表单。Playwright wrapper 因 npm cache EROFS 无法启动，浏览器验证改用已安装 Chromium 与独立本地配置完成。

### XYY-20261001-04 — 官网咨询转化一期独立 QA（最终）

Task ID：`XYY-20261001-04`；Result：**PASS（本地候选）**。

Tests performed：最终源码冻结后，显式本地测试环境下 `npm run verify` exit 0：587 个 Astro 文件 0 errors/0 warnings/0 hints，lint、maintainability、assets、93 个 Vitest 文件 613/613、Astro build 全部通过，证据为 [verify-final-current.txt](../output/conversion/xyy-20261001-04/luna/verify-final-current.txt)。报告来源、日期精确回环、属性顺序去重、API 开关/Origin/2KiB 流式限制/限流/MIME 等定向证据保持 PASS；统计开启下 8/8 事件 E2E（Chromium/mobile）覆盖英文真实成功、locale/service、400/429/503/空/null/网络失败保留输入、统计 abort/503 隔离、pending 改选取提交值、清空服务为 `null`，证据为 [conversion-events-final-dist-retest2.txt](../output/conversion/xyy-20261001-04/luna/conversion-events-final-dist-retest2.txt)。16 来源联系回归、SSR 预选、语言切换、无 JS、中文固定 Header 几何、失败/蜜罐与英文询盘回归共 46/46 通过，证据为 [english-contact-final-e2e.txt](../output/conversion/xyy-20261001-04/luna/english-contact-final-e2e.txt)。

Regression coverage：5 个受控真实点击入口均通过并保留准确 `from`/`entry`/hash/SSR service/event：中文仓配 hero、bottom，中文质检 hero，英文 smart-shipping body（`locale=en`、`logistics-cloud`），中文数字化 floating；证据为 [cta-entry-probe-final.txt](../output/conversion/xyy-20261001-04/luna/cta-entry-probe-final.txt)。16 路来源映射含 `/wuliu-shuzihua`，英文 redesign CTA 语言与来源、报告样例 HTML/CSV、受影响 CTA/英文数字化回归均已复核。最终中英文 1440/390 fresh 截图已亲读：[form-zh-1440.png](../output/conversion/xyy-20261001-04/luna/form-zh-1440.png)、[form-zh-390.png](../output/conversion/xyy-20261001-04/luna/form-zh-390.png)、[form-en-1440.png](../output/conversion/xyy-20261001-04/luna/form-en-1440.png)、[form-en-390.png](../output/conversion/xyy-20261001-04/luna/form-en-390.png)；标题与姓名字段均位于固定 Header 下方，几何/无错误/无横溢证据为 [form-fresh-probe-final.txt](../output/conversion/xyy-20261001-04/luna/form-fresh-probe-final.txt)。统计默认关闭浏览器实证为 [analytics-off-probe-final.txt](../output/conversion/xyy-20261001-04/luna/analytics-off-probe-final.txt)：`eventRequests=0`、contact mock 1 次并显示成功。

Remaining risks：验证限本地 Astro server、Chromium 模拟 1440/390 视口与 `/api/contact` 浏览器 mock；未覆盖真机或其他浏览器，未部署、未写真实 CMS/数据库/线索，也未执行真实外部提交。Luna 仅修改测试、fixture、证据脚本和本日志，未修改应用实现、未提交、推送或部署。最终受控预览仍运行于 task session `2584`（4474，统计开启）与 `20569`（4475，默认关闭）；未触碰既有 4321 服务。

### XYY-20261001-04 — r5 恢复独立 QA

Task ID：`XYY-20261001-04`；Result：**PASS（本地 r5 冻结候选）**。本轮承担独立 Luna QA 职责，实际继承主会话模型，未宣称已切换为 `gpt-5.6-luna`；未参与业务实现，未再委派。

Tests performed：仅将 `service-redesign-south.spec.ts` 原底部入口 focus 定位收窄为唯一 `data-conversion-entry="bottom"`，不削弱精确来源/语言/服务断言；`conversion-hero.spec.ts` 在字体就绪、标题/说明有效透明度为 1 且动画结束后拍图，原动画中截图保留。最终源码 `npm run verify` session80797 实际 exit0：588 类型文件零诊断、lint、757 文件维护预算、assets、93 文件616/616单测和 build 全部通过，包含报告新增多输入/零数据/缺文件三项。使用新 dist 的 root session35618（4484）独立运行 conversion-contact、conversion-hero、crossborder、south 四组 E2E，session72704 实际 exit0，62/62 PASS。

Regression coverage：16 路由在1440/390逐个要求 hero/bottom/floating各一个，并精确核对 href/from/entry/locale/service；两页各两视口4次hero实点、4次无JS实点均正确携带来源/hash并预选cloud-warehouse。四张 `hero-{crossborder,south}-{chromium,mobile}-r5-stable.png` 已逐张亲读：标题说明完全显现，首屏正文和按钮无裁切、横溢或Header遮挡，4个hero用例pageerror为空。恢复前Sol的60 PASS/2 FAIL源于新增同名hero导致旧bottom测试strict violation，原始失败证据保留，当前两视口均通过。34/34 r5实现hash无漂移，原r4的32/32实现未变；明确复用r4事件8/8、英文询盘/来源46/46、默认off与中英文表单四视口证据，本轮未称重新运行。缺文件真实CLI的exit1/no output另以Sol本轮证据交叉核对。

Remaining risks：仅本地Chromium模拟视口、offline CMS与mock联系端点；未覆盖真机/其他浏览器/真实接收保存，未读写真实.env、CMS、数据库或线索，未提交、push、部署或启用生产统计。Luna此次只改两处测试、专用配置/证据和追加本日志；预览4484由Sol维护，旧4474/4475及4321未触碰。正式报告与实际命令/退出码：[r5-recovery-qa.md](../output/conversion/xyy-20261001-04/luna/r5-recovery-qa.md)；当前PASS供Nova复审，不代替Sol最终验收。

### XYY-20261001-06 — 移除报告与事件统计独立 QA

Task ID：`XYY-20261001-06`；Result：**PASS（本地 r2 冻结候选）**。本轮承担独立Luna QA，实际继承主会话模型，未宣称切换为`gpt-5.6-luna`，未参与实现或再委派；仅写本任务证据/探针和追加本日志，未修改业务或源测试。

Tests performed：首轮verify session51746因south测试226行超过220预算exit1，按Sol→Terra同ID返工后以r2冻结重新执行。最终`npm run verify` session90360实际exit0：577类型零诊断、lint、746文件维护预算、assets、91文件589/589单测及build通过。新dist预览4486/session4736上，四份变动E2E加英文询盘回归session14202实际exit0，66/66通过、0跳过/0flaky。旧flag=true下独立补充探针session70594实际exit0：旧事件端点GET/POST均404，16路无JS SSR、10组非法/重复来源、双语body无JS实点及双向语言切换、四组桌面移动改选/校验/mock成功均通过；自动事件请求0、统计日志0、pageerror0，探针6次联系POST全部mock。

Regression coverage：16服务页hero/bottom/floating唯一且href精确；两页hero/无JS与中英文成功、失败、字段校验保持。8张联系/隐私图和4张hero稳定图已逐张亲读，无横溢，联系标题与首字段清楚位于Header下方；隐私五段旧内容、同意文案和权利邮箱保留，仅删除统计段并恢复原日期。35项r2冻结含21删除全部一致，1396保护路径无漂移、6个原contact API/lib文件hash不变、无所有权外新增。Terra/Luna/Nova旧日志前缀保持；Sol仅新增本任务状态行与末尾日志，历史保持。所有通过结果来自本次执行，没有复用Task04历史PASS。

Remaining risks：中文privacy橙色眉题局部与导航重叠、移动隐私正文经过右下悬浮按钮，首屏结构/CSS与基线一致，记录为既有表现且未扩大修复。补充探针初次因JS动画区body未先滚入而超时，已保留exit1，只补真实滚动后复测通过；静态探针的原标题与Sol状态行判定问题亦保留修正记录。仅本地Chromium模拟视口、offline CMS与mock接收，未查看或改写真实.env、未写CMS/数据库/真实线索，未提交/push/部署。4486/session4736继续供Nova审阅，由Sol最终关闭；4322/4321/4474/4475未操作。正式报告：[qa.md](../output/removal/xyy-20261001-06/luna/qa.md)，结果供Nova复审，不替代Sol最终验收。

### XYY-20261002-02 — 咨询预选发布独立预检

Task ID：`XYY-20261002-02`；Result：**PASS（候选预检；未部署）**。

Tests performed：独立核对最终候选 `/tmp/xyy-20261002-02-website`，相对 `7f903056233627c6e9b2007667b827b76a26d963` 的 HEAD 为 `b8021b149209f9e391e58f258e9c512fb7bea6aa`，候选 clean，`git diff BASE..HEAD` 恰好 33 项、634 additions/64 deletions，路径集合与冻结 `release-files.json` 一致且逐项 SHA-256 全匹配，证据为 [scope-r2.json](../output/release/xyy-20261002-02/luna/scope-r2.json)。本轮 `npm run format:check` exit 0；修正后的 `npm run verify` exit 0：574 Astro type files 零诊断、lint、742-file maintainability、assets、91 Vitest files/589 tests、Astro build 全部通过，证据为 [verify-r2.log](../output/release/xyy-20261002-02/luna/verify-r2.log)。修正后的 `conversion-contact.spec.ts` 与 `conversion-hero.spec.ts` 在 Chromium desktop/mobile 共 46/46 PASS，证据为 [e2e-conversion-r2.log](../output/release/xyy-20261002-02/luna/e2e-conversion-r2.log)。

首轮 44 PASS/2 FAIL 已保留；两项失败均为 `conversion-hero.spec.ts:54` 将 mobile `scrollWidth` 固定与390比较，而 Pixel 7 项目实际 viewport 为412，实际 `scrollWidth=412`，归类为测试 harness 与视口契约不一致，不是业务溢出。首轮 44/2 原始日志保留；截图/trace 已被复测覆盖，不再作为可用证据。Terra 仅将断言改为 `scrollWidth <= window.innerWidth`，业务源码未改；r2 46/46 通过。独立 Playwright CLI 390×844/1440×900 探针确认两视口 `scrollWidth == viewport`、中英文 SSR 预选/改选后 reload/双向语言切换、非法与重复来源空预选、mock 提交和统计请求隔离；英文 email-only mock 最终提交成功，pageerror=0、统计请求=0。初次英文探针缺 email、非法电话的输入型失败均保留并已修正，不计为应用失败。详细报告与原始证据：[preflight.md](../output/release/xyy-20261002-02/luna/preflight.md)。

Regression coverage：16 个中英文服务路由的 hero/bottom/floating 来源链接、SSR 预选、无 JS、语言切换、非法/重复参数、客户改选、固定 Header 联系表单、成功/失败/honeypot mock 提交和无统计请求均有本轮证据；桌面1440与移动390均有独立截图/结构化结果。Luna 未修改业务实现或仓库测试（Terra 的 harness 修正由 Sol 重新冻结后复测），未写 CMS/数据库/真实线索，未部署、push 或操作主工作区；4520 预览已停止。

Remaining risks：验证限离线 Directus fallback、Chromium 模拟视口和 mock `/api/contact`；未覆盖真机、Safari/Firefox、真实接收端和 staging 上线后行为。部署脚本后续仍需执行完整 `verify:release` 与线上只读 QA；本结果不代表已部署、已推送或线上 PASS。收尾清理见 [preview-stop.md](../output/release/xyy-20261002-02/luna/preview-stop.md)：本轮命名会话 registry 已为空，未执行 `close-all` 或删除其他任务产物。

### XYY-20261002-02 — staging 线上独立 QA

Task ID：`XYY-20261002-02`；Result：**PASS（staging 线上关键 QA）**。

线上 `https://wz.tomatopia.top` 实际身份为 SHA `b8021b149209f9e391e58f258e9c512fb7bea6aa`、release `20261002T001733Z-b8021b1`。Chromium 真实浏览器覆盖 `390×844` 与 `1440×900`：跨境 hero 实点、中文/英文来源 SSR 预选、客户实际改选（即时读取 `other` / `logistics-cloud`）、语言切换来源保留、双语 mock 成功提交均通过。两视口各2次 `/api/contact` POST 均在点击前安装的 route mock 中拦截，mock=4、实际外部写入=0；统计请求=0、pageerror=0、横溢=0。结构化结果见 [postdeploy-result.json](../output/release/xyy-20261002-02/luna/postdeploy-result.json)，原始日志为 [post-390-result.log](../output/release/xyy-20261002-02/luna/post-390-result.log) 与 [post-1440-result.log](../output/release/xyy-20261002-02/luna/post-1440-result.log)。

Regression coverage：HTTP GET-only SSR 抽样覆盖16个中英文来源，16/16 HTTP 200且选中服务正确；旧 `/api/conversion-events` 仅GET返回404，证据为 [nojs-http-sample.json](../output/release/xyy-20261002-02/luna/nojs-http-sample.json)。四张中英文成功截图已亲读：[post-390-en-success.png](../output/release/xyy-20261002-02/luna/post-390-en-success.png)、[post-390-zh-success.png](../output/release/xyy-20261002-02/luna/post-390-zh-success.png)、[post-1440-en-success.png](../output/release/xyy-20261002-02/luna/post-1440-en-success.png)、[post-1440-zh-success.png](../output/release/xyy-20261002-02/luna/post-1440-zh-success.png)。桌面表单与绿色成功反馈完整可读，固定 Header 未覆盖当前表单；移动截图中固定 Header 覆盖已滚离区域的上缘内容，但 textarea、同意框、提交按钮和成功反馈清楚可见，未扩大为全页无遮挡结论。未发送真实表单、未写 CMS/数据库；仅执行线上 GET 与浏览器 mock POST。

Remaining risks：验证限 staging、Chromium 模拟视口和 mock 接收端；未覆盖真机、Safari/Firefox、真实线索接收。线上 QA 已完成，未部署、未push、未操作 CMS/DB。正式报告：[postdeploy.md](../output/release/xyy-20261002-02/luna/postdeploy.md)。会话收尾见 [postdeploy-preview-stop.log](../output/release/xyy-20261002-02/luna/postdeploy-preview-stop.log)，`playwright-cli list` 返回 `(no browsers)`。

### XYY-20261002-02 — GitHub API push plan 独立只读核验

Task ID：`XYY-20261002-02`；Result：**PASS（冻结 plan / 候选 Git 对象；helper 未测试）**。

独立读取 `api-push-plan.json`，SHA-256 为 `e480ccf115fcbc9e76d00c7884c54c4a5ff77be4d816f9930666ba208ea9650e`，与冻结值一致。仅读取隔离候选 `/tmp/xyy-20261002-02-website`：两笔候选 commit `bdc9f55a86b1bd8d15429ab7a4cdcfa7db674ecc`、`b8021b149209f9e391e58f258e9c512fb7bea6aa` 的 parent/tree、author/committer（含 `+0800`）、完整 message 尾部换行均精确匹配；第一笔 33、第二笔 1 个 path 的 mode/type/blob bytes 逐项匹配。由 `base_tree + overlays` 重建 tree 分别得到 `a3b0b808574d58b9f78050c545197582d5f1e6cf`、`b553fc3b45d0aae2591f8d7db02fe757c1e6d873`，并重算 raw Git commit SHA 回到原 SHA。候选 clean，GitHub API GET/POST/PATCH 均为 0，未修改 refs 或 helper。详见 [api-push-plan.md](../output/release/xyy-20261002-02/luna/api-push-plan.md)、[api-push-plan-check.json](../output/release/xyy-20261002-02/luna/api-push-plan-check.json)。

首轮验证器失败证据 [api-push-plan-check-initial-fail.json](../output/release/xyy-20261002-02/luna/api-push-plan-check-initial-fail.json) 的唯一原因是验证器将 Git tree 原始目录 mode 写为 `040000`，实际 object mode 为 `40000`；修正验证器后复测 PASS，plan/候选对象未变。Remaining risks：Terra helper 的默认 dry-run、nested `object.sha`、tree/commit/ref drift、API failure 的零 PATCH 保障尚未测试；本轮未执行真实 POST/PATCH、push 或 ref 写入。

### XYY-20261002-02 — GitHub API helper 独立 QA

Task ID：`XYY-20261002-02`；Result：**PASS（helper；未执行真实写入）**。

独立核对 Terra helper SHA-256：`e1dd6996e6806e2c1f032a8cf09a49223c02ba8742b79dd3cee7f221b7a15454`。默认真实 dry-run exit 0，状态 `ready_for_apply`；本地 preflight、GitHub main base GET、staging `/version` candidate GET 通过，transmission `not_run`，GitHub runner 仅 GET，无 POST/PATCH。独立 fake runner 共 32 场景：成功 apply 1、already-synced 1、预 PATCH 失败 23、PATCH 响应错误 6、最终 GET drift 1；真实 GitHub 写入 0。

成功 apply 的 fake 顺序为 `GET → tree POST → commit POST → tree POST → commit POST → ref GET → PATCH → final GET`；两 tree/两 commit payload 与冻结 plan 一致，唯一 PATCH 为 `force:false`，并核对响应 `ref` 与 `object.sha`。预 PATCH 的 SHA mismatch、初始/PATCH前 ref 或 live drift、API nonzero/invalid JSON/missing SHA 均 0 PATCH；PATCH response 错误和最终 GET drift 均可见失败。证据：[api-push-helper-qa.md](../output/release/xyy-20261002-02/luna/api-push-helper-qa.md)、[api-push-helper-qa.json](../output/release/xyy-20261002-02/luna/api-push-helper-qa.json)、[api-push-dryrun-network.json](../output/release/xyy-20261002-02/luna/api-push-dryrun-network.json)。初次 QA harness 失败与修正见 [api-push-helper-qa-attempts.json](../output/release/xyy-20261002-02/luna/api-push-helper-qa-attempts.json)。

Remaining risks：本轮未执行 `--apply` 真实 GitHub POST/PATCH、push 或 ref 写入；成功 apply 为 fake runner 模拟，等待 Nova Review 与 Sol 授权执行真实发布。

### XYY-20261002-02 — CI font native dependency diagnosis

Task ID：`XYY-20261002-02`；Result：**DIAGNOSIS（CI FAIL 归属为依赖安装/原生库加载环境）**。

独立读取 run `36950908943` 的 `github-ci-latest.json`、完整/失败日志、`scripts/prepare-fonts.mjs`、`scripts/lib/font-generator.mjs`、package/lock 条目和 `node_modules/cn-font-split` 元数据。CI 在 574 文件 typecheck、lint、742 文件 maintainability 后，于 `precheck:assets → prepare:fonts` 进入 `cn-font-split@7.4.3` Node FFI，指定 native library 路径无法由 `dlopen` 加载并报 `ERR_FFI`；Node `v22.23.3`。这只证明原生库缺失或不可加载；日志没有 `ls`/`stat`/`ldd`，不能断言文件本身不存在，也不能排除间接共享库缺失。`npm ci` 本身 exit 0（782 packages added / 783 audited）。

安装包的 postinstall 是 `node ./dist/cli.js i default || node -v`；其 `init.sh` 通过 `ungh.cc` 查询 latest，再从 GitHub release 下载平台 `.so`。fallback 可能掩盖安装失败，但现有 CI 日志不能证明该机制实际发生，也不能证明具体下载或链接原因。本机只读 GitHub 元数据显示 7.6.8 x86_64 Linux asset 存在；本机 ungh 请求状态与证据见 `ci-font-upstream-readonly.json`，不回推 CI 根因。`prepare-fonts.mjs`/font generator 仅在此处调用 `fontSplit`，没有应用代码缺陷证据。结论收紧为 runner 依赖 provisioning 或原生库加载环境阻塞，非网站业务实现。

同 SHA 原生 rerun 仅在先确认 runner 能获取并验证 native asset 后有诊断价值；盲目重跑低价值。最小处理建议是让安装期 native library 无法 provision/load 时显式失败，并将下载改为确定性、可验证的受控 artifact。未修改代码、依赖、workflow，未下载外部依赖，未重跑 CI。详见 [ci-font-diagnosis.md](../output/release/xyy-20261002-02/luna/ci-font-diagnosis.md) 与 [ci-font-diagnosis.json](../output/release/xyy-20261002-02/luna/ci-font-diagnosis.json)。

### XYY-20261002-03 — CI 字体原生库加载独立 QA

Task ID：`XYY-20261002-03`；Result：**PASS（隔离候选；未触发 CI）**。

独立候选 `/tmp/xyy-20261002-02-website` 相对 `b8021b149209f9e391e58f258e9c512fb7bea6aa` 仅保留 `.github/workflows/ci.yml` 脏改；workflow SHA-256 为 `7c493d9b750e7ddd714e59d297ba00ec6ad2f0e90e1a7f88de81ada5413b2d25`。从实际 YAML 抽取的 run block 在隔离 runtime 中执行：真实 HTTPS 下载官方 7.6.8 native asset，尺寸 `6145760`、SHA-256 `db4690e3b9c4b04f6dfa5965792585c389914038f6a4c90fbe73baaf16bbf19c`，安装后 `ldd` 无 `not found`，具体 Node FFI loader 通过，step exit 0。缺失 native 文件的隔离副本随后以全新输出目录生成 `puhuiti-400` 与 `puhuiti-900` 两档 woff2/result.css/manifest。

六类受控失败均按预期非零退出：下载失败、尺寸错误、同尺寸错误 hash、`ldd` 非零、`ldd` 含 `not found`、native loader 非零；前 3 类保留原目标且不安装未校验资产，临时下载/staged 文件均清理。候选本次 `npm run verify` 链路完成，日志含 91 个 Vitest 文件、589 tests passed、assets 通过及 Astro build `Complete!`；会话已结束且无失败输出。原始证据与结构化结果：[preflight.md](../output/ci/xyy-20261002-03/luna/preflight.md)、[preflight-result.json](../output/ci/xyy-20261002-03/luna/preflight-result.json)、[native-failure-matrix.json](../output/ci/xyy-20261002-03/luna/native-failure-matrix.json)、[verify.log](../output/ci/xyy-20261002-03/luna/verify.log)。

Remaining risks：本轮是隔离本机 runner 证据，真实 GitHub CI 仍需 Sol 在 Nova APPROVED 后执行；`ldd`/loader 失败测试在资产已通过尺寸/hash 后才安装，因此只证明失败可见，不证明回滚。Luna 未修改业务、仓库测试、依赖或 workflow，未触发 CI、部署、CMS/DB 或真实询盘。

### XYY-20261002-04 — CI 修复发布前独立预检

Task ID：`XYY-20261002-04`；Result：**PASS（staging preflight；未部署/未 push）**。

独立核对 clean 候选 `/tmp/xyy-20261002-02-website` 为 `ab82cbdafb3923e4d62041b801d700f360ccdf20`，相对线上 `b8021b149209f9e391e58f258e9c512fb7bea6aa` 仅 `.github/workflows/ci.yml` 一项；冻结 workflow SHA-256 为 `7c493d9b750e7ddd714e59d297ba00ec6ad2f0e90e1a7f88de81ada5413b2d25`。GitHub main 与真实 CI run `36953940190` 均为该 SHA，CI `completed/success`。Terra 三个 helper hash 分别为 `dbb82a8f…06171`、`bb847839…e7287`、`c7e415e0…0f5c`，与 `helpers-freeze.json` 一致；静态核对确认固定候选/服务器、单 workflow freeze、512MiB 三处空间守卫、4510/4511 端口守卫、`RELEASE_KEEP=100`、verify-before-write、旧 release 保留和 rollback 路径。

直接在候选执行 `DEPLOY_ENVIRONMENT=staging DEPLOY_PREFLIGHT_ONLY=true bash scripts/deploy.sh`，exit 0；仅生成 release manifest 并输出 `deployment preflight ok`，按脚本分支顺序未进入 SSH、rsync 或 `npm run verify:release`。预检时 `/`、`/tmp`、候选均剩余 `662638592` bytes，远端只读快照有22个旧 release、previous target 和 CMS/contact 健康状态。证据：[preflight.md](../output/release/xyy-20261002-04/luna/preflight.md)、[preflight-result.json](../output/release/xyy-20261002-04/luna/preflight-result.json)、[direct-deploy-preflight.log](../output/release/xyy-20261002-04/luna/direct-deploy-preflight.log)。

初次静态证据检查器因误判 Python `compile()` 返回值而保留 FAIL，修正后复测 PASS；候选和 helper 未变。另有一次固定发布 helper 的同模式 preflight 调用，亦在 deploy preflight 分支提前退出、无外部写入；随后已按合同改用候选 `scripts/deploy.sh` 直接执行作为主证据。未触发 CI、未部署、未 push、未访问 CMS/DB、未提交真实询盘；完整 `verify:release` 和发布由 Sol 经 Nova Review 后执行。

### XYY-20261002-04 — 发布 E2E 失败诊断 r1

Task ID：`XYY-20261002-04`；Result：**FAIL（release gate；导航资源错误，非页面断言结果）**。

发布 wrapper 尚未进入 SSH/部署时，两个 Chromium 用例在 `page.goto(waitUntil=load)` 失败：`tests/e2e/responsive.spec.ts:19` 在 768×900 导航 `/cases` 报 `net::ERR_INSUFFICIENT_RESOURCES`，未到 scrollWidth 断言；`tests/e2e/english-acceptance-routes.spec.ts:189` 在 `/en/contact` 报同错，未到 H1 range 几何断言。responsive trace 显示同一 `/cases` 曾返回 HTTP 200，随后失败 document 为 status `-1`/`x-unknown`；两个失败都发生在同一长 suite 多次导航之后。deploy.log 未见应用异常、ENOSPC 或 route-level HTTP 错误。

分类为**疑似 Chromium/Playwright 或本地 4510 服务累积资源状态阻塞，具体耗尽资源未证实**；不能据此判为页面 overflow/H1 实现缺陷，也不能仅凭错误码断言 FD、内存、共享内存或磁盘原因。原始两个失败目录已复制至 [release-failure-r1](../output/release/xyy-20261002-04/luna/release-failure-r1/)，保留 error-context、trace.zip 与 hashes；结构化诊断：[failure-diagnosis-r1.json](../output/release/xyy-20261002-04/luna/failure-diagnosis-r1.json)，报告：[failure-diagnosis-r1.md](../output/release/xyy-20261002-04/luna/failure-diagnosis-r1.md)。

最小后续验证：当前 suite 结束并释放 4510/4511 后，各失败用例分别以 fresh Playwright 进程、fresh permitted port、单 worker、retries=0 隔离运行并保留请求/响应及服务日志；可附 `DEBUG=pw:browser` 与一次性子进程 `/proc/<pid>/limits`/FD 采样验证 EMFILE/ENFILE/resource-pipe 假设，但不预先断言根因。隔离通过支持累积 runner/server 状态，复现才进入路由资源诊断。R1 当时未重跑、未改测试/源码/helper、未启动额外服务或部署。

### XYY-20261002-04 — 发布 E2E 四用例隔离资源复测

Task ID：`XYY-20261002-04`；Result：**PASS（四项定向隔离复测；R1 发布门禁仍 FAIL）**。

R1 wrapper 已 exit1（223 passed/4 failed/9 skip），未进入 SSH/部署；四个失败目录均已复制并保留 `error-context.md`/`trace.zip`。在 4510/4511 释放后，按 Sol 授权仅运行四个精准 selector，各自 fresh Playwright 进程与端口、`workers=1`、`retries=0`、原断言/超时不变：`responsive.spec.ts:19`（4520）、`english-acceptance-routes.spec.ts:189`（4521）、`language-suggestion-behavior.spec.ts:47`（4522）、`service-pages.spec.ts:4`（4523），全部 exit 0 且各 `1 passed`。

每 0.5 秒循环采集 runner 后代的 `/proc/<pid>/comm`、FD 数和 `Max open files`；有效采样中观察到上限均为 `65536/65536`，四例 FD 峰值分别为 92、91、64、64；进程退出瞬间不可读项明确记录为 `null`。四份 `DEBUG=pw:browser` 日志没有 `ERR_INSUFFICIENT_RESOURCES`、EMFILE、ENFILE、ENOMEM 或 ENOSPC；仅见既有 headless VAAPI/只读 PulseAudio 警告。该结果支持长 suite 累积 runner/server 状态的工作分类，但未证明 R1 精确耗尽资源，也不把完整 release gate 改为 PASS。

原始证据与结构化结果：[isolated-resource-retest-result.json](../output/release/xyy-20261002-04/luna/isolated-resource-retest-result.json)、[isolated-resource-retest](../output/release/xyy-20261002-04/luna/isolated-resource-retest/)、[failure-diagnosis-r1.md](../output/release/xyy-20261002-04/luna/failure-diagnosis-r1.md)、[failure-diagnosis-r1.json](../output/release/xyy-20261002-04/luna/failure-diagnosis-r1.json)。未修改业务、仓库测试、helper 或环境配置，未部署、未 push、未触发 CI。

### XYY-20261002-04 — 上线后只读 QA 预备

Task ID：`XYY-20261002-04`；Result：**READY（未执行）**。

仅读取既有 XYY-20261002-02 线上 CLI 流程与本任务合同，准备 [postdeploy-readonly-qa.mjs](../output/release/xyy-20261002-04/luna/postdeploy-readonly-qa.mjs) 和 [postdeploy-readonly-qa.md](../output/release/xyy-20261002-04/luna/postdeploy-readonly-qa.md)。脚本待 Sol 明确放行后才执行：先 GET `/version`、`/healthz` 核对候选 SHA `ab82cbdafb3923e4d62041b801d700f360ccdf20`、releaseId、CMS/contactStorage 双依赖，再以 Chromium 390×844/1440×900检查跨境 hero 联系入口、中文/英文 SSR 服务预选、客户实际改选、语言切换来源保留、横溢与 pageerror，并输出四张联系页截图。脚本不点击提交、不发送真实表单、不写 CMS/DB/统计；任何 `/api/contact` 请求均记录。

本阶段未启动浏览器、测试、服务或远端请求；仅 `node --check` 与 `git diff --check` 通过，未改变业务/测试/helper。

### XYY-20261002-04 — staging 上线后独立只读 QA

Task ID：`XYY-20261002-04`；Result：**PASS（线上只读 QA）**。

Sol 已确认部署 R2 exit0；线上 GET `/version` 严格匹配 `gitSha=ab82cbdafb3923e4d62041b801d700f360ccdf20`、`environment=staging`、`releaseId=20261002T032358Z-ab82cbd`；`/healthz` HTTP 200，顶层 `status=ok` 且嵌套 `dependencies.cmsContent=ok`、`dependencies.contactStorage=ok`。Chromium `390×844` 与 `1440×900` 均通过跨境 hero 联系入口、鞋服来源中英文 SSR `cloud-warehouse` 预选、客户实际改选 `other`、语言切换来源保留、服务页/联系页无横溢、pageErrors=0、统计请求=0、联系请求=0。context 全局阻止并记录非 GET/HEAD 请求，本轮 blocked=0，`actualContactWrites=0` 来自观察记录；未点击提交。

四张中英文双宽联系页截图已亲读：桌面字段、下拉框、同意框和提交按钮可读；移动当前视口字段和下拉框可读，390 中文截图底部同意条款被截断，提交按钮位于视口下方，因此未声称移动截图完整展示同意框/按钮；固定 Header 未覆盖当前表单。随后中文来源独立补测实际量取联系页几何：390 为 `390/390/390`、1440 为 `1440/1440/1440`（scrollWidth/bodyScrollWidth/viewportWidth），pageErrors、统计与联系请求均为0。证据：[postdeploy.md](../output/release/xyy-20261002-04/luna/postdeploy.md)、[postdeploy-live-result.json](../output/release/xyy-20261002-04/luna/postdeploy-live/postdeploy-live-result.json)、[postdeploy-zh-geometry-result.json](../output/release/xyy-20261002-04/luna/postdeploy-live/postdeploy-zh-geometry-result.json)、[postdeploy-live](../output/release/xyy-20261002-04/luna/postdeploy-live/)。剩余风险限 staging、Chromium 模拟视口与只读/拦截流，未覆盖真机及其他浏览器；未写 CMS/DB/真实询盘。

### XYY-20261002-06 — 咨询体验二期独立 QA（首轮）

Task ID：`XYY-20261002-06`；Result：**FAIL**。

Expected：服务选择器新控件「重新选择」在 360/390/768/1440 下均应提供至少 `44×44px` 触达区域，并在测试文件调整后通过 `npm run verify`。

Actual：独立 Chromium session `21085` 在 `/contact?need=returns-inspection&region=any#contact-form`、390px、reduced-motion 下量到 `.service-finder__reset` 高度 `21px`，断言 `resetHeight >= 44` 失败；Sol 独立截图亦显示该文字链接为小型 inline target。Likely affected area 为 `src/styles/service-finder.css` 的 `.service-finder__reset`。Severity：Medium。Luna 未修改实现。

Reproduction：

```text
PLAYWRIGHT_PORT=4524 npm_config_offline=true npx playwright test tests/e2e/consultation-service-finder.spec.ts --project=chromium --workers=1 --timeout=60000 --grep geometry --reporter=line
```

Evidence：unit session `47902` 为 3 files/16 tests PASS；新增 finder E2E 在加入 reset 断言前 session `85356` 为 7/7 PASS；reset 几何 FAIL 为 session `21085`；当前 `npm run check:maintainability` PASS（新 spec 220 行、英文案例 219 行）。首轮 `npm run verify` session `38683` 在维护性阶段因当时快照中测试文件 221 行退出，Terra 修复实现后需重跑完整 verify。截图及结构化报告见 [qa-result.md](../output/iteration/xyy-20261002-06/luna/qa-result.md)、[qa-result.json](../output/iteration/xyy-20261002-06/luna/qa-result.json)、[finder-result-390-crosscheck.png](../output/playwright/xyy-20261002-06/luna/finder-result-390-crosscheck.png)。

Scope 限制：未写 CMS、数据库、生产环境或真实询盘，未部署；WebKit/Lighthouse 尚未执行，本轮不声称 Safari/微信真机或性能 PASS。等待 Terra 按同 ID 修复后，Luna 只复测 reset 触达、native GET 及受影响回归。

### XYY-20261002-06 — R2 独立复测

Task ID：`XYY-20261002-06`；Result：**FAIL**。

R2 显式 offline `npm run verify` session `23454` 已 PASS：typecheck 581 files/0 diagnostics、91 Vitest files/592 tests、lint、maintainability、assets 和 Astro build 均通过，完整日志为 [verify-r2.log](../output/iteration/xyy-20261002-06/luna/verify-r2.log)。Terra 修复后的联系页 reset 控件在 R2 build 4535 的 390×844 Chromium 实测为 `80×44px`，focus outline 为 `solid`，该项通过（session `68788`）。

新增发现：产品页 finder 入口未满足统一 44px 触达。R2 build 4535 Chromium 实测 `/product` 360/390 均为 `119×25.1875px`，`/en/services` 390 为 `290.96875×25.1875px`；英文 360 因换行为 `264×50.375px`，各宽度不一致。Result：FAIL；Likely affected area 为 `src/components/product/ProductVideoSequence.astro` / `src/styles/product/video-sequence*.css`，Severity：Medium。复现命令、session `50333`、截图和结构化报告见 [qa-result-r2.md](../output/iteration/xyy-20261002-06/luna/qa-result-r2.md)、[qa-result-r2.json](../output/iteration/xyy-20261002-06/luna/qa-result-r2.json)、[product-zh-finder-r2.png](../output/playwright/xyy-20261002-06/luna/product-zh-finder-r2.png)、[product-en-finder-r2.png](../output/playwright/xyy-20261002-06/luna/product-en-finder-r2.png)。

WebKit、移动 Lighthouse 和最终构建回归暂停至该实现缺陷修复；未写 CMS/DB/生产或真实询盘，未部署。R1 reset FAIL 报告与证据保持不变。

### XYY-20261002-06 — R3 最终独立复测

Task ID：`XYY-20261002-06`；Result：**PASS**。

Terra R3 产品 finder 触达修复后，最终 offline `npm run verify` session `34640` exit 0：typecheck 581 files/0 diagnostics、lint、maintainability（finder spec 工具计220行）、assets 68 references/103 deployment assets、Vitest 91 files/592 tests、Astro build 均通过。完整日志见 [verify-r3-final.log](../output/iteration/xyy-20261002-06/luna/verify-r3-final.log)。最终4536 build 的 Chromium 相关回归 session `64168` 为 34/34 PASS，覆盖 finder 15映射、冲突/重复/恶意参数、双语案例、普通 contact 无案例查询上下文、模板保留/不重复/1200边界、mock 失败重试、双语首页/产品实际点击、四宽几何与既有 conversion/case/CMS fallback；R1 56000 的两个失败本轮未复现。no-JS 用普通 Playwright `locator.click()`（非 evaluate/force）session `56658` 为 1/1 PASS。

最终 build 的产品 finder 在 `/product` 360/390/768/1440 分别为 `119×44`；`/en/services` 分别为 `264×50.375`、`290.96875×44`、`297×44`、`297×44`。contact reset 中文/英文390px分别为 `80×44`、`110.40625×44`，均有 solid focus outline。Linux WebKit MiniBrowser 通过 `xvfb-run` session `64440` exit 0，完成中英结果、reset click 和英文产品入口；直接 headless GTK 首次因无 display 失败，xvfb 后通过，未声称 Safari/微信真机。四页 mobile LHCI 显式配置 session `40402` exit 0（390×844、numberOfRuns=1、offline）；分数与资源、截图亲读和限制见 [qa-result-r3.md](../output/iteration/xyy-20261002-06/luna/qa-result-r3.md) 与 [qa-result-r3.json](../output/iteration/xyy-20261002-06/luna/qa-result-r3.json)。

LHCI 是本机单次实验室基线：home/product/contact/en-contact Performance 为 `0.89/0.83/0.93/0.97`，SEO 均为 `0.69` warning；未将其表述为真实用户数据或加速。未写 CMS/DB/生产、未部署、未提交真实询盘。R1/R2 FAIL 报告和原始证据保持不变。

### XYY-20261002-06 — R4 reduced-motion 最终独立复测

Task ID：`XYY-20261002-06`；Result：**PASS**。

针对 Nova 指出的唯一缺口，Terra R4 将真正 `.service-finder__summary-icon` 的 reduced-motion transition 设为 `none`。最终 offline `npm run verify` session `32795` exit 0：typecheck 581/0、lint、maintainability（finder spec 工具计220行）、assets、Vitest 91 files/592 tests、Astro build 全部通过。最终4537 build 的四宽 geometry E2E session `93527` 为 1/1 PASS。独立 Chromium motion probe session `79297` 实测普通模式 `0.16s`、reduce `0s`，鼠标打开和键盘 Enter 关闭均成功；WebKit MiniBrowser+xvfb session `1026` 得到相同结果。证据与原始日志见 [qa-result-r4.md](../output/iteration/xyy-20261002-06/luna/qa-result-r4.md)、[qa-result-r4.json](../output/iteration/xyy-20261002-06/luna/qa-result-r4.json)。

R3 的 34/34 Chromium、双语入口、finder 映射/参数防护、模板边界/mock 重试、WebKit关键流程、mobile LHCI 和截图证据因 R4 仅改变 summary icon motion CSS 而复用；R1/R2 FAIL 和 R3 PASS 原始证据保持不变。未写 CMS/DB/生产、未部署、未提交真实询盘。WebKit 限制为 Linux MiniBrowser+xvfb，不代表 Safari/微信真机。

### XYY-20261002-07 — 第一阶段候选与发布工具独立预检

Task ID：`XYY-20261002-07`；Result：**PASS（待候选提交）**。

隔离候选 `/tmp/xyy-20261002-02-website` HEAD 与基线均为 `ab82cbd`，预期/实际冻结变更均22项，集合与SHA全部匹配；候选保持合同要求的预期 dirty22，未将未提交状态误判为阻塞。候选 offline `npm run verify` session `9208` exit 0：578 typecheck files/0 diagnostics、91 Vitest files/592 tests、assets/build通过。`npm run format:check` 与新增 `lighthouserc.mobile.cjs` Prettier 检查均 exit 0。

四 helper 独立 `bash -n`/`py_compile`、Task04 remote helper byte-cmp、固定目标/22项/512MiB/4510-4511/RELEASE_KEEP/verify gate/CAS/保护守卫静态核对均通过。临时 fake-runner 以 success 1 + SHA/dirty/freeze/protected/index/GitHub/live身份失败7场景验证：成功仅更新临时 refs，失败均 exit1 且无 refs/index 副作用；未触达真实 GitHub、staging 或主工作区 refs。证据见 [phase1-result.md](../output/release/xyy-20261002-07/luna/phase1-result.md)、[phase1-result.json](../output/release/xyy-20261002-07/luna/phase1-result.json)。

本阶段未运行完整 `verify:release`、部署 wrapper、服务器、真实表单/CMS/DB、push、CI 或本地同步；等待 Sol 在候选创建隔离 commit 并生成 `expected-website-commit.txt` 后进入第二阶段只读 preflight。

### XYY-20261002-07 — 第二阶段候选提交只读 preflight

Task ID：`XYY-20261002-07`；Result：**PASS**。

Sol 已创建隔离候选提交 `dd2f07ab8685aa0d73e50c8b81eff66cc941d5ab`（tree `0620bc1ae6c270ad3cd3ad9a37bdd7124becf315`）。提交后核对确认候选 clean、22项冻结集合/SHA无漂移；主工作区 HEAD/origin仍基线 `ab82cbd`、index为空，1399项保护内容无漂移，4510/4511空闲。候选实际执行 `DEPLOY_PREFLIGHT_ONLY=true DEPLOY_ENVIRONMENT=staging bash scripts/deploy.sh`，exit 0，生成 release `20261002T081357Z-dd2f07a` 并输出 `deployment preflight ok`。

该命令在 preflight 分支结束，未运行 `verify:release`、SSH、rsync、远端写入、push、CI 或真实 sync；候选和主工作区状态保持不变。详见 [phase2-result.md](../output/release/xyy-20261002-07/luna/phase2-result.md)、[phase2-result.json](../output/release/xyy-20261002-07/luna/phase2-result.json)。Fake-runner success 的临时 refs 更新与失败场景 `noRefOrIndexSideEffect` 语义已在证据中明确。

### XYY-20261002-07 — 发布门禁失败只读诊断

Task ID：`XYY-20261002-07`；Result：**FAIL（测试定位器缺陷；完整 wrapper 日志尚未最终汇总）**。

完整 `verify:release` wrapper session `95449` 当前日志记录 Chromium/mobile 各两项英文 contact 失败，均发生于 `tests/e2e/english-acceptance-contact.spec.ts` 共享 helper 第31行：宽松 `getByLabel('Your requirements')` 严格模式同时匹配 finder region 的 accessible name “Find a service for your requirements”和真实 textarea “Your requirements”。页面 DOM 源和 Playwright error-context 均确认实际 textarea 存在；失败发生在填写字段阶段，未到提交/API/业务断言。因此归类为**测试缺陷**，不是实现故障或环境阻塞；最小修正为测试中使用 exact role/name locator。

deploy.log 尚无最终汇总或 wrapper exit 证据；Sol 提供的中间节点为 `179 passed / 4 failed / 6 skipped`、已到 #189，日志随后仍继续追加，因此不把该中间计数改写为完整门禁结论。原始 trace/截图保留，Luna 复制的最小诊断 artifacts 和报告见 [deploy-failure-diagnosis.md](../output/release/xyy-20261002-07/luna/deploy-failure-diagnosis.md)、[deploy-failure-diagnosis.json](../output/release/xyy-20261002-07/luna/deploy-failure-diagnosis.json)、[english-contact-failure](../output/release/xyy-20261002-07/luna/english-contact-failure/)。Luna 未启动/停止测试或服务，未修改实现、测试、候选、Git、服务器、CMS/DB或外部系统；等待 Sol 重新派发修正后的独立复测。

### XYY-20261002-07 — R2 独立复测

Task ID：`XYY-20261002-07`；Result：**FAIL**。

候选 `/tmp/xyy-20261002-02-website` HEAD `dd2f07ab8685aa0d73e50c8b81eff66cc941d5ab`，预检 dirty 仅 R2 测试文件；测试 hash `495e3ff0b040f9f12674c2884e4c655a65dbb11f0da2e62286674439fb28d87a`，R2 清单 23 项且原 22 项 hash 不变。独立 `npm run verify` session `50381` exit0（578 类型文件零诊断、91 Vitest 文件/592 tests、lint/维护性/assets/build通过）；`npm run format:check` session `50265` exit0。两份实际日志与 hash 见 [r2-result.md](../output/release/xyy-20261002-07/luna/r2-result.md)。

R2 完整 spec 既有日志记录 Chromium/mobile 各两例失败（共4失败），均在 `getByLabel('Your requirements', { exact: true })` 等待超时。收到 Sol 指示后未重复完整失败版本；此前已启动的独立尝试 session `4643` 在 Chromium 两例复现后 exit130 停止，trace/error-context/截图见 [r2-independent](../output/release/xyy-20261002-07/luna/r2-independent/)，保留了新失败证据。trace 与 DOM 快照显示 label 文本实际为 `Your requirements*`，星号 span 虽 `aria-hidden=true`；textbox accessible name 为 `Your requirements`。因此 exact `getByLabel` 无匹配，Likely affected area 是测试定位器，不是应用字段缺失；最小修正建议为五处 `getByRole('textbox', { name: 'Your requirements', exact: true })`。Severity：High（发布门禁阻塞）。

四 helper 静态 diff 仅为冻结数量 `22→23`，临时 count fixture exit0 验证23接受、22拒绝，复用 phase1 七项保护失败证据，未执行真实 sync。4510/4511 启动前后均无监听；未部署、push、CMS/DB或真实询盘写入。完整结构化报告：[r2-result.json](../output/release/xyy-20261002-07/luna/r2-result.json)。

### XYY-20261002-07 — R3 独立复测

Task ID：`XYY-20261002-07`；Result：**FAIL**。

Terra R3 的 requirements textbox role/name 修复通过实际 DOM 探针：session `67815` exit0，Chromium 1280×720 与 mobile 412×915 均唯一命中 `textarea#message`。完整英文 contact spec session `47854` exit1，4/4 用例均在既有全页 `button[type="submit"]` 处 strict-mode 失败；页面同时有 finder 的 `View service path` 和 contact form 的 `Submit enquiry`。有界按钮探针 session `69338` exit0，确认全页2个、`#contact-form`内1个。

提交前 `npm run verify` session `73828` exit0（578 类型文件零诊断、91 Vitest 文件/592 tests、lint/维护性/assets/build通过）；`npm run format:check` session `15711` exit0。R3 候选测试 hash 为 `6df02482da732dc77ffcf585d03838011e93377cc624e110c41906c5cadb30da`，23项 freeze 全部匹配，原22项保持。helper 继续复用既有证据，R1 副本严格 diff 仅 `22→23` 数量常量，未执行真实 sync。

该 FAIL 属测试 locator 缺陷，Likely affected area 为 `tests/e2e/english-acceptance-contact.spec.ts` 五处 submit 定位；Severity：High。R3 结构化结果和实际日志见 [r3-result.md](../output/release/xyy-20261002-07/luna/r3-result.md)、[r3-result.json](../output/release/xyy-20261002-07/luna/r3-result.json)、[r3-independent](../output/release/xyy-20261002-07/luna/r3-independent/)。未修改应用、测试、候选、refs、helper，未部署、push、CMS/DB或真实询盘写入；4510/4511 已释放。Playwright CLI wrapper 因 `@playwright/cli` 未缓存且默认 npm cache 只读而受阻，DOM 探针使用候选已有 Playwright 与缓存 Chromium，完整 spec 使用既有 runner。

### XYY-20261002-07 — R4 最终定位补全独立复测

Task ID：`XYY-20261002-07`；Result：**FAIL**。

Terra R4 同时加入精确 requirements textbox 与 `#contact-form` submit scope。完整英文 contact spec session `46692` exit1：Chromium 两例、mobile invalid-fields 通过，mobile `localizes contact submission states` 失败，累计串行 response cases 超过原 30s test timeout；失败快照中 `#form-result` 为空、按钮仍为 `Submitting…`。fresh mobile 单用例诊断 session `36341` exit1 在原 30s/worker1/retry0 下稳定复现。trace 显示多轮 fill/check/click 和 mock response 已完成，`success:false` response 约在 37.23s 返回，随后下一轮 checkbox 操作附近触发整体 test timeout；不是单个响应无返回的证据。

本次 `npm run verify` session `85674` exit1：typecheck 578/0、lint通过，维护性检查因测试文件 221 行超过 220 行预算停止；`npm run format:check` session `2215` exit0。R4 23 项 freeze 全匹配、原22项保持；helper 仅复用 R1 的 `22→23` 严格 diff与复杂失败保护证据，未执行真实 sync。完整证据：[r4-result.md](../output/release/xyy-20261002-07/luna/r4-result.md)、[r4-result.json](../output/release/xyy-20261002-07/luna/r4-result.json)、[r4-independent](../output/release/xyy-20261002-07/luna/r4-independent/)。

Likely affected area 为测试结构与 maintainability budget：建议保持原所有 mock、断言和 30s timeout，将 busy/success 与 14 个 response cases 拆为独立 test，或每个 response case 使用 fresh page；不得上调 timeout、删除场景或隐藏失败。Severity：High。所有 Luna 进程已退出，4510/4511 已释放；未修改应用、测试、候选、refs、helper，未部署、push、CMS/DB或真实询盘写入。

### XYY-20261002-07 — R5 最终拆分场景独立复测

Task ID：`XYY-20261002-07`；Result：**PASS**。

候选 `/tmp/xyy-20261002-02-website` HEAD `dd2f07ab8685aa0d73e50c8b81eff66cc941d5ab`，dirty 仅 `tests/e2e/english-acceptance-contact.spec.ts`，R5 测试 SHA 为 `c5313c6f3be263bea6419a9bf673a5c88d01407c72291386c4b417f594319ec6`。完整英文 contact spec session `53032` exit0，Chromium/mobile 共 **32 passed**（各16，覆盖 busy、初次成功、14 个原 response modes、invalid-fields）；原 30 秒 timeout、worker1、retries0、mock 与断言保持。R4 的 mobile 累计超时在本轮 fresh-page 场景拆分后关闭。

提交前 `npm run verify` session `1168` exit0：578 typecheck files/0 diagnostics、lint、747-file maintainability、assets、91 Vitest files/592 tests、Astro build 全部通过；`npm run format:check` session `15558` exit0。日志和 SHA 见 [r5-result.md](../output/release/xyy-20261002-07/luna/r5-result.md)、[r5-result.json](../output/release/xyy-20261002-07/luna/r5-result.json) 及 [r5-independent](../output/release/xyy-20261002-07/luna/r5-independent/)。

R5 freeze 共23项，原22项 hash 不变；两 helper 与 R1 严格 diff 仅冻结数量 `22→23`，保护基线复用 1398 项，既有 23 成功/22 拒绝和7项保护失败证据复用，未执行真实 sync 或新 fixture。4510/4511 与本轮进程均已释放；未修改应用、测试、候选、refs、helper，未部署、push、CMS/DB或真实询盘写入。R1–R4 失败 trace 和报告保留。

### XYY-20261002-07 — R5 提交后只读 preflight

Task ID：`XYY-20261002-07`；Result：**PASS**。候选已提交 HEAD `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`、tree `6631ca008438a40b0a1b86861759039f40072a72`，clean；R5 freeze 23 项、原22项和测试 hash `c5313c6f...319ec6` 保持。主 root HEAD `ab82cbd...`、index clean、1398 保护基线保持；4510/4511 空闲，磁盘剩余559198208 bytes，高于512MiB。

仅执行 `DEPLOY_PREFLIGHT_ONLY=true DEPLOY_ENVIRONMENT=staging bash scripts/deploy.sh`，同步完成 exit0，manifest `20261002T092941Z-5beb6a2`，输出 `deployment preflight ok`。原始日志和结构化证据见 [r5-preflight.md](../output/release/xyy-20261002-07/luna/r5-preflight.md)、[r5-preflight.json](../output/release/xyy-20261002-07/luna/r5-preflight.json)。未运行 wrapper/verify/E2E、SSH、真实部署、push、sync、CMS/DB或真实询盘；端口与本轮进程已释放。

### XYY-20261002-07 — 发布后线上 QA 工具准备

Task ID：`XYY-20261002-07`；Result：**准备完成，未执行线上 QA**。已写入 [online-r5-core-qa.mjs](../output/release/xyy-20261002-07/luna/online-r5-core-qa.mjs) 与 [online-r5-core-qa-checklist.md](../output/release/xyy-20261002-07/luna/online-r5-core-qa-checklist.md)。脚本固定 `https://wz.tomatopia.top`、目标 SHA `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5` 和 `staging`，首步 GET `/version` 不匹配即停止；随后只读 health/version 和浏览器 GET-only QA。

准备覆盖 zh/en × 390/1440：首页/产品 finder 入口、原生 GET 选择→结果→咨询预选、运行时从公开 `/en/cases` 详情链接选择当前双语案例并沿实际 CTA/语言链接验证语境、提纲保留/去重/1200 边界、Task06 可见点击目标 44px/移动 input-select-textarea 16px/无横溢，以及错误与写请求计数。aria-hidden/隐藏 honeypot 不计入输入量测；视频 media 的 `net::ERR_ABORTED` 单独保留，其他实质 requestfailed 仍失败。浏览器 route 会 abort 并记录所有非 GET/HEAD 请求，不提交表单。仅执行 `node --check`，exit0；未启动浏览器、服务或网络。线上运行命令和四张截图输出路径见清单。

### XYY-20261002-07 — R6 发布门禁环境失败诊断

Task ID：`XYY-20261002-07`；Result：**FAIL（环境/runner 阻塞，根因未证实）**。

完整 wrapper session `8058` exit1，E2E 最终 `267 passed / 2 failed / 9 skipped`，总278；未进入 formal、最终 build 或 SSH/deploy。Chromium 用例此前布局断言已完成，最后截图循环在 `language-suggestion-layout.spec.ts:126` 导航 `/contact` 报 `net::ERR_INSUFFICIENT_RESOURCES`，document status `-1`/`x-unknown`；mobile 在 no-JS 后续断言之前，`language-suggestion-behavior.spec.ts:209` 的 `/about` 导航报 `Page crashed`。失败 screenshot、error-context、trace 已分别保存于 [r6-environment/original](../output/release/xyy-20261002-07/luna/r6-environment/original/) 与 [r6-environment/second](../output/release/xyy-20261002-07/luna/r6-environment/second/)。

归类为 Chromium/Playwright 长 suite 或本地 4510 server 累积资源状态；当前磁盘采样 `482648064` bytes、wrapper 后 `467144704` bytes，均低于512MiB guard，但没有证据证明具体耗尽 FD、内存、共享内存、磁盘或连接资源。Task04 同类失败的 fresh-process 四项复核均通过，FD 峰值92/91/64/64、Max open files 65536/65536且无 EMFILE/ENFILE/ENOMEM/ENOSPC marker；该历史证据仅支持工作假设，不证明本轮根因。完整诊断：[r6-result.md](../output/release/xyy-20261002-07/luna/r6-environment/r6-result.md)、[r6-result.json](../output/release/xyy-20261002-07/luna/r6-environment/r6-result.json)。

空间恢复后，按授权各执行了一次原 timeout、worker1、retries0、fresh process/4520与4521、`DEBUG=pw:browser` 的精准 selector 单例：Chromium session `36254` exit0/1 passed（16.9s），mobile session `44759` exit0/1 passed（15.0s）。采样 Max open files 均 `65536/65536`；Chromium FD/RSS 峰值74/429108KiB，mobile 64/267852KiB；端口已释放，候选保持 clean。证据见 [r6-environment/isolated](../output/release/xyy-20261002-07/luna/r6-environment/isolated/) 与更新后的 [r6-result.md](../output/release/xyy-20261002-07/luna/r6-environment/r6-result.md)。该单例 PASS 只说明 fresh process 下未复现，full wrapper 的 267/2/9 FAIL 仍保留，不能宣称完整门禁 PASS；未改实现/测试/配置/ulimit、未清理历史证据、未部署或线上 QA。

### XYY-20261002-07 — R6 observer runner 纯 stub 验证

Task ID：`XYY-20261002-07`；Result：**PASS（隔离 stub）**。

最终 runner `run-observed-release-r6.py` SHA-256 为 `4c350ab9467200de803694d56236eda0716ea1449ee4fa3c001cc8aff393976a`，测试前后不变。Luna 在独立 child 进程通过 `importlib` 载入 runner，并仅在测试内把固定路径、wrapper hash 和采样间隔替换到本地 fixture；真实 wrapper、浏览器、服务、网络和发布路径均未执行。`test_observer_stub.py` 语法检查 exit0，stub harness exit0，10/10 场景通过：exit0/exit17 传播、采样 OSError 仍等待 END 且标记、已有 LOG/RESOURCES/RESULT 拒绝且 stub 不执行、wrapper hash mismatch 拒绝、PermissionError/ValueError 采样错误可见、正常消失字段可为 null。

四 helper 当前 hash 全部匹配 `helpers-freeze.json`；R1 原22项 hash 未变，当前 release-files 为23项且唯一新增英文 contact spec；候选 clean。结构化证据与实际 fixture 见 [observer-test-report.md](../output/release/xyy-20261002-07/luna/r6-environment/observer-test/observer-test-report.md)、[observer-test-result.json](../output/release/xyy-20261002-07/luna/r6-environment/observer-test/observer-test-result.json)、[scope-check.json](../output/release/xyy-20261002-07/luna/r6-environment/observer-test/scope-check.json)。

### XYY-20261002-07 — 发布后线上 QA

Task ID：`XYY-20261002-07`；Result：**FAIL（资源 requestfailed；业务流程通过）**。

staging `/version` 精确命中 `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`、environment `staging`、release `20261002T102719Z-5beb6a2`；`/healthz` 及 CMS/contactStorage 依赖均为 ok。session `74878` 的线上脚本覆盖 zh/en × 390/1440：首页/产品入口、finder 原生 GET 选择、contact 预选/上下文、提纲保留/去重/1200 边界、公开案例动态选择和双语 CTA/语言链接；8 条入口流程完成，几何、横溢出、HTTP、console、pageerror 和非 GET/写请求均通过，四张截图已亲读。

结果因 59 个非 media `ERR_ABORTED` 失败而为 FAIL（image44、stylesheet8、font7）；另有 media4 个 `ERR_ABORTED` 单独记录。首轮结果、截图和完整请求事件见 [online-r5-result.md](../output/release/xyy-20261002-07/luna/online-r5-result.md)、[online-r5/result.json](../output/release/xyy-20261002-07/luna/online-r5/result.json)、[online-r5/screenshots](../output/release/xyy-20261002-07/luna/online-r5/screenshots/)。未提交真实询盘，未写 CMS/DB/统计；WebKit、Safari/微信真机和真实接收端未验证。当前不把资源取消归因成业务实现缺陷，等待 Sol/Nova 对 stylesheet/image/font 导航取消阈值作发布判断。部署 wrapper 自身真实 exit0，592 unit、269 E2E、9 skip、4 formal 通过；R6 资源观测为512样本，最小磁盘51331072 bytes、最小 MemAvailable2231896KiB、browser FD峰值135，并有9条 `proc_snapshot:PermissionError`，属于观测缺口，不能将部署写成FAIL或声称资源采样无异常。

R1 原始线上证据已复制到 [online-r5/r1](../output/release/xyy-20261002-07/luna/online-r5/r1/)，脚本 SHA `4d048fe0...474b4ca`。R1 没有记录 request 时间、导航 stage 或 current URL，只能确认59个非 media `GET net::ERR_ABORTED`（image44、stylesheet8、font7）与快速切页/入口流程相邻，不能伪造精确步骤。拟议并获准执行的最小测试时序调整为：按现有20秒上限等待 `load`、`document.fonts.ready` 和当前非 media 请求清空；在每次文档导航、入口点击后及滚动触发懒加载后调用；超时明确失败并记录 stage/current URL；继续保留所有实质资源失败，仅 media `ERR_ABORTED` 单列。

Sol 已批准并执行一次 R2：修正版脚本 `node --check` exit0，SHA `60bbdfd4502fcaedb044fde61661d5de28576ce7bd7c0d69e7b7938003a4ef8b`；session `67168` exit1。R2 将非 media 失败从59降至10，剩余全为首页/英文首页 `after lazy-load scroll` 阶段的 image `GET net::ERR_ABORTED`（当前 URL `/` 或 `/en`），media8 单列，stylesheet/font 已为0；HTTP、console、pageerror、非 GET/写请求为0，业务与几何断言仍完成。R2 四图与日志/JSON/脚本副本见 [online-r5/r2](../output/release/xyy-20261002-07/luna/online-r5/r2/)。未执行第三次线上复测，仍不宣称线上 QA PASS。

针对 R2 剩余 image abort，执行了一次有界四 flow 只读时间线诊断（zh/en ×390/1440），未重跑完整 QA。四次 contact 文档均 HTTP 200，观察到的8项 image `GET net::ERR_ABORTED` 全部位于点击开始→contact load/导航完成窗口内，stage 为 `click-start`、pageUrl 为首页；5个实际公共 PNG 各一次 GET 均200 `image/png`，`Image.decode` 与 natural size 全通过。该证据支持这8项为离页取消，但不能把R2全部10项都证明为同因。

诊断的表单补充步骤因 harness 未先执行 finder 选项→结果链路而在20秒 locator timeout，未生成 form rect/表单截图；按每 flow 一次约束不再重试。完整时间线、截图、局限和结构化结果见 [cancellation-diagnostic/result.md](../output/release/xyy-20261002-07/luna/online-r5/cancellation-diagnostic/result.md) 与 [cancellation-diagnostic/result.json](../output/release/xyy-20261002-07/luna/online-r5/cancellation-diagnostic/result.json)。R1/R2 自动 FAIL 历史保留，等待 Nova 对有界资源证据和未完成表单证据作最终判断。

Sol 随后授权一次 R3 完整线上 QA，仅修正测试分类：所有原始 failed requests 保留；只有5个已独立200/PNG/decode资源在正在离开的首页 `/`/`/en`、GET image、ERR_ABORTED 且位于入口点击→contact 主文档200/load成功窗口内时，才计入 `navigationImageCancellations`，其他资源失败仍 FAIL。R3 session `32529` exit0，脚本 SHA `42acf04a...05893396`；10条历史 image abort 全部满足条件并单列，substantive failed requests、HTTP、console、pageerror、非 GET/write-like 均为0。四个 `#contact-form` rect 顶部约176px，四张中英390/1440表单截图已亲读。R3 结果与脚本副本见 [r3-result.md](../output/release/xyy-20261002-07/luna/online-r5/r3-result.md) 和 [online-r5/r3](../output/release/xyy-20261002-07/luna/online-r5/r3/)。R1/R2 自动 FAIL 历史保留；仍未发 POST、写 CMS/DB/统计或验证真机 Safari/微信。

### XYY-20261002-08 — 独立安全 QA

Task ID：`XYY-20261002-08`；Result：**PASS**。

Tests performed：隔离环境 `DIRECTUS_URL/PUBLIC_DIRECTUS_URL=http://127.0.0.1:1`、合成凭据、`PUBLIC_SITE_URL=http://127.0.0.1:4548` 下，定向安全单测 `npx vitest run tests/unit/contact-http-security.test.ts tests/unit/contact-content-type.test.ts tests/unit/directus-assets-security.test.ts tests/unit/contact-rate-limit-security.test.ts tests/unit/contact-storage-privacy.test.ts` 为 **5 files / 28 tests passed，exit 0**。同环境 `npm run verify` 为 **586 type files 0 errors/warnings/hints、lint/maintainability/assets PASS、96 files / 620 Vitest passed、Astro build complete，exit 0**；构建日志中仅见预期的本地不可达 CMS fallback。

回归：复用已构建本地服务 4548，`contracts.spec.ts` contact 用例 Chromium/mobile **2/2 passed，exit 0**；`conversion-contact.spec.ts` 成功/失败用例 Chromium/mobile **4/4 passed，exit 0**；`english-acceptance-contact.spec.ts` 完整 Chromium/mobile **32/32 passed，exit 0**。证据日志位于 [luna evidence](../output/security/xyy-20261002-08/luna/)。

资源验证使用合成 Directus + 实际 `/api/cms-assets/:id` 路由：Chromium **2/2 passed，exit 0**，证明 HTML/SVG inline script 未执行、PNG/SVG 正常显示、PDF 200/inline/有效字节、206 Range 与 304 ETag 策略及 `sandbox; default-src 'none'`、`nosniff` 保留。`xvfb-run` headed Chromium 对本地有效 PDF 做上游基线与路由对照，**1/1 passed，exit 0**；两张截图均显示内置 PDF viewer 8 页缩略图和内容，frames 均为3，下载/查看行为未因资源策略改变。合成验证工具与截图见 `output/security/xyy-20261002-08/luna/`。

Remaining risks：只验证本地合成上游与本地构建，未访问真实 CMS、数据库、询盘接收端、生产环境或部署；未覆盖真机 Safari/微信及跨进程限流。测试期间创建的 4548/4549/4550/4551 服务和浏览器均已停止。任务结束检查时原有 4524 预览不可达；Luna 未启动、修改或停止该端口。

### XYY-20261003-02 — Luna 独立安全 QA

Task ID：`XYY-20261003-02`；Result：**PASS（本地验证完成）**。

Tests performed：隔离 `npm run verify` exit 0：586 类型文件 0 diagnostics、lint/维护性/资产检查、96 个 Vitest 文件/620 tests、Astro build 全部通过；环境变量将 Directus/Xiansuo 指向不可达 `127.0.0.1:9`，使用合成 token。`npm audit --omit=dev` exit 1，命中 `http-cache-semantics` GHSA-ch52-4w7c-c8xp（报告3 high、无修复版本）；完整 `npm audit` 的 advisory bulk endpoint 原始失败 `ECONNRESET` 保留，Sol 已用独立成功的全量 audit 结果解除总体覆盖缺口。

定向安全测试 8 files/92 tests、CMS 语义测试 3 files/19 tests 均 PASS。新构建实际 Astro/Node HTTP 15 项 PASS：咨询跨站/媒体类型/Content-Length/分块上限/限流与 `X-Real-IP`，新闻鉴权/分块1MiB上限/越权字段/批量上限/本地 mock 发布，资源 UUID/CSP/Range/304。Chromium 390×844 与 1440×900 中英文联系页 PASS；失败提交保留输入、成功提交清空输入；中文/英文恶意新闻是本地 CMS mock 经真实 Node/Astro 路由渲染的合成文章，标题/摘要/富文本未执行 JSON/HTML/SVG 脚本。资源代理 HTML/SVG/PNG/PDF PASS，headed Chromium PDF viewer 截图可见8页缩略图与正文。两个本地构建审阅 HTML 文件返回 200，作为低危本地资料暴露候选单独记录，未修改。

Regression coverage：证据与命令日志位于 [output/security/xyy-20261003-02/luna/](../output/security/xyy-20261003-02/luna/)，主报告为 [report.md](../output/security/xyy-20261003-02/luna/report.md)，结构化结果为 [results.json](../output/security/xyy-20261003-02/luna/results.json)。R5 用修正后的 fixture 在同一窗口完成 HTTP/browser/headed PDF/static，三探针 exit 0，静态 GET exit 0；`dist/server/entry.mjs` SHA-256 为 `63363328b7d020fc612714ef8e5b5ddb607160fbdbcd80e941c2d5d9b00fa652`。本轮未修改应用、仓库测试、锁文件、配置或并行改动；4540–4543 自建服务均已停止。首次 fixture header 错误、早于修正 fixture 的浏览器启动证据缺口和一次将应用端口误作 Directus 的 verify 失败均保留原始日志，R5 启动日志已补齐 fixture/app PID 与 `Server started`。

Remaining risks：`fetchPublishedDirectusAsset` 本轮仅实测单次 6 秒慢上游与约 1 秒客户端断开，观察到客户端 abort 后 5028ms 才发送上游响应，未观察到响应前取消；未开展持续压力或更长时间测试，不能据此推断无限挂起或 DoS。本轮新闻 HTTP 仅记录最终 413，不声称提前停止读取；限流未覆盖多实例，未访问真实 CMS、数据库、询盘接收端、生产环境；浏览器限 Linux Chromium 模拟视口，未覆盖 Safari/微信/真实 CDN 代理。Playwright CLI wrapper 因 `@playwright/cli` 未缓存而阻塞，本轮使用缓存 Playwright Chromium 一次性脚本并保留截图证据。

同一 Task ID 补证：修正 fixture 的 `listening` 事件等待；R5 以命令 `timeout 90s script -q -e -c 'node output/security/xyy-20261003-02/luna/http-fixture.mjs' ...` 启动 4540 Astro、4541 Directus、4542 contact、4543 news mock，日志记录 `fixturePid=4`、`appPid=12`、`Server started`，当前构建 GET `/contact` 返回 200，随后已全部停止。慢资源探针使用有效发布 UUID、上游延迟 6 秒、客户端约 1 秒 abort，在 8 秒内观察到客户端 abort 后 5028ms 才发送上游响应，未观察到响应前取消；该结果仅描述本次有界行为，不推断 DoS。R5 HTTP/browser/headed PDF/static 证据分别见 `http-probe-r5.log`、`browser-probe-r5.log`、`pdf-headed-r5.log`、`static-review-r5.log`，均 exit 0。

Chromium 补测升级为 zh/en × 390/1440 的成功/失败共 8 个 mock 提交场景；失败均保留输入，成功均清空输入。中文/英文恶意新闻为本地 CMS mock 经真实 Node/Astro 路由渲染的合成文章，均断言 HTTP 200 和已知恶意标题存在；无隔离 HTML/SVG 对照 marker 均执行，资源代理 marker 均未执行。新构建后两个审阅 HTML 再次 GET 均 200。publication 旧 `pdf` 字符串协议白名单候选仍未独立复现，本轮不将其称为 XSS。

### XYY-20261003-02 — 用户要求的 F1/R1/F2/F3 同 ID 复现复核

Task ID：`XYY-20261003-02`；Result：**PASS（AC1–AC4 复现证据完整；此 PASS 表示验证任务完成，不表示业务实现无缺陷）**。

Tests performed：新建回环端口 4590/4591/4592，先执行 `node --check output/security/xyy-20261003-02/reproduction/luna/reproduce.mjs && node output/security/xyy-20261003-02/reproduction/luna/reproduce.mjs`，exit 0；该轮离线 `npm run build` exit 0，`dist/server/entry.mjs` SHA-256 为 `e4c83a3c15a493886f0175708bad25c1d262a8c6d06f9325f49a1d0ec2adf49e`。F1 记录无 token 401、声明 Content-Length 超限 413，以及分块发送 1,250,000 字节后暂停 1200ms（无响应），继续至总 2,097,152 字节并 EOF 后 413；咨询分块发送 9,045 字节且不 EOF 时约 19ms 提前 413。R1 直连固定 `X-Real-IP` 6 次为 `[503,503,503,503,503,429]`，轮换头为 6 次 503；本地模拟代理覆盖为固定测试地址后第 6 次 429。F2 两个中文编码 URL 均 200，标题、响应体和 `public`/`dist/client` SHA-256 一致，不存在路径 404。首轮 F3 过早清理的失败历史保存在 `reproduction/luna/attempt-1/`；修正后执行 `node --check ... && node ... --only-f3`，exit 0：客户端约 1 秒断开后，mock 上游在请求开始后 6000ms 发送、随后 `finish` 与 `close(writableFinished=true)`，直接 mock 取消对照约 1 秒 `close(writableFinished=false)`；两次命令和完整日志见 [reproduction/luna](../output/security/xyy-20261003-02/reproduction/luna/)。中间修正轮也原样保留在 `attempt-2/`。

Regression coverage：本轮仅覆盖本地真实 Node/Astro HTTP、合成 Directus、单个重写代理和静态构建资源；未重跑 620 项单测或浏览器矩阵。每请求单并发、请求体不超过 2 MiB、观测总时限有界；启动日志含 harness/app PID、`Server started` 和端口监听，最终 `ss -ltnp` 确认 4590–4592 均已释放。复现脚本、`results.json`、`report.md`、build/app/run 日志和失败历史均在 [reproduction/luna](../output/security/xyy-20261003-02/reproduction/luna/)。脚本默认写入该目录，重跑会更新顶层结果；历史轮需保留到新的 `attempt-*` 子目录后再执行。

Remaining risks：R1 只证明直连或一个本地模拟代理条件，不能推断生产 Nginx/真实入口；F1 只记录客户端发送字节、状态和时间，不测服务端内存或压力；F3 是一次 6 秒慢上游，未覆盖持续压力、更长超时、多实例或真实 CMS；F2 是当前本地构建暴露事实，未做生产探测。AC5 缓存库对照由 Sol 独立完成。

### XYY-20261003-03 — Luna 阶段一：候选冻结与完整 verify

Task ID：`XYY-20261003-03`；Result：**PASS（阶段一完成，尚未执行本任务 HTTP/浏览器复现）**。

Tests performed：先冻结 8 个候选实现/测试文件 SHA-256 至 [candidate-hashes.json](../output/security/xyy-20261003-03/luna/candidate-hashes.json)，随后以 `DIRECTUS_URL/PUBLIC_DIRECTUS_URL=http://127.0.0.1:1`、合成内容/写入/发布 Token、空 `XIANSUO_API_URL`/`XIANSUO_INGEST_TOKEN`、回环 `PUBLIC_SITE_URL`、`ENABLE_DOMAIN_REDIRECTS=false` 执行 `npm run verify`，exit 0。实际日志：[verify.log](../output/security/xyy-20261003-03/luna/verify.log)。本次日志显示 Astro typecheck 0 errors/0 warnings，资产检查 68 referenced / 103 deployment assets，Vitest 99 files / 629 tests passed，Astro server build complete（Server built in 4.35s）。未读取或打印真实 Secret，未启动新服务，4321/4524 保留。

Regression coverage：本阶段仅运行合同要求的全量本地 `verify`；未执行无关咨询矩阵、`verify:release`、HTTP/浏览器复现或外部写入。候选 hash 冻结后未修改任务候选文件；旧 Task02 证据和 Terra 首次完整性 FAIL 均保留。

Remaining risks：F1/F2/F3 合同 HTTP、归档/构建门禁、慢上游取消、PNG/SVG/Range/304、HTML/SVG 对照及 headed PDF 尚待后续阶段独立验证；本条不能替代这些验收证据。

### XYY-20261003-03 — Luna 阶段二/三 HTTP、门禁与浏览器复核

Task ID：`XYY-20261003-03`；Result：**PASS（本地合成环境验证完成）**。

Tests performed：复用阶段一新 dist，以回环 4610（Astro/Node）和 4611（Directus mock）、合成 token、无真实询盘配置执行 `node output/security/xyy-20261003-03/luna/http-phase2.mjs`，exit 0；脚本 `node --check` exit 0。F1：有效 JSON 1 MiB 返回 201，UTF-8 拆分通过；1 MiB+1、声明超限、无效 JSON、无 token 分别为 413/413/400/401。独立 raw TCP 发送恰好 1,250,000 字节的合法分块请求，不发送 EOF，在 8ms 收到 `HTTP/1.1 413 Payload Too Large`，`got413BeforeEof=true`；Node HTTP 观测同样在 `eofSent=false` 时 7ms 收到 413。F2：两个归档 HTML 的 SHA-256 分别为 `650c0c25ffccefa17c2b00a5666bb58b5a611962932e2c76d263deafb5be9235`、`4dafea2bbfedfaf435392e130993732142d012229025b8086bb098cdb3680818`；public/dist 均不存在，两个编码 URL 和缺失 URL 均 404；nested/case.html/htm 门禁 exit 1，普通 SVG/PDF 门禁和当前 CLI exit 0。F3：7 次 items 查询全部完成、峰值并发 7；并发取消发生在查询完成前，取消方没有发出上游 asset 请求，另一方最终 200；慢上游单请求在客户端约 1s abort 后 7ms 关闭且未 finish，中途 body abort 的 close 为 `writableFinished=false`，正常请求 finish/close 为 true。

浏览器命令 `xvfb-run -a node output/security/xyy-20261003-03/sol/browser-compat.mjs` exit 0。headed Chromium 直连 HTML/SVG 脚本对照与代理 sandbox/nosniff 阻断均通过；代理 PNG 为 1×1、SVG 为 16×16；Range 返回 206/10 bytes，条件请求返回 304；PDF 返回 200、inline、1,525,777 bytes，SHA-256 为 `13ba9d5144b595d61e0fe0f46a0681676f51b1387646a77cb036a587a44ecfbb`。已亲读 `images.png` 与 `pdf-proxy-headed.png`，后者显示 Chromium PDF viewer 的 8 页缩略图和正文。首轮图片探针因在 about:blank 上下文等待 naturalWidth 超时的 exit 1 原始证据保存在 `luna/browser/attempt-1/`；Sol 将图片检查改为独立新 page 后复跑通过，未改业务。

Regression coverage：阶段一 `npm run verify` exit 0，实际日志为 99 files/629 Vitest passed、typecheck 0 diagnostics、Astro build complete；本次 dist/server/entry.mjs SHA-256 为 `fe1061f5a89db4fc8005d3ca145e897b26131f7187b1254adf4f871c6df8efa3`。原始 HTTP/F2/F3 事件和结果见 [phase2-results.json](../output/security/xyy-20261003-03/luna/phase2-results.json)、[phase2-report.md](../output/security/xyy-20261003-03/luna/phase2-report.md)、[http-phase2.log](../output/security/xyy-20261003-03/luna/http-phase2.log)；浏览器日志、结果和截图见 [browser](../output/security/xyy-20261003-03/luna/browser/)。失败尝试均保留，未修改应用、仓库测试、配置、lock 或旧 Task02 证据；4610/4611 及浏览器均已停止，原 4321/4524 未触碰。

Remaining risks：证据只覆盖当前本地构建、合成 Directus 和单请求/有限并发回环条件，未访问真实 CMS、数据库、询盘接收端、生产入口或部署；F1 记录客户端字节、状态和时间，不测服务端内存或压力；F3 未覆盖持续压力、多实例和真实 CDN/Nginx；浏览器为 headed Linux Chromium，不覆盖 Safari/微信真机。重跑脚本会更新顶层 phase2 结果，历史轮需先复制到新的 attempt 目录。

### XYY-20261004-01 — Luna 独立缓存依赖 QA

Task ID：`XYY-20261004-01`；Result：**FAIL**。

Expected：本地 4.2.0 补丁应对共享及私有缓存的 `Vary: *`、带空格的 `Vary: " * "`、组合形式 `Vary: "Accept, * "` 一律禁止 stale reuse；受限策略的 TTL、SWR、SIE 和 numeric/unlimited `max-stale` 应为 0/拒绝，同时保留合法正例。

Actual：安装版 `http-cache-semantics@4.2.0-xyy.1` 对 `shared:false` 的三种 Vary wildcard 均仍允许 stale 扩展：精确 `*` 的 TTL 为 118000ms，空格及组合形式 TTL 为 119000ms，且后两者 `maxStaleResponse=true`、SWR/SIE 均为 true。共享缓存的空格及组合形式同样为 119000ms 并可 stale。源码中的 `_isReusable()` 在 private cache 直接返回 true，`_hasVaryStar()` 对端点空格未 trim；补丁声称覆盖的 Vary 约束因此未实现完整。

Reproduction：执行 `node output/security/xyy-20261004-01/luna/vary-private-probe.mjs`，exit 0；该工具分别加载 `sol/upstream-4.2.0/index.js` 与当前安装包，固定响应过期 2 秒，比较 exact/padded/list wildcard 的 TTL、SWR、SIE 和 `max-stale` 结果。

Evidence：结构化结果 [vary-private-results.json](../output/security/xyy-20261004-01/luna/vary-private-results.json)，原始输出 [vary-private-probe.log](../output/security/xyy-20261004-01/luna/vary-private-probe.log)。本次 `npm run verify` 已实际执行并 exit 0，日志为 101 files / 666 tests、0 errors、build complete：[verify.log](../output/security/xyy-20261004-01/luna/verify.log)。完整 verify 通过不能覆盖上述独立边界失败。

Likely affected area：`scripts/vendor/http-cache-semantics/index.js` 的 `_isReusable()` 与 `_hasVaryStar()`，以及其 Vary/stale TTL、SWR/SIE、max-stale 入口。Severity：**High**，因为受限响应在缓存策略边界下仍可被共享或私有缓存延长使用。

Production install status：按合同创建了只含当前 `package.json`、`package-lock.json` 和 `scripts/vendor/http-cache-semantics` 的独立 fixture；标准 `npm ci --omit=dev --ignore-scripts --no-audit --no-fund` 长时间无输出后中断，未形成可验证成功退出，残留不完整 `node_modules` 仅作为本任务证据。升级安装尝试随后被审批/回合中止，不能宣称生产安装 PASS。未重复 audit；网络/TLS 阻塞由 Sol 独立记录。

Scope：本轮未修改实现、仓库测试、package/lock、环境或旧证据；仅新增 `output/security/xyy-20261004-01/luna/` 证据并追加本日志。该 FAIL 已返回 Sol，等待 Terra 按同 Task ID 修复后 Luna re-test。

### XYY-20261004-01 — Luna R2 缓存依赖独立复测

Task ID：`XYY-20261004-01`；Result：**PASS（本地代码行为与 verify）；BLOCKED（生产安装与联网 audit）**。

Tests performed：R2 只读复测当前 Terra 实现，未改实现或仓库测试。独立 probe `node output/security/xyy-20261004-01/luna/r2/cache-boundary-probe.mjs` exit 0；保留的原 4.2.0 snapshot 对照中六种 Vary wildcard 仍可 stale，当前安装 `4.2.0-xyy.1` 的 shared/private exact、padded、list 六组合均为 TTL 0、SWR/SIE false、numeric/unlimited max-stale 拒绝。private Cookie 正例 TTL 58000ms、普通 Vary TTL 约59943ms；序列化恢复 TTL 58000ms；库级 304 `matches=true/modified=false`；SIE 同 URL 成功匹配，其他 URL 与 no-cache 均不匹配。实际 Astro remote consumer 解析到 `4.2.0-xyy.1`：单测确认受限 Set-Cookie 返回时 `expires <= Date.now()`；probe 的 `restrictedExpiresDeltaMs=46` 是 `expires - consumerBefore` 的调用耗时观测，不是 TTL。普通图片约600000ms，304 返回空 data 且约600000ms TTL。

Regression coverage：本次完整 `npm run verify` 使用离线 CMS 环境与合成凭据，exit 0；102 test files / 673 tests passed，typecheck 0 errors、lint/维护性/assets/build 完成。`npm ls http-cache-semantics --all` exit 0，Astro 7.2.8 与根依赖均解析到 `scripts/vendor/http-cache-semantics/index.js`。R2 候选 hash、解析路径和完整原始日志分别见 [freeze.json](../output/security/xyy-20261004-01/luna/r2/freeze.json)、[resolution.json](../output/security/xyy-20261004-01/luna/r2/resolution.json)、[cache-boundary-results.json](../output/security/xyy-20261004-01/luna/r2/cache-boundary-results.json)、[verify.log](../output/security/xyy-20261004-01/luna/r2/verify.log)。

Production install / audit：Sol 的独立 production fixture 已包含完整 package/lock/vendor 布局，但离线 `npm ci --omit=dev --offline` 因 `zwitch` ENOTCACHED 退出 1；联网安装出现 ETIMEDOUT、ECONNRESET、DEPTH_ZERO_SELF_SIGNED_CERT、ERR_TLS_CERT_ALTNAME_INVALID，未获得成功安装或可执行 consumer 证据。npm audit 两次超时，官方 advisory bulk 端点的 TLS 证书过期探针失败；未关闭 TLS、改 registry 或重复联网。该部分按环境 BLOCKED 报告，不能把本地行为 PASS 扩大为完整 AC4 PASS。

Remaining risks：本轮未访问真实 CMS、生产入口、数据库或部署；未运行 verify:release；本地消费者验证使用当前 node_modules，独立 production 安装因网络/缓存条件未完成。旧 R1 FAIL、安装失败和审计阻塞证据均保留，等待同 Task ID 后续安装恢复后再补证。

### XYY-20261003-04 — Luna 恢复候选独立验证

Task ID：`XYY-20261003-04`；Result：**PASS（候选范围、格式与本地 verify）；生产安装状态待 Sol 证据确认**。

Tests performed：针对隔离候选 `/tmp/xyy-20261002-02-website`，基线 HEAD `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`，核对 `resume-20261004/release-files.json`：实际 diff 27 项、清单 27 项、逐文件 SHA-256 全部匹配，无额外 diff；候选无 `.env` 且 HEAD 一致。`npm run format:check` exit 0；使用回环不可达 CMS、合成 token、清空真实询盘配置执行候选 `npm run verify`，exit 0。

Regression coverage：本次 verify 原始日志显示 typecheck 0 errors、lint/维护性/assets 通过、102 test files / 673 tests passed，Astro build complete；任务期间候选未修改，root node_modules 为现有复用安装，不能代替 clean production install。hash/diff 证据：[candidate-hash-check.json](../output/release/xyy-20261003-04/resume-20261004/luna/candidate-hash-check.json)；格式日志：[format-check.log](../output/release/xyy-20261003-04/resume-20261004/luna/format-check.log)；verify 原始日志：[verify.log](../output/release/xyy-20261003-04/resume-20261004/luna/verify.log)。首次自有检查器语法错误与修正后的成功结果均未修改候选。

Remaining risks：本轮未运行 verify:release、未部署、提交、推送、CMS/数据库/真实询盘写入；准确生产安装与实际生产依赖布局解析以 Sol 当前独立 fixture 的完整安装日志为准，若未成功只能报告 BLOCKED，不能由本地 root node_modules 通过推断替代。

### XYY-20261003-04 — Luna 部署后只读 QA 工具准备

Task ID：`XYY-20261003-04`；Result：**PASS（仅完成可执行工具与清单准备；未执行线上 QA，未对新部署作 PASS 判断）**。

Tests performed：新增 [online-readonly-qa.mjs](../output/release/xyy-20261003-04/resume-20261004/luna/online-readonly-qa.mjs) 与 [online-readonly-qa-checklist.md](../output/release/xyy-20261003-04/resume-20261004/luna/online-readonly-qa-checklist.md)。工具只接受显式 `TARGET_BASE_URL`、期望候选 SHA 与环境名，使用有界 GET 请求检查 `/version` 身份、`/healthz`、中英文首页/联系/新闻页面、两份内部 HTML 编码 URL 的 404、公开 CMS 资源、CSP `sandbox;`、`nosniff`、Range 206/10 bytes 与 ETag 304。缺少目标参数时只落盘 BLOCKED 并退出 2；不发送表单、CMS、数据库或询盘写请求。`node --check` exit 0，原始输出见 [online-readonly-qa.node-check.log](../output/release/xyy-20261003-04/resume-20261004/luna/online-readonly-qa.node-check.log)，退出码见 [online-readonly-qa.node-check.exit](../output/release/xyy-20261003-04/resume-20261004/luna/online-readonly-qa.node-check.exit)。

Regression coverage：本阶段只做本地静态语法核验和工具设计审阅；未访问 `wz.tomatopia.top` 或其他线上目标，未运行浏览器、未运行 `verify:release`，未部署、提交、推送或修改候选/业务代码。原候选范围、hash、format 与本地 verify 证据保持不变。

Remaining risks：线上 `/version` 的实际身份、页面、资源安全响应头、Range/304 及生产代理行为仍待 Sol/部署完成后按确认目标运行这份只读工具；当前不能据此宣称生产发布或线上 QA 通过。

### XYY-20261003-04 — Luna 发布工具独立复核

Task ID：`XYY-20261003-04`；Result：**FAIL（发现 production-preflight preparation 祖先 symlink 守卫缺口；其余准备验证通过）**。

Expected：六个冻结发布工具哈希一致；wrapper 在 production preflight、artifact 拉取或结果读取失败时阻止部署；preflight 对 preparation 源文件做真实路径约束，并保留 npm ci/audit/probe 的实际 exit；候选缓存探针与远端快照 checker 正反例可执行。

Actual：六个 SHA-256 全部与 [terra/freeze.json](../output/release/xyy-20261003-04/resume-20261004/terra/freeze.json) 匹配；两个 shell、一个 Node、三个 Python 工具语法检查 exit 0；候选 `cache-probe.mjs` exit 0，解析 `4.2.0-xyy.1`；`check-remote.py` 合成正例 exit 0，删除旧 release 的反例非零。静态守卫确认 wrapper 在 `bash scripts/deploy.sh` 前检查 preflight/artifact/结果退出，preflight 保存 npm ci/audit/probe exit 并以 `fail` 阻断。独立临时 fixture 发现 preflight 只拒绝最终文件 symlink，未拒绝 `scripts`/`vendor` 祖先目录 symlink：字面路径仍在 preparation 内、最终文件为普通文件，却可解析并读取 preparation 外文件。详细 FAIL 报告见 [tool-report.md](../output/release/xyy-20261003-04/resume-20261004/luna/tool-report.md)，边界证据见 [preflight-symlink-boundary.json](../output/release/xyy-20261003-04/resume-20261004/luna/preflight-symlink-boundary.json)。Sol 的目标服务器只读检查显示本次 preparation 父目录和新 target 当前不存在 symlink；这只是本次环境事实，不能替代工具守卫修复。

Regression coverage：未运行真实 wrapper、production-preflight、SSH、remote snapshot、sync-local、npm ci/audit、verify:release 或任何外部写入；未重跑已通过候选 verify。所有证据保存在本次 `resume-20261004/luna/`，未修改业务、候选、测试或发布工具。

Remaining risks：生产 clean install、有效 production audit、既有 `verify:release`、部署后只读 QA 仍待 Sol 按授权目标执行；当前 FAIL 需 Terra 修正 preflight 的祖先路径真实解析守卫后再由 Luna 复测，不能把本地工具 PASS 扩大为发布通过。

### XYY-20261003-04 — Luna R2 发布工具定向复测

Task ID：`XYY-20261003-04`；Result：**PASS（production-preflight 路径守卫定向复测；生产门禁仍待执行）**。

Tests performed：核对 Terra R2 冻结的 7 个文件哈希，全部匹配。实际运行 Terra 提供的最小 source-boundary helper，exit 0：普通 preparation 内部源通过，安装后 `node_modules/http-cache-semantics` 合法 file symlink 通过，`scripts` 祖先目录指向 preparation 外部目录时在 hash 前被拒绝。原 R1 wrapper 失败阻断、npm exit 留存、cache probe 及 remote checker 正反例证据沿用，不重复运行。

Regression coverage：本轮只覆盖 production-preflight 的修复边界与冻结哈希；未运行 wrapper、SSH、真实 npm ci/audit、remote snapshot、sync-local、部署、外部写入或 `verify:release`。详细 R2 证据见 [tool-report.md](../output/release/xyy-20261003-04/resume-20261004/luna/r2/tool-report.md)。

Remaining risks：本地合成 fixture 不能替代目标服务器真实 preflight；生产 clean install、audit、CI、完整 release 门禁及部署后只读 QA 仍待 Sol 按授权执行。R1 已发现的祖先 symlink 缺口经 R2 复测闭合。

### XYY-20261003-04 — Luna production-preflight 归档核验

Task ID：`XYY-20261003-04`；Result：**PASS（目标服务器 clean production preflight 归档已核验；发布切换仍未由本轮确认）**。

Tests performed：只读列出并检查 `remote-production-preflight-artifacts.tar.gz`，12 个成员均为顶层普通文件，随后仅解压到本任务 `luna/r2/preflight-archive/`。wrapper preflight、artifact 拉取、结果读取 exit 均为 0；preflight status PASS、Node 22。npm ci exit 0（added 290 packages / audited 292 packages / 5s），npm audit exit 0，JSON 漏洞 total 为 0 且 vulnerabilities 为空；cache probe exit 0。安装解析路径位于目标 preparation vendor，版本 `4.2.0-xyy.1`，vendor hash 与 release manifest/冻结源一致，归档 Astro synthetic probe 解析路径一致并 PASS。详细证据见 [preflight-report.md](../output/release/xyy-20261003-04/resume-20261004/luna/r2/preflight-report.md) 与 [preflight-archive-check.json](../output/release/xyy-20261003-04/resume-20261004/luna/r2/preflight-archive-check.json)。

Regression coverage：本轮未重复安装或执行 npm，未运行 wrapper、SSH、部署、sync-local、外部写入或线上新版本 QA；file 依赖不受 npm 公告扫描覆盖，零告警不替代源码/行为证据。

Remaining risks：完整 `verify:release` 的最终退出、部署切换、部署后 `/version`/`healthz`/页面/资源只读 QA 仍待 Sol 后续流程；本条不提前宣称新版本已发布或线上通过。

### XYY-20261003-04 — Luna R3 迁移独立验证

Task ID：`XYY-20261003-04`；Result：**FAIL（内容迁移与 Playwright list 路径通过；根分区空间不足）**。

Tests performed：候选 2592 项（2240 文件、351 目录、1 symlink）逐项 bytes/SHA-256/mode/link target 全匹配；R2 持久归档 5981 文件、560,958,562 bytes 全部匹配原 manifest。随后才读取候选 Git 状态：HEAD 为 `0ffe149df13148d6280b5230979eb0a3d0ea26cb`、clean、无 `.env`；27 release 文件与 7 helper 冻结哈希全部匹配。Playwright `--list --reporter=json` exit 0，146 个 test instances，JSON/outputDir 位于 `/home/yj/data`。

Actual：数据分区可用 11,225,984 KiB，满足 3 GiB；根分区和 `/tmp` 仅 492,572 KiB，低于合同要求的 524,288 KiB（512 MiB）。因此本轮整体 FAIL，未进入旧路径删除、alias 建立或 alias 物理 cwd/默认 outputDir 复验。

Evidence：详细报告见 [r3/report.md](../output/release/xyy-20261003-04/resume-20261004/luna/r3/report.md)，结构化空间证据见 [r3/resource-check.json](../output/release/xyy-20261003-04/resume-20261004/luna/r3/resource-check.json)。本轮未修改来源、候选、R2 归档、业务、配置或 Git index，未运行全量测试、部署或外部写入。

Remaining risks：需先恢复根和 `/tmp` 至至少 512 MiB，再由 Sol 完成路径迁移/alias；随后 Luna 才能复核 alias 和默认 Playwright 输出路径。R2 原始失败及日志缺口仍按合同保留，不能因本轮内容匹配而宣称 R2 通过。

### XYY-20261003-04 — Luna 两项失败定向复测

Task ID：`XYY-20261003-04`；Result：**PASS（两项失败的 fresh-browser 定向复测；R1 全量门禁仍为 FAIL）**。

Tests performed：保存 R1 第二项 `product-video-loading` 原始失败 trace/error-context 与整轮 deployment.log；第一项原始产物已在同目录保留。随后只执行一次新 Chromium 进程定向命令，端口 4512、CI 单 worker、chromium+mobile、独立输出目录。两条测试按项目产生 4 个实例：3 passed、1 skipped；Playwright `.last-run.json` status 为 passed、failedTests 为空，命令 exit 0。

Evidence：完整命令与 exit 见 [targeted-command.txt](../output/release/xyy-20261003-04/resume-20261004/luna/release-r1/targeted-command.txt)，结果见 [targeted-resource-summary.json](../output/release/xyy-20261003-04/resume-20261004/luna/release-r1/targeted-resource-summary.json) 和 [targeted-results/.last-run.json](../output/release/xyy-20261003-04/resume-20261004/luna/release-r1/targeted-results/.last-run.json)。R1 原始报告与第二项产物见 [targeted-report.md](../output/release/xyy-20261003-04/resume-20261004/luna/release-r1/targeted-report.md)。

Regression coverage：定向复测未改测试、配置、断言或业务；未重跑完整 `verify:release`，未进入 formal/final build、上传、部署或外部写入。R1 两项全量失败仍保留，定向通过降低了实现缺陷可能性，但未确定资源错误精确根因。Playwright 清理 `--output` 导致 stdout/before 资源文件丢失，未进行第二次复测；命令、exit、`.last-run` 和 after 磁盘快照保留。

Remaining risks：发布仍须由 Sol 决定是否在资源稳定后重新执行完整门禁；R1 的 267 passed/9 skipped/2 failed 不能被本轮定向 3 passed/1 skipped 覆盖，当前不宣称发布通过。

### XYY-20261003-04 — Luna verify:release 第 108 项失败诊断

Task ID：`XYY-20261003-04`；Result：**FAIL（Chromium 资源错误阻断发布门禁；未证实为业务路由缺陷）**。

Expected：responsive.spec.ts 第 19 项应在 Chromium 的 390/430/768/1024 矩阵中依次成功加载核心页面且无页面/控制台错误，verify:release 才能继续部署。

Actual：第 108 项在 430px 的 `page.goto('/cases')` 报 `net::ERR_INSUFFICIENT_RESOURCES`，失败截图为空白页。Trace 显示 `/cases` 曾成功返回 HTTP 200 HTML（14,205 bytes），失败导航快照为浏览器 status `-1`；12 个关联资源为 10×200、2×304。更早加载 `/about` 时，`/about/gallery/gallery-013.webp` 已出现同一浏览器资源错误。目标 Chrome 的只读观测未接近 fd/内存上限，当前失败后的磁盘快照仅约 149 MiB 可用，不能单独归因磁盘。

Evidence：三份原始失败产物已保存在 [release-r1/responsive-failure](../output/release/xyy-20261003-04/resume-20261004/luna/release-r1/responsive-failure/)，诊断报告与结构化结果见 [report.md](../output/release/xyy-20261003-04/resume-20261004/luna/release-r1/report.md) 和 [diagnosis.json](../output/release/xyy-20261003-04/resume-20261004/luna/release-r1/diagnosis.json)。

Likely affected area：Chromium/宿主资源状态或连续 responsive 导航中的资源回收；静态 gallery 资源仍需在资源稳定后单独确认。当前未证明 `/cases` 业务实现错误。Severity：**High（发布门禁）**；业务缺陷证据不足。

Regression coverage：本轮只读 trace、错误上下文、截图、部署日志及资源观测，未启动新浏览器/测试/服务，未修改断言或业务，未清理磁盘或执行外部写入。

Remaining risks：verify:release 最终退出与部署状态仍由 Sol 流程决定。最小下一步是等待现轮结束、记录健康资源基线后只运行一次定向第 19 项；通过则归类环境瞬态，复现则结合服务器资源与静态资源日志继续定位，不能用重试或过滤掩盖失败。

### XYY-20261003-04 — Luna R3 迁移后独立复核

Task ID：`XYY-20261003-04`；Result：**PASS（迁移后 alias、默认 Playwright 输出路径与资源门槛）**。

Tests performed：在 `/tmp/xyy-20261002-02-website` alias 下运行 `env -u PLAYWRIGHT_TEST_OUTPUT_DIR CI=1 npx playwright test --list --reporter=json`，exit 0；未传 `--output`，未设置 `PLAYWRIGHT_TEST_OUTPUT_DIR`。`pwd -P` 为 `/home/yj/data/xyy-release-20261003-04/candidate`，HEAD 为 `0ffe149df13148d6280b5230979eb0a3d0ea26cb`，Git status clean。递归 JSON 得 56 suites、278 specs、278 test instances、0 errors；chromium/mobile 的 `outputDir` 均精确为 `/home/yj/data/xyy-release-20261003-04/candidate/test-results`。根分区和 `/tmp` 可用 1,197,036 KiB（超过 512 MiB），data 可用 11,225,976 KiB（超过 3 GiB）；4510、4511、4512 均无监听。

Regression coverage：本轮只读核验迁移 alias 的物理路径、候选身份/clean 状态、默认 Playwright 配置解析、容量和端口；未启动浏览器或测试实例，未修改候选、业务、配置或测试，未执行部署、Git 写入或外部写入。首阶段 R3 的内容/归档匹配 PASS 与根空间 FAIL 均保留，未覆盖。

Remaining risks：本轮证明迁移后的本地路径和资源条件满足 R3 合同，不替代完整 `verify:release` 或部署后线上只读 QA；R1/R2 历史门禁结果仍以原始证据为准。证据见 [r3/post-migration/report.md](../output/release/xyy-20261003-04/resume-20261004/luna/r3/post-migration/report.md)、[post-migration-list-check.json](../output/release/xyy-20261003-04/resume-20261004/luna/r3/post-migration/post-migration-list-check.json)、[post-migration-resource-check.json](../output/release/xyy-20261003-04/resume-20261004/luna/r3/post-migration/post-migration-resource-check.json)。

### XYY-20261003-04 — Luna R3 完整门禁与部署后只读 QA

Task ID：`XYY-20261003-04`；Result：**FAIL（完整发布门禁通过；部署后资源缓存检查失败）**。

Expected：候选 `0ffe149df13148d6280b5230979eb0a3d0ea26cb` 的完整 `verify:release` 应通过；部署后 staging 应返回精确版本身份、健康页面和安全资源响应，并对 ETag 条件 GET 返回 304。

Actual：本次完整门禁 exit 0，日志确认 673 单测通过、269 E2E 通过/9 跳过、4 formal 通过、最终 build 完成；27 文件冻结、7 个 helper 冻结、release/archive 保留和 remote-check 均 PASS。线上只读检查中 `/version`、`/healthz`、6 个中英文页面、两份内部审阅 HTML 404、公开资源 200/CSP 和 Range 206 通过，但资源 `a9be7a91-e74c-43f4-947c-52c3fc25879a` 返回 `X-Content-Type-Options: nosniff, nosniff`，且带 ETag `"1786950893"` 的条件 GET 返回 200 而非 304，脚本 exit 1。

Reproduction：

```bash
TARGET_BASE_URL=https://wz.tomatopia.top EXPECTED_GIT_SHA=0ffe149df13148d6280b5230979eb0a3d0ea26cb EXPECTED_ENVIRONMENT=staging node output/release/xyy-20261003-04/resume-20261004/luna/online-readonly-qa.mjs
```

Evidence：完整报告见 [r3gate/report.md](../output/release/xyy-20261003-04/resume-20261004/luna/r3gate/report.md)，结构化门禁证据见 [gate-summary.json](../output/release/xyy-20261003-04/resume-20261004/luna/r3gate/gate-summary.json)，线上原始结果见 [online-readonly-result.json](../output/release/xyy-20261003-04/resume-20261004/luna/r3gate/online-readonly-result.json)，退出码见 [online-readonly.exit](../output/release/xyy-20261003-04/resume-20261004/luna/r3gate/online-readonly.exit)。

Likely affected area：CMS asset 代理或前置缓存层的响应头合并与条件请求处理。重复 `nosniff` 可能来自重复附加响应头；ETag 条件请求未返回 304，说明缓存协商行为未满足只读 QA 合同。Severity：**High（发布后安全响应/缓存合同）**。

Regression coverage：只执行固定目标的 GET：版本、健康、6 个页面、2 个内部 HTML URL、1 个公开 CMS 资源及 Range/条件请求；未发送 POST、表单、CMS/数据库/询盘写入，未运行浏览器或真机测试。完整门禁、27 文件冻结和归档证据保留，未修改应用、候选或部署。

Remaining risks：本轮只覆盖一个公开资源，不能代表所有资源类型；应由责任方处理响应头重复与条件请求行为后再复测。当前不能把完整门禁 PASS 扩大为线上 QA PASS，也不宣称生产环境通过。

### XYY-20261003-04 — Luna HTTP 语义定向诊断

Task ID：`XYY-20261003-04`；Result：**PASS（诊断证据完成；原部署后 QA FAIL 保留，未据此判定真实安全漏洞）**。

Tests performed：先将 R1 原始脚本、命令、日志、exit、结果和 SHA 保存到 [online-r1-preserved](../output/release/xyy-20261003-04/resume-20261004/luna/online-diagnosis/online-r1-preserved/)。对同一公开资源执行有限公共 curl 与 Node fetch GET/ETag 条件 GET，并通过 SSH 在验收服务器读取 `127.0.0.1:50031`。公共 curl 普通/条件 GET 均 200/201655 bytes；条件请求明确带 `If-None-Match: "1786950893"`。Node fetch 默认、显式 `Cache-Control: no-cache` 和 `no-store` 的条件 GET 均 200/201655 bytes。验收服务器 loopback 普通/条件 GET 均 exit 0、200/201655 bytes。

Actual：公共 wire 响应确有两条独立 `X-Content-Type-Options`：`x-content-type-options: nosniff` 与 `X-Content-Type-Options: nosniff`；Node `Headers` 的逗号合并不是唯一来源。loopback 应用只返回一个 `x-content-type-options: nosniff`，说明重复 header 出现在应用与公共边缘之间；但 loopback 应用本身对匹配 ETag 也返回 200，因此条件请求 200 不能只归因 Node fetch 或单独归因 Nginx。原始 QA FAIL 未改写。

Evidence：详细报告见 [online-diagnosis/report.md](../output/release/xyy-20261003-04/resume-20261004/luna/online-diagnosis/report.md)，结构化结果见 [diagnosis.json](../output/release/xyy-20261003-04/resume-20261004/luna/online-diagnosis/diagnosis.json)，公共与 loopback 原始头见 [public-conditional.trace](../output/release/xyy-20261003-04/resume-20261004/luna/online-diagnosis/public-conditional.trace)、[remote-loopback-get.headers](../output/release/xyy-20261003-04/resume-20261004/luna/online-diagnosis/remote-loopback-get.headers)、[remote-loopback-conditional.headers](../output/release/xyy-20261003-04/resume-20261004/luna/online-diagnosis/remote-loopback-conditional.headers)。

Regression coverage：仅执行有界 GET/条件 GET 和响应头读取；未读 `.env`，未写 CMS、数据库或询盘，未修改 QA 断言、业务、Nginx 或部署，未启动新服务，未重试线上 QA。

Remaining risks：当前只覆盖一个资源；实际安全严重度未定，也未测试利用或绕过。责任方需明确重复响应头来源及 ETag/304 合同后再按原 QA 复测。

### XYY-20261003-04 — Luna 部署后只读 QA R2

Task ID：`XYY-20261003-04`；Result：**PASS_WITH_LIMITATION（304 NOT_OBSERVED）**。

Tests performed：仅修改 [online-readonly-qa.mjs](../output/release/xyy-20261003-04/resume-20261004/luna/online-readonly-qa.mjs)，脚本 hash `a5d63aff5ec394cb767c6fd7164608e8e6a8eff879e870bad9d4a7551c1a3ac2`，`node --check` exit 0。新增 nosniff 首值 trim/split 检查、Range 206 的 CSP/nosniff 检查、304 空体检查；条件 GET 返回 200 时只在 ETag/body/CSP/nosniff 全相同时记录 `NOT_OBSERVED` 和 limitation，不冒称 304。固定目标只运行一次，exit 0，结果 `PASS_WITH_LIMITATION`：版本、health、页面、内部 HTML 404、资源 200、Range 206 和安全头均通过；条件 GET 返回 200，ETag 相同且 body 201655 bytes 完全相同，304 未观察到。

Regression coverage：未发送 POST，未写 CMS/数据库/询盘，未运行浏览器或全量门禁；R1 原始脚本/结果/日志已归档且未覆盖。证据见 [online-r2/report.md](../output/release/xyy-20261003-04/resume-20261004/luna/online-r2/report.md)、[online-readonly-result.json](../output/release/xyy-20261003-04/resume-20261004/luna/online-r2/online-readonly-result.json)、[script.diff](../output/release/xyy-20261003-04/resume-20261004/luna/online-r2/script.diff)。

Remaining risks：本次只能确认等价 200，不能宣称 304 通过；304 行为仍是未观测限制。重复 `nosniff` 按 Fetch 语义首值验证有效。

### XYY-20261003-04 — Luna 清理后最终只读复核

Task ID：`XYY-20261003-04`；Result：**PASS**。

Tests performed：通过 SSH 只读确认三个 preparation target 仍存在且仅各自 `node_modules` 缺失，命令 exit 0。逐项读取 data 分区归档 `raw.tar.gz` 并对照 `full-manifest.json` 的 mode/bytes/SHA-256，72 条全部匹配（60 文件、12 目录、0 mismatch）。cleanup 前后远端快照的 current、25 release（current 加 24 旧版）、previous、CMS/web、共享环境 hash、version、healthz 全部保持；current 为 `20261004T044635Z-0ffe149`。清理后 freeBytes `1,033,854,976`，超过 512 MiB。

Regression coverage：只做清理范围、归档 hash/mode 和远端快照只读核对；未安装、未运行应用测试、未写远端、未操作 CMS/DB/询盘、未改候选或业务代码。证据见 [cleanup-final/report.md](../output/release/xyy-20261003-04/resume-20261004/luna/cleanup-final/report.md)、[summary.json](../output/release/xyy-20261003-04/resume-20261004/luna/cleanup-final/summary.json)、[archive-verification.json](../output/release/xyy-20261003-04/resume-20261004/luna/cleanup-final/archive-verification.json)。

Remaining risks：本轮仅确认清理与保护证据，不能替代应用回归或线上功能 QA；归档后续删除/恢复需另行授权。

### XYY-20261004-03-F/C — Luna 最终正文与 C 增量独立QA

Task ID：`XYY-20261004-03-F/C`；F Result：**FAIL**；C 增量 Result：**PASS**。

F 逐条读取并对照原PDF/crop，覆盖第3、4、5期全部45条新增恢复记录；不重复此前190条来源观察抽样。确认8项问题：WP03-005连字符与原稿不符；WP03-010模块阅读顺序倒置；WP03-016遗漏“省内外多地遭遇强降水袭击”且无缺口标记；WP03-017“要学会解决困难、学会适应能力”被写成“要有解决困难、学会适应的能力”；WP04-004、WP04-005章节顺序倒置；WP05-004遗漏“市”并加入“质量”；WP05-013“分配资源揽收”被写成“分配承运收”。另记录4项低风险标点/空格规范化差异。45个crop均存在；历史中仅16条保存cropSha256，16/16复算匹配，3/4期其余29条没有哈希字段，未扩大为已核验。

F 证据见 [report.md](../output/maintenance/xyy-20261004-03/F/luna-final/report.md) 与 [integrity-and-observations.json](../output/maintenance/xyy-20261004-03/F/luna-final/integrity-and-observations.json)。未修改正文、台账或实现。原PDF部分163dpi细字仍保留明确缺口，本结果不等同3–5期全文恢复；Terra返工后需同ID复验8项。

C 增量执行 `npm run typecheck`：634 files、0 errors、0 warnings、4 hints；`npx eslint src/env.d.ts` exit 0；request-policy/trusted-proxy 17/17通过。证据见 [C report](../output/maintenance/xyy-20261004-03/C/luna-final/report.md)。未运行完整verify/build/E2E或真实代理入口。

### XYY-20261004-03-F — Luna R3 正文返工独立复验

Task ID：`XYY-20261004-03-F`；Result：**PASS（R3返工8项及冻结完整性）**。

重新打开实际原稿 crop 复验 WP03-005、010、016、017，WP04-004、005，WP05-004、013，8/8通过。第3/4/5期45条新增记录 crop SHA 全匹配；235条 originalRecord SHA 与PDF SHA均匹配。history保持44条 `text_recovered_in_current_reading_copy`、1条 `specific_character_gap_retained`，旧 `scripts/data` 路径已不存在，`docs/data` 路径保留235条。`src/lib/claims` 与主工作区 diff为零。R1 FAIL证据保留未覆盖。

证据：[R3报告](../output/maintenance/xyy-20261004-03/F/luna-r3/report.md)、[结构化结果](../output/maintenance/xyy-20261004-03/F/luna-r3/r3-summary.json)。本轮未启动构建、verify:release、浏览器或外部写入。

### XYY-20261004-03-D/H — Luna 浏览器验收方案准备

当前 `verify:release` 重跑尚未结束，按 Sol 指示未启动浏览器、构建或 Lighthouse。已准备 [浏览器矩阵方案](../output/maintenance/xyy-20261004-03/D/luna-plan/matrix.md)：中文9条、英文5条详情及英文总览4个分组锚点，Chromium desktop 1440/768 与 mobile viewport 390/360，覆盖横溢出、关键模块、正文数字、SEO、链接、键盘和 reduced-motion。

组合 fixture 设计为同盘 hard-link clone，仅覆盖主工作区5个动效文件；`public`/媒体和 `node_modules` 复用既有目标，不复制339MB资源，不覆盖候选或用户文件。待 Sol 发门禁结束信号后执行。

### XYY-20261004-03-C — Luna formal测试契约增量

核对 `tests/formal/production-origin.spec.ts` 与 `server/request-policy.mjs` 后确认：非可信直连请求不能采用伪造的 `X-Forwarded-Proto: https`。因此 `/index.html?source=old`、Host `56xyy.com`、直连 HTTP 且带伪造 XFP 时，legacy path 应返回 `301` 到 `https://56xyy.com/?source=old`。仅将旧相对断言更新为绝对 formal origin，并添加原因注释；未改 server、配置或全局信任设置。

原文件 SHA：`6907c30db1c8d33a5a4f9dc6d4c0f30f73666187986c98bb576b8213bff90f84`；更新后 SHA：`da57b05c71e73cf34bf188b04df40274c9f3f8741a361b3fd30715b0b48f8b9e`。`npx prettier --check tests/formal/production-origin.spec.ts` exit 0，`git diff --check` 通过。实际 formal 4项由当前门禁阶段执行，本轮未启动 server/build。

### XYY-20261004-03 — Luna integration helper Nova 返工独立复验

Task ID：`XYY-20261004-03`；Result：**PASS（helper R3；未执行真实合入）**。

Tests performed：独立隔离脚本 [luna_helper_retest.py](../output/maintenance/xyy-20261004-03/integration-helper-luna/luna_helper_retest.py) 将 helper 的 `ROOT`/`OUT`/固定 hash/HEAD 重定位到临时 git fixture，保留生产 `fileCount == 113` 门禁，生成 1 个 modified + 112 个 added 的真实 patch。普通 Python 与 `python -O`/`PYTHONOPTIMIZE=2` 下分别篡改 manifest 和 patch，4/4 均在 apply 前以精确 SHA 错误退出，target、HEAD、index 与证据文件均无副作用。positive 113 文件真实 `git apply` exit 0，target 0664 保留，1 个保护文件保持，HEAD/index 未变。注入 0664→0644 漂移得到 `postimage_posix_mode_mismatch`；删除得到 `postimage_missing`；目录替代得到 `postimage_invalid_type`，均显式失败。生产 helper 未修改，SHA-256 为 `53fede36d9564d6ec758ed804c5005c1cfb52161deeefe4b5a7b0e64490b452c`。

Evidence：结构化结果与完整 stdout 见 [luna-helper-retest.json](../output/maintenance/xyy-20261004-03/integration-helper-luna/luna-helper-retest.json)、[luna-helper-retest.stdout](../output/maintenance/xyy-20261004-03/integration-helper-luna/luna-helper-retest.stdout)；每个场景的原始 stdout/stderr/exit 在 [cases](../output/maintenance/xyy-20261004-03/integration-helper-luna/cases/)；脚本运行 exit 0。主仓库只读核对记录 79 条 baseline 路径、113 条候选 manifest、HEAD/index 前后保持；4 条角色治理日志按合同允许由并行任务更新，非治理保护路径无 mismatch，未执行真实 helper apply。

Regression coverage：覆盖 Nova 指出的 assert 在优化模式移除风险、manifest/patch 完整性门禁、113 文件计数、真实 git apply、POSIX mode、missing/nonregular postimage、protected file、HEAD/index 与生产 helper SHA。未修改业务实现、未访问 CMS/外部服务、未启动浏览器/build、未执行真实主仓库合入。

Remaining risks：本轮仅验证临时 fixture 的 helper 行为与主仓库只读保护状态；真实 113 文件合入仍需 Sol 在所有适用门禁完成后执行，并由后续步骤复核合入结果。Terra 原 selftest 的 one-file fixture count 失败记录保留，未据此修改生产 113 限制。

### XYY-20261004-03-D/H — Luna R3 独立浏览器矩阵与生产性能复核

Task ID：`XYY-20261004-03`；Result：**PASS（D/H；未部署、未合入、未写入 CMS/数据库）**。

Tests performed：在同一组合 fixture、离线 Directus fallback 和 Chromium 模拟环境执行中文9条、英文5条详情及英文总览4个锚点，四种 viewport（1440/768/390/360）。reduced-motion 原始浏览器记录72项保留；normal no-preference 原始记录72项完成滚动触发复核。按修正后的命名 failureReasons 离线重判后，reduced 72/72、normal 72/72 effective PASS：正文、数字、独有模块、SEO 元数据、内部链接、键盘契约、横向溢出、console/pageError、failedRequests 和动效可见性均通过。R1/R2 原始 FAIL 未覆盖；语言切换控件按精确目标单独判定，不能泛化忽略中文 href。浏览器中出现的具体 mp4 `net::ERR_ABORTED` 保留在 raw events，并由同环境逐 URL Range `bytes=0-15` 得到 HTTP 206、`video/mp4` 和 Content-Range 后归类为可解释媒体取消；16字节 Range 只证明资源可读，不证明完整播放。

普通模式代表截图使用全新无 hash 页面上下文：中文后整与英文 garment-care 在1440/390各保存 top/body；top 均记录 `scrollY=0` 且 H1 在视口，body 通过真实 wheel 记录 `scrollY=760/724`，无错误。此前 normal raw 中误命名的 `normal-top.jpg` 保留并标为旧底部截图，不用于顶部验收。

生产性能：fixture 自有 `dist` 构建 exit 0，容量监控器独立测量 baseline `peakBytes=720896`、`peakInodes=12`；该数值是已有 dist 上重建峰值，R4 完整构建参考峰值仍为 `755077120/6848`。同一生产构建服务上完成移动 390×844 Lighthouse 3轮×3页，9份 raw JSON 与 median 均保存且 exit 0：首页/产品/代表服务页性能中位 `0.80/0.81/0.90`，无障碍 `0.96/1/0.97`，最佳实践均 `1`，SEO 均 `0.69`。SEO 分数如实记录，未以警告阈值改写结果。

Evidence：矩阵、raw events、修正重判和媒体正向核验见 [D/luna-r3](../output/maintenance/xyy-20261004-03/D/luna-r3/)，核心文件为 `matrix-reduced`、`matrix-normal-r2-raw`、`rejudge-final.json`、`media-positive-probe.json`、`representative-normal/shots.json`；生产构建和 Lighthouse 原始/中位结果见 `production-capacity-build.log`、`lighthouse/raw/`、`lighthouse/median.json`。最终 candidate 113 文件与5个 protected motion 文件联合冻结（path/type/gitMode/SHA，另记录 fsMode）118/118 unchanged，见 `freeze-comparison-final.json`。

Regression coverage：仅写入 Luna 自有 D/luna-r3 证据、测试 runner/重判/采集辅助脚本和本日志；未修改应用实现或主5动效文件，未运行真实 CMS POST、数据库、部署或真机。4595 dev fixture 与4596 production server均已停止；最终两个端口均无监听。

Remaining risks：浏览器为模拟 Chromium，不能替代真机；Range 仅为短正向资源探针；Lighthouse SEO 中位为0.69，需由 Sol 决定是否作为发布策略风险处理。首次 production build 因 fixture 缺 baseline 的 exit 1 已由 Sol 的 observed-attempts 记录保留，随后按容量监控器重建通过，不归因产品实现。

### XYY-20261004-03-C/H — Luna 测试计时返工独立复核

Task ID：`XYY-20261004-03`；Result：**PASS（仅测试修正）**。

Expected：Astro remote image consumer 对带 `set-cookie` 的受限响应返回无正 TTL；普通 `max-age=600` 缓存和成功 304 revalidation 仍保留正 TTL。断言不应依赖机器运行速度，fake clock 结束后全局 Date 必须恢复。

Actual：主工作区 R1 原始失败保留在 [main-verify-r1-fail.log](../output/maintenance/xyy-20261004-03/main-verify-test-rework/main-verify-r1-fail.log)：721/722，`image.expires` 比 `before` 晚117ms；Astro 实际消费者为 `Date.now() + (storable ? timeToLive() : 0)`，故原 `before + 100` 是计时误差门槛。仅修改 [http-cache-semantics-astro.test.ts](../tests/unit/http-cache-semantics-astro.test.ts)，用 `vi.useFakeTimers({ toFake: ['Date'] })` 固定 `2026-10-05T00:00:00.000Z`，受限响应断言精确 `expires === fixedNow`，并在 finally 调用 `vi.useRealTimers()`；随后断言 Date 构造器身份恢复。普通缓存和304断言保持不变。

Evidence：修正后该测试 2/2 PASS，exit 0，日志见 [targeted.log](../output/maintenance/xyy-20261004-03/main-verify-test-rework/targeted.log)。原测试 SHA `35859e97da056034e5094409dec23053e0baf0997fed5c0d580967750231805f`（以 `test-before.sha256` 原始文件为准）与修正后 SHA `9f9a82af8b3746b452e6dabca490aa2e8d428f45cfd664d6980723009b6714da` 见 [test-after.sha256](../output/maintenance/xyy-20261004-03/main-verify-test-rework/test-after.sha256)，最小 diff 为21 insertions/13 deletions，`git diff --check` 通过。保留的倒置断言负控 exit 1 显示当前值等于 fixedNow；额外真实 Astro consumer mutant 临时令实际 `CachePolicy.prototype.timeToLive()` 返回1000，断言按预期 exit 1（收到 `fixedNow + 1000`），finally 恢复 prototype 与 Date，日志见 [astro-positive-ttl-mutant.log](../output/maintenance/xyy-20261004-03/main-verify-test-rework/astro-positive-ttl-mutant.log)。

Regression coverage：R1 `main-verify` 原始 exit 1 未覆盖；本轮只运行定向2测试、两个独立反例探针和格式检查，未运行主工作区全量 verify，由 Sol 执行最终门禁。未修改实现、依赖、其他113冻结文件、媒体或环境文件。独立测试及原始/修正日志见 [main-verify-test-rework](../output/maintenance/xyy-20261004-03/main-verify-test-rework)。

Remaining risks：本轮证明测试对真实 Astro consumer、正 TTL mutant 和时钟恢复的判据有效；主工作区全量 `npm run verify` 尚待 Sol 运行，不能以本次定向 PASS 代替全量门禁。

### XYY-20261007-01 — Luna 候选 clean install 前置

Task ID：`XYY-20261007-01`；Result：**BLOCKED（clean npm ci 未在有界窗口内完成）**。

Expected：候选 `/home/yj/data/xyy-release-20261007-01/candidate` 在独立 data cache/TMP 下由本次 `scripts/capacity-baseline.mjs` 监控完成 `npm ci`，随后才能进行 npm 实际解析、audit、verify 和 verify:release。

Actual：候选分支 `release/xyy-20261007-01`、HEAD `0ffe149df13148d6280b5230979eb0a3d0ea26cb`、锁文件存在且初始无 `node_modules`；4590/4591 无监听。首次 clean `npm ci` 于 `2026-10-07T21:29:59+08:00` 启动，约300秒仍未完成，日志仅有 deprecated warnings，没有 TLS 错误或成功完成标记；已停止，outer exit `130`。不把当前约545M的部分 `node_modules` 和138M cache视为 clean install，不继续重试，也未执行 audit/verify。

Evidence：独立记录见 [npm-ci-blocked.json](../output/release/xyy-20261007-01/luna/npm-ci-blocked.json)、[npm-ci.log](../output/release/xyy-20261007-01/luna/npm-ci.log)、[npm-ci.outer.exit](../output/release/xyy-20261007-01/luna/npm-ci.outer.exit)、[df-after-npm-ci-interrupt.txt](../output/release/xyy-20261007-01/luna/df-after-npm-ci-interrupt.txt)。npm cache 使用独立 data 路径，TLS 校验未被关闭；无真实 CMS、数据库或生产写入。

Regression coverage：仅完成候选基线、114变更工作区只读核对、端口检查和一次容量监控安装尝试；未修改业务、配置、锁文件或114清单，未启动应用 server。

Remaining risks：候选依赖安装状态不完整，npm 实际 Astro 补丁解析、audit、`npm run verify`、`npm run verify:release`及生成 dist 均未验证。需 Sol 决定是否另行授权清理/重试或以明确标记的 existing-deps 模式继续，不能以本次结果宣称发布通过。

### XYY-20261007-01 — Luna 候选 clean install R2

Task ID：`XYY-20261007-01`；Result：**BLOCKED（warm-cache clean npm ci 仍超时）**。

Tests/operation：先保存 R1 部分 `node_modules` 元数据（约459,000,649 bytes、34,094 files、3,260 directories），随后按限定命令执行一次 `npm ci --prefer-offline --no-audit --fetch-timeout=20000 --fetch-retries=0`，由 `scripts/capacity-baseline.mjs` 监控，外层300秒；R1 与 R2 日志、exit、容量快照分开保存。

Actual：R2 exit `124`，未生成 `candidate/output/capacity-baseline.json`，日志仍只有 deprecated warnings，没有 TLS 错误或安装脚本失败。timeout 后残留 npm 子进程已清理；当前 node_modules/cache不视为 clean install。`package-lock.json` R2 前后 SHA 一致，未修改锁文件、业务或配置。

Evidence：R1 部分目录记录见 [npm-ci-r1-partial-metadata.txt](../output/release/xyy-20261007-01/luna/npm-ci-r1-partial-metadata.txt)；R2 见 [npm-ci-r2.log](../output/release/xyy-20261007-01/luna/npm-ci-r2.log)、[npm-ci-r2.exit](../output/release/xyy-20261007-01/luna/npm-ci-r2.exit)、[npm-ci-r2-child-cleanup.exit](../output/release/xyy-20261007-01/luna/npm-ci-r2-child-cleanup.exit)、[package-lock-after-r2.sha256](../output/release/xyy-20261007-01/luna/package-lock-after-r2.sha256)。

Regression coverage：未执行第三次安装、npm audit、候选补丁解析、verify、verify:release、build、CMS/数据库或部署；未启动应用 server。不能以 R2 结果宣称发布通过。

Remaining risks：候选没有完成可验证的 clean dependency install，后续所有源码/发布门禁仍阻塞。需 Sol 决定下一步，不再由 Luna 无界重试。

### XYY-20261007-01 — Luna release candidate R3 / production-only final QA

Task ID：`XYY-20261007-01`；Result：**PASS_WITH_LIMITATION（existing-deps 完整门禁与 production-only 安装通过；clean dev npm ci 与 audit 仍有明确环境限制）**。

Tests performed：候选 `release/xyy-20261007-01`、HEAD `0ffe149df13148d6280b5230979eb0a3d0ea26cb` 的 114 文件身份核对通过：114/114 的内容 SHA、文件类型和 manifest Git mode 一致，证据见 [114-identity.json](../output/release/xyy-20261007-01/luna/114-identity.json)。候选 existing-deps fixture 在修复 `.bin` 解析和 `file:` 本地依赖链接后，由本次容量监控执行 `npm run verify:release`，实际 exit 0；日志确认 typecheck 634 files/0 errors/0 warnings/4 hints、单测 722 passed、E2E 269 passed/9 skipped、formal 4 passed、最终 build 完成，容量峰值 `1091219456` bytes/`7769` inodes，见 [verify-release-existing-deps-r3.log](../output/release/xyy-20261007-01/luna/verify-release-existing-deps-r3.log) 与 candidate `output/capacity-baseline.json`。这次 verify 明确是 existing-deps 验证，不冒称 clean full dev install。

另建独立 production-only fixture，复制精确 `package.json`、`package-lock.json`、容量脚本和本地 vendor patch，按 `npm ci --omit=dev --prefer-offline --no-audit --fetch-timeout=20000 --fetch-retries=0` 执行一次，exit 0；容量峰值 `186146816` bytes/`13502` inodes。实际 consumer probe exit 0，解析路径为 fixture 内 `scripts/vendor/http-cache-semantics/index.js`，patched source SHA `60318d6615aa1c7cbce1df85909ba67ac632f761dec33cea64ca3e32083c11a3`，见 [npm-ci-production.log](../output/release/xyy-20261007-01/luna/npm-ci-production.log)、[production-cache-patch-consumer.log](../output/release/xyy-20261007-01/luna/production-cache-patch-consumer.log)。

Regression coverage：R1 clean `npm ci` exit 130、R2 bounded warm-cache clean `npm ci` exit 124 均原样保留，均未视为成功；candidate lock/source 未因安装改变。R3 覆盖 Astro check、lint、maintainability、asset/font checks、cache patch resolution、722 单测、269 E2E/9 skip、4 formal 和生产 build。production-only 覆盖真实 npm file dependency 安装及 patched cache consumer。此前 114 身份脚本错误的反例保留为 [114-identity-initial-script-bug.json](../output/release/xyy-20261007-01/luna/114-identity-initial-script-bug.json)，修正后以类型归一化重新核对通过。

Remaining risks：production-only `npm audit --omit=dev` 已按 20s/0 retries、120s 外层窗口单独执行但 exit 1，npm debug 显示官方 advisory bulk endpoint `ETIMEDOUT`，因此 audit 结果为环境阻塞而非安全通过/失败，见 [npm-audit-production.log](../output/release/xyy-20261007-01/luna/npm-audit-production.log) 与 [npm-audit-production-debug-tail.txt](../output/release/xyy-20261007-01/luna/npm-audit-production-debug-tail.txt)。两次 full dev clean install 超时，故本报告不能替代干净 dev dependency install；CMS candidate_unverified 门禁、提交/推送、部署和真实 CMS/数据库写入均未执行。候选可交 Sol 进行后续授权范围内的提交门禁判断，不能据本报告宣称已发布。
### XYY-20261008-01 — Luna 独立验收

Task ID：`XYY-20261008-01`；Result：**PASS**。

Tests performed：读取任务合同、当前 `DEV_STATE.md` 相关段落、Git 基线/状态、`src/scripts/contact-enquiry.ts` diff 和本日志相关上下文；确认实现 diff 仅替换中文两项 `title/line`，`git diff --check -- src/scripts/contact-enquiry.ts` exit 0。按 Playwright 技能使用缓存 CLI 与本地离线 Astro dev（显式 `DIRECTUS_URL/PUBLIC_DIRECTUS_URL=http://127.0.0.1:1`、空 token、空 Xiangsu 接口、`ENABLE_DOMAIN_REDIRECTS=false`，未读取真实 `.env`），打开 `/contact` 与 `/en/contact`，先 snapshot 后操作并保存截图。中文 1440×900 点击提纲后精确得到五行 `品类：`、`SKU/订单规模：`、`销售渠道：`、`日均发货单量：`、`B2B还是B2C模式：`，每项 1 次且旧 `退货情况：`/`计划时间：`均为 0；使用实际换行的已有输入 `已有需求\n品类：鞋` 点击两次后已有内容保留、结果稳定、字段不重复。中文 390×844 同样顺序通过，viewport `390×844`、`scrollWidth=clientWidth=390`，按钮 `44px` 高且可用。英文一次抽查仍精确为基线五行 `Category:`、`SKU / order scale:`、`Sales channels:`、`Returns scenario:`、`Target timeline:`，无中文新增字段且无水平溢出。未勾选同意框、未提交表单、未向 CMS/数据库/外部系统写入。

Regression coverage：覆盖中文空文本插入、中文已有字段保留、重复点击幂等、桌面/移动视口按钮与横向溢出、英文基线文案；证据保存在 [contact-outline](../output/contact-outline/xyy-20261008-01/) 与 [playwright](../output/playwright/xyy-20261008-01/)，截图为 `zh-desktop.png`、`zh-mobile.png`。浏览器为本地 Chromium 模拟视口，未运行 `npm run verify`/`verify:release`，符合本次 LOW 任务合同。

Remaining risks：未覆盖真机、Safari/微信浏览器和真实询盘接收；本次无业务实现遗留。Playwright daemon 已执行 `kill-all`；Astro CLI 的后台服务状态在沙箱跨命令空间不可见，`astro dev stop` 未能确认回收，端口 4598 的停止状态受该环境限制，未对其他进程做破坏性 kill。

复测补证（同一 Task ID）：使用 `const nl=String.fromCharCode(10)` 与 `['已有需求','品类：鞋'].join(nl)` 实际换行输入，断言 `initialHasRealLf=true`、`initialHasLiteralBackslashN=false`、已有内容保留、`品类：`出现 1 次、包含 `品类：鞋`，连续两次点击结果稳定。证据见 [zh-existing-real-newline-assertion.txt](../output/playwright/xyy-20261008-01/zh-existing-real-newline-assertion.txt)；本地启动命令日志见 [astro-dev-live.log](../output/contact-outline/xyy-20261008-01/astro-dev-live.log)，该命令的 functions.exec session 已结束，后台进程记录 pid `49` 仅存在于沙箱外命名空间，当前会话无法通过 `write_stdin` 操作。

### XYY-20261008-01 R2 — Luna 英文同步独立验收

Task ID：`XYY-20261008-01`；Result：**PASS**。

Tests performed：读取 R2 合同、最新 `DEV_STATE.md` 相关段落、目标 diff 和最近 Luna 日志；确认 `src/scripts/contact-enquiry.ts` 的中文五项与英文两项替换均符合合同，`git diff --check -- src/scripts/contact-enquiry.ts` exit 0。复用 Sol 已启动的 `http://127.0.0.1:4322`，GET `/en/contact` 返回 200、103131 bytes；未启动或停止该服务。使用独立 Playwright session `xyy-20261008-01-r2`，先 snapshot 后操作。英文 1440×900 点击提纲后精确得到 `Category:`、`SKU / order scale:`、`Sales channels:`、`Average daily shipments:`、`Business model (B2B or B2C):`，各 1 次，旧 `Returns scenario:`/`Target timeline:` 均为 0，无水平溢出。英文 390×844 同样顺序通过，`scrollWidth=clientWidth=390`，按钮高 44px 且可用。使用 `String.fromCharCode(10)` 构造真实换行已有内容 `Existing request\nBusiness model (B2B or B2C): B2C`，两次点击后已有内容和 `B2C` 保留，Business model 字段仅 1 份，结果稳定。中文联系页五项顺序、旧字段为 0、无水平溢出回归通过。未提交表单、未写 CMS/数据库/外部系统。

Regression coverage：英文桌面/移动空文本插入、旧字段移除、按钮可用与横向溢出；英文真实换行已有字段保留和重复点击幂等；中文五项回归。截图与断言见 [output/playwright/xyy-20261008-01-r2](../output/playwright/xyy-20261008-01-r2/)，命令与 GET 结果见 [output/contact-outline/xyy-20261008-01/r2](../output/contact-outline/xyy-20261008-01/r2)。英文桌面/移动截图已亲看。

Remaining risks：验证限本地 Chromium 模拟视口，未覆盖真机、Safari/微信浏览器、真实询盘接收和线上版本；未运行全量 `verify`/`verify:release`，符合本次 LOW R2 合同。仅关闭本次 Playwright session，4322 按合同保持运行。

### XYY-20261008-03 — Luna 页脚小红书入口独立验收

Task ID：`XYY-20261008-03`；Result：**PASS（本地实现；外站跳转受平台限制）**。

Tests performed：读取任务合同、当前 `DEV_STATE.md`、目标四文件及最近日志；目标格式/diff 已由 Terra 交接通过，本轮未修改实现。复用 Sol 运行中的 `http://127.0.0.1:4322`，`/contact`、`/en/contact`、`/about`、`/en/about` GET 均 200；未启动或停止该服务。使用 Playwright session `xyy-20261008-03`，先 snapshot 后操作，覆盖四页 1440×900 与 390×844，关于页额外 768×900。每个组合入口计数均为 1；中文显示 `小红书`、英文显示 `Xiaohongshu`；完整 href 比较均为 `hrefMatches: true`，profile id 均为 `6182ae3e0000000021028953`，未在日志保留分享参数；`target=_blank`、`rel=noopener noreferrer`、本地化新窗口 aria、可见性、文字可读性和高度 44px 均通过。所有组合无水平溢出；入口与电话、地址、返回顶部均无几何重叠；Tab 可聚焦并观察到 `:focus-visible`、2px solid outline/2px offset；版权与电话/地址节点保留，iframe 数为 0。平台名资源计时的唯一一项实际为本地 Astro HMR `/src/components/XiaohongshuLink.astro`，不是外部平台请求；独立 origin probe 确认为 `http://127.0.0.1:4322`。当前中文/英文填写提纲回归各自精确通过五项既有文案。未登录、关注、提交表单或写入任何外部系统。

外链只读：点击本地入口打开新标签，初始 profile id 正确且本地联系页保持；有限等待后小红书落到 `website-login/error`，观察到 `error_code=300012` 的 IP 风险提示。未继续重试、未登录/关注/写入；该结果归类为外站限制，本地 href/新标签实现仍独立通过。完整比较仅保留布尔值/profile id，参数已从保存证据脱敏。

Regression coverage：通用页脚与关于页独立页脚中英文桌面/移动矩阵、关于页 768 宽度、按钮尺寸、键盘 focus-visible、电话/地址/返回顶部/版权保留、第三方 iframe/平台请求、既有中英文提纲；四张代表截图已亲看：`contact-zh-mobile.png`、`contact-en-mobile.png`、`about-zh-desktop.png`、`about-en-desktop.png`。证据见 [output/playwright/xyy-20261008-03](../output/playwright/xyy-20261008-03/) 与 [output/footer-social/xyy-20261008-03](../output/footer-social/xyy-20261008-03/)；外链摘要见 [external-click-summary.md](../output/playwright/xyy-20261008-03/external-click-summary.md)。

Remaining risks：浏览器为本地 Chromium 模拟视口，未覆盖真机、Safari/微信浏览器和真实线上版本；小红书外站受当前 IP 风险页限制，未验证登录后页面内容。未运行全量 `verify`/`verify:release`，符合 LOW 合同；仅关闭本次 Playwright session，4322 按要求保持运行。

### XYY-20261008-03 R2 — Luna 页脚视觉独立验收

Task ID：`XYY-20261008-03`；Result：**PASS**。

Tests performed：复用 Sol 保持运行的 `http://127.0.0.1:4322`，本次 GET `/contact` 与 `/en/about` 均返回 200；未启动或停止该服务。使用独立 Playwright session `xyy-20261008-03-r2`，先 snapshot 后检查 `/contact`、`/en/contact`、`/about`、`/en/about` 的 1440×900 与 390×844，并对关于页增加 768×900。10 个实际 URL/视口结果均通过：中文标题 `关注我们`、英文标题 `FIND US ON`，各页仅 1 个入口；真实 Simple Icons path（1 个 path，长度 3469）渲染为深色 `rgb(17, 24, 39)`，SVG 48×48；无粉色/胶囊 border/background、无可见账号标签或外链箭头。href 完整一致性由本地 source check 布尔结果 `hrefUnchanged=true` 证明，浏览器仅记录 profile id 和形状，不记录分享参数；`target=_blank`、`rel=noopener noreferrer`、本地化 title/aria、`aria-hidden`、focusable 与 ≥44px 触控尺寸通过。Tab 聚焦 10/10 观察到 2px solid、2px offset outline；无水平溢出，电话/地址/版权保留且无重叠；页面未产生小红书外部资源请求。补拍并亲看默认态页脚截图四张，标题在上、黑色图标在下且无 focus 外框。headed 尝试因容器无 X server 受限，改用同一 CLI 的 headless 截图完成视觉检查；未访问或点击外站。

Regression coverage：覆盖通用页脚和关于页独立页脚中英文、桌面/移动/768 宽度、单入口与精确 heading、SVG 实际 path/深色填充、无胶囊样式、href/target/rel/aria/title、键盘 focus-visible、横向溢出、电话/地址/版权与布局重叠。视觉证据与本次命令结果见 [output/playwright/xyy-20261008-03-r2](../output/playwright/xyy-20261008-03-r2/)，四张默认态代表截图为 `contact-zh-mobile-default-footer.png`、`contact-en-desktop-default-footer.png`、`about-zh-mobile-default-footer.png`、`about-en-desktop-default-footer.png`；源检查摘要见 [source-check-summary.json](../output/footer-social/xyy-20261008-03/r2/source-check-summary.json)。完整分享参数未写入日志或摘要。仅关闭独立 session，4322 保持运行。

Remaining risks：本地 Chromium 为模拟视口，headed 截图受当前无 X server 环境限制，未覆盖真机、Safari/微信浏览器和真实线上版本；未访问外站，因而不判断平台页面内容。未运行全量 `verify`/`verify:release`，符合本轮 R2 视觉合同；实现与 href 未由 Luna 修改。

### XYY-20261008-03 R3 — Luna 三平台页脚与微信公众号弹层独立验收

Task ID：`XYY-20261008-03`；Result：**PASS**。

Tests performed：沿重新冻结后的源码执行本地独立检查：三条 SVG path 长度为 `[3469, 597, 1220]` 且与 R3 指定参考逐字一致，无自定义脚本；小红书 href 完整一致性为 `true`（仅记录 profile id），抖音 href 精确匹配用户输入，二维码源/目标/HTTP 资源 SHA256 均为 `c9b19b7b0bc10ecbc2db4399c0076cfd111aa27ce27f53733ab06cb22df885ba`。复用 `http://127.0.0.1:4322`，`/contact` 与 `/about` GET 均返回 200，未启动或停止服务。

使用独立 Playwright session `xyy-20261008-03-r3`，每个页面均 fresh snapshot 后检查 `/contact`、`/en/contact`、`/about`、`/en/about` 的 1440×900/390×844，关于页增加 768×900，共 10 组合。每组合均通过本地化 heading、唯一三入口及顺序“小红书/抖音/微信”、精确外链安全属性、48px 入口尺寸、深色 SVG、无默认背景/边框、键盘 focus、电话/地址/版权保留、无横向溢出/重叠、无外部图片请求。微信默认收起；键盘 Space 与鼠标点击均打开，二维码实际加载 258×258 且卡片完整位于视口；关闭按钮、Esc、外部点击均关闭并可重新打开。关闭按钮和 Esc 后 focus 返回微信触发按钮；外部点击关闭后 focus 返回为 `false`，已如实记录。中英文标题、说明、alt、关闭 aria 均通过。

联系提纲使用实际 textarea 交互验证：中文与英文空文本各五项均 1 次、旧字段均 0；用实际换行构造既有内容后字段值保留、每项仍 1 次，重复点击结果稳定。未勾选同意、未提交表单、未访问或点击抖音/小红书外站。

Regression coverage：三平台通用/关于页中英文 10 视口矩阵、移动 QR 视口约束、popover 鼠标/键盘/关闭按钮/Esc/外部点击/重开、SVG 参考路径、href/target/rel/aria/title、二维码完整性与原图 hash、电话地址版权、横向溢出、中文/英文提纲。四张默认态页脚截图与两张中英文 QR 打开态截图已亲看：证据见 [output/playwright/xyy-20261008-03-r3](../output/playwright/xyy-20261008-03-r3/)，摘要见 `r3-summary.json`，源与 hash 见 [source-summary.json](../output/footer-social/xyy-20261008-03/r3/source-summary.json)。首轮严格定位、脚本三元表达式和由此产生的隐藏截图超时均保留在证据目录，均判定为验证脚本错误；最终结果只采用修正后的 10 组合与 smoke/textarea 证据。仅关闭独立 session，4322 保持运行。

Remaining risks：本地 Chromium 为模拟视口，容器无 X server，未覆盖真机、Safari/微信浏览器；未执行扫码真机验证，未访问外站，外链落点内容不在本轮结论内。外部点击关闭后的 focus 不自动回到触发按钮，已记录为实现行为观察项；合同要求记录该情况，本轮关闭/重开本身通过。未运行全量 `verify`/`verify:release`，未进行 CMS、数据库、真实询盘、提交或部署。

焦点补证（同一 Task ID）：Result：**PASS**。独立 session `xyy-20261008-03-r3-focus` fresh snapshot 后，选择通用中文 `/contact` 与关于英文 `/en/about`，分别在 1440×900、390×844 用键盘 Tab 获取三个社交控件及微信公众号 popover 关闭按钮焦点。4/4 组合、16/16 控件均 `:focus-visible=true`，computed outline 为 `2px solid rgb(10, 26, 51)`，入口尺寸 48×48；popover 打开状态下关闭按钮也由 Tab 获取并通过。证据见 [focus-visible-summary.json](../output/playwright/xyy-20261008-03-r3/focus-visible-summary.json)，亲看截图为 `contact-zh-desktop-focus-visible.png`。仅追加本证据与本日志，未改实现；session 已关闭，4322 保持运行。

### XYY-20261008-04 — Luna 通用页脚企业文化独立验收

Task ID：`XYY-20261008-04`；Result：**PASS**。

Tests performed：先以 `/contact` 1440×900 smoke 验证真实 200 返回与目标 DOM，再使用独立 Playwright session `xyy-20261008-04`，每个组合均 fresh snapshot 后检查 `/contact`、`/en/contact` 的 1440/390/768，共 6 组合。中文标题为“企业文化”，英文为“Corporate culture”；四组 `dt/dd` 顺序、标点及文案逐字符合合同，dt 为加粗，旧成立年份/规模简介在该文化块移除。六组合文化块自身无列内重叠、无横向溢出、无裁切；Logo、电话、导航、地址、三社交入口与版权保留。首页 `/` 与 `/en` 只读 GET 均返回 200。微信按钮一次抽查默认关闭、打开、二维码加载、卡片在视口内、关闭按钮关闭均通过。

为避免 element screenshot 的滚动对固定导航造成视觉伪影，另用真实 390×844 当前 viewport 将文化块置于既有导航下方并亲看中文/英文截图：中文文化块 `top=76.17,bottom=258.67`、英文 `top=76.34,bottom=349.84`，导航底部约 64px，四项与电话均完整可见。之前 element screenshot 中固定导航覆盖文化块的现象已保留在 `post-probe.txt`，分类为截图定位伪影，不作为本轮页面失败。

Regression coverage：覆盖文化文案及旧文案移除、中文/英文 1440/390/768 布局、Logo/电话/导航/地址/三社交/版权保留、微信原生二维码开关、首页中英 HTTP、页脚文化源码边界哈希。`FooterSocialLinks.astro`、`AboutMinimalFooter.astro`、`contact-enquiry.ts` 相对基线均 unchanged；摘要见 [culture-summary.json](../output/playwright/xyy-20261008-04/culture-summary.json) 与 [source-summary.json](../output/footer-culture/xyy-20261008-04/source-summary.json)。已亲看中文/英文桌面与移动默认页脚，以及真实 viewport 中文/英文移动文化区截图：证据见 [output/playwright/xyy-20261008-04](../output/playwright/xyy-20261008-04/)。未重跑 R3 全矩阵、未运行全量 typecheck/verify，未访问外站、CMS、数据库、真实询盘或部署；仅关闭独立 session，4322 保持运行。

Remaining risks：浏览器为本地 Chromium 模拟视口，未覆盖真机、Safari/微信浏览器；真实 viewport 移动截图证明文化区本身可读，element screenshot 的固定导航伪影不代表正常页面布局失败。未验证线上版本和扫码真机行为。

### XYY-20261008-05 R1 — Luna 首页统计发布状态与字段投影复测

Task ID：`XYY-20261008-05`；Result：**PASS**。

Tests performed：读取最终合同、Terra 冻结 diff、`tests/unit/homepage-cms-contract.test.ts` 和相关 Directus 测试。最终实现请求 `homepage_content` 的 `fields: ['id', 'status', 'stats']`，只接受 `published`；`draft`、成功空 singleton 和 published 空 stats 均返回 `[]`，不使用 fallback；缺失、null、archived、unknown 状态及非法 stats 均抛出 `invalid_data`。新契约测试在 `fetch` 边界解析真实 URL 的 `fields` 参数，并按字段动态投影完整记录，未返回固定完整对象。独立运行 `npx vitest run tests/unit/homepage-cms-contract.test.ts tests/unit/directus.test.ts tests/unit/directus-resilience.test.ts tests/unit/homepage-claims-contract.test.ts tests/unit/directus-error-semantics.test.ts tests/unit/directus-content-resilience.test.ts tests/unit/english-acceptance-cms.test.ts`，exit 0，7 files / 47 tests passed，见 [targeted-r1.log](../output/homepage-stats/xyy-20261008-05/luna/targeted-r1.log)。运行 `npm test`，exit 0，114 files / 729 tests passed，证明新测试被现有 Vitest glob及 `verify` 使用的 `npm test` 路径收录；原始日志保留一行工具输出 `Terminated`，但命令最终 exit 0 且汇总全绿，见 [npm-test-r1.log](../output/homepage-stats/xyy-20261008-05/luna/npm-test-r1.log)。目标源码/测试 `prettier --check`、`eslint`、`git diff --check` 分别 exit 0，见 `format-r1.log`、`eslint-r1.log`、`diff-check-r1.log`。

Regression coverage：published 记录返回 `partnerBrands` 的审核数字 `150+`，CMS value 不覆盖 Claims；draft、空 singleton、published 空 stats 在非空 fallback 下均保持 `[]`；缺失/null/archived/unknown status 与 null stats 均明确 `invalid_data` reject。既有 `directus.test.ts`、`directus-resilience.test.ts`、`homepage-claims-contract.test.ts`、`directus-error-semantics.test.ts`、`directus-content-resilience.test.ts`、`english-acceptance-cms.test.ts` 覆盖网络错误、超时、500 回退，401/403、非法 JSON/数据不回退，及英文 CMS 语义；相关 7 文件全部通过。最终源码行 `src/lib/directus-queries.ts:44-57` 与新契约投影逻辑 `tests/unit/homepage-cms-contract.test.ts:13-26,58-109` 已核对。

Remaining risks：本轮只使用本地 Vitest `fetch` mock 和测试 requester，未访问真实 Directus、网络数据库、生产环境、CMS 写入或部署；未运行 `npm run verify`/`verify:release`，但 `npm test` 全量已通过，typecheck 沿用 Terra 当前日志的 639 files / 0 errors / 0 warnings / 4 existing hints。未修改实现或正式测试，仅追加本日志与 `output/homepage-stats/xyy-20261008-05/luna/` 证据；交 Sol 进入 Nova Review。
补充核对（同一 Task ID）：只读搜索并定位 `npm-test-r1.log` 中孤立的 `Terminated`。`tests/unit/maintenance-capacity.test.ts:54-79` 明确启动 `process.kill(process.pid, 'SIGTERM')` 子进程并断言 `capacity_baseline_command_failed`；`scripts/capacity-baseline.mjs:50-54` 对该 shell 使用 `stdio: 'inherit'`，故 shell 的终止诊断会出现在 npm/Vitest 输出；实现 `:59-61,:83` 与测试断言共同完成预期非零子进程路径。该行出现在全量测试成功汇总之前，归因已确认，不是首页 CMS 测试错误。证据见 [term-provenance-r1.txt](../output/homepage-stats/xyy-20261008-05/luna/term-provenance-r1.txt)；未重跑全量、未修改实现或正式测试。

### XYY-20261008-06 R2 — Luna 首页并行 SSR 独立验收

Task ID：`XYY-20261008-06`；Result：**PASS**。

Tests performed：使用本地 loopback Directus mock 与 Astro dev SSR，固定每个 CMS 请求 200ms；修改前隔离副本与当前源码分别对 `/`、`/en` 预热后各采样 3 次。每个样本均为 5 个 CMS 请求且 `site_settings` 恰好 1 次。当前结果文件记录 baseline 中文中位 `439.11ms`、英文 `454.51ms`，修改后中文 `251.23ms`、英文 `252.04ms`；baseline settings 启动偏移约 `207.06–210.09ms`，修改后约 `0.74–1.95ms`。连续请求返回 `400-TEST-0003..0008` 与对应 `粤ICP备TEST-0003..0008号`，证明每次 SSR 都重新读取设置。实际请求、字段查询、启动/结束时序及响应值见 [ssr-comparison.json](../output/homepage-parallel/xyy-20261008-06/luna/ssr-comparison.json) 和同目录 mock NDJSON。

使用 Playwright CLI 对本地 SSR mock 页面检查中文/英文首页的 `1440×900` 与 `390×844`。四组均得到 200 页面、正确 `lang`/标题、动态电话与备案信息，英文页面保留英文内容和导航；`document.documentElement.scrollWidth <= innerWidth` 四组均为 `true`。截图见 [output/playwright/xyy-20261008-06](../output/playwright/xyy-20261008-06/)，包括 `zh-desktop-1440x900.png`、`zh-mobile-390x844.png`、`en-desktop-1440x900.png`、`en-mobile-390x844.png`。本地 benchmark/browser app 与 mock 端口已关闭；复核时既有 `4321` 仍在监听，`4322` 当时未监听，未停止或触碰既有服务。

Regression coverage：定向执行 8 个相关 Vitest 文件，exit 0，`8 files / 41 tests passed`，覆盖 Directus 内容、成功空内容、错误语义、英文 settings、首页 CMS 与 Claims 合同；目标 `prettier --check`、`eslint`、`git diff --check` 均 exit 0。Sol 已提供最终 typecheck exit 0（639 files、0 errors、0 warnings、4 existing hints），本轮未重复。未运行全量 `verify`/`verify:release`，符合本任务合同。

Remaining risks：证据只代表本机固定延迟与 loopback mock，不代表线上 TTFB、真实 CMS 权限或真实网络；browser fixture 将非 settings CMS 集合设为 503，以检查静态 fallback 页面，未访问真实 CMS/数据库，也未提交、部署或写入外部系统。实现文件、正式测试和配置未由 Luna 修改；交 Sol 进入 Nova Review。

### XYY-20261008-07 R1 — Luna Lighthouse/CrUX 独立验证

Task ID：`XYY-20261008-07`；Result：**FAIL**。

Expected：CrUX 官方 CLS p75 使用比例小数；成功 observed 必须有有效 `collectionPeriod`，并拒绝 boolean、空白、负数或非有限 p75；缺 key、NOT_FOUND、403 和网络错误需明确失败/无数据。Lighthouse 两设备应覆盖同一八路由、每路三次并以 native median 聚合；runner 对路由、样本、运行时、HTTP 和 assert 失败返回非零。

Actual：`scripts/crux.mjs:35` 将 fixture 的官方 CLS `p75=0.1` 输出为 `0.001`；缺少 `collectionPeriod` 仍输出 `observed` 且为 `null`；`true`、`"  "`、`-1` p75 均 exit 0 并输出 observed；fetch 无 timeout，永不完成的网络请求会无界等待。已确认缺 key exit 1、404/`NOT_FOUND` 输出 PHONE/DESKTOP `no_data` 并 exit 2、403 exit 1、网络异常 exit 1。Lighthouse 配置/runner loopback fixture 通过八路由、三样本 median 及各类硬失败/断言非零传播。

Reproduction：`npx vitest run tests/unit/crux.test.ts` 为 7 tests / 5 failed；`npx vitest run tests/unit/lighthouse-config.test.ts tests/unit/lighthouse-runner.test.ts` 为 2 files / 9 tests passed。测试与官方格式 fixture 均为本地 loopback，不访问外部写入。实现 `node --check`、测试 Prettier、ESLint、scoped `git diff --check` 均 exit 0。

Evidence：详细报告见 [R1 report](../output/lhci/xyy-20261008-07/luna/report-r1.md)；分配范围新增测试为 [crux.test.ts](../tests/unit/crux.test.ts)、[lighthouse-config.test.ts](../tests/unit/lighthouse-config.test.ts)、[lighthouse-runner.test.ts](../tests/unit/lighthouse-runner.test.ts)。Terra 的容量阻塞和正式 CrUX key 缺失沿合同记录，未以 fixture 冒充生产数据。

Likely affected area：`scripts/crux.mjs` 的 CLS/p75 解析、collection window 校验与 fetch 生命周期；`docs/PERFORMANCE_BASELINE.md` 的 enforce 稳定性轮数/阈值 JSON 启用条件仍不够可操作；CI 当前一个 upload-artifact 步骤包含两个设备目录，若 AC 要求两个独立下载 artifact 仍需核对。

Severity：CrUX 数据正确性为 High，任务整体按合同为 MEDIUM；错误 CLS 单位和非法 observed 会误导真实体验结论，无界 fetch 可能阻塞 CI/CLI。Lighthouse 配置/runner 当前已测范围未发现失败。

Remaining risks：Sol 后续已清理两份旧依赖并确认 `check:capacity` exit 0、约 3.2 GiB 可用；完整生产 build 与两设备 48 次采样仍待 Terra 返工后按 Sol 调度顺序执行。真实 CrUX key 未配置，生产 PHONE/DESKTOP p75 仍 unknown；未修改实现、CI、生产环境、CMS、数据库或部署。

补充构建证据（同一 Task ID）：按 Sol R2 前置合同使用 loopback CMS、空询盘配置和关闭域名跳转执行离线 `time npm run build`。既有容量 gate 实测 `freeBytes=3151908864`、`requiredBytes=3221225472`、`freeInodes=7885408`、`requiredInodes=8560`，`capacity_preflight_blocked` exit 1，耗时 0.38s；未进入 Astro build，未运行监控脚本、48 次采样或 verify:release。证据见 [build-r1](../output/lhci/xyy-20261008-07/luna/build-r1.md)。

R2 构建补证（同一 Task ID）：Sol 清理合同允许的四份历史 dist 后，容量 gate `capacity_check_ok`。同一 loopback/空询盘/关闭域名跳转命令 `npm run build` exit 0，`check-public-artifacts`、字体准备、`check-public-assets`（69 referenced、103 deployment、527 source）及 Astro server build 均通过，server built in 5.40s，shell elapsed 9.52s。`/404.html` 的 `site_settings` 仅触发既有网络 fallback。未运行监控脚本、48 次采样或 verify:release。证据见 [build-r2](../output/lhci/xyy-20261008-07/luna/build-r2.md)。

### XYY-20261008-07 R2 — Luna 完整 Lighthouse / CrUX 独立复测

Lighthouse Result：**PASS（pipeline；指标告警单列）**。使用 Node `v24.18.0`、Google Chrome `154.0.8037.57`、`LHCI_MODE=observe`、`LHCI_CHROME_PATH=/usr/bin/google-chrome`，执行 `npm run test:lhci:all` 顺序 desktop→mobile，exit 0，elapsed 15:16.87。两设备均生成 24 manifest entries、8 路由×3 样本、median summary；manifest 解析的 runtimeErrors/httpErrors 均为 0。desktop 当前24 JSON+24 HTML；mobile 当前 manifest 引用24 JSON+24 HTML，目录额外保留采样前已有4 JSON+4 HTML，未删除且不计入当前样本。原始证据副本见 [raw](../output/lhci/xyy-20261008-07/luna/raw/)，摘要与完整说明见 [lhci-r2-report](../output/lhci/xyy-20261008-07/luna/lhci-r2-report.md)。

Observe 不是“全部阈值通过”：最终 fresh mobile assertion-results 快照为 13 个 warn，包括 mobile 全8页 SEO 0.69、首页/关于 performance、产品/关于 LCP、关于 TBT。desktop 运行日志另独立打印 8 个 SEO warn；未保留独立 desktop assertion-results 快照，因此 13 不是两设备合计，也不宣称有可复核的持久化合计21。其余路由样本仍按实际 median 记录；Lighthouse TBT 不替代 INP。

Native enforce Result：**PASS（故障传播）**。不重采样，直接对本次 mobile fresh LHR 执行合法完整 threshold JSON（performance=1，其余合理宽松），`npx lhci assert --config=lighthouserc.mobile.cjs` exit 1，8 个 performance native error assertions；observe exit 0 与 enforce exit 1 结果分别保留为 [assertion-results-observe](../output/lhci/xyy-20261008-07/luna/assertion-results-observe.json) / [assertion-results-enforce](../output/lhci/xyy-20261008-07/luna/assertion-results-enforce.json)。CI R2 已拆为 desktop/mobile 两个 `always()` artifact 步骤，静态核对路径分别为 `output/lighthouse/desktop/` 与 `output/lighthouse/mobile/`。

CrUX contract Result：**PASS（本地契约）**。Terra R2 后 `npx vitest run tests/unit/crux.test.ts` 为 1 file / 14 tests passed，覆盖官方 CLS 比例、字符串 p75、URL/PHONE、合法闰日、非法日期/倒序/字符串日期、非法 p75、NOT_FOUND、403，以及真实 CLI response body 挂起并缩短 timer 后确认 `crux_api_timeout`。目标 Prettier、ESLint、`node --check scripts/crux.mjs`、scoped `git diff --check` 均 exit 0；`npm run typecheck` exit 0，645 files、0 errors、0 warnings、4 hints。

Production field data Result：**BLOCKED/unknown**。真实 `CRUX_API_KEY` 仍未配置，既有公开 PageSpeed 只读请求超时；不把本地 LH 或无响应推断为 CrUX 无样本、通过或失败。未访问真实 CMS/询盘/数据库，未部署、提交或推送。

### XYY-20261008-09 — Luna robots AI 独立验收

Task ID：`XYY-20261008-09`；Result：**PASS**。

Tests performed：读取本任务合同、`AGENTS.md`、相关 `DEV_STATE.md` 段落、Terra 交接 diff、`src/pages/robots.txt.ts`、`output/robots-ai/xyy-20261008-09/robots-before.txt`、`tests/unit/robots-policy.test.ts` 及最近相关日志。定向 `npx vitest run tests/unit/robots-policy.test.ts` exit 0（1 file / 3 tests）；`npx prettier --check src/pages/robots.txt.ts tests/unit/robots-policy.test.ts` exit 0；`git diff --check -- src/pages/robots.txt.ts tests/unit/robots-policy.test.ts` exit 0；业务 diff 独立检查 exit 0，为 0 additions / 3 deletions，删除行仅为 GPTBot 分组的 `User-agent`、`Disallow: /` 和空行。

独立启动专用 Astro dev 服务 `127.0.0.1:4399`，环境显式使用不可达 loopback CMS `DIRECTUS_URL=http://127.0.0.1:9`、空内容/联系 token、本地 `PUBLIC_SITE_URL`，未接触真实 CMS。实际 `curl -sS -D - --max-time 10 http://127.0.0.1:4399/robots.txt` exit 0、HTTP 200。响应无 GPTBot 分组、无根 `Disallow: /`；通用组与 OAI-SearchBot 组均有 `Allow: /` 及 `/admin/`、`/api/`、`/cms/`、`/preview/`、`/search?` 五项限制；Sitemap、`text/plain; charset=utf-8` 与 `public, max-age=86400` 保持。独立 Node fetch/parser 校验 exit 0，结构化结果见 [luna-validation.json](../output/robots-ai/xyy-20261008-09/luna-validation.json)，完整 HTTP 证据见 [luna-http-response.txt](../output/robots-ai/xyy-20261008-09/luna-http-response.txt)。验证后已发送 Ctrl-C 关闭本次 4399 服务；复核端口仅既有 4321 仍监听。

Regression coverage：覆盖现有三项 robots policy parser 单测、目标格式、scoped diff check、三行业务 diff 边界和实际本地 HTTP 响应/响应头/robots 分组解析。既有单测中的 GPTBot 禁止 fixture 保留为 parser 负向样例，未修改正式测试或应用实现；未运行全量 `verify` / `verify:release`，符合本次 LOW 静态变更合同。

Remaining risks：验证仅代表当前本地 Astro 服务和显式不可达 CMS 环境，未验证线上部署版本、真实爬虫抓取或代理缓存；本任务未提交、推送、部署、写入 CMS/数据库或访问外部系统。证据目录为 [output/robots-ai/xyy-20261008-09](../output/robots-ai/xyy-20261008-09/)。

### XYY-20261008-10 — Luna llms 内容独立验收

Task ID：`XYY-20261008-10`；Result：**PASS**。

Tests performed：读取任务合同、`AGENTS.md`、当前 `DEV_STATE.md` 相关段落、Terra 交接与 `src/pages/llms.txt.ts`、`llms-before.txt`、案例 fixture 及指定相关测试。定向 `npx vitest run tests/unit/claims.test.ts tests/unit/english-cases-published.test.ts tests/unit/english-case-routes.test.ts tests/unit/english-routes.test.ts tests/unit/whitepaper-content.test.ts` exit 0（5 files / 22 tests）；`npx prettier --check src/pages/llms.txt.ts` exit 0；`npx eslint src/pages/llms.txt.ts` exit 0；`git diff --check -- src/pages/llms.txt.ts docs/LUNA.md` exit 0。

使用本地案例 fixture 启动 Directus mock `127.0.0.1:4400`，仅返回 `tests/fixtures/cases.published.json` 或成功空数组；Astro 专用服务运行于 `127.0.0.1:4399`，显式使用 loopback `DIRECTUS_URL`、dummy content token、空询盘端点和 `PUBLIC_SITE_URL`，未连接真实 CMS。最终 `node /tmp/llms-content-validate.mjs` exit 0：发布案例与空案例两次真实 HTTP `/llms.txt` 均 HTTP 200，`Content-Type: text/plain; charset=utf-8`、`Cache-Control: no-store`；四项企业文化与当前 `shellCopy('zh-CN')` 值匹配，六项 Claims 值分别出现，49 个静态绝对 URL、6 个中英文动态案例 slug、14 个白皮书 URL 均通过。切换 mock 为成功 `cases=[]` 后，6 个中英文案例详情 URL 均不出现，证明空内容未静态回填。发布/空响应见 [luna-http-published.txt](../output/llms-content/xyy-20261008-10/luna-http-published.txt) / [luna-http-empty-cases.txt](../output/llms-content/xyy-20261008-10/luna-http-empty-cases.txt)，结构化结果见 [luna-validation.json](../output/llms-content/xyy-20261008-10/luna-validation.json)。验证后已关闭 4399 与 4400，复核仅既有 4321 监听。

Regression coverage：覆盖 Claims registry、发布案例英文映射/同源 Claims、英文案例路由、英文路径、14 期白皮书内容及真实 SSR HTTP 响应；保留案例动态请求、英文路径、白皮书链接和响应头契约。临时 validator 首次 exit 1 是断言漏写文化标签与值之间空格，修正后最终 exit 0，未归因应用失败。

Remaining risks：验证仅代表本地 Astro 与 loopback CMS fixture，未验证线上版本、真实 CMS、真实爬虫或外部链接可达性；未运行全量 `verify`/`build`，未提交、推送、部署或写入 CMS/数据库。证据目录为 [output/llms-content/xyy-20261008-10](../output/llms-content/xyy-20261008-10/)。

### XYY-20261008-12 — Luna 分支合并身份与 CI manifest 独立诊断

Task ID：`XYY-20261008-12`；Result：**PASS_WITH_LIMITATION**。

Tests performed：从 Git 对象重算 `f04bd1e0e7b0fb921f7031606dc417b92e033e5a` 相对唯一父提交 `0ffe149df13148d6280b5230979eb0a3d0ea26cb` 的精确差异，共 114 路径（51 added / 63 modified / 0 deleted）；与历史 `staged-verification.json` 的 114 行逐项比较，缺失、内容 SHA-256 和 Git mode 不匹配均为 0。随后从该提交隔离抽取 `scripts/create-release-manifest.mjs`、`config/cms-contract.mjs`、`config/release-contract.mjs`，执行与 CI 相同的 manifest 命令，exit 1，stderr 为 `release_manifest_blocked: cms_schema_status=candidate_unverified`，manifest 未生成。未运行全量 `verify` / `verify:release`，未启动外部 workflow。

Regression coverage：覆盖提交身份、114 文件范围、历史候选绑定、candidate_unverified fail-closed 语义、CI manifest 失败及输出文件不存在；核对 `.github/workflows/ci.yml` 的 manifest 步骤位于 audit/verify 前，及 `scripts/deploy.sh` 在容量检查、verify、SSH 前调用同一生成器。证据见 [report.md](../output/merge/xyy-20261008-12/luna/report.md)、[identity-r1.json](../output/merge/xyy-20261008-12/luna/identity-r1.json)、[ci-manifest-r1.json](../output/merge/xyy-20261008-12/luna/ci-manifest-r1.json)。

Remaining risks：当前 candidate 的 CI 绿灯条件不满足；CI 与部署共享 CMS schema release-identity 门禁。若选择最小 CI 修复，应只让 CI 在 candidate_unverified 时进行不写 release manifest 的源码/身份结构校验，保留部署脚本的真实 CMS manifest gate，并由 Terra → Luna → Nova 重新验收。原始提交历史 `verify:release` PASS 不替代本轮 CI PASS；本轮未修改实现、CI、GitHub、CMS、数据库或部署环境。

### XYY-20261008-12 — Luna 最小 CI 修复独立 QA 收口

Task ID：`XYY-20261008-12`；Result：**PASS（含已分类环境限制）**。候选为 `/home/yj/data/xyy-merge-20261008-12/candidate`，本轮只读实现并写入本证据目录。

Tests performed：在独立 node_modules、数据盘 npm cache 和容量 wrapper 下执行 `npm ci --no-audit`，exit 0，实际新增 776 packages；安装 baseline 峰值 `833388544` bytes / `41406` inodes。实际运行版本为 compression 1.8.2、proxy-addr 2.0.8、sharp 0.35.5、smol-toml 1.9.0、source-map-js 1.2.2，lockfileVersion 3。cn-font FFI runtime 大小 6145760 bytes，SHA-256 为 `db4690e3b9c4b04f6dfa5965792585c389914038f6a4c90fbe73baaf16bbf19c`，`ldd` 无缺失且 Node require 通过。fresh production audit exit 0，vulnerability total 0（prod 278 / total 888）。

使用 loopback CMS 与 dummy 接收端、数据盘短 `TMPDIR`、`CI=true` 单 worker 运行 `npm run verify:release`，exit 0：`verify` 为 114 files / 727 tests passed，E2E 为 278 tests 中 269 passed、9 skipped、0 failed，formal contract 4/4 passed，最终 Astro build 通过；该次 capacity 峰值 `741703680` bytes / `7883` inodes。8 个定向 Vitest 文件为 59/59 passed。真实压缩中断 probe exit 0，捕获 gzip created 1、closed 1、destroyed true；Sharp SVG→PNG/resize probe exit 0，输出 32×16 PNG。结构化收口见 [qa-r2-summary.json](../output/merge/xyy-20261008-12/luna/qa-r2-summary.json)。

Regression coverage：R1 真实全量记录为 17 failed / 253 passed / 8 skipped，未覆盖为本轮 PASS。日志明确记录深层 `TMPDIR` 造成 Chrome `Socket path too long`；language suggestion 另命中总 30s timeout；service-redesign-live 的一次 mobile animation event 未观察到，未改实现也未把它归因于单一根因。随后在短路径数据盘 `TMPDIR`、`CI=true`、单 worker 下对 4 个相关 spec 做受监控复测，25 passed / 1 skipped；同环境完整 R2 以 0 failures 完成。首次 compression probe 因等待 request error 而挂起并以 exit 130 保留，修正临时 probe 后才得出上述 PASS，未修改应用实现。

候选四个冻结文件 hash 未变：`.github/workflows/ci.yml` `28abedc2…b4b6b`、`scripts/validate-ci-release-identity.mjs` `a94d5f91…d23ef`、`tests/unit/ci-release-identity.test.ts` `c060555e…a8cfe2`、`package-lock.json` `eebf3042…c69a0`。candidate Git status 仅包含这四个任务文件的预期差异；主工作区既有并行修改已保留。相关证据包括 [clean-ci-r2.log](../output/merge/xyy-20261008-12/luna/clean-ci-r2.log)、[fresh-audit-r1.json](../output/merge/xyy-20261008-12/luna/fresh-audit-r1.json)、[verify-release-r2.log](../output/merge/xyy-20261008-12/luna/verify-release-r2.log)、[e2e-diagnosis-r3.log](../output/merge/xyy-20261008-12/luna/e2e-diagnosis-r3.log) 及压缩/Sharp probe 日志。

Remaining risks：R1 环境失败证据仍应保留，不能被历史或 R3 结果覆盖；本轮结论代表短 TMPDIR、CI 单 worker 的隔离环境，不代表真实 GitHub runner 的所有资源差异。未写 GitHub、CMS、数据库或部署，未提交或推送；交 Sol 进入 Nova Review。

### XYY-20261009-01 — Luna Release R4 独立 QA 收口

Task ID：`XYY-20261009-01`；Result：**PASS**。

Tests performed：正式候选由 `scripts/capacity-baseline.mjs` 外层真实监测运行 `npm run verify:release`，统一 exec session `37158` 于 2026-10-09 15:35:49 exit 0。`verify` 阶段 typecheck、lint、maintainability、assets、cache patch 通过，Vitest **118 files / 757 tests passed**；E2E 为 **278 tests、269 passed、9 skipped、0 failed**，CI 单 worker；formal contract **4/4 passed**；最终 Astro server build 通过。容量实测为 **552108032 bytes / 3838 inodes**，见 [R4 log](../output/release/xyy-20261009-01/luna/verify-release-r4.log) 与 [R4 capacity](../output/release/xyy-20261009-01/luna/verify-release-capacity-r4.json)。生产依赖 audit 由 Sol 归档于 [production-audit.json](../output/release/xyy-20261009-01/production-audit.json)，exit 0、metadata vulnerabilities total 0。Terra 交接记录其 Footer、detail-reveal 实现文件的格式检查通过；Luna 负责的两个测试文件完成目标格式检查，R4 lint 通过。

Footer QA：独立候选预览 4403 已关闭。中英文 contact/about × desktop 1440/mobile 390 的 8 组合原始结果为 7 pass、1 个 `en-contact-desktop` QR 时序失败；在既有 5000ms 内等待 `complete && naturalWidth > 0` 后仅补测该组合并通过，最终 8/8 通过，覆盖无横向溢出、社交链接、微信 popover 开关/Esc/键盘焦点/二维码及真实表单无 POST。证据为 [footer-browser-qa.json](../output/release/xyy-20261009-01/luna/footer-browser-qa.json)、[footer-en-contact-desktop-r2.json](../output/release/xyy-20261009-01/luna/footer-en-contact-desktop-r2.json) 和同目录截图。真实触摸 `tap`、桌面 click、键盘 Enter、pointerup/cancel 清理均通过 [touch-tap-probe-r3.json](../output/release/xyy-20261009-01/luna/touch-tap-probe-r3.json) / [pointer-keyboard-probe-r3.json](../output/release/xyy-20261009-01/luna/pointer-keyboard-probe-r3.json)。

Regression coverage：R1 的两个 H1 时序失败和两个 service-redesign 导航失败保留于 [report-r1.md](../output/release/xyy-20261009-01/luna/report-r1.md)；R2 主动中断及旧服务证据保留于 [report-r2-interrupted.md](../output/release/xyy-20261009-01/luna/report-r2-interrupted.md)；恢复会话时主机已重启，R3 日志停在 E2E 203 且无完成结果，具体终止时点和原因未确认，保留 [verify-release-r3.log](../output/release/xyy-20261009-01/luna/verify-release-r3.log)，未计为 PASS。R4 使用新候选服务及独立容量输出完成，未重现上述失败；新版 CMS 状态契约、动效、候选部署阻断和合法空内容语义随全量执行。

Remaining risks：证据仅覆盖隔离候选、CI 单 worker、loopback CMS fallback 和本机浏览器，不替代真实 CMS、外站账号、生产部署或数据库验证；未提交、推送、部署或写入外部系统。最终报告见 [report-r4-final.md](../output/release/xyy-20261009-01/luna/report-r4-final.md)。

### XYY-20261009-01 — Luna 隔离备份恢复 QA 准备

Task ID：`XYY-20261009-01`；Result：**BLOCKED（等待 Sol 提供成对备份路径，未执行恢复）**。

只读审阅了最新 release/external-acceptance 合同、测试站部署前置清单，以及 `deploy/postgresql/backup-directus.sh`、`restore-test-directus.sh`、`deploy/uploads/backup-directus-uploads.sh`、`restore-test-directus-uploads.sh` 和相关 CMS 合同。发现现有数据库 restore 脚本无条件查询 `homepage_stats`、`case_details`、`case_stats`、`service_stats`、`service_features` 等 legacy 表；uploads restore 只校验 SHA、归档路径安全和文件总数，未验证 `directus_files.filename_disk` 与 storage 文件的双向映射，因此未直接调用现有 restore 脚本。

已准备 [restore-qa-plan.md](../output/release/xyy-20261009-01/luna/restore-qa-plan.md) 与 [restore-qa-draft.sh](../output/release/xyy-20261009-01/luna/restore-qa-draft.sh)，并仅执行 `bash -n` 语法检查。方案限定 pair manifest、custom dump、uploads archive 均在任务私有目录；要求 SHA/字节/共同截止点/backup ID 一致、使用预拉取 digest 镜像、本机 `--internal` Docker 网络、数据库无端口发布、Directus 仅可回环发布、邮件/webhook/真实询盘无外发。验收输出仅包含实际版本、active/private/legacy 集合计数、FAQ 聚合关系计数、附件双向映射计数、资源抽样 status/bytes/hash 前缀和清理结果，不记录 PII、SQL、Token 或附件内容。

独立 AC 明确要求：custom dump 忠实恢复；legacy 表缺失可单列放行，active/private 集合不可缺失；FAQ 在恢复阶段只核对旧 contract/备份快照中的总数、空值、孤儿、重复 identity 和关系元数据是否忠实恢复，不把旧 CMS 尚未具备的目标 `faq_page` 非空或 `RESTRICT` 约束误判为恢复失败；`directus_files` 每条 metadata 与 storage 文件双向完整映射；至少三个本机 loopback asset 只读抽样；无外部连接或写入；容器、网络、临时解密/解包目录清理成功。目标 FAQ 约束留给隔离 E/G 演练及 live 后验证并输出 `target_contract_pending`。只有恢复忠实性等上述条件全部通过才可判定隔离恢复成功；当前不代表备份就绪或测试站部署完成。

Remaining risks：Sol 尚未提供准确 pair manifest/备份路径、镜像 digest 和运行时版本核对输入；因此本轮未读取备份内容、未解密、未创建容器、未连接 CMS/数据库、未产生远端或外部写入。待 Sol 提供路径并确认恢复窗口后，继续同一 Task ID 执行独立恢复 QA。

### XYY-20261009-01 — Luna cleanup R3 首轮夹具复测

Task ID：`XYY-20261009-01`；Result：**FAIL（实现问题，删除前阻断）**。

在本地 fake release root/proc 夹具运行 `node output/release/xyy-20261009-01/luna/release-cleanup-r3-qa.mjs`，`preflight=0`，`preview=1`，stderr 为 `unsafe_maintenance_permissions`；fixture 的 maintenance、tools、tools/lib 均为 `0700`，工具文件为 `0600`，没有删除任何 release。失败发生在任何 `rm` 前，故 AC20/5、plan 参数/权限/symlink、root/current/previous/pinned 变化及 cwd/exe/fd 后代 guard 尚未取得结果，不能记 PASS。

Likely affected area：`output/release/xyy-20261009-01/ops/release-cleanup-r3-remote.sh:69` 的 `((8#${mode} & 8#022 == 0))` 算术优先级；Bash 将其解析为 `mode & (mask == 0)`，合法 0700 目录被拒绝。R3 runner SHA 为 `41951225180c4fb13e22d7924b7e83dfde67685bea7c1d6f954cfc075eabfa4e`。完整 FAIL 字段与 hashes 见 [release-cleanup-r3-qa-fail.md](../output/release/xyy-20261009-01/luna/release-cleanup-r3-qa-fail.md)，原始日志见 [release-cleanup-r3-qa.log](../output/release/xyy-20261009-01/luna/release-cleanup-r3-qa.log)。

Remaining risks：本轮未修改 Terra ops 文件、未执行 SSH、未上传工具、未执行真实删除；需 Terra 交付修复后的新 SHA 后沿同一 Task ID 重新执行全部本地夹具，再决定是否交 Nova 有限 Review。

### XYY-20261009-01 — Luna cleanup R3.1 独立夹具复测

Task ID：`XYY-20261009-01`；Result：**PASS（本地隔离夹具；未执行远端）**。

Terra R3.1 runner SHA 为 `5ac729890b535734accebb74e96400839c3890039da6d45689badcb1ee6e5692`。执行 `node output/release/xyy-20261009-01/luna/release-cleanup-r3-qa.mjs`，真实 exit 0；合法 `preflight`/`preview` 生成精确 **20 candidates / 5 retained**，合法 apply 删除恰好 20 个 fake candidate，5 个固定保留版本、current、previous 保持。结构化结果见 [release-cleanup-r3-qa.json](../output/release/xyy-20261009-01/luna/release-cleanup-r3-qa.json)，日志见 [release-cleanup-r3-qa-r2.log](../output/release/xyy-20261009-01/luna/release-cleanup-r3-qa-r2.log)，PASS 报告见 [release-cleanup-r3-qa-pass.md](../output/release/xyy-20261009-01/luna/release-cleanup-r3-qa-pass.md)。

负向覆盖均发生在删除前：plan ID/path 替换、plan symlink/非 0600、root inode/current/previous/pinned 变化，以及真实 `/proc` 后代 cwd/exe/fd 引用；每项 exit 1，候选目录未减少。首轮括号优先级 FAIL 及其 exit 1 证据保留于 [release-cleanup-r3-qa-fail.md](../output/release/xyy-20261009-01/luna/release-cleanup-r3-qa-fail.md)，未被本轮 PASS 覆盖。

本地夹具仅将生产 runner 的 root-owner/inode 常量映射到临时 fake root，未修改 Terra ops 文件；未执行 SSH、远端 preflight/preview/apply、上传工具或真实删除。结果仅支持向 Nova 提交有限 cleanup Review，不证明测试站状态已改变。

### XYY-20261009-01 — Luna capture R4.1 独立夹具验收

Task ID：`XYY-20261009-01`；Result：**PASS（本地合成夹具；未执行远端）**。

Terra capture runner `output/release/xyy-20261009-01/ops/staging-cms-pair-backup-remote.sh` 冻结 SHA-256 为 `1070e4919e6816ea3bcc9113ccaf01242fca5565673f9999bb9d9186bd6f3394`。`node --check output/release/xyy-20261009-01/luna/capture-r4-qa.mjs` 与夹具实际运行均 exit 0。夹具只创建临时 loopback fake CMS/PM2/PostgreSQL、合成非 PII 上传和临时 `.env`，没有 SSH、真实数据库、远端/生产写入或 Git 操作。

Tests performed：六个场景均按合同结果完成：成功 pair exit 0，归档精确含 `manifest.json`、一个 custom dump、一个 uploads archive 共 3 个成员；manifest 校验 directus `12.1.1`、PostgreSQL client `16.15`、server `160015`、正字节数和 64 位 SHA-256（manifest JSON 592 bytes）。stop failure exit 1 且尝试恢复；backup failure exit 1 且为 `database_command_failed` 并尝试恢复；restart failure 与 restart ping failure 均 exit 1 且为 `cms_restart_or_health_check_failed`；16.14 版本漂移 exit 1 且为 `postgres_version_changed`，在 capture 前拒绝。特殊字符密码包含 `$`、`#`、`;`、`=`，dotenv/`PGPASSWORD` 校验通过且未写入日志。

Evidence：结构化结果为 [capture-r4-qa.json](../output/release/xyy-20261009-01/luna/capture-r4-qa.json)，实际日志和 exit marker 为 [capture-r4-qa.log](../output/release/xyy-20261009-01/luna/capture-r4-qa.log)，独立夹具为 [capture-r4-qa.mjs](../output/release/xyy-20261009-01/luna/capture-r4-qa.mjs)，完整 PASS 报告为 [capture-r4-qa-pass.md](../output/release/xyy-20261009-01/luna/capture-r4-qa-pass.md)。

Remaining risks：本轮不证明加密 staging pair 存在、可用受保护 key 解密、或在隔离 Docker 中恢复成功；真实 PM2/PostgreSQL、附件 UUID 映射、真实备份和外部环境仍待收到准确 cipherpath 后按恢复 QA 合同执行。未执行远端、生产、CMS、数据库写入、部署或应用实现修改。

### XYY-20261009-01 — Luna capture R4.1 guard 回归

Task ID：`XYY-20261009-01`；Result：**PASS（本地合成夹具；未执行远端）**。

Terra 当前 capture runner SHA-256 为 `a666df61d396996af3a028cac59a64303b29584c7f20ceca448780d3d416b198`，已包含 uploads symlink 与非 regular entry（FIFO/device）防护。Luna 独立夹具 `node --check` 与完整运行均 exit 0，七场景全部按合同完成：原成功 pair、stop/backup/restart/ping 故障、16.14 拒绝均保持结果；新增 synthetic FIFO 在 capture 前 exit 1，错误为 `uploads_unsafe_entry_present`。静态断言确认 symlink guard 和 `! -type f ! -type d` guard 均存在；后者覆盖 FIFO/device 类条目。成功 pair 仍为精确 3 成员，manifest 版本、bytes/hash 与特殊字符 dotenv 检查通过，日志无密码。

Evidence：结构化结果 [capture-r4-qa.json](../output/release/xyy-20261009-01/luna/capture-r4-qa.json)、新增运行日志 [capture-r4-qa-r2.log](../output/release/xyy-20261009-01/luna/capture-r4-qa-r2.log)、夹具 [capture-r4-qa.mjs](../output/release/xyy-20261009-01/luna/capture-r4-qa.mjs)、报告 [capture-r4-qa-r2-pass.md](../output/release/xyy-20261009-01/luna/capture-r4-qa-r2-pass.md)。当前 Sol-owned `capture-pair.sh` 仍固定旧 runner SHA `1070e491...`，已通知 Sol 同步后再使用；Luna 未修改该脚本。

Remaining risks：夹具不证明真实加密 pair、真实 device node、staging 数据或隔离恢复成功；restore runner 仍待准确 cipherpath。

### XYY-20261009-01 — Luna 隔离恢复执行器准备 R4.1

Task ID：`XYY-20261009-01`；Result：**BLOCKED（cipher 未到，未执行恢复）**。

已准备 [restore-qa-runner.sh](../output/release/xyy-20261009-01/luna/restore-qa-runner.sh)，强制只接受任务私有 `private-backups/` 下的 cipher、既有 0600 key、0700 `private-restore/` 和核准 digest 镜像；解密 pair、manifest/bytes/hash、outer/uploads 归档路径与成员类型、`pg_restore --list` 均在 Docker 前完成。执行器使用 internal-only Docker network，PostgreSQL 不发布端口，Directus 仅 `127.0.0.1:18059`，restore 使用 `--exit-on-error --no-owner --no-acl`，附件以 DB `filename_disk` 与 storage 文件双向集合校验，日志只记录版本/计数/状态，不输出 PII、SQL、Token 或附件内容；退出时清理容器、network 和 private-restore 临时目录。

验证：`bash -n` exit 0；缺失 cipher 门禁实际 exit 2，证据为 [restore-qa-preflight.log](../output/release/xyy-20261009-01/luna/restore-qa-preflight.log)。当前没有读取备份、解密、创建容器、连接数据库或启动 Directus；待 Sol 提供准确 cipherpath 后才运行，当前不代表恢复 PASS。

R4.2/R4.3 执行器修正：cipher sidecar 与 Sol metadata 的 path/bytes/SHA 现做三方比对；manifest 时间可解析且顺序有效；legacy 表先存在性判断再查询计数，active/private 缺失硬失败；`pg_restore --list` 在 PostgreSQL 容器内执行；成功写脱敏 state 并暂留容器/network/private workdir 给 Sol E/G，失败清理并用 `docker rm -f -v`；Directus asset HTTP/hash 抽样规则为至少3个、总数少于3时全量；signal trap 先 exit1 再由 EXIT trap 清理；uploads 成员严格限定 `uploads`/`uploads/...`，拒绝 `.`、`..`、双斜线和根外路径。真实首次/复跑已完成解密与 PG restore，但附件映射发现 DB 2、storage 5、未引用3，未到 HTTP 抽样；证据见对应 restore-qa 日志，当前结论 FAIL。

### XYY-20261009-01 — Luna 真实隔离恢复 QA

Task ID：`XYY-20261009-01`；Result：**FAIL**。

真实 cipher preflight 通过：556132 bytes、SHA-256 `f3fe4e5a13ba46feccd83a6a4095a010c75f6b3d3c42c923b6179ef9d5f9f8f0`、0600、sidecar 与 metadata 一致。manifest pair ID 为 `xyy-20261009-01-20261009T082731Z`，window `08:27:31Z–08:27:32Z`，Directus `12.1.1`，PG client/server `16.15`/`160015`；database/uploads bytes/hash 均匹配。三次真实 runner 均在失败后清理容器和临时目录，最终修正版日志仍 exit 1。

PG custom dump 在 internal-only Docker 中恢复成功；active/private 集合可读，legacy 集合均存在。FAQ 观察为 `faqs=100`、`faq_pages=17`、null relation/orphan/duplicate page key/duplicate content key 均 0。附件门禁失败：`directus_files=2`，storage regular files=5，DB missing=0，storage unreferenced=3，duplicate=0；因此未启动 Directus，也未执行 HTTP asset 抽样。私有诊断确认 3 个 extra 均为 regular：两个 AVIF、derived-like 命名模式；一个 5-byte extensionless ASCII；三者均无 exact DB filename 或 content-hash 关联。未把它们伪造为 Directus thumbnail/cache/.gitkeep，未删除或修改任何文件/数据库。

Evidence：[restore-qa-fail.md](../output/release/xyy-20261009-01/luna/restore-qa-fail.md)、[restore-qa-20261009T082940Z-62471.log](../output/release/xyy-20261009-01/luna/restore-qa-20261009T082940Z-62471.log)、[restore-pair-metadata.json](../output/release/xyy-20261009-01/luna/restore-pair-metadata.json)。详细 names/hash 仅保存在任务私有 `/home/yj/data/xyy-release-20261009-01/private-restore/attachment-diagnosis.json`（0600）。

Likely affected area：测试站 uploads 与 `directus_files` 备份不一致，可能含派生或残余文件，但当前证据不足以证明其生命周期；runner 按合同 fail-closed。Severity：**High**，阻断恢复成功和后续 E/G；无远端部署、CMS 写入或生产操作。

### XYY-20261009-01 — Luna capture caller 当前身份独立验收

Task ID：`XYY-20261009-01`；Result：**PASS（本地 fake 路径/SSH/GPG；未执行远端）**。

Sol 已同步 caller：`capture-pair.sh` SHA-256 `fc5dbe1c828412d2b918b2d88f10756547612716d2369d3dee65cdd6ff704539`，其 embedded runner SHA 与当前 Terra runner `9309b88903d4348ea0263bb06c917f299b5fd4d3ee5ca2543f657d9e2a60174e` 一致。Luna 独立替身 `node --check`/运行 exit 0，7 项均通过：成功 sidecar/archive hash 与 metadata；key-root symlink、已有 archive、已有 sidecar、dangling archive 均在 pipeline 前拒绝；fake SSH exit 7 与 fake decrypt exit 9 均不 rename partial。

Evidence：[capture-pair-qa-pass.md](../output/release/xyy-20261009-01/luna/capture-pair-qa-pass.md)、[capture-pair-qa.json](../output/release/xyy-20261009-01/luna/capture-pair-qa.json)、[capture-pair-qa-r3.log](../output/release/xyy-20261009-01/luna/capture-pair-qa-r3.log)。此前 Terra 变更期间 stale expected SHA 的失败记录保留于 [capture-pair-qa-fail.md](../output/release/xyy-20261009-01/luna/capture-pair-qa-fail.md)，不代表当前 caller 缺陷。未读取真实 key、未 SSH、未写 private-backups、未执行外部操作。

### XYY-20261009-01 — Luna capture caller 独立 gate

Task ID：`XYY-20261009-01`；Result：**FAIL_WITH_LIMITATION（caller 身份漂移）**。

当前 `capture-pair.sh` SHA-256 为 `dea4745edec...f52f2549`，内嵌 expected runner SHA 为 `a666df61...416b198`；Terra 最新 runner 实际为 `9309b889...2a60174e`，所以未修改的 workspace caller 在身份门禁处 exit 1，未进入 SSH/GPG pipeline。失败报告为 [capture-pair-qa-fail.md](../output/release/xyy-20261009-01/luna/capture-pair-qa-fail.md)。

为验证 caller 其余合同，Luna 在临时替身中仅将 expected 行对齐当前 runner，并将 key/backup 路径、SSH、GPG 全部替换为本地 fake；七项结果均符合预期：成功 sidecar/hash、key-root symlink、archive/sidecar collision、dangling archive 拒绝、SSH pipeline exit 7、decrypt exit 9 且不 rename。结构化结果为 [capture-pair-qa.json](../output/release/xyy-20261009-01/luna/capture-pair-qa.json)，其结果明确为 `PASS_WITH_IDENTITY_LIMITATION`，不替代 workspace caller PASS。无真实 key 读取、SSH 连接、外部写入或备份生成。

Terra runner 当前版本再次独立复测：SHA-256 `9309b88903d4348ea0263bb06c917f299b5fd4d3ee5ca2543f657d9e2a60174e`，本地 fake PM2 提供 exact online/cwd/exec/listener identity 后，七场景（成功 pair、四故障恢复、16.14 拒绝、FIFO 拒绝）exit 0；证据 [capture-r4-qa-r3.log](../output/release/xyy-20261009-01/luna/capture-r4-qa-r3.log)，报告 [capture-r4-qa-r3-pass.md](../output/release/xyy-20261009-01/luna/capture-r4-qa-r3-pass.md)。该 PASS 不覆盖 caller 当前 expected SHA 漂移。
