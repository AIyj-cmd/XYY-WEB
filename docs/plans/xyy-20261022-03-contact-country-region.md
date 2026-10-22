# XYY-20261022-03 — 联系表单必填国家或地区与 Git 同步

- 风险：HIGH（联系接收契约及获授权的 GitHub main 写入）；流程 Terra → Luna → Nova → Sol。
- 授权：用户要求联系页面新增必填国家或地区，并同步 GitHub 与本地 Git 信息。仅本仓库 origin/main；无生产部署、真实询盘、CMS/数据库、权限或服务器配置授权。
- 基线：main / 3111bd37a76a80f73a5780c084d40017c2b434c8，11 个 Task02 既有脏路径，精确清单和哈希在 output/contact-country/xyy-20261022-03/sol/baseline.json；保留且将已验收 PDF 改动一并同步。

## Scope 与所有权

- Terra：联系表单组件、src/scripts/contact-*.ts 中直接相关客户端校验/错误文案/填写提纲限制、src/lib/contact/validation.ts 和 storage.ts，以及所有受影响联系单元/E2E 测试与必要 fixture（含 consultation-service-finder.spec.ts 原 1200 限制断言）；可新增 country 定向测试，src/pages/privacy.astro 和 src/components/en/EnglishPrivacy.astro 中必填信息列举文案（英文页面实际由组件渲染）、docs/TERRA.md。只改本需求，不改其他 API、安全策略或接收端仓库。
- Luna：独立验证及必要测试文件、docs/LUNA.md；不得改实现。Nova：独立 Review 与 docs/NOVA.md，不重写实现。Sol：本合同、DEV_STATE.md、docs/SOL.md、ignored 证据与授权 Git 同步。
- 接收端本地源码只读表明严格六字段及 message 最大 1200。网站内新增 countryOrRegion（80 字符以内、trim、非空、拒绝非字符串/超长/换行），在发送边界显式六字段投影，将国家或地区以标签写入 message，需求正文上限统一 1100，为备注保留空间，不截断用户输入。外部仓库和数据库不改。
- 排除：行业动态、原 SEO 报告、其他 UI、原 PDF/审校来源、生产 Nginx/HSTS/HTTP2、实际询盘/真实接收服务写入、发布、CMS/数据库及其历史 TODO。

## Acceptance Criteria

1. 中英文联系页默认展示空的国家或地区必填输入，有正确 label、required、autocomplete=country-name、最大 80 字符；桌面 1440 和手机 390 无横溢。
2. 客户端漏填阻止提交并聚焦该字段，服务端独立拒绝缺失、空白、非字符串、超长及换行；Unicode 国家或地区名称 trim 后保留。需求正文 1100 边界前后端一致，超长明确失败，不静默截断。
3. 有效提交的本地模拟接收 payload 仍只有原六字段；需求备注包含完整国家或地区和原需求且总长不超过 1200。失败保留字段，成功重置；原 consent、honeypot、rate limit、电话/邮箱、安全及六字段白名单语义保持。
4. 更新既有有效测试 fixture，保持原场景断言；新增有意义的客户端/API/集成边界回归。仅 loopback 与 mock，不提交真实询盘。独立目标单测、双语桌面/手机浏览器、fresh npm run verify、格式与 diff 检查 PASS，Nova APPROVED，原 Task02 核心与来源哈希保持。
5. 审阅精确提交范围和敏感信息后正常提交；使用 origin/main 普通快进，远端变化先核对，不 force 或绕过保护。标准 Git 不通可复用审阅后的 Git Database API 精确对象传输与 expected_sha / force=false。最终本地 HEAD、origin/main、GitHub main 一致、ahead/behind 0/0、工作区干净；CI 状态如实回读，部署状态不变。

## 输入、证据与交接

- 输入：用户本轮需求、既有联系模块、只读接收端 /home/yj/xiansuo/server/src/routes/website-leads.ts 的 schema；该源码不等于生产部署证据，英文接收电话契约的既有限制不在本轮修复。
- 证据：output/contact-country/xyy-20261022-03/{sol,terra,luna,nova}/；保存命令、退出码、测试摘要、截图、冻结哈希、Git 引用回读，不写凭据或真实用户资料。
- 实施完成返回精确文件、格式/定向自测、风险及冻结；依赖阶段顺序执行，禁止子委派。Sol 负责最终验收和 Git 写入。

## 状态

- Terra 已实施并冻结 23 路径；Sol 发现英文隐私旧列表的电话/邮箱必填描述与英文表单矛盾后，沿同 Task ID 最小修正文案及对应断言，新冻结后完成独立验证。
- Luna PASS：fresh verify workers=4 exit 0，769 类型文件 0 errors/0 warnings/6 hints，153 文件/1102 单测、Lint/933 维护预算/资源/cache/构建通过；联系目标 12 文件/111 单测、E2E 150 passed/4 条件 skip/0 failed，独立双语 1440/390 probe 20/20、0 外部请求/0 非预期 console/pageerror。首轮 workers=3 在既有 cms-initial-case-content 的 5 秒测试超时 exit 1，原日志保留；未改实现、超时或断言，完整复测通过。全量格式与 diff 检查通过，35 来源/5 PDF 核心/23 本任务冻结均无漂移。
- Sol 已视读中文手机和英文桌面截图，内存 mock 实测 80 字符国家或地区 + 1100 字符需求正文得到 1192 字符备注，精确六字段、完整保留、无真实请求。Nova APPROVED_FOR_AUTHORIZED_GITHUB_SYNC，34 路径范围、27 非文档/23 本任务/5 PDF 核心冻结及敏感信息/禁止产物审阅通过，Sol 验收 LOCAL_READY。授权应用 Git 同步已完成，提交 `a6e961ccbe8872e4dae7560ed776b3713fa599ee`。普通 push 60 秒超时 exit 124 原因未确证；另经 Nova APPROVE_SAFE_API_TRANSFER，以精确本地 tree/commit 与 expected_sha / force=false 快进 main。15:17:34 CST 三引用一致、0/0、工作区干净。其后仅三份状态文档独立提交同步，最终引用和 hosted CI 以 `sol/final-result.json` 实际回读为准；未部署或写入真实接收端/CMS/数据库。
