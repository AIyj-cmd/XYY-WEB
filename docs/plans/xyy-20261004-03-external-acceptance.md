# XYY-20261004-03 外部验收与回退交接

状态：准备中，未执行部署、真实CMS/权限/数据库/询盘写入。本文不构成外部动作授权。

## 验收站备份与恢复前置条件

目标应用为 `https://wz.tomatopia.top`。正式站、Oracle、DNS/TLS/Nginx均不在执行范围。实际 CMS 主机、数据库名、附件根目录须由目标环境配置核实；不得从历史日志推断。

已有 `deploy/postgresql/backup-directus.sh` 和 `deploy/uploads/backup-directus-uploads.sh` 分别生成数据库/附件备份及SHA256；现有两套定时任务不证明成对一致，也不证明已经有异机加密副本。不得直接运行其保留期清理来腾空间。

1. 核对目标身份、磁盘/inode、数据库及附件估计峰值；给本批次唯一备份ID。选择管理员认可的短暂停写窗口或协调一致快照，记录两份备份共同的数据截止点与开始/结束时间。只停Web发布不足以阻止后台CMS写入。
2. 在该一致窗口制作数据库custom dump与附件归档，建立一个不含凭据的pair manifest，包含备份ID、目标环境、应用SHA、CMS版本、dump及附件文件名/字节/SHA256、附件数、时间窗口及一致性方式。不要把含客户资料的备份放入Git或公开目录。
3. 加密后传至独立主机/存储，记录加密算法、接收公钥指纹、对象标识和密文hash；私钥交付保管人，不入日志。异机回读校验及解密恢复都须成功；验收服务器自身的其他分区不算异机。本地开发机若与验收服务器为不同主机，可作为异机副本目标。
4. 在隔离数据库/附件目录恢复同一pair，阻断邮件/通知/外部webhook/生产接收端。记录退出码、实际版本、集合及记录计数、FAQ关系完整性、附件UUID到存储文件的完整映射与抽样资源读取。legacy集合允许缺失时不能沿用旧restore脚本中无条件查询5个legacy表的断言。
5. 演练应用/配置回退及精确内容恢复；核对当前、previous和固定保留版均可读。只有本次证据完成后，E/G才可请求对应真实CMS变更授权。

本地已只读确认存在 GPG、Docker、pg_dump、pg_restore 命令。早期考虑的开发机 data 分区已用于保存经校验的历史产物，目前约2.2GiB剩余且仅作归档，不再视为备份就绪目标。后续应使用有足够空间的独立加密存储；恢复方案为本机独立 Docker 网络中的一次性 PostgreSQL/Directus 容器（禁外发，只绑定本机回环端口），仍须先核对容量。尚未创建密钥、容器或备份，未连接数据库。

当前缺口：待核实验收数据库与附件大小、两主机身份、加密公钥及保管方案、Docker可运行性、协调一致窗口和本轮准确备份/恢复动作授权；无配对备份及实际恢复证据。用户已允许自主准备方案，尚不能声明恢复就绪。

## E/G 精确执行清单

| 动作 | 前置条件 | 必留证据与回收 |
| --- | --- | --- |
| FAQ维护迁移 | 同pair恢复成功；孤儿人工映射清单明确 | dry-run计划、精确记录ID、Schema前后、第二次零变更；不物理删旧集合/字段 |
| 英文新闻字段启用 | 类型/meta/default预检；备份恢复就绪 | 分组及5字段差异、draft默认、二次零变更 |
| 新闻凭据配置 | 两新Token与读取Token两两独立、均>=32字节 | 脱敏凭据指纹及唯一性；writer仅news:create；无法返回原接口契约即阻止，不扩大权限 |
| 新闻批量受控创建 | 唯一`xyy-20261004-03-`任务slug，未来发布时间 | 成功/失败/超时后均由测试管理员按slug回读，再按核验ID精确回收；留残留零证据 |
| 发布/撤下及中英文定时 | 另列限定条目和时间窗口 | 前后台实际状态、路由内容、回收及原值恢复 |
| 可信代理配置部署 | 确认socket对端CIDR、上游头重写、入口隔离 | 代码与配置成对发布/回退，直连伪造及可信链验证 |
| 验收站应用发布 | 本次Luna PASS、Nova APPROVED、verify:release PASS | 准确候选SHA/包hash、CMS真实结构版本、previous、健康/版本检查及回退包 |

### 批量接口返回契约的启用阻塞

