# XYY-20260930-01 — 英文询盘入口

- 风险：HIGH（共享询盘接收契约的语言分支）；流程 Terra → Luna → Nova → Sol。
- 用户要求：英文联系页邮箱必填，电话选填且支持国际区号，改善海外客户被国内电话阻断的问题。
- 基线：HEAD `b50c4b3e85ecdf60e3cded498b5701d9d107e1c7`；已有治理、状态、日志、ServiceLanding/动效和素材改动全部保留。文件快照见 `output/contact/xyy-20260930-01/baseline.json`。

## Scope 与所有权

- Terra：`src/components/contact/ContactIdentityFields.astro`、`ContactForm.astro`、`ContactInfo.astro`，`src/lib/contact/validation.ts`、`client-copy.ts`，`src/scripts/contact-page.ts`，`src/pages/api/contact.ts`（如必要），`tests/unit/contact.test.ts`、`contact-integration.test.ts`、`contact-client-copy.test.ts`，`tests/e2e/english-acceptance-contact.spec.ts`，仅追加 `docs/TERRA.md`。
- Luna：独立验证，仅可修改上述测试文件、任务证据目录和追加 `docs/LUNA.md`；不得修改实现。桌面/移动浏览器验证使用 Playwright CLI；可运行既有 E2E。
- Nova：只读审查质量、安全、字段契约、中文回归、范围和证据，仅追加 `docs/NOVA.md`。
- Sol：本合同、`DEV_STATE.md`、`docs/SOL.md` 和任务证据；协调并最终验收。
- 子代理不能再委派；都不是独占工作区，不能回退他人修改。新增路径须先返回 Sol 扩展合同。

## Acceptance Criteria

1. `/en/contact` 邮箱有必填语义和标记，电话显示选填，可留空；说明国际电话需含 `+` 和国家/地区代码，接受空格、短横线、括号等常用显示格式。
2. 英文请求缺失/非法邮箱拒绝；合法邮箱且电话空可通过网站校验；合法国际号码可通过；明显错误或超出合理长度号码拒绝。姓名、需求、隐私同意仍必填。
3. 表单提交携带明确英文标识，网站 API 执行相同规则；无英文标识的中文请求保持现有电话必填及国内号码规则。
4. 发送给线索系统仍只含既有六个业务字段，不伪造电话号码或邮箱、不修改真实 CMS/数据库；下游失败保持明确失败，不能虚报成功。
5. 英文错误提示不再要求国内号码或只引导拨打 400；400 标注中国境内热线，海外入口指向当前询盘表单。不凭空增加业务邮箱、WhatsApp 或国际热线。
6. 桌面/移动字段、表单成功与失败（mock）、页面无横溢；中文对照正常。相关单测、既有英文询盘 E2E、类型、局部格式/lint 与预算通过。
7. 真实端到端可用性必须另外确认下游接收兼容，不以 mock 成功替代。当前只完成网站本地候选，不提交、推送或部署。

## 排除与已知依赖

- 排除全站电话入口、其他页面业务、CMS内容与契约、数据库操作/迁移、生产配置、外部写入、Git 提交/推送、任何部署。
- 只读发现 `/home/yj/xiansuo/server/src/routes/website-leads.ts` 接收 schema 强制国内电话，且用电话去重。网站单独更新不能使 email-only/国际电话真实保存成功；该仓库修改和任何发布均不在本次已授权范围。不得使用占位电话绕过。
- 源码证据只能说明本地契约，不能断言远端部署版本。后续需明确接收端兼容范围和授权。

## 证据与交接

- 实际命令及退出码、定向断言、发送 payload、桌面/移动截图、中文回归、原文件保护核对。
- 只使用本地隔离配置或浏览器/mock 拦截，不能提交真实客户线索。
- 实现者自测不代替独立 Luna；Luna PASS 后 Nova 审查。下游未兼容需明确标为待处理依赖，不能整体 CLOSED。
