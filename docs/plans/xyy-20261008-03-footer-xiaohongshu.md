# XYY-20261008-03 — 页脚小红书账号入口

- 输入：用户要求页脚新增小红书账号跳转，目标为本次用户提供的 profile 分享链接；完整 href（含原参数）仅进入实际组件，不在日志复制参数。
- 风险 LOW：静态外链及局部布局；Terra → Luna → Sol。
- Scope：通用页脚“联系与地址”栏地址下方增加小红书入口；关于页独立页脚联系区同步。中文显示“小红书”，英文显示“Xiaohongshu”，两种页脚使用同一组件与目标。
- 所有权：Terra 仅编辑 `src/components/Footer.astro`、`src/components/about/AboutMinimalFooter.astro`、`src/styles/about-minimal-footer.css`，新增 `src/components/XiaohongshuLink.astro`，追加 `docs/TERRA.md`；Luna 仅追加 `docs/LUNA.md` 及本任务验证产物；Sol 管理本合同、`DEV_STATE.md`、`docs/SOL.md`。
- 组件要求：原生可键盘访问的 a，`target="_blank"`、`rel="noopener noreferrer"`，文字可读，外链图标 aria-hidden，新窗口提示本地化，可见 focus，触控高度至少 44px；不引入平台 SDK、iframe、第三方图像或 JS。
- AC1：通用页脚与关于页独立页脚，中英文各有且仅有一个账号入口，href 与用户提供的完整 URL 一致。
- AC2：英文/中文可访问名称正确；新标签目标及 rel 正确，键盘可聚焦，无自动跳转或第三方嵌入请求。
- AC3：中英文通用/独立页脚在 1440 和 390 宽度可读可用，链接不遮挡原内容、没有新增水平溢出；关于页额外检查 768 宽度。
- AC4：现有电话、地址、导航、版权等内容和此前提纲改动保持；变更仅在所有权范围。目标格式检查/适当类型检查通过。
- 排除：CMS/schema/数据库、用户账号登录/关注、真实表单提交、其他页脚重构、公开数字、提交/推送/部署、现有本地服务的停止。不新增镜像静态链接的持久测试。
- 基线：HEAD `f04bd1e`；三个已有目标文件原先 clean，其余既有脏文件保留；记录 `output/footer-social/xyy-20261008-03/baseline.json`。
- 验证：复用用户运行中的 `http://127.0.0.1:4322`；浏览器证据 `output/playwright/xyy-20261008-03/`，其他证据 `output/footer-social/xyy-20261008-03/`。只读检查外部跳转，不登录/关注/写入小红书；平台不可访问时准确报告外站限制，不妨碍本地链接实现。
- 子代理不得再委派，不回退他人修改，日志保留原前缀；实施、独立验证按依赖顺序进行。

状态：本地实现验收通过；外站账号页内容受测试 IP 风控限制。未提交、推送或部署。

- Terra：四个源码文件最小实现，目标格式/diff PASS；typecheck 638 files、0 errors/0 warnings/4 既有 hints。
- Luna：两类中英文页脚在 1440/390 的八组合、关于页 768 两组合 PASS；精确 href、单个入口、可访问属性、键盘焦点、44px、无溢出/重叠及中英文提纲回归通过。
- Sol：审阅目标 diff、四张截图和断言。实际点击新标签目标为给定 profile，但小红书随后返回 IP 风控页（300012），不当作账号页访问成功；完整链接保留。
- 当前 4322 服务继续运行，测试浏览器已关闭；原有业务改动与日志前缀保持。最终状态见 `output/footer-social/xyy-20261008-03/sol-final-acceptance.json`。

## R2 — 按用户参考图改为社交图标区

- 输入：用户截图 `/tmp/codex-clipboard-P7RjgY.png`，要求小标题 + 黑色单排社交图标的形式。沿用本 ID；LOW，Terra → Luna → Sol。
- 设计：共享组件增加上方小号粗体标题，中文“关注我们”、英文“FIND US ON”；下方黑色小红书 SVG 图标，去掉胶囊边框、粉红色和可见外链箭头/名称文案，匹配截图的简洁图标风格。仅已有账号的小红书入口，不虚构其他社交链接。
- 所有权：Terra 仅修改 `src/components/XiaohongshuLink.astro`，必要时微调既有 `src/styles/about-minimal-footer.css`，追加 `docs/TERRA.md`；无需变更两种页脚的插入位置。Luna 只写任务证据/`docs/LUNA.md`；Sol 管理合同/`DEV_STATE.md`/`docs/SOL.md`。
- SVG：已读取 Simple Icons 14.0.0 的 xiaohongshu.svg，文件 `output/footer-social/xyy-20261008-03/r2/xiaohongshu-reference.svg`；使用其本地内联 path 和原 viewBox，源码注释保留来源及 CC0-1.0。无需运行时 CDN/新依赖/图片生成。
- AC1：通用/关于页中英文页脚都显示本地化小标题及单个黑色图标入口，图标真实可辨识，默认无胶囊描边或粉色背景。
- AC2：href 完全保持本轮前值；target/rel/本地化 aria 新窗口提示保持；添加本地化 hover title，图标 aria-hidden，图标链接至少 44×44px、键盘 focus 可见。
- AC3：四页面 1440/390 无新增溢出/遮挡，关于页 768 可用；原电话/地址/导航/版权和中英文提纲保持。
- 基线：`output/footer-social/xyy-20261008-03/r2/baseline.json` 和四个源码快照；验证 `output/playwright/xyy-20261008-03-r2/`，复用并保持用户 4322 服务。
- 排除：新增其他社交账号、改 href、重复访问外站风控页、CMS/数据库/真实询盘、持久测试、提交/推送/部署。前轮外站 300012 仅为历史观察，本轮无需重新访问外站。
- 目标格式/diff 检查 + 定向浏览器检查；如只有静态 SVG/样式，无需再次跑耗时的完整 typecheck 或 verify。
- 状态：本地实现和独立视觉验收完成。
- 实际修改仅共享组件和任务记录；Simple Icons 14.0.0 SVG path 与参考逐字一致，原 href 保持。目标格式/diff PASS；Luna 十组合、键盘、48px 触控、深色 fill、无默认边框/背景、无横溢/重叠 PASS，四张默认态截图已亲看。Sol 复核源检查和默认态截图后接受。
- 浏览器 headed 因容器无 X server 无法启动，实际用 headless 完成截图和交互验收；测试脚本初始深色判据过窄的问题已更正并复测，没有修改实现来适配错误判据。未再访问外站；4322 继续运行。
- 最终状态 `output/footer-social/xyy-20261008-03/r2/sol-final-acceptance.json`；本轮没有提交/推送/部署。

