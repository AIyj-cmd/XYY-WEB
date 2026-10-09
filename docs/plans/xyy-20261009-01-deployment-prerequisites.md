# XYY-20261009-01 测试站部署前置动作

以下是 2026-10-09 本轮只读核对结果与准确执行清单。用户已明确批准“按清单执行并继续测试站部署”，包括下列旧目录清理、测试CMS/数据库备份恢复与限定维护、配套运行配置；正式站和其他排除项保持排除。批准不替代目标保护复核、独立验收或真实恢复证据。

## 当前事实

- 唯一目标：root@47.82.105.103，https://wz.tomatopia.top，应用 /var/www/xyy-web，CMS /var/www/xyy-cms。
- /version 当前为 0ffe149df13148d6280b5230979eb0a3d0ea26cb / 20261004T044635Z-0ffe149 / staging / 2026-08-cms-hardening。
- /healthz 两依赖均 ok；current 为上述版本，其 .previous_target 为 20261002T102719Z-5beb6a2。根目录不存在可用 previous 符号链接，回退必须使用实际 .previous_target。
- 服务器本轮最终可用 866316288 bytes（约 826 MiB），小于 2 GiB 远端底线；此前清单为 25 个历史 release。监听仍为 0.0.0.0:50031。
- 本轮实际运行 manifest 工具返回 release_manifest_blocked: cms_schema_status=candidate_unverified，未产出 manifest。应用源码 CI 通过不能改变此结果。

## 已批准、待执行验证的准确动作

1. 仅清理下表标为“删除候选”的 20 个旧 release 目录；保留五个最新版本、current、实际 previous 和一切 pinned。执行前再核对 inode/真实路径/进程 cwd 与保护集合，变化即停止；不清理 CMS、日志或备份。
2. 用户随后明确“只负责测试站的内容，不需要管主站的内容”；仅核对该测试机 loopback Directus/PostgreSQL 与固定 uploads 目录，不再检查主站或以主站后台配置为前置条件。对已批准的测试 CMS 短暂停写，生成成对数据库 custom dump 与 uploads 备份，加密保存到本机 /home/yj/data/xyy-release-20261009-01/private-backups/，私钥另存用户私有密钥目录，权限 0700/0600。记录一致性时间、版本、大小和 SHA，不记录凭据。
3. 在本机专用隔离 Docker 网络/临时容器恢复同一备份，禁止邮件/webhook/真实询盘外发；验证数据库与附件对应关系和恢复能力。
4. 仅对先前审核的 CMS E/G 契约生成 dry-run 差异并维护：不重建缺失 legacy 集合，FAQ page_key 可空只读、faq_page 非空必填且 RESTRICT，英文新闻分组及五字段默认 draft；孤儿项停止为 manual_mapping_required。先通过恢复，再执行迁移；二次 dry-run 零变化及严格验证通过后才允许更新 CMS 版本验证状态。
5. 测试 Web 随版本配套设置 TRUSTED_PROXY_CIDRS=127.0.0.1/32、HOST=127.0.0.1、PORT=50031；保存旧配置与 hash，应用/配置成对发布或回退；核对可信代理链和入口。完成适用 Luna/Nova 门禁及发布验证后，激活用户已授权的测试版本。

## 精确目录清单

候选大小为 apparent bytes，不等于保证可回收容量；执行后必须重新测量与容量门禁。目录根 inode 本轮为 1486639。

