# 仓配服务子页动画 TDD 记录

## 目标

让“仓配服务”下拉菜单对应的服务子页复用产品页的进入视口动画，同时保持服务内容、路由与各视觉变体不变。

## RED

新增 `tests/e2e/service-motion.spec.ts`，覆盖 9 个下拉菜单路由，并验证：

- 视口下方的详情标题会预置为待揭示状态；
- 区块进入视口后立即开始显示，并在 2 秒内完成；
- 移动端无横向溢出；
- `prefers-reduced-motion` 下内容保持直接可读。

实现前首个路由 `/xiefu-yuncang` 失败：详情标题计算透明度为 `1`，证明服务子页尚未接入共享动画。

## GREEN

实现后 9 个路由矩阵测试全部通过，并与现有产品页动画和 12 种服务页布局回归一起通过。

## 模块边界

- `src/scripts/motion/scroll-reveal.ts`：共享动画能力的稳定导出入口；
- `src/scripts/motion/runtime.ts`：GSAP 注册、动态偏好与触发器刷新；
- `src/scripts/motion/reveal-copy.ts`：滚动文字揭示；
- `src/scripts/motion/reveal-visual.ts`：滚动图片揭示；
- `src/scripts/motion/reveal-entrance.ts`：首屏进入动画；
- `src/scripts/product-page.ts`：仅保留产品页目标识别规则；
- `src/scripts/service-motion/hero.ts`：仅负责服务页首屏进入；
- `src/scripts/service-motion/sections.ts`：仅负责服务页内容区滚动揭示；
- `src/scripts/service-page.ts`：薄入口，负责组合模块与刷新触发器；
- `src/layouts/ServiceLanding.astro`：所有服务页统一接入点。

新增服务页仍应复用 `ServiceLanding.astro`，无需复制动画脚本。
