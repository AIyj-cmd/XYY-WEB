# XYY-20261012-02 — 关于我们页视频收边与介绍区调整

- 风险：MEDIUM；仅本地前端布局与滚动行为。用户授权将 Lassie 首屏视频向下滚动收边、大圆角衔接浅色下一屏的效果应用到本地关于我们页，并将截图的介绍内容放到下一段，尺寸与首页统一。
- 基线：HEAD `00318b57442903b7c28e5c541795a0dc05f91af8`；既有 Oracle 清理、运维文档和角色日志改动保留。基线状态和完整 diff 存于 ignored `output/playwright/xyy-20261012-02/`。
- 输入：上一任务 Lassie 桌面、滚动、手机截图；用户截图 `/tmp/codex-clipboard-rKkAhk.png`；当前 AboutHero、视频控件、Explorer、首页 hero 尺度。Graphify 现有图仅辅助定位，当前源码为准。

## Scope 与所有权

- Terra：`src/components/about/AboutHero.astro`、`AboutHeroMedia.astro`、`AboutHeroControls.astro`；允许新增 `src/components/about/AboutIntroduction.astro`；`src/styles/about-stage.css`、`about-stage-responsive.css`、`about-explorer.css`、`about-explorer-responsive.css`；允许新增 `src/styles/about-introduction.css` 及其响应式文件；`src/scripts/about-page.ts`、允许新增 `src/scripts/about/hero-reveal.ts`；仅必要时调整 `src/scripts/about/video.ts` 保持控件与实际播放状态一致。追加自己的 `docs/TERRA.md`。
- Luna：独立验证；可新增 `tests/e2e/about-hero-reveal.spec.ts`、`tests/e2e/about-hero-accessibility.spec.ts`（按布局/交互职责拆分，以满足现有测试文件行数预算）及调整既有 `tests/e2e/about-cases.spec.ts` 的受影响关于页断言；`tests/e2e/english-acceptance-routes.spec.ts` 仅允许将 `/en/about` 的 H1 边界检查改为滚动到新介绍区后检查，保留完整边界断言及其他路由行为；证据仅写 `output/playwright/xyy-20261012-02/`，追加 `docs/LUNA.md`；不改实现。
- Nova：只读审阅本任务 diff、交互与证据；追加 `docs/NOVA.md`；不改实现或测试。
- Sol：本合同、`DEV_STATE.md`、`docs/SOL.md`，调度与最终视觉验收。
- 不改 CMS 读取/数据契约、公开数字、API、首页、导航、图库设计、弹窗业务、依赖或环境；不使用参考站素材。无真实 CMS/数据库操作、服务器变更、提交、推送或部署。需要增加文件范围时先返回 Sol。
- 按 Terra → Luna → Nova → Sol 顺序；子代理不再委派，保留他人修改。

## 可观察验收条件

1. `/about` 和共享 `/en/about` 首段仅呈现原有企业视频及必要字幕/播放控件；原有品牌标题、公司简介、四个 Explorer 入口完整位于紧接其后的浅色介绍区，唯一 H1 与语义结构保持。
2. 顶部状态视频满宽；向下滚动时平滑出现左右留白和大圆角；滚回顶部可还原。视频与介绍区自然衔接，无粘滞空白、横向溢出或控件被裁切。
3. 介绍容器与首页 hero 的 `max-width: 1200px`、桌面 `32px` / 手机 `20px` 内边距对齐；标题采用首页同等响应式字号。桌面形成清晰栏位，手机自然纵向排列。
4. 复用 `/introduce-desktop.mp4`、`/introduce-540p.mp4` 与原 poster；暂停/播放、静音按钮可键盘操作，字幕保持；尊重 reduced-motion，禁用动态收边时仍能访问全部内容。JS 不可用时无隐藏正文。
5. 四类弹窗入口、关闭/Escape/焦点回归与深链接保持；图库和页脚保持。中英文桌面和手机布局均可读，至少验证 1440×900、390×844，并检查窄屏。
6. 本次类型、目标格式/Lint、维护性与相关测试通过；Luna 独立浏览器证据包含顶部、滚动中间态、介绍区、回顶部和 reduced-motion；Nova APPROVED 后 Sol 亲看截图验收。只做本地改动，不将此结果表述为已上线。

## 交接重点

