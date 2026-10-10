# 新亦源供应链官网

广州新亦源供应链管理有限公司官方网站。项目采用 Astro SSR、Directus CMS、PostgreSQL 16、PM2 与 Nginx，覆盖鞋服云仓、退货质检、瑕疵修复、数字化履约和智能寄件等业务。

- 测试站：<https://wz.tomatopia.top>（`47.82.105.103`）
- 正式域名：<https://56xyy.com>
- 当前状态：[DEV_STATE.md](DEV_STATE.md)

截至 2026-10-10，测试站已部署应用提交 `eb05b8f`，Release ID 为
`20261010T071221Z-eb05b8f`，环境为 `staging`。本次部署的完整 `verify:release`、
健康与版本核对，以及上线后的中英文桌面/移动端抽查均已通过。
测试 CMS 使用 Directus 12.1.1 / PostgreSQL 16.15，模型版本为
`2026-10-cms-maintenance`，验证状态为 `verified`。本次发布仅更新测试站，主站未作变更；
后续版本与验证结果以 `DEV_STATE.md` 为准。

## 技术栈

| 层   | 技术                                                   |
| ---- | ------------------------------------------------------ |
| 前端 | Astro 7 SSR、TypeScript、Tailwind CSS 4、页面级 CSS    |
| 交互 | GSAP 3、Lenis、原生 IntersectionObserver               |
| CMS  | Directus 12、PostgreSQL 16                             |
| 服务 | Express 5、PM2、Nginx                                  |
| 测试 | Astro Check、ESLint、Vitest、Playwright、Lighthouse CI |

## 本地开发

Node.js 要求 `>=22.12.0`。

首次安装前，先按 [容量维护说明](docs/RELEASE_CAPACITY_MAINTENANCE.md) 测量安装基线；
构建和验证还需要对应的完整工作负载基线。以下命令适用于基线已配置的工作区。

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
  cms-contract.mjs     集合生命周期、业务键和已验证模型版本
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
  nginx-56xyy.conf     正式域名迁移参考配置
  postgresql/          PostgreSQL 备份与恢复验证脚本
  uploads/             Directus 附件备份与恢复验证脚本
  oracle19c/           历史 Oracle 迁移参考，当前测试站未使用
docs/
  CMS_CONTENT_MODEL.md  Directus 内容、权限与迁移维护规则
  RELEASE_CAPACITY_MAINTENANCE.md  容量基线、测试产物与版本清理
  MAINTAINABILITY.md    页面、组件、数据、脚本和后端维护边界
  MAIN_DOMAIN_CUTOVER.md  正式域名切换与回滚清单
  DESIGN_REFERENCE.md  明确设计任务使用的可选参考
  PERFORMANCE_BASELINE.md  历史性能观察基线
