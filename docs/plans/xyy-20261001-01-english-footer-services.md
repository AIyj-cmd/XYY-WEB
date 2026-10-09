# XYY-20261001-01 — 英文页脚服务与中文对齐

- 风险 LOW：仅共享英文页脚的静态服务链接清单；Terra → Luna → Sol。
- 用户输入：英文页脚Services应与中文版一致，截图当前只有四项。按相同八服务及顺序、英文名称与现有英文落点理解。
- 基线HEAD3543ecb；既有41脏路径全部保护，routes.ts当前clean。基线见output/playwright/xyy-20261001-01/baseline.json。
- Terra所有权：src/i18n/routes.ts中ENGLISH_SERVICE_LINKS，以及docs/TERRA.md仅追加。不改其他代码。
- 最小实现：八项依次为Apparel fulfilment、Returns inspection、Garment care、Cross-border warehouse operations、South China apparel fulfilment、East China apparel fulfilment、Livestream commerce fulfilment、B2B store distribution。已有四专题仍各指向现有/en路由；新增四项分别指向/en/services#04-cross-border、#05-south-china、#06-east-china、#07-live-commerce。名称复用现有英文服务目录用语。
- 排除：中文清单、Footer样式/布局/其他列、导航/其他路由、CMS/claims/媒体、新增英文详情页、接收服务、Git提交/推送/部署或真实外部写入。
- Luna所有权：output/playwright/xyy-20261001-01/luna/与docs/LUNA.md仅追加；不改实现。Sol所有权：本合同、DEV_STATE、docs/SOL.md、本证据目录其他文件。
- AC：英文共享Footer显示八项，语义/顺序一一对应中文；八href为有效英文页面或存在且可达的准确服务section，新增四链接实际导航可显示对应服务；中英文Footer在1440/390无横溢且链接完整可见；中文与其他列输出不变；代码范围精确仅该静态数组。
- 证据：Terra局部format/lint/diff；Luna独立桌面/手机真实浏览器和截图、八href/四锚点、中文不变证据。简单静态改动不添加镜像单测、不跑无关全量测试；如需扩大代码范围回Sol。
- 当前仅本地实现验收，无本次外部发布指令。不是独占工作区，保留其他修改，不得委派或扩展范围。
