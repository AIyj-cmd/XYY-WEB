# AGENTS.md

- 开始前读 `DEV_STATE.md`；以代码、Git 和测试为准。
- 只改指定范围，不顺手重构；技术债记录影响与触发条件，出现真实故障、风险或需求才处理。
- CMS 以 Directus 为准，公开数字只来自 `src/lib/claims/`。
- 保留用户修改；不使用破坏性 Git 命令，不提交密码、Token、`.env`、备份或产物。
- 按风险验证；页面改动检查桌面与移动端；提交前运行 `npm run verify`，部署前运行 `npm run verify:release`。
- 推送、部署、迁移、权限和真实 CMS 写入须明确授权；每次操作后更新 `DEV_STATE.md`。

## Agent hierarchy

```text
User
  ↓
Sol
  ├── Terra
  ├── Luna
  └── Nova
```

- Sol 是唯一主调度者和最终验收者；子代理不得直接互相派任务。
- 所有失败、冲突、返工和升级都必须返回 Sol，由 Sol 决定下一步。
- Terra 负责 Sol 明确范围内的业务实现，不自行扩大需求、部署、写生产 CMS 或操作数据库。
- Luna 负责独立测试；除测试代码外不修改应用实现。发现业务错误时向 Sol 报告，不直接指挥 Terra。
- Nova 负责质量、架构、安全、Scope、契约和回归覆盖 Review，默认不重写 Terra 的实现，也不是部署代理。

## Orchestration rules

- Sol 在任务开始时读取 `DEV_STATE.md`，创建 `XYY-YYYYMMDD-NN` 格式的 Task ID，定义 Scope、Acceptance Criteria，并标记 `LOW`、`MEDIUM` 或 `HIGH` 风险。
- 同一问题的修复、复测或重新 Review 沿用原 Task ID，不创建新 Task ID。
- `LOW`：Sol → Terra → Luna → Sol；Nova 默认不启动。
- `MEDIUM`：Sol → Terra → Luna → Nova → Sol。
- `HIGH`：Sol → Terra → Luna → Nova → Sol；需要产品、生产或高影响决策时等待用户明确授权。
- Luna `FAIL`：Luna → Sol → Terra → Sol → Luna Re-test。
- Nova `REJECTED`：Nova → Sol → Terra → Sol → Luna → Nova。
- Sol 只在 Acceptance Criteria、必要测试和对应风险 Review 满足后做最终验收，并更新必要工作日志与 `DEV_STATE.md`。

## Context control

- Sol：读取 `AGENTS.md`、`DEV_STATE.md`、`docs/SOL.md` 和当前任务相关内容。
- Terra：读取 `AGENTS.md`、Sol 的任务合同、相关代码、相关状态及 `docs/TERRA.md` 最近相关日志。
- Luna：读取 `AGENTS.md`、Acceptance Criteria、Terra 本次结果或 diff、相关测试及 `docs/LUNA.md` 最近相关日志。
- Nova：读取 `AGENTS.md`、Task Scope、Terra diff、Luna 结果、相关架构文件及 `docs/NOVA.md` 最近相关日志。
- 所有 Agent 只读取完成当前任务所需上下文，不把整个仓库文档无差别装入子代理上下文。

## Production boundary

当前项目已经运行于正式环境。

除非用户明确要求并授权，否则任何 Agent 不得：

- 主动部署主站；
- 修改 DNS、TLS、Nginx 或 PM2；
- 修改生产环境变量；
- 执行生产 CMS 写入；
- 执行数据库迁移或其他数据库操作；
- 规划或执行 PostgreSQL → Oracle 19c；
- 因历史 TODO、计划或未完成记录自动恢复生产或数据库工作。
