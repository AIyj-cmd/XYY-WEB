# AGENTS.md

- 开始前读 `DEV_STATE.md`；以代码、Git 和测试为准。
- 只改指定范围，不顺手重构；技术债记录影响与触发条件，出现真实故障、风险或需求才处理。
- CMS 以 Directus 为准，公开数字只来自 `src/lib/claims/`。
- 保留用户修改；不使用破坏性 Git 命令，不提交密码、Token、`.env`、备份或产物。
- 按风险验证；页面改动检查桌面与移动端；提交前运行 `npm run verify`，部署前运行 `npm run verify:release`。
- 推送、部署、迁移、权限和真实 CMS 写入须明确授权；每次操作后更新 `DEV_STATE.md`。
