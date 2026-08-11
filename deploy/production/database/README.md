# 01 数据库初始化

## 前提

- Oracle Database 19c 已安装并正常运行；
- 已存在 CDB 和可写 PDB；
- 数据库字符集为 `AL32UTF8`；
- 操作者具有数据库服务器 `root` 与本机 `SYSDBA` 权限；
- 使用 OMF/ASM 时已设置 `DB_CREATE_FILE_DEST`，否则填写明确的数据文件路径。

## 文件

- `../../oracle19c/init-existing-oracle19c.sh`：幂等初始化脚本；
- `../../oracle19c/database.env.example`：数据库端参数模板；
- `../../oracle19c/backup-oracle.sh`：Oracle Data Pump 业务Schema备份。

## 执行

```bash
sudo install -d -m 700 /etc/xyy
sudo cp deploy/oracle19c/database.env.example /etc/xyy/oracle-database.env
sudo chmod 600 /etc/xyy/oracle-database.env
sudo editor /etc/xyy/oracle-database.env

sudo bash deploy/oracle19c/init-existing-oracle19c.sh \
  /etc/xyy/oracle-database.env
```

使用桌面独立脚本包时，先进入 `01-数据库初始化` 目录，并将上面两个文件路径分别简化为
`database.env.example` 和 `init-existing-oracle19c.sh`。

脚本只完成以下操作：

1. 验证数据库主版本为19；
2. 验证并打开指定PDB；
3. 验证 `AL32UTF8` 字符集；
4. 创建或复用 `XYY_DIRECTUS` 表空间；
5. 创建或更新 `DIRECTUS_APP` 用户；
6. 赋予Directus建表、序列、视图、过程、触发器和类型所需权限。

脚本不会安装Oracle软件、创建CDB、升级数据库或删除现有对象。

## 备份

初始化完成并投入使用后，可复用同一份配置执行Data Pump备份：

```bash
sudo bash deploy/oracle19c/backup-oracle.sh /etc/xyy/oracle-database.env
```

备份默认写入 `/var/backups/oracle/xyy-directus`，生产环境还应配置RMAN、归档日志以及异机/对象存储副本。

## 数据库管理员交付给应用运维的参数

```text
数据库服务器私网IP
监听端口（默认1521）
Service Name（默认ORCLPDB1）
Schema用户（默认DIRECTUS_APP）
Schema密码（通过密码管理器交付）
```
