# XYY-20261003-04：安全修复提交、发布与同步

日期：2026-10-03；2026-10-04 恢复并完成。风险：HIGH。状态：CLOSED，已提交、部署验收站、推送 GitHub 并同步本地；线上 304 覆盖限制保留。

## 用户目标与当前授权边界

用户在缓存补丁完成后再次明确要求提交 Git、部署服务器、同步 GitHub，并更新本地状态。GitHub 当前仓库为 `AIyj-cmd/XYY-WEB` 的 `main`。据最新请求，本次 Scope 为此前两轮安全修复与本地缓存依赖补丁的合并结果，共 27 个代码/配置/测试文件，冻结于 `resume-20261004/release-files.json`。用户已明确选择验收站 `wz.tomatopia.top`，授权证据为 `resume-20261004/authorization.json`；只发布 staging，不操作正式主站。

本地候选、验证和 Git 提交可独立进行；用户已要求同步当前 GitHub 仓库，普通非强制推送 main 属于范围内。优先按用户要求在部署后推送；若技术门禁受阻，则提交和本地准备先完成，明确保留未部署状态。本轮环境确认已完成。CMS/数据库/真实询盘写入、DNS/TLS/Nginx、权限、远端环境配置、额外依赖升级及无关动效/素材/治理修改仍排除。

## 2026-10-04 本次输入与执行范围

- 新基线及旧证据保护在 `output/release/xyy-20261003-04/resume-20261004/baseline.json`；HEAD 仍为 `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`。本次只向已核验 clean 的隔离候选复制 27 个冻结文件，不移动、提交或覆盖主工作区无关修改。
- `XYY-20261004-01` 的 11 文件冻结与旧 17 文件合并，唯一重叠 package.json 采用包含两轮改动的最新冻结；不得回退依赖补丁或已有 public 构建门禁。
- 本次重新联网生产 audit 实际 exit 0，返回零告警；file 本地包仍不在公告扫描覆盖内，安全依据保留独立行为测试与 Nova 源码审阅。
- Luna 独立验证候选 `npm run verify`、精确文件范围/哈希及干净生产安装结果；Nova 审阅提交候选和授权边界。若安装仍有网络阻塞，记录真实状态，不关闭 TLS 或减少审计门禁。
- Sol 负责本次 baseline、manifest、隔离候选拷贝、审计、独立安装目录、Git 提交/同步、合同/DEV_STATE/SOL；Luna 仅本次 `luna/` 证据及追加 LUNA；Nova 仅本次 `nova/` 和追加 NOVA。Terra 准备本次发布 wrapper/远端快照/本地同步 helper，以及验收站部署准备目录内的干净生产安装 helper；所有 helper 写于本次恢复目录，不改业务或现有 deploy.sh。角色不得再委派。
- 本地 npm tarball 下载仍发生证书/连接失败，已停止并保留原始日志。允许在已授权验收站、独立于 current/旧 releases 的本任务准备目录先验证 clean production npm ci、严格 audit、精确 vendor hash/解析与合成缓存正反例；不加载真实业务配置或启动站点。该准备操作属于本次部署范围，成功后才执行既有发布脚本；既有脚本仍在任何 release 上传或切换前完整运行 verify:release，不跳过门禁或关闭 TLS。
- AC：27 文件与已审冻结一致且无额外 Git diff；本次 verify 通过后才提交；部署前完整 verify:release、干净生产安装和有效 audit 通过；准确环境版本与健康检查、GitHub 推送/CI、主工作区 refs/索引/受保护文件及状态记录各有实际证据。无法完成的阶段保持 BLOCKED，不能混称已完成。
- 下方原预检段落和数量为 2026-10-03 历史；恢复段落为当前范围与授权判断，原证据不覆盖。

## R3：处理已证实的测试产物磁盘阻塞