## R3 — 增加抖音和微信公众号

- 用户输入：抖音 `https://v.douyin.com/yR8AriGCppo/`；微信公众号原二维码 `/home/yj/下载/qrcode_for_gh_f2ab9206e833_258.jpg`。
- 沿原 ID；LOW，静态外链/图片和原生 HTML popover 展示，无自定义 JS、API 或数据写入；Terra → Luna → Sol。如果需自定义交互逻辑，先回报重新定范围。
- 设计：保留标题、黑色图标风格，三图标按小红书/抖音/微信单排，触控至少 44×44。抖音在新标签打开用户完整短链接；微信图标为原生按钮，点击打开居中的二维码卡片，支持关闭按钮、Esc、点击外部关闭，标题/说明/可访问名称中英文对应。
- 采用原生 `popover="auto"` / `popovertarget`，无需添加脚本。浮层在顶层避免页脚溢出裁切；隐藏态不得被 author display 样式覆盖。卡片限制宽高适配移动视口，图片保留原始方形与留白。
- 所有权：Terra 将新建未提交的 `src/components/XiaohongshuLink.astro` 更名为 `src/components/FooterSocialLinks.astro` 并扩展三平台，更新 `src/components/Footer.astro` 和 `src/components/about/AboutMinimalFooter.astro` 两处 import/调用；仅确需时微调 `src/styles/about-minimal-footer.css`；原样复制二维码至 `public/images/social/wechat-official-account.jpg`；追加 `docs/TERRA.md`。Luna 只写本任务证据和 `docs/LUNA.md`；Sol 管理本合同、`DEV_STATE.md`、`docs/SOL.md`。
- 素材：小红书原路径保持；抖音音符和微信气泡来自 Simple Icons 14.0.0（CC0-1.0），本地参考 `output/footer-social/xyy-20261008-03/r3/douyin-reference.svg` / `wechat-reference.svg`；仅内联原 path，无运行时外部资源。二维码 SHA256 必须保持 `c9b19b7b0bc10ecbc2db4399c0076cfd111aa27ce27f53733ab06cb22df885ba`，不生成、重绘、压缩或裁剪。
- AC1：中英文通用/关于页脚各有唯一三平台入口；小红书 href 原样，抖音 href 精确对应用户值，两个外链均新标签及安全 rel；微信不伪造账号 URL。
- AC2：微信默认收起、点击及键盘打开；完整二维码可见/无裁切；关闭按钮、Esc、外部点击分别关闭，再次可打开。图标标题/aria、卡片标题/说明/alt 本地化，按钮均可聚焦且至少 44×44；无自定义 JS。
- AC3：1440/390 的中英文两类页脚无横溢/原内容重叠；关于页补 768；移动 QR 卡片位于视口内。原电话/地址/版权和两种联系提纲保持。
- AC4：二维码源/目标/HTTP 提供字节 hash 一致；三图标来自指定本地路径。目标格式/diff 与本地页面编译、Luna 浏览器行为通过，不新增只镜像 markup 的持久测试。
- 基线 `output/footer-social/xyy-20261008-03/r3/baseline.json` 和四源码快照；浏览器证据 `output/playwright/xyy-20261008-03-r3/`。复用并保持用户 4322 服务，外站链接可有限只读验证，不能登录/关注/写入或无限重试。
- 排除：改分享链接、增加未提供账号、真实 CMS/数据库/询盘、图像编辑、全站重构、提交/推送/部署。不要把上轮类型/浏览器结果写作本轮证据。
- 状态：本地实现与独立验收完成；未提交、推送或部署。
- Terra 完成共享组件更名、两个页脚引用更新及二维码原样复制；目标格式/diff、本地 HTTP 编译通过。Sol 发现微信 SVG 首次尾段复制偏差后退回修正，三路径逐字一致复测通过；最初源检查失败证据保留。
- Luna 10 个页面/视口组合、中英文提纲实际交互、二维码打开/三种关闭/重开、原图完整性均通过；随后补充四组合共 16 项真实 Tab 可见焦点检查，均为 48px 控件与 2px 实线轮廓。Sol 审阅源码差异、摘要及默认态/二维码/焦点截图后接受。
- 初轮定位/测试脚本三元表达式/隐藏截图错误仅为测试问题，最终断言以修正后执行为准。原图/资产/HTTP hash 一致；新组件无自定义 JS 或远端图片请求。两种关闭按钮/Esc 返回触发按钮，外部点击关闭后不强制返回焦点。
- 4322 保持运行，仅关闭独立测试浏览器；本地 Chromium 模拟视口未覆盖真机扫码、Safari/微信浏览器或外站内容。最终证据 `output/footer-social/xyy-20261008-03/r3/sol-final-acceptance.json`。
