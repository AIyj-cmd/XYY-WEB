# Directus PostgreSQL 备份与恢复验证

这套脚本用于 Oracle 19C 正式切换前的现有 PostgreSQL 数据保护。仅把脚本加入仓库不等于已经建立备份；生产服务器必须安装定时任务，并完成至少一次恢复演练。

## 安装每日备份

```bash
sudo bash deploy/postgresql/install-backup-job.sh
sudo editor /etc/xyy/postgresql-backup.env
sudo systemctl start xyy-postgresql-backup.service
sudo systemctl status xyy-postgresql-backup.service
sudo CONFIRM_RESTORE_TEST=YES \
  /usr/local/sbin/xyy-restore-test-directus-postgresql
sudo CONFIRM_BACKUP_JOB_ACTIVATION=YES bash deploy/postgresql/install-backup-job.sh
```

数据库口令只保存在 root 所有、权限为600的 `/etc/xyy/postgresql-backup.env`；备份服务
不会读取应用目录中的 `.env`。安装脚本默认只安装文件，不激活 timer；先完成一次手工备份
和恢复演练，再通过显式确认启用定时任务。
默认保留14天，保存到 `/var/backups/xyy-postgresql`。必须再同步到加密的异机或对象存储，不能只保留在应用服务器本机。

## 恢复演练

脚本会创建名称受限的临时数据库、恢复最新备份、读取核心集合数量，然后自动删除临时数据库。生产切换前应保存命令输出、备份校验值、执行日期和负责人。

## Oracle 切换门槛

- 最近一次PostgreSQL备份及SHA-256已同步到异机；
- 恢复演练成功；
- Oracle Data Pump与RMAN策略已启用；
- 回滚脚本已在维护窗口前演练；
- 未满足以上条件时不得执行正式切换。