tests/                 单元与端到端测试
```

生成目录 `.astro/`、`dist/`、`output/`、`test-results/`、`.playwright-cli/` 不进入 Git。

## 数据来源

| 内容                           | 来源                                              | 生效方式                     |
| ------------------------------ | ------------------------------------------------- | ---------------------------- |
| 服务、案例、仓库、新闻         | Directus                                          | 后台发布后，下次页面请求读取 |
| FAQ、案例详情、期刊目录        | Directus，审核源码作为故障回退                    | 后台发布后，下次请求读取     |
| 服务专题、关于我们、全站设置   | Directus，审核源码作为故障回退                    | 后台发布后，下次请求读取     |
| 品牌常量                       | `src/data/brand/`，由 `src/lib/brand.ts` 兼容导出 | 修改代码并部署               |
| 官网统一运营口径（含首页统计） | `src/lib/claims/`                                 | 修改代码并部署               |
| SEO 与结构化数据               | 页面代码与 `src/lib/seo.ts`                       | 修改代码并部署               |

Directus 成功返回空数据时页面保持为空；只有网络失败、超时或 HTTP 5xx 才使用审核版代码回退。401/403 和非法响应明确失败，不能用旧内容掩盖权限或数据问题。动态页面不缓存 CMS 内容并设置 `no-store`，发布环境继续把 CMS 健康检查作为门槛。CMS 图片和附件统一通过站内 `/api/cms-assets/{uuid}` 交付；代理只允许读取被已发布内容引用的文件，不向浏览器暴露 Directus 运行令牌。

## 可维护性

- 页面入口只负责取数、Schema、页面级配置与模块编排；
- 静态业务内容进入 `src/data/`，组件、样式和浏览器控制器按职责隔离；
- `npm run verify` 会执行可维护性预算和静态资源完整性检查；
- 关于页Hero、联系表单、华南仓网、服务独有内容、Express运行时、字体生成和Oracle准备流程均已按变化原因拆分；
- CSS上限200行、内容数据上限180行，Astro页面入口、API路由、自动化入口和部署脚本另有更严格的专项预算；具体测试数量和最新结果以 `DEV_STATE.md` 为准；
- 公开规模、履约和质检数字统一从 `src/lib/claims/` 注册表读取，单元测试禁止在页面、组件和内容配置中重新手写同一口径；
- 不为追求行数机械拆分事实注册表或原子请求；
- 详细状态、保留理由与剩余债务见 [docs/MAINTAINABILITY.md](docs/MAINTAINABILITY.md)。

性能侧使用响应式WebP、站点字符集字体子集和非首屏渲染隔离。字体由 `npm run prepare:fonts` 根据源码实际字符从锁定字体包生成，资源检查和生产构建会自动补齐，不依赖本机遗留文件；桌面异步加载品牌字体，移动端使用系统中文字体避免重复排版。`npm run test:lhci:all` 在生产构建后对 desktop/mobile 各八条核心路由采样三次并输出中位数报告，默认只观察；desktop 失败时 mobile 未测不代表通过。完成 CI 同环境稳定基线、页面/设备阈值校准并留存证据后，才可用 `LHCI_MODE=enforce` 返回非零。CI required checks、合并规则和发布脚本均未因该观察流程改变。真实用户体验须由 CrUX/Search Console 等真实用户数据确认，旧本地单次 Lighthouse 分数不是当前基线。详见 [docs/PERFORMANCE_BASELINE.md](docs/PERFORMANCE_BASELINE.md)。

## AEO 与 Agent 发现

- `/llms.txt` 由 `src/pages/llms.txt.ts` 生成，并使用 `PUBLIC_SITE_URL` 输出当前环境的绝对链接。
- 新增、删除或重命名核心服务页、案例页后，必须同步更新 `llms.txt` 和 `src/pages/sitemap.xml.ts`。
- 公开运营数据只从 `src/lib/claims.ts` 的已审核口径引用，不在发现文件中手写旧数据。
- `llms.txt` 是面向模型读取的社区约定，不是 W3C 强制标准；每季度以及重大业务调整后复核一次。
- 当前不公开 `agent-permissions.json` 或 `mcp-actions.json`。只有在咨询、报价或查询动作具备授权、确认、防重复提交和审计机制后再设计 Agent 执行层。
- `robots.txt` 区分搜索增强型与训练型爬虫；涉及训练授权的规则必须由业务负责人确认，不得因技术优化擅自修改。

## 环境变量

| 变量                        | 说明                                                                            |
| --------------------------- | ------------------------------------------------------------------------------- |
| `DIRECTUS_URL`              | 服务端 Directus 地址；服务器建议 `http://127.0.0.1:8055`                        |
| `DIRECTUS_CONTENT_TOKEN`    | 仅可读取官网内容集合及文件元数据的运行令牌                                      |
| `DIRECTUS_NEWS_WRITE_TOKEN` | 仅可写入 `news` 的独立 Directus 服务端令牌，不得复用内容读取令牌                |
| `NEWS_PUBLISH_API_TOKEN`    | 仅允许受信任服务端调用批量 News 发布接口的 Bearer Token（至少 32 UTF-8 bytes）  |
| `XIANSUO_API_URL`           | XYY-xiansuo 服务端 HTTPS 根地址                                                 |
| `XIANSUO_INGEST_TOKEN`      | 仅用于官网服务端提交联系线索的 Integration Bearer Token                         |
| `DIRECTUS_TOKEN`            | 仅供建模、迁移和权限维护脚本临时使用，不得作为 Web 运行凭据                     |
| `PUBLIC_SITE_URL`           | 当前构建与 canonical 使用的站点地址                                             |
| `PUBLIC_DIRECTUS_URL`       | 浏览器可访问的 CMS 地址                                                         |
| `ENABLE_DOMAIN_REDIRECTS`   | 正式域名切换完成后才可设为 `true`                                               |
| `LEGACY_DOMAINS`            | 正式切换后需要 301 的旧域名列表                                                 |
| `DEPLOY_ENVIRONMENT`        | 部署时显式指定 `staging` 或 `production`                                        |
| `HOST`                      | PM2 从 Release 根目录 `.env` 读取；测试站为 `127.0.0.1`，未配置时默认 `0.0.0.0` |
| `TRUSTED_PROXY_CIDRS`       | 受信任代理网段；当前测试站为 `127.0.0.1/32`                                     |

