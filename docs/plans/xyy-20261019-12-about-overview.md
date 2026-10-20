# XYY-20261019-12 — 关于页简介标题对齐

- 风险：LOW，静态呈现；Terra → Luna → Sol。
- 用户要求：删除截图中关于页简介标题左侧 Logo，并使标题与下方正文左对齐；共享中英文组件同步。
- 基线：HEAD `a0994d9b11d9a0898913980a05a9651962360445`；保留 Task11 的页脚、测试、状态与角色日志脏改动及合同。

## Scope 与所有权

- Terra：`src/components/about/AboutHero.astro` 中简介 Logo 链接和仅为其同行排版存在的 wrapper；`src/styles/about-stage.css` 中因此无调用的三个局部选择器；`docs/TERRA.md` 仅追加本任务结果。
- Luna：只读独立验证、`output/playwright/xyy-20261019-12/` 临时证据与 `docs/LUNA.md` 本任务结果；不改应用或测试。
- Sol：本合同、`docs/SOL.md`、`DEV_STATE.md`、最终视觉验收。
- 各角色不是唯一工作者，保留他人修改，不互相派发任务。

排除：Header/Footer Logo、原始图片资源、其他关于页模块、文案/翻译字段、CMS/claims、视频与动画、全局/响应式布局、既有 FAQ 测试问题。不提交、推送、部署或访问真实 CMS/数据库。

## Acceptance Criteria

1. 中英文简介块中不再有 Logo 图片或其首页链接，保留原 h2、id、aria-labelledby 与正文。
2. `/about`、`/en/about` 在 1440/390/360 下标题与正文左边界差不超过 1px，无横向溢出或文字截断。
3. 标题字号/颜色及正文与修改前一致，外侧分隔线与区域间距规则保持；Header/Footer Logo 保持。
4. 目标 Prettier/ESLint/diff 检查通过；前任务两份页脚源码及 `about-cases.spec.ts` hash 保持。

## 验证与交接

仅做定向 CLI 浏览器矩阵与中英代表截图，不为可逆静态删除新增测试或重跑范围外失败的 about-cases 综合用例。复用隔离本地预览 `http://127.0.0.1:4321`，使用前核对身份。候选 hash、真实 CLI 原始输出与截图留存；有失败如实记录。

前任务保护 hash：Footer `b24f94f8c8d4175126836ac2eb5c52b463084529b1dd90bad998ed95b2696cb3`；footer CSS `f86e4b4e9bf051f7ebd2fd39fe106a64b5426f5f974bc29e4cbb40dfb95e8ecb`；about-cases 测试 `cf060b3714463bcb8c2978c7a1124388d81034c3e96c263da5243f9d4fe1ca62`。
