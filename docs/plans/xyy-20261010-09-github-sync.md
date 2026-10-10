# XYY-20261010-09 — 基础内容修复 GitHub 同步

## 范围与基线

- 风险 MEDIUM；用户明确授权将已完成的本地修复推送 GitHub，并同步本地 Git 状态。
- 目标 `/home/yj/data/website`，`origin` 为 `https://github.com/AIyj-cmd/XYY-WEB.git`，分支 `main`。
- 起始 HEAD `31395e15ae24d14899367e5e2ba69e7187762a97`；当前30个修改/新增路径为任务08实现、测试、文档及此前任务07保留记录。暂存区为空，不丢弃既有改动。
- 输入为任务08的本地验收及 Nova APPROVED、本次实时 Git 差异、远端分支和实际提交前检查。
- 排除部署、真实 CMS/数据库/权限操作、服务器连接、环境文件变更、删除、强推和历史重写。不提交凭据、依赖、构建或 ignored 验收产物。

## 文件所有权与流程

- Sol：本合同、DEV_STATE.md、docs/SOL.md，候选范围、普通提交/推送与远端回读；保存 ignored Git 证据。
- Luna：独立运行本次完整 `npm run verify`，docs/LUNA.md 追加本轮结果；仅在 ignored 目录保存隔离配置、日志和证据，不改实现或操作 Git 暂存/提交。
- Nova：Luna 通过后复核候选差异、敏感文件排除、测试证据与普通推送范围；仅追加 docs/NOVA.md，不改实现或操作 Git。
- 若出现真实实现问题，由 Sol 按原任务范围交 Terra 最小修正，再由 Luna 复测、Nova 审查。所有代理保留并行修改，不再委派。

## 可观察验收条件

1. 刷新并核对远端 main；提交建立在已核对的祖先之上，没有丢失远端提交、强推或改写历史。
2. 本次实际 `npm run verify` 成功，隔离真实 CMS/询盘；构建使用已有依赖和真实容量门禁，保留失败记录，不伪造或绕过检查。
3. 候选只包含已批准修复、相应测试和工作记录；审阅文件清单、diff、格式及敏感内容，Nova APPROVED。
4. 正常提交并推送 origin/main；推送后本地 HEAD、origin/main 与 GitHub main SHA 一致，ahead/behind 为0，工作树和暂存区干净。
5. 最终汇报准确提交、分支与同步状态，不把推送或 GitHub CI 排队解释为部署或 CI 已通过。
