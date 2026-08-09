# Directus 迁移到独立 Oracle Database 19c

## 目标架构

```text
用户 -> Nginx/Xray -> Astro + Directus（应用服务器 47.82.105.103）
                              |
                              | 私网 TCP 1521
                              v
                        Oracle Database 19c
                        （独立数据库服务器）
```

Directus 12.1.1 原生支持 `DB_CLIENT=oracledb`。应用服务器使用
`node-oracledb` Thin 模式连接 Oracle 19c，不安装 Oracle Instant Client。

## 前提

- 数据库服务器：Oracle Linux 8 x86_64，建议至少 4 vCPU、8 GiB 内存、100 GiB SSD。
- Oracle Database 19c 的许可由使用方自行确认。
- 从 Oracle 官方下载 `oracle-database-ee-19c-1.0-1.x86_64.rpm`；仓库不分发安装介质。
- 生产前应通过 My Oracle Support 安装当前可用的 19c Release Update。
- 数据库和应用服务器使用私网；安全组和主机防火墙均只允许应用服务器访问 1521。

## 1. 数据库服务器

```bash
sudo install -d -m 700 /opt/install
# 将 Oracle 官方 RPM 放到：
# /opt/install/oracle-database-ee-19c-1.0-1.x86_64.rpm

sudo APP_SERVER_IP='10.0.0.10' \
  DIRECTUS_DB_PASSWORD='使用密码管理器生成的强口令' \
  bash install-oracle19c-db.sh
```

脚本会创建：

- CDB/PDB：RPM 默认的 `ORCLCDB` / `ORCLPDB1`；
- AL32UTF8 数据库字符集；
- `XYY_DIRECTUS` 独立表空间；
- `DIRECTUS_APP` 最小权限 Schema 用户；
- 仅允许应用服务器私网 IP 访问 1521 的防火墙规则。

## 2. 应用服务器并行准备

```bash
sudo install -d -m 700 /etc/xyy
sudo cp env.example /etc/xyy/oracle19c.env
sudo chmod 600 /etc/xyy/oracle19c.env
sudo editor /etc/xyy/oracle19c.env

sudo bash prepare-directus-oracle.sh /etc/xyy/oracle19c.env
```

配置文件会被 Bash 读取；包含 `#`、`$` 等字符的值请使用单引号包裹。

该步骤不会停止 PostgreSQL 版 Directus。它会：

1. 在 `/var/www/xyy-cms-oracle` 安装相同版本的 Directus 和 Oracle 驱动；
2. 在 Oracle 中执行 Directus bootstrap；
3. 从 PostgreSQL 实例生成数据库无关的 Schema Snapshot 并应用到 Oracle；
4. 在 `127.0.0.1:8056` 启动并行验证实例。

## 3. 数据迁移和切换

当前迁移集合：

```text
homepage_stats, services, warehouses, cases, news, contact_leads
```

脚本会保留 PostgreSQL `pg_dump`、逐集合 JSON 和 SHA-256 校验报告。
目标集合非空时会拒绝覆盖。

跨数据库导入会让 Oracle 重新生成技术主键，并以业务字段和完整内容哈希核对迁移结果；
前端和审核同步不得依赖固定数据库 ID。为避免关系错配，迁移器检测到自定义关系字段时会
直接终止，必须先制定主键映射方案后才能迁移该集合。每个集合同时保留含原始主键的
`*.source.json` 和实际写入内容的 `*.transfer.json`，便于审计。

```bash
sudo CONFIRM_ORACLE_CUTOVER=YES \
  bash migrate-and-cutover.sh /etc/xyy/oracle19c.env
```

切换仍只替换 PM2 的 `xyy-cms` 数据服务，Nginx 继续访问
`127.0.0.1:8055`，网站代码和反向代理无需改变。为避免导出期间新增联系线索漏迁，
脚本会在备份与导入前暂停 `xyy-web`，完成 Oracle、网站健康检查后再恢复；任一步骤
失败时退出钩子会恢复 Web，切换失败则恢复 PostgreSQL。维护窗口内同时暂停 CMS
人工编辑。现有数据量很小，业务数据导入通常在一分钟内完成。

## 4. 回滚

```bash
sudo CONFIRM_POSTGRES_ROLLBACK=YES \
  bash rollback-to-postgresql.sh /etc/xyy/oracle19c.env
```

回滚不会删除 Oracle 数据，原 PostgreSQL 数据库和 `/var/www/xyy-cms` 也不会在迁移中删除。

## 5. Oracle 备份

```bash
sudo DIRECTUS_DB_PASSWORD='数据库口令' bash backup-oracle.sh
```

生产环境应将 Data Pump 文件同步到异机/对象存储，并另外配置 RMAN 全库备份、
归档日志和恢复演练。仓库脚本不会自动删除历史备份。

## 验收

```bash
curl -fsS http://127.0.0.1:8055/server/ping
curl -fsS https://56xyy.com/cms/server/ping
pm2 status
```

登录 CMS 后检查首页数据、服务、仓库、案例及联系表单写入；随后执行网站健康检查。
