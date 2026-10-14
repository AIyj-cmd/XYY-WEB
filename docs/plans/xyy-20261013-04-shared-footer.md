# XYY-20261013-04 — 全站统一首页页脚

- 用户明确要求所有页面使用刚验收的首页页脚。LOW静态布局/组件接入；Terra → Luna → Sol，沿用现有实际角色代理，不宣称切换型号。
- Scope：共享Footer取消首页限制，将home-footer样式归为site-footer；中英About移除独立简版入口，使用Layout既有Footer。全站保持首页整屏最小高度、四栏比例、字号与入口hover/focus下划线。仓配总览继续在既有视频滚动容器末尾挂载共享Footer，不改滚动架构。
- Terra所有权：src/components/Footer.astro；src/styles/home-footer.css与新增src/styles/site-footer.css；src/pages/about.astro、src/pages/en/about.astro；删除不再引用的src/components/about/AboutMinimalFooter.astro与src/styles/about-minimal-footer.css。只写上述源码、docs/TERRA.md和本任务terra证据；不是独自在仓库，不回退既有改动、不再委派。无需改Layout或EnglishLayout。
- 排除：页脚内容/链接/CMS绑定/电话地址、浮动控件、About视频字幕/157原图/预览交互、产品滚动脚本、依赖/环境/其余页面业务；不提交推送部署，不访问真实CMS/数据库。旧about-ui.footer文案不顺手清理。
- AC：所有实际页面外壳统一输出一个共享site-footer（内容区内部的语义footer不计），About不再存在简版页脚；中英首页与本任务before尺寸/内容一致；About/普通布局/产品内嵌三种入口中英桌面与手机均采用相同CSS。1440×900页脚至少900px、四栏左缘与首页一致，390手机自然容纳无横溢/裁切；导航hover/focus下划线及联系方式完整；产品滚动到页脚可读全部栏目及版权。原157图库/相关保护hash保持。
- Luna所有权：tests/e2e/about-cases.spec.ts仅旧About页脚断言、docs/LUNA.md与本任务luna证据。不添加镜像样式的新持久测试。独立核对所有页面外壳/例外的引用覆盖；中英首页、About、联系页、产品总览四类×1440/390共16布局组合，测试相应入口一次hover/focus及About手机微信开关，读取所有内容/边界/原链接。亲看About中英和产品手机截图。必要时既有about-cases一项受影响E2E运行（仅本地4321，独立CLI预算可90秒，不改持久超时），类型/目标格式/Lint/diff，禁止扩展全站回归/build。
- Sol所有权：本合同、DEV_STATE、SOL及最终视觉/diff验收。输入HEAD00318b5、Task03最终CSS、当前4321本地审核静态回退预览、output/playwright/xyy-20261013-04/before与protected.json；既有Oracle/About等脏差异保持。Terra冻结后Luna验证，PASS后Sol验收。所有测试限本地模拟，未部署。

## 最终验收

- 四源码最终状态及三个旧文件移除完成，CSS仅更名、链接内容保持；Luna16布局/交互矩阵、43外壳+1重定向覆盖、188保护hash通过，受影响E2E定向复测1/1及类型/目标格式/Lint/diff通过。
- 首轮旧背景断言和padding探针问题保留记录，字体及产品snap状态通过有限稳定采样/真实wheel复核，未改业务实现掩盖失败。Sol审阅增量与代表截图后验收。
- 本地4321重新启动并保持，临时浏览器关闭；未提交、推送、部署或操作真实CMS/数据库。证据见output/playwright/xyy-20261013-04/。
