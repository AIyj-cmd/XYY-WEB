# XYY-20261001-06 — 移除报告与事件统计，保留咨询预选

Status: CLOSED（本地；Luna PASS、Nova APPROVED，Sol 验收完成）。Risk: MEDIUM。用户明确要求移除报告，并选择“报告和事件统计一起移除，只保留咨询预选”。授权仅限本地实现及验证。

## Scope 与基线

- 删除 Task04 新增的报告 CLI、HTML/CSV 生成模块、事件前端/接口/独立限流、启用开关、专属测试和七份合成 fixture；移除 UI 事件属性与中英文统计隐私段落。
- 保留 16 条服务详情的咨询入口、受控 `from`/`entry` 链接、SSR 服务预选、改选与语言切换。原 `/api/contact`、六字段接收契约、校验与联系限流不改。
- HEAD `7f903056233627c6e9b2007667b827b76a26d963`。工作区存在用户及先前任务修改；以 `output/removal/xyy-20261001-06/baseline-manifest.json`、`baseline-status.txt`、`baseline-diff.patch` 为本任务基线，不以 HEAD 回退整个文件。
- 原 Task04 计划与日志保留为历史证据，注明本任务取代其报告/统计范围。仅删除向用户交付的三个示例文件；历史 QA 日志和测试证据不清空。
- 不提交、推送、部署，不操作真实 CMS/数据库/线索、生产配置、依赖/锁文件、治理/config、其他动效与素材。保留现有 4322 本地开发服务和其他既有进程。

## 所有权与顺序

所有角色不独占仓库，必须保留他人修改；不得再委派。范围外文件需求返回 Sol。Terra 实现并冻结 → Luna 独立 QA → Nova Review → Sol 验收；返工沿用本 ID。

Terra 修改：

- `.env.example`、`package.json`：仅撤回本功能开关与报告命令。
- `src/layouts/Layout.astro`、`src/scripts/contact-page.ts`、`src/components/contact/ContactForm.astro`：仅移除事件接线，保留 SSR 预选、原提交与校验行为。
- `src/components/conversion/ContactLink.astro`、`src/lib/conversion/contact-source.ts`：移除事件专属属性/导出和因此不再使用的引用；保留链接/白名单/语言/预选 API，不做无关重命名。
- `src/pages/privacy.astro`、`src/components/en/EnglishPrivacy.astro`：撤回 Task04 新增的统计段落及其导致的日期变动，其余内容保持。
- `docs/CONTACT_CONVERSION.md`：改成当前保留的咨询来源与预选说明，不再提供报告/启用统计的操作方法。
- `tests/e2e/conversion-contact.spec.ts`、`tests/e2e/conversion-hero.spec.ts`、`tests/e2e/service-redesign-crossborder.spec.ts`、`tests/e2e/service-redesign-south.spec.ts`：用真实 href/可访问入口替换事件属性选择器；去掉统计正向断言，保留咨询成功/失败回归并验证点击、填写、成功提交均不发统计请求。截图路径改成本任务，避免覆写历史证据。
- `docs/TERRA.md` 只追加任务结果；本任务 `output/.../terra/` 自测证据。

Terra 精确删除：

- `scripts/report-conversions.mjs`、`scripts/lib/conversion-report.mjs`、`scripts/lib/conversion-report-input.mjs`。
- `src/pages/api/conversion-events.ts`、`src/scripts/conversion-events.ts`、`src/lib/conversion/events.ts`、`src/lib/conversion/rate-limit.ts`、`src/lib/conversion/runtime.ts`。
- `tests/unit/conversion-report.test.ts`、`tests/unit/conversion-events.test.ts`、`tests/e2e/conversion-events.spec.ts`。
- `tests/fixtures/conversion-events.jsonl`、`conversion-invalid.jsonl`、`conversion-conflict.jsonl`、`conversion-report-wuliu.jsonl`、`conversion-report-invalid-date.jsonl`、`conversion-report-property-order.jsonl`、`conversion-report-second-input.jsonl`。
- `output/conversion/xyy-20261001-04/example-report/` 下的 `conversion-report.html`、`conversion-report.csv`、`report-preview.png`。

Luna：仅在移交后拥有上述四份 E2E 的测试修正权、`docs/LUNA.md` 追加及本任务 `output/.../luna/`；不改实现。Nova：只读代码/证据，拥有 `docs/NOVA.md` 追加及 `output/.../nova/`。Sol：本合同、原 Task04 计划的历史标注、`DEV_STATE.md`、`docs/SOL.md` 及本任务其余基线/验收证据。

## Acceptance Criteria 与证据

