# 03 Web 前端部署

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

Web环境使用不同的 `DIRECTUS_CONTENT_TOKEN` 和 `DIRECTUS_CONTACT_TOKEN`。部署前从密码
管理器临时导出两枚 Token，运行 `npm run cms:verify-runtime-permissions`；通过后再写入
`/var/www/xyy-web/.env`。不得把 Directus 管理员 Token 用作任一运行 Token。

## 2. 从构建机部署Web

在项目Git仓库根目录执行：

```bash
DEPLOY_HOST='root@应用服务器IP' \
  bash deploy/production/web/deploy-web.sh
```

如果使用桌面独立脚本包中的 `deploy-web.sh`，请在已克隆的 `XYY-WEB` 仓库根目录运行；
也可以设置 `PROJECT_ROOT=/path/to/XYY-WEB`。Web源码和构建依赖仍以GitHub仓库为准，脚本包不重复包含整份源码。

部署过程会运行完整发布校验、上传独立版本目录、原子切换 `current` 软链、重启 `xyy-web`，并在健康检查失败时恢复上一版本。

如果DNS尚未切换，可明确设置构建数据源和验收地址：

```bash
DEPLOY_HOST='root@应用服务器IP' \
BUILD_DIRECTUS_URL='https://wz.tomatopia.top/cms' \
HEALTHCHECK_SITE_URL='https://wz.tomatopia.top' \
  bash deploy/production/web/deploy-web.sh
```

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
