# XYY-20261008-01 — 中文联系我们填写提纲文案

- 风险：LOW，静态文案替换；流程 Terra → Luna → Sol。
- 输入：用户截图及本次明确要求。截图/源码现有“退货情况”对应用户所述“退货渠道”。
- 基线：HEAD `f04bd1e0e7b0fb921f7031606dc417b92e033e5a`；目标脚本无既有 diff。既有脏文件及素材保持，基线记录 `output/contact-outline/xyy-20261008-01/baseline.json`。
- Scope：仅中文联系我们“插入填写提纲”的第四、第五项文案。
- 所有权：Terra 修改 `src/scripts/contact-enquiry.ts` 中 zh 两项并追加 `docs/TERRA.md`；Luna 仅写本任务本地验证产物及追加 `docs/LUNA.md`；Sol 管理本合同、追加 `docs/SOL.md` 及更新 `DEV_STATE.md`。
- 排除：英文文案、其他引导文案、插入逻辑/提交接口/样式/CMS/数据库/权限/提交/推送/部署。不新增持久测试以镜像静态文案。
- AC1：点击中文“插入填写提纲”，按原顺序出现“品类：”“SKU/订单规模：”“销售渠道：”“日均发货单量：”“B2B还是B2C模式：”，空文本插入后无旧第四、第五项。
- AC2：保留已有输入，重复点击不重复插入已存在字段，原提示及编辑能力保持。
- AC3：桌面和移动视口可读、按钮可用，无新增水平溢出；英文提纲与基线一致。
- AC4：diff 仅含两项 title/line 替换及任务记录；相关格式检查通过，HEAD 和既有范围外改动保持。
- 证据：本次命令/结果保存在 `output/contact-outline/xyy-20261008-01/`，浏览器截图及行为断言保存在 `output/playwright/xyy-20261008-01/`；无真实表单提交。无需全量构建或发布检查，因本次未授权提交/部署。
- 交接：子代理不再委派；不独占工作区，不回退其他修改；日志保留旧内容仅追加。依赖步骤顺序执行。

状态：本地验收完成（未提交、推送或部署）。

- Terra：目标脚本两行替换；目标 Prettier 与 diff 检查 exit 0。
- Luna：本地离线 Chromium 1440×900/390×844 五项顺序、保留输入、真实换行已有字段去重、英文不变与无横溢出 PASS。
- Sol：审阅实现精确 diff、两张视口截图及实际换行断言；HEAD 和范围外既有脏文件核对保持。最终 4598 端口关闭见 `preview-cleanup.json`，未实际终止其他进程。
- 限制：浏览器为本地 Chromium 视口模拟；未真实提交询盘或验证线上版本。本次按静态文案风险定向验证，没有提交/部署，不运行全量 verify/verify:release。

## R2 — 英文提纲同步（用户追加明确要求）

- 原中文验收结果保留；本轮用户指出英文未更新，英文文案纳入同一任务 Scope，覆盖前述英文排除项。
- 风险 LOW；仍按 Terra → Luna → Sol。Terra 仅修改 `src/scripts/contact-enquiry.ts` 的 en 第四/第五项 title/line 并追加 `docs/TERRA.md`；Luna 仅追加 `docs/LUNA.md` 和本任务浏览器产物；Sol 管理本合同、`DEV_STATE.md`、`docs/SOL.md`。
- 英文替换：`Returns scenario:` → `Average daily shipments:`；`Target timeline:` → `Business model (B2B or B2C):`。
- AC：英文点击后精确五项顺序，末两项为上述新英文、旧项消失；真实换行已有输入保留、重复点击不重复，包括带括号的新字段；1440/390 视口可读无水平溢出，中文五项保持。
- 基线为当前已有中文改动，保存在 `output/contact-outline/xyy-20261008-01/r2/`；浏览器证据 `output/playwright/xyy-20261008-01-r2/`。
- 复用用户正在使用的本地 `http://127.0.0.1:4322` 开发服务，验证后保持运行；不得停止现有服务。排除其他业务文案/样式/逻辑/API/CMS/数据库/提交/推送/部署，不新增持久测试。
- 状态：英文实施与独立复测完成，本地验收通过；未提交、推送或部署。
- 本次证据：Terra 目标 Prettier/diff 检查通过；Luna 英文 1440×900/390×844 顺序、旧项移除、已有真实换行括号字段保留/去重及中文回归 PASS。Sol 精确核对相对 R2 基线的两项英文替换，亲看两张截图；4322 提供最新英文与中文代码且保留运行。
