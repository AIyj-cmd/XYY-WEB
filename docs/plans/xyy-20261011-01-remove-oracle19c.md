# XYY-20261011-01 — 移除本地 Oracle 19c 方案

- 风险 MEDIUM。用户明确要求从本地代码删除 Oracle 19c 数据库方案及相关代码；目标 `/home/yj/data/website`，起始 main `00318b57442903b7c28e5c541795a0dc05f91af8`、工作树干净。
- 删除专属安装、初始化、迁移、切换、回滚、备份和容量诊断实现，以及仅测试这些实现的测试。同步活跃部署文档、维护预算和共享测试中失效的入口；保留现有 PostgreSQL、Web、附件备份及通用 CMS 错误保护。
- 不操作服务器、真实 CMS、数据库、环境文件、旧 native 工作区、历史验收产物或数据备份；不提交、推送或部署。历史任务日志和治理限制保留为审计记录，业务文章中的无关品牌名、二进制数据及校验值不是删除对象。

## 所有权与流程

- Sol：合同、README.md、deploy/production/README.md、deploy/production/web/README.md 的旧编号标题、deploy/postgresql/README.md、deploy/uploads/README.md、docs/MAINTAINABILITY.md、DEV_STATE.md、docs/SOL.md，以及集成验收。
- Terra：deploy/oracle19c/**、deploy/production/backend/**、deploy/production/database/** 的专属内容删除；三个 tests/unit/oracle-*.test.ts、tests/unit/deployment-config.test.ts、scripts/check-maintainability.mjs；经依赖梳理确认后，仅清理 src/lib/news-publication-time.ts 的旧方案注释及 tests/unit/news-revision-capacity.test.ts 的旧方案示例，不删除共享日期/错误保护行为。docs/TERRA.md 追加实际结果。
- Luna：独立本地测试及删除后引用、PostgreSQL/Web/附件备份保留检查，只拥有 ignored 证据及 docs/LUNA.md，不改实施。
- Nova：独立代码与范围审阅，只拥有 ignored 证据及 docs/NOVA.md，不重写实现。
- Sol 与 Terra 的独立文件可并行；实施冻结后依次 Luna、Nova、Sol。各角色保留他人修改，不再委派。

## 验收条件

1. Oracle 专属目录、执行入口和专属测试已从当前工作树移除，活动代码与部署说明不再依赖其文件。
2. PostgreSQL/Web/附件备份脚本、数据库依赖及通用 CMS 行为保持；不引入新的数据库方案或空壳替代实现。
3. 相关部署/新闻回归、可维护性、代码格式和 Shell 语法检查实际通过；独立检查剩余引用均可解释为历史记录、治理限制或无关内容。
4. 本地改动通过独立测试和审阅后完成状态记录。此次不提交或部署，不重复发布门禁及页面浏览器验证；如发现共享行为变更或实际失败，再追加必要检查。

证据目录：`output/oracle-removal/xyy-20261011-01/`。
