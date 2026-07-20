# 新亦源供应链官网项目检查报告

> 检查日期：2026-07-16  
> 项目目录：`/home/yj/XYY-GEO/website`  
> 检查范围：项目结构、技术栈、Git 状态、构建与测试、依赖安全、数据链路、部署配置和仓库资源

## 一、总体结论

该项目是一个基于 Astro SSR 和 Directus CMS 的企业官网，已经具备较完整的生产部署能力，包括 SEO、结构化数据、内容管理、联系表单、PM2 进程管理、Nginx 反向代理、自动化测试和部署脚本。

当前主体代码状态健康，类型检查、代码规范检查、单元测试和生产构建均已通过，生产依赖未发现已知安全漏洞。本地 `main` 分支没有已跟踪文件的未提交修改。

当前主要问题不是编译或运行错误，而是以下工程和业务风险：

1. 联系表单在 Directus 写入失败时仍返回提交成功，存在静默丢失客户线索的风险。
2. Directus 查询失败会返回并缓存空数据，可能导致页面内容暂时消失。
3. README、CLAUDE.md 中的缓存说明与当前代码不一致。
4. 工作区存在一批用途不清或明确不应提交的未跟踪文件。
5. 期刊 PDF、视频及历史 Git 对象使项目体积偏大。
6. 部署前的 `verify` 未包含 E2E、Lighthouse 和格式检查。

综合判断：项目可以继续开发和部署，但建议优先处理表单可靠性、CMS 故障兜底和仓库卫生问题。

## 二、技术栈

| 层级 | 技术 | 说明 |
|---|---|---|
| 前端框架 | Astro 7 | 使用 SSR Server 模式 |
| Node 适配器 | `@astrojs/node` | Middleware 模式 |
| 样式 | Tailwind CSS 4、页面级 CSS | 大量页面样式写在 Astro 文件内 |
| 动画 | GSAP、Lenis | 页面动画和平滑滚动 |
| CMS | Directus 12 | 管理首页数据、服务、仓库、案例和新闻 |
| 数据库 | PostgreSQL 16 | Directus 后端数据库 |
| 生产服务 | Express 5 | 包装 Astro SSR，添加压缩、安全头和静态缓存 |
| 进程管理 | PM2 | 生产进程名为 `xyy-web` |
| 反向代理 | Nginx | `/` 代理 Astro，`/cms/` 代理 Directus |
| 单元测试 | Vitest | Directus、富文本过滤和联系接口测试 |
| E2E 测试 | Playwright | 桌面端和移动端冒烟测试 |
| 性能检查 | Lighthouse CI | 检查首页和关于页 |

项目要求 Node.js `>=22.12.0`、npm `>=9.6.5`。本次检查环境为 Node.js `v24.18.0`、npm `11.16.0`。

## 三、目录结构

```text
website/
├── src/
│   ├── components/          # Header、Footer、FAQ 等公共组件
│   ├── layouts/             # 全局布局、服务落地页模板
│   ├── lib/                 # 品牌常量、Directus、数据过滤、站点配置
│   ├── pages/               # 页面路由、动态新闻、API、sitemap、robots
│   └── styles/              # 全局样式
├── public/                  # 图片、字体、视频、期刊 PDF 等公开资源
├── resources/               # 不发布的原始媒体资源
├── scripts/                 # CMS 初始化、部署和健康检查脚本
├── tests/
│   ├── unit/                # Vitest 单元测试
│   └── e2e/                 # Playwright 冒烟测试
├── server.mjs               # Express + Astro SSR 生产入口
├── astro.config.mjs         # Astro 配置
├── ecosystem.config.cjs     # PM2 配置
├── nginx.conf               # Nginx 参考配置
├── package.json             # 依赖及项目命令
└── README.md                # 项目说明
```

`src`、`tests` 和 `scripts` 中主要代码约 7,821 行，其中较大的文件包括：

| 文件 | 约行数 | 说明 |
|---|---:|---|
| `src/pages/index.astro` | 1,658 | 首页结构、内容、样式与交互集中在单文件中 |
| `src/pages/about.astro` | 733 | 关于页 |
| `src/pages/product.astro` | 530 | 产品服务页 |
| `scripts/setup-cms.mjs` | 374 | Directus 集合初始化和种子数据 |
| `src/pages/cases.astro` | 360 | 案例页 |
| `src/pages/senlinqikan.astro` | 353 | 森林期刊页面 |

