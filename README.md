# 新亦源供应链官网

广州新亦源供应链管理有限公司官方网站。项目采用 Astro SSR、Directus CMS、PostgreSQL 16、PM2 与 Nginx，覆盖鞋服云仓、退货质检、瑕疵修复、数字化履约和智能寄件等业务。Oracle Database 19c 是后续独立数据库迁移目标，本轮验收站同步不切换数据库。

- 当前验收入口：<https://wz.tomatopia.top>
- 正式域名：<https://56xyy.com>（切换完成前仍需核对证书、DNS 与搜索引擎策略）
- 项目状态：[docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)

## 技术栈

| 层   | 技术                                                   |
| ---- | ------------------------------------------------------ |
| 前端 | Astro 7 SSR、TypeScript、Tailwind CSS 4、页面级 CSS    |
| 交互 | GSAP 3、Lenis、原生 IntersectionObserver               |
| CMS  | Directus 12、PostgreSQL 16（Oracle 19c 迁移目标）      |
| 服务 | Express 5、PM2、Nginx                                  |
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
npm run check:maintainability # 文件与内联代码预算
npm run check:assets         # 源码引用的本地资源完整性
npm run test                 # Vitest 单元测试
npm run test:e2e             # Playwright 桌面/移动冒烟测试
npm run build:local-preview  # 使用开发环境配置构建本地验收版本
npm run verify               # 类型、Lint、维护预算、资源、单测与生产构建
npm run verify:release       # verify + 候选环境E2E + 正式域名契约，发布脚本使用的完整门禁
npm run audit                # 生产依赖安全审计
```

## 目录结构

```text
DEV_STATE.md         当前发布、验证结果和下一步任务的唯一实时记录
config/
  cms-collections.mjs  CMS公开内容与私有集合的统一契约
src/
  components/          按业务职责拆分的首页、产品、服务、关于、案例、期刊和联系组件
  data/                页面级静态内容配置，与模板和交互解耦
  layouts/             全局 Layout 与服务落地页布局
  lib/                 品牌事实、CMS、SEO、站点配置和安全工具
  pages/               Astro 页面与 API 路由
  scripts/             按交互职责拆分的浏览器控制器
  styles/              全局与按业务模块/视觉族隔离的样式
public/
  images/services/     服务页已优化图片
scripts/
  check-maintainability.mjs  源码与内联代码预算门禁
  check-public-assets.mjs    本地资源引用完整性门禁
  deploy.sh            验证、构建、上传、PM2 重启和健康检查
  health-check.mjs     官网、Web 进程与 Directus 健康检查
  create-release-manifest.mjs  生成不可变发布身份文件
  bootstrap-cms-server.sh  服务器端 CMS 初始化编排，具体步骤位于 scripts/lib/
  setup-cms.mjs        Directus 集合初始化编排，模型与运行时分别维护
  sync-approved-cms-content.mjs  按语义业务键执行审核内容同步
deploy/
  nginx-56xyy.conf     正式域名迁移参考配置，当前未启用
  oracle19c/           Oracle 安装、内容迁移、切换、回滚与备份脚本
docs/
  PROJECT_STATUS.md    历史项目状态记录，不作为当前状态依据
  MAINTAINABILITY.md   页面、组件、数据、脚本和后端维护状态矩阵
  archive/             历史检查报告和优化计划
