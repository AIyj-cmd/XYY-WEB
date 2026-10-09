# XYY-20261001-02 — 英文页脚发布

- 风险：HIGH（已获用户网站部署、GitHub同步和本地状态同步授权）。
- 目标与顺序：wz.tomatopia.top staging（root@47.82.105.103 /var/www/xyy-web，50031）→ AIyj-cmd/XYY-WEB main → 本地Git/状态文档。
- Scope：仅发布已验收Task01的 src/i18n/routes.ts ENGLISH_SERVICE_LINKS八项清单，源SHA256 e1709daca4519d70c5741247df63d2ff5dda973f9ddfb8597953f3a81a99482a。跳过已完成实现，Luna独立验证→Nova Review→Sol验收。
- 排除：接收服务/仓库、真实询盘提交、CMS/数据库操作、环境变量/DNS/TLS/Nginx修改、56xyy.com，以及其他既有动效、配置、治理、素材和文档脏改。既有发布脚本只重启网站服务。
- 所有权：Sol负责候选、发布、Git同步及本合同、DEV_STATE.md、docs/SOL.md、output/release/xyy-20261001-02/下Sol证据。Luna只写同证据目录luna/及docs/LUNA.md。Nova只写同证据目录nova/及docs/NOVA.md。任何实现或测试代码修复返回Sol另派Terra；角色不得互相派任务。
- 输入：baseline.json、release-files.json、candidate.patch；Task01现行本地QA和源码；原scripts/deploy.sh；新发布/同步守卫脚本。
- AC1：发布提交仅含清单单文件差异；提交前本次npm run verify通过，部署前完整npm run verify:release通过，Luna PASS与Nova APPROVED。
- AC2：线上/version精确匹配候选SHA；healthz含CMS/contactStorage正常；旧release和previous回退目录保留，CMS进程不变。
- AC3：线上中英文1440/390清单顺序与href符合预期，无横溢，英文四新增锚点可达；禁止发送询盘。
- AC4：普通push后GitHub main与线上相同，当前SHA CI成功；本地main/origin/main同步且0/0，既有无关文件hash/脏改保留，工作区不强制清空。
- AC5：DEV_STATE/Sol日志记录本次实际命令、结果、限制；明确部署、推送、本地同步各阶段。
- 预期证据：基线/冻结hash，verify及release完整日志，独立QA/Review，线上版本/健康/回退核对、桌面手机截图与交互记录、GitHub CI与最终一致性JSON。
- 交接：磁盘当前约2.4GB，使用共享Git隔离候选与既有依赖，发布前双文件系统至少512MB；RELEASE_KEEP=100保留历史。环境失败不算PASS，不跳门禁。
