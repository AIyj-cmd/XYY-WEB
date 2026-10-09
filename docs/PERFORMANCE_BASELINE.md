# 官网性能观察基线

## 2026-08-15 production_observed

- URL：<https://56xyy.com/>；采集时间：2026-08-15 12:47 左右；设备：桌面。
- 评分：性能82、无障碍100、最佳做法100、SEO 100。
- 指标：FCP 0.8秒、LCP 1.9秒、TBT 0毫秒、CLS 0、Speed Index 4.0秒。
- 现场真实用户数据：无。

这是用户提供截图中的一次桌面 Lighthouse 实验室测量，不是 CrUX 真实用户长期数据。当时
网站尚无 `/version`，无法从截图确认对应 Git SHA，因此只登记为 `production_observed`，不归属
本地提交 `54fa9e6`，也不作为第五阶段发布阻断条件。第五阶段真实部署后应重新测量，并同时记录
`/version` 返回的 Git SHA 与 Release ID。

## 当前本地实验室观察

本地 Lighthouse 现通过 `npm run test:lhci:all` 在生产构建后顺序采集 desktop 和 mobile：两种
设备均覆盖首页、产品、关于、鞋服云仓、B2B 门店仓配、后整修复、中文联系和英文联系八条路由，
每条三次。每一项 LCP、TBT、CLS 及性能/无障碍/最佳做法/SEO 分类分数均按 `median` 汇总到
`output/lighthouse/<device>/summary.json`；TBT 只是实验室代理指标，不能代替 INP。

默认 `LHCI_MODE=observe`：采集、页面 HTTP 错误、运行时错误、路由或三次样本不完整会失败，
性能阈值只报告 warn。desktop 失败会使串行 `test:lhci:all` 停止，mobile 报告缺失表示未测，
不是通过。

启用 `LHCI_MODE=enforce` 前必须留下可复核的校准证据：对同一候选提交，在相同 CI runner、Node、
Chromium、workflow 与三次采样配置下完成至少五次成功运行；按设备和每条页面路由分别比较五个
median，分类分数的最大差不超过 0.05、LCP/TBT 不超过最低 median 的 20%、CLS 不超过 0.02。
再由每项最低分类分数、最高 LCP/TBT/CLS 加入已记录的容差生成阈值，并保存五份 summary、运行环境
和阈值选择理由。示例命令仅展示完整字段，**不是已校准的实际阈值**：

```bash
LHCI_MODE=enforce \
LHCI_ENFORCE_THRESHOLDS='{"performance":0.7,"accessibility":0.9,"bestPractices":0.9,"seo":0.9,"lcp":3500,"tbt":500,"cls":0.15}' \
npm run test:lhci:all
```

当前没有校准阈值，也没有自动阻断性能退化。CI required status checks 未修改；一次 CI 失败不自动改变
仓库的合并规则。发布脚本也不运行 LHCI，因此本地/CI 观察不构成部署闸门。历史单次分数仅是旧实验室
样本，不代表当前代码、CI 稳定基线或真实用户体验。

CrUX 只读查询入口为 `npm run crux -- --origin <origin>` 或 `--url <url>`，需要环境变量
`CRUX_API_KEY`。它分别输出 PHONE/DESKTOP、origin/URL 粒度、滚动 28 天 `collectionPeriod` 与
LCP/INP/CLS p75；良好目标为 LCP ≤2500ms、INP ≤200ms、CLS ≤0.1。CrUX CLS p75 是无单位比例小数，
包括 API 以字符串编码的合法值，不作 `/100` 换算。缺 record/窗口、缺 key、`NOT_FOUND` 无样本、
鉴权、超时或网络错误都不得判为通过；Lighthouse TBT 不得替代 CrUX INP。口径见
[CrUX API metric value types](https://developer.chrome.com/docs/crux/api/#metric-value-types) 与
[Web Vitals](https://web.dev/articles/vitals)。

截至 2026-10-08，生产 CrUX key 未配置，PageSpeed 只读请求两次均连接超时且没有响应，因此生产
p75 为 unknown，不能称为“无样本”或“通过”。取得环境 key 和联网条件，或得到 Search Console
导出后，才可补充该观察记录。

## 条件性观察项

- 历史报告曾提示图片传输约356 KiB、静态资源缓存约85 KiB、约80毫秒渲染阻塞、约21 KiB
  未使用 JavaScript 和2项长任务；这些仅作为复测线索，不是当前必须执行的开发任务。
- 只有正式站多次复测仍稳定出现同类问题、Core Web Vitals 超出良好范围，或出现真实用户加载
  投诉时，才针对复现项进行最小优化。
- 正式站后续发布时，应同时记录 `/version` 返回的 Git SHA、Release ID，并分别进行桌面和移动端
  测量；单次分数不用于触发专项性能重构。

2026-08-15 的历史观察阶段未修改图片、缓存、脚本、DOM、CSS、动画或性能阈值；以上历史项目不是
新的代码治理阶段。当前 Lighthouse/CrUX 观察工具与门槛以本文件上文为准。
