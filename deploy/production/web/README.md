# 历史部署模板（不可执行）

> 本文记录旧 `/var/www`、50031、Xray 与 Nginx 拓扑，不适用于已验收的 `/data/xyy` 原生 release 流程。不得替换 IP、域名或环境变量后执行；它不构成活动远程环境的部署、回退、Nginx、证书或 CMS 操作授权。当前环境边界见 [README](../../../README.md)。

Web前端为 Astro SSR 应用，运行在应用服务器 `0.0.0.0:50031`，由 Nginx 提供静态资源并反向代理动态请求。

## 文件

- `web.env.example`：Web运行环境模板；
- `prepare-web-server.sh`：创建持久化目录并安装环境文件；
- `deploy-web.sh`：构建、校验、上传、原子切换和失败回滚；
- `install-nginx.sh`：安装已审核的 `56xyy.com` Nginx配置；
- `../../nginx-56xyy.conf`：当前生产拓扑的Nginx虚拟主机。

## 1. 应用服务器准备

```bash
sudo install -d -m 700 /etc/xyy
sudo cp deploy/production/web/web.env.example /etc/xyy/web.env
sudo chmod 600 /etc/xyy/web.env
sudo editor /etc/xyy/web.env

sudo bash deploy/production/web/prepare-web-server.sh /etc/xyy/web.env
```

Web运行环境只使用只读 `DIRECTUS_CONTENT_TOKEN` 访问 CMS 内容，并使用
`XIANSUO_API_URL` 与 `XIANSUO_INGEST_TOKEN` 将官网联系留言以服务端 HTTPS 请求写入
XYY-xiansuo。两端 Integration Token 必须相同；`WEBSITE_LEAD_OWNER_ID` 只配置在
XYY-xiansuo 服务端。不得把 Directus 管理员 Token 或历史 `DIRECTUS_CONTACT_TOKEN` 用作
当前 Web 运行配置；历史 Directus contact 权限审计不是当前联系写入的部署前置条件。

## 2. 历史构建机流程

这一节原先描述旧服务器的上传、原子切换及旧验收站 fallback。相关目标已退役，示例命令已删除，不能作为活动远程环境的可执行指引。任何新的构建机发布流程都必须先按当前 `/data/xyy` 原生 release 方式另行核对并取得准确目标授权。

## 3. Nginx和证书

先安装覆盖 `56xyy.com` 与 `www.56xyy.com` 的证书，再执行：

```bash
sudo bash deploy/production/web/install-nginx.sh
```

仓库现有Nginx配置适配“公网443由Xray接收、普通TLS转发到Nginx 127.0.0.1:8443”的当前服务器。如果新应用服务器由Nginx直接监听443，必须由运维调整监听方式并重新审核后再安装。

## 4. 验收

```bash
curl -fsS https://56xyy.com/healthz
curl -fsS https://56xyy.com/cms/server/ping
curl -I https://56xyy.com/robots.txt
curl -I https://56xyy.com/sitemap.xml
curl -I https://56xyy.com/llms.txt
pm2 status
```
