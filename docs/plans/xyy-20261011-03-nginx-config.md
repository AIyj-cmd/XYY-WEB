# XYY-20261011-03：新 ECS Nginx 配置

## 追加授权：临时 HTTPS

- 用户后续明确要求“开临时的https用，配置就按照我给你的这个用”，覆盖此前暂缓 HTTPS 的选择。本阶段仍沿用 Task03。
- 范围：重新备份当前 HTTP 配置；在服务器本地生成30天临时自签名 RSA3072/SHA256证书，SAN 为 IP `8.138.148.179`，证书与私钥放于用户指定的 `/etc/nginx/ssl/fullchain.pem` 与 `privkey.pem`；恢复原始完整配置，验证后只重载 Nginx。不得输出或下载私钥，不覆盖意外存在的证书。
- 所有权：Terra 仅准备 `output/nginx-config/xyy-20261011-03/https/terra/` 的操作脚本和 TERRA 日志；Luna 只写对应 `https/luna/` 验证及 LUNA 日志；Nova 只写 `https/nova/` Review 及 NOVA 日志。Sol 负责备份、远程操作、状态记录及最终验收。保留全部既有修改，不再委派。
- AC：完整配置与 `requested.conf` SHA `9be5edd79dfda1b4aa06932e0bea9f12584dac9960ea213e5764d6d829c0b3d3` 一致；证书SAN/期限/密钥匹配且私钥600 root:root；nginx-t和重载成功；HTTP/HTTPS可读200、CMS404、隐藏路径403、应用身份和其他服务进程保持；使用显式信任该临时证书验证TLS，不将自签名误称为浏览器可信。记录公网443真实可达性，若网络阻断则据证据说明，不猜测。
- 输入为原始 requested.conf、前一阶段生效配置哈希、现场OpenSSL/443/证书状态；HTTPS证据放 `output/nginx-config/xyy-20261011-03/https/`。本阶段仅运维配置，执行实际Nginx/TLS/HTTP验证，不发布应用制品。

- 风险：HIGH；用户明确授权备份并按所给配置更新新 ECS `8.138.148.179`。若指定证书不存在，用户已选择先应用 HTTP，HTTPS 等证书就绪后启用。
- 范围：备份 `/etc/nginx`；根据用户配置生成候选，检查证书和监听，语法验证后原子替换 `/etc/nginx/nginx.conf` 并重载 Nginx；失败恢复原配置。
- 排除：应用代码/发布、CMS、数据库、环境变量、DNS、安全组/防火墙、旧服务器、Git 提交/推送。保留既有 Oracle 清理及其他工作区修改。
- 所有权：Sol 负责合同、远程操作、DEV_STATE/SOL 状态；Terra 仅负责 ignored 证据目录 `output/nginx-config/xyy-20261011-03/terra/` 的候选及 TERRA 日志；Luna 仅负责该目录 `luna/` 的独立验证及 LUNA 日志；Nova 仅负责 `nova/` 审阅及 NOVA 日志。子代理不连接 SSH、不执行外部写入、不再委派。
- 输入：用户原始配置、证书条件答复、实际 Nginx 配置/版本/监听状态。原始配置存于证据目录 `requested.conf`。
- AC：原配置完整备份且有哈希；候选只在证书缺失时去掉 HTTPS 监听/证书引用，其余符合用户配置；`nginx -t` 成功并重载成功；公网首页 HTTP 200，任意 Host 可处理，`/cms` 与 `/cms/` 返回 404，隐藏路径拒绝；应用/CMS/数据库未重启，原应用版本不变；记录 HTTPS 实际启用状态和备份路径。
- 流程：Terra 候选 → Luna 独立验证 → Nova 审阅 → Sol 应用与验收。此任务只配置 Nginx，不发布应用制品；验证使用实际 Nginx 语法、监听、重载及 HTTP 检查。
- 证据：本地 `output/nginx-config/xyy-20261011-03/`；服务器 `/data/xyy/backups/nginx-<UTC>-xyy-20261011-03/`。不得记录私钥、密码或应用环境内容。

## HTTP 阶段验收结果（历史）

- 已完成：服务器备份目录 `/data/xyy/backups/nginx-20261011T071831Z-xyy-20261011-03/`，原配置和完整归档哈希校验通过，归档与原目录逐项比较一致。
- HTTP 候选 SHA-256 `beb51fd97623a244090f3f360182bd9340a5069b90ba5f05e3f03705b5984c21` 与生效配置相同；仅三条 HTTPS 指令停用，未生成证书。候选/正式配置语法和重载 exit0，失败恢复未触发。
- 内网与 Luna 独立公网验证均通过，主站/任意 Host 200、CMS404、隐藏路径403、gzip可用；应用版本与四服务主进程及启动时间保持，记录格式含 rt/urt。
- 压缩首轮自动协商为 Brotli，测试误将其要求为 gzip；保留首轮证据，单次指定 Accept-Encoding:gzip 的 GET 通过，未修改配置或重复其他检查。
- 适用闸门：Terra 候选交付、Luna 候选及公网 PASS、Nova 精确配置和应用脚本 APPROVED、Sol 已验收。SSH 已关闭；证书就绪之前 HTTPS 未启用。

## 临时 HTTPS 验收结果

- 用户追加授权后，重新备份当前HTTP配置至 `/data/xyy/backups/nginx-20261011T072633Z-xyy-20261011-03-https/`，完整归档/主配置哈希及归档比较均通过。
- 应用脚本 `ca27904a4cd6da09739f4eaefb076200a22e41990a92f2eebba82392f1220752` 经Luna静态验收与Nova终审后执行exit0；完整配置SHA `9be5edd79dfda1b4aa06932e0bea9f12584dac9960ea213e5764d6d829c0b3d3` 与原文一致，候选/正式Nginx语法和reload均通过，80/443监听，未触发回退。
- 证书为RSA3072/SHA256、30天、IP SAN `8.138.148.179`、CA FALSE、serverAuth，证书与私钥公钥一致；私钥600 root:root，仅留服务器。有效期2026-10-11 07:32:24 UTC至2026-11-10 07:32:24 UTC。公开证书指纹SHA256 `9CE2FDDE397CE6EB7F6DB3F2FDA80DFA025770EA03E6BFD1F33AE033D02DBCFA`。
- Luna独立公网7次GET全部通过：显式信任公开证书，无-k，TLS1.2/1.3各返回主页200；HTTP200、CMS两路404、隐藏路径403，HTTPS版本仍e64db32。应用及四服务身份保持；本机防火墙原已有HTTPS，无变更；没有安全组/DNS/应用或数据库动作。
- SSH已关闭；脚本/证书属性/公网验证和角色日志均归档于 `output/nginx-config/xyy-20261011-03/https/`。浏览器默认不信任自签名证书，正式域名需要后续匹配的证书。本阶段AC全部完成。
