# XYY-20261011-05：同公网 HTTPS 后台

- HIGH。用户明确要求后台与公网地址保持一致，后续明确入口直接使用/admin，授权在新ECS 8.138.148.179 接通同源HTTPS CMS后台及必要代理/公开URL/登录Cookie设置。目标 https://8.138.148.179/admin；原有CMS登录凭据与权限保持。旧/cms方案仅本地草稿，未应用。
- Scope：只读核对当前Nginx和Directus部署；备份将改配置；将/admin及Directus实际必要根API命名空间精准代理（保留主站根路径），调整Directus公共URL和安全Cookie/可信本机代理设置并只重启该服务；实际浏览器登录/读取后台验证。保留ACME及自动续期、网站服务和数据。不开放8055公网监听，不改写Directus包或用响应文本替换。
- 排除：CMS业务内容/权限/账号密码改变、数据库操作、主站应用发布、Git提交推送、DNS/防火墙/安全组、其他服务器和Oracle清理。SSH和浏览器登录产生的正常认证状态属访问验收必要操作。
- 所有权：Sol负责服务器操作/合同/DEV_STATE/SOL；Explorer只读定位现有反向代理和Directus配置契约；Terra只写 output/public-cms/xyy-20261011-05/terra/ 候选及TERRA；Luna独立验证、仅luna目录/LUNA；Nova审阅、仅nova目录/NOVA。所有人保留他人修改，不再委派。
- AC：备份hash可核对；默认CA公网HTTPS后台与静态资源正常；实际登录、刷新认证/读取后台可用，无mixed-content/跨域或路径错误；未认证管理API仍要求认证；同源代理和HTTP跳转正确；主站/version/ACME续期路径保持、应用/PG不重启；Directus仍监听127.0.0.1:8055。
- Terra→Luna→Nova→Sol，候选审批后执行实际运维并独立公网验收；此任务不发布应用制品，采用实际代理/Directus/login/资源与服务验证。

## 现场资源缺失修复

- 公网/admin与登录、刷新、内容读取已通过后，发现扩展入口JS404；Directus直连与代理响应一致，启动日志显示默认node_modules/.directus临时目录生成bundle失败。不能把无扩展时404称为正常或无证据称为既有。
- 同任务最小运行配置修复：备份已生效的公网页环境文件，仅设置TEMP_PATH=/data/xyy/cms-home/tmp，新目录xyy-cms:xyy-cms750，位于现有systemd ReadWritePaths允许的目录内；重启Directus生成真正JS缓存，验证资源200及登录。失败恢复已生效的public环境。不改包代码、服务权限政策、CMS业务内容或数据库。
- 登录验收允许自身会话和正常页面访问跟踪元数据请求；禁止业务内容、权限、账号配置和许可证设置写入。

## 实际结果

- `/admin` 与36个Directus根API代理已生效；原环境仅四个公开URL/安全Cookie/可信代理设置改变，后续单独追加TEMP_PATH，其余字节保持。两阶段备份均经校验；只重启Directus，保留应用e64db32、Nginx/Web/PostgreSQL主进程、可信IP证书及续期。
- Luna独立公网11项、1440/390双端认证、修复后真实JS200及定向浏览器登录/读取/刷新/实际UI退出均通过。旧失败原件保留；业务内容、权限、账号、许可证与协议设置均未写入。
- 最终证据 `output/public-cms/xyy-20261011-05/`。SSH、浏览器及凭据桥已关闭，临时凭据已删除，其他本地修改保留；无Git提交推送或应用制品发布。
- 完成状态：Luna PASS、Nova总体APPROVED、Sol验收完成，无本任务遗留阻断。
