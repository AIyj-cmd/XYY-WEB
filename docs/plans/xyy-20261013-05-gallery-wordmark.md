# XYY-20261013-05 — 157张原图组成56XYY

- 用户先选择照片形状混排，随后明确要求“摆成56xyy”并确认；最终目标为全部照片本身组成可读的56XYY字形，圆角/胶囊变化作少量点缀。LOW静态照片坐标与CSS呈现，Terra → Luna → Sol；不改现有预览业务逻辑。
- Scope：保留157张catalog、完整顺序和原尺寸，替换五格重复坐标为数字5/6及X/Y/Y的照片拼字。桌面/平板横排56XYY，手机在同一个区域内上56、下XYY两行；全部照片都实际展示在字形笔画内部，不能通过整体mask把部分照片藏掉。大小错落、白底留白，全部仍在一屏内；悬停与点击显示原图保持。
- Terra所有权：src/data/about/gallery-mosaic.ts（保留preferredOrder及全catalog生成顺序）；可新增src/data/about/gallery-wordmark.ts存静态字形/分块；src/styles/about-gallery.css、src/styles/about-gallery-responsive.css。若需要组件/其它文件先返回Sol。只写所属源码、docs/TERRA.md及本任务terra证据，不再委派；不是独自在仓库，不回退别人的改动。
- 建议实现：清晰的5×7点阵字形笔画，按各字所需照片数量细分笔画格为1/2/3/4张不同大小的矩形；SSR产生现有desktop/tablet/mobile CSS坐标，157张每张分配一个非零位置，无叠放隐藏。桌面一行字，移动端居中两行，维持首图/末图顺序与原图href。用较大圆角和少量胶囊/拱形修饰照片边缘，不牺牲字形辨识度；不加漂浮动画、品牌大色块或新交互。
- 排除：原图文件/图库筛选/排序、外页图片、现有预览/弹窗脚本、文案与CMS、上方视频/字幕/介绍、全站页脚及其它页面；不提交推送部署，不操作真实CMS/DB/依赖/环境。
- AC：1440×900及768×900中英可清楚辨认为56XYY，390×844/360×780为56与XYY两行同区；恰好157个可见非零照片节点，src与public/about/gallery全集一一对应，无遮挡/重叠/横溢/内部滚动，区域不超过视口高度。至少两种照片尺寸、最大面积>最小2倍；圆角变化可见，字形空白区域真实留白。hover/键盘预览及手机tap仍显示完整比例原图并可关闭；源图片、组件、脚本及页脚保护hash保持。
- Luna所有权：docs/LUNA.md和本任务luna证据；不新增/修改仓库测试（既有157原图/无重叠/一屏契约应原样通过）。Terra冻结后独立运行about-gallery-preview.spec.ts的原图完整性八组合及mouse/keyboard/touch四项相关E2E（复用本地4321、workers1、chromium）；CLI亲看中英桌面/手机拼字、对不同字的形状预览抽查；目标格式/Lint、类型与diff。若纯样式未改TS则无需类型，但本方案改SSR坐标，类型检查适用。不要扩大为全站回归/build。
- Sol所有权：合同、DEV_STATE、SOL日志、最终源码增量与视觉验收；输入为用户截图、现有完整图库、HEAD00318b5与本任务before/protected.json。当前4321可访问，若退出按既有loopback合成CMS预览恢复。所有改动本地可逆，原有工作树脏改动完整保留。

## R2 — 保持连续悬停可用

- Luna初轮原样E2E为3通过/1失败：八组合157原图几何、键盘、触摸通过，mouse第三张预览失败。trace确认Esc关闭后鼠标位置下方的另一缩略图立即触发预览，遮挡下一次hover；这是实际交互缺陷，不能用放宽断言或改布局规避。
- 同一用户目标要求拼字后保留悬停，Sol将本任务风险上调为MEDIUM，流程改为Terra → Luna → Nova → Sol。原静态布局已冻结；仅增加下面脚本/回归测试所有权，替代前文对应排除项，其他范围/排除保持。
- Terra新增所有权：src/scripts/about/gallery-preview.ts；最小修复Esc关闭后静止指针导致新预览立即重开。无任意长冷却定时器；真正移动指针后可恢复悬停，包括在刚露出的同一缩略图内部移动；键盘focus可预览、Esc可关闭，dialog/点击/修改键链接保持。不得修改预览定位、图源、布局和其他源码；可写docs/TERRA.md与r2/terra证据。
- Luna新增所有权：tests/e2e/about-gallery-preview.spec.ts，允许添加此缺陷的行为回归，不降低原有断言。独立复测mouse/keyboard/touch及新增回归，验证关闭后静止不重开、真实移动后恢复；布局与图源冻结时复用本轮已通过的八组合几何与视觉证据。执行目标格式/Lint、类型/diff及保护hash。只写测试、docs/LUNA.md和r2/luna证据，不改实现。
- Nova：Luna通过后独立审阅Task05静态源码、R2脚本与测试增量、范围/事件生命周期/键盘触摸及证据；仅写docs/NOVA.md和r2/nova证据，不重写实现、不委派。
- R2输入：luna/report-initial.json、mouse-failure-trace-excerpt.json、原失败trace；r2/before保存脚本与测试原文，r2/protection-exceptions.json仅放开这两个文件，原其余180项及4项静态freeze必须不变。AC新增上述Esc行为回归和既有三类交互全部通过，独立Review APPROVED后才验收。不提交、推送、部署或扩展无关测试。

