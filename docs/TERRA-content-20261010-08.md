# XYY-20261010-08 — 内容包实现记录

风险 MEDIUM；本地实现与自测完成，待 Luna 独立验证、Nova Review 和 Sol 验收。基线 HEAD 为 `31395e15ae24d14899367e5e2ba69e7187762a97`；开始时已有 `DEV_STATE.md`、`docs/SOL.md` 和任务合同差异，完整保留。仅操作本任务内容包所有权文件。

## 已完成

- `scripts/generate-cms-content-seeds.mjs` 合并 `CASE_DETAILS` 时写入 `img: detail.image`，再由生成器更新 `scripts/data/approved-cms-page-seeds.mjs`。六条初始案例均使用已存在的 `/images/cases/{slug}.webp`。
- 生成器支持只读 `--check`：先计算格式化目标文本，再与现有文件比较；不一致或文件不可读时非零退出，不写入文件。未知参数和重复参数明确拒绝。无参数手动生成行为保持。
- 与 HEAD 生成模块逐导出、逐记录、逐字段比较，仅六个案例的 `img` 值变化；所有其他字段、字段顺序、记录顺序和其他导出保持。没有改变任何真实 CMS 记录。
- `src/i18n/case-sources.ts` 新增六条固定 `INITIAL_CASE_SOURCE_DIGESTS`，绑定 `getCases()` 内部 `resolveCases` 规范化后的中文源。前五条与现有 published 摘要相同；茵曼摘要为 `e00dc690b70f5ba7390dff1c17474de0b9179ec564c3291bfd32fa81d055ea2c`。运行时不导入种子或从种子动态生成允许摘要；现有 published 常量逐字保持。
- `src/i18n/cases.ts` 在已有 fallback/published 审核匹配之外接受精确 initial 匹配；未知身份和实质内容变更继续拒绝。图片、CMS `image_file` 和配色继续由真实记录决定，不属于中文内容摘要。

## 茵曼英文复用核对

初始中文描述与 fallback 描述、名称、品类、两项统计一致。初始标签为“全渠道一盘货”“线上线下融合”，与既有英文描述中的 established online and offline operations、shared inventory view、coordinated fulfilment across sales channels 语义一致。两项中文统计“全渠道统一管理”“多平台同步发货”使用既有审核 claims 的 All-channel unified management、Synchronized multi-platform dispatch。保留 `ENGLISH_CASE_COPY.inman` 和 claims 原文，无新增英文事实或数值。差异来自标签表达，而非新增业务事实。

## 本次证据

- TDD 红灯：`npx vitest run tests/unit/cms-initial-case-content.test.ts` 初次 15 项中 3 失败、12 通过；失败精确对应旧 Unsplash 图片、茵曼英文缺失，以及 CMS 资产覆盖场景中的茵曼缺失。
- 首轮绿灯：`npx vitest run tests/unit/cms-initial-case-content.test.ts tests/unit/english-cases.test.ts tests/unit/english-cases-published.test.ts tests/unit/english-case-claims.test.ts tests/unit/directus.test.ts`，5 文件、37 项通过。新增 15 项覆盖六张本地图、真实转换后的 home/cases/llms 六条英文、十类受保护字段在全部六案例上的变更拒绝、CMS 资产/配色保留、现有 published 六摘要和翻译保持、重复生成内容一致。
- Sol 预审返工：将最后一项重复验证改为连续两次 `--check`，检查文本和 mtime 均保持；新增隔离进程虚拟差异、未知参数、重复参数三项，在导入生成器前禁止所有 `writeFileSync` 调用，均按预期失败且无写入尝试。`npx vitest run tests/unit/cms-initial-case-content.test.ts` 最终 18 项通过；本次只跑该测试和目标格式/Lint，没有再次运行完整测试组。
- 首轮目标五个代码文件以及返工生成器/测试的 ESLint、Prettier check 和 scoped `git diff --check` 通过。最终生成器、摘要文件、适配器、新测试分别 172、68、117、197 行，均低于对应维护性预算。
- 本地 Node 基线比较断言通过：生成模块仅 `ur.img`、`maxrieny.img`、`xingmian.img`、`meiyi.img`、`romi-studio.img`、`inman.img` 六值改变，其他字段和导出完全不变。

## 给独立验证的接口

从 `scripts/data/approved-cms-page-seeds.mjs` 读取 `APPROVED_UNIFIED_CASE_SEEDS`，增加合成 `id` 和 `status: 'published'`，通过 `__setDirectusRequesterForTests` 注入，随后调用 `getCases()` 再 `translateCases()`。不要直接翻译 raw seeds：`resolveCases` 会以 `case_description` 形成 `details`，以 `stats` 重组 `metrics`。验证结束需将 requester 重置为 `null`。HTTP mock 可将相同合成记录作为 `/items/cases` 的 `data`，由真实查询路径完成相同转换。

限制：自测仅离线源码与模拟 requester；没有浏览器显示验收、真实新服务器导入或真实 CMS/数据库验证，未联网、访问服务器、读取秘密、执行 seed/sync/部署、提交或删除。没有全量 build/verify；本轮独立测试、类型与维护性检查及 Review 由 Sol 统一协调。Directus 初始化工具的已有内容保护由另一个文件所有者实现，本内容包不负责外部写入。
