# XYY-20261004-03 技术债分批实施合同

用户提供的 A–H 方案为范围来源。目标为本地可验收候选及验收站准备；推送、部署、真实 CMS/权限/数据库/接收端写入尚无本轮准确动作授权。正式站仅交接核对清单，不操作 Oracle。

## 基线与协作

- 主工作区 `/home/yj/XYY-GEO/website`；已发布 HEAD `0ffe149df13148d6280b5230979eb0a3d0ea26cb`。
- 当前可编辑候选 `output/maintenance/xyy-20261004-03/editable/`，避免普通本地编辑反复触发工作区外权限；数据分区的早期候选及 `evidence` 保留。editable 的 `public` 链接到数据分区原媒体，含505个文件，不是空目录。
- 基线 `output/maintenance/xyy-20261004-03/baseline.json`、`baseline.diff`、`baseline-status.txt`；79 个原有脏路径保留，非媒体另存副本，媒体原文件原位保留并记录 SHA256。禁止纳入现有未提交动效与未跟踪媒体。
- 所有子任务沿用总 ID 加批次后缀（A–H）。Terra 实施→Luna 独立验证→Nova Review→Sol 验收；失败沿原 ID 返工。子代理不得再委派。
- 实施阶段只在候选修改业务和测试。R4完整门禁、Luna既有动效组合验收及Nova最终清单Review通过后，Sol按冻结113文件清单和逐路径preimage校验，以普通git apply合入主工作区并运行verify；不改HEAD/index、不覆盖原79条脏路径，也不提交或部署。主工作区状态/合同由Sol维护。Terra/Luna/Nova 各自仅追加自己的日志，互不覆盖。并行任务不得回退他人改动。
- 公共数字/审核状态不变；PDF/视频字节及 URL 不变；CMS 成功空即空，401/403/契约错误不回退。

## 分批所有权、AC 与证据

### A / LOW / Sol

隔离候选、原有差异和素材清单、当前债务索引及历史关闭标识。AC：原脏文件哈希保持，候选来源可追溯，所有批次状态与完成条件明确。文档 diff/格式验证即可。

### B / HIGH / Terra

所有权：`scripts/deploy.sh`、新增容量/版本保留/媒体清单工具及其 `scripts/lib` 模块、`playwright*.config.ts`、`package.json` 的对应命令、对应测试与操作文档。不改业务源码、媒体、依赖版本、远端环境或执行删除。

AC：文件系统设备 ID 合并容量；本地 3 GiB/远端 2 GiB 底线与峰值×1.25 取高、inode 不足明确阻止构建/上传/安装；缺测量时显式要求受监控基线；测试输出路径可配置。清理默认预览、保留 5 版并额外保护 current/回退/固定版，拒绝路径越界和符号链接绕过，实际删除须精确清单；媒体清单含大小/引用/SHA256/Git归属且不改媒体。证据：相关单测、shell/配置检查、预检实际结果、媒体清单。

### C / HIGH / Terra

所有权：`server.mjs`、`server/` IP模块、`src/pages/api/contact.ts`、`src/lib/contact/rate-limit.ts`、内部上下文类型、补丁校验工具/相关 npm 命令、对应测试和代理运维文档。排除限流策略改写、Redis、真实 Token/配置写入。

AC：明确 CIDR、默认不信任头；socket 向右至左 XFF，IPv4/IPv6规范化，不单信 X-Real-IP；2048字节/16跳，非法配置阻止启动、受用畸形链通用400；Express/Astro同一结果通过内部 locals，实际构建链路证明第6次429及不同访客隔离。补丁完整性/实际解析/行为与 audit 分开。历史Token只核对可用撤销证据，无证据标缺口。

### D / MEDIUM / Terra

所有权：服务 slug 配置模块、对应 Astro fallback、服务/FAQ seed 生成器、纯转发 CSS 与对应测试。保留独有模块与用户动效。AC：正文/数字/路由/SEO/审核快照等价，生成 seed 无漂移；CSS 原序及资源地址/条件等价；360/390/768/1440 桌面移动验证，合并原动效后另验。证据：前后内容/DOM/CSS顺序快照、生成差异、浏览器检查。

### E / HIGH / Terra

所有权：CMS定义/setup/seed/验证/显式迁移工具、FAQ模型和版本声明、对应测试。只写本地代码，不运行真实迁移。AC：5 legacy缺失不新建、存在仍查历史结构/运行令牌无权；faq_page非空必填/RESTRICT，page_key可空只读，正常流程不依赖或回写；孤儿输出manual_mapping_required不猜测；迁移幂等。候选版本2026-10-cms-maintenance，真实结构验证未通过不得发布此声明。