本轮只读核对了 Directus v12.1.1 的官方 [items controller](https://raw.githubusercontent.com/directus/directus/v12.1.1/api/src/controllers/items.ts) 和 [respond middleware](https://raw.githubusercontent.com/directus/directus/v12.1.1/api/src/middleware/respond.ts)：创建后用同一 accountability 读取新记录；读取被拒绝时不生成 payload，最终返回204空响应。这是官方实现的代码证据，尚非验收站真实写入试验。

据此推断，标准v12.1.1的纯`news:create`凭据无法满足当前接口要求的`data[].id`返回值。现有应用会把空响应报告为502，但新闻可能已经创建（配置缺失则为503）。G已完成该场景的本地模拟验证及管理员按精确slug回读、核验ID后回收的工具；这些结果不证明真实平台已支持返回契约。在实际平台证明所需返回契约可用前，保持接口未启用。不通过增加read权限或更换高权限凭据规避约束。英文新闻字段启用可独立准备，不与批量写入口的可用性混为一项。

## 真实终端与接收端验收

- iOS Safari、Android Chrome、微信：记录实体设备/系统/浏览器版本，360/390等实际视口，键盘、聚焦、导航、服务页、PDF/视频、减少动效及中英咨询流程。桌面模拟结果单列，不替代真机证据。用户表示设备可用，配合信息待提供。
- 英文询盘：`xs.tomatopia.top` 写入和通知须单独核对授权。用唯一任务标记和约定测试资料；以前端响应、接收端记录ID和管理员回执三者对齐为完成，不把mock200当成已收单；若需回收，由接收端按准确ID处理。
- 资源条件请求：分别留应用直连/公共入口的ETag、Last-Modified、请求头、状态及字节hash。相同实体合法200如实记录；304仅在实际观察到时标记。
- 性能：在同一候选、同一环境、同一配置下保留3次Lighthouse原始JSON及中位数。不得混入线上与离线CMS数据后直接宣称性能提升。

## 正式站运维只读交接

只列核对项，不执行：实际应用版本及CMS结构版本；FAQ关系/发布状态与成功空结果；新闻封面真实字段类型；历史暴露Token撤销记录；可信代理头重写/入口隔离；资源条件请求；磁盘/inode及current/previous/pinned保留。发现差异另立准确范围与授权，不恢复Oracle迁移计划。

## 本轮验收站只读核对（2026-10-04）

- `/version` 仍为 `0ffe149df13148d6280b5230979eb0a3d0ea26cb`，release `20261004T044635Z-0ffe149`，CMS声明 `2026-08-cms-hardening`。未部署候选。
- SSH只读取验收站目录/文件元数据与指定Nginx转发设置，无CMS/数据库查询。可用空间 `1,032,204,288 bytes`（约984 MiB），inode可用1,343,339；空间低于2GiB底线，容量闸门当前BLOCKED。
- 25个发布目录均保持，current为上述release，previous为`20261002T102719Z-5beb6a2`；尚无`pinned-releases.txt`。按5版+current/previous计算的20项仅为只读建议清单，不是已审删除计划，也未执行删除。证据：`output/maintenance/xyy-20261004-03/remote-readonly-inventory.json`、`remote-retention-advisory.json`。
- 目标Nginx文件为`/etc/nginx/sites-enabled/wz-tomatopia`，Web upstream `127.0.0.1:50031`，XFF使用`$proxy_add_x_forwarded_for`，XFP重写为`$scheme`，XReal重写为`$remote_addr`；Web监听`0.0.0.0:50031`，防火墙入口隔离未验证。应用CIDR候选为`127.0.0.1/32`，不加入未证实的其他地址；代码与该配置需成对发布/回退。
- 服务器Node为v22.23.1；本地新CLI仍须兼容项目声明的最低Node版本。现有两类备份目录存在，但未读取备份内容，也未据此认定配对一致、可解密或可恢复。代理证据：`output/maintenance/xyy-20261004-03/remote-readonly-proxy-topology.json`。
- 对同一公开CMS图片分别请求公共入口及应用回环入口，普通GET、匹配ETag、匹配Last-Modified均为200，ETag和201,655字节的SHA256相同；304仍为NOT_OBSERVED。当前版本回读仍为0ffe149；这是既有验收站的只读证据，不代表本地候选已发布。原始请求头、响应头及hash：`output/maintenance/xyy-20261004-03/remote-resource-readonly.json`。
