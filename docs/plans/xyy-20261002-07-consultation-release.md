# XYY-20261002-07 — 咨询体验二期发布与 Git 同步

## 授权、风险与目标

- 用户明确要求部署服务器、提交 Git 并推送 GitHub、同步本地状态。HIGH；准确目标沿用现有验收站 `https://wz.tomatopia.top`、`root@47.82.105.103:/var/www/xyy-web`（staging）、`AIyj-cmd/XYY-WEB main`。
- 发布 Task06 已验收的22项实现、测试和功能说明，清单及SHA为 `output/release/xyy-20261002-07/release-files.json`。主工作区基线HEAD为 `ab82cbdafb3923e4d62041b801d700f360ccdf20`，原95条脏状态与全文件hash在同目录baseline。范围外动效、素材、治理配置和历史日志保留。
- 复用已核对clean且同HEAD的隔离候选 `/tmp/xyy-20261002-02-website`，仅复制22项冻结文件；独立verify通过后在隔离候选形成发布提交，供clean-worktree门禁和精确版本身份使用。服务器部署及线上核验完成后，才推送GitHub main并同步主工作区refs/index和状态；不从脏工作区直接部署。

## Scope、所有权与顺序

- Sol：本合同、DEV_STATE、docs/SOL.md、发布基线/冻结/候选/最终证据；准确目标与授权核对、候选准备与提交、执行已审发布工具、GitHub推送/CI确认和主工作区同步。
- Terra：仅本任务输出目录的 `run-website-deploy.sh`、`remote-snapshot.py`、`check-remote.py`、`sync-local.py`、`terra/` 与docs/TERRA.md。复用Task04部署/远端工具和Task02同步工具，最小调整目录、22文件数量及基线格式；不改生产部署脚本或业务、不执行外部写入。具体新失败需要Sol同ID重新派发最小修复。
- Luna：本任务 `luna/`、docs/LUNA.md；独立候选verify/格式/保护/预检，发布后中英文390/1440关键流程与只读健康核验。不得改实现或执行发布、真实询盘；无必要不重复已经通过的测试。
- Nova：本任务 `nova/`、docs/NOVA.md；工具与发布范围、真实QA、回滚/旧版本保护、发布前后和Git同步安全审查。只读实现，不执行外部写入。
- 所有角色不是独占工作区，禁止回退他人改动或再委派。顺序：Terra工具 → Luna独立预检/verify → Sol隔离提交 → Nova发布前Review → Sol完整verify:release与部署 → Luna线上QA → Nova发布后Review → Sol推送/CI/本地同步 → 最终验收。

## 排除项

- 不发布其他未提交修改，不改依赖、schema、CMS/数据库、线索接收服务、主站56xyy.com、DNS/TLS/Nginx、远端环境变量或权限。
- 仅沿用现有web部署的原子版本切换、进程更新和健康回滚；不改变CMS进程或环境文件。RELEASE_KEEP=100，核对所有旧release保留。
- 不输出/提交凭据、真实.env、备份、构建输出或浏览器证据；不发送真实询盘或通知，不强推，不创建空提交，不降低验证门槛。
- 本地磁盘不足时先报告，不删除用户文件、旧源码或历史证据；复用候选与依赖，保留512MiB空间守卫。

## Acceptance Criteria

1. 候选恰好22项冻结变更，其他候选文件等于基线提交；提交前本次独立npm run verify及格式检查通过；提交后候选clean，完整tree/commit身份可验证。
2. 独立预检PASS、Nova发布前APPROVED；固定目标wrapper在任何远端写入前运行本次完整npm run verify:release，失败立即停在部署之前。
3. 上线version为准确候选SHA、staging和releaseId，healthz两依赖ok；previous有效，所有旧release保留，CMS进程及env hash不变；网站关键页面和查询流程可用。
4. Luna线上双语390/1440验证服务选择/预选、案例语境、模板/语言切换与移动入口；表单提交仅mock或不提交。Nova发布后APPROVED。
5. 普通非强制推送准确main成功；GitHub该SHA CI completed/success；主工作区HEAD/main/origin/main、GitHub与线上SHA一致，分支差异0/0、索引空。主工作区同步仅更新已发布22项的index与refs，保留其他文件。
6. 相对本次baseline的保护文件、原有非发布脏状态和角色日志旧前缀保留；DEV_STATE与角色日志记录真实阶段、限制及最终证据，全部满足后CLOSED。

