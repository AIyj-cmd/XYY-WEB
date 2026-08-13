# 验收站 CMS 升级与 Oracle 19c 后续交接清单

更新时间：2026-08-13

## 结论

本地代码已补齐 CMS 聚合维护、中文后台、内容回退和健康检查。本轮目标环境是
`wz.tomatopia.top`，数据库保持 PostgreSQL 16；Oracle 19c 迁移不在本轮执行。

此前浏览器审计确认的问题包括：

- 验收站旧内容模型只有部分业务集合；
- `cases`、`news`、`faqs`、`contact_leads` 尚不存在；
- Directus 文件库缺少完整的业务素材；
- `/cases` 的 78 个合作品牌 Logo 返回 404；
- `/about` 的发展历程图片和公司介绍封面返回 404；
- 临时 IP 使用域名不匹配证书，并返回 `X-Robots-Tag: noindex,nofollow`；
- CSP 仍包含旧内网地址 `http://192.168.10.45`；
- 后台未出现新闻、案例和咨询线索发布区，原因是对应集合没有初始化，而不是前端隐藏。

## 已在代码中完成

1. Directus 初始化定义从 3 个扩展为 19 个集合，新增 FAQ 页面聚合、首页数据聚合、案例详情、期刊、服务页内容、
   关于我们内容与站点设置等结构化集合；完整清单以 `CMS_COLLECTION_DEFINITIONS` 为准。
2. 新建环境的 `news.cover_image` 建立到 `directus_files` 的文件关系；验收站旧字段仍是字符串路径，升级时保留旧值与兼容读取，不强制转换列型。需要上传式封面时应新增 UUID 文件字段并完成数据迁移。
3. CMS 初始化改为幂等补齐：已有记录不会重复写入，6 个审核案例及 17 个页面的
   100 条审核 FAQ 会在缺失时补种。
4. 初始化过程除“已存在”冲突外全部失败关闭；字段或关系创建失败时脚本会退出，不再打印虚假成功。
5. `/healthz` 除 Directus ping 外会检查18个公开内容集合是否可读，并确认独立联系令牌具备
   `contact_leads` 创建权限；它不再读取咨询记录。集合缺失或权限不足时返回503。
6. 新增 `npm run cms:verify`，供部署后使用管理级 Token 验证 19 个集合和文件库。
7. 合作品牌 Logo 与关于页发布素材已纳入 Git，静态资源门禁继续强制检查，干净检出不再
   依赖构建机手工恢复目录。
8. 已新增 GitHub CI、最小权限审计、附件备份/恢复脚本、单元测试和健康契约测试。

## 部署团队必须执行

### 1. 先备份 PostgreSQL 和 Directus

在应用服务器执行 PostgreSQL 自定义格式备份并验证目录：

```bash
sudo bash deploy/postgresql/install-backup-job.sh
sudo editor /etc/xyy/postgresql-backup.env
sudo systemctl start xyy-postgresql-backup.service
```

安装并执行附件备份；它独立于 PostgreSQL/Oracle：

```bash
sudo bash deploy/uploads/install-backup-job.sh
sudo editor /etc/xyy/uploads-backup.env
sudo systemctl start xyy-directus-uploads-backup.service
sudo /usr/local/sbin/xyy-restore-test-directus-uploads
sudo CONFIRM_BACKUP_JOB_ACTIVATION=YES bash deploy/uploads/install-backup-job.sh
```

还应备份 Directus 配置和应用服务器 `.env`。数据库与附件归档必须成对保存到加密异机，
不得在无可验证恢复点的情况下运行初始化。

### 2. 发布新代码，但先不要切正式流量

合作品牌 Logo、关于页素材和 `public/introduce-540p.mp4` 已作为发布输入由 Git 跟踪。
干净检出后必须先执行：

```bash
npm ci
npm run check:assets
npm run verify:release
```

`check:assets` 必须显示所有引用资源和部署资源均存在。禁止在资源检查失败时继续发布。

### 3. 初始化缺失的 Directus 集合

本步骤使用短期管理级 Token，仅用于建模和初始化，不要把它配置成网站长期运行 Token：

```bash
cd /path/to/website
export DIRECTUS_URL='http://127.0.0.1:8055'
export DIRECTUS_TOKEN='从密码管理器临时读取的管理级Token'
node scripts/setup-cms.mjs
npm run cms:verify
unset DIRECTUS_TOKEN
```

