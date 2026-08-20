# 主站 FAQ 缺失、CMS 文章封面与新闻详情检查报告

日期：2026-08-20

交付对象：部署、运维与 CMS 管理人员

检查范围：`https://56xyy.com`、`https://wz.tomatopia.top`、当前 `main` 源码

## 结论

1. FAQ 前端组件和当前仓库查询代码不需要修复。当前源码在 CMS 不可用时能正常显示审核 FAQ；桌面与移动端检查通过。
2. 验收站已经运行当前应用版本。验收站 Release 为 `20260816T150610Z-2f60c4f`，Git SHA 为 `2f60c4fa7d0102e784013d19e351ff1484b1bbe9`；该提交与仓库 HEAD 只存在状态文档差异，没有应用代码差异。
3. 正式站不是验收站的同一运行环境。两个域名解析到不同服务器并使用独立 Directus 实例；正式站 `/version` 落入站内 404，静态资源指纹也与验收站不同。
4. 正式站 FAQ 缺失应按“Release、环境变量、CMS 内容/关系、运行令牌权限未同步”排查，不能先修改 FAQ 页面代码。
5. CMS 不能稳定选择新闻封面是独立的 Schema 迁移问题。2026-08-20 对验收 CMS 的只读数据库检查确认：`news.cover_image` 物理列仍为 `varchar`，界面已配置为 `file-image`，但不存在指向 `directus_files` 的关系。这会造成“文件上传成功，但选择、保存或回显封面不可靠”的半迁移状态；重新部署同一 Web 构建不会修复。
6. 验收站新闻详情另有一个已复现的数据契约问题。已发布记录 ID 5 的 slug 为 `chehsi `，末尾包含 ASCII 空格；`/news/chehsi` 会被重定向回新闻列表，而 `/news/chehsi%20` 返回200。应先修正该 CMS 数据，同时补强仓库中的 slug 校验，防止再次保存首尾空格。

## 已确认现象

| 检查项             | 正式站 `56xyy.com`      | 验收站 `wz.tomatopia.top`   | 判定                                 |
| ------------------ | ----------------------- | --------------------------- | ------------------------------------ |
| `/healthz`         | HTTP 200                | HTTP 200                    | 只证明依赖就绪，不证明内容和版本一致 |
| `/cms/server/ping` | `pong`                  | `pong`                      | 两个独立 CMS 都在线                  |
| `/version`         | 站内 404                | 返回 `2f60c4f` Release 身份 | 正式站未运行同一可追溯 Release       |
| 首页 FAQ           | 只有区块标题，没有问题  | 8 条问题存在                | 正式站查询得到空内容                 |
| 关于页、案例页 FAQ | 只有区块标题，没有问题  | 代表性问题存在              | 不是单一路由组件故障                 |
| 新闻封面选择器     | 不可用                  | 上传成功但选择/回显不可靠   | 验收 CMS 字段处于半迁移状态          |
| 新闻详情 slug      | 本次未读取正式 CMS 数据 | 一条发布记录末尾含空格      | 已复现列表有链接但正常 URL 被重定向  |

当前源码查询条件为：

- 集合：`faqs`
- 页面关系：`faq_page.key = 页面 key`
- 状态：`status = published`
- 排序：`sort`
- 返回字段：`id`、`sort`、`question`、`answer`

CMS 成功返回空数组时，页面按现行产品规则保持为空；只有网络失败、超时或 HTTP 5xx 才使用审核源码回退。因此 `/healthz` 正常与 FAQ 为空可以同时发生。

## 部署侧检查清单

### P0：确认正式站实际 Release 与 Nginx 上游

1. 确认 `56xyy.com` 当前 Nginx 配置、静态资源目录、SSR `proxy_pass`、PM2 进程和 Release 软链。
2. 确认正式站 Web 进程实际工作目录及 Git SHA，不要根据仓库 HEAD 或上传目录推断。
3. 检查正式站为什么没有可用的 `/version`；当前发布契约要求该端点返回完整 Release 身份。
4. 核对正式站运行环境中的 `DIRECTUS_URL` 是否指向正式站 CMS，而不是验收 CMS、本机地址或遗留实例。
5. 核对 `DIRECTUS_CONTENT_TOKEN` 与 `DIRECTUS_CONTACT_TOKEN` 均存在且不同；不得输出或转发真实 Token。
6. 在没有完整发布授权前不要直接把验收站 Nginx、`.env` 或数据库复制到正式站。

预期结果：正式站最终 `/version` 返回获批生产 Release 的完整 Git SHA、Release ID、`environment=production` 和 CMS Schema 版本。

### P0：核对正式 CMS 的 FAQ 内容和关系

使用管理身份执行只读检查，禁止先运行 Apply：

```bash
npm run cms:verify
npm run cms:migrate-contract
```

重点确认：

1. `faq_pages` 应有17个页面记录，`key` 唯一。
2. 审核基线共有100条 `faqs`；正式 CMS 应核对缺失、草稿和归档数量，不能只看集合存在。
3. 每条有效 FAQ 的 `status` 必须为 `published`。
4. 每条 FAQ 的 `faq_page` 必须非空，并关联到正确的 `faq_pages.key`。
5. `content_key` 必须非空且唯一；`page_key` 仅用于旧数据核对，不能代替 `faq_page` 关系。
6. 对 `home`、`about`、`cases` 至少各执行一次与网站相同条件的只读查询，确认能返回记录。
7. 使用网站运行内容令牌执行同样查询。如果管理员能看到记录而运行令牌返回空，应检查 `faqs` 读取权限和 `faq_page → faq_pages.key` 关系字段的可见性。
8. 运行完整权限审计：

```bash
npm run cms:verify-runtime-permissions
```

判定分支：

