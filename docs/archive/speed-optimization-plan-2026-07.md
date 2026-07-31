# Plan: 网站访问速度全链路优化（归档）

**日期**：2026-07-08
**复杂度**：Medium

---

## 背景与目标

| 目标 | 当前实测 | 目标值 | 根因 |
|------|----------|--------|------|
| SSR 页面 TTFB（热路径） | ~2.77s | < 0.5s | Directus TTL 短（60s）/ getCases 无缓存 |
| 静态资源 TTFB（图片/字体/PDF） | ~1.59s | < 0.1s | 静态文件走 Nginx→Express，未短路 |
| 森林期刊 PDF 加载 | 极慢（最大 21MB） | Range 请求正常、有缓存头 | 同上 + PDF 未压缩 |

---

## 模式基线

| 类别 | 来源 | 模式 |
|------|------|------|
| 缓存封装 | `src/lib/directus.ts:103` | `cached(key, fetcher, ttl)` 进程内 Map + expires |
| 静态头设置 | `server.mjs:44` | `setHeaders(res, filePath)` 按正则设 Cache-Control |
| 部署脚本 | `scripts/deploy.sh` | rsync → pm2 reload → healthcheck |

---

## Phase 1 — 代码层：Directus 缓存增强

> 本地修改，走正常部署流程生效。

### Task 1.1 — 提高 homepage_stats / services / warehouses TTL

**文件**：`src/lib/directus.ts`
**改动**：`getHomepageStats()` / `getServices()` / `getWarehouses()` 的 `cached()` 第三参数

```diff
- return cached('homepage_stats', async () => { ... })          // 默认 60_000
+ return cached('homepage_stats', async () => { ... }, 300_000)

- return cached('services', async () => { ... })
+ return cached('services', async () => { ... }, 300_000)

- return cached('warehouses', async () => { ... })
+ return cached('warehouses', async () => { ... }, 300_000)
```

### Task 1.2 — getCases() 加缓存

**文件**：`src/lib/directus.ts`
**当前**：`getCases()` 完全没有缓存，每次 SSR 都打 Directus
**改动**：包进 `cached()`

```diff
 export async function getCases(): Promise<Case[]> {
-  try {
-    return await requestItems<Case[]>('cases', { ... })
-  } catch {
-    return []
-  }
+  return cached('cases', async () => {
+    try {
+      return await requestItems<Case[]>('cases', { ... })
+    } catch {
+      return []
+    }
+  }, 60_000)
 }
```

### Task 1.3 — getPublishedNews() 首屏加缓存

**文件**：`src/lib/directus.ts`
**改动**：首页只取前 N 条，用独立 key 缓存

```diff
 export async function getPublishedNews(limit = 10, page = 1): Promise<NewsArticle[]> {
-  try {
-    return await requestItems<NewsArticle[]>('news', { ... })
-  } catch {
-    return []
-  }
+  return cached(`news_${limit}_${page}`, async () => {
+    try {
+      return await requestItems<NewsArticle[]>('news', { ... })
+    } catch {
+      return []
+    }
+  }, 60_000)
 }
```

**本地验证**：`npm run verify`

---

## Phase 2 — 服务器层：Nginx 直接 serve 静态文件

> 需 SSH 到生产服 `root@47.82.105.103`，改完 `nginx -t && nginx -s reload`。

### Task 2.1 — 定位 Nginx 配置

```bash
nginx -T | grep -E "server_name|root|location|proxy_pass|config" | head -40
```

确认：
- 站点配置文件路径（通常 `/etc/nginx/sites-enabled/` 或 `/etc/nginx/conf.d/`）
- dist/client 在服务器上的实际绝对路径

### Task 2.2 — 静态文件 location 块（在 proxy_pass 之前插入）

