# XYY-20261014-05 内容默认可见修复

- 风险：MEDIUM；延续同 ID 的只读诊断，现已获用户本地修复首页及排查其他页面同类问题的授权。
- 基线：HEAD `9ad4fe0fa92bb14ee23fa2e6c7b79836c2798c80`；既有 Task 03/04 脏改动全部保留，快照见 `output/diagnostics/xyy-20261014-05/repair-baseline-*`。
- 当前已确认：首页中英共用 hero、服务介绍和履约步骤默认透明，依赖 JS 恢复显示。其他页面须区分正文入场效果和菜单、弹窗、字幕等有意隐藏的交互内容。

## Scope 与所有权

- Terra：首页默认显示及渐进动画修复；可修改 `src/styles/home-hero/layout-content.css`、`src/styles/home-hero/actions-cue.css`、`src/styles/home-hero/responsive.css`、`src/styles/home-core-solutions/service-copy.css`、`src/styles/home-core-solutions/service-details.css`、`src/styles/home-fulfillment/steps.css`、`src/styles/home-fulfillment/layout.css`、`src/styles/home-fulfillment/responsive.css`、`src/scripts/home-page.ts`、`src/scripts/home-service-motion.ts`、`src/scripts/home-fulfillment.ts`，以及必要的 `src/scripts/motion/reveal-copy.ts`、`src/scripts/motion/reveal-visual.ts`、`src/scripts/motion/reveal-entrance.ts`、`src/scripts/service-motion/detail-reveal.ts`、`src/styles/service-detail-motion.css`。后两组先经其他页面调查确认再实施。只写上述实现及 `docs/TERRA.md`；其他文件须先报 Sol。
- Nova：先只读盘点其他页面正文隐藏及 JS reveal 风险，区分无 JS 可读、加载后临时隐藏和有意交互隐藏；提供具体文件/路由、风险与最小建议。Luna PASS 后做最终 Review。可写本任务 ignored 审阅证据及 `docs/NOVA.md`，不改实现。
- Luna：Terra 交付后独立测试；可新增本任务行为测试 `tests/e2e/content-visibility.spec.ts`，必要时将帮助函数分到 `tests/e2e/helpers/content-visibility.ts`；只写测试、`docs/LUNA.md` 与本任务 ignored 证据。
- Sol：本合同、`DEV_STATE.md`、`docs/SOL.md` 及本任务 ignored 证据；控制其他页面实际修改范围。
- 各角色共享工作区，不撤销他人修改，不再委派；依赖实施、测试、最终审阅顺序执行。

## 排除项

- 不处理 Task 04 review 中发布探针、formal 配置及临时端口 E2E 的三个兼容性问题；记录为既有未处理问题，不能宣称发布门禁已经通过。
- 不修改业务文案、数字、图片、页面布局、CMS 读取与回退、API、依赖、安全头及公开 origin 契约。
- 不把弹窗、菜单、轮播非活动页、表单状态、视频字幕等有意隐藏内容一律展示。
- 不提交、推送、部署、修改环境文件，或访问真实 CMS/数据库/咨询写接口。浏览器与服务器请求只使用本地假服务，不跟随公开 HTTPS 跳转。

## Acceptance Criteria

1. 中英首页首次 HTML/CSS 呈现即有可读正文及 CTA；禁用 JS、阻断页面 JS、动画依赖初始化失败时，hero、服务介绍和履约步骤仍可读，链接可点击。
2. 正常 JS 下保留合适的入场/滚动效果，减少动态效果模式直接呈现内容；不增加永久隐藏标记、全局内联脚本、任意超时补丁或吞错机制。
3. 全部页面入口与共用样式/动画有一次针对性盘点；对确认的同类正文可见性问题在准确文件范围内修复。未受影响页面和有意交互隐藏需给证据，不能泛称全站全部功能无 JS 可用。
4. 桌面及手机覆盖实际受影响页面，中英共享路由均检查；对完整阻断 JS 与正常模式比较 SSR 文本、目标及祖先有效可见性、关键链接、布局、CSP 和控制台错误。动画初始化故障采用本地注入，生产不操作。
5. 相关行为测试、类型、Lint、维护预算与构建通过；Luna PASS、Nova APPROVED、Sol 差异及视觉验收。按实际改动验证，不将既有 Task 04 发布门禁回归算成本任务已解决。

## 证据

- 诊断与修复证据均放在 `output/diagnostics/xyy-20261014-05/`，原只读诊断结果保留。
- 工作顺序：首页实施与独立其他页面盘点 → 明确范围内必要补修 → Luna → Nova → Sol；返工沿用本 ID。