- R1 完整门禁为 267 E2E 通过、9 跳过、2 个 Chromium 资源/崩溃失败；独立定向复测一次通过，未修改断言。R2 使用独立 TMPDIR，但 Playwright 的 trace 仍写默认 `test-results`，生成约 535 MiB 临时产物导致实际 ENOSPC，日志及退出记录不完整，不能认定通过。两次均未部署，原始证据保留；R2 全部 5981 个测试产物经 SHA 校验暂存本任务 tmpfs，必须形成持久归档。
- 已发现独立数据分区 `/home/yj/data` 尚有约 12 GiB。Sol 将完整隔离候选复制至 `/home/yj/data/xyy-release-20261003-04/candidate`，保持字节、权限、符号链接和 Git 身份；独立完整性验证后才移除原隔离副本并将原 `/tmp/xyy-20261002-02-website` 路径改为指向新位置的符号链接。禁止跟随 node_modules 链接复制主工作区或修改其他候选。
- R2 原始产物同步复制至该数据目录独立归档，并逐项验证原 manifest，原 R1/R2 部署日志和 preflight 证据另作不可覆盖归档。已短暂尝试的输出目录配置方案全部撤回，Terra 确认六个 helper 回到 R2 冻结；配置无差异，最终仍为原 27 文件、原提交和原测试门禁，不新增业务或配置提交。
- 所有权：Sol 负责本任务候选和证据迁移、原目录符号链接、服务器本任务 preparation 的无覆盖重命名、原 wrapper 执行及状态；Luna 独立验证迁移字节/权限/链接/提交/冻结、Playwright 默认产物的物理位置和容量；Nova 审阅恢复边界与证据。角色仅追加各自日志和本任务证据，不再委派。
- AC：所有候选及历史产物完整保留，候选仍 clean 且精确 27 文件哈希不变；Playwright 默认输出实际位于独立分区，数据分区至少 3 GiB、根和 /tmp 至少 512 MiB 空间；端口 4510/4511 空闲。通过独立验证和 Review 后，原 wrapper 仅一次完整重试；仍须完整 verify:release 实际成功才允许部署。R2 child 退出码未持久记录，outer exit 1 与 ENOSPC 单列，不编造测试通过。uv 缓存锁等待已中止，未强制清理。

## 已完成基线与候选

- 主工作区 HEAD 与 origin/main：`5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`；GitHub main 只读查询与此一致。
- 基线：1440 个 Git 枚举文件、94 条既有脏路径、4 份角色日志前缀、215 份旧安全证据；见 `output/release/xyy-20261003-04/baseline.json`。
- 现有隔离候选 `/tmp/xyy-20261002-02-website` 与基线同 HEAD 且工作区 clean；无 `.env`，使用现有依赖链接，不复制整棵仓库或媒体。
- 两轮安全修复的建议合并清单共 17 个实现/测试文件，当前哈希与两轮验收冻结一致；清单为 `proposed-security-bundle.json`。该清单目前只是可审阅建议，未经用户选择不据此提交或发布。
- 磁盘约 818 MiB，保留 512 MiB 发布空间守卫；不清理旧证据、用户文件或既有发布候选。
- 当前生产依赖审计重新联网实测 exit 1：3 个 high 包记录，共 1 条根因公告 `GHSA-ch52-4w7c-c8xp`，涉及 `http-cache-semantics` 及 Astro 依赖链。CI 的 `Audit production dependencies` 步骤使用相同命令，因此现有依赖状态会阻断该步骤；尚未创建本轮提交或触发 CI，不能表述为本轮 CI 已失败。npm 给出的修复建议涉及 Astro 跨大版本降级，本轮未执行。原沙箱网络失败和授权重试 JSON 分别保留。

## 角色所有权

| 角色  | 范围与文件所有权                                                                                                                                                           |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sol   | 目标与范围核对、本合同、`DEV_STATE.md`、`docs/SOL.md`；新任务基线、冻结、候选准备、Git 提交、批准后的部署/推送/本地同步执行及最终证据                                      |
| Terra | 仅新任务目录内 `run-website-deploy.sh`、`remote-snapshot.py`、`check-remote.py`、`sync-local.py` 与 `terra/`；追加 `docs/TERRA.md`；不改业务或生产部署脚本，不执行外部写入 |
| Luna  | 新任务 `luna/` 与 `docs/LUNA.md` 追加；独立候选验证、发布工具预检、完整门禁证据复核和发布后只读 QA；不改实现、不发布、不提交真实表单                                       |
| Nova  | 新任务 `nova/` 与 `docs/NOVA.md` 追加；发布前后及同步工具独立 Review，不执行外部写入                                                                                       |

角色不得再委派；不是独占代码库，须保留所有既有及并行修改。需要额外文件、业务修复或扩大授权时返回 Sol；测试失败与环境阻塞分别记录，历史失败不得覆盖。

## 实施顺序与验收条件

1. 用户确定部署目标和安全发布范围后，冻结精确清单及哈希，候选只含该范围相对基线的修改。根工作区其他脏文件和旧证据保持。
2. Terra 最小复用既有发布工具并固定本任务的环境、目标、候选、清单和守卫；Luna 独立检查、当前候选 `npm run verify` 与所需格式检查通过。
3. Sol 在隔离候选创建可追溯提交，候选 clean，Nova 发布工具 APPROVED。按恢复段先在独立准备目录完成干净安装；既有部署脚本在任何 release 上传或切换前必须实际完成 `npm run verify:release`，失败不得部署。
4. 部署采用当前脚本的原子切换与健康回退，仅更新明确授权的网站进程。发布前后只读快照核对精确 SHA、releaseId、environment、健康依赖、previous、旧 releases、CMS 进程与环境哈希；不删除旧 release。
5. Luna 线上只读验证页面、两份内部 HTML 的 404、正常资源及相关响应头；真实询盘/新闻/CMS 写入禁用。需要合成写入或慢上游的安全复现仍在本地 mock 中进行。Nova 发布后 APPROVED。
6. 向准确仓库 main 普通非强制推送该提交，记录 GitHub CI 的真实结果；若既有依赖告警导致 CI 阻断，明确报告，不擅自升级或绕过检查。
7. 主工作区仅同步已发布清单对应的 Git 对象、索引及 refs，工作文件内容保持；核对本地 HEAD/main/origin/main、GitHub 和服务器 SHA，一致后更新状态与日志。无关脏路径、4 份日志前缀、215 份旧证据不变。