## 最终验收

- 157原图及顺序保持，桌面/平板56XYY横排、手机56/XYY两行的一屏布局完成；八组合几何、原图同集与四代表视口视觉通过。R2使用鼠标坐标变化解除Esc暂停，无冷却定时器，键盘焦点绕过鼠标暂停。
- Luna新增47行缺陷回归，原测试逐字保持；新Esc回归、keyboard、touch通过，mouse一次30秒总预算超时后仅该项使用CLI90秒预算复测16.5秒通过。保留首次失败与trace，不宣称一次全绿；旧脚本仅临时浏览器路由复现误弹，随后撤销。
- 类型680文件0错误/0警告/4既有hints、目标格式/Lint/diff通过，180保护及4静态源码/1脚本freeze与测试hash匹配；Nova APPROVED（0 findings），Sol亲看拼字截图、审阅增量并确认其他tracked差异保持。证据位于本任务output根及r2各角色目录。
- 本地4321关于页HTTP200；限Chromium模拟视口，无提交、推送、部署或真实CMS/数据库/环境操作。Scope内无剩余阻塞，最终验收完成。

## R3 — 2026-10-14 放大拼字

- 用户要求56xyy更大、仍保留拼字；沿用本Task ID。本轮LOW，仅CSS尺寸/留白调整，Terra → Luna → Sol。此前R2的MEDIUM交互已验收冻结，不重复修改或扩大测试。
- Terra所有权：src/styles/about-gallery.css、src/styles/about-gallery-responsive.css，以及docs/TERRA.md和r3/terra证据。扩大图库可用宽度与拼字高度，参考桌面shell最大1600px、29/9比例，手机17/20比例与左右16px留白；可按真实画面微调。标题维持原字号和清晰层次，桌面可用intro独立最大1136px保持阅读宽度。不使用transform放大造成裁切。
- AC：1440×900拼字宽度较before至少增加15%、高度至少增加25%；390×844/360×780高度至少增加20%，字形仍分别横排56XYY、两行56/XYY。全部157原图实际可见、非零，无互相重叠/横溢/内部滚动，区域不超过一屏；标题不被导航/拼字遮挡。原图/顺序/字形坐标/圆角/文案/hover脚本/组件/页脚保持，悬停原图与手机点击抽查正常。
- 排除：数据、组件、JS/TS、交互、图源/排序、文字、其他页面、仓库测试、依赖/环境、提交/推送/部署或真实CMS数据库。不是独自在仓库，保留既有全部脏改动，不再委派。
- Luna所有权：docs/LUNA.md、r3/luna证据；Terra冻结后CLI独立验证中英1440/768/390/360八组合，用页面临时注入before CSS比较尺寸（不改磁盘源码），157同集/几何及桌面hover+手机tap抽查，目标CSS格式/diff、184保护hash与CSSfreeze。无新仓库测试，无全站类型/build/verify。Sol审阅CSS增量与桌面/手机截图，完成状态/日志及合同记录。
- 输入：r3/before两CSS、baseline.diff/status、protected.json，现有157图与Task05最终照片拼字。4321服务本轮已停止，Sol按此前loopback合成CMS方式恢复本地预览；无环境文件或真实服务修改。R3完成前不沿用R2完成状态宣称新尺寸已验收。

### R3验收结果