- 优先通过独立媒体 frame 的裁切/圆角变化实现，保持正常文档流，不修改视频像素内容，不引入动画依赖。
- 次屏使用浅色背景、深蓝正文及品牌橙色，Logo 在浅底可见；所有 CMS 成功空值与失败策略完全保持。
- 既有测试含首屏高度、`.about-stage__media`、`#hero-mute-btn`、Explorer 等选择器，保留合理兼容，必要断言按新的页面结构更新，不放宽真实功能。
- 本地验证使用隔离端口及不可达 loopback CMS 触发已审核静态内容；不使用真实管理凭据或提交表单。

## 结果

- 已本地验收。六个实现文件及冻结指纹见 `output/playwright/xyy-20261012-02/source-freeze.sha256`；两项新浏览器测试按布局/交互拆分，英文路由测试仅补关于页H1滚入视口后的边界检查。
- Terra类型检查672文件0 errors/0 warnings/4既有hints；Luna定向E2E3项、既有about-cases1项、关于单测13/13通过；目标格式/Lint/维护性及diff检查通过。Nova APPROVED，补查英文1440/768/390/360文字range无裁切、无横溢。Sol亲看桌面和手机中文/英文截图。
- 额外English组合5通过/9失败/2跳过准确区分为Astro开发工具shadow H1与4322开发服务未挂生产canonical中间件的环境差异；不计为全套通过。原失败证据留存范围见Luna日志，未伪造被后续重跑清理的test-results。
- 本地隔离预览4322使用审核静态回退，原4321保持。完整verify/release未运行；没有提交、推送、部署、真实CMS/数据库或系统配置操作。浏览器动态证据为Chromium模拟视口，width动画局部触发布局的成本已审阅，无观测到的抖动或横溢。

## R2 — 按用户截图裁掉底部黑带

- 沿用同一 Task ID。用户在本地预览后明确要求裁掉视频底部大黑边，更新原“字幕保持”要求：该黑底字幕带可一并裁出可见区域。仅调整前端视频显示裁切，不改原媒体、公司正文、CMS、滚动逻辑或其他区域。
- Sol抽取片源5秒原始帧确认：1280×720素材画面约到第646行，之后是自带黑底字幕带；手机960×540同构。证据和本次增量基线在 `output/playwright/xyy-20261012-02/r2/`。
- Terra只改 `src/styles/about-stage.css` 中 `.about-stage__media` 的显示高度/定位（必要时同文件简短注释）并追加自己的日志。以overflow-hidden frame裁掉原素材底部约11%，例如height:112%并object-position:center top；基于实际浏览器效果确定，保持画面比例，不改原视频/source/poster/控件/收边脚本。
- Luna只调整既有 `tests/e2e/about-cases.spec.ts` 中受影响的objectPosition断言；其余只读复测现有定向测试，不为这个局部CSS修正新增镜像测试。证据写R2目录并追加自己的日志。Nova只读增量Review并追加日志。Sol负责状态/合同/最终视觉验收。
- AC：1848×905（用户截图比例）、1440×900、390×844下，播放时视频底部黑带及其字幕不再可见，画面无拉伸/新留白；滚动收边/回顶、暂停和静音保持。poster加载阶段不出现新增黑带；至少检查首屏和滚动状态。原始mp4/poster字节保持。目标格式、相关现有浏览器回归通过后审阅与验收。
- 本轮为上一布局的局部显示修正，仍按现有Terra→Luna→Nova→Sol交接收口；不提交/推送/部署，不改系统或真实CMS/数据库。不重复全量类型/构建/单测，除非出现对应真实问题。

R2结果：已验收。精确增量为2行CSS与1行既有测试断言；Luna三视口播放/滚动及poster检查、4项现有E2E通过，Nova APPROVED。Sol亲看实际1848×905与390×844截图，三媒体hash保持、42份其他既有diff保持；目标格式与diff检查通过。仍仅本地候选，未提交或部署。

## R3 — 使用现有时间轴叠加字幕