首页文件体积已经较大，后续频繁迭代时可以考虑逐步拆分成业务区块组件，但目前不影响构建。

## 四、页面和路由情况

### 4.1 核心页面

- `/`：首页
- `/about`：关于新亦源
- `/product`：产品与服务
- `/cases`：客户案例
- `/contact`：联系页面
- `/senlinqikan`：森林期刊
- `/news`：新闻列表
- `/news/[slug]`：新闻详情
- `/404.html`：错误页

### 4.2 服务与 GEO 落地页

项目包含 11 个主要服务落地页：

- `/b2b-mendian-cangpei`
- `/fuzhuang-yuncang`
- `/guangzhou-xiefu-yuncang`
- `/houzheng-xiufu`
- `/huadong-xiefu-yuncang`
- `/huanan-xiefu-yuncang`
- `/kuajing-yuncang`
- `/tuihuo-zhijian`
- `/weipinhui-jit-jitx`
- `/xiefu-yuncang`
- `/zhibo-cangpei`

这些页面大部分复用 `src/layouts/ServiceLanding.astro`，页面结构中已经包含面包屑、服务结构化数据和 FAQ 结构化数据，复用方式较合理。

### 4.3 服务端接口

- `/api/contact`：联系表单提交接口
- `/sitemap.xml`：动态 sitemap
- `/robots.txt`：动态 robots 配置
- `/healthz`：Express 生产服务器健康检查

## 五、数据架构

项目存在两个主要数据来源。

### 5.1 Directus CMS

Directus 管理以下集合：

| 集合 | 使用位置 |
|---|---|
| `homepage_stats` | 首页统计数字 |
| `services` | 首页、产品页、Footer 的服务数据 |
| `warehouses` | 关于页仓库信息 |
| `cases` | 首页案例、案例页 |
| `news` | 新闻列表、新闻详情、sitemap |
| `contact_leads` | 联系表单线索 |

当前 Directus 列表查询采用进程内缓存，默认 TTL 为 `300_000ms`，即 5 分钟。PM2 重启后缓存会清空。

### 5.2 本地代码数据

`src/lib/brand.ts` 保存品牌常量、关于页统计数字以及首页案例详情等数据。这些内容修改后需要重新构建和部署。

### 5.3 数据链路风险

Directus 数据函数普遍使用以下容错逻辑：

```ts
try {
  return await requestItems(...)
} catch {
  return []
}
```

这个设计可以避免 CMS 故障直接导致页面 500，但同时存在两个问题：

1. 错误不会进入日志或监控，难以及时发现 CMS 故障。
2. 空数组会进入五分钟缓存，使案例、服务或新闻在 CMS 短暂故障后继续显示为空。

建议改为“缓存最后一次成功结果”：请求成功时更新缓存，请求失败时记录错误并返回旧缓存；只有从未取得过数据时才返回空数据或明确的降级内容。

## 六、构建和测试结果

### 6.1 完整质量门禁

本次执行：

```bash
npm run verify
```

结果如下：

| 检查项 | 结果 |
|---|---|
| `astro check` | 通过，0 errors、0 warnings、0 hints |
| `eslint .` | 通过 |
| `vitest run` | 3 个测试文件、9 个测试全部通过 |
| `astro build` | 通过，SSR 构建成功 |

构建过程中预渲染了 `/404.html` 和 `/contact/index.html`，其余主要页面由 SSR 提供。

### 6.2 依赖安全

本次执行：

```bash
npm audit --omit=dev
```

生产依赖未发现已知漏洞：

| 等级 | 数量 |
|---|---:|
| Critical | 0 |
| High | 0 |
| Moderate | 0 |
| Low | 0 |
| Info | 0 |

### 6.3 E2E 测试

项目配置了 Chromium 桌面端和 Pixel 7 移动端两套 Playwright 测试。

本次 E2E 没有进入具体测试用例执行，因为当前受限运行环境不允许连接本地回环地址 `127.0.0.1:4321`，Playwright 健康检查报错：

```text
connect EPERM 127.0.0.1:4321
```

该结果属于检查环境限制，不能认定为页面 E2E 断言失败。建议在普通本地终端或 CI 环境重新执行：