tests/                 单元与端到端测试
```

生成目录 `.astro/`、`dist/`、`output/`、`test-results/`、`.playwright-cli/` 不进入 Git。

## 数据来源

| 内容                             | 来源                                              | 生效方式                     |
| -------------------------------- | ------------------------------------------------- | ---------------------------- |
| 首页统计、服务、案例、仓库、新闻 | Directus                                          | 后台保存后，下次页面请求读取 |
| FAQ、案例详情、期刊目录          | Directus，审核源码作为故障回退                    | 后台发布后，下次请求读取     |
| 服务专题、关于我们、全站设置     | Directus，审核源码作为故障回退                    | 后台发布后，下次请求读取     |
| 品牌常量                         | `src/data/brand/`，由 `src/lib/brand.ts` 兼容导出 | 修改代码并部署               |
| 官网统一运营口径                 | `src/lib/claims.ts`                               | 修改代码并部署               |
| SEO 与结构化数据                 | 页面代码与 `src/lib/seo.ts`                       | 修改代码并部署               |

Directus 读取失败时返回空集合并报告依赖降级，不在进程内缓存 CMS 内容；首页案例另有已审核代码回退。统计和服务目前不使用陈旧快照，因此发布环境必须把 CMS 健康检查作为门槛。动态页面响应设置为 `no-store`。

## 可维护性

- 页面入口只负责取数、Schema、页面级配置与模块编排；
- 静态业务内容进入 `src/data/`，组件、样式和浏览器控制器按职责隔离；
- `npm run verify` 会执行可维护性预算和静态资源完整性检查；
- 当前最大业务组件113行、最大CSS147行；关于页Hero、联系表单、华南仓网、服务独有内容、Express运行时、字体生成和Oracle准备流程均已按变化原因拆分；
- 当前门禁覆盖432个项目文件；CSS上限200行、内容数据上限180行，Astro页面入口、API路由、自动化入口和部署脚本另有更严格的专项预算；
- 公开规模、履约和质检数字统一从 `src/lib/claims/` 注册表读取，单元测试禁止在页面、组件和内容配置中重新手写同一口径；
- 不为追求行数机械拆分事实注册表或原子请求；
- 详细状态、保留理由与剩余债务见 [docs/MAINTAINABILITY.md](docs/MAINTAINABILITY.md)。

性能侧使用响应式WebP、站点字符集字体子集和非首屏渲染隔离。字体由 `npm run prepare:fonts` 根据源码实际字符从锁定字体包生成，资源检查和生产构建会自动补齐，不依赖本机遗留文件；桌面异步加载品牌字体，移动端使用系统中文字体避免重复排版。最新本地Lighthouse单次采样为：桌面首页97、产品页97、关于页99；移动端首页86、产品页77、关于页76。正式域名上线后仍须在真实网络与缓存条件下复测。

## AEO 与 Agent 发现

- `/llms.txt` 由 `src/pages/llms.txt.ts` 生成，并使用 `PUBLIC_SITE_URL` 输出当前环境的绝对链接。
- 新增、删除或重命名核心服务页、案例页后，必须同步更新 `llms.txt` 和 `src/pages/sitemap.xml.ts`。
- 公开运营数据只从 `src/lib/claims.ts` 的已审核口径引用，不在发现文件中手写旧数据。
- `llms.txt` 是面向模型读取的社区约定，不是 W3C 强制标准；每季度以及重大业务调整后复核一次。
- 当前不公开 `agent-permissions.json` 或 `mcp-actions.json`。只有在咨询、报价或查询动作具备授权、确认、防重复提交和审计机制后再设计 Agent 执行层。
- `robots.txt` 区分搜索增强型与训练型爬虫；涉及训练授权的规则必须由业务负责人确认，不得因技术优化擅自修改。

## 环境变量

| 变量                      | 说明                                                        |
| ------------------------- | ----------------------------------------------------------- |
| `DIRECTUS_URL`            | 服务端 Directus 地址；服务器建议 `http://127.0.0.1:8055`    |
| `DIRECTUS_CONTENT_TOKEN`  | 仅可读取官网内容集合的运行令牌                              |
| `DIRECTUS_CONTACT_TOKEN`  | 仅可创建 `contact_leads` 的表单写入令牌                     |
| `DIRECTUS_TOKEN`          | 仅供建模、迁移和权限维护脚本临时使用，不得作为 Web 运行凭据 |
| `PUBLIC_SITE_URL`         | 当前构建与 canonical 使用的站点地址                         |
| `PUBLIC_DIRECTUS_URL`     | 浏览器可访问的 CMS 地址                                     |
| `ENABLE_DOMAIN_REDIRECTS` | 正式域名切换完成后才可设为 `true`                           |
| `LEGACY_DOMAINS`          | 正式切换后需要 301 的旧域名列表                             |
| `DEPLOY_ENVIRONMENT`      | 部署时显式指定 `staging` 或 `production`                    |

`.env`、`.env.production` 仅保存在本地和服务器，不提交 GitHub，也不由部署脚本上传。
内容令牌与联系令牌必须不同；建模脚本使用的短期管理令牌不能写入 Web 运行环境。
Web 内容读取和联系写入不会回退使用 `DIRECTUS_TOKEN`；缺少任一专用令牌或两枚令牌相同
时，运行就绪检查必须失败。
Directus 12 Community 不提供自定义项目过滤和字段级权限时，内容令牌使用集合级只读、
联系令牌使用 `contact_leads` 集合级仅创建；官网查询仍统一附加 `status=published`，联系
接口仍在服务端只接收表单白名单字段。具备相应 Directus 授权时，可设置
`DIRECTUS_CUSTOM_PERMISSION_RULES=true`，由权限同步脚本进一步下沉已发布内容过滤。