- 管理员查询也为空：正式 CMS 未同步 FAQ 数据或发布状态。
- 管理员有数据、运行令牌返回空：运行权限或关系字段可见性问题。
- Directus 查询有数据、正式页面仍为空：正式 Web Release、`DIRECTUS_URL`、运行 Token 或进程环境未更新。
- 返回401/403或页面5xx：保留响应状态和服务器日志，交回开发侧定位；禁止用静态回退掩盖权限错误。

### P0：修正新闻 slug 并补强校验

验收站已确认以下行为：

- `/news/cheshi` 返回 HTTP 200；
- `/news/chehsi` 返回 HTTP 302，并最终落到 `/news`；
- `/news/chehsi%20` 返回 HTTP 200；
- 对应 CMS 发布记录的 slug 为 `chehsi `，末尾字符码为32。

处理顺序：

1. 在任何写入前导出全部 `news.id` 与 `slug`，对 `trim()` 后的值检查空值和重复。
2. 将记录 ID 5 的 slug 从 `chehsi ` 修正为 `chehsi`，并复查站内链接、canonical、sitemap 与详情页。
3. 开发侧补强 CMS 契约：所有情况下都检查 slug 首尾空格、非法字符和规范化后的重复，而不是只在唯一约束缺失时检查。
4. 为 Directus slug 字段增加可见校验提示，只允许约定的英文小写、数字和连字符格式。
5. 新闻详情不存在时应返回真实404或明确错误页，不应静默302回新闻列表；该行为需增加自动化测试。

当前问题可以通过修正验收 CMS 的错误 slug 立即恢复该文章，但只改数据不能防止再次发生，因此这一项需要后续代码修复。

### P1：迁移新闻封面字段

目标状态：

- `news.cover_image` 的 Directus 类型为 `uuid`；
- 编辑界面为 `file-image`；
- 字段标记包含文件关系；
- 关系目标为 `directus_files.id`；
- 既有文章封面迁移后仍可访问；
- 新建和编辑文章时可以上传或从文件库选择封面。

执行顺序：

1. 分别备份正式 CMS 与验收 CMS 的数据库和 `uploads` 附件目录，并验证备份可读取。
2. 只读导出现有 `news.id`、`slug`、`cover_image`，区分空值、本地静态路径、外部 URL 和已有文件 UUID。
3. 为旧路径文件建立明确映射：确认文件存在，导入 Directus 文件库，记录旧值到新 UUID 的对应关系。
4. 先在验收 CMS 迁移记录，再迁移字段和 `directus_files` 关系；不得直接删除旧值。
5. 验收全部文章列表、详情页、Open Graph 图片和后台文件选择器。
6. 完成验收、回滚验证和业务确认后，另行申请正式 CMS Apply 授权。
7. 正式 Apply 后运行 `npm run cms:verify`、权限审计和第二次 dry-run；第二次 dry-run 应为0项变更。

当前仓库只定义了目标模型和遗留兼容边界，没有获批的“一键把任意字符串路径转换为 Directus 文件”的通用迁移。若部署侧需要自动化迁移，应先提供两个 CMS 的只读字段快照和旧值分类，再由开发侧补充受控、幂等、可回滚的迁移脚本。

验收 CMS 当前只读快照：

- 数据库列：`character varying (varchar)`，允许为空；
- Directus 界面：`file-image`，`special=file`，`display=image`；
- Directus 关系：不存在 `news.cover_image → directus_files`；
- 两条已发布记录中，一条保存了 UUID 字符串，另一条封面为空。

这说明上传动作本身可把文件写入文件库，问题发生在文章字段的关系绑定和回显。迁移时不能只改界面配置，必须同时迁移物理列、关系元数据和历史值。

## 验收标准

完成处理后必须满足：

1. 正式站 `/version` 返回获批生产 Release，且 Git SHA 与发布单一致。
2. `/healthz` 为 HTTP 200。
3. 正式站首页显示8条 FAQ；关于页和案例页显示对应已发布 FAQ。
4. 至少抽查一个服务专题、新闻页和森林期刊 FAQ。
5. CMS 管理员查询与网站运行内容令牌查询结果一致。
6. `cms:verify` 为0 failure，`cms:verify-runtime-permissions` 通过。
7. 全部新闻 slug 无首尾空格、空值或规范化后重复；列表中的每个新闻链接均返回对应详情页，不发生静默302。
8. 新闻文章后台可以上传或选择封面；保存后重新进入编辑页仍能回显，已有封面在列表、详情和分享元数据中正常显示。
9. 桌面1440×900与移动430×932无控制台错误、断图或水平溢出。
10. 不得把管理员 Token 写入 Web `.env`、Git、日志、工单或本报告。

## 需要交回开发侧的证据

如果按以上步骤仍不能恢复，请提供以下脱敏信息：

- 正式站 `/version` 完整响应；
- PM2 应用工作目录和 Release ID；
- Nginx 对静态资源、`/cms/`、SSR 的上游路径；
- `cms:verify` 与 `cms:migrate-contract` dry-run 汇总；
- `faq_pages`、`faqs` 记录数量及 published/draft/archived 计数；
- `home` 关系查询使用管理员与运行令牌时的 HTTP 状态和返回条数；
- `news.cover_image` 的脱敏字段元数据、关系元数据和旧值类型统计；
- 全部新闻 slug 的 `trim()`、空值、非法字符和规范化重复检查结果；
- 对应时间段的应用错误日志，必须移除 Token、Cookie、密码和正文敏感信息。

不启动 FAQ 组件重写，也不改变“成功空数据不回退”的既定内容语义。新闻 slug 校验与不存在文章的响应行为属于已确认的代码加固项，应与 CMS 数据修正分开实施和验收。
