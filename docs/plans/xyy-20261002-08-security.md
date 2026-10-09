# XYY-20261002-08 — 本地安全排查与定向加固

- 用户目标：优化项目，最终明确优先安全；自主完成，无须追问。
- 风险：HIGH（安全）；Sol 调度，定向排查 → Terra 实施 → Luna 独立验证 → Nova Review → Sol 验收。
- 基线：HEAD `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`。已有脏文件与各文件 SHA-256 保存在 `output/security/xyy-20261002-08/baseline.json`。不得覆盖其他改动。
- 当前 Scope：只读排查咨询 API 输入/来源/限流、CMS HTML 与资源代理、服务器请求策略，依据可复现证据选择最小本地安全修复。实施前在本合同补齐具体文件与 AC。
- 排除：提交、推送、部署、生产操作、真实 CMS/数据库/询盘写入、权限与 Secret 配置变更、依赖批量升级、无关性能/视觉重构、既有未提交动效。
- 所有权：Sol 独占本合同、`DEV_STATE.md` 与 `docs/SOL.md` 本任务记录；排查代理无实现写权限。各角色仅追加自身日志与本任务忽略的证据目录。具体实现与测试所有权待定向发现后冻结。
- 输入：AGENTS.md、本合同、相关当前代码/测试、各自最近相关日志；图谱仅作定位，结论以代码和本次测试为准。
- 初始 AC：发现必须给出当前代码位置、真实触发条件、可在本地使用合成数据复现的风险及最小修复建议；不能把假设或历史问题写为已确认漏洞。最终修复必须有安全回归与正常行为兼容证据、独立 QA PASS、Review APPROVED、无范围外变更。
- 证据：`output/security/xyy-20261002-08/`；禁止记录敏感值，不联系真实外部接收端。
- 交接：所有阻塞、范围扩展、返工回 Sol；子代理不得再委派；测试与审查在实现冻结后顺序进行。

## 冻结实施范围与验收

- 已确认：匿名咨询入口先完整读 body 后检查8KiB；Content-Type 使用 includes 且缺失也放行（Astro 已有跨站来源保护，不能宣称已证实CSRF）；资源代理允许已发布引用的上游 HTML/SVG 作为本站主动文档；资源引用缓存对不存在UUID不生效，可重复触发7组CMS查询。
- Terra 独占实现：`src/lib/contact/http.ts`、`src/pages/api/contact.ts`、`src/lib/directus-assets.ts`；独占新增回归：`tests/unit/contact-http-security.test.ts`、`tests/unit/contact-content-type.test.ts`、`tests/unit/directus-assets-security.test.ts`。只追加 `docs/TERRA.md` 本任务记录。
- Luna 独立验证，允许在本任务 output 目录写合成验证工具/证据并追加 `docs/LUNA.md`；不得修改实现。Nova 只读 Review、追加 `docs/NOVA.md`。Sol 管理合同/客观状态/日志。需额外文件先回 Sol。
- AC1：无 Content-Length 或低报长度的分块请求，一旦原始字节累计超过8192立即取消读取并返回原413/body_too_large；不得先读完整body。恰好8192及跨chunk的UTF-8合法JSON继续正确解析；空/非法JSON仍400，流读取异常由API统一500，不吞错；取消失败不覆盖413。
- AC2：仅 MIME 主类型精确 application/json（忽略大小写/首尾空格，允许charset参数）进入读取；缺失/伪装/文本或表单类型返回原415/unsupported_content_type且不触发存储。正常中英文JSON、蜜罐、限流、原有错误码与隐私规则保持。
- AC3：资源响应有独立策略隔离HTML/SVG的脚本与同源权限，并显式nosniff。合成浏览器证明恶意inline脚本不执行，安全图片可显示、PDF仍可取得且下载/查看行为不被无意破坏；保留类型、字节、Range/206/304、ETag等既有协议。若统一sandbox影响PDF则必须回Sol定向收口，不能接受兼容倒退。
- AC4：未过期引用缓存对不存在的UUID同样生效；同/不同缺失UUID在5秒内共享一次7集合查询，404且不取asset；到期重查、合法发布资产可取，未发布/无token/上游失败仍按原契约失败。
- 验证：Terra新增安全回归并自测；Luna跑针对性单测、npm run verify（所有外部服务固定本地不可达/合成凭据）、现有中文/英文咨询成功失败桌面与移动回归、合成资源隔离/图片/PDF验证；Nova审实际diff、攻击前提、兼容性、范围与证据。受限磁盘不做无关全量E2E或复制完整仓库。
- 排除补充：本轮不改IP/反向代理信任、跨进程限流架构、新闻发布鉴权接口、全站CSP/HSTS、上游CMS权限；这些依赖额外环境事实，不能把本地假设当线上漏洞。未做线上渗透或声明全站绝对安全。
- 参考：OWASP REST Security Cheat Sheet（请求大小与媒体类型）、MDN Streams cancel 与 CSP sandbox；只作为设计依据，实际效果以本次验证为准。

