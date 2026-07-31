# 新亦源供应链官网

广州新亦源供应链管理有限公司官方网站。项目采用 Astro SSR、Directus CMS、PostgreSQL、PM2 与 Nginx，覆盖鞋服云仓、退货质检、瑕疵修复、数字化履约和智能寄件等业务。

- 当前服务器环境：<https://wz.tomatopia.top>
- 正式域名规划：<https://56xyy.com>（尚未切换到本项目服务器）
- 项目状态：[docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Astro 7 SSR、TypeScript、Tailwind CSS 4、页面级 CSS |
| 交互 | GSAP 3、Lenis、原生 IntersectionObserver |
| CMS | Directus 12、PostgreSQL 16 |
| 服务 | Express 5、PM2、Nginx |
| 测试 | Astro Check、ESLint、Vitest、Playwright、Lighthouse CI |

## 本地开发

Node.js 要求 `>=22.12.0`。

```bash
npm ci
npm run dev
```

本地 `.env` 可连接远程 CMS，真实密钥不得提交。环境变量模板见 `.env.example`。

常用命令：

```bash
npm run typecheck            # Astro 类型与模板诊断
npm run lint                 # ESLint
npm run test                 # Vitest 单元测试
npm run test:e2e             # Playwright 桌面/移动冒烟测试
npm run build:local-preview  # 使用开发环境配置构建本地验收版本
npm run verify               # typecheck + lint + test + production build
npm run audit                # 生产依赖安全审计
```

## 目录结构

```text
src/
  components/          全局组件与服务页视觉组件
  layouts/             全局 Layout 与服务落地页布局
  lib/                 品牌事实、CMS、SEO、站点配置和安全工具
  pages/               Astro 页面与 API 路由
  styles/              全局样式
public/
  images/services/     服务页已优化图片
scripts/
  deploy.sh            验证、构建、上传、PM2 重启和健康检查
  health-check.mjs     官网、Web 进程与 Directus 健康检查
  bootstrap-cms-server.sh  服务器端 CMS 初始化脚本
  setup-cms.mjs        Directus 集合与字段初始化
  sync-approved-cms-content.mjs  审核内容同步
deploy/
  nginx-56xyy.conf     正式域名迁移参考配置，当前未启用
docs/
  PROJECT_STATUS.md    当前发布、环境与待办状态
  archive/             历史检查报告和优化计划
tests/                 单元与端到端测试
```

生成目录 `.astro/`、`dist/`、`output/`、`test-results/`、`.playwright-cli/` 不进入 Git。

## 数据来源

| 内容 | 来源 | 生效方式 |
|---|---|---|
| 首页统计、服务、案例、仓库、新闻 | Directus | 后台保存后，下次页面请求读取 |
| 首页案例弹窗、案例详情页、品牌常量 | `src/lib/brand.ts`、`src/pages/cases/[slug].astro` | 修改代码并部署 |
| 官网统一运营口径 | `src/lib/claims.ts` | 修改代码并部署 |
| SEO、FAQ、结构化数据 | 页面代码与 `src/lib/seo.ts` | 修改代码并部署 |

Directus 读取失败时使用安全降级，不在进程内缓存 CMS 内容。动态页面响应设置为 `no-store`。

## 环境变量

| 变量 | 说明 |
|---|---|
| `DIRECTUS_URL` | 服务端 Directus 地址；服务器建议 `http://127.0.0.1:8055` |
| `DIRECTUS_TOKEN` | Directus 静态 Token，敏感信息 |
| `PUBLIC_SITE_URL` | 当前构建与 canonical 使用的站点地址 |
| `PUBLIC_DIRECTUS_URL` | 浏览器可访问的 CMS 地址 |
| `ENABLE_DOMAIN_REDIRECTS` | 正式域名切换完成后才可设为 `true` |
| `LEGACY_DOMAINS` | 正式切换后需要 301 的旧域名列表 |

`.env`、`.env.production` 仅保存在本地和服务器，不提交 GitHub，也不由部署脚本上传。

## 部署

目标服务器必须已配置 SSH 公钥、Node.js、PM2、Nginx 和 `/var/www/xyy-web/.env`。

```bash
DEPLOY_HOST='root@47.82.105.103' \
SITE_URL='https://wz.tomatopia.top' \
bash scripts/deploy.sh
```

部署脚本会：

1. 以 `SITE_URL` 覆盖构建期公开地址并运行 `npm run verify`；
2. 用 `rsync` 上传 `dist` 和运行所需文件；
3. 保留服务器现有 `.env`，安装生产依赖并重启 `xyy-web`；
4. 检查首页、`/healthz` 和 Directus ping。

在 `56xyy.com` DNS、证书与 Nginx 未切换到目标服务器前，不得启用旧域名跳转。迁移参考配置位于 `deploy/nginx-56xyy.conf`。

## CMS

- 当前后台：<https://wz.tomatopia.top/cms/admin/>
- Ping：<https://wz.tomatopia.top/cms/server/ping>
- 服务器目录：`/var/www/xyy-cms`

```bash
# 预检审核内容同步
npm run cms:sync-approved

# 执行同步
npm run cms:sync-approved -- --apply
```

## 提交边界

禁止提交：真实环境变量、Token、服务器密钥、构建产物、测试截图、原始大媒体和临时补丁。`public/` 中被页面引用且已优化的图片可以提交。