预期结果：19 个集合全部可访问，`cases` 至少有 6 条记录、`faqs` 有 100 条初始化记录；
`news` 和 `contact_leads` 首次为 0 条属于正常状态。脚本失败必须停止发布，不可手工忽略。

### 4. 配置最小权限运行 Token

网站运行时必须建立两套不同的 Directus Policy 和静态 Token：

- `DIRECTUS_CONTENT_TOKEN`：18个内容集合只读已发布内容，禁止写入，禁止读取
  `contact_leads` 和 Directus 用户、角色、权限、策略；
- `DIRECTUS_CONTACT_TOKEN`：仅允许创建 `contact_leads`，字段限定为官网表单实际提交字段，
  即姓名、电话、公司、邮箱、服务和留言；`source` 与 `status` 使用模型默认值。禁止读取、
  更新、删除、分享，禁止访问内容集合和系统集合。

把两枚不同 Token 写入服务器 Web `.env`，文件权限设为600。部署前先执行：

```bash
export DIRECTUS_URL='http://127.0.0.1:8055'
export DIRECTUS_CONTENT_TOKEN='从密码管理器读取'
export DIRECTUS_CONTACT_TOKEN='从密码管理器读取'
npm run cms:verify-runtime-permissions
unset DIRECTUS_CONTENT_TOKEN DIRECTUS_CONTACT_TOKEN
```

审计失败不得用管理令牌绕过。代码暂时兼容旧 `DIRECTUS_TOKEN` 以支持滚动升级，但完成拆分后
必须从 Web `.env` 删除共享令牌。

### 5. 配置后台角色

为编辑人员开放：

- 案例：新增、编辑、排序和发布；
- 新闻：新增、编辑、封面上传、富文本、分类和发布；
- FAQ：新增、编辑、排序和发布；页面标识与事实占位符按 `docs/CMS_CONTENT_MODEL.md` 执行；
- 案例详情、期刊、服务页、发展历程、荣誉与站点设置：按各自集合新增、编辑、排序和发布；
- 咨询线索：只读、修改跟进状态，不允许普通编辑删除；
- 文件库：仅允许访问官网新闻素材文件夹。

不要让日常编辑账号使用管理员角色。

### 6. 验证媒体持久化

确认 `UPLOADS_PATH` 使用持久磁盘或对象存储，并且发布新版本不会覆盖。
后台上传一张测试新闻封面，确认浏览器可以通过 `/cms/assets/{id}` 读取，再删除测试内容。

### 7. 正式域名和代理修复

这些属于部署配置，不在本地代码中直接修改：

- 为 `56xyy.com` 和 `www.56xyy.com` 安装有效证书；
- 正式环境移除 `X-Robots-Tag: noindex,nofollow`；
- 从 CSP 删除 `http://192.168.10.45`；
- 核对 `PUBLIC_SITE_URL=https://56xyy.com`；
- 核对 `PUBLIC_DIRECTUS_URL=https://56xyy.com/cms`；
- 临时 IP 只用于验收，不作为对外正式 URL。

## 上线验收

```bash
curl -fsS https://56xyy.com/healthz
curl -fsS https://56xyy.com/cms/server/ping
curl -I https://56xyy.com/favicon.svg
curl -I https://56xyy.com/logos/imgi_6_default.png
curl -I https://56xyy.com/about/history/2017.png
curl -I https://56xyy.com/introduce-poster.jpg
```

人工浏览器验收必须覆盖：

1. 首页 6 个案例均显示并可打开；
2. `/cases` Logo 墙无 404；
3. `/about` 视频封面、发展历程和荣誉弹窗均显示；
4. 后台新建并发布一篇带封面的新闻，前台 `/news` 和详情页立即出现；
5. 提交一条测试咨询，后台 `contact_leads` 出现记录，随后标记或删除测试数据；
6. 普通编辑不能读取系统凭据，也不能删除咨询线索；
7. 1440px、1366px 和移动端无新增控制台错误。

## 权限边界

本地开发方可以提交上述代码和文档；数据库备份、线上初始化、后续 Oracle 数据迁移、Directus 权限、
上传目录、证书、Nginx、CSP、正式域名与生产 Token 必须由部署团队执行和复核。
