# 手机咨询优化合同

Task ID：`XYY-20261015-05`；风险 MEDIUM；用户已授权四项优化方案第三阶段。实施在资源加载阶段验收后开始，当前仅记录准确范围。

## 范围与分工

- Sol 在开工时冻结新的 HEAD/status/diff/hash 基线，保留此前各阶段和用户修改；负责本合同、`DEV_STATE.md`、`docs/SOL.md`。
- Terra 候选所有权：`src/components/contact/ContactForm.astro`、`ContactIdentityFields.astro`、`src/styles/contact-enquiry.css`、`src/scripts/contact-page.ts`；新增仅供 SSR 的 `src/lib/contact/service-context.ts` 和必要的 `src/scripts/contact-form-validation.ts`；必要时从 `src/i18n/digital-operations.ts` 提取既有数字化服务双语短名称并接回 `src/pages/wuliu-shuzihua.astro`，不改变可见名称。`docs/TERRA.md` 与 ignored 实现证据。
- Luna：独立验证，可新增 `tests/unit/contact-service-context.test.ts`、`tests/unit/contact-form-validation.test.ts`、`tests/e2e/contact-mobile.spec.ts` 并适配实际受影响的现有表单测试；具体已有测试修改需先列清单交 Sol。`docs/LUNA.md` 及 ignored 测试证据。
- 已知受影响测试为 `tests/e2e/english-acceptance-contact.spec.ts`：填写英文选填电话前须展开分组，其余原断言保持。开始实施前记录中英手机基线截图和同一填写任务的滚动/耗时；只将同条件比较用于本地表单操作评价。
- Nova：只读最终 Review，`docs/NOVA.md` 及 ignored 审阅证据；不改实现。
- 各角色不再委派，不回退他人修改；实施 → 独立测试 → 审阅 → Sol 验收顺序执行。

## 实现边界

1. 从已有白名单来源取得具体服务，SSR 显示当前联系页语言的服务短名称。优先复用现有中英 breadcrumb 数据和路由映射，不将整套服务内容引入客户端共享模块，不重构现有 20 项来源白名单。
2. 保留默认服务预选、案例语境和已有参数冲突处理；用户手选服务不被覆盖。无效、重复、未知或含原型属性名称的参数不回显为服务文案。合法 from 与合法 finder 指向不同服务时，来源短名称不显示、select 不预选；案例语境独立保留。新 helper 应与预选共用同一组合解析结果，不单独凭合法 sourcePath 回显名称。
3. 姓名与当前语言主要联系方式放首层；公司和备用联系方式放原生 `details/summary` 选填分组。中文电话必填、邮箱选填；英文邮箱必填、电话选填。字段名、长度、自动填充、原有隐私同意和 API payload 保持。
4. 客户端复用现有校验规则定位错误，先展开对应分组再聚焦字段，错误摘要可访问；服务端未给出字段信息时聚焦摘要，不靠中文错误文案猜测字段。失败保留填写值、选择和勾选，只有成功才重置。
   现有 fetch 没有请求超时。增加明确的 15 秒超时并在结束时清理定时器、恢复提交状态；超时后字段保留且能够重试。复测必须触发实际超时分支，不能用一般网络错误代替。
5. 表单仍为主要咨询入口；不改电话/微信优先级，不恢复已删除的服务 finder 或转化报表，不改变真实咨询接口、服务端校验、存储、反滥用或 CMS 契约。

## 验收

- 20 个白名单路由的短名称、语言及所属类别准确；当前联系页与来源语言不同也使用当前页面语言。非法/重复来源、无来源、案例语境和现有参数冲突均有行为覆盖。
- 中文电话/英文邮箱等必填保持；公司和备用联系方式仅收起显示，可键盘、触摸和无 JS 展开。首层输入/select/textarea 从 6 项变为 4 项，不包含 honeypot 与 checkbox 计数。
- 中文无效选填邮箱、英文无效选填电话能展开分组并聚焦；提交失败、模拟超时、400/503 保留数据，成功才 reset。全部提交只到本地 mock，绝不发真实咨询。
- 中英 360/390/430px 与桌面代表视口无横溢、关键控件遮挡或焦点陷阱；截图和实际填写任务保留，正文默认可见及现有服务跳转保持。
- 定向单测/E2E、类型、Lint、维护预算、格式与构建通过，Luna PASS、Nova APPROVED、Sol 验收。不将本地填写耗时推导为真实转化率变化。

证据目录 `output/optimization/xyy-20261015-05/`。不提交、推送、部署、修改环境文件或操作真实 CMS/数据库；当前本地预览不停止。

## 只读基线

- 现有 4321 预览中，中英 360/390/430 与桌面 1440 共八组合均为 6 个可见业务字段（不含 honeypot/checkbox），横向溢出 0；390 中英表单区域截图已保存。未修改页面或提交咨询。
- 自动填写至提交前的中文/英文记录分别为 34/49 个 scroll 事件、20135/13733ms；这是自动工具执行口径，不能等同用户手势次数、人工完成时间或转化率。后续仅用相同脚本作操作参考，以字段数、布局及错误恢复作为主要验收。
- CLI 日志中观察到 37 条 loopback 请求、无写请求；联系接口被 mock。该日志不是完整 CDP 网络流量审计，未据此宣称全部网络请求已被主动隔离。基线 `output/optimization/xyy-20261015-05/luna/baseline/`，实现尚未开始。

## 开工前审阅补充

- 合法来源与非法 finder 仍按合法来源预选；仅 finder 合法时可预选但不伪造来源短名称。组合冲突只取消来源短名称/预选，既有 finder 提纲与案例上下文独立保留。
- `novalidate` 表单必须由客户端覆盖姓名、语言主联系方式、需求描述、隐私和已填备用联系方式校验。helper 返回稳定字段标识；API 无字段信息时聚焦带 `tabindex=-1` 的摘要。
- Luna 所有权增补 `tests/e2e/contracts.spec.ts` 中最后一项 contact form API validation 测试：新客户端校验会先拦截 abc 电话，应以合法输入和本地 mock 400 验证 API 错误摘要与焦点，其他契约测试及阶段一改动逐字保留；新客户端拦截另有定向覆盖。
- 每次提交新建 controller，超时覆盖 fetch 与 body 解析；finally 清理 timer/disabled/aria-busy。成功 reset 的 service 恢复 SSR 初始预选是原生语义，不额外清空来源上下文；失败逐项保留六字段与隐私。

Luna 测试所有权允许按维护预算拆分为 `tests/e2e/helpers/contact-mobile.ts`（本地 mock、填写和保值断言）及 `tests/e2e/contact-mobile-recovery.spec.ts`（失败、超时、重试），不新增产品逻辑；其他新增测试 helper 仍先报 Sol。
