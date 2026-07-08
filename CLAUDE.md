# CLAUDE.md

项目：广州新亦源供应链官网 — Astro 7 SSR + Directus 12 CMS。

## 常用命令

```bash
npm run dev          # 本地开发
npm run verify       # typecheck + lint + test + build（部署前必跑）
npm run typecheck    # 单独类型检查
npm run test         # 单元测试
```

PM2（生产）：

```bash
pm2 restart xyy-web  # 重启前端，同时清空 Directus 数据缓存
pm2 logs xyy-web
```

## 数据架构

**两个数据来源，职责明确，不要混用：**

| 数据 | 来源 | 修改方式 |
|---|---|---|
| 首页统计、服务介绍、仓库列表 | Directus（60s 缓存）| CMS 后台编辑，60s 内生效；立即生效跑 `pm2 restart xyy-web` |
| 首页案例卡片（前4条）、案例页 | Directus（实时）| CMS 后台编辑 |
| 新闻 | Directus（实时）| CMS 后台编辑 |
| 首页案例模态框详情 `CASE_DETAILS` | `brand.ts` | 改代码 + 部署 |
| 关于页质检数字 `ABOUT_STATS` | `brand.ts` | 改代码 + 部署 |
| 品牌信息、导航、数字产品 | `brand.ts` | 改代码 + 部署 |

`brand.ts` 中**已删除** `STATS` 和 `SERVICES` 导出（无人引用），不要重新加。

`CASE_DETAILS` 的键名必须和 Directus `cases.label` 完全一致（如 `'UR（Urban Revivo）'`），这是首页案例模态框的查找依据。

## 设计规则

- **不用深色大背景**：section 背景用白/浅灰/浅蓝；Hero 可以用背景图+遮罩，纯色深色 section 不用
- **列表型内容用横向行，不用卡片**：1px 线分隔，没有 box/card 容器
- **Astro scoped style 对 innerHTML 注入的元素无效**：动态插入的 DOM 必须用 `:global()` 或内联样式

## Git 与部署

GitHub 推送需绕过本地代理：

```bash
no_proxy=github.com NO_PROXY=github.com https_proxy= HTTPS_PROXY= HTTP_PROXY= http_proxy= ALL_PROXY= all_proxy= git push origin main
```

部署命令（`DEPLOY_HOST` 必填，不填直接报错退出）：

```bash
DEPLOY_HOST='root@47.82.105.103' XYY_DEPLOY_PASSWORD='...' bash scripts/deploy.sh
```

## 提交规则

**以下文件禁止提交：**

- `.env`、`.env.production`（含真实密钥）
- `public/logos/`（已 gitignore）
- `public/Omission/`、`public/yunliu.png`

`public/` 下的图片、PDF、视频等资源文件正常提交。

## 关键文件

- `src/lib/site-config.ts`：站点 URL 单一来源，读 `PUBLIC_SITE_URL` 环境变量
- `src/lib/brand.ts`：品牌常量、`ABOUT_STATS`、`CASE_DETAILS`
- `src/lib/directus.ts`：Directus SDK 封装，60s 进程内缓存
- `src/lib/sanitize.ts`：CMS 富文本用 `set:html` 前必须先过此函数
- `server.mjs`：生产用 Express 包装层，含压缩、安全头、CSP
- `scripts/deploy.sh`：本地 verify → rsync → PM2 重载 → 健康检查

## 渲染说明

- `/contact`、`/estimate` 是预渲染静态页，不读 Directus
- 新闻、案例、产品页在每次请求时从 Directus 拉数据
- Directus 媒体 URL 用 `getDirectusAssetUrl(fileId)`，不要拼 `DIRECTUS_URL`
