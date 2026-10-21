# XYY-20261021-04：GitHub 同步

- 用户最新明确要求“推送到github上，同步一下git的状态信息”，覆盖此前暂不推送要求，仅授权当前项目 GitHub 同步；目标 `AIyj-cmd/XYY-WEB` 的既有 `origin/main`，不部署网站或操作真实 CMS/数据库/权限/生产配置。
- 风险 HIGH：推送包含已验收英文文章后台分离、首页文案及正文图片访问修复；另保留并审阅既有百度验证文件及历史发布记录。基线 main/HEAD `984461e17dfcae7e7d1324a9fa530fb742133b2c`，63条既有脏路径清单/哈希已保存至 `output/git-sync/xyy-20261021-04/`。不得用 reset/force push 或覆盖其他修改。
- Scope：仅把当前已完成源码、必要测试/依赖、百度验证及状态/角色/计划文档提交并普通推送到该远端，核实远端身份、ahead/behind、工作区与 CI 真实状态；不修改业务代码、自动发布流程或批准未执行的 CMS 迁移。未完成的 schema release gate 继续 pending。
- Sol 所有权：任务合同、DEV_STATE/SOL 状态、候选清单/证据、本地 Git 提交及授权推送。Luna 仅拥有本次独立验证证据和 LUNA 日志；Nova 仅拥有本次只读审阅证据和 NOVA 日志。不再委派；各角色不是独自在代码库，保留他人改动。
- 已有业务实现验收有效，本次略过不适用的 Terra 实施；按 Luna → Nova → Sol 进行推送前验收。Luna fresh loopback `npm run verify`、格式及精确候选哈希检查；Nova 审阅准确提交范围、既有验收哈希、公开资产许可/敏感信息与无自动部署，确认允许普通推送；无源码变化不重复无关 E2E。
- AC：fresh verify exit0；候选仅授权范围，无 secret、真实 .env、备份、输出或构建产物；已完成应用源码与既有验收一致，变更可归属；远端 main 无未处理并发差异；普通 push 成功后本地 HEAD/远端 main 精确一致、ahead/behind 0/0、工作区干净；状态文档区分代码同步与未部署，并如实记录远端 CI（未完成不宣称通过）。
- 证据：基线与最终 Git 引用/状态、候选文件哈希、实际 verify/format 命令及输出、Nova 结论、提交/推送输出与 GitHub 回读。本次不强制等候完整 hosted CI 结束，但必须回读可得状态并报告限制。
- Luna 本次 fresh verify/format/目标格式 PASS，1082单测/构建完成，63基线候选hash保持；复用业务E2E。网络诊断确认 api.github.com 可达，github.com 标准HTTPS连接超时，官方备用HTTPS也失败；ssh.github.com:443主机密钥已用GitHub meta核实，但本机无可用SSH授权，未增改账号密钥。
- 允许同一授权内采用 GitHub Git Database API 传输：先本地正常提交，再基于已核实父提交创建精确相同tree/commit，要求返回SHA与本地逐项一致，最后仅对main做expected旧SHA校验且force=false的快进更新；不得改变origin、重写已有提交或绕过分支保护。API仅作Git传输，仍不部署。连接器创建commit不支持指定author/committer，不能确保保留本地提交身份，因此使用现有gh CLI结构化API请求，凭据不打印/写入payload。推送脚本在ignored output，由Nova审阅后才执行写入。

## 已完成应用同步与文档补录

- Luna PASS（fresh1082单测/构建/格式、63基线hash无漂移），Nova APPROVED_FOR_AUTHORIZED_GITHUB_SYNC；应用64路径正常本地提交9f0961e，经API传输同tree/同commit SHA并expected旧SHA/force=false快进main，写后本地HEAD/origin/main/GitHub main一致、ahead/behind0/0、工作区干净。
- 应用CI39582314743在回读时in_progress，未称通过。随后仅同步DEV_STATE、SOL和本合同实际状态，最终文档身份以Git引用和final-result.json真实回读为准；补录为纯文档，审阅diff/格式，无业务变化故不重复全量门禁。
- Git同步已完成，不代表网站上线；无部署/真实CMS/DB/权限操作，pending release gate保持。
