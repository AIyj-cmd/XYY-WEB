# 英文精选文章编辑交接

英文精选文章复用中文文章的 slug、封面和分类。中文可照常日常发布；英文只作为经人工审核的补充版本，不会由网站自动翻译、生成或写回 CMS。

## 后台字段与发布顺序

在 `news` 记录的“英文精选版”分组填写：

- `title_en`：英文标题；
- `summary_en`：英文摘要；
- `content_en`：英文正文；
- `english_status`：默认 `draft`；
- `english_published_at`：英文发布时间。

英文公开必须同时满足：中文记录仍为 `published`、中文发布时间已到；英文状态为 `published`、英文发布时间已到；英文标题和摘要非空；英文正文经过网站清洗后仍有可见文字或图片。任一条件不满足时，英文列表、详情、hreflang 和 sitemap 都不会输出该文章。中文撤下或改为未来发布时间会同时撤下英文公开页。

建议工作流：先核对中文事实、数字和时效性，再完成英文人工译审；在后台编辑器中以 `draft` 核对文案、正文链接和图片后，再设置英文发布时间与 `published`。网站没有英文草稿预览功能。中文事实变更时重新核对英文版；需要撤下时将任一版本状态改为草稿或归档。不要把未经核实的项目数字、政策描述或客户信息加入英文稿。

## 选题节奏

首批建议依次准备以下三个选题：

1. 中国鞋服仓配合作指南；
2. 退货质检与再上架流程；
3. 仓配项目启动资料清单。

每月根据中文事实更新、业务场景和可核验证据筛选英文精选稿，不强制篇数。本轮没有代写、翻译或发布这三篇文章，也没有发布任何英文内容。

## 历史内容与上线

旧文章没有英文栏位时保持中文页面、中文列表和 sitemap 的既有行为；它们只是不出现在 `/en/news`。英文分类由网站按既有中文分类本地化，不需重复维护分类字段。

本地 schema 定义包含定向脚本 `scripts/migrate-english-news-schema.mjs`。它默认 dry-run，只打印拟创建的英文 group alias 与字段；真实 apply 还必须提供与 `DIRECTUS_URL` 相同的 `--target`、明确的 `--confirm-environment` 和相同的 `CONFIRM_ENGLISH_NEWS_SCHEMA` 标记，随后重新读取并要求零变更。当前任务没有执行该脚本，也没有进行任何 CMS、数据库或内容写入。

新闻批量写入仍未启用。标准 Directus 12.1.1 的纯 `news:create` 凭据可能在创建后返回 204 空响应，无法满足现有 `data[].id` 接口契约；网站会返回 502，但记录可能已创建。不得为规避该限制增加 writer 的 read/update/delete 权限或改用高权限 token。只有完成数据库与附件配对备份、隔离恢复、精确目标授权，并证明目标平台可保持现有返回契约后，才可用 `scripts/verify-news-permissions.mjs --target=<target>` 预览所需最小权限，并按任务唯一 slug 回读、精确 ID 清理和二次回读零残留。

未来获得准确授权后，按以下顺序上线：

1. 对明确目标 CMS 执行定向 dry-run 并审阅计划；
2. 获得授权后仅 apply 英文 group alias 与五个英文内容字段，共六项 schema 变更；
3. 确认网站运行时可读取新增字段；不得在此步骤自行修改权限；
4. 运行 `npm run verify:release`，取得目标环境部署授权后再部署；
5. 验收线上公开、语言配对和撤下行为。

语言配对只在两个可访问版本都存在时输出；遵循 [Google 的 localized versions 指引](https://developers.google.com/search/docs/specialty/international/localized-versions)。后台分组采用 Directus 的 `group-detail` alias 约定（[Directus group interface](https://raw.githubusercontent.com/directus/directus/main/app/src/interfaces/group-detail/index.ts)）；初始化时会先创建 group alias，再创建归组字段。

`verify-news-permissions.mjs` 默认只输出本地最小权限预览；只有显式 `--check` 才用写入凭据只读请求 `/permissions/me`，并验证实际有效权限及可创建字段。预览不构成平台权限证明，缺少凭据、非 2xx 或任一额外权限都会失败且不输出 token。
