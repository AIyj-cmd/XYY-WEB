# Directus PostgreSQL 备份与恢复验证

这套脚本用于 Oracle 19C 正式切换前的现有 PostgreSQL 数据保护。仅把脚本加入仓库不等于已经建立备份；生产服务器必须安装定时任务，并完成至少一次恢复演练。

## 安装每日备份

```bash
sudo install -m 700 backup-directus.sh /usr/local/sbin/xyy-backup-directus-postgresql
sudo install -m 700 restore-test-directus.sh /usr/local/sbin/xyy-restore-test-directus-postgresql
sudo install -m 644 xyy-postgresql-backup.service /etc/systemd/system/
sudo install -m 644 xyy-postgresql-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now xyy-postgresql-backup.timer
sudo systemctl start xyy-postgresql-backup.service
sudo systemctl status xyy-postgresql-backup.service
```

默认保留14天，保存到 `/var/backups/xyy-postgresql`。必须再同步到加密的异机或对象存储，不能只保留在应用服务器本机。

## 恢复演练

```bash
sudo CONFIRM_RESTORE_TEST=YES \
  /usr/local/sbin/xyy-restore-test-directus-postgresql
```

脚本会创建名称受限的临时数据库、恢复最新备份、读取核心集合数量，然后自动删除临时数据库。生产切换前应保存命令输出、备份校验值、执行日期和负责人。

## Oracle 切换门槛

- 最近一次PostgreSQL备份及SHA-256已同步到异机；
- 恢复演练成功；
- Oracle Data Pump与RMAN策略已启用；
- 回滚脚本已在维护窗口前演练；
- 未满足以上条件时不得执行正式切换。
