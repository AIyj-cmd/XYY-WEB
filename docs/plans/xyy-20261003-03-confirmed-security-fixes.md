# XYY-20261003-03：三项已复现安全问题修复

日期：2026-10-03。风险：HIGH。状态：本地验收 CLOSED；Terra 完成、Luna PASS、Nova APPROVED、Sol 验收。

## 授权与基线

用户确认只修复 F1/F2/F3，并要求执行计划。本任务仅本地实现和验证，不提交、推送、部署或进行真实 CMS、数据库、询盘及其他外部写入。代理/IP 信任、依赖告警、全站 CSP、生产配置、业务契约与既有动效均排除。

HEAD 为 `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`。工作区已有修改，尤其 `src/lib/directus-assets.ts` 的既有安全加固须完整保留。1437 个基线路径（含两份被忽略的 public HTML）、116 个旧审计证据、脏状态和监听记录见 `output/security/xyy-20261003-03/baseline.json`。本任务已有实现文件的修改前快照位于该目录的 `before/`。

## 最小范围与所有权

| 角色  | 文件所有权与职责                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Terra | `src/lib/news-publishing/http.ts`、`src/lib/directus-assets.ts`、`src/pages/api/cms-assets/[id].ts`、`package.json`；新增 `scripts/check-public-artifacts.mjs`、`tests/unit/news-publishing-body-stream.test.ts`、`tests/unit/directus-assets-abort.test.ts`、`tests/unit/public-artifacts.test.ts`；移动两份 public 审阅 HTML 到 `output/internal-reviews/XYY-20261003-03/`；自测证据写 `output/security/xyy-20261003-03/terra/`，追加 `docs/TERRA.md` |
| Luna  | 实施完成后独立验证；临时脚本及证据只写 `output/security/xyy-20261003-03/luna/`，追加 `docs/LUNA.md`；不改实现或既有测试                                                                                                                                                                                                                                                                                                                                 |
| Nova  | Luna 完成后独立审查本任务增量、证据、边界和回归；只写 `output/security/xyy-20261003-03/nova/`，追加 `docs/NOVA.md`                                                                                                                                                                                                                                                                                                                                      |
| Sol   | 范围、合同、基线、验收；本合同、`DEV_STATE.md`、`docs/SOL.md` 和任务 `sol/` 证据                                                                                                                                                                                                                                                                                                                                                                        |

各角色不得再委派。需要新增文件、扩大范围或出现冲突时返回 Sol。不得覆盖用户及其他角色修改；不得改写旧任务证据或旧日志前缀。独立测试和 Review 按 Terra → Luna → Nova → Sol 顺序执行；返工沿用本 ID。

## 实现要求

1. **F1**：新闻请求体逐块累计原始字节，保留 1 MiB 限额；超限块不缓存，立即取消读取并返回原 413，不等待 EOF 或取消 Promise 完成。正常内容收齐后一次性解码、解析，正确处理跨块 UTF-8；正常、失败和取消路径释放 reader。保持鉴权顺序、Content-Length 提前检查、媒体类型和既有错误契约；不重构咨询 reader。
2. **F2**：将 `public/新亦源官网审阅Swiss.html`、`public/新亦源官网截图审阅.html` 原样移至上述归档目录，保存移动前后 SHA-256。新增递归 public 检查，拒绝大小写不敏感的 `.html`/`.htm` 并列出路径、非零退出；接入 prebuild 的字体准备之前，以及资源检查。保留字体准备。只检查 public 源目录，不拒绝 Astro 生成页面；无现存合法 HTML 例外。
3. **F3**：`fetchPublishedDirectusAsset` 第三个 fetch 注入参数保持兼容，在最后增加可选 AbortSignal；资源路由传 `request.signal`。预取消时不开始资产工作，传信号给资产 fetch，覆盖等待头和读取 body。单个客户端取消不能取消共享公开引用查询或影响其他请求。复用 Astro 已有的 socket → request.signal 连接，不改 server；不新增全程下载时限，保持现有超时、503/404/502、Range/304、响应头、安全策略及清理语义。

## 可测试验收标准

