# XYY-20261008-10 — 更新 llms.txt 网站内容索引

- 风险：LOW，公开文本内容更新；Terra → Luna → Nova → Sol。
- 用户授权：更新 llm.txt 内容；项目实际入口是 `/llms.txt`，继续更新该入口，不另建别名。本轮限本地修改与验证。
- 基线：HEAD `f04bd1e`，`src/pages/llms.txt.ts` 原无 diff；保留 robots 开放及其他全部既有/并行修改。
- 输入：当前 llms 路由，导航和中英文路由，已审核服务文案，`src/i18n/shell.ts` 企业文化，现有 Claims 与动态案例/白皮书来源。
- Scope：丰富企业定位/文化；更新现有服务说明；补英文 Insights、站点地图和抓取规则入口；补简短咨询与引用说明。保留所有既有服务/内容链接和动态内容机制，不增加无依据经营数据。
- 所有权：Terra 仅 `src/pages/llms.txt.ts` 与追加 `docs/TERRA.md`；Luna 仅本任务验证产物与追加 `docs/LUNA.md`；Nova 前置内容核对只读、最终仅追加 `docs/NOVA.md`；Sol 管理本合同、状态、自己的日志和基线证据。
- 排除：不更改 CMS 请求/空值/异常/回退契约、案例映射、白皮书目录、Claims 注册项、Sitemap/robots、其他路由、依赖、页面样式；不创建 `/llm.txt`、`llms-full.txt` 或新生成管线；不提交、推送、部署及真实 CMS/数据库写入。

## 验收标准

1. `/llms.txt` HTTP 200，以 Markdown 标题、简介、分区与绝对链接展示当前网站内容；保持 `text/plain; charset=utf-8` 与 `Cache-Control: no-store`。
2. 企业文化四项与当前页脚一致，服务描述可追溯到本地当前公开文案；不增加未经审核的经营数字、排名或保证性成效。
3. 当前全部中文服务、英文服务、案例/白皮书动态链接仍在；新增 `/en/news`、`/sitemap.xml`、`/robots.txt` 正确使用现有域名工具，不引入过时服务路径。
4. 六项现有运营规模/覆盖指标继续通过 `getClaimText(..., 'llms')` 生成；CMS 案例成功为空仍不生成案例条目，错误处理与语言映射保持。
5. 定向既有单测、目标格式/Lint/diff、Luna 本地 HTTP 内容验证通过，Nova 无阻断问题；不为低影响文案变动新增镜像实现的单测或扩展全量测试。
6. 范围外既有修改保持；明确本地验证、未部署与未做线上抓取验证。

## 证据

- `output/llms-content/xyy-20261008-10/`：修改前内容、实际响应、验证命令结果和来源核对。
- 图谱仅辅助定位旧依赖，现行源码与本轮证据优先。
- 无视觉页面改动，不要求截图；无提交或部署，不触发完整 verify / verify:release。
- 状态：本地验收完成；Terra 实施，Luna PASS，Nova APPROVED，Sol 接受。
- 结果：仅修改 llms 路由内容，保留全部旧静态入口，新增四个路径引用 `/contact#service-finder`、`/en/news`、`/sitemap.xml`、`/robots.txt`；四项文化复用当前页脚，六项 Claims 与动态数据生成机制保持。
- 验证：5 文件 / 22 项定向单测、目标 Prettier/ESLint/diff 通过；本地 Astro / loopback CMS 发布案例与成功空案例两轮 HTTP 200，四项文化、六项 Claims、49 个静态 URL、六个中英案例 slug 和 14 个白皮书 URL 校验通过，空案例不回填。首次临时断言因文化标签空格漏写失败，修正断言后通过，应用未返工。
- 最终证据：`luna-validation.json`、`luna-http-published.txt`、`luna-http-empty-cases.txt`、`sol-preservation.json`；Sol 核对 21 个范围外既有 tracked 修改哈希保持。4399/4400 已关闭，既有 4321 保留。
- 限制：未验证真实 CMS、线上响应、外链或实际爬虫；未提交、推送、部署，未运行完整 verify / verify:release。