- 用户明确要求使用已找到的时间轴重新叠加字幕；沿用本 Task，风险 MEDIUM，流程 Terra → Luna → Nova → Sol。基线 HEAD 仍为 `00318b57442903b7c28e5c541795a0dc05f91af8`，R3 起始 diff、状态和相关文件指纹存于 `output/playwright/xyy-20261012-02/r3/`。
- 输入：`src/i18n/about-ui-captions.ts` 已有中英31条字幕和时间轴；`src/scripts/about/video.ts` 已有 timeupdate 同步逻辑，但当前页面缺少 `hero-caption` 元素。恢复显示容器与响应式样式，复用现有文案和同步脚本。
- Terra 所有权：仅 `src/components/about/AboutHero.astro`、`src/styles/about-stage.css` 及自己的 `docs/TERRA.md`；字幕置于 frame 内媒体上层，默认隐藏，居中白字加阴影，允许自然换行，距底部及两侧有安全间距，不新增通栏黑底。除非发现同步真实缺陷并返回 Sol，否则不改同步脚本。
- Luna 所有权：只读独立验证，可写 R3 目录的浏览器探针/截图/报告及 `docs/LUNA.md`，不改实现，不新增仓库测试。运行现有 About 定向回归并通过浏览器检查字幕行为。Nova 只读增量 diff、截图和测试证据并追加 `docs/NOVA.md`。Sol 负责合同、DEV_STATE.md、docs/SOL.md 和最终验收。所有角色均不得再次委派。
- 排除：时间轴/文案/Claims 数据、原视频/poster、裁切高度和位置、滚动收边逻辑、音频、控制按钮、CMS、其他页面、依赖和环境；无提交、推送、部署、真实 CMS/数据库或服务器操作。保留全部既有脏文件及并行变更。
- AC：中英文在对应时间显示既有文本，无字幕时间段隐藏，暂停/恢复/跳转及回到开头后无残留错句；1440×900、390×844及360px窄屏中英文长句可读且不溢出/被裁切；滚动收边后字幕随 frame 保持边距、不挡顶部控件。裁切和无黑带视觉保持，原媒体、字幕数据和同步脚本指纹不变。默认空容器不制造无 JS 空白区域或持续读屏播报。
- 证据：目标格式/Lint和diff检查、Luna浏览器时间轴/间隔/暂停/跳转/循环行为与双端截图、既有About定向回归、Nova审阅。此局部恢复不运行无关构建/全量回归；如有对应真实失败再按范围修正并复测。

R3字号补充：用户预览后认为14–18px偏小，要求约30号。桌面字幕调整为30px、手机22px，使用 `clamp(1.375rem, 2.5vw, 1.875rem)` 保持响应式；Terra仅修改既有字幕font-size，Luna以此最终候选复查1440/390/360中英文长句和滚动态。已验证且不受字号影响的时间轴/控件可复用本轮实际证据，不重复无关测试。

R3结果：已验收。最终桌面30px/手机22px；一处显示节点与17行局部CSS，复用原字幕脚本和数据。Luna中英文三视口6/6、186个cue/84个gap覆盖及既有4项E2E通过，Nova APPROVED，Sol亲看最终桌面/手机/窄屏滚动截图。早期探针透明度过渡误判保留并定向复测，六保护hash及42份其他既有diff保持。仍仅本地修改，未提交或部署。

## R4 — 视频主标题和小标题

- 用户确认主标题“专注鞋服仓配，让交付更从容”、小标题“从一件新品入库，到一份订单发出，为品牌做好每一次履约。”；沿用本Task，LOW静态文案/布局。英文使用上轮提议的“Apparel fulfilment, with confidence.”和“From inbound stock to outbound orders, we support every step of your fulfilment.”。基线HEAD不变，状态、差异和保护指纹存于同任务r4目录。
- Terra所有权：`src/components/about/AboutHero.astro`、`src/i18n/about-ui.ts`（仅hero新增两项双语文案）、新增 `src/styles/about-hero-copy.css`；允许必要时微调 `AboutHeroMedia.astro` 的文字区域渐变以保证白字可读，不恢复通栏黑底。既有 `about-stage.css` 已201行，可仅删除两个空行满足200行预算，不改语义；不把新样式堆进该文件。追加 `docs/TERRA.md`。
- 标题组放frame内左侧偏上，内容起点与首页1200px容器/桌面32px、手机20px内边距对应，顶部给导航/按钮留空间；桌面大字约56–64px、小字18–20px，手机合理缩放换行。保留下一屏唯一H1；新主标题可用展示性段落，不新增H1或更改下一屏文案。字幕保持桌面30px/手机22px，不遮挡。
- Luna所有权：仅r4目录内的探针、截图、报告及 `docs/LUNA.md`；不修改实现或仓库测试，不新增低价值测试。中英文1440×900、390×844、360×640真实浏览器检查准确文案、computed字号、文本边界/与控件及字幕不相交、顶部及滚动态无横溢/黑带；至少在有字幕的亮色视频帧检查可读性。一次暂停/静音冒烟与既有English About UI单测足够，不重复R3整套时间轴矩阵或跨页面E2E。Nova只读小范围代码/证据审阅并追加自己的日志。Sol负责合同/状态/日志与最终视觉验收。按Terra→Luna→Nova→Sol顺序；所有角色不得再委派，保留并行修改。
- 排除：字幕时间轴/翻译、字幕同步与字号、原媒体、视频裁切、滚动逻辑、导航、下一屏内容、CMS/公开数字、依赖、环境及其他页面。不提交、推送、部署或访问真实CMS/数据库/服务器。必要文件扩展先返回Sol。
- AC：两路由显示各自准确主/小标题；桌面位置和字号符合上项，窄屏允许自然换行且无裁切；顶部、滚动态标题/小标题/动态字幕/播放控件互不重叠，白字在亮色帧仍可读；唯一H1及现有播放/静音、滚动收边和去黑带效果保持；六保护文件指纹保持。目标格式/Lint/维护性检查、独立双端视觉及相关单测通过，最终审阅无阻断。

