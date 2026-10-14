# XYY-20261011-04：可信 IP HTTPS

- 风险HIGH。用户在确认临时自签名导致浏览器警告后明确要求处理，授权为新ECS `8.138.148.179` 配置浏览器信任的证书及必要自动续期；使用免费公开CA，私钥保留服务器。
- 范围：确认Let's Encrypt正式IP签发及当前Certbot兼容性；备份当前Nginx与自签名证书；在 `/data/xyy` 下隔离安装证书客户端、保存ACME账户/证书/日志；仅增加 `/.well-known/acme-challenge/` 必需验证路径，保留用户其余Nginx参数与证书引用路径；申请可信证书、验证后替换/重载，建立和测试自动续期及成功后部署钩子。失败保留或恢复当前站点。
- 排除：应用部署、CMS/数据库/业务环境、域名/DNS、安全组、防火墙、旧服务器、Git提交推送、全局安装自签名信任或跳过浏览器验证。保留Oracle清理及Task03全部记录。
- 所有权：Sol负责合同、服务器操作、DEV_STATE/SOL及证据根；Terra只准备 `output/trusted-https/xyy-20261011-04/terra/` 候选及TERRA；Luna仅对应luna目录独立验证及LUNA；Nova仅对应nova目录审阅及NOVA。子代理不SSH、不执行外部写入、不再委派。
- AC：备份校验通过；生产CA实际签发IP SAN证书；系统默认CA（无-k/无自定义cacert）本机与独立公网HTTPS校验通过并返回200；证书/密钥匹配且私钥权限受限；CMS404/隐藏路径403/HTTP与应用版本保持；仅证书验证路径公开；续期配置、定时器、dry-run及部署钩子验证通过；不停止Nginx或重启其他业务服务。
- 官方输入：https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability 、https://letsencrypt.org/2026/03/11/shorter-certs-certbot 、https://eff-certbot.readthedocs.io/en/stable/using.html 。IP证书160小时，需要自动续期，Certbot webroot须5.4或更高。
- 当前基线：Nginx配置SHA `9be5edd79dfda1b4aa06932e0bea9f12584dac9960ea213e5764d6d829c0b3d3`；自签名证书指纹 `9CE2FDDE397CE6EB7F6DB3F2FDA80DFA025770EA03E6BFD1F33AE033D02DBCFA`；原应用e64db32。实施/独立验证/审阅后由Sol应用并验收；本任务为证书运维，不发布应用制品。

## 完成结果

- 正式IP证书已签发并上线，默认系统CA及浏览器通过，Luna公网8GET全通过；指纹与实际握手一致。续期timer启用，实际oneshot与含部署hook的dry-run通过，首次staging超时和bootstrap初版缺陷证据保留。
- Nginx只增加ACME验证例外，四服务身份与应用版本保持；私钥仅服务器root600，配置/旧证书备份已验证。SSH与验收浏览器已关闭，没有Git提交推送。
- Luna PASS、Nova最终APPROVED、Sol验收；实际证据 `output/trusted-https/xyy-20261011-04/`，当前状态已同步DEV_STATE/SOL。
