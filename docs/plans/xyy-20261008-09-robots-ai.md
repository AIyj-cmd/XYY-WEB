# XYY-20261008-09 — 开放 AI 爬虫公开页面抓取

- 风险：LOW；静态 robots 文本最小变更，按 Terra → Luna → Nova（代码 Review）→ Sol 验收。
- 授权：用户要求“开放 GPTBot 这类 AI agent 的爬取”，范围为本地 robots 规则修改；未授权推送或部署。
- 基线：HEAD `f04bd1e`；`src/pages/robots.txt.ts` 原无 diff，工作区其他既有修改保留。
- 输入：当前路由、robots 检查器及其既有单测。
- Scope：仅删除 GPTBot 专属全站禁止段，使其适用通用分组；通用分组、OAI-SearchBot 分组、站点地图和响应头保持。
- 所有权：Terra 仅修改 `src/pages/robots.txt.ts`，追加 `docs/TERRA.md`；Luna 仅追加 `docs/LUNA.md` 与本任务本地验证产物；Nova 仅追加 `docs/NOVA.md`；Sol 管理本合同、`DEV_STATE.md`、`docs/SOL.md`。
- 排除：不增加逐个 AI 爬虫名单，不改变受限路径，不修改服务器、CMS、数据库、鉴权、依赖或现有测试夹具；不提交、推送、部署。

## 验收标准

1. 实际生成的 robots 响应中不再有 GPTBot 的 `Disallow: /` 专属规则，通用组保留 `Allow: /`，未单独匹配的 AI 爬虫适用通用规则。
2. 通用组与 OAI-SearchBot 组均保留 `/admin/`、`/api/`、`/cms/`、`/preview/`、`/search?` 五项限制。
3. Sitemap 与现有 Content-Type / Cache-Control 保持，响应成功。
4. 既有 robots-policy 单测、目标文件格式和 diff 检查通过；Luna 独立验证响应，Nova Review 无待解决项。
5. 业务 diff 仅为删除 GPTBot 三行分组，范围外既有修改保留；交付明确区分本地完成和未部署。

## 证据与交接

- 证据目录：`output/robots-ai/xyy-20261008-09/`；记录实际命令、退出码及响应内容。
- 不新增镜像实现的测试；既有 GPTBot 禁止示例是检查器夹具，不代表当前路由策略，保留。
- 无视觉页面改动，不要求桌面/移动端截图；本次无提交/部署，不触发完整 verify / verify:release。
- 状态：本地验收完成；Terra 实施、Luna PASS、Nova APPROVED，Sol 接受。
- 实际结果：业务 diff 0 新增 / 3 删除；本地 `127.0.0.1:4399/robots.txt` HTTP 200，两个组的允许规则、五项限制、Sitemap、响应头验证通过；既有单测 3/3，目标 Prettier、ESLint、diff 检查 exit 0。
- 证据：`output/robots-ai/xyy-20261008-09/luna-validation.json` 与 `luna-http-response.txt`；本地测试显式设置站点域名为 loopback，未访问真实 CMS/数据库。4399 已关闭，既有 4321 保留。
- 限制：未测试真实爬虫或线上缓存；未提交、推送、部署，线上规则是否更新未验证。