真实剩余风险或 CI 阻塞应独立列出，不能把已提交、已部署、已推送和 CI 成功混称为完成。最终证据必须是本轮实际命令、结果、哈希、QA 与 Review；不得沿用历史测试数量作为当前门禁结果。

## 输入

当前两轮安全修复合同与验收：`xyy-20261002-08-security.md`、`xyy-20261003-03-confirmed-security-fixes.md`。发布工具参考 `output/release/xyy-20261002-07/`，只读使用；当前 `scripts/deploy.sh` 与 `.github/workflows/ci.yml` 为实际流程依据。旧 Graphify 仅能定位 deploy 节点，不作为当前发布配置证据。

## 上线 HTTP 检查的判定澄清（2026-10-04）

- R3 原 wrapper 实际 exit 0：673 单测、269 E2E 通过/9 既有跳过、4 formal 与最终构建通过；验收站已为 0ffe149 / 20261004T044635Z-0ffe149。24 旧版本、previous、CMS 进程和环境 hash 保持，真实 current 的 vendor 4.2.0-xyy.1/hash/Astro 解析与合成正反例通过。
- 线上 QA R1 自动 FAIL 保留。重复 nosniff 为应用与边缘各发同值；Fetch 标准按首 token 判断，保护有效，不能称缺失。curl/Node 与服务器 loopback 对匹配 ETag 都返回相同资源 200，线上 304 未观察到；不冒称 304 已通过或推定精确远端根因。新旧源码的条件转发及 fetch cache 策略未变，Nova 认定未证实新的安全/核心契约回归，为本 Scope 的非阻断覆盖限制与既有缓存效率现象。
- Sol 授权 Luna 仅修本任务 QA 工具：按标准验证 nosniff；条件 304 仍验证安全头和空 body，条件 200 则要求相同 ETag/资源字节且安全头有效，并明确记 NOT_OBSERVED，不把它计为 304 成功；其他错误状态仍失败。其余页面、404、资源、Range 等断言保持，原 FAIL 和原脚本归档，有限 GET 复测后由 Nova 最终审阅。无业务、代理或已部署提交修改，不因工具判断修正重跑未变全量测试。
- 主源与新旧源码差异见 resume-20261004/http-semantics/；仅本地合成证据证明上游 304 时的透传与安全头，线上 304、真机及真实接收未测作为交付限制。

## 部署准备目录收尾

- 仅清理本任务三个精确 preparation 目录的顶层 node_modules：固定目录及其 r1-completed/r2-completed 归档；不使用通配符，不删除任何 release 或运行中的依赖。删除前核对 canonical path、真实目录、无进程引用及 runtime vendor 指向 current；其余 72 个文件/目录的 mode/hash 已完整归档并校验到独立数据分区。
- 实际清理 exit 0，服务器 free 由 441675776 恢复为 1033854976 bytes；清理前后 current/releases/previous/version/health/processes/shared env hash 等字段保持。三轮安装证据与源码保留，Luna 做最终只读复核；本轮不改变发布内容或增加部署。

## 最终验收（2026-10-04）

- 精确 27 文件提交 0ffe149df13148d6280b5230979eb0a3d0ea26cb；发布前 verify 与 R3 完整 verify:release 实际成功，真实生产安装/audit/vendor 行为验证通过。原 R1/R2 失败记录与本地安装网络失败不改写。
- 验收站版本 0ffe149 / release20261004T044635Z-0ffe149，version/health、旧 releases/previous/CMS/env 保持，Luna线上 R2 PASS_WITH_LIMITATION，Nova 发布后 APPROVED。线上 304 保持 NOT_OBSERVED，条件 200 内容/ETag/安全头一致；不把它当 304 成功。
- GitHub main 普通 push exit 0，同 SHA CI37179272846 completed/success，673 单测、269 E2E/9 跳过、4formal 与最终build/audit均通过；日志与 JSON 已保存。既有 sync-local.py 在确认 CI 成功后执行 exit 0，本地 HEAD/main/origin/main 同步，索引与27发布文件清洁。
- 本轮只收尾自身重复临时产物，72条远端准备记录完整持久保留，Luna清理后只读PASS；未删除任何旧release，未修改正式主站、CMS/数据库/真实询盘或基础设施。Sol 更新 DEV_STATE/日志并核对保护文件、旧日志前缀、差异与格式后关闭任务。