`.env`、`.env.production` 仅保存在本地和服务器，不提交 GitHub，也不由部署脚本上传。
建模脚本使用的短期管理令牌不能写入 Web 运行环境。官网内容读取不会回退使用
`DIRECTUS_TOKEN`；联系表单仅由 `POST /api/contact` 在服务端通过 HTTPS 调用
XYY-xiansuo，缺少 Xiansuo 配置、网络/鉴权失败或下游响应不符合契约时均失败关闭。
浏览器不会接触 Integration Token，也不会直接请求 XYY-xiansuo。
Directus 12 Community 不提供自定义项目过滤和字段级权限时，内容令牌对13个运行内容集合和 `directus_files` 使用集合级只读。
历史 `contact_leads` 集合继续保留，但 Web 运行时不再向其写入新留言；官网查询仍统一附加
`status=published`，联系接口仍在服务端只接收表单白名单字段，文件代理仍只放行已发布内容的引用。具备相应 Directus 授权时，可设置
`DIRECTUS_CUSTOM_PERMISSION_RULES=true`，由权限同步脚本进一步下沉已发布内容过滤。

### 批量发布 News（服务端集成）

`POST /api/integrations/news/batch` 只接受受信任服务端的 `Authorization: Bearer <NEWS_PUBLISH_API_TOKEN>` 请求，不提供浏览器 CORS、文件上传、更新或删除能力。调用方令牌、`DIRECTUS_NEWS_WRITE_TOKEN` 和 `DIRECTUS_CONTENT_TOKEN` 均须至少 32 UTF-8 bytes 且三者独立保存；写入令牌应只拥有 `news` 新建所需的最小 Directus 权限。运行时发现缺失、过短或任意凭据复用会拒绝请求。

请求 JSON 只能包含 `articles`；每次 1–20 篇。每篇只允许 `title`、小写连字符 `slug`、四个既定 `category` 之一、`summary`、`content`、可选现有 Directus 文件 UUID `cover_image`，以及可选且带时区的 ISO `published_at`。接口服务端固定 `status=published`，未提供 `published_at` 时使用当前 UTC ISO 时间；`id`、`status`、`date_created`、`date_updated` 和其他系统字段会被拒绝。重复 slug 返回 `409`，下游异常不会泄露 Directus 地址、Token 或错误详情。

新闻公开读取会将带偏移的时间按其真实时刻比较；Directus 返回无时区时间时，统一按 `Asia/Shanghai` 的后台编辑时间解释。因此“发布”且发布时间不晚于当前时刻的文章会立即显示，未来发布时间仍保持隐藏。