### F / MEDIUM / Terra

所有权：白皮书3–5正文JSON、14期235条核查台账及原稿定位证据、必要的提取辅助工具；来源整理文档（仅从现有claims记录归纳）。排除原PDF/视频/图像修改、数字/审核状态改变、编造OCR、其他批次源码。

AC：PDF哈希不变；逐页检查3–5原稿，恢复可读正文，无法辨认保留明确缺口与partial提示；235项逐条具有原条目、页/坐标、处理状态及依据，不把自动提取等同人工验证；Luna独立原稿核对阅读顺序/数字/图表。证据：原稿hash、定位台账、渲染和独立核对；原稿不可读单项阻塞。

### G / HIGH / Terra

所有权：英文新闻schema迁移/权限配置与凭据校验工具、批量API对应测试及受控验收工具/文档。AC：英文分组5字段、默认draft、迁移二次零变更；两新Token与内容Token独立且各>=32字节，仅news:create；不扩大权限满足返回契约；中英发布/撤下/定时及鉴权/超限/重复/创建符合原契约；精确slug回读/ID清理覆盖异常。隔离模拟与真实CMS明确分开。

### H / HIGH / Sol 协调 Luna/Nova

综合相关单测/verify/verify:release、桌面移动键盘/减少动效/资源缓存/英文询盘、同环境Lighthouse三次和中位数、真实设备交接；验收站成对备份/加密异机/隔离恢复、清单和回退包。缺外部授权/备份目标/设备回执即对应BLOCKED，不阻止独立本地批次。提交前verify、部署前verify:release不可免；不自动提交或发布。

## 当前状态

本地修复已验收。原113个审核候选文件已普通git apply合入主工作区，preimage/postimage、Git模式、原79条脏路径和HEAD/index核对通过。主工作区首次verify发现1条已有缓存测试用调用开始后的100ms预算判断TTL，721/722失败；Luna仅修测试为固定Date、精确零TTL、finally恢复，Nova独立定向和正TTL1000ms反例通过。此测试作为第114个文件独立补丁交付，不重写原113冻结manifest/patch/archive；最终清单`output/maintenance/xyy-20261004-03/final-local-manifest.json`。没有提交、推送、部署或真实CMS/数据库/权限/接收端写入。

B/C/D/E/G本地代码、独立QA及Review通过；D与5个原有动效文件的118项冻结一致，18目标×4宽度×2模式144组有效PASS。合入后main verify R2 exit0：637类型文件0错误/0警告/4提示、722单测、lint/维护/assets/补丁检查和build通过。原R1失败记录保留。候选R4完整verify:release exit0为722单测、269 E2E/9显式跳过、4 formal和build；该完整门禁与合入后的verify分别记录，不称主工作区重跑了verify:release。

同一组合production build的Lighthouse 3页面各3次全部有效，性能中位数首页80、产品81、后整服务90；SEO均69源于本地noindex响应头，不推断线上分数。Luna/Nova D/H通过；四宽度矩阵为offline dev，真机/完整视频播放/真实CMS/收单不在该证据覆盖内。R4完整峰值755077120bytes/6848inodes，已同设备复用到主工作区默认容量基线并记录来源；main verify R2的9867264bytes/339inodes是已有构建产物下的增量测量，不能替代完整峰值。

F R3修正8项原稿复核问题，235条台账可追溯：44条部分正文恢复、190条原稿观察、1条明确字符缺口；第3–5期保留partial提示，Nova APPROVED_WITH_LIMITATION。原公开数字/审核状态、505媒体字节及URL保持。audit为0；干净生产安装两轮TLS证书失败，依赖安装仍非干净安装证明。

外部条件受阻：远端容量低于2GiB；成对备份/异机加密/隔离恢复未执行；E实际CMS结构未验，candidate_unverified阻止发布声明；G create-only返回ID契约未证实，保持未启用；历史Token撤销、真实代理入口隔离、真机和英文真实收单回执待完成。正式站和Oracle未操作。逐项证据与剩余条件见DEV_STATE及`xyy-20261004-03-external-acceptance.md`。

历史Playwright证据路径映射：原`output/playwright/<relative>`现位于`output/playwright-archive-xyy-20261004-03/<relative>`，7541项全量hash/类型核对不变；原位置已恢复为根盘真实活动目录，历史直接路径不再兼容。data只作归档，不再向其写入测试或安装产物。
