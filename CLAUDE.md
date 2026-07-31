# CLAUDE.md

项目：广州新亦源供应链官网。技术栈为 Astro 7 SSR、Directus 12、Express 5、PM2 和 Nginx。

## 开发与验证

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run verify
```

提交或部署前必须至少通过 `npm run verify`。涉及交互或响应式布局时，再运行 `npm run test:e2e` 或使用浏览器检查桌面与移动端。

## 数据职责

| 数据 | 来源 | 修改方式 |
|---|---|---|
| 首页统计、服务、案例、仓库、新闻 | Directus，无内容缓存 | CMS 保存后刷新页面 |
| `CASE_DETAILS`、品牌与导航常量 | `src/lib/brand.ts` | 改代码并部署 |
| 统一数字与运营口径 | `src/lib/claims.ts` | 改代码并部署 |
| JSON-LD、FAQ Schema、canonical | 页面与 `src/lib/seo.ts` | 改代码并部署 |

`CASE_DETAILS` 键名必须与 Directus `cases.label` 完全一致，`slug` 同时用于首页链接、案例详情页和 sitemap。Directus 资源 URL 必须使用 `getDirectusAssetUrl()`，CMS 富文本在 `set:html` 前必须经过 `sanitize.ts`。

## 首页设计状态

首页于 2026-07-31 完成当前版本。继续修改时保持以下约束：

- 首屏使用鞋服云仓实景与深色遮罩；主要 CTA 为橙色。
- 顶部导航保留原有内容，使用居中的半透明悬浮胶囊样式。
- 主体 section 以白、浅灰、浅蓝为主，深色仅用于页脚等收束区域。
- 解决方案模块保持统一结构：客户问题、服务名称、核心价值、能力项、场景与 CTA。
- 履约流程为正向七步链路，蓝色底线进入视区后由橙线从左向右覆盖。
- 首页 FAQ 使用左侧转化信息与右侧单开手风琴；答案保持简短。
- 列表型内容优先使用横向行与 1px 分隔线，避免堆叠装饰性卡片。
- 动态插入 DOM 的样式使用 `:global()` 或明确的全局选择器。

## Git 与仓库卫生

不得提交：

- `.env`、`.env.production` 或任何 Token、密码和私钥；
- `.astro/`、`dist/`、`output/`、`test-results/`、`.playwright-cli/`；
- `resources/` 原始大媒体；
- 临时截图、备份补丁和本地审计输出。

技术文档放入 `docs/`，部署配置放入 `deploy/`，自动化脚本放入 `scripts/`。不要在项目根目录新增临时报告或一次性脚本。

## 部署安全

当前应用服务器为 `47.82.105.103`，线上验收域名为 `wz.tomatopia.top`。`56xyy.com` 目前仍指向另一台服务器，目标服务器也尚无对应证书；切换 DNS 和证书前，不得启用域名重定向。

```bash
DEPLOY_HOST='root@47.82.105.103' \
SITE_URL='https://wz.tomatopia.top' \
bash scripts/deploy.sh
```

部署脚本必须保留服务器 `/var/www/xyy-web/.env`，不得从本地上传环境文件。完成后检查：

```bash
SITE_URL='https://wz.tomatopia.top' node scripts/health-check.mjs
ssh root@47.82.105.103 'pm2 status'
```

正式域名迁移配置位于 `deploy/nginx-56xyy.conf`，只有在 DNS、证书、Nginx 和 CMS 公网地址全部就绪后才能启用。

## 关键文件

- `src/components/Header.astro`：全站悬浮导航与移动菜单
- `src/pages/index.astro`：首页内容、交互与页面级样式
- `src/layouts/ServiceLanding.astro`：服务专题页公共布局
- `src/components/service/ServiceSignature.astro`：服务页差异化视觉模块
- `src/lib/directus.ts`：Directus SDK、查询和安全降级
- `src/lib/claims.ts`：统一运营事实与数字口径
- `server.mjs`：Express 包装层、安全头、静态资源与重定向
- `scripts/deploy.sh`：构建、同步、PM2 重启和健康检查
