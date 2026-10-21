# XYY-20261021-03：真实手机正文图片缺失排查

- 用户反馈文章发布后真实手机仅显示封面，正文图片不显示，电脑和手机模拟正常；当前先做可证据化诊断，尚未授权生产修改。已通过异步问题请求具体文章 URL、手机/浏览器及网络差异。
- 风险 HIGH：涉及发布内容与图片访问边界，只读不降低实际影响。沿用用户最新“先不要推送”，不提交/推送/部署、不写 CMS/数据库、不变更权限、CSP 或生产配置。
- 基线 HEAD `984461e17dfcae7e7d1324a9fa530fb742133b2c`；当前后台分离、首页文案、百度验证与文档等脏文件全部保留。仅可新增本诊断证据和对应日志，不改业务源码。
- Sol 负责合同、授权、证据归纳；Terra 只读追踪正文图片和封面在源代码与实际公开页面中的区别，仅拥有 `output/mobile-news-images/xyy-20261021-03/terra/` 和自身相关日志；Luna 独立复现/核对，拥有相应 `luna/` 和自身日志；Nova 只读复核原因与结论，不扩成实现或授权。不得再委派或回退他人改动。
- 排查范围：正文 HTML 清洗、src/srcset、延迟加载、样式、CSP、同源图片代理白名单、匿名访问与手机浏览器/网络差异。公开网站 GET 仅限当前正式域名及经确认安全的图片地址，不连接远程服务器、真实管理 API 或既有数据库；发现退役域名/IP 只记录，禁止请求。
- AC：明确实际文章封面/正文图片 URL 与渲染路径；区分已复现事实、推断和真机未覆盖项；有失败 HTTP/CSP/格式/加载等具体证据才确定原因；无法复现时明确所缺样本，不以模拟设备 PASS 宣称真机无问题；给出限定修复范围或必要补充信息。
- 当前源代码观察：封面使用 `getDirectusAssetUrl` 输出 `/api/cms-assets/<uuid>`，正文由 sanitizer 保留原始 `img.src/srcset` 并加 lazy；同源代理现只按结构化封面/媒体字段列举文件，未检索文章正文引用。此为代码事实，尚非本次真机故障定论。
- 最终 DIAGNOSED：用户已给具体URL及iPhone Safari/Wi-Fi/4G同样的截图。Terra两种UA匿名6图HTTP403、封面JPEG成功；Luna匿名Chromium1440/390独立复现6/6正文403及0解码，封面200且1080×810正常；Sol首图HTTP及代码追踪一致。Nova APPROVED（diagnosis only），结论为正文绕过受控代理导致匿名交付403，不是移动视口独有。未验证真机Safari，不猜电脑登录/缓存原因。
- 当前仅诊断闭环，故障未修复。建议后续精确修复范围为清洗后本站Directus图片转受控代理，并仅为已公开/到时正文的严格UUID引用加入代理白名单；不改变匿名文件库权限、任意外链或query转发规则。本轮未改业务代码或外部系统，仅记录证据并通过文档diff检查。

## 用户授权后的本地修复