## 测试站部署

目标服务器必须已配置 SSH 公钥、Node.js、PM2、Nginx 和 `/var/www/xyy-web/.env`。
部署前配置 `CAPACITY_BASELINE_FILE`（本地）及 `REMOTE_CAPACITY_BASELINE_FILE`（远端），
并使 `TMPDIR`、`PLAYWRIGHT_ARTIFACTS_DIR` 与实际容量测量使用的目录一致。
缺少实测基线或空间/inode不足时，部署脚本会停止；步骤见
[发布容量与媒体维护](docs/RELEASE_CAPACITY_MAINTENANCE.md)。

```bash
DEPLOY_HOST='root@47.82.105.103' \
DEPLOY_ENVIRONMENT='staging' \
SITE_URL='https://wz.tomatopia.top' \
bash scripts/deploy.sh
```

部署脚本会：

1. 拒绝包含已修改、已暂存或未跟踪文件的工作区，执行容量预检，并为当前 Git SHA 生成 Release Manifest；
2. 以 `SITE_URL` 覆盖构建期公开地址并运行 `npm run verify:release`；
3. 将 Manifest、应用与构建产物上传到同一独立版本目录，并安装生产依赖；
4. 保留服务器现有 `.env`，通过 `current` 软链原子切换后重启 `xyy-web`；
5. 用 `/healthz` 检查依赖就绪，用 `/version` 精确核对 Git SHA、Release ID、环境和 CMS 模型版本；任一不符即恢复上一软链并尽可能核对旧版本身份；
6. 生成旧版本清理预览，默认保护最近5版及当前、回退、锁定版本；部署脚本不会自动删除旧版本，实际清理由独立维护操作使用已审阅的精确计划执行。

当前测试站 Web 进程监听 `127.0.0.1:50031`，通过 Nginx 对外服务；PM2 的 `HOST`
从 Release 根目录 `.env` 读取，运行环境中的 `TRUSTED_PROXY_CIDRS` 为 `127.0.0.1/32`。

`/healthz` 只证明依赖是否就绪；`/version` 只返回可公开的不可变发布身份并禁止缓存。
生产 Release 缺少或损坏 `release-manifest.json` 时，`/version` 返回503，不读取 Git、源码目录
或开发者环境作为替代。第五阶段以前创建的旧 Release 没有 Manifest 时仍允许首次回滚，但只会
输出 `legacy_previous_release_identity_unavailable`，不能声称旧版本身份已验证。

在 `56xyy.com` DNS、证书与 Nginx 未切换到目标服务器前，不得启用旧域名跳转。迁移参考配置位于 `deploy/nginx-56xyy.conf`。

### 数据库与附件备份

测试站当前使用 PostgreSQL。数据库与附件的备份/恢复脚本分别见
[`deploy/postgresql/`](deploy/postgresql/README.md) 和
[`deploy/uploads/`](deploy/uploads/README.md)。数据库备份不包含实际附件，需要成对备份并联合恢复验证。
2026-10-09 测试站已完成成对加密备份与隔离恢复验证；该记录不代表定时备份任务已启用。
仓库中的 [`deploy/oracle19c/`](deploy/oracle19c/README.md) 为历史参考，本次发布未执行 Oracle 迁移。

## CMS

- 当前验收后台：<https://wz.tomatopia.top/cms/admin/>
- Ping：<https://wz.tomatopia.top/cms/server/ping>
- 账号、Token、数据库口令和服务器路径由部署团队管理，不进入仓库。