R4居中修正：用户看首版后明确“居中显示”，覆盖上项左侧偏上的位置要求。标题组调整为frame画面中部水平居中，标题与小标题均居中对齐；桌面标题使用足够宽度避免不自然断句，手机自然平衡换行。底部动态字幕位置、字号与控件保持；仍以中英1440/390/360无遮挡、无裁切及滚动态为最终AC。

R4最终撤销：用户随后明确“算了去掉吧”，撤销本轮新主标题/小标题，不继续居中方案。Terra仅回退可归属R4的标题节点、import、双语文案及新CSS；AboutHero与about-ui恢复到r4起始before快照，必要时恢复本轮新增渐变；保留R3动态字幕及其30/22px、原媒体裁切和收边效果。about-stage.css删除两个空行的预算修正可保留，不改变CSS语义。Luna最终只核对精确回退/无残余引用、保护hash和中英文桌面/手机回到视频+字幕界面，不重跑被撤销标题方案的矩阵或无关测试；Nova仅检查回退增量，Sol记录最终撤销结果。

R4最终结果：已按用户最终指令撤销标题试版，恢复R3视频+动态字幕。四源文件与before逐字一致，新增标题CSS/引用/节点/双语文案无残留，about-stage.css仅两空行修正；Luna中英双端4/4及所有冻结/保护hash通过，Nova APPROVED，Sol亲看桌面/手机滚动态。首轮开发工具H1探针误判保留并以精确选择器复测；43份其他既有diff保持。仅本地，未提交或部署。

## R5 — 更明显且持续到退场的收边

- 用户要求收缩更多，并明确应随滚动持续到视频完全离开视口。沿用本Task，MEDIUM前端滚动行为；当前仅约半屏距离便完成且桌面总内缩最多128px。最终改为按视频区域实际高度计算完整退场进度，增大内缩：桌面最大为宽度28%且总量不超过480px，手机为宽度20%；以上均是两侧总量。基线HEAD不变，r5目录保存起始diff、状态及脚本/测试副本。
- Terra仅所有权 `src/scripts/about/hero-reveal.ts` 和追加 `docs/TERRA.md`；修改measure中的进度距离与内缩量，保留原被动scroll/rAF、resize、圆角36px、reduced-motion和回顶部复原逻辑。不改CSS/组件/内容、媒体裁切、字幕30/22px/时间轴、控件、下一屏、CMS或其他页面。无新增sticky/pin/额外滚动空白。
- Luna仅所有权既有 `tests/e2e/about-hero-reveal.spec.ts`（追加滚动后半程仍继续收缩的可观察行为断言，保持220行预算）、r5/luna证据及自己的日志，不改实现；复用该矩阵检查中英1440/768/390/360，和既有about-hero-accessibility两项测试，合计3项即可。不重复关于页跨页面E2E、字幕全矩阵或新增镜像测试。Nova只读变更/证据并追加自己的日志；Sol负责合同、状态、日志及最终视觉验收。流程Terra→Luna→Nova→Sol，不再委派，保留所有既有及并行变化。
- AC：顶部满宽且无圆角；视频已滚出约55%至85%的后半程宽度仍继续减少，不能像旧版提前定格；视频刚完全离开视口时才到最大内缩，继续滚动不无限收窄；1440px最终内缩约403px、390px约78px。滚回顶部恢复满宽；resize后重新测量，reduced-motion开关及无JS保持可读。两路由桌面/手机无横溢，字幕/控件保持在frame内，下一屏自然衔接且新增主/小标题仍不存在。
- 证据：Terra目标格式/Lint与类型检查；Luna3项相关浏览器回归及顶部/后半程/退场截图和几何，至少说明后半程宽度变化；Sol亲看桌面/手机后半程，Nova无阻断。九个保护文件hash不变。无提交、推送、部署、真实CMS/数据库或系统配置操作，不跑无关全量门禁。

