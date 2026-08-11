# 02 Directus 服务后端部署

服务后端部署在 `56xyy.com` 应用服务器，Oracle数据库部署在另一台现有Oracle 19c服务器。

## 文件

- `backend.env.example`：应用服务器参数模板；
- `deploy-backend.sh`：后端准备、切换、验收和回滚统一入口；
- `../../oracle19c/`：Directus Oracle运行时与数据迁移实现。

桌面独立脚本包已将上述Oracle运行时文件放在同一 `02-服务后端` 目录，统一入口会自动识别，
不需要手动修改脚本路径。

## 1. 配置

```bash
sudo install -d -m 700 /etc/xyy
sudo cp deploy/production/backend/backend.env.example /etc/xyy/oracle19c.env
sudo chmod 600 /etc/xyy/oracle19c.env
sudo editor /etc/xyy/oracle19c.env
```

`ORACLE_DB_HOST` 必须填写数据库服务器私网IP，不得填写公网开放的数据库地址。

## 2. 并行准备和验证

```bash
sudo bash deploy/production/backend/deploy-backend.sh prepare
```

使用桌面独立脚本包时，在 `02-服务后端` 目录执行 `sudo bash deploy-backend.sh prepare`。

这一步保留当前PostgreSQL版Directus，并在 `127.0.0.1:8056` 启动Oracle验证实例。

## 3. 维护窗口切换

```bash
sudo CONFIRM_ORACLE_CUTOVER=YES \
  bash deploy/production/backend/deploy-backend.sh cutover
```

脚本会：

1. 暂停Web写入；
2. 备份当前PostgreSQL；
3. 迁移业务集合并计算内容哈希；
4. 把Oracle版Directus切换到 `127.0.0.1:8055`；
5. 验证Directus和Web；
6. 失败时自动恢复PostgreSQL。

## 4. 验收

```bash
sudo bash deploy/production/backend/deploy-backend.sh verify
curl -fsS https://56xyy.com/cms/server/ping
```

随后登录后台检查首页数据、服务、仓库、案例、新闻和联系表单。

## 5. 人工回滚

```bash
sudo CONFIRM_POSTGRES_ROLLBACK=YES \
  bash deploy/production/backend/deploy-backend.sh rollback
```

注意：当前迁移实现要求旧PostgreSQL版Directus位于同一应用服务器的 `127.0.0.1:8055`。若源后台位于另一台服务器，应先制定远程导出、附件复制和停写窗口，不得直接执行切换。