1. 报告命令/实现/样例与事件实现/开关全部移除；应用中不存在统计脚本导入、事件发送、日志输出或事件专用 data 属性。旧事件端点在本地新构建不可用；旧启用环境变量也不能恢复功能。
2. 16 条服务详情保留唯一 hero/bottom/floating 入口及既有 body 入口，href 与原受控来源一致；无 JS 时仍可进入正确服务预选表单。直接访问、非法/重复来源不预选；语言切换保持合法来源；用户可以改选。
3. 中英文咨询成功/失败提示、字段校验及提交仍工作；三类动作无统计请求。测试仅 mock 联系端点，原联系 API 及服务端契约文件的基线 hash 保持。
4. 中英文联系页与隐私页在桌面 1440/移动 390 无新遮挡或横溢；已移除统计说明，不删除既有咨询隐私内容。截图实际审读。
5. 本次 `npm run verify` 通过，相关咨询/来源/语言 E2E 通过。使用本地 offline CMS 与 mock 接收；不因移除功能添加无意义的文件不存在测试。验证失败须保留命令/退出码并区分实现、测试、环境问题。
6. 独立 Luna PASS、Nova APPROVED；非所有权路径与角色日志历史无漂移；当前说明/状态与新范围一致。明确只在本地完成，未部署。

交接包含实际变更/删除清单、可重复命令、退出码、冻结 hash、截图及真实限制。已有图未索引新报告/统计模块，graphify `contact form source` 仅定位旧联系模块；范围以当前源码引用和本任务基线确认。

## 实施交接

- Terra 已完成 10 份实现/说明与 4 份 E2E 调整、21 项精确删除。局部 Prettier、ESLint、服务来源单测 4/4、类型检查 577 文件零诊断及 diff 检查通过；没有用自测替代独立 QA。
- Sol 保存 35 项实施/测试/删除冻结，1396 个保护路径无漂移；HEAD 保持。独立 QA 由 `luna_r5_recovery` 承担，实际继承主会话模型，不声称使用 GPT-5.6-luna；完整 verify 与新构建 E2E 后再交 Nova。

## 独立验证

- 首轮完整 verify 因华南 E2E 文件 226 行超 220 维护预算退出 1；沿同 ID 由 Terra 删除重复且未执行点击的统计监听，保留实际页面/FAQ/focus/无 JS 点击断言，文件收敛为 219 行。只有这一测试变动，r2 冻结其余 34 项保持。
- Luna r2 `npm run verify` session90360 exit0：577 类型文件零诊断、91 文件 589/589 单测、lint/746 文件维护预算/assets/build 通过。五份相关 E2E session14202 exit0，桌面1440与移动390合计66/66通过。
- 新构建4486、旧统计开关显式true下，补充探针session70594 exit0：旧端点GET/POST均404；16路无JS SSR、10组非法/重复来源、双语body链接/语言切换、四组校验/改选/mock成功及0统计请求均通过。首次探针缺少滚入动画区操作导致点击超时，仅修正临时测试脚本后通过，失败原件保留。
- 中英文联系/隐私8张图由Luna亲读，Sol复核其中4张；表单标题、首字段及服务预选可读，无新增横溢。中文隐私眉题与固定导航、移动隐私正文与悬浮按钮的既有重叠已记录，相关首屏结构与CSS未变，不扩大样式修复或宣称所有内容绝无遮挡。
- 证据目录 `output/removal/xyy-20261001-06/luna/`，r2冻结 `implementation-freeze-r2.json`；1396保护路径和原联系API/lib文件hash保持。独立QA后交Nova与Sol验收，无提交、推送、部署或真实外部写入。

## 最终验收

- Luna 正式 PASS，Nova `nova/review.md` APPROVED。Sol 确认 AC 达成：报告与事件统计已移除，原咨询来源/预选/改选/语言和提交契约保留；范围外修改、原角色日志历史均保留。
- 最终验证为本次 589 单测、66 浏览器回归及补充探针通过，不引用旧任务测试代替当前证据。初轮维护预算和临时探针操作问题已有修正/复测，无当前范围内阻塞。
- 用户开发地址仍为 `http://127.0.0.1:4322/`，旧会话结束后已由 Sol 恢复为会话76156；五项HTTP/来源预选检查通过。没有提交、推送、部署或真实CMS/数据库/线索写入；仅本地Chromium模拟与offline/mock依赖，既有隐私页视觉限制保持。
- 收尾仅状态/日志、格式和冻结/范围核对，不重复已绿应用测试。最终清单与验收为同证据目录 `task-delta-final.json`、`sol-final-acceptance.json`。
- 本次4486验证预览由Luna关闭，自有会话4736 Ctrl-C结束exit130，端口已无监听；用户4322开发服务继续运行，未操作其他进程。