- F1：恰好 1 MiB、加一字节、中文跨块、非法 JSON、未鉴权、声明超长均符合原契约；真实 Node/Astro HTTP 无 Content-Length 发出 1,250,000 字节后暂停 1200 ms，必须在 EOF 前收到 413。合法新闻写入仅使用本地 mock。
- F2：归档与原文件哈希一致；public 及新 dist 无两份文件，两条 HTTP URL 均 404；临时目录下嵌套和大小写 HTML/HTM 检查失败，普通资产通过。保护其他静态资源和 Astro 生成 HTML。
- F3：6 秒慢上游，客户端约 1 秒断开后，上游在额外 1 秒内提前关闭且未正常完成；覆盖读取中取消、正常完成和并发请求仅取消一个的情况。不得产生未处理 Promise 异常或改变共享引用缓存行为。
- 兼容性：PNG/SVG、真实 8 页 PDF 查看/读取、Range、304 正常；HTML/SVG 正向对照能执行脚本，资源代理策略仍阻断脚本。
- 当前候选 `npm run verify` 通过；执行针对上述变化的真实 HTTP、浏览器和格式/diff 检查，不重复无关咨询矩阵或发布门禁。不以历史测试数量代替本次证据。
- 既有脏文件、范围外文件、旧证据、日志前缀和 HEAD/索引保持；保留原 4321/4524 服务，自建监听仅回环且验收后关闭。工作区磁盘不足 1 GiB，禁止完整复制媒体/仓库或清理旧证据。

## 输入与交接证据

复现输入：`output/security/xyy-20261003-02/reproduction/report.md`、`reproduction/luna/reproduce.mjs` 与各轮原始结果；兼容性参考原审计 `luna/browser-probe.mjs`、`http-fixture.mjs`、`pdf-headed-probe.mjs`。只读使用，改造的脚本写新任务目录。PDF 使用 `public/senlinqikan/pdf/5.pdf`，不得用无效示意 PDF。

Terra 交付任务增量、红绿测试和归档哈希；Luna 交付实际命令、原始结果、时间事件、截图及限制；Nova 给出 APPROVED/REJECTED 与定位；Sol 最终核对保护文件和停止临时进程后更新客观状态。全部网络业务验证使用本地模拟上游、合成凭据，显式覆盖真实环境配置，不读取或打印 Secret。

## 本次实际验证

- Terra 新增三份回归测试，实际红测失败后完成实现；红测为工具输出追记摘要，未冒称原始日志。定向绿测 6 文件、48 项通过。
- Luna 本次 `npm run verify` exit 0：590 类型文件零错误/警告、99 测试文件共 629 项通过，lint、维护预算、资源检查和新构建完成。构建入口 SHA-256 为 `fe1061f5a89db4fc8005d3ca145e897b26131f7187b1254adf4f871c6df8efa3`。
- F1：真实 1 MiB 合法请求与拆分 UTF-8 返回 201；超一字节及声明超限 413，非法 JSON 400，无凭据 401。独立连接发送恰好 1,250,000 字节且不 EOF，Node HTTP 7 ms、raw TCP 8 ms 收到 413。Sol 另一个新进程相同字节数 79 ms 收到 413。这些是单次本地观测，不是性能保证。
- F2：原文档与归档 SHA-256 一致，public 与新 dist 均无两份文件，两条编码 URL 404；临时目录中嵌套、大小写 HTML/HTM 拒绝，普通资源通过。
- F3：6 秒慢上游在客户端约 1 秒取消后 7 ms 提前关闭，未正常 finish；读取中取消同样关闭未完成响应。另一组冷缓存下 7 次共享查询延迟约 1500 ms，一方 200 ms 断开且未发资产请求，全部查询仍正常完成、另一方 200。正常下载完成。
- headed Chromium：HTML/SVG 上游脚本阳性对照及代理脚本阻断、PNG/SVG 显示、Range 206/10 字节与 304 均通过；真实 PDF 响应哈希与源文件一致，Luna 与 Sol 亲读截图，查看器显示 1/8 及正文。
- 当前 8 个候选文件哈希保持；1426 个保护文件、4 份旧日志前缀、116 份旧任务证据、HEAD 和索引保持；4610/4611/4612 已停止，原 4321/4524 监听保留。

失败历史保留：提前完整性检查因旧 dist 副本失败，随后独立新构建验证不再输出；HTTP 探针的 CRLF 转义、跨案例连接复用、Promise 结果读取和共享查询时间窗口问题，只修测试工具后重测；浏览器图片首次因从 sandbox 页面进入 about:blank 的上下文失败，改为独立新 page 后通过。最终 verify 后未改业务，不重复全量检查。详见 `output/security/xyy-20261003-03/terra/`、`luna/` 和 `sol/`。

剩余范围限制：仅本地合成 Directus、有限并发和 Linux Chromium；未操作或验证生产入口、真实 CMS/数据库/询盘、持续压力、多实例、Safari/微信真机。代理信任条件风险和依赖告警按用户选择保留，未升级依赖。未提交、推送或部署。

Nova 最终独立 Review 为 APPROVED，无阻断，确认接口兼容、既有修改保留、最终证据和历史失败边界。Sol 已同步 `DEV_STATE.md` 与角色记录；文档增量/格式及最终完整性检查后，本地范围验收完成。Review 见 `output/security/xyy-20261003-03/nova/review.json`，最终验收记录见 `output/security/xyy-20261003-03/sol/final-acceptance.json`。
