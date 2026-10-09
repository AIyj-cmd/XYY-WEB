# XYY-20260929-01 — 中文仓配详情统一入场效果

- 风险：MEDIUM，新增共享客户端动效；流程 Terra → Luna → Nova → Sol。
- 授权：中文仓配总览对应八详情的本地实现与验证。英文需用户验收后另行授权。
- 基线：HEAD `54b41d2388d34de5a8f6ddad2c32b77b1f75dfd5`。已有治理配置、状态/角色日志、plans 与未跟踪媒体全部保留；基线与文件 hash 位于 `output/service-motion/xyy-20260929-01/baseline/`。
- 目标路由：`/xiefu-yuncang`、`/tuihuo-zhijian`、`/houzheng-xiufu`、`/kuajing-yuncang`、`/huanan-xiefu-yuncang`、`/huadong-xiefu-yuncang`、`/zhibo-cangpei`、`/b2b-mendian-cangpei`。
- 最小 Scope：ServiceLanding 中文八详情显式门控，统一可复用动效组件/脚本/局部样式；标题、正文、卡片与媒体滚入后按阅读顺序渐显、轻移，媒体可轻微缩放。集中调整节奏与强度，单次播放，不为页面各建动效模块。
- Terra 文件所有权：`src/layouts/ServiceLanding.astro`，新增 `src/components/service/ServiceDetailMotion.astro`，新增 `src/scripts/service-motion/detail-reveal.ts`、必要的同目录 `detail-reveal-targets.ts`，新增 `src/styles/service-detail-motion.css`，`docs/TERRA.md`。如不需要其中某文件可不创建；其他路径先返回 Sol。
- Luna 所有权：任务证据目录与 `docs/LUNA.md`；独立验证，不改实现。本任务以 CLI 浏览器临时探针及既有相关测试为主，不为静态效果新增持久测试文件。
- Nova 所有权：`docs/NOVA.md` 与任务 review 证据；只读实现与测试结果，不重写实现。
- Sol 所有权：本合同、任务证据、`docs/SOL.md` 与 `DEV_STATE.md`。
- 排除：英文启用/原效果更改、其他页面、业务文案/数字/claims、CMS/SEO/Schema/路由/媒体资源、依赖、全局动效重构、提交、推送、部署及任何真实外部写入。

## 验收判据

1. 八详情均经同一调用入口启用，首屏与各内容区可见元素依阅读顺序入场；一个共享配置可修改节奏，无逐页脚本/重复逻辑。
2. 动效有实际中间帧，滚入后及时开始、最终内容清晰；快速滚动、锚点直达、键盘聚焦、返回导航不导致永久隐藏或不可操作；避开隐藏 tabpanel 与折叠 FAQ 的不恰当延迟。
3. 默认 HTML/CSS 可读，无 JS 或不支持动效 API 时仍完整；减少动态效果时立即可读且无位移/缩放动画，动态切换设置可收敛。
4. 1440 桌面、390 手机八页均无新横溢/裁切/控制台错误，代表页补 360/768；FAQ、阶段 tabs、链接、视频及原布局正常。
5. 英文四对应服务页、中文 classic 详情、首页与 `/product` 不启用新增效果；正文、链接、SEO、媒体与基线保持。
6. 相关格式/lint/typecheck/维护预算通过；现有相关单测及必要行为测试通过。Luna PASS、Nova APPROVED 后由 Sol 验收。本次不提交/部署，不强加全量 verify/release。

## 输入与证据

- 当前 ServiceLanding locale/presentation 门控、八类 article/section 结构、既有 motion 工具与页面 tabs/FAQ 行为。
- 本地开发服务 `http://127.0.0.1:4322`，可复用其显式离线 CMS 与假线索配置；不得读取/输出真实凭据。
- 交付实现 diff、实际验证命令与结果、桌面/手机截图与动效中间帧/时序证据、范围/内容保护比对、真实限制；所有失败原始记录保留。
- 不委派子任务。各 Agent 不是独占仓库，不得撤销用户或其他 Agent 修改；只追加本任务日志。

## 实际结果

- 本地验收完成：Terra实施，Luna PASS，Nova APPROVED，Sol复核最终5文件冻结、16路SSR、874保护路径及6张代表图后验收。
- 独立浏览器覆盖八页两端共16首屏组合、桌面和手机各49区块；手机矩阵和边界补测由未实施代码的Sol执行，Luna核对原始结果。相关21单测及局部类型/格式/lint/维护预算通过。
- 原探针失败保留并定位为测试/环境问题；原生IO复核13处触发边缘后无实现缺陷，未重跑无关全量套件。
- 交付限制：本地离线Chromium模拟视口；未build/fullverify/release、提交、推送、部署或真实外部写入。英文效果尚未启用。

## 用户节奏调整（沿用 XYY-20260929-01）

- 用户确认改为0.8秒时长、0.15秒间隔。本轮LOW，仅已验证共享动效的两项视觉时序常量，未变更行为分支/契约；按Terra → Luna → Sol执行，初版MEDIUM审阅作为未变部分基线。
- Terra仅拥有 `src/scripts/service-motion/detail-reveal-targets.ts` 与自身日志：duration 460→800、stagger 80→150；maxStagger仍320，其余源码保持。不是独占仓库，保留所有既有修改，不委派。
- Luna仅拥有本轮证据目录 `output/service-motion/xyy-20260929-01/slower/` 与自身日志；Sol负责本合同/状态/自身日志与最终验收。
- AC：只有上述两数值变化；1440/390代表中文详情实际动画duration800、delay序列符合150ms且上限320；首屏及下方区块在1.12秒最大配置时间后正常清晰，减少动画仍立即可读；英文marker仍为0。局部格式/静态差异及两端浏览器验证通过即可，不新增持久测试或重跑已绿全矩阵。
- 排除：maxStagger、easing、位移/缩放/触发/清理逻辑，英文启用，其他页面、业务内容/CMS/依赖、提交/推送/部署。
- 输入为本轮baseline目录和前轮冻结结果。交接只记录本次实际检查，原矩阵是未变功能的历史基线，不冒称重新执行。
- 本轮结果：Terra仅修改两值且格式/diff通过；Luna独立1440/390实际时序、中间帧、首屏/下方结束状态、reduce、英文门控、横溢及浏览器错误PASS。Sol核对原始结果、两项差异和四个相关源文件保持后本地验收；证据 `slower/luna/report.md`、`slower/source-freeze.json`。不重复已绿初版测试或Review，无发布动作。