```nginx
# Astro 构建产物（content hash 文件名，永久缓存）
location /_astro/ {
    root /home/yj/XYY-GEO/website/dist/client;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
    gzip_static on;
}

# 图片 / 字体（7天缓存）
location ~* \.(png|jpg|jpeg|webp|avif|svg|gif|ico|woff2|woff|ttf|mp4|webm)$ {
    root /home/yj/XYY-GEO/website/dist/client;
    expires 7d;
    add_header Cache-Control "public, max-age=604800";
    access_log off;
    gzip_static on;
}

# PDF（7天缓存 + Range 支持）
location ~* \.pdf$ {
    root /home/yj/XYY-GEO/website/dist/client;
    expires 7d;
    add_header Cache-Control "public, max-age=604800";
    add_header Accept-Ranges bytes;
    access_log off;
}
```

### Task 2.3 — 加 Nginx proxy_cache（SSR HTML，30s TTL）

在 `http {}` 块里（确认或新增）：

```nginx
proxy_cache_path /var/cache/nginx/xyy levels=1:2 keys_zone=xyy_cache:10m max_size=100m inactive=2m;
```

在 `server {}` 的 `proxy_pass` 上方：

```nginx
proxy_cache xyy_cache;
proxy_cache_valid 200 30s;
proxy_cache_use_stale error timeout updating;
proxy_cache_key "$scheme$request_method$host$request_uri";
add_header X-Cache-Status $upstream_cache_status;
```

操作前建目录：

```bash
mkdir -p /var/cache/nginx/xyy
```

### Task 2.4 — 重载 Nginx

```bash
nginx -t && nginx -s reload
```

---

## Phase 3 — 验收循环

> 全部通过才算完成，否则回到对应 Phase 修复。

```bash
# V1: SSR 热路径 TTFB（连请求两次，第二次才是热路径）
no_proxy='*' https_proxy='' curl -s -o /dev/null -w "%{time_starttransfer}s\n" https://wz.tomatopia.top/
no_proxy='*' https_proxy='' curl -s -o /dev/null -w "%{time_starttransfer}s\n" https://wz.tomatopia.top/
# 目标: < 0.5s

# V2: 静态资源 TTFB
no_proxy='*' https_proxy='' curl -s -o /dev/null -w "%{time_starttransfer}s\n" https://wz.tomatopia.top/logo.png
# 目标: < 0.1s

# V3: 静态资源 Cache-Control 头
no_proxy='*' https_proxy='' curl -s -I https://wz.tomatopia.top/logo.png | grep -i cache-control
# 目标: 含 max-age

# V4: PDF Range 请求支持
no_proxy='*' https_proxy='' curl -s -I https://wz.tomatopia.top/senlinqikan/pdf/14.pdf \
  | grep -iE "accept-ranges|content-length"
# 目标: accept-ranges: bytes + 有 content-length

# V5: 本地构建验证
npm run verify
# 目标: 0 错误，9 tests passed，build 成功

# V6: 生产健康检查
no_proxy='*' https_proxy='' curl -s https://wz.tomatopia.top/healthz
no_proxy='*' https_proxy='' curl -s https://wz.tomatopia.top/cms/server/ping
# 目标: 均返回 ok
```

### 验收清单

- [ ] V1 — 首页热路径 TTFB < 0.5s
- [ ] V2 — logo.png TTFB < 0.1s
- [ ] V3 — 静态资源含 Cache-Control max-age
- [ ] V4 — PDF 支持 Accept-Ranges: bytes
- [ ] V5 — `npm run verify` 全部通过
- [ ] V6 — 生产健康检查三端点 ok

---

## 风险

| 风险 | 概率 | 缓解措施 |
|------|------|---------|
| Nginx root 路径与实际 dist/client 不符 | 中 | Task 2.1 先确认路径再写配置 |
| proxy_cache_path 目录不存在 | 低 | `mkdir -p /var/cache/nginx/xyy` 提前建 |
| getCases 缓存导致 CMS 新案例延迟 60s | 低 | 可 `pm2 restart xyy-web` 立即清缓存 |
| gzip_static 需预压缩文件 | 低 | 回退为 `gzip on` 动态压缩，效果略差但无风险 |

---

## 文件变更清单

| 文件 | 动作 | 内容 |
|------|------|------|
| `src/lib/directus.ts` | UPDATE | TTL 调整 + getCases / getPublishedNews 加缓存 |
| 服务器 Nginx 站点配置 | UPDATE（SSH） | 静态 location 块 + proxy_cache |