```bash
npm run test:e2e
```

### 6.4 当前门禁缺口

`npm run verify` 当前只执行：

```text
typecheck → lint → unit test → build
```

没有包含：

- `format:check`
- `test:e2e`
- `test:lhci`

部署脚本调用的是 `npm run verify`，因此视觉交互回归、移动端问题和性能下降不会阻止部署。建议在 CI 中建立更完整的检查流程；Lighthouse 可以作为警告项，E2E 至少应覆盖首页、新闻、联系表单和主要导航。

## 七、Git 和工作区状态

### 7.1 分支状态

检查时状态为：

```text
main...origin/main
```

本地 `main` 与本地保存的 `origin/main` 跟踪引用一致，没有已跟踪文件的未提交修改。最新提交为：

```text
f266f43 geo: 优化首页Title、11个服务页首屏摘要、补权威外链
```

说明：本次检查没有执行远端 `git fetch`，因此只能确认与本地保存的远端引用一致。

### 7.2 未跟踪文件

当前存在以下主要未跟踪内容：

- `graphify-out/`
- `public/Omission/`
- `public/yunliu.png`
- `public/新亦源官网审阅Swiss.html`
- `public/新亦源官网截图审阅.html`
- `speed-optimization.plan.md`

其中项目说明明确指出 `public/Omission/` 和 `public/yunliu.png` 不应提交，但 `.gitignore` 尚未忽略它们。`graphify-out/` 看起来属于代码分析缓存，也不适合进入正式仓库。

建议确认两份审阅 HTML 和性能计划是否需要长期留档。若只是临时产物，应移出 `public/` 或加入忽略规则，防止被意外部署到线上。

## 八、资源与仓库体积

整个工作目录约为 1.3 GB，主要占用如下：

| 目录 | 体积 |
|---|---:|
| `node_modules/` | 约 623 MB |
| `dist/` | 约 176 MB |
| `public/` | 约 175 MB |
| `resources/` | 约 156 MB |
| `.git/` | 约 151 MB |
| `public/senlinqikan/` | 约 134 MB |

已跟踪文件合计约 144 MB。大文件主要包括：

| 文件 | 体积 |
|---|---:|
| `resources/original-media/introduce-original.mp4` | 约 147 MB，已忽略 |
| `public/senlinqikan/pdf/14.pdf` | 约 21 MB |
| `public/senlinqikan/pdf/13.pdf` | 约 19 MB |
| `public/introduce-720p.mp4` | 约 17 MB，已忽略 |
| 多份森林期刊 PDF | 单份约 4–15 MB |

这些 PDF 不会自动拖慢普通页面首屏，但会增加首次克隆、完整部署、备份和静态资源同步成本。建议长期考虑：

1. 将期刊 PDF 放入对象存储或 CDN。
2. 为 PDF 提供独立缓存策略。
3. 对历史 Git 大对象进行一次盘点，但不要直接执行破坏历史的清理操作。
4. 避免继续将大视频或原始设计文件提交到 Git。

## 九、SEO 与安全情况

### 9.1 已具备的 SEO 能力

- 每页支持独立 title 和 description。
- 支持 canonical URL。
- 提供 Open Graph 和 Twitter Card 元数据。
- 提供 sitemap 和 robots。
- 服务页包含 `Service`、`BreadcrumbList`、`FAQPage` 结构化数据。
- 新闻富文本经过白名单过滤后再使用 `set:html` 输出。
- 服务落地页结构统一，适合继续扩展 GEO 内容。

### 9.2 已具备的安全措施

- Express 关闭 `X-Powered-By`。
- 配置 CSP、HSTS、`nosniff`、Frame、Referrer 和 Permissions Policy。
- CMS 富文本使用 `sanitize-html` 清洗。
- 联系表单限制请求体积。
- 联系表单包含蜜罐字段。
- 联系表单包含基于 IP 的简单频率限制。
- Directus Token 只在服务端使用。
- `.env`、`.env.production` 已加入 `.gitignore`。

### 9.3 联系表单业务风险

当前联系接口在以下场景中仍会返回 `{ success: true }`：

- 没有配置 `DIRECTUS_URL` 或 `DIRECTUS_TOKEN`。
- Directus 返回非 2xx 状态。
- Directus 网络请求异常。