R5结果：已验收。实现仅measure两项表达式；Luna既有测试补后半程回归，最终双语四视口8/8、相关E2E3/3、目标格式/Lint/维护性通过；类型674文件0错误/0警告/4既有hints，Nova APPROVED。Sol亲看桌面/手机55%和85%截图，实测持续收边至100%并在其后钳制；freeze1项、保护hash9项及44份其他tracked diff保持。初始测试等待/坐标误判保留并在测试侧修正，未修改产品掩盖失败。证据同任务r5目录，仅本地未提交或部署。

## R6 — 介绍排版与图片入口卡片

- 用户提供当前介绍屏和三张图片卡片参考，要求改为类似形式并关注大标题与说明文字排版；沿用Task。LOW静态布局与装饰内容，弹窗/路由/数据读取/滚动行为不变，按Terra → Luna → Sol验收；如需行为修改先返回Sol重评风险。起始HEAD不变，既有脏文件全部保留，r6目录保存差异与相关before副本。
- 设计：维持首页1200px容器、桌面32px/手机20px边距。上方桌面左右两栏分别放原品牌大标题与原公司简介，手机上下排列，消除原右上大片留白。标题桌面约48–56px，保留完整内容与唯一H1；简介桌面16px左右、行高约1.8，不压成密集小字。下方四张等高圆角图片卡片对应既有四入口，参考图的顶部小标签、中部醒目标题、底部短说明与箭头；桌面四列、平板两列、窄手机单列，卡片内边距约24px。使用现有真实图片、轻微模糊和深色遮罩，白字对比清楚，hover可轻微图片缩放、focus明显，PRM不动画。
- 图片使用已有 `/w-hq.webp`、`/w-apparel.webp`、`/about/honor/1.jpg`、`/w-inspect.webp`，只作为装饰背景；不生成或修改媒体。四短说明只解释入口内容，不新增数字或业绩承诺：发展历程“回顾新亦源的发展足迹与重要节点。”；仓网布局“了解区域仓网与仓配协同布局。”；资质与荣誉“查看企业资质与行业荣誉。”；常见问题“查阅仓配合作与服务中的常见问题。”；提供对应自然英文。既有标题、简介CMS文本、claims和弹窗正文不改。
- Terra所有权：`src/components/about/AboutHero.astro`、`AboutExplorer.astro`；`src/styles/about-stage.css`、`about-stage-responsive.css`、`about-explorer.css`、`about-explorer-responsive.css`；可新增 `src/i18n/about-explorer-cards.ts` 保存卡片装饰图片和双语短说明；自己的 `docs/TERRA.md`。只修改介绍结构与四按钮视觉，不改video section内部、弹窗DOM/逻辑/属性和原title字段，保留原buttons的aria/data属性。无需为简单静态改动新增测试文件。格式/Lint/维护性与目标类型检查自检。
- Luna所有权：既有 `tests/e2e/about-hero-reveal.spec.ts` 仅调整受影响介绍网格断言为新header/grid，保留1200px/32px/20px与原视频断言；r6/luna证据、自己的日志。不改实现。独立中英文1440/768/390/360标题/简介/卡片排版截图，无横溢、重叠、截断，四图片加载；键盘四入口/关闭/Escape/焦点与既有PRM/noJS通过，复用既有3项About reveal/accessibility E2E；不重跑视频字幕时间轴或跨站矩阵。保留测试中动画稳定等待，不为适配新布局放宽实质断言。
- Sol所有权：合同、DEV_STATE、SOL日志及最终视觉验收。AC：完整唯一H1及CMS简介，上方桌面并排/手机堆叠；四卡片等高对应原四入口、至少桌面4列/768两列/390单列，白字在图片上清晰，中文短说明与英文对应且不裁切；四入口功能与视频R5效果保持，九保护hash不变。全部角色不再委派；不提交、推送、部署，不改环境、生产、CMS/数据库、依赖或其他页面。