## 输入与证据

- Task06的R4冻结、Luna R3/R4 PASS、Nova R4 APPROVED及最终验收；现有部署脚本、既有Task02/04工具、当前Git/GitHub/服务器快照。
- 保存本次候选diff/hash、完整verify与verify:release日志、工具冻结、QA/Review、部署前后快照、普通push/CI结果、最终Git与文件保护证据。真机和真实询盘未测试的限制继续保留。

## 发布门禁返工 R2

- 本次完整门禁发现英文联系测试的宽松名称定位同时匹配服务选择区域和需求输入框；Luna已依据四份失败trace归类为测试定位器缺陷。保留R1日志及候选/冻结历史，不把首轮写成通过。
- 同ID最小增加 `tests/e2e/english-acceptance-contact.spec.ts`：仅将五处 `Your requirements` 定位改为精确匹配，原提交、失败保留、重试、校验断言及超时保持。发布总范围变为23文件，原22项实现和测试hash必须不变。
- Terra所有权增加上述单个测试文件；原wrapper及sync helper仅把冻结数量守卫22改23。Sol保留R1冻结、生成R2冻结/隔离修复提交和本地状态记录；Luna在本次完整运行退出后独立复测该spec双项目、候选verify及helpers，Nova R2批准后才能再次执行完整发布门禁。
- 新增AC：原四失败用例通过，完整spec其余断言保持且通过；保护范围相应由1399变1398；最终完整verify:release仍必须全部通过，不能用定向复测替代。部署、push、CI、同步及远端保护等原AC全部保持。

## 定位器返工 R3

- R2独立verify/格式通过，但四个浏览器用例均在精确label定位处超时：标签文字含必填星号，textbox无障碍名称不含星号。R2未关闭原阻断，保存其日志和冻结。
- 仅将同一测试文件五处需求字段定位改为textbox角色及精确名称 `Your requirements`，可使用对应的单行helper控制重复和维护行数；其他业务断言、超时、23文件范围及部署工具保持。候选先实测定位唯一命中textarea，再跑原四用例与提交前verify，仍须Nova批准和完整发布门禁。
- 同一文件的五处全页面 `button[type="submit"]` 也需限定为 `#contact-form` 内按钮，因为新增选择器与咨询表单各有submit按钮；允许单行helper复用。独立DOM探针同时证明全页面两个submit与咨询表单唯一按钮，原业务断言不变，避免仅修首个失败后遗漏后续同类歧义。

## 独立响应场景 R5

- R4已消除定位歧义，但移动端单个测试串行14响应场景触及原30秒总时限，独立单例同限制复现；维护预算也在221行处失败。失败日志及trace保留。
- 仍仅修改同一英文测试文件：busy/初次成功、原14响应场景和本地校验各自测试，响应场景使用fresh page并保留原mock及全部清空/保留/提示/按钮状态断言。维持原30秒test与5秒expect，不增加retry或忽略错误，文件不超过220行；应用22项、23文件发布范围、所有工具保持。
- Luna先验证两项目全场景，再执行本次verify与格式；通过后Sol生成隔离修复提交，Nova核对原场景和断言逐项保留、失败真实关闭，之后才可发布最终候选。全量发布门禁、线上验收、CI与同步AC仍然有效。

## 资源失败复核 R6

