# 56xyy.com 主站切换清单

状态基线：2026-08-09；执行前必须重新核对 DNS、证书、服务器地址和运行版本。

## 最近一次核对状态

- `56xyy.com` 与 `www.56xyy.com` 当前指向旧服务器 `139.224.11.72`。
- 新版官网与 Directus 位于 `47.82.105.103`，验收域名为 `wz.tomatopia.top`。
- DNS A 记录当前 TTL 约 600 秒，已经适合安排短窗口切换。
- 新服务器公网 `443` 由 Xray 监听，普通 HTTPS 流量转发至 Nginx `127.0.0.1:8443`。
- 新服务器尚无 `/etc/letsencrypt/live/56xyy.com` 证书。
- `_acme-challenge.56xyy.com` 当前 CNAME 到 `httpsok.com`，优先通过现有证书平台或 DNS-01 在切换前签发证书。
- 2026-08-09只读复核确认：正式域名的 `/healthz`、`/cms/server/ping`、`/robots.txt`、`/sitemap.xml` 和 `/llms.txt` 当前均由旧站返回HTML，不满足新版契约；不能把这些路径的HTTP 200当作服务可用。
- 同日新版已部署到验收站：`/healthz` 明确返回联系存储依赖健康，Directus ping、robots、sitemap与`llms.txt`全部通过。正式域名切换仍需完成证书、DNS与正式源站检查。

## 目标拓扑

```text
56xyy.com / www.56xyy.com
          ↓
47.82.105.103:443 (Xray)
          ↓
127.0.0.1:8443 (Nginx TLS vhost)
          ├─ /cms/ → Directus 127.0.0.1:8055
          ├─ 静态资源 → /var/www/xyy-web/dist/client
          └─ 页面/API → Astro 0.0.0.0:50031
```

## 切换前

1. 在现有 HTTPSOK/证书平台，或通过可续期的 DNS-01 流程，为以下域名签发证书：
   - `56xyy.com`
   - `www.56xyy.com`
2. 将证书安装到新服务器：
   - `/etc/letsencrypt/live/56xyy.com/fullchain.pem`
   - `/etc/letsencrypt/live/56xyy.com/privkey.pem`
3. 将 `deploy/nginx-56xyy.conf` 安装为独立站点配置，先执行 `nginx -t`，通过后再 reload。
4. 暂时保留现有 `wz.tomatopia.top` 配置，不提前启用旧域名重定向。
5. 使用正式域名构建并部署；构建阶段仍可从验收域名读取 CMS：

```bash
DEPLOY_HOST='root@47.82.105.103' \
SITE_URL='https://56xyy.com' \
PUBLIC_DIRECTUS_URL='https://56xyy.com/cms' \
BUILD_DIRECTUS_URL='https://wz.tomatopia.top/cms' \
HEALTHCHECK_SITE_URL='https://wz.tomatopia.top' \
bash scripts/deploy.sh
```

`SITE_URL` 决定构建产物中的 canonical、sitemap 与 `llms.txt` 域名；`HEALTHCHECK_SITE_URL` 让 DNS 切换前的预部署仍可通过验收域名检查同一套服务器内容。

6. 在 DNS 切换前验证新服务器（证书安装后）：

```bash
curl --resolve 56xyy.com:443:47.82.105.103 -I https://56xyy.com/
curl --resolve 56xyy.com:443:47.82.105.103 -I https://56xyy.com/cms/server/ping
curl --resolve 56xyy.com:443:47.82.105.103 -I https://56xyy.com/llms.txt
```

## 切换窗口

1. 更新 `/var/www/xyy-web/.env` 的公开配置：

```dotenv
PUBLIC_SITE_URL=https://56xyy.com
PUBLIC_DIRECTUS_URL=https://56xyy.com/cms
ENABLE_DOMAIN_REDIRECTS=false
LEGACY_DOMAINS=wz.tomatopia.top
```

2. 更新 `/var/www/xyy-cms/.env`：

```dotenv
PUBLIC_URL=https://56xyy.com/cms
CORS_ENABLED=true
CORS_ORIGIN=https://56xyy.com,https://wz.tomatopia.top
```

3. 重启 `xyy-web` 与 `xyy-cms`，确认 PM2 均为 online。
4. 在阿里云 DNS 将根域名和 `www` 的 A 记录从 `139.224.11.72` 改为 `47.82.105.103`。
5. 等待 TTL 后检查：

```bash
curl -I https://56xyy.com/
curl -I https://www.56xyy.com/
curl -sS https://56xyy.com/healthz
curl -sS https://56xyy.com/cms/server/ping
curl -I https://56xyy.com/robots.txt
curl -I https://56xyy.com/sitemap.xml
curl -I https://56xyy.com/llms.txt
```

6. 检查首页 canonical、Open Graph、JSON-LD 和 sitemap 中只出现 `https://56xyy.com`。
7. 提交一条测试咨询，确认表单、隐私同意和后台记录完整。

## 验收域名收口

正式域名稳定后再执行：

1. 用 `deploy/nginx-wz-redirect.conf` 替换现有验收域名站点配置。
2. `nginx -t` 通过后 reload。
3. 验证 `wz.tomatopia.top` 所有旧路径一次 301 到对应的 `56xyy.com` 路径。
4. 保留验收域名证书自动续期，至少持续一个完整迁移周期。

## 回滚

出现证书、CMS、表单或页面严重错误时：

1. 将 `56xyy.com` 与 `www` 的 A 记录恢复为 `139.224.11.72`。
2. 保持 `wz.tomatopia.top` 原站继续服务，不启用重定向配置。
3. 将 Web 和 CMS `.env` 恢复为 `wz.tomatopia.top`，重启两个 PM2 进程。
4. 修复后重新执行切换前验证。
