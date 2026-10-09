# XYY-20261008-06 — 中英文首页站点设置并行取数

- 风险：MEDIUM，SSR CMS 请求调度；Terra → Luna → Nova → Sol。
- 授权：本任务先做只读诊断，用户随后要求修复；按已确认的处理顺序，实施首页低成本并行优化，新闻/文件引用规模问题继续以实际增长与性能证据为触发条件。
- 基线：HEAD `f04bd1e0e7b0fb921f7031606dc417b92e033e5a`，两个首页原无 diff；保留 05 首页统计修复及其他既有脏文件。指纹和修改前源代码副本见本轮 output 目录。

## Scope 与所有权

- Terra：仅 `src/pages/index.astro`、`src/pages/en/index.astro`，以及追加 `docs/TERRA.md` 本轮记录。
- Luna：独立测试、真实本地 SSR 的请求时序/耗时对照、桌面与移动端浏览器验收；仅写 `output/homepage-parallel/xyy-20261008-06/luna/`、`output/playwright/xyy-20261008-06/` 和追加 `docs/LUNA.md`。
- Nova：独立只读 Review，追加 `docs/NOVA.md`。
- Sol：本合同、基线/最终证据、`DEV_STATE.md` 本轮状态和 `docs/SOL.md` 记录、授权与最终验收。
- 排除：新闻/文件引用查询与 limit、时间解析/分页、所有缓存、CMS 请求/回退层、Layout 实现、页面文案/结构/样式、真实 CMS/数据库/权限、提交/推送/部署。

## Acceptance Criteria

1. 中文首页将 `getSiteSettings(DEFAULT_SITE_SETTINGS)` 加入原有四请求的同一 `Promise.all()`，并把结果传给 Layout。
2. 英文首页将既有 `getEnglishSiteSettings()` 加入相同并行组，将结果传给 EnglishLayout，保留英文转换语义。
3. 实际本地 SSR 中五组 CMS 请求在同一阶段启动；每个页面请求只有一次 site_settings 查询。连续请求可观察新设置值，不新增跨请求缓存。
4. 中英文首页内容、电话/备案信息与语言转换保持；成功空内容、网络失败回退和权限/契约错误语义不被改写。
5. 本地模拟 CMS 受控延迟下，对照修改前/后响应耗时，报告实际样本和测量条件；不得宣称线上性能提升。独立浏览器检查 `/` 与 `/en` 的桌面/移动内容、链接和横向溢出。
6. 定向现有测试、最终类型检查、目标 Lint/格式/diff 通过；Luna PASS、Nova APPROVED 后 Sol 验收。没有代码修改或具体疑点时不重复扩大测试。

## 输入与证据

- 输入：两个首页、Layout/EnglishLayout、getSiteSettings/getEnglishSiteSettings、现有首页与英文设置测试。
- 改动前源代码通过隔离副本保留；模拟 CMS 仅 loopback HTTP，本地测试使用固定假 Token，禁止真实写入或读取远端 CMS。
- 浏览器证据使用 Playwright CLI；前后对照使用同等运行模式与延迟，预热后报告样本与中位数。旧开发服务保持，测试仅停止自己启动的进程。
- 本轮不提交/部署，不运行发布专用 verify:release；无必要不运行完整 verify。

## 状态

本地验收完成：Luna PASS、Nova APPROVED（0 findings），Sol 接受 AC 1–6。

- 最终业务差异只含两个首页，9 行新增 / 3 行删除。英文转换、原有 CMS 空内容/错误/回退语义保留。
- Luna 定向 8 文件 / 41 项单测、目标 Prettier/ESLint/diff 均 exit 0；Sol 最终 typecheck exit 0（session 64904），639 files、0 errors、0 warnings、4 既有 hints。
- 本地受控每次 CMS 延迟 200ms，预热后两语言各 3 样本；最终中文响应中位数 439.11 → 251.23ms、英文 454.51 → 252.04ms。每请求 5 个 CMS 请求、settings 恰好 1 次；新设置请求在其他请求完成前发出，连续电话/备案值刷新。
- 中英文 1440×900 / 390×844 四组浏览器检查通过，Sol 已查看最终截图。测试使用 loopback CMS，未测真实 CMS、线上延迟或真机。
- 测试端口已关闭；既有 4321 仍监听、4322 复核时未监听，未停止用户服务。无提交/推送/部署；新闻/资产全量读取按此前优先级继续保留，不凭本次首页优化扩展查询/缓存改造。
