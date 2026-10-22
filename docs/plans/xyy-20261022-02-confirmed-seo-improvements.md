# XYY-20261022-02 — 已确认 SEO 问题的本地优化

- 风险：MEDIUM（PDF 下载制品与构建流程）。基线 HEAD `3111bd37a76a80f73a5780c084d40017c2b434c8`，工作区干净。
- 输入：用户要求优化上一轮核验中属实的部分；核验记录位于 `output/seo/xyy-20261022-01/`。
- Scope：为 14 期 PDF 下载制品补齐准确的标题、品牌署名和说明，修正工程名、错期名；字段来自既有白皮书 JSON。通过构建流程生成元数据优化版，保持公开 URL 与正文不变。
- 原始 PDF 是已审校内容的哈希来源，必须逐字节保留；不得批量替换审校哈希、OCR 记录或审阅台账以迁就新文件。构建产物不提交 Git。
- 排除：行业动态/news、页面内容和布局、CMS/数据库/权限、全站 HTML 缓存策略、生产 Nginx/HSTS/HTTP2、推送与部署、原 SEO 报告修改。HSTS/协议的真实线上变更需准确环境及动作授权；不修改历史 Nginx 模板冒充当前环境优化。

## 文件所有权与顺序

- Sol：本合同、`DEV_STATE.md`、`docs/SOL.md` 与任务验收证据。
- Terra：`astro.config.mjs`、`package.json`、`package-lock.json`；新增 `scripts/whitepapers/pdf-metadata.mjs`、`tests/unit/whitepaper-pdf-metadata.test.ts`；`docs/TERRA.md` 仅追加本任务记录。
- Luna：独立测试，仅可修改本任务测试文件并追加 `docs/LUNA.md`；证据写 `output/seo/xyy-20261022-02/luna/`。
- Nova：质量、范围、来源及构建契约 Review，默认不改实现；仅追加 `docs/NOVA.md` 与自身证据。
- Terra → Luna → Nova → Sol。失败或需增补所有权时返回 Sol，不再委派，不回退他人修改。

## Acceptance Criteria

1. 实际 Astro 构建在解析到的 client 输出目录生成全部 14 期 PDF，原 URL 保持；PDF Info 与存在的 XMP 标题、作者、说明一致，不残留错误工程名或错期标题。
2. 标题使用对应期数/原刊名称及既有内容标题，作者为新亦源供应链，说明使用对应 JSON description；不新增未经核验的日期、运营数字或营销承诺。
3. `public/senlinqikan/pdf/1–14.pdf`、白皮书 JSON、OCR 和审阅来源全部保持原哈希；每份生成 PDF 的页数、尺寸、正文提取与渲染均保持一致。独立验证以逐页低分辨率渲染哈希比较覆盖全部页面，另看代表页。
4. 生成确定、可重复，不联网，不写源目录；缺源文件、非法数据、源哈希不匹配或无效 PDF 必须使构建显式失败，不以原 PDF 静默回退。
5. 有针对性回归测试覆盖正确元数据、过时 XMP、源文件不变、确定性及明确失败。独立 Luna 验证构建集成与相关测试，Nova APPROVED 后 Sol 验收。
6. 只做本地修改与验证，不提交、推送、部署。没有页面布局变更，不强加页面重设计或无关浏览器检查；如为完整构建运行既有 verify，须用隔离 loopback 环境。

## 交接重点

- Node 构建可用依赖优先；如需 PDF 库，只添加必要依赖，不升级既有依赖树。
- 使用 `updateMetadata: false` 避免隐式当前时间；同步或移除冲突 XMP 后用标准工具回读验证。
- PDF 技能：`/home/yj/.codex/plugins/cache/openai-primary-runtime/pdf/26.1020.11127/skills/pdf/SKILL.md`。第一次 PDF 写出前运行其 artifact marker（edit、14 个 PDF），仅本地输出。
- 预期证据：精确 diff、源保护哈希、实际命令/退出码、14 期元数据与逐页等值结果、确定性、构建及 Review 结论。性能未测得提升时不宣称提速或排名收益。

## 本地验收结果

- 状态：LOCAL_READY；独立测试 PASS，Review APPROVED（local candidate），最终本地验收通过。
- `npm run verify` exit 0：768 类型文件无错误/警告、6 个既有提示，152 测试文件/1089 单测通过，维护预算、资源/cache 与构建通过。目标格式、Lint 与 diff 检查通过。
- 14/14 PDF 元数据正确，187/187 页尺寸、旋转、文本与 30dpi RGB 像素哈希等值；35/35 来源哈希保持，第二输出 14/14 PDF 字节一致。loopback PDF 下载 200、application/pdf、内容一致。
- 五个实现/依赖/测试文件与冻结哈希一致。已视读生成的第 14 期封面和第 10 页，无版面异常；未作 UI 改动，不增加无关桌面/移动布局测试。
- 初次 rename ENOENT 原因未确证；初轮预算失败与后续通过、verify 中间 `Terminated` 及最终 exit 0 均保留，不冒称全程无失败。
- 未提交、推送、部署，未操作真实 CMS/数据库/权限或生产 Nginx。行业动态、HTML 缓存及生产 HSTS/HTTP2 未变；生产资产更新及配置修改须另获明确授权，且不绕过既有发布门禁。
- 证据：`output/seo/xyy-20261022-02/sol/implementation-freeze.json`、`luna/final-summary.json`、`luna/npm-verify.log`、`luna/compare-first/comparison-result.json`、`nova/review.json`。
