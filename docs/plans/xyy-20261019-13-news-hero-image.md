# XYY-20261019-13 — 行业动态首屏非仓库图片

- 风险：LOW，静态图片替换；流程 Terra → Luna → Sol。
- 用户要求：从网络寻找并下载一张非仓库题材图片，尝试替换行业动态顶部。
- 范围：中英行业动态首屏同步使用服装陈列空间实拍，保持各自标题、文案、尺寸、导航和列表逻辑。
- 基线：HEAD `a0994d9b11d9a0898913980a05a9651962360445`；保留 Task11/12 全部已有脏改动。

## 输入与所有权

- Sol 已选图并下载候选：`output/playwright/xyy-20261019-13/news-boutique-candidate.webp`，2400×1602，285916 bytes，已实际读图。
- 来源：[Clothes Hanged on Clothes Rack](https://www.pexels.com/photo/clothes-hanged-on-clothes-rack-3965545/)，摄影师 Ksenia Chernaya；[Pexels License](https://www.pexels.com/license/) 允许网站使用和修改，不要求署名，不得暗示图中品牌/人物背书。
- 下载 URL：`https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=2400&fm=webp&q=80`。
- Terra：`src/components/news/NewsLandingIntro.astro`、`src/components/news/EnglishNewsLanding.astro` 的首屏装饰背景部分；新增 `public/news-fashion-hero.webp` 和 `docs/news-hero-image.md`；`docs/TERRA.md` 仅追加本任务结果。
- Luna：只读独立验证、`output/playwright/xyy-20261019-13/luna/` 证据及 `docs/LUNA.md` 结果；不改实现或测试。
- Sol：本合同、`docs/SOL.md`、`DEV_STATE.md`、选图与最终视觉验收。
- 不是唯一工作者，不回退他人修改，不互相派发任务。

## 实施与排除

中文首屏原 `/w-hq.webp` 替换为新本地 WebP，img 保持空 alt、aria-hidden 并明确宽高。英文现有组件 176 行、预算 180 行，优先在原 aria-hidden 背景 div 上用双层 background-image（渐变 + 本地图）实现，避免引入新抽象或无关压行；背景 cover/center 与中文保持一致。允许仅在首屏图片处调 object-position/background-position/遮罩透明度以改善裁切和可读性；优先保留原中文渐变，英文同步同款渐变。原素材不删除。

不改正文/CTA/分类/列表/FAQ、CMS/API/claims、文章封面、Header/Footer、字号/布局/页面路由、依赖。无需创建图片生成任务，不新增测试或修复旧 FAQ 测试。不提交、推送、部署或操作真实 CMS/数据库。

## Acceptance Criteria

1. 本地图为真实下载的非仓库服装陈列场景，至少 2000px 宽、小于 350 KiB；来源、摄影师、许可、下载 URL、尺寸/体积/hash 有记录。
2. `/news` 与 `/en/news` 在 1440/390/360 均加载本地图成功并可解码；不以外链图片作为运行时背景，首屏主体可辨认，标题清晰。
3. 单一 H1、标题/正文/分类 href 和首屏布局尺寸保持；无横溢、正文截断或新增导航遮挡；分类栏及后续内容保持。
4. scoped Prettier/ESLint/diff 通过；候选 hash 可核验，Task11/12 四份源码及已有 about-cases 测试共五份保护文件 hash 保持。

## 预期证据

Terra 交付精确 diff、实际自检和图片 hash；Luna 输出六组真实浏览器结果、HTTP/解码/本地请求证据，中英桌面及手机代表截图并实际读图。截图确认首屏图片加载完毕再拍摄，不能以请求成功替代最终视觉验收。使用已核对的本地隔离 4321 预览，若需恢复仅调用既有 local-dev 脚本，不扩张到全量 build/verify/release。
