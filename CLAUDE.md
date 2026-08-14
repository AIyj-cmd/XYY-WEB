# CLAUDE.md

项目：广州新亦源供应链官网。技术栈为 Astro 7 SSR、Directus 12、Express 5、PM2 和 Nginx。

## 开发与验证

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run verify
npm run verify:release
```

提交前必须至少通过 `npm run verify`；部署前必须通过 `npm run verify:release`。涉及交互或响应式布局时，还要用浏览器检查桌面与移动端。

## 数据职责

| 数据                             | 来源                                          | 修改方式           |
| -------------------------------- | --------------------------------------------- | ------------------ |
| 首页统计、服务、案例、仓库、新闻 | Directus，无内容缓存                          | CMS 保存后刷新页面 |
| `CASE_DETAILS`、品牌与导航常量   | `src/data/brand/`，由 `src/lib/brand.ts` 导出 | 改代码并部署       |
| 统一数字与运营口径               | `src/lib/claims.ts`                           | 改代码并部署       |
| JSON-LD、FAQ Schema、canonical   | 页面与 `src/lib/seo.ts`                       | 改代码并部署       |

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

## 产品服务页设计状态

产品服务页于 2026-08-01 完成当前版本。继续修改时保持以下约束：

- 四项核心方案固定为鞋服云仓、退货质检与瑕疵修复、物流数字化能力、运到智能寄件平台；
- 产品页承担服务选择和方案理解，不重复首页的产品简介结构；
- 只有服务选择与组合方案大量使用卡片，其余模块优先使用实景图、流程、数据、截图和目录列表；
- 桌面端章节导航为居中悬浮胶囊，向上滚动显示、向下滚动隐藏；移动端使用横向标签；
- 系统类能力使用真实截图并支持放大，不使用低清旧信息图或虚构后台界面；
- 页面主要使用白色与浅灰蓝背景，深蓝仅用于最终 CTA、页脚和系统截图容器；
- 动效保持一次性、低干扰，并尊重 `prefers-reduced-motion`。

## Git 与仓库卫生

不得提交：

- `.env`、`.env.production` 或任何 Token、密码和私钥；
- `.astro/`、`dist/`、`output/`、`test-results/`、`.playwright-cli/`；
- `resources/` 原始大媒体；
- 临时截图、备份补丁和本地审计输出。

技术文档放入 `docs/`，部署配置放入 `deploy/`，自动化脚本放入 `scripts/`。不要在项目根目录新增临时报告或一次性脚本。

## 部署安全

Web 运行时必须优先使用不同的 `DIRECTUS_CONTENT_TOKEN`（18个内容集合只读）和
`DIRECTUS_CONTACT_TOKEN`（仅创建咨询线索）。`DIRECTUS_TOKEN` 只允许用于滚动升级兼容；
初始化所需的管理令牌不得配置到 Web。部署人员配置完成后运行
`npm run cms:verify-runtime-permissions`，失败时不得发布。
Directus 12 Community 环境没有自定义权限授权时，运行权限按集合和动作隔离，已发布状态
过滤与联系字段白名单由服务端查询和接口继续强制执行；不得绕过许可门禁或把管理令牌作为
替代方案。

当前阿里云验收服务器为 `47.82.105.103`，验收域名为 `wz.tomatopia.top`，后台位于
同源 `/cms/admin/`。正式域名 `56xyy.com` 完成证书、DNS、Nginx、canonical 与索引策略
复核前，不得启用旧域名重定向。

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

### Oracle 19c 数据库迁移

验收站 Directus 当前仍连接 PostgreSQL 16。本轮只同步网站和 CMS 内容模型，不执行迁库。
独立 Oracle Database 19c 的实施脚本和操作顺序位于 `deploy/oracle19c/`；只有数据库服务器、
私网连接、备份、恢复演练与回滚门槛全部就绪后，才允许并行迁移和切换。
数据库引擎切换不包含附件文件；`deploy/uploads/` 的独立备份任务必须在应用服务器安装并
与数据库备份成对做异机保存和恢复验证。

FAQ 统一由 Directus `faq_pages` 按页面聚合管理，子项保存在 `faqs`，页面必须通过
`getFaqs(pageKey, fallback)` 读取，不能绕开静态回退。涉及审核数据时使用
`{{claimKey}}` 占位符，由 `src/lib/claims.ts` 在渲染时解析；维护规则见
`docs/CMS_CONTENT_MODEL.md`。

## 关键文件

- `src/components/Header.astro`：全站悬浮导航与移动菜单
- `src/pages/index.astro`：首页CMS取数、Schema和业务组件编排
- `src/components/home/`：首页首屏、能力数据、解决方案、案例/弹窗、履约流程和FAQ组件
- `src/data/home.ts`：首页静态能力说明、图片映射和FAQ配置
- `src/data/product.ts`：产品页服务系列、目录、流程与保障配置
- `src/components/product/ProductServiceDirectory.astro`：产品页问题目录与可访问 Tab 交互
- `src/components/product/`：产品页目录、服务系列、商品整理、流程和保障业务组件
- `src/components/about/AboutHonors.astro`：关于页荣誉画廊与弹窗
- `src/scripts/`：首页、产品页和关于页的浏览器交互控制器
- `src/styles/product.css`、`src/styles/product/`：产品页有序样式入口与组件级分片
- `src/styles/service-signature.css`、`src/styles/service-signature/`：服务差异化视觉入口与变体族分片
- `src/layouts/ServiceLanding.astro`：服务专题页Schema、组件编排与独有内容插槽
- `src/components/service/ServiceLandingHero.astro`：服务专题页共享Hero
- `src/components/service/ServiceExperience.astro`：服务专题页详情、FAQ与最终CTA
- `src/components/service/ServiceSignature.astro`：服务页公共签名标题与视觉族分派
- `src/components/service/ServiceSignatureWarehouse.astro`：仓储视觉族分派，具体变体位于 `service/signature/`
- `src/components/service/ServiceSignatureDigital.astro`：数字视觉族分派，具体变体位于 `service/signature/`
- `src/components/service/ServiceSignatureQuality.astro`：质检视觉族分派，具体变体位于 `service/signature/`
- `src/data/service.ts`：服务页共享类型、体验文案和签名配置
- `src/lib/directus.ts`：Directus稳定导出门面；类型、客户端和查询分别位于 `directus-*.ts`
- `src/lib/contact/`：联系接口的请求读取、限流、校验与 Directus 落库职责
- `src/lib/claims.ts`：统一运营事实与数字口径
- `server.mjs`：Express 应用装配与启动入口；运行配置、请求策略和健康检查分别位于 `server/`
- `scripts/deploy.sh`：构建、同步、PM2 重启和健康检查
- `scripts/setup-cms.mjs`：CMS 初始化编排；集合模型和运行时位于 `scripts/data/`、`scripts/lib/`
- `deploy/oracle19c/migrate-directus-content.mjs`：跨库内容迁移编排；传输与规范化逻辑位于 `deploy/oracle19c/lib/`

## 可维护性边界

- 按“独立业务职责＋独立交互＋可单独测试”拆组件，不按标签数量机械拆分。
- `npm run check:maintainability` 是强制门禁；新增代码不得通过修改预算绕过拆分评审。
- CSS按布局、视觉变体、交互状态或响应式职责拆分，单文件上限200行；`src/data/`按业务内容域拆分，单文件上限180行，稳定入口只做兼容导出。
- 门禁通过只代表文件规模未回退；维护评审还必须检查页面编排、业务组件、事实数据、浏览器控制器、样式、CMS读取/管理、API和部署脚本是否各自只有一个变化原因。
- 页面脚本通过稳定的 `data-*`、ARIA 和 id 契约连接 DOM；调整契约时同步更新 Playwright。
- 新增首页案例、履约、FAQ、产品目录、关于仓网、案例、期刊或联系表单逻辑时，优先修改对应组件、数据或控制器，不再写回页面内联脚本。
- `index.astro`、`product.astro`、`about.astro`、`cases.astro`、`contact.astro`、`senlinqikan.astro`、`ServiceLanding.astro` 和 `ServiceSignature.astro` 已完成入口瘦身；维护状态以 `docs/MAINTAINABILITY.md` 为准。
- `HomeCaseModal`、`HomeCases`、`HomeCoreSolutions`、能力统计卡和履约/FAQ均已完成模板、数据、样式与控制器分层；能力动画由入口、运行时和三类播放器组成。
- 不得把已经拆出的首页或产品页职责重新合并回页面入口；拆分时禁止同时改变视觉、文案、路由和业务口径。