- Luna八组合PASS，157原图一屏/无重叠越界；1440宽+21.13%、高+36.27%，390/360高+27.86%/+28.12%，768高+12.49%。桌面hover/Esc与手机tap原图/关闭抽查通过；before CSS仅临时注入测量后移除。
- 184保护与2CSSfreeze、目标格式/diff通过，Sol审阅增量并亲看桌面/手机最终截图，验收完成。记录见r3/luna/report.json、r3/sol-audit.json及角色日志。无仓库测试变更或无关全量检查；本地4321保持，未提交、推送、部署，仅验证Chromium模拟视口。

## R4 — 2026-10-14 更新图库文案

- 用户希望更换现有EDITORIAL GALLERY/品牌影像志等文案；Sol按56XYY照片拼字方向拟定并展示文案，直接进行范围内可逆更新。沿用Task05，LOW静态文案，Terra → Luna → Sol。
- Terra仅拥有src/i18n/about-gallery.ts、docs/TERRA.md与r4/terra证据。只改两种语言eyebrow/heading/introduction/hint四字段；zh-CN为「INSIDE 56XYY」「每一帧，都是新亦源」「从仓储一线到团队日常，用真实影像，认识新亦源。」「悬停放大 · 点击查看完整照片」。英文为「INSIDE 56XYY」「XINYIYUAN, in every frame」「From the warehouse floor to everyday team moments, get to know XINYIYUAN through real images.」「Hover to preview · Click or tap to view」。保持dialogTitle/close及全部图片alt。
- AC：中英关于页显示对应新文案；1440×900和360×780下标题/说明完整，无导航、照片重叠或横溢；全部157图、56XYY布局和R3尺寸保持，一屏可见。禁止修改CSS/组件/图源/排序/预览逻辑或其他页面。
- Luna仅拥有tests/unit/english-about-ui.test.ts、docs/LUNA.md、r4/luna证据；Terra冻结后更新既有英文文案断言，其他断言逐字保持，不新增镜像测试。运行该现有单测、目标格式/Lint/diff，CLI独立核对中英桌面/窄屏四组合截图/文案/一屏边界；无需重复图片交互、全矩阵几何或全站类型/build/verify。185保护hash与文案freeze保持。
- 输入：r4/before两文件、baseline.diff/status、protected.json；4321 HTTP200。Sol审阅四字段增量与视觉证据，更新状态/合同/SOL日志。既有其他修改保持，所有角色不得再委派、不提交推送部署、不操作真实CMS/数据库/依赖/环境。

### R4验收结果

- 中英四字段已更新，Luna仅同步英文单测3处字符串，3/3通过；中英1440/360四组合文案完整、一屏布局保持，185保护hash/文案freeze与目标格式/Lint/diff通过。
- 首轮标题scrollHeight判据误报，已按overflow与真实文字Range定向核实无裁切/重叠，原报告保留。Sol审阅增量与桌面/手机截图并验收，记录见r4/luna/report.json及角色日志。仅本地预览、未提交推送部署；原图/字形/尺寸和交互保持。

## R5 — 2026-10-14 浅灰蓝背景、柔光与颗粒

- 用户明确选择Sol推荐方案：浅灰蓝底＋左上淡蓝/右下极淡暖橙柔光＋微弱颗粒，上下柔和衔接，现有形状不动。本轮LOW静态CSS，Terra → Luna → Sol，沿用Task05。
- Terra唯一源码所有权：src/styles/about-gallery.css；另可写docs/TERRA.md及r5/terra证据。仅about-gallery背景层及必要的伪元素/内容层定位；可用内嵌SVG噪声作为CSS背景，不新增图片文件/依赖/外部请求或动画。基底参考#f3f5f7、中心近白，蓝橙渐变低饱和大范围，避免明显色块与边界；顶端融入现有#f4f7fb，底端接近页脚#f8fafc。静态颗粒低透明度，伪元素pointer-events:none并位于真实内容下方，不覆盖或改变照片颜色。
- AC：中英1440×900与360×780四组合能看出克制的浅灰蓝层次、淡蓝暖橙与微粒，标题可读、上下衔接自然；临时注入before CSS对比时，标题/图库与157张照片几何差≤0.5px（排除滚动舍入，比较相对section坐标），全量图源/顺序/样式形状保持，无新增溢出/内部滚动。一屏与放大后的56XYY保留；桌面hover/Esc及手机tap原图开关不被装饰层拦截。
- 排除：响应式CSS、所有字形/尺寸/间距/圆角/字体/文案、图源/排序、组件/脚本/仓库测试、其他页面/页脚、依赖/环境及任何外部写入。本轮r5/protected.json有186个当前保护hash。不是独自在仓库，不回退他人修改，不再委派。
- Luna仅拥有docs/LUNA.md及r5/luna证据；Terra冻结后独立CLI四组合尺寸/图源/视觉、桌面hover与手机tap抽查、目标CSS格式/diff与186保护及CSSfreeze。仅临时页面注入before样式测量然后移除，不改磁盘或产品。仅比较本次可能受影响的背景/层叠/几何，避免把scrollHeight与行高差当裁切；不新增镜像测试，不跑无关类型/全量测试/build/verify。
- 输入：r5/before单CSS、baseline.diff/status、protected.json，现有R4文案/R3放大拼字截图，4321 HTTP200。Sol审阅唯一CSS增量及桌面/手机截图，记录验收；本地可逆修改，无提交推送部署或真实CMS/数据库操作。

