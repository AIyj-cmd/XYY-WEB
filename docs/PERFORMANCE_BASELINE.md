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

## 后续小型性能待办

- 优化图片传输（估算约356 KiB）和静态资源缓存（估算约85 KiB）；
- 为图片补充明确的 `width`、`height`，复核约80毫秒渲染阻塞请求；
- 复核约21 KiB未使用 JavaScript，定位2项长任务。

本阶段未修改图片、缓存、脚本、DOM、CSS、动画或性能阈值；以上项目不是新的代码治理阶段。