| 绝对路径                                             | 决策             | apparent bytes |
| ---------------------------------------------------- | ---------------- | -------------: |
| `/var/www/xyy-web/releases/20260821T235850Z-539bfd4` | 已删除，实测完成 |      363757139 |
| `/var/www/xyy-web/releases/20260824T090653Z-4c1f313` | 已删除，实测完成 |      362013169 |
| `/var/www/xyy-web/releases/20260825T054116Z-2c75bcd` | 已删除，实测完成 |      363758793 |
| `/var/www/xyy-web/releases/20260830T100940Z-82c01ed` | 已删除，实测完成 |      362086372 |
| `/var/www/xyy-web/releases/20260831T081814Z-b91a7b2` | 已删除，实测完成 |      363795850 |
| `/var/www/xyy-web/releases/20260908T081633Z-1e0a79b` | 已删除，实测完成 |      362091211 |
| `/var/www/xyy-web/releases/20260909T112839Z-63deee1` | 已删除，实测完成 |      384338912 |
| `/var/www/xyy-web/releases/20260923T005553Z-51d9c47` | 已删除，实测完成 |      331418955 |
| `/var/www/xyy-web/releases/20260923T070817Z-51d9c47` | 已删除，实测完成 |      504011311 |
| `/var/www/xyy-web/releases/20260924T040212Z-330969d` | 已删除，实测完成 |      504014466 |
| `/var/www/xyy-web/releases/20260924T091109Z-5081bdc` | 已删除，实测完成 |      504010539 |
| `/var/www/xyy-web/releases/20260927T004516Z-4a5bb2a` | 已删除，实测完成 |      500710118 |
| `/var/www/xyy-web/releases/20260928T002840Z-ce682ab` | 已删除，实测完成 |      500994904 |
| `/var/www/xyy-web/releases/20260928T023618Z-5a12274` | 已删除，实测完成 |      501003199 |
| `/var/www/xyy-web/releases/20260928T054511Z-b90b777` | 已删除，实测完成 |      501004593 |
| `/var/www/xyy-web/releases/20260928T101449Z-e764b74` | 已删除，实测完成 |      501038891 |
| `/var/www/xyy-web/releases/20260928T110250Z-54b41d2` | 已删除，实测完成 |      501038989 |
| `/var/www/xyy-web/releases/20260929T044842Z-79ba3c1` | 已删除，实测完成 |      501097437 |
| `/var/www/xyy-web/releases/20260929T234844Z-b50c4b3` | 已删除，实测完成 |      501107924 |
| `/var/www/xyy-web/releases/20260930T113222Z-3543ecb` | 已删除，实测完成 |      501105409 |
| `/var/www/xyy-web/releases/20261001T012818Z-7f90305` | 保留             |      501105768 |
| `/var/www/xyy-web/releases/20261002T001733Z-b8021b1` | 保留             |      501112925 |
| `/var/www/xyy-web/releases/20261002T032358Z-ab82cbd` | 保留             |      501112925 |
| `/var/www/xyy-web/releases/20261002T102719Z-5beb6a2` | 保留             |      501131178 |
| `/var/www/xyy-web/releases/20261004T044635Z-0ffe149` | 保留             |      501132199 |

正式站、Oracle、DNS/TLS、真实内容发布/询盘写入、权限扩大与其他历史文件删除均排除。20 个批准目录清理已执行，五个保留版本不变；其余步骤仍待执行与验收。

## 清理执行证据

R3.1 runner SHA `5ac729890b535734accebb74e96400839c3890039da6d45689badcb1ee6e5692`，Luna 本地夹具 PASS、Nova APPROVED。远端 preflight 1543 个进程路径引用未匹配候选，preview 精确 20/5，apply exit 0且 deleted 集合精确一致。后续可用 `10241183744` bytes、1608885 inodes；current/previous 保持，版本仍0ffe149，health两依赖ok。证据为本任务 output 下 cleanup-preflight.log、cleanup-preview.log、cleanup-apply.log、cleanup-post.json。

## 实际发布结果（2026-10-09）

- 用户批准的测试站前置清单已执行；测试CMS严格验证通过，应用提交 `40591be` 已推送并部署至 `wz.tomatopia.top`，release `20261009T091340Z-40591be`。完整 verify:release exit0（762 unit、269 E2E/9既有skip、4formal/build），公网版本身份与health通过，运行配置后验通过。旧release及旧env备份保留，发布后清理仅preview，没有新增删除。
- 本条补录实际完成结果；前文中的未执行/候选/阻断描述属于对应阶段历史。三个原有无引用存储文件保持，未发生真实内容发布、正式站或Oracle操作。