这会导致访客看到“提交成功”，但客户线索没有保存。此外，失败日志包含姓名、完整电话和公司名称，可能形成不必要的个人信息留存。

建议：

1. Directus 写入失败时返回明确的可重试错误，或将线索写入可靠的本地/队列兜底存储。
2. 配置错误监控与告警。
3. 日志中的电话只保留掩码，例如 `138****5678`。
4. 对邮箱字段增加格式检查。
5. 如果未来使用多 PM2 实例，将内存限流迁移到 Redis 或 Nginx。

## 十、文档漂移

当前实现使用 5 分钟缓存，但以下文档仍写 60 秒或实时：

- `README.md`
- `CLAUDE.md`
- 部分页面源码注释
- `speed-optimization.plan.md` 中的旧说明

当前真实行为大致如下：

| 数据 | 当前代码行为 |
|---|---|
| 首页统计 | 最多缓存 5 分钟 |
| 服务介绍 | 最多缓存 5 分钟 |
| 仓库列表 | 最多缓存 5 分钟 |
| 案例列表 | 最多缓存 5 分钟 |
| 新闻列表 | 按分页参数最多缓存 5 分钟 |
| 单篇新闻详情 | 当前未使用列表缓存 |

建议及时更新文档，避免运营人员误以为 CMS 修改会立即或在 60 秒内生效。

## 十一、问题优先级

| 优先级 | 问题 | 影响 | 建议 |
|---|---|---|---|
| P0 | 联系表单写入失败仍返回成功 | 可能直接丢失客户线索 | 增加可靠存储、失败响应和告警 |
| P1 | CMS 异常返回并缓存空数据 | 页面内容可能消失五分钟 | 使用最后成功缓存并记录异常 |
| P1 | 失败日志记录完整个人信息 | 隐私与日志治理风险 | 日志脱敏 |
| P1 | README/CLAUDE 缓存说明错误 | 运营和排障判断错误 | 统一更新为真实的五分钟策略 |
| P2 | 未跟踪临时文件未忽略 | 容易误提交或意外上线 | 完善 `.gitignore` 并分类整理 |
| P2 | `verify` 不包含 E2E/Lighthouse | 回归问题可能进入生产 | 在 CI 增加完整门禁 |
| P2 | 期刊 PDF 和 Git 仓库偏大 | 克隆、部署和备份成本增加 | 逐步迁移对象存储/CDN |
| P3 | 首页单文件约 1,658 行 | 后续维护和协作成本较高 | 按业务区块逐步拆分组件 |

## 十二、建议实施顺序

### 第一阶段：保证业务数据可靠

1. 修复联系表单静默丢单问题。
2. 对联系日志中的电话号码进行脱敏。
3. 为 Directus 查询增加错误日志和最后成功数据兜底。

### 第二阶段：整理工程状态

1. 更新 README 和 CLAUDE.md 中的缓存说明。
2. 补充 `graphify-out/`、`public/Omission/`、`public/yunliu.png` 等忽略规则。
3. 确认审阅 HTML 和性能计划是否需要保留。
4. 在正常本地或 CI 环境重新执行 Playwright E2E。

### 第三阶段：完善质量和资源治理

1. 在 CI 中加入 `format:check`、E2E 和 Lighthouse。
2. 规划森林期刊 PDF 的对象存储或 CDN 迁移。
3. 逐步拆分首页、关于页和产品页的大型 Astro 文件。
4. 为 CMS 故障、联系表单失败和生产健康状态建立监控告警。

## 十三、常用命令

```bash
# 本地开发
npm run dev

# 类型、Lint、单元测试和构建
npm run verify

# 桌面端和移动端冒烟测试
npm run test:e2e

# Lighthouse 检查
npm run test:lhci

# 生产依赖安全审计
npm run audit

# 构建后启动生产服务
npm start
```

## 十四、本次检查说明

- 本次检查未修改现有项目源码或配置。
- 本次检查未连接生产服务器，也未验证线上 Directus 数据。
- 未执行远端 `git fetch`，Git 同步状态以本地保存的跟踪引用为准。
- E2E 受当前执行环境的本机端口访问限制，未能完成用例执行。
- 报告中的体积数据为检查时的近似值，后续安装、构建或新增资源后会发生变化。

