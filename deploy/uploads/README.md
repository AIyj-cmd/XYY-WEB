# Directus 上传文件备份

数据库备份只包含 `directus_files` 等元数据，不包含 `uploads/` 中的实际附件。无论
Directus 使用 PostgreSQL 还是 Oracle 19c，都必须同时备份上传文件。

在应用服务器执行：

```bash
sudo bash deploy/uploads/install-backup-job.sh
sudo editor /etc/xyy/uploads-backup.env
sudo systemctl start xyy-directus-uploads-backup.service
sudo systemctl status xyy-directus-uploads-backup.service
sudo CONFIRM_BACKUP_JOB_ACTIVATION=YES bash deploy/uploads/install-backup-job.sh
```

独立恢复校验不会覆盖正式目录：

```bash
sudo /usr/local/sbin/xyy-restore-test-directus-uploads
```

默认每天备份、保留14天。数据库与上传目录的归档必须成对复制到加密异机或对象
存储；仅保留服务器本机副本不算完整备份。每月至少执行一次数据库与上传文件的
联合恢复演练，并记录归档文件名、校验和和结果。