## 部署

目标服务器必须已配置 SSH 公钥、Node.js、PM2、Nginx 和 `/var/www/xyy-web/.env`。

```bash
DEPLOY_HOST='root@47.82.105.103' \
DEPLOY_ENVIRONMENT='staging' \
SITE_URL='https://wz.tomatopia.top' \
bash scripts/deploy.sh
```

### 独立 Oracle 19c 数据库

Directus 从 PostgreSQL 迁移至独立 Oracle Database 19c 的数据库安装、并行验证、
数据迁移、切换、回滚和备份脚本见
[`deploy/oracle19c/README.md`](deploy/oracle19c/README.md)。生产凭据只保存在应用服务器
`/etc/xyy/oracle19c.env`（权限 `600`），不得提交到 Git。

数据库备份不会包含 Directus 实际附件。无论当前使用 PostgreSQL 还是迁移到 Oracle，
都必须同时安装 [`deploy/uploads/`](deploy/uploads/README.md) 中的附件备份任务，并完成
数据库与附件的联合恢复演练。

部署脚本会：

1. 拒绝包含已修改、已暂存或未跟踪文件的工作区，并为当前 Git SHA 生成 Release Manifest；
2. 以 `SITE_URL` 覆盖构建期公开地址并运行 `npm run verify:release`；
3. 将 Manifest、应用与构建产物上传到同一独立版本目录，并安装生产依赖；
4. 保留服务器现有 `.env`，通过 `current` 软链原子切换后重启 `xyy-web`；
5. 用 `/healthz` 检查依赖就绪，用 `/version` 精确核对 Git SHA、Release ID、环境和 CMS 模型版本；任一不符即恢复上一软链并尽可能核对旧版本身份；
6. 默认保留最近5个版本，便于人工回滚。

`/healthz` 只证明依赖是否就绪；`/version` 只返回可公开的不可变发布身份并禁止缓存。
生产 Release 缺少或损坏 `release-manifest.json` 时，`/version` 返回503，不读取 Git、源码目录
或开发者环境作为替代。第五阶段以前创建的旧 Release 没有 Manifest 时仍允许首次回滚，但只会
输出 `legacy_previous_release_identity_unavailable`，不能声称旧版本身份已验证。

在 `56xyy.com` DNS、证书与 Nginx 未切换到目标服务器前，不得启用旧域名跳转。迁移参考配置位于 `deploy/nginx-56xyy.conf`。

## CMS

- 当前验收后台：<https://wz.tomatopia.top/cms/admin/>
- Ping：<https://wz.tomatopia.top/cms/server/ping>
- 账号、Token、数据库口令和服务器路径由部署团队管理，不进入仓库。

```bash
# 首次建模或补齐缺失集合（仅使用短期管理级 Token）
node scripts/setup-cms.mjs

# FAQ 源文案变化后，重新生成初始化种子并提交审核
npm run cms:generate-faq-seeds

# 案例、期刊、服务页、关于页与站点设置源文案变化后生成初始化种子
npm run cms:generate-content-seeds

# 部署后核对 19 个业务集合与文件库
npm run cms:verify

# 部署人员配置两枚运行令牌后检查最小权限边界
npm run cms:verify-runtime-permissions

# 预检审核内容同步
npm run cms:sync-approved

# 执行同步
npm run cms:sync-approved -- --apply
```

当前生产修复责任和操作顺序见
[`docs/PRODUCTION_REMEDIATION_HANDOFF.md`](docs/PRODUCTION_REMEDIATION_HANDOFF.md)。
Directus 字段职责、FAQ 页面标识和下一阶段后台化建议见
[`docs/CMS_CONTENT_MODEL.md`](docs/CMS_CONTENT_MODEL.md)。

## 提交边界

禁止提交：真实环境变量、Token、服务器密钥、构建产物、测试截图、原始大媒体和临时补丁。
`public/logos/`、`public/about/` 及其他被页面引用且已优化的发布素材属于可复现构建输入，
必须提交；`resources/` 中的原始素材继续留在仓库外。

GitHub Actions 会从干净检出使用 `github.sha` 生成 `environment=ci` 的候选 Manifest，执行格式
检查、生产依赖审计和 `verify:release`，且只有 `contents: read` 权限，不具备部署权限。CI 通过只表示
候选版本具备发布条件，不代表服务器令牌、备份 timer、DNS 或数据库迁移已经完成。
