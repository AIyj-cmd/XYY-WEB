# XYY-20261008-04 — 页脚企业文化

- 风险 LOW；用户要求将截图中的通用页脚 Logo 下方公司规模介绍替换为企业文化，提供四项内容图。沿已有中英文同步偏好实施；Terra → Luna → Sol。
- 输入：用户两张截图 `/tmp/codex-clipboard-hA4MFt.png` 和 `/tmp/codex-clipboard-N8LQsA.png`；现有通用 `Footer.astro` 和 `src/i18n/shell.ts`。
- Scope：仅替换通用页脚第一列的 `settings.footer_description` 展示，增加“企业文化 / Corporate culture”小标题及四项语义化文案；与既有字号、颜色、行距一致，标签适度加粗，保持紧凑可读。Logo、电话、导航、联系地址、社交入口和版权不变。
- 中文：愿景“成为鞋服品牌最专业最值得信赖的战略伙伴。”；使命“用智慧云仓提高库存周转与物流效率，让鞋服品牌专注创造与增长。”；价值观“简单 · 真诚 · 共赢”；服务理念“尊重需求，客户至上。”。只整理标点，不改原意。
- 英文：Vision — “To be the most professional and trusted strategic partner for apparel and footwear brands.”；Mission — “Improve inventory turnover and logistics efficiency through smart warehousing, so apparel and footwear brands can focus on creation and growth.”；Values — “Simplicity · Sincerity · Shared success”；Service philosophy — “Respect customer needs. Put customers first.”。
- 所有权：Terra 仅编辑 `src/components/Footer.astro`、`src/i18n/shell.ts` 和追加 `docs/TERRA.md`。建议在既有 shellCopy 中添加企业文化标题/数组，在 Footer 用 dl/dt/dd 渲染；不引入新组件/脚本/依赖或更改公开数字来源。Luna 仅写任务证据和追加 `docs/LUNA.md`。Sol 负责合同、`DEV_STATE.md`、`docs/SOL.md`。
- AC1：中英文通用页脚各完整显示对应四项标签与文案，原成立年份/规模介绍在该位置移除，内容来自用户图片及以上忠实翻译。
- AC2：`/contact`、`/en/contact` 在 1440/390/768 共六组合文案可读、无裁切/横溢/重叠；Logo、电话、导航、地址、三社交入口和版权完整。首页中英只读确认同一组件文本同步即可。
- AC3：原社交共享组件/关于页脚/二维码/联系提纲源码保持不变；抽查一次微信按钮仍能打开关闭原二维码，不重跑上一轮完整矩阵。所有页面只有已有三社交入口，无新增外部资源。
- AC4：目标格式/diff 与本地页面编译通过，Luna 独立截图和 DOM 文案/布局验证 PASS，Sol 审 diff 和代表截图。简单静态文案/模板变更，不新增镜像文案的持久测试；无提交/部署不重复全量 verify/typecheck。
- 排除：关于页独立页脚添加文化、CMS/API/schema/数据库或数据回退逻辑修改、真实 CMS 写入、数字更新、图像编辑、真实询盘、外站访问、提交/推送/部署、停止用户 4322/既有 4321 服务。
- 基线：HEAD `f04bd1e`，Footer 已含本会话社交入口改动须保留，shell.ts 当前 clean；其他既有脏文件保持。快照 `output/footer-culture/xyy-20261008-04/baseline.json` 和两源码文件。
- 验证：复用 `http://127.0.0.1:4322`，Playwright CLI 证据 `output/playwright/xyy-20261008-04/`；当前无 X server，直接 headless 模拟视口。先单页 smoke 成功再跑矩阵，核对每次输出，不能将脚本错误当 PASS。
- 子代理不得再委派，不回退他人改动；先实施冻结，再独立验证。

状态：本地实现与独立验收通过，未提交、推送或部署。

- Terra 仅修改指定两份源码，目标格式/diff 与四路由 HTTP 编译通过；Sol 核对 Footer 相对基线只有原简介块替换，其他基线源码/素材保持。
- Luna 六个中英页面/视口组合四项文案、旧文案移除、布局和原有页脚内容保留通过，微信二维码开关抽查通过；Sol 已亲看中英桌面及中英手机当前 viewport 截图。
- 移动超长元素截图的固定导航叠入现象仅为截图定位问题，最终使用正常滚动后当前 viewport 补证；未修改导航。测试使用本地 headless Chromium 模拟视口，不声称真机/线上通过；4322 持续运行。
- 最终证据 `output/footer-culture/xyy-20261008-04/sol-final-acceptance.json`，未重复无关全量测试。