R6结果：已按LOW静态流程验收。七个实现文件将标题/原简介排为双栏并把四入口改为双语图片卡片，原视频section与dialog逐字保持；Luna双语四尺寸8/8、noJS2/2及3项相关E2E通过，目标格式/Lint、维护性838和类型675文件0错误/0警告/4既有hints通过。Sol亲看最终桌面/平板/手机文字与卡片并审阅增量；freeze7项/保护hash9项、41份其他tracked diff保持。中文探针初始标题非空阈值误判保留并仅修正测试。证据r6目录，未提交或部署。

## R7 — 四种纯色卡片

- 用户要求卡片使用纯色、每区块一个颜色。沿用本Task，LOW静态呈现；Terra → Luna → Sol。仅更换背景材质，维持R6网格/字号/全部中英文文案/居中标题与描述、原按钮及弹窗逻辑；起始HEAD不变，r7保存baseline与三源码before。
- Terra所有权仅 `src/components/about/AboutExplorer.astro`（删除装饰img）、`src/i18n/about-explorer-cards.ts`（删除image类型字段与路径，保留description）、`src/styles/about-explorer.css`（按原data入口id设定四种纯色，移除图片/模糊/渐变遮罩/专属缩放样式），追加自己的日志。颜色依次为发展历程深蓝 `#243a52`、仓网蓝绿 `#32656b`、荣誉暖棕 `#795d44`、FAQ灰紫 `#625b70`，保持白字；实算对比度均大于4.5。原hover箭头与focus可保留。不要隐藏图片继续加载，不更改或删除公共图片资源。
- Luna所有权仅r7/luna证据与日志，不改实现/仓库测试。验证中英文1440/390共4组合：四底色准确且不同、背景无图/渐变、装饰img不存在、白字对比度达4.5、标题/说明不溢出，原四卡等高/对应网格保持；复用既有About accessibility中的键盘/四弹窗/Escape/焦点测试1项。无需重跑R6八组合、R5收边矩阵或字幕时间轴。检查freeze与九保护hash，保留真实失败。
- Sol负责合同、状态、日志和桌面/手机视觉验收。AC为上述可见结果及背景不再加载四卡图片，原dialog DOM保持，九个保护文件hash不变。Terra目标格式/Lint/diff自检；此次静态删除和CSS颜色不重复全量类型/构建/维护性检查（文件只缩短）。所有角色不再委派，保留既有变化；无提交、推送、部署、真实CMS/数据库/环境/系统操作，不改视频/上方介绍/其他页面。

R7结果：已验收。四卡改为指定纯色且不再包含装饰img/背景URL/渐变，原文案/布局/交互保持。目标格式/Lint/diff、Luna双语双端4/4及既有键盘/四弹窗回归1/1通过；对比度均超过6，freeze3项/保护hash9项与46份其他tracked diff保持。Sol亲看桌面/手机截图并审阅增量，按LOW流程收口。证据r7目录；仅本地，未提交或部署。

## R8 — 品牌影像志 Editorial Gallery