## 实证补充范围（实施期间，Sol 批准）

- 定位确认限流表在1000项后每请求扫描全部活跃桶，唯一key洪泛引起二次方CPU增长且无容量上限；存储失败日志包含明文姓名/公司。与安全目标直接相关，纳入本轮最小修复。
- Terra 新增所有权：`src/lib/contact/rate-limit.ts`、`src/lib/contact/storage.ts`、`tests/unit/contact-rate-limit-security.test.ts`、`tests/unit/contact-storage-privacy.test.ts`。其他所有权不变。
- AC5：进程内限流桶硬上限1000（沿用原清理阈值），使用有界有序淘汰，容量满时淘汰最早到期桶，不因容量满而拒绝所有新访客。避免每请求全表遍历；保留同key十分钟内前5次允许、第6次429、到期恢复与测试reset；不改变IP来源优先级。大批唯一key可观察容量淘汰且成本不再二次增长。明确此限流为进程内尽力防护；容量压力下被淘汰key计数重置，非分布式防护保证。
- AC6：存储失败仍记录固定原因/HTTP状态以定位问题，但不记录lead任意字段、凭据、下游body或异常详情；合成覆盖缺配置、HTTP错误、非法响应、fetch异常，均不泄露姓名/公司/电话/邮箱/需求/Token，API原通用失败保持。
- 不扩大到分布式限流、真实日志删除、CMS权限或生产入口网络控制。
- AC4补充：同一进程并发冷请求共享一次引用读取；读取失败明确抛出，不记成功缓存，共享promise释放后可重试。Sol确认此小范围并发合并属于已证实查询放大修复。

## 参考与实施冻结

- [OWASP REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)：请求大小限制、Content-Type检查及413/415语义。
- [MDN Streams cancel](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader/cancel)：超限后取消流。
- [MDN CSP sandbox](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/sandbox)：资源文档脚本与同源能力隔离，实际PDF/图片兼容性仍须浏览器验证。
- Terra R1交接57项定向测试通过、类型/格式/lint通过；实施10文件hash已冻结于`implementation-freeze.json`。Sol确认1418个非任务/非日志已有文件内容保持，HEAD不变、索引空。以上仅为实施阶段结果，尚待独立QA与Review。

## 最终验收

- 状态：CLOSED（仅本地）；Luna PASS，Nova APPROVED，Sol验收通过。实施冻结保持，没有代码返工或额外发布动作。
- 独立完整检查：`npm run verify` exit0，586类型文件零诊断、620单测，lint/维护/assets/build通过。中英desktop/mobile咨询38项、资源合成浏览器2项、headed Chromium有效PDF基线对照1项通过；额外现有核心页面契约1项通过。
- 浏览器验证工具初版的HTML标记位置和无效PDF样本不足以证明效果；已更正为同一documentElement标记、无策略可执行对照及本地有效PDF，再执行通过。最终截图已由Luna/Sol/Nova审阅，不能把早期HTTP200检查等同于查看器证明。
- Sol额外真实本地HTTP分块探针收到原413/body_too_large（发送12288bytes即停止，预定1MiB未读完）；限流1000/10000/100000合成唯一key耗时3.47/11.06/45.4ms，原5次/10分钟边界保持。仅本机测量，非生产吞吐承诺。
- 修改清单：本合同所列5实现、5新增单测，以及DEV_STATE和四角色日志。安全依赖检查`npm audit --omit=dev`为0已知漏洞，不能等同于不存在未知漏洞。
- 未提交、推送或部署；没有真实CMS/数据库/询盘操作。1418个非任务/非日志已有文件保持、10文件冻结一致、旧日志前缀保留。单进程限流容量淘汰重置计数与非生产/非真机验证限制保留。
- 完整证据：`output/security/xyy-20261002-08/luna/`、`nova/review.md`、`sol-contact-wire.json`、`sol-rate-limit-probe.json`、`final-acceptance.json`。