```bash
# 首次创建模型、初始化基础内容并核验（仅使用短期管理级 Token）
node scripts/setup-cms.mjs

# 明确只建结构：不会导入网站基础内容，页面尚未具备完整内容
node scripts/setup-cms.mjs --schema-only

# 已有模型时，预览基础内容初始化计划（只有读取请求）
npm run cms:init-content

# 确认目标后，补入缺失基础内容并回读检查
npm run cms:init-content -- --apply

# 只读检查首次安装所需的内容身份、发布状态和关键字段
npm run cms:check-content

# FAQ 源文案变化后，重新生成初始化种子并提交审核
npm run cms:generate-faq-seeds

# 案例、期刊、服务页、关于页与站点设置源文案变化后生成初始化种子
npm run cms:generate-content-seeds

# 部署后核对 19 个业务集合与文件库
npm run cms:verify

# 历史 Directus 留言双令牌模式的权限诊断（不适用于当前 Xiansuo 联系表单）
npm run cms:verify-runtime-permissions

# 预检审核内容同步
npm run cms:sync-approved

# 执行同步
npm run cms:sync-approved -- --apply

# 仅规划修复 9 个仓配下拉专题页的 stats、features 与 img_src（不写 CMS）
npm run cms:repair-service-page-structure

# 备份后执行定向修复，并对结果回读验证
npm run cms:repair-service-page-structure -- --apply
```

`cms:init-content` / `cms:check-content` 要求显式设置 `DIRECTUS_URL` 和
`DIRECTUS_TOKEN`，不会自动加载 `.env`。内容初始化要求模型已经建立；不会建表或修改权限。
基础内容来自仓库版本化种子：12 个集合共 171 条记录，包括首页配置、联系方式、9 个服务详情、
14 期白皮书目录、85 条 FAQ，以及公司介绍、仓点、案例、历程和荣誉。新闻文章、询盘和历史上传
文件不属于这份内容包。首次安装选择“基础内容初始化”，即可保留这些网站原有内容而不迁移历史业务数据。

初始化只创建缺失身份，保留已有编辑、草稿和主动留空的字段。已有记录不完整时会报告缺项，
不会直接覆盖；重复执行完整内容初始化不会写内容。显式重跑会补回已删除的种子身份，因此不要
在普通 Web 部署或网站启动时自动执行。`cms:check-content` 用于首次基础内容验收，不是要求运营
长期保留全部初始案例和页面的日常发布规则。`/healthz` 检查依赖连通性与权限，不能代替内容验收。
多次 API 写入不是事务，中断后应查看失败信息，再明确执行补缺重试。

服务专题结构修复只处理仓配下拉菜单对应的 9 条 `service_pages`，不会新建记录或改动
其他字段。它会在 dry-run 和 apply 前将当前 `service_pages` 快照写入 Git 忽略的
`output/cms-sync/`，并在发现重复或缺失 slug、非 published 记录、已上传的 `hero_image`
或不完整的审核 Seed 时失败关闭。Directus 的 9 次 PATCH 不是事务：若中断，先保留备份，
重新执行 dry-run 确认计划，再以 `--apply` 幂等补齐并要求回读验证为零差异。

Directus 字段职责、FAQ 页面标识和维护规则见
[`docs/CMS_CONTENT_MODEL.md`](docs/CMS_CONTENT_MODEL.md)；正式域名发布与回滚步骤见
[`docs/MAIN_DOMAIN_CUTOVER.md`](docs/MAIN_DOMAIN_CUTOVER.md)。

## 提交边界

禁止提交：真实环境变量、Token、服务器密钥、构建产物、测试截图、原始大媒体和临时补丁。
`public/logos/`、`public/about/` 及其他被页面引用且已优化的发布素材属于可复现构建输入，
必须提交；`resources/` 中的原始素材继续留在仓库外。

GitHub Actions 会从干净检出使用 `github.sha` 生成 `environment=ci` 的候选 Manifest，执行格式
检查、生产依赖审计和 `verify:release`，且只有 `contents: read` 权限，不具备部署权限。CI 通过只表示
候选版本具备发布条件，不代表服务器令牌、备份 timer、DNS 或数据库迁移已经完成。
