# XYY-20261014-01 — 放置Google Search Console验证文件

- 授权与风险：用户指定本地源文件并要求放入项目；LOW静态资源，Terra → Luna → Sol。仅本地文件加入，不执行Search Console验证/权限变更、提交、推送或部署。
- Scope：将/home/yj/下载/google4adb4e763f43adcd.html逐字节复制到public/google4adb4e763f43adcd.html。当前.gitignore忽略public/*.html，只增加对此准确文件名的否定规则，保留其他HTML忽略行为；不修改源文件、应用代码或服务器配置。
- Terra所有权：public/google4adb4e763f43adcd.html、.gitignore、docs/TERRA.md、本任务output/search-console/xyy-20261014-01/terra证据。不是独自在仓库，必须保留既有脏文件与并行修改，不再委派。
- AC：目标与源53字节完全一致，SHA256为d845e80bd2a399ebf7e2de2b6e0a692fa447eae7707c79e714408e4bc9c4bac9；准确文件可被Git发现而其他public HTML仍忽略。本地GET /google4adb4e763f43adcd.html直接返回HTTP200、无重定向，响应原始字节与源文件相同，不注入页面模板或开发脚本。若本地工具注入导致响应不一致，先报告Sol，不能修改验证文件补救。
- Luna所有权：docs/LUNA.md、本任务luna证据。Terra冻结后独立比较源/目标字节及hash、Git忽略边界、本地HTTP状态/响应；核对增量仅为精确忽略例外与新文件。无UI布局变动，无需桌面/手机截图、镜像测试或全量类型/build/verify；记录实际限制，不将本地HTTP成功等同线上验证通过。
- 输入与基线：HEAD00318b5，output/search-console/xyy-20261014-01/baseline.diff、baseline-status.txt、baseline.json，原工作树包含关于页/页脚等既有修改。Astro未改publicDir，server.mjs通过express.static服务dist/client；仅复用127.0.0.1:4321本地预览，禁止真实CMS/数据库/生产/依赖/环境操作。
- Sol所有权：本合同、DEV_STATE.md、docs/SOL.md及最终验收。确认适用检查通过、既有工作树差异保持后记录结果；线上访问和Search Console点击验证须待后续发布完成，本轮不宣称已完成。

## 验收结果

- Terra完成逐字复制及.gitignore精确例外；Luna独立PASS，源/目标/本地响应均53字节且SHA256一致，GET直接200无重定向/脚本注入，其他HTML仍忽略。冻结hash、scoped diff及无关tracked差异保持。
- Sol审阅最小增量后验收；证据output/search-console/xyy-20261014-01/。无布局或业务逻辑变更，不增加镜像测试/截图或运行无关全量build/verify。仅本地加入，未提交、推送、部署或执行线上验证。