## 其他页面盘点后的准确范围

- Nova 已完成源码盘点，证据 `output/diagnostics/xyy-20261014-05/nova/inventory.md`。没有发现新增的静态无 JS 隐藏正文页面，但以下运行时提前隐藏机制会在动画初始化失败时滞留，纳入同类补修。
- Terra 现可实施前述共享 `reveal-copy.ts`、`reveal-visual.ts`、`reveal-entrance.ts`（实际云道中英两路由），以及 `service-motion/detail-reveal.ts` / `service-detail-motion.css`（8 组中英服务专题共 16 路由）。优先在实际触发时增强，不让正文等待成功回调才显示；错误必须保留可定位性。
- Terra 所有权增加 `src/scripts/home-capability/card-motion.ts`、`src/scripts/home-capability/tenure-motion.ts`，仅修正隐藏整卡/数字后创建动画失败的问题；确需集中 wrapper 才可修改 `src/scripts/home-capability-motion.ts`。不改数值、布局、计数或装饰语义，`flow-motion.ts` 保持。
- Luna 所有权增加 `tests/e2e/service-motion.spec.ts`，同步云道滚动前默认可读与进入时动画的行为断言，并可复用本次 helper 安装本机请求保护；保留其他现有断言。
- 产品旧 `data-reveal` 无活跃隐藏消费者；About、鞋服/直播/后整交互的隐藏内容为有意交互状态，本轮保持。正式测试需选代表路由验证排除合理，不能仅依赖图谱历史结点。

## R1：独立测试前的 Sol 预审补修

- Sol 指出共享 `reveal-copy` / `reveal-entrance` 的 `fromTo` 可能在已注册动画、尚未返回赋值时抛错，此时局部 tween 引用为空，单独清理样式不能停止后续写入；Terra 只读确认风险。
- 已通知 Luna 暂停候选运行/构建，可继续写测试。Terra 仅在这两个 helper 的 catch 中、清理样式前添加 `gsap.killTweensOf(targets)`；其他源码保持。
- 完成后重新冻结，由 Luna 覆盖部分构造后抛错并延后观察，确认内容持续可见且错误仍可定位。本轮不是 Luna 已执行后的 FAIL。

## R2：精确故障测试返工

- Luna 主 E2E 6/6、补充正常/无 JS/WAAPI 验证及静态、构建检查通过，但精确插桩 `reveal-copy.fromTo` 后观察到 catch 已执行，目标仍透明、tween 仍 active，独立结论 FAIL。失败脚本与逐阶段观测见 `luna/repair/gsap-fault-r1.*`，保留原始证据。
- Terra 仅定位并在 `src/scripts/motion/reveal-copy.ts`、`src/scripts/motion/reveal-entrance.ts` 内作必要修复；先核对注入忠实性，不迎合错误测试。其他实现冻结保持；超出两文件须报 Sol。
- 完成判据：故障确实触发且清理后目标立即恢复可读，无残留动画继续写入隐藏状态，后续观察仍可见；正常入场与错误可定位性保持。交 Luna 复测，再交 Nova 审阅。
- R2 候选在两个 helper 内先持有暂停时间轴，在其上构造原 `fromTo` 并启动；catch 清空子动画、停止时间轴、清除临时样式后重抛。正常动画参数保持，其他 14 个源码 hash 保持；冻结见 `repair-source-freeze-r2.json`。GSAP 私有 overwrite 条件与本次残留之间的关联仅为源码推断，不冒充运行时观测。
- R1 故障脚本原始输出保留；Luna R2 脚本已修正通过判据，将预期注入错误与意外错误分开，并实际断言两个 helper 的目标命中、早晚 opacity 与残留动画状态，不锁定特定清理 API。

## 最终验收

- 16 个实现文件与 3 个 E2E 文件完成范围内修复/回归覆盖，Luna R2 PASS、Nova APPROVED（0 阻断）、Sol 差异及双端视觉验收。主定向 6/6、补充中英双端/CTA/WAAPI/observer、R2 两条精确 GSAP 故障与服务相关复测通过；类型、Lint、维护预算、格式及构建通过，861 单测沿用同任务 R1 通过证据。
- 16 项源码冻结 hash 匹配，1571 文件基线核对没有越界修改；完整失败与复测证据保留于本任务 ignored 目录，最终索引为 `final-result.json`。
- 验证仅本地 Chromium 模拟视口和假服务；未提交、推送、部署或运行 `verify:release`，Task 04 三项既有发布兼容回归仍未处理。
