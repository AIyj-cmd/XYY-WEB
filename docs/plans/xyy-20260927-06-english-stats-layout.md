# XYY-20260927-06 — 英文首页数据卡片完整显示

- Status: CLOSED（本地验收完成）
- Risk: LOW，局部静态样式修复；Terra → Luna → Sol，必要时由 Nova 补充审阅。
- Authorization: 用户指出英文首页截图的数据卡片截断和显示不完整，按当前实施任务修复该区域。
- Baseline: HEAD `4a5bb2a3b8aff7bde49a9b6024222ebba0584502`，既有英文站、语言建议条和其他用户修改全部保留；1332 路径基线位于 `output/playwright/xyy-20260927-06/`。

## Scope 和文件所有权

- Terra：仅修改 `src/styles/home-capability-stats.css`，新增 `src/styles/home-capability/english.css`，在已有 `[data-locale='en']` 下修复首页统计区域；追加 `docs/TERRA.md`，在本任务证据目录保存实现及自测证据。
- Luna：独立浏览器验证、临时探针和截图只写本任务证据目录，追加 `docs/LUNA.md`；不改应用、不新增持久测试文件。
- Sol：本合同、`docs/SOL.md` 和 `DEV_STATE.md`，基线、冻结和最终验收记录。
- 若需要其他应用文件或修改数据表示，先返回 Sol 说明原因；无明确扩大 Scope 前不修改。

## 排除项

不修改原始数字、英文文案、CMS 适配、claims、API、交互脚本、语言提示逻辑或其他页面；不修改中文样式结果。不提交、推送、部署、写真实 CMS/数据库/线索或操作生产配置。无需增加依赖或运行发布门禁。

## Acceptance Criteria

1. `/en#s-stats` 保留当前完整数据和单位，尤其 `540,000 m²`、`450,000+ SKUs`、`117,000,000 units`、`153,000,000 units`；数字、单位、标签、说明不得互相重叠或被卡片裁切。
2. 四项经营能力和七项生命周期文字完整可读；按空间换行，卡片随内容增高，保持原有配色及卡片设计。
3. 宽度 1649（用户截图）、1440、1351、1350、1280、1101、1100、1024、801、800、768、701、700、430、390、360 下，无区域横向溢出或文字裁切。包含本次新增的 1350/800 断点两侧，以实际文字 Range、所在列边界和所有裁切祖先检查，不能仅检查 document 宽度。
4. 桌面与手机实际截图可读；等待字体及数据动画完成后采集，并实际读取代表截图。中文首页 1440、390 的该区域与当前基线保持一致。
5. 局部格式检查、维护预算及构建通过；Luna 独立浏览器验证 PASS，Sol 核对应用冻结及基线保护。仅静态 CSS 改动，不为本次低风险可逆修复新增单元测试。

## 输入与证据

- 用户截图 `/tmp/codex-clipboard-SwdtEa.png`。
- 当前组件 `HomeCapabilityStats.astro`、`home/stats/*`，样式 `home-capability/*`，英文数字来自现有 claims 适配，不改数据。
- 原因：较长英文完整数字继承中文大字号与窄列，经营能力及生命周期仍有 `nowrap`。
- 当前旧版离线预览 `http://127.0.0.1:4526/en` 可作为修复前对照。
- 验证仅使用显式离线 CMS 与假线索配置；保留旧预览进程。证据记录实际命令、退出码、范围、截图和限制。

## 最终验收

- 两份应用 CSS 最终冻结；英文长数字和单位分行，仓储、检验及服务网络按可用宽度堆叠，经营能力和生命周期标签可换行。完整数字与文案保留；数字行高增至 1.1，消除首轮发现的数字与单位交叠。
- Terra 局部格式、685 文件维护预算及 diff 检查通过。Luna fresh 离线构建 exit 0，英文 16/16 宽度的实际文字 Range、列边界、裁切祖先及重叠检查通过，动画前后最终数据稳定；360px 展开 Data notes 的 7 个正文 Range 完整显示。Luna 独立结论 PASS，已实际读取桌面和手机代表截图。
- 中文旧基线为 Chrome 152，Luna bundled Chromium 149 的字体宽度比较不可比，原 probe exit 1 与失败证据保留。Sol 在原 Chrome 152 会话对中文 1440/390 各 58 元素重新比较，结构、文字、几何及样式均 0 差异；该同浏览器结果作为中文验收证据，未将跨浏览器比较报为通过。
- Sol 已核对代表截图、2/2 应用冻结和 1327 个保护路径；保留原角色日志及 DEV_STATE 内容。最终证据：`output/playwright/xyy-20260927-06/sol-final-acceptance.json`，独立报告：`output/playwright/xyy-20260927-06/luna/round2/correction/verification-result.md`。
- 修复预览：`http://127.0.0.1:4531/en#s-stats`。仅本地离线 Chromium/Chrome 与模拟视口验证，未覆盖真实设备或 Safari/Firefox；未提交、推送、部署或写真实 CMS/数据库/线索。此次局部 CSS 修复未新增持久测试或运行完整 verify/release；未来提交或部署前仍须执行对应门禁。
