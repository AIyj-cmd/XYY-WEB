# 56xyy.com 生产部署包

本目录提供 Web 应用的生产部署入口：

```text
web/       Astro Web 前端构建、原子发布和 Nginx 配置
```

## 目标拓扑

```text
56xyy.com
   ↓
应用服务器
├─ Nginx
├─ xyy-web      0.0.0.0:50031
└─ xyy-cms      127.0.0.1:8055
        ↓
现有 PostgreSQL 数据库
```

## 推荐执行顺序

1. 确认现有 Directus 与 PostgreSQL 服务可用，核对网站所需的内容只读权限。
2. 按 [PostgreSQL 备份说明](../postgresql/README.md) 和 [附件备份说明](../uploads/README.md) 完成成对备份及恢复验证。
3. Web 负责人阅读 [web/README.md](web/README.md)，准备 Web 环境并部署正式域名构建。
4. 验证后台、网站和联系表单后再切换 DNS/正式流量。

真实密码、Token和服务器密钥不得写入本目录或提交Git。