- 用户要求底部照片改成摄影编辑排版：大幅仓储主图、人物/团队错落穿插、分组留白、品牌色只用于小面积文字/编号/交互，活动贴纸和大段文字图不做主视觉。沿用Task；MEDIUM，替换旧随机瀑布流及滚动切换文案逻辑，按Terra → Luna → Nova → Sol。HEAD仍为00318b5，r8保存本轮baseline、10份before、13项保护源码和158项原图hash；既有脏差异保持。
- Sol已目视全部157张旧图库缩略图和候选原图。精选六张：主图 `/w-apparel.webp`（1920×1079，真实挂装仓储无活动贴纸）；辅助 `/about/gallery/gallery-140.webp`（960×1280，服装整理/包装现场）、`gallery-126.webp`（1280×960，熨烫作业）、`gallery-086.webp`（1280×960，仓内同事沟通）、`gallery-083.webp`（1280×960，货架前团队合影）、`gallery-093.webp`（1280×960，同事互动）。辅助作业照原有角落logo保持。原图文件不编辑/删除，旧157张连续墙不再渲染。
- 设计方向：标题“品牌影像志”/“Life at XINYIYUAN”，小标Editorial Gallery；导语讲空间、工作与同行的人。三组“仓储现场 / At the warehouse”“工作中的人 / People at work”“并肩的日常 / Everyday, together”。第一组超宽仓储主视觉配较小竖幅作业照与留白文字；第二组横幅作业及沟通照大小错位；第三组以团队合影和较小人像日常收束。可用12列不对称网格、自然图片比例、图外细字caption与01–03编号；不做白字覆盖照片、阴影卡片、大色块或连续等宽拼贴。大标题约48–56px桌面/32–40px手机，正文16px左右，caption不低于13px。容器沿用1200px/桌面32px/手机20px边距；组间桌面约100–150px、手机56–80px，合理错位不造多屏空白。无虚构年份、地点、身份或公开数字。
- Terra所有权：`src/components/about/AboutScrollGallery.astro`、`src/styles/about-gallery.css`、`src/styles/about-gallery-responsive.css`、`src/data/about/gallery-images.ts`；新增 `src/i18n/about-gallery.ts` 保存双语编辑文案与具体alt；`src/i18n/about-ui.ts` 仅移除旧gallery文案；`src/scripts/about-page.ts` 仅移除旧gallery入口；删除 `src/scripts/about/gallery.ts`（旧文案滚动切换只服务被替换组件）；自己的日志和r8/terra证据。直接使用正常文档流/静态可读，不再保留旧sticky文字、随机位置或gallery滚动监听，无需额外动画或新交互。无JS/PRM内容自然可见。不新增灯箱/轮播/CTA，非链接图片不显示假交互。
- Luna所有权：`tests/e2e/about-cases.spec.ts` 仅更新受影响gallery合同，保留其他既有差异；`tests/e2e/about-hero-accessibility.spec.ts` 仅更新图库数量断言；`tests/unit/english-about-ui.test.ts` 更新gallery文案契约；如需独立布局测试可新增 `tests/e2e/about-editorial-gallery.spec.ts`，否则在r8/luna临时探针完成；自己的日志。不得改实现。检查中英1440/768/390/360八组合：六图加载、文字本地化、章节/顺序明确、图片/文字无重叠裁切、无横溢、桌面仓储主图面积大于辅助图（手机保持自然比例与最大宽度，允许团队图同宽）、无连续堆墙/大色块；亲看桌面/手机每组截图。无JS和PRM读得到全部六图及正文，页脚可达。复用受影响About accessibility和About-cases既有测试、英文UI单测；不重复字幕时间轴/上方完整收边矩阵。
- AC：两路由均为一个语义gallery区域、一个h2和三个h3章节，图外具体caption与alt，正常阅读顺序；六张指定真实摄影，仓储主图为最大宽度，无活动贴纸/海报主视觉；图片保留固有比例且不裁切人脸/手部，懒加载配width/height。桌面有明确主次错位及章节间留白，手机自然堆叠和少量宽度差异，正文与英文长标题完整。CMS简介、唯一H1、视频裁黑边/持续收边/30px字幕/无额外标题、R7纯色入口、弹窗与页脚保持；13保护源码/158原图hash不变。类型、目标格式/Lint、维护性、独立浏览器与受影响测试通过，Nova无阻断后Sol视觉验收。
- Nova仅只读审阅八项实现、相关测试、真实验证及范围保持证据，写自己的日志。Sol负责合同、DEV_STATE、SOL日志和最终验收。所有角色不再委派；不提交/推送/部署，不访问或修改真实CMS/数据库、环境文件、服务器、依赖或其他页面。继续复用隔离4322本地预览；原4321保持。

R8结果：已验收。八项实现变更将底部改为六张真实摄影、三个章节的中英Editorial Gallery，仓储主图最大、人物团队错位、自然比例与图外说明，旧随机墙/sticky口号及滚动脚本删除，原媒体保留。Luna八视口8/8、PRM2/2、noJS2/2、E2E3/3、单测3/3通过；类型675文件0错误/0警告/4既有hints，维护性838/目标格式/Lint/diff通过。Nova APPROVED，Sol亲看桌面/平板/手机最终效果并审阅实现与测试增量；freeze7/测试3/保护源码13/原图158保持，45份其他tracked diff不变。初次类型失败由旧测试契约更新解决，截图锚点与懒加载等待问题在探针侧修正。证据r8目录；本地隔离4322预览可用，原4321未动，未提交或部署。