### R5验收结果

- 单CSS背景实现完成，Luna四组合PASS；标题/网格/157图相对before最大几何差0px，原图/字形/尺寸/文字保持，hover/Esc及手机tap关闭正常。186保护hash、CSSfreeze与目标格式/diff通过。
- Sol已亲看桌面/手机背景效果并审阅增量，最终验收。小字邻近背景像素只作局部参考，不作完整对比度合规结论；详见r5/luna/report.json与角色日志。无新仓库测试或无关全量检查，本地预览保持、未提交推送部署。

## R6 — 2026-10-14 雾面玻璃背景

- 用户明确要求当前区域背景改为模糊玻璃，右下角继续保留少许颜色；沿用Task05，LOW静态CSS，Terra → Luna → Sol。既有56XYY形状、放大尺寸、157原图与文案保持。
- Terra唯一源码所有权：src/styles/about-gallery.css；另可写docs/TERRA.md及r6/terra证据。只调整section背景及装饰伪元素，采用灰白半透明雾面玻璃、柔化的底层色光与极细颗粒，右下保留克制暖橙。玻璃层需有实际可见质感，不能仅给纯色背景加无视觉作用的blur；可使用静态backdrop-filter与合理回退，绝不对文字/照片/内容容器应用blur。装饰层pointer-events:none且低于内容，顶部保持明亮可读、顶底与原相邻浅色背景自然过渡。不增加卡片外框或改变区域形状，不增加动画、文件素材、依赖或外部请求。
- AC：中英1440×900与360×780四组合出现清晰但克制的雾面玻璃背景，右下仍能辨认淡暖色，照片和文字保持锐利。与r6/before在原样式位置临时替换比较，标题/网格/157照片相对section最大几何差≤0.5px；图源/顺序/alt/圆角/字体保持，157原图一屏可见，无新增重叠/横溢/内部滚动。桌面hover/Esc及手机tap原图开关正常；不支持backdrop-filter时仍有可读的灰白与暖色背景。
- 排除：所有布局/尺寸/间距/形状/字体/文字、responsive CSS、图源/排序、组件/脚本/仓库测试、其它页面与页脚、依赖/环境及任何外部写入。现有脏文件和并行修改保持，所有角色不得再委派；不提交、推送、部署或操作真实CMS/数据库。
- Luna仅拥有docs/LUNA.md及r6/luna证据；Terra冻结后独立CLI四组合视觉/几何/原图与样式对比，桌面hover/Esc及手机tap抽查，确认背景层不拦截交互且blur仅用于装饰层，模拟去除backdrop-filter时内容仍可读。目标CSS格式/diff、186保护hash及CSSfreeze必须通过；不新增镜像测试，不扩展无关类型/全站测试/build/verify。
- 输入：r6/before单CSS、baseline.diff/status与186项protected.json；HEAD00318b5，4321本地预览可用。Sol负责合同/DEV_STATE/SOL日志，审阅CSS增量及桌面/手机实际截图后验收；本轮完成前R5的PASS不能代替R6验证。

### R6验收结果

- 雾白玻璃、斜向透光、细颗粒及右下淡暖橙已完成，所有内容CSS保持。Luna四组合PASS，标题/网格/157图几何差0px，无内容模糊/溢出；hover/Esc与手机tap关闭正常。禁用backdrop-filter的桌面/手机回退可读、几何保持，186保护hash、CSSfreeze及目标格式/diff通过。
- Sol审阅增量并亲看桌面/手机截图后验收；证据r6/luna/report.json与r6/sol-audit.json。本地4321保持，限Chromium模拟视口及属性禁用回退，未提交、推送或部署；无新增仓库测试或无关全量检查。
