# XYY-20260929-06 — 中英文 Services 共用首页页脚

## 当前增量：页脚只在整页底部静态显示

- 用户在首次本地验收后明确选择：只在整页最底部显示，滚动服务内容时不跟随。本增量沿用原 ID；下文原 LOW 交付是历史版本，本增量按 MEDIUM 走 Terra → Luna → Nova → Sol。
- Scope：把同语言共享 Footer 放到服务内层滚动末尾，恢复单一滚动区域；服务内容未到末尾时页脚不得提前浮入，页脚不做 fixed/sticky/transform/跟随动画。八视频/九分区保持，页脚不增加第十分区。
- Terra 当前所有权：`src/pages/product.astro`、`src/pages/en/services.astro`、`src/components/product/ProductVideoSequence.astro`、`src/styles/product/video-sequence-base.css`、`src/styles/product/video-assurance.css`、`src/scripts/product-video-navigation.ts`，以及仅追加 `docs/TERRA.md`。两页可各取得一次原站点设置，传给现有布局及 Footer；共享布局/Footer/CMS实现不改。组件在最后 assurance 内容后接收 Footer slot。必要时收起会覆盖页脚的分区导航，回到服务后恢复。
- Luna：原两份 `product-video-sequence.spec.ts`/`product-motion.spec.ts` 的必要断言更新及本任务 ignored 浏览器证据、`docs/LUNA.md` 追加；不改实现、不新增无关 suite。
- Nova：只读 Review 本增量代码/契约/回归及 Luna 证据，仅本任务报告和 `docs/NOVA.md` 追加。各角色不得再委派，保留他人所有修改。
- Sol：此合同、基线、协调执行验证、DEV_STATE/SOL最终状态；证据根 `output/playwright/xyy-20260929-06/static-footer/`，旧版证据保持。
- AC：中英文 1440/390 首屏至第8分区、在正文/导航附近滚动均不出现页脚或外层页面偏移；仅通过第9分区末尾才出现唯一静态页脚，全部链接及版权可到达。页脚与对应首页文本/链接相同，正文/媒体不变，8视频9分区及前后按钮/减少动态效果保留。中文语言提示条开/关均无第二条可滚动的外层页面；手机触摸可到达完整Footer。无横溢、分区按钮覆盖或隐藏可聚焦按钮。无JS仍能从内容滚至Footer。
- 排除：不改公共布局、Footer、Header、翻译/CMS/SEO/数据、其他页面或已有动效；不提交推送部署、不访问真实 CMS/数据库。保持4322已有离线预览，磁盘空间小，使用已缓存CLI及内存盘浏览器临时目录，不重复下载/构建或生成视频trace。只运行本增量相关格式/类型及两份既有浏览器测试；提交/发布门禁本次不适用。
- 最终证据需保留实际命令、退出码、浏览器 raw 和代表截图；初版失败不可改写为通过，语法探针/环境失败与应用问题分别记载。

- 风险：LOW，现有布局开关及局部滚动 CSS；流程 Terra → Luna → Sol。若需要新增脚本或契约变更，先返回 Sol 重新划定范围。
- 授权：用户要求把首页页脚加入中文 Services 和英文 Services 最底部。本次为本地实现、验证与状态同步；不包含提交、推送、部署或真实 CMS/数据库操作。
- 基线：HEAD `79ba3c152bda1866c70f139bb3abe4145c1dc414`；既有脏文件、未跟踪素材与详情动效保持。快照位于 `output/playwright/xyy-20260929-06/baseline.json`。

## Scope 与所有权

- Terra：`src/pages/product.astro`、`src/pages/en/services.astro`、`src/styles/product/video-sequence-base.css`，以及仅追加 `docs/TERRA.md`。
- Luna：仅调整既有 `tests/e2e/product-video-sequence.spec.ts` 中“无页脚”的过时断言；本任务独立浏览器验证脚本/报告/截图在 `output/playwright/xyy-20260929-06/luna/`，仅追加 `docs/LUNA.md`。
- Sol：任务合同、基线、最终验收、`DEV_STATE.md` 与 `docs/SOL.md`。
- 排除：不复制/改写 Footer、布局公共契约、服务正文/视频/导航脚本、SEO/CMS、其他既有变更；不创建新增持久测试套件。

## 实施方向

启用两页已有布局的默认 Footer，复用首页同一组件与各自语言的设置。允许服务内层滚动在末尾继续到外层页脚；把服务分区导航约束在服务区域，使页脚阅读不被悬浮按钮遮挡。保留八段视频、九个分区和已有按钮导航行为。

## Acceptance Criteria

1. `/product` 与 `/en/services` 各有且仅有一个页脚，分别与 `/` 和 `/en` 的页脚内容及链接一致，位于服务内容之后。
2. 桌面 1440 和手机 390 两个视口，正常向下滚动可到达完整页脚及最底部版权/隐私链接；向上滚动可返回服务。无横向溢出、导航按钮遮挡或重复页脚。
3. 八段视频、九个分区、前后按钮及减少动态效果模式仍正常；页脚中文/英文对应正确，首页页脚本身不变。
4. 独立 Luna 浏览器证据与适用现有回归通过，相关格式/lint/类型检查通过；保护路径没有本任务造成的改动。

## 输入和证据

读取 AGENTS.md、各自最近相关角色日志、以上源文件及现有产品滚动测试。现有离线预览 `http://127.0.0.1:4322` 可用于本地验证，不停止他人的预览进程。磁盘剩余约 108MB，输出保持小；不运行全量构建或创建克隆。记录真实失败与环境限制，不把历史验证写为本次 PASS。尚无提交/发布动作，因此不运行其专属 verify/release 门禁。