- R5完整wrapper退出1，267通过/2失败/9既有skip；失败分别为Chromium布局测试末尾截图导航的资源错误、mobile语言测试新建no-JS页面的进程崩溃，未进入远端写入。原失败trace、完整日志与远端未变化证据保留，不把单例复核写成完整门禁通过。
- 用户已批准仅删除 `/tmp/xyy-20261002-06-browsers` 可重下载临时浏览器文件；精确清单/hash与退出结果保存。没有删除源码、Git、测试证据或系统Chromium。
- Luna仅拥有本任务 `luna/r6-environment/` 与角色日志追加，先核对空间、端口、候选冻结，再对两个原失败选择器各执行一次fresh进程复核，保留原worker1/retries0/30秒test/5秒expect。允许DEBUG及只读资源采样，不修改配置、ulimit、业务、helper或既有测试，不无条件重复执行。
- Terra仅增加 `terra/run-observed-release-r6.py` 外层观测runner，固定执行原冻结wrapper、设置DEBUG并记录真实退出码和资源；四个原helper保持。runner必须防止覆盖历史输出，采样错误可见且仍等待wrapper真实退出。Luna用隔离stub验证成功、失败、采样异常和拒绝守卫，Nova审查后才由Sol执行真实命令。
- Nova依据单例结果、资源证据、未改动的23项冻结与4工具、最新空间/端口/准确目标核对，判断是否批准一次同wrapper完整重试；真正发布资格仍由该次完整verify:release全绿产生。若再次失败，保留证据并返回具体诊断，不跳过门禁。

## 线上 QA 取消归因

- 完整发布已经R6全绿；线上R1/R2核心业务与几何断言通过，但自动脚本将资源取消计为FAIL。保留原结果，不以诊断改写历史。一次4入口诊断证明本次复现的8个image取消均落在真实离页导航窗口，5个相关资源均200且PNG解码通过；未复现的历史事件不作逐项已证实声明。
- Luna仅修改本任务QA脚本和证据、追加角色日志。R3保持所有业务/HTTP/console/pageerror/非GET断言和20秒预算；仅对满足GET/image/ERR_ABORTED、原首页所属请求、成功contact文档200/load窗口、已验证5个同源图片的事件单列离页取消。其他失败仍阻断。实际表单链路滚动到可见后补四图；只执行一次R3，未知失败返回Sol，不循环重跑。
- Nova发布后Review核对原失败保留、分类证据与实现、R3真实结果、远端保护和全部冻结，再判断推送与CI/同步资格。

## 最终验收（CLOSED）

- AC1：R5修正后最终范围为23文件，原22项hash保持；独立verify和格式通过，功能提交 `dd2f07ab8685aa0d73e50c8b81eff66cc941d5ab` 与测试修正提交 `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5` 已形成，候选clean，tree为 `6631ca008438a40b0a1b86861759039f40072a72`。
- AC2：Luna预检PASS、Nova发布前APPROVED。最终R6完整wrapper session73261 exit0，592单测、269 E2E通过/9既有skip/0失败、4 formal和最终build全绿后才进入远端写入；R1/R5等历史失败日志保留。
- AC3/AC4：验收站release `20261002T102719Z-5beb6a2`、准确SHA和staging身份核对成功，健康两依赖ok；23旧release、previous、CMS进程及环境hash保护通过。线上中英390/1440的8入口及原业务断言通过，四张可见表单截图由Luna/Sol分别审阅；Nova发布后APPROVED。
- AC5：普通非强制push session28089 exit0；准确SHA的 [GitHub CI 37000116735](https://github.com/AIyj-cmd/XYY-WEB/actions/runs/37000116735) 已completed/success，完整测试和全部13步骤成功。随后原sync-local.py session38176 exit0；本地HEAD/main/origin/main、GitHub main及服务器准确SHA一致，ahead/behind 0/0、索引空。
- AC6：最终1398保护文件、73原非发布脏状态和四角色日志旧前缀保持；23发布文件clean，当前74脏状态仅新增本合同。DEV_STATE与角色日志同步真实阶段，本地4524预览GET200。最终证据为 `output/release/xyy-20261002-07/sol-final-acceptance.json` 与 `git-and-server-final.json`。
- 限制：真机Safari/微信、真实询盘接收未测；R5资源错误根因仍未证实，R6采样有9条进程权限缺口。线上R1/R2原始失败和严格分类的R3原始事件均保留。最终完整发布与GitHub CI通过，本次无剩余发布阻塞。
