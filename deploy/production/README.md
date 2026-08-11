# 56xyy.com 生产部署包

本目录把部署职责拆为三个独立部分：

```text
database/  已存在 Oracle Database 19c 的业务 Schema 初始化
backend/   Directus 服务后端连接 Oracle、迁移、切换和回滚
web/       Astro Web 前端构建、原子发布和 Nginx 配置
```

## 目标拓扑

```text
56xyy.com
   ↓
应用服务器
├─ Nginx
├─ xyy-web      127.0.0.1:4321
└─ xyy-cms      127.0.0.1:8055
        ↓ 私网 TCP 1521
现有 Oracle Database 19c 服务器
└─ ORCLPDB1 / DIRECTUS_APP
```

## 推荐执行顺序

1. 数据库管理员阅读 `database/README.md`，在现有 Oracle 19c 服务器初始化独立表空间和 Schema 用户。
2. 运维确认数据库监听服务和私网 1521 访问策略。
3. 后端负责人阅读 `backend/README.md`，在应用服务器并行准备 Oracle 版 Directus。
4. Web 负责人阅读 `web/README.md`，准备 Web 环境并部署正式域名构建。
5. 在维护窗口迁移后台内容并切换 Directus。
6. 验证后台、网站和联系表单后再切换 DNS/正式流量。

真实密码、Token和服务器密钥不得写入本目录或提交Git。
