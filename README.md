# 新亦源供应链官网 — wz.tomatopia.top

广州新亦源供应链管理有限公司官方网站。项目基于 Astro SSR、Directus CMS、PostgreSQL 和 PM2 部署。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Astro 7 SSR（`@astrojs/node` middleware） |
| 样式 | Tailwind CSS 4 + 页面级原生 CSS |
| 动画 | GSAP 3 + Lenis |
| CMS | Directus 12 + PostgreSQL 16 |
| 进程管理 | PM2（`xyy-web`、`xyy-cms`） |
| 反向代理 | Nginx，同域 `/cms/` 代理 Directus |

## 常用命令

```bash
npm install
npm run dev
npm run verify        # typecheck + lint + unit tests + build
npm run test:e2e      # Playwright 桌面/移动冒烟测试
npm run audit         # 生产依赖安全审计
npm start             # 构建后启动 server.mjs
```

## 目录结构

```text
src/
  components/          Header / Footer
  layouts/Layout.astro 全局 SEO、JSON-LD、字体、浮动联系按钮
  lib/site-config.ts   站点 URL 单一来源（读取 PUBLIC_SITE_URL 环境变量）
  lib/brand.ts         品牌常量、ABOUT_STATS、CASE_DETAILS（首页案例模态框富文本）
  lib/directus.ts      Directus SDK 封装、5分钟（300s）进程内缓存、公开资源 URL helper
  lib/sanitize.ts      CMS 富文本白名单过滤
  pages/               Astro 页面与 /api/contact
scripts/
  deploy.sh            本地验证、打包、远端 PM2 重载
  health-check.mjs     线上站点和 Directus 健康检查
public/
  introduce-720p.mp4   关于页 hero 视频优化版
  introduce-poster.jpg 视频 poster
resources/
  original-media/      不发布的原始大资源备份
```

## 环境变量

| 变量 | 说明 |
|---|---|
| `DIRECTUS_URL` | 服务端访问 Directus 的地址，服务器上建议 `http://127.0.0.1:8055` |
| `DIRECTUS_TOKEN` | Directus 静态 token |
| `PUBLIC_SITE_URL` | `https://wz.tomatopia.top` |
| `PUBLIC_DIRECTUS_URL` | `https://wz.tomatopia.top/cms` |

## 部署

服务器要求 Node.js `>=22.12.0`。当前服务器使用 `/opt/node-v22/bin/node`，PM2 配置见 `ecosystem.config.cjs`。

```bash
export DEPLOY_HOST='root@<server-ip>'
export XYY_DEPLOY_PASSWORD='******'
bash scripts/deploy.sh
```

`DEPLOY_HOST` 为必填项，未设置时脚本直接退出报错。

部署脚本会执行 `npm run verify`，上传 `dist`、`package*.json`、`server.mjs`、`ecosystem.config.cjs` 和 `.env.production`，远端执行 `npm install --omit=dev` 后重载 `xyy-web`。

## 数据链路

| 内容 | 来源 | 生效延迟 |
|---|---|---|
| 首页统计数字 | Directus `homepage_stats` | ≤ 5分钟 |
| 服务介绍（三大业务）| Directus `services` | ≤ 5分钟 |
| 首页案例卡片（前4条）| Directus `cases` | ≤ 5分钟 |
| 案例页 `/cases` | Directus `cases` | ≤ 5分钟 |
| 关于页仓库列表 | Directus `warehouses` | ≤ 5分钟 |
| 新闻 | Directus `news` | ≤ 5分钟 |
| 首页案例模态框详情 | `brand.ts CASE_DETAILS` | 改代码后重新部署 |
| 关于页质检数字栏 | `brand.ts ABOUT_STATS` | 改代码后重新部署 |

修改 Directus 内容后若页面仍显示旧数据，等 60 秒缓存过期，或 `pm2 restart xyy-web` 立即清缓存。

## CMS

- 后台：`https://wz.tomatopia.top/cms/admin/`
- 公开存活检查：`https://wz.tomatopia.top/cms/server/ping`
- 详细健康检查：`/cms/server/health`（Directus 12 需要登录态或授权）
- 安装目录：`/var/www/xyy-cms`
- 重新创建/补齐集合：`DIRECTUS_URL=http://127.0.0.1:8055 DIRECTUS_TOKEN=... node scripts/setup-cms.mjs`

## Nginx

参考配置：`nginx.conf`

- `/` 代理 Astro SSR：`127.0.0.1:4321`
- `/cms/` 代理 Directus：`127.0.0.1:8055`
- 静态资源增加缓存头
- 配置 HSTS、nosniff、Referrer-Policy、Permissions-Policy

## 质量门禁

- `astro check`：类型与 Astro 诊断
- `eslint .`：JS/TS/Astro 静态检查
- `vitest run`：Directus helper、富文本过滤、联系 API 单元测试
- `playwright test`：首页、联系表单、新闻页桌面/移动冒烟测试
- `lhci autorun`：Lighthouse 本地性能/SEO/可访问性门槛
