# DEV_STATE

更新时间：2026-10-09

## 协作记录约定

- 每完成一个开发任务、配置调整、验证、提交或部署动作，都要在本文件同步记录完成内容、验证结果、当前状态和剩余事项，保证项目负责人和开发者能够快速确认实际进度。
- 记录以任务结果为单位，不堆砌无助于判断状态的终端命令、重复讨论或临时尝试；失败方案仅在会影响后续决策时保留。
- 使用中性、任务导向的表述，只写需要完成的动作，不使用身份化角色称呼。
- 不记录密码、Token、API Key、私钥、Cookie、真实 `.env` 内容或其他敏感信息。

## 当前目标

- `XYY-20261009-01`：125 文件已提交为 `6f53695` 并普通推送至 GitHub `AIyj-cmd/XYY-WEB` main，远端 SHA 回读一致。本轮完整发布检查 R4 exit 0、Luna PASS、Nova APPROVED；本地状态和角色日志已归档。测试站 `wz.tomatopia.top` 尚未部署，前置条件仍受阻。
- 本轮起始 Git 基线为 `5f94e34`；应用归档提交为 `6f536950c6485b9ac89b1aafac87f3a354064e5f`，本节是推送后的状态补录。此前 main CI `37885398485` 本轮回读为 success；新提交 CI `37901004241` 已触发，记录时 in_progress，尚无远端通过结论。根开发依赖与 lock 有七项安装版本差异，本轮使用数据盘全新隔离安装，根依赖未修改。
- 测试站本轮最终只读复核仍为 `0ffe149` / `20261004T044635Z-0ffe149`，健康两依赖 ok；可用空间仅 `866316288` bytes，低于 2 GiB 底线。真实 CMS 候选门禁仍明确阻止 manifest；当前未部署。
- 具体剩余动作见 `docs/plans/xyy-20261009-01-deployment-prerequisites.md`；服务器旧版本删除、CMS/数据库备份恢复与契约维护、独立运行配置变更须按 AGENTS.md 单独明确授权，不由应用部署请求自动涵盖。正式站与 Oracle 不在本轮范围。

## 当前工作归档与测试站发布（2026-10-09）

- `XYY-20261009-01`，HIGH。125 文件范围包括当前中英文首页/页脚、服务动效及素材、联系页提纲、robots/llms、Lighthouse 工具和治理/状态记录；没有提交凭据、依赖、构建或 output 产物。页脚 CSS 原文拆分以通过行数预算；动效只补 pointer/compatibility mouse 的 focus 区分与清理，保持动画设计，移动导航测试改用真实 tap。
- 数据盘干净 npm ci 成功，CI 固定字体原生库大小/SHA 与加载验证通过；根开发依赖未修改。完整格式检查、候选 1445 份源码/配置/素材一致性和 production audit 0 通过；开发依赖审计另有 23 项，不混同生产审计结果。
- Luna R4 实际外层容量监测执行完整 `npm run verify:release`（含 verify），exit 0：647 类型文件、0 errors/0 warnings/4 hints；118 文件/757 单测、269 E2E/9 既有跳过、4 formal、最终 build 全部通过。实际容量峰值 552108032 bytes、3838 inodes。此前真实失败、旧测试进程产物失配与本机重启后缺失完成结果均保留，不计通过。
- 中英文 contact/about × 1440/390 八组页脚验证通过，链接、二维码开关、键盘可见焦点和无横溢保持；一组探针等待图片实际加载的时序修正仅在原 5 秒内等待后补测，应用无新增修改。新进程真实 tap、click、Enter 与 pointer 清理通过，Sol 审阅五张代表截图。
- 测试站部署仍受 `candidate_unverified`、约 826 MiB 可用空间及配套运行配置前置条件阻断，当前没有部署或执行 CMS/数据库/权限/删除操作。准确动作与保护范围见本任务部署前置清单；真实 CMS 和线上新版本验收待该条件满足。
- Luna PASS、Nova 最终内容及冻结身份 Review APPROVED。普通提交 `6f53695` 的 parent 为 `5f94e34`、tree 为 `7ea2d6e4ea49459d541bbf39404abbd48310e230`；125 路径/mode/blob、工作区和候选身份一致。首次 HTTPS 连接超时后普通重试成功，GitHub main 精确回读该 SHA，无强推/历史重写。
- 部署仍 BLOCKED；证据 `output/release/xyy-20261009-01/`、`output/playwright/xyy-20261009-01-touch/`。本次状态补录仅改文档，检查新增 diff/格式，复用同一业务树已完成的完整验证；不将正在运行的 GitHub CI 记为成功。

## 此前目标快照（以下提交状态以各任务记录日期为准）

- `XYY-20261008-12` 发布分支已通过 [PR #4](https://github.com/AIyj-cmd/XYY-WEB/pull/4) 合入 GitHub main，本地 main 同步为 `5f94e34`；包含原维护提交 `f04bd1e` 与四文件 CI/依赖修复 `6d0a781`。Luna PASS、Nova APPROVED、真实 PR CI 全通过；既有工作区改动保留。main 自动 CI 复跑已触发，记录时仍在运行；本任务未部署，真实 CMS 验证门禁保持。

- `XYY-20261008-10` 本地 `/llms.txt` 已同步英文品牌名、四项企业文化、服务/咨询说明与华南佛山范围，补英文行业动态、站点地图、爬虫规则及服务选择入口；原有 Claims 和动态案例/白皮书保持。22 项相关单测及发布/空案例两轮 HTTP 验证通过，Nova APPROVED；未提交、推送或部署。
- `XYY-20261008-07` Lighthouse 本地实现已验收：desktop/mobile 各 8 路由 × 3 次、逐指标 median、CI 配置接入并分设备归档；48 次采样完整、enforce 失败传播与 CrUX 本地契约通过，Nova APPROVED。当前默认 observe，未形成性能合并/部署阻断；正式 CrUX 数据为 unknown。未提交、推送或部署。
- `XYY-20261008-09` 本地 robots 已删除 GPTBot 专属全站禁止组，适用现有通用允许规则；通用与 OAI-SearchBot 的五项路径限制、Sitemap、响应头保持。本地 HTTP 200、相关单测 3/3、格式/Lint/diff 通过，Nova APPROVED；未提交、推送或部署。
- `XYY-20261008-06` 中英文首页站点设置已并入现有四项并行请求并传入 Layout；本地真实 SSR 请求时序、连续设置刷新、四组桌面/手机页面及 41 项相关单测通过，Nova APPROVED。新闻/文件引用全量读取按既定优先级保留；未提交、推送或部署。
- `XYY-20261008-05` 首页统计字段投影/发布状态缺口已本地修复并验收：查询显式请求 `status`，仅 `published` 解析，草稿/成功空结果不回退，缺失或非法状态明确失败；新增 fetch 字段投影契约测试。Luna 729 项单测通过、Nova APPROVED；未提交、推送或部署。
- `XYY-20261008-04` 通用页脚 Logo 下方简介已替换为企业文化四项（愿景、使命、价值观、服务理念），中英文同步；六个页面/视口组合及微信二维码开关抽查通过。4322 可预览，未提交、推送或部署。
- `XYY-20261008-03` R3 中英文通用/关于页脚已加入小红书、抖音、微信三个黑色图标；抖音打开用户短链接，微信点击显示原始公众号二维码。10 个页面/视口组合及 16 项可见键盘焦点检查通过；4322 可预览，未提交、推送或部署。未验证外站内容或真机扫码。
- `XYY-20261008-02` 本轮已启动本地 Astro 开发服务 `http://localhost:4322`（session `69114`），首页/联系页 HTTP 200，最新填写提纲脚本核对通过；使用本地静态回退内容，未连接真实询盘接收端。4321 已有服务保持。
- `XYY-20261008-01` 中英文联系页填写提纲已完成本地修改和独立验收：中文为“日均发货单量”“B2B还是B2C模式”，R2 英文同步为“Average daily shipments”“Business model (B2B or B2C)”。本地 4322 已提供最新代码；未提交、推送或部署，下方已有发布状态保持。
- 用户于 2026-10-04 授权实施全面技术债方案 `XYY-20261004-03`，按 A–H 独立批次推进本地候选与验收站准备。此前“仅稳定维护、不主动改进”的目标属于历史，现以本任务明确 Scope 为准。
- 技术债114文件提交 `f04bd1e` 已由 `XYY-20261008-12` 合入 GitHub main `5f94e34`；发布分支保留为 `6d0a781`。应用未因合并而部署，验收站最近已记录版本仍为 `0ffe149` / `20261004T044635Z-0ffe149`，本轮未重新查询线上版本。
- 正式站仅整理运维核对项；无正式站/Oracle 工作授权。真实 CMS、数据库、权限、外部写入和部署须分别满足准确授权及备份恢复条件。

## 发布分支合并（2026-10-09，已合并，未部署）

- `XYY-20261008-12`，HIGH。用户明确授权合并发布分支，并选择最小 CI 修复及五项依赖安全更新；按 Terra → Luna → Nova → Sol 完成。新增提交 `6d0a781021bd812832d57fd87c692badf2b2e1b9` 仅四文件：`.github/workflows/ci.yml`、`scripts/validate-ci-release-identity.mjs`、`tests/unit/ci-release-identity.test.ts`、`package-lock.json`。CI 只校验候选身份并报告 CMS 状态，部署 manifest 在 `candidate_unverified` 下仍明确失败且不产出文件。
- lock 仅更新 compression 1.8.2、proxy-addr 2.0.8、sharp 0.35.5、smol-toml 1.9.0、source-map-js 1.2.2 及 Sharp 必需平台子树/对应解析元数据；框架版本、package.json 与本地缓存依赖补丁保持。干净安装、fresh production audit 0、59 定向测试、压缩中止流清理及 Sharp 原生图片处理通过。
- Luna 数据盘隔离候选完整 `npm run verify:release`（含 verify）exit 0：727 单测、269 E2E 通过 / 9 既有跳过、4 formal 与最终 build。根分区容量阻断、深 TMPDIR socket 超长、四 worker 超时及一次动画事件未观察的初轮失败保留；最终采用既有 CI 单 worker 和短 TMPDIR，未调整实现、断言或超时。Nova 最终 APPROVED。
- 真实 [PR CI 37884447146](https://github.com/AIyj-cmd/XYY-WEB/actions/runs/37884447146) completed/success：格式、候选身份、audit 0、727 单测、269 E2E / 9 跳过、4 formal、构建及容量门禁全部通过。run 绑定 head `6d0a781`，实际测试 PR 模拟合并 `4616211`；其 tree 与最终合并 tree 均为 `1a8d64afa7d70ce3476d1d42591359666a92f304`。
- Git HTTPS 连接超时后，以 Git Data API 创建逐 SHA 核对的同一 blob/tree/commit，并用 `force:false` 更新原发布分支；随后创建 [PR #4](https://github.com/AIyj-cmd/XYY-WEB/pull/4)，全部检查成功后用匹配精确 head 的 merge 操作合并。最终 main `5f94e34caf91775051559c50ea5b79fc98443fd8` 的 parents 为原 main `0ffe149` 与 `6d0a781`，保留 `f04bd1e` 祖先；发布分支保留，未强推/变基/删除。
- 本地 main/origin main 与 GitHub 一致，暂存区为空。1514 个范围外保护文件 hash 保持；CI 原 timeout/Lighthouse 增量完整保留，lock/新 CLI/新测试与合并提交一致。其他首页、页脚、robots、llms、治理/日志及素材仍是原工作区修改，未混入本次提交。根 node_modules 与既有开发进程未动；干净安装和完整测试来自隔离候选。
- [main CI 37885398485](https://github.com/AIyj-cmd/XYY-WEB/actions/runs/37885398485) 因合并自动触发，记录时仍 in_progress；不把它记为已通过。没有部署、真实 CMS/数据库/权限或运行配置操作；真实 CMS 备份/恢复/结构验证与旧部署前置条件仍未完成，不因源码 CI 通过而解除。
- 合同 `docs/plans/xyy-20261008-12-branch-merge.md`；本轮完整证据 `output/merge/xyy-20261008-12/`。状态及角色日志仅作本地工作记录，未扩大四文件提交范围；下方旧 Git/部署记录是各自日期历史。

## Lighthouse CI 与真实体验观察（2026-10-08，本地验收完成，正式数据待条件）

- `XYY-20261008-07`，MEDIUM，Terra → Luna → Terra R2 → Luna → Nova → Sol。统一两设备八条路由（首页、产品、关于、鞋服云仓、B2B 门店仓配、后整修复、中英文联系），每条三次，native assertions 与 summary 均为逐指标 median；运行时/HTTP/精确路由/样本错误明确失败。CI 在既有 production build 后顺序运行，分别保存 desktop/mobile artifact，权限不变。未改应用页面、CMS/Claims 或依赖。
- 离线 build exit 0；`npm run test:lhci:all` 顺序完成 48 次采集，exit 0、15:16.87。两端各 24 JSON/HTML 当前报告、每路三样本，runtime/HTTP 错误为 0；Sol/Nova 从 raw 重算 112 个中位数均零差异。性能分中位数范围 desktop 88–100、mobile 53–93；mobile 保留 13 项 warn（SEO、首页/关于性能、产品/关于 LCP、关于 TBT），desktop 日志另八页 SEO 告警。pipeline PASS 不表示指标全通过，也不是线上性能结论。
- 同一批新 mobile LHR 的 observe exit 0、合法 `performance=1` 的 enforce 故障验证 exit 1 / 八项 error，未重采样。默认仍 observe；同候选同 CI 环境至少五轮及具体波动/阈值校准条件见 `docs/PERFORMANCE_BASELINE.md`。未改 required status checks，发布脚本不运行 LHCI，当前不能宣称阻断合并或部署。
- CrUX 只读 CLI 分 PHONE/DESKTOP、origin/URL、有效采集窗口与 LCP/INP/CLS p75；保留 CLS 比例、拒绝非法数据、完整响应有超时。R1 数据缺陷已修复，Luna 最终 14 项测试、此前冻结的 Lighthouse config/runner 九项通过；目标格式/Lint/diff、typecheck 645 files / 0 errors / 0 warnings / 4 hints 通过。Nova APPROVED。缺真实 key，公开 PageSpeed 两次连接超时，正式 p75 unknown，不能推断样本不足或达标。
- 容量曾阻止 build；经精确工具批准清理两份历史 node_modules 与四份历史可重建 dist 后恢复，路径/结果详合同。全量维护性检查仍被既有 `FooterSocialLinks.astro` 246/180 行阻断，未扩大修复；未运行完整 verify/verify:release，没有 GitHub 实际运行或提交/推送/部署。
- 合同 `docs/plans/xyy-20261008-07-lighthouse-ci.md`；证据 `output/lhci/xyy-20261008-07/`。HEAD 保持 `f04bd1e`，14 份既有范围外 tracked diff 复核未变；后续并行任务 09 的 robots/状态/日志改动保留，不归入本任务。4400/4401 已无监听。剩余条件为 CI 同环境校准、既有发布前门禁处理及可用 CrUX 访问条件或 Search Console 导出。

## 首页并行取数（2026-10-08，本地验收完成）

- `XYY-20261008-06`，MEDIUM，Terra → Luna → Nova → Sol。仅修改中英文两个首页：中文 `getSiteSettings(DEFAULT_SITE_SETTINGS)`、英文既有 `getEnglishSiteSettings()` 各作为原 Promise.all 第五项，向对应 Layout 传入 siteSettings。没有新缓存、布局/文案/样式、共享查询层或新闻/文件引用逻辑变更，05 草稿过滤修复保留。
- 独立本地 Astro SSR / loopback CMS 对照中，每个页面请求仍为 5 个 CMS 请求、settings 恰好 1 次；修改后五请求同时段启动，连续请求电话/备案值更新。固定每次 CMS 200ms 延迟、每语言预热后 3 样本：中文响应中位数 439.11 → 251.23ms，英文 454.51 → 252.04ms；这是本地受控测试，不是线上收益。
- Luna 中英文 1440×900 / 390×844 四组浏览器内容、设置、关键链接和无横溢通过；8 文件 / 41 项定向单测及目标格式/Lint/diff exit 0。Sol 最终 typecheck exit 0，639 files、0 errors、0 warnings、4 既有 hints，亲看四张最终截图。Nova APPROVED、0 findings，AC 全部通过。
- 合同 `docs/plans/xyy-20261008-06-homepage-parallel.md`；证据 `output/homepage-parallel/xyy-20261008-06/`、`output/playwright/xyy-20261008-06/`。本轮测试端口已关闭；Luna 复核时既有 4321 仍监听，4322 未监听，未执行停止既有服务。范围外基线和日志旧内容保持；未访问真实 CMS/数据库，未提交/推送/部署，未运行完整 verify/verify:release。

## 首页统计发布状态（2026-10-08，本地验收完成）

- `XYY-20261008-05`，MEDIUM，Terra → Luna → Nova → Sol。用户明确授权最小本地修复；`getHomepageStats()` 请求 `id/status/stats`，仅 `published` 进入 Claims 解析；`draft`、成功空 singleton、已发布空统计返回 `[]`。首页实际 CMS 状态选择仅 published/draft，缺失、null、archived 或未知状态按 `invalid_data` 失败，不使用 fallback。
- 三份既有测试共七个首页记录样例补充 published；新增 `tests/unit/homepage-cms-contract.test.ts` 在 fetch 边界解析实际 URL fields 并动态投影完整记录，沿现有 Vitest glob / npm test 纳入 CI 测试路径。未修改 CI 离线回退配置、共享请求层、Claims 数字或页面模板。
- 新契约测试在修复前 6 项失败；修复后 Luna 定向 7 文件 / 47 项与全量 114 文件 / 729 项单测均 exit 0，格式/Lint/diff 通过。Sol 最终 `npm run typecheck` exit 0，639 files、0 errors、0 warnings、4 既有 hints。全量单测日志的 Terminated 已定位为容量测试预期 SIGTERM 子进程。Nova APPROVED，0 findings。
- 合同 `docs/plans/xyy-20261008-05-homepage-stats.md`；证据 `output/homepage-stats/xyy-20261008-05/`。范围外基线及角色日志旧内容保持；仅本地 mock 验证，未连接真实 CMS/数据库或线上验证，无提交/推送/部署。未运行完整 verify/verify:release；本轮不涉及提交、部署或页面结构变化。

## 页脚企业文化（2026-10-08，本地验收完成）

- `XYY-20261008-04`，LOW，Terra → Luna → Sol。仅修改 `src/components/Footer.astro` 和 `src/i18n/shell.ts`：使用用户图片中的四项企业文化及对应英文替换原公司成立年份/规模简介，语义化 dl/dt/dd 展示，标签加粗；Logo、电话、导航、地址、社交入口及版权保留。未修改 CMS 字段、读取/回退或关于页独立页脚。
- 目标 Prettier/diff、四个本地中英文路由 HTTP 编译通过。Luna `/contact`、`/en/contact` ×1440/390/768 共六组合文本/布局/原有内容保留通过，微信二维码开关抽查通过；社交组件、关于页脚、二维码及联系提纲保持原值。Sol 已核对最小 diff、基线 hash、中文/英文桌面和真实手机 viewport 截图。
- 移动超长 element screenshot 中固定导航遮挡属于截取位置伪影，已改用正常滚动后的当前 viewport 补证，四项和电话清晰可见；未为此修改导航。证据 `output/footer-culture/xyy-20261008-04/`、`output/playwright/xyy-20261008-04/`。
- 本地 Chromium 模拟视口，未验证真机或线上；没有真实 CMS/数据库/询盘写入、提交、推送或部署。纯文案/模板未重跑全量 typecheck/verify/verify:release，4322 服务保留。

## 页脚社交账号入口（2026-10-08，本地验收完成）

- R3：共享组件更名为 `FooterSocialLinks.astro`，小红书/抖音/微信按黑色图标横排；两个页脚仅更新共享组件引用，现有关于页 CSS 保持。两个外链为用户给定地址、安全新窗口；微信使用原生 HTML popover，支持关闭按钮、Esc、外部点击关闭和再次打开，无自定义脚本。中英文标题、说明、alt、aria 同步；二维码 `public/images/social/wechat-official-account.jpg` 与用户原图及 HTTP 响应逐字节一致。
- R3 验证：目标格式/diff、本地页面 HTTP 编译、Luna 10 个页面/视口组合及真实中英文提纲回归通过；三平台控件和关闭按钮在四组合共 16 项真实 Tab 焦点检查通过（48px、2px 可见轮廓）。Sol 已审默认态、二维码和焦点截图；微信 SVG 首次复制偏差已修正并复测逐字一致，测试脚本初期错误保留并与最终通过结果区分。证据 `output/footer-social/xyy-20261008-03/r3/`、`output/playwright/xyy-20261008-03-r3/`。
- R3 限制：本地 headless Chromium 模拟视口，未测试真机、Safari/微信浏览器或扫码，未访问外站；外部点击关闭后焦点随点击位置移动，不强制返回触发按钮，关闭按钮/Esc 会返回。4322 保持运行，无提交/推送/部署；未重复全量 typecheck/verify/verify:release。以下为此前轮次历史结果。

- R2：用户补充参考图后，仅修改共享 `XiaohongshuLink.astro` 为上方小标题、下方内联黑色 Simple Icons 标识，取消可见文字胶囊/粉色/边框/外链箭头。48px 图标盒、本地化 title/aria、原 href/target/rel/焦点保持；两种页脚自动同步。目标格式/diff 检查和 Luna 中英文 1440/390 八组合、关于页 768 两组合 PASS；Sol 已审默认态截图。证据 `output/footer-social/xyy-20261008-03/r2/`、`output/playwright/xyy-20261008-03-r2/`。本轮未重访外站或重跑全量类型/verify；以下为初轮入口实现与外站观察。
- `XYY-20261008-03`，LOW。新增共享 `XiaohongshuLink.astro`，通用页脚联系栏地址下方和关于页独立页脚联系区各加入一个入口；中文“小红书”、英文“Xiaohongshu”，完整用户链接、新标签、安全 rel、本地化可访问名称、44px 触控与可见键盘焦点。
- Terra 目标格式/diff 检查通过；本次 typecheck 638 files、0 errors/0 warnings/4 既有 hints。Luna 中英文两类页脚 1440/390 八组合及关于页 768 两组合通过：目标一致、无溢出/重叠、键盘可用，既有电话/地址/版权和中英文提纲保持。Sol 已审四张截图和断言。
- 实际点击打开新标签并指向给定账号，小红书随后返回 `website-login/error`、IP 风险代码 300012；本地链接行为通过，不能声称外站账号内容访问成功。无登录、关注或真实写入；无外部平台嵌入资源。
- 证据 `output/footer-social/xyy-20261008-03/`、`output/playwright/xyy-20261008-03/`。4322 服务保留；没有提交/部署，未跑完整 verify/verify:release。

## 中文联系页填写提纲（2026-10-08，本地验收完成）

- R2：用户追加英文同步要求后，仅替换英文第四/第五项为 `Average daily shipments:` 和 `Business model (B2B or B2C):`。Terra 格式检查与 Luna 英文 1440×900/390×844、真实换行已有括号字段保留及去重、中文回归均通过；Sol 审阅两张截图和断言。证据 `output/contact-outline/xyy-20261008-01/r2/`、`output/playwright/xyy-20261008-01-r2/`；4322 开发服务保留运行。以下为初轮中文修改事实。
- `XYY-20261008-01`，LOW。`src/scripts/contact-enquiry.ts` 仅替换中文提纲两项 title/line；英文和插入逻辑保持。
- Terra 目标 Prettier 与 diff 检查通过；Luna 本次本地 Chromium 1440×900、390×844 验证五项顺序、已有真实换行文本保留、重复点击不重复、英文基线及无水平溢出通过，Sol 已审截图和断言。
- 证据：`output/contact-outline/xyy-20261008-01/` 与 `output/playwright/xyy-20261008-01/`。最终检查本地 4598 端口已关闭；未实际终止其他进程。没有真实表单提交、CMS/数据库写入或外部发布；本次无提交/部署，未运行全量 verify/verify:release。

## 技术债提交与发布同步（2026-10-07，提交/发布分支已同步；部署受阻）

- `XYY-20261007-01`，HIGH。已获用户Git提交、GitHub同步和验收站应用发布授权。精确114文件（51新增/63修改）普通提交`f04bd1e`，唯一parent为`0ffe149`；Nova提交前后独立身份/Scope Review通过。原有动效、素材、治理配置及角色日志未混入提交；1383个其他文件与四角色日志旧前缀核对保持。
- 本地HEAD/main及`origin/release/xyy-20261007-01`为`f04bd1e`；`origin/main`及GitHub main为`0ffe149`，本地main领先origin/main一提交，upstream仍是origin/main。普通非强制push exit0，GitHub API回读精确发布分支SHA。该分支没有触发CI，实际runs为0，不能声称CI通过；未创建PR或推main。
- 本轮隔离候选`verify:release` R3 exit0，包含`npm run verify`：634类型文件0错误/0警告/4提示、113测试文件722单测、269 E2E通过/9既有跳过、4 formal和最终build通过。完整开发依赖干净安装R1/R2分别超时130/124；R3使用独立复制的既有依赖，不能称干净开发安装成功。Luna核对114源码SHA/类型/Git mode全部通过，测试端口已释放。
- 独立生产依赖干净`npm ci --omit=dev`及缓存实际消费者验证均exit0。生产`npm audit`因官方advisory端点ETIMEDOUT而exit1，无漏洞结论；本地file补丁的完整性/解析/行为证据另列。完整R3峰值1,091,219,456bytes/7769inodes，生产安装峰值186,146,816bytes/13502inodes，不以旧峰值或旧audit替代。
- 部署未执行：`candidate_unverified`明确阻止release manifest生成；真实CMS成对备份、加密异机副本、隔离恢复与E/G结构验证尚未完成；验收服务器本轮只读free为1,062,006,784bytes，低于2GiB；可信代理/回环监听尚未配套。已准备精确保留5版、删除候选20版的预览，未删除版本、修改运行配置或操作数据库/CMS。Git连接两次超时后一次普通push成功，失败证据保留。
- 推送后公共`/version`和`/healthz`均200：线上仍`0ffe149`、旧CMS版本`2026-08-cms-hardening`，两依赖ok。部署前置清单`docs/plans/xyy-20261007-01-deployment-prerequisites.md`已写明准确目标/动作/停止条件；应用发布授权不代替其中数据库/CMS等独立动作授权。真机、真实询盘、批量接口真实启用和原稿可读性限制沿原计划保留。
- 合同`docs/plans/xyy-20261007-01-release.md`；本轮证据`output/release/xyy-20261007-01/`。本地状态与角色日志已同步，作为工作区记录保留，没有扩大114文件提交范围。下方原任务验证及旧阻塞均为对应日期的历史事实，当前Git/发布状态以本节为准。

## 技术债当前索引（XYY-20261004-03，本地修复已验收；外部验收待完成）

合同：`docs/plans/xyy-20261004-03-maintenance.md`。113个审核候选文件已合入主工作区，另修正1个实际失败的缓存测试，共114个实现/配置/内容/测试文件；清单为`output/maintenance/xyy-20261004-03/final-local-manifest.json`。原113文件补丁和源码回退包冻结保留，新增测试以独立补丁交付。主工作区原有动效、素材和历史记录保留；114文件已由`XYY-20261007-01`提交并推送独立发布分支，尚未部署。

| 批次/问题 | 当前状态 | 证据及完成条件 |
| --- | --- | --- |
| A 基线/历史口径 | 已完成 | 合入时79个原脏路径保持、HEAD/index不变；组合118项与Luna冻结一致，新增1测试单独验收。原74个非日志路径、4角色日志旧前缀及505媒体hash保持 |
| B 磁盘/inode、媒体清单、release保留 | 本地已修复；远端容量受阻 | Luna41项/fakeSSH及Nova R2 APPROVED；同设备归并、空间/inode门禁、受监控基线、默认清理预览及current/previous/pinned保护完成。历史产物完整核验归档，data仅存档；远端约984MiB仍低于2GiB，不执行删除或部署 |
| C 代理限流身份/缓存补丁 | 本地已修复；真实代理/撤销证据待验 | 实际Express→Astro→contact链路、伪造头、可信链/IPv6、第6次限流及重定向经Luna/Nova通过。默认不信任转发头，内部上下文共享身份；补丁完整性/实际依赖解析/行为与audit分别验证。历史Token撤销无证据，线上配置和入口隔离未改变 |
| D 服务配置/CSS转发 | 本地已修复并完成组合验收 | 9slug统一来源，service seed hash保持，85条FAQ除E移除page_key外等价，CSS顺序等价。原有动效组合下18目标×4宽度×2动效模式共144组有效PASS，键盘/链接/中英/减少动效及8代表截图通过；Nova D APPROVED。浏览器矩阵为离线dev，不能替代真机或真实CMS |
| E legacy/FAQ契约 | 本地已修复；真实CMS迁移受阻 | 缺失legacy不重建、存在继续验证；faq_page必填非空RESTRICT，page_key可空只读，孤儿manual_mapping_required。Luna/Nova通过；版本仍candidate_unverified，真实结构/恢复证明前阻止生成可部署manifest，未修改真实CMS |
| F 业务来源/白皮书235项 | 部分恢复已验收；明确保留可读性限制 | 235条冻结原记录/PDFhash/定位均可追溯：44条部分正文恢复、190条原稿观察、1条明确字符缺口。Luna原稿复核8项问题经R3全部修正，45个crop核验；Nova APPROVED_WITH_LIMITATION。第3–5期保留partial提示，不称全文恢复或235项全部解决 |
| G 英文新闻/批量接口 | 本地能力已完成；真实启用受阻 | 英文5字段默认draft、幂等迁移、3凭据独立、writer精确create权限及异常后精确slug/ID回收经隔离验证/Nova通过。Directus纯create可能204无ID，不能满足现有返回契约；未扩大权限、未配置真实凭据或启用写入 |
| H 综合/发布闭环 | 本地验收完成；外部验收受阻 | 候选R4 verify:release exit0：722单测、269 E2E通过/9显式跳过、4 formal和build。合入后main verify R2 exit0：637类型文件0错误/0警告/4提示、722单测、lint/维护/assets/补丁/build通过。Luna/Nova D/H通过；备份恢复、真机、真实询盘回执未完成 |
| 历史 F1/F2/F3 安全修复及缓存漏洞代码 | 已关闭（已发布） | `XYY-20261003-04`发布/CI证据见下节；本地file补丁不受公告扫描覆盖的限制保留 |
| 历史 CI字体、咨询转化/英文页脚发布 | 已关闭（发布结果覆盖旧阻塞） | 对应最新发布记录；早期失败与阻塞仅为当时状态 |
| 公共入口条件请求200/未观察304 | 明确保留的现状 | 公共/应用直连匹配ETag与Last-Modified均200且同hash；不改合法200，不冒称304。证据`remote-resource-readonly.json` |

本轮证据主目录：`output/maintenance/xyy-20261004-03/`。主工作区R1曾因缓存测试使用调用前100ms预算而721/722失败；现仅固定Date并精确断言零TTL、finally恢复，真实消费者正TTL1000ms反例必失败，Luna/Nova独立通过。原R1失败保留；原113冻结包不因这个测试补丁重写。

同一组合production build的3页面×3次Lighthouse原始报告完整，性能中位数为首页80、产品81、后整服务90；SEO均69，唯一计分失败为本地响应的`X-Robots-Tag: noindex, nofollow`，不外推线上SEO或性能提升。原构建缺baseline失败仅存Sol工具观察记录，原raw日志曾被复用；后续build及LH原始证据保留。已有dist重建测得720896bytes/12inodes，不冒充完整峰值；R4完整工作负载测得755077120bytes/6848inodes。

本轮`npm audit --omit=dev`exit0、零已知告警；本地file补丁的完整性/解析/行为另有证据。干净生产安装两轮因下载TLS证书错误失败，未关闭校验。候选及主工作区验证均使用已有依赖，不能声称干净安装成功或具备发布条件。验收站最近只读记录为0ffe149、旧CMS版本；实际备份/异机加密/恢复、真实CMS与权限、真实收单和真机验收条件详见外部清单。

最终Nova主工作区集成Review为APPROVED；Sol本地验收记录：`output/maintenance/xyy-20261004-03/sol-final-acceptance.json`。计划整体仍有上述外部验收和原稿可读性限制。

## 安全修复发布与同步（2026-10-04，已完成）

- `XYY-20261003-04`，HIGH，Sol 验收 CLOSED。27 个安全修复/缓存补丁文件已提交 `0ffe149df13148d6280b5230979eb0a3d0ea26cb`，发布至用户明确授权的验收站 `https://wz.tomatopia.top`，release `20261004T044635Z-0ffe149`。正式主站、真实 CMS/数据库/询盘写入及 DNS/TLS/Nginx 配置未操作。
- Luna 独立验证、Nova 发布前后 APPROVED。本次 R3 完整 `verify:release` exit 0：102 文件 673 单测、269 E2E 通过/9 既有跳过、4 formal 及最终构建通过。服务器干净生产安装、audit 零告警、真实 current 的 vendor 4.2.0-xyy.1/精确 hash/解析和实际 Astro 合成正反例通过；file 本地包仍不受公告扫描覆盖，安全依据包含源码 Review 与行为证据。
- 普通非强制 push exit 0，GitHub `AIyj-cmd/XYY-WEB main` 为同一提交；CI `37179272846` 已 `completed/success`，实际同样通过 673 单测、269 E2E/9 跳过、4 formal、最终 build 和生产依赖 audit。已审本地同步脚本 exit 0，主工作区 HEAD/main/origin/main 同步至 `0ffe149`；27 发布文件及索引清洁，原有无关脏文件保留。
- 线上只读 R2 为 `PASS_WITH_LIMITATION`：版本、health 两依赖、中英文 6 页面、内部 HTML 404、正常资源与 Range 206、CSP 和有效 nosniff 通过。公共端点重复 nosniff 为应用与边缘冗余，按标准仍有效；条件 GET 返回同 ETag/同字节的 200，**线上 304 未观察到**。新旧条件转发策略未变，Nova 认定未证实本次安全回归；合成 304 透传证据与线上覆盖范围分开，未修改业务或代理来消除测试告警。原 QA R1 FAIL 保留。
- 发布 R1 浏览器资源/崩溃失败与 R2 根分区 ENOSPC 均保留；R2 日志截断且 child exit 未记录，不冒称通过。隔离候选已原样迁移至数据分区并保留 `/tmp` 原路径链接，R2 全部 5981 产物 560958562 bytes 持久归档且独立 hash 校验。只清理已归档的重复副本及本任务三轮安装临时依赖，服务器可用空间恢复约 986 MiB；25 releases 含全部 24 旧版、previous、CMS 进程与环境 hash 均保持。
- 1416 范围外文件、152 旧证据及四角色日志前缀保持。合同 `docs/plans/xyy-20261003-04-security-release.md`；证据 `output/release/xyy-20261003-04/resume-20261004/`，最终记录 `sol-final-acceptance.json`。无剩余提交/部署/同步阻塞；真机、正式生产和真实接收未测。下方为各任务当时的历史状态，当前发布结果以本节为准。

## 缓存依赖漏洞补丁（2026-10-04，本地代码通过，发布验证受阻）

- `XYY-20261004-01`，HIGH；用户授权修复前次生产依赖审计阻塞。Terra 实施、Luna R2 本地行为 PASS、Nova 代码 APPROVED，Sol 接受本地代码结果；整体状态为发布验证 BLOCKED，不标记全部 AC 完成。HEAD 仍为 `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`，未提交、推送、部署或操作真实 CMS/数据库/询盘。
- npm 官方元数据核对最新 `http-cache-semantics` 仍为 4.2.0，GHSA-ch52-4w7c-c8xp 无已发布修复版。新增保留上游来源、tarball/integrity 和 BSD 许可证的 `4.2.0-xyy.1` 本地补丁，通过根 file 依赖和 override 让 Astro 实际加载；没有降级 Astro 或放宽 audit 门禁。改动 11 个配置、依赖源码和测试文件，既有两轮安全修复完整保留。
- 修复受限缓存的 max-stale、TTL、SWR、SIE 和错误重新验证回退，保留合法 public/immutable、授权缓存许可、私有缓存及 304。Luna R1 发现 Vary 首尾空格及私有缓存边界遗漏，同 ID 最小返工后 R2 的 shared/private exact、padded、list 通配均拒绝 stale 且 TTL 为 0；旧 4.2.0 对照、序列化和实际 Astro 图片消费者正反例有独立证据。
- 本次最终 `npm run verify` exit 0：102 个测试文件共 673 项通过，类型检查、lint、维护/资源检查及生产构建通过；Nova 无代码整改项。11 个候选哈希、1432 个范围外文件、77 份旧证据、四角色旧日志前缀及 HEAD/索引核对保持。此前日志插入位置错误已恢复精确旧前缀，原失败记录保留。
- **真实阻塞**：两次已批准联网 `npm audit --omit=dev` 均超时；独立 curl 对官方审计端点的空查询收到过期证书，尚不能确定来自官方服务还是中间网络。干净生产 `npm ci` 离线缺缓存，联网出现超时、重置及证书错误，未获得成功安装结果；已精确停止本轮失败安装进程并保留原始日志，不关闭 TLS 验证。现有安装上的 verify 不能替代干净安装，不能声称 audit 为零告警。
- file 本地依赖不受 npm 公告扫描覆盖，安全结论依赖源码审阅和行为测试；官方发布修复后需复核并替换本地补丁。网络恢复后仍须完成可信生产安装、有效生产 audit，并在最终发布候选执行 verify:release。`XYY-20261003-04` 的准确部署目标和发布范围仍待用户确认；下方历史依赖告警与零告警记录均为当时结果。
- 合同 `docs/plans/xyy-20261004-01-cache-dependency-fix.md`；证据 `output/security/xyy-20261004-01/`，Nova 结论 `nova/review.json`，最终状态 `sol/final-status.json`。

## 三项已复现安全问题修复（2026-10-03，本地完成）

- `XYY-20261003-03`，HIGH，本地验收 CLOSED；用户确认仅修 F1/F2/F3，Terra 实施、Luna 独立测试 PASS、Nova APPROVED、Sol 验收。修改 8 个实现/测试文件，保留既有安全加固；未提交、推送、部署或操作真实 CMS/数据库/询盘。
- F1 新闻接口改为逐块累计原始字节，超过 1 MiB 立即停止读取并返回 413，保留鉴权、JSON 和错误契约。F2 两份内部 HTML 原样移至 `output/internal-reviews/XYY-20261003-03/`，新增 public HTML/HTM 递归构建门禁，运行在字体准备前。F3 资源代理传递客户端 AbortSignal，保留第三个 fetch 注入参数与共享引用查询独立性。
- 本次 `npm run verify` exit 0：590 类型文件零错误/警告、99 测试文件共 629 项通过，lint/维护/assets/build 均通过。真实 HTTP 发送 1,250,000 字节且不 EOF 时 7–8 ms 返回 413；两份文档 URL 均 404，归档哈希匹配且新构建无副本；6 秒慢上游在客户端取消后 7 ms 关闭未完成响应，读取中取消及共享查询等待时仅取消一方的对照通过。时间只代表本次本地观测。
- headed Chromium 的 PNG/SVG、HTML/SVG 脚本阳性与代理阻断、Range/304、真实 8 页 PDF 查看及响应哈希通过。早期完整性检查和测试工具失败原样保留，最终 verify 后未改业务；8 个候选哈希、1426 个保护文件、4 份旧日志前缀、116 份旧任务证据及 HEAD/索引保持。临时 4610/4611/4612 已停，原 4321/4524 保留。
- 仅验证本地合成上游、有限并发和 Linux Chromium；生产入口、真实 CMS/接收服务、持续压力、多实例与 Safari/微信真机未测。代理信任条件风险和依赖告警按用户选择未处理，线上状态未由本任务改变。合同 `docs/plans/xyy-20261003-03-confirmed-security-fixes.md`；证据 `output/security/xyy-20261003-03/`。下方“未修复”记录为此前诊断阶段的历史状态。

## 安全问题逐项复现（2026-10-03，已完成）

- 用户要求先证实上一轮发现，沿用 `XYY-20261003-02`，HIGH 诊断；Luna 完成复现、Nova 增量 APPROVED、Sol 验收。只新增本地复现证据和记录，未修业务、依赖或生产环境。
- 新离线构建后的真实 HTTP 确认 F1：有效 Token、无 Content-Length，发送 1,250,000 字节并暂停 1200 ms 不提前拒绝，上传结束后才返回 413；无 Token、声明超限及咨询提前拒绝对照正常。F2 两份 HTML 返回 200，响应/public/dist 三重 hash 一致且不存在路径 404。F3 最终补测客户端断开后上游仍处理 5036 ms，直接连接 mock 的取消对照约 1 秒即关闭未完成响应。
- R1 只在直连条件复现：轮换 IP 头不触发第 6 次限制，经本地模拟代理重写头后第 6 次恢复 429；不能断定线上可绕过。缓存库五组对照成立，但实际 Astro 图片构建消费者带 Cookie 的 TTL 为 0 且未返回 Cookie，网站入口仍未复现。
- 首轮 F3 观测不足及中间补测原始记录保留；仅定向补测 F3，未冒称 F1/R1/F2 重跑，也未重复历史 620 项单测。1430 保护文件和旧记录保持，4590–4592 已停、原 4321/4524 保留。复现报告 `output/security/xyy-20261003-02/reproduction/report.md`；生产拓扑、真实 CMS/接收服务和并发耗尽未测，问题均未修复。

## 本地全面安全审计（2026-10-03，已完成）

- `XYY-20261003-02`，HIGH，诊断范围验收 CLOSED；Luna 独立测试完成、Nova APPROVED。只报告问题，没有业务修复、依赖升级、提交、推送、部署或真实 CMS/数据库/询盘操作；HEAD 仍为 `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`，审计对象包含当前未提交修改。
- 已复现 1 项中危、2 项低危：有效发布 Token 调用方可让新闻接口完整缓冲超过 1 MiB 的请求后才返回 413；两份内部审阅 HTML 被复制到本地公开构建；客户端断开后资源代理仍等待慢上游约 5 秒。另有环境相关的中危代理头限流风险，仓库 Nginx 会重写该头，线上入口隔离未确认；未将这些结果称为线上利用或 DoS。
- 本次生产依赖 audit 为 3 个 high 包记录、1 条根因公告；完整 audit 为 44 个包记录、22 条去重公告。生产 `http-cache-semantics` 库级合成复现成立，但当前网站请求链路可达性未证明。下方历史任务的零告警为当时结果，最新依赖状态以本节为准；本轮未修复这些告警。
- 本次 `npm run verify` exit 0：586 类型文件零诊断、96 文件 620 单测及 lint/维护/assets/build 通过。最终 R5 HTTP 15 项、双语双宽度 8 组 mock 提交、HTML/SVG 正反对照、新闻注入、PNG/PDF 及静态资料验证完成。早期测试工具和启动记录缺口保留，已通过新进程窗口补证；定向测试不重复累计。
- 1430 保护文件、HEAD/空索引和旧角色日志前缀保持；4540–4547 自建服务已停，原 4321/4524 监听保留。报告 `output/security/xyy-20261003-02/report.md`，最终证据 `sol/final-acceptance.json`；只代表本地有限审计完成，真实代理/CMS/接收服务、Safari/微信真机、多实例和压力条件未测。

## 本地开发服务启动（2026-10-03）

- `XYY-20261003-01`，LOW，已完成。按用户要求启动当前工作区的 Astro 开发服务：`http://127.0.0.1:4524/`，仅监听本机回环地址；使用离线 CMS 回退预览，禁用真实询盘及新闻写入配置，未改 `.env`。
- Luna 独立只读验证首页、中文联系页、英文联系页均为 HTTP 200，页面标题正确。原4321服务保持；未修改业务源码、提交、推送、部署或操作真实CMS/数据库。
- 日志`output/local/xyy-20261003-01/dev.log`。仅启动与GET就绪检查，无业务变更，未运行全套测试；进程可用性以当前检查为准。

## 应用安全定向加固（2026-10-02，本地完成）

- `XYY-20261002-08`，HIGH，本地验收 CLOSED。用户明确优先安全并要求自主完成；Terra 实施、Luna 独立 QA PASS、Nova APPROVED。仅本地修改5个实现文件、新增5个安全单测及任务记录；HEAD仍为`5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`，未提交、推送、部署或执行真实CMS/数据库/询盘写入。
- 咨询请求改为流式原始字节8KiB限额，超限取消读取并返回413；仅接受精确JSON主媒体类型。限流表和到期队列有1000项容量上限，避免每次请求全表扫描，保留十分钟前5次允许、第6次受限；存储失败日志只留固定原因和HTTP状态，不含询盘个人字段。
- CMS资源响应统一加文档sandbox CSP及nosniff，覆盖200/206/304；发布引用缓存覆盖不存在UUID并合并并发读取，失败不写成功缓存且可重试，减少匿名无效查询放大。未修改全站CSP、代理/IP信任、CMS权限或业务内容契约。
- 本次独立`npm run verify` exit0：586类型文件零诊断、96文件620单测及lint/维护/assets/build通过。中英文桌面/移动咨询38项通过；真实资源路由合成浏览器2项、headed Chromium PDF基线对照1项通过，PNG/SVG显示、HTML/SVG脚本阻断、PDF下载与8页查看器截图、Range/ETag均有证据。Sol另测实际Node分块请求在发送12288bytes时收到413并停止；10万唯一key本机微基准45.4ms，仅代表该次合成测量。
- `npm audit --omit=dev`为0已知漏洞；10实现/测试文件冻结hash一致，1418个范围外已有文件保持、四角色旧日志前缀保留、索引空。未把MIME加固宣称为已确认生产CSRF，资源主动内容风险以已发布CMS引用为前提。
- 限制：限流仅进程内尽力防护，容量淘汰会重置相应key计数；验证为本地合成上游，不代表生产、真实接收端或Safari/微信真机。本轮自建测试服务均已停止；旧记录的4524预览在本次结束检查不可达，本轮未操作该端口。当前线上版本仍以上一发布任务为准。
- 合同`docs/plans/xyy-20261002-08-security.md`；证据`output/security/xyy-20261002-08/`。无本地验收阻塞。

## 咨询体验二期发布与 Git 同步（2026-10-02，已完成）

- `XYY-20261002-07`，HIGH，验收 CLOSED。按用户授权发布验收站 `https://wz.tomatopia.top`，release 为 `20261002T102719Z-5beb6a2`，准确 SHA 为 `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`。发布范围共23文件：Task06原22项及英文咨询测试修正；没有发布其他既有修改。
- 两个提交已普通非强制推送到 `AIyj-cmd/XYY-WEB main`：功能提交 `dd2f07ab8685aa0d73e50c8b81eff66cc941d5ab`；最终测试修正提交为 `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`。GitHub CI [37000116735](https://github.com/AIyj-cmd/XYY-WEB/actions/runs/37000116735) 已 completed/success，全部13步骤成功。
- 本次独立候选 verify、完整发布门禁与 GitHub CI 均通过；最终完整门禁为592单测、269 E2E通过/9既有跳过/0失败、4 formal及最终build。Luna线上中英390/1440的8入口、服务预选、提纲边界、实际案例语言切换和几何检查通过；四张可见表单截图由测试与验收分别审阅，Nova发布前后均 APPROVED。
- 本地同步脚本 session38176 exit0；HEAD/main/origin/main、GitHub main和服务器 SHA 一致，ahead/behind为0/0、索引空，发布23文件无未提交差异。1398保护文件及四角色日志旧前缀保持；原73条非发布脏状态保留，当前74条仅新增本任务合同。状态和角色日志已在本地同步，本地4524预览GET200。
- 远端健康两依赖ok；23个旧release全部保留、previous有效、CMS PID1401397和环境文件hash不变。未操作正式主站、真实CMS/数据库、接收服务、DNS/TLS/Nginx或权限配置。
- 原失败及诊断证据保留：R5资源错误的精确根因未证实，R6的512条采样中9条进程读取PermissionError形成局部缺口；最终完整门禁与远端CI均成功，不改写历史失败。线上R3按成功导航窗口严格单列10次已验证图片的离页取消，原始事件保留、0实质错误。验证不代表Safari/微信真机或真实询盘接收；本次无剩余发布阻塞。
- 合同 `docs/plans/xyy-20261002-07-consultation-release.md`；证据 `output/release/xyy-20261002-07/`，最终验收 `sol-final-acceptance.json`。下述Task06“本地完成”和旧版本记录为历史状态，当前部署与Git版本以本节为准。

## 咨询体验二期、按需求选服务与移动体验（2026-10-02，本地完成）

- `XYY-20261002-06`，MEDIUM，本地验收CLOSED；Terra实施、Luna独立QA最终PASS、Nova R4 APPROVED。用户授权范围为本地实现与验证，本次没有提交、推送、部署或真实CMS/数据库/线索写入；Git HEAD仍为`ab82cbdafb3923e4d62041b801d700f360ccdf20`，线上版本未由本任务改变。
- 中英文联系页增加原生GET服务选择，覆盖5类需求与3个区域；首页和产品首屏提供入口，结果衔接真实服务详情、案例与预选咨询。案例详情带入当前内容源认可的场景，语言切换保留合法参数；保留原16路来源及联系API契约，没有恢复统计或报告功能。
- 用户主动插入可编辑的需求提纲，保留已有文字、按字段补缺、重复点击不重复，超过1200字时明确提示且不截断。手机输入至少16px、新控件至少44px；选择器尊重减少动效偏好。原有失败提交保留输入及重试行为保持。
- 最终R4 `npm run verify` session32795 exit0：581类型文件零诊断、91文件592单测、lint/维护/assets/build通过。R3最终构建34项Chromium回归与无JS普通click定向1项通过；R4四宽geometry定向1项和Chromium/WebKit普通0.16s、reduce0s的鼠标/键盘开合通过。按实际影响复用未变业务的R3证据，不重复无关全套。
- 四页390×844单次移动LHCI性能基线：首页89、产品83、中文联系93、英文联系97；SEO69的共同原因是本地禁止索引，未修改线上配置。WebKit为Linux MiniBrowser+xvfb，性能为本机离线实验室结果，不代表Safari/微信真机、真实用户性能或已加速；真实CMS与真实询盘接收未测。
- R1 reset触达21px、R2产品入口约25px及Nova R3减少动效遗漏均已沿同ID修复、复测、复审，失败历史保留。22项实现/测试冻结、1398保护文件及72原脏状态按基线核验；旧动效、素材、治理配置和日志前缀保留。合同`docs/plans/xyy-20261002-06-consultation-service-finder-mobile.md`，证据`output/iteration/xyy-20261002-06/`，功能说明`docs/CONTACT_CONVERSION.md`。
- 当前本地offline开发预览为`http://127.0.0.1:4524/`，中英文联系选择页独立GET200；旧4322在本轮开始时不可达，未操作旧锁或进程。Luna的4535/4536/4537临时QA服务及测试浏览器已退出，4524保留；预览不保证工作环境关闭后持续运行。

## CI 修复版本验收站发布（2026-10-02，已完成）

- `XYY-20261002-04`，HIGH，Sol验收CLOSED：按用户授权将现有提交 `ab82cbdafb3923e4d62041b801d700f360ccdf20` 发布至验收站 `https://wz.tomatopia.top`，并同步 `AIyj-cmd/XYY-WEB main` 与本地状态。Release 为 `20261002T032358Z-ab82cbd`；相对上一线上 b8021b1 仅 CI workflow 改变，本次无新业务改动或新提交。
- Terra受限工具准备、Luna独立预检、Nova发布前与一次重试Review均通过。冻结wrapper第二轮 session97309 exit0：本次完整 `npm run verify:release` 通过，含574类型文件零诊断、589单测、227 E2E通过/9既有skip/0失败、4formal及最终build；全部通过后才执行部署。
- 远端后验PASS：`/version` 精确为ab82cbd/staging及该releaseId，`/healthz` 的CMS与contactStorage均ok；22个旧release全部保留，previous有效，CMS PID1401397与环境文件hash保持。发布未操作正式主站、真实CMS/数据库、接收服务或DNS/TLS/Nginx配置。
- Luna线上最终PASS：中英文390/1440视口的入口、来源预选、实际改选、语言切换保留及横向宽度检查通过，中文几何另有独立补证；页面错误、统计请求、联系请求与实际联系写入均0。四图亲读，Sol抽读移动中文/桌面英文，Nova发布后APPROVED；移动截图仅证明当前可见字段，不宣称完整展示视口下方按钮。验证限Chromium模拟视口与只读流程，未测真机、其他浏览器或真实询盘接收。
- 普通非强制push session2637 exit0，返回up to date；本地HEAD/main/origin/main、GitHub main和服务器均为ab82cbd，ahead/behind0/0、索引空。精确同SHA的GitHub CI `36953940190` 仍为completed/success，未创建空提交或改写旧失败。现有71个脏路径与1414个保护文件保持，本地4322首页GET200；本任务只新增本地合同及状态/角色日志记录。
- 首轮完整门禁R1保留为FAIL（223 E2E通过/4失败/9既有skip，未进入部署），四例隔离复测及后续完整R2均通过；原浏览器资源错误的精确原因仍未确认。仅经工具批准清理三个候选中已核实无跟踪文件的生成dist，保留源码、依赖与历史证据；完整重试仅增加浏览器DEBUG日志，原断言、资源上限、worker、retry和超时设置保持。本次无剩余发布阻塞。
- 合同 `docs/plans/xyy-20261002-04-ci-fix-release.md`；证据 `output/release/xyy-20261002-04/`，最终验收 `sol-final-acceptance.json`。Task02/Task03下述服务器b8021b1记录为各任务完成时历史，当前部署版本以本节为准。

## CI 字体原生库修复（2026-10-02，已完成）

- `XYY-20261002-03`：用户明确要求解决前次两次CI字体原生加载失败。Scope仅CI字体准备步骤：固定官方7.6.8资产与SHA-256，校验后安装，检查动态依赖与实际loader；不修改业务、依赖版本、字体算法或线上环境。
- HIGH，按Terra → Luna → Nova → Sol执行；基线本地/GitHub main为`b8021b149209f9e391e58f258e9c512fb7bea6aa`，1418路径与70既有脏路径已保存。官方asset digest与当前可用本地原生库一致；这不证明旧runner具体缺失哪个文件或依赖。
- 本次沿用同仓库main提交/推送与本地同步授权，必须取得修复提交真实GitHub CI completed/success后才能声明阻塞解除。此次只修CI，不重新部署网站；原验收站版本单独记录。
- Terra单workflow实现完成，Luna独立PASS：隔离缺失native的真实下载/官方size+hash/ldd/loader均通过，新输出生成400/900两档字体；六类失败边界明确非零、未校验资产不覆盖原target。本次候选`npm run verify` exit0（589单测、assets/build），不以既有字体缓存作为恢复证据。
- 单文件提交`ab82cbdafb3923e4d62041b801d700f360ccdf20`、bundle验证通过；Nova发布前APPROVED后，普通非强制push session74064 exit0。真实CI成功后，已审本地同步脚本session92663 exit0，本地HEAD/main/origin/main与GitHub main均为ab82cbd，分支差异0/0、索引为空。
- GitHub CI `36953940190` 已completed/success，head SHA精确ab82cbd，watch session38383 exit0。全部13步骤成功，包含原生库准备/实际加载、格式、候选身份、生产依赖audit与完整`verify:release`：574类型文件零诊断、589单测、227 E2E通过（9项既有skip）、4 formal及最终build通过；不再有字体加载阻塞。
- 本次仅提交`.github/workflows/ci.yml`，固定官方资产、大小与SHA-256并校验动态依赖与实际loader，未降低原CI门槛。1412保护路径、70既有脏路径与四角色日志原前缀保持；新合同是唯一新增脏路径。验收站业务版本仍为b8021b1，本次没有重新部署网站。
- Sol验收CLOSED；合同`docs/plans/xyy-20261002-03-ci-font-runtime.md`，最终证据`output/ci/xyy-20261002-03/sol-final-acceptance.json`。原b8021b1两次失败保留为历史，新提交真实完整CI成功解除本次阻塞；原失败的具体文件/依赖缺失原因仍无证据，不作反推。

## 咨询预选验收站发布（2026-10-02，已完成；CI阻塞由Task03解除）

- `XYY-20261002-02`：用户已明确授权部署验收站 `wz.tomatopia.top`、提交/推送 `AIyj-cmd/XYY-WEB main` 并同步本地状态。仅发布 Task04 经 Task06 清理后的咨询来源与服务预选，精确 33 项文件；报告和事件统计不包含在候选中。
- 候选最终提交 `b8021b149209f9e391e58f258e9c512fb7bea6aa`（33项，含一处测试修正），Luna独立 r2 verify 通过（574类型、589单测）、46/46关键E2E及390/1440补充检查PASS；Nova发布前APPROVED，生产依赖audit零漏洞。首轮44/2失败为测试固定视口误判，原始日志保留，旧trace/截图已被复测覆盖。
- 发布wrapper session1039已exit0：本次完整 `verify:release` 通过（574类型/589单测/227 E2E通过、9既有skip/4formal/最终build），Release `20261002T001733Z-b8021b1` 已部署至验收站。外部首页/health/CMS ping/robots/sitemap/llms/version检查通过；启动健康轮询首次连接拒绝后正常就绪，最终健康成功。
- 独立远端后验PASS：线上SHA精确b8021b1、staging、health两依赖ok，21旧release全部保留，previous指向原版本且有效，CMS PID1401397和环境文件hash未变。Luna线上双宽/双语mock与16路SSR PASS，Nova发布后APPROVED；无真实表单写入。
- 原生Git HTTPS推送因TLS/连接超时失败，SSH443无既有GitHub密钥权限；同目标Git Database API替代工具经Terra实现、Luna真实只读演练与32模拟场景PASS、Nova最终APPROVED。实际apply session79725 exit0：两棵tree、两个commit返回精确原SHA，唯一`force:false`更新main并重读确认成功；没有新增账户权限或密钥。
- 本地同步session37158 exit0：HEAD/main/origin/main与GitHub、线上均为`b8021b149209f9e391e58f258e9c512fb7bea6aa`，分支差异0/0、索引为空、33发布路径清洁；1379保护路径、69既有无关脏路径及四角色日志旧前缀保持，本地4322 GET200。
- GitHub同SHA CI `36950908943` 两次均completed/failure：类型/lint/维护检查通过后，`prepare:fonts`调用`cn-font-split@7.4.3`的原生库发生`ERR_FFI`，尚未进入本轮CI单测/E2E。只确认目标原生库或其依赖不可加载；缺少runner的stat/ldd证据，不能断言目标文件必然不存在或下载为何失败。安装脚本含吞错回退；本机上游资产存在，版本查询服务先后观察到429与200，仅供诊断，不能回推CI根因。
- 用户要求的部署、Git提交/GitHub同步与本地状态同步已完成；当时仅CI门禁BLOCKED，一次原SHA rerun仍同因失败，原始日志保留。现由用户授权的`XYY-20261002-03`独立修复CI：后续单workflow提交ab82cbd的真实完整CI成功，阻塞已解除。本地/GitHub已前进到ab82cbd，验收站业务版本仍b8021b1；旧SHA两次失败不改写为通过，也未创建替代check。
- Luna独立诊断与Nova最终CI Review均已记录；最终验收证据`output/release/xyy-20261002-02/sol-final-acceptance.json`区分已完成动作与CI阻塞。收尾线上version/health仍正常、两依赖ok、本地预览200；文档增量审阅、合同Prettier及diff检查通过，未因文档收尾重复应用测试。
- HIGH；Luna 独立预检、Nova 发布前后 Review 与 Sol 验收。合同 `docs/plans/xyy-20261002-02-contact-preselection-release.md`，证据 `output/release/xyy-20261002-02/`。生产主站、CMS/数据库、接收服务和无关本地改动不属于此次发布。

## 本地开发预览恢复历史（2026-10-02；当前预览见Task06）

- `XYY-20261002-01`：用户反馈原地址打不开，实测4322无监听、连接失败，原会话76156已失效；不能从现有证据确定原进程退出原因。已用同一offline配置恢复 `http://127.0.0.1:4322/`，当前受控开发PTY会话 `25339`，支持热更新。
- 本次独立HTTP请求确认首页、中文带来源联系页、英文联系页均200；跨境来源SSR预选 `cloud-warehouse` 正常。进程仅监听127.0.0.1，本地CMS使用审核静态回退，真实线索接收未连接。
- 脱离会话的后台子进程未保留；经环境批准的nohup启动也未留下监听。最终以保持开启的PTY运行，不宣称永久后台或环境关闭后可用。未修改业务、系统配置、旧锁或其他既有进程。
- 本任务LOW，仅恢复与可用性验证，Sol直接完成；证据 `output/startup/xyy-20261002-01/`，只更新本状态与Sol日志。源码/既有修改保持，未运行全量应用测试，没有提交、推送、部署或真实外部写入。

## 报告与事件统计移除（2026-10-01，本地完成）

- `XYY-20261001-06`：按用户明确要求移除报告与事件统计，保留16路咨询来源、SSR服务预选、改选和语言切换。本地验收CLOSED，Luna PASS、Nova APPROVED；合同 `docs/plans/xyy-20261001-06-remove-conversion-reports.md`，当前功能说明 `docs/CONTACT_CONVERSION.md`。
- 本次 r2 完整verify通过（577类型零诊断、589单测、lint/维护/assets/build）；桌面/移动66项E2E及双语补充探针通过。旧开关true下旧端点GET/POST均404、点击/填写/mock成功无统计请求；16路SSR预选与语言切换保留。初次测试维护预算及临时滚动探针问题均已修正并保留失败证据，应用最终冻结无漂移。
- 已删除21项专用实现/测试/fixture/示例，清理报告命令、事件开关、前端接线和中英文统计隐私说明；35项r2冻结、1396保护路径及原联系API/契约保持。证据 `output/removal/xyy-20261001-06/`，最终审阅 `nova/review.md`。中英文联系/隐私已检查，隐私页原眉题/导航及移动悬浮按钮既有视觉表现未改，不宣称已修复。
- 下方 Task04 的事件、报告与示例属于原验收历史，已由本任务撤回。当前仅本地完成，未提交、推送、部署或真实外部写入；验证为本地Chromium/offline CMS/mock联系，4322开发预览继续运行。本任务无剩余阻塞，不改变Task02历史CI外部阻塞。

## 官网咨询转化一期（2026-10-01，本地验收历史；报告/统计由 Task06 移除）

- `XYY-20261001-04`：按用户批准方案完成本地实现并验收CLOSED，独立QA PASS、Nova r5 APPROVED。16个中文/英文服务详情的首屏、底部和悬浮入口统一携带受控来源，联系表单SSR预选对应服务；中英文切换保留有效来源，用户仍可改选，原联系API与六字段接收契约不变。
- 新增默认关闭的咨询入口点击、首次填写、成功提交事件；只有 `CONVERSION_ANALYTICS_ENABLED=true` 才发送和接收。事件日志不采集表单个人信息或持久访客标识。新增 `npm run report:conversions` 从导出日志生成HTML/CSV，按北京时间日期、来源页、语言、入口和服务汇总事件次数，支持多输入去重、零数据和明确失败；用法见 `docs/CONTACT_CONVERSION.md`。
- 最终独立 `npm run verify` session80797 exit0：588类型文件零诊断、93文件616/616单测、lint/757文件维护预算/assets/build全部通过；最新本地构建上的62项Chromium桌面1440/移动390测试全部通过。16路必需入口、两页新增hero实点及无JS实点、预选和四张稳定截图均通过；Nova报告单测9/9与16路只读探针通过。r4未变的事件8/8、英文询盘、默认关闭和中英文表单四视口证据明确复用。
- 34实现与21测试/fixture冻结一致，1371保护路径无漂移，既有修改与角色日志历史保留；HEAD仍为 `7f903056233627c6e9b2007667b827b76a26d963`。证据 `output/conversion/xyy-20261001-04/`，最终审阅 `nova/review-r5.md`，合同 `docs/plans/xyy-20261001-04-contact-conversion.md`。
- 当前仅本地完成，统计默认关闭；未提交、推送、部署、修改生产配置或执行真实CMS/数据库/线索写入。验证使用offline CMS与mock联系端点，未覆盖真机、其他浏览器或线上真实接收保存；示例报告为合成数据。Sol本轮4484预览已在验收后关闭，既有4321和旧4474/4475未处理。本节不改变下方Task02的独立CI外部阻塞状态。

## 英文页脚验收站发布（2026-10-01，部署/同步完成，CI外部阻塞）

- `XYY-20261001-02`：按用户授权顺序，八项英文Footer服务清单已部署至 `wz.tomatopia.top`，普通push至 `AIyj-cmd/XYY-WEB main`，再同步本地Git；仅发布 `src/i18n/routes.ts`，其他动效、治理/config、素材与既有脏改保留。
- 提交 `7f903056233627c6e9b2007667b827b76a26d963`，Release `20261001T012818Z-7f90305`。本地HEAD/main/origin/main与GitHub已同SHA；GitHub CI `36803242687` 在回归途中被取消，但run/job API持续in_progress；CI未通过，任务为BLOCKED（仅外部CI收尾），不是代码REJECTED。
- 提交前verify session74497 exit0；完整发布wrapper session55163 exit0：569类型零诊断、90文件/585单测、181 E2E（9既有skip）、4formal、最终build。Luna独立预检PASS、Nova发布前及发布后APPROVED。
- Luna线上只读最终exit0/PASS：中英文Contact 1440/390八项精确顺序和href，无横溢；四新增锚点双宽8/8点击后可见；英文Services内层Footer双宽八项可达、outerY=0。六张fresh图均亲读，Sol复核英文390Contact与1440Services。52个既有MP4 ERR_ABORTED单独记录，与连续导航取消相符，不据此推断视频播放成功或故障；工具缓存、语言期望和通用媒体gate的前三次失败保留。
- 远端独立核对session94538 exit0：version/health正确、20旧release保留、previous精确指原3543目录且有效、CMS PID1401397与环境文件hash未变。普通push session36916 exit0，本地同步session88315 exit0，冻结源码与保护路径均匹配。新建完整bundle后因磁盘考虑改为同提交增量bundle，verify通过，未清理历史或用户文件。
- CI原日志已取得：585单测通过，Chromium第90/190例通过后直接出现The operation was canceled，未出现断言失败；30分钟超时尚未到，近期无更新main run，取消原因未明。Nova独立判为外部CI中断，发布/同步批准保持。原生rerun拒绝，普通cancel称已结束，REST rerun HTTP403称仍在运行，force-cancel HTTP409称不在运行；这些API结果互相矛盾，未发生成功重跑或取消。没有空提交、新push或修改workflow/测试绕过检查；停止了本地CI轮询（session11096人为结束exit130，不能视为CI结论）。后续条件：GitHub控制面恢复后同SHA原生rerun，completed/success才可CLOSED。
- 最终本地核对：HEAD/main/origin/main/GitHub/线上均7f903056，分支差异0/0；1403保护路径无漂移，42既有无关脏路径保留，当前43脏路径包含新增本任务合同；发布源码在Git中已清洁。本地4322英文联系页GET200且包含八服务清单。状态与日志已同步，实际三项用户动作完成，CI最终成功仍受上述外部条件阻塞。
- 用户“继续”后的同ID排查仍BLOCKED：02:54:41 UTC新响应显示原attempt1/in_progress与01:53:36 updated_at，已超过30分钟配置上限。单job/失败job重跑均403 already running，force-cancel仍409 not in progress；REST检查套件重试404，GraphQL确认仓库ADMIN与原同SHA套件后，重试明确只允许GitHub App。所有恢复请求均被拒，没有成功触发CI或改变权限。GitHub公共状态当时operational，不能据此排除单run故障或认定全局事故；浏览器工具因缺少enabled surfaces未能初始化，没有UI操作。
- Nova本轮只读复审继续判为外部BLOCKED，现有权限/API内无剩余安全恢复；未改代码/workflow、增加提交/push或再次部署。已整理未发送的 `output/release/xyy-20261001-02/continuation/support-evidence.txt`，供GitHub支持端核对；本次最终只读再次确认三端7f90305、0/0、health双依赖ok、1403保护/42既有无关脏路径保持。状态恢复后仍只接受原SHA CI completed/success；新证据和最终状态在同目录final-state.json。
- 发布证据 `output/release/xyy-20261001-02/`，合同 `docs/plans/xyy-20261001-02-footer-release.md`；本次未修改接收服务、真实CMS/数据库、DNS/TLS/Nginx或56xyy.com，未发送真实询盘。验证限Chromium桌面/移动模拟，视频完整播放与真机/其他浏览器不在本次Scope。

## 英文页脚服务清单对齐（2026-10-01，本地验收历史；已由Task02发布）

- `XYY-20261001-01`：英文共享Footer的Services由4项补齐为与中文版相同语义和顺序的8项；新增跨境、华南、华东、直播英文服务分区入口，末项名称统一为B2B store distribution。仅业务文件 `src/i18n/routes.ts` 中的静态英文清单改变，中文清单、Footer布局及其他列保持。
- LOW流程Terra→Luna PASS→Sol本地验收CLOSED。局部Prettier/ESLint/diff检查通过；中英文Contact1440/390四组合八项及链接无横溢，四新增锚点两宽实际点击8/8可见，四旧英文详情GET200；/en/services内层Footer两宽八链接均完整可达，outerY=0。Sol亲读英文桌面与手机截图。
- 首轮实现遗漏B2B label已沿原ID更正；预览首次遇inotify watcher上限，仅证据目录专用配置忽略历史output/graphify监听后恢复。工具服务器重启打断首轮浏览器验证后已重新完成独立QA；Astro旧锁通过官方--ignore-lock启动隔离预览恢复，没有杀旧进程或改项目/系统配置。250ms锚点初始观测仍处于滚动中，以稳定后1000ms结果为准。
- 最终源hash `e1709daca4519d70c5741247df63d2ff5dda973f9ddfb8597953f3a81a99482a`；1401保护路径零漂移，41既有脏路径保留，HEAD仍3543ecb。证据 `output/playwright/xyy-20261001-01/`；本地预览 `http://127.0.0.1:4322/en/contact`。
- 本节为Task01本地验收时状态；其后部署、GitHub和本地同步由上方Task02完成。Task01当时仅本地Chromium模拟1440/390验证，未提交/推送/部署，未运行发布专属门禁；当时线上为3543ecb。

## 英文询盘联合发布（2026-09-30，已完成）

- `XYY-20260930-02`：用户明确授权接收服务兼容修复及部署，再按网站部署→GitHub→本地状态同步顺序执行。接收服务 `xs.tomatopia.top` 与网站验收站 `wz.tomatopia.top` 已上线；正式主站56xyy.com未切换。
- 网站提交 `3543ecbcff6ac7629f6f168db61b2217ea2dd21e`，Release `20260930T113222Z-3543ecb`；仅包含Task01的6实现/4测试路径。普通push session10237 exit0，本地HEAD/main/origin/main与GitHub main已同SHA；其他既有动效、治理/config、素材和脏改保留。
- 接收服务修复提交 `b0c82c8183acd2391252fc4e4f2a7de623d62172` 已同步至准确本地源码 `/home/yj/xiansuo/.worktrees/newxs-wecom`，未推送接收仓库。空电话需有效邮箱并存NULL，国际号码规范化，仅非空电话查重；六字段、鉴权、事务、审计及通知逻辑保持，无schema/依赖变化。
- 接收apply session42498 exit0：仅compiled路由和两份完整性记录改变，API PID1401452→1781533，旧文件保存在 `/opt/newxs-xiansuo/artifacts/xyy-20260930-02-inquiry`。只读verify session80141 exit0核对191项manifest及commit/module身份。网站19旧release、.previous_target回退记录与对应目录保留，CMS PID1401397未变；版本及health/CMS/contactStorage均正常。
- 当前验证：网站提交前verify与完整发布verify:release通过，569类型零诊断、585单测、181 E2E（9既有skip）、4formal及build；接收端11定向、279全测及7部署模拟通过。首轮接收测试因候选缺H5产物失败，48个原产物逐项核对补齐后复测通过，原失败保留。
- Luna线上最终PASS、Nova发布后APPROVED。CLI第三轮session35485 exit0完成中英文1440/390，required/无横溢、英文锚点姓名、错误邮箱零请求、仅邮箱/国际号码mock提交及pageerror断言通过，四图亲读。前两轮导航30秒超时保留，最终仅探针导航等待60秒，应用未变；CLI未透传console.log，不虚构payload数值。
- 本地同步session97015 exit0；接收端部署/验收记录已追加。GitHub同SHA CI `36717694943` completed/success（watch session63173 exit0），release-verification及全部步骤通过；Nova最终一致性Review APPROVED。最终核对session95507 exit0：本地/GitHub/线上同SHA、0/0，10冻结/1402保护路径一致、41既有脏路径保持。Sol验收Task02 CLOSED，Task01目标由此次联合发布一并完成，无剩余阻塞。证据、授权及候选bundle/patch：`output/release/xyy-20260930-02/`，验收汇总 `sol-final-acceptance.json`。
- 未发送真实询盘或通知测试，未手工查询/写入线上数据库、迁移或修改CMS/基础设施；线上真实保存未实测。浏览器覆盖Chromium模拟视口，未覆盖真机/Safari/Firefox。

## 英文询盘入口（2026-09-30，本地验收历史；发布状态见上方Task02）

以下为Task01本地验收时的历史记录；其中待授权和未部署状态已由Task02的新授权、实际接收适配与联合发布覆盖。

- `XYY-20260930-01`：英文联系页改为邮箱必填、电话选填；非空电话支持 `+` 国际区号及空格、短横线、括号。客户端/API复用邮箱、号码和原始长度校验；`locale=en`不透传六字段接收payload，中文仍为国内电话必填、邮箱选填。
- 英文400号码标明中国境内热线，新增International enquiries表单入口，失败提示保留输入并引导重试；没有新增未经确认的业务邮箱。锚点为英文表单增加112px滚动间距，修复固定导航遮挡姓名字段。
- 6实现/4测试路径，Terra完成、Luna网站本地候选PASS、Nova APPROVED，Sol已验收网站本地候选；整体目标等待接收端兼容授权，未CLOSED。29单测、4桌面/移动E2E、21纯校验边界、572文件类型零诊断、局部format/lint和741维护预算通过。E2E在Astro dev的14状态长序列使用命令行60/90秒总预算，每步expect仍5秒；仓库timeout保持。定位歧义、默认总预算超时、锚点遮挡与测试行数预算的原失败均已记录并解决，未将其作为首轮通过。
- 中英文1440/390四组合无横溢、required语义和英文仅邮箱mock提交通过；最终两张锚点stable图确认姓名在导航下方。证据在`output/contact/xyy-20260930-01/`及`output/playwright/xyy-20260930-01/`；HEAD仍b50c4b3，1390保护路径无漂移，角色日志旧内容保留。
- 真实提交链路尚未打通：只读提取本地`/home/yj/xiansuo/server/src/routes/website-leads.ts`的纯Zod schema实测仍拒绝空电话和国际电话，并发现按电话去重的兼容依赖。该仓库需要另行授权修改接收规则/空电话去重并使用一次性临时测试库验证；本轮没有修改该仓库、执行数据库或网络提交。此结论只反映本地源码，不能推断远端版本。网站候选不能单独作为可发布版本或整体CLOSED。
- 仅本地隔离CMS/接收端配置与Chromium模拟视口验证，未覆盖真机或其他浏览器；未提交、推送、部署或运行真实CMS/数据库操作，未执行提交/发布专属verify/release门禁。

## 导航与Services页脚验收站发布（2026-09-30，已完成）

- `XYY-20260929-08`：按用户部署→GitHub→本地同步顺序，Task06静态页脚与Task07最终自适应玻璃导航已部署至验收站 `wz.tomatopia.top`。最终17代码/测试路径，提交链 `b733c54 → 5f8402d → b50c4b3`；最新完整SHA `b50c4b3e85ecdf60e3cded498b5701d9d107e1c7`，Release `20260929T234844Z-b50c4b3`。ServiceLanding动效、治理/config和其他无关本地修改保留。
- 最终提交前verify与定向布局四项复测session56881 exit0；Nova两处测试增量均APPROVED。原发布脚本第四轮session24022 exit0：569类型零诊断、737预算、90文件/578单测、179 E2E（9既有skip）、4 formal、最终build全部通过。
- 第一轮旧CTA定位误计新增Footer链接，第二轮旧布局审计任意文字总数门槛与折叠菜单耦合，均仅修测试并保留原几何/链接等断言；第三轮根盘ENOSPC中断。三轮原失败证据保留，不计通过。经工具授权仅清理可重下载npm `_cacache` 恢复约2.8GB空间，依赖、工具安装与项目证据保留；新增双文件系统512MB空间守卫获Nova批准。浏览器CLI索引已恢复并确认离线可启动。
- 独立只读远端核验：version与本次SHA一致，staging健康及CMS/contactStorage依赖均ok，18旧release全部保留、previous有效，CMS PID1401397未变，仅web更新。正式站、真实CMS/数据库/权限与环境配置未改。
- 实站只读CLI session15193 exit0：中英文390/438/1440导航6组合、语言点击2、Services390/1440共4组合及英文内容GET2，零浏览器错误；6张截图和raw/parsed留存。补充两张完整手机Footer图session69213 exit0，内层到末尾、outerY0、版权/隐私可见、Footer静态；原补图直接设scrollTop过早未到末尾的harness失败保留。Luna线上最终PASS、Nova发布后收尾APPROVED。
- 普通git push session66333 exit0成功；备用API传输未执行。最终核对HEAD/main/origin/main/GitHub/线上均b50c4b3、ahead/behind0/0，17冻结/1384保护及40既有无关脏路径保持，三个角色日志旧前缀完整，本地4322预览GET200。GitHub同SHA CI36651173179已completed/success（watch session27733 exit0），最终再次核对版本/文件保护/本地预览全部通过；Nova最终一致性Review APPROVED，Sol验收CLOSED，本地状态已同步，无剩余阻塞。最终证据 `output/release/xyy-20260929-08/sol-final-acceptance.json`；浏览器验证限Chromium模拟视口，未覆盖真机或Safari/Firefox。

## 中英文导航自适应折叠与间距（2026-09-29，本地验收完成）

- 同ID后续LOW色差修正已验收：移除下拉菜单独立95%/72%深色覆盖，与主栏共用50%深蓝玻璃底色、渐变、边框和阴影；窄屏主栏blur移至其before层，菜单自身blur实际生效，背景正文不会再锐利穿过菜单。仅修改header-liquid-glass.css、header-responsive.css，桌面规则及原导航交互保持。
- 本次Terra → Luna PASS → Sol CLOSED：中英文390/438/1440六组合CLI最终session56110 exit0、零浏览器错误；有效blur22px/高光等值，窄屏gap8px、无横溢，展开/Escape正常。Sol与Luna亲读最终四张手机图，英文Contact不再被背景标题干扰。首轮参数比较通过但视觉失败的证据保留，不能代替最终图；两CSS格式/diff通过，2源冻结与46保护路径保持。最新视觉证据以`output/playwright/xyy-20260929-07/glass-match/final-acceptance.json`为准，下列原交互验收留作历史。本增量仅本地离线Chromium开发预览，未build/typecheck/full verify、提交/推送/部署或执行真实外部写入。

- `XYY-20260929-07`：按最终要求改为中英文单排导航，EN/中文后使用同导航玻璃质感的圆角三横线按钮，只有放不下的入口进入菜单；宽度足够时按钮隐藏。可见栏目均匀分配，末项至语言按钮间距为8px，窄屏栏内边距12px。覆盖此前两排及未验收的横滑方案，历史记录保留。
- 实现范围为Header、MobileNavigation、header-responsive.css及新header-overflow.ts，更新3项既有移动导航测试；链接、顺序、活动态与桌面入口保持。实际宽度/字体变化触发分配，支持焦点迁移、Esc/外点关闭及无JS原生details；菜单增加Lenis局部滚动边界。
- 最终core CLI 12布局组合、2语言交互与2禁JS上下文通过；四张589/390中英文截图均为58px单排、末项间距8px，无横溢。短视口390×260菜单滚动87px、背景0、末项可达，去Lenis属性对照为菜单0/背景116；缩放焦点、字体3→2→3和contact页无ResizeObserver回退通过。既有导航E2E六项通过，572类型文件零诊断、741维护预算及scoped格式/lint通过；这些静态/E2E检查先于最终非视觉Lenis属性，属性后完成局部格式/lint/diff及最终core/edge复测。
- Terra完成、Luna独立PASS、Nova APPROVED、Sol本地验收CLOSED。7路径冻结、40既有保护路径及角色日志原前缀保持；证据 `output/playwright/xyy-20260929-07/overflow-menu/final-acceptance.json`。早期工具缓存和edge测试失败保留，开发工具栏命中问题已更正，未把原失败算作通过。
- 仅本地Astro开发预览4322、离线CMS、Chromium模拟视口；极矮视口探针仅隐藏开发工具栏，无ResizeObserver在/contact隔离验证，首页Lenis既有依赖未扩展处理。未覆盖真机或其他浏览器，未构建/提交/推送/部署或修改真实CMS/数据库，提交/发布verify门禁本次不适用。HEAD仍79ba3c1，Services页脚等既有修改保留。

## 中英文 Services 静态页脚优化（2026-09-29，本地验收完成）

- `XYY-20260929-06`：用户在首版本地验收后明确选择“只在整页最底部显示，滚动服务内容时不跟随”。同 ID 增量将共享 Footer 放入服务内层第9分区末尾，页面统一为一个滚动区域；Footer 为普通静态布局，无 fixed/sticky、transform 或跟随动画。页脚可见时隐藏分区导航，返回服务恢复；八视频/九分区与文案、媒体、首页 Footer 本身保持。
- 两语言站点设置各沿用原读取一次，再同时传给布局和 Footer；无 CMS 契约变更。服务视口扣除语言提示条高度，开/关均无外层滚动；无 JS 时 Footer 服务端渲染且可滚动到达。
- Terra 完成，571 文件类型检查零诊断，scoped格式/lint、740文件预算通过。实际CLI四组合1440/390及两路禁用JS验证已完成，footer与各自首页内容一致、outerY=0、静态样式、版权/隐私可达、nav隐藏/恢复均通过；两手机触摸位移981/877。初轮E2E旧导航常显假设失败，已按新行为修订测试；本次未改6项保留首轮PASS，受影响桌面/手机2项最终定向PASS，旧失败保留，未修改应用迎合旧断言。
- 本增量 MEDIUM 流程完成：Luna 最终独立复核 PASS、Nova APPROVED、Sol本地验收CLOSED；证据 `output/playwright/xyy-20260929-06/static-footer/`。首版双层滚动实现及旧证据只作历史，以本增量为准。仍仅本地，HEAD `79ba3c1`，未提交/推送/部署或写真实CMS/数据库；未运行提交/发布专属 verify/release 门禁。验证限本地离线CMS与Chromium模拟视口/CDP触摸，未覆盖真机或其他浏览器。

## 英文内容验收站发布（2026-09-29，已完成）

- `XYY-20260929-05`：用户授权将本轮英文内容部署到验收站 `wz.tomatopia.top`，部署验收后推送 GitHub `AIyj-cmd/XYY-WEB` 的 main，再同步本地状态。发布清单为任务03/04合并46个代码/测试文件与3个对应文档，其他既有本地修改保留。
- 提交前 `npm run verify`、完整 `verify:release` 均通过（578单测、179E2E、9既有skip、4formal/finalbuild）。Luna preflight PASS、Nova 发布前 APPROVED；精确49路径提交 `79ba3c1` 已部署至wz staging，Release `20260929T044842Z-79ba3c1`，version与health正常，17旧release保留、CMS PID未变。独立实站1440/390、14期卡片及语言/SEO回归PASS，Nova最终APPROVED。原生Git连接失败后，经审阅的API方式精确同步同一Git对象，非强制更新GitHub main；本地main/origin/main/GitHub/线上均79ba3c1，0/0。同SHA CI `36534414862` 已完成且 success，Sol 最终验收 CLOSED。49发布路径与1,350保护路径核对通过，本地4322英文目录仍200；本地状态和日志已同步。
- 本次未执行CMS字段启用、内容发布、数据库/权限操作或正式站变更。线上英文FAQ当前未渲染，未将其判定为原始CMS空数据或声称FAQ点击通过；验证限Chromium模拟1440/390，未覆盖真机/Safari/Firefox。最终证据 `output/release/xyy-20260929-05/sol-final-acceptance.json`；下文03/04记录保留其本地验收时的历史事实，发布状态以本节为准。

## 英文供应链白皮书资料页（2026-09-29，本地验收完成）

- `XYY-20260929-04`：新增 `/en/supply-chain-whitepapers`，提供现有 14 期的英文标题、摘要、刊期说明、FAQ 和阅读导航；报告 HTML 正文与 PDF 保留中文，入口明确标注 Chinese。英文 Insights 增加资料入口，双向语言切换、独立 canonical/hreflang、sitemap 与 llms 同步；没有新增英文报告详情或英文 PDF。
- 沿用 CMS 可用期次与现有转换目录，英文副本绑定已审核的中文源；成功空保持空，来源变化/未知期次不套用旧译文，401/403/非法响应明确失败，仅不可用错误允许审核回退。第 10 期日期来源冲突、第 12 期原目录日期串与第 14 期 June 2026 封面标注均保留。后续新期次需补充审核过的英文标题和摘要，不自动翻译报告正文。
- MEDIUM 流程完成：Terra 实施及返工、Luna 最终 PASS、Nova APPROVED、Sol 本地验收。最终 `npm run verify` exit 0：571 类型文件零诊断、740 文件维护预算、90 文件/578 单测，lint/资产/build 通过；白皮书 6 项、英文新闻 8 项、旧导航/语言 2 项浏览器用例通过。全量验证后仅修改布局测试的截图滚动方式，局部检查与布局 1/1 复测通过，应用未变；四张有效桌面/手机图已复核。
- 根路由配对及手机首屏遮挡已修复；初次预算超限、测试定位错误、视觉 FAIL 与无效滚动截图均保留且未计通过。19 个最终代码/测试路径冻结一致，1379 保护路径无漂移，中文目录、第 14 期正文及既有英文案例 title/main 与基线一致。证据 `output/english-whitepapers/xyy-20260929-04/sol/final-acceptance.json`；合同 `docs/plans/xyy-20260929-04-english-whitepapers.md`。
- 本地预览 `http://127.0.0.1:4322/en/supply-chain-whitepapers` 返回 200；HEAD 仍 `54b41d2`。未提交、推送、部署或写入真实 CMS/数据库/权限，未运行 `verify:release`；验证限本地 mock/offline CMS、构建后 SSR 和 Chromium 模拟 1440/390/360，未覆盖真实 CMS、真机或 Safari/Firefox。未来部署仍需准确目标授权及发布门禁。

## 英文精选文章（2026-09-29，本地验收完成）

- `XYY-20260929-03`：在原 news 记录维护可选英文标题、摘要、正文、状态和发布时间，默认草稿；共享 slug、封面、分类。新增 `/en/news`、英文详情、Insights 导航、对应语言切换、独立 canonical/hreflang 和 sitemap，保留中文及既有批量发布接口兼容。CMS 字段定义、默认 dry-run 的定向迁移脚本与编辑交接已完成本地准备，真实后台尚未调整。
- 英文公开统一要求中文和英文均已发布且到期、英文标题/摘要/消毒后的可见正文齐全；中文撤下同步隐藏英文，英文可独立撤下。缺稿返回真实 404，不输出无效语言配对；CMS 成功空保持空，仅不可用错误允许既有回退。终审发现的 Unicode 不可见空稿问题已修复，正常 Unicode、ZWJ emoji 与字面尖括号文字保留。
- HIGH 流程完成：Terra 实施及返工、Luna 独立用例与最终证据复核 PASS、Nova 复审 APPROVED、Sol 本地验收。最终 `npm run verify` exit 0：562 类型文件零诊断、732 文件维护预算、89 文件/574 单测、lint/资产/build 通过；原生 Chromium 9 项新闻专项与 2 项旧导航/语言回归通过，桌面/手机代表截图已复核。最终 32 个代码/测试文件冻结一致，1354 个保护路径无意外变化。
- 初次 404 语言标记、手机遮挡、Unicode 空稿和测试文件行数超限均已修复复验；初始 REJECTED、失败命令和环境阻塞证据保留。完整旧 E2E 矩阵曾因资源/runner 问题未完成，不计 PASS；验证限本地 mock/offline CMS、构建后 SSR 和 Chromium 模拟视口，未覆盖真实 CMS、真机或 Safari/Firefox。
- HEAD 仍为 `54b41d2`，未提交、推送、部署或写入真实 CMS/数据库/权限；未生成或发布首批三篇文章，未运行 `verify:release`。未来后台启用与部署需明确目标环境及对应授权，部署前运行 release 门禁。编辑说明：`docs/english-news-editorial.md`；合同及最终证据：`docs/plans/xyy-20260929-03-english-news.md`、`output/english-news/xyy-20260929-03/sol/final-acceptance.json`。

## 英文仓配详情动效同步（2026-09-29，本地验收完成）

- `XYY-20260929-02`：按用户“同步到英文站”的要求，仅将共享 `ServiceDetailMotion.astro` 的语言门控扩展到 `en`。现有 `/en/apparel-fulfillment`、`/en/returns-inspection`、`/en/garment-care`、`/en/retail-distribution` 四页复用中文脚本、样式与 800ms/150ms/320ms 参数；未新增逐页模块或路由，中文八页及其他页面保持。
- Terra 局部格式/lint、544 文件类型检查零诊断通过；Luna 独立四页×1440/390共8组合的实际中间帧、结束可读、reduce、代表页签/FAQ和横溢/浏览器错误检查 PASS。Sol 补测鞋服/修复两页真实禁用 JavaScript 的手机可读性，Luna 复核；两张桌面/手机最终图已读取。零售手机的一处等待元素经原生 IO 确认为触发区外，两个 noJS 探针语法错误保留但不计通过。
- Nova APPROVED，Sol 本地验收：唯一组件条件行差异、实现冻结一致，17 路正文/链接/媒体/SEO/Schema零变化，878保护路径无意外变化。证据 `output/service-motion/xyy-20260929-02/`，预览 `http://127.0.0.1:4322/en/apparel-fulfillment`。
- 验证限离线配置和 Chromium 模拟视口，未覆盖真机/Safari/Firefox/live CMS；未运行 build/full verify/release、提交、推送、部署或外部写入，HEAD仍为`54b41d2`。

## 中文仓配详情统一入场效果（2026-09-29，本地验收完成）

- `XYY-20260929-01`：中文仓配总览对应的八个详情页统一接入 `ServiceDetailMotion`。同一套目标收集、脚本与样式控制文案淡入上移、媒体轻缩放及单次滚入；按用户后续确认，当前时序为 800ms 时长、150ms 间隔、320ms 最大等待，没有逐页新增动效模块。本任务完成时仅中文启用；用户随后授权的英文同步已在 `XYY-20260929-02` 完成本地验收，其他页面不启用。
- 同ID节奏调整（LOW）已本地验收：只改 `detail-reveal-targets.ts` 两项常量，其他四个相关实现文件hash保持。局部格式/diff通过；独立1440/390实际WAAPI时长800、delay为0/150/300/320，首屏/下方区块结束后清晰，reduce、英文门控、横溢和浏览器错误检查通过，Luna PASS。证据 `output/service-motion/xyy-20260929-01/slower/`；未重跑下述初版的全矩阵/21单测或Nova审阅，未变功能沿用初版基线。
- 仅改五个应用文件：`ServiceLanding.astro`、共享组件、`detail-reveal.ts`、`detail-reveal-targets.ts`、`service-detail-motion.css`。默认无 JS/缺接口仍可读，减少动态效果、聚焦和页面离开可清理等待状态；FAQ 与页签正文不进入延迟队列。文案、claims、CMS/SEO/Schema、链接与媒体保持。
- 独立 QA PASS、Review APPROVED：类型检查 544 文件零诊断，局部格式/lint、715 文件维护预算、6 文件 21 单测通过；八页 1440/390 首屏共16组合、桌面/手机各49区块及360/768补测完成。无JS、非目标隔离、缺动画接口、减少动画、键盘、FAQ、三类页签、锚点/返回、视频播放通过；16路最终SSR语义零变化、5文件冻结一致、874保护路径无意外变化。原滚动探针错误保留，13处边缘候选以原生IO数据复核为未达触发条件，未作为实现缺陷或掩盖失败。
- 本地预览 `http://127.0.0.1:4322/xiefu-yuncang`；证据 `output/service-motion/xyy-20260929-01/`。验证限本地离线配置、Chromium模拟视口，未覆盖真机/Safari/Firefox/live CMS，未运行完整verify/release或build。HEAD仍为`54b41d2`，未提交、推送、部署或写入真实CMS/数据库。

## GPT-6 调度与协作规则优化（2026-09-05）

- `XYY-20260905-01` 按用户要求优化 `AGENTS.md`，并根据补充要求将项目 `.codex/config.toml` 主模型默认值从 `gpt-5.6-sol` 调整为 `gpt-6-astra`；主会话推理等级保留 `xhigh`。
- 调度架构为 GPT-6 主会话承担 Sol，Terra=`gpt-5.6-terra`、Luna=`gpt-5.6-luna`、Nova=`gpt-5.6-sol`，三个子代理配置及 `high` 推理等级保持原值；配置文件默认值与实际会话模型分别核对，不把文档修改当作会话切换证据。
- 协作规则明确授权连续性、任务与证据合同、普通文档轻量流程、治理调整独立验收，以及按风险验证；保留生产、真实 CMS、数据库、权限和推送的显式授权，提交前与部署前门禁继续强制。
- 本地文档和配置调整已验收：独立验证 `PASS`（四份 TOML 解析、模型映射、规则场景、AGENTS 格式和 diff 检查通过），Review `APPROVED`；保留任务开始前的用户修改，未修改应用代码、提交、推送、部署或操作真实 CMS/数据库。未运行应用测试或浏览器测试，本任务不包含应用行为改动；其他已打开会话不视为自动热切换。

## 本地项目启动（2026-09-28）

- `XYY-20260928-01`：当前工作区 Astro 开发服务已启动至 `http://127.0.0.1:4322/`，PID `40903`，实际监听 `127.0.0.1:4322`；中英文首页及 `/en/digital-operations`、`/en/smart-shipping` 本次 GET 均为 HTTP 200，title、main、H1 正常。
- 本地预览使用显式离线 CMS 和假线索配置；原 `4321` 服务 PID `1439` 保留。首次沙箱内启动后连接被拒绝，获准在沙箱外启动后验证通过。仅更新启动记录和本地证据，无业务代码、依赖或环境文件变更，无提交、推送、部署或真实 CMS/数据库/线索写入；HEAD 仍为 `4a5bb2a`。证据 `output/local-start/xyy-20260928-01/`；本次仅验证启动和 HTTP 可达，未重复应用测试。

## 英文数字化与智能寄件详情（2026-09-27，本地验收完成）

- `XYY-20260927-08`：补齐 `/en/digital-operations` 和 `/en/smart-shipping`，英文首页03/04分别进入对应详情。复用中文实际区块、媒体和交互，新增英文文案及必要手机排版；中英文切换、浏览器语言提示目标、Services活动态、SEO、sitemap和llms同步。英文页面现共12条；原导航间距、数据卡片修复及其他已有修改保留。
- 智能寄件继续经既有CMS读取和完整审核源适配，空内容不回填、变化源不展示；英文使用带线路条件的非量化表述，不复制未在claims登记的11家/50%。独立QA发现正文隐藏但FAQ结构化数据仍输出的问题，已仅在classic隐藏分支同步清空FAQ schema，中文及非classic行为保持。
- Luna职责的独立QA PASS，Nova APPROVED：40项限定单测；schema返工后7组边界、524文件类型检查零诊断、693文件维护预算、局部格式/lint及fresh构建通过。最终应用上的浏览器证据分段完成11个不同用例，1个重复SSR检查跳过；原测试脚本失败和一次父进程exit143保留，缺失的mobile完成状态单独补测exit0，不宣称存在一条全绿E2E总命令。
- 两页×1440/768/390/360共8布局组合、56次文字Range/裁切采样，6页正文/媒体/链接基线、4组CTA实点及滚动显现均通过；中文原Chrome152四组合116元素几何无差异。Sol已读取英文桌面/手机、指标及中文代表图，并核对最终24路径冻结与基线保护后验收。
- 仅本地离线Chrome152及模拟视口验证；未验证live CMS、真实设备、Safari/Firefox，未运行全量verify/release、提交、推送、部署或真实外部写入。HEAD仍为`4a5bb2a`；本轮预览`http://127.0.0.1:4533/en`，原预览保留。合同见`docs/plans/xyy-20260927-08-english-digital-details.md`，最终证据`output/english/xyy-20260927-08/implementation/sol-final-acceptance.json`。

## 导航语言入口间距（2026-09-27，本地验收完成）

- `XYY-20260927-07`：按截图反馈增大 EN/中文切换入口与相邻导航的间距。仅调整 `header-responsive.css`：导航最大宽度 44→46rem，单双行断点 35→40rem，语言入口桌面/窄屏增加 .75/.5rem 左侧间距；原文字大小、链接、顺序与语言提示逻辑保持。
- 局部格式、685 文件维护预算（107/200 行）及 diff PASS。Luna 独立中英文 20/20 宽度组合通过，桌面间距 16–17.671875px、窄屏 8px，文字和点击区域无裁切/交叠；12/12 窄屏标题无遮挡，提示条关闭偏移和键盘双向切换通过。临时探针的 networkidle 超时与隐藏导航选择误报已修正，原记录保留，最终 exit 0。
- 导航代表截图已实际读取；应用冻结 1/1、1329 保护路径一致，已有英文站、数据卡片修复和用户修改保留。本地预览 `http://127.0.0.1:4532/`；证据 `output/playwright/xyy-20260927-07/sol-final-acceptance.json`。
- 仅本地离线 Chromium/Chrome 与模拟视口验证，未覆盖真实设备或 Safari/Firefox；未构建、运行全量 verify/release、提交、推送、部署或写真实 CMS/数据库/线索。HEAD 仍为 `4a5bb2a`，其他预览保留。

## 英文首页数据卡片完整显示（2026-09-27，本地验收完成）

- `XYY-20260927-06`：修复英文首页统计区域数字、单位、经营能力和生命周期文字截断。只在入口样式导入 102 行英文专用 CSS，长数字与单位分行、指标按空间堆叠、说明允许换行；保留完整数据、文案和原有卡片设计。数字行高调整为 1.1，消除首轮发现的数字与单位交叠。
- 局部格式、685 文件维护预算及 diff 通过；Luna fresh 离线构建 exit 0，16/16 英文屏宽（360–1649px）实际文字 Range、列边界、所有裁切祖先、重叠和最终动画值通过；360px 展开的 Data notes 正文完整可见，独立 QA PASS。桌面和手机代表截图已实际复核。
- 中文旧基线 Chrome 152 与 Luna Chromium 149 的字体度量不可比，原失败与 probe exit 1 保留；Sol 在原 Chrome 152 会话比对中文 1440/390 各 58 元素，结构、文字、几何和样式均 0 差异，作为中文回归证据。2/2 应用冻结及 1327 个保护路径一致，原英文站、提示条和用户修改保持。
- 最终本地预览 `http://127.0.0.1:4531/en#s-stats` 使用离线 CMS 与假线索配置；HEAD 仍为 `4a5bb2a`，未提交、推送、部署或写真实 CMS/数据库/线索。验证限本地 Chromium/Chrome 和模拟视口，未覆盖真实设备或 Safari/Firefox；未新增持久测试或运行完整 verify/release。证据：`output/playwright/xyy-20260927-06/sol-final-acceptance.json`；合同：`docs/plans/xyy-20260927-06-english-stats-layout.md`。

## 浏览器语言切换提示（2026-09-27，本地验收完成）

- `XYY-20260927-05`：按用户要求新增顶部语言建议条。中文页面在浏览器首个受支持语言为英语且未保存明确选择时提示，点击后进入对应英文页；没有对应译文时明确进入英文首页。关闭、保留中文、接受英文及原导航的双向语言切换都会保存明确选择；不自动跳转。
- 提示条默认隐藏、随页面自然滚动，固定导航按提示条剩余可见高度偏移；支持换行、resize、ResizeObserver、键盘Escape和关闭回焦。localStorage不可用时尝试sessionStorage，两者均不可用时仍可关闭和导航；无JS时原语言链接可用。未新增网络/定位/第三方跟踪，未改CMS/API/SEO/claims及各页面内容。
- 7应用/单测路径与2独立E2E路径最终冻结。Luna PASS：fresh完整verify通过，516类型文件零诊断、82文件537单测、lint/684文件预算/资源/build；定向Chromium/mobile E2E31 passed/1既有skip，接受英文后返回中文及刷新持久化补充探针2/2。四屏宽及代表页面几何和桌面/手机截图通过。早期首页动画帧排除，最终截图等待动画子元素可读后采集。
- Nova APPROVED，Sol核对9路径hash、1313保护路径（本文件只新增此段）、原角色日志内容及有效截图后本地验收。预览`http://127.0.0.1:4526/`使用显式离线CMS和假线索配置。原HEAD仍为`4a5bb2a`，未提交、推送、部署或写真实CMS/数据库/线索；已有英文站及用户修改保留。
- 验证限Chromium模拟设备/视口和离线依赖，未覆盖真实设备、Firefox/Safari或生产，未运行verify:release。合同`docs/plans/xyy-20260927-05-language-suggestion.md`；最终证据`output/language-suggestion/xyy-20260927-05/sol-final-acceptance.json`。

## 英文商务站（2026-09-27，本地验收完成）

- `XYY-20260927-04`：按用户确认方案，在同一项目新增 `/en` 下10个英文页面，包含首页、关于、服务总览、四个核心服务、案例、联系及隐私。沿用中文站设计、视频和交互，增加中英文切换、英文导航/反馈/404、canonical/hreflang、sitemap与llms入口；英文文案随代码维护，国内电话校验规则保持。
- CMS英文适配与审核来源快照绑定；成功空结果保持为空，未审核或来源变化的译文不展示并产生诊断。公开数字仍来自claims，联系表单新增稳定错误码并保留中文响应及原写入契约；英文成功/失败分支已用mock验证。
- 最终候选167个应用/测试路径冻结。独立完整 `npm run verify` PASS：510文件零诊断、81文件535单测、lint、677文件预算、资源和构建通过。最终定向E2E 17 passed/1既有skip，10英文路由×1440/768/390/360的H1实际文字Range全部通过，英文退货页四宽度与中文两宽度探针6/6及六张截图通过。此前Round6表单、CMS、受影响中文回归及未变更交互证据明确复用。
- Luna PASS、Nova最终增量APPROVED，Sol已复核桌面/手机/中文截图、167路径hash及本地10页200/英文真实404/语言/canonical。首审发现的退货页nowrap裁切已通过仅英文换行样式修复，原失败证据保留。既有1147保护路径内容（本文件仅新增此段）与四角色日志原始内容均保留。
- 仅本地验收，未Git提交、推送、部署或写真实CMS/数据库/线索；原HEAD仍为`4a5bb2a`，线上版本不受本任务影响。预览`http://127.0.0.1:4524/en`使用离线CMS与假线索配置。验证限Chromium模拟视口和离线/mock依赖，未覆盖真实设备、Safari/Firefox或真实CMS/线索；未运行`verify:release`。证据：`output/english/xyy-20260927-04/sol-final-acceptance.json`；合同与验收记录见`docs/plans/xyy-20260927-04-english.md`。

## 当前版本与环境

- `XYY-20260928-04`（CLOSED，已修复、推送、部署并验收）：补齐英文首页弹窗和详情的六个实际 published 案例、32项完整指标及来源说明，新增对应英文详情路由；“查看案例详情”进入对应详情文档，咨询入口独立保留。中英对应切换、SEO/发现链接及英文长指标排版同步，中文保持；CMS成功空与审核源变化的严格规则未放宽。
- 本任务累计39个应用/测试路径，主提交 `e764b74` 和单一CaseCard空格补修 `54b41d2388d34de5a8f6ddad2c32b77b1f75dfd5` 已普通推送GitHub main。当前本地HEAD/main/origin/main、GitHub main与验收站 `/version` 同54b41d2，领先/落后0/0；同SHA CI `36413213310` success。Release `20260928T110250Z-54b41d2` 的health及CMS/contactStorage依赖正常；web PID831859，CMS PID1401397未变。旧16个release全部保留，现17个，previous e764目录有效。
- 最终完整verify通过（541类型文件零诊断、86文件553单测、711维护预算、lint/资产/build）；原部署脚本完整verify:release exit0（149 E2E passed、9既有skip、4 formal passed、最终构建）。独立本地四视口及e764线上三视口验证六详情32项、真实弹窗→详情文档/语言/无JS/边界，最终空格补修另获三宽列表17项及中文SSR/DOM/几何精确对照PASS；新SHA线上三宽无粘连/裁切/错误、实际TOYOUTH详情200、版本前后一致。Luna PASS、Nova最终APPROVED，已实际读取桌面/手机代表图。未改行为明确复用先前证据，不称新SHA重跑完整案例矩阵。
- 首轮发布在SSH前因本地磁盘ENOSPC失败，证据原样保留；经本任务临时目录调整与字节相同的生成资源副本去重后完整重跑通过。e764首轮线上数据/跳转通过但发现词组空格缺陷，其报告总体FAIL保留，补修后新SHA验收通过。最终证据 `output/english-cases/xyy-20260928-04/sol-final-acceptance.json`。
- 1322受保护路径无漂移，原治理/配置/日志/计划/素材修改保持本地；应用工作区无未提交差异。本地4322的英文首页/案例列表/UR详情仍200，使用原显式离线CMS样本，案例集合不同于线上published内容，TOYOUTH在该离线样本不存在时返回404。仅Chrome模拟视口验证，未覆盖真实设备或Safari/Firefox；未操作正式站、真实CMS/数据库/表单写入或DNS/TLS/Nginx。

- `XYY-20260928-03`（CLOSED，已修复、推送、部署并验收）：英文首页和案例页均恢复六条实际 published 案例及 CMS 原顺序，补齐 TOYOUTH；媒体/颜色更新不再误删译文，正文变更仍严格拒绝，成功空结果不渲染空 gallery/CTA/modal。六个应用/测试文件已提交并推送 `b90b777`，本地 main/origin/main、GitHub main、验收站均同 SHA，0/0；同 SHA CI `36381921958` success。完整 verify 和 verify:release 通过（547 单测、141 E2E/9 既有 skip、4 formal 和构建），Release `20260928T054511Z-b90b777` 健康正常，旧 14 个 release 与有效回退目录保留。独立 Luna 本地四组合与线上 1440/390 两视口 PASS：真实六案例、图片、四次英文弹窗实点关闭、中文对照、无横溢或浏览器错误；Nova 最终 APPROVED，Sol 已验收。daemon 重启只丢失原 exec 会话，原发布在后台完成，未重复部署；最终直接退出码不可得，完成依据为完整终点日志与 live SHA/release/health。首轮工具缓存 EROFS 原样保留，成功浏览器会话已全部关闭。证据 `output/english-cases/xyy-20260928-03/sol-final-acceptance.json`；仅 Chrome 模拟桌面/手机视口，未人为回退。既有治理/日志/素材修改保持本地，本地 4322/en 仍 HTTP200。
- `XYY-20260928-02`（已部署、推送、同步并验收）：按本次明确授权，将英文站、浏览器语言建议、统计卡片/导航间距修复及数字化/智能寄件英文详情发布到验收站 `https://wz.tomatopia.top`。首版 `ce682ab` 精确包含 194 个应用/测试路径；补修提交 `5a1227443a722891c41c8006fd738a09063b0510` 仅含审核源适配、回归样本/测试和英文手机端 03 区块样式 5 路径，已正常推送 GitHub main。197 项冻结与干净发布候选一致；本地 HEAD/main/origin/main、GitHub main 及线上 `/version` 精确同 SHA，领先/落后 0/0。
- 当前验收站 Release `20260928T023618Z-5a12274`，环境 staging；`/healthz` 的站点、CMS 内容及联系存储依赖均为 ok，web PID `663413` 在线，CMS PID `1401397` 保持。旧 13 个 Release 全部保留，现共 14 个；上一版 `20260928T002840Z-ce682ab` 为有效回退目标，旧 `4a5bb2a` 目录亦保留。
- 本次补提交前独立完整 verify 与格式检查通过（525 文件零诊断、544 单测、694 文件预算、构建），Nova 发布前 APPROVED；原部署脚本重新完整执行 verify:release 并退出 0（544 单测、141 E2E 通过、9 项既定配置跳过、4 formal 与构建通过）。同 SHA GitHub CI Run `36367817168` 已 completed/success，包含格式、生产依赖审计和发布验证。启动首次 localhost 健康请求发生连接拒绝，脚本等待服务就绪后重试成功，随后外部健康及版本核对通过；未回滚。
- 首次线上独立 QA 发现英文首页三个 CMS 服务区块被省略，第 03 入口缺失、固定平台序号变为 01；只读 published 服务核对确认审核源版本不匹配。返工保留严格全字段匹配与成功空不回填规则，英文公开数字仍来自 claims。Round1 claims 字面量守卫 FAIL、Round2 手机 03 编号遮挡 FAIL 均已最小修复并保留证据；Round3 真实 published 样本 SSR 四视口/四次详情实点 PASS。最终 SHA 线上定向独立 QA PASS：12 英文路由与真实 404、1440/390 首页 01–04、四次详情点击、手机 03 媒体与编号/说明无叠挡、导航间距和一次语言切换均通过，浏览器错误与横向溢出为 0。Nova 最终 APPROVED，Sol 已验收并关闭任务；合同 `output/release/xyy-20260928-02/rework-contract.md`，最终证据 `output/release/xyy-20260928-02/sol-final-acceptance.json`。
- 验证执行边界：独立 Luna 设计并冻结探针，工具权限等待及 npm 缓存 EROFS 后由 Sol 经许可协调执行同一命令，Luna 独立核对 19 项原始证据并亲读两张截图，Sol 同样复核；自有浏览器会话全部关闭。首版广页面矩阵、语言提示完整交互和统计卡片终值图仅作为未改代码的已有证据；最终 SHA 未重复该全量矩阵。最终浏览器范围为 Chrome 模拟桌面/手机；桌面 03 caption 在截图视口下方，仅有盒/Range 几何证据，不声称截图或 hit-test 覆盖。未覆盖真机、Safari/Firefox 或真实表单提交。
- 仅发布既有验收站应用并普通推送 GitHub；现有本地治理文档、配置、历史计划和未引用素材保留。证据 `output/release/xyy-20260928-02/`；正式站、真实 CMS/数据库/线索写入及 DNS/TLS/Nginx 未操作。以下为旧发布和本地验收历史，当前版本以上述提交为准。

### 上次发布记录（2026-09-27）

- `XYY-20260927-03`（已部署、推送、同步并验收）：按本轮明确授权，将首页转化区最终版、广州页面删除及孤儿代码清理发布到既有测试站 `https://wz.tomatopia.top`，普通推送 GitHub `main` 并 `fetch --prune` 同步。本地 HEAD/main/origin/main、GitHub main、线上 `/version` 均为 `4a5bb2a3b8aff7bde49a9b6024222ebba0584502`，领先/落后 0/0。两笔提交 `12fad10`（141 个应用/测试路径）和 `4a5bb2a`（单一测试断言修正）；累计 141 路径，103 删除、38 保留/修改。
- 当前测试站 Release `20260927T004516Z-4a5bb2a`，环境 staging；`/healthz` 全依赖 ok，线上 `/news` 200。web PID `152788`，CMS PID `1401397` 未变；前版 `20260924T091109Z-5081bdc` 为有效回退目标，原 11 个 Release 全保留，现共 12 个。广州旧页规范地址 404、尾斜杠 301→404，sitemap/llms 已移除旧页；广州已跟踪 JPG/MP4 仍为 200，本地四份广州素材保持，未写真实 CMS/数据库。
- 验证：最终提交前独立完整 verify PASS（457 文件零诊断、493 单测、构建）；发布脚本完整 verify:release PASS（101 E2E、7 个既有跳过、4 formal、构建），格式检查及生产依赖审计通过。第一次发布在 SSH 前因测试写死 4399 而失败；改为读取 Playwright baseURL 后，首次排版又触发 221>220 行预算，压缩同一断言后复测通过，两次失败证据均保留，未弱化断言或预算。Luna 线上 1440/390 及 HTTP 检查 PASS，Sol 复核三张代表截图；1228 个非本任务日志保护路径无变化。GitHub CI Run `36284101342` 已 completed/success，最终 Nova Review APPROVED，Sol 已验收并关闭任务。
- 本次仅发布上述测试站应用；正式 `56xyy.com`、CMS/数据库、DNS/TLS/Nginx 和旧本地预览进程未改。既有混合治理文档、配置与未引用素材保留本地；发布证据 `output/release/xyy-20260927-03/`。以下本地验收和旧发布记录为历史，以本条最新版本为准。

- `XYY-20260927-01`（本地验收完成）：用户明确保留广州媒体和真实CMS内容，已执行其余确认项清理：原78个候选及19个专属派生样式/空分发组件共97文件删除（原文件6409行），14文件同步移除引用、死导出、旧样式与未使用依赖。`@astrojs/sitemap`及6个独占传递lock节点移除，存续依赖节点完全一致。源码入口扫描444/444可达、0入口不可达文件；共享ServiceVariant与两份完整config映射保持，不将文件入口扫描等同于全仓属性级死代码归零。
- 验证与边界：完整verify在最后4项死导出删除前通过（493单测及类型/lint/维护/资产/构建）；最终版457文件typecheck零诊断、相关38单测及局部格式/lint通过，Luna最终fresh build和独立回归PASS：18/18响应状态与正文/SEO/链接/媒体语义一致，9E2E通过/1既有跳过，Product390视频切换和保障区补测通过。Nova APPROVED；Sol复核111冻结路径、1252保护路径与5张代表截图后验收。广州4媒体、真实CMS、历史映射、seed和首页既有修改保留，不再有广州素材/CMS待确认项。仅本地，HEAD仍为5081bdc，未提交/推送/部署或写真实CMS/数据库；测试临时4509已停止，4322/4321未动。证据 `output/orphan-cleanup/xyy-20260927-01/`。验证限本地离线CMS回退与Chromium模拟视口；提交前需对届时最终代码重新运行完整verify。
- `XYY-20260926-04`（本地验收完成）：按用户要求删除广州鞋服云仓页及专属组件/样式，共删除6个文件，连同导航、SEO、本地seed及测试共33个应用/脚本/测试路径变更。旧规范URL返回404；尾斜杠保留既有全站301规范化后返回404，未修改全局request policy。离线服务seed为9条、FAQ为85条，仅移除广州1个服务对象和5条FAQ，其余对象/顺序保持。原审计78个候选（62个入口不可达、16个需技术联动）及1个未使用依赖仅分类，未删除；真实CMS、历史映射和4个广州媒体保留，归档/删除待用户决定。
- 本次验证：509文件类型检查零诊断、维护预算及局部格式/lint通过；Luna独立23项业务单测、8项定向E2E（2项既有跳过）、fresh build与1440/390页面回归通过。首次验收因“尾斜杠直接404”的过严AC报告FAIL，保留原证据；按既有全站规则修订AC并显式检查原始HTTP状态后，11项request-policy单测及1项core E2E复测通过（1项既有跳过）。Nova APPROVED；Sol复核33项冻结hash、1336项保护路径、78候选未改及代表截图后验收。完整分类与证据：`output/orphan-audit/xyy-20260926-04/`。仅本地生效，HEAD仍为`5081bdc`；未提交、推送、部署或操作真实CMS/数据库，未运行全量verify/release。浏览器限本地Chromium模拟视口；FAQ生成器既有华南/华东source-seed差异已记录，本轮未覆盖其审核内容。
- `XYY-20260926-02`（本地验收完成，含最新删除修订）：首页底部转化区保留米白背景、黑橙标题、橙色按钮与白色圆角卡片，补充咨询场景说明及三项具体沟通内容，收紧桌面中缝、增加右侧内容空间。按用户最新要求，已移除此区域“查看合作案例”和咨询热线，只保留“获取仓配方案”主按钮。该删除仅改 `HomeFAQ.astro`；Luna 本次 1440/390 确认两项文字与空 links 容器消失、主按钮/其他内容/FAQ 保留、无横溢及页面错误，Sol 复核截图、精确删除差异和 645 项保护路径后验收。首轮五视口结果保留为历史，本次未重复全量验证。预览 `http://localhost:4322/`；未提交、推送或部署，HEAD 仍为 `5081bdc`。最新证据 `output/home-conversion/xyy-20260926-02/remove-links/sol-acceptance.json`；验证限本地 headless Chromium，未运行全量套件或构建。
- `XYY-20260926-01`（本地启动）：执行 `npm run dev -- --host 127.0.0.1 --port 4322`，Astro 报告后台 PID `12955`，实际监听 `127.0.0.1:4322`。首页 `http://localhost:4322/` 与合作案例 `http://localhost:4322/cases` 均 GET HTTP 200，标题、main 和 H1 正常。保留原 4321 服务和既有脏文件；应用 HEAD 仍为 `5081bdc`。仅启动本地开发服务并更新状态记录，无业务代码、依赖、环境文件、提交或部署变更；本次只验证启动与 HTTP 可达，未重复应用测试。
- `XYY-20260924-01`（2026-09-24）：合作案例总览改版、重复 UR 重点区和指定 FAQ 的删除已发布到测试站，并普通推送 GitHub `main`。应用提交 `5081bdc372f550894c25d82115a2eb4f6bbcea32` 精确包含 21 个应用/测试路径；本地 HEAD、origin/main、GitHub main、干净发布候选与测试站 `/version` 同 SHA，21 路径冻结哈希一致。既有混合治理文档、配置和未引用素材保留本地。
- 测试站 `https://wz.tomatopia.top` 当前 Release `20260924T091109Z-5081bdc`，环境 `staging`。`/healthz` 的站点、CMS 内容与联系存储依赖均为 `ok`；web PID `3095904` 在线，CMS PID `1401397` 未变。上一版本 `20260924T040212Z-330969d` 为有效回退目标，原有十个 Release 全保留，现共十一个。
- 提交前 `npm run verify`、格式检查及生产依赖审计通过；原部署脚本完整 `npm run verify:release` 后退出 0：512 文件零诊断、493 单测、101 E2E（7 个原有配置跳过）、4 formal 与构建通过。线上 HTML/Schema 比对通过：六案例内容顺序不变，指定问答移除，其余七问内容和顺序不变。Luna 独立桌面/手机 QA PASS；同 SHA GitHub CI Run `35981006696` 全部成功，Nova 最终 Review APPROVED，Sol 已验收并关闭任务。
- GitHub 已接受普通推送；本地跟踪引用因沙箱只读限制更新失败，随后获准 `git fetch origin main` 已同步。仅发布既有测试站应用，未操作正式站、真实 CMS/数据库或 DNS/TLS/Nginx。证据：`output/cases-redesign/xyy-20260924-01/release/`。

### 上次发布记录（2026-09-24，已由上述版本接替）

- `XYY-20260923-01`：视频加载优化发布提交为 `330969d65af52c1333c30d496983c65dcc15a992`，Release `20260924T040212Z-330969d`。当时本地、GitHub 与验收站一致，8 个视频与 8 张封面哈希不变，Luna QA PASS、Nova APPROVED；CI Run `35954806696` 成功，任务已关闭。该记录仅代表上次发布，当前版本见上方。

### 上次发布记录（2026-09-23，已由上述版本接替）

- `XYY-20260921-08`（2026-09-23）：用户恢复后，当前本地改版已发布到验收站并非强推同步 GitHub `main`；应用提交为 `51d9c473268af11f7f4584042598cc72480d7e21`。本地 HEAD、origin/main、GitHub main 与验收站 `/version` 精确一致，243 项应用、素材与必要门禁修复已同步。GitHub CI Run `35831765381` 全部成功，Luna 发布后 QA PASS、Nova 最终 Review APPROVED，Sol 已验收并关闭任务。
- 验收站：`https://wz.tomatopia.top`；当前 Release `20260923T070817Z-51d9c47`，环境 `staging`，CMS Schema `2026-08-cms-hardening`。上一 Release `20260909T112839Z-63deee1` 保留为 `.previous_target`；原有 8 个目录全部保留，现共 9 个（含暂停时未启用的部分上传目录）。新 Release 根目录及静态目录均为 755。
- 本次实际部署脚本退出 0，完整 `npm run verify:release` 通过：507 文件类型检查零诊断、489 单测、91 E2E（7 个原有配置跳过）、4 formal 与构建；生产依赖审计 0。恢复脚本在 Luna PASS、Nova 预执行 APPROVED 后执行，校验复用原有媒体，再创建新目录原子切换。
- 发布后 Luna 独立 QA PASS：10 路由、20 个桌面/手机视口、154 项检查、0 页面错误；导航 7 入口、product 8 视频加 1 静态保障区、8 服务链接及其他 9 路由页脚 8 项均通过。16 个视频 Range 返回 206，16 个封面返回 200；静音自动循环、无控制条与无横向溢出通过。Sol 已复核代表性截图。验证限 headless Chromium，未覆盖真实设备与其他浏览器。
- `/healthz` 为 `status=ok`、`cmsContent=ok`、`contactStorage=ok`；首页、CMS ping、robots、sitemap、llms 与版本身份检查通过。`xyy-web` 在线，端口 `50031`、PID `2584771`；CMS PID `1401397` 前后保持不变。
- GitHub 已接受本次推送；54.35 MB 原始视频仅触发推荐大小提示，未阻止上传。推送后的本地跟踪引用被沙箱只读限制阻止，已通过获准的 `git fetch origin main` 同步成功。现仅保留既有未归属本轮应用的治理配置、历史日志、计划和未引用素材，不宣称整个工作区干净。
- 正式站、真实 CMS/数据库写入、联系表单提交及 DNS/TLS/Nginx 配置未操作；既有 CMS 内容保持，不将本地静态 seed 同步扩大为真实 CMS 写入。证据：`output/xyy-release-20260921-08/` 与 `output/playwright/xyy-release-20260921-08/`。
- 既有 CMS 治理记录：19 个集合严格 Verify、Active 身份与 claimKey 迁移、权限审计及第二次迁移 dry-run 已在历史任务通过；本轮仅健康检查，未重新执行这些迁移或数据库检查。
- 本地 CMS 既有记录为 Directus 12.0.2 + PostgreSQL 16；正式站文章发布曾返回 Oracle `ORA-12899`。正式库仍交运维，本轮未连接正式 Oracle 或修改 Schema，不能视为该正式故障已修复。

## 合作案例总览改版（2026-09-24，已发布并验收）

- 发布状态：应用提交 `5081bdc` 已上线既有测试站并推送 GitHub main，本地跟踪引用已同步；完整 verify/release 门禁与同 SHA CI 均通过，Luna 线上桌面/手机只读 QA PASS，Nova 最终 APPROVED，Sol 已验收。六案例采用真实 CMS 顺序（末项初语 TOYOUTH），目标 FAQ 在正文与 Schema 均移除；其余七题保持。发布证据位于 `output/cases-redesign/xyy-20260924-01/release/sol-final-acceptance.json`。
- 线上 1440×900 / 390×844 验证了六图加载、六个详情链接、3/1 列网格、唯一 UR、12+66 Logo、FAQ/锚点/CTA、零 console/pageerror 及无横向溢出；Sol 已复核加载完成并稳定回顶后的全页和首屏截图。只读验证限 headless Chromium 模拟视口，未覆盖真实设备与其他浏览器，未主动触发回滚。CI 安装阶段含开发依赖报告 14 项漏洞，独立生产依赖审计为 0；本任务未修改 package/lock，不将结果表述为全部依赖无漏洞。
- 下列为发布前分阶段实施与本地验收历史；其中“未提交/部署”与测试限制只对应当时阶段，当前发布状态以上方记录为准。

- 最新同 ID FAQ 修订：按用户要求移除“合作一般需要多长时间才能\"跑顺\"？上线后要多久看到效果？”。仅在案例页读取后过滤，页面与 FAQPage JSON-LD 同步为七题；其余问答内容/顺序保持，真实 CMS 和种子未改。单文件格式/lint/diff、Luna 独立 1440/390 FAQ/结构化数据/展开/无横溢 PASS，Nova APPROVED，Sol 实际 HTML 对比和截图/hash验收。当前证据：`output/cases-redesign/xyy-20260924-01/remove-faq/sol-acceptance.json`；未新增测试或重跑无关套件，未提交/部署或操作真实 CMS/数据库。
- `XYY-20260924-01`：完成深色仓库首屏、3/2/1 列完整案例网格、12 个常显加 66 个原生展开品牌 Logo；按用户最新反馈去除与列表重复的重点 UR 区，首屏直接衔接案例列表，UR 仅展示一次。保留价值说明、FAQ 与咨询入口，删除旧轨道展示脚本及样式。
- 应用改动涉及 `/cases` 总览组件、展示 helper、专属样式及单题 FAQ 展示过滤，另更新四份相关测试。案例详情、CMS/API/claims、案例内容顺序、全局导航、媒体及依赖均保持；成功空内容、缺指标、缺详情地址按约定渲染。
- 最新删除增量通过 Luna 独立 7 E2E、1440/768/390/360 四视口和 fresh build 390 无 JavaScript：六卡原顺序、UR 单详情链接、前三指标、锚点及 Logo/FAQ/CTA 保持，无横向溢出或导航遮挡。类型检查 512 文件零诊断、维护预算 726 文件及局部格式/lint/diff 通过。此前 24 项单测、CMS/卡片边界、78 张 Logo 和六个详情路由验证保留为历史，未因单纯删除展示区而重复；前轮 Featured 专属断言和历史 SSR 脚本不再作为当前页面验收依据。
- Nova 增量 APPROVED，Sol 复核最终桌面/手机截图、7 项增量冻结哈希及保护文件后验收；测试阶段额外改动的 `about-cases.spec.ts` 已精确恢复本轮基线。当前证据：`output/cases-redesign/xyy-20260924-01/remove-featured/sol-acceptance.json`，浏览器证据在 `output/playwright/xyy-20260924-01/remove-featured/`；前轮含 Featured 的验收保留为历史。
- 仅本地隔离预览，未提交、推送、部署或操作真实 CMS/数据库；既有用户修改保留。验证限 headless Chromium 模拟视口及离线 CMS fixture，未覆盖真实设备、Safari/Firefox 或真实 CMS。未运行全量 `npm run verify` / `verify:release`；后续提交或部署前仍须执行相应门禁。

## 仓配视频加载优化（2026-09-24，已发布并验收）

- `XYY-20260923-01` 按用户恢复要求继续，明确不压缩画质。应用提交 `330969d65af52c1333c30d496983c65dcc15a992` 仅包含视频组件、独立媒体加载脚本和三份相关E2E；8段视频与8张封面字节一致，数据、样式、导航等33项保护路径一致。
- 当前段优先播放，再准备下一段metadata；其他source延迟绑定并在离屏/后台时释放。已修复窄屏超高保障区无法跨固定可见比例门槛而残留第8段播放的问题。Luna独立14/14 E2E、360×640/844×390/1440×900/390×844实测及媒体哈希通过，首屏后六段零请求、静态区全部暂停并撤销source，console/pageerror为0；Sol已复核代表截图。
- 本次 `npm run verify` 已通过：509文件零诊断、722文件预算、67文件489项单测、资源和构建通过；格式检查通过，生产依赖审计0。Nova源码与预发布计划APPROVED。候选已非破坏性保留stash并快进至精确提交，工作区干净、5项实施hash一致。
- 原部署脚本退出 0，完整 `verify:release` 通过后部署到验收站，GitHub main 已非强推同步。首次尝试因隔离 helper 的 4411 端口与既有 4399 域名契约不符，在 SSH 前停止；仅恢复 helper 默认端口后重跑完整门禁通过，未修改应用、放宽断言或增加跳过。推送后本地跟踪引用受沙箱阻止，获准 `git fetch origin main` 后已同步。
- 发布后 Luna 独立 1440×900 / 390×844 QA PASS：初始仅两段 source、后六段零请求、当前视频可播放后才准备下一段、唯一静音循环播放、切到第二段、静态区全释放和返回首段恢复均通过，无页面错误和横向溢出。Sol 已复核线上截图；原结果的 `initialWaitMs` 是整条视口流程耗时，已补口径说明，不能称首帧等待或性能提升证据。验证限 headless Chromium 模拟视口，未覆盖真实设备和其他浏览器。
- 本地、GitHub、验收站版本与媒体哈希已核对一致；CI Run `35954806696` 对同一 SHA 全部成功，Nova 最终 Review APPROVED，Sol 已验收。既有配置、历史日志和未引用素材保留本地，未混入五文件提交。仅发布验收站 `wz.tomatopia.top` 与 GitHub main，未操作正式站、CMS/数据库或 DNS/TLS/Nginx；未主动触发回退。证据：`output/performance/xyy-20260923-01/sol-final-acceptance.json` 与 `output/playwright/xyy-20260923-01/`。

## 仓配视频页卡顿排查（2026-09-23，只读诊断历史）

- `XYY-20260923-01`：用户反馈验收站 `/product` 滚动与视频卡顿。确认8段视频全部绑定 source、autoplay、preload=auto，总计32.39 MiB，码率2.33–5.08 Mbps；浏览器虽只播放当前视频，离屏视频仍缓冲。Sol首屏停留约77秒后测得8条已完成视频资源传输约28.5 MB；切到第2段3秒样本为98帧中8帧丢弃，不能外推真实设备严重程度。
- 服务器短采样CPU3.76%、页面站内响应11.9ms；公网单次1MiB视频Range约4.55秒（整体1.84Mbps），仅代表该链路样本。优先方向是延迟绑定离屏视频source、只准备当前/下一段及同片网页压缩，保留视觉与可见视频静音自动循环；导航几何读取和blur尚无充分证据认定为根因。
- 当前只完成源码/素材、HTTP/进程与两组桌面浏览器观测；移动端、真实设备和完整性能trace/A-B未测。没有修改应用、媒体或服务器配置，也未提交、推送、部署、写CMS/数据库；线上仍为51d9c47，本问题尚未修复。证据：`output/performance/xyy-20260923-01/diagnosis.md`。完整应用测试不适用于本次只读诊断，未重复运行。

## 页脚仓配服务入口同步（2026-09-21，本地验收完成）

- `XYY-20260921-07`：页脚“仓配服务”列更新为鞋服云仓、退货质检、后整修复、跨境云仓、华南鞋服云仓、华东鞋服云仓、直播电商仓配、B2B门店仓配八项，按服务页顺序直达详情页。
- 应用仅修改 `src/data/brand/navigation.ts` 的页脚数组；主导航、页脚布局/其他列与product正文/SEO/媒体/链接保持，937项保护文件未变。局部格式/lint/diff PASS，独立浏览器21项通过，包含四视口完整显示、键盘/点击及八个目标HTTP200；已复核桌面与手机截图。
- 仅本地生效，证据 `output/playwright/xyy-20260921-07/sol-acceptance.json`。验证限本地 Chromium 模拟视口，未全量verify/build、提交、推送、部署或操作CMS/数据库。

## 全站导航入口常显（2026-09-21，本地验收完成）

- 同ID后续修复缩放突变：Header统一居中流式宽度，最大704px，移除768/1024硬切；Logo、字号、间距与顶部使用连续clamp，560px保留单双行内容重排。仅Header与专属CSS两文件追加改动，936项保护文件未变。Luna本次18宽度/46步双向缩放/78项检查PASS，Nova APPROVED，Sol截图/hash验收。当前最终证据为`output/playwright/xyy-20260921-06/fluid/sol-acceptance.json`，下述88项及3项E2E属于前轮记录，本次未重复；本轮仍限本地Chromium模拟视口，未提交或部署。

- `XYY-20260921-06`：按用户最新截图要求，全部七个主栏目直接可见；560px以上单行，手机更窄时两行，保留唯一Logo、玻璃背景、原href与活动态。移除折叠菜单/重复快捷入口及无引用脚本，手机链接14px、44px高，并调整顶部间距避免压住首屏文案。
- 仅修改Header、两个导航组件、新增专属CSS、删除旧菜单脚本，以及两份既有E2E导航断言。8路由导航之外的正文/meta/media/links/schema保持，932项保护文件未变。Terra局部格式/lint/diff通过；Luna最终12宽度88/88、定向E2E3/3通过，Nova APPROVED，Sol完成截图和6文件+1删除hash核对。
- 预览`http://localhost:4322/product`，证据`output/playwright/xyy-20260921-06/sol-acceptance.json`。旧折叠菜单方案证据不计入本次验收；手机首屏遮挡及媒体块修正已复测。仅本地Chromium模拟视口，文字200%不代表全页面缩放/WCAG；末次CSS顶距微调后复跑88检查、未重复已通过E2E。未运行全量verify/build、提交、推送、部署或操作CMS/数据库。

## 鞋服云仓履约流程展示（2026-09-21，本地验收完成）

- `XYY-20260921-05`：将鞋服页履约区三个阶段的视频替换为可切换的流程卡片，使用浅灰画板、编号、内联SVG图标、操作说明与阶段结果。桌面按3/2/2项满列，平板两列，手机单列紧凑排列；保留原标题、阶段名称、7条步骤原文和统一发货时效。
- 应用仅修改`FootwearFulfillment.astro`、`fulfillment-copy.css`并新增`FulfillmentIcon.astro`；同步既有`tests/e2e/footwear-page.spec.ts`的旧视频断言。原视频文件、首屏视频、标签脚本及其他区域/SEO/链接/指标保持，934项保护文件未变。
- Terra局部Prettier/ESLint/diff通过；Luna既有E2E 4/4、1440/768/390/360四视口交互/列数/ARIA/键盘、无JS、reduced-motion、旧媒体零请求、pageerror零与无溢出PASS。Sol截图复核发现桌面短文案卡片标题偏低，仅修一行网格行轨后，Luna四视口复测PASS；四项E2E已通过且未重复运行。Sol最终核对4文件hash、范围与其他区域语义比较通过。
- 本地预览`http://localhost:4322/xiefu-yuncang#footwear-fulfillment`，证据`output/playwright/xyy-20260921-05/sol-acceptance.json`。仅Chromium模拟视口，未运行全量verify/build；未提交、推送、部署或操作CMS/数据库。

## 仓配首段视频旧面积标注移除（2026-09-21，本地验收完成）

- `XYY-20260921-04`：按用户允许删除旧标注镜头的要求，首段视频保留源帧0–16与117–202，剪除含“50万㎡”及其进出动画的镜头；新片103帧、3.433333秒，854×480、30fps、无音轨。新封面取无标注的源帧0，原视频与封面保留。
- 新增带日期的视频与封面，仅更新`src/data/product/video-sections.ts`首段两个地址及资源测试对应路径。其余7段视频、8项服务与保障区、文案、布局、SEO、链接和54万㎡口径保持；936项保护文件未变。
- 资源测试24项、完整视频解码、格式与diff检查通过。Luna独立1440/390视口验证新资源、自动静音循环、播放推进、8视频/9区域及无溢出PASS；首轮在循环seek瞬间取样的测试竞态已修正，失败证据保留，应用未因测试调整。Sol复核截图、剪接帧和4项实现hash通过。
- 仅本地`http://localhost:4322/product`生效；证据`output/playwright/xyy-20260921-04/sol-acceptance.json`。验证限本地Chromium模拟视口，未运行全量verify/build，未提交、推送、部署或操作CMS/数据库。

## 库存与发货准确率更新（2026-09-21，本地验收完成）

- `XYY-20260921-03`：按用户最新确认，仅将库存准确率、发货准确率从99.99%改为100%，同步记录用户确认来源；仓配服务页移除库存准确率附加的“+”。未增加发货及时率，截单/发出时间、其他指标、布局及历史白皮书原文保持。
- 应用仅修改`src/lib/claims/fulfillment-performance.ts`与`src/data/product/care-assurance.ts`，另更新4个相关测试文件以引用统一指标并区分CSS技术百分比。9路由正文/meta/JSON-LD/媒体/链接对比、Luna独立1440/390两页四组合及Sol截图复核通过；6个文件hash一致，866项保护文件未变，Nova APPROVED。
- 定向claims 3项、footwear 2项及局部格式/lint/diff通过。原有全局字面量扫描的1个失败测试仍含8条旧测试违规，基线为11条；未新增技术百分比误报，未将该测试报告为通过。浏览器验证限本地Chromium模拟视口，未运行全量verify/build；未提交、推送、部署或写CMS/数据库。证据`output/playwright/xyy-20260921-03/sol-acceptance.json`。

## 鞋服页货品管理视觉替换（2026-09-21，本地验收完成）

- `XYY-20260921-02`：按用户要求将货品管理区中央生成图替换为HTML/CSS与内联SVG商品信息卡，展示服饰轮廓、颜色样本和尺码；明确为信息示意，未添加实际库存数据或指标。原标题、两侧动态说明与其他七区保持，原素材文件及其他位置引用未动。
- 仅修改`FootwearGoods.astro`并新增`FootwearGoodsVisual.astro`，无新脚本或位图。Luna独立四视口1440/768/390/360、390无JS、无旧图请求、无溢出/碰撞/裁字与可访问性检查PASS；Sol复核截图、最终两文件hash、1324项保护文件及正文/SEO/视频/链接对比，局部格式/lint/diff通过。
- 本地预览`http://localhost:4322/xiefu-yuncang`，证据`output/playwright/xyy-20260921-02/sol-acceptance.json`。验证限Chromium模拟视口，未运行全量测试/build/verify；未提交、推送、部署或操作CMS/数据库。

## 本地项目启动（2026-09-21）

- `XYY-20260921-01`：启动前4322端口无监听；执行 `npm run dev -- --host 127.0.0.1 --port 4322`，开发服务PID22572已监听`127.0.0.1:4322`。
- 首页`http://localhost:4322/`与仓配服务页`http://localhost:4322/product`本次HTTP检查均为200。仅启动本地开发服务并更新状态记录，未修改业务代码或生产环境；未运行应用测试，本次验证限进程监听与页面HTTP可达性。

## 全站底部转化区域统一（2026-09-17，本地验收完成）

- `XYY-20260917-05`：现有底部咨询区域统一为鞋服页的满宽浅灰背景、黑橙标题、橙色圆角按钮和白色编号资料卡。覆盖服务详情、首页、物流数字化、案例列表与详情、行业动态及白皮书列表；桌面两栏，小屏纵排并保留16px安全边距。各页原文、链接、费用条件与动态资料保留，参考鞋服区、正文、视频、页脚、联系表单和CMS/SEO逻辑未改。
- Luna独立PASS：16路由46组视口、12次FAQ交互、3条noJS路径、4项AstroContainer边界，键盘焦点和链接正常；Digital遗留类导致正文过浅已同ID修复并复测。Nova APPROVED；Sol完成视觉及16路由正文/SEO/Schema/FAQ/媒体/features/链接对比，13项任务源码冻结、1312项保护文件未变。局部格式、ESLint、diff与源代码Astro check335文件零诊断通过。
- 本地预览`http://localhost:4322`；证据`output/playwright/xyy-20260917-05/sol-acceptance.json`。验证限本地Chromium模拟视口与离线组件fixture；未新增持久测试或运行全量verify/build，未提交、推送、部署或操作CMS/数据库。

## 鞋服云仓合作准备排版（2026-09-17，本地验收完成）

- `XYY-20260917-04`：合作准备区域保留满宽浅灰背景，重排为左侧黑橙标题、限定行宽说明与咨询按钮，右侧白色圆角三项准备资料清单；补充品类/款式尺码、销售平台门店、日常与活动单量的准备提示。动态说明、费用条件和原三条链接保留，小屏纵排并保留16px安全边距。
- Luna独立四视口1440/768/390/360、原文/链接和键盘焦点验证通过；Sol完成截图复核、六文件冻结与1319项保护文件核对，其他七区DOM/几何、SEO/Schema、媒体与链接未变。局部格式/diff检查通过。
- 本地预览`http://localhost:4322/xiefu-yuncang`；证据`output/playwright/xyy-20260917-04/sol-acceptance.json`。验证限本地Chromium模拟视口，未新增持久测试或运行全量verify/build；未提交、推送、部署或操作CMS/数据库。

## 鞋服云仓三处展示微调（2026-09-17，本地验收完成）

- `XYY-20260917-03`：按用户截图移除首屏“150+合作品牌”；视频下方说明改为清晰的标题与步骤分组，桌面分列、手机纵排；合作准备浅灰背景铺满页面宽度，保留原文案、内容安全边距及上下留白。其他区域保持。
- Luna独立PASS：1440/768/390/360四端无横向溢出，三阶段共12次切换及视频静音自动循环正常。Sol复核最终截图与7文件源码冻结，1317项保护文件未变；五个其他区域DOM、SEO/Schema、媒体及链接与本次基线一致。局部格式/diff检查通过。
- 本地预览`http://localhost:4322/xiefu-yuncang`；证据`output/playwright/xyy-20260917-03/sol-acceptance.json`。仅本地静态DOM/CSS调整，验证限Chromium模拟视口；未新增持久测试或运行全量verify/build，未提交、推送、部署或操作CMS/数据库。

## 鞋服云仓八区改版（2026-09-17，本地验收完成）

- `XYY-20260917-02`：按01号方案完成层级首屏、中央商品、渠道与系统、三阶段作业视频、日常与旺季、退货入口、FAQ、合作咨询八区。采用白与浅灰背景、黑橙标题、圆角媒体和独立分区构图；保留原六项能力、四项指标、五条FAQ与四段静音自动循环视频。
- 已知旧稿仅在Footwear slug+presentation双门控下精确映射，正文与SEO/Schema同源；空、部分、自定义、近似和未知内容保留，六种不同已知能力齐全才启用标准业务区，重复条目不能替代缺项。公开数值沿用claims并保留峰值、时效、费用条件；CMS读取/回退与其他页面契约未改。
- Luna独立PASS：最终2项单测、14项页面边界、2项真实ServiceLanding离线门控、2项主页面内容/SEO E2E、2项共享矩阵；未变JS/CSS的6项交互/noJS/reduced-motion E2E与六断点1440/961/960/768/390/360结果沿用。平板tabs超宽与ARIA断点、正文门控及重复缺项问题均完成同ID返工和复测；Nova最终APPROVED。
- Sol验收1440/768/390视觉、20源文件冻结hash、22任务源/测试路径、1301项保护文件未变；十条其他路由正文/SEO/Schema/链接/媒体零差异。最后门控返工前后本页正文/canonical/meta/JSON-LD相同。源代码Astro check335文件零诊断；本次局部格式/ESLint/diff/预算通过。
- 本地预览`http://localhost:4322/xiefu-yuncang`；验收证据`output/playwright/xyy-20260917-02/sol-acceptance.json`。全局维护性仍有三项既有非Scope预算违例；未以本次source-only检查替代全项目typecheck。验证限Chromium模拟视口与离线CMS fixture；未运行build/fullverify、真机/其他浏览器，未提交、推送、部署或操作真实CMS/数据库。

## 鞋服云仓重新设计（2026-09-17，历史规划，已由02号实施）

- `XYY-20260917-01`：按本次`/plan`检查鞋服页，形成八区方案：层级首屏、中央商品展示、渠道与系统、视频作业导览、日常与旺季、退货处理、FAQ、合作准备与咨询。延续浅灰/黑橙/圆角视频，移除装饰横竖线、黑色关系图/数字大块，并拆解重复适配介绍。
- 原六能力、四指标、五FAQ及四段视频均有明确去向；计划清理已知旧稿的三级仓网角色及无claims依据的年份/降损数字，保留必要费用与交付条件。未来实施需Footwear双门控、正文/SEO同源及空/部分/自定义/未知内容契约，不改CMS读取或其他页面。
- 方案：`docs/plans/2026-09-17-xiefu-yuncang-redesign.md`。01号仅文档及状态记录；桌面1440与手机390现页已观察，规划格式/diff检查通过，1318项应用/测试/媒体hash未变。证据：`output/playwright/xyy-20260917-01/planning-check.json`。01号当时未实施或运行应用测试；后续实施已由02号完成本地验收，未提交、推送、部署或操作CMS/数据库。

## B2B 门店仓配七区改版（2026-09-16，本地验收完成）

- `XYY-20260916-05`：按04号方案完成左视频右文案首屏、货品/外箱/随箱明细、补货与运输、库存与系统、合作准备及费用、FAQ、咨询七区。保留六项服务、四项指标、五个FAQ与原静音自动循环视频；浅灰圆角、黑橙层级及不同区域的独立构图已落地。
- B2B slug+presentation双门控精确映射已知文案，空、自定义、近似、未知内容保持，补充描述只展示一次，正文/SEO/FAQ Schema同源；公开数字沿用claims并保留指标真实含义及费用适用条件。共享布局原指标元组与slot/CSS行为保持，CMS读取及回退契约未改。
- Luna PASS：4项单测、7项AstroContainer、6项B2B E2E、2项共享路由矩阵；应用源码typecheck331文件零诊断。Nova APPROVED，Sol验收1440/768/390px、21项最终hash、20条可归属路径与1299项保护文件；十条非B2B路由正文/SEO/Schema/链接/媒体零差异。
- 本地预览`http://localhost:4322/b2b-mendian-cangpei`；证据：`output/playwright/xyy-20260916-05/sol-acceptance.json`。全项目typecheck仍有既有`tests/e2e/service-redesign-live.spec.ts:52`隐式any错误，该文件未改。验证限本地headless Chromium与离线CMS fixture；未运行build/fullverify、真实设备测试，未提交、推送、部署或操作真实CMS/数据库。

## B2B 门店仓配重新设计（2026-09-16，历史规划，已由05号实施）

- `XYY-20260916-04`：检查当前B2B源码及1440/390px页面后，形成以门店收货为主线的七区方案：左视频右文案、货品/外箱/明细、补货场景与运输、库存与系统、合作准备及费用、FAQ、咨询。延续浅灰圆角和黑橙层级，减少装饰横竖线，取消三组重复示例门店及无业务作用的高亮。
- 方案明确六项服务、四项指标、五个FAQ和旧补充内容去向；公开数字沿用claims，保留必要费用/交付条件，不再突出内部统计提示与无claims依据的旧量级/天数示例。未来需保持B2B双门控、成功空/自定义/近似/未知内容及SEO同源契约。
- 文档：`docs/plans/2026-09-16-b2b-mendian-cangpei-redesign.md`。本轮仅规划及状态记录，文档格式/diff检查通过，1314项应用/测试/媒体hash未变；未修改页面、运行应用测试、操作CMS/数据库、提交、推送或部署。规划证据：`output/playwright/xyy-20260916-04/planning-check.json`。

## 直播电商仓配七区改版（2026-09-16，本地验收完成）

- `XYY-20260916-03`：按已批准方案完成浅灰双栏首屏、三阶段切换、库存错落信息、退货处理、多品牌管理、FAQ、咨询七区；沿用白/浅灰/黑/橙与圆角实拍视频，通过留白和背景分组。六项服务、四项指标、五个FAQ均有明确位置，公开指标保留真实含义和适用条件，视频保持1280×720、静音自动循环。
- Live slug+presentation双门控下精确映射已知旧文案；空、自定义、近似内容与原输入保持，正文/SEO/FAQ Schema同源。contentDesc-only/FAQ-only、全空和未知内容边界完成修复与验证；768px首屏及库存外层纵排，多品牌标题说明分行。阶段支持点击、方向键、Home/End、Enter/Space、180ms淡入；无JS全文可读，减少动态效果时不播放切换动画。
- Luna PASS：4项单测、4项AstroContainer、两端4项Live E2E；修正768px测试探针后相关2项定向复跑通过。最终typecheck497文件零诊断，局部格式/lint/预算/diff通过。Nova APPROVED，Sol完成三屏视觉、实际视频播放、17项应用/测试hash与1297项保护文件核对；十条非Live路由正文/SEO/Schema/links/media零差异。
- 本地开发服务在新增模块缓存导致SSR500后已重启恢复HTTP200，当前预览 `http://localhost:4322/zhibo-cangpei`。仅本地更新；验证限headless Chromium模拟视口与离线CMS fixture，未核实既有服务的真实CMS状态。未运行build/fullverify、真实设备、提交、推送、部署或真实CMS/数据库操作。证据：`output/playwright/xyy-20260916-03/sol-acceptance.json`。

## 直播电商仓配重新设计（2026-09-16，历史规划，已由03号实施）

- `XYY-20260916-02`：已检查当前Live页与相关源文件，形成七区方案：浅灰双栏首屏、三阶段胶囊切换、库存同步、退货处理、多品牌管理、FAQ、咨询。移除重复长段与装饰分割线，延续圆角视频/黑色标题/橙色按钮；六项服务、四项指标、五条FAQ均明确去向，峰值、库存准确率与退货时效保留实际含义和条件。
- 方案：`docs/plans/2026-09-16-zhibo-cangpei-redesign.md`。当时文档格式与差异检查通过，753项src/tests文件hash未变；只读观察桌面及390px页面，未实施应用、运行应用测试、修改媒体、写CMS或部署。后续03号实施已完成独立测试及Review。

## 本地项目启动（2026-09-16）

- `XYY-20260916-01`：启动前4322端口无监听；执行 `npm run dev -- --host 127.0.0.1 --port 4322`，开发服务报告PID12394，首页 `http://localhost:4322/` 实测HTTP200。
- 仅恢复本地开发服务，保留既有工作区修改；未修改应用代码或生产环境。

## 华东鞋服云仓七区改版（2026-09-15，本地验收完成）

- `XYY-20260915-13`：按已批准的12号方案完成七区：标题配宽幅视频、三仓地址、错落业务区、多仓库存说明、发货与费用、FAQ、居中咨询。白/浅灰/橙配色，通过背景和留白分组，East装饰边线为0；视频保留原素材与静音自动循环，16:9、32px/24px圆角。上海青浦仓、昆山花桥仓、合肥联亚仓（合肥仓）的完整名称地址使用用户资料，平级展示，各仓具备质检能力。
- 已知旧CMS对外文案在East双门控下精确映射，空/自定义/近似和原输入保持；六服务、四指标、五FAQ保留对应位置，正文/SEO/Schema同文。初轮typecheck发现contentDesc漏传，已同ID修复并覆盖contentDesc-only及空FAQ边界。未改CMS读取/失败契约或其他详情页。
- Luna独立4单测、3项AstroContainer、4项East E2E、2项共享矩阵通过；Astro check491文件零诊断，局部格式/lint/预算/diff通过。Nova APPROVED，Sol验收1440/768/390画面和范围；20源/测试文件hash匹配、1288保护文件未变，十条非East路由正文/SEO/links/media零差异。
- 仅本地4322更新；未提交、推送、部署或写真实CMS/数据库。验证限headless Chromium模拟视口、离线CMS边界和reduced-motion静态审阅；未运行build/fullverify或真实设备。证据：`output/playwright/xyy-20260915-13/sol-acceptance.json`。

## 华东鞋服云仓重新设计（2026-09-15，历史规划，已由13号实施）

- `XYY-20260915-12`：已检查当前华东源代码与 1440/390px 实际页面；规划调整为标题配宽幅视频、上海/昆山/合肥三个平级仓库、错落业务区、多仓库存、发货与费用、FAQ、咨询七区。使用背景块和留白分组，移除装饰性横竖线及内部节点/核验措辞；完整加入青浦仓、花桥仓、联亚仓（合肥仓）名称与用户提供的地址，各仓质检能力统一表达。
- 方案明确六项服务、四项指标、五个 FAQ 的去向及响应式设计；保留时效/费用的真实适用条件，区分仓库与配送范围，不编造仓库主次或功能分工。后续实施需保持成功空/自定义 CMS 内容契约，以及正文与 SEO 信息一致，范围仅限华东。
- 仅新增设计文档 `docs/plans/2026-09-15-huadong-xiefu-yuncang-redesign.md` 并同步工作记录；文档格式、差异与地址检查通过，1300 项应用/测试/媒体文件哈希未变。未实施页面、运行应用测试、提交、推送、部署或操作真实 CMS/数据库。规划证据：`output/playwright/xyy-20260915-12/planning-acceptance.json`。

## 华南仓库标题与对外文案（2026-09-15，本地验收完成）

- `XYY-20260915-11`：华南仓库分布H2与业务主标题统一字号和900字重，桌面64.8px、手机35.1px。将专属退货质检中心纠正为各仓均具备质检能力，修复仍按商品实际情况安排；仓库介绍、业务/资源说明、配送、FAQ及咨询改为客户文案，配送条件与历史峰值范围保留。首屏、视频、四城市九仓地址、现有指标与卡片布局保持。
- 成功CMS的已知旧全文在本地展示层精确映射，空/自定义/近似内容与原输入不变；只作用于South slug+presentation，FAQ正文与FAQ Schema、meta与Service Schema同步。未改CMS读取/失败策略或实际CMS。共11项源/测试文件；共享布局Props复用已有等价内容类型，保留4项stats元组，177行符合预算。
- 局部格式/ESLint/diff通过，Luna独立6单测、12项两端South E2E通过，H2探针直接测量两元素后定向复测2/2通过；1440×900与390×844无横溢出/地址遮挡，静音自动循环视频正常。Luna PASS、Nova APPROVED，Sol已复核最终两端截图、11项后测hash与1289项保护文件并验收。10条非South路由正文/SEO/links保持，South hero/videoHTML一致；两classic媒体原始HTML含GSAP时变样式，媒体URL与源码未变。
- 仅本地4322更新，未提交、推送、部署或操作真实CMS/数据库；验证限Chromium模拟视口及函数级CMS边界，未运行全站/build/fullverify。证据：`output/playwright/xyy-20260915-11/sol-acceptance.json`。

## 华南首屏简介浓缩（2026-09-15，本地验收完成）

- `XYY-20260915-10`：首屏保留“华南区域库存与鞋服仓配协同”小标题，正文浓缩为“广州、东莞、佛山、肇庆多仓布局，支持 B2C、B2B、全渠道库存协同、退货质检及区域配送。”，增加3px浅灰短竖线。正文15px/400、1.8行高，桌面和手机自然两行；下方原规模、时效、项目条件、仓库/业务/FAQ保持。
- 成功CMS仍提供旧长句，因此在本地展示层新增精确旧句映射，并更新路由fallback；新短句、空、自定义或近似字符串原样保留，不修改原content、CMS查询/失败策略或实际CMS。说明wrapper在两个字段都空时不显示竖线，全空不可用分支保持。共修改路由、SouthNetworkPage、south-content、south-layout与既有South单测五文件。
- 局部Prettier/ESLint/diff通过，Luna单测5/5、定向E2E2/2（25.1s）、1440×900与390×844视觉及5项freeze hash PASS；Nova APPROVED，Sol复核最终增量/截图完成本地验收。1294项保护文件未变，正文/首屏HTML仅指定短句+wrapper变化，metadata/links/videoHTML与四非首屏区域HTML/styles零意外差异。
- 仅本地4322预览更新，未写真实CMS/数据库、提交、推送或部署；验证限本地Chromium模拟视口和映射边界，未运行全E2E/build/fullverify。验收：`output/playwright/xyy-20260915-10/sol-acceptance.json`。

## 华南首屏说明文字减重（2026-09-15，本地验收完成）

- `XYY-20260915-09`：说明小标题减为15px/600/#484C4A，正文15px/400/#626660、1.92行高与8.8px上距，保持完整文案。仅 `src/styles/service-redesign/south-layout.css` 局部规则修改；大标题、四城市胶囊、背景、视频及其余区域保持。
- 局部Prettier/diff、独立1440×900及390×844浏览器视觉/样式检查通过，说明无重叠或横溢出；1298项保护文件未变，页面正文/首屏HTML/SEO/链接/视频HTML及四个非首屏区域HTML/样式零差异。已复核截图和最终增量并完成本地验收。
- 仅可逆说明排版调整，无行为变更，未新增测试或运行E2E/build/fullverify/单测。验证限本地Chromium模拟视口；未提交、推送、部署或操作真实CMS/数据库。证据：`output/playwright/xyy-20260915-09/sol-acceptance.json`。

## 华南首屏背景、层级与圆角（2026-09-15，本地验收完成）

- `XYY-20260915-08`：首屏使用#F8F8F6背景；视频维持16:9并增加桌面32px/手机24px圆角；“华南鞋服云仓”字号为橙色主张的0.66倍；四城市改为#EDEDE8底色的小胶囊。仅 `src/styles/service-redesign/south-layout.css` 修改，103行，文案、DOM、媒体及其他区域保持。
- 局部格式/diff检查通过；独立定向South E2E两端2/2（16.3s），1440×900与390×844无标题/胶囊重叠或横溢出，视频静音自动循环、无控制条且实际播放时间推进。1298项保护文件未变，正文、首屏HTML、SEO、链接、视频HTML和四个非首屏区域HTML/样式对比零差异，最终两端截图已验收。
- 仅本地预览更新，验证限Chromium模拟视口；未运行完整E2E、build/fullverify、提交、推送、部署或操作真实CMS/数据库。证据索引：`output/playwright/xyy-20260915-08/sol-acceptance.json`。

## 华南业务入口无分隔线排版（2026-09-15，本地验收完成）

- `XYY-20260915-07`：“货源、履约与退货，各有入口”改为橙色大编号与三列开放业务分组；内部资源确认区改为暖灰面板，桌面左标题右侧2×2信息，手机单列。移除区域内横竖分隔线，保留原文案及DOM。
- 仅 `src/styles/service-redesign/south-content.css` 修改，194行。格式/diff检查通过；独立South E2E 10/10（28.9s），1440×900及390×844无文字覆盖或横溢出。1298项保护文件未变，正文、业务HTML、链接、元数据、视频与四个非业务区域的HTML/样式比较零差异；仓库四城九仓保持。
- 已完成LOW本地验收；仅本地预览更新，验证限Chromium模拟视口，未运行build/fullverify、提交、推送、部署或操作真实CMS/数据库。证据索引：`output/playwright/xyy-20260915-07/sol-acceptance.json`。

## 华南仓库分布无分隔线排版（2026-09-15，本地验收完成）

- `XYY-20260915-06`：华南仓库分布改为广州、东莞、佛山、肇庆四个暖灰城市卡片；桌面两列、手机单列，用字号与留白区分仓名、地址和说明，移除横竖分隔线。9条仓库资料、DOM及其他区域保持原样。
- 应用修改仅 `src/styles/service-redesign/south-nodes.css` 与既有 `tests/e2e/service-redesign-south.spec.ts` 视觉断言。独立South E2E 10/10通过，1440×900与390×844显示无横向溢出或地址遮挡；1297项保护文件未变，正文、链接、元数据、视频及非仓库区域尺寸/样式与任务前零差异。最终两端截图与diff已验收，LOW静态改动按Terra → Luna → Sol流程完成。
- 仅本地文件与 `http://localhost:4322/huanan-xiefu-yuncang` 预览更新；验证限Chromium模拟视口，未运行build/full verify、提交、推送、部署或操作真实CMS/数据库。验收记录：`output/playwright/xyy-20260915-06/sol-acceptance.json`。

## 华南仓库分布保留与其余区域还原（2026-09-15，本地验收完成）

- `XYY-20260915-05`：用户在六区改版实施中要求撤回，只保留当前“华南仓库分布”。首屏、业务与资源说明、时效、FAQ/咨询已恢复05任务开始前的布局；保留四城市分组及9条仓库名称/地址，新塘仓和云谷仓仍为“暂不公布”。保留已确认的仓库称呼纠正，移除旧城市切换脚本。04六区方案已标记为历史方案，不再继续实施。
- Terra已冻结最终源码，Luna独立验证PASS：South E2E 10/10、单测4/4、实际AstroContainer空/部分内容2/2通过；1440×900和390×844仓库区各68元素与相同加载方式的保留快照0差异，9条地址、无JS、FAQ/咨询和静音视频播放正常。Sol核对4项组件/样式与任务前副本逐字一致（主页面仅有仓库用词与去除切换脚本两项差异），保留的仓库组件与撤回时版本一致。15项冻结hash与1286项保护文件无变化，9路由语义对比无差异。Nova APPROVED，Sol已复核最终diff与两端截图并完成本地验收。
- 仅本地文件和 `http://localhost:4322/huanan-xiefu-yuncang` 预览变化；验证限Chromium模拟视口及离线CMS fixture，未运行build/full verify、提交、推送、部署或操作真实CMS/数据库。验收记录为 `output/playwright/xyy-20260915-05/sol-acceptance.json`，细节在 `keep-warehouses/` 及同任务各角色目录。

## 华南鞋服云仓页重新设计（2026-09-15，历史规划）

- 下述为04规划阶段记录；05后续实施中用户仅保留仓库分布，当前状态以上方05记录为准。

- 用户提供12条仓库名称与地址，已记录到 `docs/plans/2026-09-15-warehouse-addresses.md`：华南9条（广州3、东莞4、佛山1、肇庆1），其余昆山/上海/合肥3条另存。04方案仓库区改为城市分组及开放仓名/地址清单；新塘、云谷的地址保留“暂不公布”。本轮仍是规划资料更新，未写应用、其他页面、CMS或数据库。
- 用户补充纠正四地就是仓库，没有主节点或制造/区域/平台协同分工；04方案已修订为四地同层级仓库展示与仓内作业流程，旧角色标签及对应分工不再进入新版。此纠正优先于下述旧文案保留原则；本轮仍仅修改方案与记录，应用页面尚未改动。
- `XYY-20260915-04`：按用户 /plan 要求，完成当前South页面的源码及桌面/手机分析，形成六区方案：完整标题与大视频、四地开放比较、库存履约关系、发出与到达说明、方案准备、FAQ与咨询。沿用白底黑字橙色，分别设计区域构图和移动端阅读顺序。
- 方案文件为 `docs/plans/2026-09-15-huanan-xiefu-yuncang-redesign.md`，保留原6项服务、5FAQ、4stats、4项资源说明、视频和SEO的映射，明确未来空/部分CMS、无JS与响应式验收要求。
- 新方案Prettier和本任务文档diff检查通过，1300项应用文件hash一致且无新增应用文件；实际当前页面1440×900、390×844无整页横向溢出。证据在 `output/playwright/xyy-20260915-04/`。本轮仅规划，页面尚未改版，无应用行为变更因此未运行应用测试；未提交、推送、部署或操作真实CMS/数据库。

## 后整修复页六区域重设计（2026-09-15，本地验收完成）

- `XYY-20260915-03`：按02批准方案完成 `/houzheng-xiufu` 六区重设计：服务名与宽幅原视频、开放六类服务、三工位与九专区、四步及两种复检结果、统计口径、FAQ与咨询。改动限18项Repair专属组件/样式/交互及直接相关测试；原媒体/业务内容/SEO和其他页面保持，Luna PASS、Nova APPROVED、Sol已本地验收。
- 局部格式/ESLint/typecheck485文件零诊断及相关单测通过；Luna独立Repair E2E Chromium/mobile 6/6、容器边界2/2、service motion2/2和服务主矩阵通过。FAQ孤字、360px图注位移、无JS控件语义三个问题已最小返工并闭环。四视口工位几何差均0，真实禁JS/模块阻断下三原生figure可读、控件隐藏且不可聚焦；正常JS切换、键盘及ARIA有效。19冻结/1280保护hash、Sol内容与SEO审计均通过。
- 证据在 `output/playwright/xyy-20260915-03/sol-acceptance.json` 及Luna/Nova报告；预览 `http://localhost:4322/houzheng-xiufu`。全库维护性仍有3项范围外既有超限；共享service-pages的news空CMS断言与当前5篇文章不符而失败，未更改新闻/CMS，不称全库测试全绿。仅本地Chromium与模拟视口，partial CMS由离线fixture验证；未运行build/fullverify、提交、推送、部署或CMS/数据库写入。

## 后整修复页重新设计方案（2026-09-15，规划完成）

- `XYY-20260915-02`：按用户 `/plan` 要求重新规划 `/houzheng-xiufu`，形成服务大标题与宽幅视频、六类开放服务、工位图切换及九专区、连续修复复检流程、数据口径、FAQ与咨询收尾六区。已明确两端布局、原内容映射、交互和实现验收条件，方案为 `docs/plans/2026-09-15-houzheng-xiufu-redesign.md`。
- 规划时桌面1440×900、手机390×844页面已实际查看；1293项源码/媒体/测试哈希无变化，新方案格式与文档diff检查通过。02任务仅规划，当时未修改页面；后续用户确认后进入上方03实施任务，当前应用状态以上方记录为准。没有提交、推送、部署或CMS/数据库操作。规划证据：`output/playwright/xyy-20260915-02/`。

## 本地项目启动（2026-09-15）

- `XYY-20260915-01`：按用户要求启动`npm run dev -- --host 127.0.0.1 --port 4322`，启动器报告后台PID7777。本地入口`http://localhost:4322/`，仓配页`http://localhost:4322/product`；实际GET两页均HTTP200，title和main正文正确。
- 仅启动本地服务并同步运行记录，未改应用源码/配置/依赖，未提交、推送、部署或操作CMS/数据库。证据：`output/local-start/xyy-20260915-01/`。

## 七详情页独立设计实施（2026-09-14，本地验收完成）

- `XYY-20260913-13`：已获用户确认，按质检→修复→跨境→华南→华东→直播→B2B逐页重做结构，保留共同视觉风格及最新首屏视频。范围不含已完成的鞋服页、两个classic详情和/product。
- 阶段A退货质检已完成并本地验收：检验记录、四级处置、专项检查与证据说明独立布局，6项feature/5FAQ/4stats和SEO保留。首轮两项partial引用缺陷已修复；Luna复测4 E2E+4组件测试、两端检查通过，Nova APPROVED，17冻结和1197保护hash一致。阶段B后整修复已验收：视频左/三段标题右、异常目录、三种工艺图文、九专区与独立复检；FAQ标题死选择器已修复，Luna定向4项复测通过、Nova最终APPROVED。C跨境云仓已验收：17项增量，typecheck450文件零诊断；首轮H1空白测试断言已修正，Luna最终13项通过、Nova APPROVED。D华南选仓已验收：18项增量，原内容/SEO/视频保留；Luna9项相关测试通过，手机运输双列修为单列后定向复测PASS，Nova APPROVED，最终hash一致。E华东库存布局已验收：17项增量，typecheck466文件零诊断，Luna9项相关测试与边界通过；手机目录展开符号间距修正后定向复测PASS，Nova APPROVED，最终hash一致。F直播场次叙事已验收：17项增量，typecheck473文件零诊断，Luna11项独立测试和四视口检查PASS，Nova APPROVED，最终hash一致。G门店分货已验收：19项增量，typecheck482文件零诊断，Luna实际13项测试与四视口检查PASS，Nova APPROVED；初次无文件的PASS未采信，重新独立验证的原始证据已齐全。
- 七页整体验收通过：96项最终源码/测试hash与1197项保护hash无差异；42项原feature完整正文各一次、35FAQ及原描述、SEO、链接全部保持；11路由最新正文与metadata/canonical/JSON-LD无差异。仅本地源码和预览变化，未提交、推送、部署或写入真实CMS/数据库。验证限本地Chromium桌面/手机视口模拟与离线CMS fixture；没有范围内剩余阻断。证据：`output/playwright/xyy-20260913-13/sol-final-acceptance.json`及各阶段报告。

## 七详情页独立设计方案（2026-09-13，规划完成）

- `XYY-20260913-12`：按用户/plan要求，完成退货质检、后整修复、跨境、华南、华东、直播、B2B七页的逐页内容分析与独立布局规划。方案在 `docs/plans/2026-09-13-seven-service-redesign.md`，包含七种核心构图、旧内容合并去向、首屏/手机设计、交互和验收标准；保留白底黑字橙色风格及最新Hero视频。
- 已对照源码和7页1440×900实际内容/整页截图，1207个源码/媒体/测试文件哈希零变化，文档格式与diff通过。本轮只完成规划，没有修改页面或进行新版实现验收；鞋服已完成设计、其余classic页和/product保持。后续七页已按上述顺序在XYY-20260913-13完成实施与本地验收；当前应用状态以上方实施结果为准，此处保留规划阶段历史。

## 十详情首屏整洁工衣镜头重选（2026-09-13，本地验收完成）

- `XYY-20260913-11`：按最新要求，全部10个服务详情Hero换成干净整齐、带新亦源黑橙工衣/品牌标识的新镜头，包括鞋服、退货质检、后整修复、跨境、华南、华东、直播、B2B、广州及云道。新增 `public/videos/service-detail-heroes-clean-20260913/` 十MP4十JPG；现有源码仅 `service-hero-media.ts` 目录、`FootwearPage.astro` Hero视频/封面及对应E2E路径字面量共4处更换。文案、布局、CMS/SEO、/product八片和鞋服下方三阶段媒体保持。
- 从指定单反目录抽样108个候选，新片各4–12秒、1280×720/30fps、H264/yuv420p、HLG转SDR、faststart、无音轨，继续默认静音循环无控制条；视频共19.68MiB。华南/华东中途红马甲遮挡经二次精剪去除，最终分别6.4秒/6.2秒；封面同步更新，旧素材和原片保留。最终72个逐秒帧与/product的78个参考帧对照未见相同镜头。
- Terra局部格式/ESLint/diff检查通过；Luna独立PASS：20媒体HTTP200、10片完整解码/规格检查、10路由桌面1440×900和手机390×844共20次实际播放/映射/无溢出或导航遮挡检查通过，含两片精剪后4视口定向复测。限定共享服务页E2E为2 passed、0 failed、0 skipped；10来源原片、1184保护和23最终冻结hash零差异。11路由正文/链接/metadata/Schema与上次验收HTML零差异，Sol完成增量、最终时间线与代表截图复核后验收。
- 证据在 `output/playwright/xyy-20260913-11/`，最终文件为 `selected-media-plan.json`、`encoding-results.json`、`luna-result.json` 与 `sol-media-review.json`；预览 `http://localhost:4322/b2b-mendian-cangpei`。仅本地Chromium视口模拟，镜头不重复为抽样对照结论；未覆盖真实设备、构建或部署环境，未运行build/fullverify/typecheck或提交、推送、部署、写真实CMS/数据库。此处为当前Hero媒体状态，下方09/10记录保留其历史验收事实。

## 其余九详情首屏独立实拍视频（2026-09-13，本地验收完成）

- `XYY-20260913-10`：其余9个服务详情首屏改用指定单反目录的新视频与对应封面，覆盖退货质检、后整修复、跨境、华南、华东、直播、B2B、广州鞋服云仓与云道智能寄件。新增独立 `src/data/service-hero-media.ts` 映射及 `public/videos/service-detail-heroes-20260913/` 九MP4九JPG；七个editorial页保留左右分栏，两个classic页保留原背景构图与渐变，仅图片转视频。
- 九片各8–12秒，1280×720、30fps、H264/yuv420p、无音轨、faststart，合计22.61MiB；继续自动静音循环且无播放控制条。内容分别对应质检、整烫、装车、仓内总览、挂装存储、扫码播种、封箱与打单；完成基础亮度校正及一片HLG转SDR，原素材不变。鞋服云仓四片、仓配页八片、各页正文/按钮链接/CMS与SEO未改。
- 局部格式/ESLint、typecheck421文件零诊断及diff检查通过；Luna独立PASS：18资源HTTP200、9片完整解码及规格/封面正确、9路由两端共18次实际播放/映射/无遮挡无溢出通过，9原片/1164保护/23冻结hash零差异。相关E2E实际3 passed、0 failed、1 configured skip；11路由正文/链接/metadata/Schema零差异。Nova APPROVED，已复核原片记录、88新帧对78旧帧、源码增量及两端截图后验收。
- 证据位于 `output/playwright/xyy-20260913-10/`，包括裁切/转码记录、独立媒体与浏览器结果、18张截图和Review；预览 `http://localhost:4322/houzheng-xiufu`。仅本地Chromium与移动视口模拟，镜头不重复经过来源/hash与逐秒抽样对比，未逐帧穷举全部历史素材。未运行build/fullverify、提交、推送、部署或写真实CMS/数据库；本次只更换首屏媒体，未扩大为其余详情布局重构。

## 鞋服详情独立实拍视频（2026-09-13，本地验收完成）

- `XYY-20260913-09`：按用户指定的 `/media/yj/TOSHIBA/2~单反拍摄` 选择当前鞋服详情的四段视频，替换此前复用的服务页片段。Hero使用2026年分拣线航拍，三个履约阶段使用2022年素材中的检收搬运、货架拣货和装袋打包；新增 `public/videos/footwear-detail-20260913/` 四MP4与对应JPG，仅修改三个鞋服组件的媒体引用及固有尺寸。
- 四段分别12/8/9.8/12秒，均1280×720、30fps、H264/yuv420p、无音轨、faststart，总视频约13.53MiB。基础亮度/对比校正与时间区间记录在任务证据中，原片保持不变。视频继续静音自动循环；页面文案、布局、切换功能与SEO保持，服务页八视频及其余七详情未改。
- 局部格式/ESLint/diff检查通过，Luna独立PASS：八媒体资源HTTP200、四视频完整解码成功，桌面1440×900和手机390×844的四片实际播放、阶段/封面映射、键盘与无横溢出通过；5来源原片和1157保护hash零变化，与服务页无资源复用。已复核46候选抽样、新旧逐秒画面、源码增量及两端截图后验收。
- 证据位于 `output/playwright/xyy-20260913-09/`，包括来源/裁切计划、编码记录、独立验证与截图；预览 `http://localhost:4322/xiefu-yuncang` 已刷新。后续详情逐页改版同样从该实拍目录选片并避开服务页素材。仅本地浏览器及移动视口模拟，未重复08 E2E/单测/typecheck或运行build/fullverify；未提交、推送、部署或写真实CMS/数据库。

## 鞋服云仓七区独立重设计（2026-09-13，本地验收完成）

- `XYY-20260913-08`：用户批准逐页设计后，先完成 `/xiefu-yuncang` 的独立七区：短文案与右侧视频、透明货品款色码图、全渠道库存流转图、可切换的三阶段履约、非对称保障指标、业务适配、FAQ及咨询收尾。保持白底、黑色大标题和橙色按钮；其余七详情未启用本次鞋服布局。
- 新增鞋服组件、局部样式、阶段切换脚本及相关测试；ServiceLanding增加显式footwear分支，鞋服路由只改展示参数。原CMS读取与SEO路径保持，六项能力正文各显示一次，四指标和五FAQ保留；全空CMS只显示不可用状态，无JS仍可阅读三个阶段并展开FAQ。手机渠道图以并行来源组→库存→出库方式组表达。
- 局部格式/ESLint、typecheck420文件零诊断及diff检查通过；Luna独立E2E为9 passed、0 failed、1 configured skip（58.4s），3单测文件8项通过。1440/1024/390/360视口、视频静音自动循环、切换/键盘/FAQ/锚点、reduced-motion与实际noJS验证PASS。1140保护hash、11路由内容比对均零差异；Nova APPROVED，已查看最终两端截图并验收。
- 证据在 `output/playwright/xyy-20260913-08/`，包含20文件增量、冻结hash、原始测试输出和桌面/手机截图。预览 `http://localhost:4322/xiefu-yuncang`。仅本地Chromium及移动视口模拟；未运行build/fullverify、提交、推送、部署或写真实CMS/数据库。其余七页仍待逐页设计；未来若支持仅contentDesc或FAQ的部分CMS记录，需另行定义可用性规则，当前完整/全空输入均通过。

## 八服务详情页差异化白底改版（2026-09-13，本地验收完成）

- `XYY-20260913-07`：八个指定服务详情页启用白底、黑色大标题、橙色按钮和左文案右静音视频的视觉风格。根据服务内容分别组织流程、质检分级、修复工位、跨境正逆链路、区域仓网/覆盖、直播挑战和B2B对比；模块先后与服务要点网格各有差异。原CMS文案、FAQ、指标、Schema、图片poster和原链接保留，仓配总览九区与其余classic详情保持。
- 修改ServiceLanding、八路由的展示参数、两份相关E2E；新增ServiceEditorialHero/Body与局部service-editorial样式。格式/lint/typecheck409文件零诊断通过；独立八页桌面1440×900/手机390×844及额外1024/360、真实视频播放、菜单、reduced-motion/noJS与非目标回归通过，88字段和1125保护hash零差异，CMS mock单测6项通过。
- E2E初轮3通过/2超时/1配置跳过；两项9/10页矩阵仅30s累计预算不足，保留原断言和单项等待、局部增至60s后Chromium两项复测通过（44.3s）。Luna最终PASS、Nova APPROVED，已复核实际日志与两端/特色截图。本次文件均满足行数预算；全仓预算仍有既有product/video-sequence.css和home-product.spec.ts两项超限，未扩大修复。
- 证据在 `output/playwright/xyy-20260913-07/`，包括sol-scope.diff、luna-result.json与复测原始stdout。仅本地预览及Chromium/手机视口模拟，未运行build/fullverify、提交、推送、部署或写真实CMS/数据库；当前预览位于 `http://localhost:4322/xiefu-yuncang`。

## 视频文案轻微阴影（2026-09-13，本地验收完成）

- `XYY-20260913-06`：按用户最新要求，仅在 `video-sequence.css` 的copy增加 `text-shadow: 0 2px 6px rgb(0 0 0 / 0.45)`，前八屏标题、正文、要点与详情入口继承。第九区、原颜色/布局/文案/视频保持，未添加背景遮罩。
- 单CSS格式/diff与独立1440×900、390×844浏览器检查通过：每视口48个文字元素阴影正确，第九区无阴影，无新增滤镜、横溢出或首屏导航遮挡；1136保护hash零变化。已核对单属性diff、结果JSON和两端截图，证据在 `output/playwright/xyy-20260913-06/`。仅本地预览，未运行E2E/typecheck/build/fullverify或提交推送部署。

## 八视频服务文案补充（2026-09-13，本地验收完成）

- `XYY-20260913-05`：已将用户批准的八项价值标题及两句说明逐字加入视频页，每屏补充三个服务要点，共24项，以原生ul/li呈现。保留白字居中、原橙色详情入口和无遮罩视频；手机说明为16px并预留胶囊空间，标题按首个逗号分为服务名和价值句，服务名完整不拆行。原八视频/媒体/详情映射、自动静音循环、九区滚动和第九区排版保持。
- 修改 `video-sections.ts`、`ProductVideoSequence.astro`、`video-sequence.css` 及直接受影响的 `home-product.spec.ts`。局部格式/lint/typecheck407文件零诊断通过；原8项E2E和1440×900、390×844、360×640、844×390四视口逐屏检查通过。首轮视觉检查发现手机服务名断词，最小标题返工后，独立两项home-product复测及两个手机视口的八屏检查通过，最终Luna PASS。1133保护hash零差异；已核对批准文案、最终diff及桌面/手机截图。
- 证据在 `output/playwright/xyy-20260913-05/`，最终结果为 `luna-result.json`，手机最终截图带 `luna-retest-` 前缀。预览定位至 `http://localhost:4322/product`。仅本地Chromium/手机视口模拟，未验证真实设备或部署环境；无遮罩文字对比度随原视频变化。未提交、推送、部署、unit/build/fullverify或操作CMS/数据库。

## 能力保障标题区排版（2026-09-13，本地验收完成）

- `XYY-20260913-04`：按用户要求删除第九区顶部CAPABILITY & ASSURANCE标签，将标题改到左侧、两段说明置于右侧，1000px以下为先标题后说明。中文原文、下方四指标/五机制、八视频与九区导航保持；仅修改 `ProductAssurance.astro` 的header内部和 `video-assurance.css` 的标题说明规则。
- 局部Prettier/ESLint/diff通过；独立1440×900、1024×768、390×844、360×844浏览器验证PASS，无横向溢出、文字相交或固定导航遮挡，09/09和底部机制可达，1135保护hash零变化。已审源码增量、桌面与手机截图。证据在 `output/playwright/xyy-20260913-04/`。
- 仅本地4322及Chromium/手机视口模拟；本次纯静态排版未新增测试或运行E2E/typecheck/unit/build/fullverify，未提交、推送、部署或操作CMS/数据库。

## 仓配第九区静态能力与保障（2026-09-13，本地验收完成）

- `XYY-20260913-03`：在八段视频后加入截图中的“能力与保障”静态区域，复用原标题、四项指标和五项SVG保障机制。页面现为同一滚动容器内的九个区域，胶囊01/09至09/09；八段视频、对应详情链接、播放行为及文字样式保留。桌面采用浅底深字、左说明右标题布局，手机自然换列并增加内容高度，可继续滚动看全机制，无额外内部滚动层。
- 修改 `ProductVideoSequence.astro`、新增局部 `video-assurance.css`，更新home-product/product-motion两份相关测试；原保障组件、数据、CSS、导航JS、媒体及详情页保持。局部格式/lint、typecheck407文件零诊断通过；独立8项E2E全部通过（26.4s），1146项保护hash零变化。
- 独立验证1440×900、1849×907、1024×768、390×844、360×844均无水平溢出，静态区顶部图文与固定导航无相交，底部最后一项机制可达；第8→9→8切换、09/09末尾禁用、手机菜单及八视频自动静音循环通过。SSR含9区、8video、1H1+8H2及全部静态内容，未隐藏；此项不是实际禁用JS浏览器测试。已复核源码增量、桌面和手机最终截图及实际结果，预览定位至 `http://localhost:4322/product#assurance`。
- 证据在 `output/playwright/xyy-20260913-03/`，最终独立结果为 `luna-result.json`。仅本地4322及Chromium/移动视口模拟，未验证真实设备；未提交、推送、部署、build/fullverify、重复资源单测或操作CMS/数据库。

## 仓配八项服务与八段视频（2026-09-13，本地验收完成）

- `XYY-20260913-02`：仓配页由七段改为八段视频，按原八项服务顺序对应鞋服云仓、退货质检、后整修复、跨境云仓、华南鞋服云仓、华东鞋服云仓、直播电商仓配和B2B门店仓配，每屏连接原有对应详情页。初始胶囊总数按数据长度输出01/08，末段08/08；1H1+7H2、8个唯一视频源和详情href实际SSR回读通过。
- 原出库视频在原素材75.5s处拆成分拨6.5s/195帧与装车5.3s/159帧，分别承接B2B与跨境国内发运。新增 `public/videos/warehouse-services-20260913/` 下两份MP4及封面；两段均854×480、30fps、无音轨、faststart，独立完整解码通过。原七段文件与原素材保留，当前页面引用旧六段加新两段。修改video-sections.ts、ProductVideoSequence.astro及三份直接受影响测试；原CSS、导航JS、详情页、metadata/Schema与共享组件保持。
- 局部格式/lint、typecheck407文件零诊断、24项资源单测通过；独立E2E首轮6 passed/2 failed，失败为测试数字ID选择器语法错误，最小修复后两项定向复测通过，指定八项最终全通过。1145项保护hash零变化；8详情实际点击目的路径正确、GET均200。桌面1440×900/手机390×844首尾画面、无横溢出/文字遮挡、08/08自动静音循环/末尾禁用/回退07/08、手机菜单均通过，console/pageerror为0；Sol已复核源码增量、四张最终截图及本次实际证据。
- 证据在 `output/playwright/xyy-20260913-02/`。仅本地4322与Chromium/移动视口模拟，移动指针加scroll为程序响应，未覆盖真实设备手势；无遮罩视频的文字对比度仍随画面变化。未提交、推送、部署、build/fullverify或操作CMS/数据库。

## 本地开发服务启动（2026-09-13）

- `XYY-20260913-01`：按用户要求执行 `npm run dev -- --host 127.0.0.1 --port 4322`，Astro开发服务已启动，启动器报告PID99458。入口 `http://localhost:4322/`，当前仓配页 `http://localhost:4322/product`；启动后两路径实际HTTP检查均返回200。
- 未改业务源码或依赖，保留既有脏文件与4321端口上的服务；仅更新本状态与SOL启动记录。无提交、推送、部署或CMS/数据库操作。本次仅启动与HTTP连通性检查，未运行应用测试或重复页面验收。

## 仓配视频说明与橙色详情链接（2026-09-12，本地验收完成）

- `XYY-20260912-04`：第二行说明由78%透明白改为纯白、600字重，桌面22px/手机18px，短横屏16px；详情链接改为现有品牌橙色 `#e85d26`。仅调整video-sequence.css，保持大标题居中、视频无遮罩/无渐变/无文字阴影，文案和链接地址未变。
- CSS格式/diff与1149项保护hash通过。Luna独立1440×900/390×844浏览器检查：七段说明计算样式、橙色链接、文字边界、无横溢出与无遮罩状态正确，首个链接实际进入原详情页，console/pageerror为0；Sol查看两端截图并独立复算14段文字与固定胶囊无相交。本次为纯CSS样式微调，未重跑E2E/typecheck/单测或build/fullverify，不沿用03测试数量作为本次证据。
- 证据在 `output/playwright/xyy-20260912-04/`。仅本地4322和Chromium视口模拟，未提交推送部署、CMS或数据库操作。无遮罩文字的对比度仍随视频原始画面变化。

## 仓配视频文字居中放大、取消遮罩（2026-09-12，本地验收完成）

- `XYY-20260912-03`：按用户最新要求，七段视频上的标题、说明和链接改为居中排版，删除上一版深色渐变遮罩和绿色装饰线。桌面1440标题64px且完整单行，390/360手机标题35.1/32.4px；短横屏自适应压缩间距。文字区无背景、滤镜或阴影，视频保留原始亮度，标题/说明的对比度随原视频明暗变化。
- 应用仅修改 `src/styles/product/video-sequence.css`，组件、文案、媒体、导航脚本与全部测试源码保持；1149项保护hash零差异。CSS格式与diff检查通过，未运行无关typecheck/单测、build/fullverify。
- Luna独立1440×900、390×844、360×844、844×390验证和本次8项相关E2E通过（31.0s）；服务链接真实导航、胶囊上下、手机触摸与菜单通过，console/pageerror为0。Sol查看最终两端截图并独立归一化28组几何：文字均位于视频内，无胶囊遮挡，水平中心偏差不超过0.008px。七段100dvh、自动静音循环与减少动效行为保持。
- 本次证据在 `output/playwright/xyy-20260912-03/`。仅本地4322预览与Chromium/手机模拟，未提交、推送、部署或操作CMS/数据库。下方02记录的渐变布局为历史，已被本次无遮罩居中版本替代。

## 仓配视频画面叠加服务说明（2026-09-12，历史验收记录）

- `XYY-20260912-02`：用户明确要求文字叠加在视频画面上，沿用同ID纠正此前独立文字带的实现。七视频现重新铺满各自100dvh，标题/说明/服务链接叠在画面顶部，半透明深色渐变覆盖文字后向下渐隐；独立色块及短横屏自然增高规则已移除。保留七段滚动、胶囊、自动静音循环、1H1+6H2和7个原生服务链接。
- 本次返工仅调整video-sequence.css与home-product直接位置断言；组件DOM、文案数据、全部媒体、导航JS、product.astro及Schema/canonical、共享组件均未改。1149保护hash零差异，局部格式/lint/diff通过。
- 叠加版本Luna独立1440×900、390×844、360×844、844×390布局/叠层交互与本次8项相关E2E通过（33.2s），无console/pageerror；服务链接实际导航、菜单、触摸/滚轮/键盘、胶囊与reduce正常。Sol已查看最终桌面/手机截图、短屏坐标、两文件差异及测试输出后验收。此前独立文字带版本的typecheck407文件及22资源单测仅属上一版证据；本次纯CSS与断言返工未重复无关typecheck/单测，验证范围仅本地Chromium与移动模拟。
- 本次证据在 `output/playwright/xyy-20260912-02/overlay-rework/`，原目录保留历史证据。仅本地4322预览，未提交、推送、部署、build/fullverify或操作CMS/数据库。

## 仓配单屏视频滚动与胶囊导航（2026-09-11，本地验收完成）

- `XYY-20260911-14`：仓配页改为单一可视视频滚动容器，七段各占100dvh，按原比例cover铺满视口，段间无gap/margin/白色横线。右侧固定玻璃胶囊提供44px上一段/下一段按钮与01/07序号；滚轮、触摸和键盘可滚动，首尾按钮禁用，减少动效时按钮即时滚动。视频继续自动静音循环，无播放/暂停控件；顶部共享导航悬浮，手机菜单层级高于胶囊。
- 修改视频序列组件、局部CSS、新product-video-navigation.ts及直接受影响的三份既有测试。七媒体、data、product.astro、共享Layout/Header/Footer和旧素材未修改；手机等比铺满会裁切画面两侧。相比13的连续原比例长页面，当前按已告知用户的一屏一段方案展示。
- 最终局部格式/lint、typecheck407文件零诊断、image-cache22单测通过。Luna独立桌面1440与手机390验证单一滚动、无横溢出或段间空白、按钮快连与首尾禁用、滚轮/键盘/真实触摸、菜单层级及reduce即时滚动均PASS，无console/pageerror。E2E首轮8项通过，修复测试evaluate传参后两项定向复测通过，合计10项相关用例通过。Nova独立Review APPROVED，989保护hash零差异；Sol查看最终源码、两端截图及本次证据后完成本地验收。范围仅本地Chromium与手机模拟，未验证真实Safari；屏外播放继续服从浏览器原生策略。
- 证据在 `output/playwright/xyy-20260911-14/`。仅本地4322预览，未提交、推送、部署、build/fullverify或操作CMS/数据库。

## 仓配七段视频全宽自动播放（2026-09-11，本地验收完成）

- `XYY-20260911-13`：仓配页主体改为七段原生视频，依次为总览、仓储、拣货、质检、后整、打包、出库。按原比例铺满页面可用宽度并竖向排列；各文件均854×480、30fps，合计78秒。新媒体位于 `public/videos/warehouse-sections-20260911/`，七段均已物理移除音轨，带独立封面和faststart，完整解码通过。
- 按用户最新要求，七段使用autoplay/muted/loop/playsinline，默认自动静音循环，无播放或暂停控件；未增加播放管理脚本。导航保留，正文只呈现视频，页脚及悬浮联系入口通过现有Layout参数隐藏。旧组件、样式、图片、原视频仍保留为本地文件，以下11/10/07等旧区域记录为此前验收历史，当前页面不再挂载它们。
- 新增视频序列组件、数据与局部CSS，更新product.astro和直接受影响的三个既有测试文件。最终格式/scoped lint、typecheck406文件零诊断、image-cache22单测、1110保护hash通过；独立媒体预检PASS。桌面1440七段滚入视口均自行播放、首段真实循环，手机390首/中/末自动播放与两端无横溢出已验证；相关E2E为12 passed、0 failed，七封面HTTP200，无console/pageerror。Sol复核最终源差异、媒体与两端截图后完成本地验收；屏外视频仍遵循浏览器原生媒体策略。
- 首轮网页QA因本地4322服务停止而阻塞；确认端口空闲后已恢复同一Astro开发预览，HTTP200，未更改其他服务或部署配置。证据在 `output/playwright/xyy-20260911-13/`。未提交、推送、部署、build/fullverify或操作CMS/数据库。

## 仓配核心服务悬停与整卡跳转（2026-09-11，本地验收完成）

- `XYY-20260911-11`：八项核心服务现可独立悬停高亮，浅绿背景、细边和柔影配合4px上浮/箭头右移；鼠标移开复位。按用户补充要求，点击编号、说明或留白都进入对应原服务页，“了解更多”保留为提示。仅追加editorial-sections.css，复用原生链接，无新增DOM/JS或Tab目标。
- 键盘焦点可突出卡片并保留链接轮廓；触屏保持静态可点击，减少动画时只保留静态高亮。原八项文案/链接、09已撤回尺寸、10保障修复、三透明图、六静态需求和Hero视频保持。
- 局部格式/diff、1113保护hash通过；独立CLI验证1440八卡悬停/复位、键盘、24命中点及首尾导航，390真触控导航/无sticky位移/无溢出，减少动画无位移和过渡；product-motion既有4项测试通过，无console/pageerror。已复核两张截图及最终源码，本地验收完成，证据在 `output/playwright/xyy-20260911-11/`。未提交、推送、部署、全量构建或操作CMS/数据库。

## 仓配服务保障机制响应式修复（2026-09-11，本地验收完成）

- `XYY-20260911-10`：修复“服务保障机制”在较窄窗口固定五列、说明不换行导致文字伸到相邻图标下的问题。仅调整assurance.css中的机制样式：自动换列、图文顶部对齐、文字可收缩并正常换行，图标大小及全部文案/数字保持。
- 格式和diff通过；独立Playwright CLI在1440/1021/913/390确认5项机制、5SVG正常显示，图文及相邻项无相交、段落不越界、页面无横溢出，HTTP200且console/pageerror为0。1112保护hash零差异；已复核1021/390截图和当前预览，完成本地验收。证据在 `output/playwright/xyy-20260911-10/`。
- 09统一尺寸继续取消；三张透明图、六项静态需求及Hero视频保持。仅本地CSS修复，未新增测试、运行E2E/全量构建、提交、推送、部署或操作CMS/数据库。

## 仓配统一尺寸调整撤回（2026-09-11）

- `XYY-20260911-09`：按用户要求撤回913×881统一尺寸与随后依赖该尺寸的内容放大、Hero三项补充，恢复任务前的自适应排版。保留三张透明物品图、需求区六项取消跳转和首屏右侧视频。
- 已停止实现代理，恢复product.astro与ProductEditorialHero.astro，移除新增uniform-sections.css；两恢复文件与任务前基线逐字节相同，1112保护文件SHA256零差异。证据在 `output/playwright/xyy-20260911-09/cancellation-verification.json`，取消方案源码已单独备份。原统一尺寸方案未完成验收，其截图和检查仅为历史。仅本地恢复，未提交、推送、部署或操作CMS/数据库。
- 独立撤回验证PASS：1440/390两端HTTP200、无横向溢出、七区已恢复自然高度，三图正常加载、六需求无链接、视频保留、无新增Hero三项；无console/pageerror，恢复基线及1112保护hash再次匹配。未运行已取消方案的E2E或全量应用测试。

## 仓配三图替换为透明物品图（2026-09-11，本地验收完成）

- `XYY-20260911-07`：按用户最新要求，三张原场景图已替换为透明背景物品组合，分别表达库存/退货/包装需求、商品清洁修复与重新包装、验收扫码至打包交付。新图为public/images/product/下directory-objects-20260911.png、care-objects-20260911.png、process-objects-20260911.png，均由内置image_gen生成，带真实RGBA透明通道，直接融入页面白底；完整提示词及来源路径在 `output/imagegen/xyy-20260911-07/prompts.json`。
- 三组件更新图片/alt/真实尺寸，图片容器透明、contain完整显示，care手机图框调整为3:1减少留白；保留标题文案、06六项无跳转、八项核心服务链接、Hero视频与原入场。原三张场景图保留为历史文件，当前页面不再引用。
- 格式/scoped lint/typecheck404文件零诊断、维护性预算、资产检查、image-cache13单测和diff通过；独立E2E 6 passed，1440/390三图HTTP200/alpha/完整主体/白底适配通过，无溢出/console/pageerror，1103保护hash零差异。已核对源码增量及六张页面截图，本地验收完成；证据在 `output/playwright/xyy-20260911-07/`。
- 当前预览 `http://localhost:4322/product`；仅本地Chromium桌面/手机模拟验证，未提交、推送、部署或写CMS/数据库。

## 仓配需求区取消跳转（2026-09-11，本地验收完成）

- `XYY-20260911-06`：用户截图指定的“你现在需要解决什么问题？”六项已改为静态展示，点击不跳转；保留编号、文案、图片、网格与入场效果，核心八项服务链接保持。
- 修改 `ProductEditorialServices.astro`、两份局部布局/响应式CSS及两份相关既有E2E。格式/scoped lint/typecheck404文件零诊断、维护性预算与diff通过；独立E2E 4 passed，1440/390两端逐项点击URL不变、无交互目标/溢出/console/pageerror，948保护hash零差异。已复核两端实图和SSR增量，本地验收完成；证据在 `output/playwright/xyy-20260911-06/`。
- 当前预览 `http://localhost:4322/product#service-directory`；仅本地Chromium桌面/手机模拟验证，未提交、推送、部署或写CMS/数据库。

## 仓配页三张生成插画（2026-09-11，本地验收完成）

- `XYY-20260911-05`：按用户要求补齐视频后全部三个空图片区，依次为入库与库存协同、商品质检整理、打包出库交付。使用内置image_gen生成白灰绿概念插画，均1536×1024，文件为public/images/product/directory-flow-20260911.png、product-care-20260911.png和fulfillment-process-20260911.png；提示词及来源路径保存在 `output/imagegen/xyy-20260911-05/prompts.json`。
- 三组件使用本地图、描述性示意图alt、lazy/async与真实尺寸，保留现有比例和入场外壳；care横幅局部上移裁切以保留衣架/工具。空占位数现在为0；首屏视频、文案、链接与其他分区保持。
- 本次格式/scopedlint/typecheck404文件零诊断、维护性预算、资源检查、image-cache13单测通过；独立E2E 6 passed，1440/390三图载入/裁切/无溢出及手机noJS可见通过，943保护hash零差异、无console/pageerror。已复核六张实图并完成本地验收；证据在 `output/playwright/xyy-20260911-05/`。
- 当前本地预览 `http://localhost:4322/product`；仅Chromium桌面/手机模拟验证。未build/fullverify、提交、推送、部署或写CMS/数据库；图片为生成示意插画，不作为真实仓库照片。此前03的3D交互继续取消。

## 仓配首屏右侧视频（2026-09-11，本地验收完成）

- `XYY-20260911-04`：按用户提供的“ 双十一1111-3.mp4 ”在 `/product` 首屏右侧接入原生视频播放器，使用52秒“清洗/挂烫”画面作封面；保留854×480、88.167秒完整音画，controls、playsinline、preload=none，默认点击播放。桌面在文案右侧，手机在文案下方按原比例显示；其余三占位、文字和八项服务入口保持。
- MP4仅无损copy+faststart重封装，原/新音视频两流SHA256一致，本地Range206通过。最终格式/scopedlint/typecheck404文件零诊断、维护性预算、image-cache 10单测及diff通过；独立验证PASS，指定E2E 6 passed，两端实际播放/解码/暂停、初始无MP4请求、无溢出/console/pageerror通过，944保护hash零差异。已查看两端实图并完成本地验收；证据位于 `output/playwright/xyy-20260911-04/`。
- 修改首屏组件、新视频/封面与三份相关既有测试及记录。当前预览 `http://localhost:4322/product`；仅本地Chromium桌面/手机模拟验证，未build/fullverify、提交、推送、部署或写CMS/数据库。此前03的3D方案仍已取消。

## 仓配首屏图片动效取消（2026-09-11）

- `XYY-20260911-03`：用户取消本次图片3D动效方案，已停止代理工作并恢复任务前的首屏留空状态和两份受影响测试；新增图片、组件、脚本、样式和动效测试已移除。原有仓配改版与八项核心服务顺序保留。
- 恢复后三文件与任务基线逐字节相同，947保护文件hash无差异；取消前的实现检查属于历史，独立测试/Review未完成，不代表动效方案已验收。仅本地恢复，未提交、推送、部署或操作CMS/数据库。后续按用户新图片直接接入，不继续本次动效任务。

## 核心服务合并与顺序调整（2026-09-11，本地验收完成）

- `XYY-20260911-02`：广州入口已融入华南，按用户最新要求，当前八项严格排序为 01 鞋服云仓、02 退货质检、03 后整修复、04 跨境云仓、05 华南鞋服云仓、06 华东鞋服云仓、07 直播电商仓配、08 B2B门店仓配，取代前轮华南为07的排列。
- 华南说明保持“华南区域仓网覆盖广州及珠三角，支持全渠道仓配、库存协同、退货质检与瑕疵修复。”；本次只在 `src/data/product/editorial.ts` 调整产品局部顺序，并同步 home-product/product-motion 两份既有E2E的顺序断言。逐项标题、描述、id和href与合并后基线相同；共享导航顺序、旧广州/华南详情、其他分区、样式和动画保持。
- 顺序续办本轮实际验证：Terra 最终指定格式/scoped lint、typecheck（404 files，0 errors/warnings/hints）、diff通过；Luna定向E2E 4 passed，1440×900及390×844顺序/编号/可读性/无横向溢出、18保护hash全部PASS。Sol查看两端新截图并核对精确增量及SSR后验收CLOSED。证据位于 `output/playwright/xyy-20260911-02-order/`；此前合并阶段及两详情GET200证据保留在 `output/playwright/xyy-20260911-02/`。
- 本轮LOW静态调整按Terra→Luna→Sol完成；本地预览 `http://localhost:4322/product#service-series`。未build/fullverify、提交、推送、部署或写CMS/数据库，未删除任何详情页。

## 本地开发预览恢复（2026-09-11）

- `XYY-20260911-01`：原4322开发预览已停止，现通过 `npm run dev -- --host 127.0.0.1 --port 4322` 恢复，Astro报告PID12410。首页与 `/product` 本次GET均HTTP200，页面标题正确，仓配核心服务仍为9项。
- 本地CMS ping HTTP200；原4321与8055服务未重启。仅修改本状态记录与docs/SOL.md，保留全部既有代码差异，未build、运行应用测试、提交/推送、部署或写CMS/数据库。
- 当前预览入口：`http://localhost:4322/`；仓配页：`http://localhost:4322/product`。

## 仓配服务入口整合（2026-09-10，本地验收完成）

- `XYY-20260910-02`：按用户明确澄清，保留九个原服务详情页，将原下拉入口迁入 `/product` 的“我们提供的核心服务”，按原顺序编号01–09：鞋服云仓、华东鞋服云仓、退货质检、后整修复、跨境云仓、直播电商仓配、华南鞋服云仓、广州鞋服云仓、B2B门店仓配。名称/顺序/href复用既有 `SPECIALTY_LINKS`，简述来自原详情内容，不新增公开数字。
- 桌面导航移除仓配箭头与弹层，手机移除九项服务子菜单，主导航的“仓配服务”直接进入 `/product`；详情页的仓配高亮和手机菜单开关保持。核心服务自然形成桌面三列三行、手机单列九项，原无框排版、四空占位、统一入场动画以及保障区/CTA/Footer保持。
- 修改为 `src/data/product/editorial.ts`、DesktopNavigation/MobileNavigation与home-product/product-motion/about-cases三份相关既有E2E。Terra本次typecheck404文件零诊断、指定format/scoped lint、维护性预算/diff通过；Luna定向E2E实际10 passed (17.5s)，独立1440/390两端网格/菜单/跳转/焦点、九详情GET200、reduced-motion/noJS、617保护hash和SSR边界PASS。Nova APPROVED，Sol核对最终两端实图后验收CLOSED。证据在 `output/playwright/xyy-20260910-02/`。
- 仅本地预览 `http://localhost:4322/product#service-series` 完成，未build/完整verify、提交、推送、部署或写CMS/数据库。详情页面及原运行环境未删除或修改。

## 仓配服务页参考图排版（2026-09-10，本地验收完成）

- `XYY-20260910-01`：按用户参考图重排 `/product` 服务保障区之前的五部分：首屏、核心服务、六类业务问题、四类商品处理与六步交付。核心服务原三类入口已由上方 `XYY-20260910-02` 扩展为九项；保留黑色大标题、绿色重点和四个浅灰空白图片区，图片按要求暂不接入。
- 当前交付已按最新“尺寸太大、内容展示不佳”反馈取消前轮五段 55rem 等高：维持 1360px 最大容器和与保障区一致的响应式边距，改为自然高度与清晰分组。1440px 下前五段约 2970–2980px（有无滚动条差异），原为 4400px；桌面核心服务三列、业务问题 2×3、流程 3×2 与右图，手机核心服务三条全宽，商品处理 2×2、流程 2×3。此前等高方案与历史验证仅保留在角色日志中，不代表当前布局。
- 新组件与四份专用 CSS 限制在内层 `.product-editorial`；顶部导航及“让服务可以被看见、被复核，也被持续改进。”起的保障区、咨询 CTA、页脚保持。恢复时的 86 个原有保护源码与 HEAD 一致，本轮结束 hash 全匹配；Header、保障区起主内容和 Footer 的 SSR 边界比对通过。文案数据、服务路径及前轮两份测试未改变。
- 本轮 Terra 完成 CSS 去重、手机/平板适配与流程区 aspect-ratio 自动最小宽度返工；指定文件格式、维护性预算和 diff 检查通过。Luna 独立七视口 PASS，实际定向 Playwright 为 6 passed，image-cache 单测为 1 file / 8 tests passed；各服务/咨询 GET200、四空占位、键盘焦点、7rem 锚点偏移、零 console warning/error/pageerror 均通过。Nova 最终 APPROVED，Sol 复看桌面/手机实图并补查三个桌面宽度四行标题实际行高后验收 CLOSED。证据在 `output/playwright/xyy-20260910-01-layout/`。
- 本地开发预览已恢复并保留于 `http://localhost:4322/product`，实际 HTTP200；原 4321 SSR 和 8055 CMS 未改动。仅本地代码与记录修改，未运行本轮 build/全量 verify，未提交、推送、部署或写 CMS/数据库、改权限或生产环境。保留任务前的治理配置、角色日志及未使用图片等既有差异，不将历史构建或发布结果算作本轮证据。

- 同 ID 最新完成无框分组精修：按用户“不要出现这种竖线表格”要求，仅从 `editorial-layout.css` 与 `editorial-responsive.css` 删除服务、业务问题、商品处理与流程的单元横竖边线，原字号/留白/列数/内容、导航及保障区之后保持。两份 CSS 格式/diff 与 96 项源码保护 hash 通过；Luna 本次仅做1440/390两端独立检查，目标边框均0、四占位与网格正常且无溢出，PASS；Sol diff/实图验收完成。本轮 LOW 纯装饰增量未重复前轮单测/E2E/build，仍仅本地完成。

- 同 ID 已完成“使用底部这种动画效果”：四个 ProductEditorial 组件的前五区块与四空占位复用底部既有 copy reveal，保持 y28/blur4、0.82s 和逐项延迟的向上淡入效果；仅为新区域增加 self 目标适配及焦点可见性 CSS，底部 helper/参数、导航、保障区之后和无框排版不变。首轮 typecheck404文件零诊断；键盘回归修复后的定向 motion E2E 为4 passed，格式/scoped lint/维护性预算/diff通过。Luna 本次独立1440×900、390×844验证正常动画、Tab顺序与清晰焦点、深链接、重复进入、reduced-motion及无JS均 PASS，92份保护源码hash与底部SSR边界一致；Nova APPROVED，Sol验收 CLOSED。证据位于 `output/playwright/xyy-20260910-01-motion/`，用户预览已恢复系统默认动画；验证限本地4322，未build/完整verify/提交/推送/部署。

## 本地项目启动（2026-09-08）

- `XYY-20260908-02`：按用户要求恢复本地项目。原本地 PM2 `xyy-web` 在 4321 监听但首页/News 返回 500，日志为旧 SSR 进程引用已不存在的构建 chunk；仅重启该本地网站进程后恢复，无业务代码或配置修改。
- 已验证 `http://localhost:4321/` 与 `/news` 返回 200 且页面标题正确；本地 Directus `http://127.0.0.1:8055/server/ping` 返回 200/pong，CMS 原进程未重启。
- 本次未访问或修改验收站/正式站，未执行 CMS 写入、数据库操作、构建、提交或推送；只更新启动记录，不以此替代其他功能验收。

## 供应链白皮书导航与路由（2026-09-08）

- `XYY-20260908-03`：桌面/移动顶栏及共享页脚名称改为“供应链白皮书”，链接为 `/supply-chain-whitepapers/`；栏目页 H1、title、canonical/breadcrumb、新闻入口 URL、sitemap/llms 同步。原刊物正文、14 期数据、`senlinqikan` CMS FAQ key 与 PDF/封面路径保持不变。
- 旧 `/senlinqikan`、`/senlinqikan/` 及新无尾斜杠地址均单次 301 到新规范 URL，并保留 query。首轮 SSR 回归暴露全局去尾斜杠与新页补尾斜杠的循环；已为精确栏目路径添加例外，其他路径/主机/HTTPS 与前导分隔符安全规则保留。
- 返工后的独立 QA PASS：完整 `npm run verify` 退出 0（388 files / 0 diagnostics、54 files / 421 tests、build PASS），三份定向 E2E 9 passed / 1 configured skip，本地正式域名契约 3 passed；桌面/移动浏览器入口点击、active/页脚、元数据及无溢出/错误通过。最终 Review `APPROVED (local code only)`，独立定向单测 10 项通过，任务已验收关闭；不使用首次失败前的开发预览成功替代 SSR 证据。
- 本地 `build:local-preview` 成功后仅刷新 4321 的 PM2 `xyy-web`，`http://localhost:4321/supply-chain-whitepapers/` 已返回 200，原 PDF14/cover14 返回 200，三类旧/无尾斜杠地址的 301 与 query 通过 HTTP 断言。CMS 原进程未重启，临时 4322 开发预览已关闭。
- 代码仅在本地，未提交、推送或部署；验收站与正式站未变化。未改权限、写真实 CMS/数据库或执行 Oracle 操作。

## 供应链白皮书顶部与 FAQ 内容优化（2026-09-08）

- `XYY-20260908-04`：顶部增加“把仓配经验，转化为供应链决策参考”，明确鞋服品牌、电商运营与供应链团队的使用场景；同步 title/description、FAQ heading 和资料目录说明。八组问答围绕定义、读者、仓配问题、云仓选型、退货流程、PDF 获取、核验引用与更新重写，移除旧缺期说明、固定回复时效和概括复用许可，不新增效果或排名承诺。
- FAQ 源与生成 Seed 仅修改原八个稳定键的问答；保留 `senlinqikan` CMS key、排序和身份，实际 FAQ 与 JSON-LD 仍共用 CMS 返回数组，未绕过 CMS 或更改空值/失败语义。原刊名称、期次、PDF、封面及上轮新旧 URL 兼容保持。
- 独立代码 QA PASS：本轮原始日志确认 Astro 389 files 零诊断，55 files / 424 tests、完整 verify/build 通过；定向 E2E 7 passed / 1 configured skip。曾出现上一任务计数误用于报告的问题，已拒绝该统计并重新执行、以本次原始记录更正；未用旧 PASS 验收。Review APPROVED（本地代码和获授权的本地 FAQ 同步预执行），定向单测及格式/语法/diff 通过。
- 用户明确允许仅本地 `127.0.0.1:8055` 的八条 question/answer 更新。已备份旧值至 `/tmp/xyy-20260908-04-faq.kuLS98/before.json`，精确更新 `faq_page=5/key=senlinqikan` 下 ID 33–40；回读八条新文案全部匹配，稳定 key/sort/status/page relationship 保持，后续 dry-run 为零计划变更。
- 本地预览 4321 已完成 development build 并刷新，仅本机 `xyy-web` 重启，CMS 原进程不动；SSR 返回 200 且八条 FAQPage 内容与审核稿一致。最终独立桌面 1440×900 / 移动 390×844 验收 PASS：Hero/CTA 无遮挡或溢出，八条 FAQ 逐项开关与问答/JSON-LD 一致，元数据、14 个 PDF 链接、PDF14 访问及旧两 URL 的 301/query 均通过。Sol 已查看两端 Hero/展开 FAQ 截图并确认 AC，任务 CLOSED。
- 随后按用户确认稿精修顶部介绍为“新亦源供应链白皮书聚焦鞋服行业，分享云仓运营、退货质检、直播仓配与数字化管理的一线经验，为品牌、电商及供应链团队提供仓配选型、流程优化和团队培训的实用参考。”；FAQ 中的原刊关系说明保留，页面元数据/FAQ 源/Seed 哈希未变。本轮定向单测 3/3、两端新截图与 FAQ 首问回归、本地预览构建均 PASS，增量 Review APPROVED，任务同 ID 返工已关闭。仅刷新本地网站进程，CMS 未重启或写入；本轮不重复无关全量门禁。
- 未提交、推送或部署；验收站、正式站及其 CMS 均未变化。未执行数据库查询/迁移、Schema/权限修改或 Oracle 操作；备份与本地一次性同步器不进入 Git。

## 供应链白皮书 PDF → HTML 阅读页（2026-09-09，章节说明清理已本地验收）

- `XYY-20260908-05`：在现有 Astro / Layout / Header / Footer 基础上实现共用 `/supply-chain-whitepapers/[issue]/` 阅读页。栏目卡片和主 CTA 指向 HTML，保留 PDF 次要入口、顶部/底部下载和返回栏目；不引入 PDF viewer、整页图或新 UI 框架。
- 最新章节说明清理已验收：全14期122处章节提示框及“查看原版第X页”链接均移除，3–5顶部部分内容提示、235条内部核查数据和首尾PDF下载保留。Luna独立3 files/18 tests、按14→1串行的28视口PASS，76张正文图在两端均正常解码、中心偏差0px，无横向溢出。Terra Astro399文件零诊断；Nova仅审本次四文件差异，APPROVED；Sol核对本次证据后关闭同Task，未以此前全量测试替代本次验证。
- 此前通用顶部历史声明已移除；11期不渲染顶部notice框，仅3–5保留精确的“本期仅部分内容，完整内容请阅读 PDF 原版。”。原刊来源/日期、正文/图片/原PDF/路由/CMS/数据库不变。
- 此前同ID图片阅读体验返工已完成本地验收：图与图注居中，31项派生资源（28张高清局部图、3张原生低清图）独立控制像素与展示宽度，图解提供普通大图链接。该阶段曾将技术备注合并为122个章节提示，现按用户后续授权从公开层移除；原正文JSON和235条内部复核记录不变。未授权任何线上或CMS/数据库操作。
- 已检查 `public/senlinqikan/pdf/1.pdf` 至 `14.pdf`，共14期、187个物理页。第14期优先原生文字层；第1–13期正文无可靠文字层，按实际版式本地 OCR、源区域定位与核字。离线脚本输出章节/语义块 JSON 和局部图，线上只渲染已有数据，不运行 PDF 解析或 OCR。
- 第14期样板为12篇文章、299个语义块、41张局部图；第1–2、6–13期已生成可阅读章节正文。第3–5期明确为部分恢复稿，尚未完成全文恢复。全14期引用76张局部图，235条内部待核查说明按文章/物理页/源区域保留在JSON与 `docs/whitepapers-manual-review.md`；公开章节提示移除不代表缺口已消失或14本已逐字校对。
- 每期有独立主题 H1、title、description 和自身 HTML canonical，保留原刊名称与期号；目录/语义层级/长文样式及 sitemap/llms 已接入。CMS目录与转换数据显式匹配，成功空数组仍为空，未来仅PDF期次保留PDF入口；未修改CMS读取失败契约。
- 审查发现的10/12/13文章边界、明确OCR错字，以及7/8/9/11/12指定混排区域均已最小返工。最新独立有限源QA PASS（`output/playwright/whitepaper05-final-source/source-qa-report.txt`），三张新局部图与争议原句按实际原稿核对；原刊历史内容不冒充当前服务承诺。来源检查绑定14原PDF SHA、真实页数和有界坐标，当前claims注册表未放宽。
- 此前阅读体验返工的独立完整 `npm run verify` 复测实际EXIT0/`VERIFY_EXIT=0`：399 Astro files零诊断、58 files/444 tests及lint/可维护性/资源/build通过（`output/whitepaper05-presentation-luna-verify-retest.log`）。新图片Python4项、31资产check、定向Vitest37项PASS；104项原PDF/JSON/PNG基线SHA无变化，四组新旧图独立源检查通过。首次新增测试类型错误的FAIL日志保留，已最小修复后复测；顶部说明移除仅执行上一条所述定向验证，未重复全量测试或旧转换/E2E/formal。
- 此前全14页初次两端检查和7–13期源文修正后复测保持已通过；本轮阅读体验独立检查为14/12/7各1440×900与390×844，图片全解码、中心偏差0px、无横向溢出。14原生低清三图显示318/316/315px，27张增强图自然像素宽大于显示宽；12提示链接、3部分提示、10图注清理、Header/Footer/TOC/PDF入口及真实大图新tab均通过。最终四张归档截图见 `docs/whitepapers-page-qa.md`，未将本轮有限矩阵冒称全14页再次执行。
- 当前本地预览为章节说明移除后的17:52:07构建，实际EXIT0；仅重启本机 `xyy-web` 为PID190378，CMS进程1752不变。最新Sol smoke验证14页HTTP200、章节提示0；删除修改前122提示节点并规范标签间空白后，其他article HTML和title/description/canonical逐期精确相同，104原PDF/JSON/PNG哈希不变、顶部partial及首尾PDF入口保留，PASS（`output/whitepaper05-section-note-smoke.json`）。14份PDF HEAD逐期均200/application/pdf。15张本次截图在 `output/playwright/whitepaper05-no-section-notes/`；此前路由/301/404等完整证据仍保留，未在本次小改动重跑。
- 此前原稿内容修正和本轮阅读体验增量均已获Nova `APPROVED`，历史源阻断未重新打开。本轮未发现新的阻断性范围/安全/内容来源/SEO或下载问题，Sol按实际证据将同Task设为 `CLOSED`。3–5期部分恢复、低清原件与235条人工核对位置如实保留，不宣称全文已校对。转换与图片衍生方式见 `docs/whitepapers-reading-pages.md`、`docs/whitepapers-reading-images.md`，历次证据保留在角色日志。
- 仅本地代码、转换资料和验证；HEAD仍为 `1e0a79b82ad873459d2ea22b6526d5a0444d692a`，原PDF未修改。未提交、推送、部署任何线上环境、写入CMS/数据库或修改权限；验收站、正式站及原本地CMS进程均不变。

## 官网线索 Integration 发布状态（2026-08-25 更新）

- `XYY-20260825-02` 已将上一 Task 验收的服务码中文显示优化发布到 XYY-xiansuo：五项现有稳定码在 `source_note` 写入边界转换为中文，未知/自定义值安全保留。生产运行代码 SHA 为 `a5f82b96b271e266af58ca14b505ad026f050244`。
- XYY-xiansuo Integration 已在 `https://xs.tomatopia.top` 激活；独立机器 Token 和 active owner ID 2 继续使用既有受限环境配置，本次未读取、修改或重新保存 Secret。真实 Token 不记录在仓库或本文档。
- XYY-WEB staging 已在 `https://wz.tomatopia.top` 激活并验证官网线索 Integration；当前 Release 为 `20260825T054116Z-2c75bcd`，浏览器仍只请求 staging `/api/contact`，再由 Web Server 通过 HTTPS 调用 XYY-xiansuo。上一 Release `20260824T090653Z-4c1f313` 已作为原子回滚目标保留。
- XYY-xiansuo 本地、GitHub 与运行服务一致为 `a5f82b96b271e266af58ca14b505ad026f050244`；systemd 当前 `active/running`、`NRestarts=0`。发布重启窗口出现一次瞬时 502，并在两秒内恢复，当前 health 为 200 且无持续错误。
- `XYY-20260825-03` 已确认 XYY-WEB 与 XYY-xiansuo 的 `codex/website-lead-integration-20260824` 完整并入各自 `main`，随后删除两仓本地与 GitHub 功能分支；其他历史或并行分支未处理。
- `https://56xyy.com` 未在本次发布中部署或改配，主站页面与 robots 内容哈希均与发布前一致；Main-site Integration 当前为 `NOT ACTIVE`。
- 受控 direct smoke lead ID 8、website E2E lead ID 9 和本次中文标签 E2E lead ID 12 已创建并保留，均标记 `TEST ONLY / DO NOT FOLLOW`。ID 12 精确一条，来源为“官网留言”、状态为“新线索”、来源细分为“咨询服务：鞋服云仓”且不含 `cloud-warehouse`，需求含本 Task 标记，并有一条 create audit、零条 follow-up。
- staging Directus 通过强制只读事务确认本次 website E2E phone 在 `contact_leads` 中计数为 0，XYY-xiansuo 中计数为 1；当前链路不存在 Directus 双写。
- Xiansuo 保留旧不可变 Release `3c3eb1baa82a942c4a5f867a50d3e640b8497a5c` 与部署前 unit 备份；Web staging Release 保存 `.previous_target` 并继续使用既有原子 rollback。两仓库本地、GitHub 与已发布应用身份已完成核对。
- Xiansuo GitHub CI 的本次 Run 为 179/180；唯一失败是基线即存在的 Node 22 `DatabaseSync.serialize()` 测试兼容问题，目标 Integration 测试和真实生产链路均通过。该全局 CI 风险不在本次两文件发布 Scope，后续需以独立维护 Task 恢复全绿。
- 本次未执行 Oracle 命令、Schema 修改、历史迁移、Directus Schema 写入或正式主站发布。若切换 `56xyy.com`，必须建立新的独立 HIGH Risk Task。

## 本地安全扫描状态（2026-08-25）

- `XYY-20260825-04` 使用 Strix 1.5.3 对 `/home/yj/XYY-GEO/website` 执行 `quick`、全仓、非交互本地代码扫描；未访问正式站、验收站、CMS、数据库或其他生产系统，也未修改业务代码。
- 有效运行 `website_c9b1` 共执行 136 次模型请求，记录 4,905,742 tokens（其中 4,742,272 cached）与约 3.02 美元费用；达到 3 美元预算后状态为 `stopped`，不是自然完成的深度扫描。
- 本次已覆盖范围内未验证到可利用漏洞；SARIF `results` 为空。该结论只代表预算受限的快速扫描结果，不构成“项目绝对安全”或完整渗透测试证明。
- 扫描产物保存在仓库外的 `/home/yj/XYY-GEO/strix_runs/website_c9b1/`；业务源码无改动，仅按项目规范更新状态文档。若需要更高置信度，必须以新的授权和预算执行 standard/deep 扫描，并单独评估生产黑盒测试范围。

## 服务专题页 CMS 结构修复状态（2026-08-30）

- `XYY-20260830-01` 已修复 `generate-cms-content-seeds.mjs` 漏写服务页 `stats` / `features` 的根因，并新增默认 dry-run 的定向修复命令；目标严格限定仓配下拉菜单 9 条 `service_pages`，字段严格限定 `stats`、`features`、`img_src`。
- 实现提交 `82c01eda9984353ab7767cd4c79d7903bf938749` 已进入 GitHub `main`，Terra 完成实现、Luna 最终 `PASS`、Nova 最终 `APPROVED`。完整发布门禁通过：316 项单测、39 项 E2E（7 项按配置跳过）、3 项正式域名契约和生产构建。
- staging 已原子发布 Release `20260830T100940Z-82c01ed`；`/healthz` 为 `cmsContent=ok`、`contactStorage=ok`。staging CMS dry-run 为 0 项变更，备份权限为 `0600`；公开回读确认 9 页均为 6 项能力内容并使用 9 个期望图片 URL。
- 正式主站 `56xyy.com` 的 CMS 定向修复尚未执行。现有本机 `.env.production` 管理 Token 对正式 CMS 返回 `Invalid user credentials`，命令在首次只读 GET 阶段失败，未执行 PATCH、Schema、数据库或 Oracle 操作；当前 Chrome 也没有可复用的正式后台登录会话。
- 因正式 CMS 尚未 apply，最新公开回读确认主站 9 页仍均为 0 项能力内容，其中 6 页仍未引用目标新图片 URL。主站应用无需为这次内容修复重新部署；有权限人员必须使用提交 `82c01ed` 的工具，先 dry-run 并保存备份，确认仅 9 条记录与三个字段后再 `--apply`，最后重复 dry-run 为 0 并公开回读验证。

## News 发布时间与批量发布 API 状态（2026-08-31）

- `XYY-20260831-02` 已完成并验收 News 发布时间修复：Directus 返回无时区时间时按 `Asia/Shanghai` 编辑时间解释，带 offset 时间按绝对时刻解释；公开查询在过滤未来文章后再排序分页，当前时间发布可立即显示，未来定时发布继续隐藏。
- 已新增只供受信任服务端调用的 `POST /api/integrations/news/batch` 代码合同：每批 1–20 篇、严格字段白名单、服务端固定 `status=published`、有限 body 与 10 秒 Directus timeout、重复 slug 稳定 409、其他下游错误非敏感失败关闭。
- API 要求 `NEWS_PUBLISH_API_TOKEN`、`DIRECTUS_NEWS_WRITE_TOKEN`、`DIRECTUS_CONTENT_TOKEN` 均至少 32 UTF-8 bytes 且两两不同；远端 Directus 写入只允许 HTTPS，HTTP 只允许明确的 localhost / IPv4 / IPv6 loopback。Secret 不进入客户端、Git、Markdown 或响应。
- Terra 完成实现；Luna 首轮 `FAIL` 的非法日期、Token 隔离与无效 ID 问题均已返工关闭，最终 `PASS`；Nova 首轮 `REJECTED` 的非回环明文 HTTP 问题已返工关闭，最终 `APPROVED`。最终门禁为 51 个测试文件、384 项测试通过，完整 `npm run verify`、format 与 diff-check 通过。
- `XYY-20260831-03` 已将应用提交 `b91a7b20d96adf086cc2ec50aea1a8dd77ecd199` 推送到 GitHub `main`，GitHub CI Run `33371936252` 成功；完全合并的本地/远端临时分支已清理，最终只保留 `main`。staging 已原子发布 Release `20260831T081814Z-b91a7b2`，上一 Release `20260830T100940Z-82c01ed` 保留为回滚目标。
- 发布后 `/version` 精确匹配目标 SHA/Release，`/healthz` 为 `cmsContent=ok`、`contactStorage=ok`；Luna 独立桌面/移动验证 `PASS`，Nova 发布 Review `APPROVED`。
- staging 尚未配置 `NEWS_PUBLISH_API_TOKEN` 和 `DIRECTUS_NEWS_WRITE_TOKEN`，因此 `POST /api/integrations/news/batch` 当前为 `INACTIVE / FAIL-CLOSED`，返回通用 503 且未触发 CMS 写入。News 读取与发布时间修复已生效，但批量发布能力仍需独立授权完成最小权限和 Secret 配置后再受控启用。
- 本次未部署或修改 `56xyy.com`，未写 CMS、修改 Directus Schema、数据库或 Oracle，也未创建或泄露真实 Secret。

## 正式站 Directus 文章发布容量故障（2026-09-08 更新）

- `XYY-20260904-01` 已完成只读诊断：正式站创建文章时，Directus 向 `directus_revisions.data` 写入 14,939 的 revision JSON，超过 Oracle 列上限 4,000，触发 `ORA-12899` 并使发布失败。
- 本地 Directus 使用 PostgreSQL；`directus_revisions.data` / `delta` 为无界 `json`，`news.content` 为无界 `text`，不存在同一 4,000 上限。现有本地 revision 最大 3,229 bytes；未为诊断写入测试文章。
- Directus system seed 将 revision `data` / `delta` 定义为 JSON；当前本机 Knex `oracledb` 方言会将 JSON 编译为 `VARCHAR2(4000) CHECK (... IS JSON)`，而 `news` 的 `accountability=all` 会在创建时保存包含正文的完整 revision。因此故障属于正式 Oracle Directus 系统表容量/适配问题，不是权限、网站页面或 `news.content` 字段问题。
- Terra 只读诊断完成，Luna 独立验证 `PASS`，Nova Review `APPROVED`。现有 Oracle 测试只有脚本和迁移合同检查，没有真实 Oracle 大 revision 容量覆盖。
- 2026-09-08 用户已明确同意按备份、隔离验证后修复 `data` / `delta` 容量的方案继续；同一故障沿用 `XYY-20260904-01`，修复阶段上调 HIGH。CLOB 仍是待真实 Oracle 验证的目标，不将历史诊断 PASS 当作修复通过；不截断正文、不关闭 revision、不恢复 PostgreSQL → Oracle 迁移任务。
- 前阶段直接执行曾因 SSH 认证拒绝受阻，尚未确认实际 Directus 主机、运行版本或正式两列元数据；本机无 SQL*Plus/SQLcl 或运行中的 Oracle。用户随后明确只要求代码层面完成，正式库由运维查看；本轮不再尝试生产访问，也不要求用户提供 SSH 或数据库凭据。
- 本地预检资料已完成：`deploy/oracle19c/inspect-revision-capacity.sql` 与 `REPAIR-REVISION-CAPACITY.md`。版本查询、退出回滚与索引输出问题已返工；独立静态复测 `PASS`、Review `APPROVED (preflight only)`。资料没有可执行改表命令，运维说明已补充独立容量检查入口及其限制。
- 本轮代码新增 `deploy/oracle19c/lib/revision-capacity.mjs`、`verify-revision-capacity.mjs`，并在现有 `prepare-directus-oracle.sh` 的 bootstrap 后增加门禁：只读检查所选 CMS 配置对应账号的两列元数据，仅 `data` / `delta` 均为 CLOB 时通过，否则停止后续 schema、uploads 和 PM2 步骤。它不改变 bootstrap 类型定义、不自动扩容，也不证明 JSON 约束或在线 Directus 行为正确；CLI 仅读取指定目录 `.env`，运维需核对它与实际运行连接一致。
- 新增三份定向测试，覆盖大于 14,939 与 32,767 UTF-8 bytes 的中文 HTML 原样单次传递、`data` / `delta` 原始 Oracle 错误的安全 502，以及容量/参数/连接异常和门禁失败停止。首次验证发现的新测试类型错误与 flag 参数边界已修复；Luna 独立复测 `PASS`（5 files / 86 tests），完整 `CI=1 DIRECTUS_URL=http://127.0.0.1:9 npm run verify` 退出 0：类型检查、Lint、维护性、资源、54 files / 412 tests 与构建通过。使用不可达本机 CMS 地址，未访问真实 CMS。
- Nova Review `APPROVED (local code only)`，Sol 已验收当前本地代码范围；本任务代码侧完成，正式容量修复交运维，不把检测门禁当作扩容修复。文档同步后检查格式与 diff；无页面改动、提交或部署，不运行浏览器及 `verify:release`。
- 运维剩余事项：核对准确目标、两列类型/约束与运行版本，完成备份恢复和同版本 Oracle 隔离测试；验证大中文 JSON 的 create、update、revision read、revert 和历史数据一致性，再实施实际容量修复。这些真实 Oracle、CLOB/驱动和恢复测试均 `NOT RUN`，不作为本地代码验收的前置条件。未修改网站业务逻辑、第三方依赖、权限、真实 CMS/数据库，未提交、推送或部署。

## 容量工具与依赖修复发布（2026-09-08）

- `XYY-20260908-01`：用户随后授权推送 GitHub，并明确仅部署验收站 `wz.tomatopia.top`；不包含正式站、数据库扩容、Oracle 查询/迁移、真实 CMS 写入或权限/Secret 调整。
- 发布安全预检发现既有 `qs`、`sanitize-html` 两项中危依赖告警。用户明确允许最小修复后，升级 `sanitize-html` 至 2.17.7 及必要解析器子树，并以 override 将传递 `qs` 收敛到 6.16.0；未修改正文清洗白名单或业务逻辑。新增公告形态攻击样例与安全富文本回归。
- Terra 实施完成，Luna 最终独立 QA `PASS`，Nova `APPROVED (pre-deploy candidate)`；`npm run verify:release` 明确退出 0，54 files / 416 tests、E2E 39 passed / 7 个既有配置跳过、formal 3 passed、构建通过，`npm audit --omit=dev` 为 0 vulnerabilities。
- 精确 11 files 已提交并推送 GitHub main：`1e0a79b82ad873459d2ea22b6526d5a0444d692a`；同 SHA 的 CI Run `34203097300` 已成功。其余 7 个既有协作配置/状态日志文件保留在本地，未混入本次提交。
- 首轮部署因手动导出的 RELEASE_ID 被单测临时 Git 仓库继承、与临时 SHA 不符而在本地预检停止（415 passed / 1 failed），未上传或切换；不修改代码或跳过门禁，改用脚本默认自动 ID 重试后部署脚本退出 0，完整发布检查再次通过。验收站已运行 `20260908T081633Z-1e0a79b`，版本/环境/Schema 精确回读、健康双依赖及发现文件检查通过；启动瞬间端口尚未监听由既有等待循环恢复，无持续故障或回滚。
- 六份容量工具/说明及必要 helper 已按同提交分发到新 Release 非公开目录，SHA-256 与本地源码全部一致；CLI 仅验证 `--help`，没有执行 Oracle 查询、SQL、prepare 或 bootstrap。以下发布后结果取代前述脚本成功时点的状态，不能以脚本退出 0 宣称最终验收通过。
- 发布后 Luna QA `FAIL`：首页及 News 详情引用的两份 CSS、一份 JS 返回 404。Sol 核对确认文件存在、Node 本机读取为 200，Nginx 日志为 `Permission denied`；新 Release 根目录变为 `700 admin:admin`，旧 Release 为 `755 root:root`。问题来自 Sol 在脚本成功后使用 `rsync -aR` 补传工具，将隔离 `mktemp` 工作树的隐含根目录属性带入发布目录，并非容量门禁或依赖补丁导致。
- Sol 已按既有原子回退机制将 current 恢复到 `20260831T081814Z-b91a7b2` 并重启 xyy-web；实际 `/version`、双依赖健康、首页/News 详情和三份资源 200/MIME 核对通过。未删除任何 Release，未改 Nginx、权限、CMS、数据库或正式站；目标新发布仍未验收。
- 当前阻塞：依据 AGENTS 对任何环境权限变更的明确授权要求，等待用户允许仅将 `/var/www/xyy-web/releases/20260908T081633Z-1e0a79b` 根目录权限从 700 恢复为 755，再启用并完成独立 QA/Review；不递归修改权限、不修改其他目录。
- 独立收口：Luna 回退恢复验证 PASS；Nova 对新 Release 的发布结果为 REJECTED/待精确权限授权，认可回退边界和恢复证据，不撤销原代码候选的发布前批准。重新启用后仍须完整桌面/移动/console smoke 与最终 Review。
- 用户随后明确允许所述单目录权限恢复及重新启用。Sol 在确认 current 为旧 Release、新包 manifest 精确匹配后，仅执行目标根目录 chmod 755（属主 admin:admin 不变），原子启用同一发布包并重启 xyy-web；没有再次同步、构建、递归 chmod/chown 或修改其他配置。命令退出 0，线上身份、双依赖、三资源及首页/News 列表/详情全部通过，六工具公开 URL 404；六文件 SHA-256 与同 SHA 干净源码一致，CLI --help 退出 0。Luna 正在完成独立桌面/移动/console 复测，原阻塞授权条件已解除。
- 最终验收：Luna 发布后 QA PASS，覆盖首页、News 列表/详情 × 桌面 1440x900/移动 390x844 六组合，全部无横向溢出、console/pageerror/HTTP 错误，正文与可见图片正常，六张截图保存在 ignored `output/playwright/`。Nova 最终 `APPROVED (final staging release)`，Sol 核对授权、版本、GitHub CI、哈希、回退与 QA 后关闭任务；正式站、CMS/数据库与 Oracle 不在验收范围。当前轮只恢复单目录权限与更新本地状态日志，应用代码/构建没有再改，不重复扩张已通过的全量测试。
- 非阻断复发条件：未来若再次从临时工作树以 `rsync -aR` 向 Release 根补传，可能传播隐含目录属性；本次未修改发布脚本或扩大权限修复，后续同类同步须先核对目录元数据。当前 Release 资源访问正常，旧版本完整保留。

## 已完成

- 首页、产品、关于、案例、新闻、期刊及仓配专题页的响应式和动效问题已修复。
- 页面、组件、数据、样式、浏览器控制器、Directus 查询和服务端运行逻辑已按职责拆分，并由可维护性预算检查约束。
- CMS 内容可用时以后台数据为准；审核源码只在 CMS 不可用时提供故障回退。
- 首页案例固定为六个已确认品牌；公开运营数据统一从 `src/lib/claims/` 维护。
- `scripts/setup-cms.mjs` 可幂等创建十九个业务集合及初始化内容。
- 官网运行读取集合从 `config/cms-contract.mjs` 的 active 生命周期派生；13个运行集合与5个 legacy、1个 private 集合明确分离，不在运行权限代码中维护第二份数组。
- 内容权限同步：`Website Content Read-Only` 策略只获得运行集合的读取动作，不获得新增、修改或删除权限；实例具备自定义权限授权时可进一步下沉 `published` 过滤。
- 历史 Directus `contact_leads` 与其“仅创建留言”权限继续保留；XYY-WEB staging 的新留言已不再写入该集合，而是通过服务端 Integration 写入 XYY-xiansuo。正式主站尚未切换。

## 关键决策

- Web 代码发布与 Directus 数据库初始化分开执行，避免发布过程自动修改数据库。
- 管理员 Token 只临时用于建模和权限配置，不进入网站运行环境或 Git。
- XYY-WEB staging 运行时使用职责分离的 Directus 内容只读 Token 与 XYY-xiansuo Integration Token；Token 不进入浏览器、Git、Markdown 或日志。
- 后台已发布数据优先于静态回退内容，避免后台修改后前端仍显示旧数据。
- CMS 成功返回空数据代表运营侧当前没有已发布内容，必须保持为空；只有网络失败、超时和 HTTP 5xx 才能启用审核静态回退。
- HTTP 401/403 和非法响应必须明确失败，不能用静态内容掩盖权限或数据契约问题。
- 正式环境必须发布同一 Git 提交、完整资源包和对应 CMS 模型，不能只同步前端构建文件。

## 核心维护文件

- 页面与组件：`src/pages/`、`src/components/`。
- 内容与事实：`src/data/`、`src/lib/claims/`。
- Directus 请求与查询：`src/lib/directus-client.ts`、`src/lib/directus/request-state.ts`、`src/lib/directus-queries.ts`、`src/lib/directus-content-queries.ts`。
- 案例详情状态：`src/pages/cases/[slug].astro`。
- 服务端运行逻辑：`server/`、`server/runtime-permissions.mjs`。
- CMS 初始化：`scripts/setup-cms.mjs`。
- CMS 权限同步：`scripts/lib/content-policy-sync.mjs`、`scripts/sync-content-policy-permissions.mjs`。
- 发布：`scripts/deploy.sh`、`ecosystem.config.cjs`。
- 内容模型与维护说明：`docs/CMS_CONTENT_MODEL.md`、`docs/MAINTAINABILITY.md`。

## 已验证结果

- Astro：370 个文件，0 错误、0 警告、0 提示。
- ESLint：通过。
- Prettier：通过。
- 可维护性检查：通过。
- 资源检查：56 个引用资源和 103 个部署资源完整。
- Vitest：47 个测试文件、306 项测试通过。
- Playwright：39 项通过，7 项按项目配置跳过；发布后另以真实 Chromium 完成 staging 联系表单两次提交和桌面/移动验证。
- 正式域名契约：3 项通过。
- 生产构建：通过。
- `npm run verify:release`：完整通过。
- XYY-xiansuo：构建与 179 项测试通过；发布后 Integration health、鉴权、direct create / duplicate 与真实 website E2E 均通过。
- GitHub CI：最新 staging 同步提交 `2c75bcd` 的 Run `32788366421` 已通过；此前应用提交 `1c7b657` 与状态文档提交 `0578cd0` 也均通过。
- 验收站：`/version`、`/healthz`、CMS Verify、运行权限审计和核心页面 smoke test 均通过。
- 测试日志中的 Directus `fetch failed` 来自刻意使用不可达 CMS 验证回退和健康失败关闭，不是发布故障。

## 已知问题与未完成事项

- 以下项目是当前明确接受的技术债，不构成验收站故障，也不自动生成新的优化阶段。
- 5个 legacy 集合继续保留用于历史兼容，但已退出 runtimeRead、Seed、正常迁移和内容 Token 权限；没有明确删除收益前不处理。
- `faqs.page_key` 继续作为 legacy 兼容字段保留，FAQ 页面归属仍以 `faq_page` 关系和 `faq_pages.key` 为准；运行逻辑不依赖 `page_key`。
- `news.cover_image` 继续兼容字符串路径；当前没有资源加载故障，只有未来明确采用 Directus 文件上传时才需要独立迁移。
- `public/` 中森林期刊 PDF 体积较大，但当前部署和资源校验正常；只有发布包体或存储压力成为真实问题时再外置。
- 注册表中的 16 项全局公开事实均有结构化来源引用、审核人和审核日期，但仓库内未找到可独立核验的正式来源附件；全部 16 项的统计周期仍为 `null`，现有备注只如实说明缺失、待补录或不适用，不能据此声称证据闭环已经完成。
- 案例专属指标仍缺统一的来源文件、审核时间、公开授权和统计周期字段；在出现外部审计或公开证明要求前，只记录缺口，不启动新的证据模型建设。
- 开发机 `.env` 曾存在过期内容 Token；发布脚本使用受限服务器运行变量后已成功部署。若再次出现403，优先检查环境变量，不据此重构部署系统。
- 截图或历史沟通中曾出现过完整 Token；若相关 Token 尚未撤销，必须轮换。这是唯一需要按安全事件立即处理的条件项。
- 验收站 Directus 12.1.1 已建立两套独立运行策略：13个 active 运行集合只读、`contact_leads` 仅创建；5条 legacy read 权限已撤销，运行权限审计通过。
- 管理令牌已移出 Web `.env` 并保存在服务器独立的受限维护环境文件中；Web `.env` 只保留两枚运行令牌且权限为600。
- Directus 12 Community 当前未授权自定义权限规则，不能在策略层设置 `status=published` 过滤或字段级限制；官网所有内容查询显式过滤已发布状态，联系接口只接受表单白名单字段。不得通过修改许可代码绕过该限制。
- 仓库 HEAD 比验收站应用 SHA 多一个纯文档提交，不影响运行；无需仅为文档重新部署。
- 正式主站已运行；本次未重新验证 Release、DNS、TLS、Nginx、PM2 或生产 CMS，且不产生任何部署待办。
- 历史 Oracle 19c 迁移材料仅作历史背景保留，不属于当前未完成事项；除非用户未来明确提出，否则不规划、不验证、不执行。

## 已放弃或替换的方案

- 不再手工逐个补十五项权限，改为幂等脚本同步，避免漏配和口径不一致。
- 不再让静态兜底覆盖后台已发布内容，避免后台修改无法生效。
- 不把一枚高权限共享 Token 作为长期网站凭据。
- 不把代码发布与数据库初始化合并成不可控的一步。

## 项目结构审查（2026-08-14）

- 已对 `src/`、`scripts/`、`server/` 和 `deploy/` 完成依赖与目录结构审查；结构图共覆盖 748 个节点、1312 条关系。`scripts/` 与 `server/` 未发现循环依赖，现有页面、组件、运行服务和部署脚本总体已具备清晰职责边界，不需要进行全项目重写。
- 已向项目负责人说明本轮发现项的含义、用户影响与处理优先级；这些项目多数属于未来容易引发漏配、性能浪费或维护困难的结构风险，并不表示当前网站已经全部发生故障。代码修复尚未开始。
- 审查时发现 CMS 集合清单存在重复来源：运行时只读集合与 CMS 建模集合分别维护，新增集合后可能漏配权限；该项已在下方“第一批结构优化”中完成共享契约和完整性测试。
- 审查时确认一条类型依赖环：`src/data/about/types.ts` 经 `src/lib/directus.ts` 与 `src/lib/directus-content-queries.ts` 相互引用；该循环已在第一批优化中解除，`directus.ts` 继续仅作为兼容门面。
- 审查时发现 `/healthz` 单次会产生约二十个 Directus 请求；该项已在第一批优化中收敛为3个请求，逐集合读取验证保留在发布验收脚本中。
- 十二个仓配专题路由已共享页面布局，但静态回退内容仍重复写在各 Astro 页面中。后续可把每页配置迁入类型化的 `src/data/service-pages/`，路由只保留页面组装和独有内容，同时由同一数据源生成 CMS 初始化快照，降低页面与种子数据漂移风险。
- `src/styles/` 有 124 个 CSS 文件，其中存在较多仅转发两到五行导入的多层入口。现有单文件体积合理，不应重新合并成巨型样式文件；建议保留每个功能一个公开入口，并把嵌套导入层级压到一层。
- `public/` 约 158 MB，其中森林期刊 PDF 约 133 MB。当前发布脚本已复用未变化文件，短期部署可接受；长期应在附件上传、备份和恢复流程稳定后，将 PDF 迁入 Directus 文件库或对象存储，减少 Git 历史和发布包体积。
- 本次仅完成只读结构审查和状态记录，没有修改业务代码、接口、路由、页面或部署配置，也没有重新运行测试；上一节列出的已验证结果仍对应当前提交 `7fd7a8a`。

## 第一批结构优化（2026-08-14）

- 新增 `config/cms-collections.mjs` 作为18个公开内容集合、1个私有联系集合和19个全量CMS集合的统一名称契约；运行权限、权限同步和模型契约测试改为共用该清单。
- 新增集合完整性测试：CMS模型定义必须与共享契约完全一致、不得重名，`contact_leads` 必须保持在公开内容集合之外。
- `/healthz` 从逐一读取18个集合改为 Directus ping 加两枚令牌的权限映射检查，单次下游请求由约20次降为3次；任一内容集合不是受限只读权限，或联系令牌不能创建留言时仍失败关闭。逐集合真实读取和越权检查继续由 `cms:verify-runtime-permissions` 承担。
- 关于页仓点类型改为直接依赖 `src/lib/directus-types.ts`，解除 `about/types → directus兼容门面 → 内容查询 → about/types` 的导入循环；重新生成源码依赖图后确认无导入循环。
- 原子发布清单已加入 `config/`，并增加部署契约测试，避免本地构建正常但服务器缺少共享配置。
- README、CMS内容模型、维护性说明和生产修复交接文档已同步到新结构与健康检查语义。
- 全量 `npm run verify` 通过：Astro检查309个文件无错误、ESLint通过、454个文件通过维护性预算、55个引用资源与103个部署资源完整、21个测试文件共98项单元测试通过、生产构建通过。
- Playwright本地回归结果为35项通过、4项按配置跳过、1项桌面案例页在并发运行中加载超时；该用例随后单独重跑并在1.6秒内通过，移动端同用例也已通过，暂未发现与本轮改动相关的浏览器回归。
- 本轮未修改业务数据、页面文案、接口、路由或数据库，未提交Git、未推送、未部署。

## 发布与案例资源稳定性（2026-08-15）

- `02bad39` 与案例资源修复提交 `5f5ec44` 已推送到 GitHub `main`。
- 阻断原因为案例详情Hero继续依赖六张Unsplash外部图片；DOM已经完整返回，但外部图片连接长时间未结束，Playwright等待页面 `load` 事件超过30秒。该问题在发布门禁中连续影响桌面与移动端，不能继续按偶发超时忽略。
- 六张已确认案例封面已保存为本地WebP资源并统一写入案例事实数据，首页回退卡片和案例详情继续共用同一图片来源，页面不再依赖Unsplash可用性。
- 修复后案例详情桌面与移动端定向回归均通过，加载耗时约1.1至1.2秒；资源检查通过。随后完整门禁36项通过、4项按配置跳过，正式域名契约3项通过、生产构建通过。

## Directus 12 权限兼容与发布尝试（2026-08-15）

- `5f5ec44` 的验收站发布完成全部本地门禁和远端依赖安装后，新版 `/healthz` 因网站仍使用管理级兼容令牌返回503；原子发布脚本自动恢复到 `20260814T135305Z`，旧版恢复后健康检查为200，未留下半发布状态。
- 验收站实际 Directus 版本确认为12.1.1；Community 许可允许生产运行，但 `custom_permission_rules_enabled` 未授权，因此创建已发布内容过滤或字段级权限会被官方许可门禁拒绝。首次权限拆分在写入 Web 环境前停止，没有泄露或替换令牌。
- 已按实例真实能力建立 `Website Content Read-Only` 与 `Website Contact Create-Only` 两套策略、两个独立运行用户和两枚不同静态令牌；前者只能读取18个内容集合，后者只能创建 `contact_leads`，二者访问系统集合和对方集合均返回401/403。
- 项目权限契约已兼容两种合法模式：具备授权时读取权限为 `partial` 并下沉已发布过滤；Community 模式读取权限为 `full` 但仍只限指定集合和读取动作，应用查询继续统一过滤 `status=published`。联系字段白名单继续由服务端接口强制执行。
- 定向单元测试3个文件共16项通过；两枚运行令牌的真实权限审计通过。随后完整发布门禁通过：Astro 309个文件无问题、ESLint通过、454个文件通过维护性预算、55个引用资源与103个部署资源完整、21个测试文件共100项单元测试通过、Playwright 36项通过且4项按配置跳过、正式域名契约3项通过、生产构建通过。
- 权限兼容提交 `3f7f705` 已推送到 GitHub `main`。首次推送遇到GitHub HTTPS短暂超时，连通性恢复后重试成功，远端与本地提交一致。
- 验收站原子发布成功切换到 `/var/www/xyy-web/releases/20260814T171015Z`；PM2 `xyy-web` 在线、无重启，内部和外部 `/healthz` 均返回200与 `contactStorage: ok`，首页、Directus ping、robots、sitemap、llms.txt及本地案例封面资源均通过发布后检查。

## Directus 返回状态语义修复（2026-08-15）

- 本轮基于 Git SHA `62095867ce74aabf6352cc9d08a361d9e217d108` 开展，最终形成独立本地提交 `526f5b2`；未推送、未部署、未修改真实 Directus 或数据库。
- 统一内容请求语义：HTTP 成功且响应结构合法为 `success`，空数组或空单例保持为空；网络连接失败、超时和 HTTP 5xx 为 `unavailable`；401/403 为 `unauthorized`；其他异常 4xx、非法 JSON、缺少 `data` 或数据类型错误为 `invalid`。
- 所有集合和单例内容读取统一经过 Directus 请求适配层，并使用集中维护的 3000ms 超时；测试可以临时注入更短超时，且每个测试后都会恢复默认请求器和超时。
- 只有 `unavailable` 可以使用审核静态回退，并输出带集合、操作、原因和可选 HTTP 状态的 `[directus:fallback]` 日志；相同降级日志在短时间内去重。401/403 与非法响应会抛出包含集合和错误类型的明确错误。
- 案例列表在 CMS 正常返回空数据时保持为空；案例 slug 不存在或取消发布时返回真正的 HTTP 404，不再 302 跳转或恢复静态详情。CMS 网络失败、超时或 5xx 时，审核静态案例仍可访问。
- 修改范围：Directus 客户端与两组查询、状态错误适配器、Directus 门面、案例详情路由，以及相关 Vitest、Playwright 契约测试；未修改视觉、业务文案、公开数字、CMS 模型、权限、部署、Oracle 或依赖版本。
- 测试先行证据：旧实现下定向 Vitest 为12项失败、2项通过；案例空 CMS 的 Playwright 契约为1项失败、1项通过，失败原因均符合待修语义。实现后5个Directus定向测试文件共33项通过，案例与回退定向 Playwright 3项通过；另有一条空记录校验测试先失败再由统一客户端校验修复。
- 首次完整发布验证因新增测试文件332行超过220行维护预算而失败；随后按成功/空数据与故障分类职责拆成195行和157行两个测试文件，没有放宽预算或删除断言。
- 最终实际验证：`npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run test:e2e`、`npm run test:formal-contract`、`npm run build`、`npm run verify:release` 均通过；最终为311个Astro文件无问题、456个文件通过维护预算、112项单元测试通过、37项E2E通过且5项按配置跳过、3项正式域名契约通过、生产构建通过。

### 第一阶段文件范围

- 已修改：`DEV_STATE.md`、`src/lib/directus-client.ts`、`src/lib/directus-content-queries.ts`、`src/lib/directus-queries.ts`、`src/lib/directus.ts`、`src/pages/cases/[slug].astro`、`tests/e2e/contracts.spec.ts`、`tests/unit/directus-content-resilience.test.ts`、`tests/unit/directus-resilience.test.ts`。
- 第一阶段新增且仍未跟踪：`src/lib/directus/request-state.ts`、`tests/unit/directus-error-semantics.test.ts`。
- `DEV_STATE.md`、两组 Directus 查询、案例契约测试和 `directus-resilience.test.ts` 在第二阶段继续发生修改，因此属于两阶段共享文件；不能仅凭最终 `git diff` 自动归属某一个阶段。

## 公开业务事实唯一来源与 CMS 防漂移治理（2026-08-15）

- 本轮以第一阶段提交 `526f5b2` 为父提交，形成独立的第二阶段本地提交；未推送、未部署、未连接或修改真实 Directus，也未修改数据库、权限、页面视觉、公开审核值或依赖版本。
- 第一阶段前置条件已确认：Directus 请求能够区分 `success`、`unavailable`、`unauthorized` 和 `invalid`，成功空数据不回退，401/403 与非法响应明确失败，案例取消发布返回真实 404；相关定向测试 18 项全部通过。
- `src/lib/claims.ts` 继续作为稳定公开入口，新增注册表验证、页面范围校验、审核状态与过期校验、统一展示值拆分、严格占位符插值、CMS 首页统计解析和旧格式映射等小型职责模块，避免事实解析重新堆入巨型文件。
- 全局公开事实只能从 claims 注册表读取；调用方必须通过 `getApprovedClaim()`、`getClaimText()` 或 `getClaimPresentation()` 并传入明确页面范围。`CLAIM_TEXT` 仅作为兼容导出保留，运行时只包含确实允许 `*` 全站使用的事实，不能绕过页面权限。
- CMS 首页统计的新契约使用 `claimKey`；CMS 即使同时提交冲突的 `value` 或 `unit`，页面仍使用审核注册表的值，并输出去重的兼容警告。旧记录只能通过集中、受测试保护的稳定数字 ID 映射；禁止按 CMS 数值、标签、单位、说明、其他自由文本或当前排序猜测事实。没有稳定 ID 或映射未命中时明确判为非法。
- 旧格式兼容层是上线迁移期间的临时措施，只支持 `LEGACY_HOMEPAGE_CLAIM_BY_ID` 中明确列出的旧记录 ID。自由文本指纹映射已删除，并有“文本完全匹配但缺少稳定 ID 仍失败”的回归测试。待真实 CMS 全部写入合法 `claimKey`、迁移结果经过验收并确认没有旧记录后，应删除 ID 映射与 `[claims:legacy]` 警告路径。
- CMS 文本占位符必须以 `interpolateClaims(value, { pageScope, source })` 解析；未知、未审核、已过期或当前页面越权的 claim 均明确失败，不再原样输出 `{{...}}`。错误只包含 claimKey、页面范围和有限来源定位，不包含 Token 或完整 CMS 正文。
- 首页统计、FAQ、服务 seed、首页可见文本、品牌数据、案例页公共文案、SEO/JSON-LD 与 `llms.txt` 已改为引用同一 claims 注册表；数据卡的值和单位由统一 presentation 层拆分，防止重复单位。
- CMS seed 生成源改为保存 `claimKey` 或 `{{claimKey}}`，生成前统一验证引用；`npm run cms:generate-faq-seeds` 成功生成 17 个页面的 100 条 FAQ，`npm run cms:generate-content-seeds` 成功生成 12 个服务页、14 期期刊、6 个案例详情及关于/站点内容。两个生成输出 `scripts/data/approved-faq-seeds.mjs` 和 `scripts/data/approved-cms-page-seeds.mjs` 与 Git 中现有内容一致，没有产生工作树差异。
- CMS 字段 Schema 未修改：`scripts/data/core-content-collection-definitions.mjs`、`scripts/setup-cms.mjs`、`server/runtime-permissions.mjs` 和 `scripts/data/cms-admin-translations.mjs` 相对 HEAD 均无差异；`scripts/data/content-management-collection-definitions.mjs` 只有首页统计字段的后台说明文字由硬编码 `150+` 改为引用审核事实注册表，没有增加、删除或更改字段名、类型、接口、选项、关系或权限。
- 漂移检查覆盖 `src/**/*.{astro,ts,tsx}`、`scripts/**/*.{mjs,json}` 和测试源码，并对非业务百分比等明确场景设置窄范围排除；页面、seed 和测试不得重新维护一份全局审核数字。案例专属指标继续留在案例域，只记录证据缺口。
- 测试先行证据：新增测试在旧实现下因缺少严格插值模块和 presentation API、未知 claimKey 被接受、CMS 值直接透传而失败；实现后新增两组核心契约测试 18 项全部通过。
- 实际验证结果：阶段一前置定向测试 18 项通过；自由文本指纹回归测试在修复前按预期 1 项失败、4 项通过，删除指纹后 claims 定向测试 3 个文件共 26 项通过；单元测试 24 个文件共 137 项通过；`npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run test:e2e`、`npm run test:formal-contract`、`npm run build` 和 `npm run verify:release` 全部通过。最终门禁为 319 个 Astro 文件无问题、464 个文件通过维护预算、38 项 E2E 通过且 6 项按项目配置跳过、3 项正式域名契约通过、生产构建通过。
- 首次完整门禁发现三个已有或本轮触及的文件超过维护预算；通过复用类型和抽取测试夹具完成拆分，未提高阈值、未删除测试、未降低断言。测试期间出现的 `[directus:fallback]` 网络日志来自本地不可达 CMS 的受控降级验证，不代表真实环境已经连接或验证。

### 第二阶段文件范围

- Claims：`src/lib/claims.ts`、`src/lib/claims/cms.ts`、`src/lib/claims/interpolation.ts`、`src/lib/claims/legacy-mapping.ts`、`src/lib/claims/presentation.ts`、`src/lib/claims/validation.ts`、`src/lib/claims/fulfillment-performance.ts`、`src/lib/claims/fulfillment-scale.ts`、`src/lib/claims/quality.ts`。
- Directus 契约：`src/lib/directus-content-queries.ts`、`src/lib/directus-interpolation.ts`、`src/lib/directus-queries.ts`、`src/lib/directus-types.ts`。
- 页面与数据：`src/data/brand/core.ts`、`src/data/brand/home.ts`、`src/data/home/cms-fallbacks.ts`、`src/data/home/faqs.ts`、`src/pages/cases.astro`、`src/pages/index.astro`、`src/pages/llms.txt.ts`。
- Seed 与生成：`scripts/data/approved-homepage-stats.mjs`、`scripts/data/approved-services.mjs`、`scripts/data/cms-seed-config.mjs`、`scripts/data/content-management-collection-definitions.mjs`、`scripts/generate-cms-content-seeds.mjs`、`scripts/generate-faq-seeds.mjs`、`scripts/lib/claim-reference-validation.mjs`、`scripts/migrate-unified-content.mjs`、`scripts/sync-approved-cms-content.mjs`。
- 测试：`tests/e2e/contracts.spec.ts`、`tests/e2e/home-product.spec.ts`、`tests/formal/production-origin.spec.ts`、`tests/unit/claims-contract.test.ts`、`tests/unit/claims.test.ts`、`tests/unit/cms-sync.test.ts`、`tests/unit/directus-resilience.test.ts`、`tests/unit/directus.test.ts`、`tests/unit/homepage-claims-contract.test.ts`。
- 状态记录：`DEV_STATE.md`。
- 第二阶段新增文件：`scripts/lib/claim-reference-validation.mjs`、`src/lib/claims/cms.ts`、`src/lib/claims/interpolation.ts`、`src/lib/claims/legacy-mapping.ts`、`src/lib/claims/presentation.ts`、`src/lib/claims/validation.ts`、`tests/unit/claims-contract.test.ts`、`tests/unit/homepage-claims-contract.test.ts`。

### 第二阶段准确验证命令

- `npx vitest run tests/unit/homepage-claims-contract.test.ts`：删除自由文本指纹前为 1 项失败、4 项通过，证明相同自由文本在没有稳定 ID 时会被旧实现错误接受。
- `npx vitest run tests/unit/homepage-claims-contract.test.ts tests/unit/claims-contract.test.ts tests/unit/claims.test.ts`：3 个文件、26 项通过。
- `npm run cms:generate-faq-seeds`：成功，生成 17 个页面的 100 条 FAQ；生成文件无 Git 差异。
- `npm run cms:generate-content-seeds`：成功，生成 12 个服务页、14 期期刊、6 个案例详情及关于/站点内容；生成文件无 Git 差异。
- `npm run format:check`：通过。
- `npm run typecheck`：319 个文件，0 错误、0 警告、0 提示。
- `npm run lint`：通过。
- `npm run test`：24 个文件、137 项通过、0 失败、0 跳过。
- `npm run test:e2e`：38 项通过、0 失败、6 项按项目配置跳过。
- `npm run test:formal-contract`：3 项通过、0 失败、0 跳过。
- `npm run build`：通过。
- `npm run verify:release`：通过；聚合门禁再次完成类型、Lint、464 个文件维护预算、55 个引用资源、103 个部署资源、137 项单元测试、38 项 E2E、3 项正式域名契约和生产构建。

### 两阶段提交拆分与独立验证

- 第一阶段已独立提交为 `526f5b2 修复 Directus 返回状态语义`，包含10个文件；第二阶段以该提交为父提交，包含39个文件。共享查询和测试文件按具体代码块拆分，没有把 claims API、`claimKey` 或页面范围校验混入第一阶段。
- 在独立临时 worktree 检出 `526f5b2` 后，`npx vitest run tests/unit/directus-error-semantics.test.ts tests/unit/directus-content-resilience.test.ts tests/unit/directus-resilience.test.ts` 为3个文件、18项通过；`npm run typecheck` 检查311个文件，0错误、0警告、0提示。
- 临时 worktree 首次执行 `npm ci` 长时间无进展后被中止；残留的部分依赖目录一度被 Astro 当成项目文件扫描并导致内存耗尽。将该临时目录移出 worktree 后，第一阶段 typecheck 正常通过，证明该失败来自临时验证环境而不是提交代码。临时 worktree 与残留依赖目录均已清理。
- 第二阶段提交前重新执行 `npm run format:check` 与 `npm run test`，结果为格式通过、24个测试文件共137项通过。两个提交均仅存在于本地，未推送、未部署。

## Directus CMS 模型契约与迁移准备（第三阶段，2026-08-15）

- 基线为第二阶段本地提交 `9cb7b426547582a84d865b18bc24397685aefe5c`。开始前工作树干净；第一、第二阶段快照保存为 `/tmp/xyy-phase1-2-status.txt` 与 `/tmp/xyy-phase1-2-tracked.patch`，两者均为空文件且 SHA-256 均为 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`。开始时没有未跟踪文件，因此未创建空压缩包。
- 前置回归通过：Directus 状态分类、成功空数据、401/403/invalid、案例真实 404、claims、claimKey、占位符、首页统计和事实漂移相关 6 个测试文件共 44 项通过，确认第一、第二阶段没有退化。
- 审查发现原实现存在 `config/cms-collections.mjs → scripts/data/cms-contract.mjs` 的运行反向依赖，已将唯一机器可读主契约移动为 `config/cms-contract.mjs`，模型版本为 `2026-08-phase3`。当前运行 import graph 为 `server/runtime-permissions.mjs → config/cms-collections.mjs → config/cms-contract.mjs`；`scripts/data/cms-contract-definitions.mjs` 仅在脚本侧绑定字段定义，`config/` 与 `server/` 不再依赖 `scripts/`。最小发布包测试只复制真实发布目录 `config/` 与 `server/`，可以成功导入运行权限模块。
- 集合生命周期分类：13 个 active（`homepage_content`、`faq_pages`、`services`、`warehouses`、`cases`、`news`、`faqs`、`publications`、`service_pages`、`about_content`、`about_history`、`about_honors`、`site_settings`）；5 个 legacy（`homepage_stats`、`case_details`、`case_stats`、`service_stats`、`service_features`）；1 个 private（`contact_leads`）。private 集合不参与内容 seed 或合同迁移。
- 稳定身份规则：沿用 `key`、`slug`、`issue` 等既有不可变字段；为 `warehouses`、`faqs`、`about_history`、`about_honors`、`service_features` 定义只读、必填、唯一 `content_key`；为 `homepage_stats`、`case_stats`、`service_stats` 定义只读、必填、唯一 `metric_key`。所有新 seed key 均显式存在于审核源数据；问题、标题、标签、名称、排序、年份、数组索引、显示文案、数字和单位不再生成稳定身份，并有改文案、改排序、改年份仍保持同一身份的测试。
- FAQ 归属以 `faq_page` 关系为唯一权威来源，前端按 `faq_page.key` 查询；seed 保存 `faqPageKey` 并在 setup 时解析当前环境真实关系 ID。`page_key` 暂时保留为只读 legacy 字段，只用于迁移核对；真实 CMS 完成关系迁移、验证全部一致且新代码不再读取后方可删除。
- setup 只创建缺失集合、安全缺失字段和关系，并按稳定身份补齐缺失 seed；已匹配的集合和字段元数据不会重复写入，已存在的运营正文不会被覆盖。有数据集合缺少 required+unique 身份字段时，迁移按“创建 nullable/非 unique 字段 → 回填 → 重新读取验证无 null → 验证无重复 → 收紧 required → 增加 unique → 完整 verify”分阶段执行；中途失败可以安全重跑，完成后第二次计划为零变更。现有字段 type、required、unique、default、singleton、relation target、on_delete 不兼容时明确返回 `migration_required`。
- 第三阶段提交前审查复现了 Singleton Seed 覆盖风险：稳定身份不一致时，旧实现会把审核 seed 整条 PATCH 到现有单例。当前 setup 只允许在稳定身份为空且所有 seed 管理的业务字段均无内容时初始化 Singleton；身份相同的现有 Singleton 始终 no-op，不同步或补齐正文；身份缺失或不一致但已有内容时返回 `singleton_migration_required`，且错误不包含运营正文。setup-cms 不是运营正文同步工具；运营内容只能通过 Directus 后台、受控内容同步或显式迁移维护。修复前新增回归测试为 6 项失败、11 项通过；修复后 Singleton/Setup 两个定向测试文件共 18 项通过，第三阶段 9 个定向文件共 63 项通过。最终 `npm run verify:release` 以状态码 0 完成：337 个 Astro 文件无诊断、482 个文件通过维护预算、193 项单元测试通过、38 项 E2E 通过且 6 项按配置跳过、3 项正式域名契约通过、生产构建通过。真实 CMS 未执行 dry-run 或迁移；第三阶段作为独立本地提交管理，尚未推送或部署。
- verify 输出模型版本、集合总数与 active/legacy/private 数量，并阻塞字段、关系、singleton、稳定身份缺失或重复等关键契约错误。已确认的旧字符串文件字段进入显式 allowlist，必须输出原因和删除条件；未知例外仍然阻塞。
- 新增 `npm run cms:migrate-contract`。默认只读 dry-run；`--apply` 还必须提供与模型版本完全一致的确认值。每个旧 ID 映射必须同时包含 collection、record ID、target stable key 与 expected-before 精确断言；只先按 ID 选中记录，再验证内容，验证不一致即 `manual_mapping_required`。旧 `homepage_stats` 通过审核记录 ID 精确回填 `metric_key`，首页单例内嵌 stats 只有携带稳定 ID 且满足同一审核断言时才能回填 `claimKey`；缺少稳定 ID 时禁止按数组顺序推断。其他迁移只接受稳定 slug/key/issue、审核 seed key或人工确认的精确记录 ID 映射，禁止使用文本寻找记录。
- apply 前会将受影响的非 private 集合保存到 Git 已忽略的 `output/cms-migrations/`，写入 SHA-256 后才允许外部修改。Directus API 不提供跨请求原子事务，因此实现采用 fail-fast、逐步幂等、保留快照和安全重跑，不声称原子迁移；apply 后自动验证剩余变更、稳定身份、FAQ 关系、claimKey 和完整 Schema。
- seedPolicy 已统一：active 为 `normal`，legacy 为 `migration_only`，private 为 `never`。`case_details`、`case_stats`、`service_stats`、`service_features` 等 legacy Schema 仅为旧数据迁移、核对和必要回滚保留，全新 CMS 不再 Seed legacy 内容；`contact_leads` 不参与 seed、内容读取、迁移或快照，verify 只检查它的集合、字段和关系 Schema。
- CMS 生成结果已重新生成并保留第三阶段差异：17 个页面的 100 条 FAQ 增加显式稳定 `content_key` 与 `faqPageKey`；12 个服务页、14 期期刊、6 个案例详情以及 history、honor 内容使用显式稳定身份。生成文件仍由脚本产生，没有直接手改 generated 输出；legacy case/service 指标不再进入新 seed 输出。
- 测试先行证据：验收补强前，legacy 集合仍被 normal seed、FAQ key 仍由数组索引生成的测试按预期失败；实现后第三阶段定向测试 9 个文件、86 项通过，第一、第二阶段回归 6 个文件、44 项通过。Schema 分阶段迁移拆分后的 3 个定向文件共 16 项通过，覆盖创建、回填、远端无空值/无重复校验、约束收紧、中断重跑、零变更和快照边界。
- 最终验证：两项 CMS seed 生成命令分别生成 17 页/100 条 FAQ 与 12 个服务页、14 期期刊、6 个案例详情；`npm run format:check` 通过；`npm run typecheck` 检查 336 个文件，0 错误、0 警告、0 提示；`npm run lint` 通过；维护性预算检查 481 个文件通过；`npm run test` 为 31 个文件、183 项通过；`npm run test:e2e` 为 38 项通过、6 项按配置跳过；`npm run test:formal-contract` 为 3 项通过；`npm run build` 通过；`npm run verify:release` 以状态码 0 完成；`git diff --check` 通过。
- 真实 CMS 尚未执行 dry-run 或 apply；没有连接真实 Directus、修改真实 Schema 或迁移真实内容。第三阶段代码、测试和文档已完成本地验收并作为独立本地提交管理，但尚未推送或部署，不能描述为“CMS 已迁移”。

### 第三阶段主要文件范围

- 主契约与定义：`config/cms-contract.mjs`、`config/cms-collections.mjs`、`scripts/data/cms-contract-definitions.mjs`、`scripts/data/*collection-definitions.mjs`、`scripts/data/cms-field-builders.mjs`、`scripts/data/cms-seed-config.mjs`。
- setup/verify 运行时：`scripts/setup-cms.mjs`、`scripts/verify-production-cms.mjs`、`scripts/lib/cms-setup-runtime.mjs`、`scripts/lib/cms-seed-runtime.mjs`、`scripts/lib/cms-navigation-runtime.mjs`、`scripts/lib/cms-contract-runtime.mjs`。
- 迁移：`scripts/migrate-cms-contract.mjs`、`scripts/lib/cms-contract-migration.mjs`、`scripts/lib/cms-contract-schema-migration.mjs`、`scripts/lib/cms-contract-snapshot.mjs`、`package.json` 的 `cms:migrate-contract` 脚本。
- FAQ 读取：`src/lib/directus-queries.ts`、`src/lib/directus-types.ts`。
- Seed 生成：`scripts/generate-faq-seeds.mjs`、`scripts/generate-cms-content-seeds.mjs`、`scripts/data/service-page-slugs.mjs`、两份 generated seed 及稳定仓库 seed。
- 测试：`tests/unit/cms-contract.test.ts`、`tests/unit/cms-contract-runtime.test.ts`、`tests/unit/cms-contract-migration.test.ts`、`tests/unit/cms-contract-schema-migration.test.ts`、`tests/unit/cms-contract-snapshot.test.ts`、`tests/unit/cms-seed-identity.test.ts`、`tests/unit/cms-setup-contract.test.ts`，以及直接调整的 setup、Directus 和最小发布包既有测试。
- 文档：`docs/CMS_CONTENT_MODEL.md`、`DEV_STATE.md`。

## Web 运行权限残余收口（第四阶段，2026-08-15）

- 基线为第三阶段独立提交 `ad54a4bd6aaa081f9109ac8ba65f4ff383eb5f5b`；开始前工作树干净。第四阶段完成后作为独立本地提交管理，未推送、未部署，未主动执行真实 CMS 权限审计，也未修改真实 Token、策略或数据。首次未隔离构建曾向本机既有 Directus 配置发出一次 `site_settings` 只读请求并收到403，不能表述为“完全未连接真实 CMS”；后续完整验收均使用本机不可达地址和虚拟 Token 隔离运行。
- 确认并修复三项运行风险：内容读取与联系写入不再回退 `DIRECTUS_TOKEN`；缺少任一专用 Token 或两枚专用 Token 相同时运行契约失败；内容运行集合由主 CMS 契约的 active 生命周期派生，排除5个 legacy、`contact_leads` private 集合及显式 `runtimeRead=false` 的 active 集合。`DIRECTUS_TOKEN` 继续仅供 setup、迁移和管理权限脚本使用。
- `/healthz` 继续只执行1次 Directus ping 和2次 `/permissions/me`，证明服务就绪、双 Token 存在且不同、13个运行集合可读、联系 Token 可创建留言；不逐集合请求内容，也不冒充完整最小权限审计。
- `cms:verify-runtime-permissions` 负责完整 mock 可验证契约：内容 Token 可读取全部运行集合且无写动作，不能读取 legacy、private、咨询或系统集合；联系 Token 仅可创建 `contact_leads`，不能读取/修改/删除/分享留言，不能读取运行、legacy 或系统集合。允许端点必须返回2xx，禁止端点只有401/403可证明拒绝；2xx、404和网络错误均失败关闭，网络错误标记为 `permission_verification_unreachable`。
- Directus 12 Community 的集合 create 权限可能返回 `fields=['*']`，因此字段限制模式明确为 `application_enforced`；服务端只把 `name`、`phone`、`company`、`email`、`service`、`message` 写入 Directus，浏览器提交的 `status`、`source`、时间和系统字段会被丢弃，不声称 CMS 已实施不存在的字段级策略。
- 集合导出消费者已逐项核查：`CMS_CONTENT_COLLECTIONS` 只供 Web 运行权限与 `Website Content Read-Only` 权限同步使用，二者都需要13个运行集合；`CMS_ALL_COLLECTIONS` 只用于19个 Schema 定义的完整性校验；`CMS_LEGACY_COLLECTIONS` 只用于负权限映射与拒绝探测；`CMS_PRIVATE_COLLECTIONS` 只用于边界断言。未发现把运行集合误用于 Schema、seed、迁移或快照的消费者。
- 测试先行证据：旧实现下4个定向测试文件为8项失败、18项通过，另有权限审计测试因脚本导入即调用 `process.exit(1)` 无法运行；失败证据包括共享 Token 实际用于留言 POST、health 对相同 Token 继续请求下游、运行集合无法排除 legacy，以及审计缺少可注入的失败关闭语义。修复后5个定向测试文件共37项通过；`npm run format:check` 与 `npm run typecheck` 已通过。
- 首次未隔离环境执行完整门禁时，本机既有 Directus 配置在构建 `/404.html` 读取 `site_settings` 时返回403，门禁据此正确失败；未执行权限审计、写请求或数据修改。随后显式使用本机不可达地址和两枚虚拟且不同的测试 Token 重新执行 `npm run verify:release`，退出码为0：338个 Astro 文件无诊断、ESLint通过、483个文件通过维护预算、55个引用资源与103个部署资源完整、33个单元测试文件共206项通过、38项 E2E 通过且6项按配置跳过、3项正式域名契约通过、两次生产构建通过，`git diff --check` 通过。该结果只证明本地代码和 mock/fixture 权限契约，不代表真实运行权限已重新审计。

## 发布身份与运行可追溯治理（第五阶段，本地验收完成）

- 基线为第四阶段独立提交 `54fa9e64642403548f2c3e04f0242e427445aa30`；开始前工作区干净。本阶段只建立 Release Identity、`/version`、部署版本核对、CI 候选身份、测试环境隔离证明和性能观察基线，不修改 CMS、运行权限、页面或性能实现。
- 已新增唯一 Release Identity 契约：字段为 `schemaVersion`、完整 Git SHA、派生短 SHA、包含短 SHA 的 Release ID、UTC 构建时间、显式环境和从 CMS 主契约读取的模型版本；Manifest 拒绝未知字段，不能携带 Token、密码、Cookie、私钥、内部地址或部署路径。
- 部署入口现在会在构建、SSH 和上传之前拒绝已修改、已暂存或未跟踪文件，生成与当前提交绑定的 `release-manifest.json` 并放入独立 Release 根目录；新版本切换和带 Manifest 的回滚都必须同时通过 `/healthz` 与版本身份核对。旧 Release 没有 Manifest 时保留首次兼容回滚，但输出 `legacy_previous_release_identity_unavailable`，不能声称身份已验证。
- `/version` 与 `/healthz` 职责分离：前者返回不可缓存的公开 Release 身份，Manifest 缺失或非法时安全返回503；后者继续只证明 Directus 与双 Token 权限映射就绪。外部健康检查支持精确核对 Git SHA、Release ID、环境和 CMS 模型版本；未提供预期值时只验证基本结构，不声称目标版本匹配。
- CI 使用 `github.sha` 和 `environment=ci` 生成候选 Manifest，仍只有 `contents: read` 权限，不具备生产部署能力；CI、Playwright 与正式域名契约显式覆盖不可达 Directus 地址和虚拟双 Token，不依赖开发者机器的 `.env`。
- 测试先行证据：实现前两个新增定向测试文件因缺少契约、Manifest 生成器、`/version`、脏工作区门禁、版本核对和 CI SHA 绑定而失败。首次失败测试在重构前导入旧 `scripts/health-check.mjs` 时，旧脚本的顶层副作用对现有验收地址执行了一次只读健康检查；未写入数据、未部署、未修改服务器。脚本现已改为仅在 CLI 直接执行时发起请求，测试导入不再访问网络。
- 最终本地验证：4个 Release/部署/健康定向测试文件共43项通过；可维护性检查曾发现 `scripts/deploy.sh` 超出200行预算1行，已通过压缩同一职责代码恢复到预算内。`npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run test` 和 `npm run verify:release` 均通过；聚合门禁为343个 Astro 文件无诊断、488个文件通过维护预算、55个引用资源与103个部署资源完整、35个单元测试文件共230项通过、38项 E2E 通过且6项按配置跳过、3项正式域名契约通过、生产构建通过，`git diff --check` 通过。第五阶段作为独立本地提交管理，提交 SHA 以 Git 历史为准；当前状态为 `PHASE_5_LOCALLY_VERIFIED`、`RELEASE_IDENTITY_CONTRACT_VERIFIED`、`VERSION_ENDPOINT_VERIFIED`、`MOCK_DEPLOYMENT_IDENTITY_VERIFIED`、`PERFORMANCE_BASELINE_RECORDED`、`REAL_DEPLOYMENT_NOT_EXECUTED`、`REAL_VERSION_NOT_VERIFIED`、`LOCALLY_COMMITTED`、`NOT_PUSHED`、`NOT_DEPLOYED`。
- 已登记用户提供的 2026-08-15 桌面 PageSpeed 实验室基线：性能82、无障碍100、最佳做法100、SEO100、FCP 0.8秒、LCP 1.9秒、TBT 0毫秒、CLS 0、Speed Index 4.0秒；无 CrUX 数据且无法确认当时 Git SHA。本阶段没有修改任何性能代码，真实部署后需结合 `/version` 重新采集。

## 历史下一步（已关闭，不是当前任务队列）

以下条目保留为 2026-08-15 的过程背景，后续记录已完成或替代其中多项。不得据此自动恢复主站发布、生产 CMS、数据库迁移或 PostgreSQL → Oracle 19c 工作。

1. 人工审查两个连续的本地提交，重点确认成功空数据、案例 404、页面范围、CMS `claimKey`、旧格式映射和严格占位符符合运营预期。
2. 对真实 CMS 先完成独立数据库备份，再使用第三阶段工具执行只读 dry-run；人工审核所有 `manual_mapping_required`、稳定身份、FAQ 关系和 claimKey 计划后，才可决定是否 apply。
3. 真实 apply 后运行完整 verify，并确认第二次 dry-run 为 0 changes；达成前不得删除 `page_key`、旧首页统计 ID 映射或 legacy 文件字段例外。
4. 建立案例专属 evidence 模型，明确来源文件、统计周期、审核时间和公开授权；在依据不足前不得将案例指标并入全局 claims，也不得补造证据。
5. 人工审查第五阶段 Release Identity、`/version`、部署与回滚身份核对 Diff；审查通过后再决定是否建立独立提交和执行真实部署。本轮代码治理到此结束，不创建第六阶段。
6. 补齐 16 项全局事实的正式来源附件和统计周期；对于确实不适用统计周期的事实，应由业务审核后形成明确证明，而不是由代码推断。

## 真实环境契约收口补丁（2026-08-15，不是第六阶段）

- 基线为已发布提交 `1c3c81e336d3fc67de74ccd5d550981c9603052d`，开始前工作区干净。本补丁仅收口 CMS 目标契约和 dry-run 计划，当前仍未提交、未推送、未 apply、未部署。
- 真实预检确认5个 legacy 集合不参与运行读取或 seed，因此取消 `homepage_stats.metric_key`、`case_stats.metric_key`、`service_stats.metric_key`、`service_features.content_key` 的新增、映射、必填与唯一要求；legacy 继续保留现有 Schema，但 verify 不读取其记录，也不再产生人工映射。
- Active 要求保持不变：`warehouses.content_key`、`faqs.content_key`、`about_history.content_key`、`about_honors.content_key` 与 `homepage_content.stats.claimKey` 仍必须经人工确认；FAQ 继续以 `faq_page` 关系为唯一页面归属。
- 该轮曾按预检快照将 `cases.metrics`、`news.summary`、`news.published_at` 视为 string；真实 Apply 后的严格复核确认最终 Schema 分别为 text、text、timestamp，后续“Verify 契约漂移收口”已以真实迁移结果更正这项历史判断。
- 迁移读取边界：正常内容快照只包含 active 迁移集合；private `contact_leads` 只读取字段元数据并只允许上述两个默认值的 schema-only 计划，不读取、快照、修改或回填任何留言记录。
- 测试先行证据：旧实现下4个定向测试文件共14项失败、30项通过，失败准确覆盖 legacy 人工映射、legacy 身份字段、三项类型升级、private 记录读取边界和缺失安全 Schema 计划；实现后5个定向测试文件共45项通过。维护性预算曾因新增用例令两个测试文件超过220行而失败，随后按“真实环境契约收口”职责拆出专用测试文件，没有提高阈值或删除断言。
- 本地验证使用不可达 Directus 地址与两枚虚拟 Token 隔离执行：Prettier、Astro typecheck、ESLint、维护性、资源检查、245项 Vitest、38项 Playwright（6项按配置跳过）、3项正式域名契约、构建和 `npm run verify:release` 全部通过。未隔离的首次聚合构建因开发机既有 CMS Token 对 `site_settings` 返回403而正确失败，未发生写请求；隔离重跑退出码为0。
- 真实验收 CMS 只读复检：`cms:verify` 不再因4个 legacy 身份字段或 `cases.metrics`、`news.summary`、`news.published_at` 的 string 类型失败；它仍按预期阻塞4个 active 身份字段、`news.slug` unique 和两项联系默认值。默认 `cms:migrate-contract` dry-run 产生144项 `manual_mapping_required`（仓库12、FAQ100、发展历程9、荣誉15、首页 claimKey 8），legacy 映射0；`singleton_migration_required`、重复身份、关系错误与 contract review 均为0。Schema 计划为4个 active nullable 身份字段、`news.slug` unique 和两项 private schema-only 默认值。
- 范围外状态不变：内容 Token 仍有5条 legacy read 权限待精确撤销；数据库和附件备份虽已完成同机校验，但 `offsite_backup_missing`。两项均未在本补丁中处理，并继续阻止真实 apply。

任何密码、Token、API Key、私钥、Cookie 和真实 `.env` 都不得写入本文档或提交到 Git。

## Verify 契约漂移收口（2026-08-15）

- 基线提交为 `f2d47bd47060db5e6d4dd42b8fae6861f76facc1`。144项 Active 身份与 claimKey、5条 legacy read 权限、真实 migration Apply 和运行权限审计均已完成；本轮不再执行 Apply，也不修改真实 CMS、内容或权限。
- 根因是 `scripts/data/cms-contract-definitions.mjs` 在权威 collection definitions 之后又把 `cases.metrics`、`news.summary`、`news.published_at` 覆盖为 string，同时 `faqs.page_key` 与 `about_honors.image` 的 definitions 没有表达真实 required 状态；migration planner 不规划这些反向变更，因此第二次 dry-run 已为零，但 verify 仍读取了漂移后的契约。
- 最终严格契约与已迁移 Schema 对齐：`cases.metrics=text`、`news.summary=text`、`news.published_at=timestamp`、`faqs.page_key required=true`、`about_honors.image required=true`。没有增加 allowlist、warning 或 verify 跳过；错误类型和 required 状态仍由严格回归测试阻断。
- 测试先行证据：旧实现下五项目标断言和五项反向漂移断言共10项失败；修复后5个定向测试文件共47项通过。新增严格漂移测试拆为独立文件以维持220行维护预算，没有提高阈值或删减断言。
- 隔离环境完整门禁通过：349个 Astro 文件无诊断、38个 Vitest 文件257项通过、E2E 38项通过且6项按配置跳过、正式域名契约3项通过、构建和 `npm run verify:release` 均成功。直接使用开发机 `.env` 的首次构建因本机内容 Token 对 `site_settings` 返回403而停止；按 CI 契约显式覆盖不可达 Directus 和虚拟双 Token 后完整通过，未发生 CMS 写入。
- 真实 CMS 只读结果：`npm run cms:verify` 为19个集合、0 warning、0 failure；`npm run cms:migrate-contract` 为0项内容变更、0项 Schema 变更。本轮修复作为独立提交管理，提交 SHA 以 Git 历史为准；真实 CMS 未再次 Apply，staging 尚未部署。

## Active 身份映射最终收口（2026-08-15）

- 当前基线为 `b726ccba2bbd4c25bfc705193195380683b9dee1`。本轮只修正审核映射的 expected-before 语义并装载已确认的144项 Active 身份，不新增 Schema、legacy 治理或迁移框架。
- expected-before 现在只对旧审查流程已经定义的 comparable business fields 生成 canonical SHA-256；FAQ 额外纳入权威 `faq_page.key`。Directus 更新时间、系统用户和其他不参与身份审核的元数据变化不再误判为身份丢失，业务字段或 FAQ 页面关系变化仍会阻断。
- FAQ 100条继续使用旧审查包中同一 record ID 对应的 content_key，并以当前业务字段和 `faq_page.key` 刷新 canonical precondition；仓库1–3保留原审核结果，仓库7–12按已审核 record ID 到 stable key 的连续性保留身份，仓库4–6使用与 record ID 绑定的随机 UUID 风格 content_key。发展历程9条、荣誉15条和首页8项 claimKey 决策保持原样。
- 已批准映射集中在 `scripts/data/approved-cms-contract-mappings.mjs`，迁移仍通过现有 `cms-contract-migration` 实现按 record ID、stable key 和 canonical hash 三重校验；没有运行时文本匹配或新建第二套迁移机制。
- 本地定向验证为4个文件26项通过；完整隔离门禁为348个 Astro 文件无诊断、ESLint通过、493个文件满足维护预算、37个 Vitest 文件250项通过、Playwright 38项通过且6项按配置跳过、正式域名契约3项通过、两轮生产构建通过，`npm run verify:release` 与 `git diff --check` 均通过。
- 当前状态：代码尚未提交或推送；真实 dry-run 尚未使用新映射重跑；真实 CMS 未 apply、权限未变更、staging 未部署。
- 新映射的真实 CMS 默认 dry-run 已只读执行成功：137条内容 PATCH 计划覆盖仓库12、FAQ100、发展历程9、荣誉15及首页单例1条整体 stats PATCH（内含8个 claimKey），另有4个 Active 身份字段各3阶段共12条 Schema 计划；没有 `manual_mapping_required`、`singleton_migration_required`、重复稳定身份、关系错误、contract review 或 legacy mapping。真实 CMS 仍未 apply，运行权限与 staging 尚未变更。
- 首次真实 Apply 已生成迁移前快照并完成普通 Active 集合的幂等身份写入，但在首页单例处因使用普通集合的 `/items/homepage_content/1` 路由被 Directus 拒绝；流程在首页 claimKey 和约束收紧前安全停止。当前实现改为单例专用 `/items/homepage_content` PATCH，并增加精确路由回归测试；需要重新完成本地门禁、GitHub CI、Apply 后 verify 和零变更 dry-run 后才能视为迁移完成。

## Staging 字段类型迁移阻塞修复（2026-08-15）

- 基线提交为 `518445ddd784947def7f202f07950b12448dae46`。真实 staging 已完成 Active 身份与 claimKey 内容迁移、身份约束和 `about_honors.image` 必填约束；当前只剩 `cases.metrics`、`news.summary`、`news.published_at` 三个字段类型变更，网站仍保持在迁移前 Release，尚未部署本轮代码。
- 根因已从 staging 安装的 Directus 12.1.1 实现确认：`PATCH /fields/{collection}/{field}` 只有请求体包含 `schema` 时才进入数据库列变更路径；旧实现只发送 `{ type }`，因此 API 返回成功但数据库类型没有变化。修复保持目标类型不变，仅在三个受控类型变更请求中增加空 `schema` 触发器，不新增迁移框架或其他 Schema 目标。
- 测试先行：回归断言先改为要求 `{ type, schema: {} }`，旧实现按预期1项失败；实现修复后3个迁移定向测试文件共23项通过。隔离环境 `npm run verify:release` 通过：350个 Astro 文件无诊断、38个 Vitest 文件260项通过、E2E 38项通过且6项按配置跳过、正式域名契约3项通过、生产构建通过，`git diff --check` 通过。
- 修复已作为提交 `1c7b6571ff843ef0b31b5630209489006525f9a2` 推送到 `main`，GitHub CI Run `31893117581` 的 release verification 全部通过。两份既有备份 SHA-256 复核一致后，真实 staging 仅重试上述3项类型变更；迁移快照 SHA-256 为 `cc8289fa85d436aaaf382dd10640629fa3b9b88aa05c870056283ce9850f007f`，Apply 成功且严格后置 Verify 为0 failure。
- Apply 后 `npm run cms:verify` 为19个集合、0 failure；真实双 Token 运行权限审计通过；第二次 `npm run cms:migrate-contract` 为0项内容变更、0项 Schema 变更。未重新处理映射、权限、业务内容或其他 Schema。
- 首次部署尝试在上传前因开发机 `.env` 中过期的内容 Token 对 staging CMS 返回403而停止，没有创建远端 Release；临时注入服务器现有受限双 Token 后，现有发布脚本成功部署 staging Release `20260815T162408Z-1c7b657`。`/version` 返回完整 Git SHA `1c7b6571ff843ef0b31b5630209489006525f9a2`、环境 `staging` 与 CMS Schema `2026-08-phase3`，`/healthz` 返回200。
- 真实浏览器 smoke test 覆盖首页、产品、案例列表、案例详情、关于、新闻、森林期刊、联系、鞋服云仓专题及404：业务页面均为200、未知路径为真实404，无未解析 `{{claimKey}}`、无旧 `140+` 或 `50万㎡+`、无水平溢出，联系表单必填校验生效。首页与关于页各存在一个无 `src`、无 `alt` 的装饰性图片占位，但没有实际资源 URL 加载失败；本轮未提交真实联系线索。

## 当前状态文档收口（2026-08-16）

- 只更新状态文档，没有修改代码、CMS、权限、数据库或服务器。仓库工作区在修改前干净，现有 staging 验收结果继续有效。
- 文档顶部已改为当前有效状态：五阶段治理、真实 CMS 迁移、权限收口和 staging 发布均已完成；应用 Release 为 `1c7b6571ff843ef0b31b5630209489006525f9a2`，仓库最新 `0578cd0` 仅为状态文档提交。
- 已删除顶部仍把第三、第四阶段描述为“未推送、未部署”的过时口径，并将13个 active 运行集合、5个 legacy 集合和1个 private 集合的当前边界写清楚。后续历史阶段记录仅作为过程证据，不代表当前状态。
- 当前没有需要继续启动的代码治理任务。legacy 集合、`faqs.page_key`、`news.cover_image` 字符串兼容、期刊 PDF 体积、事实证据附件和案例指标证据缺口均作为可接受技术债保留，仅在产生真实业务、审计、性能或安全影响时处理。
- 条件性安全事项：历史截图中出现过完整 Token；若尚未撤销则必须轮换，若已撤销则没有立即处理项。

## AGENTS 协作规则精简（2026-08-16）

- 将项目 `AGENTS.md` 从设计细节、服务器信息、长文件清单和重复维护说明压缩为六条执行规则；详细资料继续由 `DEV_STATE.md`、README 和专项文档承担。
- 保留范围控制、技术债触发条件、Directus 与 claims 数据职责、Git 与敏感信息安全、分级验证、浏览器验收、外部写操作授权和状态记录要求。本次未修改应用代码、CMS、服务器或部署状态。

## Agent 与设计文档收口（2026-08-16）

- 项目已不再使用 Claude Code，因此删除包含重复及过时规则的 `CLAUDE.md`；Codex 协作规则统一由精简后的 `AGENTS.md` 承担。
- `AGENTS.md` 已从本地忽略项移除，后续可随仓库同步；通用设计规范从根目录移动到 `docs/DESIGN_REFERENCE.md`，仅在明确的页面设计任务中按需阅读，不作为日常开发前置条件。
- 本次只调整协作与参考文档，没有修改应用代码、CMS、权限、数据库、服务器或当前部署状态。

## 文档目录收口（2026-08-16）

- 保留 `CMS_CONTENT_MODEL.md`、`MAINTAINABILITY.md`、`MAIN_DOMAIN_CUTOVER.md`、`PERFORMANCE_BASELINE.md` 和 `DESIGN_REFERENCE.md`，分别承担 CMS、代码边界、正式域名切换、性能基线和按需设计参考。
- 删除已被 `DEV_STATE.md` 或自动测试取代的对话总结、对话时间线、旧项目状态、旧生产交接清单及三份 TDD 过程记录；README 已改为直接指向当前状态和保留文档。
- 更新保留文档中的旧口径：运行集合为13个 active 集合，Web 不回退共享 Token，真实 staging CMS 迁移与零变更 dry-run 已完成，测试计数统一由本文件维护。本次未修改应用代码或外部环境。

## 性能基线状态更新（2026-08-16）

- `docs/PERFORMANCE_BASELINE.md` 已补充 README 中现有的本地 Lighthouse 单次采样，并明确其不是正式站 Release 或 CrUX 证据。
- 历史 PageSpeed 提示已改为条件性观察项：仅在正式站多次复测、Core Web Vitals 或真实用户反馈证明问题存在时进行最小修复，不据单次分数启动性能专项。
- 本次只更新文档，没有修改图片、缓存、脚本、页面、性能阈值、CMS、服务器或当前部署状态。

## 文档收口 GitHub 同步（2026-08-16）

- 本批次包含精简后的 `AGENTS.md`、按需设计参考、性能基线状态，以及 README、CMS、维护和主域名文档的当前口径；同时删除已被当前状态或自动测试取代的历史总结、交接和 TDD 过程记录。
- 本批次作为一个纯文档与协作规则提交同步到 GitHub `main`，具体提交 SHA 以 Git 历史为准；没有修改应用代码、依赖、CMS、权限、数据库或服务器，也不触发部署。

## 关于页仓点展示与数据修复（2026-08-16）

- 只读核对确认页面分组函数本来支持同一城市多个仓点；东莞只显示1个的根因是 CMS 中“智谷仓、朗州仓、桥头仓”被归入 archived，并非前端把同城记录合并。最终业务口径保留4个东莞仓点：“智谷仓、朗州仓、桥头仓、东莞云谷仓”，其中云谷仓地址显示“暂不公布”。
- 关于页仓点桌面端保持华南在左、华东在右，但移除外层容器的边框、圆角、背景和阴影；内部仅以标题、留白和细分隔线组织城市及仓点，不使用顶部装饰线、城市卡片、仓点卡片、表头或单元格，移动端两个区域自然上下排列。
- 审核回退数据恢复东莞3个既有仓点及 Directus 中仍保留的地址，并恢复肇庆唯品会物流园仓地址；业务方随后确认兴泰、佛山宏盛、昆山花桥、合肥联亚的具体地址，新塘明确显示“暂不公布”，页面回退与审核 Seed 已使用同一口径。
- 仓点行最终只展示仓点名称和地址，不再展示启用年份、区位、仓容、楼层、货梯或作业动线说明；Directus 与审核回退中的原始说明字段仍保留，避免影响其他用途。E2E 回归明确验证示例说明不会重新出现在关于页。
- 审核 CMS 仓库源保留4条东莞稳定记录，云谷仓不再作为 legacy 名称。经用户明确授权，本机和验收站 Directus 均只执行仓点精确字段更新，不运行整库 `cms:sync-approved --apply`，不改动现有 `content_key` 或其他运营正文；两端均已复核为12个发布仓点，东莞4个，云谷仓地址为“暂不公布”。
- 新增仓点一致性单测：东莞分组必须恰好包含4个审核仓点、云谷仓地址必须为“暂不公布”，CMS seed 与页面回退必须使用同一4个名称和不同稳定身份；CMS 不可用 E2E 改为通过统一仓点区域的稳定可访问名称定位，不再依赖旧 DOM 层级。
- 隔离测试环境下 `npm run verify:release` 通过：Astro typecheck 351个文件0诊断、ESLint、496个文件维护预算、55个引用资源、103个部署资源、39个 Vitest 文件268项测试、38项 E2E 通过且6项按配置跳过、3项正式域名契约和生产构建全部通过。未隔离的首次构建被开发机 `.env` 中已知过期内容 Token 的403阻断；显式使用不可达测试 CMS 与不同虚拟运行 Token 后完整通过，没有修改 `.env`。
- Playwright 真实浏览器检查覆盖1440px桌面与430px手机：东莞显示3个仓点，手机 `scrollWidth === clientWidth === 430`，控制台0错误/0警告；最终布局移除外层容器造型，桌面为华南左、华东右，内部无卡片化表达。
- 本地预览已于2026-08-16使用隔离 CMS 配置启动在 `http://127.0.0.1:4323/`；首页与 `/about` 均返回 HTTP 200。该进程仅用于本机查看，不代表验收站同步或部署。
- 地址证据复查覆盖当前代码、全部 Git/Reflog 历史、本机旧文档与 Office 文件、Directus 仓库修订历史、56xyy.com 的2018—2024年网页存档及公开搜索；未从历史来源恢复的5项已由业务方在2026-08-16明确确认，并已同步到页面回退、审核 CMS Seed 与本机 Directus。验收站或正式站是否同步必须分别通过远端 CMS 读取和页面验收确认，不能由本机结果推断。
- 首次同步提交已通过本地完整门禁，但用户随后补充云谷仓也需展示，因此部署在上传远端 Release 前中止；纠正提交 `c56a101` 的 GitHub CI 只因新增仓点测试文件未经过 Prettier 而在格式步骤停止，功能门禁未发生新失败。该文件已按项目既有格式规则机械修正，后续发布以修正后的提交和 CI 结果为准。

## 关于页沉浸式内容浏览改造（2026-08-16）

- 关于页最终收为单一全屏仓储视频舞台，不再排列独立公司概述区、CTA、全站完整页脚和悬浮咨询入口；该页保留悬浮导航与原主标题，删除主标题下方两行缩略说明，完整公司概述直接常驻显示，不再依赖鼠标悬停或点击展开。
- 视频暂停和静音控制从主标题下方移至页面右上安全区，桌面与悬浮导航保持同一水平线但不贴靠导航；手机因导航占满顶部宽度而下移到导航下方右侧。两个控制改为深蓝纯色圆形按钮，悬停时使用橙色反馈。
- 删除“ABOUT XYY / 浏览新亦源”标题、场景图片、翻页按钮、外框、分隔线、单元格底色和箭头；发展历程、仓网布局、资质荣誉和常见问题紧接完整公司概述下方，以纯文字双列排列，桌面仅做轻微透明度反馈。点击入口继续打开原统一内容层，四类数据仍在 Astro SSR 时读取并渲染。
- 先前用于入口预览的 ImageGen 临时方案及其WebP资源已撤销，没有遗留未引用图片；品牌 Logo 与“关于新亦源”标题在公司概述顶部水平排列，删除与概述重复的页脚简介。总部名称、地址和电话不再占用视频首屏，统一复用现有 Directus 全站设置并移入About极简页脚；页面没有新增重复业务口径。其他页面的 Layout 与悬浮咨询行为保持不变。
- `AboutHero.astro`、`AboutExplorer.astro`、`about-stage.css`、`about-explorer.css` 和 `about/explorer.ts` 分别承担视频舞台、文字入口/弹层结构、视觉和交互；`about.astro` 只负责编排现有数据组件，没有将改动重新堆入页面入口。
- 内容层继续支持键盘焦点、Esc、遮罩关闭、焦点恢复、页面滚动锁定和 URL hash；荣誉证书大图打开时，第一次 Esc 只关闭证书层，第二次才关闭外层内容层。
- Playwright 真实浏览器复核覆盖1440×900桌面和430×932手机：完整概述常驻显示，右上纯色视频控制不压导航，四组入口在概述下方保持纯文字双列，品牌与联系信息继续向下自然排列；两种宽度均无横向溢出，控制台0错误/0警告。
- 背景视频恢复全屏cover，避免16:10屏幕出现明显深蓝留白；桌面端从项目已有720p素材生成约12 MB的1280×720发布版本，减少原960×540视频放大造成的模糊，手机端继续使用540p版本控制传输体积。没有使用153 MB的4K原片，也没有改变视频内容或交互。
- 补齐768–1199px响应式控制位置：该宽度下导航已切换为通栏样式，暂停与静音按钮同步下移到导航下方，不再被导航层遮挡；手机端继续收紧右侧安全距离。
- 定向 About 交互 E2E 2项通过；最终完整发布门禁结果见本节后续记录。新舞台、文字入口、弹层和响应式样式继续按职责拆为小文件，单文件均低于维护预算。
- 本地预览使用隔离 CMS 配置运行在 `http://127.0.0.1:4323/`；首页与 `/about` 均实测返回 HTTP 200。该预览使用审核回退内容，不修改 `.env`、Directus 或远端环境。
- 本次仅修改本地工作树并完成本地验收，尚未提交、推送或部署，也未修改 Directus、数据库、权限、业务数字或其他页面。

## 关于页全员影像画廊（2026-08-16）

- 在现有全屏视频舞台之后新增独立滚动影像段，不改变视频舞台、四类内容弹层或其他页面。画廊使用一次性确定的随机顺序，不按主题分组；桌面采用四列、手机采用两列的规整纵向瀑布流，列宽和间距统一，每个图片框按对应WebP的真实宽高比计算，横图、竖图和方图均完整展示且不裁剪，所有访客及页面刷新看到的顺序一致。
- 素材源目录当前共有160个文件，其中157个可正常解码并全部转为最长边不超过1280px、去除元数据、质量68的WebP，并通过 `loading="lazy"`、异步解码和低加载优先级控制实际请求。2026-08-16新增的6张JPEG已从桌面临时目录移动到公用WEB素材目录，并生成 `gallery-155.webp` 至 `gallery-160.webp`；`06302138_05.0.jpg.jpg`、`06302138_06.0.jpg.jpg`、`06302138_12.0.jpg.jpg` 仍是缺失深度图引用的损坏HEIF，因此未生成不可用网页资源。
- 画廊图片随页面自然纵向滚动，并使用 `/product` 的 `revealVisualOnScroll` 进入视口动画；图片保持真实尺寸属性与 `object-fit: contain`，不加遮罩、不悬停放大，避免任何视觉裁切。五段员工文案继续固定在100svh视口中央并随画廊滚动进度依次切换，但进入动作改为与Product文字一致的上移、去模糊和逐项显现，不再使用旧的连续交叉透明度计算或进度编号；`prefers-reduced-motion` 下保持无动画完整可见。
- 结构继续按职责拆分：`gallery-images.ts` 保存157张WebP的真实尺寸元数据，`AboutScrollGallery.astro` 负责SSR结构、固定顺序与按比例瀑布流位置，`about-gallery.css` 与 `about-gallery-responsive.css` 负责基础和响应式视觉，`about/gallery.ts` 复用产品页图片揭示并只负责按滚动进度切换文案；`about.astro` 只新增组件编排。视频控制初始化优先于下方画廊动画，避免大量下方动画注册延迟首屏控件。
- E2E覆盖157张图片、5段文案、固定随机顺序、图片Product同款揭示以及滚动过程中始终只有一段当前文案；定向About E2E 2项通过。
- 修复画廊滚动文案容器残留 `opacity: 0` 导致内容状态已切换但仍不可见的问题：当前激活文案容器明确恢复可见，上一段在退出动画完成后再隐藏，文案会随画廊滚动依次出现。修复后定向About E2E 2项通过，测试已校验激活标题透明度为1；Astro类型检查357个文件0诊断、格式检查与 `git diff --check` 均通过。
- About视频继续使用铺满式 `cover`，但画面改为底部对齐，优先保留视频内嵌字幕；下方影像画廊的区块、舞台和图片空余底色由深蓝改为白色。五段滚动文案的大标题、小标题与说明文字统一使用白色，并保留深色文字阴影以适配不同明暗照片；文案退出阶段使用独立状态，切换中始终只有一项被标记为当前内容。定向About E2E覆盖视频位置、白色画廊背景、文案可见性和文案颜色；格式检查和 `git diff --check` 通过。
- About页继续关闭全站完整页脚，在画廊后增加专用极简收尾：白色呼吸留白后接低高度浅灰白页脚与细分隔线；桌面在同一横栏内依次排列版权备案、总部地址与电话、返回顶部，手机端仅在空间不足时换行，不重复首屏Logo或导航。组件独立为 `AboutMinimalFooter.astro`；定向About E2E验证联系信息只位于页脚、浅色背景和返回顶部锚点。
- 新增6张素材后，Playwright确认 `gallery-155.webp` 至 `gallery-160.webp` 全部进入页面且继续使用 `object-fit: contain`；定向About E2E 2项通过，Astro 357个文件0诊断，格式、509个文件维护预算、资源引用检查和 `git diff --check` 均通过。
- 新增素材并统一动画后，隔离CMS环境下 `npm run verify:release` 全部通过：Astro 357个文件0诊断、ESLint、509个文件维护预算、39个Vitest文件268项通过、E2E 38项通过且6项按配置跳过、正式域名契约3项通过、两轮生产构建成功；资源检查通过。
- 当前本地预览运行于 `http://127.0.0.1:4322/about`，使用不可达测试CMS与虚拟双Token，只展示审核回退内容。本次仍未提交、推送或部署，也未修改真实Directus、数据库、权限或业务数字。

## 全站导航 Liquid Glass 精修（2026-08-16）

- 只调整悬浮导航控制层，不修改任何页面内容背景：主导航胶囊、仓配服务下拉层和移动菜单统一使用半透明深色材质、22px背景模糊、饱和增强、内侧高光与折射感边缘，底层视频和图片保持原样可见。
- 导航继续使用深色自适应底保证白字在明暗内容上均可读；无 `backdrop-filter` 支持或启用“减少透明度”时自动退回不透明深蓝，键盘焦点使用白色描边与品牌橙外环，“减少动态效果”时关闭导航过渡。
- 样式独立为 `header-liquid-glass.css`，移除 Header 与服务下拉层原有行内背景实现；定向About与移动导航E2E 2项通过，并验证导航模糊材质与胶囊圆角。当前仅本地修改，未提交、推送或部署。
- Liquid Glass 外层原先使用 `overflow: hidden`，会裁掉绝对定位在导航下方的“仓配服务”菜单；现已只将该层改为允许溢出，保留下拉层原有玻璃样式、链接和交互。Playwright 实页确认菜单完整位于视口内。
- About 四个内容入口继续使用原生 `dialog`，补充 `position: fixed; inset: 0; margin: auto` 后按视口严格居中；1280×720 实测水平与垂直中心偏差均为 0px。新增 E2E 同时约束下拉菜单可见与弹窗中心位置，相关桌面/移动测试 2 项通过；Astro 类型检查 357 个文件 0 诊断，ESLint、Prettier 和 `git diff --check` 均通过。本次仍仅修改本地工作树，未提交、推送或部署。

## 全站页脚浅色化（2026-08-16）

- 全站标准页脚去除大面积深蓝背景，统一使用浅灰白 `#f8fafc`、顶部细分隔线、深蓝正文与橙色交互强调；Logo、服务入口、快速入口、总部地址、电话、版权、隐私说明和备案信息均保留，未改变链接或数据来源。
- About专用极简页脚同步使用相同浅灰白基调，并把原视频首屏的总部地址与电话收进既有低高度横栏；页脚属于内容层，因此不套用导航的 Liquid Glass 材质。
- Playwright实页复核覆盖标准页脚桌面与430px手机布局、About极简页脚；定向E2E 2项通过，Astro类型检查357个文件0诊断，ESLint、格式检查和 `git diff --check` 均通过。当前仅本地修改，未提交、推送或部署。

## 关于页发展历程补充（2026-08-16）

- 2011年历程不再使用纯年份占位块，改为复用网站 `/logo.png`；Logo 在深蓝承载面上以 `object-fit: contain` 完整显示，不裁切品牌图形。2026年新增“精进·管理升级”节点，正文为“引入华为管理体系，全面提升公司管理水平，建立可支撑长远发展的运作体系”。
- 历程唯一源码 `src/data/about/history.ts` 更新后，通过 `npm run cms:generate-content-seeds` 重新生成审核 Seed；没有直接手改生成文件，也没有连接或修改真实 Directus。
- 定向 Playwright 实际切换到2026年并核对文案通过；CMS Seed/身份相关 Vitest 2个文件19项通过；Astro类型检查357个文件0诊断，ESLint、Prettier和 `git diff --check` 均通过。本次仍仅修改本地工作树，未提交、推送或部署。

## 合作案例品牌轨道展示（2026-08-16）

- `/cases` 顶部 Hero、业务文案、6个案例数据、详情路由和 FAQ 均保持不变；原独立 Logo 跑马灯与六张等权案例卡被合并为一个白色案例舞台。
- 参考 `cosmos.so` 实际Canvas首屏的分层运动规律，原有78个合作品牌 Logo 分配到三层无可见边框的安全轨道，以不同速度和方向持续缓慢旋转，并通过不同尺寸、透明度和轻微倾角形成分散的动态品牌场；外、中、内圈分别固定分配34、26、18个Logo，同圈弧长与圈间半径差均大于Logo最大显示尺寸，避免独立旋转过程中发生重叠。鼠标经过不会暂停，减少动态效果时完全关闭旋转。Logo 只表达合作品牌生态，不承担案例身份或切换逻辑。
- 固定560px舞台中心承载6个真实案例，默认展示UR，通过左右按钮依次切换案例名称、业务类别、核心数据、标签与详情链接；轨道超出舞台的部分直接裁切，不再按圆环尺寸撑高页面。交互脚本只维护当前索引和可见面板，没有新增WebGL、轮播库或复制业务数据。
- 2026-08-16视觉复查后进一步移除桌面端 Logo 的统一白色卡片、边框和阴影，以透明 Logo、轻微投影及更明显的尺寸和透明度差异表达远近层级；桌面舞台最大宽度由1180px扩展到1600px，四层轨道增加错位起点、扩大半径并整体放大Logo，避免宽屏页面仍聚集在中间。中心案例取消矩形白底，只保留无边界的径向留白，UR标题和核心数据在桌面端保持单行，底部数据来源说明回到正常内容流。
- 最靠近案例的内圈Logo单独从中心渐隐区域向外提至360—450px安全半径，并提高尺寸和可见度；该圈仍位于案例信息层后方，不遮挡标题、数据、链接或切换控件。
- 中心案例改为紧凑的动态案例索引：核心数据按原文中的分隔符自动拆为等宽指标，去除与顶部类别重复的标签行；底部同时显示上一个案例名称、当前详情入口、序号和下一个案例名称，切换时名称、链接与无障碍标签同步更新。手机端指标自动改为两列，案例数据和切换顺序未改变。
- 中心案例最终使用各案例现有封面作为正圆形主视觉，品牌名、核心数据、详情入口、序号和前后案例导航均直接叠加在圆形图片内部；文字没有独立卡片或背景块，只使用统一的图片暗化层保证可读性。切换案例时封面随当前面板同步切换，外围78个Logo与三层安全轨道保持不变。
- 桌面端圆形案例新增无点击数据层：默认展示现有案例介绍，鼠标移入或内部链接获得键盘焦点时，原位渐变为该案例现有的全部指标；介绍来自 `case_description/details`，完整数据来自 `Case.stats`，未新增、复制或改写业务内容。品牌名、详情入口和案例切换始终可见；触屏手机端继续显示介绍与详情入口，避免在小圆内强塞8项数据。
- Playwright实页确认UR悬停后摘要透明度为0、完整8项数据透明度为1，数据、品牌名与三组操作区在580px圆内无重叠；定向E2E 6项通过，隔离CMS构建成功，本地4322预览已更新。
- 中心案例圆的桌面最大尺寸由520px提高至580px，舞台只同步补足为620px高，避免圆形裁切；手机端仍使用原430px上限，外围Logo轨道半径、数量和运动规则未改。
- 手机端不强行显示圆形轨道：四层Logo降级为可横向浏览的轻量品牌带，案例内容独立置于上方，避免圆形轨道压缩正文或造成页面横向溢出。“为什么品牌选择新亦源”继续使用轻量编号、文字与分隔线。
- 结构按职责拆为案例SSR组件、轨道交互脚本、轨道样式、中心内容样式、响应式样式与价值说明样式，单文件均在维护预算内。本地构建与 `http://127.0.0.1:4322/cases` 桌面截图检查通过；Typecheck为358文件0错误，定向浏览器回归结果以本节后续记录为准；本批次未修改真实Directus数据、数据库或权限。
- 提交前完整门禁使用不可达测试 CMS 与两枚不同虚拟 Token 隔离运行并通过：Astro 检查359个文件0诊断、ESLint通过、517个文件符合维护预算、56个引用资源与103个部署资源完整、39个 Vitest 文件共268项通过、Playwright 37项通过且7项按项目矩阵跳过、正式域名契约3项通过、两轮生产构建成功。维护性检查首次发现 About 极简页脚样式、案例轨道内容样式和综合 E2E 超出预算，已按样式与测试职责拆分，未提高阈值、删除断言或改变页面视觉。
- 本批次已提交并普通推送至 `main`，应用提交为 `2f60c4fa7d0102e784013d19e351ff1484b1bbe9`（`feat(site): refresh about and case experiences`）；GitHub Actions Run `31954344791` 对该完整 SHA 执行完成且为 `success`。首次本地验证因开发机遗留内容 Token 对 `site_settings` 返回403而在上传前终止，随后使用不可达构建 CMS 与虚拟双 Token 完成隔离构建，未改动服务器运行环境。
- 验收站 `https://wz.tomatopia.top` 已通过现有原子发布脚本部署 Release `20260816T150610Z-2f60c4f`，未发生回滚；公开 `/version` 返回应用 SHA `2f60c4fa7d0102e784013d19e351ff1484b1bbe9`、`environment=staging`、CMS Schema `2026-08-phase3`，`/healthz` 返回 HTTP 200。桌面1440×900与移动430×932共检查首页、仓配服务、案例列表、UR案例详情、关于、新闻、森林期刊、联系及真实404共18项：状态码均符合预期，无水平溢出、可见断图、未解析 `{{...}}` 或非预期控制台错误。

## 主站 FAQ 与 CMS 文章封面只读诊断（2026-08-20）

- 主站与验收站不是同一运行环境：`56xyy.com` 和 `wz.tomatopia.top` 解析到不同服务器，并各自暴露独立 Directus 项目信息；两站 `/healthz` 和 `/cms/server/ping` 均正常，不能据此推断应用 Release、CMS Schema 或内容已经同步。
- 主站首页、关于页和案例页均保留 FAQ 区标题，但代表性已审核问题不存在；验收站同一路由正常返回对应问题。当前源码按 `faq_page.key` 与 `status=published` 查询，Directus 成功返回空数组时明确保持为空，只有网络失败、超时或 5xx 才使用审核回退。
- 验收站 `/version` 明确返回 Release `20260816T150610Z-2f60c4f` 和应用 SHA `2f60c4fa7d0102e784013d19e351ff1484b1bbe9`；主站 `/version` 落入站内 404，首页静态资源指纹也与验收站不同。现有证据将 FAQ 故障定位为正式环境的应用/CMS 内容契约未同步，而不是当前仓库 FAQ 查询在已部署验收版本上的通用代码故障。主站服务器未接受现有 SSH 公钥，本轮不能进一步只读确认其精确 Release、FAQ 记录数量、发布状态或关系迁移结果。
- 当前 CMS 模型把 `news.cover_image` 定义为 `uuid`、`file-image` 界面和 `directus_files` 关系；但兼容清单仍允许文章封面保留旧字符串路径，Setup 遇到非 UUID 数据库字段时会主动保留旧字段并跳过文件关系。测试站和主站后台均不能选择封面的现象与该兼容路径一致，属于两个 CMS 实例尚未完成的文件字段迁移，不是新闻页面组件或普通前端部署问题。
- 定向契约测试 `tests/unit/directus.test.ts`、`tests/unit/cms-setup.test.ts`、`tests/unit/cms-schema-drift.test.ts` 共25项通过。诊断期间未修改应用代码、CMS 数据、数据库、权限、服务器配置或部署；后续处理前需分别备份两个 CMS 的数据库与附件，先只读核对主站 FAQ 关系/发布状态和 `news.cover_image` 真实字段类型，再单独审批正式站 Release 同步、FAQ 内容迁移与封面 UUID/文件关系迁移。
- 当前源码使用不可达隔离 CMS 构建并通过正式 SSR 入口运行后，首页、关于页和案例页均显示审核 FAQ；Playwright 在1440×900与430×932下确认首页8条问题存在，控制台0错误、0警告。本地实例仅用于只读页面验证，完成后已停止；没有修改 `.env` 或连接真实 CMS。
- 验收站实时 `/version` 仍为 `2f60c4fa7d0102e784013d19e351ff1484b1bbe9`，该提交到仓库 HEAD 只相差 `DEV_STATE.md` 文档，应用代码一致；验收站首页实时响应也包含审核 FAQ。由此进一步确认 FAQ 组件与当前应用发布包正常，正式站缺失来自其独立 Release/CMS 数据契约未同步。文章封面仍属于 CMS 旧字符串字段到 Directus 文件 UUID 关系尚未执行的独立迁移，不会因重新发布同一 Web 构建自动恢复文件选择器。
- 已新增 `docs/DEPLOYMENT_FAQ_COVER_DIAGNOSTIC.md` 作为部署侧交接报告，包含正式 Release/Nginx/环境变量检查、FAQ 数据与关系查询、运行令牌权限判定、新闻封面迁移顺序、验收标准和脱敏证据清单。报告不含密码或 Token，未授权任何部署、Apply、权限或真实 CMS 写入。
- 后续只读复查确认验收 CMS 的 `news.cover_image` 物理列仍为 `varchar`，Directus 元数据虽为 `file-image`/`special=file`，但没有指向 `directus_files` 的关系；两条已发布新闻中一条保存 UUID 字符串、一条封面为空，符合“文件上传成功但文章选择、保存或回显不可靠”的半迁移状态。验收 Release 未包含 `scripts/verify-production-cms.mjs`，因此服务器内执行 `npm run cms:verify` 报 `MODULE_NOT_FOUND`；未改动服务器或 CMS。
- 验收站还复现了新闻详情问题：发布记录 ID 5 的 slug 为 `chehsi `（末尾 ASCII 空格），列表原样生成 `/news/chehsi `；`/news/chehsi` 返回302到 `/news`，`/news/chehsi%20` 返回200，正常记录 `/news/cheshi` 返回200。当前契约仅在 slug 唯一约束缺失时检查空值/重复，且未校验首尾空格；需先经授权修正 CMS 数据，再补充 slug 规范化校验、规范化重复检查和详情不存在时的404测试。FAQ 前端结论不变，但不能再表述为“项目完全无需代码修复”。

## CMS 全功能只读审计（2026-08-20）

- 按用户要求只排查、不修复；未修改业务代码、Directus 数据、数据库结构、权限、服务器配置或部署。完整报告见 `docs/CMS_FULL_READONLY_AUDIT_2026-08-20.md`。
- 验收 Directus 的19个预期集合均存在；100条 FAQ 全部已发布且17个页面关系完整；真实运行令牌下49组内容查询全部成功，27条 CMS 驱动路由和 sitemap 的29条 URL 均返回200，63个静态内容资源可访问，必填字段、状态、嵌套结构与富文本安全检查未发现新增问题。
- 新确认用户可见故障：验收 CMS 中已被新闻引用的封面资源，无论匿名、内容令牌还是公开 `/cms/assets/` 代理均返回403，页面已经输出该失效资源 URL；这会影响当前文章封面，并可能影响未来所有 Directus 文件字段。
- 新确认代码问题：`src/lib/directus-content-queries.ts` 只替换服务功能项 `desc` 中的 Claim 变量，未处理 `title`；验收站 `/zhibo-cangpei` 实际泄漏两处 `{{shippingSla}}`。本轮未改代码。
- 结合此前结果，仍存在 `news.cover_image` 为 varchar、元数据却为文件界面且无文件关系的半迁移状态，以及已发布新闻 slug 尾随空格导致正常 URL 302 回新闻列表的问题。验收 Release 还同时缺少两份 CMS 验证脚本，声明的 `cms:verify` 命令无法在发布目录运行。
- 定向 Vitest 6个文件61项全部通过，但未覆盖真实资源 HTTP 状态、后台 CRUD/发布、封面保存后重开、slug 规范、功能标题变量替换和发布制品内 CMS 自检，不能据此宣称整个 CMS 已测试。
- 真实 CMS 写入需单独授权，因此本轮没有创建/编辑/发布/删除测试文章、上传一次性附件或成功提交联系表单；Chrome 自动化也未能稳定接管已登录后台。后续完整写入闭环须在授权后使用带测试前缀的草稿和一次性图片执行并清理。

## CMS 本地隔离写入审计（2026-08-20）

- 按用户后续要求改用本机完全隔离环境实际写入；启动独立 PostgreSQL 数据库、Directus 12.1.1 和本地 Astro SSR，未连接或修改验收站、主站、真实 CMS、真实数据库、权限或部署。完整报告见 `docs/CMS_LOCAL_WRITE_AUDIT_2026-08-20.md`。
- 通过真实 Directus 后台完成新闻新建、草稿保存、PNG 附件上传、封面选择、列表返回后重开回显、发布、取消发布、文章删除和文件库附件删除。正确的全新 PostgreSQL 字段与文件关系下，封面选择和保存本身正常；清理后 `news=0`、`directus_files=0`。
- 发布状态下本地 `/news` 与文章详情均返回200并读取到测试内容；切回草稿后列表不再显示，详情返回302到 `/news`。另实际创建一条关联 `faq_pages.key=news` 的 FAQ，前台显示成功，删除后消失，FAQ 总数恢复为100。
- 全新实例中的封面匿名 `/assets/{uuid}` 返回403。当前内容权限同步只覆盖业务内容集合，未建立 Directus 文件公开交付策略；因此后台关系保存正常也不能保证前台图片可用，需要仓库明确资源交付方案并由部署侧配置验证。
- 全新数据库直接执行 `scripts/setup-cms.mjs` 会在 Singleton Seed 阶段失败：运行时固定查询 `date_created`、`user_created`、`user_updated`，部分单例集合定义并未创建这些字段。本轮只在一次性本地数据库补临时占位字段以继续审计，没有修改仓库代码；该初始化缺陷需要后续修复。
- 文章允许在 `published_at=null` 时发布，当前前台 `formatDate(null)` 显示为“1970年1月1日”；需补发布校验或空值回退。本地 `/admin/content/news/+` 与完整生命周期均正常，未复现远端 new 页面偶发打不开，远端应结合半迁移 Schema、异常 slug、浏览器失败请求和 Directus 日志继续定位。

## CMS 修复与隔离完整回归（2026-08-20）

- 已按本地写入审计结果修复代码：Singleton Seed 只读取实际定义字段；新闻 slug 增加格式、空白和规范化重复校验；已发布新闻强制 `published_at` 且前台只展示到期记录；非法日期不再渲染为1970年；服务功能标题补齐 Claim 变量替换。
- `news.cover_image` 已退出旧字符串字段兼容清单；契约迁移仅在全部非空值均为 UUID 时计划转换，否则报告 `data_validation_required`。该保护要求部署侧先清洗真实环境异常封面数据，不能强制迁移。
- 新增站内 `/api/cms-assets/{uuid}` 资源代理；内容令牌权限同步与审计纳入 `directus_files` 只读，但代理只放行已发布案例、新闻、期刊、服务页和关于内容实际引用的文件。匿名 Directus 文件仍不开放，令牌不进入浏览器。
- 发布脚本已包含 `scripts/`，部署目录中的 `cms:verify` 和运行权限审计具备代码文件；CMS Schema 版本更新为 `2026-08-cms-hardening`。
- 全新隔离 PostgreSQL + Directus 12.1.1 一次 Setup 成功：19个集合、100条 FAQ、14项内容读取权限，`cms:verify` 为0 failure。没有再补临时 Singleton 字段。
- 真实后台回归完成：`news/+` 打开、草稿创建、富文本、PNG上传、封面选择、保存后重开回显、无发布时间发布被阻止、补时间后发布、取消发布、文章删除和文件库附件删除均符合预期。
- 发布阶段前台新闻列表、详情与封面均成功；资源代理返回200、Range返回206、未引用UUID返回404，Directus匿名资源保持403。切回草稿后列表消失且详情302回 `/news`。
- 临时新闻 FAQ 创建后前台显示，删除后消失；最终测试文章0、测试附件0、临时 FAQ 0，FAQ总数恢复100。完整报告见 `docs/CMS_REPAIR_AND_REGRESSION_2026-08-20.md`。
- 清理后的 `cms:verify` 为19个集合、0 warning、0 failure；双令牌运行权限审计通过。`npm run verify:release` 全部通过：364个 Astro/TypeScript 文件0问题、522个文件维护预算、41个单元测试文件276项、E2E 37项通过且7项按配置跳过、正式域名契约3项和最终生产构建均通过。
- 发布级 E2E 在隔离库产生的10条联系表单记录随一次性数据库删除；本地 Directus、Astro、浏览器会话和临时目录均已停止或移除。本轮未提交、推送、部署、迁移或修改验收站/主站及真实 CMS。远端执行仍须先备份、dry-run、清洗异常 slug/封面数据并获得明确授权。

## CMS 全功能测试计划（2026-08-20）

- 已确认上一轮真实写入闭环只完整覆盖 `news`、`directus_files` 和一条关联既有页面的 `faqs`；`contact_leads` 覆盖前台创建与权限边界。其他 active 集合此前虽通过 Schema、读取、权限和前台检查，但不能据此视为已完成后台 CRUD 测试。
- 已新增 `docs/CMS_COMPLETE_FUNCTIONAL_TEST_PLAN_2026-08-20.md`，覆盖13个 active 集合、1个 private 集合和文件库，区分普通内容、Singleton、关系、文件、富文本、权限、后台导航稳定性及桌面/移动前台消费者。
- 计划要求先在一次性本地 Directus/PostgreSQL 中实现可重复自动化和失败后强制清理，连续通过两次后再申请验收站写入；主站默认只读。当前仅制定方案，未再次启动本地 CMS，未写入验收站/主站，未执行部署、迁移或权限变更。

## CMS 全功能回归与身份约束加固（2026-08-20）

- 已按全功能方案在两套一次性本地 PostgreSQL + Directus 12.1.1 环境执行；未连接、写入、迁移或部署验收站与主站。完整报告见 `docs/CMS_COMPLETE_FUNCTIONAL_TEST_REPORT_2026-08-20.md`。
- 14个内容入口与文件库共15个页面各连续打开5次，75/75通过；11个可创建集合的 `new` 页面各打开5次，55/55通过。10个普通集合、3个 Singleton、联系留言和文件库均完成真实写入、重开、状态、关系、前台联动与清理。
- 新闻封面已实际执行移除旧封面、从文件库选择另一张图片、保存、返回列表和重开；后台、Directus字段与前台详情均读取新UUID。WebP/PDF/PNG、Range 206、未引用404、匿名Directus资源403和删除引用文件后的SET NULL行为均通过。
- 新发现并修复 active 稳定身份只做后台必填、未完整落到数据库约束的问题；13个 active 身份字段统一为 `NOT NULL + UNIQUE`，案例slug同时设为后台必填。合同迁移扩展到全部13个 active 集合，并用物理 `is_nullable=false` 判定数据库必填，避免把Directus UI `required`误认为NOT NULL。
- 本地既有库 dry-run正确计划10项身份约束并成功Apply；修复后的全新Setup直接生成正确约束，随后迁移dry-run为0。10个普通集合空写入全部400，有基线记录的重复身份全部为`RECORD_NOT_UNIQUE`，无意外创建。
- 新发现并修复联系限流单测在执行环境存在真实可写令牌时会写入当前CMS的问题；单测现在默认清空CMS环境并模拟存储。删除本轮30条一次性“张三/咨询”记录后，使用真实本地令牌运行联系单测和整套发布验证，`contact_leads`保持0。
- 最终 `cms:verify` 为19集合、0 warning、0 failure、文件0；运行权限审计通过。`npm run verify:release` 通过：364个Astro/TypeScript文件0问题、522个文件维护预算、41个单测文件278项、E2E 37项通过且7项按配置跳过、正式域名契约3项和最终构建全部通过。
- 清理后新闻0、联系留言0、Directus文件0，集合计数与Singleton均恢复基线。Directus 12.1.1新闻富文本仍有一次非阻塞 `Unexpected token '<'`，对应TinyMCE相对语言脚本路径返回Admin HTML；不影响编辑、封面、保存和重开，作为低优先级上游问题记录。
- 两套本地 Directus、Astro 和浏览器会话均已停止；两套一次性 PostgreSQL 数据库、临时上传目录、浏览器证据缓存和本地迁移快照均已删除，不可恢复。本轮未提交、推送、部署或修改任何远端环境。

## CMS 修复发布准备（2026-08-20）

- 用户已明确授权同步 GitHub 并部署验收站；主站、真实 CMS 迁移和权限 Apply 不在本次授权范围。由于 `main` 是默认分支，本轮建立功能分支 `codex/cms-hardening-20260820` 管理提交。
- 提交前使用不可达测试 CMS 与两枚不同的虚拟运行令牌重新执行 `npm run verify:release`，结果为364个 Astro/TypeScript 文件0问题、522个文件通过维护预算、41个单测文件278项通过、E2E 37项通过且7项按矩阵跳过、正式域名契约3项通过、两轮生产构建成功。

## CMS 修复验收站发布（2026-08-20）

- 修复提交 `da8f4e69112a4a6cee99dca781721682f653b201` 已推送到 GitHub 分支 `codex/cms-hardening-20260820`；远端分支 SHA 与本地一致。仓库工作流未对该功能分支产生 GitHub Actions Run，本地与发布脚本内的两轮完整 `verify:release` 均已通过。
- 现有原子发布脚本已将同一提交部署为验收站 Release `20260820T085234Z-da8f4e6`。`/version` 返回完整 Git SHA、`environment=staging` 与 `cmsSchemaVersion=2026-08-cms-hardening`；`/healthz`、Directus Ping、首页、新闻、产品、案例、关于、服务详情、期刊和联系页面均返回预期状态。首页实际输出9个 FAQ 条目，FAQ 内容未丢失。
- 发布后独立检查发现站内资源代理读取当前已发布文件 `a9be7a91-e74c-43f4-947c-52c3fc25879a` 返回502；服务器使用现有内容令牌只读访问 `/files/{id}` 与 `/assets/{id}` 均为403，`npm run cms:verify-runtime-permissions` 明确报告 `content token cannot read directus_files`。这证明应用代码已部署，但验收站 Directus 运行权限尚未同步，CMS 图片代理与文章封面端到端仍未完成。
- 本次没有执行 CMS Schema 迁移、权限 Apply、后台写入或主站部署，也没有回滚当前验收 Release。下一步必须获得单独授权后，为验收站内容令牌补齐 `directus_files` 只读权限并执行只读后置审计；文章封面后台字段若仍为旧字符串类型，还需另行授权 Schema 迁移后再做真实保存/重开验证。

## CMS 验收站迁移与权限执行（2026-08-20，进行中）

- 用户已明确授权验收站 CMS Schema 迁移、`directus_files` 权限 Apply 和迁移后真实回归；主站继续不在范围内。Chrome 控制接口当前未发现用户已登录的 Chrome，因此后台 UI 闭环暂候浏览器扩展恢复，API、迁移和公开前台验证继续执行。
- 迁移 dry-run 未写入数据；计划11项 Schema 变更，但被新闻记录 `slug` 首尾空格阻断。迁移器报告 `data_validation_required collection=news field=slug reason=whitespace`，Schema Apply 尚未执行。
- 迁移前在验收服务器生成 PostgreSQL 备份 `/var/backups/xyy-postgresql/directus-20260820T091048Z.dump`（361650 bytes）和附件备份 `/var/backups/xyy-uploads/directus-uploads-20260820T091048Z.tar.gz`（203854 bytes）；两份 SHA-256 校验均通过，备份及清单权限均为600。正式备份配置和两个定时器仍缺失，备份尚未证明已复制到加密异机。
- 已同步 `Website Content Read-Only` 策略的14项读取权限（新增1项、更新13项）。服务器后置审计通过：13个运行内容集合、1个文件集合和联系仅创建令牌保持分离且最小权限；已发布文件代理从502恢复为 HTTP 200、`image/jpeg`、201655 bytes。
- 新闻 `id=5` 的异常 slug 已在确认目标无重复后由 `chehsi ` 精确规范化为 `chehsi`，未修改标题、正文、状态或发布时间。随后 dry-run 为0项内容变更、11项 Schema 变更且无阻断。
- 首次 Schema Apply 生成迁移快照 `output/cms-migrations/2026-08-cms-hardening-2026-08-20T09-14-56-932Z.json`，SHA-256 为 `3431a57966e2f339e7c75d5681453ec305a861cd1c2ff7b1745148b47ed54128`；11项字段和约束已执行，但自动后置验证发现 `news.cover_image` 已转 UUID 而 `directus_files` 关系仍缺失，因此以 `post_migration_schema_verify_failed` 停止。文件元数据与两条现有新闻记录均保留。
- 根因为迁移快照没有读取关系元数据，字段收敛器也只转换物理列类型而未规划文件关系。新增关系迁移回归测试在旧实现下3项全部失败；修复后迁移器会读取带关系合同集合的 `/relations/{collection}`，在 UUID 值安全时规划并创建缺失关系，支持类型转换后中断重跑，再次完成后 dry-run 为零。错误目标关系仍失败关闭，不执行猜测修复。
- 迁移、Setup 与新闻加固定向测试5个文件29项通过；相关新旧定向测试8项通过。完整门禁首次仅因既有 About/Cases 综合 E2E 在并行负载下30秒超时而失败，该用例单独重跑9.3秒通过；未修改测试或放宽超时。随后完整 `npm run verify:release` 退出码为0：365个 Astro/TypeScript 文件0问题、523个文件通过维护预算、42个单测文件281项、E2E 37项通过且7项按矩阵跳过、正式域名契约3项和两轮生产构建全部通过。
- 迁移修复提交 `cd6868d` 已推送并部署为验收 Release `20260820T092656Z-cd6868d`；剩余1项 `news.cover_image → directus_files` 关系 Apply 成功。第二份迁移快照 SHA-256 为 `d6fa70b59915fd10eb75b116d1b5c46433508a063951e5df5c0c300e42ccb868`；后置 `cms:verify` 为19集合、0 warning、0 failure、文件2，随后 dry-run 为0内容/0 Schema。
- 首次验收站全功能写入回归在发布新增服务时复现首页500，服务器日志为 `Cannot read properties of null (reading 'map')`。测试脚本在失败后完整清理，集合计数和文件数恢复基线。根因是 `services.features` 合同允许空值，而首页查询直接对 `null` 调用 `.map()`；新增回归测试在旧实现下按预期失败，修复后把非数组能力列表规范为空数组，相关2个文件22项通过。
- 服务空能力修复后的完整 `npm run verify:release` 退出码为0：365个 Astro/TypeScript 文件0问题、523个文件通过维护预算、42个单测文件282项、E2E 37项通过且7项按矩阵跳过、正式域名契约3项和两轮生产构建全部通过。验收站全功能回归将在该修复提交部署后从干净基线重新执行。
- 服务空能力修复提交 `5be0a00` 已推送并部署为验收 Release `20260820T095607Z-5be0a00`。重新执行全功能写入回归时，用户要求暂停；进程已立即中止，只完成必要清理。已按运行标识 `cms-staging-e2e-1787220995144` 核验并删除本轮已创建的案例、仓库、服务、FAQ 页面及3个一次性附件；所有测试标识残留为0。清理后基线恢复：FAQ 页面17、服务3、仓库12、案例6、新闻2、FAQ 100、期刊14、服务专题12、发展历程9、企业荣誉15、联系留言62、文件2；验收站首页 HTTP 200。未继续后续回归、迁移或部署。
- 用户恢复执行后，验收站全功能回归从干净基线重跑完成。首次恢复运行仅因临时回归脚本遗漏联系表单必填的 `privacyConsent` 而得到预期400，非产品缺陷；补齐测试输入后整套通过：后台75/75列表路由、55/55新建路由和5/5文件路由可访问，FAQ 页面、服务、仓库、案例、期刊、服务专题、发展历程、企业荣誉8类内容完成创建/读取/更新/重复约束/发布/取消发布/删除；FAQ 子项关联及新闻页发布可见；新闻封面完成上传、初始选择、替换、公开读取、Range读取、删除后关系置空；首页、关于和全站设置3个单例完成修改、公开验证与原值恢复；联系表单完成无效提交、有效入库、后台状态更新与删除。回归结束后所有集合与文件数量精确恢复暂停前基线，测试标识残留为0。
- 发布后只读收口通过：`/version` 确认验收 Release `20260820T095607Z-5be0a00`、环境 `staging`、CMS Schema `2026-08-cms-hardening`；`/healthz` 为 `status=ok` 且 `contactStorage=ok`；显式锁定验收 CMS 后 `cms:verify` 为19集合、0 warning、0 failure、文件2；服务器运行权限审计再次通过13个运行内容集合、1个文件集合及联系仅创建的分离最小权限。Chrome 扩展已安装并启用，但 Google Chrome 当前未运行，因此后台真实点击、媒体选择器和浏览器可视状态仍待浏览器启动后补测；不得用已通过的HTTP后台路由检查代替该项。
- 用户已授权启动 Chrome 补测后台 UI，但当前执行环境缺少 X Server/`DISPLAY`，Chrome `Default` 配置窗口启动即退出，扩展无法建立浏览器连接；未执行任何后台 UI 写入。需用户在桌面端手动打开同一 Chrome 配置并保持后台登录后再重试媒体选择器、封面保存回读及 New 页面可用性。
- 针对远程环境已进一步使用现有 Xvfb 建立虚拟显示并成功启动 Chrome `Default` 配置；Chrome 150、浏览器扩展安装/启用状态及 Native Messaging 清单均核验正常，扩展宿主进程已运行，但 ChatGPT 浏览器控制通道仍未注册该 Chrome 实例，因而无法进行受支持的 UI 控制。按浏览器插件安全边界未改用 DevTools 注入或其他旁路；临时 Chrome/Xvfb 已停止且无残留进程。若继续 UI 层验收，需要重新安装/连接 Browser 插件，或由用户明确批准切换到隔离的 Playwright 浏览器会话。
- 用户批准切换 Playwright 后，已通过隔离浏览器真实登录验收后台并复现文章新建流程：媒体选择器可以打开、选择现有 JPEG，表单也正确显示封面预览；点击文章保存时失败并提示“URL 标识：值是必需的”。现场字段元数据核验确认 `news.slug` 同时为必填和只读且无值，因此封面没有丢失，实际是整篇文章未能保存；这也解释了文章 New 页面偶发看似无效的问题。
- 根因为身份字段分阶段迁移曾临时统一写入 `readonly=true`，完成默认值与唯一约束后没有把运营录入字段恢复为合同要求的可编辑状态。影响范围为 `services.slug`、`cases.slug`、`news.slug`、`publications.issue`、`service_pages.slug`；8个由系统稳定身份管理的 `key/content_key` 字段应继续只读。迁移规划器现仅为合同可编辑且现场仍只读的字段生成 `identity_meta`，Apply 时恢复完整字段元数据；新增回归测试覆盖规划与 PATCH 请求，避免误放开系统键。
- 修复后6个迁移定向测试文件共36项通过。首次直接使用开发机 `.env` 的完整门禁在283项单测通过后被既有本地 Directus 403正确阻断；随后按隔离测试合同覆盖不可达 CMS 与两枚不同的虚拟运行令牌，`npm run verify:release` 退出码为0：366个 Astro/TypeScript 文件0诊断、524个文件通过维护预算、43个单测文件283项通过、E2E 37项通过且7项按矩阵跳过、正式域名契约3项和两轮生产构建全部通过。尚未发布本次修复或执行这5项字段元数据迁移。
- 修复提交 `6323226` 已推送到 GitHub 分支 `codex/cms-hardening-20260820`，并通过原子发布脚本部署为验收 Release `20260820T114539Z-6323226`。首次发布尝试仍被开发机过期内容 Token 的403在上传前阻断；只在后续发布进程内临时使用服务器现有只读内容 Token 后，发布脚本内完整 `verify:release`、依赖安装、PM2切换、健康检查与精确 Release 身份核对全部通过，未回滚。
- 发布后迁移 dry-run 仅规划 `services.slug`、`cases.slug`、`news.slug`、`publications.issue`、`service_pages.slug` 5项 `identity_meta` 且0内容变更；Apply 快照为 `output/cms-migrations/2026-08-cms-hardening-2026-08-20T11-50-07-238Z.json`，SHA-256 `a20d2f4eca5d2c9a23d2b31903ffe11a3cbe0733465026099b5f34caf7f4ec98`。Apply 后5个运营身份字段均为 `required=true, readonly=false`，抽查 `homepage_content.key`、`faqs.content_key` 仍为只读；迁移再次 dry-run 为0内容/0 Schema。
- Playwright 后台 UI 闭环通过：新建文章表单的 URL 标识恢复可编辑；选择既有 JPEG 封面后成功保存草稿，重开记录仍显示同一文件且 API 回读关系 ID 正确；设置当前发布时间并发布后，文章详情与 `/api/cms-assets/{id}` 均为 HTTP 200，封面为1280×720 JPEG；取消发布后详情 URL 按合同302返回新闻列表；后台永久删除后测试文章残留0、文件仍为2。仓配服务、合作案例、文章、森林期刊和服务专题页5个 New 表单均逐页确认可进入，`slug/期刊期号` 控件可编辑。
- UI 登录过程中 Playwright CLI 曾把测试站管理员填充值回显到本地测试输出；已立即在验收 Directus 中轮换该管理员密码、同步 `/var/www/xyy-cms/.env` 并用新凭据验证登录，之后改为抑制填充输出。主站未涉及，旧验收密码已失效；浏览器会话关闭，最终 CMS 不含测试文章或一次性附件。
- 最后一轮验收站完整写入回归通过：75/75后台列表路由、55/55新建路由、5/5文件路由；FAQ页面、服务、仓库、案例、期刊、服务专题、发展历程、企业荣誉8类内容完成CRUD、重复约束、发布/取消发布/删除；FAQ关联、文章封面上传替换/公开读取/Range读取/删除关系、3个单例恢复及联系表单/后台状态/删除均通过。清理后精确恢复基线：FAQ页面17、服务3、仓库12、案例6、新闻2、FAQ 100、期刊14、服务专题12、发展历程9、企业荣誉15、联系留言62、文件2。
- 最终只读收口：`cms:verify` 为19集合、0 warning、0 failure、文件2；运行权限审计通过13个内容集合、1个文件集合和联系仅创建的分离最小权限；`/version` 为 `6323226b8df9aaa9bf4ba23d65cd580abe924164`、Release `20260820T114539Z-6323226`、`environment=staging`、CMS Schema `2026-08-cms-hardening`，`/healthz` 为 `status=ok`、`contactStorage=ok`。主站未部署、未迁移、未写入。

## CMS 修复合并主分支与验收站部署（2026-08-20）

- 修复分支 `codex/cms-hardening-20260820` 已在确认 `origin/main` 为其祖先后，通过 `--ff-only` 快进合并到 `main`；GitHub `main` 已同步到 `0e40c563cd123d551884b15c8db86fd55ee81dd3`，对应 CI Run `32370671940` 完成且结论为 `success`。
- 发布前首次直接使用开发机遗留 `.env` 验证时，283项单元测试通过，但构建因过期内容 Token 读取 `site_settings` 返回403而停止；随后按既定隔离方式使用不可达测试 CMS 与两枚不同虚拟 Token 重跑 `npm run verify:release`，结果为366个 Astro/TypeScript 文件0诊断、524个文件通过维护预算、43个单测文件283项通过、E2E 37项通过且7项按矩阵跳过、正式域名契约3项和两轮生产构建全部通过。该403属于已记录的开发机环境问题，不是代码失败。
- 验收站已通过原子发布脚本部署 Release `20260820T124758Z-0e40c56`，精确应用 SHA 为 `0e40c563cd123d551884b15c8db86fd55ee81dd3`、`environment=staging`、CMS Schema `2026-08-cms-hardening`；依赖安装无漏洞，PM2切换、内部健康检查、外部健康检查和 Release 身份核对均通过，未回滚。
- 发布后首页、仓配服务、案例、关于、新闻、森林期刊、联系和直播仓配专题均返回HTTP 200；`/healthz` 返回 `status=ok`、`contactStorage=ok`，`/version` 与目标提交和 Release 完全一致。发布过程中只临时读取服务器现有受限 Web 运行环境用于构建验证，临时副本已由退出清理机制删除，未输出或提交任何 Token。
- 本次合并和部署只包含既有 CMS 修复、测试与文档，不包含 Lighthouse 性能建议或任何测试站专用性能修改。正式主站未部署、未迁移、未写入，也未修改正式站服务器配置。

## 测试站 CMS 管理员凭据重置（2026-08-20）

- 按明确授权，已将验收站 Directus 管理员账号 `admin@wz.tomatopia.top` 重置为一次性临时密码，并通过测试服务器本机 Directus API 登录验证；未修改内容表、CMS Schema、权限或正式站。
- 临时密码不写入仓库、`DEV_STATE.md`、服务器环境文件、命令输出记录或 GitHub；登录后必须立即在 Directus 用户设置中改为长期密码。Chrome 自动连接不可用，因此未代填浏览器。

## 服装云仓与唯品会专题页下线（2026-08-21）

- 按用户明确范围，仅下线 `/fuzhuang-yuncang` 与 `/weipinhui-jit-jitx`；未增加重定向，其他服务页、导航入口、共享图片和专属展示组件均保持不变。两条路由文件已删除，并同步移出 sitemap、`llms.txt`、服务专题/FAQ Seed 来源、FAQ 页面选项、CMS 合同映射及服务页 E2E 清单。
- 本地 Directus 已按精确记录删除2条 `service_pages`、2条 `faq_pages` 和10条关联 FAQ；删除后目标 slug/key/page_key 查询均为空，总量为服务专题10、FAQ页面15、FAQ 90。删除前记录备份保存在 `/tmp/xyy-delete-*-20260821.json`，未修改其他 CMS 数据。
- 本地路由核验为两个下线地址均返回404，其余10个服务专题均返回200；`npm run verify` 通过（364个 Astro/TypeScript 文件0诊断、43个单测文件283项通过、生产构建成功），服务页 Playwright E2E 桌面与移动端共6项通过。本轮未提交、推送或部署，也未修改验收站与主站。

## 直播仓配顶部图片替换（2026-08-21）

- `/zhibo-cangpei` 顶部图已改为独立高清资源 `/w-live-commerce.webp`（1920×1440），页面源码、CMS Seed 与本地 Directus 已发布记录现保持一致；本地 CMS 仅修改 `service_pages` 中 `zhibo-cangpei` 的 `img_src`，原记录备份为 `/tmp/xyy-zhibo-hero-before-20260821.json`，未修改其他 CMS 数据。
- 本地页面已确认实际加载新图，资源完整性检查与 `git diff --check` 通过；Playwright 桌面端 1440×900、移动端 390×844 实屏检查通过，建筑主体、`唯品会 vip.com` 标识与装卸区域可见，控制台0错误。本轮未提交、推送或部署，验收站与主站未修改。

## 后整修复顶部图片替换（2026-08-21）

- `/houzheng-xiufu` 顶部图已改为独立高清资源 `/w-post-processing.webp`（1920×1440），页面源码、CMS Seed 与本地 Directus 已发布记录保持一致；本地 CMS 仅修改 `service_pages` 中 `houzheng-xiufu` 的 `img_src`，原记录备份为 `/tmp/xyy-houzheng-hero-before-20260821.json`，未修改其他 CMS 数据。
- 本地页面已确认实际加载新图，资源完整性检查与 `git diff --check` 通过；Playwright 桌面端 1440×900、移动端 390×844 实屏检查通过，作业区、工作人员、工位与周转箱主体可见，控制台0错误。本轮未提交、推送或部署，验收站与主站未修改。

## 鞋服云仓顶部图片替换（2026-08-21）

- `/xiefu-yuncang` 顶部图已改为独立高清资源 `/w-footwear-cloud.webp`（1920×1440），页面源码、CMS Seed 与本地 Directus 已发布记录保持一致；本地 CMS 仅修改 `service_pages` 中 `xiefu-yuncang` 的 `img_src`，原记录备份为 `/tmp/xyy-xiefu-hero-before-20260821.json`，未修改其他 CMS 数据。
- 本地页面已确认实际加载新图，资源完整性检查与 `git diff --check` 通过；Playwright 桌面端 1440×900、移动端 390×844 实屏检查通过，质检作业区、工作人员和周转箱主体可见，控制台0错误。本轮未提交、推送或部署，验收站与主站未修改。

## 鞋服云仓标准服务流程视觉调整（2026-08-21）

- 仅调整 `/xiefu-yuncang` 的“鞋服云仓标准服务流程”区块：桌面端流程轨道按自身内容宽度水平居中，移动端仍从第1步开始并保留区块内横向滚动；新增贯穿步骤的浅色引导轨道、循环扫光、序号呼吸和箭头位移动效，并为 `prefers-reduced-motion` 关闭全部动画。
- Playwright 验证桌面端流程中心与容器中心偏差为0px；移动端区块 `scrollLeft=0`、页面横向溢出为0，流程区可独立横向浏览。动画计算样式、桌面与移动端截图和控制台检查通过；`astro check` 为364个文件0诊断，ESLint、Prettier、资源完整性和 `git diff --check` 均通过。本轮未提交、推送或部署。

## 退货质检顶部图片替换（2026-08-21）

- `/tuihuo-zhijian` 顶部图已改为独立高清资源 `/w-return-inspection.webp`（1920×1440），最终采用服装挂仓与作业通道画面；页面源码、CMS Seed 与本地 Directus 已发布记录保持一致。本地 CMS 仅修改 `service_pages` 中 `tuihuo-zhijian` 的 `img_src`，原记录备份为 `/tmp/xyy-tuihuo-hero-before-20260821.json`，未修改其他 CMS 数据。
- 本地页面已确认实际加载最终图片，资源完整性检查与 `git diff --check` 通过；Playwright 桌面端 1440×900、移动端 390×844 实屏检查通过，挂仓、服装和作业通道主体可见，控制台0错误。本轮未提交、推送或部署，验收站与主站未修改。

## 首页退货质检作业区图片替换（2026-08-21）

- 仅替换首页“02 退货质检作业区”右侧独立资源 `/w-inspect2.webp`，最终图片为1448×1086 WebP；未修改首页首屏、文案、布局、其他区块或 CMS 数据。替换前资源备份为 `/tmp/xyy-home-inspect2-before-20260821.webp`。
- 本地首页已确认实际加载新图，资源完整性检查与 `git diff --check` 通过；Playwright 桌面端 1440×900、移动端 390×844 实屏检查通过，人物、牛仔裤和质检工位主体可见，页面横向溢出为0，控制台0错误。本轮未提交、推送或部署，验收站与主站未修改。

## 行业动态文章列表横向卡片优化（2026-08-21）

- 仅调整 `/news` 文章列表组件，桌面端由三列方块卡片改为单列横向卡片；直接复用现有 `cover_image`、`category`、`published_at`、`title`、`summary` 与 `slug` 字段，未修改 CMS Schema、文章数据和详情页。无封面文章继续使用品牌占位图，并补充中英文识别层级。
- 移动端自动切换为封面在上、内容在下的纵向卡片。Playwright 验证本地5篇文章均正常渲染，桌面端卡片1152px、封面区320px，移动端卡片358px且页面横向溢出为0，控制台0错误；`astro check` 为364个文件0诊断，ESLint、Prettier 和 `git diff --check` 通过。本轮未提交、推送或部署。

## 行业动态分类列表十篇上限（2026-08-21）

- `/news` 的“全部”及每个分类列表默认只展示最新10篇文章；当当前列表超过10篇时，在列表底部显示“查看全部”按钮，按钮保留当前分类参数并通过 `all=1` 展示该分类全部已获取文章。标题区文章总数继续显示当前分类的完整数量，分类切换不继承展开状态。
- 当前本地数据为全部5篇、物流干货3篇，均按边界规则不显示列表内“查看全部”按钮；Playwright 已确认分类选中状态、文章数量、页面无横向溢出且控制台0错误。`astro check` 为364个文件0诊断，ESLint、Prettier 和 `git diff --check` 通过。本轮未修改 CMS 数据、未提交、未推送或部署。

## 联系留言咨询服务中文显示（2026-08-21）

- 仅调整 `contact_leads.service` 的 Directus 字段元数据：保持官网提交的英文稳定代码不变，在 CMS 中通过选项和标签映射显示为“鞋服云仓、后整质检修复、物流云、全链路解决方案、其他”；未修改提交时间字段或客户留言记录。
- 本地 Directus 字段已同步并回读确认，原字段元数据备份为 `/tmp/xyy-contact-service-field-before-20260821.json`。字段映射单测8项通过，`astro check` 为364个文件0诊断，ESLint、Prettier 和 `git diff --check` 通过。本轮未提交、未推送或部署，测试站与主站未修改。

## 行业动态详情页顶部层级修复（2026-08-21）

- 仅调整行业动态详情页面包屑顶部留白，为固定导航栏预留空间；未修改全站导航、文章内容、CMS 数据或其他页面。
- 本地 `http://localhost:4322/news/111111111111111111111111` 实屏验证通过：桌面端导航与面包屑文字间隔10px，移动端间隔18px，页面无横向溢出，控制台0错误。`astro check` 为364个文件0诊断，ESLint、Prettier 和 `git diff --check` 通过。本轮未提交、未推送或部署。

## 站点内容与交互更新发布候选（2026-08-21）

- 当前全部已授权改动已收口到发布分支 `codex/site-content-ux-20260821`，包含两条旧服务专题路由下线、服务页与首页图片更新、鞋服云仓流程视觉调整、行业动态列表与详情布局优化，以及联系留言咨询服务中文标签映射；未包含主站部署或主站 CMS 写入。
- 发布门禁首次发现测试文件超过220行维护预算，已将咨询服务字段回归断言拆入独立测试文件；随后发现动画 CSS 的 `90%` 透明度字面量被公开数字门禁识别，已等价改为 `0.9`，页面视觉与业务口径均未改变。并行 E2E 首轮仅 `about-cases` 在30秒超时，单独复跑10.6秒通过，未放宽超时或修改测试。
- 最终 `npm run verify:release` 通过：365个 Astro/TypeScript 文件0诊断、523个文件通过维护预算、56个引用资源与103个部署资源完整、44个 Vitest 文件共284项通过、Playwright 37项通过且7项按配置跳过、正式域名契约3项通过、生产构建成功，`git diff --check` 通过。当前尚未提交、推送或部署。
- 首次测试站部署在上传前再次因同一 `about-cases` 并行负载超时安全停止，服务器未创建或切换新 Release。为保留30秒测试标准并消除 CI/部署机资源竞争，Playwright 现仅在 `CI` 环境固定为1个工作线程；调整后该用例8.6秒通过，完整 `CI=1 npm run verify:release` 再次全部通过。本地开发并发策略未改变。

## 站点内容与交互更新测试站发布（2026-08-21）

- 发布代码提交为 `8460e8b4e455708771349539d689e5aae12fad81`，测试站 Release 为 `20260821T084002Z-8460e8b`；发布脚本完成构建、PM2 切换与版本核验，`/healthz` 返回 `status=ok`、`contactStorage=ok`，`/version` 返回目标提交和 `staging` 环境。正式主站未部署、未迁移、未写入。
- 测试站首页、仓配服务、鞋服云仓、退货质检、后整修复、跨境云仓、直播仓配、行业动态及一篇真实文章详情均返回 HTTP 200；指定下线的 `/fuzhuang-yuncang` 与 `/weipinhui-jit-jitx` 均返回 HTTP 404。不存在的文章 slug 会按现有逻辑 302 返回行业动态列表。
- 按已授权范围，仅同步测试站 Directus 的 `contact_leads.service` 字段展示元数据：英文稳定值分别显示为“鞋服云仓、后整质检修复、物流云、全链路解决方案、其他”。服务器备份为 `/var/backups/xyy-cms/contact-leads-service-2026-08-21T08-52-56-454Z.json`；临时管理 Token 已恢复原值，未修改管理员密码、客户留言记录、其他字段或权限。
- Git 历史核对确认 `origin/codex/cms-hardening-20260820` 的最新提交 `0e40c56` 已是 `main` 与本次发布分支的祖先，因此其全部 CMS 修复已包含在当前代码中；合并主分支时仍执行显式合并检查，不删除该远端分支。
- 发布分支 `codex/site-content-ux-20260821` 已推送到 GitHub；在刷新远端状态并确认本地 `main` 与 `origin/main` 无分歧后，旧 CMS 分支的显式快进合并返回 `Already up to date`，本次发布分支随后无冲突快进合并并推送到 `main`。合并完成时两个远端分支均保留，未执行强推、变基或删除。

## 已合并分支清理（2026-08-21）

- 按用户明确要求，在再次确认 `codex/cms-hardening-20260820` 与 `codex/site-content-ux-20260821` 均已被 `main` 完整包含后，删除了这两个 GitHub 远端分支及对应本地分支；未删除提交、未修改 `main` 历史，也未影响测试站 Release。

## 测试站图片缓存与 CMS 覆盖修复候选（2026-08-21）

- 测试站文件与本地文件哈希一致，但静态资源响应设置了7天缓存；仓配服务顶部、跨境云仓、B2B门店仓配和首页退货质检此前沿用旧 URL，浏览器可继续显示旧缓存。同时测试站 `service_pages.img_src` 仍保留鞋服云仓、退货质检、后整修复和直播仓配的旧地址，覆盖了代码中的新图。
- 仓配服务顶部现统一引用新资源 `/images/services/warehouse-product-1800.webp`；跨境云仓、B2B门店仓配和首页退货质检分别切换到唯一的新 URL，并同步更新服务页 CMS Seed。未修改页面文案、布局、其他图片或正式站。
- 新增8项图片缓存契约测试并全部通过；`npm run verify:release` 完整通过：366个 Astro/TypeScript 文件0诊断、524个文件通过维护预算、45个 Vitest 文件292项通过、Playwright 37项通过且7项按配置跳过、正式域名契约3项通过、生产构建成功。当前尚未部署或写入测试站 CMS。

## 测试站图片缓存与 CMS 覆盖修复发布（2026-08-21）

- 修复提交 `57072cada3a5f7bb0819ee0bb3113e3632688899` 已通过原子发布脚本部署为测试站 Release `20260821T110023Z-57072ca`；发布脚本内完整 `verify:release`、依赖安装、PM2 切换、内部与外部健康检查及精确版本核对全部通过，未回滚。`/version` 返回目标提交和 `staging`，`/healthz` 返回 `status=ok`、`contactStorage=ok`。
- 按明确授权，仅同步测试站 `service_pages` 中6条 `img_src`：鞋服云仓、退货质检、后整修复、跨境云仓、直播仓配和B2B门店仓配。操作前备份为 `/var/backups/xyy-cms/service-page-images-2026-08-21T11-15-22-440Z.json`；回读6条均与代码和 Seed 一致，临时管理员 Token 已恢复，未修改其他字段、记录、权限或密码。
- 发布后真实 HTML 验收通过：6个服务专题页均输出各自新 Hero 地址；仓配服务页桌面与后备图片均只引用 `/images/services/warehouse-product-1800.webp`；首页退货质检区输出 `/w-home-return-inspection.webp`；4个唯一新资源均返回 HTTP 200。正式主站未部署、未迁移、未写入。

## 测试站图片修复 GitHub 同步（2026-08-21）

- 图片修复提交 `57072cada3a5f7bb0819ee0bb3113e3632688899` 与测试站发布记录提交 `00c4203` 已推送到 GitHub `main`；推送前刷新远端并确认 `origin/main` 无新增提交，本地仅领先上述2个提交。

## 仓配服务商品整理图库图片替换（2026-08-21，已发布）

- 将 `/product`「商品整理与增值处理」图库的大图替换为新的整烫作业照片，并将第4张「精致包装」缩略图替换为新的包装作业照片；前三张缩略图、右侧文案、链接和页面布局均未修改。
- 大图按原展示比例居中裁切并输出为 `2400×1186` WebP；第4张缩略图输出为 `1200×900` WebP。两张图片均使用唯一资源地址 `/images/services/product-care-ironing-20260821.webp` 和 `/images/services/product-care-packaging-20260821.webp`，避免旧静态资源缓存。
- 本地桌面端和 `390×844` 移动端实测通过：两张新图加载完成、4张缩略图数量不变、移动端无横向溢出；隔离环境及发布脚本内的 `CI=1 npm run verify:release` 均完整通过（366个 Astro/TypeScript 文件0诊断、45个 Vitest 文件292项通过、Playwright 37项通过且7项按配置跳过、正式域名契约3项通过、两轮生产构建成功）。
- 功能提交 `0508f711d464431500a14341a305ad7a2531ca17` 已推送到 GitHub `main`，并通过原子发布脚本部署为测试站 Release `20260821T144443Z-0508f71`；`/version` 返回目标提交和 `staging`，`/healthz` 返回 `status=ok`、`contactStorage=ok`。测试站 `/product` 已输出两张唯一新资源地址，外网回读文件与本地文件 SHA-256 分别一致；正式站未操作。

## Codex 多代理协作体系（XYY-20260821-01）

- 新增项目级 `.codex/config.toml` 与 `terra`、`luna`、`nova` 三个自定义 Agent 配置；Sol 继续作为主 Session，不创建 `sol.toml`。并发子线程上限为3。
- 职责固定为：Sol 统一规划、分级、调度和验收；Terra 实现；Luna 独立测试；Nova 质量、架构和安全 Review。子代理不得互相调度，失败与返工全部回 Sol并沿用原 Task ID。
- 模型与推理等级为 Sol=`gpt-5.6-sol/xhigh`、Terra=`gpt-5.6-terra/high`、Luna=`gpt-5.6-luna/high`、Nova=`gpt-5.6-sol/high`。
- `docs/SOL.md` 作为 Sol 流程、日志、调度和 Obsidian 项目入口；`docs/TERRA.md`、`docs/LUNA.md`、`docs/NOVA.md` 分别保留各自长期工作账，不为单个 Task 新建文档。
- 验证结果：四个 TOML 通过语法解析；本机 Codex 模型目录确认三个模型 ID 及目标 reasoning 有效；新临时只读 Codex Session 实际 spawn `terra`、`luna`、`nova`，三者均返回 `CONFIG_OK`；四份工作文档内部链接有效；`git diff --check` 通过。
- 当前已经打开的 Session 不热加载新增 Agent 类型，需在下一次可信项目 Session 中使用；新 Session 的实际 spawn 已证明配置可识别。这是会话刷新限制，不是角色或配置降级。
- 本任务仅修改 Agent 配置与 Markdown；未修改业务代码、部署配置或 `.env`，未连接或写入生产 CMS/数据库，未执行部署、迁移、DNS、TLS、Nginx 或 PM2 操作，也未运行与本次范围无关的完整网站 E2E/Release 门禁。

## Obsidian 项目管理环境（XYY-20260821-02）

- 仓库根目录已注册并实际加载为 Obsidian Vault；`docs/SOL.md` 是 Sol 的项目管理、Agent 导航、决策、调度和工作日志入口。
- Vault 使用当前 Obsidian 1.13.7 支持的 Core Plugins 和普通 Markdown，不依赖社区插件，也不复制项目文档或建立第二套状态系统。
- `.obsidian/` 的共享配置可进入 Git；`workspace.json`、`workspace-mobile.json` 与缓存等设备本地状态由 `.gitignore` 隔离。
- 本任务未修改业务代码，未连接或更改生产环境、CMS、数据库、DNS、TLS、Nginx 或 PM2，也未执行部署或迁移。

## 多页面转化区域统一（XYY-20260821-03）

- 本地仓库已新增共享 `ConversionCTA`：仓配服务总览、仓配下拉菜单中的 9 个服务专题页、合作案例、行业动态和森林期刊栏目首页统一使用双栏转化引导结构；栏目文案保持各自语义，主行动统一进入 `/contact`。
- 不在仓配下拉菜单中的数字化服务页继续保留原 CTA；案例详情、新闻详情、首页、关于页、CMS/API 契约和公开数字来源均未修改。
- 桌面与移动端 13 路由矩阵、独立 Luna 复测和 Nova Review 均通过；首次完整门禁发现并闭环组件文件超出可维护性预算，最终 `npm run verify` 通过（368 个文件 0 诊断、526 个文件通过预算、45 个 Vitest 文件 292 项通过、生产构建成功），`git diff --check` 通过。
- 功能改动已提交并推送到 GitHub，并作为应用提交 `539bfd44c05d81b5b7a1246cb009beec4c58f4c1` 发布到测试站；正式主站、生产 CMS、数据库、DNS、TLS、Nginx 和手工 PM2 配置均未修改。

## 多页面转化区域 GitHub 与测试站同步（XYY-20260822-01）

- 发布分支 `codex/unified-cta-governance-20260822` 与 GitHub `main` 已无冲突快进到应用提交 `539bfd44c05d81b5b7a1246cb009beec4c58f4c1`，未强推、变基或删除分支。
- 首次应用提交 `eac6790` 的 GitHub CI 在格式检查发现继承自基线的 `tests/unit/image-cache-contract.test.ts` 单行格式问题；同一 Task ID 下仅做 Prettier 机械换行，不改变断言或业务逻辑。新提交的 GitHub CI Run `32538099712` 中格式、候选 Release Identity、生产依赖审计和完整 Release verification 均通过。
- 测试站已通过现有原子发布脚本切换到 Release `20260821T235850Z-539bfd4`；`/version` 精确返回目标应用 SHA、`environment=staging` 和 CMS Schema，`/healthz` 返回 `status=ok`、`contactStorage=ok`。13 个目标页面均为 HTTP 200 且各有一个共享 CTA。
- Luna 对当前 Release 的 13 条路由执行桌面与移动端共 26 次真实浏览器检查并 `PASS`；Nova 复核 GitHub CI、版本一致性、Scope、安全边界和回归覆盖后最终 `APPROVED`。
- 两次发布前失败均在服务器上传或切换前安全停止：一次为浏览器并发资源超时，一次为手工注入 Release ID 影响本地部署契约 fixture；最终使用 `CI=1` 和脚本生成 Release ID 完成全部门禁与发布，没有回滚或遗留半发布状态。
- 本节工作账与状态收口会形成一个不改变运行代码的纯文档提交，因此 GitHub 仓库 HEAD 可领先测试站应用 SHA；应用内容以 `539bfd44c05d81b5b7a1246cb009beec4c58f4c1` 为三方共同基线，无需为纯文档重复部署。
- 本任务仅部署测试环境；未部署正式主站，未写入 CMS 或数据库，未修改 DNS、TLS、Nginx、生产环境变量或手工 PM2 配置。

## 官网线索接入本地实现候选（XYY-20260824-01）

- XYY-WEB 与 XYY-xiansuo 已在本地完成官网线索 Server-to-Server Integration 实现和验收：浏览器继续只调用 `/api/contact`，官网服务端使用独立 Bearer Token、单次有限超时和 HTTPS JSON 契约调用 XYY-xiansuo 专用接口；XYY-xiansuo 服务端控制 active owner、字段映射、电话规范化、duplicate 语义及 lead/audit 原子事务。
- Directus 继续承担官网 CMS 内容职责，健康检查已在代码中区分 `cmsContent` 与 Xiansuo `contactStorage`。历史 Directus / Oracle `contact_leads` 保留，未迁移、删除、清空或双写；XYY-xiansuo SQLite Schema 与生产数据均未修改。
- 本地质量门禁最终通过：Luna `PASS`，Nova Re-review `APPROVED`；XYY-WEB verify 为 47 files / 306 tests，桌面与移动 E2E 39 passed / 7 configured skips、formal 3 passed；XYY-xiansuo build 与 179 tests 通过，两仓 `git diff --check` 通过。
- 当前状态仅为 implementation ready，不代表 production active。两仓改动尚未提交、推送、合并或部署；双方真实 Token、XYY-xiansuo active owner、生产环境变量、HTTPS 联调和切换均未执行，正式环境仍维持任务开始前的联系写入路径。
