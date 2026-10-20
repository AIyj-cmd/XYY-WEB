# XYY-20261019-11 — 共享页脚毛玻璃背景

- 风险：LOW，静态视觉变更；流程 Terra → Luna → Sol。
- 用户范围：将底部页脚改为模糊玻璃背景；共享组件的中英文页面同步生效。
- 基线：HEAD `a0994d9b11d9a0898913980a05a9651962360445`，起始工作区干净。
- 输入：`src/components/Footer.astro`、`src/styles/site-footer.css`，当前浅灰底、深色文字和全屏体量。

## 文件所有权

- Terra：`src/styles/site-footer.css`、必要时仅调整 `src/components/Footer.astro` 的根背景类；`docs/TERRA.md` 仅追加本任务结果。
- Luna：独立浏览器验证与 ignored `output/playwright/xyy-20261019-11/` 证据；必要时仅更新 `tests/e2e/about-cases.spec.ts` 中过时的浅灰背景断言；`docs/LUNA.md` 仅追加本任务结果。
- Sol：本合同、`docs/SOL.md`、`DEV_STATE.md` 和最终视觉验收。
- 各角色不独占工作区；保留其他角色修改，不互相派发任务。

## 实施与排除

采用明亮浅色毛玻璃：柔和蓝橙色底、半透明模糊层与细高光。所有装饰局限页脚，不能拦截点击、模糊文字或造成横向溢出。优先 CSS 伪元素，避免新增 JS、素材、依赖和不必要的 DOM。

保留文案、CMS/claims、链接、社交弹层、列布局、尺寸和服务总览内嵌页脚滚动位置。不改 Header、页面其他区域、动画或通用设计规则。不提交、推送、部署；不访问真实 CMS/数据库或旧远程环境。

## 验收标准

1. 中英共享页脚呈现可辨认的浅色毛玻璃背景，含实际 CSS blur/backdrop-filter；文字与图标清楚、不被滤镜作用。
2. 首页中英文在 1440、390、360 宽度无新横向溢出、内容截断或布局位移；关于页/服务总览各至少检查桌面和手机的共享页脚接入与底部可达。
3. 链接 hover/focus 下划线、键盘焦点和微信 popover 开关正常；装饰不拦截交互。
4. 禁用 backdrop-filter 后仍有可读的浅色背景；减少透明度模式使用实底，不新增动效。
5. 目标格式、diff 和维护预算检查通过；仅同步真实受影响的既有背景断言，不新增镜像 CSS 测试或无关全量检查。

## 预期证据与交接

- Terra：准确 diff、实际自检结果、候选文件 hash、实现限制。
- Luna：独立 PASS/FAIL、桌面/手机截图与 DOM/样式结果、交互和降级证据、基线内容/链接一致性；若有测试断言更改则运行该既有定向用例。
- 本地预览由既有 `scripts/local-dev.mjs --mode development --port 4321` 提供；使用前核对隔离身份。截图保存在 `output/playwright/xyy-20261019-11/`。
- 不为本地静态视觉改动运行完整 verify/release；若后续提交或部署，须另行满足相应门禁。