- 用户明确“ok，修复一下这个问题”，现进入本地修复，沿用本 ID，风险 HIGH，Terra → Luna → Nova → Sol。此前未推送要求保持，不提交/推送/部署，不改真实 CMS、权限、数据库、CSP 或生产配置。
- Terra 文件所有权：`src/lib/sanitize-core.mjs`（仅保持默认行为的可选图片转换 hook）、新增 `src/lib/news-rich-text.ts`（识别本站 Directus 图片、重写和严格引用提取）、`src/lib/directus-assets.ts`（仅已公开/到时正文引用合并）、`src/pages/news/[slug].astro` 与 `src/components/news/EnglishNewsArticle.astro` 的正文渲染调用；对应必要单测/独立 fixture E2E 和自身日志。超出这些源码先返回 Sol。共享修改基线为当前未提交版本，不能还原到 HEAD；副本与保护哈希在 `fix-baseline/`。
- Luna 独立验证并仅拥有测试/证据及自身日志；Nova Review 安全边界、差异/证据与回归；不得再委派或覆盖其他任务修改。既有首页标题、其他英文章业务和百度文件需保持保护哈希。
- AC：①该故障样式的本站 `/assets/<uuid>[.ext]?…` 正文引用输出同源受控代理，不向浏览器泄露 token，也不转发外链、任意 path/query；②已公开且到时的中文/英文正文合法 UUID 可由代理读取，草稿/未来/无效或伪造外域引用不能授权；③正文和 alt/外链保留，清洗安全策略、封面/既有缓存/中止与失败分类保持，srcset 不得绕回受限原地址；④本地匿名桌面1440/手机390的正文图片全部解码，直接资产访问拒绝但受控代理成功；⑤相关安全/单测、类型、Lint/格式、预算和构建检查通过，独立 Review APPROVED；真实 iPhone 与线上修复需发布后另行核验，不能提前宣称。
- 不引入依赖、全库匿名访问或任意外链代理；不重写原 CMS 内容。源 sanitizer 的默认输出需等值，避免影响迁移 CLI 与英文可见性判断。
- R1 实施冻结：使用真实 `sanitize-html` img 属性 hook 收集/改写，避免 alt 文本、注释或脚本内伪图片授权；5 个业务文件与相应单测/隔离 fixture/E2E完成。Sol 默认清洗与只观察 hook 对 307 样本/614 比较等值 PASS。Luna 新鲜完整 verify 在单测阶段 FAIL：765 类型文件 0 errors、151 单测文件/1075 项中 1 项失败，后续 build/E2E 未执行；保护25文件与任务源码/测试哈希保持。
- R2 最小返工：Luna 已确认 `PUBLIC_SITE_URL=loopback` 时正文保留的正式域名 URL 被遗漏拒绝。仅批准 `src/lib/news-rich-text.ts` 的精确 allowed bases 加入配置导出的 `DEFAULT_PUBLIC_SITE_ORIGIN`，以及 `tests/unit/news-rich-text.test.ts` 配置切换回归；不改其他4业务文件或弱化已有安全断言。返工后重新独立 verify/浏览器，仍不提交或推送。
- Luna R2 fresh verify exit 0（765 类型文件、151 单测文件/1076 项、构建通过），但新增异常内容 probe 确认渲染 helper 将非法对象正文静默转为空字符串，而旧 sanitizer 会抛错，故总体仍为 FAIL；未继续浏览器验收。R3 仅批准 `news-rich-text.ts` 对非字符串渲染输入显式 TypeError 和对应回归，正常字符串/空字符串不变，不改查询层或其他4业务源；正文采集 helper 对 unknown 不授权的行为保持。保护25文件与冻结11文件均无漂移，之后再次独立验证。
- Luna R3 PASS：fresh verify 151 文件/1080 单测、类型/Lint/构建通过；隔离浏览器2/2通过，1440/390各6张图解码。Nova R1 REJECTED：外链或缺失 src 搭配本站 srcset 时仍保留受限地址/query，且不进入白名单，违反 AC③；其他安全边界未发现新问题。
- R4 同 ID 最小返工：Terra 仅修改 core 的可选图片 hook、news-rich-text 及对应单测/图片 fixture，补齐真实 img 的 srcset。有效 src 识别为本站时维持现行为；否则从规范解析的 srcset 选择首个严格匹配本站资产作为有效图片，改为代理 src 并移除原 srcset。采集与渲染必须共用选择逻辑，只授权实际选中 UUID；纯外链响应式图片仍由原 sanitizer 处理。禁用 HTML 正则或简单逗号切分。
- 为此批准有限依赖范围例外：可在 package.json/package-lock.json 将已安装且 sanitizer 已依赖的 parse-srcset 1.0.2 声明为直接依赖，及新增最小类型声明；不得引入其他包/版本或变更既有依赖树。这取代本任务此前“不引入依赖”的这一精确限制。其余业务文件保持冻结。补充 foreign/missing src、query/data URL逗号、纯外链等回归后，经 Terra→Luna→Nova 再验收；默认 sanitizer 输出仍须等值。
- R4 Sol 追加契约修正：`isEnglishNewsRecord` 要求 id，而正文白名单查询显式 fields 未选择 id；全对象 mock 掩盖了真实投影。仅再解冻 `directus-assets.ts` 和其安全单测，将 id 明确加入新闻 fields，并按字段投影验证英文授权仍有效，不移除 id guard 或完整英文校验。此项闭合 AC②。
- R4 Sol 默认清洗等值 PASS（323样本/646比较）；Luna 定向6文件49测试通过，但 fresh verify 在维护预算失败：安全测试221行超过220行上限，尚未进入完整单测/构建或独立E2E。R5 仅批准该测试删除一行空行，保持所有非空代码/断言完全一致，不改预算；Terra 格式/预算检查后交 Luna 重新独立完整验证，再 Nova 复审。

## 最终本地验收

- LOCAL_READY：Luna R5 fresh verify exit0（766类型文件、151文件1082单测、930预算、构建），全量/目标格式、diff、图片fixture2/2通过；R4定向49项通过且R5仅空白变更，复用有效。两视口1440/390各6图含srcset-only/fallback均代理解码；draft/future404无上游。Sol323样本646清洗等值PASS，Nova R2 APPROVED（local candidate）。
- Sol核对14任务文件、25保护文件hash无漂移；HEAD保持984461e，schema gate保持pending_release_gate，既有并行改动保持。最终verify的中间Terminated行后同次调用完成1082/build并exit0，无重试；完整日志及观察说明保留。
- 本地修复授权已完成；未提交/推送/部署，未操作真实CMS/数据库/权限。正式文章仍为原版本，WebKit与真实iPhone Safari未测，发布后需真机复测。此次收尾只更新记录、检查diff与证据，不重复完整应用门禁。
